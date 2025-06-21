# 📄 Page Titles - CRM Apartment

Đã cập nhật tất cả trang với title theo format: **"Tên trang - CRM Apartment"**

## 🔧 Implementation

### 1. Hook usePageTitle
**File:** `src/hooks/usePageTitle.js`
- Quản lý dynamic page titles
- Format: `"Title - CRM Apartment"`
- Auto cleanup khi component unmount

### 2. Default Title
**File:** `public/index.html`
- Default title: `"CRM Apartment"`
- Updated meta description

## 📑 Page Titles được cập nhật

| Page | Route | Title |
|------|-------|-------|
| **Home** | `/` | `Trang chủ - CRM Apartment` |
| **Apartments** | `/apartments` | `Quản lý căn hộ - CRM Apartment` |
| **Tenants** | `/tenants` | `Quản lý khách thuê - CRM Apartment` |
| **Contracts** | `/contracts` | `Quản lý hợp đồng - CRM Apartment` |
| **Invoices** | `/invoices` | `Quản lý hóa đơn - CRM Apartment` |
| **InvoiceGeneration** | `/invoice-generation` | `Tạo hóa đơn - CRM Apartment` |
| **CostManagement** | `/cost-management` | `Quản lý chi phí - CRM Apartment` |
| **Users** | `/users` | `Quản lý tài khoản - CRM Apartment` |
| **Account** | `/account` | `Tài khoản cá nhân - CRM Apartment` |
| **UserDashboard** | `/user-dashboard` | `Bảng điều khiển - CRM Apartment` |
| **MyInvoices** | `/my-invoices` | `Hóa đơn của tôi - CRM Apartment` |
| **MyContracts** | `/my-contracts` | `Hợp đồng của tôi - CRM Apartment` |

## 🔨 Usage Example

```javascript
import { usePageTitle } from '../hooks';

const MyPage = () => {
  usePageTitle('Tên trang');
  
  return (
    <div>
      {/* Page content */}
    </div>
  );
};
```

## ✅ Benefits

- **SEO Friendly**: Mỗi trang có title riêng biệt
- **User Experience**: Người dùng dễ nhận biết trang hiện tại
- **Browser Tabs**: Tiêu đề rõ ràng trên tab browser
- **Consistent Format**: Đồng nhất format "Title - CRM Apartment"
- **Automatic Cleanup**: Tự động restore title khi rời trang

## 🚀 Browser Tab Display

Khi truy cập các trang, browser tab sẽ hiển thị:
- 🏠 `Trang chủ - CRM Apartment`
- 🏢 `Quản lý căn hộ - CRM Apartment`  
- 👥 `Quản lý khách thuê - CRM Apartment`
- 📋 `Quản lý hợp đồng - CRM Apartment`
- 💰 `Quản lý hóa đơn - CRM Apartment`
- ⚙️ `Quản lý chi phí - CRM Apartment`
- 👤 `Quản lý tài khoản - CRM Apartment`
- 🔒 `Tài khoản cá nhân - CRM Apartment`
- 📊 `Bảng điều khiển - CRM Apartment`
- 💳 `Hóa đơn của tôi - CRM Apartment`
- 📄 `Hợp đồng của tôi - CRM Apartment`

## 🔄 Dynamic Updates

Page titles được cập nhật real-time khi:
- User điều hướng giữa các trang
- Component mount/unmount
- Route changes

**All pages now have proper titles! 🎉** 