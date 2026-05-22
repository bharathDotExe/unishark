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
import { ArrowLeft, ArrowRight, Send, Upload, Save, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
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
  thumbnail_url: string;
};

const empty: Draft = {
  title: "", one_liner: "", problem: "", solution: "", market_size: "", traction: "",
  stage: "", funding_ask: "", team_members: [{ name: "", role: "", linkedinUrl: "" }], deck_url: "", thumbnail_url: "",
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
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(empty);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("DRAFT");

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [dragOverDeck, setDragOverDeck] = useState(false);
  const [dragOverThumbnail, setDragOverThumbnail] = useState(false);

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
    if (file.type !== "application/pdf") { toast.error("PDF only."); return; }
    if (file.size > PDF_MAX_BYTES) { toast.error("Max 5MB."); return; }
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage.from("pitch-decks").upload(path, file, {
      upsert: false,
      contentType: "application/pdf",
    });
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    set("deck_url", path);
    toast.success("Deck uploaded");
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage" className="font-semibold text-primary-dark">Stage *</Label>
                  <Select value={draft.stage} onValueChange={(v) => set("stage", v as any)} disabled={readonly}>
                    <SelectTrigger className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] mt-1 bg-surface"><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDEA">Idea</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="REVENUE">Revenue</SelectItem>
                      <SelectItem value="GROWTH">Growth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ask" className="font-semibold text-primary-dark">Funding ask</Label>
                  <Input id="ask" className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] mt-1" value={draft.funding_ask} onChange={(e) => set("funding_ask", e.target.value)} disabled={readonly} placeholder="₹1 Crore" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Startup Thumbnail */}
                <div className="space-y-2">
                  <Label className="font-semibold text-primary-dark block">Startup Thumbnail</Label>
                  <div
                    onDragOver={(e) => handleDrag(e, "thumbnail", true)}
                    onDragLeave={(e) => handleDrag(e, "thumbnail", false)}
                    onDrop={(e) => handleDrop(e, "thumbnail")}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative flex flex-col items-center justify-center min-h-[220px] ${
                      draft.thumbnail_url ? "border-solid bg-surface" : "border-foreground bg-background"
                    } ${
                      dragOverThumbnail ? "border-primary bg-primary/5 scale-[1.01]" : ""
                    } ${
                      !readonly ? "hover:border-primary/70 cursor-pointer" : ""
                    } border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]`}
                  >
                    {draft.thumbnail_url ? (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                        <div className="w-full aspect-video rounded-lg border-2 border-foreground overflow-hidden bg-background shadow-[3px_3px_0_0_hsl(var(--foreground))]">
                          <img src={draft.thumbnail_url} alt="Startup Thumbnail" className="w-full h-full object-cover animate-fade-in" />
                        </div>
                        {!readonly && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px]"
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
                          id="thumbnail-upload"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={readonly || uploadingThumbnail}
                          onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                        />
                        {uploadingThumbnail ? (
                          <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Uploading thumbnail...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2 pointer-events-none">
                            <div className="p-3 bg-accent/10 border-2 border-foreground rounded-lg shadow-[2px_2px_0_0_hsl(var(--foreground))]">
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

                {/* Pitch Deck PDF */}
                <div className="space-y-2">
                  <Label className="font-semibold text-primary-dark block">Pitch Deck (PDF, max 5MB)</Label>
                  <div
                    onDragOver={(e) => handleDrag(e, "deck", true)}
                    onDragLeave={(e) => handleDrag(e, "deck", false)}
                    onDrop={(e) => handleDrop(e, "deck")}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative flex flex-col items-center justify-center min-h-[220px] ${
                      draft.deck_url ? "border-solid bg-surface" : "border-foreground bg-background"
                    } ${
                      dragOverDeck ? "border-primary bg-primary/5 scale-[1.01]" : ""
                    } ${
                      !readonly ? "hover:border-primary/70 cursor-pointer" : ""
                    } border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]`}
                  >
                    {draft.deck_url ? (
                      <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-primary/5 border-2 border-foreground rounded-lg w-full shadow-[3px_3px_0_0_hsl(var(--foreground))]">
                          <FileText className="h-10 w-10 text-primary shrink-0" />
                          <div className="text-left truncate min-w-0">
                            <p className="font-bold text-sm text-foreground truncate animate-fade-in">
                              {draft.deck_url.split('/').pop()?.replace(/^\d+-/, '') || "pitch_deck.pdf"}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">PDF Document</p>
                          </div>
                        </div>
                        {!readonly && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              set("deck_url", "");
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
                          id="deck-upload"
                          accept="application/pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={readonly || uploading}
                          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                        />
                        {uploading ? (
                          <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Uploading deck...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2 pointer-events-none">
                            <div className="p-3 bg-primary/10 border-2 border-foreground rounded-lg shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                              <Upload className="h-8 w-8 text-foreground" />
                            </div>
                            <p className="font-bold text-foreground">Upload Pitch Deck</p>
                            <p className="text-xs text-muted-foreground">Drag & drop or click to choose</p>
                            <p className="text-[10px] text-muted-foreground/80 font-mono mt-1">PDF ONLY • Max 5MB</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
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
