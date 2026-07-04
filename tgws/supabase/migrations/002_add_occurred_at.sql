-- Add occurred_at column to tickets table
-- Stores when the problem actually occurred (user-reported)
ALTER TABLE tickets ADD COLUMN occurred_at TIMESTAMP;
