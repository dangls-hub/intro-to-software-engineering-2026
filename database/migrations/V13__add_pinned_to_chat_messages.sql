-- V13: Add pinned column to chat_messages table to support message pinning.
ALTER TABLE chat_messages
    ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT FALSE;
