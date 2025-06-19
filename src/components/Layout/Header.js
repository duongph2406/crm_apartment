import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ currentPage, setCurrentPage }) => {
  const { currentUser, logout } = useApp();
  const { theme, changeTheme, isDark } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { key: 'home', label: 'Trang chủ' },
  ];

  // Page titles mapping
  const pageTitles = {
    'home': 'Trang chủ',
    'apartments': 'Quản lý căn hộ',
    'tenants': 'Quản lý khách thuê',
    'contracts': 'Hợp đồng',
    'invoices': 'Hóa đơn',
    'account': 'Tài khoản',
    'users': 'Quản lý tài khoản',
    'my-contracts': 'Hợp đồng của tôi',
    'my-invoices': 'Hóa đơn của tôi'
  };

  // Add navigation items based on role
  if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    navigation.push(
      { key: 'apartments', label: 'Quản lý căn hộ' },
      { key: 'tenants', label: 'Quản lý khách thuê' },
      { key: 'contracts', label: 'Hợp đồng' },
      { key: 'invoices', label: 'Hóa đơn' }
    );
  }

  // User (tenant) can only see their own contracts and invoices
  if (currentUser?.role === 'user') {
    navigation.push(
      { key: 'my-contracts', label: 'Hợp đồng của tôi' },
      { key: 'my-invoices', label: 'Hóa đơn của tôi' }
    );
  }

  navigation.push({ key: 'account', label: 'Tài khoản' });

  if (currentUser?.role === 'admin') {
    navigation.push({ key: 'users', label: 'Quản lý tài khoản' });
  }

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
    setIsUserMenuOpen(false);
  };

  const cycleTheme = () => {
    if (theme === 'light') changeTheme('dark');
    else if (theme === 'dark') changeTheme('system');
    else changeTheme('light');
  };

  return (
    <header className="bg-primary shadow-sm border-b border-primary">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Current Page Title */}
        <div className="flex-shrink-0">
          <h1 className="text-xl font-bold text-primary">
            {pageTitles[currentPage] || currentPage}
          </h1>
        </div>

          {/* Right side - Navigation and Controls */}
          <div className="flex items-center space-x-6">
            {/* Navigation */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.key
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-secondary hover:text-primary hover-bg-secondary'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Theme, Language switcher and User menu */}
            <div className="flex items-center space-x-3 border-l border-primary pl-6">
            {/* Theme Selector */}
            <select
              value={theme}
              onChange={(e) => changeTheme(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-primary text-sm border border-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">☀️ Sáng</option>
              <option value="dark">🌙 Tối</option>
              <option value="system">💻 Hệ thống</option>
            </select>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-primary hover-bg-secondary rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium">{currentUser?.fullName}</span>
                <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-primary rounded-lg shadow-lg py-1 z-50 border border-primary">
                  <div className="px-4 py-2 text-sm text-primary border-b border-primary">
                    <div className="font-medium">{currentUser?.fullName}</div>
                    <div className="text-xs text-secondary capitalize">{currentUser?.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage('account');
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-primary hover-bg-secondary transition-colors"
                  >
                    Tài khoản
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-primary hover-bg-secondary transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-primary">
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === item.key
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-secondary hover:text-primary hover-bg-secondary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header; 