import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      label: 'Quản trị viên',
      icon: '👑',
      description: 'Toàn quyền quản lý hệ thống'
    },
    {
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      label: 'Quản lý',
      icon: '👨‍💼',
      description: 'Quản lý căn hộ và khách thuê'
    },
    {
      username: 'user',
      password: 'user123',
      role: 'user',
      label: 'Khách thuê',
      icon: '👤',
      description: 'Xem hợp đồng và hóa đơn'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(account.username, account.password);
      if (!success) {
        setError('Không thể đăng nhập với tài khoản demo');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl">🏢</span>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">
            Apartment CRM
          </h2>
          <p className="text-secondary">
            Hệ thống quản lý chung cư
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-primary rounded-xl shadow-lg border border-primary p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="bg-primary rounded-xl shadow-lg border border-primary p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 text-center">
            Tài khoản demo
          </h3>
          <div className="space-y-3">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
                className="w-full flex items-center p-4 border border-primary rounded-lg hover-bg-secondary transition-all group"
              >
                <div className="w-12 h-12 bg-tertiary rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <span className="text-xl">{account.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-primary">{account.label}</p>
                  <p className="text-xs text-secondary">{account.description}</p>
                  <p className="text-xs text-muted mt-1">
                    {account.username} / {account.password}
                  </p>
                </div>
                <svg className="w-5 h-5 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-primary rounded-xl shadow-lg border border-primary p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 text-center">
            Tính năng nổi bật
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto flex items-center justify-center">
                🌓
              </div>
              <p className="text-sm font-medium text-primary">Dark Mode</p>
              <p className="text-xs text-secondary">Giao diện tối hiện đại</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto flex items-center justify-center">
                🌍
              </div>
              <p className="text-sm font-medium text-primary">Đa ngôn ngữ</p>
              <p className="text-xs text-secondary">Tiếng Việt & English</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto flex items-center justify-center">
                📱
              </div>
              <p className="text-sm font-medium text-primary">Responsive</p>
              <p className="text-xs text-secondary">Tương thích mọi thiết bị</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg mx-auto flex items-center justify-center">
                🔒
              </div>
              <p className="text-sm font-medium text-primary">Bảo mật</p>
              <p className="text-xs text-secondary">Phân quyền chi tiết</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted">
            © 2024 Apartment CRM. Powered by React & Modern UI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 