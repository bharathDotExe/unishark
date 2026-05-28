import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, TrendingUp, Bookmark, MessageSquare, FileText, ArrowUpRight, RefreshCw, Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Portfolio() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [pitchCount, setPitchCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [
        { count: bm },
        { count: msg },
        { count: pitches },
      ] = await Promise.all([
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", user.id),
        supabase.from("pitches").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
      ]);
      setBookmarkCount(bm ?? 0);
      setMessageCount(msg ?? 0);
      setPitchCount(pitches ?? 0);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">

      {/* HEADER */}
      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-foreground" /> My Portfolio
        </h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1 pl-11">
          Track your investments and deal activity
        </p>
      </div>

      {/* ACTIVITY STATS — real data from DB */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl animate-pulse">
              <div className="h-4 w-20 bg-muted rounded mb-3" />
              <div className="h-8 w-12 bg-muted rounded" />
            </Card>
          ))
        ) : (
          <>
            <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Active Deals</p>
              <p className="text-3xl font-extrabold text-foreground">0</p>
              <p className="text-xs font-bold text-muted-foreground mt-1">No investments yet</p>
            </Card>
            <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Pitches Saved</p>
              <p className="text-3xl font-extrabold text-foreground">{bookmarkCount}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1">In your bookmarks</p>
            </Card>
            <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Messages</p>
              <p className="text-3xl font-extrabold text-foreground">{messageCount}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1">From founders</p>
            </Card>
            <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1">Available Pitches</p>
              <p className="text-3xl font-extrabold text-foreground">{pitchCount}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1">Approved &amp; live</p>
            </Card>
          </>
        )}
      </div>

      {/* MAIN EMPTY STATE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Empty state hero */}
        <div className="lg:col-span-2">
          <Card className="p-10 border-2 border-dashed border-foreground/30 rounded-[24px] bg-card/50 text-center flex flex-col items-center justify-center min-h-[380px] gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-[24px] bg-[hsl(var(--pastel-blue))]/20 border-2 border-foreground/10 flex items-center justify-center">
                <Briefcase className="h-12 w-12 text-foreground/20" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-[hsl(var(--pastel-yellow))] border-2 border-foreground flex items-center justify-center shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <Sparkles className="h-4 w-4 text-foreground" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-display font-extrabold text-foreground mb-2">No investments recorded yet</h3>
              <p className="text-muted-foreground font-medium text-sm max-w-sm mx-auto leading-relaxed">
                Your portfolio dashboard will track all your investments, returns, and company progress once you start investing in pitches.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] bg-foreground text-background hover:bg-foreground rounded-xl font-bold hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                <Link to="/pitches">
                  <FileText className="mr-2 h-4 w-4" /> Browse Pitches
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl font-bold hover:bg-muted">
                <Link to="/bookmarks">
                  <Bookmark className="mr-2 h-4 w-4" /> View Bookmarks
                </Link>
              </Button>
            </div>

            <p className="text-xs font-bold text-muted-foreground/60">
              Investment tracking will be available in an upcoming release
            </p>
          </Card>
        </div>

        {/* Right: What's Coming + Quick Actions */}
        <div className="space-y-5">
          <Card className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-muted-foreground mb-4 border-b border-foreground/10 pb-2">
              Coming Soon
            </h4>
            <ul className="space-y-3 text-sm font-semibold text-foreground/80">
              {[
                { icon: TrendingUp, label: "Investment return tracking" },
                { icon: Briefcase, label: "Deal term management" },
                { icon: MessageSquare, label: "Founder update feed" },
                { icon: FileText, label: "Portfolio PDF export" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-muted border border-foreground/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-[hsl(var(--pastel-blue))]/10">
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-foreground mb-3">
              Quick Actions
            </h4>
            <div className="flex flex-col gap-2">
              <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold rounded-xl bg-background justify-between group">
                <Link to="/pitches">
                  Browse Live Pitches <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold rounded-xl bg-background justify-between group">
                <Link to="/bookmarks">
                  My Bookmarks ({bookmarkCount}) <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold rounded-xl bg-background justify-between group">
                <Link to="/messages">
                  Messages ({messageCount}) <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
