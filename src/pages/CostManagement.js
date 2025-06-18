import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const CostManagement = () => {
  const { t } = useLanguage();
  const { data, updateCostSettings, updateRoomPrice, getRoomPrice } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general, room-prices
  const [costData, setCostData] = useState(
    data.costSettings || {
      electricityRate: 4000, // VNĐ/kWh
      waterRatePerPerson: 100000, // VNĐ/người/tháng
      internetRatePerRoom: 100000, // VNĐ/phòng/tháng
      serviceFeePerPerson: 100000, // VNĐ/người/tháng
      lastUpdated: new Date().toISOString()
    }
  );

  // Room prices state
  const [roomPricesData, setRoomPricesData] = useState({});

  const handleSave = () => {
    if (activeTab === 'general') {
      // Save cost settings
      const updatedData = {
        ...costData,
        lastUpdated: new Date().toISOString()
      };
      setCostData(updatedData);
      if (updateCostSettings) {
        updateCostSettings(updatedData);
      }
    } else if (activeTab === 'room-prices') {
      // Save room prices
      Object.entries(roomPricesData).forEach(([apartmentId, price]) => {
        if (price !== undefined && price !== '') {
          updateRoomPrice(apartmentId, parseInt(price));
        }
      });
      setRoomPricesData({});
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (activeTab === 'general') {
      setCostData(data.costSettings || {
        electricityRate: 4000,
        waterRatePerPerson: 100000,
        internetRatePerRoom: 100000,
        serviceFeePerPerson: 100000,
        lastUpdated: new Date().toISOString()
      });
    } else if (activeTab === 'room-prices') {
      setRoomPricesData({});
    }
    setIsEditing(false);
  };

  const getRoomPriceForEdit = (apartmentId) => {
    return roomPricesData[apartmentId] !== undefined 
      ? roomPricesData[apartmentId] 
      : getRoomPrice(apartmentId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const costItems = [
    {
      key: 'electricityRate',
      title: 'Giá điện',
      unit: 'VNĐ/kWh',
      icon: '⚡',
      description: 'Giá điện tính theo từng kWh sử dụng',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      key: 'waterRatePerPerson',
      title: 'Giá nước',
      unit: 'VNĐ/người/tháng',
      icon: '💧',
      description: 'Giá nước tính theo số người trong phòng',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'internetRatePerRoom',
      title: 'Phí Internet',
      unit: 'VNĐ/phòng/tháng',
      icon: '🌐',
      description: 'Phí internet cố định cho mỗi phòng',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'serviceFeePerPerson',
      title: 'Phí dịch vụ',
      unit: 'VNĐ/người/tháng',
      icon: '🏢',
      description: 'Phí dịch vụ chung cư, bảo trì, an ninh, vệ sinh',
      color: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Quản lý Chi phí
            </h1>
            <p className="text-secondary">
              Cài đặt giá điện, nước, internet và các phí dịch vụ cho tòa nhà
            </p>
            {costData.lastUpdated && (
              <p className="text-sm text-light mt-2">
                Cập nhật lần cuối: {formatDate(costData.lastUpdated)}
              </p>
            )}
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button 
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="btn btn-primary"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="flex border-b border-primary">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-tertiary text-primary border-b-2 border-blue-500'
                : 'text-secondary hover-bg-tertiary'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>⚙️</span>
              <span>Chi phí chung</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('room-prices')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'room-prices'
                ? 'bg-tertiary text-primary border-b-2 border-blue-500'
                : 'text-secondary hover-bg-tertiary'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🏠</span>
              <span>Giá phòng</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <>
          {/* Cost Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {costItems.map((item) => (
          <div key={item.key} className="bg-primary rounded-xl shadow border overflow-hidden">
            {/* Header */}
            <div className={`${item.color.split(' ')[0]} px-6 py-4 border-b border-primary`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-secondary mb-3">
                  {item.description}
                </p>
                
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Giá tiền
                    </label>
                    <input
                      type="number"
                      value={costData[item.key]}
                      onChange={(e) => setCostData({
                        ...costData,
                        [item.key]: parseInt(e.target.value) || 0
                      })}
                      className="input w-full"
                      placeholder="Nhập giá tiền..."
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {costData[item.key]?.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-sm text-secondary">
                      VNĐ
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Example */}
              {!isEditing && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-secondary mb-1 font-medium">Ví dụ tính toán:</p>
                  <p className="text-xs text-light">
                    {item.key === 'electricityRate' && `100 kWh × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency((costData[item.key] || 0) * 100)}`}
                    {item.key === 'waterRatePerPerson' && `3 người × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency((costData[item.key] || 0) * 3)}`}
                    {item.key === 'internetRatePerRoom' && `1 phòng × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency(costData[item.key] || 0)}`}
                    {item.key === 'serviceFeePerPerson' && `3 người × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency((costData[item.key] || 0) * 3)}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <h3 className="text-xl font-semibold text-primary mb-6">
          Tổng quan chi phí
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Calculation */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium text-primary mb-3">Ví dụ tính hóa đơn (phòng 3 người)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Điện (150 kWh):</span>
                <span className="font-medium">{formatCurrency((costData.electricityRate || 0) * 150)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Nước (3 người):</span>
                <span className="font-medium">{formatCurrency((costData.waterRatePerPerson || 0) * 3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Internet:</span>
                <span className="font-medium">{formatCurrency(costData.internetRatePerRoom || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Phí dịch vụ (3 người):</span>
                <span className="font-medium">{formatCurrency((costData.serviceFeePerPerson || 0) * 3)}</span>
              </div>
              <div className="border-t border-light pt-2 flex justify-between font-semibold">
                <span className="text-primary">Tổng (chưa tính tiền thuê):</span>
                <span className="text-primary">
                  {formatCurrency(
                    (costData.electricityRate || 0) * 150 +
                    (costData.waterRatePerPerson || 0) * 3 +
                    (costData.internetRatePerRoom || 0) +
                    (costData.serviceFeePerPerson || 0) * 3
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Statistics */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium text-primary mb-3">Thống kê chi phí cố định</h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatCurrency(costData.internetRatePerRoom || 0)}
                </div>
                <p className="text-sm text-secondary">Chi phí cố định mỗi phòng</p>
              </div>
              
                              <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(costData.waterRatePerPerson || 0)}
                    </div>
                    <p className="text-xs text-secondary">Nước/người</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(costData.serviceFeePerPerson || 0)}
                    </div>
                    <p className="text-xs text-secondary">Dịch vụ/người</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600">
                      {(costData.electricityRate || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <p className="text-xs text-secondary">Điện/kWh</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Giá điện:</strong> Được tính theo số kWh thực tế sử dụng trong tháng</li>
              <li>• <strong>Giá nước:</strong> Tính theo số người đang ở trong phòng (không tính người ký hợp đồng)</li>
              <li>• <strong>Internet:</strong> Phí cố định cho mỗi phòng bất kể số người</li>
              <li>• <strong>Phí dịch vụ:</strong> Bao gồm bảo trì, an ninh, quản lý chung cư, vệ sinh (tính theo số người)</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Room Prices Tab */}
      {activeTab === 'room-prices' && (
        <>
          {/* Room Prices Header */}
          <div className="bg-primary rounded-xl shadow border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Giá phòng theo từng căn hộ
                </h3>
                <p className="text-secondary">
                  Thiết lập giá thuê riêng cho từng phòng. Nếu không thiết lập sẽ dùng giá mặc định.
                </p>
              </div>
              {isEditing && (
                <button 
                  onClick={() => {
                    const price = prompt('Nhập giá thuê cho tất cả phòng (VNĐ):', '6000000');
                    if (price && !isNaN(price)) {
                      const newPrices = {};
                      data.apartments.forEach(apt => {
                        newPrices[apt.id] = parseInt(price);
                      });
                      setRoomPricesData(newPrices);
                    }
                  }}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Set giá tất cả</span>
                </button>
              )}
            </div>
          </div>

          {/* Room Prices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.apartments.map((apartment) => {
              const customPrice = getRoomPrice(apartment.id);
              const defaultPrice = apartment.rent || 0;
              const isCustom = data.roomPrices[apartment.id] !== undefined;
              
              return (
                <div key={apartment.id} className="bg-primary rounded-xl shadow border overflow-hidden">
                  {/* Header */}
                  <div className="bg-blue-50 px-6 py-4 border-b border-primary">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Phòng {apartment.roomNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {apartment.size}m² • {apartment.description || 'Căn hộ tiêu chuẩn'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Giá mặc định
                        </label>
                        <div className="text-lg text-gray-600">
                          {formatCurrency(defaultPrice)}
                        </div>
                      </div>

                      <div>
                                                 <label className="block text-sm font-medium text-secondary mb-2">
                           Giá tùy chỉnh
                           {isCustom && <span className="text-blue-600 ml-1">(Đang áp dụng)</span>}
                         </label>
                         
                         {/* Check if this price comes from contract */}
                         {(() => {
                           const hasActiveContract = data.contracts.some(contract => 
                             contract.apartmentId === apartment.id && 
                             contract.status === 'active' &&
                             contract.monthlyRent === customPrice
                           );
                           
                           if (hasActiveContract && isCustom) {
                             return (
                               <div className="mb-2 text-xs text-green-600 bg-green-50 rounded px-2 py-1">
                                 🔄 Đồng bộ từ hợp đồng hiện tại
                               </div>
                             );
                           }
                           return null;
                         })()}
                        
                        {isEditing ? (
                          <input
                            type="number"
                            value={getRoomPriceForEdit(apartment.id)}
                            onChange={(e) => setRoomPricesData({
                              ...roomPricesData,
                              [apartment.id]: e.target.value
                            })}
                            className="input w-full"
                            placeholder="Nhập giá tùy chỉnh..."
                          />
                        ) : (
                          <div className={`text-xl font-bold ${isCustom ? 'text-blue-600' : 'text-gray-400'}`}>
                            {isCustom ? formatCurrency(customPrice) : 'Chưa thiết lập'}
                          </div>
                        )}
                      </div>

                      {!isEditing && isCustom && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-700 mb-1 font-medium">Giá hiện tại:</p>
                          <p className="text-sm text-blue-600 font-semibold">
                            {formatCurrency(customPrice)}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Chênh lệch: {formatCurrency(Math.abs(customPrice - defaultPrice))} 
                            {customPrice > defaultPrice ? ' cao hơn' : ' thấp hơn'} giá mặc định
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Room Prices Summary */}
          <div className="bg-primary rounded-xl shadow border p-6">
            <h3 className="text-xl font-semibold text-primary mb-6">
              Tổng quan giá phòng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {data.apartments.length}
                </div>
                <p className="text-sm text-secondary">Tổng số phòng</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Object.keys(data.roomPrices || {}).length}
                </div>
                <p className="text-sm text-secondary">Phòng có giá tùy chỉnh</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {formatCurrency(
                    data.apartments.reduce((total, apt) => 
                      total + getRoomPrice(apt.id), 0
                    )
                  )}
                </div>
                <p className="text-sm text-secondary">Tổng doanh thu tối đa/tháng</p>
              </div>
            </div>
          </div>

          {/* Instructions for Room Prices */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                                 <h4 className="font-medium text-green-900 mb-2">Hướng dẫn thiết lập giá phòng</h4>
                 <ul className="text-sm text-green-800 space-y-1">
                   <li>• <strong>Giá mặc định:</strong> Là giá ban đầu được thiết lập khi tạo căn hộ</li>
                   <li>• <strong>Giá tùy chỉnh:</strong> Ghi đè giá mặc định, có thể cao hơn hoặc thấp hơn</li>
                   <li>• <strong>Đồng bộ tự động:</strong> Khi sửa giá trong hợp đồng sẽ tự động cập nhật vào đây</li>
                   <li>• <strong>Ưu tiên:</strong> Giá tùy chỉnh sẽ được ưu tiên sử dụng khi tính hóa đơn</li>
                   <li>• <strong>Cập nhật:</strong> Có thể thay đổi giá bất cứ lúc nào mà không ảnh hưởng hợp đồng cũ</li>
                 </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CostManagement; 