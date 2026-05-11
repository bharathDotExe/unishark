import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

export default function Signup() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "investor">((params.get("role") as any) === "investor" ? "investor" : "student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to UniShark!");
    navigate(role === "student" ? "/dashboard" : "/pitches");
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the curated student-founder marketplace."
      footer={
        <>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>I am a</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as any)} className="grid grid-cols-2 gap-2 mt-2">
                <Label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${role === "student" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="student" /> Founder
                </Label>
                <Label className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer ${role === "investor" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="investor" /> Investor
                </Label>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
      </form>
    </AuthLayout>
  );
}