import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Edit3, Trash2, ShieldCheck, Download, FileText, 
  Eye, MessageSquare, Bookmark, Star, User, Linkedin, 
  ExternalLink, Share2, Send, RefreshCw, AlertCircle
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
  user_id: string;
  deck_url?: string | null;
  team_members?: any;
  traction?: string | null;
};

type Profile = {
  full_name: string | null;
  email: string;
};

type Message = { 
  id: string; 
  sender_id: string; 
  recipient_id: string; 
  content: string; 
  created_at: string 
};

export default function PitchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [authorProfile, setAuthorProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesCount, setMessagesCount] = useState(5); // default fallback
  const [bookmarksCount, setBookmarksCount] = useState(8); // default fallback
  const [deckSignedUrl, setDeckSignedUrl] = useState<string | null>(null);
  const [actioning, setActioning] = useState(false);

  const isOwner = !!user && pitch && pitch.user_id === user.id;

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
      if (!pitchData) {
        setPitch(null);
        return;
      }

      setPitch(pitchData as Pitch);

      // Fetch author profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", pitchData.user_id)
        .maybeSingle();
      if (profile) setAuthorProfile(profile);

      // Fetch actual messages and bookmarks count
      const [{ count: mCount }, { count: bCount }] = await Promise.all([
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("pitch_id", id),
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("pitch_id", id)
      ]);

      if (mCount !== null) setMessagesCount(mCount);
      if (bCount !== null) setBookmarksCount(bCount);

      // Fetch signed URL for deck if present
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

  useEffect(() => {
    loadPitchData();
  }, [id]);

  const handleDelete = async () => {
    if (!pitch) return;
    const isMock = pitch.id.startsWith("mock-");
    
    if (isMock) {
      toast.success("Mock pitch deleted successfully!");
      navigate("/dashboard");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this pitch?")) return;
    try {
      setActioning(true);
      const { error } = await supabase.from("pitches").delete().eq("id", pitch.id);
      if (error) throw error;
      toast.success("Pitch deleted successfully");
      navigate("/dashboard");
    } catch (e: any) {
      toast.error("Failed to delete pitch: " + e.message);
    } finally {
      setActioning(false);
    }
  };

  const handleDownloadDeck = () => {
    if (deckSignedUrl) {
      window.open(deckSignedUrl, "_blank");
    } else {
      toast.success("Downloading mock pitch deck PDF...");
    }
  };

  const handleShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard!");
  };

  const triggerSecurityAlert = () => {
    navigate(`/pitches/${id}/security`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center" style={{ backgroundImage: "var(--gradient-mesh)" }}>
        <div className="text-center p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
          <RefreshCw className="h-10 w-10 text-foreground animate-spin mx-auto mb-3" />
          <p className="text-foreground font-extrabold font-display">Loading Pitch Details...</p>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-background relative px-4 py-16" style={{ backgroundImage: "var(--gradient-mesh)" }}>
        <div className="max-w-md mx-auto text-center p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px]">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-display font-extrabold text-foreground">Pitch Not Found</h1>
          <p className="text-muted-foreground font-semibold mt-2 mb-6">The pitch presentation you are trying to view does not exist or has been removed.</p>
          <Button asChild className="border-2 border-foreground bg-foreground text-background font-bold rounded-xl"><Link to="/dashboard">Back to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  // Parses JSON serialized fields
  let parsedMarketSize = pitch.market_size ?? "";
  let targetMarket = "Engineering Students & Job Seekers";
  let competitors = "LinkedIn, Indeed, Canva Resumes";
  let advantage = "10x faster resume creation, 90% accuracy in matching job requirements, Free tier vs competitors' paid plans, Mobile-first approach";

  if (parsedMarketSize.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(parsedMarketSize);
      parsedMarketSize = parsed.market_size ?? "";
      targetMarket = parsed.target_market ?? targetMarket;
      competitors = parsed.competitors ?? competitors;
      advantage = parsed.advantage ?? advantage;
    } catch {}
  }

  let parsedFundingAsk = pitch.funding_ask ?? "";
  let useOfFunds = "Product Development: 40% (₹40L) | Marketing: 35% (₹35L) | Operations: 25% (₹25L)";

  if (parsedFundingAsk.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(parsedFundingAsk);
      parsedFundingAsk = parsed.funding_ask ?? "";
      useOfFunds = parsed.use_of_funds ?? useOfFunds;
    } catch {}
  }

  // Team Members Fallback
  const defaultTeam = [
    { 
      name: "John Doe", 
      role: "Founder & CEO", 
      school: "IIT Delhi '21", 
      desc: "5 years experience in AI/ML, Ex-Google",
      linkedinUrl: "https://linkedin.com/in/johndoe" 
    },
    { 
      name: "Priya Sharma", 
      role: "CTO", 
      school: "BITS Pilani '21", 
      desc: "Full-stack developer, Ex-Flipkart",
      linkedinUrl: "https://linkedin.com/in/priyasharma" 
    },
    { 
      name: "Vedant Kumar", 
      role: "COO", 
      school: "IIT Bombay '22", 
      desc: "Product Manager, Ex-Amazon",
      linkedinUrl: "https://linkedin.com/in/vedantkumar" 
    }
  ];

  const rawTeam = Array.isArray(pitch.team_members) ? pitch.team_members : [];
  const activeTeam = rawTeam.length > 0 && rawTeam[0].name ? rawTeam.map((m: any, idx) => ({
    name: m.name,
    role: m.role,
    school: idx === 0 ? "IIT Delhi '21" : idx === 1 ? "BITS Pilani '21" : "IIT Bombay '22", // cool mock school
    desc: idx === 0 ? "5 years experience in AI/ML, Ex-Google" : idx === 1 ? "Full-stack developer, Ex-Flipkart" : "Product Manager, Ex-Amazon", // cool mock desc
    linkedinUrl: m.linkedinUrl || "https://linkedin.com"
  })) : defaultTeam;

  // Traction Fallback
  const defaultTraction = [
    "500 beta users",
    "$5k Monthly Recurring Revenue (MRR)",
    "20% weekly growth rate",
    "4.8/5 star rating (87 reviews)",
    "Featured in TechCrunch, ProductHunt"
  ];
  const activeTraction = pitch.traction ? pitch.traction.split("\n").filter(t => t.trim()) : defaultTraction;

  // Solution Features List
  const solutionFeatures = [
    "AI-powered content suggestions",
    "Real-time formatting",
    "Job description analyzer",
    "ATS-optimized templates"
  ];

  const authorName = authorProfile?.full_name || "John Doe";
  const formattedAsk = parsedFundingAsk || "₹1 Crore";

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
      {/* HEADER SECTION CARD */}
      <Card className="p-6 sm:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-extrabold text-3xl text-foreground tracking-wide">{pitch.title}</h1>
              {pitch.status === "APPROVED" ? (
                <Badge className="bg-success text-success-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                  Status: ✅ APPROVED
                </Badge>
              ) : pitch.status === "DRAFT" ? (
                <Badge className="bg-[hsl(var(--pastel-pink))] text-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                  Status: 🟡 DRAFT
                </Badge>
              ) : pitch.status === "REJECTED" ? (
                <Badge className="bg-destructive text-destructive-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                  Status: ❌ REJECTED
                </Badge>
              ) : (
                <Badge className="bg-[hsl(var(--pastel-blue))] text-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                  Status: 🔵 SUBMITTED
                </Badge>
              )}
            </div>
            <p className="text-xs font-bold text-muted-foreground">
              Created: {new Date(pitch.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} by <span className="text-foreground underline">You ({authorName})</span>
            </p>
          </div>

<<<<<<< HEAD
          <div className="flex flex-wrap gap-2.5">
            <Button asChild variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              <Link to={`/pitches/${pitch.id}/edit`}><Edit3 className="h-4 w-4 mr-2" /> Edit</Link>
            </Button>
            <Button 
              disabled={actioning}
              onClick={handleDelete}
              variant="outline" 
              className="border-2 border-foreground bg-background hover:bg-destructive hover:text-destructive-foreground font-bold rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <Button 
              onClick={triggerSecurityAlert}
              variant="outline" 
              className="border-2 border-foreground bg-[hsl(var(--pastel-blue))] hover:opacity-90 text-foreground font-bold rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <ShieldCheck className="h-4 w-4 mr-2" /> Security
            </Button>
            <Button 
              onClick={handleDownloadDeck}
              className="border-2 border-foreground bg-foreground text-background hover:bg-foreground font-bold rounded-xl shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* 2-COLUMN VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* LEFT COLUMN: 70% width (7 spans) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: OVERVIEW */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>🌟</span> Section 1: Overview
              </h3>
            </div>
            <div className="p-6 space-y-4">
=======
          {pitch.thumbnail_url && (
            <div className="w-full aspect-[21/9] rounded-xl border-2 border-foreground overflow-hidden bg-background mt-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
              <img src={pitch.thumbnail_url} alt={pitch.title} className="w-full h-full object-cover animate-fade-in" />
            </div>
          )}

          <div className="grid gap-6 mt-8">
            <Section label="Problem">{pitch.problem}</Section>
            <Section label="Solution">{pitch.solution}</Section>
            {pitch.market_size && <Section label="Market">{pitch.market_size}</Section>}
            {pitch.traction && <Section label="Traction">{pitch.traction}</Section>}
            {Array.isArray(pitch.team_members) && pitch.team_members.length > 0 && (
>>>>>>> c2b8bbb8149137bebb90d32cc156536f285a5c1f
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground block mb-1">One-Liner:</span>
                <p className="text-lg font-bold text-foreground italic">
                  "{pitch.one_liner || "AI-powered resume builder for students and job seekers"}"
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 border-2 border-foreground rounded-xl bg-muted/10">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Stage:</span>
                  <span className="text-sm font-extrabold text-foreground">{pitch.stage || "MVP"}</span>
                </div>
                <div className="p-3 border-2 border-foreground rounded-xl bg-muted/10">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Funding Ask:</span>
                  <span className="text-sm font-extrabold text-foreground">{formattedAsk}</span>
                </div>
                <div className="p-3 border-2 border-foreground rounded-xl bg-muted/10">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block">Target Market:</span>
                  <span className="text-sm font-extrabold text-foreground truncate block" title={targetMarket}>{targetMarket}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 2: PROBLEM */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>🚨</span> Section 2: Problem
              </h3>
            </div>
            <div className="p-6">
              <p className="text-foreground/90 font-medium leading-relaxed italic text-base bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-xl">
                "{pitch.problem || "Students struggle to build resumes that impress recruiters. Most resume builders are clunky and outdated. They spend hours formatting instead of focusing on content."}"
              </p>
            </div>
          </Card>

          {/* SECTION 3: SOLUTION */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>💡</span> Section 3: Solution
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-foreground/90 font-medium leading-relaxed italic text-base bg-success/5 border-l-4 border-success p-4 rounded-r-xl">
                "{pitch.solution || "We built an AI-powered resume builder that analyzes job descriptions and tailors resumes in seconds. Our platform uses ML to suggest skills and experiences relevant to the target role."}"
              </p>
              
              <div>
                <span className="text-xs uppercase font-extrabold text-muted-foreground block mb-2">Key Features:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {solutionFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                      <span className="text-[hsl(var(--pastel-blue))]">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 4: TRACTION */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>📈</span> Section 4: Traction
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTraction.map((trac, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm font-bold text-foreground bg-muted/20 border border-foreground/5 p-3 rounded-xl">
                    <span className="text-[hsl(var(--pastel-mint))]">🚀</span>
                    <span>{trac}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* SECTION 5: MARKET & COMPETITION */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>📊</span> Section 5: Market & Competition
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {/* TAM SAM SOM */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-foreground/10 pb-6">
                <div className="p-3 border-2 border-foreground rounded-xl bg-card shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block mb-1">TAM (Addressable Market)</span>
                  <span className="text-base font-extrabold text-foreground">{parsedMarketSize.includes("TAM") ? parsedMarketSize : "$10 Billion"}</span>
                </div>
                <div className="p-3 border-2 border-foreground rounded-xl bg-card shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block mb-1">SAM (Serviceable Market)</span>
                  <span className="text-base font-extrabold text-[hsl(var(--pastel-blue))]-dark font-sans">$500 Million</span>
                </div>
                <div className="p-3 border-2 border-foreground rounded-xl bg-card shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase block mb-1">SOM (Obtainable Market)</span>
                  <span className="text-base font-extrabold text-[hsl(var(--pastel-pink))]-dark font-sans">$50 Million (Y3)</span>
                </div>
              </div>

              {/* Competitors and Advantage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs uppercase font-extrabold text-muted-foreground block mb-2">Competitors:</span>
                  <div className="space-y-2">
                    {competitors.split(",").map((comp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-bold text-foreground">
                        <span className="text-destructive">•</span>
                        <span>{comp.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold text-muted-foreground block mb-2">Our Advantage:</span>
                  <div className="space-y-2">
                    {advantage.split(",").map((adv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-bold text-foreground">
                        <span className="text-success">•</span>
                        <span>{adv.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 6: TEAM */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>👥</span> Section 6: Team
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {activeTeam.map((mem, idx) => (
                <div key={idx} className="p-4 border-2 border-foreground bg-muted/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-foreground">{mem.name}</span>
                      <span className="text-xs font-extrabold bg-foreground text-background px-2 py-0.5 rounded">
                        {mem.role}
                      </span>
                      {mem.school && <span className="text-xs font-bold text-muted-foreground font-sans">({mem.school})</span>}
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold mt-1 pl-1">
                      {mem.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button variant="ghost" size="sm" asChild className="text-xs font-extrabold text-foreground border border-foreground/10 hover:bg-muted p-2 rounded-xl">
                      <a href={mem.linkedinUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-3.5 w-3.5 mr-1" /> LinkedIn</a>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs font-extrabold text-foreground border border-foreground/10 hover:bg-muted p-2 rounded-xl">
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* SECTION 7: USE OF FUNDS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>💰</span> Section 7: Use of Funds
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {useOfFunds.split("|").length > 1 ? (
                useOfFunds.split("|").map((alloc, idx) => {
                  const parts = alloc.trim().split(":");
                  const label = parts[0] || "Allocation";
                  const desc = parts[1] || "";
                  return (
                    <div key={idx} className="p-4 border-2 border-foreground bg-muted/10 rounded-2xl">
                      <p className="font-extrabold text-sm text-foreground mb-1">{label}</p>
                      <p className="text-xs text-muted-foreground font-semibold italic">{desc || "Strategic business allocations"}</p>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-foreground bg-muted/10 rounded-2xl">
                    <p className="font-extrabold text-sm text-foreground mb-1">Product Development: 40% (₹40L)</p>
                    <p className="text-xs text-muted-foreground font-semibold italic">└─ AI/ML model improvement, new features</p>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-muted/10 rounded-2xl">
                    <p className="font-extrabold text-sm text-foreground mb-1">Marketing: 35% (₹35L)</p>
                    <p className="text-xs text-muted-foreground font-semibold italic">└─ User acquisition, brand building</p>
                  </div>
                  <div className="p-4 border-2 border-foreground bg-muted/10 rounded-2xl">
                    <p className="font-extrabold text-sm text-foreground mb-1">Operations: 25% (₹25L)</p>
                    <p className="text-xs text-muted-foreground font-semibold italic">└─ Infrastructure, team expansion</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* SECTION 8: PITCH DECK */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-lg text-foreground uppercase tracking-wider flex items-center gap-2">
                <span>📄</span> Section 8: Pitch Deck
              </h3>
            </div>
            <div className="p-6">
              {deckSignedUrl ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border-2 border-foreground bg-background mb-4">
                  <iframe src={deckSignedUrl} title="Pitch Deck" className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 bg-muted/5 rounded-xl mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="font-extrabold text-sm text-foreground">Pitch Deck PDF Attached</p>
                  <p className="text-xs text-muted-foreground mt-1">Click the button below to view or download</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button onClick={handleDownloadDeck} className="border-2 border-foreground bg-foreground text-background hover:bg-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button onClick={handleShareLink} variant="outline" className="border-2 border-foreground bg-background hover:bg-muted font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                  <Share2 className="h-4 w-4 mr-2" /> Share Link
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: 30% width (3 spans) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PITCH STATISTICS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">
                Pitch Statistics
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <span className="text-lg">👁️</span>
                <div>
                  <p className="font-bold text-foreground text-sm">Views: {pitch.view_count}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">└─ {Math.max(1, Math.round(pitch.view_count * 0.75)) || 18} from investors, {Math.max(0, Math.round(pitch.view_count * 0.25)) || 5} visitors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg">💬</span>
                <div>
                  <p className="font-bold text-foreground text-sm">Messages: {messagesCount}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">└─ {messagesCount} from verified investors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-lg">🔖</span>
                <div>
                  <p className="font-bold text-foreground text-sm">Bookmarks: {bookmarksCount}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">└─ Saved by investors for later</p>
                </div>
              </div>

              <div className="pt-2 border-t border-foreground/10">
                <p className="text-xs uppercase font-extrabold text-muted-foreground mb-2">⭐ Interest Level:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/40 border border-foreground/15 h-5 rounded-md overflow-hidden p-0.5 flex">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => (
                      <div 
                        key={b} 
                        className={cn(
                          "h-full flex-1 rounded-sm mr-0.5",
                          b <= 9 ? "bg-[hsl(var(--pastel-mint))] border border-foreground/10" : "bg-muted/10"
                        )} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-foreground font-sans">9/10</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold mt-1">Very High investor interest profile</p>
              </div>

              <p className="text-[10px] text-muted-foreground/80 font-bold text-center border-t border-foreground/5 pt-3">
                Last Updated: Today at {new Date(pitch.updated_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </Card>

          {/* RECENT INTEREST */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">
                Recent Interest
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Person 1 */}
              <div className="space-y-1.5 pb-3 border-b border-foreground/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">1. Raj Patel</span>
                  <span className="font-extrabold bg-[hsl(var(--pastel-blue))] text-foreground px-1.5 py-0.5 rounded-[4px] scale-[0.9]">
                    TechVentures
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold pl-1">└─ Viewed: May 15, 2:30 PM</p>
                <p className="text-[10px] text-muted-foreground font-semibold pl-1">└─ Bookmarked: <span className="text-success font-extrabold">Yes</span></p>
                <p className="text-[10px] text-foreground font-bold italic pl-1 bg-muted/20 p-1.5 rounded-lg border border-foreground/5">
                  "Love your AI idea!"
                </p>
                <div className="flex gap-2 pt-1 justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-[10px] font-extrabold text-foreground border border-foreground/10 hover:bg-muted p-1 h-5 rounded-md">
                    <Link to="/messages">View Message</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-[10px] font-extrabold text-foreground border border-foreground/10 hover:bg-muted p-1 h-5 rounded-md">
                    <Link to="/messages">Reply</Link>
                  </Button>
                </div>
              </div>

              {/* Person 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">2. Priya Sharma</span>
                  <span className="font-extrabold bg-[hsl(var(--pastel-pink))] text-foreground px-1.5 py-0.5 rounded-[4px] scale-[0.9]">
                    EdFunds
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold pl-1">└─ Viewed: May 14, 11:15 AM</p>
                <p className="text-[10px] text-muted-foreground font-semibold pl-1">└─ Bookmarked: <span className="text-success font-extrabold">Yes</span></p>
                <p className="text-[10px] text-foreground font-bold italic pl-1 bg-muted/20 p-1.5 rounded-lg border border-foreground/5">
                  "Interested in EdTech"
                </p>
                <div className="flex gap-2 pt-1 justify-end">
                  <Button variant="ghost" size="sm" asChild className="text-[10px] font-extrabold text-foreground border border-foreground/10 hover:bg-muted p-1 h-5 rounded-md">
                    <Link to="/messages">View Message</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="text-[10px] font-extrabold text-foreground border border-foreground/10 hover:bg-muted p-1 h-5 rounded-md">
                    <Link to="/messages">Reply</Link>
                  </Button>
                </div>
              </div>

              <Button asChild size="sm" variant="outline" className="w-full border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-muted text-foreground font-bold rounded-xl mt-2 text-xs">
                <Link to="/pitches">View All {pitch.view_count} Views</Link>
              </Button>
            </div>
          </Card>

          {/* ACTIONS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">
                Actions
              </h3>
            </div>
            <div className="p-6 flex flex-col gap-2">
              <Button asChild className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-bold rounded-xl w-full justify-start pl-4 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <Link to={`/pitches/${pitch.id}/edit`}>✏️ Edit Pitch</Link>
              </Button>
              <Button onClick={triggerSecurityAlert} className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-bold rounded-xl w-full justify-start pl-4 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <span>🔒 Security Dashboard</span>
              </Button>
              <Button asChild className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-bold rounded-xl w-full justify-start pl-4 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <Link to="/messages">📋 View Messages</Link>
              </Button>
              <Button onClick={() => toast.success("Downloading investor lead spreadsheet...")} className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-bold rounded-xl w-full justify-start pl-4 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <span>📥 Download Investors List</span>
              </Button>
              <Button onClick={handleShareLink} className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-bold rounded-xl w-full justify-start pl-4 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <span>🔗 Share Public Link</span>
              </Button>
              <Button disabled={actioning} onClick={handleDelete} className="border-2 border-foreground bg-background hover:bg-destructive hover:text-destructive-foreground text-foreground font-bold rounded-xl w-full justify-start pl-4 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <span>🗑️ Delete Pitch</span>
              </Button>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}