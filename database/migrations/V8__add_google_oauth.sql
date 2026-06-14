-- V8: Thêm hỗ trợ Google OAuth (Sign in with Google)
-- Cho phép đăng nhập song song: username/password (LOCAL) hoặc Google (GOOGLE)

ALTER TABLE users
    ADD COLUMN google_id     VARCHAR(50)  NULL UNIQUE  COMMENT 'Google subject ID (sub) — định danh duy nhất từ Google',
    ADD COLUMN avatar_url    VARCHAR(500) NULL         COMMENT 'URL ảnh đại diện lấy từ Google',
    ADD COLUMN auth_provider VARCHAR(20)  NOT NULL DEFAULT 'LOCAL'
        COMMENT 'Nhà cung cấp xác thực: LOCAL (username/password) hoặc GOOGLE';

-- username và password trở thành nullable vì user Google không cần chúng
ALTER TABLE users
    MODIFY COLUMN username VARCHAR(100) NULL,
    MODIFY COLUMN password VARCHAR(255) NULL;

-- Thêm index để tìm kiếm nhanh theo google_id
ALTER TABLE users
    ADD INDEX idx_users_google_id (google_id);
