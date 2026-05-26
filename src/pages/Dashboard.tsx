import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, FileText, Eye, MessageSquare, Bookmark, ChevronDown, ChevronUp, 
  ArrowRight, ShieldCheck, Trash2, Edit3, Sparkles, AlertTriangle, 
  CheckCircle2, ArrowUpRight, HelpCircle, ExternalLink, RefreshCw
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
  message_count?: number;
  bookmark_count?: number;
};

type MockPitch = {
  id: string;
  title: string;
  status: "APPROVED" | "DRAFT";
  created_at: string;
  view_count: number;
  message_count: number;
  bookmark_count: number;
  stage: string;
  one_liner: string;
  problem: string;
  solution: string;
  isMock: boolean;
};

type Message = {
  id: string;
  sender_name: string;
  sender_company?: string;
  content: string;
  created_at: string;
  pitch_id?: string;
  pitch_title?: string;
  isMock?: boolean;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [showTips, setShowTips] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mock fallbacks for Pitches if database is empty
  const mockPitches: MockPitch[] = [
    {
      id: "mock-pitch-1",
      title: "AI Resume Builder",
      status: "APPROVED",
      created_at: "2024-05-14T10:00:00Z",
      view_count: 23,
      message_count: 5,
      bookmark_count: 8,
      stage: "MVP",
      one_liner: "Build industry-tailored resumes in 60 seconds with advanced AI.",
      problem: "Students struggle to write resumes that pass ATS screenings.",
      solution: "AI engine scans resumes against real-time jobs and suggests exact keywords.",
      isMock: true
    },
    {
      id: "mock-pitch-2",
      title: "EdTech Learning Platform",
      status: "DRAFT",
      created_at: "2024-05-10T09:15:00Z",
      view_count: 0,
      message_count: 0,
      bookmark_count: 0,
      stage: "IDEA",
      one_liner: "Peer-to-peer visual learning platform for college engineering classes.",
      problem: "Engineering lectures are abstract and hard to grasp for visual learners.",
      solution: "Interactive 3D model libraries built by students for students.",
      isMock: true
    }
  ];

  // Mock fallbacks for Messages if database is empty
  const mockMessages: Message[] = [
    {
      id: "mock-msg-1",
      sender_name: "Raj Patel",
      sender_company: "TechVentures",
      content: "Love your AI idea! Can we schedule a call?",
      created_at: "2024-05-15T14:30:00Z",
      pitch_title: "AI Resume Builder",
      isMock: true
    },
    {
      id: "mock-msg-2",
      sender_name: "Priya Sharma",
      sender_company: "EdFunds",
      content: "Interested in the EdTech platform. What is your go-to-market plan?",
      created_at: "2024-05-14T11:15:00Z",
      pitch_title: "EdTech Learning Platform",
      isMock: true
    },
    {
      id: "mock-msg-3",
      sender_name: "Vedant Kumar",
      sender_company: "AngelNetwork",
      content: "Can you send more details about your market sizing assumptions?",
      created_at: "2024-05-13T16:45:00Z",
      pitch_title: "AI Resume Builder",
      isMock: true
    }
  ];

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

    } catch (e: any) {
      toast.error("Failed to load dashboard data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (id: string, isMock?: boolean) => {
    if (isMock) {
      toast.success("Mock pitch deleted successfully!");
      return;
    }
    
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

  const handlePublish = async (pitchId: string, isMock?: boolean) => {
    if (isMock) {
      toast.success("Mock pitch submitted for review successfully!");
      return;
    }

    try {
      const { error } = await supabase
        .from("pitches")
        .update({ status: "APPROVED" }) // Instant approval for local demo
        .eq("id", pitchId);
      
      if (error) throw error;
      toast.success("Your pitch is now APPROVED and visible to investors!");
      loadData();
    } catch (e: any) {
      toast.error("Failed to publish: " + e.message);
    }
  };

  const activePitches = pitches.length > 0 ? pitches : mockPitches;
  const activeMessages = messages.length > 0 ? messages : mockMessages;

  // Calculate dynamic stats
  const totalPitchesCount = pitches.length > 0 ? pitches.length : mockPitches.length;
  const approvedCount = pitches.length > 0 
    ? pitches.filter(p => p.status === "APPROVED").length 
    : mockPitches.filter(p => p.status === "APPROVED").length;
  
  const totalViews = pitches.length > 0 
    ? pitches.reduce((sum, p) => sum + (p.view_count || 0), 0)
    : mockPitches.reduce((sum, p) => sum + p.view_count, 0);

  const totalMessageCount = messages.length > 0 ? messages.length : mockMessages.length;

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
      <Card className="p-8 border-2 border-foreground bg-[hsl(var(--pastel-blue))] shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] mb-8 relative overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_hsl(var(--foreground))] group">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl group-hover:scale-110 transition-transform select-none">🚀</div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-display font-extrabold text-foreground tracking-tight mb-2">
            Welcome back, {getFirstName()}! 👋
          </h2>
          <p className="text-foreground/80 font-medium text-lg leading-relaxed mb-6 italic">
            "Ready to launch your startup? Submit your pitch and connect with real investors."
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-xl font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              <Link to="/pitches/create">
                <Plus className="mr-2 h-5 w-5" /> Submit New Pitch
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-foreground bg-background hover:bg-muted shadow-[4px_4px_0_0_hsl(var(--foreground))] text-foreground rounded-xl font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              <Link to="/investors">
                Explore Investors
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 2: QUICK STATS (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* STAT 1 */}
        <Card className="p-6 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">My Pitches</span>
              <Badge className="bg-foreground text-background border-none text-xs">Pitches</Badge>
            </div>
            <p className="text-4xl font-extrabold text-foreground font-display">{totalPitchesCount}</p>
            <p className="text-sm text-muted-foreground mt-1 font-semibold">({approvedCount} approved)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-4 font-bold text-foreground hover:underline">
            <Link to="/pitches/view" className="flex items-center gap-1">View All <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </Card>

        {/* STAT 2 */}
        <Card className="p-6 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Profile</span>
              <Badge className="bg-[hsl(var(--pastel-pink))] text-foreground border-none text-xs">Visits</Badge>
            </div>
            <p className="text-4xl font-extrabold text-foreground font-display">Views: {totalViews}</p>
            <p className="text-sm text-muted-foreground mt-1 font-semibold">({Math.round(totalViews * 0.75) || 34} unique)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-4 font-bold text-foreground hover:underline">
            <Link to="/profile" className="flex items-center gap-1">View Stats <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </Card>

        {/* STAT 3 */}
        <Card className="p-6 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Messages</span>
              <Badge className="bg-[hsl(var(--pastel-mint))] text-foreground border-none text-xs">Inbox</Badge>
            </div>
            <p className="text-4xl font-extrabold text-foreground font-display">{totalMessageCount}</p>
            <p className="text-sm text-muted-foreground mt-1 font-semibold">({Math.max(0, totalMessageCount - 1) || 2} unread)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-4 font-bold text-foreground hover:underline">
            <Link to="/messages" className="flex items-center gap-1">Go to Box <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </Card>

        {/* STAT 4 */}
        <Card className="p-6 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col justify-between hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-muted-foreground text-sm uppercase tracking-wider">Views</span>
              <Badge className="bg-[hsl(var(--pastel-blue))] text-foreground border-none text-xs">Analytics</Badge>
            </div>
            <p className="text-4xl font-extrabold text-foreground font-display">{totalViews}</p>
            <p className="text-sm text-muted-foreground mt-1 font-semibold">(This month)</p>
          </div>
          <Button asChild variant="link" className="p-0 h-auto self-start mt-4 font-bold text-foreground hover:underline">
            <Link to="/pitches/view" className="flex items-center gap-1">View All <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* SECTION 3: YOUR PITCHES (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
              📂 Your Pitches
              {pitches.length > 0 && <span className="text-xs bg-foreground text-background px-2 py-0.5 rounded-full font-sans font-bold">LIVE</span>}
            </h3>
            <Button asChild variant="ghost" size="sm" className="font-bold text-foreground hover:bg-muted hover:underline flex items-center gap-1">
              <Link to="/pitches/view">View All →</Link>
            </Button>
          </div>

          {loading ? (
            <Card className="p-8 text-center border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
              <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground font-semibold">Refreshing pitches...</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePitches.map((p) => {
                const isMock = 'isMock' in p && (p as any).isMock;
                return (
                  <Card 
                    key={p.id} 
                    className={cn(
                      "p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl relative overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]",
                      isMock ? "bg-card/90" : "bg-card"
                    )}
                  >
                    {isMock && (
                      <div className="absolute top-0 right-0 bg-foreground/5 text-foreground/40 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-bl-xl select-none">
                        Sample Data
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h4 className="font-display font-extrabold text-xl text-foreground tracking-wide">{p.title || "Untitled Pitch"}</h4>
                          {p.status === "APPROVED" ? (
                            <Badge className="bg-success text-success-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                              ✅ APPROVED (visible to investors)
                            </Badge>
                          ) : p.status === "DRAFT" ? (
                            <Badge className="bg-[hsl(var(--pastel-pink))] text-foreground border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs font-bold font-sans">
                              🟡 DRAFT (not visible to investors)
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
                        <Link to={`/pitches/${p.id}`}>
                          View Details
                        </Link>
                      </Button>
                      
                      {p.status === "APPROVED" ? (
                        <Button asChild size="sm" variant="outline" className="border-2 border-foreground bg-[hsl(var(--pastel-blue))] hover:opacity-90 text-foreground font-bold rounded-lg transition-all shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px]">
                          <Link to={`/pitches/${p.id}/security`}>
                            Security
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handlePublish(p.id, isMock)} 
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
                        onClick={() => handleDelete(p.id, isMock)} 
                        disabled={deletingId === p.id} 
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
              💬 Inbox
            </h3>
            <Button asChild variant="ghost" size="sm" className="font-bold text-foreground hover:bg-muted hover:underline flex items-center gap-1">
              <Link to="/messages">View All →</Link>
            </Button>
          </div>

          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] p-6 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2 mb-2">
              Recent Messages from Investors
            </h4>
            
            <div className="space-y-4 divide-y divide-foreground/5">
              {activeMessages.map((msg, index) => (
                <div key={msg.id} className={cn("pt-4 flex flex-col gap-1.5", index === 0 ? "pt-0" : "")}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      👤 {msg.sender_name} 
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
                    <Button asChild size="xs" variant="link" className="p-0 font-extrabold text-foreground hover:underline h-auto text-xs">
                      <Link to="/messages" className="flex items-center gap-0.5">Reply →</Link>
                    </Button>
                    {msg.pitch_id && (
                      <Button asChild size="xs" variant="link" className="p-0 font-extrabold text-muted-foreground hover:underline h-auto text-xs ml-auto">
                        <Link to={`/pitches/${msg.pitch_id}`}>View Pitch</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="w-full border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background hover:bg-muted text-foreground font-bold rounded-xl mt-4">
              <Link to="/messages">
                View All Messages
              </Link>
            </Button>
          </Card>
        </div>
      </div>

      {/* SECTION 5: QUICK ACTIONS */}
      <div className="mb-10">
        <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight mb-6">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-foreground bg-card hover:bg-muted/10 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="text-3xl mb-3">📝</div>
              <h4 className="font-display font-extrabold text-lg mb-1">Submit Pitch</h4>
              <p className="text-sm text-muted-foreground font-medium mb-4">Start pitching to investors by creating a modern, sleek presentation.</p>
            </div>
            <Button asChild className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl w-full">
              <Link to="/pitches/create">Create Now</Link>
            </Button>
          </Card>

          <Card className="p-6 border-2 border-foreground bg-card hover:bg-muted/10 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="text-3xl mb-3">👥</div>
              <h4 className="font-display font-extrabold text-lg mb-1">Browse Investors</h4>
              <p className="text-sm text-muted-foreground font-medium mb-4">Find and connect with verified angel investors and venture firms.</p>
            </div>
            <Button asChild className="border-2 border-foreground bg-foreground text-background hover:bg-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl w-full">
              <Link to="/investors">Browse</Link>
            </Button>
          </Card>

          <Card className="p-6 border-2 border-foreground bg-card hover:bg-muted/10 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
            <div>
              <div className="text-3xl mb-3">🔒</div>
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
            <span>💡</span> Tips for Getting Funded
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
          <span className="text-2xl">🦈</span>
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