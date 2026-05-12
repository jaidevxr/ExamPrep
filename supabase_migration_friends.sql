-- =====================================================
-- STUDY BUDDIES: Friends & Progress Comparison
-- Run this in your Supabase SQL Editor (Dashboard > SQL)
-- =====================================================

-- 1. Add study_id and last_seen to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

-- 2. Generate unique 6-char study IDs for existing users
CREATE OR REPLACE FUNCTION generate_study_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing users with study IDs
DO $$
DECLARE
  r RECORD;
  new_id TEXT;
BEGIN
  FOR r IN SELECT id FROM profiles WHERE study_id IS NULL LOOP
    LOOP
      new_id := generate_study_id();
      BEGIN
        UPDATE profiles SET study_id = new_id WHERE id = r.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        -- Try again with a new ID
      END;
    END LOOP;
  END LOOP;
END $$;

-- Auto-generate study_id for new users
CREATE OR REPLACE FUNCTION auto_assign_study_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id TEXT;
BEGIN
  IF NEW.study_id IS NULL THEN
    LOOP
      new_id := generate_study_id();
      BEGIN
        NEW.study_id := new_id;
        RETURN NEW;
      EXCEPTION WHEN unique_violation THEN
        -- Retry
      END;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assign_study_id ON profiles;
CREATE TRIGGER assign_study_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_study_id();

-- 3. Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_profiles_study_id ON profiles(study_id);

-- 4. RLS Policies for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can see friendships they're part of
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Users can send friend requests (they must be the requester)
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update friendship status (accept/block - addressee only)
CREATE POLICY "Users can respond to friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- Users can delete friendships they're part of
CREATE POLICY "Users can remove friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- 5. Update profiles RLS - allow reading basic info of any user (for friend search)
-- Drop existing policy if it exists, then recreate
DO $$
BEGIN
  -- Allow users to read basic profile info of other users (for friend features)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view basic profiles' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY "Users can view basic profiles"
      ON profiles FOR SELECT
      USING (true);
  END IF;
END $$;

-- 6. Function to get friend's progress (security enforced)
CREATE OR REPLACE FUNCTION get_friend_progress(friend_user_id UUID)
RETURNS TABLE (subject_id TEXT, topic_id TEXT, completed BOOLEAN) AS $$
BEGIN
  -- Only return data if users are actually friends
  IF EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = auth.uid() AND addressee_id = friend_user_id)
      OR (requester_id = friend_user_id AND addressee_id = auth.uid())
    )
  ) THEN
    RETURN QUERY
    SELECT sp.subject_id, sp.topic_id, sp.completed
    FROM study_progress sp
    WHERE sp.user_id = friend_user_id AND sp.completed = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Function to update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS void AS $$
BEGIN
  UPDATE profiles SET last_seen = NOW() WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enable realtime for friendships
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;
