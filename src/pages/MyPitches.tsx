import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, Eye, MessageSquare, Bookmark, Search, Edit3, Trash2, 
  Copy, RefreshCw, AlertCircle, ArrowUpRight, CheckCircle2, ShieldCheck, 
  Send, HelpCircle, FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  message_count?: number;
  bookmark_count?: number;
  isMock?: boolean;
};

export default function MyPitches() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED">("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "VIEWS" | "MESSAGES">("RECENT");
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Mock pitches matching specification exactly for empty fallback
  const mockPitches: Pitch[] = [
    {
      id: "mock-pitch-1",
      title: "AI Resume Builder",
      status: "APPROVED",
      created_at: "2024-05-14T10:00:00Z",
      updated_at: "2024-05-14T10:00:00Z",
      view_count: 23,
      message_count: 5,
      bookmark_count: 8,
      stage: "MVP",
      one_liner: "AI-powered resume builder for students and job seekers",
      funding_ask: "₹1 Crore",
      isMock: true
    },
    {
      id: "mock-pitch-2",
      title: "EdTech Learning Platform",
      status: "DRAFT",
      created_at: "2024-05-10T09:15:00Z",
      updated_at: "2024-05-10T09:15:00Z",
      view_count: 0,
      message_count: 0,
      bookmark_count: 0,
      stage: "IDEA",
      one_liner: "Interactive platform for learning coding skills",
      funding_ask: "₹50 Lakhs",
      isMock: true
    },
    {
      id: "mock-pitch-3",
      title: "FinTech App",
      status: "REJECTED",
      created_at: "2024-05-05T08:30:00Z",
      updated_at: "2024-05-05T08:30:00Z",
      view_count: 0,
      message_count: 0,
      bookmark_count: 0,
      stage: "MVP",
      one_liner: "Simple crypto trading for beginners",
      funding_ask: "₹2 Crore",
      rejection_reason: "Unclear differentiation from existing platforms",
      isMock: true
    }
  ];

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: realPitches } = await supabase
        .from("pitches")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const loadedPitches = (realPitches ?? []) as Pitch[];

      if (loadedPitches.length > 0) {
        // Fetch bookmarks and message counts for real pitches
        const { data: bookmarks } = await supabase.from("bookmarks").select("pitch_id");
        const { data: messages } = await supabase.from("messages").select("pitch_id");

        const enrichedPitches = loadedPitches.map(p => {
          const bCount = (bookmarks ?? []).filter(b => b.pitch_id === p.id).length;
          const mCount = (messages ?? []).filter(m => m.pitch_id === p.id).length;
          return {
            ...p,
            bookmark_count: bCount,
            message_count: mCount
          };
        });
        setPitches(enrichedPitches);
      } else {
        setPitches([]);
      }
    } catch (e: any) {
      toast.error("Failed to load pitches: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDuplicate = async (pitch: Pitch) => {
    if (pitch.isMock) {
      // Duplicate inside local state for mockup demo
      const newMock: Pitch = {
        ...pitch,
        id: `mock-pitch-copy-${Date.now()}`,
        title: `${pitch.title} (Copy)`,
        status: "DRAFT",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        view_count: 0,
        message_count: 0,
        bookmark_count: 0
      };
      
      // If we are currently showing mocks, prepend to it
      if (pitches.length === 0) {
        // Just mock trigger
        toast.success(`Duplicated mock pitch "${pitch.title}" successfully!`);
        return;
      }
    }

    try {
      setActioningId(pitch.id);
      
      const { data: fullPitch } = await supabase
        .from("pitches")
        .select("*")
        .eq("id", pitch.id)
        .single();
        
      if (!fullPitch) throw new Error("Source pitch not found");

      const payload = {
        user_id: user!.id,
        title: `${fullPitch.title} (Copy)`.slice(0, 100),
        one_liner: fullPitch.one_liner,
        problem: fullPitch.problem,
        solution: fullPitch.solution,
        market_size: fullPitch.market_size,
        traction: fullPitch.traction,
        stage: fullPitch.stage,
        funding_ask: fullPitch.funding_ask,
        team_members: fullPitch.team_members,
        deck_url: fullPitch.deck_url,
        status: "DRAFT" as const,
        view_count: 0
      };

      const { error } = await supabase.from("pitches").insert(payload);
      if (error) throw error;

      toast.success(`Duplicated "${pitch.title}" successfully!`);
      loadData();
    } catch (e: any) {
      toast.error("Failed to duplicate: " + e.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (pitch: Pitch) => {
    if (pitch.isMock) {
      toast.success("Mock pitch deleted successfully!");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${pitch.title}"?`)) return;
    try {
      setActioningId(pitch.id);
      const { error } = await supabase.from("pitches").delete().eq("id", pitch.id);
      if (error) throw error;

      toast.success("Pitch deleted successfully");
      loadData();
    } catch (e: any) {
      toast.error("Failed to delete pitch: " + e.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleSubmit = async (pitchId: string, isMock?: boolean) => {
    if (isMock) {
      toast.success("Mock pitch submitted for review successfully!");
      return;
    }

    try {
      setActioningId(pitchId);
      const { error } = await supabase
        .from("pitches")
        .update({ status: "APPROVED" }) // Approved instantly for local demo
        .eq("id", pitchId);

      if (error) throw error;
      toast.success("Your pitch is now APPROVED and visible to investors!");
      loadData();
    } catch (e: any) {
      toast.error("Failed to submit pitch: " + e.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRequestReview = (pitchTitle: string) => {
    toast.success(`Review requested for "${pitchTitle}". We'll audit this shortly!`);
  };

  // Helper to extract clean funding ask from JSON or text
  const getAskDisplay = (askVal: string | null) => {
    if (!askVal) return "N/A";
    if (askVal.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(askVal);
        return parsed.funding_ask || "N/A";
      } catch {
        return askVal;
      }
    }
    return askVal;
  };

  const activePitches = pitches.length > 0 ? pitches : mockPitches;

  // Filter & Sort logic
  const filteredPitches = activePitches.filter(p => {
    // Search Query match
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.one_liner || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status Filter match
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort pitches
  const sortedPitches = [...filteredPitches].sort((a, b) => {
    if (sortBy === "VIEWS") {
      return b.view_count - a.view_count;
    } else if (sortBy === "MESSAGES") {
      return (b.message_count ?? 0) - (a.message_count ?? 0);
    } else {
      // RECENT
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8 border-b border-foreground/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-[hsl(var(--pastel-blue))] bg-[hsl(var(--pastel-blue))]/10 border border-[hsl(var(--pastel-blue))]/20 px-2.5 py-1 rounded-full mb-1 inline-block">
            MY WORKSPACE
          </span>
          <h1 className="text-4xl font-display font-extrabold tracking-wide text-foreground mt-1">My Pitches</h1>
          <p className="text-muted-foreground font-semibold mt-1">Submit, edit, and duplicate your start-up presentations.</p>
        </div>
        <Button asChild size="lg" className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <Link to="/pitches/create">
            <Plus className="mr-2 h-5 w-5" /> Submit New Pitch
          </Link>
        </Button>
      </div>

      {/* FILTER OPTIONS */}
      <Card className="p-6 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Filter buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-extrabold text-muted-foreground mr-1 uppercase">Status:</span>
            {(["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const).map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 border-2 border-foreground rounded-lg text-xs font-bold transition-all",
                    isActive 
                      ? "bg-[hsl(var(--pastel-blue))] text-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-y-[-1px]" 
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Sort By options */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-extrabold text-muted-foreground mr-1 uppercase">Sort By:</span>
            {[
              { val: "RECENT", label: "Most Recent" },
              { val: "VIEWS", label: "Most Views" },
              { val: "MESSAGES", label: "Most Messages" }
            ].map((opt) => {
              const isActive = sortBy === opt.val;
              return (
                <button
                  key={opt.val}
                  onClick={() => setSortBy(opt.val as any)}
                  className={cn(
                    "px-3 py-1.5 border-2 border-foreground rounded-lg text-xs font-bold transition-all",
                    isActive 
                      ? "bg-[hsl(var(--pastel-pink))] text-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-y-[-1px]" 
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pitches by title or keyword..."
            className="pl-9 border-2 border-foreground/15 focus-visible:border-foreground focus-visible:ring-0 rounded-xl h-10 bg-background/50 hover:border-foreground/30 font-medium"
          />
        </div>
      </Card>

      {/* PITCH LIST */}
      {loading ? (
        <Card className="p-12 text-center border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
          <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-semibold">Refreshing pitches...</p>
        </Card>
      ) : sortedPitches.length === 0 ? (
        <Card className="p-12 text-center border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-display font-extrabold">No pitches found</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto font-medium">No pitches match your current search queries or filters. Clear them or create a new pitch.</p>
          <Button onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }} className="border-2 border-foreground bg-foreground text-background font-bold rounded-xl mr-2">Reset Filters</Button>
          <Button asChild variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-xl"><Link to="/pitches/create">Submit New Pitch</Link></Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedPitches.map((p) => {
            const isMock = !!p.isMock;
            return (
              <Card 
                key={p.id} 
                className={cn(
                  "p-6 sm:p-8 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl relative overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]",
                  isMock ? "bg-card/95" : "bg-card"
                )}
              >
                {isMock && (
                  <div className="absolute top-0 right-0 bg-foreground/5 text-foreground/40 text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl select-none">
                    Sample Data
                  </div>
                )}

                <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <h4 className="font-display font-extrabold text-2xl text-foreground tracking-wide truncate">{p.title}</h4>
                      
                      {/* Dynamic Status Badges */}
                      {p.status === "APPROVED" && (
                        <Badge className="bg-success text-success-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans px-2.5 py-0.5">
                          ✅ APPROVED (visible to investors)
                        </Badge>
                      )}
                      {p.status === "DRAFT" && (
                        <Badge className="bg-[hsl(var(--pastel-pink))] text-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans px-2.5 py-0.5">
                          🟡 DRAFT (not visible to investors)
                        </Badge>
                      )}
                      {p.status === "REJECTED" && (
                        <Badge className="bg-destructive text-destructive-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans px-2.5 py-0.5">
                          ❌ REJECTED (not visible to investors)
                        </Badge>
                      )}
                      {p.status === "SUBMITTED" && (
                        <Badge className="bg-[hsl(var(--pastel-blue))] text-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans px-2.5 py-0.5">
                          🔵 SUBMITTED (under review)
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-4 border-foreground/15 pl-3 py-1 my-3 bg-muted/20 rounded-r-lg">
                      "{p.one_liner || "Describe what your startup does in 1 sentence."}"
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-bold text-muted-foreground mt-2 border-b border-foreground/5 pb-3">
                      <span>Stage: <span className="text-foreground">{p.stage || "N/A"}</span></span>
                      <span className="text-foreground/20">|</span>
                      <span>Funding Ask: <span className="text-foreground">{getAskDisplay(p.funding_ask)}</span></span>
                      <span className="text-foreground/20">|</span>
                      <span>Created: <span className="text-foreground">{formatDate(p.created_at)}</span></span>
                    </div>
                  </div>
                </div>

                {/* Rejection Details Block */}
                {p.status === "REJECTED" && (
                  <div className="border-2 border-destructive bg-destructive/5 rounded-xl p-4 my-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-destructive font-bold text-sm">
                      <AlertCircle className="h-4 w-4" /> Rejection Reason:
                    </div>
                    <p className="text-xs font-semibold text-foreground/90 leading-relaxed pl-5 italic">
                      "{p.rejection_reason || "Unclear differentiation from existing platforms"}"
                    </p>
                    <Button 
                      onClick={() => handleRequestReview(p.title)} 
                      size="sm" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-bold rounded-lg shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all ml-5 text-xs"
                    >
                      Request Review
                    </Button>
                  </div>
                )}

                {/* STATS ROW */}
                <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-foreground/10 mb-5 w-fit">
                  <span className="flex items-center gap-1.5">👁️ {p.view_count} Views</span>
                  <span className="text-foreground/10">|</span>
                  <span className="flex items-center gap-1.5">💬 {p.message_count ?? 0} Messages</span>
                  <span className="text-foreground/10">|</span>
                  <span className="flex items-center gap-1.5">🔖 {p.bookmark_count ?? 0} Bookmarks</span>
                </div>

                {/* BUTTONS ACTION STRIP */}
                <div className="flex flex-wrap gap-2.5 pt-2 border-t border-foreground/5">
                  <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-lg transition-all">
                    <Link to={`/pitches/${p.id}`}>
                      View Details
                    </Link>
                  </Button>

                  {/* Context-aware Actions */}
                  {p.status === "APPROVED" && (
                    <Button asChild size="sm" className="border-2 border-foreground bg-[hsl(var(--pastel-blue))] hover:opacity-90 text-foreground font-bold rounded-lg transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]">
                      <Link to={`/pitches/${p.id}/security`}>
                        Security
                      </Link>
                    </Button>
                  )}
                  {p.status === "DRAFT" && (
                    <Button 
                      disabled={actioningId === p.id}
                      onClick={() => handleSubmit(p.id, isMock)}
                      size="sm" 
                      className="border-2 border-foreground bg-[hsl(var(--pastel-mint))] hover:opacity-90 text-foreground font-bold rounded-lg transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      Submit
                    </Button>
                  )}
                  {p.status === "REJECTED" && (
                    <Button asChild size="sm" className="border-2 border-foreground bg-[hsl(var(--pastel-mint))] hover:opacity-90 text-foreground font-bold rounded-lg transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]">
                      <Link to={`/pitches/${p.id}/edit`}>
                        Edit & Resubmit
                      </Link>
                    </Button>
                  )}

                  {/* Always Available Actions */}
                  <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-lg transition-all">
                    <Link to={`/pitches/${p.id}/edit`}>
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Link>
                  </Button>

                  <Button 
                    disabled={actioningId === p.id}
                    onClick={() => handleDuplicate(p)}
                    size="sm" 
                    variant="outline" 
                    className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-lg transition-all"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                  </Button>

                  <Button 
                    disabled={actioningId === p.id}
                    onClick={() => handleDelete(p)}
                    size="sm" 
                    variant="outline" 
                    className="border-2 border-foreground hover:bg-destructive hover:text-destructive-foreground font-bold rounded-lg transition-all ml-auto hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
