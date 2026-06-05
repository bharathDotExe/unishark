import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Edit3, Trash2, ShieldCheck, Download, FileText,
  Eye, MessageSquare, Bookmark, Linkedin,
  Share2, RefreshCw, AlertCircle, ArrowLeft, Calendar,
  Target, TrendingUp, Users, DollarSign, Lightbulb, AlertTriangle,
  BarChart3, Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import InvestorPitchView from "./investor/InvestorPitchView";
import { PageHeader, SectionCard, StatCard, StatusPill } from "@/components/admin/ui";

type Pitch = {
  id: string;
  title: string;
  one_liner?: string | null;
  problem?: string | null;
  solution?: string | null;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  stage: "IDEA" | "MVP" | "REVENUE" | "GROWTH" | null;
  funding_ask: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
  user_id: string;
  deck_url?: string | null;
  team_members?: any;
  traction?: string | null;
  thumbnail_url?: string | null;
  market_size?: string | null;
};

type Profile = { full_name: string | null; email: string };

function Section({
  icon: Icon,
  title,
  children,
  accent = "slate",
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  accent?: "slate" | "indigo" | "emerald" | "amber" | "red" | "sky";
}) {
  const tones: Record<string, string> = {
    slate: "bg-muted text-muted-foreground",
    indigo: "bg-primary/10 text-primary",
    emerald: "bg-success/10 text-success",
    amber: "bg-warning/10 text-warning",
    red: "bg-destructive/10 text-destructive",
    sky: "bg-accent text-accent-foreground",
  };
  return (
    <Card className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border bg-muted/20">
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", tones[accent])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </Card>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-lg p-3.5 bg-card">
      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-1 truncate" title={value}>{value}</p>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, hint }: { icon: any; label: string; value: string | number; hint?: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
        </div>
        {hint && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

export default function PitchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roles } = useAuth();

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [authorProfile, setAuthorProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesCount, setMessagesCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [deckSignedUrl, setDeckSignedUrl] = useState<string | null>(null);
  const [actioning, setActioning] = useState(false);

  const loadPitchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data: pitchData, error } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!pitchData) { setPitch(null); return; }
      setPitch(pitchData as Pitch);

      const { data: profile } = await supabase
        .from("student_profiles")
        .select("full_name, email")
        .eq("user_id", pitchData.user_id)
        .maybeSingle();
      if (profile) setAuthorProfile(profile as any);

      const [{ count: mCount }, { count: bCount }] = await Promise.all([
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("pitch_id", id),
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("pitch_id", id),
      ]);
      if (mCount !== null) setMessagesCount(mCount);
      if (bCount !== null) setBookmarksCount(bCount);

      if (pitchData.deck_url) {
        const { data: s } = await supabase.storage
          .from("pitch-decks")
          .createSignedUrl(pitchData.deck_url, 60 * 30);
        if (s?.signedUrl) setDeckSignedUrl(s.signedUrl);
      }
    } catch (e: any) {
      toast.error("Failed to load pitch details: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPitchData(); }, [id]);

  const handleDelete = async () => {
    if (!pitch) return;
    if (!window.confirm("Delete this pitch? This cannot be undone.")) return;
    try {
      setActioning(true);
      const { error } = await supabase.from("pitches").delete().eq("id", pitch.id);
      if (error) throw error;
      toast.success("Pitch deleted");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error("Failed to delete: " + e.message);
    } finally { setActioning(false); }
  };

  const handleDownloadDeck = () => {
    if (deckSignedUrl) window.open(deckSignedUrl, "_blank");
    else toast.info("No deck attached to this pitch");
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const triggerSecurityAlert = () => navigate(`/pitches/${id}/security`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Loading pitch…</span>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 border border-border rounded-xl shadow-none text-center">
          <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Pitch not found</h1>
          <p className="text-sm text-muted-foreground mt-1.5 mb-5">This pitch may have been removed or you don't have access.</p>
          <Button asChild className="rounded-lg"><Link to="/dashboard">Back to dashboard</Link></Button>
        </Card>
      </div>
    );
  }

  // Parse serialized JSON fields with safe fallbacks
  let parsedMarketSize = pitch.market_size ?? "";
  let targetMarket = "—";
  let competitors = "";
  let advantage = "";
  if (parsedMarketSize.trim().startsWith("{")) {
    try {
      const p = JSON.parse(parsedMarketSize);
      parsedMarketSize = p.market_size ?? "";
      targetMarket = p.target_market ?? targetMarket;
      competitors = p.competitors ?? competitors;
      advantage = p.advantage ?? advantage;
    } catch {}
  }

  let parsedFundingAsk = pitch.funding_ask ?? "";
  let useOfFunds = "";
  if (parsedFundingAsk.trim().startsWith("{")) {
    try {
      const p = JSON.parse(parsedFundingAsk);
      parsedFundingAsk = p.funding_ask ?? "";
      useOfFunds = p.use_of_funds ?? useOfFunds;
    } catch {}
  }

  const rawTeam = Array.isArray(pitch.team_members) ? pitch.team_members : [];
  const activeTeam = rawTeam.filter((m: any) => m?.name);
  const activeTraction = pitch.traction ? pitch.traction.split("\n").filter((t) => t.trim()) : [];

  const authorName = authorProfile?.full_name || "Founder";
  const formattedAsk = parsedFundingAsk || "—";

  const statusTone =
    pitch.status === "APPROVED" ? "positive" :
    pitch.status === "REJECTED" ? "danger" :
    pitch.status === "SUBMITTED" ? "info" : "warning";
  const statusLabel =
    pitch.status === "APPROVED" ? "Approved" :
    pitch.status === "REJECTED" ? "Rejected" :
    pitch.status === "SUBMITTED" ? "Under review" : "Draft";

  if (roles.includes("investor")) {
    return <InvestorPitchView pitch={pitch} authorProfile={authorProfile} deckSignedUrl={deckSignedUrl} />;
  }

  const interestScore = Math.min(10, Math.max(1, Math.round((pitch.view_count + messagesCount * 2 + bookmarksCount * 3) / 5) || 1));

  const metaTiles = [
    { label: "Stage", value: pitch.stage || "" },
    { label: "Funding ask", value: parsedFundingAsk },
    { label: "Target market", value: targetMarket && targetMarket !== "—" ? targetMarket : "" },
  ].filter((t) => t.value && t.value.trim() !== "");
  const showOverview = metaTiles.length > 0 || !!pitch.thumbnail_url;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        {/* Header */}
        <Card className="border border-border bg-card rounded-xl shadow-none p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <StatusPill label={statusLabel} tone={statusTone as any} />
                {pitch.stage && (
                  <span className="text-[11px] font-medium text-muted-foreground border border-border rounded-md px-2 py-0.5">
                    {pitch.stage}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
                {pitch.title}
              </h1>
              {pitch.one_liner && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{pitch.one_liner}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(pitch.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> {authorName}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <Button asChild variant="outline" size="sm" className="h-9 rounded-lg border-border text-[13px] font-medium">
                <Link to={`/pitches/${pitch.id}/edit`}><Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={triggerSecurityAlert} className="h-9 rounded-lg border-border text-[13px] font-medium">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Security
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareLink} className="h-9 rounded-lg border-border text-[13px] font-medium">
                <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
              </Button>
              <Button size="sm" onClick={handleDownloadDeck} className="h-9 rounded-lg text-[13px] font-medium">
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download deck
              </Button>
            </div>
          </div>

          {pitch.status === "REJECTED" && pitch.rejection_reason && (
            <div className="mt-5 p-4 bg-red-50/60 border border-red-200 rounded-lg">
              <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">Reason for rejection</p>
              <p className="text-sm text-red-900">{pitch.rejection_reason}</p>
            </div>
          )}
        </Card>

        {/* Body grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            {showOverview && (
              <Section icon={Target} title="Overview" accent="indigo">
                {pitch.thumbnail_url && (
                  <div className="w-full aspect-[21/9] rounded-lg overflow-hidden bg-muted mb-5 border border-border">
                    <img src={pitch.thumbnail_url} alt={pitch.title} className="w-full h-full object-cover" />
                  </div>
                )}
                {metaTiles.length > 0 && (
                  <div
                    className={cn(
                      "grid gap-3",
                      metaTiles.length === 1 && "grid-cols-1",
                      metaTiles.length === 2 && "grid-cols-1 sm:grid-cols-2",
                      metaTiles.length === 3 && "grid-cols-1 sm:grid-cols-3"
                    )}
                  >
                    {metaTiles.map((t) => (
                      <MetaTile key={t.label} label={t.label} value={t.value} />
                    ))}
                  </div>
                )}
              </Section>
            )}

            {/* Problem */}
            {pitch.problem && (
              <Section icon={AlertTriangle} title="The problem" accent="red">
                <p className="text-[15px] leading-relaxed text-foreground/85 whitespace-pre-line">
                  {pitch.problem}
                </p>
              </Section>
            )}

            {/* Solution */}
            {pitch.solution && (
              <Section icon={Lightbulb} title="The solution" accent="emerald">
                <p className="text-[15px] leading-relaxed text-foreground/85 whitespace-pre-line">
                  {pitch.solution}
                </p>
              </Section>
            )}

            {/* Traction */}
            {activeTraction.length > 0 && (
              <Section icon={TrendingUp} title="Traction" accent="emerald">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeTraction.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/85 p-3 rounded-lg bg-muted/40 border border-border">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Market */}
            {(parsedMarketSize || competitors || advantage) && (
              <Section icon={BarChart3} title="Market & competition" accent="sky">
                {parsedMarketSize && (
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Market size</p>
                    <p className="text-sm text-foreground/85">{parsedMarketSize}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {competitors && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Competitors</p>
                      <div className="space-y-1.5">
                        {competitors.split(",").map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                            <span className="text-red-500 mt-1">•</span><span>{c.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {advantage && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Our advantage</p>
                      <div className="space-y-1.5">
                        {advantage.split(",").map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                            <span className="text-emerald-500 mt-1">•</span><span>{a.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Team */}
            {activeTeam.length > 0 && (
              <Section icon={Users} title="Team" accent="indigo">
                <div className="space-y-3">
                  {activeTeam.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-4 p-4 border border-border rounded-lg bg-muted/30">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{m.name}</span>
                          {m.role && (
                            <span className="text-[11px] font-medium bg-foreground text-background px-1.5 py-0.5 rounded">
                              {m.role}
                            </span>
                          )}
                        </div>
                        {m.bio && <p className="text-xs text-muted-foreground mt-1">{m.bio}</p>}
                      </div>
                      {m.linkedinUrl && (
                        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg border-border shrink-0">
                          <a href={m.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-3.5 w-3.5 mr-1.5" /> LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Use of funds */}
            {useOfFunds && (
              <Section icon={DollarSign} title="Use of funds" accent="amber">
                <div className="space-y-2.5">
                  {useOfFunds.split("|").map((alloc, i) => {
                    const [label, desc] = alloc.split(":").map((s) => s.trim());
                    return (
                      <div key={i} className="p-3.5 border border-border rounded-lg bg-muted/30">
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Pitch deck */}
            <Section icon={FileText} title="Pitch deck" accent="slate">
              {deckSignedUrl ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted mb-4">
                  <iframe src={deckSignedUrl} title="Pitch Deck" className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full flex flex-col items-center justify-center border border-dashed border-border bg-muted/30 rounded-lg mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">No deck attached</p>
                  <p className="text-xs text-muted-foreground mt-1">Upload a deck from the edit page.</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleDownloadDeck} size="sm" className="h-9 rounded-lg">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                </Button>
                <Button onClick={handleShareLink} size="sm" variant="outline" className="h-9 rounded-lg border-border">
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share link
                </Button>
              </div>
            </Section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Performance</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Live stats from your audience</p>
              </div>
              <div className="px-5 py-2 divide-y divide-border">
                <StatRow icon={Eye} label="Views" value={pitch.view_count} hint="Total impressions" />
                <StatRow icon={MessageSquare} label="Messages" value={messagesCount} hint="From investors" />
                <StatRow icon={Bookmark} label="Bookmarks" value={bookmarksCount} hint="Saved by investors" />
              </div>
              <div className="px-5 py-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Interest level</p>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{interestScore}/10</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${interestScore * 10}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {interestScore >= 8 ? "Very high investor interest" : interestScore >= 5 ? "Moderate interest" : "Building momentum"}
                </p>
              </div>
              <div className="px-5 py-3 border-t border-border bg-muted/20">
                <p className="text-[11px] text-muted-foreground">
                  Updated {new Date(pitch.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </Card>

            {/* Actions */}
            <Card className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
              </div>
              <div className="p-2 flex flex-col">
                <Button asChild variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium">
                  <Link to={`/pitches/${pitch.id}/edit`}><Edit3 className="h-3.5 w-3.5 mr-2" /> Edit pitch</Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium">
                  <Link to="/messages"><MessageSquare className="h-3.5 w-3.5 mr-2" /> View messages</Link>
                </Button>
                <Button onClick={triggerSecurityAlert} variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 mr-2" /> Security dashboard
                </Button>
                <Button onClick={handleShareLink} variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium">
                  <Share2 className="h-3.5 w-3.5 mr-2" /> Share public link
                </Button>
                <div className="h-px bg-border my-1" />
                <Button
                  disabled={actioning}
                  onClick={handleDelete}
                  variant="ghost"
                  className="justify-start h-9 px-3 rounded-md text-[13px] font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete pitch
                </Button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="border border-border bg-card rounded-xl shadow-none p-5">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Boost your pitch</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pitches with a deck, traction numbers, and a clear funding ask get up to 3× more investor interest. Keep your overview tight and your problem statement sharp.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
