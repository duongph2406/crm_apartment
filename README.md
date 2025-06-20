# Apartment CRM - Hệ thống Quản lý Thuê Căn hộ

Một ứng dụng web hiện đại để quản lý thuê căn hộ với hỗ trợ đa ngôn ngữ (Tiếng Việt và Tiếng Anh).

## 🏢 Tính năng chính

### ✅ Đã hoàn thành
- **🏠 Trang chủ (Dashboard)**: Tổng quan thống kê và tình trạng căn hộ
- **🏢 Quản lý căn hộ**: Xem và cập nhật thông tin 11 căn hộ cố định (102, 201, 202, 301, 302, 401, 402, 501, 502, 601, 602)
- **👥 Quản lý khách thuê**: CRUD đầy đủ cho thông tin khách thuê
- **🔐 Hệ thống đăng nhập**: Authentication với role-based access
- **🌐 Đa ngôn ngữ**: Chuyển đổi giữa Tiếng Việt và Tiếng Anh
- **📱 Responsive Design**: Tương thích với mobile và desktop

### 🚧 Đang phát triển
- **📋 Quản lý hợp đồng**: Tạo và quản lý hợp đồng thuê
- **🧾 Quản lý hóa đơn**: Theo dõi thanh toán và hóa đơn
- **👤 Quản lý tài khoản**: Cài đặt tài khoản cá nhân
- **🔧 Quản lý người dùng**: Quản lý tài khoản (dành cho Admin)

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js 14+ 
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd crm_apartment
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng**
   ```bash
   npm start
   ```

4. **Mở trình duyệt**
   Truy cập http://localhost:3000

## 👤 Tài khoản Demo

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Quyền**: Toàn quyền, bao gồm quản lý tài khoản

### Manager Account  
- **Username**: `manager`
- **Password**: `manager123`
- **Quyền**: Quản lý căn hộ, khách thuê, hợp đồng, hóa đơn

## 🏗️ Cấu trúc Dự án

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   └── Layout/         # Layout components (Header, etc.)
├── contexts/           # React Context providers
│   ├── AppContext.js   # Main application state
│   └── LanguageContext.js # Internationalization
├── pages/              # Main application pages
│   ├── Home.js         # Dashboard page
│   ├── Apartments.js   # Apartment management
│   └── Tenants.js      # Tenant management
└── App.js              # Main app component
```

## 🏢 Thông tin Căn hộ

Hệ thống quản lý **11 căn hộ cố định**:
- **Tầng 1**: 102
- **Tầng 2**: 201, 202  
- **Tầng 3**: 301, 302
- **Tầng 4**: 401, 402
- **Tầng 5**: 501, 502
- **Tầng 6**: 601, 602

## 💾 Lưu trữ Dữ liệu

- Dữ liệu được lưu trữ trong **localStorage** của trình duyệt
- Dữ liệu mẫu được tự động tạo khi chạy lần đầu
- Dữ liệu sẽ được persist giữa các phiên làm việc

## 🎨 Công nghệ Sử dụng

- **Frontend**: React 19.1.0
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Icons**: Heroicons (SVG icons)
- **Build Tool**: Create React App

## 🌐 Hỗ trợ Đa ngôn ngữ

### Tiếng Việt
- Ngôn ngữ mặc định
- Hiển thị đầy đủ interface bằng tiếng Việt
- Format tiền tệ VND

### English
- Chuyển đổi ngôn ngữ dễ dàng
- Interface hoàn toàn bằng tiếng Anh
- Tương thích quốc tế

## 📈 Tính năng Nổi bật

### Dashboard Thông minh
- Thống kê real-time về căn hộ, khách thuê
- Hiển thị trực quan tình trạng từng căn hộ
- Theo dõi doanh thu và hóa đơn

### Quản lý Căn hộ
- View dạng grid trực quan
- Filter theo trạng thái (Trống/Đã thuê/Bảo trì)
- Cập nhật thông tin và giá thuê
- Liên kết với thông tin khách thuê và hợp đồng

### Quản lý Khách thuê
- CRUD đầy đủ (Create, Read, Update, Delete)
- Tìm kiếm theo tên, SĐT, email
- Theo dõi tình trạng thuê căn hộ
- Bảo vệ dữ liệu (không cho phép xóa khách đang thuê)

## 🔒 Bảo mật

- Authentication dựa trên role
- Session management với localStorage
- Bảo vệ routes theo quyền người dùng
- Input validation và sanitization

## 📱 Responsive Design

- Tương thích mobile-first
- Adaptive navigation cho mobile
- Optimized cho tablet và desktop
- Touch-friendly interface

## 🚀 Performance

- Lazy loading components
- Optimized re-renders với React Context
- Minimal bundle size
- Fast development with Hot Module Replacement

## 🐛 Troubleshooting

### Lỗi npm install
```bash
npm install --legacy-peer-deps
```

### Lỗi Tailwind CSS không load
```bash
npm install tailwindcss postcss autoprefixer --save-dev
```

### Reset dữ liệu
```javascript
localStorage.clear()
// Refresh trang
```

## 📄 License

Private project - All rights reserved

## 👨‍💻 Phát triển bởi

Apartment CRM System - 2024

---

**Lưu ý**: Đây là phiên bản demo. Trong production, cần thêm backend API, database thực, và các tính năng bảo mật nâng cao.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)