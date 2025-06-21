import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { generateVietQR } from '../utils/bankService';
import APIErrorBoundary from './APIErrorBoundary';

const QRCodePayment = ({ 
  bankInfo, 
  amount, 
  description, 
  invoiceNumber,
  size = 200,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const [qrDataURL, setQrDataURL] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [bankInfo, amount, description]);

  const generateQRCode = async () => {
    // Validation with improved error messages
    if (!bankInfo) {
      setError('⚠️ Chưa cài đặt thông tin ngân hàng trong phần "Quản lý Chi phí"');
      return;
    }

    if (!bankInfo.accountNumber) {
      setError('⚠️ Thiếu số tài khoản ngân hàng');
      return;
    }

    if (!bankInfo.accountName) {
      setError('⚠️ Thiếu tên chủ tài khoản - Vui lòng lấy tên từ ngân hàng');
      return;
    }

    if (!bankInfo.bankCode) {
      setError('⚠️ Thiếu mã ngân hàng');
      return;
    }

    if (!amount || amount <= 0) {
      setError('⚠️ Số tiền không hợp lệ hoặc bằng 0');
      return;
    }

    try {
      console.log('[QR] Generating VietQR NAPAS standard for:', {
        bank: bankInfo.bankName,
        account: bankInfo.accountNumber,
        amount: amount,
        description: description || `Thanh toan hoa don ${invoiceNumber}`
      });

      // Generate VietQR chuẩn NAPAS
      const vietQRString = generateVietQR(
        bankInfo.bankCode,
        bankInfo.accountNumber,
        amount.toString(),
        description || `Thanh toan hoa don ${invoiceNumber}`
      );

      console.log('[QR] VietQR NAPAS string generated:', vietQRString.length, 'characters');

      // Validate QR string length
      if (vietQRString.length < 50 || vietQRString.length > 500) {
        throw new Error(`Invalid QR length: ${vietQRString.length} characters`);
      }

      // Generate QR code with production settings
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, vietQRString, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M', // Medium error correction for banking
        type: 'image/png',
        quality: 0.95
      });

      // Generate high-quality data URL for copying/downloading
      const dataURL = await QRCode.toDataURL(vietQRString, {
        width: Math.max(size, 256), // Minimum 256px for downloads
        margin: 2,
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.95
      });
      
      setQrDataURL(dataURL);
      setError('');
      
      console.log('[QR] VietQR NAPAS generated successfully');
    } catch (err) {
      console.error('[QR] Error generating VietQR code:', err);
      
      // Specific error messages
      if (err.message.includes('Invalid bank code')) {
        setError('❌ Mã ngân hàng không hợp lệ');
      } else if (err.message.includes('Invalid QR length')) {
        setError('❌ Dữ liệu QR không hợp lệ - Vui lòng kiểm tra thông tin');
      } else if (err.message.includes('Canvas')) {
        setError('❌ Lỗi hiển thị QR - Vui lòng refresh trang');
      } else {
        setError('❌ Không thể tạo mã VietQR chuẩn NAPAS');
      }
    }
  };

  const copyQRCode = async () => {
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Đã copy mã QR vào clipboard!');
        } catch (err) {
          // Fallback: copy as data URL
          if (qrDataURL) {
            await navigator.clipboard.writeText(qrDataURL);
            alert('Đã copy link QR code!');
          }
        }
      });
    } catch (err) {
      console.error('Error copying QR code:', err);
      alert('Không thể copy mã QR');
    }
  };

  const downloadQRCode = () => {
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.download = `QR_Payment_${invoiceNumber || 'invoice'}.png`;
    link.href = qrDataURL;
    link.click();
  };

  const copyBankInfo = async () => {
    const bankText = `🏦 Thông tin chuyển khoản:
🏛️ Ngân hàng: ${bankInfo.bankName}
📱 Số tài khoản: ${bankInfo.accountNumber}
👤 Chủ tài khoản: ${bankInfo.accountName}
💰 Số tiền: ${amount.toLocaleString('vi-VN')} VNĐ
📝 Nội dung: ${description || `Thanh toan hoa don ${invoiceNumber}`}`;

    try {
      await navigator.clipboard.writeText(bankText);
      alert('Đã copy thông tin chuyển khoản!');
    } catch (err) {
      console.error('Error copying bank info:', err);
      alert('Không thể copy thông tin');
    }
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-red-300 rounded-lg ${className}`}>
        <div className="text-red-500 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      {/* QR Code */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          📱 Quét mã QR để chuyển tiền
        </h4>
        <div className="flex justify-center mb-3">
          <canvas 
            ref={canvasRef}
            className="border border-gray-200 rounded"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={copyQRCode}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Copy mã QR"
          >
            📋 Copy QR
          </button>
          <button
            onClick={downloadQRCode}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
            title="Tải xuống QR"
          >
            💾 Tải QR
          </button>
        </div>
      </div>

      {/* Bank Info */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-start mb-3">
          <h5 className="text-sm font-semibold text-gray-900">
            🏦 Thông tin chuyển khoản
          </h5>
          <button
            onClick={copyBankInfo}
            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            title="Copy thông tin chuyển khoản"
          >
            📋 Copy
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Ngân hàng:</span>
            <span className="font-medium text-gray-900">{bankInfo.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Số TK:</span>
            <span className="font-mono font-medium text-gray-900">{bankInfo.accountNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Chủ TK:</span>
            <span className="font-medium text-gray-900">{bankInfo.accountName}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-bold text-red-600">{amount.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="border-t pt-2">
            <span className="text-gray-600">Nội dung:</span>
            <p className="font-medium text-gray-900 text-xs mt-1 break-words">
              {description || `Thanh toan hoa don ${invoiceNumber}`}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
        <p className="font-medium mb-1">📝 Hướng dẫn:</p>
        <ul className="space-y-1 text-xs">
          <li>• Quét mã QR bằng app ngân hàng</li>
          <li>• Hoặc copy thông tin để chuyển khoản thủ công</li>
          <li>• Nhớ ghi đúng nội dung chuyển tiền</li>
        </ul>
      </div>
    </div>
  );
};

// Export with API Error Boundary for production safety
export default function QRCodePaymentWithBoundary(props) {
  return (
    <APIErrorBoundary>
      <QRCodePayment {...props} />
    </APIErrorBoundary>
  );
} 