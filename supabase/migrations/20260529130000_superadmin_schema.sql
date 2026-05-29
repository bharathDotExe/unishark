-- 0. Alter app_role enum to add superadmin
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- 1. Alter profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS suspension_reason text;

-- 2. Create deals table
DO $$ BEGIN
    CREATE TYPE public.deal_status AS ENUM ('NEGOTIATING', 'SIGNED', 'CLOSED', 'DROPPED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.deals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE NOT NULL,
    investor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status public.deal_status DEFAULT 'NEGOTIATING'::public.deal_status NOT NULL,
    amount_committed numeric,
    platform_commission numeric,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can do everything on deals"
    ON public.deals
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'superadmin'
        )
    );

CREATE POLICY "Users can view their own deals"
    ON public.deals
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = investor_id OR auth.uid() = student_id
    );


-- 3. Create transactions table
DO $$ BEGIN
    CREATE TYPE public.transaction_type AS ENUM ('SUBSCRIPTION', 'COMMISSION', 'OTHER');
    CREATE TYPE public.transaction_status AS ENUM ('SUCCESS', 'PENDING', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    type public.transaction_type NOT NULL,
    amount numeric NOT NULL,
    status public.transaction_status DEFAULT 'PENDING'::public.transaction_status NOT NULL,
    reference_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can do everything on transactions"
    ON public.transactions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'superadmin'
        )
    );

CREATE POLICY "Users can view their own transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
    );

-- 4. Create audit_logs table
DO $$ BEGIN
    CREATE TYPE public.audit_category AS ENUM ('AUTH', 'PITCH', 'USER', 'SYSTEM', 'SETTINGS', 'INVESTOR');
    CREATE TYPE public.audit_severity AS ENUM ('INFO', 'WARN', 'ERROR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    target_id text,
    category public.audit_category NOT NULL,
    severity public.audit_severity DEFAULT 'INFO'::public.audit_severity NOT NULL,
    ip_address text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can do everything on audit logs"
    ON public.audit_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'superadmin'
        )
    );


-- 5. Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmins can do everything on settings"
    ON public.platform_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() 
            AND user_roles.role = 'superadmin'
        )
    );

CREATE POLICY "Anyone can read settings"
    ON public.platform_settings
    FOR SELECT
    TO authenticated
    USING (true);
