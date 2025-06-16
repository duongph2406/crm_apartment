import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useApp } from '../../contexts/AppContext';

const Login = ({ onLogin }) => {
  const { language, changeLanguage, t } = useLanguage();
  const { login } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = login(formData.username, formData.password);
      if (success) {
        onLogin();
      } else {
        setError(language === 'vi' ? 'Tên đăng nhập hoặc mật khẩu không đúng' : 'Invalid username or password');
      }
    } catch (err) {
      setError(language === 'vi' ? 'Đã xảy ra lỗi, vui lòng thử lại' : 'An error occurred, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'manager', password: 'manager123', role: 'Manager' },
    { username: 'user', password: 'user123', role: 'User (Khách thuê)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            Apartment CRM
          </h1>
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'vi' ? 'Đăng nhập' : 'Sign in'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {language === 'vi' 
              ? 'Đăng nhập vào hệ thống quản lý căn hộ' 
              : 'Sign in to apartment management system'
            }
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => changeLanguage('vi')}
            className={`px-3 py-1 text-sm rounded ${
              language === 'vi'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tiếng Việt
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`px-3 py-1 text-sm rounded ${
              language === 'en'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Tên đăng nhập' : 'Username'}
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input"
                  placeholder={language === 'vi' ? 'Nhập tên đăng nhập' : 'Enter username'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Mật khẩu' : 'Password'}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder={language === 'vi' ? 'Nhập mật khẩu' : 'Enter password'}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (language === 'vi' ? 'Đang đăng nhập...' : 'Signing in...') 
                  : (language === 'vi' ? 'Đăng nhập' : 'Sign in')
                }
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {language === 'vi' ? 'Tài khoản demo:' : 'Demo credentials:'}
            </h3>
            <div className="space-y-2 text-xs">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded flex justify-between items-center">
                  <div>
                    <span className="font-medium">{cred.role}:</span> {cred.username} / {cred.password}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ username: cred.username, password: cred.password });
                    }}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    {language === 'vi' ? 'Sử dụng' : 'Use'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 