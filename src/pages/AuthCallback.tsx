import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    let subscription: { unsubscribe: () => void } | null = null;

    const getIntendedRole = () => {
      const params = new URLSearchParams(window.location.search);
      const roleFromUrl = params.get("role");
      if (roleFromUrl === "student" || roleFromUrl === "investor") return roleFromUrl;

      const roleFromStorage = localStorage.getItem("unishark_intended_role");
      if (roleFromStorage === "student" || roleFromStorage === "investor") return roleFromStorage;

      return null;
    };

    const ensureRoleProfile = async (userId: string, role: "student" | "investor") => {
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (roleErr && !roleErr.message.toLowerCase().includes("duplicate")) {
        console.error("Role insert error:", roleErr);
      }

      const { error: profileErr } = role === "investor"
        ? await supabase.from("investor_profiles").upsert({ user_id: userId }, { onConflict: "user_id" })
        : await supabase.from("student_profiles").upsert({ user_id: userId }, { onConflict: "user_id" });

      if (profileErr) console.error("Profile upsert error:", profileErr);
    };

    const proceed = async (userId: string) => {
      if (cancelled || completed) return;
      completed = true;
      const intendedRole = getIntendedRole();

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const roles = (rolesData ?? []).map((r) => r.role);

      if (intendedRole) {
        if (!roles.includes(intendedRole)) {
          await ensureRoleProfile(userId, intendedRole);
        }

        localStorage.removeItem("unishark_intended_role");
        toast.success("Account ready! Let's build your profile.");
        navigate(intendedRole === "investor" ? "/onboarding/investor" : "/onboarding/student");
        return;
      }

      if (roles.length > 0) {
        localStorage.removeItem("unishark_intended_role");
        toast.success("Welcome back!");
        if (roles.includes("admin")) navigate("/admin");
        else if (roles.includes("investor")) navigate("/pitches");
        else navigate("/dashboard");
        return;
      }

      const role = "student";
      await ensureRoleProfile(userId, role);

      localStorage.removeItem("unishark_intended_role");
      toast.success("Account ready! Let's build your profile.");
      navigate(role === "investor" ? "/onboarding/investor" : "/onboarding/student");
    };

    const run = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const authError = queryParams.get("error_description") || hashParams.get("error_description");

      if (authError) {
        toast.error(authError);
        navigate("/login");
        return;
      }

      const authListener = supabase.auth.onAuthStateChange(async (event, s) => {
        if (cancelled) return;
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && s?.user) {
          subscription?.unsubscribe();
          await proceed(s.user.id);
        }
      });
      subscription = authListener.data.subscription;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        subscription.unsubscribe();
        await proceed(session.user.id);
        return;
      }

      // Safety timeout
      setTimeout(() => {
        if (cancelled) return;
        supabase.auth.getSession().then(({ data: { session: s2 } }) => {
          if (s2?.user) return;
          subscription?.unsubscribe();
          toast.error("Sign-in failed. Please try again.");
          navigate("/login");
        });
      }, 10000);
    };

    run();
    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Signing you in…</p>
    </div>
  );
}