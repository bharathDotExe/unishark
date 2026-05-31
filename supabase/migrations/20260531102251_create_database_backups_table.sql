CREATE TABLE IF NOT EXISTS public.database_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('FULL', 'INCREMENTAL', 'SCHEMA_ONLY')),
    size_bytes BIGINT,
    status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'IN_PROGRESS', 'FAILED', 'SCHEDULED')),
    duration_ms BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.database_backups ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
GRANT ALL ON TABLE public.database_backups TO authenticated;
GRANT ALL ON TABLE public.database_backups TO service_role;

-- Policy: Only superadmins can view or manage backups
CREATE POLICY "Superadmins can view backups" 
ON public.database_backups FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'superadmin'
    )
);

CREATE POLICY "Superadmins can insert backups" 
ON public.database_backups FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'superadmin'
    )
);

CREATE POLICY "Superadmins can update backups" 
ON public.database_backups FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'superadmin'
    )
);

CREATE POLICY "Superadmins can delete backups" 
ON public.database_backups FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() 
        AND user_roles.role = 'superadmin'
    )
);
