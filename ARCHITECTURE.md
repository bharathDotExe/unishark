# UniShark — Architecture Overview

**High-level diagrams**
- Eraser diagram: [system-architecture.eraserdiagram](system-architecture.eraserdiagram)
- Mermaid diagrams: [system-architecture.mmd](system-architecture.mmd)

**1) Current tech stack**
- Frontend: Vite + React + TypeScript (single-page app)
- UI: Tailwind CSS, Radix UI primitives, shadcn-style components
- Client state / queries: @tanstack/react-query
- Authentication & backend: Supabase (Auth, Postgres, Storage)
- OAuth broker: Lovable Cloud (used for Google sign-in)
- Storage: Supabase Storage buckets (profile-photos, pitch-decks, pitch-thumbnails, identity-cards)
- Database: Supabase-managed Postgres with Row-Level Security (RLS) and migrations in `supabase/migrations`

**2) Strengths**
- Simple, serverless-first architecture: frontend is static and talks directly to managed Supabase services, reducing operational overhead.
- Strong data security model: RLS policies are defined in migrations, enabling fine-grained access control at the DB level.
- Built-in features from Supabase: Auth (email OTP, OAuth), Storage, PostgREST APIs — accelerates development.
- Clear separation of concerns: UI / client logic in `src/`, schema and policies in `supabase/migrations/`.

**3) Bottlenecks & Missing Components**
- No dedicated application server / API layer: business logic is implemented client-side and inside DB; this can limit complex server-side orchestration, background jobs, or secure secret handling.
- No payment integration or external payment gateway (transactions table exists, but no payments provider integrated).
- No observable telemetry or logging platform integrated (no Sentry / external logs). Database audit_logs exist, but centralized logs/metrics not configured.
- No CI/CD or deployment config in repo — deployment target and infra are unspecified.

**4) Scalability concerns**
- Frontend scales via static hosting and CDN (easy). Supabase managed services scale but might require query optimization and connection management for heavy workloads.
- Client-driven writes and complex queries may cause higher DB load; adding server-side batching or serverless functions to offload heavy work is advisable.
- Storage uses public URLs and signed URLs; ensure caching and CDN rules for large file traffic.

**5) Recommendations / Next steps**
- Add a small serverless API (Supabase Edge Function or lightweight Node/Azure Function) for sensitive operations, payment processing, and to offload heavy queries.
- Add observability (Sentry, Prometheus / Grafana, or a logging aggregator) and a backup retention policy beyond `database_backups` table.
- Add CI/CD configuration (GitHub Actions / Vercel / Netlify) and environment management documentation (required `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).

Files created:
- [system-architecture.eraserdiagram](system-architecture.eraserdiagram)
- [system-architecture.mmd](system-architecture.mmd)
- [ARCHITECTURE.md](ARCHITECTURE.md)

If you want, I can:
- generate a PNG/SVG export of the Mermaid diagrams,
- add a recommended GitHub Actions workflow to build and deploy the site, or
- create a minimal Supabase Edge Function scaffold for server-side logic.
