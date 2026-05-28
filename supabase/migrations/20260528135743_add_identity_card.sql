-- Add identity_card_url to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN IF NOT EXISTS identity_card_url text;

-- Create identity-cards storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity-cards', 'identity-cards', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for identity-cards

-- Allow authenticated users to insert their own files
CREATE POLICY "Users can upload their own ID card" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'identity-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own files
CREATE POLICY "Users can view their own ID card" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'identity-cards' AND auth.uid()::text = (storage.foldername(name))[1]);

-- (Optional) If you have a specific role or admin check in the future, you can add it here.
-- Currently, we keep it private to the user themselves.
