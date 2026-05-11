-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('student', 'investor', 'admin');
CREATE TYPE public.pitch_stage AS ENUM ('IDEA', 'MVP', 'REVENUE', 'GROWTH');
CREATE TYPE public.pitch_status AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE public.student_year AS ENUM ('FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'ALUMNI');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES (separate, secure) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ STUDENT / INVESTOR PROFILES ============
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  college TEXT,
  year public.student_year,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  sectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  ticket_size_min TEXT,
  ticket_size_max TEXT,
  past_investments JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified BOOLEAN NOT NULL DEFAULT false,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;

-- ============ PITCHES ============
CREATE TABLE public.pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  one_liner TEXT,
  problem TEXT,
  solution TEXT,
  market_size TEXT,
  stage public.pitch_stage,
  status public.pitch_status NOT NULL DEFAULT 'DRAFT',
  funding_ask TEXT,
  deck_url TEXT,
  team_members JSONB NOT NULL DEFAULT '[]'::jsonb,
  traction TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_pitch ON public.messages(pitch_id, created_at);

-- ============ BOOKMARKS ============
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pitch_id UUID NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pitch_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ============ TRIGGERS: updated_at + new user ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pitches_updated BEFORE UPDATE ON public.pitches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile + role + role-specific profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);

  IF v_role = 'student' THEN
    INSERT INTO public.student_profiles (user_id) VALUES (NEW.id);
  ELSIF v_role = 'investor' THEN
    INSERT INTO public.investor_profiles (user_id) VALUES (NEW.id);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ RLS POLICIES ============
-- profiles
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_select_for_messaging" ON public.profiles FOR SELECT
  USING (
    -- a profile is visible if you have an active conversation with them
    EXISTS (SELECT 1 FROM public.messages m
      WHERE (m.sender_id = auth.uid() AND m.recipient_id = profiles.id)
         OR (m.recipient_id = auth.uid() AND m.sender_id = profiles.id))
  );
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_roles (read own; admins read all; no client-side writes)
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- student_profiles
CREATE POLICY "sp_select_own_or_admin" ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sp_select_via_approved_pitch" ON public.student_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.pitches p WHERE p.user_id = student_profiles.user_id AND p.status = 'APPROVED')
    AND (public.has_role(auth.uid(), 'investor') OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "sp_update_own" ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "sp_insert_own" ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- investor_profiles
CREATE POLICY "ip_select_own_or_admin" ON public.investor_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "ip_update_own" ON public.investor_profiles FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "ip_insert_own" ON public.investor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ip_admin_update" ON public.investor_profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- pitches
CREATE POLICY "pitches_select_own" ON public.pitches FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "pitches_select_admin" ON public.pitches FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pitches_select_approved_for_investors" ON public.pitches FOR SELECT
  USING (status = 'APPROVED' AND public.has_role(auth.uid(), 'investor'));
CREATE POLICY "pitches_insert_student_own" ON public.pitches FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'student'));
CREATE POLICY "pitches_update_own" ON public.pitches FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "pitches_update_admin" ON public.pitches FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "pitches_delete_own" ON public.pitches FOR DELETE
  USING (auth.uid() = user_id);

-- messages
CREATE POLICY "messages_select_participant" ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "messages_insert_sender" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_recipient_read" ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- bookmarks
CREATE POLICY "bookmarks_select_own" ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own" ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'investor'));
CREATE POLICY "bookmarks_delete_own" ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============ STORAGE BUCKET ============
INSERT INTO storage.buckets (id, name, public) VALUES ('pitch-decks', 'pitch-decks', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "decks_owner_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "decks_owner_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "decks_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "decks_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'pitch-decks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "decks_admin_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'pitch-decks' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "decks_investor_read_approved" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pitch-decks'
    AND public.has_role(auth.uid(), 'investor')
    AND EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.deck_url LIKE '%' || storage.objects.name || '%' AND p.status = 'APPROVED'
    )
  );