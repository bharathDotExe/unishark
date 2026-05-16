import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const proceed = async (userId: string) => {
      if (cancelled) return;
      const intendedRole = localStorage.getItem("unishark_intended_role") as
        | "student"
        | "investor"
        | null;

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const roles = (rolesData ?? []).map((r) => r.role);

      if (roles.length > 0) {
        localStorage.removeItem("unishark_intended_role");
        toast.success("Welcome back!");
        if (roles.includes("admin")) navigate("/admin");
        else if (roles.includes("investor")) navigate("/pitches");
        else navigate("/dashboard");
        return;
      }

      const role = intendedRole ?? "student";
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (roleErr && !roleErr.message.toLowerCase().includes("duplicate")) {
        console.error("Role insert error:", roleErr);
        // Don't block — onboarding can retry. Continue to onboarding.
      }

      localStorage.removeItem("unishark_intended_role");
      toast.success("Account ready! Let's build your profile.");
      navigate(role === "investor" ? "/onboarding/investor" : "/onboarding/student");
    };

    const run = async () => {
      // Try existing session first
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await proceed(session.user.id);
        return;
      }

      // Otherwise wait for SIGNED_IN (Supabase processes the URL hash async)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, s) => {
          if (cancelled) return;
          if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && s?.user) {
            subscription.unsubscribe();
            await proceed(s.user.id);
          }
        }
      );

      // Safety timeout
      setTimeout(() => {
        if (cancelled) return;
        supabase.auth.getSession().then(({ data: { session: s2 } }) => {
          if (s2?.user) return;
          subscription.unsubscribe();
          toast.error("Sign-in failed. Please try again.");
          navigate("/login");
        });
      }, 5000);
    };

    run();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}