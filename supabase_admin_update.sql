-- =====================================================
-- ADMIN: Allow admin to update any user's profile
-- Run this in Supabase SQL Editor
-- =====================================================

-- Function to update any user's profile (admin only)
CREATE OR REPLACE FUNCTION admin_update_profile(
  target_user_id UUID,
  new_username TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  admin_email TEXT;
BEGIN
  -- Get the calling user's email
  SELECT email INTO admin_email FROM auth.users WHERE id = auth.uid();
  
  -- Only allow the admin
  IF admin_email != 'jaiy9956@gmail.com' THEN
    RAISE EXCEPTION 'Access denied: not an admin';
  END IF;
  
  -- Update the profile
  IF new_username IS NOT NULL THEN
    UPDATE profiles SET username = new_username, updated_at = NOW() WHERE id = target_user_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
