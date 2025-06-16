import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const Tenants = () => {
  const { t } = useLanguage();
  const { 
    data, 
    addTenant, 
    updateTenant, 
    deleteTenant, 
    assignTenantToApartment,
    getApartmentTenants,
    getApartmentTenantCount 
  } = useApp();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    address: '',
    apartmentId: '',
    role: 'member',
  });

  const resetFormData = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      address: '',
      apartmentId: '',
      role: 'member',
    });
  };

  const roleConfig = {
    contract_signer: {
      label: 'Người ký hợp đồng',
      icon: '📝',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      description: 'Không tính vào số người ở'
    },
    room_leader: {
      label: 'Trưởng phòng',
      icon: '👑',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      description: 'Đại diện phòng'
    },
    member: {
      label: 'Thành viên',
      icon: '👤',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      description: 'Thành viên trong phòng'
    }
  };

  const handleAddTenant = () => {
    if (formData.fullName && formData.phone) {
      const newTenant = addTenant(formData);
      if (formData.apartmentId) {
        assignTenantToApartment(newTenant.id, formData.apartmentId, formData.role);
      }
      resetFormData();
      setIsAddModalOpen(false);
    }
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({ ...tenant });
    setIsEditModalOpen(true);
  };

  const handleUpdateTenant = () => {
    if (formData.fullName && formData.phone) {
      updateTenant(selectedTenant.id, formData);
      if (formData.apartmentId !== selectedTenant.apartmentId || formData.role !== selectedTenant.role) {
        assignTenantToApartment(selectedTenant.id, formData.apartmentId, formData.role);
      }
      resetFormData();
      setIsEditModalOpen(false);
      setSelectedTenant(null);
    }
  };

  const handleAssignToApartment = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      ...tenant,
      apartmentId: tenant.apartmentId || '',
      role: tenant.role || 'member'
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignment = () => {
    assignTenantToApartment(selectedTenant.id, formData.apartmentId, formData.role);
    setIsAssignModalOpen(false);
    setSelectedTenant(null);
    resetFormData();
  };

  const handleDeleteTenant = (tenantId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách thuê này?')) {
      deleteTenant(tenantId);
    }
  };

  const filteredTenants = data.tenants.filter(tenant => {
    const matchesSearch = tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || tenant.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-90vh overflow-y-auto mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const TenantForm = ({ onSubmit, submitText, isAssignMode = false }) => (
    <div className="space-y-4">
      {!isAssignMode && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('fullName')} *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="input"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('phone')} *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
              placeholder="0901234567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('idNumber')}
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              className="input"
              placeholder="123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('address')}
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows="3"
              placeholder="Địa chỉ thường trú"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Phòng
        </label>
        <select
          value={formData.apartmentId}
          onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
          className="input"
        >
          <option value="">Chưa gán phòng</option>
          {data.apartments.map(apartment => (
            <option key={apartment.id} value={apartment.id}>
              Phòng {apartment.roomNumber} ({getApartmentTenantCount(apartment.id)} người)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Vai trò trong phòng
        </label>
        <div className="space-y-3">
          {Object.entries(roleConfig).map(([roleKey, config]) => (
            <button
              key={roleKey}
              type="button"
              onClick={() => setFormData({ ...formData, role: roleKey })}
              className={`w-full flex items-center p-3 rounded-lg border-2 transition-all ${
                formData.role === roleKey
                  ? `${config.border} ${config.bg}`
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-3">{config.icon}</span>
              <div className="flex-1 text-left">
                <p className={`font-medium ${formData.role === roleKey ? config.color : 'text-gray-700'}`}>
                  {config.label}
                </p>
                <p className="text-xs text-gray-500">{config.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => {
            resetFormData();
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setIsAssignModalOpen(false);
          }}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={!isAssignMode && (!formData.fullName || !formData.phone)}
        >
          {submitText}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('tenants')}
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin và vai trò khách thuê trong từng căn hộ
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Thêm khách thuê</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              placeholder="Tìm theo tên, số điện thoại, email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo vai trò
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input"
            >
              <option value="all">Tất cả vai trò</option>
              {Object.entries(roleConfig).map(([roleKey, config]) => (
                <option key={roleKey} value={roleKey}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          const config = roleConfig[tenant.role] || roleConfig.member;
          const apartment = tenant.apartmentId ? data.apartments.find(apt => apt.id === tenant.apartmentId) : null;
          
          return (
            <div key={tenant.id} className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all ${config.border}`}>
              {/* Header */}
              <div className={`${config.bg} px-6 py-4 border-b ${config.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenant.fullName}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} bg-white`}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">📞</span>
                    <span className="text-sm text-gray-900">{tenant.phone}</span>
                  </div>
                  {tenant.email && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">📧</span>
                      <span className="text-sm text-gray-900">{tenant.email}</span>
                    </div>
                  )}
                  {tenant.idNumber && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">🆔</span>
                      <span className="text-sm text-gray-900">{tenant.idNumber}</span>
                    </div>
                  )}
                </div>

                {apartment ? (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Phòng {apartment.roomNumber}
                        </p>
                        <p className="text-xs text-blue-600">
                          {getApartmentTenantCount(apartment.id)} người ở
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignToApartment(tenant)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500 mb-2">Chưa được gán phòng</p>
                    <button
                      onClick={() => handleAssignToApartment(tenant)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Gán vào phòng
                    </button>
                  </div>
                )}

                <div className="flex space-x-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleEditTenant(tenant)}
                    className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Sửa thông tin
                  </button>
                  <button
                    onClick={() => handleDeleteTenant(tenant.id)}
                    className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterRole !== 'all' ? 'Không tìm thấy khách thuê phù hợp' : 'Chưa có khách thuê nào'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterRole !== 'all' 
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' 
              : 'Hãy thêm khách thuê đầu tiên vào hệ thống'
            }
          </p>
        </div>
      )}

      {/* Add Tenant Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetFormData();
        }}
        title="Thêm khách thuê mới"
      >
        <TenantForm 
          onSubmit={handleAddTenant}
          submitText="Thêm khách thuê"
        />
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetFormData();
          setSelectedTenant(null);
        }}
        title={`Chỉnh sửa: ${selectedTenant?.fullName}`}
      >
        <TenantForm 
          onSubmit={handleUpdateTenant}
          submitText="Cập nhật"
        />
      </Modal>

      {/* Assign to Apartment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          resetFormData();
          setSelectedTenant(null);
        }}
        title={`Gán phòng: ${selectedTenant?.fullName}`}
      >
        <TenantForm 
          onSubmit={handleAssignment}
          submitText="Cập nhật gán phòng"
          isAssignMode={true}
        />
      </Modal>
    </div>
  );
};

export default Tenants; 