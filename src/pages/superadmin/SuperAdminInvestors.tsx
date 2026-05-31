import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, DataTable, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldX, ExternalLink, Search, Download, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Investor = any;

const TABS = ["ALL", "VERIFIED", "PENDING", "REJECTED"];

export default function SuperAdminInvestors() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("investor_profiles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setInvestors((data as any) ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = investors.filter((i) => {
    if (tab === "VERIFIED" && !i.verified) return false;
    if (tab === "PENDING" && (i.verified || i.verification_status === "REJECTED")) return false;
    if (tab === "REJECTED" && i.verification_status !== "REJECTED") return false;
    if (search && !`${i.full_name ?? ""} ${i.company_fund_name ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    ALL: investors.length,
    VERIFIED: investors.filter((i) => i.verified).length,
    PENDING: investors.filter((i) => !i.verified && i.verification_status !== "REJECTED").length,
    REJECTED: investors.filter((i) => i.verification_status === "REJECTED").length,
  };

  const verify = async (id: string) => {
    const { error } = await supabase.from("investor_profiles").update({ verified: true, verification_status: "APPROVED", verified_at: new Date().toISOString() } as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Verified"); load();
  };
  const revoke = async (id: string) => {
    const { error } = await supabase.from("investor_profiles").update({ verified: false, verification_status: "REJECTED" } as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Revoked"); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this investor profile?")) return;
    const { error } = await supabase.from("investor_profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const fmt = (v: number | null) => !v ? "—" : v >= 1e7 ? `₹${(v/1e7).toFixed(1)}Cr` : v >= 1e5 ? `₹${(v/1e5).toFixed(1)}L` : `₹${v.toLocaleString("en-IN")}`;

  const statusTone = (i: any) => i.verified ? "positive" : i.verification_status === "REJECTED" ? "danger" : "warning";
  const statusLabel = (i: any) => i.verified ? "Verified" : i.verification_status === "REJECTED" ? "Rejected" : "Pending";

  const columns: Column<Investor>[] = [
    { key: "name", header: "Investor", cell: (i) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{i.full_name || `Investor ${i.user_id?.slice(0,8)}…`}</p>
        {i.company_fund_name && <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><Building2 className="h-3 w-3" />{i.company_fund_name}</p>}
      </div>
    )},
    { key: "ticket", header: "Ticket size", width: "180px", cell: (i) => <span className="text-sm text-muted-foreground">{fmt(i.ticket_size_min)} – {fmt(i.ticket_size_max)}</span> },
    { key: "exp", header: "Experience", width: "120px", cell: (i) => <span className="text-sm text-muted-foreground">{i.investment_experience || "—"}</span> },
    { key: "status", header: "Status", width: "120px", cell: (i) => <StatusPill label={statusLabel(i)} tone={statusTone(i) as any} /> },
    { key: "actions", header: "", width: "240px", align: "right", cell: (i) => (
      <div className="flex items-center gap-1 justify-end">
        {i.linkedin_url && <Button asChild size="sm" variant="ghost" className="h-8 text-xs"><a href={i.linkedin_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>}
        {!i.verified && i.verification_status !== "REJECTED" && <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-700 hover:bg-emerald-50" onClick={() => verify(i.id)}><ShieldCheck className="h-3.5 w-3.5 mr-1" />Verify</Button>}
        {i.verified && <Button size="sm" variant="ghost" className="h-8 text-xs text-amber-700 hover:bg-amber-50" onClick={() => revoke(i.id)}><ShieldX className="h-3.5 w-3.5 mr-1" />Revoke</Button>}
        <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={() => remove(i.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  const exportCSV = () => {
    const rows = [["Name","Company","Verified","Min","Max"], ...filtered.map((i) => [i.full_name ?? "", i.company_fund_name ?? "", i.verified ? "Y" : "N", i.ticket_size_min ?? "", i.ticket_size_max ?? ""])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })); a.download = "investors.csv"; a.click();
    toast.success("Exported");
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="All investors"
        subtitle="Verify, revoke and manage investor profiles."
        actions={<>
          <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={exportCSV}><Download className="h-3.5 w-3.5" />Export CSV</Button>
          <RefreshButton onClick={load} loading={loading} />
        </>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.ALL} icon={ShieldCheck} loading={loading} />
        <StatCard label="Verified" value={counts.VERIFIED} icon={ShieldCheck} tone="positive" loading={loading} />
        <StatCard label="Pending" value={counts.PENDING} tone="warning" loading={loading} />
        <StatCard label="Rejected" value={counts.REJECTED} icon={ShieldX} tone="danger" loading={loading} />
      </div>

      <SectionCard
        title="Investor directory"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-lg bg-muted">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search investors…" className="pl-8 h-9 text-[13px] rounded-lg" />
            </div>
          </div>
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No investors match." />
      </SectionCard>
    </PageShell>
  );
}
