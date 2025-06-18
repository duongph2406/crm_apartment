import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';

const Contracts = () => {
  const { t } = useLanguage();
  const { data, currentUser, updateContract, addContract, deleteContract, addTenant, updateTenant, assignTenantToApartment, updateRoomPrice, getRoomPrice } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingContract, setViewingContract] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editMemberData, setEditMemberData] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    role: 'member'
  });
  
  // State for renewal modal
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [renewingContract, setRenewingContract] = useState(null);
  const [renewalFormData, setRenewalFormData] = useState({
    endDate: '',
    monthlyRent: ''
  });
  
  // State for import tenant
  const [showImportTenant, setShowImportTenant] = useState(false);
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (viewingContract) {
          setViewingContract(null);
        } else if (isModalOpen) {
          closeModal();
        } else if (isRenewalModalOpen) {
          closeRenewalModal();
        }
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, viewingContract, isRenewalModalOpen]);

  const [formData, setFormData] = useState({
    contractNumber: '',
    apartmentId: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    tenantIdNumber: '',
    tenantRole: 'room_leader',
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
      
      // Get existing members from tenants table for this apartment
      const existingMembers = data.tenants
        .filter(tenant => tenant.apartmentId === contract.apartmentId && tenant.status === 'active')
        .map(tenant => ({
          id: tenant.id,
          fullName: tenant.fullName,
          phone: tenant.phone,
          email: tenant.email || '',
          idNumber: tenant.idNumber || '',
          role: tenant.role || 'member',
          isExistingTenant: true // Flag to identify existing tenants
        }));

      // Also include any members that might be in the contract but not in tenants table
      const contractMembers = contract.members || [];
      const combinedMembers = [...existingMembers];
      
      // Add contract members that are not already in existingMembers
      contractMembers.forEach(contractMember => {
        if (!existingMembers.find(em => em.id === contractMember.id)) {
          combinedMembers.push({
            ...contractMember,
            isExistingTenant: false
          });
        }
      });

      // Get tenant information
      const tenant = data.tenants.find(t => t.id === contract.tenantId);
      
      setFormData({
        ...contract,
        tenantName: tenant?.fullName || '',
        tenantPhone: tenant?.phone || '',
        tenantEmail: tenant?.email || '',
        tenantIdNumber: tenant?.idNumber || '',
        tenantRole: tenant?.role || 'room_leader',
        members: combinedMembers
      });
    } else {
      setEditingContract(null);
      setFormData({
        contractNumber: `HD${Date.now()}`,
        apartmentId: '',
        tenantName: '',
        tenantPhone: '',
        tenantEmail: '',
        tenantIdNumber: '',
        tenantRole: 'room_leader',
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
      tenantName: '',
      tenantPhone: '',
      tenantEmail: '',
      tenantIdNumber: '',
      tenantRole: 'room_leader',
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
    // Reset editing member state
    setEditingMember(null);
    setEditMemberData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      role: 'member'
    });
    // Reset import tenant state
    setShowImportTenant(false);
    setTenantSearchTerm('');
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (editingContract) {
      // Check if monthlyRent has changed
      if (editingContract.monthlyRent !== formData.monthlyRent && formData.apartmentId && formData.monthlyRent) {
        // Update room price in cost management
        updateRoomPrice(formData.apartmentId, formData.monthlyRent);
      }
      
      // Create or update tenant
      const tenantData = {
        fullName: formData.tenantName,
        phone: formData.tenantPhone,
        email: formData.tenantEmail || '',
        idNumber: formData.tenantIdNumber || '',
        role: formData.tenantRole,
        status: 'active'
      };

      if (editingContract.tenantId) {
        updateTenant(editingContract.tenantId, tenantData);
      } else {
        const newTenant = addTenant(tenantData);
        formData.tenantId = newTenant.id;
      }
      
      // Add tenant to members list if not already present
      const tenantMember = {
        id: editingContract.tenantId || formData.tenantId,
        fullName: formData.tenantName,
        phone: formData.tenantPhone,
        email: formData.tenantEmail || '',
        idNumber: formData.tenantIdNumber || '',
        role: formData.tenantRole,
        isExistingTenant: true
      };

      const updatedMembers = formData.members.filter(m => m.id !== tenantMember.id);
      updatedMembers.unshift(tenantMember); // Add tenant at the beginning of the list
      formData.members = updatedMembers;
      
      updateContract(editingContract.id, formData);
      
      // Update existing members in tenants if needed
      if (formData.members && formData.members.length > 0) {
        formData.members.forEach(member => {
          if (member.isExistingTenant) {
            // Update existing tenant role if changed
            const existingTenant = data.tenants.find(t => t.id === member.id);
            if (existingTenant && existingTenant.role !== member.role) {
              updateTenant(member.id, { role: member.role });
            }
          } else {
            // Add new member to tenants and assign to apartment
            const newTenant = addTenant({
              ...member,
              status: 'active',
              apartmentId: formData.apartmentId
            });
            // Assign to apartment with role
            assignTenantToApartment(newTenant.id, formData.apartmentId, member.role);
          }
        });
      }
    } else {
      // Create new tenant
      const newTenant = addTenant({
        fullName: formData.tenantName,
        phone: formData.tenantPhone,
        email: formData.tenantEmail || '',
        idNumber: formData.tenantIdNumber || '',
        role: formData.tenantRole,
        status: 'active'
      });

      // Add tenant to members list
      const tenantMember = {
        id: newTenant.id,
        fullName: formData.tenantName,
        phone: formData.tenantPhone,
        email: formData.tenantEmail || '',
        idNumber: formData.tenantIdNumber || '',
        role: formData.tenantRole,
        isExistingTenant: true
      };

      const updatedMembers = [tenantMember, ...(formData.members || [])];
      formData.members = updatedMembers;

      const newContract = {
        id: Date.now(),
        ...formData,
        tenantId: newTenant.id,
        createdAt: new Date().toISOString()
      };
      
      // Set room price when creating new contract
      if (formData.apartmentId && formData.monthlyRent) {
        updateRoomPrice(formData.apartmentId, formData.monthlyRent);
      }
      
      addContract(newContract);
      
      // Add all members to tenants and assign to apartment
      if (formData.members && formData.members.length > 0) {
        formData.members.forEach(member => {
          if (!member.isExistingTenant) {
            const newTenant = addTenant({
              ...member,
              status: 'active',
              apartmentId: formData.apartmentId
            });
            // Assign to apartment with role
            assignTenantToApartment(newTenant.id, formData.apartmentId, member.role);
          }
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
      
      // New members can only be regular members
      const memberRole = 'member';
      
      // Add the new member
      const newMemberData = {
        id: Date.now(),
        ...newMember,
        role: memberRole,
        isExistingTenant: false
      };
      
      setFormData({
        ...formData,
        members: [...formData.members, newMemberData]
      });
      
      // Reset new member form
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
    const memberToRemove = formData.members.find(m => m.id === memberId);
    
    if (memberToRemove && memberToRemove.isExistingTenant) {
      // For existing tenants, we should deactivate them or remove them from apartment
      if (window.confirm(`Bạn có chắc chắn muốn xóa ${memberToRemove.fullName} khỏi phòng?\n\nThành viên này sẽ:\n- Được chuyển về trạng thái "Không hoạt động"\n- Không còn thuộc phòng nào\n- Có thể được kích hoạt lại từ mục Quản lý khách thuê`)) {
          updateTenant(memberId, { status: 'inactive', apartmentId: null, role: 'member' });
          setFormData({
            ...formData,
            members: formData.members.filter(member => member.id !== memberId)
          });
        }
      } else {
        // For new members that haven't been saved yet, just remove from the list
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${memberToRemove.fullName} khỏi danh sách thành viên?`)) {
          setFormData({
            ...formData,
            members: formData.members.filter(member => member.id !== memberId)
          });
        }
      }
    };

  const updateMemberRole = (memberId, newRole) => {
    const hasContractSigner = formData.members.some(m => m.role === 'contract_signer' && m.id !== memberId);
    const hasRoomLeader = formData.members.some(m => m.role === 'room_leader' && m.id !== memberId);
    
    // If trying to change to contract_signer when there's already a room_leader
    if (hasRoomLeader && newRole === 'contract_signer') {
      alert('Phòng đã có trưởng phòng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.');
      return;
    }
    
    // If trying to change to room_leader when there's already a contract_signer  
    if (hasContractSigner && newRole === 'room_leader') {
      alert('Phòng đã có người ký hợp đồng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.');
      return;
    }
    
    // If there's already a contract_signer and trying to change to contract_signer
    if (hasContractSigner && newRole === 'contract_signer') {
      alert('Mỗi phòng chỉ có thể có 1 người ký hợp đồng.');
      return;
    }
    
    // If there's already a room_leader and trying to change to room_leader
    if (hasRoomLeader && newRole === 'room_leader') {
      alert('Mỗi phòng chỉ có thể có 1 trưởng phòng.');
      return;
    }
    
    // If there's already a contract_signer, don't allow changing to other roles except member
    if (hasContractSigner && newRole !== 'member' && newRole !== 'contract_signer') {
      alert('Đã có người ký hợp đồng trong phòng. Tất cả thành viên khác phải là thành viên thường.');
      return;
    }
    
    setFormData({
      ...formData,
      members: formData.members.map(member =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    });
  };

  // Function to start editing a member
  const startEditMember = (member) => {
    setEditingMember(member.id);
    setEditMemberData({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email || '',
      idNumber: member.idNumber || '',
      role: member.role
    });
  };

  // Function to save member changes
  const saveMemberChanges = () => {
    if (!editMemberData.fullName || !editMemberData.phone) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại!');
      return;
    }

    // Validate role change (same logic as updateMemberRole)
    const hasContractSigner = formData.members.some(m => m.role === 'contract_signer' && m.id !== editingMember);
    const hasRoomLeader = formData.members.some(m => m.role === 'room_leader' && m.id !== editingMember);
    
    if (hasRoomLeader && editMemberData.role === 'contract_signer') {
      alert('Phòng đã có trưởng phòng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.');
      return;
    }
    
    if (hasContractSigner && editMemberData.role === 'room_leader') {
      alert('Phòng đã có người ký hợp đồng. Một phòng chỉ có thể có người ký hợp đồng HOẶC trưởng phòng, không thể có cả hai.');
      return;
    }
    
    if (hasContractSigner && editMemberData.role === 'contract_signer') {
      alert('Mỗi phòng chỉ có thể có 1 người ký hợp đồng.');
      return;
    }
    
    if (hasRoomLeader && editMemberData.role === 'room_leader') {
      alert('Mỗi phòng chỉ có thể có 1 trưởng phòng.');
      return;
    }

    if (hasContractSigner && editMemberData.role !== 'member' && editMemberData.role !== 'contract_signer') {
      alert('Đã có người ký hợp đồng trong phòng. Tất cả thành viên khác phải là thành viên thường.');
      return;
    }

    // Update member in formData
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === editingMember 
          ? { ...member, ...editMemberData }
          : member
      )
    }));

    // If this is an existing tenant (has isExistingTenant flag), also update in tenants table
    const member = formData.members.find(m => m.id === editingMember);
    if (member && member.isExistingTenant) {
      updateTenant(editingMember, {
        ...editMemberData,
        apartmentId: formData.apartmentId,
        status: 'active'
      });
      // Also update role assignment
      assignTenantToApartment(editingMember, formData.apartmentId, editMemberData.role);
    }

    // Reset editing state
    setEditingMember(null);
    setEditMemberData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      role: 'member'
    });
  };

  // Function to cancel editing
  const cancelEditMember = () => {
    setEditingMember(null);
    setEditMemberData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      role: 'member'
    });
  };

  const handleDeactivate = (contract) => {
    if (window.confirm('Bạn có chắc chắn muốn thanh lý hợp đồng này? Hợp đồng sẽ chuyển sang trạng thái không hoạt động.')) {
      updateContract(contract.id, { status: 'inactive' });
    }
  };

  const handleDeleteContract = (contract) => {
    if (currentUser?.role !== 'admin') {
      alert('Chỉ admin mới có quyền xóa hợp đồng.');
      return;
    }
    
    if (window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN hợp đồng này? Hành động này không thể hoàn tác.')) {
      deleteContract(contract.id);
    }
  };

  // Get available apartments (empty ones)
  const availableApartments = data.apartments.filter(apt => {
    // Check if the apartment has any active contracts
    const hasActiveContract = data.contracts.some(contract => 
      contract.apartmentId === apt.id && contract.status === 'active'
    );
    
    // Show apartment if:
    // 1. It's being edited (for existing contracts)
    // 2. It's available and has no active contracts (for new contracts)
    return (editingContract && apt.id === editingContract.apartmentId) || 
           (!hasActiveContract && apt.status === 'available');
  });

  // Get contract stats
  const contractStats = {
    total: data.contracts.length,
    active: data.contracts.filter(c => c.status === 'active').length,
    expired: data.contracts.filter(c => c.status === 'expired').length,
    inactive: data.contracts.filter(c => c.status === 'inactive').length,
    expiringSoon: data.contracts.filter(c => {
      if (c.status !== 'active') return false;
      const endDate = new Date(c.endDate);
      const now = new Date();
      const diffTime = endDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length
  };

  // Update the view modal to show tenant information without room assignment
  const renderViewModal = () => {
    if (!viewingContract) return null;
    
    const apartment = data.apartments.find(apt => apt.id === viewingContract.apartmentId);
    const tenant = data.tenants.find(t => t.id === viewingContract.tenantId);
    // Get all active tenants in this apartment
    const apartmentMembers = data.tenants.filter(t => 
      t.apartmentId === viewingContract.apartmentId && t.status === 'active'
    );
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setViewingContract(null);
          }
        }}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <div 
            className="bg-primary rounded-xl shadow-xl w-[90%] max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="p-6 border-b border-primary flex-shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-primary">
                Chi tiết hợp đồng
              </h3>
              <button
                onClick={() => setViewingContract(null)}
                className="text-secondary hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <p><span className="font-medium">Ngày tạo:</span> {formatDate(viewingContract.createdAt)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary mb-3">Thời hạn hợp đồng</h4>
                <div className="space-y-2">
                                <p><span className="font-medium">Bắt đầu:</span> {formatDate(viewingContract.startDate)}</p>
              <p><span className="font-medium">Kết thúc:</span> {formatDate(viewingContract.endDate)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-secondary mb-3">Thông tin căn hộ</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Phòng:</span> {apartment?.roomNumber}</p>
                  <p><span className="font-medium">Tiền thuê:</span> {viewingContract.monthlyRent?.toLocaleString('vi-VN')} VNĐ</p>
                  <p><span className="font-medium">Tiền cọc:</span> {viewingContract.deposit?.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-secondary mb-3">Thông tin người thuê</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Họ tên:</span> {tenant?.fullName}</p>
                  <p><span className="font-medium">SĐT:</span> {tenant?.phone}</p>
                  {tenant?.email && <p><span className="font-medium">Email:</span> {tenant?.email}</p>}
                  {tenant?.idNumber && <p><span className="font-medium">CCCD/CMND:</span> {tenant?.idNumber}</p>}
                  <p><span className="font-medium">Vai trò:</span> {
                    tenant?.role === 'room_leader' ? 'Trưởng phòng (Ký HĐ + Ở trọ)' :
                    tenant?.role === 'contract_signer' ? 'Người ký HĐ (Không ở trọ)' : 'Thành viên'
                  }</p>
                </div>
              </div>
            </div>

            {/* Members Section */}
            <div>
              <h4 className="text-sm font-medium text-secondary mb-3">Thành viên trong phòng</h4>
              <div className="space-y-3">
                {apartmentMembers.length > 0 ? (
                  apartmentMembers.map((member) => (
                    <div key={member.id} className="bg-primary border border-primary rounded-lg p-3">
                      <div className="flex items-center justify-between">
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
                              <div className="text-xs text-secondary">
                                {member.role === 'contract_signer' && '📝 Ký HĐ (Không ở trọ)'}
                                {member.role === 'room_leader' && '👑 Trưởng phòng (Ký HĐ + Ở trọ)'}
                                {member.role === 'member' && '👤 Thành viên (Ở trọ)'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary">
                    <p className="text-sm">Chưa có thành viên nào trong phòng.</p>
                  </div>
                )}
              </div>
            </div>

            {viewingContract.terms && (
              <div>
                <h4 className="text-sm font-medium text-secondary mb-3">Điều khoản hợp đồng</h4>
                <div className="bg-primary border border-primary rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{viewingContract.terms}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  };

  const handleApartmentChange = (apartmentId) => {
    if (!apartmentId) {
      setFormData({
        ...formData,
        apartmentId: '',
        monthlyRent: '',
        deposit: ''
      });
      return;
    }

    // Get room price from cost management or apartment default
    const roomPrice = getRoomPrice(apartmentId);
    
    setFormData({
      ...formData,
      apartmentId: apartmentId,
      monthlyRent: roomPrice.toString(),
      deposit: roomPrice.toString() // Tiền cọc = 1 tháng tiền phòng
    });
  };

  // Function to open renewal modal
  const openRenewalModal = (contract) => {
    setRenewingContract(contract);
    setRenewalFormData({
      endDate: contract.endDate,
      monthlyRent: contract.monthlyRent
    });
    setIsRenewalModalOpen(true);
  };

  // Function to close renewal modal
  const closeRenewalModal = () => {
    setIsRenewalModalOpen(false);
    setRenewingContract(null);
    setRenewalFormData({
      endDate: '',
      monthlyRent: ''
    });
  };

  // Function to handle contract renewal
  const handleRenewal = () => {
    if (!renewalFormData.endDate || !renewalFormData.monthlyRent) {
      alert('Vui lòng nhập đầy đủ ngày kết thúc mới và giá thuê!');
      return;
    }

    // Check if new end date is after current end date
    if (new Date(renewalFormData.endDate) <= new Date(renewingContract.endDate)) {
      alert('Ngày kết thúc mới phải sau ngày kết thúc hiện tại!');
      return;
    }

    // Update contract
    updateContract(renewingContract.id, {
      endDate: renewalFormData.endDate,
      monthlyRent: parseInt(renewalFormData.monthlyRent),
      status: 'active' // Ensure status is active after renewal
    });

    // Update room price if changed
    if (renewingContract.monthlyRent !== parseInt(renewalFormData.monthlyRent)) {
      updateRoomPrice(renewingContract.apartmentId, parseInt(renewalFormData.monthlyRent));
    }

    closeRenewalModal();
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
              <p className="text-2xl font-bold text-gray-600">{contractStats.inactive}</p>
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
            <option value="inactive">Đã thanh lý</option>
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
                  Thành viên
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
                const apartmentMembers = data.tenants.filter(t => 
                  t.apartmentId === contract.apartmentId && t.status === 'active'
                );
                
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        {apartmentMembers.length > 0 ? (
                          <div className="space-y-1">
                            {apartmentMembers.slice(0, 2).map((member) => (
                              <div key={member.id} className="flex items-center space-x-1">
                                <span className="text-xs">
                                  {member.role === 'contract_signer' ? '📝' : 
                                   member.role === 'room_leader' ? '👑' : '👤'}
                                </span>
                                <span className="text-xs">{member.fullName}</span>
                              </div>
                            ))}
                            {apartmentMembers.length > 2 && (
                              <div className="text-xs text-secondary">
                                +{apartmentMembers.length - 2} người khác
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-secondary">Chưa có thành viên</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
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
                         contract.status === 'inactive' ? 'Đã thanh lý' : 'Hết hạn'}
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
                        <>
                          <button 
                            onClick={() => openRenewalModal(contract)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Gia hạn
                          </button>
                          <button 
                            onClick={() => handleDeactivate(contract)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Thanh lý
                          </button>
                        </>
                      )}
                      {currentUser?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteContract(contract)}
                          className="text-red-800 hover:text-red-900 font-semibold"
                        >
                          Xóa
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-primary rounded-xl shadow-xl w-[90%] max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="p-6 border-b border-primary flex-shrink-0">
              <h3 className="text-lg font-semibold text-primary">
                {editingContract ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {editingContract && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Lưu ý khi sửa hợp đồng:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Chỉ có thể thêm/xóa thành viên trong phòng</li>
                        <li>Không thể thay đổi vai trò của thành viên (đã được quy định trong hợp đồng)</li>
                        <li>Các thông tin khác của hợp đồng không được phép thay đổi</li>
                        <li>Danh sách thành viên sẽ tự động đồng bộ với mục Quản lý khách thuê</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
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
                    disabled={editingContract ? true : false}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Căn hộ
                  </label>
                  <select
                    value={formData.apartmentId}
                    onChange={(e) => handleApartmentChange(e.target.value)}
                    className="input w-full"
                    required
                    disabled={editingContract ? true : false}
                  >
                    <option value="">Chọn căn hộ</option>
                    {availableApartments.map(apt => {
                      const roomPrice = getRoomPrice(apt.id);
                      return (
                        <option key={apt.id} value={apt.id}>
                          Phòng {apt.roomNumber} - {roomPrice?.toLocaleString('vi-VN')} VNĐ
                        </option>
                      );
                    })}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Khách thuê
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={formData.tenantName || ''}
                      onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                      className="input w-full"
                      required
                      disabled={editingContract ? true : false}
                    />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={formData.tenantPhone || ''}
                      onChange={(e) => setFormData({...formData, tenantPhone: e.target.value})}
                      className="input w-full"
                      required
                      disabled={editingContract ? true : false}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.tenantEmail || ''}
                      onChange={(e) => setFormData({...formData, tenantEmail: e.target.value})}
                      className="input w-full"
                      disabled={editingContract ? true : false}
                    />
                    <input
                      type="text"
                      placeholder="CCCD/CMND"
                      value={formData.tenantIdNumber || ''}
                      onChange={(e) => setFormData({...formData, tenantIdNumber: e.target.value})}
                      className="input w-full"
                      disabled={editingContract ? true : false}
                    />
                    <select
                      value={formData.tenantRole || 'room_leader'}
                      onChange={(e) => setFormData({...formData, tenantRole: e.target.value})}
                      className="input w-full"
                      required
                      disabled={editingContract ? true : false}
                    >
                      <option value="room_leader">Trưởng phòng (Ký HĐ + Ở trọ)</option>
                      <option value="contract_signer">Người ký HĐ (Không ở trọ)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input w-full"
                    disabled={editingContract ? true : false}
                  >
                    <option value="active">Hiệu lực</option>
                    <option value="expired">Hết hạn</option>
                    <option value="inactive">Đã thanh lý</option>
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
                    disabled={editingContract ? true : false}
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
                    disabled={editingContract ? true : false}
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
                    disabled={editingContract ? true : false}
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
                    disabled={editingContract ? true : false}
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
                  disabled={editingContract ? true : false}
                />
              </div>

              {/* Members Management */}
              <div className="border-t border-primary pt-4">
                <h4 className="text-lg font-semibold text-primary mb-4">Thành viên trong phòng</h4>
                
                {/* Add new member form */}
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-primary">Thêm thành viên</h5>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowImportTenant(!showImportTenant)}
                        className="btn btn-secondary text-sm px-3 py-1"
                      >
                        {showImportTenant ? '➕ Thêm mới' : '📥 Import có sẵn'}
                      </button>
                    </div>
                  </div>
                  
                  {showImportTenant ? (
                    // Import existing tenant
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm khách hàng theo tên, số điện thoại..."
                          value={tenantSearchTerm}
                          onChange={(e) => setTenantSearchTerm(e.target.value)}
                          className="input text-sm w-full pr-10"
                        />
                        <svg className="w-5 h-5 text-muted absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      {tenantSearchTerm && (
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {data.tenants
                            .filter(tenant => 
                              tenant.fullName.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
                              tenant.phone.includes(tenantSearchTerm)
                            )
                            .filter(tenant => 
                              !formData.members?.some(m => m.tenantId === tenant.id)
                            )
                            .map(tenant => (
                              <div key={tenant.id} className="bg-primary border border-primary rounded p-3 hover:bg-secondary cursor-pointer"
                                onClick={() => {
                                  const newMemberData = {
                                    id: Date.now(),
                                    tenantId: tenant.id,
                                    fullName: tenant.fullName,
                                    phone: tenant.phone,
                                    email: tenant.email || '',
                                    idNumber: tenant.idNumber || '',
                                    role: 'member'
                                  };
                                  setFormData({
                                    ...formData,
                                    members: [...(formData.members || []), newMemberData]
                                  });
                                  setTenantSearchTerm('');
                                }}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-primary">{tenant.fullName}</p>
                                    <p className="text-sm text-secondary">{tenant.phone} {tenant.email && `• ${tenant.email}`}</p>
                                  </div>
                                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm">
                                    Chọn
                                  </button>
                                </div>
                              </div>
                            ))}
                          {data.tenants.filter(tenant => 
                            (tenant.fullName.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
                            tenant.phone.includes(tenantSearchTerm)) &&
                            !formData.members?.some(m => m.tenantId === tenant.id)
                          ).length === 0 && (
                            <p className="text-center text-secondary text-sm py-3">
                              Không tìm thấy khách hàng phù hợp
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Add new member form
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
                        disabled={editingContract ? true : false}
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
                  )}
                </div>

                {/* Members list */}
                {formData.members && formData.members.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-primary">Danh sách thành viên ({formData.members.length})</h5>
                    {formData.members.map((member, index) => (
                      <div key={member.id || index} className="bg-primary border border-primary rounded-lg p-3">
                        {editingMember === member.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Họ và tên *</label>
                                <input
                                  type="text"
                                  value={editMemberData.fullName}
                                  onChange={(e) => setEditMemberData({...editMemberData, fullName: e.target.value})}
                                  className="input text-sm"
                                  placeholder="Nhập họ và tên"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Số điện thoại *</label>
                                <input
                                  type="text"
                                  value={editMemberData.phone}
                                  onChange={(e) => setEditMemberData({...editMemberData, phone: e.target.value})}
                                  className="input text-sm"
                                  placeholder="0901234567"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Email</label>
                                <input
                                  type="email"
                                  value={editMemberData.email}
                                  onChange={(e) => setEditMemberData({...editMemberData, email: e.target.value})}
                                  className="input text-sm"
                                  placeholder="email@example.com"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-secondary mb-1">CCCD/CMND</label>
                                <input
                                  type="text"
                                  value={editMemberData.idNumber}
                                  onChange={(e) => setEditMemberData({...editMemberData, idNumber: e.target.value})}
                                  className="input text-sm"
                                  placeholder="123456789"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-secondary mb-1">Vai trò</label>
                              <select
                                value={editMemberData.role}
                                onChange={(e) => setEditMemberData({...editMemberData, role: e.target.value})}
                                className="input text-sm"
                                disabled={editingContract ? true : false}
                              >
                                <option value="member">Thành viên</option>
                                <option value="room_leader">Trưởng phòng</option>
                                <option value="contract_signer">Người ký HĐ</option>
                              </select>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={saveMemberChanges}
                                className="btn btn-primary text-xs px-3 py-1"
                              >
                                💾 Lưu
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditMember}
                                className="btn btn-secondary text-xs px-3 py-1"
                              >
                                ❌ Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center justify-between">
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
                                    disabled={editingContract ? true : false}
                                  >
                                    <option value="member">Thành viên</option>
                                    <option value="room_leader">Trưởng phòng</option>
                                    <option value="contract_signer">Người ký HĐ</option>
                                  </select>
                                  <div className="text-xs text-secondary mt-1">
                                    {member.role === 'contract_signer' && '📝 Ký HĐ (Không ở trọ)'}
                                    {member.role === 'room_leader' && '👑 Trưởng phòng (Ký HĐ + Ở trọ)'}
                                    {member.role === 'member' && '👤 Thành viên (Ở trọ)'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-3">
                              <button
                                type="button"
                                onClick={() => startEditMember(member)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Sửa thông tin"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMember(member.id)}
                                className="text-danger hover:text-red-700"
                                title="Xóa thành viên"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
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
            </form>
            
            <div className="p-6 border-t border-primary flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  {editingContract ? 'Cập nhật' : 'Tạo hợp đồng'}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {viewingContract && renderViewModal()}

      {/* Renewal Contract Modal */}
      {isRenewalModalOpen && renewingContract && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeRenewalModal();
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-primary rounded-xl shadow-xl w-[90%] max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-primary flex-shrink-0">
                <h3 className="text-lg font-semibold text-primary">
                  Gia hạn hợp đồng
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {/* Contract Info */}
                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-primary mb-3">Thông tin hợp đồng</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-secondary">Số hợp đồng:</span>
                      <span className="text-primary font-medium ml-2">{renewingContract.contractNumber}</span>
                    </div>
                    <div>
                      <span className="text-secondary">Phòng:</span>
                      <span className="text-primary font-medium ml-2">
                        {data.apartments.find(apt => apt.id === renewingContract.apartmentId)?.roomNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">Khách thuê:</span>
                      <span className="text-primary font-medium ml-2">
                        {data.tenants.find(t => t.id === renewingContract.tenantId)?.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">Ngày hết hạn hiện tại:</span>
                      <span className="text-primary font-medium ml-2">
                        {formatDate(renewingContract.endDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-secondary">Giá thuê hiện tại:</span>
                      <span className="text-primary font-medium ml-2">
                        {renewingContract.monthlyRent?.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Renewal Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Ngày kết thúc mới <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      value={renewalFormData.endDate}
                      onChange={(e) => setRenewalFormData({...renewalFormData, endDate: e.target.value})}
                      min={new Date(new Date(renewingContract.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="input w-full"
                      required
                    />
                    <p className="text-xs text-secondary mt-1">
                      Ngày kết thúc mới phải sau ngày {formatDate(renewingContract.endDate)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Giá thuê hàng tháng mới (VNĐ) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      value={renewalFormData.monthlyRent}
                      onChange={(e) => setRenewalFormData({...renewalFormData, monthlyRent: e.target.value})}
                      className="input w-full"
                      placeholder="Nhập giá thuê mới"
                      required
                    />
                    {renewalFormData.monthlyRent && parseInt(renewalFormData.monthlyRent) !== renewingContract.monthlyRent && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600">💡</span>
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">Thay đổi giá thuê:</p>
                            <p>Từ {renewingContract.monthlyRent?.toLocaleString('vi-VN')} VNĐ → {parseInt(renewalFormData.monthlyRent).toLocaleString('vi-VN')} VNĐ</p>
                            <p className="mt-1">Giá mới sẽ được cập nhật trong mục "Quản lý Chi phí"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {renewalFormData.endDate && renewalFormData.monthlyRent && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-800 mb-2">Tóm tắt gia hạn:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Hợp đồng sẽ được gia hạn đến: <strong>{formatDate(renewalFormData.endDate)}</strong></li>
                        <li>• Thời gian gia hạn: <strong>{Math.ceil((new Date(renewalFormData.endDate) - new Date(renewingContract.endDate)) / (1000 * 60 * 60 * 24))} ngày</strong></li>
                        <li>• Giá thuê mới: <strong>{parseInt(renewalFormData.monthlyRent).toLocaleString('vi-VN')} VNĐ/tháng</strong></li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-primary flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeRenewalModal}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleRenewal}
                    className="btn btn-primary"
                    disabled={!renewalFormData.endDate || !renewalFormData.monthlyRent}
                  >
                    Xác nhận gia hạn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts; 