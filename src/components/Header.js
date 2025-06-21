import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApp } from '../contexts/AppContext';

const Header = () => {
  const { t } = useLanguage();
  const { theme, changeTheme } = useTheme();
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { key: 'home', label: t('home'), path: '/' },
  ];

  // Add navigation items based on role
  if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    navigation.push(
      { key: 'apartments', label: t('apartments'), path: '/apartments' },
      { key: 'tenants', label: t('tenants'), path: '/tenants' },
      { key: 'contracts', label: t('contracts'), path: '/contracts' },
      { key: 'invoices', label: t('invoices'), path: '/invoices' },
      { key: 'cost-management', label: 'Quản lý Chi phí', path: '/cost-management' }
    );
    
    // Invoice generation only for admin and manager
    navigation.push({ key: 'invoice-generation', label: 'Tạo hóa đơn', path: '/invoice-generation' });
  }

  // User (tenant) can only see their own contracts and invoices
  if (currentUser?.role === 'user') {
    navigation.push(
      { key: 'my-contracts', label: 'Hợp đồng của tôi', path: '/my-contracts' },
      { key: 'my-invoices', label: 'Hóa đơn của tôi', path: '/my-invoices' }
    );
  }

  // Get current page title - Updated to handle account pages
  const getCurrentPageTitle = () => {
    if (location.pathname === '/account') return t('account');
    if (location.pathname === '/users') return t('accountManagement');
    
    const currentNav = navigation.find(nav => nav.path === location.pathname);
    return currentNav ? currentNav.label : 'Apartment CRM';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  // Cycle through theme modes with single button
  const cycleTheme = () => {
    if (theme === 'light') {
      changeTheme('dark');
    } else if (theme === 'dark') {
      changeTheme('system');
    } else {
      changeTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else if (theme === 'dark') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  const getThemeLabel = () => {
    if (theme === 'light') return 'Sáng';
    if (theme === 'dark') return 'Tối';
    return 'Hệ thống';
  };

  return (
    <header className="bg-primary shadow border-b border-primary sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Name - Left Side */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🏢</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary">Apartment CRM</h1>
                <p className="text-xs text-secondary">Quản lý chung cư</p>
              </div>
            </Link>
          </div>

          {/* Navigation and Controls - Right Side */}
          <div className="flex items-center space-x-6">
            {/* Navigation Menu */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                    location.pathname === item.path
                      ? 'bg-tertiary text-primary shadow-sm'
                      : 'text-secondary hover-bg-tertiary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-secondary hover-bg-tertiary transition-all"
              title={`Chế độ: ${getThemeLabel()}`}
            >
              {getThemeIcon()}
              <span className="hidden lg:block text-xs">{getThemeLabel()}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-secondary hover-bg-tertiary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-secondary hover-bg-tertiary transition-all"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-inverse text-sm font-semibold shadow-sm">
                  {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:block text-sm font-medium">{currentUser?.fullName}</span>
                <svg className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-primary rounded-xl shadow-xl border border-primary py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-primary">
                    <p className="text-sm font-medium text-primary">{currentUser?.fullName}</p>
                    <p className="text-xs text-secondary">{currentUser?.email}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      currentUser?.role === 'admin' ? 'badge-purple' :
                      currentUser?.role === 'manager' ? 'badge-primary' : 'badge-success'
                    }`}>
                      {currentUser?.role === 'admin' ? '👑 Quản trị viên' :
                       currentUser?.role === 'manager' ? '👨‍💼 Quản lý' : '👤 Khách thuê'}
                    </span>
                  </div>
                  
                  <div className="py-2">
                    {/* Account Settings - Available for all users */}
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`flex items-center px-4 py-2 text-sm transition-colors ${
                        location.pathname === '/account' 
                          ? 'bg-tertiary text-primary font-medium' 
                          : 'text-secondary hover-bg-secondary'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('account')}
                    </Link>

                    {/* User Management - Admin can manage manager + user, Manager can manage user */}
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                      <Link
                        to="/users"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={`flex items-center px-4 py-2 text-sm transition-colors ${
                          location.pathname === '/users' 
                            ? 'bg-tertiary text-primary font-medium' 
                            : 'text-secondary hover-bg-secondary'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                        {t('accountManagement')}
                        {currentUser?.role === 'admin' && (
                          <span className="ml-auto text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            Admin
                          </span>
                        )}
                        {currentUser?.role === 'manager' && (
                          <span className="ml-auto text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Manager
                          </span>
                        )}
                      </Link>
                    )}

                    {/* Divider */}
                    <div className="border-t border-primary my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-primary bg-secondary">
          <div className="px-4 py-3 space-y-1">
            {/* Mobile Page Title */}
            <div className="px-3 py-2 text-sm font-bold text-primary border-b border-primary mb-2 flex items-center justify-between">
              <span>{getCurrentPageTitle()}</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded text-secondary hover:text-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {navigation.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-inverse'
                    : 'text-secondary hover-bg-tertiary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Account Links */}
            <div className="border-t border-primary pt-2 mt-2">
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/account'
                    ? 'bg-primary text-inverse'
                    : 'text-secondary hover-bg-tertiary'
                }`}
              >
                {t('account')}
              </Link>
              
              {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                <Link
                  to="/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/users'
                      ? 'bg-primary text-inverse'
                      : 'text-secondary hover-bg-tertiary'
                  }`}
                >
                  {t('accountManagement')}
                </Link>
              )}
            </div>
            
            {/* Mobile Theme Toggle */}
            <div className="px-3 py-2 border-t border-primary mt-2">
              <button
                onClick={cycleTheme}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-secondary hover-bg-tertiary transition-all"
              >
                {getThemeIcon()}
                <span className="text-sm">Giao diện: {getThemeLabel()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 