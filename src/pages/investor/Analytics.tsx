import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Bookmark, MessageSquare, FileText, RefreshCw, BarChart3, Activity, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type MonthStat = {
  month: string;
  bookmarks: number;
  messages: number;
};

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Real aggregate stats
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalPitches, setTotalPitches] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState<MonthStat[]>([]);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [
        { count: bm },
        { count: msg },
        { count: unread },
        { count: pitches },
        { data: bmDates },
        { data: msgDates },
      ] = await Promise.all([
        supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", user!.id),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", user!.id).eq("read", false),
        supabase.from("pitches").select("id", { count: "exact", head: true }).eq("status", "APPROVED"),
        supabase.from("bookmarks").select("created_at").eq("user_id", user!.id),
        supabase.from("messages").select("created_at").eq("recipient_id", user!.id),
      ]);

      setTotalBookmarks(bm ?? 0);
      setTotalMessages(msg ?? 0);
      setUnreadMessages(unread ?? 0);
      setTotalPitches(pitches ?? 0);

      // Build monthly stats (last 6 months)
      const last6Months: MonthStat[] = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
          month: d.toLocaleDateString("en-US", { month: "short" }),
          bookmarks: 0,
          messages: 0,
        };
      });

      const monthKey = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", { month: "short" });

      (bmDates ?? []).forEach((b: { created_at: string }) => {
        const key = monthKey(b.created_at);
        const entry = last6Months.find((m) => m.month === key);
        if (entry) entry.bookmarks++;
      });

      (msgDates ?? []).forEach((m: { created_at: string }) => {
        const key = monthKey(m.created_at);
        const entry = last6Months.find((mo) => mo.month === key);
        if (entry) entry.messages++;
      });

      setMonthlyStats(last6Months);
    } finally {
      setLoading(false);
    }
  };

  const maxVal = Math.max(...monthlyStats.map((m) => Math.max(m.bookmarks, m.messages)), 1);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24 space-y-8">

      {/* HEADER */}
      <div className="border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight uppercase flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-[hsl(var(--pastel-blue))]" />
          Analytics
        </h1>
        <p className="text-lg font-bold text-muted-foreground mt-2">
          Your activity and platform insights — all from live data
        </p>
      </div>

      {/* REAL STATS GRID */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl animate-pulse">
              <div className="h-3 w-16 bg-muted rounded mb-3" />
              <div className="h-8 w-12 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Bookmarks Saved", value: totalBookmarks, icon: Bookmark, color: "bg-[hsl(var(--pastel-blue))]/20", note: "Pitches you saved" },
            { label: "Messages Received", value: totalMessages, icon: MessageSquare, color: "bg-[hsl(var(--pastel-mint))]/20", note: `${unreadMessages} unread` },
            { label: "Available Pitches", value: totalPitches, icon: FileText, color: "bg-[hsl(var(--pastel-pink))]/20", note: "Approved & live" },
            { label: "Active Investments", value: "—", icon: BarChart3, color: "bg-muted/40", note: "No deals yet" },
          ].map(({ label, value, icon: Icon, color, note }) => (
            <Card key={label} className={cn("p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl", color)}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-foreground/60" />
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">{label}</p>
              </div>
              <p className="text-3xl font-extrabold text-foreground">{value}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1">{note}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* REAL ACTIVITY CHART */}
        <Card className="lg:col-span-2 p-6 md:p-8 border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] bg-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-extrabold text-xl uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-5 w-5" /> Activity — Last 6 Months
            </h2>
            <Button size="sm" variant="ghost" className="font-bold text-xs" onClick={loadStats}>
              <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Bar chart — real data */}
              <div className="flex items-end justify-between gap-2 h-40 mb-4">
                {monthlyStats.map((m) => (
                  <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: "100px" }}>
                      <div
                        className="flex-1 bg-[hsl(var(--pastel-blue))] border-t-2 border-foreground rounded-t-md transition-all"
                        style={{ height: `${(m.bookmarks / maxVal) * 100}%`, minHeight: m.bookmarks > 0 ? "6px" : "2px" }}
                        title={`${m.bookmarks} bookmarks`}
                      />
                      <div
                        className="flex-1 bg-[hsl(var(--pastel-mint))] border-t-2 border-foreground rounded-t-md transition-all"
                        style={{ height: `${(m.messages / maxVal) * 100}%`, minHeight: m.messages > 0 ? "6px" : "2px" }}
                        title={`${m.messages} messages`}
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground border-t border-foreground/10 pt-3">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-blue))] border border-foreground/30" /> Bookmarks</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-mint))] border border-foreground/30" /> Messages</span>
              </div>

              {totalBookmarks === 0 && totalMessages === 0 && (
                <div className="mt-4 p-3 bg-muted/20 rounded-xl border border-foreground/10 text-xs font-semibold text-muted-foreground text-center">
                  No activity yet. Start by bookmarking pitches and engaging with founders!
                </div>
              )}
            </>
          )}
        </Card>

        {/* INVESTMENT ANALYTICS — Honest empty state */}
        <div className="space-y-5">
          <Card className="p-6 border-2 border-dashed border-foreground/30 rounded-2xl bg-card/50 text-center flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[hsl(var(--pastel-yellow))]/20 border-2 border-foreground/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-foreground/30" />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-foreground mb-1">Investment Analytics</h4>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                ROI, IRR, and portfolio performance will appear here once you record investments.
              </p>
            </div>
            <Badge variant="outline" className="border-2 border-foreground/20 font-bold text-xs text-muted-foreground">
              Coming Soon
            </Badge>
          </Card>

          <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
            <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-foreground mb-3">
              Quick Start
            </h4>
            <div className="space-y-2 text-sm font-semibold text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-foreground font-bold">1.</span> Browse and bookmark interesting pitches
              </p>
              <p className="flex items-start gap-2">
                <span className="text-foreground font-bold">2.</span> Message founders to learn more
              </p>
              <p className="flex items-start gap-2">
                <span className="text-foreground font-bold">3.</span> Track deals in Portfolio (coming soon)
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <Link to="/pitches">Browse Pitches</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <Link to="/bookmarks">View Bookmarks</Link>
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
