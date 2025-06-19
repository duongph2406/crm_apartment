import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const Login = ({ onLogin }) => {
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
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi, vui lòng thử lại');
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
            Đăng nhập
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Đăng nhập vào hệ thống quản lý căn hộ
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
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
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
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
                  placeholder="Nhập mật khẩu"
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
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tài khoản demo:
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
                    Sử dụng
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