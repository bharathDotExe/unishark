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
import { Eye, EyeOff, GraduationCap, Briefcase, Upload } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const base64ToBlob = (base64: string): Blob | null => {
  try {
    const parts = base64.split(";base64,");
    if (parts.length !== 2) return null;
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    return null;
  }
};

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
  const [idCardFile, setIdCardFile] = useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, confirmPassword, role });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    
    if (role === "student" && !idCardFile) {
      toast.error("Please upload your student identity card.");
      return;
    }

    setLoading(true);

    if (role === "student" && idCardFile) {
      try {
        const base64 = await compressAndConvertToBase64(idCardFile);
        sessionStorage.setItem("pendingIdCard", base64);
      } catch (err) {
        toast.error("Failed to process identity card image. Please try another image.");
        setLoading(false);
        return;
      }
    }

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
        const pendingIdCard = sessionStorage.getItem("pendingIdCard");
        if (pendingIdCard && data.user) {
          const blob = base64ToBlob(pendingIdCard);
          if (blob) {
            const filePath = `${data.user.id}/id-card.jpg`;
            const { error: uploadError } = await supabase.storage
              .from("identity-cards")
              .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });
              
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage.from("identity-cards").getPublicUrl(filePath);
              await supabase.from("student_profiles").update({
                identity_card_url: publicUrlData.publicUrl
              }).eq("user_id", data.user.id);
            }
          }
          sessionStorage.removeItem("pendingIdCard");
        }

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

        {/* Identity Card Upload (Students Only) */}
        {role === "student" && (
          <div className="p-4 border-2 border-dashed border-border rounded-xl bg-muted/30">
            <Label className="font-semibold flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4" /> Identity Card Photo
            </Label>
            <p className="text-xs text-muted-foreground mb-3">
              Please upload a clear picture of your university ID card. This will be verified by our team.
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setIdCardFile(file);
              }}
              required={role === "student"}
              className="cursor-pointer file:cursor-pointer file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:font-medium file:hover:bg-primary/90"
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all font-bold rounded-full h-12"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create account →"}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <GoogleSignInButton intendedRole={role} label={`Sign up with Google as ${role === "investor" ? "Investor" : "Founder"}`} />
      </form>
    </AuthLayout>
  );
}