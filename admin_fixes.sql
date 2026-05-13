-- Allow Admin to read study_progress
DROP POLICY IF EXISTS "Admin can read all study_progress" ON study_progress;
CREATE POLICY "Admin can read all study_progress" ON study_progress
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );

-- Allow Admin to read and delete direct_messages
DROP POLICY IF EXISTS "Admin can read all direct_messages" ON direct_messages;
CREATE POLICY "Admin can read all direct_messages" ON direct_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );

DROP POLICY IF EXISTS "Admin can delete direct_messages" ON direct_messages;
CREATE POLICY "Admin can delete direct_messages" ON direct_messages
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );

-- Allow Admin to read friendships
DROP POLICY IF EXISTS "Admin can read all friendships" ON friendships;
CREATE POLICY "Admin can read all friendships" ON friendships
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );

-- Allow Admin to delete profiles
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
CREATE POLICY "Admin can delete profiles" ON profiles
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );
