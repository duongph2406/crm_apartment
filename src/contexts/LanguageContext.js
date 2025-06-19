import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

// Chỉ sử dụng tiếng Việt cho toàn bộ dự án
const translations = {
  // Navigation
  home: 'Trang chủ',
  apartments: 'Quản lý căn hộ',
  tenants: 'Quản lý khách thuê',
  contracts: 'Hợp đồng',
  invoices: 'Hóa đơn',
  account: 'Tài khoản',
  accountManagement: 'Quản lý tài khoản',
  
  // Common
  save: 'Lưu',
  cancel: 'Hủy',
  edit: 'Sửa',
  delete: 'Xóa',
  add: 'Thêm',
  search: 'Tìm kiếm',
  filter: 'Lọc',
  status: 'Trạng thái',
  actions: 'Hành động',
  
  // Apartment statuses
  available: 'Trống',
  occupied: 'Đã thuê',
  maintenance: 'Bảo trì',
  
  // Apartment management
  apartmentList: 'Danh sách căn hộ',
  roomNumber: 'Số phòng',
  tenant: 'Khách thuê',
  rentAmount: 'Tiền thuê',
  details: 'Chi tiết',
  
  // Tenant management
  tenantList: 'Danh sách khách thuê',
  fullName: 'Họ và tên',
  phone: 'Số điện thoại',
  email: 'Email',
  idNumber: 'CMND/CCCD',
  address: 'Địa chỉ',
  
  // Contracts
  contractList: 'Danh sách hợp đồng',
  contractNumber: 'Số hợp đồng',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  
  // Invoices
  invoiceList: 'Danh sách hóa đơn',
  invoiceNumber: 'Số hóa đơn',
  amount: 'Số tiền',
  dueDate: 'Hạn thanh toán',
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  
  // User-specific
  myContracts: 'Hợp đồng của tôi',
  myInvoices: 'Hóa đơn của tôi',
  userDashboard: 'Trang cá nhân',
};

export const LanguageProvider = ({ children }) => {
  // Đơn giản hóa - chỉ cung cấp function t() để lấy text tiếng Việt
  const t = (key) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, language: 'vi' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 