-- V12: Add recalled and hidden_usernames columns to chat_messages table to support message recall and hide.
ALTER TABLE chat_messages
    ADD COLUMN recalled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN hidden_usernames TEXT NULL;
