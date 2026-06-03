CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    fee_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(30),
    transaction_no VARCHAR(100),
    qr_code_url TEXT,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
    CONSTRAINT fk_payment_fee FOREIGN KEY (fee_id) REFERENCES fees(id)
);