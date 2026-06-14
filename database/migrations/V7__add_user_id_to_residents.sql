-- V7: Link resident records to auth users.
-- Null is allowed because staff/admin can still create resident records manually.

ALTER TABLE residents
    ADD COLUMN user_id BIGINT NULL,
    ADD INDEX idx_residents_user (user_id),
    ADD CONSTRAINT fk_residents_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
