import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, RefreshButton } from "@/components/admin/ui";
import { Users, FileText, ShieldCheck, Activity, BarChart3 } from "lucide-react";

export default function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPitches: 0, approvedPitches: 0, rejectedPitches: 0, pendingPitches: 0,
    totalStudents: 0, totalInvestors: 0, verifiedInvestors: 0,
    byStage: [] as { stage: string; count: number }[],
    activity: [] as { date: string; pitches: number; students: number; investors: number }[],
  });

  const load = async () => {
    setLoading(true);
    const [p, s, i] = await Promise.all([
      supabase.from("pitches").select("status,stage,created_at"),
      supabase.from("student_profiles").select("id,created_at"),
      supabase.from("investor_profiles").select("verified,created_at"),
    ]);
    const pp = p.data ?? [], ss = s.data ?? [], ii = i.data ?? [];
    const stageMap: Record<string, number> = {};
    pp.forEach((x: any) => { if (x.stage) stageMap[x.stage] = (stageMap[x.stage] || 0) + 1; });
    const activity = Array.from({ length: 14 }, (_, idx) => {
      const d = new Date(); d.setDate(d.getDate() - 13 + idx);
      const ds = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        pitches: pp.filter((x: any) => x.created_at?.startsWith(ds)).length,
        students: ss.filter((x: any) => x.created_at?.startsWith(ds)).length,
        investors: ii.filter((x: any) => x.created_at?.startsWith(ds)).length,
      };
    });
    setStats({
      totalPitches: pp.length,
      approvedPitches: pp.filter((x: any) => x.status === "APPROVED").length,
      rejectedPitches: pp.filter((x: any) => x.status === "REJECTED").length,
      pendingPitches: pp.filter((x: any) => x.status === "SUBMITTED").length,
      totalStudents: ss.length, totalInvestors: ii.length,
      verifiedInvestors: ii.filter((x: any) => x.verified).length,
      byStage: Object.entries(stageMap).map(([stage, count]) => ({ stage, count })).sort((a, b) => b.count - a.count),
      activity,
    });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const maxAct = Math.max(...stats.activity.map((d) => Math.max(d.pitches, d.students, d.investors)), 1);
  const maxStage = Math.max(...stats.byStage.map((s) => s.count), 1);
  const approval = stats.totalPitches ? ((stats.approvedPitches / stats.totalPitches) * 100).toFixed(0) : "0";
  const verify = stats.totalInvestors ? ((stats.verifiedInvestors / stats.totalInvestors) * 100).toFixed(0) : "0";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="Analytics"
        subtitle="Platform performance and engagement intelligence."
        actions={<RefreshButton onClick={load} loading={loading} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Users" value={stats.totalStudents + stats.totalInvestors} hint={`${stats.totalStudents} students · ${stats.totalInvestors} investors`} icon={Users} loading={loading} />
        <StatCard label="Pitches" value={stats.totalPitches} hint={`${approval}% approved`} icon={FileText} loading={loading} />
        <StatCard label="Verified investors" value={stats.verifiedInvestors} hint={`${verify}% verification rate`} icon={ShieldCheck} tone="positive" loading={loading} />
        <StatCard label="Pending review" value={stats.pendingPitches} tone={stats.pendingPitches ? "warning" : "neutral"} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="14-day activity" description="Daily new pitches, students and investors.">
          <div className="p-5">
            <div className="flex gap-4 mb-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Pitches</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" />Students</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Investors</span>
            </div>
            <div className="flex items-end gap-1.5 h-32">
              {stats.activity.map((d, i) => (
                <div key={i} className="flex-1 flex items-end gap-0.5 h-full" title={d.date}>
                  <div className="flex-1 bg-indigo-500/80 rounded-t" style={{ height: `${(d.pitches / maxAct) * 100}%`, minHeight: 2 }} />
                  <div className="flex-1 bg-sky-500/80 rounded-t" style={{ height: `${(d.students / maxAct) * 100}%`, minHeight: 2 }} />
                  <div className="flex-1 bg-emerald-500/80 rounded-t" style={{ height: `${(d.investors / maxAct) * 100}%`, minHeight: 2 }} />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Pitch status">
          <div className="p-5 space-y-4">
            {[
              { label: "Approved", value: stats.approvedPitches, color: "bg-emerald-500" },
              { label: "Pending", value: stats.pendingPitches, color: "bg-amber-500" },
              { label: "Rejected", value: stats.rejectedPitches, color: "bg-red-500" },
              { label: "Draft", value: stats.totalPitches - (stats.approvedPitches + stats.pendingPitches + stats.rejectedPitches), color: "bg-muted-foreground" },
            ].map((s) => {
              const pct = stats.totalPitches ? (s.value / stats.totalPitches) * 100 : 0;
              return (
                <div key={s.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-foreground">{s.label}</span>
                    <span className="text-sm tabular-nums font-medium text-foreground">{s.value} <span className="text-muted-foreground font-normal">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Pitches by stage" className="lg:col-span-2">
          <div className="p-5">
            {stats.byStage.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No stage data yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.byStage.map((s) => (
                  <div key={s.stage} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-medium text-muted-foreground">{s.stage}</span>
                      <span className="text-base font-semibold tabular-nums">{s.count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-foreground" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
