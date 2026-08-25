import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkCheck, ArrowUpRight, Eye, MessageSquare, RefreshCw, Search, TrendingUp } from "lucide-react";
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

const stages = ["all", "IDEA", "MVP", "REVENUE", "GROWTH"];
const serif = { fontFamily: '"Fraunces", "Times New Roman", serif' } as const;

export default function BrowsePitches() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => { loadAll(); }, [user]);

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
    if (!user) { toast.error("Please log in to bookmark pitches"); return; }
    setBookmarkingId(pitchId);
    try {
      if (bookmarkedIds.has(pitchId)) {
        const { error } = await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("pitch_id", pitchId);
        if (error) throw error;
        setBookmarkedIds((prev) => { const next = new Set(prev); next.delete(pitchId); return next; });
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
      try { return JSON.parse(value).funding_ask || "—"; } catch { return value; }
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

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const Stage = ({ stage }: { stage: string | null }) => stage ? (
    <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-stone-600">{stage}</span>
  ) : null;

  const BookmarkBtn = ({ id }: { id: string }) => {
    const bookmarked = bookmarkedIds.has(id);
    return (
      <button
        onClick={(e) => { e.preventDefault(); handleBookmark(id); }}
        disabled={bookmarkingId === id}
        className="text-stone-500 hover:text-stone-900 transition-colors"
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
      >
        {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F3EE", color: "#0D0D0D" }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 lg:px-14 py-8 md:py-12 pb-24">

        {/* Masthead */}
        <header className="border-b border-stone-900/90 pb-6 mb-8">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-stone-600 mb-5 gap-4 flex-wrap">
            <span>Vol. 01 · The Deal Flow Edition</span>
            <span className="hidden sm:inline">{today}</span>
            <span>{pitches.length} approved pitches</span>
          </div>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <h1 style={serif} className="text-[44px] md:text-[72px] lg:text-[88px] leading-[0.92] tracking-tight font-light text-stone-900">
              The <em className="italic font-normal">Pitch</em> Review.
            </h1>
            <div className="hidden md:block text-right max-w-xs">
              <p className="text-[13px] leading-snug text-stone-700">A curated reading room of student-founder ventures vetted for serious capital.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-stone-300 pt-4 flex-wrap">
            <nav className="flex items-center gap-5 text-[12px] uppercase tracking-[0.18em] font-medium">
              {stages.map((s) => (
                <button key={s} onClick={() => setStageFilter(s)} className={cn("py-1 border-b-2 transition-colors", stageFilter === s ? "border-stone-900 text-stone-900" : "border-transparent text-stone-500 hover:text-stone-900")}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-500" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search the issue…" className="pl-9 h-9 w-[220px] rounded-none border-0 border-b border-stone-400 bg-transparent focus-visible:ring-0 focus-visible:border-stone-900 text-[13px]" />
              </div>
              <Button variant="ghost" size="sm" onClick={loadAll} className="h-9 rounded-none text-stone-700 hover:bg-stone-200 text-[12px] uppercase tracking-wider">
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} /> Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Stat strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-300 border border-stone-300 mb-12">
          {[
            { l: "Approved", v: counts.total },
            { l: "MVP stage", v: counts.mvp },
            { l: "Revenue / Growth", v: counts.revenue },
            { l: "Cumulative reads", v: counts.views },
          ].map((s) => (
            <div key={s.l} className="bg-[#F5F3EE] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">{s.l}</p>
              <p style={serif} className="text-3xl font-light text-stone-900 tabular-nums">{s.v}</p>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="py-24 text-center text-stone-500 text-sm uppercase tracking-[0.2em]">Setting the type…</div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p style={serif} className="text-3xl text-stone-900 mb-3">No stories in this section.</p>
            <p className="text-sm text-stone-600 mb-5">Try clearing your filters to see every approved pitch.</p>
            <Button variant="outline" className="rounded-none border-stone-900" onClick={() => { setSearchQuery(""); setStageFilter("all"); }}>Reset filters</Button>
          </div>
        ) : (
          <>
            {featured && (
              <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 mb-12 border-b border-stone-300">
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="inline-block bg-stone-900 text-[#F5F3EE] text-[10px] uppercase tracking-[0.22em] font-semibold px-2.5 py-1">Cover story</span>
                    <Stage stage={featured.stage} />
                    <span className="text-[11px] text-stone-500 uppercase tracking-wider">{new Date(featured.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
                  </div>
                  <Link to={`/pitches/${featured.id}`} className="group block">
                    <h2 style={serif} className="text-[40px] md:text-[56px] lg:text-[68px] leading-[1.02] font-light tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                      {featured.title}
                    </h2>
                  </Link>
                  <p style={serif} className="mt-5 text-xl md:text-2xl leading-[1.4] text-stone-700 italic font-light max-w-2xl">
                    {featured.one_liner || "An unwritten lede — read the full pitch inside."}
                  </p>
                  <div className="mt-7 flex items-center gap-6 flex-wrap">
                    <Button asChild className="rounded-none bg-stone-900 hover:bg-stone-700 text-[#F5F3EE] h-11 px-6 text-[12px] uppercase tracking-[0.18em]">
                      <Link to={`/pitches/${featured.id}`}>Read the pitch <ArrowUpRight className="h-3.5 w-3.5 ml-2" /></Link>
                    </Button>
                    <div className="flex items-center gap-4 text-[12px] text-stone-600">
                      <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {featured.view_count || 0} reads</span>
                      <BookmarkBtn id={featured.id} />
                    </div>
                  </div>
                </div>
                <aside className="lg:col-span-5 lg:border-l lg:border-stone-300 lg:pl-12">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500 mb-4">In this pitch</p>
                  <dl className="space-y-5">
                    <div className="flex justify-between items-baseline gap-4 border-b border-stone-200 pb-3">
                      <dt className="text-[11px] uppercase tracking-wider text-stone-500">Funding ask</dt>
                      <dd style={serif} className="text-2xl text-stone-900 font-light">{parseAsk(featured.funding_ask)}</dd>
                    </div>
                    <div className="border-b border-stone-200 pb-3">
                      <dt className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Traction</dt>
                      <dd className="text-sm text-stone-800 leading-relaxed line-clamp-3">{featured.traction || "Traction not yet disclosed."}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Market size</dt>
                      <dd className="text-sm text-stone-800 leading-relaxed line-clamp-3">{featured.market_size || "Not disclosed."}</dd>
                    </div>
                  </dl>
                </aside>
              </article>
            )}

            <div className="flex items-end justify-between border-b-2 border-stone-900 pb-2 mb-8 gap-4 flex-wrap">
              <h3 style={serif} className="text-3xl md:text-4xl font-light text-stone-900">More from the issue</h3>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-stone-600">
                <span>Sort</span>
                {[
                  { v: "newest", l: "Newest" },
                  { v: "views", l: "Most read" },
                  { v: "title", l: "A–Z" },
                ].map((s) => (
                  <button key={s.v} onClick={() => setSortBy(s.v)} className={cn("transition-colors", sortBy === s.v ? "text-stone-900 underline underline-offset-4" : "hover:text-stone-900")}>{s.l}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
              {rest.map((p) => (
                <article key={p.id} className="group flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Stage stage={p.stage} />
                      <span className="text-[11px] text-stone-400">·</span>
                      <span className="text-[11px] uppercase tracking-wider text-stone-500">{new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                    <BookmarkBtn id={p.id} />
                  </div>
                  <Link to={`/pitches/${p.id}`} className="group/title">
                    <h4 style={serif} className="text-[26px] leading-[1.1] font-normal text-stone-900 group-hover/title:text-stone-600 transition-colors">
                      {p.title}
                    </h4>
                  </Link>
                  <p className="mt-3 text-[14px] leading-[1.55] text-stone-700 line-clamp-3 flex-1">
                    {p.one_liner || "No summary provided for this pitch."}
                  </p>
                  <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between text-[12px] text-stone-600">
                    <div className="flex items-center gap-4">
                      <span style={serif} className="text-stone-900 font-medium">{parseAsk(p.funding_ask)}</span>
                      <span className="flex items-center gap-1 text-stone-500"><Eye className="h-3 w-3" /> {p.view_count || 0}</span>
                    </div>
                    <Link to={`/pitches/${p.id}`} className="inline-flex items-center gap-1 uppercase tracking-[0.18em] text-[11px] font-semibold text-stone-900 hover:gap-2 transition-all">
                      Read <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <footer className="mt-20 pt-8 border-t border-stone-900/80 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-stone-500 gap-4 flex-wrap">
              <span>The Pitch Review · UniShark</span>
              <span className="flex items-center gap-2"><TrendingUp className="h-3 w-3" /> Updated continuously</span>
              <Link to="/messages" className="flex items-center gap-1.5 hover:text-stone-900"><MessageSquare className="h-3 w-3" /> Talk to founders</Link>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
