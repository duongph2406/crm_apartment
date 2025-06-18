import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';

const Home = () => {
  const { t } = useLanguage();
  const { data, currentUser } = useApp();

  // Calculate statistics
  const stats = {
    totalApartments: data.apartments.length,
    occupiedApartments: data.apartments.filter(apt => apt.status === 'occupied').length,
    availableApartments: data.apartments.filter(apt => apt.status === 'available').length,
    maintenanceApartments: data.apartments.filter(apt => apt.status === 'maintenance').length,
    totalTenants: data.tenants.length,
    activeContracts: data.contracts.filter(contract => contract.status === 'active').length,
    unpaidInvoices: data.invoices.filter(invoice => invoice.status === 'unpaid').length,
    totalRevenue: data.invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0),
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend }) => {
    const colorClasses = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: 'bg-blue-500' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', icon: 'bg-green-500' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', icon: 'bg-yellow-500' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: 'bg-red-500' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', icon: 'bg-purple-500' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', icon: 'bg-orange-500' },
    };

    const config = colorClasses[color];

    return (
      <div className={`${config.bg} rounded-xl border border-primary p-6 transition-all hover:shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`${config.icon} p-2 rounded-lg text-white`}>
                <span className="text-lg">{icon}</span>
              </div>
              <h3 className="text-sm font-medium text-secondary">{title}</h3>
            </div>
            <div className={`text-2xl font-bold ${config.text} mb-1`}>{value}</div>
            {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
          </div>
          {trend && (
            <div className={`text-xs font-medium ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  const recentActivity = [
    ...data.invoices.slice(-3).map(invoice => ({
      type: 'invoice',
      icon: '💰',
      message: `Hóa đơn ${invoice.invoiceNumber}`,
      amount: formatCurrency(invoice.amount),
      time: formatDate(invoice.issueDate),
      status: invoice.status,
    })),
    ...data.contracts.slice(-2).map(contract => ({
      type: 'contract',
      icon: '📋',
      message: `Hợp đồng ${contract.contractNumber}`,
      detail: `Phòng ${contract.apartmentId}`,
      time: formatDate(contract.startDate),
      status: contract.status,
    })),
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Chào mừng, {currentUser?.fullName}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Đây là tổng quan hệ thống quản lý căn hộ
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Hệ thống hoạt động bình thường</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>{formatDate(new Date())}</span>
                </div>
              </div>

            </div>
          </div>
          <div className="hidden lg:block">
            <div className="text-6xl opacity-20">🏢</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng căn hộ"
          value={stats.totalApartments}
          icon="🏢"
          color="blue"
          subtitle="11 phòng trong tòa nhà"
        />
        <StatCard
          title="Đã có khách thuê"
          value={stats.occupiedApartments}
          icon="🏠"
          color="green"
          subtitle={`${stats.availableApartments} căn trống`}
          trend={12}
        />
        <StatCard
          title="Tổng khách thuê"
          value={stats.totalTenants}
          icon="👥"
          color="purple"
          subtitle="Khách hàng đang thuê"
        />
        <StatCard
          title="Hợp đồng hiệu lực"
          value={stats.activeContracts}
          icon="📋"
          color="yellow"
          subtitle="Đang hoạt động"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Doanh thu tháng này"
              value={formatCurrency(stats.totalRevenue)}
              icon="💰"
              color="green"
              subtitle="Từ các hóa đơn đã thanh toán"
              trend={8}
            />
            <StatCard
              title="Hóa đơn chưa thanh toán"
              value={stats.unpaidInvoices}
              icon="⚠️"
              color="red"
              subtitle="Cần theo dõi và nhắc nhở"
            />
          </div>

          {/* Apartment Status Grid */}
          <div className="bg-primary rounded-xl shadow-sm border border-primary p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-primary">
                Sơ đồ tình trạng căn hộ
              </h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-secondary">Đã thuê</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-secondary">Trống</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-secondary">Bảo trì</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.apartments.map((apartment) => {
                const tenant = apartment.currentTenantId 
                  ? data.tenants.find(t => t.id === apartment.currentTenantId)
                  : null;
                
                const statusConfig = {
                  occupied: { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700', text: 'text-green-800 dark:text-green-300', icon: '🏠' },
                  available: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-300', icon: '🔑' },
                  maintenance: { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-800 dark:text-orange-300', icon: '🔧' }
                };
                
                const config = statusConfig[apartment.status] || statusConfig.available;
                
                return (
                  <div
                    key={apartment.id}
                    className={`${config.bg} ${config.border} border-2 rounded-lg p-3 text-center transition-all hover:shadow-md cursor-pointer`}
                    title={tenant ? `Khách thuê: ${tenant.fullName}` : 'Phòng trống'}
                  >
                    <div className="text-lg mb-1">{config.icon}</div>
                    <div className="font-semibold text-primary text-sm">
                      {apartment.roomNumber}
                    </div>
                    {tenant && (
                      <div className="text-xs text-secondary mt-1 truncate">
                        {tenant.fullName.split(' ').pop()}
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${config.text}`}>
                      {formatCurrency(apartment.rentAmount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-primary rounded-xl shadow-sm border border-primary p-6">
          <h3 className="text-xl font-semibold text-primary mb-6">
            Hoạt động gần đây
          </h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 6).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-secondary rounded-lg hover-bg-tertiary transition-colors">
                <div className="text-lg">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{activity.message}</p>
                  {activity.amount && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{activity.amount}</p>
                  )}
                  {activity.detail && (
                    <p className="text-xs text-secondary">{activity.detail}</p>
                  )}
                  <p className="text-xs text-muted mt-1">{activity.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'paid' || activity.status === 'active' 
                    ? 'bg-green-500' 
                    : 'bg-yellow-500'
                }`} />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-primary">
            <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              Xem tất cả hoạt động →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-primary rounded-xl shadow-sm border border-primary p-6">
        <h3 className="text-xl font-semibold text-primary mb-6">
          Thao tác nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '➕', label: 'Thêm khách thuê', color: 'bg-blue-500' },
            { icon: '📋', label: 'Tạo hợp đồng', color: 'bg-green-500' },
            { icon: '🧾', label: 'Xuất hóa đơn', color: 'bg-purple-500' },
            { icon: '📊', label: 'Báo cáo', color: 'bg-orange-500' }
          ].map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-primary hover:border-blue-300 dark:hover:border-blue-600 hover-bg-secondary transition-all group"
            >
              <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-primary group-hover:text-blue-700 dark:group-hover:text-blue-400">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home; 