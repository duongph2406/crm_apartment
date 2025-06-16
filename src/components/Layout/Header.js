import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';

const Header = ({ currentPage, setCurrentPage }) => {
  const { language, changeLanguage, t } = useLanguage();
  const { currentUser, logout } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navigation = [
    { key: 'home', label: t('home') },
  ];

  // Add navigation items based on role
  if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
    navigation.push(
      { key: 'apartments', label: t('apartments') },
      { key: 'tenants', label: t('tenants') },
      { key: 'contracts', label: t('contracts') },
      { key: 'invoices', label: t('invoices') }
    );
  }

  // User (tenant) can only see their own contracts and invoices
  if (currentUser?.role === 'user') {
    navigation.push(
      { key: 'my-contracts', label: 'Hợp đồng của tôi' },
      { key: 'my-invoices', label: 'Hóa đơn của tôi' }
    );
  }

  navigation.push({ key: 'account', label: t('account') });

  if (currentUser?.role === 'admin') {
    navigation.push({ key: 'users', label: t('accountManagement') });
  }

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-600">
                Apartment CRM
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === item.key
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Language switcher and User menu */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => changeLanguage('vi')}
                className={`px-2 py-1 text-sm rounded ${
                  language === 'vi'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                VI
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-sm rounded ${
                  language === 'en'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                EN
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm">
                  {currentUser?.fullName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:block">{currentUser?.fullName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {currentUser?.fullName}
                    <div className="text-xs text-gray-500">{currentUser?.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage('account');
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('account')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất / Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          {navigation.map((item) => (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === item.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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