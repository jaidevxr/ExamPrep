-- Create storage bucket for PYQ files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pyq-files', 'pyq-files', false);

-- Create RLS policies for PYQ bucket
CREATE POLICY "Users can upload their own PYQ files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pyq-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own PYQ files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pyq-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own PYQ files"
ON storage.objects FOR DELETE
USING (bucket_id = 'pyq-files' AND auth.uid()::text = (storage.foldername(name))[1]);