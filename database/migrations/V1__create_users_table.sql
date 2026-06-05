-- V1: Users table
CREATE TABLE users (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    username       VARCHAR(100)    NOT NULL,
    password       VARCHAR(255)    NOT NULL,
    email          VARCHAR(150)    NOT NULL,
    full_name      VARCHAR(200),
    role           VARCHAR(20)     NOT NULL DEFAULT 'RESIDENT',
    reset_token    VARCHAR(64),
    reset_token_expiry DATETIME,
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email    (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
