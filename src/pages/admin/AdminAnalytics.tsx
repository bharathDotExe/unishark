import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, FileText, ShieldCheck, RefreshCw, Activity, BarChart3, PieChart, Calendar } from "lucide-react";

type DailyCount = { date: string; count: number };

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPitches: 0,
    totalStudents: 0,
    totalInvestors: 0,
    verifiedInvestors: 0,
    approvedPitches: 0,
    rejectedPitches: 0,
    pendingPitches: 0,
    pitchesByStage: [] as { stage: string; count: number }[],
    pitchesByStatus: [] as { status: string; count: number }[],
    recentPitches: [] as DailyCount[],
  });

  const load = async () => {
    setLoading(true);
    const [pitchRes, studentRes, investorRes] = await Promise.all([
      supabase.from("pitches").select("status, stage, created_at"),
      supabase.from("student_profiles").select("id, created_at"),
      supabase.from("investor_profiles").select("verified, created_at"),
    ]);

    const pitches = pitchRes.data ?? [];
    const students = studentRes.data ?? [];
    const investors = investorRes.data ?? [];

    // Pitches by stage
    const stageMap: Record<string, number> = {};
    pitches.forEach((p) => { if (p.stage) stageMap[p.stage] = (stageMap[p.stage] || 0) + 1; });
    const pitchesByStage = Object.entries(stageMap).map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count);

    // Pitches by status
    const statusMap: Record<string, number> = {};
    pitches.forEach((p) => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
    const pitchesByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

    // Daily pitch creation (last 14 days)
    const now = new Date();
    const recentPitches: DailyCount[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = pitches.filter((p) => p.created_at?.startsWith(dateStr)).length;
      recentPitches.push({ date: dateStr, count });
    }

    setStats({
      totalPitches: pitches.length,
      totalStudents: students.length,
      totalInvestors: investors.length,
      verifiedInvestors: investors.filter((i) => i.verified).length,
      approvedPitches: pitches.filter((p) => p.status === "APPROVED").length,
      rejectedPitches: pitches.filter((p) => p.status === "REJECTED").length,
      pendingPitches: pitches.filter((p) => p.status === "SUBMITTED").length,
      pitchesByStage,
      pitchesByStatus,
      recentPitches,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const maxDailyCount = Math.max(...stats.recentPitches.map((d) => d.count), 1);
  const maxStageCount = Math.max(...stats.pitchesByStage.map((s) => s.count), 1);

  const STATUS_COLORS: Record<string, string> = {
    APPROVED: "bg-green-500",
    REJECTED: "bg-red-500",
    SUBMITTED: "bg-amber-500",
    DRAFT: "bg-blue-400",
  };

  const kpis = [
    { label: "Total Users", value: stats.totalStudents + stats.totalInvestors, sub: `${stats.totalStudents} students · ${stats.totalInvestors} investors`, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Pitches", value: stats.totalPitches, sub: `${stats.approvedPitches} approved`, icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Verification Rate", value: `${stats.totalInvestors > 0 ? ((stats.verifiedInvestors / stats.totalInvestors) * 100).toFixed(0) : 0}%`, sub: `${stats.verifiedInvestors} of ${stats.totalInvestors} investors`, icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Approval Rate", value: `${stats.totalPitches > 0 ? ((stats.approvedPitches / stats.totalPitches) * 100).toFixed(0) : 0}%`, sub: `${stats.approvedPitches} of ${stats.totalPitches} pitches`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Admin Analytics</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Platform performance insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Live data · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10 ml-2" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-5 border-2 border-foreground/10 hover:border-foreground/25 transition-all hover:translate-y-[-2px]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <div className={`h-9 w-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-extrabold text-foreground">{kpi.value}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Pitch Activity (14 days) */}
        <Card className="p-5 border-2 border-foreground/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" /> Pitch Activity (14 days)
            </h2>
          </div>
          {loading ? (
            <div className="h-32 bg-muted/50 rounded animate-pulse" />
          ) : (
            <div className="flex items-end gap-1 h-32">
              {stats.recentPitches.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-foreground/80 rounded-sm transition-all hover:bg-foreground relative"
                    style={{ height: `${(d.count / maxDailyCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "2px", opacity: d.count === 0 ? 0.15 : 1 }}
                  >
                    {d.count > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {d.count}
                      </div>
                    )}
                  </div>
                  {(i === 0 || i === 6 || i === 13) && (
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pitch Status Distribution */}
        <Card className="p-5 border-2 border-foreground/10">
          <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-muted-foreground" /> Pitch Status Distribution
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />)}
            </div>
          ) : stats.pitchesByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No pitch data</p>
          ) : (
            <div className="space-y-3">
              {stats.pitchesByStatus.map((s) => {
                const pct = stats.totalPitches > 0 ? (s.count / stats.totalPitches) * 100 : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{s.status.charAt(0) + s.status.slice(1).toLowerCase()}</span>
                      <span className="text-sm font-bold text-foreground">{s.count} <span className="text-xs text-muted-foreground font-normal">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2.5 bg-foreground/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[s.status] || "bg-foreground"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Pitches by Stage */}
        <Card className="p-5 border-2 border-foreground/10 lg:col-span-2">
          <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" /> Pitches by Startup Stage
          </h2>
          {loading ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {Array(6).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />)}
            </div>
          ) : stats.pitchesByStage.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No stage data available</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {stats.pitchesByStage.map((s) => {
                const pct = (s.count / maxStageCount) * 100;
                return (
                  <Card key={s.stage} className="p-4 border-2 border-foreground/10 bg-foreground/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">{s.stage}</span>
                      <span className="text-sm font-extrabold text-foreground">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* User Split */}
      <Card className="p-5 border-2 border-foreground/10">
        <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" /> User Split
        </h2>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex-1 h-6 bg-muted/50 rounded animate-pulse" />
          ) : (
            <>
              <div className="flex-1">
                <div className="flex h-6 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 transition-all duration-700 flex items-center justify-center"
                    style={{ width: `${stats.totalStudents + stats.totalInvestors > 0 ? (stats.totalStudents / (stats.totalStudents + stats.totalInvestors)) * 100 : 50}%` }}
                  >
                    <span className="text-[10px] font-bold text-white px-1">Students</span>
                  </div>
                  <div
                    className="bg-violet-500 transition-all duration-700 flex items-center justify-center"
                    style={{ width: `${stats.totalStudents + stats.totalInvestors > 0 ? (stats.totalInvestors / (stats.totalStudents + stats.totalInvestors)) * 100 : 50}%` }}
                  >
                    <span className="text-[10px] font-bold text-white px-1">Investors</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-sm shrink-0">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{stats.totalStudents} Students</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />{stats.totalInvestors} Investors</span>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
