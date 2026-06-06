-- V5: Payments table
CREATE TABLE payments (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    fee_id         BIGINT          NOT NULL,
    recorded_by    BIGINT          NOT NULL,
    amount         DECIMAL(15, 2)  NOT NULL,
    payment_method VARCHAR(20)     NOT NULL,
    note           VARCHAR(500),
    payment_date   DATETIME        NOT NULL,
    created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_payments_fee (fee_id),
    INDEX idx_payments_recorded_by (recorded_by),
    INDEX idx_payments_date (payment_date),
    CONSTRAINT fk_payments_fee
        FOREIGN KEY (fee_id) REFERENCES fees(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_user
        FOREIGN KEY (recorded_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
