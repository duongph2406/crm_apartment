-- =====================================================
-- CRM APARTMENT DATABASE - LOCAL SETUP
-- Tối ưu cho Raspberry Pi 3B chạy local
-- =====================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS crm_apartment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_apartment;

-- =====================================================
-- TẠO USER CHO LOCAL SETUP
-- =====================================================

-- User cho ứng dụng (localhost only)
CREATE USER IF NOT EXISTS 'crm_app'@'localhost' IDENTIFIED BY 'CrmApp2024#SecurePassword';
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_apartment.* TO 'crm_app'@'localhost';

-- User admin cho maintenance (localhost only)
CREATE USER IF NOT EXISTS 'crm_admin'@'localhost' IDENTIFIED BY 'CrmAdmin2024#VerySecure';
GRANT ALL PRIVILEGES ON crm_apartment.* TO 'crm_admin'@'localhost';

-- User readonly cho backup
CREATE USER IF NOT EXISTS 'crm_readonly'@'localhost' IDENTIFIED BY 'CrmReadOnly2024#';
GRANT SELECT ON crm_apartment.* TO 'crm_readonly'@'localhost';

FLUSH PRIVILEGES;

-- =====================================================
-- BẢNG USERS - Quản lý tài khoản hệ thống
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    tenant_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- =====================================================
-- BẢNG APARTMENTS - Quản lý thông tin căn hộ
-- =====================================================
CREATE TABLE apartments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    size DECIMAL(5,2) DEFAULT 0.00,
    description TEXT,
    status ENUM('available', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
    maintenance_reason TEXT,
    base_rent DECIMAL(10,2) DEFAULT 0.00,
    utilities_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_room_number (room_number),
    INDEX idx_status (status)
);

-- =====================================================
-- BẢNG TENANTS - Quản lý thông tin khách thuê
-- =====================================================
CREATE TABLE tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    id_number VARCHAR(20) UNIQUE NOT NULL,
    id_issue_date DATE NOT NULL,
    id_issue_place VARCHAR(255) NOT NULL,
    birth_date DATE,
    hometown TEXT,
    permanent_address TEXT NOT NULL,
    role ENUM('contract_signer', 'room_leader', 'member') NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    apartment_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_id_number (id_number),
    INDEX idx_phone (phone),
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL
);

-- =====================================================
-- BẢNG CONTRACTS - Quản lý hợp đồng thuê
-- =====================================================
CREATE TABLE contracts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    apartment_id INT NOT NULL,
    tenant_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    utilities_cost DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pending', 'active', 'expired', 'inactive') NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_contract_number (contract_number),
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- =====================================================
-- BẢNG INVOICES - Quản lý hóa đơn
-- =====================================================
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    contract_id INT NOT NULL,
    apartment_id INT NOT NULL,
    billing_month DATE NOT NULL,
    room_rent DECIMAL(10,2) NOT NULL,
    utilities_cost DECIMAL(10,2) DEFAULT 0.00,
    other_fees DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_contract_id (contract_id),
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_billing_month (billing_month),
    INDEX idx_status (status),
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE
);

-- =====================================================
-- BẢNG COSTS - Quản lý chi phí chung
-- =====================================================
CREATE TABLE costs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('monthly', 'yearly', 'one_time') NOT NULL DEFAULT 'monthly',
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_type (type),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- BẢNG MAINTENANCE_REQUESTS - Yêu cầu sửa chữa
-- =====================================================
CREATE TABLE maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    apartment_id INT NOT NULL,
    tenant_id INT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    cost DECIMAL(10,2) DEFAULT 0.00,
    assigned_to VARCHAR(100),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- =====================================================
-- BẢNG AUDIT_LOGS - Lưu trữ lịch sử thay đổi
-- =====================================================
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- FOREIGN KEY CONSTRAINT CHO USERS
-- =====================================================
ALTER TABLE users ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- =====================================================
-- DỮ LIỆU MẪU
-- =====================================================

-- Apartments
INSERT INTO apartments (room_number, size, description, status, base_rent, utilities_cost) VALUES
('101', 25.00, 'Phòng tầng 1, view sân trước', 'available', 3000000, 500000),
('102', 20.00, 'Phòng tầng 1, view hướng Tây', 'available', 2800000, 500000),
('103', 30.00, 'Phòng tầng 1, rộng rãi', 'available', 3500000, 500000),
('201', 25.00, 'Phòng tầng 2, view đẹp', 'available', 3200000, 500000),
('202', 20.00, 'Phòng tầng 2, hướng Đông', 'available', 3000000, 500000);

-- Costs
INSERT INTO costs (name, description, amount, type, category, is_active) VALUES
('Tiền điện', 'Giá điện theo kWh', 3500, 'monthly', 'electricity', TRUE),
('Tiền nước', 'Giá nước theo m³', 25000, 'monthly', 'water', TRUE),
('Internet', 'Wi-Fi chung cho tòa nhà', 200000, 'monthly', 'internet', TRUE),
('Vệ sinh chung', 'Chi phí dọn dẹp khu vực chung', 50000, 'monthly', 'cleaning', TRUE);

-- Users (password = admin123, manager123, user123)
INSERT INTO users (username, password_hash, full_name, email, phone, role, status) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên hệ thống', 'admin@crm-apartment.local', '0901234567', 'admin', 'active'),
('manager1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn Quản Lý', 'manager@crm-apartment.local', '0902345678', 'manager', 'active');

-- Tenants
INSERT INTO tenants (full_name, phone, email, id_number, id_issue_date, id_issue_place, birth_date, hometown, permanent_address, role, status, apartment_id) VALUES
('Nguyễn Văn An', '0912345678', 'nguyenvanan@email.com', '001234567890', '2020-01-15', 'Công an TP.HCM', '1995-03-20', 'Hà Nội', '123 Đường ABC, Quận 1, TP.HCM', 'room_leader', 'active', 1);

-- User cho tenant
INSERT INTO users (username, password_hash, full_name, email, phone, role, status, tenant_id) VALUES
('nguyenvanan', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn An', 'nguyenvanan@email.com', '0912345678', 'user', 'active', 1);

-- Contract
INSERT INTO contracts (contract_number, apartment_id, tenant_id, start_date, end_date, monthly_rent, deposit, utilities_cost, status, notes) VALUES
('HD2024001', 1, 1, '2024-01-01', '2024-12-31', 3000000, 6000000, 500000, 'active', 'Hợp đồng thuê phòng 101');

-- Update apartment status
UPDATE apartments SET status = 'occupied' WHERE id = 1;

-- Sample invoice
INSERT INTO invoices (invoice_number, contract_id, apartment_id, billing_month, room_rent, utilities_cost, other_fees, total_amount, status, due_date) VALUES
('INV202403001', 1, 1, '2024-03-01', 3000000, 480000, 0, 3480000, 'pending', '2024-03-15');

SELECT 'Database setup hoàn tất!' as status; 