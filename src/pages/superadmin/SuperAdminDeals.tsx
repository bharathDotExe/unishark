import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, DataTable, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Handshake, DollarSign, CheckCircle2, XCircle, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Deal = { id: string; pitchTitle: string; investorName: string; founderName: string; amount: number; stage: string; status: "NEGOTIATING"|"SIGNED"|"CLOSED"|"DROPPED"; created_at: string; equity?: number };

const TABS = ["ALL", "NEGOTIATING", "SIGNED", "CLOSED", "DROPPED"];

export default function SuperAdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("deals" as any).select(`
      id, amount_committed, status, created_at,
      pitches ( title, stage, equity_offered ),
      investor:investor_id ( full_name ),
      student:student_id ( full_name )
    `).order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const mapped: Deal[] = ((data as any[]) ?? []).map((d) => ({
      id: d.id,
      pitchTitle: d.pitches?.title || "Unknown",
      investorName: d.investor?.full_name || "—",
      founderName: d.student?.full_name || "—",
      amount: Number(d.amount_committed) || 0,
      stage: d.pitches?.stage || "—",
      status: d.status,
      created_at: d.created_at,
      equity: d.pitches?.equity_offered || 0,
    }));
    setDeals(mapped); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = tab === "ALL" ? deals : deals.filter((d) => d.status === tab);
  const counts: Record<string, number> = { ALL: deals.length };
  TABS.slice(1).forEach((t) => { counts[t] = deals.filter((d) => d.status === t).length; });
  const total = deals.filter((d) => d.status !== "DROPPED").reduce((a, b) => a + b.amount, 0);
  const signed = deals.filter((d) => d.status === "SIGNED").reduce((a, b) => a + b.amount, 0);
  const fmt = (v: number) => v >= 1e7 ? `₹${(v/1e7).toFixed(1)}Cr` : v >= 1e5 ? `₹${(v/1e5).toFixed(1)}L` : `₹${v.toLocaleString("en-IN")}`;

  const updateStatus = async (id: string, status: Deal["status"]) => {
    const { error } = await supabase.from("deals" as any).update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`); load();
  };

  const tone = (s: string): any => s === "SIGNED" ? "positive" : s === "DROPPED" ? "danger" : s === "CLOSED" ? "info" : "warning";

  const columns: Column<Deal>[] = [
    { key: "pitch", header: "Pitch", cell: (d) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{d.pitchTitle}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{d.investorName} ↔ {d.founderName}</p>
      </div>
    )},
    { key: "amount", header: "Amount", width: "150px", cell: (d) => <span className="text-sm font-medium tabular-nums">{fmt(d.amount)} <span className="text-muted-foreground font-normal">· {d.equity}%</span></span> },
    { key: "stage", header: "Stage", width: "110px", cell: (d) => <span className="text-sm text-muted-foreground">{d.stage}</span> },
    { key: "status", header: "Status", width: "130px", cell: (d) => <StatusPill label={d.status} tone={tone(d.status)} /> },
    { key: "actions", header: "", width: "200px", align: "right", cell: (d) => (
      <div className="flex items-center gap-1 justify-end">
        {d.status === "NEGOTIATING" && <>
          <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(d.id, "SIGNED")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Sign</Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={() => updateStatus(d.id, "DROPPED")}><XCircle className="h-3.5 w-3.5 mr-1" />Drop</Button>
        </>}
        {d.status === "SIGNED" && <Button size="sm" variant="ghost" className="h-8 text-xs text-indigo-700 hover:bg-indigo-50" onClick={() => updateStatus(d.id, "CLOSED")}><ArrowRight className="h-3.5 w-3.5 mr-1" />Close</Button>}
      </div>
    )},
  ];

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Deal flow" subtitle="Monitor commitments and deal status across the platform." actions={<RefreshButton onClick={load} loading={loading} />} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total deals" value={deals.length} icon={Handshake} loading={loading} />
        <StatCard label="Active volume" value={fmt(total)} icon={DollarSign} tone="info" loading={loading} />
        <StatCard label="Signed value" value={fmt(signed)} icon={CheckCircle2} tone="positive" loading={loading} />
        <StatCard label="Negotiating" value={counts.NEGOTIATING || 0} icon={TrendingUp} tone="warning" loading={loading} />
      </div>
      <SectionCard
        title="Deals"
        actions={
          <div className="flex p-1 rounded-lg bg-muted">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No deals yet." />
      </SectionCard>
    </PageShell>
  );
}
