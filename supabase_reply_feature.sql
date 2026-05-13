-- =====================================================
-- Add reply-to-message feature to direct messages
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add reply_to column
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES direct_messages(id) ON DELETE SET NULL;

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_dm_reply_to ON direct_messages(reply_to);
