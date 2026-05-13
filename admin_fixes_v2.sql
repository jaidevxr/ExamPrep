-- Fix study_progress
DROP POLICY IF EXISTS "Admin can read all study_progress" ON study_progress;
CREATE POLICY "Admin can read all study_progress" ON study_progress
  FOR SELECT USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );

-- Fix direct_messages
DROP POLICY IF EXISTS "Admin can read all direct_messages" ON direct_messages;
CREATE POLICY "Admin can read all direct_messages" ON direct_messages
  FOR SELECT USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );

DROP POLICY IF EXISTS "Admin can delete direct_messages" ON direct_messages;
CREATE POLICY "Admin can delete direct_messages" ON direct_messages
  FOR DELETE USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );

-- Fix friendships
DROP POLICY IF EXISTS "Admin can read all friendships" ON friendships;
CREATE POLICY "Admin can read all friendships" ON friendships
  FOR SELECT USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );

-- Fix profiles
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );

-- Fix previous admin read profiles policy from setup_resources.sql if it's causing issues
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );

-- Fix previous admin manage resources policy
DROP POLICY IF EXISTS "Admin can manage resources" ON resources;
CREATE POLICY "Admin can manage resources" ON resources
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'jaiy9956@gmail.com'
  );
