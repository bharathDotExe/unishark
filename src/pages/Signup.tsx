import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";
import { signupSchema } from "@/lib/validations/auth";
import { Eye, EyeOff, GraduationCap, Briefcase } from "lucide-react";

export default function Signup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "investor">(
    (params.get("role") as any) === "investor" ? "investor" : "student"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, confirmPassword, role });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-otp`,
          data: { role },
        },
      });
      if (error) {
        const isRateLimited = error.message.toLowerCase().includes("rate limit");
        toast.error(isRateLimited ? "Too many emails were requested. Please wait a few minutes, then try again." : error.message);
        return;
      }

      if (data.session) {
        toast.success("Account created! Let's build your profile.");
        navigate(role === "student" ? "/onboarding/student" : "/onboarding/investor");
        return;
      }

      toast.success("Check your email for the verification code.");
      navigate(`/verify-otp?email=${encodeURIComponent(email)}&role=${role}`);
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-500"];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Very strong"];

  return (
    <AuthLayout
      title="Join UniShark"
      subtitle="Create your account to get started."
      footer={
        <>Already have an account?{" "}<Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Role */}
        <div>
          <Label className="text-sm font-semibold">I am a...</Label>
          <RadioGroup
            value={role}
            onValueChange={(v) => setRole(v as any)}
            className="grid grid-cols-2 gap-3 mt-2"
          >
            <Label
              className={`flex items-center gap-2 rounded-2xl border-2 p-3 cursor-pointer transition-all ${
                role === "student"
                  ? "border-foreground bg-[hsl(var(--pastel-pink))] shadow-[3px_3px_0_0_hsl(var(--foreground))]"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <RadioGroupItem value="student" className="sr-only" />
              <GraduationCap className="h-4 w-4" />
              <span className="font-semibold text-sm">Founder</span>
            </Label>
            <Label
              className={`flex items-center gap-2 rounded-2xl border-2 p-3 cursor-pointer transition-all ${
                role === "investor"
                  ? "border-foreground bg-[hsl(var(--pastel-mint))] shadow-[3px_3px_0_0_hsl(var(--foreground))]"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <RadioGroupItem value="investor" className="sr-only" />
              <Briefcase className="h-4 w-4" />
              <span className="font-semibold text-sm">Investor</span>
            </Label>
          </RadioGroup>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="font-semibold">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-1 border-2"
          />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="font-semibold">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase & number"
              required
              className="border-2 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= pwStrength ? strengthColors[pwStrength - 1] : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs mt-1 text-muted-foreground">
                {pwStrength > 0 ? strengthLabels[pwStrength - 1] : ""}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="font-semibold">Confirm password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showCpw ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className={`border-2 pr-10 ${
                confirmPassword && confirmPassword !== password ? "border-destructive" : ""
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowCpw((v) => !v)}
            >
              {showCpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-destructive mt-1">Passwords don't match</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all font-bold rounded-full h-12"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account →"}
        </Button>
      </form>
    </AuthLayout>
  );
}