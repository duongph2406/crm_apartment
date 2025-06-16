import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  vi: {
    // Navigation
    home: 'Trang chủ',
    apartments: 'Quản lý căn hộ',
    tenants: 'Quản lý khách thuê',
    contracts: 'Hợp đồng',
    invoices: 'Hóa đơn',
    account: 'Tài khoản',
    accountManagement: 'Quản lý tài khoản',
    
    // Common
    language: 'Ngôn ngữ',
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
  },
  en: {
    // Navigation
    home: 'Home',
    apartments: 'Apartment Management',
    tenants: 'Tenant Management',
    contracts: 'Contracts',
    invoices: 'Invoices',
    account: 'Account',
    accountManagement: 'Account Management',
    
    // Common
    language: 'Language',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    status: 'Status',
    actions: 'Actions',
    
    // Apartment statuses
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    
    // Apartment management
    apartmentList: 'Apartment List',
    roomNumber: 'Room Number',
    tenant: 'Tenant',
    rentAmount: 'Rent Amount',
    details: 'Details',
    
    // Tenant management
    tenantList: 'Tenant List',
    fullName: 'Full Name',
    phone: 'Phone',
    email: 'Email',
    idNumber: 'ID Number',
    address: 'Address',
    
    // Contracts
    contractList: 'Contract List',
    contractNumber: 'Contract Number',
    startDate: 'Start Date',
    endDate: 'End Date',
    
    // Invoices
    invoiceList: 'Invoice List',
    invoiceNumber: 'Invoice Number',
    amount: 'Amount',
    dueDate: 'Due Date',
    paid: 'Paid',
    unpaid: 'Unpaid',
    
    // User-specific
    myContracts: 'My Contracts',
    myInvoices: 'My Invoices',
    userDashboard: 'User Dashboard',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
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