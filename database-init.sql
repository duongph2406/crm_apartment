-- =====================================================
-- SCRIPT KHỞI TẠO DATABASE VÀ DỮ LIỆU MẪU
-- =====================================================

USE crm_apartment;

-- =====================================================
-- TẠO USER VÀ PHÂN QUYỀN
-- =====================================================

-- 1. Tạo user cho ứng dụng
CREATE USER IF NOT EXISTS 'crm_app'@'%' IDENTIFIED BY 'CrmApp2024#SecurePassword';
CREATE USER IF NOT EXISTS 'crm_app'@'localhost' IDENTIFIED BY 'CrmApp2024#SecurePassword';

-- 2. Cấp quyền cho user ứng dụng
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_apartment.* TO 'crm_app'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_apartment.* TO 'crm_app'@'localhost';

-- 3. Tạo user chỉ đọc cho backup/report
CREATE USER IF NOT EXISTS 'crm_readonly'@'%' IDENTIFIED BY 'CrmReadOnly2024#';
GRANT SELECT ON crm_apartment.* TO 'crm_readonly'@'%';

-- 4. Tạo user admin cho maintenance
CREATE USER IF NOT EXISTS 'crm_admin'@'%' IDENTIFIED BY 'CrmAdmin2024#VerySecure';
GRANT ALL PRIVILEGES ON crm_apartment.* TO 'crm_admin'@'%';

-- Áp dụng các thay đổi
FLUSH PRIVILEGES;

-- =====================================================
-- DỮ LIỆU MẪU - APARTMENTS
-- =====================================================
INSERT INTO apartments (room_number, size, description, status, base_rent, utilities_cost) VALUES
('101', 25.00, 'Phòng tầng 1, view sân trước', 'available', 3000000, 500000),
('102', 20.00, 'Phòng tầng 1, view hướng Tây', 'available', 2800000, 500000),
('103', 30.00, 'Phòng tầng 1, rộng rãi', 'available', 3500000, 500000),
('201', 25.00, 'Phòng tầng 2, view đẹp', 'available', 3200000, 500000),
('202', 20.00, 'Phòng tầng 2, hướng Đông', 'available', 3000000, 500000),
('203', 30.00, 'Phòng tầng 2, có ban công', 'available', 3600000, 500000),
('301', 25.00, 'Phòng tầng 3, thoáng mát', 'available', 3300000, 500000),
('302', 20.00, 'Phòng tầng 3, view thành phố', 'available', 3100000, 500000),
('303', 30.00, 'Phòng tầng 3, ánh sáng tốt', 'available', 3700000, 500000),
('401', 25.00, 'Phòng tầng 4, yên tĩnh', 'maintenance', 3400000, 500000),
('402', 35.00, 'Penthouse, view panorama', 'available', 4500000, 600000);

-- Cập nhật lý do bảo trì cho phòng 401
UPDATE apartments SET maintenance_reason = 'Sửa chữa điều hòa và thay ống nước' WHERE room_number = '401';

-- =====================================================
-- DỮ LIỆU MẪU - COSTS (Chi phí chung)
-- =====================================================
INSERT INTO costs (name, description, amount, type, category, is_active) VALUES
('Tiền điện', 'Giá điện theo kWh', 3500, 'monthly', 'electricity', TRUE),
('Tiền nước', 'Giá nước theo m³', 25000, 'monthly', 'water', TRUE),
('Internet', 'Wi-Fi chung cho tòa nhà', 200000, 'monthly', 'internet', TRUE),
('Vệ sinh chung', 'Chi phí dọn dẹp khu vực chung', 50000, 'monthly', 'cleaning', TRUE),
('Bảo trì thang máy', 'Chi phí bảo trì thang máy hàng tháng', 300000, 'monthly', 'maintenance', TRUE),
('Bảo hiểm tòa nhà', 'Bảo hiểm cháy nổ hàng năm', 5000000, 'yearly', 'insurance', TRUE);

-- =====================================================
-- DỮ LIỆU MẪU - USERS (Tài khoản hệ thống)
-- =====================================================
-- Mật khẩu được hash bằng bcrypt (round 10)
-- admin123 -> $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- manager123 -> $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi  
-- user123 -> $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (username, password_hash, full_name, email, phone, role, status) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản trị viên hệ thống', 'admin@crm-apartment.local', '0901234567', 'admin', 'active'),
('manager1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn Quản Lý', 'manager@crm-apartment.local', '0902345678', 'manager', 'active'),
('manager2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị Thu Hà', 'thuha@crm-apartment.local', '0903456789', 'manager', 'active');

-- =====================================================
-- DỮ LIỆU MẪU - TENANTS (Một số tenant mẫu)
-- =====================================================
INSERT INTO tenants (full_name, phone, email, id_number, id_issue_date, id_issue_place, birth_date, hometown, permanent_address, role, status, apartment_id) VALUES
('Nguyễn Văn An', '0912345678', 'nguyenvanan@email.com', '001234567890', '2020-01-15', 'Công an TP.HCM', '1995-03-20', 'Hà Nội', '123 Đường ABC, Quận 1, TP.HCM', 'room_leader', 'active', 1),
('Trần Thị Bình', '0923456789', 'tranthibinh@email.com', '001234567891', '2019-05-10', 'Công an Hà Nội', '1993-07-15', 'Hải Phòng', '456 Đường DEF, Quận 2, TP.HCM', 'contract_signer', 'active', NULL),
('Lê Minh Cường', '0934567890', 'leminhcuong@email.com', '001234567892', '2021-02-20', 'Công an Đà Nẵng', '1996-11-08', 'Đà Nẵng', '789 Đường GHI, Quận 3, TP.HCM', 'member', 'active', 2);

