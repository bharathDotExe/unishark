# UniShark Architecture

Generated from the repository on 2026-06-07. This document describes only components found in the codebase.

## Source Files Reviewed

- Frontend shell and routing: `src/App.tsx`
- Supabase client: `src/integrations/supabase/client.ts`
- Auth and authorization guard: `src/hooks/useAuth.tsx`, `src/components/ProtectedRoute.tsx`
- Storage helper and upload call sites: `src/lib/supabase-storage.ts`, `src/pages/PitchForm.tsx`, `src/pages/Profile.tsx`, `src/pages/Signup.tsx`, `src/pages/VerifyOtp.tsx`
- Supabase schema and policies: `supabase/migrations/*.sql`, `src/integrations/supabase/types.ts`
- Build and infrastructure hints: `package.json`, `vite.config.ts`, `.env`, `supabase/config.toml`

## Diagrams

- Eraser architecture diagram: `architecture.eraserdiagram`
- Mermaid architecture diagram: `architecture.mmd`
- Mermaid ER diagram: `er-diagram.mmd`

## Executive Summary

UniShark is a Vite React single-page application backed directly by Supabase. The application has no separate Express/Node API server and no Supabase Edge Functions in the repository. Browser clients use `@supabase/supabase-js` to call Supabase Auth, PostgREST table APIs, RPC/functions, and Storage APIs.

The critical request paths are:

1. Browser loads the static React SPA from a static host/CDN.
2. React Router selects public, protected, student, investor, admin, or superadmin views.
3. `AuthProvider` reads the Supabase session and loads roles from `user_roles`.
4. Client views query or mutate Supabase tables through PostgREST.
5. Supabase enforces authorization primarily through Postgres Row-Level Security policies.
6. File uploads and downloads go through Supabase Storage bucket policies.

## Component Groups

### Client Applications

- Public visitors use the landing, login, signup, OTP verification, and OAuth callback routes.
- Student founders create and manage profiles and pitches.
- Investors browse approved pitches, bookmark pitches, view portfolio/analytics pages, and message founders.
- Admins and superadmins access management dashboards and operational tables.

### Frontend

- `Vite React SPA`: React 18, TypeScript, Vite, and React Router.
- `UI system`: Tailwind CSS, Radix UI primitives, shadcn-style components, Lucide icons, Sonner/toast components, Framer Motion, and Recharts.
- `Routing`: `src/App.tsx` defines public routes, protected routes, role-switched dashboard/profile/message routes, investor routes, student routes, admin routes, and superadmin routes.
- `Auth state`: `src/hooks/useAuth.tsx` subscribes to `supabase.auth.onAuthStateChange`, calls `supabase.auth.getSession`, and loads roles from `user_roles`.
- `Authorization guard`: `src/components/ProtectedRoute.tsx` redirects unauthenticated users to `/login` and redirects users without required roles to `/`.
- `Data access`: page components call `supabase.from(...)` directly for table operations.
- `Storage access`: page components and `src/lib/supabase-storage.ts` upload to Supabase Storage buckets and store returned URLs in profile or pitch rows.

### Backend Services

- `Supabase Auth`: handles email/password sign-in, signup, OTP verification, session persistence/refresh, and OAuth callback handling.
- `Supabase Data API / PostgREST`: exposes table CRUD and the `has_role` RPC/function to the browser client.
- `Supabase Storage API`: handles object uploads, public URL generation, and signed URL creation for private pitch decks.
- `Postgres functions/triggers`: migrations define `has_role`, `set_updated_at`, and `handle_new_user`. The `on_auth_user_created` trigger creates profile, role, and role-specific profile records after signup.
- `RLS policies`: all core application tables and storage object access are governed through RLS and object policies.

### Database Layer

The Supabase database includes:

- Identity and access: `auth.users`, `profiles`, `user_roles`
- Role-specific profiles: `student_profiles`, `investor_profiles`
- Marketplace core: `pitches`, `bookmarks`, `messages`
- Superadmin/operations: `deals`, `transactions`, `audit_logs`, `platform_settings`, `database_backups`
- Storage objects and buckets: `pitch-decks`, `pitch-thumbnails`, `identity-cards`; the app also uploads to `profile-photos`

Notable enums include `app_role`, `pitch_stage`, `pitch_status`, `student_year`, `deal_status`, `transaction_type`, `transaction_status`, `audit_category`, and `audit_severity`.

### External Services

- Google OAuth is used for sign-in.
- Lovable Cloud Auth is imported via `@lovable.dev/cloud-auth-js` and used by the Google sign-in button as an OAuth broker/preview origin helper.
- Supabase Managed Platform provides the hosted Auth, Postgres, PostgREST, and Storage services.

### Infrastructure

- Build/development: Vite with `@vitejs/plugin-react-swc`; dev server configured for host `::` and port `8080`.
- Static deployment: the repo builds a static SPA with `vite build`, but no Vercel/Netlify/GitHub Actions/deployment target config was found.
- Environment config: the frontend expects `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Supabase config: `supabase/config.toml` contains a Supabase project id, while `.env` points at a different Supabase project URL/id. Treat this as an environment alignment item.
- Database changes: migrations live under `supabase/migrations`.

## Critical Request Paths

### Authentication

1. User submits email/password, OTP, signup, or Google OAuth.
2. Frontend calls `supabase.auth.*`.
3. Supabase Auth creates or refreshes the session.
4. `AuthProvider` receives auth state changes and loads roles from `user_roles`.
5. `ProtectedRoute` and role wrappers route the user to student, investor, admin, or superadmin experiences.

### Signup and Profile Creation

1. Signup calls Supabase Auth with role metadata.
2. Database trigger `on_auth_user_created` runs `handle_new_user`.
3. Trigger inserts into `profiles`, `user_roles`, and either `student_profiles` or `investor_profiles`.
4. OAuth callback code may upsert role/profile records to complete the onboarding flow.

### Pitch Creation and Review

1. Student pages insert or update `pitches`.
2. Deck files upload to private `pitch-decks`.
3. Thumbnails upload to public `pitch-thumbnails`.
4. Admin and superadmin pages update pitch status to `APPROVED` or `REJECTED`.
5. Investor views query approved pitches through RLS-protected PostgREST calls.

### Messaging and Bookmarks

1. Investors bookmark approved pitches through `bookmarks`.
2. Users exchange pitch-scoped messages through `messages`.
3. RLS allows message participants and admins to read message rows.

### Admin and Superadmin Operations

1. Admin routes manage pitches, investors, users, reports, support, and analytics.
2. Superadmin routes read and mutate operational tables such as `deals`, `transactions`, `audit_logs`, `platform_settings`, and `database_backups`.
3. Superadmin RLS policies restrict those tables to users with the `superadmin` role.

## Security Model

- The browser uses a publishable Supabase key.
- User sessions persist in `localStorage` via the Supabase client configuration.
- Table access is enforced with Row-Level Security.
- Role checks are centralized around `user_roles` and the `has_role` Postgres function.
- Private storage buckets use object policies based on bucket id, object path owner, role, and pitch approval status.

## Observed Gaps

- No dedicated backend/API server exists in the repository.
- No Supabase Edge Functions exist in the repository.
- No CI/CD workflow or production hosting config exists in the repository.
- `profile-photos` is used by the app, but a matching bucket creation migration was not found in the scanned migrations.
- `.env` and `supabase/config.toml` reference different Supabase project ids.
