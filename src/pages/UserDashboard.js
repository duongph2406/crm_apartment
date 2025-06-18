import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';

const UserDashboard = () => {
  const { t } = useLanguage();
  const { data, currentUser } = useApp();

  // Get tenant information for the current user
  const currentTenant = data.tenants.find(tenant => tenant.id === currentUser?.tenantId);
  const currentApartment = currentTenant ? data.apartments.find(apt => apt.currentTenantId === currentTenant.id) : null;
  const activeContract = currentTenant ? data.contracts.find(contract => 
    contract.tenantId === currentTenant.id && contract.status === 'active'
  ) : null;
  
  const userInvoices = currentTenant ? data.invoices.filter(invoice => 
    invoice.tenantId === currentTenant.id
  ) : [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className={`${colorClasses[color]} p-3 rounded-full text-white mr-4`}>
            <div className="w-6 h-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Chào mừng, {currentUser?.fullName}!
        </h1>
        <p className="text-gray-600">
          Đây là trang quản lý thông tin cá nhân và tình trạng thuê căn hộ của bạn.
        </p>
      </div>

      {/* Current Rental Status */}
      {currentApartment && activeContract ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Thông tin thuê căn hộ hiện tại
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Căn hộ</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số phòng:</span>
                  <span className="font-semibold text-primary-600 text-xl">
                    {currentApartment.roomNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá thuê:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(currentApartment.rentAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đang thuê
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Hợp đồng</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số hợp đồng:</span>
                  <span className="font-semibold">{activeContract.contractNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bắt đầu:</span>
                                        <span>{formatDate(activeContract.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kết thúc:</span>
                                        <span>{formatDate(activeContract.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Đang hiệu lực
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có thông tin thuê căn hộ
            </h3>
            <p className="text-gray-600">
              Bạn hiện chưa thuê căn hộ nào hoặc chưa có hợp đồng hiệu lực.
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Tổng hóa đơn"
          value={userInvoices.length}
          color="blue"
        />
        <StatCard
          title="Đã thanh toán"
          value={userInvoices.filter(inv => inv.status === 'paid').length}
          color="green"
        />
        <StatCard
          title="Chưa thanh toán"
          value={userInvoices.filter(inv => inv.status === 'unpaid').length}
          subtitle={userInvoices.filter(inv => inv.status === 'unpaid').length > 0 ? 'Cần thanh toán' : ''}
          color={userInvoices.filter(inv => inv.status === 'unpaid').length > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin cá nhân
        </h2>
        {currentTenant ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                  <p className="text-lg font-semibold text-gray-900">{currentTenant.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                  <p className="text-gray-900">{currentTenant.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{currentTenant.email || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">CMND/CCCD</label>
                  <p className="text-gray-900">{currentTenant.idNumber || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                  <p className="text-gray-900">{currentTenant.address || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Không tìm thấy thông tin cá nhân.</p>
        )}
      </div>

      {/* Recent Invoices */}
      {userInvoices.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hóa đơn gần đây
          </h2>
          <div className="space-y-3">
            {userInvoices.slice(-3).reverse().map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">
                    Hạn thanh toán: {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard; 