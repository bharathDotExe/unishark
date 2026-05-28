import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare, Heart, Repeat2, Share, Bookmark, ThumbsUp, ExternalLink,
  TrendingUp, Briefcase, BarChart3, ArrowUpRight, CheckCircle2, FileText,
  RefreshCw
} from "lucide-react";
import { SharkIdenticon } from "@/components/ui/SharkIdenticon";

// ── STATIC EDITORIAL DATA ────────────────────────────────────────────────────

const youtubeVideos = [
  {
    id: "yt1",
    embedId: "gDQOWOhtPXY",
    title: "How to Value a Startup (Detailed Guide)",
    channel: "Y Combinator",
    views: "1.2M views",
    duration: "22 min",
  },
  {
    id: "yt2",
    embedId: "5w3EUQh1mXQ",
    title: "Angel Investing: Due Diligence Checklist",
    channel: "Venture School",
    views: "450K views",
    duration: "18 min",
  },
  {
    id: "yt3",
    embedId: "WsKPGIBbQgM",
    title: "How Venture Capital Works",
    channel: "WSJ",
    views: "3.1M views",
    duration: "15 min",
  },
  {
    id: "yt4",
    embedId: "BqMGBGUFwXk",
    title: "What Investors Look For in a Startup",
    channel: "Stanford eCorner",
    views: "890K views",
    duration: "12 min",
  },
];

const twitterPosts = [
  {
    id: "tw1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Naval",
    name: "Naval Ravikant",
    handle: "@naval",
    time: "2h",
    content:
      "The best founders don't ask for permission. They just build.\n\nWhen evaluating a seed stage startup, look for speed of execution over a polished pitch deck.\n\nTraction is the only truth.",
    replies: 142,
    retweets: 3200,
    likes: 12800,
  },
  {
    id: "tw2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PaulGraham",
    name: "Paul Graham",
    handle: "@paulg",
    time: "5h",
    content:
      "The most important quality in a startup founder is determination, not intelligence.\n\nSmart people who quit don't build companies. Determined people who aren't the smartest often do.",
    replies: 88,
    retweets: 4500,
    likes: 21000,
  },
  {
    id: "tw3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark",
    name: "Mark Suster",
    handle: "@msuster",
    time: "1d",
    content:
      "Thread: Red flags I watch for when an investor pitches me.\n\n1. Can't explain why they left their last job\n2. No customer references\n3. Unwilling to talk about failures\n4. Doesn't know their unit economics",
    replies: 64,
    retweets: 890,
    likes: 3400,
  },
];

const linkedinPosts = [
  {
    id: "li1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    name: "Sarah Chen-Spellings",
    title: "Managing Partner at Beyond Ventures",
    time: "2d",
    content:
      "We just closed our latest fund. I get asked what metrics matter for Series A SaaS right now.\n\nHere is our checklist:\n\n- Net Revenue Retention > 110%\n- CAC Payback < 12 months\n- Gross Margin > 75%\n\nFounders, don't focus solely on top-line growth. Efficiency is the new growth. Burn less, retain more.",
    likes: 1402,
    comments: 124,
    reposts: 34,
  },
  {
    id: "li2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anand",
    name: "Anand Sanwal",
    title: "CEO & Co-Founder at CB Insights",
    time: "3d",
    content:
      "EdTech in India is having a massive renaissance after the BYJU's meltdown.\n\nNew metrics I am tracking in the sector:\n\n1. Cost per learning outcome (not cost per student)\n2. Completion rate over enrollment rate\n3. Post-completion salary lift for B2C products\n\nFounders building in this space: message me.",
    likes: 2810,
    comments: 340,
    reposts: 91,
  },
];

const instagramPosts = [
  {
    id: "ig1",
    handle: "startup_investing_tips",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=StartupTips",
    bgColor: "bg-[hsl(var(--pastel-pink))]",
    quote: "It's not about how much you raise. It's about how little you burn.",
    likes: 4231,
    caption: "Keep burn rates low. Market conditions change fast. #StartupLife #VentureCapital",
  },
  {
    id: "ig2",
    handle: "investorinsights_india",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=InvestorIndia",
    bgColor: "bg-[hsl(var(--pastel-blue))]",
    quote: "The best investment you can make is in a founder who has already failed once.",
    likes: 6102,
    caption: "Second-time founders have a 30% higher success rate. #AngelInvesting",
  },
];

