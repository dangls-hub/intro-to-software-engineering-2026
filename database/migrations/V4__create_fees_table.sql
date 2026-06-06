-- V4: Fees table
CREATE TABLE fees (
    id           BIGINT          NOT NULL AUTO_INCREMENT,
    name         VARCHAR(255)    NOT NULL,
    type         VARCHAR(20)     NOT NULL DEFAULT 'MANDATORY',
    amount       DECIMAL(15, 2),
    due_date     DATE,
    apartment_id BIGINT,
    description  VARCHAR(500),
    status       VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fees_apartment (apartment_id),
    INDEX idx_fees_status (status),
    CONSTRAINT fk_fees_apartment
        FOREIGN KEY (apartment_id) REFERENCES apartments(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
