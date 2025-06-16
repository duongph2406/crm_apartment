import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';

const MyInvoices = () => {
  const { t } = useLanguage();
  const { data, currentUser } = useApp();
  const [filter, setFilter] = useState('all');

  // Get tenant information and invoices for the current user
  const currentTenant = data.tenants.find(tenant => tenant.id === currentUser?.tenantId);
  const userInvoices = currentTenant 
    ? data.invoices.filter(invoice => invoice.tenantId === currentTenant.id)
    : [];

  const filteredInvoices = userInvoices.filter(invoice => {
    if (filter === 'all') return true;
    return invoice.status === filter;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'unpaid': return 'Chưa thanh toán';
      case 'overdue': return 'Quá hạn';
      case 'pending': return 'Chờ xử lý';
      default: return status;
    }
  };

  const isOverdue = (invoice) => {
    if (invoice.status === 'paid') return false;
    return new Date(invoice.dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hóa đơn của tôi
        </h1>
        <p className="text-gray-600">
          Theo dõi lịch sử thanh toán và các hóa đơn của bạn
        </p>
      </div>

      {/* Basic content for now */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Tính năng xem hóa đơn cho khách thuê đang được phát triển...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Tổng số hóa đơn: {userInvoices.length}
        </p>
      </div>
    </div>
  );
};

export default MyInvoices; 