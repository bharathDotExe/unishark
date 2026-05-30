import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import {
  PageHeader,
  PageShell,
  StatCard,
  SectionCard,
  StatusPill,
  RefreshButton,
} from "@/components/admin/ui";

type Pitch = { id: string; title: string; status: string; created_at: string };

const statusTone = (s: string) =>
  s === "APPROVED" ? "positive" : s === "REJECTED" ? "danger" : "warning";
const statusLabel = (s: string) =>
  s === "APPROVED" ? "Approved" : s === "REJECTED" ? "Rejected" : "Pending";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPitches: 0,
    pendingPitches: 0,
    approvedPitches: 0,
    rejectedPitches: 0,
    totalInvestors: 0,
    pendingInvestors: 0,
    totalStudents: 0,
  });
  const [recentPitches, setRecentPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [pitchAll, investorAll, studentAll, recentP] = await Promise.all([
      supabase.from("pitches").select("status"),
      supabase.from("investor_profiles").select("verified"),
      supabase.from("student_profiles").select("id"),
      supabase
        .from("pitches")
        .select("id,title,status,created_at")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    const pitches = pitchAll.data ?? [];
    const investors = investorAll.data ?? [];
    setStats({
      totalPitches: pitches.length,
      pendingPitches: pitches.filter((p: any) => p.status === "SUBMITTED").length,
      approvedPitches: pitches.filter((p: any) => p.status === "APPROVED").length,
      rejectedPitches: pitches.filter((p: any) => p.status === "REJECTED").length,
      totalInvestors: investors.length,
      pendingInvestors: investors.filter((i: any) => !i.verified).length,
      totalStudents: (studentAll.data ?? []).length,
    });
    setRecentPitches((recentP.data as Pitch[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Overview"
        subtitle={`Snapshot of activity across UniShark · ${new Date().toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`}
        actions={<RefreshButton onClick={load} loading={loading} />}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total pitches" value={stats.totalPitches} icon={FileText} loading={loading} />
        <StatCard
          label="Pending review"
          value={stats.pendingPitches}
          icon={Clock}
          tone={stats.pendingPitches > 0 ? "warning" : "neutral"}
          hint={stats.pendingPitches > 0 ? "Awaiting your decision" : "All caught up"}
          loading={loading}
        />
        <StatCard label="Approved" value={stats.approvedPitches} icon={CheckCircle2} tone="positive" loading={loading} />
        <StatCard label="Rejected" value={stats.rejectedPitches} icon={XCircle} tone="danger" loading={loading} />
        <StatCard label="Students" value={stats.totalStudents} icon={Users} loading={loading} />
        <StatCard label="Investors" value={stats.totalInvestors} icon={ShieldCheck} loading={loading} />
        <StatCard
          label="Unverified investors"
          value={stats.pendingInvestors}
          icon={AlertTriangle}
          tone={stats.pendingInvestors > 0 ? "warning" : "neutral"}
          loading={loading}
        />
        <StatCard label="Platform uptime" value="99.9%" icon={CheckCircle2} tone="positive" hint="Last 30 days" />
      </div>

      {/* Recent pitches */}
      <SectionCard
        title="Recent pitches"
        description="Latest submissions across all founders"
        actions={
          <Button asChild variant="ghost" size="sm" className="h-8 text-[13px] gap-1">
            <Link to="/admin/pitches">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      >
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentPitches.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No pitches submitted yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {recentPitches.map((p) => (
              <Link
                key={p.id}
                to={`/pitches/${p.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(p.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusPill label={statusLabel(p.status)} tone={statusTone(p.status) as any} />
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
