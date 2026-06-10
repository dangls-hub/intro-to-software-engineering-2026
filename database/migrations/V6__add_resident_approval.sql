-- V6: Add approval workflow columns to residents table
-- Supports admin approval process when adding residents to apartments.
-- Existing data defaults to 'APPROVED' so current residents are unaffected.

ALTER TABLE residents
    ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN approved_by BIGINT NULL,
    ADD COLUMN approved_at DATETIME NULL,
    ADD COLUMN reject_reason VARCHAR(500) NULL,
    ADD INDEX idx_residents_approval (approval_status),
    ADD CONSTRAINT fk_residents_approved_by
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE;
