## Add "Sign in with Google" to UniShark

Use Lovable Cloud's managed Google OAuth (via the Lovable broker) — no Google Cloud Console setup, no client ID/secret needed from you.

### What I'll build

1. **Enable Google provider** on your Lovable Cloud auth backend (managed — one call, no manual config).
2. **Add a "Continue with Google" button** to:
   - `src/pages/Login.tsx`
   - `src/pages/Signup.tsx`
   Styled to match the existing UI (Google logo + neutral button, divider "or" between it and the email form).
3. **Wire the click handler** to call the Lovable broker:
   ```ts
   await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
   ```
4. **Handle the post-OAuth redirect** in the existing auth state listener:
   - If the returning user has no role yet in `user_roles`, send them to `/onboarding` to pick Student vs Investor (same flow as email signup).
   - Otherwise, send them to their dashboard.
5. **Verify** the `handle_new_user` trigger already covers OAuth signups (it does — it reads from `auth.users` regardless of provider, and role/profile rows are created lazily during onboarding for OAuth users since Google doesn't supply a role).

### Notes

- No new secrets, no Google Cloud project, no redirect URI setup on your end — Lovable's broker handles all of it.
- Works on both preview and published URLs automatically.
- Email/password signup + OTP flow stays exactly as-is.

Approve and I'll implement.