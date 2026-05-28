-- Add missing fields to student_profiles
ALTER TABLE public.student_profiles
ADD COLUMN contact_number text,
ADD COLUMN city text,
ADD COLUMN twitter_url text,
ADD COLUMN website_url text,
ADD COLUMN bio text,
ADD COLUMN interests text[] DEFAULT '{}',
ADD COLUMN industries text,
ADD COLUMN experiences jsonb DEFAULT '[]',
ADD COLUMN cover_photo_url text;

-- Add avatar_url to profiles (for both student and investor)
ALTER TABLE public.profiles
ADD COLUMN avatar_url text;
