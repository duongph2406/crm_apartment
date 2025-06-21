-- =====================================================
-- CRM APARTMENT DATABASE SCHEMA
-- Thiết kế cho Raspberry Pi 3B với MariaDB
-- =====================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS crm_apartment CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crm_apartment;

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
    INDEX idx_email (email),
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
    INDEX idx_role (role),
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL
);

-- =====================================================
-- BẢNG CONTRACTS - Quản lý hợp đồng thuê
-- =====================================================
CREATE TABLE contracts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contract_number VARCHAR(50) UNIQUE NOT NULL,
    apartment_id INT NOT NULL,
    tenant_id INT NOT NULL, -- Người ký hợp đồng chính
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit DECIMAL(10,2) NOT NULL,
    utilities_cost DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pending', 'active', 'expired', 'inactive') NOT NULL DEFAULT 'pending',
    contract_file_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_contract_number (contract_number),
    INDEX idx_apartment_id (apartment_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_end_date (end_date),
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- =====================================================
-- BẢNG CONTRACT_TENANTS - Quan hệ nhiều-nhiều giữa hợp đồng và khách thuê
-- =====================================================
CREATE TABLE contract_tenants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contract_id INT NOT NULL,
    tenant_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE, -- Người ký hợp đồng chính
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_contract_tenant (contract_id, tenant_id),
    INDEX idx_contract_id (contract_id),
    INDEX idx_tenant_id (tenant_id),
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
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
    billing_month DATE NOT NULL, -- Tháng/năm hóa đơn
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
    INDEX idx_due_date (due_date),
    
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
    category VARCHAR(50) NOT NULL, -- electricity, water, internet, maintenance, etc.
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
    INDEX idx_priority (priority),
    
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
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_table_name (table_name),
    INDEX idx_record_id (record_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- FOREIGN KEY CONSTRAINT CHO USERS
-- =====================================================
ALTER TABLE users ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL; 