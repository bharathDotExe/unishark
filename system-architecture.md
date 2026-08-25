architecture-beta
    group client(internet)[Client Applications]
    group frontend(cloud)[Frontend]
    group backend(cloud)[Backend Services]
    group database(db)[Database Layer]
    group external(external)[External Services]
    group infra(infra)[Infrastructure]

    service browser(internet)[User Browser] in client
    service vite(frontend)[Vite React SPA (React + TS)] in frontend
    service ui(frontend)[UI Library (Radix / Tailwind)] in frontend
    service router(frontend)[Router / Views / Client Guards] in frontend

    service supabaseAuth(backend)[Supabase Auth (OAuth, Email OTP)] in backend
    service supabaseDB(backend)[Supabase Postgres (Managed Postgres)] in backend
    service supabaseStorage(backend)[Supabase Storage (Buckets)] in backend
    service rls(backend)[Row-Level Security Policies] in backend

    service profiles(database)[profiles, student_profiles, investor_profiles] in database
    service pitches(database)[pitches, pitch_decks, pitch_thumbnails] in database
    service transactions(database)[transactions, deals, database_backups] in database
    service meta(database)[user_roles, audit_logs, platform_settings] in database

    service lovable(external)[Lovable OAuth Broker (Google sign-in)] in external
    service supabaseHost(external)[Supabase Platform (Auth / Postgres / Storage)] in external

    service staticHost(infra)[Static Host & CDN (Vite build)] in infra
    service developerTools(infra)[CI / Deployment (not included)] in infra

    browser:R --> L:vite
    vite:R --> L:router
    vite:B --> T:ui

    router:R --> L:supabaseAuth : Authentication (signIn/verifyOtp)
    router:R --> L:supabaseDB : PostgREST queries (select/insert/update/delete)
    router:B --> T:supabaseStorage : Upload / Download (profile photos, decks, thumbnails)

    supabaseAuth:B --> T:supabaseDB : user/session metadata
    supabaseDB:B --> T:profiles
    supabaseDB:B --> T:pitches
    supabaseDB:B --> T:transactions
    supabaseStorage:B --> T:pitches

    lovable:R --> L:supabaseAuth : OAuth broker redirects
    staticHost:R --> L:vite : Serve optimized static assets

    rls:B --> T:profiles : Enforced via database policies
