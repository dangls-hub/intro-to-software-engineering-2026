-- ============================================================
-- BlueMoon AMS — Sample Data
-- Password for all accounts: "password"
-- BCrypt hash (cost 10): $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE fees;
TRUNCATE TABLE residents;
TRUNCATE TABLE households;
TRUNCATE TABLE apartments;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (username, password, email, full_name, role, created_at, updated_at) VALUES
('admin',     '$2a$10$yBeKxPLBX9g38SMH7Kb.1.Ry3IV8RI7N8IHQI8obiYBEBHV.S2owG', 'admin@bluemoon.vn',     'Quản trị viên',    'ADMIN',    NOW(), NOW()),
('staff1',    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'staff1@bluemoon.vn',    'Nguyễn Thị Lan',   'STAFF',    NOW(), NOW()),
('staff2',    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'staff2@bluemoon.vn',    'Trần Văn Minh',    'STAFF',    NOW(), NOW()),
('resident1', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'resident1@example.com', 'Lê Văn An',        'RESIDENT', NOW(), NOW()),
('resident2', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'resident2@example.com', 'Phạm Thị Bích',    'RESIDENT', NOW(), NOW()),
('resident3', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'resident3@example.com', 'Hoàng Văn Cường',  'RESIDENT', NOW(), NOW());

-- ============================================================
-- APARTMENTS
-- ============================================================
INSERT INTO apartments (room_number, floor, area, status, description, created_at, updated_at) VALUES
('A101', 1, 65.5, 'OCCUPIED',  'Căn hộ 2 phòng ngủ tầng 1',       NOW(), NOW()),
('A102', 1, 72.0, 'OCCUPIED',  'Căn hộ 2 phòng ngủ tầng 1',       NOW(), NOW()),
('A103', 1, 55.0, 'AVAILABLE', 'Căn hộ 1 phòng ngủ tầng 1',       NOW(), NOW()),
('A201', 2, 80.0, 'OCCUPIED',  'Căn hộ 3 phòng ngủ tầng 2',       NOW(), NOW()),
('A202', 2, 80.0, 'INACTIVE',  'Căn hộ đang sửa chữa',            NOW(), NOW());

-- ============================================================
-- HOUSEHOLDS  (apartment_id references apartments.id 1-5)
-- ============================================================
INSERT INTO households (household_code, apartment_id, created_at, updated_at) VALUES
('HH-A101', 1, NOW(), NOW()),
('HH-A102', 2, NOW(), NOW()),
('HH-A201', 4, NOW(), NOW());

-- ============================================================
-- RESIDENTS
-- ============================================================
INSERT INTO residents (full_name, identity_number, phone_number, date_of_birth, gender, relationship_type, status, household_id, apartment_id, created_at, updated_at) VALUES
('Lê Văn An',      '001085012345', '0901234567', '1985-03-15', 'MALE',   'OWNER',  'ACTIVE', 1, 1, NOW(), NOW()),
('Lê Thị Hoa',     '001090023456', '0912345678', '1990-07-22', 'FEMALE', 'SPOUSE', 'ACTIVE', 1, 1, NOW(), NOW()),
('Lê Minh Khoa',   NULL,           NULL,          '2015-11-05', 'MALE',   'CHILD',  'ACTIVE', 1, 1, NOW(), NOW()),
('Phạm Thị Bích',  '001088034567', '0923456789', '1988-05-30', 'FEMALE', 'OWNER',  'ACTIVE', 2, 2, NOW(), NOW()),
('Phạm Quốc Hùng', '001986045678', '0934567890', '1986-09-12', 'MALE',   'SPOUSE', 'ACTIVE', 2, 2, NOW(), NOW()),
('Hoàng Văn Cường','001982056789', '0945678901', '1982-01-18', 'MALE',   'OWNER',  'ACTIVE', 3, 4, NOW(), NOW()),
('Hoàng Thị Dung', '001987067890', '0956789012', '1987-04-25', 'FEMALE', 'SPOUSE', 'ACTIVE', 3, 4, NOW(), NOW()),
('Hoàng Thị Mai',  NULL,           NULL,          '2012-08-14', 'FEMALE', 'CHILD',  'ACTIVE', 3, 4, NOW(), NOW()),
-- Resident đã chuyển đi (INACTIVE)
('Nguyễn Văn Cũ',  '001975099999', '0999999999', '1975-06-01', 'MALE',   'OWNER',  'INACTIVE', NULL, NULL, NOW(), NOW());

-- ============================================================
-- FEES
-- apartment_id: 1=A101, 2=A102, 4=A201
-- ============================================================

