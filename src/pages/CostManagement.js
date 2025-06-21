import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';
import { usePageTitle } from '../hooks';
import Modal from '../components/Modal';
import QRCodePayment from '../components/QRCodePayment';
import { getAccountName, validateAccountNumber, normalizeAccountName, getAPIMetrics, checkAPIHealth } from '../utils/bankService';
import { testAPIConnection, checkAPIKeys } from '../utils/apiTest';

const CostManagement = () => {
  usePageTitle('Quản lý chi phí');

  const { 
    data, 
    currentUser,
    updateCostSettings,
    updateRoomPrice,
    getRoomPrice,
    updateBankInfo
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // general, room-prices, bank-settings
  const [costData, setCostData] = useState(
    data.costSettings || {
      electricityRate: 4000, // VNĐ/kWh
      waterRatePerPerson: 100000, // VNĐ/người/tháng
      internetRatePerRoom: 100000, // VNĐ/phòng/tháng
      serviceFeePerPerson: 100000, // VNĐ/người/tháng
      lastUpdated: new Date().toISOString()
    }
  );

  // Room prices state
  const [roomPricesData, setRoomPricesData] = useState({});

  // Bank info state
  const [bankInfoData, setBankInfoData] = useState(
    data.bankInfo || {
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: '',
      qrEnabled: true,
      lastUpdated: ''
    }
  );

  // Verification states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  
  // API Test states
  const [apiTestResult, setApiTestResult] = useState(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [showAPIDebug, setShowAPIDebug] = useState(false);
  
  // API Metrics states
  const [apiMetrics, setApiMetrics] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Auto-initialize API metrics on component mount (moved after all useState)
  useEffect(() => {
    const initializeMetrics = async () => {
      try {
        const [metrics, health] = await Promise.all([
          getAPIMetrics(),
          checkAPIHealth()
        ]);
        setApiMetrics(metrics);
        setApiHealth(health);
      } catch (error) {
        console.warn('Failed to initialize API metrics:', error);
      }
    };
    
    initializeMetrics();
    
    // Auto-refresh metrics every 30 seconds if debug panel is open
    const interval = setInterval(() => {
      if (showAPIDebug) {
        setApiMetrics(getAPIMetrics());
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [showAPIDebug]);

  const handleSave = () => {
    if (activeTab === 'general') {
      // Save cost settings
      const updatedData = {
        ...costData,
        lastUpdated: new Date().toISOString()
      };
      setCostData(updatedData);
      if (updateCostSettings) {
        updateCostSettings(updatedData);
      }
    } else if (activeTab === 'room-prices') {
      // Save room prices
      Object.entries(roomPricesData).forEach(([apartmentId, price]) => {
        if (price !== undefined && price !== '') {
          updateRoomPrice(apartmentId, parseInt(price));
        }
      });
      setRoomPricesData({});
    } else if (activeTab === 'bank-settings') {
      // Save bank info
      const updatedBankInfo = {
        ...bankInfoData,
        lastUpdated: new Date().toISOString()
      };
      setBankInfoData(updatedBankInfo);
      if (updateBankInfo) {
        updateBankInfo(updatedBankInfo);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (activeTab === 'general') {
      setCostData(data.costSettings || {
        electricityRate: 4000,
        waterRatePerPerson: 100000,
        internetRatePerRoom: 100000,
        serviceFeePerPerson: 100000,
        lastUpdated: new Date().toISOString()
      });
    } else if (activeTab === 'room-prices') {
      setRoomPricesData({});
    } else if (activeTab === 'bank-settings') {
      setBankInfoData(data.bankInfo || {
        bankName: '',
        bankCode: '',
        accountNumber: '',
        accountName: '',
        qrEnabled: true,
        lastUpdated: ''
      });
    }
    setIsEditing(false);
  };

  const getRoomPriceForEdit = (apartmentId) => {
    return roomPricesData[apartmentId] !== undefined 
      ? roomPricesData[apartmentId] 
      : getRoomPrice(apartmentId);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const costItems = [
    {
      key: 'electricityRate',
      title: 'Giá điện',
      unit: 'VNĐ/kWh',
      icon: '⚡',
      description: 'Giá điện tính theo từng kWh sử dụng',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      key: 'waterRatePerPerson',
      title: 'Giá nước',
      unit: 'VNĐ/người/tháng',
      icon: '💧',
      description: 'Giá nước tính theo số người trong phòng',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'internetRatePerRoom',
      title: 'Phí Internet',
      unit: 'VNĐ/phòng/tháng',
      icon: '🌐',
      description: 'Phí internet cố định cho mỗi phòng',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'serviceFeePerPerson',
      title: 'Phí dịch vụ',
      unit: 'VNĐ/người/tháng',
      icon: '🏢',
      description: 'Phí dịch vụ chung cư, bảo trì, an ninh, vệ sinh',
      color: 'bg-green-100 text-green-800'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Quản lý Chi phí
            </h1>
            <p className="text-secondary">
              Cài đặt giá điện, nước, internet và các phí dịch vụ cho tòa nhà
            </p>
            {costData.lastUpdated && (
              <p className="text-sm text-light mt-2">
                Cập nhật lần cuối: {formatDate(costData.lastUpdated)}
              </p>
            )}
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Chỉnh sửa</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button 
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="btn btn-primary"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="flex border-b border-primary">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-tertiary text-primary border-b-2 border-blue-500'
                : 'text-secondary hover-bg-tertiary'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>⚙️</span>
              <span>Chi phí chung</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('room-prices')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'room-prices'
                ? 'bg-tertiary text-primary border-b-2 border-blue-500'
                : 'text-secondary hover-bg-tertiary'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🏠</span>
              <span>Giá phòng</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bank-settings')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'bank-settings'
                ? 'bg-tertiary text-primary border-b-2 border-blue-500'
                : 'text-secondary hover-bg-tertiary'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🏦</span>
              <span>Tài khoản nhận tiền</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <>
          {/* Cost Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {costItems.map((item) => (
          <div key={item.key} className="bg-primary rounded-xl shadow border overflow-hidden">
            {/* Header */}
            <div className={`${item.color.split(' ')[0]} px-6 py-4 border-b border-primary`}>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {item.unit}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-secondary mb-3">
                  {item.description}
                </p>
                
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Giá tiền
                    </label>
                    <input
                      type="number"
                      value={costData[item.key]}
                      onChange={(e) => setCostData({
                        ...costData,
                        [item.key]: parseInt(e.target.value) || 0
                      })}
                      className="input w-full"
                      placeholder="Nhập giá tiền..."
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {costData[item.key]?.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-sm text-secondary">
                      VNĐ
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Example */}
              {!isEditing && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-xs text-secondary mb-1 font-medium">Ví dụ tính toán:</p>
                  <p className="text-xs text-light">
                    {item.key === 'electricityRate' && `100 kWh × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency((costData[item.key] || 0) * 100)}`}
                    {item.key === 'waterRatePerPerson' && `3 người × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency((costData[item.key] || 0) * 3)}`}
                    {item.key === 'internetRatePerRoom' && `1 phòng × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency(costData[item.key] || 0)}`}
                    {item.key === 'serviceFeePerPerson' && `3 người × ${costData[item.key]?.toLocaleString('vi-VN')} = ${formatCurrency((costData[item.key] || 0) * 3)}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <h3 className="text-xl font-semibold text-primary mb-6">
          Tổng quan chi phí
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sample Calculation */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium text-primary mb-3">Ví dụ tính hóa đơn (phòng 3 người)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Điện (150 kWh):</span>
                <span className="font-medium">{formatCurrency((costData.electricityRate || 0) * 150)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Nước (3 người):</span>
                <span className="font-medium">{formatCurrency((costData.waterRatePerPerson || 0) * 3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Internet:</span>
                <span className="font-medium">{formatCurrency(costData.internetRatePerRoom || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Phí dịch vụ (3 người):</span>
                <span className="font-medium">{formatCurrency((costData.serviceFeePerPerson || 0) * 3)}</span>
              </div>
              <div className="border-t border-light pt-2 flex justify-between font-semibold">
                <span className="text-primary">Tổng (chưa tính tiền thuê):</span>
                <span className="text-primary">
                  {formatCurrency(
                    (costData.electricityRate || 0) * 150 +
                    (costData.waterRatePerPerson || 0) * 3 +
                    (costData.internetRatePerRoom || 0) +
                    (costData.serviceFeePerPerson || 0) * 3
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Cost Statistics */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium text-primary mb-3">Thống kê chi phí cố định</h4>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatCurrency(costData.internetRatePerRoom || 0)}
                </div>
                <p className="text-sm text-secondary">Chi phí cố định mỗi phòng</p>
              </div>
              
                              <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(costData.waterRatePerPerson || 0)}
                    </div>
                    <p className="text-xs text-secondary">Nước/người</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(costData.serviceFeePerPerson || 0)}
                    </div>
                    <p className="text-xs text-secondary">Dịch vụ/người</p>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-yellow-600">
                      {(costData.electricityRate || 0).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <p className="text-xs text-secondary">Điện/kWh</p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Giá điện:</strong> Được tính theo số kWh thực tế sử dụng trong tháng</li>
              <li>• <strong>Giá nước:</strong> Tính theo số người đang ở trong phòng (không tính người ký hợp đồng)</li>
              <li>• <strong>Internet:</strong> Phí cố định cho mỗi phòng bất kể số người</li>
              <li>• <strong>Phí dịch vụ:</strong> Bao gồm bảo trì, an ninh, quản lý chung cư, vệ sinh (tính theo số người)</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Room Prices Tab */}
      {activeTab === 'room-prices' && (
        <>
          {/* Room Prices Header */}
          <div className="bg-primary rounded-xl shadow border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Giá phòng theo từng căn hộ
                </h3>
                <p className="text-secondary">
                  Thiết lập giá thuê riêng cho từng phòng. Nếu không thiết lập sẽ dùng giá mặc định.
                </p>
              </div>
              {isEditing && (
                <button 
                  onClick={() => {
                    const price = prompt('Nhập giá thuê cho tất cả phòng (VNĐ):', '6000000');
                    if (price && !isNaN(price)) {
                      const newPrices = {};
                      (data.apartments || []).forEach(apt => {
                        newPrices[apt.id] = parseInt(price);
                      });
                      setRoomPricesData(newPrices);
                    }
                  }}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Set giá tất cả</span>
                </button>
              )}
            </div>
          </div>

          {/* Room Prices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.apartments || []).map((apartment) => {
              const customPrice = getRoomPrice(apartment.id);
              const defaultPrice = apartment.rent || 0;
              const isCustom = data.roomPrices[apartment.id] !== undefined;
              
              return (
                <div key={apartment.id} className="bg-primary rounded-xl shadow border overflow-hidden">
                  {/* Header */}
                  <div className="bg-blue-50 px-6 py-4 border-b border-primary">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Phòng {apartment.roomNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {apartment.size}m² • {apartment.description || 'Căn hộ tiêu chuẩn'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">
                          Giá mặc định
                        </label>
                        <div className="text-lg text-gray-600">
                          {formatCurrency(defaultPrice)}
                        </div>
                      </div>

                      <div>
                                                 <label className="block text-sm font-medium text-secondary mb-2">
                           Giá tùy chỉnh
                           {isCustom && <span className="text-blue-600 ml-1">(Đang áp dụng)</span>}
                         </label>
                         
                         {/* Check if this price comes from contract */}
                         {(() => {
                           const hasActiveContract = data.contracts.some(contract => 
                             contract.apartmentId === apartment.id && 
                             contract.status === 'active' &&
                             contract.monthlyRent === customPrice
                           );
                           
                           if (hasActiveContract && isCustom) {
                             return (
                               <div className="mb-2 text-xs text-green-600 bg-green-50 rounded px-2 py-1">
                                 🔄 Đồng bộ từ hợp đồng hiện tại
                               </div>
                             );
                           }
                           return null;
                         })()}
                        
                        {isEditing ? (
                          <input
                            type="number"
                            value={getRoomPriceForEdit(apartment.id)}
                            onChange={(e) => setRoomPricesData({
                              ...roomPricesData,
                              [apartment.id]: e.target.value
                            })}
                            className="input w-full"
                            placeholder="Nhập giá tùy chỉnh..."
                          />
                        ) : (
                          <div className={`text-xl font-bold ${isCustom ? 'text-blue-600' : 'text-gray-400'}`}>
                            {isCustom ? formatCurrency(customPrice) : 'Chưa thiết lập'}
                          </div>
                        )}
                      </div>

                      {!isEditing && isCustom && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-700 mb-1 font-medium">Giá hiện tại:</p>
                          <p className="text-sm text-blue-600 font-semibold">
                            {formatCurrency(customPrice)}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Chênh lệch: {formatCurrency(Math.abs(customPrice - defaultPrice))} 
                            {customPrice > defaultPrice ? ' cao hơn' : ' thấp hơn'} giá mặc định
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Room Prices Summary */}
          <div className="bg-primary rounded-xl shadow border p-6">
            <h3 className="text-xl font-semibold text-primary mb-6">
              Tổng quan giá phòng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(data.apartments || []).length}
                </div>
                <p className="text-sm text-secondary">Tổng số phòng</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {Object.keys(data.roomPrices || {}).length}
                </div>
                <p className="text-sm text-secondary">Phòng có giá tùy chỉnh</p>
              </div>
              
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {formatCurrency(
                    (data.apartments || []).reduce((total, apt) => 
                      total + getRoomPrice(apt.id), 0
                    )
                  )}
                </div>
                <p className="text-sm text-secondary">Tổng doanh thu tối đa/tháng</p>
              </div>
            </div>
          </div>

          {/* Instructions for Room Prices */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                                 <h4 className="font-medium text-green-900 mb-2">Hướng dẫn thiết lập giá phòng</h4>
                 <ul className="text-sm text-green-800 space-y-1">
                   <li>• <strong>Giá mặc định:</strong> Là giá ban đầu được thiết lập khi tạo căn hộ</li>
                   <li>• <strong>Giá tùy chỉnh:</strong> Ghi đè giá mặc định, có thể cao hơn hoặc thấp hơn</li>
                   <li>• <strong>Đồng bộ tự động:</strong> Khi sửa giá trong hợp đồng sẽ tự động cập nhật vào đây</li>
                   <li>• <strong>Ưu tiên:</strong> Giá tùy chỉnh sẽ được ưu tiên sử dụng khi tính hóa đơn</li>
                   <li>• <strong>Cập nhật:</strong> Có thể thay đổi giá bất cứ lúc nào mà không ảnh hưởng hợp đồng cũ</li>
                 </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bank Settings Tab */}
      {activeTab === 'bank-settings' && (
        <>
          {/* Bank Settings Header */}
          <div className="bg-primary rounded-xl shadow border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-primary mb-2">
                  🏦 Cài đặt tài khoản nhận tiền - VietQR chuẩn
                </h3>
                <p className="text-secondary">
                  Thiết lập ngân hàng + số tài khoản để tự động lấy tên chủ TK và tạo VietQR chuẩn Napas cho hóa đơn
                </p>
                {bankInfoData.lastUpdated && (
                  <p className="text-sm text-light mt-2">
                    Cập nhật lần cuối: {formatDate(bankInfoData.lastUpdated)}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {bankInfoData.accountNumber && !isEditing && (
                  <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Đã cài đặt
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bank Info Form */}
          <div className="bg-primary rounded-xl shadow border p-6">
            <h4 className="text-lg font-semibold text-primary mb-6">
              Thông tin tài khoản ngân hàng
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Tên ngân hàng *
                </label>
                {isEditing ? (
                  <select
                    value={bankInfoData.bankName}
                    onChange={(e) => {
                      const selectedBank = bankOptions.find(bank => bank.name === e.target.value);
                      setBankInfoData({
                        ...bankInfoData,
                        bankName: e.target.value,
                        bankCode: selectedBank ? selectedBank.code : ''
                      });
                    }}
                    className="input w-full"
                    required
                  >
                    <option value="">Chọn ngân hàng</option>
                    {bankOptions.map((bank) => (
                      <option key={bank.code} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-lg font-medium text-primary">
                    {bankInfoData.bankName || 'Chưa thiết lập'}
                  </div>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Số tài khoản *
                </label>
                                 {isEditing ? (
                   <div className="space-y-2">
                     <input
                       type="text"
                       value={bankInfoData.accountNumber}
                       onChange={(e) => {
                         const cleanNumber = e.target.value.replace(/\D/g, '');
                         setBankInfoData({
                           ...bankInfoData,
                           accountNumber: cleanNumber
                         });
                         
                         // Clear verification result when account number changes
                         if (verificationResult) {
                           setVerificationResult(null);
                         }
                       }}
                       className="input w-full"
                       placeholder="Nhập số tài khoản..."
                       maxLength="25"
                       required
                     />
                     {bankInfoData.accountNumber && (
                       <div className="text-xs">
                         {(() => {
                           const validation = validateAccountNumber(bankInfoData.accountNumber, bankInfoData.bankCode);
                           return (
                             <div className={`p-2 rounded ${validation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                               <span className="font-medium">
                                 {validation.valid ? '✅' : '❌'} {validation.message}
                               </span>
                             </div>
                           );
                         })()}
                       </div>
                     )}
                   </div>
                 ) : (
                  <div className="text-lg font-mono font-medium text-primary">
                    {bankInfoData.accountNumber || 'Chưa thiết lập'}
                  </div>
                )}
              </div>

                            {/* Account Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Tên chủ tài khoản *
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={bankInfoData.accountName}
                        onChange={(e) => setBankInfoData({
                          ...bankInfoData,
                          accountName: normalizeAccountName(e.target.value)
                        })}
                        className="input flex-1"
                        placeholder="Tên sẽ tự động lấy từ ngân hàng..."
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!bankInfoData.accountNumber || !bankInfoData.bankCode) {
                            alert('Vui lòng chọn ngân hàng và nhập số tài khoản trước');
                            return;
                          }
                          
                          setIsVerifying(true);
                          setVerificationResult(null);
                          
                          try {
                            // Validate account number format first
                            const accountValidation = validateAccountNumber(bankInfoData.accountNumber, bankInfoData.bankCode);
                            if (!accountValidation.valid) {
                              setVerificationResult({
                                success: false,
                                message: accountValidation.message,
                                type: 'format_error'
                              });
                              setIsVerifying(false);
                              return;
                            }

                            // Get account name from bank with improved feedback
                            const startTime = Date.now();
                            const result = await getAccountName(bankInfoData.bankCode, bankInfoData.accountNumber);
                            const latency = Date.now() - startTime;
                            
                            if (result.success) {
                              setBankInfoData({
                                ...bankInfoData,
                                accountName: result.accountName
                              });
                              
                              setVerificationResult({
                                success: true,
                                message: result.message,
                                accountName: result.accountName,
                                isDemo: result.isDemo,
                                provider: result.provider,
                                latency: latency,
                                realData: result.realData || false
                              });
                              
                              // Refresh metrics after successful call
                              setApiMetrics(getAPIMetrics());
                            } else {
                              setVerificationResult({
                                success: false,
                                message: result.message,
                                type: 'api_error',
                                provider: result.provider,
                                latency: latency
                              });
                            }
                          } catch (error) {
                            setVerificationResult({
                              success: false,
                              message: 'Lỗi kết nối. Vui lòng thử lại sau.',
                              type: 'network_error',
                              error: error.message
                            });
                          }
                          
                          setIsVerifying(false);
                        }}
                        disabled={isVerifying || !bankInfoData.accountNumber || !bankInfoData.bankCode}
                        className={`btn text-sm px-4 transition-all ${
                          isVerifying 
                            ? 'btn-secondary cursor-not-allowed' 
                            : 'btn-primary hover:scale-105'
                        }`}
                      >
                        {isVerifying ? (
                          <span className="flex items-center space-x-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Đang lấy...</span>
                          </span>
                        ) : (
                          '🔄 Lấy tên từ ngân hàng'
                        )}
                      </button>
                    </div>
                                                             
                    {/* Enhanced Auto-fetch Result */}
                    {verificationResult && (
                      <div className={`p-4 rounded-lg text-sm border-2 transition-all ${
                        verificationResult.success 
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="mr-2 text-lg">
                              {verificationResult.success ? '✅' : '❌'}
                            </span>
                            <span className="font-medium">
                              {verificationResult.success ? 'Lấy tên thành công!' : 'Lỗi khi lấy tên'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {verificationResult.provider && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                verificationResult.provider === 'VietQR' ? 'bg-blue-100 text-blue-700' :
                                verificationResult.provider === 'MockAPI' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {verificationResult.provider}
                              </span>
                            )}
                            
                            {verificationResult.realData !== undefined && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                verificationResult.realData ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {verificationResult.realData ? 'Real Data' : 'Demo Data'}
                              </span>
                            )}
                            
                            {verificationResult.latency && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                verificationResult.latency < 2000 ? 'bg-green-100 text-green-600' :
                                verificationResult.latency < 5000 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {verificationResult.latency}ms
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {verificationResult.success && verificationResult.accountName && (
                          <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                            <div className="text-xs text-gray-600 mb-1">Tên chủ tài khoản:</div>
                            <div className="font-mono font-bold text-lg">
                              {verificationResult.accountName}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs opacity-75 italic">
                          {verificationResult.message}
                        </div>
                        
                        {verificationResult.error && (
                          <div className="mt-2 text-xs bg-red-100 bg-opacity-50 rounded p-2">
                            <strong>Debug:</strong> {verificationResult.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-lg font-medium text-primary">
                    {bankInfoData.accountName || 'Chưa thiết lập'}
                  </div>
                )}
              </div>
            </div>

            {/* QR Code Settings */}
            <div className="mt-6 pt-6 border-t border-primary">
              <h5 className="text-md font-semibold text-primary mb-4">
                Cài đặt VietQR
              </h5>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="qrEnabled"
                  checked={bankInfoData.qrEnabled}
                  onChange={(e) => setBankInfoData({
                    ...bankInfoData,
                    qrEnabled: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={!isEditing}
                />
                <label htmlFor="qrEnabled" className="text-sm text-secondary">
                  Hiển thị VietQR chuẩn Napas trong hóa đơn
                </label>
              </div>
              <p className="text-xs text-light mt-2 ml-7">
                Khi bật, mỗi hóa đơn sẽ tự động tạo VietQR chuẩn với thông tin chuyển khoản và số tiền chính xác
              </p>
            </div>
          </div>

          {/* Preview */}
          {bankInfoData.accountNumber && bankInfoData.accountName && bankInfoData.bankName && (
            <div className="bg-primary rounded-xl shadow border p-6">
              <h4 className="text-lg font-semibold text-primary mb-4">
                📱 Xem trước VietQR chuẩn Napas
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-secondary mb-3">
                  Đây là cách VietQR chuẩn sẽ hiển thị trong hóa đơn (tương thích với mọi app ngân hàng):
                </p>
                <div className="max-w-md">
                  <QRCodePayment
                    bankInfo={bankInfoData}
                    amount={5000000}
                    description="Thanh toan hoa don HD2024001"
                    invoiceNumber="HD2024001"
                    size={150}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Options List (for reference) */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Lưu ý quan trọng</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Tên chủ tài khoản:</strong> Tự động lấy từ hệ thống ngân hàng, không cần nhập thủ công</li>
              <li>• <strong>Lấy tên tự động:</strong> Chỉ cần chọn ngân hàng + số tài khoản, hệ thống sẽ tự động lấy tên</li>
              <li>• <strong>VietQR chuẩn:</strong> Mã QR tuân thủ chuẩn Napas/VietQR, tương thích với mọi app ngân hàng</li>
              <li>• <strong>Số tài khoản:</strong> Chấp nhận 6-25 chữ số, tự động validate theo từng ngân hàng</li>
              <li>• <strong>Bảo mật:</strong> Thông tin này sẽ hiển thị công khai trong hóa đơn</li>
              <li>• <strong>QR Code:</strong> Khách thuê quét mã là chuyển tiền ngay, tự động điền đầy đủ thông tin</li>
              <li>• <strong>Cập nhật:</strong> Có thể thay đổi thông tin bất cứ lúc nào</li>
            </ul>
              </div>
            </div>
          </div>

          {/* API Debug Panel */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">🔧 API Debug & Test</h4>
              <button
                onClick={() => setShowAPIDebug(!showAPIDebug)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAPIDebug ? 'Ẩn Debug' : 'Hiện Debug'}
              </button>
            </div>
            
            {showAPIDebug && (
              <div className="space-y-4">
                {/* API Keys Status */}
                <div className="bg-white rounded-lg p-4 border">
                  <h5 className="font-medium text-gray-900 mb-3">🔑 API Keys Status</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>VietQR Client ID:</span>
                        <span className={process.env.REACT_APP_VIETQR_CLIENT_ID ? 'text-green-600' : 'text-red-600'}>
                          {process.env.REACT_APP_VIETQR_CLIENT_ID ? '✅ Configured' : '❌ Missing'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>VietQR API Key:</span>
                        <span className={process.env.REACT_APP_VIETQR_API_KEY ? 'text-green-600' : 'text-red-600'}>
                          {process.env.REACT_APP_VIETQR_API_KEY ? '✅ Configured' : '❌ Missing'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mock API:</span>
                        <span className="text-green-600">✅ Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Demo Fallback:</span>
                        <span className="text-blue-600">✅ Always Available</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enhanced Debugging:</span>
                        <span className="text-green-600">✅ Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                                 {/* API Metrics Dashboard */}
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-900">📊 API Performance Metrics</h5>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          setIsLoadingMetrics(true);
                          try {
                            const [metrics, health] = await Promise.all([
                              getAPIMetrics(),
                              checkAPIHealth()
                            ]);
                            setApiMetrics(metrics);
                            setApiHealth(health);
                          } catch (error) {
                            console.error('Failed to load metrics:', error);
                          }
                          setIsLoadingMetrics(false);
                        }}
                        disabled={isLoadingMetrics}
                        className="btn btn-secondary text-xs"
                      >
                        {isLoadingMetrics ? '⏳' : '🔄'} Refresh
                      </button>
                    </div>
                  </div>
                  
                  {/* Real-time Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {apiMetrics?.totalCalls || 0}
                      </div>
                      <div className="text-xs text-blue-700">Total Calls Today</div>
                    </div>
                    
                    <div className="bg-green-50 rounded p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {apiMetrics?.successRate || 100}%
                      </div>
                      <div className="text-xs text-green-700">Success Rate</div>
                    </div>
                    
                    <div className="bg-purple-50 rounded p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {apiMetrics?.realDataRate || 0}%
                      </div>
                      <div className="text-xs text-purple-700">Real Data Rate</div>
                    </div>
                    
                    <div className={`rounded p-3 text-center ${
                      apiHealth?.status === 'fast' ? 'bg-green-50' :
                      apiHealth?.status === 'normal' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      <div className={`text-2xl font-bold ${
                        apiHealth?.status === 'fast' ? 'text-green-600' :
                        apiHealth?.status === 'normal' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {apiHealth?.latency || 0}ms
                      </div>
                      <div className={`text-xs ${
                        apiHealth?.status === 'fast' ? 'text-green-700' :
                        apiHealth?.status === 'normal' ? 'text-yellow-700' : 'text-red-700'
                      }`}>Avg Latency</div>
                    </div>
                  </div>
                  
                  {/* Provider Breakdown */}
                  {apiMetrics?.today && (
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-blue-100 rounded p-2">
                        <div className="font-bold text-blue-800">{apiMetrics.today.vietqr || 0}</div>
                        <div className="text-blue-600">VietQR API</div>
                      </div>
                      <div className="bg-purple-100 rounded p-2">
                        <div className="font-bold text-purple-800">{apiMetrics.today.mockapi || 0}</div>
                        <div className="text-purple-600">Mock API</div>
                      </div>
                      <div className="bg-gray-100 rounded p-2">
                        <div className="font-bold text-gray-800">{apiMetrics.today.demo || 0}</div>
                        <div className="text-gray-600">Demo Fallback</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* API Test */}
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-900">🔍 API Connection Test</h5>
                    <button
                      onClick={async () => {
                        setIsTestingAPI(true);
                        setApiTestResult(null);
                        
                        try {
                          const result = await testAPIConnection();
                          setApiTestResult(result);
                          // Refresh metrics after test
                          setApiMetrics(getAPIMetrics());
                        } catch (error) {
                          setApiTestResult({
                            overall: { working: false, provider: 'Error' },
                            vietqr: { status: 'error', message: error.message },
                            mockapi: { status: 'error', message: error.message }
                          });
                        }
                        
                        setIsTestingAPI(false);
                      }}
                      disabled={isTestingAPI}
                      className="btn btn-secondary text-sm"
                    >
                      {isTestingAPI ? '⏳ Testing...' : '🚀 Test API'}
                    </button>
                  </div>
                  
                  {apiTestResult && (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg text-sm ${
                        apiTestResult.overall.working ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}>
                        <div className="font-medium mb-1">
                          Overall Status: {apiTestResult.overall.working ? '✅ Working' : '❌ Failed'}
                        </div>
                        <div className="text-xs">
                          Provider: {apiTestResult.overall.provider || 'None'}
                        </div>
                      </div>
                      
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 border rounded">
                          <div className="font-medium text-sm mb-1">VietQR API</div>
                          <div className="text-xs space-y-1">
                            <div>Status: <span className={`font-medium ${
                              apiTestResult.vietqr.status === 'working' ? 'text-green-600' : 
                              apiTestResult.vietqr.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                            }`}>{apiTestResult.vietqr.status}</span></div>
                            <div>Message: {apiTestResult.vietqr.message}</div>
                            {apiTestResult.vietqr.latency > 0 && (
                              <div>Latency: {apiTestResult.vietqr.latency}ms</div>
                            )}
                            {apiTestResult.vietqr.errors?.length > 0 && (
                              <div className="text-red-600 mt-1">
                                Errors: {apiTestResult.vietqr.errors.length}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-3 border rounded">
                          <div className="font-medium text-sm mb-1">Mock API</div>
                          <div className="text-xs space-y-1">
                            <div>Status: <span className={`font-medium ${
                              apiTestResult.mockapi.status === 'working' ? 'text-green-600' : 
                              apiTestResult.mockapi.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                            }`}>{apiTestResult.mockapi.status}</span></div>
                            <div>Message: {apiTestResult.mockapi.message}</div>
                            {apiTestResult.mockapi.latency > 0 && (
                              <div>Latency: {apiTestResult.mockapi.latency}ms</div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 border rounded">
                          <div className="font-medium text-sm mb-1">Demo Fallback</div>
                          <div className="text-xs space-y-1">
                            <div>Status: <span className="font-medium text-blue-600">{apiTestResult.demo.status}</span></div>
                            <div>Message: {apiTestResult.demo.message}</div>
                            <div>Reliability: 100%</div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Error Information */}
                      {apiTestResult.overall.errors?.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                          <div className="font-medium text-sm text-red-900 mb-2">🐛 Debug Information</div>
                          <div className="text-xs text-red-800 space-y-1">
                            <div>Total Test Time: {apiTestResult.overall.totalLatency}ms</div>
                            <div>Errors Encountered:</div>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                              {apiTestResult.overall.errors.map((error, index) => (
                                <li key={index} className="font-mono">{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Help */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">📚 Quick Help</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>• <strong>API Failed?</strong> Hệ thống tự động fallback về Mock API hoặc Demo</div>
                    <div>• <strong>VietQR Keys:</strong> Tạo file <code className="bg-blue-100 px-1 rounded">.env</code> với REACT_APP_VIETQR_CLIENT_ID và REACT_APP_VIETQR_API_KEY</div>
                    <div>• <strong>Debug Info:</strong> Mở Console (F12) để xem log chi tiết về API calls</div>
                    <div>• <strong>Demo Mode:</strong> Luôn hoạt động, tạo tên realistic dựa theo số tài khoản</div>
                    <div>• <strong>Mock API:</strong> Simulate real API với 66% success rate, có delay realistic</div>
                    <div>• <strong>VietQR:</strong> Vẫn tạo được QR code chuẩn dù API fail</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Bank options for Vietnam
const bankOptions = [
  { name: 'Ngân hàng Vietcombank', code: 'VCB' },
  { name: 'Ngân hàng BIDV', code: 'BIDV' },
  { name: 'Ngân hàng VietinBank', code: 'CTG' },
  { name: 'Ngân hàng Agribank', code: 'AGR' },
  { name: 'Ngân hàng ACB', code: 'ACB' },
  { name: 'Ngân hàng Techcombank', code: 'TCB' },
  { name: 'Ngân hàng MBBank', code: 'MBB' },
  { name: 'Ngân hàng VPBank', code: 'VPB' },
  { name: 'Ngân hàng TPBank', code: 'TPB' },
  { name: 'Ngân hàng SHB', code: 'SHB' },
  { name: 'Ngân hàng HDBank', code: 'HDB' },
  { name: 'Ngân hàng VIB', code: 'VIB' },
  { name: 'Ngân hàng MSB', code: 'MSB' },
  { name: 'Ngân hàng OCB', code: 'OCB' },
  { name: 'Ngân hàng SeABank', code: 'SEAB' },
  { name: 'Ngân hàng LienVietPostBank', code: 'LPB' },
  { name: 'Ngân hàng Sacombank', code: 'STB' },
  { name: 'Ngân hàng Eximbank', code: 'EIB' }
];

export default CostManagement; 