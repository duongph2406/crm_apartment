import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import Modal from '../components/Modal';



const Apartments = () => {
  const { t } = useLanguage();
  const { 
    data, 
    updateApartment, 
    addApartment, 
    deleteApartment,
    getApartmentTenants,
    getApartmentTenantCount,
    getPrimaryTenant,
    getRoomPrice
  } = useApp();
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isConfirmModalOpen) {
          setIsConfirmModalOpen(false);
        } else if (isEditModalOpen) {
          setIsEditModalOpen(false);
          setSelectedApartment(null);
        }
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isEditModalOpen, isConfirmModalOpen]);
  const [formData, setFormData] = useState({
    roomNumber: '',
    size: '',
    description: '',
    status: '',
    maintenanceReason: '',
  });
  
  // Refs for form inputs to prevent focus loss
  const roomNumberRef = useRef(null);
  const sizeRef = useRef(null);
  const descriptionRef = useRef(null);
  const maintenanceReasonRef = useRef(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'occupied': 
        return { 
          color: 'bg-green-500', 
          bgColor: 'bg-green-50', 
          borderColor: 'border-green-200', 
          textColor: 'text-green-800',
          icon: '🏠'
        };
      case 'available': 
        return { 
          color: 'bg-blue-500', 
          bgColor: 'bg-blue-50', 
          borderColor: 'border-blue-200', 
          textColor: 'text-blue-800',
          icon: '🔑'
        };
      case 'maintenance': 
        return { 
          color: 'bg-orange-500', 
          bgColor: 'bg-orange-50', 
          borderColor: 'border-orange-200', 
          textColor: 'text-orange-800',
          icon: '🔧'
        };
      default: 
        return { 
          color: 'bg-gray-500', 
          bgColor: 'bg-gray-50', 
          borderColor: 'border-gray-200', 
          textColor: 'text-gray-800',
          icon: '❓'
        };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied': return t('occupied');
      case 'available': return t('available');
      case 'maintenance': return t('maintenance');
      default: return status;
    }
  };

  const filteredApartments = data.apartments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const handleEditApartment = (apartment) => {
    setSelectedApartment(apartment);
    setFormData({
      roomNumber: apartment.roomNumber || '',
      size: apartment.size ? apartment.size.toString() : '',
      description: apartment.description || '',
      status: apartment.status || 'available',
      maintenanceReason: apartment.maintenanceReason || '',
    });
    setIsEditModalOpen(true);
  };



  const statusConfig = [
    ['available', { icon: '🔑', label: 'Trống', description: 'Sẵn sàng cho thuê' }],
    ['occupied', { icon: '🏠', label: 'Đã thuê', description: 'Có khách đang ở' }],
    ['maintenance', { icon: '🔧', label: 'Bảo trì', description: 'Đang sửa chữa' }]
  ];

  const EditApartmentModal = () => {
    if (!selectedApartment) return null;

    // Check if apartment has active contract
    const hasActiveContract = data.contracts.some(contract => 
      contract.apartmentId === selectedApartment.id && 
      contract.status === 'active'
    );
    
    // Get current status
    const currentActualStatus = selectedApartment.status || 'available';

    const handleSave = () => {
      // Get values from refs
      const currentValues = {
        roomNumber: roomNumberRef.current?.value || formData.roomNumber,
        size: sizeRef.current?.value || formData.size,
        description: descriptionRef.current?.value || formData.description,
        status: formData.status,
        maintenanceReason: maintenanceReasonRef.current?.value || formData.maintenanceReason
      };
      
      // Validate maintenance reason if status is maintenance
      if (currentValues.status === 'maintenance' && !currentValues.maintenanceReason.trim()) {
        alert('Vui lòng nhập lý do bảo trì!');
        return;
      }
      
      // Only save changes that are allowed
      const allowedChanges = {
        roomNumber: currentValues.roomNumber,
        size: parseFloat(currentValues.size) || 0,
        description: currentValues.description
      };
      
      // If room has no active contract, allow changing status
      if (!hasActiveContract) {
        allowedChanges.status = currentValues.status;
        // If status is maintenance, save the reason
        if (currentValues.status === 'maintenance') {
          allowedChanges.maintenanceReason = currentValues.maintenanceReason.trim();
        } else {
          // Clear maintenance reason if not in maintenance
          allowedChanges.maintenanceReason = '';
        }
      }
      
      updateApartment(selectedApartment.id, allowedChanges);
      setIsEditModalOpen(false);
      setSelectedApartment(null);
      // Reset form data
      setFormData({
        roomNumber: '',
        size: '',
        description: '',
        status: '',
        maintenanceReason: '',
      });
    };

    return (
      <Modal
        key={selectedApartment.id}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedApartment(null);
          // Reset form data
          setFormData({
            roomNumber: '',
            size: '',
            description: '',
            status: '',
            maintenanceReason: '',
          });
        }}
        title={`Chỉnh sửa phòng ${selectedApartment.roomNumber}`}
        size="lg"
        footer={
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedApartment(null);
                // Reset form data
                setFormData({
                  roomNumber: '',
                  size: '',
                  description: '',
                  status: '',
                  maintenanceReason: '',
                });
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Warning message if room has active contract */}
          {hasActiveContract && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Phòng đang có hợp đồng hiệu lực</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Trạng thái phòng được quản lý tự động bởi hợp đồng</li>
                    <li>Giá thuê được đồng bộ từ hợp đồng hiện tại</li>
                    <li>Không thể thay đổi trạng thái phòng trong thời gian hợp đồng</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số phòng
            </label>
            <input
              ref={roomNumberRef}
              type="text"
              defaultValue={formData.roomNumber}
              onChange={(e) => {
                formData.roomNumber = e.target.value;
              }}
              className="input"
              placeholder="102"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diện tích (m²)
            </label>
            <input
              ref={sizeRef}
              type="number"
              defaultValue={formData.size}
              onChange={(e) => {
                formData.size = e.target.value;
              }}
              className="input"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              ref={descriptionRef}
              defaultValue={formData.description}
              onChange={(e) => {
                formData.description = e.target.value;
              }}
              className="input"
              rows="3"
              placeholder="Mô tả về phòng..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Trạng thái
            </label>
            
            {/* Show current status if room has contract */}
            {hasActiveContract ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <p className="font-medium text-gray-900">Đã thuê</p>
                    <p className="text-sm text-gray-500">Trạng thái được quản lý bởi hợp đồng</p>
                  </div>
                </div>
              </div>
            ) : (
              // Room has no contract, allow changing between available and maintenance
              <div className="space-y-2">
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    💡 Phòng không có hợp đồng, bạn có thể chuyển giữa trạng thái trống và bảo trì
                  </p>
                </div>
                {[
                  ['available', { icon: '🔑', label: 'Trống', description: 'Sẵn sàng cho thuê' }],
                  ['maintenance', { icon: '🔧', label: 'Bảo trì', description: 'Đang sửa chữa' }]
                ].map(([status, config]) => (
                  <label key={status} className="flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setFormData(prev => ({ ...prev, status: newValue }));
                      }}
                      className="mr-3"
                    />
                    <span className="text-2xl mr-3">{config.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{config.label}</p>
                      <p className="text-sm text-gray-500">{config.description}</p>
                    </div>
                  </label>
                ))}
                
                {/* Maintenance reason input */}
                {formData.status === 'maintenance' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do bảo trì <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={maintenanceReasonRef}
                      defaultValue={formData.maintenanceReason || ''}
                      onChange={(e) => {
                        formData.maintenanceReason = e.target.value;
                      }}
                      className="input w-full"
                      rows="3"
                      placeholder="Nhập lý do bảo trì (ví dụ: Sửa điều hòa, thay cửa sổ, sơn lại tường...)"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const ConfirmModal = () => {
    if (!selectedApartment) return null;

    const tenants = getApartmentTenants(selectedApartment.id);

    const handleConfirm = () => {
      updateApartment(selectedApartment.id, formData);
      setIsConfirmModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedApartment(null);
    };

    return (
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác nhận thay đổi trạng thái"
        size="md"
        footer={
          <div className="flex space-x-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Xác nhận xóa
            </button>
          </div>
        }
      >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Xác nhận thay đổi trạng thái
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Phòng {selectedApartment.roomNumber} hiện có {tenants.length} khách thuê. 
              Khi chuyển về trạng thái "Trống", tất cả thông tin khách thuê và hợp đồng sẽ bị xóa.
            </p>
            
            <div className="bg-red-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Dữ liệu sẽ bị xóa:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {tenants.map(tenant => (
                  <li key={tenant.id}>• {tenant.fullName} ({tenant.role === 'contract_signer' ? 'Người ký HĐ' : tenant.role === 'room_leader' ? 'Trưởng phòng' : 'Thành viên'})</li>
                ))}
                <li>• Hợp đồng đang hoạt động</li>
              </ul>
            </div>
          </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('apartments')}
            </h1>
            <p className="text-secondary">
              Quản lý thông tin và tình trạng 11 căn hộ trong tòa nhà
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{data.apartments.length}</div>
              <div className="text-sm text-blue-600 dark:text-blue-300">Tổng căn hộ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Lọc theo trạng thái</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'Tất cả', count: data.apartments.length, color: 'bg-gray-500' },
            { 
              key: 'available', 
              label: 'Trống', 
              count: data.apartments.filter(a => a.status === 'available').length, 
              color: 'bg-blue-500' 
            },
            { 
              key: 'occupied', 
              label: 'Đã thuê', 
              count: data.apartments.filter(a => a.status === 'occupied').length, 
              color: 'bg-green-500' 
            },
            { 
              key: 'maintenance', 
              label: 'Bảo trì', 
              count: data.apartments.filter(a => a.status === 'maintenance').length, 
              color: 'bg-orange-500' 
            }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === filterOption.key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'bg-secondary text-secondary hover-bg-tertiary border border-primary'
              }`}
            >
              {filter !== filterOption.key && (
                <div className={`w-3 h-3 rounded-full ${filterOption.color} mr-2`}></div>
              )}
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Apartments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredApartments.map((apartment) => {
          // Get actual status from apartment (now synced automatically)
          const actualStatus = apartment.status || 'available';
          const config = getStatusConfig(actualStatus);
          const tenantCount = getApartmentTenantCount(apartment.id);

          return (
            <div key={apartment.id} className={`bg-primary rounded-xl shadow hover:shadow-lg transition-all duration-300 border ${config.borderColor} overflow-hidden`}>
              {/* Header */}
              <div className={`${config.bgColor} px-6 py-4 border-b ${config.borderColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-primary">
                        {apartment.roomNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.textColor} bg-primary`}>
                        {getStatusText(actualStatus)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-secondary">Diện tích:</span>
                    <span className="ml-2 font-medium">{apartment.size}m²</span>
                  </div>
                  <div>
                    <span className="text-sm text-secondary">Giá thuê:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {getRoomPrice(apartment.id)?.toLocaleString('vi-VN')} VNĐ/tháng
                    </span>
                    {/* Show if price is synced from contract */}
                    {(() => {
                      const currentPrice = getRoomPrice(apartment.id);
                      const defaultPrice = apartment.rentPrice || 0;
                      if (currentPrice !== defaultPrice) {
                        return (
                          <div className="text-xs text-green-600 mt-1">
                            🔄 Đồng bộ từ hợp đồng
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                {/* Tenant Information */}
                {getApartmentTenantCount(apartment.id) > 0 ? (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-blue-900 mb-3">
                      Thông tin khách thuê ({getApartmentTenantCount(apartment.id)} người ở)
                    </h4>
                    
                    {getApartmentTenants(apartment.id).map((tenant) => {
                      const roleConfig = {
                        contract_signer: { label: 'Người ký HĐ (Không ở)', icon: '📝', color: 'text-purple-600' },
                        room_leader: { label: 'Trưởng phòng (Ký HĐ + Ở)', icon: '👑', color: 'text-blue-600' },
                        member: { label: 'Thành viên (Ở)', icon: '👤', color: 'text-green-600' }
                      };
                      const config = roleConfig[tenant.role] || roleConfig.member;
                      
                      return (
                        <div key={tenant.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{config.icon}</span>
                            <div>
                              <p className="font-medium text-gray-900">{tenant.fullName}</p>
                              <p className={`text-xs ${config.color}`}>{config.label}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{tenant.phone}</p>
                            {tenant.role === 'contract_signer' && (
                              <p className="text-xs text-purple-600">Không tính số người</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Primary tenant for billing */}
                    {(() => {
                      const primaryTenant = getPrimaryTenant(apartment.id);
                      if (primaryTenant) {
                        return (
                          <div className="border-t border-blue-200 pt-3 mt-3">
                            <p className="text-sm text-blue-700">
                              <span className="font-medium">Tên trên hóa đơn:</span> {primaryTenant.fullName}
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : actualStatus === 'maintenance' && apartment.maintenanceReason ? (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <span className="text-orange-500 text-lg">🔧</span>
                      <div className="flex-1">
                        <p className="font-medium text-orange-900 mb-1">Đang bảo trì</p>
                        <p className="text-sm text-orange-700">{apartment.maintenanceReason}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-gray-400 text-2xl mb-2">🏠</div>
                    <p className="text-sm text-gray-500">Phòng trống</p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditApartment(apartment)}
                    className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Thống kê tổng quan
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Tổng căn hộ', value: data.apartments.length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { 
              label: 'Đã thuê', 
              value: data.apartments.filter(a => getApartmentTenantCount(a.id) > 0).length, 
              color: 'text-green-600', 
              bg: 'bg-green-50' 
            },
            { 
              label: 'Trống', 
              value: data.apartments.filter(a => getApartmentTenantCount(a.id) === 0).length, 
              color: 'text-gray-600', 
              bg: 'bg-gray-50' 
            },
            { 
              label: 'Thu nhập/tháng', 
              value: formatCurrency(
                data.apartments
                  .filter(a => getApartmentTenantCount(a.id) > 0)
                  .reduce((sum, a) => sum + getRoomPrice(a.id), 0)
              ), 
              color: 'text-purple-600', 
              bg: 'bg-purple-50', 
              isLarge: true 
            }
          ].map((stat, index) => (
            <div key={index} className={`${stat.bg} rounded-xl p-4 text-center`}>
              <div className={`${stat.isLarge ? 'text-lg' : 'text-2xl'} font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <EditApartmentModal />
      <ConfirmModal />
    </div>
  );
};

export default Apartments; 