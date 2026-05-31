-- Migration: Grant superadmin full read/write access to all platform tables
-- Previously all admin policies used has_role('admin') only, blocking superadmin users.

-- ── investor_profiles ────────────────────────────────────────────────
CREATE POLICY IF NOT EXISTS "ip_select_superadmin"
  ON investor_profiles FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "ip_update_superadmin"
  ON investor_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "ip_delete_superadmin"
  ON investor_profiles FOR DELETE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- ── profiles ─────────────────────────────────────────────────────────
CREATE POLICY IF NOT EXISTS "profiles_select_superadmin"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "profiles_update_superadmin"
  ON profiles FOR UPDATE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- ── student_profiles ─────────────────────────────────────────────────
CREATE POLICY IF NOT EXISTS "sp_select_superadmin"
  ON student_profiles FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "sp_update_superadmin"
  ON student_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "sp_delete_superadmin"
  ON student_profiles FOR DELETE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- ── pitches ──────────────────────────────────────────────────────────
CREATE POLICY IF NOT EXISTS "pitches_select_superadmin"
  ON pitches FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "pitches_update_superadmin"
  ON pitches FOR UPDATE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "pitches_delete_superadmin"
  ON pitches FOR DELETE
  USING (has_role(auth.uid(), 'superadmin'::app_role));

-- ── user_roles ───────────────────────────────────────────────────────
CREATE POLICY IF NOT EXISTS "roles_select_superadmin"
  ON user_roles FOR SELECT
  USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "roles_insert_superadmin"
  ON user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

CREATE POLICY IF NOT EXISTS "roles_delete_superadmin"
  ON user_roles FOR DELETE
  USING (has_role(auth.uid(), 'superadmin'::app_role));
