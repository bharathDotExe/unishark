CREATE POLICY "roles_insert_self_signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role IN ('student', 'investor'));
