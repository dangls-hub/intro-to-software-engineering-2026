-- V3: Households and Residents tables
CREATE TABLE households (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    household_code  VARCHAR(50)     NOT NULL,
    apartment_id    BIGINT          NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_households_code (household_code),
    CONSTRAINT fk_households_apartment
        FOREIGN KEY (apartment_id) REFERENCES apartments(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE residents (
    id                BIGINT          NOT NULL AUTO_INCREMENT,
    full_name         VARCHAR(200)    NOT NULL,
    identity_number   VARCHAR(20),
    phone_number      VARCHAR(20),
    date_of_birth     DATE,
    gender            VARCHAR(10),
    relationship_type VARCHAR(20),
    status            VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    household_id      BIGINT,
    apartment_id      BIGINT,
    created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_residents_identity_number (identity_number),
    INDEX idx_residents_status (status),
    INDEX idx_residents_household (household_id),
    CONSTRAINT fk_residents_household
        FOREIGN KEY (household_id) REFERENCES households(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_residents_apartment
        FOREIGN KEY (apartment_id) REFERENCES apartments(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
