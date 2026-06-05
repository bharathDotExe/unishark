import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, BookmarkCheck, Building2, Eye, FileText, MessageSquare, RefreshCw, Search, SlidersHorizontal, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { DataTable, EmptyState, PageHeader, SectionCard, StatCard, StatusPill, type Column } from "@/components/admin/ui";

type Pitch = {
  id: string;
  title: string;
  one_liner: string | null;
  stage: string | null;
  funding_ask: string | null;
  traction: string | null;
  market_size: string | null;
  view_count: number;
  created_at: string;
  user_id: string;
};

const stages = ["all", "IDEA", "MVP", "REVENUE", "GROWTH"];

export default function BrowsePitches() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: pitchData, error: pitchErr } = await supabase
        .from("pitches")
        .select("id, title, one_liner, stage, funding_ask, traction, market_size, view_count, created_at, user_id")
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      if (pitchErr) throw pitchErr;
      setPitches(pitchData ?? []);

      if (user) {
        const { data: bmData } = await supabase.from("bookmarks").select("pitch_id").eq("user_id", user.id);
        setBookmarkedIds(new Set((bmData ?? []).map((b: any) => b.pitch_id)));
      }
    } catch (e: unknown) {
      toast.error("Failed to load pitches: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (pitchId: string) => {
    if (!user) {
      toast.error("Please log in to bookmark pitches");
      return;
    }
    setBookmarkingId(pitchId);
    try {
      if (bookmarkedIds.has(pitchId)) {
        const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("pitch_id", pitchId);
        if (error) throw error;
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(pitchId);
          return next;
        });
        toast.success("Bookmark removed");
      } else {
        const { error } = await supabase.from("bookmarks").insert({ user_id: user.id, pitch_id: pitchId });
        if (error) throw error;
        setBookmarkedIds((prev) => new Set([...prev, pitchId]));
        toast.success("Pitch bookmarked!");
      }
    } catch (e: unknown) {
      toast.error("Failed to update bookmark: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBookmarkingId(null);
    }
  };

  const parseAsk = (value: string | null) => {
    if (!value) return "—";
    if (value.trim().startsWith("{")) {
      try {
        return JSON.parse(value).funding_ask || "—";
      } catch {
        return value;
      }
    }
    return value;
  };

  const filtered = useMemo(() => {
    return pitches
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = !query || p.title.toLowerCase().includes(query) || (p.one_liner ?? "").toLowerCase().includes(query);
        const matchesStage = stageFilter === "all" || p.stage === stageFilter;
        return matchesSearch && matchesStage;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === "views") return (b.view_count ?? 0) - (a.view_count ?? 0);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [pitches, searchQuery, stageFilter, sortBy]);

  const counts = {
    total: pitches.length,
    mvp: pitches.filter((p) => p.stage === "MVP").length,
    revenue: pitches.filter((p) => p.stage === "REVENUE" || p.stage === "GROWTH").length,
    views: pitches.reduce((sum, p) => sum + (p.view_count || 0), 0),
  };

  const columns: Column<Pitch>[] = [
    {
      key: "pitch",
      header: "Pitch",
      width: "minmax(280px, 2fr)",
      cell: (pitch) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Link to={`/pitches/${pitch.id}`} className="text-sm font-semibold text-foreground truncate hover:underline">
              {pitch.title}
            </Link>
            {pitch.stage && <StatusPill label={pitch.stage} tone={pitch.stage === "REVENUE" || pitch.stage === "GROWTH" ? "positive" : "info"} />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pitch.one_liner || "No summary available."}</p>
        </div>
      ),
    },
    {
      key: "ask",
      header: "Ask",
      width: "150px",
      cell: (pitch) => <span className="text-sm font-medium text-foreground truncate" title={parseAsk(pitch.funding_ask)}>{parseAsk(pitch.funding_ask)}</span>,
    },
    {
      key: "traction",
      header: "Traction / market",
      width: "minmax(190px, 1fr)",
      cell: (pitch) => (
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{pitch.traction || "Traction not listed"}</p>
          <p className="text-xs text-muted-foreground truncate">{pitch.market_size || "Market size not listed"}</p>
        </div>
      ),
    },
    {
      key: "views",
      header: "Views",
      width: "90px",
      align: "center",
      cell: (pitch) => <span className="text-sm font-semibold text-foreground tabular-nums">{pitch.view_count || 0}</span>,
    },
    {
      key: "date",
      header: "Added",
      width: "100px",
      cell: (pitch) => <span className="text-xs font-medium text-muted-foreground">{new Date(pitch.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: "190px",
      align: "right",
      cell: (pitch) => {
        const bookmarked = bookmarkedIds.has(pitch.id);
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button asChild size="sm" className="h-8 rounded-md px-3 text-xs">
              <Link to={`/pitches/${pitch.id}`}>View pitch</Link>
            </Button>
            <Button
              size="icon"
              variant="outline"
              disabled={bookmarkingId === pitch.id}
              onClick={() => handleBookmark(pitch.id)}
              title={bookmarked ? "Remove bookmark" : "Bookmark"}
              className={cn("h-8 w-8 rounded-md border-border", bookmarked && "bg-muted")}
            >
              {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            </Button>
            <Button asChild size="icon" variant="outline" className="h-8 w-8 rounded-md border-border">
              <Link to="/messages" title="Message founder"><MessageSquare className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-24">
        <PageHeader
          eyebrow="Investor deal flow"
          title="Browse Pitches"
          subtitle={loading ? "Loading approved startup pitches…" : `${pitches.length} approved startup pitch${pitches.length !== 1 ? "es" : ""} ready for investor review.`}
          actions={
            <Button variant="outline" size="sm" onClick={loadAll} className="rounded-lg border-border">
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} /> Refresh
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Approved pitches" value={counts.total} icon={FileText} loading={loading} />
          <StatCard label="MVP stage" value={counts.mvp} icon={Building2} tone="info" loading={loading} />
          <StatCard label="Revenue/Growth" value={counts.revenue} icon={TrendingUp} tone="positive" loading={loading} />
          <StatCard label="Total views" value={counts.views} icon={Eye} loading={loading} />
        </div>

        <SectionCard title="Pitch marketplace" description={`${filtered.length} shown from ${pitches.length} approved pitches`}>
          <div className="px-5 py-4 border-b border-border flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pitches by title or tagline"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-lg border-border bg-background"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="h-9 rounded-lg border-border sm:w-[150px]"><SlidersHorizontal className="h-3.5 w-3.5 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => <SelectItem key={stage} value={stage}>{stage === "all" ? "All stages" : stage}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 rounded-lg border-border sm:w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="views">Most viewed</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pitches.length === 0 && !loading ? (
            <div className="p-5"><EmptyState icon={FileText} title="No pitches yet" description="Student founders are working on approved pitches. Check back soon." /></div>
          ) : filtered.length === 0 && !loading ? (
            <div className="p-5">
              <EmptyState
                icon={Search}
                title="No pitches match your filters"
                description="Try adjusting your search or stage filter."
                action={<Button variant="outline" className="mt-4 rounded-lg border-border" onClick={() => { setSearchQuery(""); setStageFilter("all"); }}>Reset filters</Button>}
              />
            </div>
          ) : (
            <DataTable columns={columns} rows={filtered} loading={loading} empty="No pitches match your filters." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}