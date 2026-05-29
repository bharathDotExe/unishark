import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, RefreshCw, TrendingUp, TrendingDown, FileText, Users, ShieldCheck, Calendar } from "lucide-react";
import { toast } from "sonner";

type ReportData = {
  totalPitches: number;
  approvedPitches: number;
  rejectedPitches: number;
  pendingPitches: number;
  totalStudents: number;
  totalInvestors: number;
  verifiedInvestors: number;
  pitchesByStage: Record<string, number>;
  recentGrowth: { label: string; value: number; change: number }[];
};

export default function AdminReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pitchAll, investorAll, studentAll] = await Promise.all([
      supabase.from("pitches").select("status, stage, created_at"),
      supabase.from("investor_profiles").select("verified, created_at"),
      supabase.from("student_profiles").select("id, created_at"),
    ]);

    const pitches = pitchAll.data ?? [];
    const investors = investorAll.data ?? [];
    const students = studentAll.data ?? [];

    const pitchesByStage: Record<string, number> = {};
    pitches.forEach((p) => {
      if (p.stage) pitchesByStage[p.stage] = (pitchesByStage[p.stage] || 0) + 1;
    });

    // Fake growth calculation (last 7 days vs previous 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const recentPitches = pitches.filter((p) => new Date(p.created_at) > weekAgo).length;
    const prevPitches = pitches.filter((p) => new Date(p.created_at) > twoWeeksAgo && new Date(p.created_at) <= weekAgo).length;
    const recentStudents = students.filter((s) => new Date(s.created_at) > weekAgo).length;
    const prevStudents = students.filter((s) => new Date(s.created_at) > twoWeeksAgo && new Date(s.created_at) <= weekAgo).length;

    setData({
      totalPitches: pitches.length,
      approvedPitches: pitches.filter((p) => p.status === "APPROVED").length,
      rejectedPitches: pitches.filter((p) => p.status === "REJECTED").length,
      pendingPitches: pitches.filter((p) => p.status === "SUBMITTED").length,
      totalStudents: students.length,
      totalInvestors: investors.length,
      verifiedInvestors: investors.filter((i) => i.verified).length,
      pitchesByStage,
      recentGrowth: [
        { label: "New Pitches (7d)", value: recentPitches, change: recentPitches - prevPitches },
        { label: "New Students (7d)", value: recentStudents, change: recentStudents - prevStudents },
      ],
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const exportCSV = () => {
    if (!data) return;
    setGenerating(true);
    const rows = [
      ["Metric", "Value"],
      ["Total Pitches", data.totalPitches],
      ["Approved Pitches", data.approvedPitches],
      ["Rejected Pitches", data.rejectedPitches],
      ["Pending Pitches", data.pendingPitches],
      ["Approval Rate", data.totalPitches > 0 ? `${((data.approvedPitches / data.totalPitches) * 100).toFixed(1)}%` : "0%"],
      ["Total Students", data.totalStudents],
      ["Total Investors", data.totalInvestors],
      ["Verified Investors", data.verifiedInvestors],
      ...Object.entries(data.pitchesByStage).map(([stage, count]) => [`Pitches - ${stage}`, count]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unishark-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setGenerating(false);
    toast.success("Report exported ✓");
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <Card key={i} className="h-24 animate-pulse border-2 border-foreground/10" />)}
        </div>
      </div>
    );
  }

  const approvalRate = data && data.totalPitches > 0 ? ((data.approvedPitches / data.totalPitches) * 100).toFixed(1) : "0";
  const verifiedRate = data && data.totalInvestors > 0 ? ((data.verifiedInvestors / data.totalInvestors) * 100).toFixed(1) : "0";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Generate Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Platform analytics and exportable data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button size="sm" className="rounded-xl bg-foreground text-background hover:bg-foreground/90" onClick={exportCSV} disabled={generating}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Generated at */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        Report generated: {new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}
      </div>

      {/* Pitch Summary */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" /> Pitch Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: data?.totalPitches, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Approved", value: data?.approvedPitches, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Rejected", value: data?.rejectedPitches, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Pending", value: data?.pendingPitches, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((s) => (
            <Card key={s.label} className="p-4 border-2 border-foreground/10">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/10">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Approval rate: <strong className="text-foreground">{approvalRate}%</strong></span>
        </div>
      </div>

      {/* User Summary */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" /> User Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Students", value: data?.totalStudents, color: "text-sky-500", bg: "bg-sky-500/10" },
            { label: "Investors", value: data?.totalInvestors, color: "text-violet-500", bg: "bg-violet-500/10" },
            { label: "Verified Investors", value: data?.verifiedInvestors, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Unverified", value: (data?.totalInvestors ?? 0) - (data?.verifiedInvestors ?? 0), color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((s) => (
            <Card key={s.label} className="p-4 border-2 border-foreground/10">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-foreground/[0.03] border border-foreground/10">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Investor verification rate: <strong className="text-foreground">{verifiedRate}%</strong></span>
        </div>
      </div>

      {/* Pitches by Stage */}
      {data && Object.keys(data.pitchesByStage).length > 0 && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> Pitches by Stage
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(data.pitchesByStage).map(([stage, count]) => {
              const pct = data.totalPitches > 0 ? (count / data.totalPitches) * 100 : 0;
              return (
                <Card key={stage} className="p-4 border-2 border-foreground/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{stage}</span>
                    <Badge variant="outline" className="font-bold">{count}</Badge>
                  </div>
                  <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pct.toFixed(1)}% of all pitches</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Growth */}
      {data && (
        <div>
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> 7-Day Growth
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {data.recentGrowth.map((g) => (
              <Card key={g.label} className="p-4 border-2 border-foreground/10 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${g.change >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {g.change >= 0
                    ? <TrendingUp className="h-5 w-5 text-green-500" />
                    : <TrendingDown className="h-5 w-5 text-red-500" />
                  }
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{g.label}</p>
                  <p className="text-xl font-extrabold text-foreground">{g.value}</p>
                  <p className={`text-xs font-medium ${g.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {g.change >= 0 ? "+" : ""}{g.change} vs prev week
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
