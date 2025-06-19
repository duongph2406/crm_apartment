import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Account = () => {
  const { theme, changeTheme } = useTheme();
  const { data, updateUser, currentUser, logout } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    invoiceReminders: true,
    contractReminders: true,
    maintenanceAlerts: true
  });
  const { language, changeLanguage } = useLanguage();

  // Update profileData when currentUser changes
  useEffect(() => {
    setProfileData({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || ''
    });
  }, [currentUser]);

  const handleProfileSave = () => {
    // Validation
    if (!profileData.fullName) {
      alert('Vui lòng nhập họ tên!');
      return;
    }
    
    if (profileData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        alert('Email không đúng định dạng!');
        return;
      }
    }
    
    if (profileData.phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(profileData.phone)) {
        alert('Số điện thoại phải có đúng 10 chữ số!');
        return;
      }
    }
    
    // Update user data in AppContext
    updateUser(currentUser.id, profileData);
    
    setIsEditing(false);
    alert('Thông tin đã được cập nhật thành công!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      alert('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    
    // Verify current password
    const currentUserData = data.users.find(u => u.id === currentUser.id);
    if (currentUserData.password !== passwordData.currentPassword) {
      alert('Mật khẩu hiện tại không đúng!');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    
    // Update password
    updateUser(currentUser.id, { password: passwordData.newPassword });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Mật khẩu đã được thay đổi thành công!');
  };

  const handleNotificationSave = () => {
    // In a real app, this would save notification preferences
    console.log('Saving notifications:', notifications);
    alert('Cài đặt thông báo đã được lưu!');
  };

  // Get user-specific data
  const getUserData = () => {
    if (currentUser?.role === 'user' && currentUser?.tenantId) {
      const tenant = data.tenants.find(t => t.id === currentUser.tenantId);
      const apartment = tenant ? data.apartments.find(apt => apt.id === tenant.apartmentId) : null;
      const contracts = data.contracts.filter(c => c.tenantId === currentUser.tenantId);
      const invoices = data.invoices.filter(i => i.tenantId === currentUser.tenantId);
      
      return { tenant, apartment, contracts, invoices };
    }
    return { tenant: null, apartment: null, contracts: [], invoices: [] };
  };

  const { tenant, apartment, contracts, invoices } = getUserData();

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
    { id: 'security', label: 'Bảo mật', icon: '🔒' },
    { id: 'notifications', label: 'Thông báo', icon: '🔔' },
    { id: 'preferences', label: 'Cài đặt', icon: '⚙️' },
    ...(currentUser?.role === 'user' ? [{ id: 'tenant-info', label: 'Thông tin thuê', icon: '🏠' }] : [])
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">
              Tài khoản của tôi
            </h1>
            <p className="text-secondary">
              Quản lý thông tin cá nhân và cài đặt tài khoản
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                currentUser?.role === 'admin' ? 'badge-purple' :
                currentUser?.role === 'manager' ? 'badge-primary' : 'badge-success'
              }`}>
                {currentUser?.role === 'admin' ? '👑 Quản trị viên' :
                 currentUser?.role === 'manager' ? '👨‍💼 Quản lý' : '👤 Khách thuê'}
              </span>
              <span className="text-sm text-secondary">
                Đăng nhập: {currentUser?.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="border-b border-primary">
          <nav className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all hover:bg-secondary ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-primary bg-secondary'
                    : 'text-secondary'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">Thông tin cá nhân</h3>
                <button
                  onClick={() => {
                    if (isEditing) {
                      // Reset form data when canceling
                      setProfileData({
                        fullName: currentUser?.fullName || '',
                        email: currentUser?.email || '',
                        phone: currentUser?.phone || '',
                        address: currentUser?.address || ''
                      });
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="btn btn-primary"
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      className="input w-full"
                      required
                    />
                  ) : (
                    <p className="text-primary font-medium">{currentUser?.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-primary font-medium">{currentUser?.email || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="input w-full"
                      placeholder="Nhập số điện thoại"
                    />
                  ) : (
                    <p className="text-primary font-medium">{currentUser?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Vai trò
                  </label>
                  <p className="text-primary font-medium">
                    {currentUser?.role === 'admin' ? 'Quản trị viên' :
                     currentUser?.role === 'manager' ? 'Quản lý' : 'Khách thuê'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="input w-full h-20"
                      placeholder="Nhập địa chỉ"
                    />
                  ) : (
                    <p className="text-primary font-medium">{currentUser?.address || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-primary">
                  <button
                    onClick={() => {
                      // Reset form data when canceling
                      setProfileData({
                        fullName: currentUser?.fullName || '',
                        email: currentUser?.email || '',
                        phone: currentUser?.phone || '',
                        address: currentUser?.address || ''
                      });
                      setIsEditing(false);
                    }}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleProfileSave}
                    className="btn btn-primary"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary">Đổi mật khẩu</h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Mật khẩu hiện tại *
                  </label>
                  <div className="relative max-w-md">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="input w-full pr-10"
                      required
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

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Mật khẩu mới *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="input w-full max-w-md"
                    minLength="6"
                    required
                  />
                  <p className="text-xs text-secondary mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="input w-full max-w-md"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Đổi mật khẩu
                </button>
              </form>

              <div className="pt-6 border-t border-primary">
                <h4 className="text-md font-semibold text-primary mb-4">Phiên đăng nhập</h4>
                <div className="bg-secondary rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-primary">Phiên hiện tại</p>
                      <p className="text-sm text-secondary">Trình duyệt web - {formatDate(new Date())}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="btn btn-danger"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary">Cài đặt thông báo</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h4 className="font-medium text-primary">Thông báo qua email</h4>
                    <p className="text-sm text-secondary">Nhận thông báo về hoạt động tài khoản qua email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({...notifications, emailNotifications: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h4 className="font-medium text-primary">Thông báo qua SMS</h4>
                    <p className="text-sm text-secondary">Nhận thông báo khẩn cấp qua tin nhắn</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.smsNotifications}
                      onChange={(e) => setNotifications({...notifications, smsNotifications: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h4 className="font-medium text-primary">Nhắc nhở hóa đơn</h4>
                    <p className="text-sm text-secondary">Nhận thông báo về hóa đơn sắp đến hạn</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.invoiceReminders}
                      onChange={(e) => setNotifications({...notifications, invoiceReminders: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h4 className="font-medium text-primary">Nhắc nhở hợp đồng</h4>
                    <p className="text-sm text-secondary">Nhận thông báo về hợp đồng sắp hết hạn</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.contractReminders}
                      onChange={(e) => setNotifications({...notifications, contractReminders: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <h4 className="font-medium text-primary">Cảnh báo bảo trì</h4>
                    <p className="text-sm text-secondary">Nhận thông báo về lịch bảo trì căn hộ</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.maintenanceAlerts}
                      onChange={(e) => setNotifications({...notifications, maintenanceAlerts: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleNotificationSave}
                className="btn btn-primary"
              >
                Lưu cài đặt
              </button>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary">Tùy chọn giao diện</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg">
                  <h4 className="font-medium text-primary mb-3">Giao diện</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => changeTheme('light')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        theme === 'light'
                          ? 'bg-blue-500 text-white'
                          : 'bg-tertiary text-secondary hover:bg-primary'
                      }`}
                    >
                      ☀️ Sáng
                    </button>
                    <button
                      onClick={() => changeTheme('dark')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        theme === 'dark'
                          ? 'bg-blue-500 text-white'
                          : 'bg-tertiary text-secondary hover:bg-primary'
                      }`}
                    >
                      🌙 Tối
                    </button>
                    <button
                      onClick={() => changeTheme('system')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        theme === 'system'
                          ? 'bg-blue-500 text-white'
                          : 'bg-tertiary text-secondary hover:bg-primary'
                      }`}
                    >
                      💻 Hệ thống
                    </button>
                  </div>
                </div>
                
                {/* Admin Tools - Only for admin */}
                {currentUser?.role === 'admin' && (
                  <div className="p-4 bg-red-50 rounded-lg mt-4">
                    <h4 className="font-medium text-red-800 mb-3">Công cụ quản trị</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn reset toàn bộ dữ liệu về mặc định?\n\nLưu ý: Tất cả dữ liệu hiện tại sẽ bị xóa!')) {
                            localStorage.removeItem('apartmentData');
                            localStorage.removeItem('currentUser');
                            window.location.reload();
                          }
                        }}
                        className="btn btn-danger w-full"
                      >
                        🔄 Reset dữ liệu về mặc định
                      </button>
                      <p className="text-xs text-red-600 text-center">
                        Sử dụng cẩn thận! Hành động này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tenant Info Tab - Only for users */}
          {activeTab === 'tenant-info' && currentUser?.role === 'user' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary">Thông tin thuê trọ</h3>
              
              {tenant && apartment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Apartment Info */}
                  <div className="bg-secondary rounded-lg p-6">
                    <h4 className="font-semibold text-primary mb-4 flex items-center">
                      🏠 Thông tin căn hộ
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-secondary">Số phòng:</span>
                        <span className="font-medium">Phòng {apartment.roomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Diện tích:</span>
                        <span className="font-medium">{apartment.area} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Loại phòng:</span>
                        <span className="font-medium">{apartment.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Tiền thuê:</span>
                        <span className="font-medium text-blue-600">
                          {apartment.rent?.toLocaleString('vi-VN')} VNĐ/tháng
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Trạng thái:</span>
                        <span className="badge-success">Đang thuê</span>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Info */}
                  <div className="bg-secondary rounded-lg p-6">
                    <h4 className="font-semibold text-primary mb-4 flex items-center">
                      👤 Thông tin cá nhân
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-secondary">Họ tên:</span>
                        <span className="font-medium">{tenant.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Điện thoại:</span>
                        <span className="font-medium">{tenant.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Email:</span>
                        <span className="font-medium">{tenant.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">CCCD:</span>
                        <span className="font-medium">{tenant.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary">Vai trò:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tenant.role === 'contract_signer' ? 'badge-purple' :
                          tenant.role === 'room_leader' ? 'badge-primary' : 'badge-success'
                        }`}>
                          {tenant.role === 'contract_signer' ? 'Người ký hợp đồng (Không ở trọ)' :
                           tenant.role === 'room_leader' ? 'Trưởng phòng (Ký HĐ + Ở trọ)' : 'Thành viên (Ở trọ)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contract Info */}
                  <div className="bg-secondary rounded-lg p-6">
                    <h4 className="font-semibold text-primary mb-4 flex items-center">
                      📋 Hợp đồng hiện tại
                    </h4>
                    {contracts.length > 0 ? (
                      <div className="space-y-3">
                        {contracts.filter(c => c.status === 'active').map(contract => (
                          <div key={contract.id} className="border border-primary rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <span className="text-secondary">Số hợp đồng:</span>
                              <span className="font-medium">{contract.contractNumber}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-secondary">Thời hạn:</span>
                              <span className="text-sm">
                                {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-secondary">Trạng thái:</span>
                              <span className="badge-success">Hiệu lực</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary text-center py-4">Chưa có hợp đồng nào</p>
                    )}
                  </div>

                  {/* Recent Invoices */}
                  <div className="bg-secondary rounded-lg p-6">
                    <h4 className="font-semibold text-primary mb-4 flex items-center">
                      🧾 Hóa đơn gần đây
                    </h4>
                    {invoices.length > 0 ? (
                      <div className="space-y-3">
                        {invoices.slice(0, 3).map(invoice => (
                          <div key={invoice.id} className="border border-primary rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <span className="text-secondary">{invoice.month}/{invoice.year}</span>
                              <span className="font-medium text-blue-600">
                                {invoice.total?.toLocaleString('vi-VN')} VNĐ
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-secondary">Trạng thái:</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                invoice.status === 'paid' ? 'badge-success' : 'badge-warning'
                              }`}>
                                {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-secondary text-center py-4">Chưa có hóa đơn nào</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted mb-4">
                    <svg className="w-16 h-16 mx-auto text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0h3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Chưa có thông tin thuê trọ
                  </h3>
                  <p className="text-secondary">
                    Tài khoản chưa được liên kết với thông tin khách thuê
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account; 