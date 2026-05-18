import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Send, Upload, Save } from "lucide-react";
import { toast } from "sonner";

type TeamMember = { name: string; role: string; linkedinUrl?: string };

type Draft = {
  id?: string;
  title: string;
  one_liner: string;
  problem: string;
  solution: string;
  market_size: string;
  traction: string;
  stage: "IDEA" | "MVP" | "REVENUE" | "GROWTH" | "";
  funding_ask: string;
  team_members: TeamMember[];
  deck_url: string;
};

const empty: Draft = {
  title: "", one_liner: "", problem: "", solution: "", market_size: "", traction: "",
  stage: "", funding_ask: "", team_members: [{ name: "", role: "", linkedinUrl: "" }], deck_url: "",
};

const STORAGE_KEY = "unishark.pitch.draft";

export default function PitchForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("DRAFT");

  // load existing or autosaved draft
  useEffect(() => {
    if (id) {
      supabase.from("pitches").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        if (data) {
          setStatus(data.status);
          setDraft({
            id: data.id, title: data.title ?? "", one_liner: data.one_liner ?? "",
            problem: data.problem ?? "", solution: data.solution ?? "",
            market_size: data.market_size ?? "", traction: data.traction ?? "",
            stage: (data.stage as any) ?? "", funding_ask: data.funding_ask ?? "",
            team_members: (data.team_members as any) ?? [{ name: "", role: "" }],
            deck_url: data.deck_url ?? "",
          });
        }
      });
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) try { setDraft(JSON.parse(saved)); } catch {}
    }
  }, [id]);

  // autosave to localStorage
  useEffect(() => {
    if (!id) localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, id]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const persist = async (submit: boolean): Promise<string | null> => {
    if (!user) return null;
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: draft.title.slice(0, 100),
      one_liner: draft.one_liner,
      problem: draft.problem,
      solution: draft.solution,
      market_size: draft.market_size,
      traction: draft.traction,
      stage: (draft.stage || null) as any,
      funding_ask: draft.funding_ask,
      team_members: draft.team_members as any,
      deck_url: draft.deck_url,
      status: (submit ? "SUBMITTED" : "DRAFT") as any,
    };
    let pitchId = draft.id;
    if (pitchId) {
      const { error } = await supabase.from("pitches").update(payload).eq("id", pitchId);
      if (error) { toast.error(error.message); setSaving(false); return null; }
    } else {
      const { data, error } = await supabase.from("pitches").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return null; }
      pitchId = data.id;
      setDraft((d) => ({ ...d, id: pitchId }));
    }
    setSaving(false);
    return pitchId!;
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (file.type !== "application/pdf") { toast.error("PDF only."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB."); return; }
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error } = await supabase.storage.from("pitch-decks").upload(path, file, { upsert: false, contentType: "application/pdf" });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    set("deck_url", path);
    toast.success("Deck uploaded");
  };

  const next = async () => {
    await persist(false);
    setStep((s) => Math.min(5, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    if (!draft.title || !draft.problem || !draft.solution) {
      toast.error("Title, problem and solution are required.");
      setStep(1); return;
    }
    const pid = await persist(true);
    if (pid) {
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Submitted! Our team will review within 48h.");
      navigate("/dashboard");
    }
  };

  const readonly = status !== "DRAFT" && status !== "REJECTED";

  return (
    <div className="min-h-screen bg-background relative"
      style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 sm:pt-32 sm:pb-10 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="p-5 sm:p-8 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-primary-dark">Step {step} of 5</h1>
            <span className="text-sm text-muted-foreground">{readonly ? `Status: ${status}` : "Auto-saved"}</span>
          </div>
          <Progress value={step * 20} className="mb-8" />

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" maxLength={100} value={draft.title} onChange={(e) => set("title", e.target.value)} disabled={readonly} placeholder="e.g. ShelfSense — AI inventory for Indian kiranas" />
              </div>
              <div>
                <Label htmlFor="oneliner">One-liner</Label>
                <Input id="oneliner" maxLength={140} value={draft.one_liner} onChange={(e) => set("one_liner", e.target.value)} disabled={readonly} placeholder="Stripe for offline retail." />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="problem">Problem *</Label>
                <Textarea id="problem" rows={5} value={draft.problem} onChange={(e) => set("problem", e.target.value)} disabled={readonly} />
              </div>
              <div>
                <Label htmlFor="solution">Solution *</Label>
                <Textarea id="solution" rows={5} value={draft.solution} onChange={(e) => set("solution", e.target.value)} disabled={readonly} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="market">Market size</Label>
                <Textarea id="market" rows={3} value={draft.market_size} onChange={(e) => set("market_size", e.target.value)} disabled={readonly} placeholder="TAM, SAM, SOM" />
              </div>
              <div>
                <Label htmlFor="traction">Traction (optional)</Label>
                <Textarea id="traction" rows={4} value={draft.traction} onChange={(e) => set("traction", e.target.value)} disabled={readonly} placeholder="MRR, users, partnerships" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label>Team members</Label>
              {draft.team_members.map((m, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Name" value={m.name} onChange={(e) => {
                    const arr = [...draft.team_members]; arr[i] = { ...arr[i], name: e.target.value }; set("team_members", arr);
                  }} disabled={readonly} />
                  <Input placeholder="Role" value={m.role} onChange={(e) => {
                    const arr = [...draft.team_members]; arr[i] = { ...arr[i], role: e.target.value }; set("team_members", arr);
                  }} disabled={readonly} />
                  <Input placeholder="LinkedIn URL" value={m.linkedinUrl ?? ""} onChange={(e) => {
                    const arr = [...draft.team_members]; arr[i] = { ...arr[i], linkedinUrl: e.target.value }; set("team_members", arr);
                  }} disabled={readonly} />
                </div>
              ))}
              {!readonly && (
                <Button type="button" variant="outline" size="sm" onClick={() => set("team_members", [...draft.team_members, { name: "", role: "" }])}>
                  Add member
                </Button>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage">Stage *</Label>
                <Select value={draft.stage} onValueChange={(v) => set("stage", v as any)} disabled={readonly}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDEA">Idea</SelectItem>
                    <SelectItem value="MVP">MVP</SelectItem>
                    <SelectItem value="REVENUE">Revenue</SelectItem>
                    <SelectItem value="GROWTH">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ask">Funding ask</Label>
                <Input id="ask" value={draft.funding_ask} onChange={(e) => set("funding_ask", e.target.value)} disabled={readonly} placeholder="₹1 Crore" />
              </div>
              <div>
                <Label>Pitch deck (PDF, max 5MB)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input type="file" accept="application/pdf" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} disabled={readonly || uploading} />
                </div>
                {draft.deck_url && (
                  <p className="text-sm text-success mt-2 flex items-center gap-1"><Upload className="h-3.5 w-3.5" /> Deck uploaded</p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={prev} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              {!readonly && (
                <Button variant="ghost" onClick={() => persist(false).then(() => toast.success("Saved as draft"))} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" /> Save draft
                </Button>
              )}
              {step < 5 ? (
                <Button onClick={next}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
              ) : (
                !readonly && <Button onClick={submit} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Send className="mr-2 h-4 w-4" /> Submit for review
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}