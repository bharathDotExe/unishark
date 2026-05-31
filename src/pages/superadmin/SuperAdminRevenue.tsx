import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, DataTable, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, Download } from "lucide-react";
import { toast } from "sonner";

type Tx = { id: string; type: "SUBSCRIPTION"|"COMMISSION"|"OTHER"; amount: number; status: "SUCCESS"|"PENDING"|"FAILED"; date: string; description: string };

const TABS = ["ALL", "SUBSCRIPTION", "COMMISSION", "OTHER"];

export default function SuperAdminRevenue() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("transactions" as any).select("id,type,amount,status,created_at,reference_id,user:user_id(full_name)").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }
    setTxs(((data as any[]) ?? []).map((t) => ({
      id: t.id, type: t.type, amount: Number(t.amount), status: t.status, date: t.created_at,
      description: t.reference_id || `${t.type} · ${t.user?.full_name || "Unknown"}`,
    })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const fmt = (v: number) => { const a = Math.abs(v); const s = a >= 1e5 ? `₹${(a/1e5).toFixed(1)}L` : `₹${a.toLocaleString("en-IN")}`; return v < 0 ? `-${s}` : s; };
  const income = txs.filter((t) => t.amount > 0 && t.status === "SUCCESS").reduce((a, b) => a + b.amount, 0);
  const outgo = txs.filter((t) => t.amount < 0 && t.status === "SUCCESS").reduce((a, b) => a + Math.abs(b.amount), 0);
  const pending = txs.filter((t) => t.status === "PENDING").reduce((a, b) => a + b.amount, 0);
  const filtered = tab === "ALL" ? txs : txs.filter((t) => t.type === tab);

  const tone = (s: string): any => s === "SUCCESS" ? "positive" : s === "FAILED" ? "danger" : "warning";

  const columns: Column<Tx>[] = [
    { key: "desc", header: "Description", cell: (t) => (
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${t.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {t.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
      </div>
    )},
    { key: "type", header: "Type", width: "150px", cell: (t) => <span className="text-sm text-muted-foreground">{t.type.charAt(0) + t.type.slice(1).toLowerCase()}</span> },
    { key: "status", header: "Status", width: "120px", cell: (t) => <StatusPill label={t.status.charAt(0) + t.status.slice(1).toLowerCase()} tone={tone(t.status)} /> },
    { key: "amount", header: "Amount", width: "140px", align: "right", cell: (t) => <span className={`text-sm font-semibold tabular-nums ${t.amount > 0 ? "text-emerald-700" : "text-red-700"}`}>{fmt(t.amount)}</span> },
  ];

  const exportCSV = () => {
    const rows = [["ID","Type","Amount","Status","Date"], ...txs.map((t) => [t.id, t.type, t.amount, t.status, t.date.slice(0,10)])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })); a.download = "revenue.csv"; a.click();
    toast.success("Exported");
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Revenue" subtitle="Platform financial overview and transaction log." actions={<>
        <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={exportCSV}><Download className="h-3.5 w-3.5" />Export</Button>
        <RefreshButton onClick={load} loading={loading} />
      </>} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total revenue" value={fmt(income)} icon={DollarSign} tone="positive" loading={loading} />
        <StatCard label="Net" value={fmt(income - outgo)} icon={TrendingUp} loading={loading} />
        <StatCard label="Payouts" value={fmt(outgo)} icon={ArrowDownRight} tone="danger" loading={loading} />
        <StatCard label="Pending" value={fmt(pending)} icon={Clock} tone="warning" loading={loading} />
      </div>
      <SectionCard title="Transactions" actions={
        <div className="flex p-1 rounded-lg bg-muted">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t.charAt(0) + t.slice(1).toLowerCase()}</button>
          ))}
        </div>
      }>
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No transactions." />
      </SectionCard>
    </PageShell>
  );
}
