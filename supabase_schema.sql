-- ══════════════════════════════════════════════════════════════════
-- UniShark — Supabase SQL Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ── 1. STUDENT PROFILES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  full_name           VARCHAR(255) NOT NULL,
  college             VARCHAR(255) NOT NULL,
  year                VARCHAR(50)  NOT NULL
                        CHECK (year IN ('1st Year','2nd Year','3rd Year','4th Year','Alumni')),
  city                VARCHAR(100) NOT NULL,
  linkedin_url        VARCHAR(500),
  contact_number      VARCHAR(20),
  profile_photo_url   VARCHAR(500),

  -- Skills & Interests (Arrays)
  skills              TEXT[] DEFAULT ARRAY[]::TEXT[],
  startup_interests   TEXT[] DEFAULT ARRAY[]::TEXT[],
  industries_interest TEXT,

  -- Status
  profile_complete    BOOLEAN DEFAULT false,

  -- Timestamps
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. INVESTOR PROFILES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_profiles (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  full_name                 VARCHAR(255) NOT NULL,
  company_fund_name         VARCHAR(255),
  bio                       TEXT CHECK (char_length(bio) <= 200),
  contact_number            VARCHAR(20)  NOT NULL,
  city                      VARCHAR(100) NOT NULL,
  linkedin_url              VARCHAR(500) NOT NULL,
  profile_photo_url         VARCHAR(500),

  -- Investment Details
  investment_experience     VARCHAR(50) NOT NULL
                              CHECK (investment_experience IN ('First-time','1-5','5-20','20+')),
  ticket_size_min           DECIMAL(15,2) NOT NULL,
  ticket_size_max           DECIMAL(15,2) NOT NULL,
  preferred_stages          TEXT[] DEFAULT ARRAY[]::TEXT[],
  investment_sectors        TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_sectors         TEXT,

  -- Past Investments
  total_investments_count   INTEGER DEFAULT 0,
  past_investments          JSONB,

  -- Verification
  verified                  BOOLEAN DEFAULT false,
  verification_status       VARCHAR(50) DEFAULT 'PENDING'
                              CHECK (verification_status IN ('PENDING','APPROVED','REJECTED')),
  reference_founder_1_name  VARCHAR(255),
  reference_founder_1_email VARCHAR(255),
  reference_founder_2_name  VARCHAR(255),
  reference_founder_2_email VARCHAR(255),

  -- Status
  profile_complete          BOOLEAN DEFAULT false,

  -- Timestamps
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  verified_at               TIMESTAMPTZ
);

-- ── 3. INDEXES ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id   ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_user_id  ON investor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_verified ON investor_profiles(verified);

-- ── 4. UPDATED_AT TRIGGER ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_investor_profiles_updated_at
  BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 5. ROW LEVEL SECURITY ─────────────────────────────────────────
ALTER TABLE student_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Student Policies
CREATE POLICY "student_select_own"   ON student_profiles FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "student_insert_own"   ON student_profiles FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "student_update_own"   ON student_profiles FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "student_view_public"  ON student_profiles FOR SELECT  USING (profile_complete = true);

-- Investor Policies
CREATE POLICY "investor_select_own"  ON investor_profiles FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "investor_insert_own"  ON investor_profiles FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investor_update_own"  ON investor_profiles FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "investor_view_public" ON investor_profiles FOR SELECT  USING (verified = true AND profile_complete = true);

-- ── 6. STORAGE BUCKET (run separately in Supabase Dashboard) ──────
-- Storage → New Bucket → Name: profile-photos → Public: No
-- Then add policy in Supabase Storage Policies:
--   Authenticated users can upload to their own folder (user_id prefix)

-- ── 7. VERIFY ─────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('student_profiles', 'investor_profiles');
