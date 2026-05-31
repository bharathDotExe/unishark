import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, DataTable, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Download, Search, Shield, User, FileText, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Log = { id: string; timestamp: string; actor: string; action: string; target: string; category: string; severity: "INFO"|"WARN"|"ERROR"; ip?: string };

const CAT_ICON: any = { AUTH: User, PITCH: FileText, INVESTOR: ShieldCheck, USER: User, SETTINGS: Settings, SYSTEM: Shield };

export default function SuperAdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sev, setSev] = useState("ALL");
  const [cat, setCat] = useState("ALL");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("audit_logs" as any).select("id,action,target_id,category,severity,ip_address,created_at,actor:actor_id(email,full_name)").order("created_at", { ascending: false }).limit(200);
    if (error) { toast.error(error.message); setLoading(false); return; }
    setLogs(((data as any[]) ?? []).map((l) => ({
      id: l.id, timestamp: l.created_at,
      actor: l.actor?.email || l.actor?.full_name || "System",
      action: l.action, target: l.target_id || "—",
      category: l.category || "SYSTEM", severity: l.severity || "INFO", ip: l.ip_address,
    })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = logs.filter((l) =>
    (sev === "ALL" || l.severity === sev) &&
    (cat === "ALL" || l.category === cat) &&
    (!search || `${l.action} ${l.actor} ${l.target}`.toLowerCase().includes(search.toLowerCase()))
  );

  const tone = (s: string): any => s === "ERROR" ? "danger" : s === "WARN" ? "warning" : "positive";

  const columns: Column<Log>[] = [
    { key: "event", header: "Event", cell: (l) => {
      const Icon = CAT_ICON[l.category] || Shield;
      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0"><Icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate"><span className="font-medium">{l.actor}</span> <span className="text-muted-foreground">· {l.action}</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">→ {l.target} {l.ip && <span className="font-mono ml-2">{l.ip}</span>}</p>
          </div>
        </div>
      );
    }},
    { key: "cat", header: "Category", width: "120px", cell: (l) => <span className="text-xs text-muted-foreground">{l.category}</span> },
    { key: "sev", header: "Severity", width: "110px", cell: (l) => <StatusPill label={l.severity} tone={tone(l.severity)} /> },
    { key: "time", header: "Time", width: "160px", cell: (l) => <span className="text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
  ];

  const exportCSV = () => {
    const rows = [["ID","Time","Actor","Action","Target","Cat","Sev","IP"], ...filtered.map((l) => [l.id, l.timestamp, l.actor, `"${l.action}"`, l.target, l.category, l.severity, l.ip || ""])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })); a.download = "audit-logs.csv"; a.click();
    toast.success("Exported");
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Audit logs" subtitle="Trail of administrative and system actions." actions={<>
        <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={exportCSV}><Download className="h-3.5 w-3.5" />Export</Button>
        <RefreshButton onClick={load} loading={loading} />
      </>} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total" value={logs.length} icon={ScrollText} loading={loading} />
        <StatCard label="Warnings" value={logs.filter((l) => l.severity === "WARN").length} tone="warning" loading={loading} />
        <StatCard label="Errors" value={logs.filter((l) => l.severity === "ERROR").length} tone="danger" loading={loading} />
      </div>
      <SectionCard title="Activity" actions={
        <div className="flex items-center gap-2">
          <select value={sev} onChange={(e) => setSev(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-2 text-[12px]">
            {["ALL","INFO","WARN","ERROR"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-2 text-[12px]">
            {["ALL","AUTH","PITCH","INVESTOR","USER","SETTINGS","SYSTEM"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-8 h-9 text-[13px] rounded-lg" />
          </div>
        </div>
      }>
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No logs found." />
      </SectionCard>
    </PageShell>
  );
}
