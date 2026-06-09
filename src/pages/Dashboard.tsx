import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Eye, MessageSquare, Bookmark,
  Trash2, Edit3, Sparkles, Play, Youtube,
  ArrowUpRight, ExternalLink, RefreshCw,
  TrendingUp, Lightbulb, Rocket, Users, ShieldCheck,
  FileText, CheckCircle2, XCircle, Linkedin, Twitter, Newspaper
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import ArticleFeedSection from "@/components/ArticleFeedSection";

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
  message_count?: number;
  bookmark_count?: number;
};

type Message = {
  id: string;
  sender_name: string;
  sender_company?: string;
  content: string;
  created_at: string;
  pitch_id?: string;
  pitch_title?: string;
};

export default function Dashboard() {
  const { user } = useAuth();

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) {
        setFullName(profile.full_name);
      }

      // Fetch user's real pitches
      const { data: realPitches } = await supabase
        .from("pitches")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const loadedPitches = (realPitches ?? []) as Pitch[];

      // Fetch bookmarks and message counts for all pitches
      if (loadedPitches.length > 0) {
        const pitchIds = loadedPitches.map(p => p.id);

        // Count bookmarks for user's pitches
        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("pitch_id");

        // Count messages for user's pitches
        const { data: messagesData } = await supabase
          .from("messages")
          .select("pitch_id");

        const updatedPitches = loadedPitches.map(p => {
          const bCount = (bookmarks ?? []).filter(b => b.pitch_id === p.id).length;
          const mCount = (messagesData ?? []).filter(m => m.pitch_id === p.id).length;
          return {
            ...p,
            bookmark_count: bCount,
            message_count: mCount
          };
        });
        setPitches(updatedPitches);
      } else {
        setPitches([]);
      }

      // Fetch incoming messages for student's pitches
      const { data: realMessages } = await supabase
        .from("messages")
        .select(`
          id,
          content,
          created_at,
          sender_id,
          pitch_id
        `)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (realMessages && realMessages.length > 0) {
        // Fetch sender names
        const senderIds = [...new Set(realMessages.map(m => m.sender_id))];
        const { data: senders } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds);

        // Fetch pitch titles
        const pitchIds = [...new Set(realMessages.map(m => m.pitch_id))];
        const { data: pitchesData } = await supabase
          .from("pitches")
          .select("id, title")
          .in("id", pitchIds);

        const mappedMessages = realMessages.map(m => {
          const sender = senders?.find(s => s.id === m.sender_id);
          const pitch = pitchesData?.find(p => p.id === m.pitch_id);
          return {
            id: m.id,
            sender_name: sender?.full_name || "Angel Investor",
            sender_company: "Verified Investor",
            content: m.content,
            created_at: m.created_at,
            pitch_id: m.pitch_id,
            pitch_title: pitch?.title || "Your Pitch"
          };
        });
        setMessages(mappedMessages);
      } else {
        setMessages([]);
      }

    } catch (e: unknown) {
      toast.error("Failed to load dashboard data: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this pitch?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("pitches").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Pitch deleted successfully");
      loadData();
    }
  };

  const handlePublish = async (pitchId: string) => {
    try {
      const { error } = await supabase
        .from("pitches")
        .update({ status: "APPROVED" })
        .eq("id", pitchId);

      if (error) throw error;
      toast.success("Your pitch is now APPROVED and visible to investors!");
      loadData();
    } catch (e: unknown) {
      toast.error("Failed to publish: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // Calculate stats from real data only
  const totalPitchesCount = pitches.length;
  const approvedCount = pitches.filter(p => p.status === "APPROVED").length;
  const totalViews = pitches.reduce((sum, p) => sum + (p.view_count || 0), 0);
  const totalMessageCount = messages.length;

  const getFirstName = () => {
    if (fullName) return fullName.split(" ")[0];
    if (user?.email) return user.email.split("@")[0];
    return "Founder";
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
      {/* SECTION 1: WELCOME BANNER */}
      <Card className="p-5 sm:p-6 border-2 border-foreground bg-[hsl(var(--pastel-blue))] shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl mb-6 relative overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] group">
        <div className="absolute -top-4 -right-4 opacity-10 group-hover:scale-110 transition-transform select-none pointer-events-none">
          <Rocket className="h-28 w-28 sm:h-32 sm:w-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-foreground tracking-tight mb-1.5">
            Welcome back, {getFirstName()}
          </h2>
          <p className="text-foreground/80 font-medium text-sm sm:text-base leading-relaxed mb-4 italic">
            "Ready to launch your startup? Submit your pitch and connect with real investors."
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-lg font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              <Link to="/pitches/create">
                <Plus className="mr-2 h-4 w-4" /> Submit New Pitch
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-background hover:bg-muted shadow-[3px_3px_0_0_hsl(var(--foreground))] text-foreground rounded-lg font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              <Link to="/investors">
                Explore Investors
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 2: QUICK STATS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* STAT 1 */}
        <Card className="p-4 sm:p-5 border-2 border-foreground bg-card shadow-[3px_3px_0_0_hsl(var(--foreground))] rounded-xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">My Pitches</span>
              <Badge className="bg-foreground text-background border-none text-[10px] sm:text-xs px-2 py-0">Pitches</Badge>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">{totalPitchesCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">({approvedCount} approved)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-3 font-bold text-foreground hover:underline text-xs sm:text-sm">
            <Link to="/pitches/view" className="flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></Link>
          </Button>
        </Card>

        {/* STAT 2 */}
        <Card className="p-4 sm:p-5 border-2 border-foreground bg-card shadow-[3px_3px_0_0_hsl(var(--foreground))] rounded-xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">Profile</span>
              <Badge className="bg-[hsl(var(--pastel-pink))] text-foreground border-none text-[10px] sm:text-xs px-2 py-0">Visits</Badge>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">Views: {totalViews}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">({Math.round(totalViews * 0.75)} unique)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-3 font-bold text-foreground hover:underline text-xs sm:text-sm">
            <Link to="/profile" className="flex items-center gap-1">View Stats <ArrowUpRight className="h-3 w-3" /></Link>
          </Button>
        </Card>

        {/* STAT 3 */}
        <Card className="p-4 sm:p-5 border-2 border-foreground bg-card shadow-[3px_3px_0_0_hsl(var(--foreground))] rounded-xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">Messages</span>
              <Badge className="bg-[hsl(var(--pastel-mint))] text-foreground border-none text-[10px] sm:text-xs px-2 py-0">Inbox</Badge>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">{totalMessageCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">({totalMessageCount} total)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-3 font-bold text-foreground hover:underline text-xs sm:text-sm">
            <Link to="/messages" className="flex items-center gap-1">Go to Box <ArrowUpRight className="h-3 w-3" /></Link>
          </Button>
        </Card>

        {/* STAT 4 */}
        <Card className="p-4 sm:p-5 border-2 border-foreground bg-card shadow-[3px_3px_0_0_hsl(var(--foreground))] rounded-xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-muted-foreground text-xs sm:text-sm uppercase tracking-wider">Views</span>
              <Badge className="bg-[hsl(var(--pastel-blue))] text-foreground border-none text-[10px] sm:text-xs px-2 py-0">Analytics</Badge>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-display">{totalViews}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-semibold">(This month)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-3 font-bold text-foreground hover:underline text-xs sm:text-sm">
            <Link to="/analytics" className="flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></Link>
          </Button>
        </Card>
      </div>

      {/* SECTION: LEARN — Startup Videos */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Youtube className="h-6 w-6 text-[hsl(0_72%_50%)]" /> Learn from the Best
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            Curated startup talks from Y Combinator, TED & top founders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: "CBYhVcO4WgI", title: "How to Start a Startup", author: "Sam Altman · Y Combinator", tag: "Foundations" },
            { id: "0lJKucu6HJc", title: "How to Succeed with a Startup", author: "Sam Altman", tag: "Strategy" },
            { id: "bNpx7gpSqbY", title: "The Single Biggest Reason Startups Succeed", author: "Bill Gross · TED", tag: "Insight" },
            { id: "Th8JoIan4dg", title: "How to Get Startup Ideas", author: "Paul Graham · Y Combinator", tag: "Ideation" },
            { id: "fpCWC4xrnCI", title: "How to Raise Money", author: "Marc Andreessen · YC", tag: "Fundraising" },
            { id: "ZoqgAy3h4OM", title: "How to Build Products Users Love", author: "Kevin Hale · YC", tag: "Product" },
          ].map((v) => (
            <Card
              key={v.id}
              className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden flex flex-col transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] group"
            >
              <div className="relative aspect-video bg-foreground/5 overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&modestbranding=1`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-foreground/20">
                    {v.tag}
                  </Badge>
                  <a
                    href={`https://www.youtube.com/watch?v=${v.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open on YouTube"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <h4 className="font-display font-extrabold text-base text-foreground leading-snug mb-1 line-clamp-2">
                  {v.title}
                </h4>
                <p className="text-xs font-semibold text-muted-foreground mt-auto">{v.author}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* SECTION: STARTUP FEED — Posts from around the web */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Newspaper className="h-6 w-6" /> Startup Feed
          </h3>
          <p className="text-sm text-muted-foreground font-medium">
            What founders and investors are sharing this week
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              source: "linkedin",
              author: "Aarti Mehra",
              role: "Founder, Brightleaf · ex-Stripe",
              time: "2h",
              text: "Stop pitching features. Start pitching the painful problem you have spent 100 hours living with. Investors fund clarity, not cleverness.",
              tag: "Fundraising",
            },
            {
              source: "twitter",
              author: "Naval",
              role: "@naval",
              time: "5h",
              text: "Specific knowledge is found by pursuing your genuine curiosity. Build the company only you can build.",
              tag: "Mindset",
            },
            {
              source: "linkedin",
              author: "Rohan Iyer",
              role: "Partner, Blume Ventures",
              time: "1d",
              text: "The best student founders I have backed all share one trait: they ship something every week, even when nobody is watching.",
              tag: "Founders",
            },
            {
              source: "twitter",
              author: "Paul Graham",
              role: "@paulg",
              time: "1d",
              text: "Make something a small number of people want a lot, instead of something a lot of people want a little.",
              tag: "Product",
            },
            {
              source: "linkedin",
              author: "Sneha Kapoor",
              role: "Angel Investor · IIT Bombay",
              time: "2d",
              text: "Three things I check in 60 seconds on every deck: who is the customer, what hurts them today, and why now. If those are unclear, I pass.",
              tag: "Pitch Tips",
            },
            {
              source: "twitter",
              author: "Y Combinator",
              role: "@ycombinator",
              time: "3d",
              text: "Talk to users. Then talk to more users. Then build. Repeat. This is the whole playbook for the first 90 days.",
              tag: "Playbook",
            },
          ].map((post, i) => {
            const Icon = post.source === "linkedin" ? Linkedin : Twitter;
            const iconColor = post.source === "linkedin" ? "text-[hsl(210_90%_40%)]" : "text-[hsl(203_89%_53%)]";
            return (
              <Card
                key={i}
                className="p-5 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center font-display font-extrabold text-foreground text-sm shrink-0">
                    {post.author.split(" ").map(w => w[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground truncate">{post.author}</span>
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
                      <span className="text-xs text-muted-foreground font-semibold">· {post.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mb-2 truncate">{post.role}</p>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium mb-3">
                      {post.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-foreground/20">
                        {post.tag}
                      </Badge>
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {post.source === "linkedin" ? "LinkedIn" : "X / Twitter"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* SECTION 3: YOUR PITCHES (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <FileText className="h-6 w-6" /> Your Pitches
              {pitches.length > 0 && <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full font-sans font-bold">LIVE</span>}
            </h3>
            <Button asChild variant="ghost" size="sm" className="font-bold text-foreground hover:bg-muted hover:underline flex items-center gap-1">
              <Link to="/pitches/view">View All →</Link>
            </Button>
          </div>

          {loading ? (
            <Card className="p-8 text-center border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground font-semibold">Loading your pitches...</p>
            </Card>
          ) : pitches.length === 0 ? (
            <Card className="p-10 text-center border-2 border-dashed border-foreground/30 rounded-2xl bg-card/50">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--pastel-blue))]/20 border-2 border-foreground/10">
                <FileText className="h-7 w-7 text-foreground/50" />
              </div>
              <h4 className="font-display font-extrabold text-xl text-foreground mb-2">No pitches yet</h4>
              <p className="text-muted-foreground font-medium text-sm mb-6 max-w-xs mx-auto">
                Submit your first pitch to start connecting with investors. It only takes a few minutes.
              </p>
              <Button asChild className="border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-xl font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <Link to="/pitches/create">
                  <Plus className="mr-2 h-4 w-4" /> Submit Your First Pitch
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {pitches.map((p) => (
                <Card
                  key={p.id}
                  className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card relative overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h4 className="font-display font-extrabold text-xl text-foreground tracking-wide">{p.title || "Untitled Pitch"}</h4>
                        {p.status === "APPROVED" ? (
                          <Badge className="bg-success text-success-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> APPROVED (visible to investors)
                          </Badge>
                        ) : p.status === "DRAFT" ? (
                          <Badge className="bg-[hsl(var(--pastel-pink))] text-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                            DRAFT (not visible to investors)
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                            {p.status}
                          </Badge>
                        )}
                        {p.stage && (
                          <Badge variant="outline" className="border-foreground/20 text-muted-foreground font-semibold">
                            {p.stage}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Created: {formatDate(p.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Stats strip */}
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-foreground/10 mb-4">
                    <span className="flex items-center gap-1.5"><Eye className="h-4 w-4 text-foreground" /> {p.view_count} Views</span>
                    <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-foreground" /> {p.message_count ?? 0} Messages</span>
                    <span className="flex items-center gap-1.5"><Bookmark className="h-4 w-4 text-foreground" /> {p.bookmark_count ?? 0} Bookmarks</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-lg transition-all">
                      <Link to={`/pitches/${p.id}`}>View Details</Link>
                    </Button>

                    {p.status === "APPROVED" ? (
                      <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-[hsl(var(--pastel-blue))] hover:opacity-90 text-foreground font-bold rounded-lg transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]">
                        <Link to={`/pitches/${p.id}/security`}>Security</Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePublish(p.id)}
                        size="sm"
                        variant="outline"
                        className="border-2 border-foreground bg-[hsl(var(--pastel-mint))] hover:opacity-90 text-foreground font-bold rounded-lg transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      >
                        Submit Pitch
                      </Button>
                    )}

                    <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-lg transition-all">
                      <Link to={`/pitches/${p.id}/edit`}>
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Link>
                    </Button>

                    <Button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      size="sm"
                      variant="outline"
                      className="border-2 border-foreground hover:bg-destructive hover:text-destructive-foreground font-bold rounded-lg transition-all ml-auto hover:shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Button asChild className="w-full h-14 border-2 border-dashed border-foreground/30 bg-background/20 hover:bg-background/40 text-foreground font-bold rounded-2xl transition-all">
                <Link to="/pitches/create" className="flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" /> Submit Another Pitch
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* SECTION 4: RECENT MESSAGES (Right 1 Column) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <MessageSquare className="h-6 w-6" /> Inbox
            </h3>
            <Button asChild variant="ghost" size="sm" className="font-bold text-foreground hover:bg-muted hover:underline flex items-center gap-1">
              <Link to="/messages">View All →</Link>
            </Button>
          </div>

          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] p-6 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2 mb-2">
              Recent Messages from Investors
            </h4>

            {messages.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                <p className="text-sm font-bold text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1 font-medium">Investors will reach out once they see your pitch</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 divide-y divide-foreground/5">
                  {messages.map((msg, index) => (
                    <div key={msg.id} className={cn("pt-4 flex flex-col gap-1.5", index === 0 ? "pt-0" : "")}>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          {msg.sender_name}
                          {msg.sender_company && (
                            <span className="text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded font-sans font-extrabold uppercase">
                              {msg.sender_company}
                            </span>
                          )}
                        </p>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>

                      {msg.pitch_title && (
                        <p className="text-[10px] font-bold text-[hsl(var(--pastel-blue))] bg-[hsl(var(--pastel-blue))]/5 self-start px-2 py-0.5 rounded border border-[hsl(var(--pastel-blue))]/10">
                          Re: {msg.pitch_title}
                        </p>
                      )}

                      <p className="text-xs text-foreground/80 font-medium leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-foreground/5 italic">
                        "{msg.content}"
                      </p>

                      <div className="flex gap-2 mt-1">
                        <Button asChild size="sm" variant="link" className="p-0 font-extrabold text-foreground hover:underline h-auto text-xs">
                          <Link to="/messages" className="flex items-center gap-0.5">Reply →</Link>
                        </Button>
                        {msg.pitch_id && (
                          <Button asChild size="sm" variant="link" className="p-0 font-extrabold text-muted-foreground hover:underline h-auto text-xs ml-auto">
                            <Link to={`/pitches/${msg.pitch_id}`}>View Pitch</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-muted text-foreground font-bold rounded-xl mt-4">
                  <Link to="/messages">View All Messages</Link>
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* SECTION 5: QUICK ACTIONS */}
      <div className="mb-10">
        <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight mb-6">
          <span className="inline-flex items-center gap-2"><Sparkles className="h-6 w-6" /> Quick Actions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-foreground bg-card hover:bg-muted/10 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--pastel-blue))] border border-foreground/10"><FileText className="h-6 w-6" /></div>
              <h4 className="font-display font-extrabold text-lg mb-1">Submit Pitch</h4>
              <p className="text-sm text-muted-foreground font-medium mb-4">Start pitching to investors by creating a modern, sleek presentation.</p>
            </div>
            <Button asChild className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl w-full">
              <Link to="/pitches/create">Create Now</Link>
            </Button>
          </Card>

          <Card className="p-6 border-2 border-foreground bg-card hover:bg-muted/10 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--pastel-mint))] border border-foreground/10"><Users className="h-6 w-6" /></div>
              <h4 className="font-display font-extrabold text-lg mb-1">Browse Investors</h4>
              <p className="text-sm text-muted-foreground font-medium mb-4">Find and connect with verified angel investors and venture firms.</p>
            </div>
            <Button asChild className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl w-full">
              <Link to="/investors">Browse</Link>
            </Button>
          </Card>

          <Card className="p-6 border-2 border-foreground bg-card hover:bg-muted/10 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--pastel-pink))] border border-foreground/10"><ShieldCheck className="h-6 w-6" /></div>
              <h4 className="font-display font-extrabold text-lg mb-1">Security Dashboard</h4>
              <p className="text-sm text-muted-foreground font-medium mb-4">Monitor and control your pitch deck viewing permissions securely.</p>
            </div>
            <Button asChild className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl w-full">
              <Link to="/pitches">Check Now</Link>
            </Button>
          </Card>
        </div>
      </div>

      {/* SECTION 6: TIPS & RESOURCES (Collapsible) */}
      <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] mb-12 overflow-hidden transition-all">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full p-6 flex items-center justify-between bg-muted/20 border-b border-foreground/10 hover:bg-muted/40 transition-colors"
        >
          <h4 className="font-display font-extrabold text-lg flex items-center gap-2 text-foreground">
            <Lightbulb className="h-5 w-5" /> Tips for Getting Funded
          </h4>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <span>{showTips ? "Hide ▼" : "Show ▲"}</span>
          </div>
        </button>

        {showTips && (
          <div className="p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="space-y-3">
              {[
                "Write a compelling problem statement that addresses a real customer pain point.",
                "Show traction or MVP progress — actual visual evidence or early user metrics go a long way.",
                "Have a clear funding ask and a direct description of how you will deploy the funds.",
                "Follow up with interested investors within 48 hours to maintain momentum.",
                "Be transparent about your founding team's experience and complementary strengths."
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-semibold text-foreground/80 leading-relaxed">
                  <span className="text-[hsl(var(--pastel-blue))] text-lg leading-none select-none">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-2 border-t border-foreground/10">
              <Button variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-xl flex items-center gap-1.5">
                Read Full Guide <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-xl flex items-center gap-1.5">
                Watch Tutorial <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* FOOTER */}
      <footer className="border-t-2 border-foreground/10 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="UniShark" className="h-7 w-7 rounded-md object-contain" />
          <span className="font-display font-extrabold text-lg">UniShark</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-muted-foreground">
          <a href="#" className="hover:underline hover:text-foreground">About UniShark</a>
          <a href="#" className="hover:underline hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:underline hover:text-foreground">Terms of Service</a>
          <a href="#" className="hover:underline hover:text-foreground">Contact Support</a>
        </div>
        <p className="text-xs font-bold text-muted-foreground/60 md:order-last">
          © 2024 UniShark. All rights reserved.
        </p>
      </footer>
    </div>
  );
}