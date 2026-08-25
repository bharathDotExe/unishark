# UniShark Application Audit - 2026-06-20

Scope: Vite React frontend, Supabase client integration, database migrations/schema files, route guards, storage flows, admin/superadmin/student/investor pages.

Subagent status: authorized, but all delegated agents failed with a usage-limit error. This report was completed manually from local repository evidence.

Verification commands:

- `npm run build`: passed outside sandbox. Warnings: stale Browserslist data, PostCSS `from` option warning, production JS chunk is 1,434.10 kB minified / 367.52 kB gzip.
- `npm test`: passed outside sandbox. Coverage is only `src/test/example.test.ts`.
- `npm run lint`: failed with 138 errors and 17 warnings.
- `npm audit --audit-level=moderate`: found 0 vulnerabilities.

## Findings

### 1. High - Students can self-approve pitches and bypass review

Evidence:

- `src/pages/Dashboard.tsx:178-183` updates a student's pitch directly to `{ status: "APPROVED" }`.
- `src/pages/MyPitches.tsx:146-156` does the same and tells the user the pitch is visible to investors.
- `supabase/migrations/20260504093018_91039f5c-1eba-41e3-a47c-f5a49b3e6f32.sql:184-189` allows investors to read `APPROVED` pitches and allows pitch owners to update their own rows.

Impact: any student can make their own pitch investor-visible without admin approval. This breaks the moderation/review model and can expose unreviewed or malicious pitch content.

Fix: split owner updates from moderation updates. Students should only be able to edit draft/submitted content and request review, not set `APPROVED`/`REJECTED`. Enforce this in RLS with `WITH CHECK` and/or a controlled RPC/admin-only policy.

### 2. High - Role-loading race causes false redirects from protected routes

Evidence:

- `src/hooks/useAuth.tsx:24-26` fetches roles asynchronously.
- `src/hooks/useAuth.tsx:40-44` sets `loading` false immediately after starting `fetchRoles`, without awaiting it.
- `src/hooks/useAuth.tsx:30-35` also defers role fetching with `setTimeout`.
- `src/components/ProtectedRoute.tsx:16-18` redirects if `requireRole` is missing from the still-empty `roles` array.

Impact: valid admin, superadmin, investor, or student users can be redirected to `/` or rendered in the wrong layout during initial load/refresh. This is a production UX and access-control reliability bug.

Fix: track role loading separately or await `fetchRoles` before setting auth loading false. ProtectedRoute should not evaluate role requirements until roles are loaded or an error state is known.

### 3. High - Latest superadmin RLS migration likely fails to apply

Evidence:

- `supabase/migrations/20260531120000_superadmin_rls_policies.sql:5`, `:9`, `:13`, `:18`, `:22`, `:27`, `:31`, `:35`, `:40`, `:44`, `:48`, `:53`, `:57`, and `:61` use `CREATE POLICY IF NOT EXISTS`.

Impact: PostgreSQL/Supabase migrations do not support this syntax in ordinary `CREATE POLICY`; the migration can fail before granting superadmin access to profiles, pitches, and roles. If this migration is unapplied, several superadmin screens will be blocked by RLS despite the UI routes existing.

Fix: replace each statement with an idempotent `DO $$ BEGIN CREATE POLICY ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` block, or drop/recreate policies deliberately in a migration.

### 4. Medium - Private storage assets are saved with public URLs

Evidence:

- `supabase/migrations/20260528135743_add_identity_card.sql:6-8` creates `identity-cards` as a private bucket.
- `src/pages/Signup.tsx:126-135` and `src/pages/VerifyOtp.tsx:60-69` upload ID cards, call `getPublicUrl`, then store that URL.
- `supabase_schema.sql:117-120` documents `profile-photos` as private.
- `src/pages/Profile.tsx:307-316` and `:331-339` upload profile photos to `profile-photos`, call `getPublicUrl`, and store that URL.
- `src/lib/supabase-storage.ts:8-15` repeats the same pattern for profile photos.

Impact: private files may display as broken images/links because public URLs do not grant access to private buckets. For ID cards, treating a private document as URL-addressable also risks accidental sharing if bucket policy changes later.

Fix: either make non-sensitive display images public by design, or keep buckets private and render via short-lived signed URLs. For ID cards, avoid storing public URL strings; store the object path and allow only authorized users/admins to create signed URLs.

### 5. Medium - `profile-photos` bucket/policies are not provisioned by migrations

Evidence:

- App code uploads to `profile-photos` in `src/pages/Profile.tsx:307` and `:331`, plus `src/lib/supabase-storage.ts:9`.
- `rg` found no migration creating `profile-photos`; `supabase_schema.sql:117-120` says to create it manually in the Supabase Dashboard.

Impact: fresh environments created from migrations will fail profile/cover photo upload flows with missing bucket or missing storage policy errors.

