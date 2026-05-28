import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bookmark, LayoutGrid, List, Search,
  BookmarkMinus, ArrowRight, RefreshCw, FileText
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BookmarkedPitch = {
  bookmarkId: string;
  pitch: {
    id: string;
    title: string;
    one_liner: string | null;
    stage: string | null;
    funding_ask: string | null;
    traction: string | null;
    status: string;
    created_at: string;
  };
  savedAt: string;
};

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedPitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [stageFilter, setStageFilter] = useState("all");

  const loadBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          id,
          created_at,
          pitch_id,
          pitches (
            id,
            title,
            one_liner,
            stage,
            funding_ask,
            traction,
            status,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: BookmarkedPitch[] = (data ?? [])
        .filter((b: any) => b.pitches)
        .map((b: any) => ({
          bookmarkId: b.id,
          pitch: b.pitches,
          savedAt: b.created_at,
        }));

      setBookmarks(mapped);
    } catch (e: unknown) {
      toast.error("Failed to load bookmarks: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    setRemovingId(bookmarkId);
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId);

      if (error) throw error;
      toast.success("Bookmark removed");
      setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== bookmarkId));
    } catch (e: unknown) {
      toast.error("Failed to remove bookmark: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setRemovingId(null);
    }
  };

  // Client-side filter & sort
  const filtered = bookmarks
    .filter((b) => {
      const matchesSearch =
        !searchQuery ||
        b.pitch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.pitch.one_liner ?? "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage =
        stageFilter === "all" || (b.pitch.stage ?? "").toLowerCase() === stageFilter.toLowerCase();

      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      if (sortBy === "title") return a.pitch.title.localeCompare(b.pitch.title);
      return 0;
    });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">

      {/* HEADER */}
      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-foreground" /> Saved Pitches
        </h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1 pl-11">
          {loading ? "Loading..." : `${bookmarks.length} bookmark${bookmarks.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* FILTER & SORT TOOLBAR */}
      <div className="bg-card border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-muted-foreground uppercase">Stage:</span>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[130px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <SelectValue placeholder="All" />
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

          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-muted-foreground uppercase ml-2 md:ml-4">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent" className="font-bold">Most Recent</SelectItem>
                <SelectItem value="title" className="font-bold">Title (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <Card className="p-12 text-center border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-semibold">Loading your saved pitches...</p>
        </Card>
      ) : bookmarks.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-foreground/30 rounded-2xl bg-card/50">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--pastel-blue))]/20 border-2 border-foreground/10">
            <Bookmark className="h-7 w-7 text-foreground/40" />
          </div>
          <h4 className="font-display font-extrabold text-xl text-foreground mb-2">No saved pitches yet</h4>
          <p className="text-muted-foreground font-medium text-sm mb-6 max-w-xs mx-auto">
            Browse pitches and bookmark the ones you're interested in to track them here.
          </p>
          <Button asChild className="border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-xl font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
            <Link to="/pitches">
              <FileText className="mr-2 h-4 w-4" /> Browse Pitches
            </Link>
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center border-2 border-dashed border-foreground/30 rounded-2xl bg-card/50">
          <Search className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <h4 className="font-display font-extrabold text-lg text-foreground mb-2">No results found</h4>
          <p className="text-muted-foreground font-medium text-sm">Try adjusting your search or filters.</p>
          <Button variant="ghost" size="sm" className="mt-4 font-bold" onClick={() => { setSearchQuery(""); setStageFilter("all"); }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {filtered.map((bookmark) => (
            <Card
              key={bookmark.bookmarkId}
              className="border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_hsl(var(--foreground))]"
            >
              {/* Top Row: Title & Status */}
              <div className="bg-muted/10 border-b-2 border-foreground/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-extrabold text-2xl text-foreground mb-2">
                    {bookmark.pitch.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {bookmark.pitch.stage && (
                      <Badge variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background">
                        {bookmark.pitch.stage}
                      </Badge>
                    )}
                    {bookmark.pitch.funding_ask && (
                      <Badge variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-[hsl(var(--pastel-blue))] text-foreground">
                        Ask: {bookmark.pitch.funding_ask}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge className={cn(
                  "border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs uppercase px-3 py-1 whitespace-nowrap",
                  bookmark.pitch.status === "APPROVED"
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {bookmark.pitch.status}
                </Badge>
              </div>

              {/* Middle Section */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {bookmark.pitch.one_liner && (
                    <p className="text-sm font-semibold text-foreground/80 italic">
                      "{bookmark.pitch.one_liner}"
                    </p>
                  )}
                  {bookmark.pitch.traction && (
                    <div>
                      <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Traction: </span>
                      <span className="text-sm font-bold text-foreground">{bookmark.pitch.traction}</span>
                    </div>
                  )}
                  <div className="text-xs font-semibold text-muted-foreground space-y-1">
                    <p>Saved: {formatDate(bookmark.savedAt)}</p>
                    <p>Pitch submitted: {formatDate(bookmark.pitch.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4">
                  <div className="bg-muted/20 border-2 border-foreground/10 p-4 rounded-xl">
                    <p className="text-xs font-extrabold uppercase text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-bold text-foreground">
                      {bookmark.pitch.status === "APPROVED"
                        ? "✅ Visible to investors — pitch is live"
                        : "This pitch is currently under review"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="bg-muted/30 border-t-2 border-foreground/10 p-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                  <Link to={`/pitches/${bookmark.pitch.id}`}>
                    View Full Pitch <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-[hsl(var(--pastel-mint))] rounded-xl transition-all">
                  <Link to="/messages">Message Founder</Link>
                </Button>
                <div className="flex-1 min-w-[20px]" />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={removingId === bookmark.bookmarkId}
                  onClick={() => handleRemoveBookmark(bookmark.bookmarkId)}
                  className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all"
                >
                  <BookmarkMinus className="h-3 w-3 mr-1" />
                  {removingId === bookmark.bookmarkId ? "Removing..." : "Remove"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
