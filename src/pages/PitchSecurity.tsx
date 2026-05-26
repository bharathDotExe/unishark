import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ShieldAlert, Users, ShieldCheck, Activity, Settings2, 
  AlertTriangle, CheckCircle2, MessageSquare, UserMinus, Plus, 
  ExternalLink, FileText, Download, Share2, Ban, Lock, RefreshCw, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Pitch = {
  id: string;
  title: string;
};

export default function PitchSecurity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [loading, setLoading] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [screenshotDetection, setScreenshotDetection] = useState(true);
  const [copyProtection, setCopyProtection] = useState(true);
  const [expiringLinks, setExpiringLinks] = useState(false);
  const [accessControl, setAccessControl] = useState(false);

  // Load pitch title
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from("pitches").select("id, title").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) {
        setPitch(data as Pitch);
      } else {
        // Fallback for demo
        setPitch({ id, title: "AI Resume Builder" });
      }
      setLoading(false);
    });
  }, [id]);

  const handleActionToast = (action: string) => {
    toast.success(`${action} action processed successfully!`);
  };

  const handleToggleFeature = (feature: string, state: boolean, setter: (s: boolean) => void) => {
    setter(!state);
    toast.success(`${feature} has been ${!state ? "ENABLED" : "DISABLED"}!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative flex items-center justify-center" style={{ backgroundImage: "var(--gradient-mesh)" }}>
        <div className="text-center p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
          <RefreshCw className="h-10 w-10 text-foreground animate-spin mx-auto mb-3" />
          <p className="text-foreground font-extrabold font-display">Loading Security Dashboard...</p>
        </div>
      </div>
    );
  }

  const pitchTitle = pitch?.title || "AI Resume Builder";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
      {/* BACK NAVIGATION */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 hover:bg-muted border-2 border-foreground rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all font-bold"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Pitch Details
      </Button>

      {/* SECURITY DASHBOARD TITLE BLOCK */}
      <div className="text-center p-8 border-[3px] border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] bg-card mb-8">
        <span className="text-xs uppercase tracking-widest font-black text-foreground bg-[hsl(var(--pastel-pink))] border-2 border-foreground px-3 py-1 rounded-full mb-3 inline-block shadow-[2px_2px_0_0_hsl(var(--foreground))]">
          🛡️ PITCH PROTECTION INTERFACE
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground uppercase tracking-widest mt-2">
          SECURITY DASHBOARD
        </h1>
        <p className="text-lg sm:text-xl font-bold text-muted-foreground mt-1">
          {pitchTitle}
        </p>
      </div>

      {/* HEADER PROTECTION CARD */}
      <Card className="p-6 sm:p-8 border-[3px] border-foreground bg-[hsl(var(--pastel-blue))] shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] mb-8 text-center relative overflow-hidden group">
        <div className="absolute top-[-20px] right-[-20px] p-4 opacity-5 text-[12rem] group-hover:scale-110 transition-transform select-none font-sans font-black pointer-events-none">🔒</div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-foreground font-black text-lg sm:text-xl md:text-2xl tracking-tight mb-6">
            Your pitch is protected with watermarks and monitoring
          </p>
          <Button 
            onClick={() => handleActionToast("View Protection Settings")} 
            className="border-2 border-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] bg-background hover:bg-muted text-foreground font-black text-sm sm:text-base rounded-xl px-6 py-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            🔒 View Protection Settings
          </Button>
        </div>
      </Card>

      <div className="border-t-4 border-double border-foreground my-8"></div>

      {/* 2-COLUMN VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* LEFT COLUMN: Section 1 & Section 2 (col-span-7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* SECTION 1: REAL-TIME ALERTS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="bg-foreground text-background w-8 h-8 rounded-lg flex items-center justify-center font-sans font-black text-sm">1</span>
                SECTION 1: REAL-TIME ALERTS
              </h2>
            </div>
            
            <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
              <div className="bg-muted/40 border-b-2 border-foreground p-4 flex items-center justify-between">
                <h3 className="font-display font-black text-md text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span>🚨</span> ALERTS (Last 7 Days)
                </h3>
                <Badge className="bg-destructive border-2 border-foreground text-destructive-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-black text-xs uppercase px-2.5 py-0.5 rounded-md">
                  3 ACTIVE
                </Badge>
              </div>
              
              <div className="p-6 space-y-6 divide-y-2 divide-foreground/10">
                {/* ALERT 1: HIGH RISK */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[hsl(var(--pastel-pink))] border-2 border-foreground text-foreground shadow-[2.5px_2.5px_0_0_hsl(var(--foreground))] font-black text-xs uppercase px-2 py-0.5 rounded-md">
                      ⚠️ HIGH
                    </Badge>
                    <span className="font-black text-foreground text-sm tracking-tight">Multiple IP addresses detected</span>
                  </div>
                  <div className="pl-4 border-l-[3px] border-foreground/30 space-y-1.5 text-xs text-muted-foreground font-bold">
                    <p className="leading-relaxed">
                      Raj Patel viewed from 2 different IPs (<span className="text-foreground font-mono bg-muted px-1.5 py-0.5 border border-foreground/10 rounded">23.45.67.89</span>, <span className="text-foreground font-mono bg-muted px-1.5 py-0.5 border border-foreground/10 rounded">192.168.1.1</span>) on May 15
                    </p>
                    <p className="text-foreground">
                      └─ Action: Might have shared link with team
                    </p>
                  </div>
                  <div className="flex gap-2 pl-4">
                    <Button 
                      onClick={() => handleActionToast("Mark Raj Patel as Safe")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Mark as Safe
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Block Raj Patel")} 
                      size="xs" 
                      className="border-2 border-foreground bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Block Investor
                    </Button>
                  </div>
                </div>

                {/* ALERT 2: MEDIUM RISK */}
                <div className="space-y-3 pt-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[hsl(var(--pastel-yellow))] border-2 border-foreground text-foreground shadow-[2.5px_2.5px_0_0_hsl(var(--foreground))] font-black text-xs uppercase px-2 py-0.5 rounded-md">
                      ✋ MEDIUM
                    </Badge>
                    <span className="font-black text-foreground text-sm tracking-tight">Screenshot attempt detected</span>
                  </div>
                  <div className="pl-4 border-l-[3px] border-foreground/30 space-y-1.5 text-xs text-muted-foreground font-bold">
                    <p className="leading-relaxed">
                      Vedant Kumar attempted PrintScreen on May 14, 11:30 AM
                    </p>
                    <p className="text-foreground">
                      └─ Suggestion: Email investor about sharing terms
                    </p>
                  </div>
                  <div className="flex gap-2 pl-4">
                    <Button 
                      asChild 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      <Link to="/messages">Send Message</Link>
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Ignore Screenshot Attempt")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-muted-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Ignore
                    </Button>
                  </div>
                </div>

                {/* ALERT 3: LOW RISK */}
                <div className="space-y-3 pt-6">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[hsl(var(--pastel-blue))] border-2 border-foreground text-foreground shadow-[2.5px_2.5px_0_0_hsl(var(--foreground))] font-black text-xs uppercase px-2 py-0.5 rounded-md">
                      🔍 LOW
                    </Badge>
                    <span className="font-black text-foreground text-sm tracking-tight">Viewed by unknown visitor</span>
                  </div>
                  <div className="pl-4 border-l-[3px] border-foreground/30 space-y-1.5 text-xs text-muted-foreground font-bold">
                    <p className="leading-relaxed">
                      Anonymous IP (<span className="text-foreground font-mono bg-muted px-1.5 py-0.5 border border-foreground/10 rounded">89.12.34.56</span>) viewed deck for 4 mins on May 13 - likely search engine crawler
                    </p>
                  </div>
                  <div className="flex gap-2 pl-4">
                    <Button 
                      onClick={() => handleActionToast("View Unknown Visitor Details")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* SECTION 2: WHO'S VIEWING YOUR PITCH */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="bg-foreground text-background w-8 h-8 rounded-lg flex items-center justify-center font-sans font-black text-sm">2</span>
                SECTION 2: WHO'S VIEWING YOUR PITCH
              </h2>
            </div>
            
            <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
              <div className="bg-muted/40 border-b-2 border-foreground p-4 flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-display font-black text-md text-foreground uppercase tracking-wider">
                  ALL VIEWS (23 total)
                </h3>
                <Button 
                  onClick={() => handleActionToast("Sort Views")}
                  variant="ghost" 
                  size="sm" 
                  className="font-black border-2 border-foreground bg-background shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:bg-muted text-foreground text-xs rounded-xl px-3 py-1 hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                >
                  Sort By: Recent ▼
                </Button>
              </div>

              <div className="p-6 space-y-6 divide-y-2 divide-foreground/10">
                {/* INVESTOR 1: RAJ PATEL */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-black text-base text-foreground flex items-center gap-1.5 flex-wrap">
                      Investor: Raj Patel 
                      <span className="text-xs bg-foreground text-background px-2.5 py-0.5 rounded-md font-sans font-black shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] border border-background/25">
                        TechVentures
                      </span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-tight flex gap-2 flex-wrap items-center">
                      <span>Status: <span className="text-emerald-600 dark:text-emerald-400 font-black">Verified Investor ✅</span></span>
                      <span>|</span>
                      <span>Risk Level: <span className="text-emerald-600 dark:text-emerald-400 font-black">🟢 Green (Safe)</span></span>
                      <span>|</span>
                      <span>Investment Exp: <span className="text-foreground font-black">5-20 deals</span></span>
                    </p>
                  </div>
                  
                  <div className="pl-4 border-l-[3px] border-foreground/30 text-xs text-muted-foreground font-bold space-y-1.5 leading-relaxed">
                    <p>├─ <span className="font-black text-foreground">Views:</span> 3 times (May 15, 11:30 AM - 14 mins) | (May 14, 3:45 PM - 8 mins) | (May 13, 6:20 PM - 3 mins)</p>
                    <p>├─ <span className="font-black text-foreground">IP Addresses:</span> 23.45.67.89, 192.168.1.1 (2 IPs)</p>
                    <p>├─ <span className="font-black text-foreground">Device:</span> MacBook Pro (Chrome)</p>
                    <p>├─ <span className="font-black text-foreground">Bookmarked:</span> <span className="text-emerald-600 dark:text-emerald-400 font-black">Yes</span> (May 15, 11:45 AM)</p>
                    <p>└─ <span className="font-black text-foreground">Messaged:</span> <span className="text-emerald-600 dark:text-emerald-400 font-black">Yes</span> ("Love your AI idea!")</p>
                  </div>

                  <div className="flex gap-2 pl-4 flex-wrap">
                    <Button 
                      onClick={() => handleActionToast("View Raj Patel's Profile")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      View Profile
                    </Button>
                    <Button 
                      asChild 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      <Link to="/messages">Message</Link>
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Block Raj Patel")} 
                      size="xs" 
                      className="border-2 border-foreground bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Block
                    </Button>
                  </div>
                </div>

                {/* INVESTOR 2: PRIYA SHARMA */}
                <div className="space-y-3 pt-6">
                  <div>
                    <h4 className="font-black text-base text-foreground flex items-center gap-1.5 flex-wrap">
                      Investor: Priya Sharma 
                      <span className="text-xs bg-foreground text-background px-2.5 py-0.5 rounded-md font-sans font-black shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] border border-background/25">
                        EdFunds
                      </span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-tight flex gap-2 flex-wrap items-center">
                      <span>Status: <span className="text-emerald-600 dark:text-emerald-400 font-black">Verified Investor ✅</span></span>
                      <span>|</span>
                      <span>Risk Level: <span className="text-emerald-600 dark:text-emerald-400 font-black">🟢 Green (Safe)</span></span>
                      <span>|</span>
                      <span>Investment Exp: <span className="text-foreground font-black">1-5 deals</span></span>
                    </p>
                  </div>
                  
                  <div className="pl-4 border-l-[3px] border-foreground/30 text-xs text-muted-foreground font-bold space-y-1.5 leading-relaxed">
                    <p>├─ <span className="font-black text-foreground">Views:</span> 2 times (May 14, 11:15 AM - 12 mins) | (May 14, 11:30 AM - 6 mins)</p>
                    <p>├─ <span className="font-black text-foreground">IP Address:</span> 45.67.89.12 (1 IP)</p>
                    <p>├─ <span className="font-black text-foreground">Device:</span> iPhone 13 (Safari)</p>
                    <p>├─ <span className="font-black text-foreground">Bookmarked:</span> <span className="text-emerald-600 dark:text-emerald-400 font-black">Yes</span> (May 14, 11:20 AM)</p>
                    <p>└─ <span className="font-black text-foreground">Messaged:</span> <span className="text-emerald-600 dark:text-emerald-400 font-black">Yes</span> ("Interested in EdTech")</p>
                  </div>

                  <div className="flex gap-2 pl-4 flex-wrap">
                    <Button 
                      onClick={() => handleActionToast("View Priya Sharma's Profile")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      View Profile
                    </Button>
                    <Button 
                      asChild 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      <Link to="/messages">Message</Link>
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Block Priya Sharma")} 
                      size="xs" 
                      className="border-2 border-foreground bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Block
                    </Button>
                  </div>
                </div>

                {/* INVESTOR 3: VEDANT KUMAR */}
                <div className="space-y-3 pt-6">
                  <div>
                    <h4 className="font-black text-base text-foreground flex items-center gap-1.5 flex-wrap">
                      Investor: Vedant Kumar 
                      <span className="text-xs bg-foreground text-background px-2.5 py-0.5 rounded-md font-sans font-black shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] border border-background/25">
                        AngelNetwork
                      </span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-tight flex gap-2 flex-wrap items-center">
                      <span>Status: <span className="text-emerald-600 dark:text-emerald-400 font-black">Verified Investor ✅</span></span>
                      <span>|</span>
                      <span>Risk Level: <span className="text-amber-600 dark:text-amber-400 font-black">🟡 Yellow (Caution)</span></span>
                      <span>|</span>
                      <span>Investment Exp: <span className="text-foreground font-black">20+ deals</span></span>
                    </p>
                  </div>
                  
                  <div className="pl-4 border-l-[3px] border-foreground/30 text-xs text-muted-foreground font-bold space-y-1.5 leading-relaxed">
                    <p>├─ <span className="font-black text-foreground">Views:</span> 5 times (Most recent: May 14, 1:30 PM)</p>
                    <p>├─ <span className="font-black text-foreground">Time Spent:</span> 45 mins total</p>
                    <p>├─ <span className="font-black text-foreground">IP Address:</span> 12.34.56.78 (1 IP)</p>
                    <p>├─ <span className="font-black text-foreground">Device:</span> Desktop (Firefox)</p>
                    <p>├─ <span className="font-black text-foreground">Bookmarked:</span> No</p>
                    <p>├─ <span className="font-black text-foreground">Messaged:</span> No (Unusual - viewed but no message)</p>
                    <p className="text-amber-600 dark:text-amber-500 font-black flex items-center gap-1">
                      ⚠️ Risk Flag: Views often but doesn't message
                    </p>
                  </div>

                  <div className="flex gap-2 pl-4 flex-wrap">
                    <Button 
                      onClick={() => handleActionToast("View Vedant Kumar's Profile")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      View Profile
                    </Button>
                    <Button 
                      asChild 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      <Link to="/messages">Send Message</Link>
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Block Vedant Kumar")} 
                      size="xs" 
                      className="border-2 border-foreground bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Block
                    </Button>
                  </div>
                </div>

                {/* INVESTOR 4: UNKNOWN VISITOR */}
                <div className="space-y-3 pt-6">
                  <div>
                    <h4 className="font-black text-base text-foreground flex items-center gap-1.5 flex-wrap">
                      Unknown Visitor (Anonymous)
                    </h4>
                    <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-tight flex gap-2 flex-wrap items-center">
                      <span>Status: <span className="text-destructive font-black">❌ Not Verified</span></span>
                      <span>|</span>
                      <span>Risk Level: <span className="text-destructive font-black">🔴 Red (Unknown)</span></span>
                    </p>
                  </div>
                  
                  <div className="pl-4 border-l-[3px] border-foreground/30 text-xs text-muted-foreground font-bold space-y-1.5 leading-relaxed">
                    <p>├─ <span className="font-black text-foreground">Views:</span> 1 time (May 13, 2:15 PM - 2 mins)</p>
                    <p>├─ <span className="font-black text-foreground">IP Address:</span> 89.12.34.56 (Anonymous Proxy)</p>
                    <p>└─ <span className="font-black text-foreground">Device:</span> Bot/Crawler</p>
                  </div>

                  <div className="flex gap-2 pl-4">
                    <Button 
                      onClick={() => handleActionToast("Block Anonymous IP 89.12.34.56")} 
                      size="xs" 
                      className="border-2 border-foreground bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs rounded-xl px-3 py-1 shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                    >
                      Block IP
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/20 border-t-2 border-foreground text-center">
                <Button 
                  onClick={() => handleActionToast("Loading all 23 views")} 
                  size="sm" 
                  className="border-2 border-foreground bg-background shadow-[3px_3px_0_0_hsl(var(--foreground))] hover:bg-muted text-foreground font-black text-xs sm:text-sm rounded-xl px-6 hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] transition-all"
                >
                  View All 23 Views
                </Button>
              </div>
            </Card>
          </div>

        </div>

        {/* RIGHT COLUMN: Section 3, Section 4 & Section 5 (col-span-5) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* SECTION 3: PROTECTION SETTINGS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="bg-foreground text-background w-8 h-8 rounded-lg flex items-center justify-center font-sans font-black text-sm">3</span>
                SECTION 3: PROTECTION SETTINGS
              </h2>
            </div>
            
            <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
              <div className="bg-muted/40 border-b-2 border-foreground p-4">
                <h3 className="font-display font-black text-md text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span>🛡️</span> PROTECTION FEATURES
                </h3>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Feature 1 */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                      {watermarkEnabled ? "✅" : "⭕"} Watermark: {watermarkEnabled ? "Enabled" : "Disabled"}
                    </span>
                    <button 
                      onClick={() => handleToggleFeature("Watermarking", watermarkEnabled, setWatermarkEnabled)} 
                      className="text-[10px] font-black text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="pl-4 text-[10px] text-muted-foreground font-bold space-y-1">
                    <p>├─ Each PDF shows: "Raj Patel - May 15, 2024 2:30 PM"</p>
                    <p className="flex gap-1.5 mt-1">
                      <button onClick={() => handleActionToast("Customize Watermark")} className="underline hover:text-foreground transition-colors">Customize</button> 
                      <span>|</span> 
                      <button onClick={() => handleActionToast("Downloading Sample")} className="underline hover:text-foreground transition-colors">Download Sample</button>
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="space-y-1 border-t-2 border-foreground/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                      {screenshotDetection ? "✅" : "⭕"} Screenshot Detection: {screenshotDetection ? "Enabled" : "Disabled"}
                    </span>
                    <button 
                      onClick={() => handleToggleFeature("Screenshot Detection", screenshotDetection, setScreenshotDetection)} 
                      className="text-[10px] font-black text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="pl-4 text-[10px] text-muted-foreground font-bold space-y-1">
                    <p>├─ Alerts you when investor uses PrintScreen</p>
                    <p className="flex gap-1.5 mt-1">
                      <button onClick={() => handleActionToast("Viewing attempts")} className="underline hover:text-foreground transition-colors">View Attempts</button> 
                      <span>|</span> 
                      <button onClick={() => handleActionToast("Configuring settings")} className="underline hover:text-foreground transition-colors">Settings</button>
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="space-y-1 border-t-2 border-foreground/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                      {copyProtection ? "✅" : "⭕"} Copy Protection: {copyProtection ? "Enabled" : "Disabled"}
                    </span>
                    <button 
                      onClick={() => handleToggleFeature("Copy Protection", copyProtection, setCopyProtection)} 
                      className="text-[10px] font-black text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="pl-4 text-[10px] text-muted-foreground font-bold space-y-1">
                    <p>├─ Text cannot be copied from PDF</p>
                    <p className="mt-1">
                      <button onClick={() => handleActionToast("Configuring copy settings")} className="underline hover:text-foreground transition-colors">Settings</button>
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="space-y-1 border-t-2 border-foreground/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                      {expiringLinks ? "✅" : "⭕"} Expiring Links: {expiringLinks ? "Enabled" : "Disabled" } (optional)
                    </span>
                    <button 
                      onClick={() => handleToggleFeature("Expiring Links", expiringLinks, setExpiringLinks)} 
                      className="text-[10px] font-black text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="pl-4 text-[10px] text-muted-foreground font-bold space-y-1">
                    <p>├─ Set links to expire after 24/48 hours</p>
                    <p className="flex gap-1.5 mt-1">
                      <button onClick={() => handleToggleFeature("Expiring Links", expiringLinks, setExpiringLinks)} className="underline hover:text-foreground transition-colors">Enable</button> 
                      <span>|</span> 
                      <button onClick={() => handleActionToast("Configuring link expiry")} className="underline hover:text-foreground transition-colors">Configure</button>
                    </p>
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="space-y-1 border-t-2 border-foreground/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                      {accessControl ? "✅" : "⭕"} Access Control: {accessControl ? "Enabled" : "Disabled"} (optional)
                    </span>
                    <button 
                      onClick={() => handleToggleFeature("Access Control", accessControl, setAccessControl)} 
                      className="text-[10px] font-black text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="pl-4 text-[10px] text-muted-foreground font-bold space-y-1">
                    <p>├─ Restrict to specific verified investors only</p>
                    <p className="flex gap-1.5 mt-1">
                      <button onClick={() => handleToggleFeature("Access Control", accessControl, setAccessControl)} className="underline hover:text-foreground transition-colors">Enable</button> 
                      <span>|</span> 
                      <button onClick={() => handleActionToast("Configuring access restrictions")} className="underline hover:text-foreground transition-colors">Configure</button>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* SECTION 4: ANOMALY DETECTION */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="bg-foreground text-background w-8 h-8 rounded-lg flex items-center justify-center font-sans font-black text-sm">4</span>
                SECTION 4: ANOMALY DETECTION
              </h2>
            </div>
            
            <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
              <div className="bg-muted/40 border-b-2 border-foreground p-4">
                <h3 className="font-display font-black text-md text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span>🔍</span> SUSPICIOUS ACTIVITY DETECTED
                </h3>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Pattern 1 */}
                <div className="space-y-1.5 border-b-2 border-foreground/10 pb-4">
                  <p className="font-black text-xs text-foreground">Pattern 1: Views without messages</p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    Investors: Vedant Kumar (5 views, 0 messages)
                  </p>
                  <div className="pl-3 border-l-2 border-foreground/30 text-[10px] font-bold text-muted-foreground mt-1 space-y-0.5">
                    <p>├─ Interpretation: Interested but unsure</p>
                    <p className="flex items-center gap-1 mt-0.5 flex-wrap">
                      └─ Suggestion: 
                      <Button 
                        onClick={() => handleActionToast("Sending follow-up message")} 
                        size="xs" 
                        variant="link" 
                        className="p-0 text-[10px] font-black text-indigo-600 dark:text-indigo-400 h-auto underline"
                      >
                        [Send Follow-up Message]
                      </Button>
                    </p>
                  </div>
                </div>

                {/* Pattern 2 */}
                <div className="space-y-1.5 border-b-2 border-foreground/10 pb-4">
                  <p className="font-black text-xs text-foreground">Pattern 2: Multiple IP addresses (Same investor)</p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    Investor: Raj Patel (viewed from 2 IPs)
                  </p>
                  <div className="pl-3 border-l-2 border-foreground/30 text-[10px] font-bold text-muted-foreground mt-1 space-y-0.5">
                    <p>├─ Interpretation: Viewed on laptop + phone</p>
                    <p>└─ Risk Level: <span className="text-emerald-600 dark:text-emerald-400 font-black">🟢 Low (Normal behavior)</span></p>
                  </div>
                </div>

                {/* Pattern 3 */}
                <div className="space-y-2">
                  <p className="font-black text-xs text-foreground">Pattern 3: Competitor view detected</p>
                  <p className="text-[10px] text-muted-foreground font-bold">
                    Company: Resume.io (Competitor)
                  </p>
                  <div className="pl-3 border-l-2 border-foreground/30 text-[10px] font-bold text-muted-foreground my-1 space-y-0.5">
                    <p>├─ IP identified from company network</p>
                    <p>└─ Risk Level: <span className="text-destructive font-black">🔴 High (Potential idea theft!)</span></p>
                  </div>
                  <div className="flex gap-2 pl-3 pt-1 flex-wrap">
                    <Button 
                      onClick={() => handleActionToast("Blocked Resume.io corporate network")} 
                      size="xs" 
                      className="border-2 border-foreground bg-destructive hover:bg-destructive/95 text-destructive-foreground font-black text-[10px] px-2.5 py-0.5 h-7 rounded-xl shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] transition-all"
                    >
                      Block Permanently
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Consulted UniShark Legal")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black text-[10px] px-2.5 py-0.5 h-7 rounded-xl shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] transition-all"
                    >
                      Legal Action
                    </Button>
                    <Button 
                      onClick={() => handleActionToast("Competitor Alert Ignored")} 
                      size="xs" 
                      className="border-2 border-foreground bg-background hover:bg-muted text-muted-foreground font-black text-[10px] px-2.5 py-0.5 h-7 rounded-xl shadow-[1.5px_1.5px_0_0_hsl(var(--foreground))] hover:translate-x-[-0.5px] hover:translate-y-[-0.5px] transition-all"
                    >
                      Ignore
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* SECTION 5: ACTIONS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="bg-foreground text-background w-8 h-8 rounded-lg flex items-center justify-center font-sans font-black text-sm">5</span>
                SECTION 5: ACTIONS
              </h2>
            </div>
            
            <Card className="border-[3px] border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden">
              <div className="p-6 flex flex-col gap-3">
                <Button 
                  onClick={() => handleActionToast("Generate Secure Share Link")} 
                  className="border-2 border-foreground bg-[hsl(var(--pastel-pink))] hover:bg-[hsl(var(--pastel-pink))]/90 text-foreground font-black rounded-xl w-full justify-start pl-4 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all py-6 text-sm sm:text-base"
                >
                  <span>🔗 Generate Secure Share Link</span>
                </Button>
                <Button 
                  onClick={() => handleActionToast("Send to Specific Investors")} 
                  className="border-2 border-foreground bg-[hsl(var(--pastel-blue))] hover:bg-[hsl(var(--pastel-blue))]/90 text-foreground font-black rounded-xl w-full justify-start pl-4 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all py-6 text-sm sm:text-base"
                >
                  <span>📧 Send to Specific Investors</span>
                </Button>
                <Button 
                  onClick={() => handleActionToast("Block Multiple Investors")} 
                  className="border-2 border-foreground bg-[hsl(var(--pastel-yellow))] hover:bg-[hsl(var(--pastel-yellow))]/90 text-foreground font-black rounded-xl w-full justify-start pl-4 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all py-6 text-sm sm:text-base"
                >
                  <span>🚫 Block Multiple Investors</span>
                </Button>
                <Button 
                  onClick={() => handleActionToast("Download Security Report")} 
                  className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black rounded-xl w-full justify-start pl-4 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all py-6 text-sm sm:text-base"
                >
                  <span>📊 Download Security Report</span>
                </Button>
                <Button 
                  onClick={() => handleActionToast("Open Advanced Settings")} 
                  className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-black rounded-xl w-full justify-start pl-4 shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all py-6 text-sm sm:text-base"
                >
                  <span>🔐 Advanced Settings</span>
                </Button>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
