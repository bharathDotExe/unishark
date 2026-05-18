import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const STABLE_PREVIEW_ORIGIN = "https://id-preview--b4006390-c22b-4fd9-8b3a-8eaf1eafda1d.lovable.app";

function getAuthCallbackUrl(intendedRole?: "student" | "investor") {
  const origin = window.location.hostname.endsWith(".lovableproject.com")
    ? STABLE_PREVIEW_ORIGIN
    : window.location.origin;
  const callbackUrl = new URL("/auth/callback", origin);

  if (intendedRole) {
    callbackUrl.searchParams.set("role", intendedRole);
  }

  return callbackUrl.toString();
}

interface Props {
  /** Role to assign on first-ever sign-in. Omit on the Login page. */
  intendedRole?: "student" | "investor";
  label?: string;
}

export default function GoogleSignInButton({ intendedRole, label = "Continue with Google" }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      if (intendedRole) {
        localStorage.setItem("unishark_intended_role", intendedRole);
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(intendedRole),
        },
      });
      if (error) toast.error(error.message);
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className="w-full h-12 rounded-full border-2 border-foreground bg-background text-foreground font-bold shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:bg-background hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all"
    >
      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
      </svg>
      {loading ? "Redirecting…" : label}
    </Button>
  );
}