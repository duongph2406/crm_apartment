import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate, formatMonthYear } from '../utils/dateFormat';

const Invoices = () => {
  const { t } = useLanguage();
  const { data, updateInvoice, addInvoice, deleteInvoice } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    apartmentId: '',
    tenantId: '',
    month: '',
    year: new Date().getFullYear(),
    rent: '',
    electricity: '',
    water: '',
    internet: '',
    cleaning: '',
    other: '',
    otherDescription: '',
    dueDate: '',
    status: 'pending'
  });

  // Filter invoices
  const filteredInvoices = data.invoices.filter(invoice => {
    const apartment = data.apartments.find(apt => apt.id === invoice.apartmentId);
    const tenant = data.tenants.find(t => t.id === invoice.tenantId);
    
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apartment?.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const invoiceMonth = `${invoice.year}-${invoice.month.toString().padStart(2, '0')}`;
    const matchesMonth = monthFilter === 'all' || invoiceMonth === monthFilter;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const openModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData(invoice);
    } else {
      setEditingInvoice(null);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      setFormData({
        invoiceNumber: `HĐ${Date.now()}`,
        apartmentId: '',
        tenantId: '',
        month: currentMonth,
        year: currentYear,
        rent: '',
        electricity: '',
        water: '',
        internet: '',
        cleaning: '',
        other: '',
        otherDescription: '',
        dueDate: generateDueDate(currentMonth, currentYear),
        status: 'pending',
        paidDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    setViewingInvoice(null);
    setFormData({
      invoiceNumber: '',
      apartmentId: '',
      tenantId: '',
      month: '',
      year: new Date().getFullYear(),
      rent: '',
      electricity: '',
      water: '',
      internet: '',
      cleaning: '',
      other: '',
      otherDescription: '',
      dueDate: '',
      status: 'pending',
      paidDate: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate total amount
    const total = 
      (parseInt(formData.rent) || 0) +
      (parseInt(formData.electricity) || 0) +
      (parseInt(formData.water) || 0) +
      (parseInt(formData.internet) || 0) +
      (parseInt(formData.cleaning) || 0) +
      (parseInt(formData.other) || 0);
    
    const invoiceData = {
      ...formData,
      total,
      rent: parseInt(formData.rent) || 0,
      electricity: parseInt(formData.electricity) || 0,
      water: parseInt(formData.water) || 0,
      internet: parseInt(formData.internet) || 0,
      cleaning: parseInt(formData.cleaning) || 0,
      other: parseInt(formData.other) || 0,
      month: parseInt(formData.month),
      year: parseInt(formData.year)
    };
    
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
    } else {
      const newInvoice = {
        id: Date.now(),
        ...invoiceData,
        createdAt: new Date().toISOString()
      };
      addInvoice(newInvoice);
    }
    
    closeModal();
  };

  const handleDelete = (invoice) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      deleteInvoice(invoice.id);
    }
  };

  // Function to quickly mark invoice as paid
  const handleQuickPaid = (invoice) => {
    if (window.confirm(`Xác nhận đánh dấu hóa đơn ${invoice.invoiceNumber} đã thanh toán?`)) {
      updateInvoice(invoice.id, { 
        status: 'paid',
        paidDate: new Date().toISOString()
      });
    }
  };

  // Function to check and update overdue invoices (kept for manual use only)
  const checkOverdueInvoices = () => {
    const today = new Date();
    let overdueCount = 0;
    
    data.invoices.forEach(invoice => {
      if (invoice.status === 'pending') {
        // Get the due date (5th of the invoice month)
        const invoiceDate = new Date(invoice.year, invoice.month - 1, 5);
        
        // If today is after the 5th of the invoice month, mark as overdue
        if (today > invoiceDate) {
          updateInvoice(invoice.id, { status: 'overdue' });
          overdueCount++;
        }
      }
    });
    
    // Show notification
    if (overdueCount > 0) {
      alert(`Đã cập nhật ${overdueCount} hóa đơn thành quá hạn!`);
    } else {
      alert('Không có hóa đơn nào quá hạn.');
    }
  };

  // Removed automatic check for overdue invoices

  // Generate due date for new invoices (5th of the month)
  const generateDueDate = (month, year) => {
    return new Date(year, month - 1, 5).toISOString().split('T')[0];
  };

  // Get occupied apartments
  const occupiedApartments = data.apartments.filter(apt => apt.status === 'occupied');

  // Get invoice stats
  const invoiceStats = {
    total: data.invoices.length,
    pending: data.invoices.filter(i => i.status === 'pending').length,
    paid: data.invoices.filter(i => i.status === 'paid').length,
    overdue: data.invoices.filter(i => i.status === 'overdue').length,
    totalAmount: data.invoices
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total || 0), 0)
  };

  // Get months for filter
  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthLabel = formatMonthYear(date);
      months.push({ value: monthValue, label: monthLabel });
    }
    return months;
  };



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Quản lý Hóa đơn
            </h1>
            <p className="text-secondary">
              Quản lý tất cả hóa đơn thanh toán trong hệ thống
            </p>
          </div>
          <button 
            onClick={() => openModal()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Tạo hóa đơn mới</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-primary">{invoiceStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📄
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-orange-600">{invoiceStats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đã thanh toán</p>
              <p className="text-2xl font-bold text-success">{invoiceStats.paid}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">{invoiceStats.overdue}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              ⚠️
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng công nợ</p>
              <p className="text-xl font-bold text-primary">
                {invoiceStats.totalAmount.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-primary rounded-xl shadow border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm theo số hóa đơn, phòng, khách thuê..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
              <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="overdue">Quá hạn</option>
            <option value="paid">Đã thanh toán</option>
          </select>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">Tất cả tháng</option>
            {getMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-primary rounded-xl shadow border overflow-hidden">
        <div className="p-6 border-b border-primary">
          <h3 className="text-lg font-semibold text-primary">
            Danh sách hóa đơn ({filteredInvoices.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Số hóa đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Căn hộ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Khách thuê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tháng/Năm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Hạn thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-primary divide-y divide-primary">
              {filteredInvoices.map((invoice) => {
                const apartment = data.apartments.find(apt => apt.id === invoice.apartmentId);
                const tenant = data.tenants.find(t => t.id === invoice.tenantId);

                
                return (
                  <tr key={invoice.id} className="hover-bg-secondary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        Phòng {apartment?.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-primary">
                        {tenant?.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {invoice.month}/{invoice.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">
                      {invoice.total?.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                                              {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'badge-success' 
                            : invoice.status === 'overdue'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}>
                          {invoice.status === 'paid' 
                            ? 'Đã thanh toán' 
                            : invoice.status === 'overdue'
                            ? 'Quá hạn' 
                            : 'Chờ thanh toán'}
                        </span>
                        {invoice.status === 'paid' && invoice.paidDate && (
                          <p className="text-xs text-secondary mt-1">
                            {formatDate(invoice.paidDate)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => setViewingInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Xem
                      </button>
                      <button 
                        onClick={() => openModal(invoice)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Sửa
                      </button>
                      {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                        <button 
                          onClick={() => handleQuickPaid(invoice)}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          ✅ Đã thanh toán
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(invoice)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted mb-4">
              <svg className="w-16 h-16 mx-auto text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">
              {searchTerm ? 'Không tìm thấy hóa đơn' : 'Chưa có hóa đơn nào'}
            </h3>
            <p className="text-secondary">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Hãy tạo hóa đơn đầu tiên'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-primary rounded-xl shadow-xl w-[90%] max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-primary flex-shrink-0">
              <h3 className="text-lg font-semibold text-primary">
                {editingInvoice ? 'Chỉnh sửa hóa đơn' : 'Tạo hóa đơn mới'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Số hóa đơn
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Căn hộ
                    </label>
                    <select
                      value={formData.apartmentId}
                      onChange={(e) => {
                        const aptId = parseInt(e.target.value);
                        const apartment = data.apartments.find(apt => apt.id === aptId);
                        const tenant = apartment ? data.tenants.find(t => t.apartmentId === aptId) : null;
                        setFormData({
                          ...formData, 
                          apartmentId: aptId,
                          tenantId: tenant ? tenant.id : '',
                          rent: apartment ? apartment.rent : ''
                        });
                      }}
                      className="input w-full"
                      required
                    >
                      <option value="">Chọn căn hộ</option>
                      {occupiedApartments.map(apt => (
                        <option key={apt.id} value={apt.id}>
                          Phòng {apt.roomNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Khách thuê
                    </label>
                    <select
                      value={formData.tenantId}
                      onChange={(e) => setFormData({...formData, tenantId: parseInt(e.target.value)})}
                      className="input w-full"
                      required
                    >
                      <option value="">Chọn khách thuê</option>
                      {data.tenants
                        .filter(tenant => !formData.apartmentId || tenant.apartmentId === formData.apartmentId)
                        .map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.fullName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Tháng
                    </label>
                    <select
                      value={formData.month}
                      onChange={(e) => {
                        const newMonth = parseInt(e.target.value);
                        setFormData({
                          ...formData, 
                          month: newMonth,
                          dueDate: generateDueDate(newMonth, formData.year)
                        });
                      }}
                      className="input w-full"
                      required
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Năm
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => {
                        const newYear = parseInt(e.target.value);
                        setFormData({
                          ...formData, 
                          year: newYear,
                          dueDate: generateDueDate(formData.month, newYear)
                        });
                      }}
                      className="input w-full"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Hạn thanh toán
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setFormData({
                          ...formData, 
                          status: newStatus,
                          paidDate: newStatus === 'paid' && !formData.paidDate ? new Date().toISOString().split('T')[0] : formData.paidDate
                        });
                      }}
                      className="input w-full"
                    >
                      <option value="pending">Chờ thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                    </select>
                  </div>
                </div>

                {/* Paid Date - Only show when status is paid */}
                {formData.status === 'paid' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Ngày thanh toán
                      </label>
                      <input
                        type="date"
                        value={formData.paidDate || ''}
                        onChange={(e) => setFormData({...formData, paidDate: e.target.value})}
                        className="input w-full"
                        required={formData.status === 'paid'}
                      />
                    </div>
                  </div>
                )}

                {/* Cost Breakdown */}
                <div>
                  <h4 className="text-lg font-semibold text-primary mb-4">Chi tiết chi phí</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Tiền thuê nhà (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.rent}
                        onChange={(e) => setFormData({...formData, rent: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Tiền điện (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.electricity}
                        onChange={(e) => setFormData({...formData, electricity: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Tiền nước (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.water}
                        onChange={(e) => setFormData({...formData, water: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Tiền internet (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.internet}
                        onChange={(e) => setFormData({...formData, internet: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Phí vệ sinh (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.cleaning}
                        onChange={(e) => setFormData({...formData, cleaning: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Chi phí khác (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={formData.other}
                        onChange={(e) => setFormData({...formData, other: e.target.value})}
                        className="input w-full"
                      />
                    </div>
                  </div>
                  
                  {formData.other > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Mô tả chi phí khác
                      </label>
                      <textarea
                        value={formData.otherDescription}
                        onChange={(e) => setFormData({...formData, otherDescription: e.target.value})}
                        className="input w-full h-20"
                        placeholder="Mô tả chi phí khác..."
                      />
                    </div>
                  )}
                  
                  {/* Total Calculation */}
                  <div className="mt-6 p-4 bg-secondary rounded-lg">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Tổng cộng:</span>
                      <span className="text-primary">
                        {(
                          (parseInt(formData.rent) || 0) +
                          (parseInt(formData.electricity) || 0) +
                          (parseInt(formData.water) || 0) +
                          (parseInt(formData.internet) || 0) +
                          (parseInt(formData.cleaning) || 0) +
                          (parseInt(formData.other) || 0)
                        ).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            
            <div className="p-6 border-t border-primary flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                >
                  {editingInvoice ? 'Cập nhật' : 'Tạo hóa đơn'}
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-primary rounded-xl shadow-xl w-[90%] max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-primary flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-primary">
                  Chi tiết hóa đơn
                </h3>
                <button
                  onClick={closeModal}
                  className="text-secondary hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {(() => {
                  const apartment = data.apartments.find(apt => apt.id === viewingInvoice.apartmentId);
                  const tenant = data.tenants.find(t => t.id === viewingInvoice.tenantId);

                  
                  return (
                    <>
                      {/* Invoice Header */}
                      <div className="text-center border-b border-primary pb-6">
                        <h2 className="text-2xl font-bold text-primary">HÓA ĐƠN THANH TOÁN</h2>
                        <p className="text-secondary mt-2">Số: {viewingInvoice.invoiceNumber}</p>
                        <p className="text-secondary">Tháng {viewingInvoice.month}/{viewingInvoice.year}</p>
                      </div>
                      
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-secondary mb-3">Thông tin căn hộ</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Phòng:</span> {apartment?.roomNumber}</p>
                            <p><span className="font-medium">Diện tích:</span> {apartment?.area} m²</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-secondary mb-3">Thông tin khách thuê</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Họ tên:</span> {tenant?.fullName}</p>
                            <p><span className="font-medium">Điện thoại:</span> {tenant?.phone}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Cost Breakdown */}
                      <div>
                        <h4 className="text-sm font-medium text-secondary mb-3">Chi tiết chi phí</h4>
                        <div className="bg-secondary rounded-lg p-4 space-y-3">
                          {viewingInvoice.rent > 0 && (
                            <div className="flex justify-between">
                              <span>Tiền thuê nhà:</span>
                              <span className="font-medium">{viewingInvoice.rent.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          )}
                          {viewingInvoice.electricity > 0 && (
                            <div className="flex justify-between">
                              <span>Tiền điện:</span>
                              <span className="font-medium">{viewingInvoice.electricity.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          )}
                          {viewingInvoice.water > 0 && (
                            <div className="flex justify-between">
                              <span>Tiền nước:</span>
                              <span className="font-medium">{viewingInvoice.water.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          )}
                          {viewingInvoice.internet > 0 && (
                            <div className="flex justify-between">
                              <span>Tiền internet:</span>
                              <span className="font-medium">{viewingInvoice.internet.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          )}
                          {viewingInvoice.cleaning > 0 && (
                            <div className="flex justify-between">
                              <span>Phí vệ sinh:</span>
                              <span className="font-medium">{viewingInvoice.cleaning.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          )}
                          {viewingInvoice.other > 0 && (
                            <div className="flex justify-between">
                              <span>Chi phí khác:</span>
                              <span className="font-medium">{viewingInvoice.other.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          )}
                          {viewingInvoice.otherDescription && (
                            <div className="text-sm text-secondary mt-2">
                              <span className="font-medium">Mô tả:</span> {viewingInvoice.otherDescription}
                            </div>
                          )}
                          <div className="border-t border-primary pt-3 mt-4">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Tổng cộng:</span>
                              <span className="text-primary">{viewingInvoice.total.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-secondary mb-3">Thông tin thanh toán</h4>
                          <div className="space-y-2">
                            <p><span className="font-medium">Hạn thanh toán:</span> {formatDate(viewingInvoice.dueDate)}</p>
                            <p><span className="font-medium">Trạng thái:</span> 
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                viewingInvoice.status === 'paid' 
                                  ? 'badge-success' 
                                  : viewingInvoice.status === 'overdue'
                                  ? 'badge-danger'
                                  : 'badge-warning'
                              }`}>
                                {viewingInvoice.status === 'paid' 
                                  ? 'Đã thanh toán' 
                                  : viewingInvoice.status === 'overdue'
                                  ? 'Quá hạn' 
                                  : 'Chờ thanh toán'}
                              </span>
                            </p>
                            {viewingInvoice.createdAt && (
                              <p><span className="font-medium">Ngày tạo:</span> {formatDate(viewingInvoice.createdAt)}</p>
                            )}
                            {viewingInvoice.status === 'paid' && viewingInvoice.paidDate && (
                              <p><span className="font-medium">Ngày thanh toán:</span> {formatDate(viewingInvoice.paidDate)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="p-6 border-t border-primary flex-shrink-0">
              <div className="flex justify-end space-x-3">
                {(viewingInvoice.status === 'pending' || viewingInvoice.status === 'overdue') && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Xác nhận đánh dấu hóa đơn ${viewingInvoice.invoiceNumber} đã thanh toán?`)) {
                        updateInvoice(viewingInvoice.id, { 
                          status: 'paid',
                          paidDate: new Date().toISOString()
                        });
                        setViewingInvoice({ ...viewingInvoice, status: 'paid' });
                      }
                    }}
                    className="btn btn-success"
                  >
                    ✅ Đánh dấu đã thanh toán
                  </button>
                )}
                <button
                  onClick={() => {
                    setViewingInvoice(null);
                    openModal(viewingInvoice);
                  }}
                  className="btn btn-primary"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 