import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const MyContracts = () => {
  const { t } = useLanguage();
  const { data, currentUser } = useApp();

  // Get tenant information and contracts for the current user
  const currentTenant = data.tenants.find(tenant => tenant.id === currentUser?.tenantId);
  const userContracts = currentTenant 
    ? data.contracts.filter(contract => contract.tenantId === currentTenant.id)
    : [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hiệu lực';
      case 'expired': return 'Đã hết hạn';
      case 'pending': return 'Chờ xử lý';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hợp đồng của tôi
        </h1>
        <p className="text-gray-600">
          Xem thông tin chi tiết các hợp đồng thuê căn hộ của bạn
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{userContracts.length}</h3>
              <p className="text-sm text-gray-600">Tổng hợp đồng</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-full text-white mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userContracts.filter(c => c.status === 'active').length}
              </h3>
              <p className="text-sm text-gray-600">Đang hiệu lực</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-full text-white mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userContracts.filter(c => c.status === 'expired').length}
              </h3>
              <p className="text-sm text-gray-600">Đã hết hạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {userContracts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userContracts.map((contract) => {
              const apartment = data.apartments.find(apt => apt.id === contract.apartmentId);
              
              return (
                <div key={contract.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Hợp đồng {contract.contractNumber}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {getStatusText(contract.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Căn hộ</p>
                          <p className="text-lg font-semibold text-primary-600">
                            Phòng {apartment?.roomNumber}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-500">Giá thuê</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(contract.rentAmount)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500">Ngày bắt đầu</p>
                          <p className="text-sm text-gray-900">
                            {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500">Ngày kết thúc</p>
                          <p className="text-sm text-gray-900">
                            {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      {/* Contract Duration */}
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">Thời hạn hợp đồng:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24 * 30))} tháng
                          </p>
                        </div>
                        
                        {contract.status === 'active' && (
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-gray-500">Còn lại:</p>
                            <p className="text-sm font-medium text-gray-900">
                              {Math.max(0, Math.ceil((new Date(contract.endDate) - new Date()) / (1000 * 60 * 60 * 24)))} ngày
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contract Actions */}
                    <div className="ml-6 flex flex-col space-y-2">
                      <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                        Xem chi tiết
                      </button>
                      {contract.status === 'active' && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Tải hợp đồng
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for active contracts */}
                  {contract.status === 'active' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Tiến độ hợp đồng</span>
                        <span>
                          {Math.round(
                            ((new Date() - new Date(contract.startDate)) / 
                            (new Date(contract.endDate) - new Date(contract.startDate))) * 100
                          )}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, Math.max(0, 
                              ((new Date() - new Date(contract.startDate)) / 
                              (new Date(contract.endDate) - new Date(contract.startDate))) * 100
                            ))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có hợp đồng nào
            </h3>
            <p className="text-gray-600">
              Bạn hiện chưa có hợp đồng thuê căn hộ nào trong hệ thống.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyContracts; 