import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bookmark, MessageSquare, Search, Filter, RefreshCw, FileText, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

export default function BrowsePitches() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  // Filters & sort (client-side)
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Fetch approved pitches
      const { data: pitchData, error: pitchErr } = await supabase
        .from("pitches")
        .select("id, title, one_liner, stage, funding_ask, traction, market_size, view_count, created_at, user_id")
        .eq("status", "APPROVED")
        .order("created_at", { ascending: false });

      if (pitchErr) throw pitchErr;
      setPitches(pitchData ?? []);

      // Fetch user's bookmarks
      if (user) {
        const { data: bmData } = await supabase
          .from("bookmarks")
          .select("pitch_id")
          .eq("user_id", user.id);
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
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("pitch_id", pitchId);
        if (error) throw error;
        setBookmarkedIds((prev) => { const next = new Set(prev); next.delete(pitchId); return next; });
        toast.success("Bookmark removed");
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert({ user_id: user.id, pitch_id: pitchId });
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

  // Client-side filter + sort
  const filtered = pitches
    .filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.one_liner ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage =
        stageFilter === "all" || p.stage === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "views") return (b.view_count ?? 0) - (a.view_count ?? 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const stageColors: Record<string, string> = {
    IDEA: "bg-[hsl(var(--pastel-pink))] text-foreground",
    MVP: "bg-[hsl(var(--pastel-blue))] text-foreground",
    REVENUE: "bg-[hsl(var(--pastel-mint))] text-foreground",
    GROWTH: "bg-success text-success-foreground",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px] pb-24">

      <div className="mb-8">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">Browse Pitches</h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1">
          {loading ? "Loading..." : `${pitches.length} approved pitch${pitches.length !== 1 ? "es" : ""} from student founders`}
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-card border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pitches by title or tagline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl"
          />
        </div>

        {/* Stage filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[130px] h-10 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold">All Stages</SelectItem>
              <SelectItem value="IDEA" className="font-bold">Idea</SelectItem>
              <SelectItem value="MVP" className="font-bold">MVP</SelectItem>
              <SelectItem value="REVENUE" className="font-bold">Revenue</SelectItem>
              <SelectItem value="GROWTH" className="font-bold">Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-muted-foreground hidden sm:block">Sort:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-10 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="font-bold">Newest First</SelectItem>
              <SelectItem value="oldest" className="font-bold">Oldest First</SelectItem>
              <SelectItem value="views" className="font-bold">Most Viewed</SelectItem>
              <SelectItem value="title" className="font-bold">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={loadAll}
          className="border-2 border-foreground/20 rounded-xl shrink-0"
          title="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-4 flex items-center gap-2">
          <p className="text-sm font-bold text-muted-foreground">
            Showing <span className="text-foreground">{filtered.length}</span> of {pitches.length} pitches
            {stageFilter !== "all" && ` · Stage: ${stageFilter}`}
            {searchQuery && ` · "${searchQuery}"`}
          </p>
          {(stageFilter !== "all" || searchQuery) && (
            <Button variant="ghost" size="sm" className="h-auto py-0 font-bold text-xs text-muted-foreground hover:text-foreground"
              onClick={() => { setSearchQuery(""); setStageFilter("all"); }}>
              Clear ×
            </Button>
          )}
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <Card className="p-12 text-center border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-semibold">Loading pitches from database...</p>
        </Card>
      ) : pitches.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-foreground/30 rounded-2xl bg-card/50">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--pastel-blue))]/20 border-2 border-foreground/10">
            <FileText className="h-7 w-7 text-foreground/40" />
          </div>
          <h4 className="font-display font-extrabold text-xl text-foreground mb-2">No pitches yet</h4>
          <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">
            Student founders are working on their pitches. Check back soon!
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center border-2 border-dashed border-foreground/30 rounded-2xl bg-card/50">
          <Search className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <h4 className="font-display font-extrabold text-lg text-foreground mb-2">No pitches match your filters</h4>
          <p className="text-muted-foreground font-medium text-sm">Try adjusting your search or stage filter.</p>
          <Button variant="ghost" size="sm" className="mt-4 font-bold"
            onClick={() => { setSearchQuery(""); setStageFilter("all"); }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((pitch) => (
            <Card
              key={pitch.id}
              className="flex flex-col p-0 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
            >
              {/* Card Header */}
              <div className="p-5 border-b-2 border-foreground/10 bg-muted/20 relative">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {pitch.stage && (
                    <Badge className={cn("border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs", stageColors[pitch.stage] ?? "bg-muted text-foreground")}>
                      {pitch.stage}
                    </Badge>
                  )}
                  {pitch.funding_ask && (
                    <Badge variant="outline" className="border-foreground/30 font-bold text-xs">
                      Ask: {pitch.funding_ask}
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-extrabold text-xl leading-tight mb-2">{pitch.title}</h3>
                {pitch.one_liner && (
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2 italic">
                    "{pitch.one_liner}"
                  </p>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 bg-card space-y-3">
                {pitch.traction && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-extrabold mb-1">Traction</p>
                    <p className="text-sm font-bold text-foreground">{pitch.traction}</p>
                  </div>
                )}
                {pitch.market_size && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-extrabold mb-1">Market Size</p>
                    <p className="text-sm font-bold text-foreground">{pitch.market_size}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 text-xs font-bold text-muted-foreground border-t border-foreground/5">
                  <span>{pitch.view_count} views</span>
                  <span>·</span>
                  <span>{new Date(pitch.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 border-t-2 border-foreground/10 bg-muted/10 flex gap-2">
                <Button asChild size="sm" className="flex-1 border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                  <Link to={`/pitches/${pitch.id}`}>View Pitch</Link>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={bookmarkingId === pitch.id}
                  onClick={() => handleBookmark(pitch.id)}
                  title={bookmarkedIds.has(pitch.id) ? "Remove bookmark" : "Bookmark"}
                  className={cn(
                    "border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl transition-all",
                    bookmarkedIds.has(pitch.id)
                      ? "bg-[hsl(var(--pastel-pink))] text-foreground hover:bg-destructive hover:text-destructive-foreground"
                      : "bg-background hover:bg-[hsl(var(--pastel-pink))] hover:text-foreground"
                  )}
                >
                  {bookmarkedIds.has(pitch.id)
                    ? <BookmarkCheck className="h-4 w-4" />
                    : <Bookmark className="h-4 w-4" />
                  }
                </Button>
                <Button asChild size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl bg-background hover:bg-[hsl(var(--pastel-mint))] hover:text-foreground transition-all">
                  <Link to="/messages">
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}