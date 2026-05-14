import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Wait briefly for Supabase to process the OAuth hash
      const { data: { session }, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error || !session?.user) {
        toast.error("Sign-in failed. Please try again.");
        navigate("/login");
        return;
      }

      const userId = session.user.id;
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

      // First-time Google user: assign role and send to onboarding
      const role = intendedRole ?? "student";
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (roleErr && !roleErr.message.toLowerCase().includes("duplicate")) {
        toast.error("Could not set up your account. Please contact support.");
        navigate("/login");
        return;
      }

      localStorage.removeItem("unishark_intended_role");
      toast.success("Account ready! Let's build your profile.");
      navigate(role === "investor" ? "/onboarding/investor" : "/onboarding/student");
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