-- V9: Create resident_reports table
CREATE TABLE resident_reports (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    title         VARCHAR(255)  NOT NULL,
    content       TEXT          NOT NULL,
    type          VARCHAR(50)   NOT NULL DEFAULT 'OTHER',
    status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    submitted_by  BIGINT        NOT NULL,
    resolved_by   BIGINT        NULL,
    resolve_note  VARCHAR(500)  NULL,
    resolved_at   DATETIME      NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_reports_submitted_by (submitted_by),
    INDEX idx_reports_status (status),
    CONSTRAINT fk_reports_submitted_by
        FOREIGN KEY (submitted_by) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reports_resolved_by
        FOREIGN KEY (resolved_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
