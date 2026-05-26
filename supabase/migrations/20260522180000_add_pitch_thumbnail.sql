-- Add thumbnail_url column to pitches table
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create storage bucket for pitch-thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch-thumbnails', 'pitch-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for pitch-thumbnails (public bucket)
CREATE POLICY "Public Read Access for Pitch Thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'pitch-thumbnails');

CREATE POLICY "Authenticated Upload for Pitch Thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pitch-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner Delete for Pitch Thumbnails" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pitch-thumbnails'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
