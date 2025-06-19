import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import Modal from '../components/Modal';
import { formatDate } from '../utils/dateFormat';

const Tenants = () => {
  const { t } = useLanguage();
  const { 
    data, 
    currentUser,
    addTenant, 
    updateTenant, 
    deleteTenant, 
    assignTenantToApartment,
    getApartmentTenants,
    getApartmentTenantCount 
  } = useApp();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isAddModalOpen) {
          resetFormData();
          setIsAddModalOpen(false);
        } else if (isEditModalOpen) {
          resetFormData();
          setIsEditModalOpen(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isAddModalOpen, isEditModalOpen]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    idIssueDate: '',
    idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
    hometown: '',
    permanentAddress: '',
    status: 'active',
  });

  const resetFormData = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      idIssueDate: '',
      idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
      hometown: '',
      permanentAddress: '',
      status: 'active',
    });
  };

  const roleConfig = {
    contract_signer: {
      label: 'Người ký hợp đồng',
      icon: '📝',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      description: 'Ký HĐ - Không ở trọ'
    },
    room_leader: {
      label: 'Trưởng phòng',
      icon: '👑',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      description: 'Ký HĐ + Ở trọ - Đại diện phòng'
    },
    member: {
      label: 'Thành viên',
      icon: '👤',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      description: 'Ở trọ - Thành viên phòng'
    }
  };

  const validateRoleInApartment = (apartmentId, role, excludeTenantId = null) => {
    if (!apartmentId) return true; // No apartment selected, no validation needed
    
    const apartmentTenants = data.tenants.filter(t => 
      t.apartmentId === apartmentId && t.id !== excludeTenantId
    );
    
    const hasContractSigner = apartmentTenants.some(t => t.role === 'contract_signer');
    const hasRoomLeader = apartmentTenants.some(t => t.role === 'room_leader');
    
    // If trying to add contract_signer when there's already a room_leader
    if (hasRoomLeader && role === 'contract_signer') {
      alert('Phòng đã có trưởng phòng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.');
      return false;
    }
    
    // If trying to add room_leader when there's already a contract_signer
    if (hasContractSigner && role === 'room_leader') {
      alert('Phòng đã có người ký hợp đồng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.');
      return false;
    }
    
    // If there's already a contract_signer and trying to add another contract_signer
    if (hasContractSigner && role === 'contract_signer') {
      alert('Mỗi phòng chỉ có thể có 1 người ký hợp đồng.');
      return false;
    }
    
    // If there's already a room_leader and trying to add another room_leader
    if (hasRoomLeader && role === 'room_leader') {
      alert('Mỗi phòng chỉ có thể có 1 trưởng phòng.');
      return false;
    }
    
    return true;
  };

  const handleAddTenant = () => {
    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.idNumber || 
        !formData.idIssueDate || !formData.idIssuePlace || 
        !formData.hometown || !formData.permanentAddress) {
      alert('Vui lòng điền đầy đủ tất cả các trường bắt buộc!');
      return;
    }
    
    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Số điện thoại phải có đúng 10 chữ số!');
      return;
    }
    
    // Validate email format if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Email không đúng định dạng!');
        return;
      }
    }
    
    // Validate ID number (12 digits for CCCD)
    const idRegex = /^[0-9]{12}$/;
    if (!idRegex.test(formData.idNumber)) {
      alert('Số CCCD phải có đúng 12 chữ số!');
      return;
    }
    
    // Check for duplicate ID number
    const duplicateTenant = data.tenants.find(t => t.idNumber === formData.idNumber);
    if (duplicateTenant) {
      alert(`Số CCCD ${formData.idNumber} đã tồn tại trong hệ thống!\n\nKhách thuê: ${duplicateTenant.fullName}\nSố điện thoại: ${duplicateTenant.phone}`);
      return;
    }
    
    const newTenant = addTenant(formData);
    resetFormData();
    setIsAddModalOpen(false);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setFormData({ ...tenant });
    setIsEditModalOpen(true);
  };

  const handleUpdateTenant = () => {
    // Only validate editable fields when updating
    if (!formData.phone) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }
    
    if (!formData.idIssueDate || !formData.idIssuePlace) {
      alert('Vui lòng điền đầy đủ thông tin ngày cấp và nơi cấp CCCD!');
      return;
    }
    
    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Số điện thoại phải có đúng 10 chữ số!');
      return;
    }
    
    // Validate email format if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Email không đúng định dạng!');
        return;
      }
    }
    
    // Skip ID validation since it's not editable in update mode
    
    updateTenant(selectedTenant.id, formData);
    resetFormData();
    setIsEditModalOpen(false);
    setSelectedTenant(null);
  };



  const handleDeleteTenant = (tenantId) => {
    if (currentUser?.role !== 'admin') {
      alert('Chỉ admin mới có quyền xóa khách thuê.');
      return;
    }
    
    if (window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN khách thuê này? Hành động này không thể hoàn tác.')) {
      deleteTenant(tenantId);
    }
  };

  const filteredTenants = data.tenants.filter(tenant => {
    const matchesSearch = tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || tenant.role === filterRole;
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });



  const TenantForm = ({ onSubmit, submitText, isEditing = false }) => (
    <div className="space-y-4">
      {/* Edit Mode Notice */}
      {isEditing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Lưu ý khi chỉnh sửa:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Không thể sửa: Họ tên, Số CCCD, Quê quán, Nơi thường trú</li>
                <li>Có thể sửa: Số điện thoại, Email, Ngày cấp CCCD, Nơi cấp CCCD, Trạng thái</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`input ${isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            placeholder="Nhập họ và tên đầy đủ"
            required
            disabled={isEditing}
            title={isEditing ? "Không thể thay đổi họ tên" : ""}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
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
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* ID Information */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin CCCD/CMND</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số CCCD *
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              className={`input ${isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="001234567890"
              maxLength="12"
              required
              disabled={isEditing}
              title={isEditing ? "Không thể thay đổi số CCCD" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày cấp *
            </label>
            <input
              type="date"
              value={formData.idIssueDate}
              onChange={(e) => setFormData({ ...formData, idIssueDate: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nơi cấp *
            </label>
            <input
              type="text"
              value={formData.idIssuePlace}
              onChange={(e) => setFormData({ ...formData, idIssuePlace: e.target.value })}
              className="input"
              placeholder="Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội"
              required
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Thông tin địa chỉ</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quê quán *
            </label>
            <input
              type="text"
              value={formData.hometown}
              onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
              className={`input ${isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Xã/Phường, Quận/Huyện, Tỉnh/Thành phố"
              required
              disabled={isEditing}
              title={isEditing ? "Không thể thay đổi quê quán" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nơi thường trú *
            </label>
            <textarea
              value={formData.permanentAddress}
              onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
              className={`input ${isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              rows="2"
              placeholder="Số nhà, Đường/Phố, Xã/Phường, Quận/Huyện, Tỉnh/Thành phố"
              required
              disabled={isEditing}
              title={isEditing ? "Không thể thay đổi nơi thường trú" : ""}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Trạng thái
        </label>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: 'active' })}
            className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all ${
              formData.status === 'active'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">✅</span>
            Hoạt động
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, status: 'inactive' })}
            className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all ${
              formData.status === 'inactive'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">❌</span>
            Không hoạt động
          </button>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lọc theo trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => {
          const apartment = tenant.apartmentId ? data.apartments.find(apt => apt.id === tenant.apartmentId) : null;
          // Find contract where this tenant is the main tenant or in members
          const contract = data.contracts.find(c => 
            c.status === 'active' && (
              c.tenantId === tenant.id || 
              (c.members && c.members.some(m => m.id === tenant.id))
            )
          );
          
          // Always use role from tenant data as the source of truth
          const tenantRole = tenant.role || 'member';
          
          const config = roleConfig[tenantRole] || roleConfig.member;
          
          return (
            <div key={tenant.id} className={`bg-white rounded-xl shadow-sm border hover:shadow-md transition-all`}>
              {/* Header */}
              <div className={`bg-gray-50 px-6 py-4 border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {tenant.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tenant.fullName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tenant.status === 'active' 
                            ? 'text-green-700 bg-green-100' 
                            : 'text-red-700 bg-red-100'
                        }`}>
                          {tenant.status === 'active' ? '✅ Hoạt động' : '❌ Không hoạt động'}
                        </span>
                      </div>
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

                {/* Contract and Room Info */}
                {contract || apartment ? (
                  <div className="space-y-3">
                    {contract && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-blue-900">
                            Hợp đồng {contract.contractNumber}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                            {config.icon} {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600">
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </p>
                      </div>
                    )}
                    
                    {apartment && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700">
                          Phòng {apartment.roomNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getApartmentTenantCount(apartment.id)} người ở
                        </p>
                      </div>
                    )}
                    
                    {!contract && apartment && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-yellow-700">
                          ⚠️ Khách thuê trong phòng nhưng chưa có hợp đồng
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-sm text-gray-500">Chưa có hợp đồng và chưa được phân phòng</p>
                  </div>
                )}

                <div className="flex space-x-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleEditTenant(tenant)}
                    className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Sửa thông tin
                  </button>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  )}
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
        size="lg"
        footer={
          <div className="flex space-x-3">
            <button
              onClick={() => {
                resetFormData();
                setIsAddModalOpen(false);
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleAddTenant}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!formData.fullName || !formData.phone}
            >
              Thêm khách thuê
            </button>
          </div>
        }
      >
        <TenantForm 
          onSubmit={handleAddTenant}
          submitText="Thêm khách thuê"
          isEditing={false}
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
        size="lg"
        footer={
          <div className="flex space-x-3">
            <button
              onClick={() => {
                resetFormData();
                setIsEditModalOpen(false);
                setSelectedTenant(null);
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleUpdateTenant}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!formData.fullName || !formData.phone}
            >
              Cập nhật
            </button>
          </div>
        }
      >
        <TenantForm 
          onSubmit={handleUpdateTenant}
          submitText="Cập nhật"
          isEditing={true}
        />
      </Modal>


    </div>
  );
};

export default Tenants; 