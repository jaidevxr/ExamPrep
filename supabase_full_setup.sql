-- =====================================================
-- EXAMPREP: Complete Database Setup (Fresh Project)
-- Run this in your NEW Supabase SQL Editor
-- =====================================================

-- ==================== TABLES ====================

-- 1. Profiles (auto-created on user signup)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  study_id TEXT UNIQUE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  default_focus_duration INT DEFAULT 25,
  default_break_duration INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Study Progress
CREATE TABLE IF NOT EXISTS study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject_id, topic_id)
);

-- 3. Conversations (AI Chat)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages (AI Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_study_progress_user ON study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_subject ON study_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_profiles_study_id ON profiles(study_id);

-- ==================== FUNCTIONS ====================

-- Auto-generate 6-char Study ID
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

-- Trigger: auto-assign study_id on new profile
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
        NULL;
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

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, created_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Get friend's progress (secure)
CREATE OR REPLACE FUNCTION get_friend_progress(friend_user_id UUID)
RETURNS TABLE (subject_id TEXT, topic_id TEXT, completed BOOLEAN) AS $$
BEGIN
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

-- Update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS void AS $$
BEGIN
  UPDATE profiles SET last_seen = NOW() WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================== RLS POLICIES ====================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Study Progress
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON study_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON study_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON study_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON study_progress FOR DELETE USING (auth.uid() = user_id);

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations WHERE id = messages.conversation_id AND user_id = auth.uid()
  ));

-- Friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can respond to friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

CREATE POLICY "Users can remove friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- ==================== REALTIME ====================

ALTER PUBLICATION supabase_realtime ADD TABLE study_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE friendships;

-- ==================== STORAGE ====================

-- Create bucket for avatars/files (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pyq-files', 'pyq-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view public files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pyq-files');

CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[2]);

-- =====================================================
-- DONE! Your database is fully set up.
-- Now update your .env with the new project URL and key.
-- =====================================================
