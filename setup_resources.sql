-- Resources table for PYQs and Notes
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pyq', 'notes')),
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  year TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Everyone can read resources
CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

-- Only admin can insert/update/delete (using email check)
CREATE POLICY "Admin can manage resources" ON resources
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com'
    )
  );

-- Admin can read ALL profiles (for admin panel)
CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com'
    )
  );

-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public)
VALUES ('pyq-files', 'pyq-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'pyq-files');

CREATE POLICY "Admin upload access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pyq-files' AND
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );

CREATE POLICY "Admin delete access" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pyq-files' AND
    auth.uid() IN (SELECT id FROM auth.users WHERE email = 'jaiy9956@gmail.com')
  );
