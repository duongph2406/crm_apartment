import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';
import { usePageTitle } from '../hooks';

const Home = () => {
  usePageTitle('Trang chủ');
  
  const { 
    currentUser, 
    data,
    forceSyncContractStatus
  } = useApp();
  const navigate = useNavigate();
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showApartmentModal, setShowApartmentModal] = useState(false);

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

  // Format currency for apartment display (shorter format)
  const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      // Remove decimal if it's .0
      if (millions % 1 === 0) {
        return `${millions.toFixed(0)}M`;
      }
      return `${millions.toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    // Check user permissions for admin/manager actions
    if (currentUser?.role === 'user') {
      // For regular users, redirect to their appropriate pages
      switch (action) {
        case 'addTenant':
        case 'createContract':
          alert('Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên.');
          return;
        case 'createInvoice':
        case 'viewReports':
          navigate('/my-invoices');
          break;
        default:
          break;
      }
      return;
    }

    // For admin/manager users
    switch (action) {
      case 'addTenant':
        navigate('/tenants');
        break;
      case 'createContract':
        navigate('/contracts');
        break;
      case 'createInvoice':
        navigate('/invoice-generation');
        break;
      case 'viewReports':
        navigate('/invoices');
        break;
      default:
        break;
    }
  };

  const handleViewAllActivity = () => {
    if (currentUser?.role === 'user') {
      navigate('/my-invoices');
    } else {
      navigate('/invoices');
    }
  };

  // Handle apartment click
  const handleApartmentClick = (apartment) => {
    setSelectedApartment(apartment);
    setShowApartmentModal(true);
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status) {
      case 'occupied': return 'Đã thuê';
      case 'available': return 'Trống';
      case 'maintenance': return 'Bảo trì';
      default: return 'Không xác định';
    }
  };

  // Apartment Modal Component
  const ApartmentModal = () => {
    if (!selectedApartment) return null;

    const tenant = selectedApartment.currentTenantId 
      ? data.tenants.find(t => t.id === selectedApartment.currentTenantId)
      : null;
    
    const contract = data.contracts.find(c => 
      c.apartmentId === selectedApartment.id && c.status === 'active'
    );

    const statusConfig = {
      occupied: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã thuê' },
      available: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Trống' },
      maintenance: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Bảo trì' }
    };

    const config = statusConfig[selectedApartment.status] || statusConfig.available;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Chi tiết phòng {selectedApartment.roomNumber}
            </h3>
            <button
              onClick={() => setShowApartmentModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Diện tích:</span>
              <span className="font-medium text-gray-900 dark:text-white">{selectedApartment.size}m²</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Giá thuê:</span>
              <span className="font-bold text-green-600">{formatCurrency(selectedApartment.rent)}</span>
            </div>

            {tenant && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Thông tin khách thuê:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Họ tên:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tenant.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Điện thoại:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{tenant.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Vai trò:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tenant.role === 'room_leader' ? 'Trưởng phòng' : 
                         tenant.role === 'contract_signer' ? 'Người ký hợp đồng' : 'Thành viên'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {contract && (
              <>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Hợp đồng hiện tại:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Số hợp đồng:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{contract.contractNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ngày hết hạn:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatDate(contract.endDate)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {currentUser?.role !== 'user' ? (
              <>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigate('/apartments', { state: { selectedApartment: selectedApartment.id } });
                      setShowApartmentModal(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Quản lý phòng
                  </button>
                  {tenant && (
                    <button
                      onClick={() => {
                        navigate('/invoice-generation', { 
                          state: { 
                            preSelectedApartment: selectedApartment.id,
                            preSelectedTenant: tenant.id 
                          } 
                        });
                        setShowApartmentModal(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Tạo hóa đơn
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowApartmentModal(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowApartmentModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      forceSyncContractStatus();
                      alert('Đã đồng bộ trạng thái hợp đồng!');
                    }}
                    className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors"
                    title="Đồng bộ trạng thái hợp đồng hết hạn"
                  >
                    🔄 Sync
                  </button>
                )}
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
              <div>
                <h3 className="text-xl font-semibold text-primary">
                  Sơ đồ tình trạng căn hộ
                </h3>
                <p className="text-sm text-muted mt-1">
                  💡 Click vào từng căn hộ để xem chi tiết • Giá hiển thị đã được rút gọn
                </p>
              </div>
              <div className="flex flex-col space-y-2 text-sm">
                                  <div className="flex items-center space-x-4">
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
                  <div className="text-xs text-muted">
                    M = Triệu VND • K = Nghìn VND
                  </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.apartments.map((apartment) => {
                // Only show tenant if apartment has active contract and tenant is active
                const activeContract = data.contracts.find(c => 
                  c.apartmentId === apartment.id && c.status === 'active'
                );
                
                const tenant = activeContract && apartment.currentTenantId 
                  ? data.tenants.find(t => t.id === apartment.currentTenantId && t.status === 'active')
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
                    onClick={() => handleApartmentClick(apartment)}
                    className={`${config.bg} ${config.border} border-2 rounded-lg p-3 text-center transition-all hover:shadow-lg cursor-pointer transform hover:scale-105 relative flex flex-col min-h-[120px]`}
                    title={tenant ? `Khách thuê: ${tenant.fullName} - Giá: ${formatCurrency(apartment.rent)} - Click để xem chi tiết` : `Phòng trống - Giá: ${formatCurrency(apartment.rent)} - Click để xem chi tiết`}
                  >
                    <div className="text-xl mb-2">{config.icon}</div>
                    <div className="font-bold text-primary text-base mb-2">
                      {apartment.roomNumber}
                    </div>
                    {tenant && (
                      <div className="text-xs text-secondary mb-2 truncate">
                        {tenant.fullName.split(' ').pop()}
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 border border-green-200 dark:border-green-600 rounded-lg px-2 py-1.5 mt-auto shadow-sm">
                      <div className="text-base font-extrabold text-green-800 dark:text-green-200">
                        {formatCurrencyShort(apartment.rent)}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-300 opacity-90 font-medium">
                        VND/tháng
                      </div>
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
            <button 
              onClick={handleViewAllActivity}
              className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
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
            { icon: '➕', label: 'Thêm khách thuê', color: 'bg-blue-500', action: 'addTenant' },
            { icon: '📋', label: 'Tạo hợp đồng', color: 'bg-green-500', action: 'createContract' },
            { icon: '🧾', label: 'Xuất hóa đơn', color: 'bg-purple-500', action: 'createInvoice' },
            { icon: '📊', label: 'Báo cáo', color: 'bg-orange-500', action: 'viewReports' }
          ].map((actionItem, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(actionItem.action)}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-primary hover:border-blue-300 dark:hover:border-blue-600 hover-bg-secondary transition-all group"
            >
              <div className={`${actionItem.color} w-12 h-12 rounded-full flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform`}>
                {actionItem.icon}
              </div>
              <span className="text-sm font-medium text-primary group-hover:text-blue-700 dark:group-hover:text-blue-400">
                {actionItem.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Apartment Detail Modal */}
      {showApartmentModal && <ApartmentModal />}
    </div>
  );
};

export default Home; 