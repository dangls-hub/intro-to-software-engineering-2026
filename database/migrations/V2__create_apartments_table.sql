-- V2: Apartments table
CREATE TABLE apartments (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    room_number VARCHAR(50)     NOT NULL,
    floor       INT             NOT NULL,
    area        DOUBLE          NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE',
    description VARCHAR(255),
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_apartments_room_number (room_number),
    INDEX idx_apartments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
