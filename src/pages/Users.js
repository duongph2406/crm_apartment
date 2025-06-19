import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';
import Modal from '../components/Modal';

const Users = () => {
  const { data, currentUser, addUser, updateUser, deleteUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (viewingUser) {
          setViewingUser(null);
        } else if (isModalOpen) {
          closeModal();
        }
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, viewingUser]);

  // Get users from AppContext
  const users = data.users || [];

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: '',
    tenantId: ''
  });

  // Filter users based on permission: Admin sees all, Manager only sees users
  const filteredUsers = users.filter(userItem => {
    // Permission check: Manager can only see 'user' role
    if (currentUser?.role === 'manager' && userItem.role !== 'user') {
      return false;
    }
    
    const matchesSearch = 
      userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userItem.email && userItem.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (userItem.phone && userItem.phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || userItem.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openModal = (userToEdit = null) => {
    // Check permission: Manager can only edit users
    if (userToEdit && currentUser?.role === 'manager' && userToEdit.role !== 'user') {
      alert('Bạn không có quyền chỉnh sửa tài khoản này!');
      return;
    }
    
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        username: userToEdit.username,
        fullName: userToEdit.fullName,
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        role: userToEdit.role,
        status: userToEdit.status || 'active',
        password: '',
        confirmPassword: '',
        tenantId: userToEdit.tenantId || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'user', // Default role for new accounts
        status: 'active',
        password: '',
        confirmPassword: '',
        tenantId: ''
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setViewingUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.fullName) {
      alert('Vui lòng nhập đầy đủ tên đăng nhập và họ tên!');
      return;
    }
    
    // Check permission: Manager can only create/edit users
    if (currentUser?.role === 'manager' && formData.role !== 'user') {
      alert('Bạn chỉ có thể tạo/chỉnh sửa tài khoản người dùng (user)!');
      return;
    }
    
    // Validate username uniqueness
    const duplicateUser = users.find(u => 
      u.username.toLowerCase() === formData.username.toLowerCase() && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (duplicateUser) {
      alert(`Tên đăng nhập "${formData.username}" đã tồn tại!`);
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
    
    // Validate phone format if provided
    if (formData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        alert('Số điện thoại phải có đúng 10 chữ số!');
        return;
      }
    }
    
    // Validate password for new user or if password is being changed
    if (!editingUser || formData.password) {
      if (!formData.password) {
        alert('Vui lòng nhập mật khẩu!');
        return;
      }
      if (formData.password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
    }
    
    if (editingUser) {
      // Update user
      const updateData = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        tenantId: formData.tenantId
      };
      
      // Only update password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      updateUser(editingUser.id, updateData);
      alert('Tài khoản đã được cập nhật thành công!');
    } else {
      // Create new user
      const newUser = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        tenantId: formData.tenantId
      };
      
      addUser(newUser);
      alert('Tài khoản mới đã được tạo thành công!');
    }
    
    closeModal();
  };

  const handleDelete = (userToDelete) => {
    if (userToDelete.id === currentUser?.id) {
      alert('Không thể xóa tài khoản của chính mình!');
      return;
    }
    
    // Check permission: Manager can only delete users
    if (currentUser?.role === 'manager' && userToDelete.role !== 'user') {
      alert('Bạn không có quyền xóa tài khoản này!');
      return;
    }
    
    if (currentUser?.role !== 'admin') {
      alert('Chỉ admin mới có quyền xóa tài khoản!');
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userToDelete.username}"?\n\nLưu ý: Hành động này không thể hoàn tác!`)) {
      deleteUser(userToDelete.id);
      alert('Tài khoản đã được xóa thành công!');
    }
  };

  const handleStatusToggle = (userToToggle) => {
    if (userToToggle.id === currentUser?.id) {
      alert('Không thể thay đổi trạng thái tài khoản của chính mình!');
      return;
    }
    
    // Check permission: Manager can only toggle user status
    if (currentUser?.role === 'manager' && userToToggle.role !== 'user') {
      alert('Bạn không có quyền thay đổi trạng thái tài khoản này!');
      return;
    }
    
    const newStatus = userToToggle.status === 'active' ? 'inactive' : 'active';
    updateUser(userToToggle.id, { status: newStatus });
    alert(`Tài khoản đã được ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'}!`);
  };

  // Get user stats
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin').length,
    managers: users.filter(u => u.role === 'manager').length,
    tenants: users.filter(u => u.role === 'user').length
  };

  // Check permissions: Admin can manage all, Manager can only manage users
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
    return (
      <div className="text-center py-12">
        <div className="text-muted mb-4">
          <svg className="w-16 h-16 mx-auto text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-primary mb-2">
          Không có quyền truy cập
        </h3>
        <p className="text-secondary">
          Chỉ quản trị viên và quản lý mới có thể truy cập trang này
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Quản lý tài khoản
            </h1>
            <p className="text-secondary">
              {currentUser?.role === 'admin' 
                ? 'Quản lý tất cả tài khoản người dùng trong hệ thống' 
                : 'Quản lý tài khoản khách thuê (user)'}
            </p>
            {currentUser?.role === 'manager' && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Quyền hạn của bạn:</span> Chỉ có thể tạo, chỉnh sửa và quản lý tài khoản khách thuê
                </p>
              </div>
            )}
          </div>
          <button 
            onClick={() => openModal()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo tài khoản mới</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng tài khoản</p>
              <p className="text-2xl font-bold text-primary">{userStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đang hoạt động</p>
              <p className="text-2xl font-bold text-success">{userStats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Bị khóa</p>
              <p className="text-2xl font-bold text-red-600">{userStats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              🚫
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Quản trị viên</p>
              <p className="text-2xl font-bold text-purple-600">{userStats.admins}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              👑
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Quản lý</p>
              <p className="text-2xl font-bold text-blue-600">{userStats.managers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              👨‍💼
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Khách thuê</p>
              <p className="text-2xl font-bold text-green-600">{userStats.tenants}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              👤
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
                placeholder="Tìm kiếm theo tên, email, điện thoại, tên đăng nhập..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị viên</option>
            <option value="manager">Quản lý</option>
            <option value="user">Khách thuê</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="p-6 border-b border-primary">
          <h3 className="text-lg font-semibold text-primary">
            Danh sách tài khoản ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tài khoản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Đăng nhập cuối
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-primary">
              {filteredUsers.map((userItem) => {
                const tenant = userItem.tenantId ? data.tenants.find(t => t.id === userItem.tenantId) : null;
                
                return (
                  <tr key={userItem.id} className="hover-bg-secondary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                          {userItem.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-primary">
                            {userItem.username}
                          </div>
                          <div className="text-sm text-secondary">
                            ID: {userItem.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary font-medium">
                        {userItem.fullName}
                      </div>
                      <div className="text-sm text-secondary">
                        {userItem.email || 'Chưa có email'}
                      </div>
                      <div className="text-sm text-secondary">
                        📞 {userItem.phone || 'Chưa có SĐT'}
                      </div>
                      {tenant && (
                        <div className="text-xs text-muted">
                          Liên kết: {tenant.fullName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userItem.role === 'admin' ? 'badge-purple' :
                        userItem.role === 'manager' ? 'badge-primary' : 'badge-success'
                      }`}>
                        {userItem.role === 'admin' ? '👑 Quản trị viên' :
                         userItem.role === 'manager' ? '👨‍💼 Quản lý' : '👤 Khách thuê'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userItem.status === 'active' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {userItem.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {userItem.lastLogin 
                        ? formatDate(userItem.lastLogin)
                        : 'Chưa đăng nhập'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => setViewingUser(userItem)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Xem
                      </button>
                      <button 
                        onClick={() => openModal(userItem)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Sửa
                      </button>
                      <button 
                        onClick={() => handleStatusToggle(userItem)}
                        className={`${userItem.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-purple-600 hover:text-purple-800'} ${userItem.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={userItem.id === currentUser?.id}
                      >
                        {userItem.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                      {currentUser?.role === 'admin' && (
                        <button 
                          onClick={() => handleDelete(userItem)}
                          className={`text-red-600 hover:text-red-800 ${userItem.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={userItem.id === currentUser?.id}
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted mb-4">
              <svg className="w-16 h-16 mx-auto text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              {searchTerm ? 'Không tìm thấy tài khoản' : 'Chưa có tài khoản nào'}
            </h3>
            <p className="text-secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy tạo tài khoản đầu tiên'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
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
              className="bg-primary rounded-xl shadow-xl w-[90%] max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="p-6 border-b border-primary flex-shrink-0">
              <h3 className="text-lg font-semibold text-primary">
                {editingUser ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input w-full"
                      placeholder="Nhập số điện thoại (10 chữ số)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="input w-full pr-10"
                        required={!editingUser}
                        minLength="6"
                        placeholder={editingUser ? "Nhập để thay đổi mật khẩu" : "Tối thiểu 6 ký tự"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {(!editingUser || formData.password) && (
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Xác nhận mật khẩu *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="input w-full"
                        required={!editingUser || formData.password}
                        placeholder="Nhập lại mật khẩu"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Vai trò
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="input w-full"
                    >
                      <option value="user">Khách thuê</option>
                      {/* Manager can only create/edit users, Admin can create all roles */}
                      {currentUser?.role === 'admin' && (
                        <>
                          <option value="manager">Quản lý</option>
                          <option value="admin">Quản trị viên</option>
                        </>
                      )}
                    </select>
                    {currentUser?.role === 'manager' && (
                      <p className="text-xs text-secondary mt-1">
                        * Bạn chỉ có thể tạo tài khoản khách thuê
                      </p>
                    )}
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
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Bị khóa</option>
                    </select>
                  </div>
                </div>
                
                {formData.role === 'user' && (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Liên kết với khách thuê (tùy chọn)
                    </label>
                    <select
                      value={formData.tenantId}
                      onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                      className="input w-full"
                    >
                      <option value="">Không liên kết</option>
                      {data.tenants.map(tenant => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.fullName} - {tenant.phone}
                        </option>
                      ))}
                    </select>
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
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingUser(null);
            }
          }}
        >
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="bg-primary rounded-xl shadow-xl w-[90%] max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="p-6 border-b border-primary flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">
                  Chi tiết tài khoản
                </h3>
                <button
                  onClick={() => setViewingUser(null)}
                  className="text-secondary hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {(() => {
                  const tenant = viewingUser.tenantId ? data.tenants.find(t => t.id === viewingUser.tenantId) : null;
                  
                  return (
                    <>
                      {/* User Avatar */}
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                          {viewingUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-primary">{viewingUser.fullName}</h2>
                        <p className="text-secondary">@{viewingUser.username}</p>
                      </div>
                      
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-secondary mb-3">Thông tin cơ bản</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">ID:</span> {viewingUser.id}</p>
                            <p><span className="font-medium">Email:</span> {viewingUser.email || 'Chưa có'}</p>
                            <p><span className="font-medium">Điện thoại:</span> {viewingUser.phone || 'Chưa có'}</p>
                            <p><span className="font-medium">Vai trò:</span> 
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewingUser.role === 'admin' ? 'badge-purple' :
                                viewingUser.role === 'manager' ? 'badge-primary' : 'badge-success'
                              }`}>
                                {viewingUser.role === 'admin' ? 'Quản trị viên' :
                                 viewingUser.role === 'manager' ? 'Quản lý' : 'Khách thuê'}
                              </span>
                            </p>
                            <p><span className="font-medium">Trạng thái:</span> 
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewingUser.status === 'active' ? 'badge-success' : 'badge-danger'
                              }`}>
                                {viewingUser.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-secondary mb-3">Hoạt động</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Ngày tạo:</span> {formatDate(viewingUser.createdAt)}</p>
                            <p><span className="font-medium">Đăng nhập cuối:</span> {
                              viewingUser.lastLogin 
                                ? new Date(viewingUser.lastLogin).toLocaleString('vi-VN')
                                : 'Chưa đăng nhập'
                            }</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tenant Info */}
                      {tenant && (
                        <div>
                          <h4 className="text-sm font-medium text-secondary mb-3">Thông tin khách thuê liên kết</h4>
                          <div className="bg-secondary rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <p><span className="font-medium">Họ tên:</span> {tenant.fullName}</p>
                              <p><span className="font-medium">Điện thoại:</span> {tenant.phone}</p>
                              <p><span className="font-medium">CCCD:</span> {tenant.idNumber}</p>
                              <p><span className="font-medium">Vai trò:</span> 
                                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  tenant.role === 'contract_signer' ? 'badge-purple' :
                                  tenant.role === 'room_leader' ? 'badge-primary' : 'badge-success'
                                }`}>
                                  {tenant.role === 'contract_signer' ? 'Người ký hợp đồng (Không ở trọ)' :
                                   tenant.role === 'room_leader' ? 'Trưởng phòng (Ký HĐ + Ở trọ)' : 'Thành viên (Ở trọ)'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Permissions */}
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Quyền hạn</h4>
                        <div className="bg-secondary rounded-lg p-4">
                          <div className="text-sm">
                            {viewingUser.role === 'admin' ? (
                              <p className="text-purple-600 font-medium">👑 Toàn quyền quản trị hệ thống</p>
                            ) : viewingUser.role === 'manager' ? (
                              <div className="space-y-1">
                                <p className="text-blue-600 font-medium mb-2">👨‍💼 Quyền quản lý:</p>
                                <ul className="list-disc list-inside text-secondary space-y-1">
                                  <li>Quản lý căn hộ</li>
                                  <li>Quản lý khách thuê</li>
                                  <li>Quản lý hợp đồng</li>
                                  <li>Quản lý hóa đơn</li>
                                  <li>Quản lý tài khoản khách thuê</li>
                                </ul>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-green-600 font-medium mb-2">👤 Quyền khách thuê:</p>
                                <ul className="list-disc list-inside text-secondary space-y-1">
                                  <li>Xem hợp đồng của mình</li>
                                  <li>Xem hóa đơn của mình</li>
                                  <li>Xem thông tin tài khoản</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Auto-created account note */}
                      {viewingUser.role === 'user' && tenant && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                              <p className="font-medium mb-1">Lưu ý: Tài khoản tự động</p>
                              {(() => {
                                // Find contract that has this tenant as signer or room leader
                                const contract = data.contracts.find(c => 
                                  c.tenantId === tenant.id && 
                                  (tenant.role === 'contract_signer' || tenant.role === 'room_leader')
                                );
                                if (contract) {
                                  return (
                                    <>
                                      <p>Tài khoản này được tạo tự động khi tạo hợp đồng:</p>
                                      <ul className="list-disc list-inside mt-1 space-y-1">
                                        <li>Mã hợp đồng: <span className="font-medium">{contract.contractNumber}</span></li>
                                        <li>Tên đăng nhập: <span className="font-medium">{viewingUser.username}</span></li>
                                        <li>Mật khẩu mặc định: <span className="font-medium">123@123a</span></li>
                                      </ul>
                                      <p className="mt-2 text-xs">
                                        * Vui lòng thông báo cho khách thuê đổi mật khẩu khi đăng nhập lần đầu
                                      </p>
                                    </>
                                  );
                                } else {
                                  return <p>Tài khoản được liên kết với khách thuê {tenant.role === 'contract_signer' ? 'ký hợp đồng' : 'trưởng phòng'}</p>;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="p-6 border-t border-primary flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setViewingUser(null);
                    openModal(viewingUser);
                  }}
                  className="btn btn-primary"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setViewingUser(null)}
                  className="btn btn-secondary"
                >
                  Đóng
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

export default Users; 