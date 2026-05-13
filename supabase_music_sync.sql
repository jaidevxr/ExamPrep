-- =====================================================
-- MUSIC PLAYER: Store custom songs in profile
-- Run this in your Supabase SQL Editor (Dashboard > SQL)
-- =====================================================

-- Add custom_music column to profiles table to store user's custom songs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_music JSONB DEFAULT '[]'::jsonb;
