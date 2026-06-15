-- V10: Create announcements table
CREATE TABLE announcements (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255)  NOT NULL,
    content     TEXT          NOT NULL,
    type        VARCHAR(50)   NOT NULL DEFAULT 'ANNOUNCEMENT',
    event_date  DATETIME      NULL,
    posted_by   BIGINT        NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_announcements_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
