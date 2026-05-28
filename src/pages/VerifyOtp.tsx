import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MailCheck, RotateCcw } from "lucide-react";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = useMemo(() => params.get("email") ?? "", [params]);
  const role = params.get("role") === "investor" ? "investor" : "student";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const destination = role === "investor" ? "/onboarding/investor" : "/onboarding/student";

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

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please sign up again so we know which email to verify.");
      navigate("/signup");
      return;
    }
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData, error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
      if (error) {
        toast.error(error.message);
        return;
      }
      
      const pendingIdCard = sessionStorage.getItem("pendingIdCard");
      if (pendingIdCard && sessionData?.user) {
        const blob = base64ToBlob(pendingIdCard);
        if (blob) {
          const filePath = `${sessionData.user.id}/id-card.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("identity-cards")
            .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });
            
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("identity-cards").getPublicUrl(filePath);
            await supabase.from("student_profiles").update({
              identity_card_url: publicUrlData.publicUrl
            }).eq("user_id", sessionData.user.id);
          }
        }
        sessionStorage.removeItem("pendingIdCard");
      }

      toast.success("Email verified. Welcome to UniShark!");
      navigate(destination);
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!email) {
      toast.error("Please sign up again so we know where to send the code.");
      navigate("/signup");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/verify-otp` },
      });
      if (error) {
        const isRateLimited = error.message.toLowerCase().includes("rate limit");
        toast.error(isRateLimited ? "Too many codes were requested. Please wait a few minutes, then try again." : error.message);
        return;
      }
      toast.success("A new code was sent to your email.");
    } catch (err: any) {
      toast.error(err.message || "Could not resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code sent to ${email}.` : "Enter the code from your email."}
      footer={
        <>Wrong email? <Link to="/signup" className="font-medium text-primary hover:underline">Start again</Link></>
      }
    >
      <form onSubmit={verifyCode} className="space-y-6">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-foreground bg-[hsl(var(--pastel-yellow))] p-4 shadow-[3px_3px_0_0_hsl(var(--foreground))]">
          <MailCheck className="h-5 w-5 shrink-0" />
          <p className="text-sm font-semibold">Use the one-time code in your inbox to activate your account.</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="otp" className="font-semibold">Verification code</Label>
          <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp} containerClassName="justify-center gap-2">
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot key={index} index={index} className="h-12 w-12 rounded-xl border-2 border-foreground bg-card text-lg font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] first:rounded-xl first:border-l last:rounded-xl" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0_0_hsl(var(--foreground))] transition-all font-bold rounded-full h-12"
        >
          {loading ? "Verifying…" : "Verify & continue →"}
        </Button>

        <Button type="button" variant="ghost" onClick={resendCode} disabled={resending} className="w-full rounded-full font-bold">
          <RotateCcw className="h-4 w-4" />
          {resending ? "Sending…" : "Resend code"}
        </Button>
      </form>
    </AuthLayout>
  );
}