// ── TYPES ─────────────────────────────────────────────────────────────────────

type Pitch = {
  id: string;
  title: string;
  one_liner: string | null;
  stage: string | null;
  funding_ask: string | null;
  traction: string | null;
  created_at: string;
};

// ── COMPONENTS ────────────────────────────────────────────────────────────────

function YTCard({ video }: { video: typeof youtubeVideos[0] }) {
  return (
    <Card className="p-0 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden flex flex-col">
      <div className="aspect-video border-b-2 border-foreground">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${video.embedId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="p-4 flex flex-col gap-1">
        <Badge className="self-start mb-1 bg-red-100 text-red-700 border-red-400 font-bold text-[10px] rounded-sm">
          YouTube
        </Badge>
        <h4 className="font-extrabold text-base leading-snug">{video.title}</h4>
        <div className="flex gap-2 text-xs font-bold text-muted-foreground mt-1">
          <span>{video.channel}</span>
          <span>•</span>
          <span>{video.views}</span>
          <span>•</span>
          <span>{video.duration}</span>
        </div>
      </div>
    </Card>
  );
}

function TwitterCard({ post }: { post: typeof twitterPosts[0] }) {
  const formatNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <Card className="p-5 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-foreground overflow-hidden bg-muted">
            <SharkIdenticon seed={post.name} role="investor" size={40} className="w-full h-full rounded-none" />
          </div>
          <div>
            <p className="font-extrabold text-sm leading-none">{post.name}</p>
            <p className="text-xs font-bold text-muted-foreground">{post.handle} · {post.time}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-[#1DA1F2] text-[#1DA1F2]">
          X / Twitter
        </Badge>
      </div>

      <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">{post.content}</p>

      <div className="flex justify-between items-center pt-3 border-t-2 border-foreground/10 text-xs font-bold text-muted-foreground">
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <MessageSquare className="w-4 h-4" /> {formatNum(post.replies)}
        </button>
        <button className="flex items-center gap-1.5 hover:text-success transition-colors">
          <Repeat2 className="w-4 h-4" /> {formatNum(post.retweets)}
        </button>
        <button className="flex items-center gap-1.5 hover:text-destructive transition-colors text-destructive">
          <Heart className="w-4 h-4 fill-destructive" /> {formatNum(post.likes)}
        </button>
        <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
          <Share className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

function LinkedInCard({ post }: { post: typeof linkedinPosts[0] }) {
  const formatNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <Card className="p-5 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-sm border-2 border-foreground overflow-hidden bg-muted flex items-center justify-center">
            <SharkIdenticon seed={post.name} role="mentor" size={48} className="w-full h-full rounded-none" />
          </div>
          <div>
            <p className="font-extrabold text-sm leading-none">{post.name}</p>
            <p className="text-[11px] font-semibold text-muted-foreground leading-tight mt-0.5">{post.title}</p>
            <p className="text-[10px] font-bold text-muted-foreground">{post.time} · Edited</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-[#0A66C2] text-[#0A66C2] shrink-0">
          LinkedIn
        </Badge>
      </div>

      <p className="text-sm font-semibold leading-relaxed whitespace-pre-line">{post.content}</p>

      <div className="flex items-center justify-between pt-3 border-t-2 border-foreground/10 text-xs font-bold text-muted-foreground">
        <div className="flex items-center gap-1.5 text-[#0A66C2]">
          <ThumbsUp className="w-4 h-4 fill-[#0A66C2]" />
          <span>{formatNum(post.likes)}</span>
        </div>
        <div className="flex gap-4">
          <button className="hover:text-foreground">{post.comments} comments</button>
          <button className="hover:text-foreground">{post.reposts} reposts</button>
        </div>
      </div>
    </Card>
  );
}

function InstagramCard({ post }: { post: typeof instagramPosts[0] }) {
  return (
    <Card className="p-0 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden flex flex-col">
      <div className="p-3 flex items-center justify-between border-b-2 border-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] border border-foreground">
            <div className="w-full h-full bg-background rounded-full overflow-hidden">
              <SharkIdenticon seed={post.handle} role="student" size={32} className="w-full h-full rounded-none" />
            </div>
          </div>
          <span className="text-xs font-extrabold">{post.handle}</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-[#E1306C] text-[#E1306C]">
          Instagram
        </Badge>
      </div>

      <div className={`${post.bgColor} flex items-center justify-center p-8 text-center border-b-2 border-foreground min-h-[160px]`}>
        <h3 className="font-display font-black text-xl uppercase tracking-tight text-foreground leading-tight">
          "{post.quote}"
        </h3>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-2">
          <Heart className="w-5 h-5 cursor-pointer hover:fill-destructive hover:text-destructive transition-colors" />
          <MessageSquare className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
          <Share className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
          <Bookmark className="w-5 h-5 ml-auto cursor-pointer hover:fill-foreground transition-colors" />
        </div>
        <p className="text-xs font-extrabold mb-1">{post.likes.toLocaleString()} likes</p>
        <p className="text-xs font-semibold text-muted-foreground">
          <span className="font-extrabold text-foreground mr-1">{post.handle}</span>
          {post.caption}
        </p>
      </div>
    </Card>
  );
}

function PitchCard({ pitch }: { pitch: Pitch }) {
  return (
    <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] bg-card">
      <div className="flex justify-between items-start mb-3">
        <Badge className="font-bold shadow-[1px_1px_0_0_hsl(var(--foreground))] border-foreground text-xs bg-foreground text-background">
          New
        </Badge>
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase">
          {new Date(pitch.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>

      <h4 className="font-display font-extrabold text-xl leading-tight mb-1">{pitch.title}</h4>
      <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b-2 border-foreground/10">
        {pitch.stage && (
          <Badge variant="outline" className="text-[10px] font-bold border-foreground/30">{pitch.stage}</Badge>
        )}
        {pitch.funding_ask && (
          <Badge variant="outline" className="text-[10px] font-bold border-foreground/30">Ask: {pitch.funding_ask}</Badge>
        )}
      </div>

      {pitch.one_liner && (
        <p className="text-xs font-semibold text-muted-foreground italic mb-4 line-clamp-2">"{pitch.one_liner}"</p>
      )}

      <div className="flex gap-2">
        <Button asChild size="sm" className="flex-1 border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-lg text-xs h-8">
          <Link to={`/pitches/${pitch.id}`}>View Pitch</Link>
        </Button>
        <Button size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-lg h-8 w-8 shrink-0">
          <Bookmark className="h-3.5 w-3.5" />
        </Button>
        <Button asChild size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-lg h-8 w-8 shrink-0">
          <Link to="/messages">
            <MessageSquare className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────────────────

export default function InvestorHome() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "youtube" | "twitter" | "linkedin" | "instagram">("all");

  // Real DB data
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newPitchesToday, setNewPitchesToday] = useState(0);
  const [loadingPitches, setLoadingPitches] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Load profile name
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setFullName(data.full_name);
      });

    // Load approved pitches for deal flow
    const loadPitches = async () => {
      setLoadingPitches(true);
      try {
        const { data } = await supabase
          .from("pitches")
          .select("id, title, one_liner, stage, funding_ask, traction, created_at")
          .eq("status", "APPROVED")
          .order("created_at", { ascending: false })
          .limit(10);

        const all = data ?? [];
        setPitches(all);

        // Count pitches created in last 24 hours
        const yesterday = new Date(Date.now() - 86400000).toISOString();
        setNewPitchesToday(all.filter(p => p.created_at >= yesterday).length);
      } finally {
        setLoadingPitches(false);
      }
    };

    // Load unread message count
    const loadUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("read", false);
      setUnreadCount(count ?? 0);
    };

    loadPitches();
    loadUnread();
  }, [user]);

  const getFirstName = () => {
    if (fullName) return fullName.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "Investor";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px] pb-24">

      {/* WELCOME BANNER */}
      <Card className="p-8 border-2 border-foreground bg-[hsl(var(--pastel-blue))] shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] mb-10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 opacity-10 pointer-events-none">
          <TrendingUp className="w-56 h-56" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight mb-1">
            Welcome back, {getFirstName()}!
          </h1>
          <p className="text-foreground/80 font-semibold text-base mb-6">
            Your daily feed — investment education, market signals, and fresh pitches.
          </p>

          {/* Quick Stats Row — real data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Active Deals", value: "—", icon: Briefcase, delta: "No deals yet" },
              { label: "New Pitches Today", value: newPitchesToday.toString(), icon: BarChart3, delta: "Approved" },
              { label: "Total Pitches", value: pitches.length.toString(), icon: FileText, delta: "Browseable" },
              { label: "Unread Messages", value: unreadCount.toString(), icon: MessageSquare, delta: "Founders" },
            ].map((s) => (
              <div key={s.label} className="bg-background/60 border-2 border-foreground rounded-xl p-3 shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-[10px] font-bold text-success">{s.delta}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-xl font-extrabold">
              <a href="#dealflow">Browse New Pitches</a>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background rounded-xl font-extrabold">
              <Link to="/bookmarks">My Bookmarks</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background rounded-xl font-extrabold">
              <Link to="/messages">Messages {unreadCount > 0 && `(${unreadCount})`}</Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* ── LEFT + CENTER: FEED ── */}
        <div className="xl:col-span-2 space-y-8">

          {/* Feed Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b-2 border-foreground/10 pb-4">
            <span className="text-sm font-extrabold text-foreground uppercase tracking-wider mr-2 self-center">Feed:</span>
            {[
              { key: "all", label: "All" },
              { key: "youtube", label: "YouTube" },
              { key: "twitter", label: "X / Twitter" },
              { key: "linkedin", label: "LinkedIn" },
              { key: "instagram", label: "Instagram" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`text-xs font-extrabold px-4 py-1.5 rounded-lg border-2 border-foreground transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] ${
                  activeTab === t.key
                    ? "bg-foreground text-background translate-x-[-1px] translate-y-[-1px]"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* YOUTUBE SECTION */}
          {(activeTab === "all" || activeTab === "youtube") && (
            <section>
              <h3 className="text-xl font-display font-extrabold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-destructive rounded-full inline-block" />
                YouTube — Investment Education
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {youtubeVideos.map((v) => <YTCard key={v.id} video={v} />)}
              </div>
            </section>
          )}

          {/* TWITTER SECTION */}
          {(activeTab === "all" || activeTab === "twitter") && (
            <section>
              <h3 className="text-xl font-display font-extrabold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#1DA1F2] rounded-full inline-block" />
                X / Twitter — Investor Insights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {twitterPosts.map((p) => <TwitterCard key={p.id} post={p} />)}
              </div>
            </section>
          )}

          {/* LINKEDIN SECTION */}
          {(activeTab === "all" || activeTab === "linkedin") && (
            <section>
              <h3 className="text-xl font-display font-extrabold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#0A66C2] rounded-full inline-block" />
                LinkedIn — Market Signals
              </h3>
              <div className="grid grid-cols-1 gap-5">
                {linkedinPosts.map((p) => <LinkedInCard key={p.id} post={p} />)}
              </div>
            </section>
          )}

          {/* INSTAGRAM SECTION */}
          {(activeTab === "all" || activeTab === "instagram") && (
            <section>
              <h3 className="text-xl font-display font-extrabold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#E1306C] rounded-full inline-block" />
                Instagram — Founder Wisdom
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {instagramPosts.map((p) => <InstagramCard key={p.id} post={p} />)}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT: DEAL FLOW (real DB data) ── */}
        <div className="space-y-5" id="dealflow">
          <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
            <h3 className="text-xl font-display font-extrabold text-foreground uppercase tracking-tight">
              Deal Flow
              <span className="text-xs font-bold text-muted-foreground ml-2 lowercase normal-case tracking-normal">
                ({pitches.length} pitches)
              </span>
            </h3>
            <Button asChild variant="ghost" size="sm" className="text-xs font-extrabold underline">
              <Link to="/pitches">View All <ArrowUpRight className="h-3 w-3 inline ml-1" /></Link>
            </Button>
          </div>

          {loadingPitches ? (
            <Card className="p-8 text-center border-2 border-foreground/20 rounded-2xl">
              <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">Loading pitches...</p>
            </Card>
          ) : pitches.length === 0 ? (
            <Card className="p-8 text-center border-2 border-dashed border-foreground/20 rounded-2xl">
              <FileText className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground mb-1">No approved pitches yet</p>
              <p className="text-xs text-muted-foreground/70 font-medium">Student founders are submitting. Check back soon!</p>
              <Button asChild variant="outline" size="sm" className="mt-4 border-2 border-foreground font-bold rounded-xl">
                <Link to="/pitches">Browse All Pitches</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {pitches.map((p) => <PitchCard key={p.id} pitch={p} />)}
            </div>
          )}

          <Button asChild variant="outline" className="w-full border-2 border-foreground border-dashed bg-background hover:bg-muted font-extrabold rounded-xl py-5 text-sm">
            <Link to="/pitches">Browse All Pitches</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
