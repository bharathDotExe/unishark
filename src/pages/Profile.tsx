import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, User, GraduationCap, Briefcase, ShieldCheck, X } from "lucide-react";

const YEARS = ["FIRST", "SECOND", "THIRD", "FOURTH", "GRADUATE", "POSTGRAD"] as const;

export default function Profile() {
  const { user, roles } = useAuth();
  const isStudent = roles.includes("student");
  const isInvestor = roles.includes("investor");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Student fields
  const [college, setCollege] = useState("");
  const [year, setYear] = useState<string>("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [linkedinStudent, setLinkedinStudent] = useState("");

  // Investor fields
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorInput, setSectorInput] = useState("");
  const [ticketMin, setTicketMin] = useState("");
  const [ticketMax, setTicketMax] = useState("");
  const [pastInv, setPastInv] = useState("");
  const [linkedinInv, setLinkedinInv] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: sp }, { data: ip }] = await Promise.all([
        supabase.from("profiles").select("full_name,email").eq("id", user.id).maybeSingle(),
        isStudent ? supabase.from("student_profiles").select("*").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null } as any),
        isInvestor ? supabase.from("investor_profiles").select("*").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null } as any),
      ]);
      if (p) { setFullName(p.full_name ?? ""); setEmail(p.email ?? ""); }
      if (sp) {
        setCollege(sp.college ?? "");
        setYear(sp.year ?? "");
        setSkills(Array.isArray(sp.skills) ? (sp.skills as string[]) : []);
        setLinkedinStudent(sp.linkedin_url ?? "");
      }
      if (ip) {
        setSectors(Array.isArray(ip.sectors) ? (ip.sectors as string[]) : []);
        setTicketMin(ip.ticket_size_min ?? "");
        setTicketMax(ip.ticket_size_max ?? "");
        setPastInv(Array.isArray(ip.past_investments) ? (ip.past_investments as string[]).join(", ") : "");
        setLinkedinInv(ip.linkedin_url ?? "");
        setVerified(!!ip.verified);
      }
      setLoading(false);
    })();
  }, [user, isStudent, isInvestor]);

  const addChip = (val: string, list: string[], setList: (v: string[]) => void, clear: () => void) => {
    const v = val.trim();
    if (!v || list.includes(v)) return;
    setList([...list, v]);
    clear();
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const tasks: Array<PromiseLike<{ error: any }>> = [];
      tasks.push(supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id));
      if (isStudent) {
        tasks.push(
          supabase.from("student_profiles").upsert({
            user_id: user.id,
            college: college || null,
            year: (year || null) as any,
            skills,
            linkedin_url: linkedinStudent || null,
          }, { onConflict: "user_id" })
        );
      }
      if (isInvestor) {
        const past = pastInv.split(",").map(s => s.trim()).filter(Boolean);
        tasks.push(
          supabase.from("investor_profiles").upsert({
            user_id: user.id,
            sectors,
            ticket_size_min: ticketMin || null,
            ticket_size_max: ticketMax || null,
            past_investments: past,
            linkedin_url: linkedinInv || null,
          }, { onConflict: "user_id" })
        );
      }
      const results = await Promise.all(tasks.map(t => Promise.resolve(t)));
      const err = results.find((r: any) => r?.error);
      if (err?.error) throw err.error;
      toast({ title: "Profile saved", description: "Your changes are live." });
    } catch (e: any) {
      toast({ title: "Could not save", description: e.message ?? "Try again", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Your profile</span>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary-dark">
              {isStudent ? "Student profile" : isInvestor ? "Investor profile" : "Profile"}
            </h1>
            <p className="mt-2 text-muted-foreground">Keep this fresh — investors and founders see it.</p>
          </div>
          {isInvestor && (
            <Badge className={verified ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground"}>
              <ShieldCheck className="mr-1 h-3 w-3" />
              {verified ? "Verified" : "Pending verification"}
            </Badge>
          )}
        </header>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <User className="h-4 w-4 text-primary" /> Account
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} disabled />
                </div>
              </div>
            </Card>

            {isStudent && (
              <Card className="p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-dark">
                  <GraduationCap className="h-4 w-4 text-primary" /> Student details
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="college">College</Label>
                    <Input id="college" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. IIT Bombay" />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                      <SelectContent>
                        {YEARS.map(y => <SelectItem key={y} value={y}>{y.charAt(0) + y.slice(1).toLowerCase()}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Skills</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <button onClick={() => setSkills(skills.filter(x => x !== s))}><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(skillInput, skills, setSkills, () => setSkillInput("")); }}}
                        placeholder="Add a skill and press Enter"
                      />
                      <Button type="button" variant="outline" onClick={() => addChip(skillInput, skills, setSkills, () => setSkillInput(""))}>Add</Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="li-s">LinkedIn URL</Label>
                    <Input id="li-s" value={linkedinStudent} onChange={(e) => setLinkedinStudent(e.target.value)} placeholder="https://linkedin.com/in/…" />
                  </div>
                </div>
              </Card>
            )}

            {isInvestor && (
              <Card className="p-6 shadow-card">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-dark">
                  <Briefcase className="h-4 w-4 text-primary" /> Investor details
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label>Sectors of interest</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sectors.map((s) => (
                        <Badge key={s} variant="secondary" className="gap-1">
                          {s}
                          <button onClick={() => setSectors(sectors.filter(x => x !== s))}><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={sectorInput}
                        onChange={(e) => setSectorInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(sectorInput, sectors, setSectors, () => setSectorInput("")); }}}
                        placeholder="e.g. Fintech, SaaS, ClimateTech"
                      />
                      <Button type="button" variant="outline" onClick={() => addChip(sectorInput, sectors, setSectors, () => setSectorInput(""))}>Add</Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tmin">Ticket min</Label>
                    <Input id="tmin" value={ticketMin} onChange={(e) => setTicketMin(e.target.value)} placeholder="₹5L" />
                  </div>
                  <div>
                    <Label htmlFor="tmax">Ticket max</Label>
                    <Input id="tmax" value={ticketMax} onChange={(e) => setTicketMax(e.target.value)} placeholder="₹50L" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="past">Past investments</Label>
                    <Textarea id="past" value={pastInv} onChange={(e) => setPastInv(e.target.value)} placeholder="Comma separated — e.g. Razorpay, Cred, Zepto" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="li-i">LinkedIn URL</Label>
                    <Input id="li-i" value={linkedinInv} onChange={(e) => setLinkedinInv(e.target.value)} placeholder="https://linkedin.com/in/…" />
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving} size="lg">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}