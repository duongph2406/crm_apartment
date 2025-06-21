import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/dateFormat';
import { usePageTitle } from '../hooks';
import QRCodePayment from '../components/QRCodePayment';

const MyInvoices = () => {
  usePageTitle('Hóa đơn của tôi');
  
  const { t } = useLanguage();
  const { data, currentUser } = useApp();
  
  const [viewingInvoice, setViewingInvoice] = useState(null);
  
  // Get invoices for current tenant
  const myInvoices = data.invoices.filter(invoice => {
    if (!currentUser?.tenantId) return false;
    return invoice.tenantId === currentUser.tenantId;
  }).sort((a, b) => {
    // Sort by year, then month (newest first)
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'overdue': return 'Quá hạn';
      case 'pending': return 'Chờ thanh toán';
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
      <div className="bg-primary rounded-xl shadow border p-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          💳 Hóa đơn của tôi
        </h1>
        <p className="text-secondary">
          Theo dõi lịch sử thanh toán và các hóa đơn của bạn
        </p>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-primary">{myInvoices.length}</p>
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
              <p className="text-2xl font-bold text-orange-600">
                {myInvoices.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              ⏳
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Quá hạn</p>
              <p className="text-2xl font-bold text-red-600">
                {myInvoices.filter(i => i.status === 'overdue').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              ⚠️
            </div>
          </div>
        </div>

        <div className="bg-primary rounded-xl shadow border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Đã thanh toán</p>
              <p className="text-2xl font-bold text-success">
                {myInvoices.filter(i => i.status === 'paid').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {myInvoices.length === 0 ? (
          <div className="bg-primary rounded-xl shadow border p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              📄
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">Chưa có hóa đơn nào</h3>
            <p className="text-secondary">Bạn chưa có hóa đơn nào trong hệ thống.</p>
          </div>
        ) : (
          myInvoices.map((invoice) => {
            const apartment = data.apartments.find(apt => apt.id === invoice.apartmentId);
            const daysUntilDue = getDaysUntilDue(invoice.dueDate);
            const isInvoiceOverdue = isOverdue(invoice);
            
            return (
              <div key={invoice.id} className="bg-primary rounded-xl shadow border overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-primary">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-secondary">
                            Phòng {apartment?.roomNumber} • Tháng {invoice.month}/{invoice.year}
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          invoice.status === 'paid' 
                            ? 'badge-success' 
                            : invoice.status === 'overdue'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>

                      {/* Cost Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-secondary rounded-lg p-4">
                          <h4 className="text-sm font-medium text-secondary mb-3">Chi tiết chi phí</h4>
                          <div className="space-y-2 text-sm">
                            {(Number(invoice.rent) || 0) > 0 && (
                              <div className="flex justify-between">
                                <span>Tiền thuê:</span>
                                <span className="font-medium">{(Number(invoice.rent) || 0).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                            {(Number(invoice.electricity) || 0) > 0 && (
                              <div className="flex justify-between">
                                <span>Tiền điện:</span>
                                <span className="font-medium">{(Number(invoice.electricity) || 0).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                            {(Number(invoice.water) || 0) > 0 && (
                              <div className="flex justify-between">
                                <span>Tiền nước:</span>
                                <span className="font-medium">{(Number(invoice.water) || 0).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                            {(Number(invoice.internet) || 0) > 0 && (
                              <div className="flex justify-between">
                                <span>Internet:</span>
                                <span className="font-medium">{(Number(invoice.internet) || 0).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                            {(Number(invoice.cleaning) || 0) > 0 && (
                              <div className="flex justify-between">
                                <span>Vệ sinh:</span>
                                <span className="font-medium">{(Number(invoice.cleaning) || 0).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                            {(Number(invoice.other) || 0) > 0 && (
                              <div className="flex justify-between">
                                <span>Khác:</span>
                                <span className="font-medium">{(Number(invoice.other) || 0).toLocaleString('vi-VN')} VNĐ</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="border-t border-primary pt-3 mt-3">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Tổng cộng:</span>
                              <span className="text-primary">{formatCurrency(Number(invoice.total) || 0)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-secondary rounded-lg p-4">
                          <h4 className="text-sm font-medium text-secondary mb-3">Thông tin thanh toán</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Hạn thanh toán:</span>
                              <span className={`font-medium ${isInvoiceOverdue ? 'text-red-600' : 'text-primary'}`}>
                                {formatDate(invoice.dueDate)}
                              </span>
                            </div>
                            
                            {invoice.status === 'pending' && (
                              <div className="flex justify-between">
                                <span>Còn lại:</span>
                                <span className={`font-medium ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 3 ? 'text-yellow-600' : 'text-primary'}`}>
                                  {daysUntilDue < 0 ? `Quá ${Math.abs(daysUntilDue)} ngày` : `${daysUntilDue} ngày`}
                                </span>
                              </div>
                            )}
                            
                            {invoice.status === 'paid' && invoice.paidDate && (
                              <div className="flex justify-between">
                                <span>Đã thanh toán:</span>
                                <span className="font-medium text-success">{formatDate(invoice.paidDate)}</span>
                              </div>
                            )}
                            
                            {invoice.createdAt && (
                              <div className="flex justify-between">
                                <span>Ngày tạo:</span>
                                <span className="font-medium text-secondary">{formatDate(invoice.createdAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional info */}
                      {invoice.otherDescription && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Ghi chú:</span> {invoice.otherDescription}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* QR Code Payment */}
                    {data.bankInfo && data.bankInfo.qrEnabled && data.bankInfo.accountNumber && 
                     (invoice.status === 'pending' || invoice.status === 'overdue') && (
                      <div className="lg:w-80 flex-shrink-0">
                        <QRCodePayment
                          bankInfo={data.bankInfo}
                          amount={Number(invoice.total) || 0}
                          description={`Thanh toan hoa don ${invoice.invoiceNumber} phong ${apartment?.roomNumber} thang ${invoice.month}/${invoice.year}`}
                          invoiceNumber={invoice.invoiceNumber}
                          size={160}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-primary pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                        <div className="text-sm text-secondary">
                          💡 Quét mã QR bằng app ngân hàng để thanh toán nhanh
                        </div>
                      )}
                      <button
                        onClick={() => setViewingInvoice(invoice)}
                        className="btn btn-secondary btn-sm ml-auto"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-primary rounded-xl shadow-xl w-[90%] max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-primary flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-primary">
                    Chi tiết hóa đơn {viewingInvoice.invoiceNumber}
                  </h3>
                  <button
                    onClick={() => setViewingInvoice(null)}
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
                  <div className="text-center border-b border-primary pb-6">
                    <h2 className="text-2xl font-bold text-primary">HÓA ĐƠN THANH TOÁN</h2>
                    <p className="text-secondary mt-2">Số: {viewingInvoice.invoiceNumber}</p>
                    <p className="text-secondary">Tháng {viewingInvoice.month}/{viewingInvoice.year}</p>
                  </div>
                  
                  {/* QR Code in modal */}
                  {data.bankInfo && data.bankInfo.qrEnabled && data.bankInfo.accountNumber && 
                   (viewingInvoice.status === 'pending' || viewingInvoice.status === 'overdue') && (
                    <div className="flex justify-center">
                      <QRCodePayment
                        bankInfo={data.bankInfo}
                        amount={Number(viewingInvoice.total) || 0}
                        description={`Thanh toan hoa don ${viewingInvoice.invoiceNumber}`}
                        invoiceNumber={viewingInvoice.invoiceNumber}
                        size={200}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-primary flex-shrink-0">
                <div className="flex justify-end">
                  <button
                    onClick={() => setViewingInvoice(null)}
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

export default MyInvoices;
