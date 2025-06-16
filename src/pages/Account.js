import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';

const Account = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const { data } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    avatar: ''
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

  const handleProfileSave = () => {
    // In a real app, this would update the user in the backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    // Show success message
    alert('Thông tin đã được cập nhật thành công!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    // In a real app, this would verify current password and update
    console.log('Changing password');
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
    if (user?.role === 'user' && user?.tenantId) {
      const tenant = data.tenants.find(t => t.id === user.tenantId);
      const apartment = tenant ? data.apartments.find(apt => apt.id === tenant.apartmentId) : null;
      const contracts = data.contracts.filter(c => c.tenantId === user.tenantId);
      const invoices = data.invoices.filter(i => i.tenantId === user.tenantId);
      
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
    ...(user?.role === 'user' ? [{ id: 'tenant-info', label: 'Thông tin thuê', icon: '🏠' }] : [])
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                user?.role === 'admin' ? 'badge-purple' :
                user?.role === 'manager' ? 'badge-primary' : 'badge-success'
              }`}>
                {user?.role === 'admin' ? '👑 Quản trị viên' :
                 user?.role === 'manager' ? '👨‍💼 Quản lý' : '👤 Khách thuê'}
              </span>
              <span className="text-sm text-secondary">
                Đăng nhập: {user?.username}
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
                  onClick={() => setIsEditing(!isEditing)}
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
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="input w-full"
                    />
                  ) : (
                    <p className="text-primary font-medium">{user?.name}</p>
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
                    <p className="text-primary font-medium">{user?.email}</p>
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
                    <p className="text-primary font-medium">{profileData.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Vai trò
                  </label>
                  <p className="text-primary font-medium">
                    {user?.role === 'admin' ? 'Quản trị viên' :
                     user?.role === 'manager' ? 'Quản lý' : 'Khách thuê'}
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
                    <p className="text-primary font-medium">{profileData.address || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-primary">
                  <button
                    onClick={() => setIsEditing(false)}
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
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="input w-full max-w-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
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
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
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
                      <p className="text-sm text-secondary">Trình duyệt web - {new Date().toLocaleDateString('vi-VN')}</p>
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
                  <h4 className="font-medium text-primary mb-3">Ngôn ngữ</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => changeLanguage('vi')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        language === 'vi'
                          ? 'bg-blue-500 text-white'
                          : 'bg-tertiary text-secondary hover:bg-primary'
                      }`}
                    >
                      🇻🇳 Tiếng Việt
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        language === 'en'
                          ? 'bg-blue-500 text-white'
                          : 'bg-tertiary text-secondary hover:bg-primary'
                      }`}
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

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
              </div>
            </div>
          )}

          {/* Tenant Info Tab - Only for users */}
          {activeTab === 'tenant-info' && user?.role === 'user' && (
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
                          {tenant.role === 'contract_signer' ? 'Người ký hợp đồng' :
                           tenant.role === 'room_leader' ? 'Trưởng phòng' : 'Thành viên'}
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
                                {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}
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