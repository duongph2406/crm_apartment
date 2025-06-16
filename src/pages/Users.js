import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const Users = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Mock users data - in real app this would come from backend
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      name: 'Administrator',
      email: 'admin@crm.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00',
      createdAt: '2024-01-01T00:00:00',
      permissions: ['all']
    },
    {
      id: 2,
      username: 'manager',
      name: 'Manager',
      email: 'manager@crm.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00',
      createdAt: '2024-01-02T00:00:00',
      permissions: ['apartments', 'tenants', 'contracts', 'invoices']
    },
    {
      id: 3,
      username: 'user',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      role: 'user',
      status: 'active',
      lastLogin: '2024-01-14T20:45:00',
      createdAt: '2024-01-10T00:00:00',
      tenantId: 1,
      permissions: ['my-contracts', 'my-invoices']
    }
  ]);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'user',
    status: 'active',
    password: '',
    tenantId: ''
  });

  // Filter users based on permission: Admin sees all, Manager only sees users
  const filteredUsers = users.filter(userItem => {
    // Permission check: Manager can only see 'user' role
    if (user.role === 'manager' && userItem.role !== 'user') {
      return false;
    }
    
    const matchesSearch = 
      userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || userItem.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const openModal = (userToEdit = null) => {
    // Check permission: Manager can only edit users
    if (userToEdit && user.role === 'manager' && userToEdit.role !== 'user') {
      alert('Bạn không có quyền chỉnh sửa tài khoản này!');
      return;
    }
    
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        username: userToEdit.username,
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
        password: '',
        tenantId: userToEdit.tenantId || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        name: '',
        email: '',
        role: 'user', // Default role for new accounts
        status: 'active',
        password: '',
        tenantId: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setViewingUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check permission: Manager can only create/edit users
    if (user.role === 'manager' && formData.role !== 'user') {
      alert('Bạn chỉ có thể tạo/chỉnh sửa tài khoản người dùng (user)!');
      return;
    }
    
    if (editingUser) {
      // Update user
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, password: formData.password || u.password }
          : u
      );
      setUsers(updatedUsers);
      alert('Tài khoản đã được cập nhật thành công!');
    } else {
      // Create new user
      const newUser = {
        id: Date.now(),
        ...formData,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        permissions: getDefaultPermissions(formData.role)
      };
      setUsers([...users, newUser]);
      alert('Tài khoản mới đã được tạo thành công!');
    }
    
    closeModal();
  };

  const handleDelete = (userToDelete) => {
    if (userToDelete.id === user.id) {
      alert('Không thể xóa tài khoản của chính mình!');
      return;
    }
    
    // Check permission: Manager can only delete users
    if (user.role === 'manager' && userToDelete.role !== 'user') {
      alert('Bạn không có quyền xóa tài khoản này!');
      return;
    }
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userToDelete.username}"?`)) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      alert('Tài khoản đã được xóa thành công!');
    }
  };

  const handleStatusToggle = (userToToggle) => {
    if (userToToggle.id === user.id) {
      alert('Không thể thay đổi trạng thái tài khoản của chính mình!');
      return;
    }
    
    // Check permission: Manager can only toggle user status
    if (user.role === 'manager' && userToToggle.role !== 'user') {
      alert('Bạn không có quyền thay đổi trạng thái tài khoản này!');
      return;
    }
    
    const newStatus = userToToggle.status === 'active' ? 'inactive' : 'active';
    const updatedUsers = users.map(u => 
      u.id === userToToggle.id 
        ? { ...u, status: newStatus }
        : u
    );
    setUsers(updatedUsers);
    alert(`Tài khoản đã được ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'}!`);
  };

  const getDefaultPermissions = (role) => {
    switch (role) {
      case 'admin':
        return ['all'];
      case 'manager':
        return ['apartments', 'tenants', 'contracts', 'invoices'];
      case 'user':
        return ['my-contracts', 'my-invoices'];
      default:
        return [];
    }
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
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
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
              {user.role === 'admin' 
                ? 'Quản lý tất cả tài khoản người dùng trong hệ thống' 
                : 'Quản lý tài khoản khách thuê (user)'}
            </p>
            {user.role === 'manager' && (
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
                placeholder="Tìm kiếm theo tên, email, tên đăng nhập..."
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
                          {userItem.name.charAt(0).toUpperCase()}
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
                        {userItem.name}
                      </div>
                      <div className="text-sm text-secondary">
                        {userItem.email}
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
                        ? new Date(userItem.lastLogin).toLocaleDateString('vi-VN')
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
                        className={userItem.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-purple-600 hover:text-purple-800'}
                        disabled={userItem.id === user.id}
                      >
                        {userItem.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                      <button 
                        onClick={() => handleDelete(userItem)}
                        className="text-red-600 hover:text-red-800"
                        disabled={userItem.id === user.id}
                      >
                        Xóa
                      </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary">
              <h3 className="text-lg font-semibold text-primary">
                {editingUser ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    {editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input w-full"
                    required={!editingUser}
                    minLength="6"
                  />
                </div>
                
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
                    {user.role === 'admin' && (
                      <>
                        <option value="manager">Quản lý</option>
                        <option value="admin">Quản trị viên</option>
                      </>
                    )}
                  </select>
                  {user.role === 'manager' && (
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
                  {editingUser ? 'Cập nhật' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-primary">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">
                  Chi tiết tài khoản
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
                const tenant = viewingUser.tenantId ? data.tenants.find(t => t.id === viewingUser.tenantId) : null;
                
                return (
                  <>
                    {/* User Avatar */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                        {viewingUser.name.charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-xl font-bold text-primary">{viewingUser.name}</h2>
                      <p className="text-secondary">@{viewingUser.username}</p>
                    </div>
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Thông tin cơ bản</h4>
                        <div className="space-y-2">
                          <p><span className="font-medium">ID:</span> {viewingUser.id}</p>
                          <p><span className="font-medium">Email:</span> {viewingUser.email}</p>
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
                          <p><span className="font-medium">Ngày tạo:</span> {new Date(viewingUser.createdAt).toLocaleDateString('vi-VN')}</p>
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
                                {tenant.role === 'contract_signer' ? 'Người ký hợp đồng' :
                                 tenant.role === 'room_leader' ? 'Trưởng phòng' : 'Thành viên'}
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
                        <div className="flex flex-wrap gap-2">
                          {viewingUser.permissions.map((permission, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {permission === 'all' ? 'Toàn quyền' :
                               permission === 'apartments' ? 'Quản lý căn hộ' :
                               permission === 'tenants' ? 'Quản lý khách thuê' :
                               permission === 'contracts' ? 'Quản lý hợp đồng' :
                               permission === 'invoices' ? 'Quản lý hóa đơn' :
                               permission === 'my-contracts' ? 'Hợp đồng của tôi' :
                               permission === 'my-invoices' ? 'Hóa đơn của tôi' :
                               permission}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-primary">
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

export default Users; 