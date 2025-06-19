import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';

const Contracts = () => {
  const { t } = useLanguage();
  const { 
    data, 
    currentUser, 
    addContract, 
    updateContract, 
    deleteContract,
    addTenant,
    updateTenant,
    assignTenantToApartment,
    updateRoomPrice,
    getRoomPrice,
    generateContractNumber
  } = useApp();
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
    idIssueDate: '',
    idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
    hometown: '',
    permanentAddress: ''
    // role is managed in tenants table, not stored here
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
    tenantIdIssueDate: '',
    tenantIdIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
    tenantHometown: '',
    tenantPermanentAddress: '',
    tenantRole: 'room_leader',
    signDate: '', // Ngày ký hợp đồng
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
    terms: '',
    members: [] // Thành viên trong phòng
  });

  // State for member management
  const [newMember, setNewMember] = useState({
    fullName: '',
    phone: '',
    email: '',
    idNumber: '',
    idIssueDate: '',
    idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
    hometown: '',
    permanentAddress: '',
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

      // Only use members from tenants table, ignore contract.members to avoid conflicts
      const combinedMembers = [...existingMembers];

      // Get tenant information
      const tenant = data.tenants.find(t => t.id === contract.tenantId);
      
      setFormData({
        ...contract,
        tenantName: tenant?.fullName || '',
        tenantPhone: tenant?.phone || '',
        tenantEmail: tenant?.email || '',
        tenantIdNumber: tenant?.idNumber || '',
        tenantIdIssueDate: tenant?.idIssueDate || '',
        tenantIdIssuePlace: tenant?.idIssuePlace || '',
        tenantHometown: tenant?.hometown || '',
        tenantPermanentAddress: tenant?.permanentAddress || '',
        tenantRole: tenant?.role || 'room_leader',
        members: combinedMembers
      });
    } else {
      setEditingContract(null);
      setFormData({
        contractNumber: generateContractNumber(), // Tự động tạo số hợp đồng
        apartmentId: '',
        tenantName: '',
        tenantPhone: '',
        tenantEmail: '',
        tenantIdNumber: '',
        tenantIdIssueDate: '',
        tenantIdIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
        tenantHometown: '',
        tenantPermanentAddress: '',
        tenantRole: 'room_leader',
        signDate: new Date().toISOString().split('T')[0], // Mặc định là ngày hôm nay
        startDate: '',
        endDate: '',
        monthlyRent: '',
        deposit: '',
        terms: '',
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
      tenantIdIssueDate: '',
      tenantIdIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
      tenantHometown: '',
      tenantPermanentAddress: '',
      tenantRole: 'room_leader',
      signDate: '',
      startDate: '',
      endDate: '',
      monthlyRent: '',
      deposit: '',
      terms: '',
      members: []
    });
    setNewMember({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      idIssueDate: '',
      idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
      hometown: '',
      permanentAddress: '',
      role: 'member'
    });
    // Reset editing member state
    setEditingMember(null);
    setEditMemberData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      idIssueDate: '',
      idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
      hometown: '',
      permanentAddress: '',
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
    
    // Validation
    if (!formData.contractNumber || !formData.apartmentId || !formData.startDate || 
        !formData.endDate || !formData.monthlyRent || !formData.deposit) {
      alert('Vui lòng điền đầy đủ tất cả các trường bắt buộc!');
      return;
    }
    
    // Check for duplicate contract number
    if (!editingContract) {
      // Validate contract number format (optional - only warn if not following convention)
      const contractNumberPattern = /^HĐ\d{3}\/HĐTCH-\d{4}$/;
      if (!contractNumberPattern.test(formData.contractNumber)) {
        const confirmCustom = window.confirm(
          `Mã hợp đồng "${formData.contractNumber}" không theo định dạng chuẩn (HĐxxx/HĐTCH-YYYY).\n\n` +
          `Bạn có chắc chắn muốn sử dụng mã này không?\n\n` +
          `Nhấn OK để tiếp tục, Cancel để quay lại chỉnh sửa.`
        );
        if (!confirmCustom) {
          return;
        }
      }
      
      const duplicateContract = data.contracts.find(c => c.contractNumber === formData.contractNumber);
      if (duplicateContract) {
        alert(`Số hợp đồng ${formData.contractNumber} đã tồn tại trong hệ thống!`);
        return;
      }
    }
    
    // Validate tenant information
    if (!formData.tenantName || !formData.tenantPhone || !formData.tenantIdNumber || 
        !formData.tenantIdIssueDate || !formData.tenantIdIssuePlace || 
        !formData.tenantHometown || !formData.tenantPermanentAddress) {
      alert('Vui lòng nhập đầy đủ thông tin khách thuê bắt buộc!\n\nCác trường bắt buộc:\n- Họ và tên\n- Số điện thoại\n- Số CCCD\n- Ngày cấp CCCD\n- Nơi cấp CCCD\n- Quê quán\n- Nơi thường trú');
      return;
    }
    
    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.tenantPhone)) {
      alert('Số điện thoại phải có đúng 10 chữ số!');
      return;
    }
    
    // Validate email format if provided
    if (formData.tenantEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.tenantEmail)) {
        alert('Email không đúng định dạng!');
        return;
      }
    }
    
    // Validate ID number (12 digits for CCCD)
    const idRegex = /^[0-9]{12}$/;
    if (!idRegex.test(formData.tenantIdNumber)) {
      alert('Số CCCD phải có đúng 12 chữ số!');
      return;
    }
    
    // Check for duplicate ID number in tenants table
    if (!editingContract) { // Only check when creating new contract
      const duplicateTenant = data.tenants.find(t => t.idNumber === formData.tenantIdNumber);
      if (duplicateTenant) {
        alert(`Số CCCD ${formData.tenantIdNumber} đã tồn tại trong hệ thống!\n\nKhách thuê: ${duplicateTenant.fullName}\nSố điện thoại: ${duplicateTenant.phone}`);
        return;
      }
    }
    
    // Validate members
    if (formData.members && formData.members.length > 0) {
      for (const member of formData.members) {
        if (!member.fullName || !member.phone || !member.idNumber || 
            !member.idIssueDate || !member.idIssuePlace || 
            !member.hometown || !member.permanentAddress) {
          alert(`Thành viên ${member.fullName || 'chưa có tên'} thiếu thông tin bắt buộc!\n\nCác trường bắt buộc:\n- Họ và tên\n- Số điện thoại\n- Số CCCD\n- Ngày cấp CCCD\n- Nơi cấp CCCD\n- Quê quán\n- Nơi thường trú`);
          return;
        }
        
        // Validate member phone
        if (!phoneRegex.test(member.phone)) {
          alert(`Số điện thoại của ${member.fullName} phải có đúng 10 chữ số!`);
          return;
        }
        
        // Validate member email if provided
        if (member.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(member.email)) {
            alert(`Email của ${member.fullName} không đúng định dạng!`);
            return;
          }
        }
        
        // Validate member ID if provided
        if (member.idNumber) {
          const idRegex = /^[0-9]{12}$/;
          if (!idRegex.test(member.idNumber)) {
            alert(`Số CCCD của ${member.fullName} phải có đúng 12 chữ số!`);
            return;
          }
          
          // Check for duplicate ID within current members list
          const duplicateMember = formData.members.find(m => 
            m.id !== member.id && m.idNumber === member.idNumber
          );
          if (duplicateMember) {
            alert(`Số CCCD ${member.idNumber} đã được sử dụng cho thành viên ${duplicateMember.fullName} trong danh sách!`);
            return;
          }
          
          // Check for duplicate ID with tenant signing the contract
          if (member.idNumber === formData.tenantIdNumber) {
            alert(`Số CCCD ${member.idNumber} đã được sử dụng cho người ký hợp đồng!`);
            return;
          }
          
          // Check for duplicate ID in existing tenants (only for new members)
          if (!member.isExistingTenant) {
            const existingTenant = data.tenants.find(t => t.idNumber === member.idNumber);
            if (existingTenant) {
              alert(`Số CCCD ${member.idNumber} đã tồn tại trong hệ thống!\n\nKhách thuê: ${existingTenant.fullName}\nSố điện thoại: ${existingTenant.phone}\n\nNếu muốn thêm khách thuê này vào phòng, vui lòng sử dụng chức năng "Import có sẵn"`);
              return;
            }
          }
        }
      }
    }
    
    if (editingContract) {
      // When editing contract, ONLY update members, nothing else
      
      // Only update contract members list (without roles - roles are managed in tenants table)
      const membersWithoutRoles = formData.members.map(({ role, ...memberWithoutRole }) => memberWithoutRole);
      updateContract(editingContract.id, { members: membersWithoutRoles });
      
      // Update existing members in tenants if needed
      if (formData.members && formData.members.length > 0) {
        formData.members.forEach(member => {
          if (member.isExistingTenant) {
            // Update existing tenant and ensure they are assigned to the apartment
            updateTenant(member.id, { 
              role: member.role,
              apartmentId: formData.apartmentId,
              status: 'active'
            });
            // Also update assignment to apartment
            assignTenantToApartment(member.id, formData.apartmentId, member.role);
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
        idIssueDate: formData.tenantIdIssueDate || '',
        idIssuePlace: formData.tenantIdIssuePlace || '',
        hometown: formData.tenantHometown || '',
        permanentAddress: formData.tenantPermanentAddress || '',
        role: formData.tenantRole,
        status: 'active',
        apartmentId: formData.apartmentId
      });
      
      // Properly assign tenant to apartment with role
      assignTenantToApartment(newTenant.id, formData.apartmentId, formData.tenantRole);

      // If tenant role is room_leader, add to members list
      if (formData.tenantRole === 'room_leader') {
      const tenantMember = {
        id: newTenant.id,
        fullName: formData.tenantName,
        phone: formData.tenantPhone,
        email: formData.tenantEmail || '',
        idNumber: formData.tenantIdNumber || '',
          role: 'room_leader',
        isExistingTenant: true
      };

        // Add tenant as first member if room_leader
      const updatedMembers = [tenantMember, ...(formData.members || [])];
      formData.members = updatedMembers;
      }
      // If contract_signer, don't add to members list (they don't live in the apartment)

      const newContract = {
        id: Date.now(),
        ...formData,
        tenantId: newTenant.id,
        createdAt: new Date().toISOString(),
        signDate: formData.signDate || new Date().toISOString().split('T')[0] // Mặc định là ngày tạo nếu không có
      };
      
      // Set room price when creating new contract
      if (formData.apartmentId && formData.monthlyRent) {
        updateRoomPrice(formData.apartmentId, formData.monthlyRent);
      }
      
      addContract(newContract);
      
      // Add all members to tenants and assign to apartment
      if (formData.members && formData.members.length > 0) {
        formData.members.forEach(member => {
          // Skip the main tenant who signs the contract - they were already processed above
          if (member.id === newTenant.id) {
            return;
          }
          
          if (!member.isExistingTenant) {
            // All new members added through the form will have role 'member'
            const newMemberTenant = addTenant({
              ...member,
              role: 'member', // Force role to 'member' for all added members
              status: 'active',
              apartmentId: formData.apartmentId
            });
            // Assign to apartment with member role
            assignTenantToApartment(newMemberTenant.id, formData.apartmentId, 'member');
          } else {
            // For existing tenants, ensure they are assigned to the apartment with active status
            updateTenant(member.id, {
              apartmentId: formData.apartmentId,
              role: member.role || 'member', // Keep their existing role
              status: 'active'
            });
            // Also ensure they are properly assigned to the apartment
            assignTenantToApartment(member.id, formData.apartmentId, member.role || 'member');
          }
        });
      }
    }
    
    closeModal();
  };

  // Member management functions
  const addMember = () => {
    // Validate required fields
    if (!newMember.fullName || !newMember.phone || !newMember.idNumber || 
        !newMember.idIssueDate || !newMember.idIssuePlace || 
        !newMember.hometown || !newMember.permanentAddress) {
      alert('Vui lòng điền đầy đủ tất cả các trường bắt buộc cho thành viên!\n\nCác trường bắt buộc:\n- Họ và tên\n- Số điện thoại\n- Số CCCD\n- Ngày cấp CCCD\n- Nơi cấp CCCD\n- Quê quán\n- Nơi thường trú');
      return;
    }
    
    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newMember.phone)) {
      alert('Số điện thoại phải có đúng 10 chữ số!');
      return;
    }
    
    // Validate email if provided
    if (newMember.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newMember.email)) {
        alert('Email không đúng định dạng!');
        return;
      }
    }
    
    // Validate ID number (12 digits for CCCD)
    const idRegex = /^[0-9]{12}$/;
    if (!idRegex.test(newMember.idNumber)) {
      alert('Số CCCD phải có đúng 12 chữ số!');
      return;
    }
    
    // Check for duplicate ID with tenant signing the contract
    if (newMember.idNumber === formData.tenantIdNumber) {
      alert(`Số CCCD ${newMember.idNumber} đã được sử dụng cho người ký hợp đồng!`);
      return;
    }
    
    // Check for duplicate ID within current members list
    const duplicateMember = formData.members?.find(m => m.idNumber === newMember.idNumber);
    if (duplicateMember) {
      alert(`Số CCCD ${newMember.idNumber} đã được sử dụng cho thành viên ${duplicateMember.fullName} trong danh sách!`);
      return;
    }
    
    // Check for duplicate ID in existing tenants
    const existingTenant = data.tenants.find(t => t.idNumber === newMember.idNumber);
    if (existingTenant) {
      alert(`Số CCCD ${newMember.idNumber} đã tồn tại trong hệ thống!\n\nKhách thuê: ${existingTenant.fullName}\nSố điện thoại: ${existingTenant.phone}\n\nNếu muốn thêm khách thuê này vào phòng, vui lòng sử dụng chức năng "Import có sẵn"`);
      return;
    }
      
      // All new members will have role 'member'
      const newMemberData = {
        id: Date.now(),
        ...newMember,
        role: 'member', // Force role to member
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
        idIssueDate: '',
        idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
        hometown: '',
        permanentAddress: '',
        role: 'member'
      });
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

  // Role management is now handled in tenants table only
  // Removed updateMemberRole function

  // Function to start editing a member
  const startEditMember = (member) => {
    setEditingMember(member.id);
    setEditMemberData({
      fullName: member.fullName,
      phone: member.phone,
      email: member.email || '',
      idNumber: member.idNumber || '',
      idIssueDate: member.idIssueDate || '',
      idIssuePlace: member.idIssuePlace || '',
      hometown: member.hometown || '',
      permanentAddress: member.permanentAddress || ''
      // role is managed in tenants table, not stored here
    });
  };

  // Function to save member changes
  const saveMemberChanges = () => {
    // Only validate editable fields
    if (!editMemberData.phone) {
      alert('Vui lòng nhập số điện thoại!');
      return;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(editMemberData.phone)) {
      alert('Số điện thoại phải có đúng 10 chữ số!');
      return;
    }
    
    // Validate email if provided
    if (editMemberData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editMemberData.email)) {
        alert('Email không đúng định dạng!');
      return;
    }
    }
    
    // Skip ID validation since it's not editable

    // Update member in formData (only phone and email, not role)
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === editingMember 
          ? { ...member, phone: editMemberData.phone, email: editMemberData.email }
          : member
      )
    }));

    // If this is an existing tenant (has isExistingTenant flag), also update in tenants table
    const member = formData.members.find(m => m.id === editingMember);
    if (member && member.isExistingTenant) {
      // Only update phone and email
      updateTenant(editingMember, {
        phone: editMemberData.phone,
        email: editMemberData.email
      });
    }

    // Reset editing state
    setEditingMember(null);
    setEditMemberData({
      fullName: '',
      phone: '',
      email: '',
      idNumber: '',
      idIssueDate: '',
      idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
      hometown: '',
      permanentAddress: '',
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
      idIssueDate: '',
      idIssuePlace: 'Cục Cảnh sát Quản lý Hành chính về Trật tự Xã hội',
      hometown: '',
      permanentAddress: '',
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

  // Get available apartments based on selected date range
  const getAvailableApartments = () => {
    // If editing, always show the current apartment
    if (editingContract) {
      return data.apartments.filter(apt => apt.id === editingContract.apartmentId);
    }
    
    // If no dates selected, show all available apartments
    if (!formData.startDate || !formData.endDate) {
      return data.apartments.filter(apt => apt.status === 'available');
    }
    
    // Check for date conflicts with existing contracts
    return data.apartments.filter(apt => {
      // Skip if apartment is in maintenance
      if (apt.status === 'maintenance') return false;
      
      // Check if apartment has any conflicting contracts in the selected period
      const hasConflict = data.contracts.some(contract => {
        if (contract.apartmentId !== apt.id) return false;
        if (contract.status === 'inactive') return false; // Skip terminated contracts
        
        // Check date overlap
        const contractStart = new Date(contract.startDate);
        const contractEnd = new Date(contract.endDate);
        const newStart = new Date(formData.startDate);
        const newEnd = new Date(formData.endDate);
        
        // Check if dates overlap
        return !(newEnd < contractStart || newStart > contractEnd);
      });
      
      return !hasConflict;
    });
  };
  
  const availableApartments = getAvailableApartments();

  // Get contract stats
  const contractStats = {
    total: data.contracts.length,
    pending: data.contracts.filter(c => c.status === 'pending').length,
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
                      viewingContract.status === 'active' 
                        ? 'badge-success' 
                        : viewingContract.status === 'pending'
                          ? 'badge-warning'
                          : viewingContract.status === 'inactive'
                            ? 'badge-secondary'
                            : 'badge-danger'
                    }`}>
                      {viewingContract.status === 'active' ? 'Hiệu lực' : 
                       viewingContract.status === 'pending' ? 'Chưa có hiệu lực' :
                       viewingContract.status === 'inactive' ? 'Đã thanh lý' : 'Hết hạn'}
                    </span>
                  </p>
                  <p><span className="font-medium">Ngày tạo:</span> {formatDate(viewingContract.createdAt)}</p>
                  {viewingContract.signDate && <p><span className="font-medium">Ngày ký:</span> {formatDate(viewingContract.signDate)}</p>}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-primary rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-primary">{contractStats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
              📄
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Chưa hiệu lực</p>
              <p className="text-2xl font-bold text-yellow-600">{contractStats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-sm">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đang hiệu lực</p>
              <p className="text-2xl font-bold text-success">{contractStats.active}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-sm">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Sắp hết hạn</p>
              <p className="text-2xl font-bold text-orange-600">{contractStats.expiringSoon}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-sm">
              ⏰
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đã hết hạn</p>
              <p className="text-2xl font-bold text-danger">{contractStats.expired}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-sm">
              ❌
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đã thanh lý</p>
              <p className="text-2xl font-bold text-gray-600">{contractStats.inactive}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
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
            <option value="pending">Chưa có hiệu lực</option>
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
                          : contract.status === 'pending'
                            ? 'badge-warning'
                            : contract.status === 'inactive'
                            ? 'badge-secondary'
                            : 'badge-danger'
                      }`}>
                        {contract.status === 'active' ? 'Hiệu lực' : 
                         contract.status === 'pending' ? 'Chưa có hiệu lực' :
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
                        <li>Tất cả thông tin hợp đồng đã ký KHÔNG THỂ thay đổi</li>
                        <li>CHỈ có thể thêm/xóa thành viên trong phòng</li>
                        <li>Danh sách thành viên sẽ tự động đồng bộ với mục Quản lý khách thuê</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {/* Date selection notice */}
              {!editingContract && (!formData.startDate || !formData.endDate) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">💡</span>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Vui lòng chọn thời gian hợp đồng trước</p>
                      <p>Hệ thống sẽ tự động kiểm tra và hiển thị danh sách phòng trống trong khoảng thời gian bạn chọn.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contract dates first */}
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Ngày ký hợp đồng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.signDate}
                    onChange={(e) => setFormData({...formData, signDate: e.target.value})}
                    className="input w-full"
                    required
                    disabled={editingContract ? true : false}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Ngày bắt đầu <span className="text-danger">*</span>
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
                    Ngày kết thúc <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input w-full"
                    required
                    min={formData.startDate || undefined}
                    disabled={editingContract ? true : false}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Số hợp đồng <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.contractNumber}
                      onChange={(e) => setFormData({...formData, contractNumber: e.target.value})}
                      className={`input w-full ${editingContract ? 'bg-gray-50' : 'pr-10'}`}
                      required
                      disabled={editingContract ? true : false}
                      placeholder="Ví dụ: HĐ001/HĐTCH-2025"
                    />
                    {!editingContract && (
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, contractNumber: generateContractNumber()})}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                        title="Tạo số tự động"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {!editingContract && (
                    <p className="text-xs text-secondary mt-1">
                      💡 Hệ thống tự động tạo số theo định dạng HĐxxx/HĐTCH-YYYY, bạn có thể thay đổi nếu muốn
                    </p>
                  )}
                  {editingContract && (
                    <p className="text-xs text-danger mt-1">
                      ⚠️ Không thể thay đổi số hợp đồng sau khi tạo
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Căn hộ <span className="text-danger">*</span> {!editingContract && formData.startDate && formData.endDate && availableApartments.length > 0 && (
                      <span className="text-xs text-success ml-2">
                        ({availableApartments.length} phòng trống)
                      </span>
                    )}
                  </label>
                  {!editingContract && (!formData.startDate || !formData.endDate) ? (
                    <div className="input w-full bg-gray-50 text-gray-500 cursor-not-allowed flex items-center">
                      <span className="text-sm">Vui lòng chọn ngày bắt đầu và kết thúc trước</span>
                    </div>
                  ) : (
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
                  )}
                  {!editingContract && formData.startDate && formData.endDate && availableApartments.length === 0 && (
                    <p className="text-xs text-danger mt-1">
                      Không có phòng trống trong khoảng thời gian này
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Khách thuê <span className="text-danger">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Họ và tên *"
                        value={formData.tenantName || ''}
                        onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                        className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        required
                        disabled={editingContract ? true : false}
                        title={editingContract ? "Không thể thay đổi họ tên trong hợp đồng đã ký" : ""}
                      />
                      <input
                        type="text"
                        placeholder="Số điện thoại (10 số) *"
                        value={formData.tenantPhone || ''}
                        onChange={(e) => setFormData({...formData, tenantPhone: e.target.value})}
                        className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        required
                        maxLength="10"
                        disabled={editingContract ? true : false}
                        title={editingContract ? "Không thể thay đổi số điện thoại trong hợp đồng đã ký" : ""}
                      />
                    </div>
                    
                    <input
                      type="email"
                      placeholder="Email (không bắt buộc)"
                      value={formData.tenantEmail || ''}
                      onChange={(e) => setFormData({...formData, tenantEmail: e.target.value})}
                      className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      disabled={editingContract ? true : false}
                      title={editingContract ? "Không thể thay đổi email trong hợp đồng đã ký" : ""}
                    />
                    
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-secondary mb-2">Thông tin CCCD</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Số CCCD (12 số) *"
                          value={formData.tenantIdNumber || ''}
                          onChange={(e) => setFormData({...formData, tenantIdNumber: e.target.value})}
                          className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          maxLength="12"
                          required
                          disabled={editingContract ? true : false}
                          title={editingContract ? "Không thể thay đổi số CCCD trong hợp đồng đã ký" : ""}
                        />
                        <input
                          type="date"
                          placeholder="Ngày cấp *"
                          value={formData.tenantIdIssueDate || ''}
                          onChange={(e) => setFormData({...formData, tenantIdIssueDate: e.target.value})}
                          className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          required
                          disabled={editingContract ? true : false}
                          title={editingContract ? "Không thể thay đổi ngày cấp CCCD trong hợp đồng đã ký" : ""}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Nơi cấp *"
                        value={formData.tenantIdIssuePlace || ''}
                        onChange={(e) => setFormData({...formData, tenantIdIssuePlace: e.target.value})}
                        className={`input w-full mt-3 ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        required
                        disabled={editingContract ? true : false}
                        title={editingContract ? "Không thể thay đổi nơi cấp CCCD trong hợp đồng đã ký" : ""}
                      />
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-secondary mb-2">Địa chỉ</p>
                      <input
                        type="text"
                        placeholder="Quê quán *"
                        value={formData.tenantHometown || ''}
                        onChange={(e) => setFormData({...formData, tenantHometown: e.target.value})}
                        className={`input w-full mb-3 ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        required
                        disabled={editingContract ? true : false}
                        title={editingContract ? "Không thể thay đổi quê quán trong hợp đồng đã ký" : ""}
                      />
                      <textarea
                        placeholder="Nơi thường trú *"
                        value={formData.tenantPermanentAddress || ''}
                        onChange={(e) => setFormData({...formData, tenantPermanentAddress: e.target.value})}
                        className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        rows="2"
                        required
                        disabled={editingContract ? true : false}
                        title={editingContract ? "Không thể thay đổi nơi thường trú trong hợp đồng đã ký" : ""}
                      />
                    </div>
                    
                    <select
                      value={formData.tenantRole || 'room_leader'}
                      onChange={(e) => setFormData({...formData, tenantRole: e.target.value})}
                      className={`input w-full ${editingContract ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      required
                      disabled={editingContract ? true : false}
                      title={editingContract ? "Không thể thay đổi vai trò trong hợp đồng đã ký" : ""}
                    >
                      <option value="room_leader">Trưởng phòng (Ký HĐ + Ở trọ)</option>
                      <option value="contract_signer">Người ký HĐ (Không ở trọ)</option>
                    </select>
                  </div>
                </div>
                
                
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Tiền thuê hàng tháng (VNĐ) <span className="text-danger">*</span>
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
                    Tiền cọc (VNĐ) <span className="text-danger">*</span>
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
                              !formData.members?.some(m => m.id === tenant.id) // Check by id, not tenantId
                            )
                            .map(tenant => (
                              <div key={tenant.id} className="bg-primary border border-primary rounded p-3 hover:bg-secondary cursor-pointer"
                                onClick={() => {
                                  const newMemberData = {
                                    id: tenant.id, // Use tenant.id as member id for existing tenants
                                    tenantId: tenant.id,
                                    fullName: tenant.fullName,
                                    phone: tenant.phone,
                                    email: tenant.email || '',
                                    idNumber: tenant.idNumber || '',
                                    idIssueDate: tenant.idIssueDate || '',
                                    idIssuePlace: tenant.idIssuePlace || '',
                                    hometown: tenant.hometown || '',
                                    permanentAddress: tenant.permanentAddress || '',
                                    role: tenant.role || 'member', // Keep existing role
                                    isExistingTenant: true
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
                            !formData.members?.some(m => m.id === tenant.id)
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
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Họ và tên *"
                        value={newMember.fullName}
                        onChange={(e) => setNewMember({...newMember, fullName: e.target.value})}
                        className="input text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Số điện thoại (10 số) *"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                        className="input text-sm"
                        maxLength="10"
                      />
                    </div>
                    
                    <input
                      type="email"
                      placeholder="Email (không bắt buộc)"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="input text-sm"
                    />
                    
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-secondary mb-2">Thông tin CCCD</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Số CCCD (12 số) *"
                          value={newMember.idNumber}
                          onChange={(e) => setNewMember({...newMember, idNumber: e.target.value})}
                          className="input text-sm"
                          maxLength="12"
                        />
                        <input
                          type="date"
                          placeholder="Ngày cấp *"
                          value={newMember.idIssueDate}
                          onChange={(e) => setNewMember({...newMember, idIssueDate: e.target.value})}
                          className="input text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Nơi cấp *"
                        value={newMember.idIssuePlace}
                        onChange={(e) => setNewMember({...newMember, idIssuePlace: e.target.value})}
                        className="input text-sm mt-3"
                      />
                    </div>
                    
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-secondary mb-2">Địa chỉ</p>
                      <input
                        type="text"
                        placeholder="Quê quán *"
                        value={newMember.hometown}
                        onChange={(e) => setNewMember({...newMember, hometown: e.target.value})}
                        className="input text-sm mb-3"
                      />
                      <textarea
                        placeholder="Nơi thường trú *"
                        value={newMember.permanentAddress}
                        onChange={(e) => setNewMember({...newMember, permanentAddress: e.target.value})}
                        className="input text-sm"
                        rows="2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="input text-sm bg-gray-50 cursor-not-allowed">
                        Vai trò: Thành viên
                      </div>
                      <button
                        type="button"
                        onClick={addMember}
                        className="btn btn-primary text-sm"
                      >
                        Thêm thành viên
                      </button>
                    </div>
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
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                              <p className="text-xs text-yellow-700">
                                ⚠️ Chỉ có thể sửa: Số điện thoại và Email
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Họ và tên *</label>
                                <input
                                  type="text"
                                  value={editMemberData.fullName}
                                  className="input text-sm bg-gray-50 cursor-not-allowed"
                                  placeholder="Nhập họ và tên (bắt buộc)"
                                  disabled={true}
                                  title="Không thể thay đổi họ tên"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Số điện thoại *</label>
                                <input
                                  type="text"
                                  value={editMemberData.phone}
                                  onChange={(e) => setEditMemberData({...editMemberData, phone: e.target.value})}
                                  className="input text-sm"
                                  placeholder="10 số (bắt buộc)"
                                  maxLength="10"
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
                                <label className="block text-xs font-medium text-secondary mb-1">CCCD</label>
                                <input
                                  type="text"
                                  value={editMemberData.idNumber}
                                  className="input text-sm bg-gray-50 cursor-not-allowed"
                                  placeholder="12 số"
                                  maxLength="12"
                                  disabled={true}
                                  title="Không thể thay đổi số CCCD"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-secondary mb-1">Vai trò</label>
                              <div className="input text-sm bg-gray-50 cursor-not-allowed" title="Không thể thay đổi vai trò">
                                {(() => {
                                  // Get role from tenants table for consistency
                                  const tenant = data.tenants.find(t => t.id === editingMember);
                                  const role = tenant?.role || 'member';
                                  return (
                                    <>
                                      {role === 'contract_signer' && 'Người ký HĐ (Không ở trọ)'}
                                      {role === 'room_leader' && 'Trưởng phòng (Ký HĐ + Ở trọ)'}
                                      {role === 'member' && 'Thành viên (Ở trọ)'}
                                    </>
                                  );
                                })()}
                              </div>
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
                                  <div className="text-xs px-2 py-1">
                                    {(() => {
                                      // Get role from tenants table for consistency
                                      const tenant = data.tenants.find(t => t.id === member.id);
                                      const role = tenant?.role || 'member';
                                      return (
                                        <>
                                          {role === 'contract_signer' && '📝 Ký HĐ (Không ở trọ)'}
                                          {role === 'room_leader' && '👑 Trưởng phòng (Ký HĐ + Ở trọ)'}
                                          {role === 'member' && '👤 Thành viên (Ở trọ)'}
                                        </>
                                      );
                                    })()}
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