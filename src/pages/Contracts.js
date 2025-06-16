import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const Contracts = () => {
  const { t } = useLanguage();
  const { data, updateContract, addContract, deleteContract, addTenant, assignTenantToApartment, updateRoomPrice } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingContract, setViewingContract] = useState(null);

  const [formData, setFormData] = useState({
    contractNumber: '',
    apartmentId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
    terms: '',
    status: 'active',
    members: [] // Thành viên trong phòng
  });

  // State for member management
  const [newMember, setNewMember] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    role: 'member'
  });

  // Filter contracts
  const filteredContracts = data.contracts.filter(contract => {
    const apartment = data.apartments.find(apt => apt.id === contract.apartmentId);
    const tenant = data.tenants.find(t => t.id === contract.tenantId);
    
    const matchesSearch = 
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openModal = (contract = null) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        ...contract,
        members: contract.members || []
      });
    } else {
      setEditingContract(null);
      setFormData({
        contractNumber: `HD${Date.now()}`,
        apartmentId: '',
        tenantId: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        deposit: '',
        terms: '',
        status: 'active',
        members: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContract(null);
    setViewingContract(null);
    setFormData({
      contractNumber: '',
      apartmentId: '',
      tenantId: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      deposit: '',
      terms: '',
      status: 'active',
      members: []
    });
    setNewMember({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      role: 'member'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingContract) {
      // Check if monthlyRent has changed
      if (editingContract.monthlyRent !== formData.monthlyRent && formData.apartmentId && formData.monthlyRent) {
        // Update room price in cost management
        updateRoomPrice(formData.apartmentId, formData.monthlyRent);
      }
      
      updateContract(editingContract.id, formData);
      
      // Update existing members in tenants if needed
      if (formData.members && formData.members.length > 0) {
        formData.members.forEach(member => {
          if (member.id) {
            // Update existing tenant
            // This would need more logic in a real app
          } else {
            // Add new member to tenants
            const newTenant = addTenant({
              ...member,
              apartmentId: formData.apartmentId
            });
            assignTenantToApartment(newTenant.id, formData.apartmentId, member.role);
          }
        });
      }
    } else {
      const newContract = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      // Set room price when creating new contract
      if (formData.apartmentId && formData.monthlyRent) {
        updateRoomPrice(formData.apartmentId, formData.monthlyRent);
      }
      
      addContract(newContract);
      
      // Add all members to tenants
      if (formData.members && formData.members.length > 0) {
        formData.members.forEach(member => {
          const newTenant = addTenant({
            ...member,
            apartmentId: formData.apartmentId
          });
          assignTenantToApartment(newTenant.id, formData.apartmentId, member.role);
        });
      }
    }
    
    closeModal();
  };

  // Member management functions
  const addMember = () => {
    if (newMember.fullName && newMember.phone) {
      // Check if there's already a contract_signer or room_leader
      const hasContractSigner = formData.members.some(m => m.role === 'contract_signer');
      const hasRoomLeader = formData.members.some(m => m.role === 'room_leader');
      
      let memberRole = newMember.role;
      
      // If there's already a contract_signer, force all new members to be 'member'
      if (hasContractSigner && (newMember.role === 'contract_signer' || newMember.role === 'room_leader')) {
        alert('Đã có người ký hợp đồng trong phòng. Tất cả thành viên mới sẽ là thành viên thường.');
        memberRole = 'member';
      }
      // If there's already a room_leader and trying to add contract_signer
      else if (hasRoomLeader && newMember.role === 'contract_signer') {
        // Convert room_leader to member and set new member as contract_signer
        setFormData({
          ...formData,
          members: [
            ...formData.members.map(m => m.role === 'room_leader' ? {...m, role: 'member'} : m),
            { ...newMember, id: Date.now(), role: 'contract_signer' }
          ]
        });
        setNewMember({
          fullName: '',
          phone: '',
          email: '',
          idNumber: '',
          role: 'member'
        });
        return;
      }
      // If there's already a room_leader and trying to add another room_leader
      else if (hasRoomLeader && newMember.role === 'room_leader') {
        alert('Mỗi phòng chỉ có thể có 1 trưởng phòng.');
        return;
      }
      
      setFormData({
        ...formData,
        members: [...formData.members, { ...newMember, id: Date.now(), role: memberRole }]
      });
      setNewMember({
        fullName: '',
        phone: '',
        email: '',
        idNumber: '',
        role: 'member'
      });
    }
  };

  const removeMember = (memberId) => {
    setFormData({
      ...formData,
      members: formData.members.filter(member => member.id !== memberId)
    });
  };

  const updateMemberRole = (memberId, newRole) => {
    const hasContractSigner = formData.members.some(m => m.role === 'contract_signer' && m.id !== memberId);
    const hasRoomLeader = formData.members.some(m => m.role === 'room_leader' && m.id !== memberId);
    
    // If there's already a contract_signer, don't allow changing to contract_signer or room_leader
    if (hasContractSigner && (newRole === 'contract_signer' || newRole === 'room_leader')) {
      alert('Đã có người ký hợp đồng trong phòng. Tất cả thành viên khác phải là thành viên thường.');
      return;
    }
    
    // If there's already a room_leader and trying to change to room_leader
    if (hasRoomLeader && newRole === 'room_leader') {
      alert('Mỗi phòng chỉ có thể có 1 trưởng phòng.');
      return;
    }
    
    // If changing to contract_signer, convert existing room_leader to member
    if (newRole === 'contract_signer') {
      setFormData({
        ...formData,
        members: formData.members.map(member => {
          if (member.id === memberId) {
            return { ...member, role: newRole };
          }
          if (member.role === 'room_leader') {
            return { ...member, role: 'member' };
          }
          return member;
        })
      });
      return;
    }
    
    setFormData({
      ...formData,
      members: formData.members.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    });
  };

  const handleDeactivate = (contract) => {
    if (window.confirm('Bạn có chắc chắn muốn thanh lý hợp đồng này? Hợp đồng sẽ chuyển sang trạng thái không hoạt động.')) {
      updateContract(contract.id, { status: 'deactive' });
    }
  };

  // Get available apartments (empty ones)
  const availableApartments = data.apartments.filter(apt => 
    apt.status === 'available' || 
    (editingContract && apt.id === editingContract.apartmentId)
  );

  // Get contract stats
  const contractStats = {
    total: data.contracts.length,
    active: data.contracts.filter(c => c.status === 'active').length,
    expired: data.contracts.filter(c => c.status === 'expired').length,
    deactive: data.contracts.filter(c => c.status === 'deactive').length,
    expiringSoon: data.contracts.filter(c => {
      if (c.status !== 'active') return false;
      const endDate = new Date(c.endDate);
      const now = new Date();
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Quản lý Hợp đồng
            </h1>
            <p className="text-secondary">
              Quản lý tất cả hợp đồng thuê nhà trong hệ thống
            </p>
          </div>
          <button 
            onClick={() => openModal()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo hợp đồng mới</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-primary">{contractStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📄
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đang hiệu lực</p>
              <p className="text-2xl font-bold text-success">{contractStats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Sắp hết hạn</p>
              <p className="text-2xl font-bold text-orange-600">{contractStats.expiringSoon}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đã hết hạn</p>
              <p className="text-2xl font-bold text-danger">{contractStats.expired}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              ❌
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đã thanh lý</p>
              <p className="text-2xl font-bold text-gray-600">{contractStats.deactive}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              🔒
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo số hợp đồng, phòng, khách thuê..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
              <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiệu lực</option>
            <option value="expired">Hết hạn</option>
            <option value="deactive">Đã thanh lý</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="p-6 border-b border-primary">
          <h3 className="text-lg font-semibold text-primary">
            Danh sách hợp đồng ({filteredContracts.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Số hợp đồng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Căn hộ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Khách thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Thời hạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tiền thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-primary">
              {filteredContracts.map((contract) => {
                const apartment = data.apartments.find(apt => apt.id === contract.apartmentId);
                const tenant = data.tenants.find(t => t.id === contract.tenantId);
                
                return (
                  <tr key={contract.id} className="hover-bg-secondary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary">
                        {contract.contractNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        Phòng {apartment?.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        {tenant?.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                      {contract.monthlyRent?.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contract.status === 'active' 
                          ? 'badge-success' 
                          : contract.status === 'deactive'
                            ? 'badge-secondary'
                            : 'badge-danger'
                      }`}>
                        {contract.status === 'active' ? 'Hiệu lực' : 
                         contract.status === 'deactive' ? 'Đã thanh lý' : 'Hết hạn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => setViewingContract(contract)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Xem
                      </button>
                      <button 
                        onClick={() => openModal(contract)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Sửa
                      </button>
                      {contract.status === 'active' && (
                        <button 
                          onClick={() => handleDeactivate(contract)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Thanh lý
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted mb-4">
              <svg className="w-16 h-16 mx-auto text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              {searchTerm ? 'Không tìm thấy hợp đồng' : 'Chưa có hợp đồng nào'}
            </h3>
            <p className="text-secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy tạo hợp đồng đầu tiên cho khách thuê'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Contract Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary">
              <h3 className="text-lg font-semibold text-primary">
                {editingContract ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Số hợp đồng
                  </label>
                  <input
                    type="text"
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({...formData, contractNumber: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Căn hộ
                  </label>
                  <select
                    value={formData.apartmentId}
                    onChange={(e) => setFormData({...formData, apartmentId: parseInt(e.target.value)})}
                    className="input w-full"
                    required
                  >
                    <option value="">Chọn căn hộ</option>
                    {availableApartments.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        Phòng {apt.roomNumber} - {apt.rent?.toLocaleString('vi-VN')} VNĐ
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Khách thuê
                  </label>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => setFormData({...formData, tenantId: parseInt(e.target.value)})}
                    className="input w-full"
                    required
                  >
                    <option value="">Chọn khách thuê</option>
                    {data.tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.fullName} - {tenant.phone}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input w-full"
                  >
                    <option value="active">Hiệu lực</option>
                    <option value="expired">Hết hạn</option>
                    <option value="deactive">Đã thanh lý</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Tiền thuê hàng tháng (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({...formData, monthlyRent: parseInt(e.target.value)})}
                    className="input w-full"
                    required
                  />
                  <div className="mt-1 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                    💡 Giá này sẽ tự động đồng bộ với mục "Quản lý Chi phí"
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Tiền cọc (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => setFormData({...formData, deposit: parseInt(e.target.value)})}
                    className="input w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Điều khoản hợp đồng
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({...formData, terms: e.target.value})}
                  className="input w-full h-24"
                  placeholder="Nhập các điều khoản của hợp đồng..."
                />
              </div>

              {/* Members Management */}
              <div className="border-t border-primary pt-4">
                <h4 className="text-lg font-semibold text-primary mb-4">Thành viên trong phòng</h4>
                
                {/* Add new member form */}
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-primary mb-3">Thêm thành viên mới</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={newMember.fullName}
                      onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                      className="input text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      className="input text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="input text-sm"
                    />
                    <input
                      type="text"
                      placeholder="CCCD/CMND"
                      value={newMember.idNumber}
                      onChange={(e) => setNewMember({...newMember, idNumber: e.target.value})}
                      className="input text-sm"
                    />
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      className="input text-sm"
                    >
                      <option value="member">Thành viên</option>
                      <option value="room_leader">Trưởng phòng</option>
                      <option value="contract_signer">Người ký HĐ</option>
                    </select>
                    <button
                      type="button"
                      onClick={addMember}
                      className="btn btn-primary text-sm"
                      disabled={!newMember.fullName || !newMember.phone}
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Members list */}
                {formData.members && formData.members.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-primary">Danh sách thành viên ({formData.members.length})</h5>
                    {formData.members.map((member, index) => (
                      <div key={member.id || index} className="flex items-center justify-between bg-primary border border-primary rounded-lg p-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <p className="font-medium text-primary">{member.fullName}</p>
                              <p className="text-sm text-secondary">{member.phone} {member.email && `• ${member.email}`}</p>
                              {member.idNumber && (
                                <p className="text-xs text-light">CCCD: {member.idNumber}</p>
                              )}
                            </div>
                            <div className="text-center">
                              <select
                                value={member.role}
                                onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                className="input text-xs px-2 py-1"
                              >
                                <option value="member">Thành viên</option>
                                <option value="room_leader">Trưởng phòng</option>
                                <option value="contract_signer">Người ký HĐ</option>
                              </select>
                              <div className="text-xs text-secondary mt-1">
                                {member.role === 'contract_signer' && '📝 Ký HĐ'}
                                {member.role === 'room_leader' && '👑 Trưởng phòng'}
                                {member.role === 'member' && '👤 Thành viên'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMember(member.id)}
                          className="text-danger hover:text-red-700 ml-3"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.members && formData.members.length === 0 && (
                  <div className="text-center py-6 text-secondary">
                    <p className="text-sm">Chưa có thành viên nào. Hãy thêm thành viên cho hợp đồng này.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-primary">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingContract ? 'Cập nhật' : 'Tạo hợp đồng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {viewingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">
                  Chi tiết hợp đồng
                </h3>
                <button
                  onClick={closeModal}
                  className="text-secondary hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {(() => {
                const apartment = data.apartments.find(apt => apt.id === viewingContract.apartmentId);
                const tenant = data.tenants.find(t => t.id === viewingContract.tenantId);
                
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Thông tin hợp đồng</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Số hợp đồng:</span> {viewingContract.contractNumber}</p>
                          <p><span className="font-medium">Trạng thái:</span> 
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              viewingContract.status === 'active' ? 'badge-success' : 'badge-danger'
                            }`}>
                              {viewingContract.status === 'active' ? 'Hiệu lực' : 'Hết hạn'}
                            </span>
                          </p>
                          <p><span className="font-medium">Ngày tạo:</span> {new Date(viewingContract.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Thời hạn hợp đồng</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Bắt đầu:</span> {new Date(viewingContract.startDate).toLocaleDateString('vi-VN')}</p>
                          <p><span className="font-medium">Kết thúc:</span> {new Date(viewingContract.endDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Thông tin căn hộ</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Phòng:</span> {apartment?.roomNumber}</p>
                          <p><span className="font-medium">Diện tích:</span> {apartment?.area} m²</p>
                          <p><span className="font-medium">Loại phòng:</span> {apartment?.type}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Thông tin khách thuê</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Họ tên:</span> {tenant?.fullName}</p>
                          <p><span className="font-medium">Điện thoại:</span> {tenant?.phone}</p>
                          <p><span className="font-medium">Email:</span> {tenant?.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Chi phí</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">Tiền thuê:</span> {viewingContract.monthlyRent?.toLocaleString('vi-VN')} VNĐ/tháng</p>
                          <p><span className="font-medium">Tiền cọc:</span> {viewingContract.deposit?.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                      </div>
                    </div>
                    
                    {viewingContract.terms && (
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Điều khoản hợp đồng</h4>
                        <div className="bg-secondary rounded-lg p-4">
                          <p className="text-sm whitespace-pre-wrap">{viewingContract.terms}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-primary">
                      <button
                        onClick={() => {
                          setViewingContract(null);
                          openModal(viewingContract);
                        }}
                        className="btn btn-primary"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={closeModal}
                        className="btn btn-secondary"
                      >
                        Đóng
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts; 