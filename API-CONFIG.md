# Cấu hình API Bank Account Verification

## 🏦 Tổng quan

Hệ thống sử dụng API để tự động lấy tên chủ tài khoản từ ngân hàng. Có 2 provider chính:

1. **VietQR.io** - API chính, miễn phí có giới hạn
2. **Casso.vn** - API backup, tính phí

## 🔑 Cấu hình API Keys

### 1. VietQR.io (Khuyến nghị)

1. Truy cập: https://vietqr.io/
2. Đăng ký tài khoản developer
3. Lấy Client ID và API Key
4. Tạo file `.env` trong thư mục gốc:

```env
REACT_APP_VIETQR_CLIENT_ID=your_client_id_here
REACT_APP_VIETQR_API_KEY=your_api_key_here
```

### 2. Casso.vn (Tùy chọn)

1. Truy cập: https://casso.vn/
2. Đăng ký và lấy API key
3. Thêm vào file `.env`:

```env
REACT_APP_CASSO_API_KEY=your_casso_key_here
```

## 🔄 Fallback System

Nếu không có API key hoặc API bị lỗi:
- ✅ Tự động chuyển sang provider backup
- ✅ Sử dụng dữ liệu demo realistic
- ✅ Vẫn hoạt động bình thường

## 🎯 Demo Mode

Khi không có API key, hệ thống sẽ:
- Tạo tên demo dựa theo số tài khoản
- Hiển thị warning "Dữ liệu demo"
- Vẫn tạo được VietQR chuẩn

## 📊 API Response Format

### VietQR.io
```json
{
  "code": "00",
  "desc": "Thành công", 
  "data": {
    "accountName": "NGUYEN VAN A"
  }
}
```

### Casso.vn
```json
{
  "error": 0,
  "data": {
    "accountName": "NGUYEN VAN A"
  }
}
```

## 🚀 Sử dụng

```javascript
import { getAccountName } from './utils/bankService';

const result = await getAccountName('VCB', '1234567890');
console.log(result.accountName); // "NGUYEN VAN A"
```

## 🔧 Troubleshooting

### API không hoạt động?
1. Kiểm tra API key trong file `.env`
2. Xem console log để debug
3. Hệ thống sẽ tự động fallback về demo

### Tên không chính xác?
- API có thể trả về tên khác do format của bank
- Hệ thống tự động chuẩn hóa (bỏ dấu, viết hoa)
- Có thể sửa thủ công nếu cần

## 📝 Lưu ý

- API có rate limit, không abuse
- VietQR.io miễn phí nhưng giới hạn request/ngày
- Demo mode vẫn tạo được QR code hoàn chỉnh
- Tên sẽ được tự động chuẩn hóa theo format ngân hàng 