-- A101 fees
INSERT INTO fees (name, type, amount, due_date, apartment_id, description, status, created_at, updated_at) VALUES
('Phí quản lý T06/2026',  'MANDATORY', 500000.00, '2026-06-30', 1, 'Phí quản lý chung cư tháng 6/2026',   'PENDING',  NOW(), NOW()),
('Tiền điện T06/2026',    'MANDATORY', 350000.00, '2026-06-30', 1, 'Hóa đơn điện tháng 6/2026',           'PARTIAL',  NOW(), NOW()),
('Tiền nước T05/2026',    'MANDATORY',  90000.00, '2026-05-31', 1, 'Hóa đơn nước tháng 5/2026',           'PAID',     NOW(), NOW()),
('Phí gửi xe T06/2026',   'VOLUNTARY', 200000.00, '2026-06-30', 1, 'Phí gửi xe máy tháng 6/2026',         'PENDING',  NOW(), NOW()),

-- A102 fees
('Phí quản lý T06/2026',  'MANDATORY', 500000.00, '2026-06-30', 2, 'Phí quản lý chung cư tháng 6/2026',   'PAID',     NOW(), NOW()),
('Tiền điện T06/2026',    'MANDATORY', 420000.00, '2026-06-30', 2, 'Hóa đơn điện tháng 6/2026',           'PENDING',  NOW(), NOW()),
('Tiền nước T06/2026',    'MANDATORY', 110000.00, '2026-06-30', 2, 'Hóa đơn nước tháng 6/2026',           'PENDING',  NOW(), NOW()),

-- A201 fees
('Phí quản lý T06/2026',  'MANDATORY', 500000.00, '2026-06-30', 4, 'Phí quản lý chung cư tháng 6/2026',   'PARTIAL',  NOW(), NOW()),
('Tiền điện T06/2026',    'MANDATORY', 580000.00, '2026-06-30', 4, 'Hóa đơn điện tháng 6/2026',           'OVERDUE',  NOW(), NOW()),
('Tiền nước T06/2026',    'MANDATORY', 130000.00, '2026-06-30', 4, 'Hóa đơn nước tháng 6/2026',           'PENDING',  NOW(), NOW()),
('Phí vệ sinh T06/2026',  'MANDATORY',  50000.00, '2026-06-30', 4, 'Phí vệ sinh môi trường tháng 6/2026', 'PAID',     NOW(), NOW());

-- ============================================================
-- PAYMENTS
-- Recorded by staff1 (user id=2) and staff2 (user id=3)
-- fee_id references fees.id inserted above (1-indexed order)
-- fee 1  = A101 Phí quản lý T06  PENDING  → no payments
-- fee 2  = A101 Điện T06         PARTIAL  → 1 partial payment
-- fee 3  = A101 Nước T05         PAID     → 1 full payment
-- fee 4  = A101 Gửi xe T06       PENDING  → no payments
-- fee 5  = A102 Phí quản lý T06  PAID     → 1 full payment
-- fee 6  = A102 Điện T06         PENDING  → no payments
-- fee 7  = A102 Nước T06         PENDING  → no payments
-- fee 8  = A201 Phí quản lý T06  PARTIAL  → 1 partial payment
-- fee 9  = A201 Điện T06         OVERDUE  → no payments (overdue, unpaid)
-- fee 10 = A201 Nước T06         PENDING  → no payments
-- fee 11 = A201 Vệ sinh T06      PAID     → 1 full payment
-- ============================================================
INSERT INTO payments (fee_id, recorded_by, amount, payment_method, note, payment_date, created_at, updated_at) VALUES
-- A101 Điện PARTIAL: 200k of 350k paid
(2, 2, 200000.00, 'CASH',          'Nộp một phần tiền điện T6',          '2026-06-03 09:15:00', NOW(), NOW()),
-- A101 Nước PAID: full 90k
(3, 2, 90000.00,  'BANK_TRANSFER', 'Chuyển khoản tiền nước T5 đủ',       '2026-06-01 14:30:00', NOW(), NOW()),
-- A102 Phí quản lý PAID: full 500k
(5, 3, 500000.00, 'MOMO',          'Thanh toán qua MoMo đủ',             '2026-06-02 10:00:00', NOW(), NOW()),
-- A201 Phí quản lý PARTIAL: 300k of 500k paid
(8, 2, 300000.00, 'CASH',          'Nộp trước 300k phí quản lý',         '2026-06-04 08:45:00', NOW(), NOW()),
-- A201 Vệ sinh PAID: full 50k
(11, 3, 50000.00, 'CASH',          'Nộp tiền vệ sinh đủ',                '2026-06-01 11:00:00', NOW(), NOW());