-- =====================================================
-- DỮ LIỆU MẪU - CONTRACTS (Hợp đồng mẫu)
-- =====================================================
INSERT INTO contracts (contract_number, apartment_id, tenant_id, start_date, end_date, monthly_rent, deposit, utilities_cost, status, notes) VALUES
('HD2024001', 1, 1, '2024-01-01', '2024-12-31', 3000000, 6000000, 500000, 'active', 'Hợp đồng thuê phòng 101'),
('HD2024002', 2, 3, '2024-02-01', '2025-01-31', 2800000, 5600000, 500000, 'active', 'Hợp đồng thuê phòng 102');

-- =====================================================
-- DỮ LIỆU MẪU - CONTRACT_TENANTS
-- =====================================================
INSERT INTO contract_tenants (contract_id, tenant_id, is_primary) VALUES
(1, 1, TRUE),  -- Nguyễn Văn An là người ký chính hợp đồng HD2024001
(2, 3, TRUE);  -- Lê Minh Cường là người ký chính hợp đồng HD2024002

-- =====================================================
-- CẬP NHẬT TRẠNG THÁI APARTMENTS DỰA TRÊN CONTRACTS
-- =====================================================
UPDATE apartments 
SET status = 'occupied' 
WHERE id IN (
    SELECT DISTINCT apartment_id 
    FROM contracts 
    WHERE status = 'active'
);

-- =====================================================
-- DỮ LIỆU MẪU - USERS LIÊN KẾT VỚI TENANTS
-- =====================================================
-- Tạo tài khoản user cho tenants
INSERT INTO users (username, password_hash, full_name, email, phone, role, status, tenant_id) VALUES
('nguyenvanan', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn An', 'nguyenvanan@email.com', '0912345678', 'user', 'active', 1),
('leminhcuong', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Minh Cường', 'leminhcuong@email.com', '0934567890', 'user', 'active', 3);

-- =====================================================
-- DỮ LIỆU MẪU - INVOICES (Hóa đơn mẫu)
-- =====================================================
INSERT INTO invoices (invoice_number, contract_id, apartment_id, billing_month, room_rent, utilities_cost, other_fees, total_amount, status, due_date) VALUES
('INV202401001', 1, 1, '2024-01-01', 3000000, 500000, 100000, 3600000, 'paid', '2024-01-15'),
('INV202402001', 1, 1, '2024-02-01', 3000000, 550000, 50000, 3600000, 'paid', '2024-02-15'),
('INV202403001', 1, 1, '2024-03-01', 3000000, 480000, 0, 3480000, 'pending', '2024-03-15'),
('INV202402002', 2, 2, '2024-02-01', 2800000, 500000, 0, 3300000, 'paid', '2024-02-15'),
('INV202403002', 2, 2, '2024-03-01', 2800000, 520000, 100000, 3420000, 'pending', '2024-03-15');

-- Cập nhật ngày thanh toán cho hóa đơn đã thanh toán
UPDATE invoices SET paid_date = '2024-01-10', payment_method = 'Chuyển khoản' WHERE invoice_number = 'INV202401001';
UPDATE invoices SET paid_date = '2024-02-12', payment_method = 'Tiền mặt' WHERE invoice_number = 'INV202402001';
UPDATE invoices SET paid_date = '2024-02-14', payment_method = 'Chuyển khoản' WHERE invoice_number = 'INV202402002';

-- =====================================================
-- DỮ LIỆU MẪU - MAINTENANCE_REQUESTS
-- =====================================================
INSERT INTO maintenance_requests (apartment_id, tenant_id, title, description, status, priority, cost, assigned_to) VALUES
(10, NULL, 'Sửa chữa điều hòa phòng 401', 'Điều hòa không lạnh, cần kiểm tra và sửa chữa', 'in_progress', 'high', 1500000, 'Thợ điện lạnh Minh'),
(1, 1, 'Thay bóng đèn phòng 101', 'Bóng đèn phòng ngủ bị cháy cần thay mới', 'completed', 'low', 50000, 'Bảo vệ'),
(2, 3, 'Sửa vòi nước phòng 102', 'Vòi nước bồn rửa bị rỉ nước', 'pending', 'medium', 0, NULL);

-- Cập nhật thời gian hoàn thành cho yêu cầu đã xong
UPDATE maintenance_requests 
SET completed_at = '2024-03-10 14:30:00' 
WHERE title = 'Thay bóng đèn phòng 101';

-- =====================================================
-- HIỂN THỊ THÔNG TIN KHỞI TẠO
-- =====================================================
SELECT 'Database đã được khởi tạo thành công!' as status;
SELECT COUNT(*) as total_apartments FROM apartments;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_tenants FROM tenants;
SELECT COUNT(*) as total_contracts FROM contracts;
SELECT COUNT(*) as total_invoices FROM invoices; 