Fix: add a migration that creates the bucket and storage policies. Do not rely on dashboard-only setup for production-critical app behavior.

### 6. Medium - Admin messages page queries a non-existent column

Evidence:

- Database schema defines `messages.recipient_id` at `supabase/migrations/20260504093018_91039f5c-1eba-41e3-a47c-f5a49b3e6f32.sql:82-87`.
- Generated Supabase types also expose `recipient_id` in `src/integrations/supabase/types.ts:275`.
- `src/pages/admin/AdminMessages.tsx:10-16` models `receiver_id`.
- `src/pages/admin/AdminMessages.tsx:28-31` selects `receiver_id`.

Impact: the admin communications screen will return a Supabase select error and show no message data.

Fix: rename UI fields and selects to `recipient_id`, or migrate the database consistently if the product wants `receiver_id`.

### 7. Medium - User-facing Messages page is static mock data and Send does nothing

Evidence:

- `src/pages/Messages.tsx:37-185` hard-codes all conversations.
- `src/pages/Messages.tsx:345-355` renders input and Send/Attach buttons without state binding or submit handlers.

Impact: users see fake conversations and cannot actually message founders/investors from this route, despite the app having a real `messages` table and admin monitoring UI.

Fix: load conversations from Supabase, bind the textarea, insert messages with `sender_id`, `recipient_id`, `pitch_id`, and update read state.

### 8. Medium - Platform settings are readable by every authenticated user

Evidence:

- `supabase/migrations/20260529130000_superadmin_schema.sql:126-152` creates `platform_settings` and policy `Anyone can read settings`.
- `src/pages/superadmin/SuperAdminSettings.tsx:13-35` includes settings such as maintenance mode, signups, email notifications, admin/support email, admin 2FA, commission rate, and subscription price.

Impact: authenticated non-admins can read operational/security configuration. Some settings may be harmless, but admin 2FA and maintenance/signup flags are internal control state.

Fix: split public settings from private operational settings. Restrict private keys to superadmin and expose only explicitly public configuration through a separate view or RPC.

### 9. Medium - Supabase type safety is disabled in the actual client

Evidence:

- `src/integrations/supabase/client.ts:3` declares `type Database = any`.
- A generated schema exists in `src/integrations/supabase/types.ts`, but the client does not import it.

Impact: schema mismatches such as `receiver_id` vs `recipient_id` are not caught at compile time. This also explains the broad use of `as any` in admin/superadmin pages.

Fix: import `type { Database } from "./types"` in the client and remove the local `any`. Then fix resulting compile errors instead of casting tables/rows to `any`.

### 10. Medium - Lint is currently failing across the application

Evidence:

- `npm run lint` fails with 155 total problems: 138 errors and 17 warnings.
- Examples include `no-explicit-any`, empty blocks in `src/pages/PitchDetail.tsx:199` and `:210`, `no-case-declarations` in `src/pages/PitchForm.tsx:242`, and forbidden `require()` in `tailwind.config.ts:107`.

Impact: CI quality gates cannot reliably protect the app, and real bugs are being hidden in a large noise floor.

Fix: prioritize the errors tied to runtime/schema bugs first, re-enable generated Supabase types, then either fix or intentionally tune lint rules for shadcn-style component files.

### 11. Low - Production bundle is oversized

Evidence:

- `npm run build` produced `dist/assets/index-DWiT_M0p.js` at 1,434.10 kB minified / 367.52 kB gzip, and Vite warned that chunks exceed 500 kB.

Impact: slower first load, especially on mobile or weaker networks.

Fix: lazy-load admin/superadmin/investor route groups with `React.lazy`, split chart/animation-heavy dependencies, and use Rollup manual chunks where appropriate.

### 12. Low - Build tooling warnings should be cleaned up

Evidence:

- Build warns that Browserslist/caniuse-lite data is 12 months old.
- Build warns a PostCSS plugin did not pass the `from` option to `postcss.parse`.

Impact: stale browser targeting and potentially incorrect imported asset transforms.

Fix: update Browserslist data and review PostCSS/Tailwind plugin versions/configuration.

## Positive Notes

- No `service_role` or secret key exposure was found in repository search.
- `.env` only contains Vite-prefixed Supabase project URL/publishable key/project id values.
- `npm audit --audit-level=moderate` reported no dependency vulnerabilities.
- Production build and the existing Vitest test pass outside the sandbox.

## Recommended Fix Order

1. Lock down pitch approval in RLS and remove student self-approval UI paths.
2. Fix auth/role loading so protected routes wait for roles.
3. Repair the superadmin RLS migration syntax and verify migrations on a clean database.
4. Provision `profile-photos` through migration and change private storage flows to signed URLs/object paths.
5. Re-enable generated Supabase types in the client and fix schema mismatches.
6. Replace mocked Messages with real Supabase data flow.
7. Burn down lint errors and add tests for auth routing, pitch approval, and messaging.
