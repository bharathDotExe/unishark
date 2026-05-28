import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, ArrowRight, Upload, Save, Send, AlertCircle, CheckCircle2, 
  HelpCircle, Trash2, Plus, Sparkles, RefreshCw, FileText, X, Image as ImageIcon, Loader2,
  Rocket, Lightbulb, TrendingUp, Banknote, Users, Check
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  
  // Custom structured fields
  target_market: string;
  competitors: string;
  advantage: string;
  use_of_funds: string;
  funding_status: "BOOTSTRAPPED" | "PRE_SEED" | "SEED" | "SERIES_A" | "";
  thumbnail_url: string;
};

const empty: Draft = {
  title: "", one_liner: "", problem: "", solution: "", market_size: "", traction: "",
  stage: "", funding_ask: "", team_members: [{ name: "", role: "", linkedinUrl: "" }], deck_url: "", thumbnail_url: "",
  target_market: "", competitors: "", advantage: "", use_of_funds: "", funding_status: "",
};

const STORAGE_KEY = "unishark.pitch.draft";
const PDF_MAX_BYTES = 5 * 1024 * 1024;
const THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
const THUMBNAIL_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const THUMBNAIL_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, "_");

export default function PitchForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("DRAFT");
  const [dragActive, setDragActive] = useState(false);

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [dragOverDeck, setDragOverDeck] = useState(false);
  const [dragOverThumbnail, setDragOverThumbnail] = useState(false);

  // load existing or autosaved draft
  useEffect(() => {
    if (id) {
      supabase.from("pitches").select("*").eq("id", id).maybeSingle().then(({ data }) => {
        if (data) {
          setStatus(data.status);
          
          let parsedMarketSize = data.market_size ?? "";
          let targetMarket = "";
          let competitors = "";
          let advantage = "";
          
          if (parsedMarketSize.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(parsedMarketSize);
              parsedMarketSize = parsed.market_size ?? "";
              targetMarket = parsed.target_market ?? "";
              competitors = parsed.competitors ?? "";
              advantage = parsed.advantage ?? "";
            } catch (e) {
              console.error("Error parsing market_size", e);
            }
          }

          let parsedFundingAsk = data.funding_ask ?? "";
          let useOfFunds = "";
          let fundingStatus = "";

          if (parsedFundingAsk.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(parsedFundingAsk);
              parsedFundingAsk = parsed.funding_ask ?? "";
              useOfFunds = parsed.use_of_funds ?? "";
              fundingStatus = parsed.funding_status ?? "";
            } catch (e) {
              console.error("Error parsing funding_ask", e);
            }
          }

          setDraft({
            id: data.id, 
            title: data.title ?? "", 
            one_liner: data.one_liner ?? "",
            problem: data.problem ?? "", 
            solution: data.solution ?? "",
            market_size: parsedMarketSize, 
            traction: data.traction ?? "",
            stage: (data.stage as any) ?? "", 
            funding_ask: parsedFundingAsk,
            team_members: (data.team_members as any) ?? [{ name: "", role: "", linkedinUrl: "" }],
            deck_url: data.deck_url ?? "",
            target_market: targetMarket,
            competitors: competitors,
            advantage: advantage,
            use_of_funds: useOfFunds,
            funding_status: fundingStatus as any,
            thumbnail_url: data.thumbnail_url ?? "",
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

    const serializedMarketSize = JSON.stringify({
      market_size: draft.market_size,
      target_market: draft.target_market,
      competitors: draft.competitors,
      advantage: draft.advantage,
    });

    const serializedFundingAsk = JSON.stringify({
      funding_ask: draft.funding_ask,
      use_of_funds: draft.use_of_funds,
      funding_status: draft.funding_status,
    });

    const payload = {
      user_id: user.id,
      title: draft.title.slice(0, 100),
      one_liner: draft.one_liner.slice(0, 150),
      problem: draft.problem.slice(0, 500),
      solution: draft.solution.slice(0, 500),
      market_size: serializedMarketSize,
      traction: draft.traction,
      stage: (draft.stage || null) as any,
      funding_ask: serializedFundingAsk,
      team_members: draft.team_members as any,
      deck_url: draft.deck_url,
      thumbnail_url: draft.thumbnail_url || null,
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
    if (file.type !== "application/pdf") { toast.error("Please upload a PDF file only."); return; }
    if (file.size > PDF_MAX_BYTES) { toast.error("Max file size is 5MB."); return; }
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from("pitch-decks").upload(path, file, {
      upsert: false,
      contentType: "application/pdf",
    });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    set("deck_url", path);
    toast.success("Pitch deck PDF uploaded successfully!");
  };



  // Validation routines per step
  const validateStep = (s: number): boolean => {
    switch (s) {
      case 1:
        if (!draft.title.trim()) { toast.error("Pitch Title is required."); return false; }
        if (!draft.one_liner.trim()) { toast.error("One-Liner description is required."); return false; }
        if (!draft.stage) { toast.error("Please select your Startup Stage."); return false; }
        return true;
      case 2:
        if (!draft.problem.trim()) { toast.error("Problem Statement is required."); return false; }
        if (!draft.solution.trim()) { toast.error("Your Solution description is required."); return false; }
        if (!draft.target_market.trim()) { toast.error("Target Market is required."); return false; }
        return true;
      case 3:
        if (!draft.market_size.trim()) { toast.error("Market Size details are required."); return false; }
        if (!draft.competitors.trim()) { toast.error("Competitors list is required."); return false; }
        if (!draft.advantage.trim()) { toast.error("Your Competitive Advantage is required."); return false; }
        return true;
      case 4:
        if (!draft.funding_ask.trim()) { toast.error("Funding Ask amount is required."); return false; }
        if (!draft.use_of_funds.trim()) { toast.error("Use of Funds details are required."); return false; }
        if (!draft.funding_status) { toast.error("Please select your Current Funding Status."); return false; }
        return true;
      case 5:
        const validMembers = draft.team_members.filter(m => m.name.trim() && m.role.trim());
        if (validMembers.length === 0) { toast.error("At least one valid Team Member (Name & Role) is required."); return false; }
        if (!draft.deck_url) { toast.error("Please upload your Pitch Deck PDF (max 5MB)."); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    if (!user) return;
    if (!THUMBNAIL_TYPES.has(file.type)) { toast.error("Use a PNG, JPG or WEBP image."); return; }
    if (file.size > THUMBNAIL_MAX_BYTES) { toast.error("Max 2MB."); return; }
    setUploadingThumbnail(true);
    const ext = THUMBNAIL_EXTENSIONS[file.type] ?? "png";
    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name.replace(/\.[^.]*$/, ""))}.${ext}`;
    const { error } = await supabase.storage.from("pitch-thumbnails").upload(path, file, {
      upsert: false,
      contentType: file.type,
    });
    setUploadingThumbnail(false);
    if (error) { toast.error(error.message); return; }
    const { data } = supabase.storage.from("pitch-thumbnails").getPublicUrl(path);
    set("thumbnail_url", data.publicUrl);
    toast.success("Thumbnail uploaded");
  };

  const handleDrag = (e: React.DragEvent, type: "deck" | "thumbnail", active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "deck") setDragOverDeck(active);
    else setDragOverThumbnail(active);
  };

  const handleDrop = (e: React.DragEvent, type: "deck" | "thumbnail") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "deck") {
      setDragOverDeck(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file);
    } else {
      setDragOverThumbnail(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleThumbnailUpload(file);
    }
  };

  const next = async () => {
    if (!validateStep(step)) return;
    await persist(false);
    setStep((s) => Math.min(5, s + 1));
  };
  
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    // Validate final step and overall completeness
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    
    const pid = await persist(true);
    if (pid) {
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Pitch submitted! We'll review and approve within 24 hours");
      navigate(`/pitches/${pid}`);
    }
  };

  const readonly = status !== "DRAFT" && status !== "REJECTED";

  // Neobrutalistic Custom Progress Bar renderer
  const renderProgress = () => {
    const stepMeta = [
      { label: "Basics", icon: Rocket },
      { label: "Problem", icon: Lightbulb },
      { label: "Market", icon: TrendingUp },
      { label: "Funding", icon: Banknote },
      { label: "Team & Deck", icon: Users },
    ];
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-medium text-muted-foreground">
          <span className="uppercase tracking-wider">Step {step} of 5 · {stepMeta[step - 1].label}</span>
          <span>{Math.round((step / 5) * 100)}% complete</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {stepMeta.map((m, idx) => {
            const s = idx + 1;
            const isActive = s === step;
            const isCompleted = s < step;
            const Icon = m.icon;
            return (
              <button
                key={s}
                disabled={readonly}
                onClick={() => {
                  if (s < step) setStep(s);
                  else if (s > step && validateStep(step)) {
                    persist(false).then(() => setStep(Math.min(s, step + 1)));
                  }
                }}
                className={cn(
                  "group flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg transition-all",
                  !readonly && "hover:bg-muted/40 cursor-pointer",
                  readonly && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all border",
                    isActive && "bg-primary text-primary-foreground border-primary shadow-md scale-110",
                    isCompleted && "bg-accent text-accent-foreground border-accent",
                    !isActive && !isCompleted && "bg-background text-muted-foreground border-border"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium hidden sm:block transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-8 pb-8 sm:pt-12 sm:pb-10 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <Card className="p-6 sm:p-10 border border-border/60 rounded-2xl backdrop-blur-xl bg-card/80 shadow-lg">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-8 pb-6 border-b border-border/60">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Submit your pitch</h1>
              <p className="text-sm text-muted-foreground mt-1.5">Tell investors what you're building. We review every submission within 24 hours.</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 border border-border/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
              {readonly ? (
                <>Status: <Badge variant="outline" className="ml-1">{status}</Badge></>
              ) : (
                <><Sparkles className="h-3.5 w-3.5 text-primary" /> Draft auto-saved</>
              )}
            </span>
          </div>

          {renderProgress()}

          {/* STEP 1: BASIC INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground">The basics</h2>
                <p className="text-sm text-muted-foreground">Start with a clear name, a one-line description, and your current stage.</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="title" className="font-medium text-foreground">Pitch Title <span className="text-destructive">*</span></Label>
                  <span className={cn(
                    "text-xs tabular-nums",
                    draft.title.length >= 90 ? "text-destructive" : draft.title.length >= 70 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {draft.title.length}/100
                  </span>
                </div>
                <Input 
                  id="title" 
                  maxLength={100} 
                  value={draft.title} 
                  onChange={(e) => set("title", e.target.value)} 
                  disabled={readonly} 
                  placeholder="e.g. AI Resume Builder"
                  className="h-11 rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Choose a simple, recognizable name.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="oneliner" className="font-medium text-foreground">One-Liner Description <span className="text-destructive">*</span></Label>
                  <span className={cn(
                    "text-xs tabular-nums",
                    draft.one_liner.length >= 135 ? "text-destructive" : draft.one_liner.length >= 110 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {draft.one_liner.length}/150
                  </span>
                </div>
                <Input 
                  id="oneliner" 
                  maxLength={150} 
                  value={draft.one_liner} 
                  onChange={(e) => set("one_liner", e.target.value)} 
                  disabled={readonly} 
                  placeholder="What your startup does in one sentence"
                  className="h-11 rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Think elevator pitch. Max 150 characters.</p>
              </div>

              <div>
                <Label className="font-medium text-foreground block mb-2">Startup Stage <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { val: "IDEA", label: "Idea", desc: "No product yet" },
                    { val: "MVP", label: "MVP", desc: "Built but no users" },
                    { val: "REVENUE", label: "Revenue", desc: "First sales" },
                    { val: "GROWTH", label: "Growth", desc: "Scaling, 100k+ revenue" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      disabled={readonly}
                      onClick={() => set("stage", s.val as any)}
                      className={cn(
                        "p-4 border rounded-xl text-left transition-all flex flex-col gap-0.5",
                        draft.stage === s.val 
                          ? "bg-primary/5 border-primary ring-1 ring-primary/30" 
                          : "bg-background border-border/60 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <span className="font-semibold text-foreground text-sm">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROBLEM & SOLUTION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground">Problem & solution</h2>
                <p className="text-sm text-muted-foreground">Explain what you're fixing and who you're fixing it for.</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="problem" className="font-medium text-foreground">Problem Statement <span className="text-destructive">*</span></Label>
                  <span className={cn(
                    "text-xs tabular-nums",
                    draft.problem.length >= 450 ? "text-destructive" : draft.problem.length >= 400 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {draft.problem.length}/500
                  </span>
                </div>
                <Textarea 
                  id="problem" 
                  maxLength={500}
                  rows={5} 
                  value={draft.problem} 
                  onChange={(e) => set("problem", e.target.value)} 
                  disabled={readonly} 
                  placeholder="Describe the main pain point."
                  className="rounded-lg resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Example: Students struggle to build resumes that impress recruiters.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="solution" className="font-medium text-foreground">Your Solution <span className="text-destructive">*</span></Label>
                  <span className={cn(
                    "text-xs tabular-nums",
                    draft.solution.length >= 450 ? "text-destructive" : draft.solution.length >= 400 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {draft.solution.length}/500
                  </span>
                </div>
                <Textarea 
                  id="solution" 
                  maxLength={500}
                  rows={5} 
                  value={draft.solution} 
                  onChange={(e) => set("solution", e.target.value)} 
                  disabled={readonly} 
                  placeholder="How does your startup solve this problem?"
                  className="rounded-lg resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Example: An AI resume builder that tailors resumes in seconds.</p>
              </div>

              <div>
                <Label htmlFor="target_market" className="font-medium text-foreground">Target Market <span className="text-destructive">*</span></Label>
                <Input 
                  id="target_market" 
                  value={draft.target_market} 
                  onChange={(e) => set("target_market", e.target.value)} 
                  disabled={readonly} 
                  placeholder="e.g. Engineering students, first-time job seekers"
                  className="h-11 rounded-lg mt-1.5"
                />
              </div>
            </div>
          )}

          {/* STEP 3: TRACTION & MARKET */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground">Market & traction</h2>
                <p className="text-sm text-muted-foreground">Show the opportunity, your edge, and any early proof.</p>
              </div>
              <div>
                <Label htmlFor="traction" className="font-medium text-foreground">Current Traction <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea 
                  id="traction" 
                  rows={3} 
                  value={draft.traction} 
                  onChange={(e) => set("traction", e.target.value)} 
                  disabled={readonly} 
                  placeholder="e.g. 500 beta users, $5k MRR, 20% weekly growth"
                  className="rounded-lg mt-1.5 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="market_size" className="font-medium text-foreground">Market Size <span className="text-destructive">*</span></Label>
                <Input 
                  id="market_size" 
                  value={draft.market_size} 
                  onChange={(e) => set("market_size", e.target.value)} 
                  disabled={readonly} 
                  placeholder="e.g. $10 Billion TAM"
                  className="h-11 rounded-lg mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="competitors" className="font-medium text-foreground">Competitors <span className="text-destructive">*</span></Label>
                <Input 
                  id="competitors" 
                  value={draft.competitors} 
                  onChange={(e) => set("competitors", e.target.value)} 
                  disabled={readonly} 
                  placeholder="e.g. LinkedIn, Indeed, Canva Resumes"
                  className="h-11 rounded-lg mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="advantage" className="font-medium text-foreground">Your Advantage <span className="text-destructive">*</span></Label>
                <Input 
                  id="advantage" 
                  value={draft.advantage} 
                  onChange={(e) => set("advantage", e.target.value)} 
                  disabled={readonly} 
                  placeholder="e.g. AI-powered, 10x faster, 90% accuracy"
                  className="h-11 rounded-lg mt-1.5"
                />
              </div>
            </div>
          )}

          {/* STEP 4: FUNDRAISING */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground">Fundraising</h2>
                <p className="text-sm text-muted-foreground">How much you're raising and how you'll spend it.</p>
              </div>
              <div>
                <Label htmlFor="ask" className="font-medium text-foreground">Funding Ask <span className="text-destructive">*</span></Label>
                <div className="relative mt-1.5">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-medium text-muted-foreground">
                    ₹
                  </div>
                  <Input 
                    id="ask" 
                    value={draft.funding_ask} 
                    onChange={(e) => set("funding_ask", e.target.value)} 
                    disabled={readonly} 
                    placeholder="e.g. 1 Crore" 
                    className="h-11 rounded-lg pl-7"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">How much you're raising from angel investors.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label htmlFor="use_of_funds" className="font-medium text-foreground">Use of Funds <span className="text-destructive">*</span></Label>
                  <span className={cn(
                    "text-xs tabular-nums",
                    draft.use_of_funds.length >= 270 ? "text-destructive" : draft.use_of_funds.length >= 220 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {draft.use_of_funds.length}/300
                  </span>
                </div>
                <Textarea 
                  id="use_of_funds" 
                  maxLength={300}
                  rows={3} 
                  value={draft.use_of_funds} 
                  onChange={(e) => set("use_of_funds", e.target.value)} 
                  disabled={readonly} 
                  placeholder="Explain allocation of the funds."
                  className="rounded-lg resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Example: 40% Product, 35% Marketing, 25% Ops.</p>
              </div>

              <div>
                <Label className="font-medium text-foreground block mb-2">Current Funding Status <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { val: "BOOTSTRAPPED", label: "Bootstrapped", desc: "No external funding" },
                    { val: "PRE_SEED", label: "Pre-seed", desc: "$0-100k raised" },
                    { val: "SEED", label: "Seed", desc: "$100k-1M raised" },
                    { val: "SERIES_A", label: "Series A+", desc: ">$1M raised" },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      disabled={readonly}
                      onClick={() => set("funding_status", s.val as any)}
                      className={cn(
                        "p-4 border rounded-xl text-left transition-all flex flex-col gap-0.5",
                        draft.funding_status === s.val 
                          ? "bg-primary/5 border-primary ring-1 ring-primary/30" 
                          : "bg-background border-border/60 hover:border-border hover:bg-muted/40"
                      )}
                    >
                      <span className="font-semibold text-foreground text-sm">{s.label}</span>
                      <span className="text-xs text-muted-foreground">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TEAM & DOCUMENTS */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <Label className="font-bold text-foreground block mb-3">Team Members *</Label>
                <div className="space-y-4">
                  {draft.team_members.map((m, i) => (
                    <div key={i} className="p-4 border-2 border-foreground rounded-2xl bg-muted/10 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm">Member {i + 1} {i === 0 ? "(Required)" : "(Optional)"}</span>
                        {draft.team_members.length > 1 && !readonly && (
                          <button
                            type="button"
                            onClick={() => {
                              const arr = draft.team_members.filter((_, idx) => idx !== i);
                              set("team_members", arr);
                            }}
                            className="text-xs font-bold text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="text-xs font-bold mb-1 block">Full Name</Label>
                          <Input 
                            placeholder="Name" 
                            value={m.name} 
                            onChange={(e) => {
                              const arr = [...draft.team_members]; arr[i] = { ...arr[i], name: e.target.value }; set("team_members", arr);
                            }} 
                            disabled={readonly} 
                            className="border-2 border-foreground rounded-xl h-10"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-bold mb-1 block">Role</Label>
                          <Input 
                            placeholder="Role (e.g. CEO, CTO)" 
                            value={m.role} 
                            onChange={(e) => {
                              const arr = [...draft.team_members]; arr[i] = { ...arr[i], role: e.target.value }; set("team_members", arr);
                            }} 
                            disabled={readonly} 
                            className="border-2 border-foreground rounded-xl h-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-bold mb-1 block">LinkedIn Profile URL</Label>
                        <Input 
                          placeholder="LinkedIn URL" 
                          value={m.linkedinUrl ?? ""} 
                          onChange={(e) => {
                            const arr = [...draft.team_members]; arr[i] = { ...arr[i], linkedinUrl: e.target.value }; set("team_members", arr);
                          }} 
                          disabled={readonly} 
                          className="border-2 border-foreground rounded-xl h-10"
                        />
                      </div>
                    </div>
                  ))}

                  {!readonly && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => set("team_members", [...draft.team_members, { name: "", role: "", linkedinUrl: "" }])}
                      className="border-2 border-dashed border-foreground/30 hover:border-foreground bg-background hover:bg-muted font-bold rounded-xl flex items-center justify-center gap-1 w-full"
                    >
                      <Plus className="h-4 w-4" /> Add More Members
                    </Button>
                  )}
                </div>
              </div>

              {/* Startup Thumbnail */}
              <div className="mb-6">
                <Label className="font-bold text-foreground block mb-2">Startup Thumbnail (Optional)</Label>
                <div
                  onDragOver={(e) => handleDrag(e, "thumbnail", true)}
                  onDragLeave={(e) => handleDrag(e, "thumbnail", false)}
                  onDrop={(e) => handleDrop(e, "thumbnail")}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 text-center transition-all relative flex flex-col items-center justify-center min-h-[220px]",
                    draft.thumbnail_url ? "border-solid bg-surface" : "border-foreground/30 bg-muted/5",
                    dragOverThumbnail ? "border-primary bg-primary/5 scale-[0.99]" : "",
                    !readonly && "hover:border-foreground/60 cursor-pointer"
                  )}
                >
                  {draft.thumbnail_url ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                      <div className="w-48 aspect-[16/9] rounded-lg border-2 border-foreground overflow-hidden bg-background shadow-[3px_3px_0_0_hsl(var(--foreground))]">
                        <img src={draft.thumbnail_url} alt="Startup Thumbnail" className="w-full h-full object-cover animate-fade-in" />
                      </div>
                      {!readonly && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            set("thumbnail_url", "");
                          }}
                        >
                          <X className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={readonly || uploadingThumbnail}
                        onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                      />
                      {uploadingThumbnail ? (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                          <p className="text-sm font-medium text-foreground">Uploading thumbnail...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2 pointer-events-none">
                          <div className="p-3 bg-[hsl(var(--pastel-pink))]/10 border-2 border-[hsl(var(--pastel-pink))] rounded-lg shadow-[2px_2px_0_0_hsl(var(--pastel-pink))]">
                            <ImageIcon className="h-8 w-8 text-foreground" />
                          </div>
                          <p className="font-bold text-foreground">Upload Thumbnail</p>
                          <p className="text-xs text-muted-foreground">Drag & drop or click to choose</p>
                          <p className="text-[10px] text-muted-foreground/80 font-mono mt-1">PNG, JPG, WEBP • Max 2MB</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label className="font-bold text-foreground block mb-2">Pitch Deck (PDF, max 5MB) *</Label>
                
                {/* Drag and Drop area */}
                <div 
                  onDragOver={(e) => handleDrag(e, "deck", true)}
                  onDragLeave={(e) => handleDrag(e, "deck", false)}
                  onDrop={(e) => handleDrop(e, "deck")}
                  onClick={() => !readonly && !uploading && fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center",
                    dragOverDeck 
                      ? "border-primary bg-[hsl(var(--pastel-blue))]/10 scale-[0.99]" 
                      : "border-foreground/30 bg-muted/5 hover:bg-muted/15 hover:border-foreground/60",
                    readonly && "cursor-not-allowed opacity-70"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                    disabled={readonly || uploading}
                    className="hidden"
                  />
                  
                  {uploading ? (
                    <>
                      <RefreshCw className="h-10 w-10 text-foreground animate-spin mb-3" />
                      <p className="font-bold text-foreground text-sm">Uploading deck PDF...</p>
                    </>
                  ) : draft.deck_url ? (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-success mb-3" />
                      <p className="font-bold text-success text-sm flex items-center gap-1 justify-center">
                        <FileText className="h-4 w-4 text-foreground" /> Pitch deck uploaded successfully!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Click or drag here to replace the current file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="font-bold text-foreground text-sm">
                        <span className="underline">Choose File</span> or Drag & Drop here
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm">
                        PDF format only (Max 5MB). Your deck should include: Problem, Solution, Market, Traction, Team, Financials, and Ask.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label className="font-bold text-foreground block mb-2">Additional Documents (optional)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx" 
                    disabled={readonly}
                    className="border-2 border-foreground rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-2 file:border-foreground file:text-xs file:font-bold file:bg-[hsl(var(--pastel-blue))] hover:file:opacity-90 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground font-semibold mt-1">Upload Business Plan, Financial Projections, or technical charts if available.</p>
              </div>
            </div>
          )}

          {/* BACK | SAVE AS DRAFT | NEXT/SUBMIT FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-foreground/10">
            <Button 
              variant="outline" 
              onClick={prev} 
              disabled={step === 1}
              className="border-2 border-foreground bg-background hover:bg-muted shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <div className="flex gap-2">
              {!readonly && (
                <Button 
                  variant="outline" 
                  onClick={() => persist(false).then(() => toast.success("Draft saved successfully!"))} 
                  disabled={saving}
                  className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-xl"
                >
                  <Save className="mr-2 h-4 w-4" /> Save as Draft
                </Button>
              )}
              
              {step < 5 ? (
                <Button 
                  onClick={next}
                  className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] font-bold rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  Continue to Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                !readonly && (
                  <Button 
                    onClick={submit} 
                    disabled={saving}
                    className="border-2 border-foreground bg-[hsl(var(--pastel-mint))] hover:opacity-90 text-foreground font-extrabold rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                  >
                    {saving ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" /> Submit Pitch</>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
