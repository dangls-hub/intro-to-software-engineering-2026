-- V11: Add CCCD (Citizen ID) front/back image paths to residents table.
-- Required for apartment join request approval workflow.

ALTER TABLE residents
    ADD COLUMN cccd_front_image VARCHAR(500) NULL,
    ADD COLUMN cccd_back_image  VARCHAR(500) NULL;
