import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const InvoiceGeneration = () => {
  const { 
    data, 
    addInvoice,
    getApartmentTenants,
    getApartmentTenantCount,
    getPrimaryTenant,
    getRoomPrice
  } = useApp();
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return String(now.getMonth() + 1);
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return String(now.getFullYear());
  });
  
  // Building electricity meters
  const [buildingMeters, setBuildingMeters] = useState({
    singlePhase: { previous: 0, current: 0 },
    threePhase: { previous: 0, current: 0 }
  });
  
  // Room electricity meters - for all apartments (including empty ones)
  const [roomMeters, setRoomMeters] = useState({});
  
  const [invoiceData, setInvoiceData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showPreview]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Calculate total building electricity consumption
  const getTotalBuildingElectricity = () => {
    const singlePhaseUsage = buildingMeters.singlePhase.current - buildingMeters.singlePhase.previous;
    const threePhaseUsage = buildingMeters.threePhase.current - buildingMeters.threePhase.previous;
    return singlePhaseUsage + threePhaseUsage;
  };

  // Calculate total room electricity consumption from room meters
  const getTotalRoomElectricity = () => {
    return Object.values(roomMeters).reduce((total, meter) => {
      return total + Math.max(0, (meter.current || 0) - (meter.previous || 0));
    }, 0);
  };

  // Calculate shared electricity per person
  const getSharedElectricityPerPerson = () => {
    const totalBuilding = getTotalBuildingElectricity();
    const totalRooms = getTotalRoomElectricity();
    const totalTenants = invoiceData.reduce((sum, inv) => sum + inv.tenantCount, 0);
    
    if (totalTenants === 0) return 0;
    
    const sharedElectricity = Math.max(0, totalBuilding - totalRooms);
    return sharedElectricity / totalTenants;
  };

  // Initialize room meters for all apartments
  useEffect(() => {
    const meters = {};
    data.apartments.forEach(apartment => {
      if (!roomMeters[apartment.id]) {
        meters[apartment.id] = {
          roomNumber: apartment.roomNumber,
          previous: 0,
          current: 0,
          usage: 0
        };
      } else {
        meters[apartment.id] = roomMeters[apartment.id];
      }
    });
    setRoomMeters(meters);
  }, [data.apartments]);

  // Calculate invoice data for all occupied apartments
  useEffect(() => {
    const occupiedApartments = data.apartments.filter(apt => {
      const tenantCount = getApartmentTenantCount(apt.id);
      return tenantCount > 0;
    });

    const invoices = occupiedApartments.map(apartment => {
      const tenants = getApartmentTenants(apartment.id);
      const primaryTenant = getPrimaryTenant(apartment.id);
      const tenantCount = getApartmentTenantCount(apartment.id);
      const roomPrice = getRoomPrice(apartment.id);
      
      // Get electricity usage from room meters
      const roomMeter = roomMeters[apartment.id];
      const electricityUsage = roomMeter ? Math.max(0, (roomMeter.current || 0) - (roomMeter.previous || 0)) : 0;
      
      return {
        apartmentId: apartment.id,
        roomNumber: apartment.roomNumber,
        primaryTenant: primaryTenant,
        tenantCount: tenantCount,
        allTenants: tenants,
        rent: roomPrice,
        electricityUsage: electricityUsage,
        electricity: 0, // Will be calculated later
        water: (data.costSettings?.waterRatePerPerson || 50000) * tenantCount,
        internet: data.costSettings?.internetRatePerRoom || 200000,
        service: (data.costSettings?.serviceFeePerPerson || 30000) * tenantCount,
        other: 0,
        otherDescription: '',
        total: 0, // Will be calculated later
        selected: true
      };
    });

    setInvoiceData(invoices);
  }, [data, getApartmentTenants, getApartmentTenantCount, getPrimaryTenant, getRoomPrice, roomMeters]);

  // Recalculate electricity costs when building meters or room usage changes
  useEffect(() => {
    const sharedElectricityPerPerson = getSharedElectricityPerPerson();
    const electricityRate = data.costSettings?.electricityRate || 3500;

    setInvoiceData(prev => prev.map(invoice => {
      const roomElectricity = invoice.electricityUsage * electricityRate;
      const sharedElectricity = sharedElectricityPerPerson * invoice.tenantCount * electricityRate;
      const totalElectricity = roomElectricity + sharedElectricity;
      
      const total = invoice.rent + totalElectricity + invoice.water + 
                   invoice.internet + invoice.service + (invoice.other || 0);
      
      return {
        ...invoice,
        electricity: totalElectricity,
        roomElectricity: roomElectricity,
        sharedElectricity: sharedElectricity,
        total: total
      };
    }));
  }, [buildingMeters, data.costSettings?.electricityRate]);

  const updateBuildingMeter = (meterType, field, value) => {
    setBuildingMeters(prev => ({
      ...prev,
      [meterType]: {
        ...prev[meterType],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const updateRoomMeter = (apartmentId, field, value) => {
    setRoomMeters(prev => {
      const updated = {
        ...prev,
        [apartmentId]: {
          ...prev[apartmentId],
          [field]: parseInt(value) || 0
        }
      };
      
      // Auto-calculate usage when previous or current changes
      if (field === 'previous' || field === 'current') {
        const meter = updated[apartmentId];
        updated[apartmentId].usage = Math.max(0, (meter.current || 0) - (meter.previous || 0));
      }
      
      // Auto-calculate current when usage changes
      if (field === 'usage') {
        const meter = updated[apartmentId];
        updated[apartmentId].current = (meter.previous || 0) + (parseInt(value) || 0);
      }
      
      return updated;
    });
  };

  const updateInvoiceData = (apartmentId, field, value) => {
    setInvoiceData(prev => prev.map(invoice => {
      if (invoice.apartmentId === apartmentId) {
        const updated = { ...invoice, [field]: value };
        
        // Recalculation will be handled by useEffect above
        return updated;
      }
      return invoice;
    }));
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    const year = selectedYear;
    const month = selectedMonth;
    const selectedInvoices = invoiceData.filter(inv => inv.selected);
    
    try {
      const createdInvoices = [];
      
      for (const invoiceInfo of selectedInvoices) {
        // Check if invoice already exists for this month
        const existingInvoice = data.invoices.find(inv => 
          inv.apartmentId === invoiceInfo.apartmentId &&
          inv.month === parseInt(month) &&
          inv.year === parseInt(year)
        );
        
        if (existingInvoice) {
          continue; // Skip if already exists
        }
        
        const newInvoice = {
          invoiceNumber: `HĐ${Date.now()}-${invoiceInfo.apartmentId}`,
          apartmentId: invoiceInfo.apartmentId,
          tenantId: invoiceInfo.primaryTenant?.id || null,
          month: parseInt(month),
          year: parseInt(year),
          rent: invoiceInfo.rent,
          electricity: invoiceInfo.electricity,
          water: invoiceInfo.water,
          internet: invoiceInfo.internet,
          cleaning: invoiceInfo.service,
          other: invoiceInfo.other,
          otherDescription: invoiceInfo.otherDescription,
          total: invoiceInfo.total,
          dueDate: `${year}-${month}-15`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          electricityUsage: invoiceInfo.electricityUsage,
          roomElectricity: invoiceInfo.roomElectricity,
          sharedElectricity: invoiceInfo.sharedElectricity,
          buildingMeters: { ...buildingMeters }
        };
        
        const created = addInvoice(newInvoice);
        createdInvoices.push({
          ...created,
          roomNumber: invoiceInfo.roomNumber,
          primaryTenant: invoiceInfo.primaryTenant
        });
      }
      
      alert(`Đã tạo thành công ${createdInvoices.length} hóa đơn cho tháng ${month}/${year}`);
      
    } catch (error) {
      console.error('Error generating invoices:', error);
      alert('Có lỗi xảy ra khi tạo hóa đơn!');
    } finally {
      setIsGenerating(false);
      setShowPreview(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = invoiceData.every(inv => inv.selected);
    setInvoiceData(prev => prev.map(inv => ({
      ...inv,
      selected: !allSelected
    })));
  };

  const selectedCount = invoiceData.filter(inv => inv.selected).length;
  const totalAmount = invoiceData
    .filter(inv => inv.selected)
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalBuildingElectricity = getTotalBuildingElectricity();
  const totalRoomElectricity = getTotalRoomElectricity();
  const sharedElectricityPerPerson = getSharedElectricityPerPerson();
  
  // Get next month for display
  const nextMonth = selectedMonth === '12' ? `1/${parseInt(selectedYear) + 1}` : `${parseInt(selectedMonth) + 1}/${selectedYear}`;
  const totalTenants = invoiceData.reduce((sum, inv) => sum + inv.tenantCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Tạo hóa đơn hàng loạt
            </h1>
            <p className="text-secondary">
              Tạo hóa đơn cho tất cả các phòng đang có khách thuê trong cùng một tháng
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Chọn tháng
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input w-20"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="input w-24"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() + i - 1;
                    return (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Building Electricity Meters */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          📊 Chỉ số điện tòa nhà (tháng {selectedMonth}/{selectedYear})
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Single Phase Meter */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">⚡ Công tơ 1 pha</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Chỉ số đầu kỳ (kWh)
                </label>
                <input
                  type="number"
                  value={buildingMeters.singlePhase.previous}
                  onChange={(e) => updateBuildingMeter('singlePhase', 'previous', e.target.value)}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Chỉ số cuối kỳ (kWh)
                </label>
                <input
                  type="number"
                  value={buildingMeters.singlePhase.current}
                  onChange={(e) => updateBuildingMeter('singlePhase', 'current', e.target.value)}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-center">
              <span className="text-sm text-blue-700">Tiêu thụ: </span>
              <span className="font-semibold text-blue-900">
                {buildingMeters.singlePhase.current - buildingMeters.singlePhase.previous} kWh
              </span>
            </div>
          </div>

          {/* Three Phase Meter */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">⚡ Công tơ 3 pha</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Chỉ số đầu kỳ (kWh)
                </label>
                <input
                  type="number"
                  value={buildingMeters.threePhase.previous}
                  onChange={(e) => updateBuildingMeter('threePhase', 'previous', e.target.value)}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Chỉ số cuối kỳ (kWh)
                </label>
                <input
                  type="number"
                  value={buildingMeters.threePhase.current}
                  onChange={(e) => updateBuildingMeter('threePhase', 'current', e.target.value)}
                  className="input w-full"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 rounded text-center">
              <span className="text-sm text-green-700">Tiêu thụ: </span>
              <span className="font-semibold text-green-900">
                {buildingMeters.threePhase.current - buildingMeters.threePhase.previous} kWh
              </span>
            </div>
          </div>
        </div>

        {/* Electricity Calculation Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-sm text-yellow-700">Tổng điện tòa nhà</div>
            <div className="text-lg font-bold text-yellow-900">{totalBuildingElectricity} kWh</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-sm text-orange-700">Tổng điện các phòng</div>
            <div className="text-lg font-bold text-orange-900">{totalRoomElectricity} kWh</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-sm text-purple-700">Điện chung</div>
            <div className="text-lg font-bold text-purple-900">
              {Math.max(0, totalBuildingElectricity - totalRoomElectricity)} kWh
            </div>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <div className="text-sm text-pink-700">Điện chung/người</div>
            <div className="text-lg font-bold text-pink-900">
              {sharedElectricityPerPerson.toFixed(1)} kWh
            </div>
          </div>
        </div>
      </div>

      {/* Room Electricity Meters */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          🏠 Chỉ số điện từng phòng (tháng {selectedMonth}/{selectedYear})
        </h3>
        
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Chỉ số đầu kỳ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Chỉ số cuối kỳ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tiêu thụ (kWh)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Khách thuê
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-primary">
              {data.apartments.map((apartment) => {
                const tenantCount = getApartmentTenantCount(apartment.id);
                const primaryTenant = getPrimaryTenant(apartment.id);
                const meter = roomMeters[apartment.id] || { previous: 0, current: 0, usage: 0 };
                const isEmpty = tenantCount === 0;
                
                return (
                  <tr key={apartment.id} className={`hover-bg-secondary transition-colors ${
                    isEmpty ? 'opacity-60' : ''
                  }`}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-primary">
                        Phòng {apartment.roomNumber}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isEmpty ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'
                      }`}>
                        {isEmpty ? 'Trống' : `${tenantCount} người`}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={meter.previous}
                        onChange={(e) => updateRoomMeter(apartment.id, 'previous', e.target.value)}
                        className="input text-sm w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={meter.current}
                        onChange={(e) => updateRoomMeter(apartment.id, 'current', e.target.value)}
                        className="input text-sm w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={meter.usage}
                          onChange={(e) => updateRoomMeter(apartment.id, 'usage', e.target.value)}
                          className="input text-sm w-20"
                          placeholder="0"
                        />
                        <span className="text-xs text-secondary">kWh</span>
                      </div>
                      <div className="text-xs text-primary font-medium mt-1">
                        {formatCurrency((meter.usage || 0) * (data.costSettings?.electricityRate || 3500))}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {!isEmpty ? (
                        <div>
                          <div className="text-sm text-primary">
                            {primaryTenant?.fullName || 'Chưa có'}
                          </div>
                          <div className="text-xs text-secondary">
                            {primaryTenant?.phone}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-secondary">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng phòng có khách</p>
              <p className="text-2xl font-bold text-primary">{invoiceData.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              🏠
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Phòng được chọn</p>
              <p className="text-2xl font-bold text-green-600">{selectedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng số khách thuê</p>
              <p className="text-2xl font-bold text-blue-600">{totalTenants}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng tiền dự kiến</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedCount > 0 && (
        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Đã chọn {selectedCount} phòng
              </h3>
              <p className="text-secondary">
                Tổng tiền: {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="btn btn-secondary"
              >
                Xem trước
              </button>
              <button
                onClick={handleGenerateInvoices}
                disabled={isGenerating}
                className="btn btn-primary"
              >
                {isGenerating ? 'Đang tạo...' : `Tạo ${selectedCount} hóa đơn`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Data Table */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="p-6 border-b border-primary">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary">
              Danh sách hóa đơn cần tạo ({selectedMonth})
            </h3>
            <button
              onClick={toggleSelectAll}
              className="btn btn-secondary text-sm"
            >
              {invoiceData.every(inv => inv.selected) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={invoiceData.length > 0 && invoiceData.every(inv => inv.selected)}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Khách thuê chính
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Số người
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tiền phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Điện phòng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Điện chung
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tổng điện
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Nước
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Internet
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Khác
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tổng cộng
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-primary">
              {invoiceData.map((invoice) => (
                <tr key={invoice.apartmentId} className={`hover-bg-secondary transition-colors ${
                  invoice.selected ? 'bg-blue-50' : ''
                }`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={invoice.selected}
                      onChange={(e) => updateInvoiceData(invoice.apartmentId, 'selected', e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-primary">
                      Phòng {invoice.roomNumber}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary">
                      {invoice.primaryTenant?.fullName || 'Chưa có'}
                    </div>
                    <div className="text-xs text-secondary">
                      {invoice.primaryTenant?.phone}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {invoice.tenantCount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary font-medium">
                    {formatCurrency(invoice.rent)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary">
                      {invoice.electricityUsage} kWh
                    </div>
                    <div className="text-xs text-primary font-medium">
                      {formatCurrency(invoice.roomElectricity || 0)}
                    </div>
                    <div className="text-xs text-secondary">
                      (Từ bảng chỉ số)
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-xs text-secondary">
                      {(sharedElectricityPerPerson * invoice.tenantCount).toFixed(1)} kWh
                    </div>
                    <div className="text-xs text-primary font-medium">
                      {formatCurrency(invoice.sharedElectricity || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary font-bold">
                      {formatCurrency(invoice.electricity)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {formatCurrency(invoice.water)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {formatCurrency(invoice.internet)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-primary">
                    {formatCurrency(invoice.service)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={invoice.other}
                      onChange={(e) => updateInvoiceData(invoice.apartmentId, 'other', parseInt(e.target.value) || 0)}
                      className="input text-xs w-20"
                      min="0"
                      placeholder="0"
                    />
                    <input
                      type="text"
                      value={invoice.otherDescription}
                      onChange={(e) => updateInvoiceData(invoice.apartmentId, 'otherDescription', e.target.value)}
                      className="input text-xs w-full mt-1"
                      placeholder="Mô tả..."
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-primary">
                      {formatCurrency(invoice.total)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoiceData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted mb-4">
              <svg className="w-16 h-16 mx-auto text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              Không có phòng nào cần tạo hóa đơn
            </h3>
            <p className="text-secondary">
              Tất cả các phòng đều đang trống hoặc đã có hóa đơn cho tháng này
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPreview(false);
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-primary rounded-xl shadow-xl w-[90%] max-w-6xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="p-6 border-b border-primary flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">
                  Xem trước hóa đơn ({selectedCount} phòng)
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-secondary hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tóm tắt</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Tháng:</span>
                    <span className="ml-2 font-medium">{selectedMonth}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Số phòng:</span>
                    <span className="ml-2 font-medium">{selectedCount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tổng tiền:</span>
                    <span className="ml-2 font-medium">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Điện chung/người:</span>
                    <span className="ml-2 font-medium">{sharedElectricityPerPerson.toFixed(1)} kWh</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {invoiceData.filter(inv => inv.selected).map((invoice) => (
                  <div key={invoice.apartmentId} className="border border-primary rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-primary">Phòng {invoice.roomNumber}</h5>
                        <p className="text-sm text-secondary">{invoice.primaryTenant?.fullName}</p>
                        <p className="text-xs text-secondary">{invoice.tenantCount} người</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(invoice.total)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary">Tiền phòng:</span>
                        <span className="font-medium">{formatCurrency(invoice.rent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Điện phòng ({invoice.electricityUsage} kWh):</span>
                        <span className="font-medium">{formatCurrency(invoice.roomElectricity || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Điện chung:</span>
                        <span className="font-medium">{formatCurrency(invoice.sharedElectricity || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span className="text-secondary">Tổng điện:</span>
                        <span className="text-primary">{formatCurrency(invoice.electricity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Nước ({invoice.tenantCount} người):</span>
                        <span className="font-medium">{formatCurrency(invoice.water)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Internet:</span>
                        <span className="font-medium">{formatCurrency(invoice.internet)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Dịch vụ ({invoice.tenantCount} người):</span>
                        <span className="font-medium">{formatCurrency(invoice.service)}</span>
                      </div>
                      {invoice.other > 0 && (
                        <div className="flex justify-between">
                          <span className="text-secondary">{invoice.otherDescription || 'Khác'}:</span>
                          <span className="font-medium">{formatCurrency(invoice.other)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-primary flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn btn-secondary"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleGenerateInvoices}
                  disabled={isGenerating}
                  className="btn btn-primary"
                >
                  {isGenerating ? 'Đang tạo...' : `Tạo ${selectedCount} hóa đơn`}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-yellow-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-yellow-900 mb-2">Hướng dẫn quản lý điện</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• <strong>Chỉ số từng phòng:</strong> Nhập chỉ số đầu/cuối kỳ cho TẤT CẢ phòng (kể cả phòng trống)</li>
              <li>• <strong>Tự động tính:</strong> Có thể nhập "Tiêu thụ" để tự động tính chỉ số cuối kỳ</li>
              <li>• <strong>Chuyển tháng:</strong> Nút "Chuyển sang tháng tiếp theo" sẽ copy cuối kỳ → đầu kỳ tháng sau</li>
              <li>• <strong>Điện chung:</strong> = (Tổng điện tòa nhà - Tổng điện các phòng) / Số người</li>
              <li>• <strong>Công thức:</strong> Tiền điện = (Điện phòng + Điện chung × Số người) × Đơn giá</li>
              <li>• <strong>Kiểm soát:</strong> Theo dõi được điện tiêu thụ của từng phòng và tổng thể tòa nhà</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Move to Next Month - Main Action */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              📅 Chuyển sang tháng tiếp theo
            </h3>
            <p className="text-sm text-blue-700">
              Chuyển toàn bộ dữ liệu trang tạo hóa đơn sang tháng {nextMonth}. 
              Chỉ số cuối kỳ sẽ trở thành chỉ số đầu kỳ của tháng sau.
            </p>
          </div>
          <button
            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn chuyển sang tháng ${nextMonth}?\n\nHành động này sẽ:\n- Copy chỉ số cuối kỳ → chỉ số đầu kỳ tháng mới\n- Reset tất cả dữ liệu hóa đơn\n- Không thể hoàn tác`)) {
                // Copy current values to next month's previous values for building meters
                setBuildingMeters(prev => ({
                  singlePhase: {
                    previous: prev.singlePhase.current || 0,
                    current: 0
                  },
                  threePhase: {
                    previous: prev.threePhase.current || 0,
                    current: 0
                  }
                }));

                // Copy current values to next month's previous values for room meters
                const updatedMeters = { ...roomMeters };
                Object.keys(updatedMeters).forEach(apartmentId => {
                  updatedMeters[apartmentId] = {
                    ...updatedMeters[apartmentId],
                    previous: updatedMeters[apartmentId].current || 0,
                    current: 0,
                    usage: 0
                  };
                });
                setRoomMeters(updatedMeters);

                // Move to next month
                const currentMonth = parseInt(selectedMonth);
                const currentYear = parseInt(selectedYear);
                if (currentMonth === 12) {
                  setSelectedMonth('1');
                  setSelectedYear((currentYear + 1).toString());
                } else {
                  setSelectedMonth((currentMonth + 1).toString());
                }
              }
            }}
            className="btn btn-primary text-lg px-8 py-3"
          >
            Chuyển sang tháng {nextMonth}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGeneration; 