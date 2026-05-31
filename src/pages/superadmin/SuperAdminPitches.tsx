import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, DataTable, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, CheckCircle2, XCircle, Trash2, Download, Search, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

type Pitch = { id: string; title: string; stage: string | null; funding_ask: string | null; status: string; created_at: string; user_id: string };

const TABS = ["ALL", "SUBMITTED", "APPROVED", "REJECTED", "DRAFT"];

export default function SuperAdminPitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [rejectFor, setRejectFor] = useState<Pitch | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("pitches").select("id,title,stage,funding_ask,status,created_at,user_id").order("created_at", { ascending: false });
    setPitches((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = pitches.filter((p) => (tab === "ALL" || p.status === tab) && (!search || p.title.toLowerCase().includes(search.toLowerCase())));
  const counts: Record<string, number> = { ALL: pitches.length };
  TABS.slice(1).forEach((t) => { counts[t] = pitches.filter((p) => p.status === t).length; });

  const tone = (s: string): any => s === "APPROVED" ? "positive" : s === "REJECTED" ? "danger" : s === "SUBMITTED" ? "warning" : "neutral";

  const approve = async (id: string) => {
    const { error } = await supabase.from("pitches").update({ status: "APPROVED" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Approved"); load();
  };
  const submitReject = async () => {
    if (!rejectFor || !reason.trim()) return toast.error("Provide a reason");
    const { error } = await supabase.from("pitches").update({ status: "REJECTED", rejection_reason: reason } as any).eq("id", rejectFor.id);
    if (error) return toast.error(error.message);
    toast.success("Rejected"); setRejectFor(null); setReason(""); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this pitch permanently?")) return;
    const { error } = await supabase.from("pitches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };
  const exportCSV = () => {
    const rows = [["ID","Title","Stage","Status","Ask","Created"], ...filtered.map((p) => [p.id, p.title, p.stage ?? "", p.status, p.funding_ask ?? "", p.created_at?.slice(0,10)])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" })); a.download = "pitches.csv"; a.click();
    toast.success("Exported");
  };

  const columns: Column<Pitch>[] = [
    { key: "title", header: "Pitch", cell: (p) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{p.user_id.slice(0,12)}…</p>
      </div>
    )},
    { key: "stage", header: "Stage", width: "120px", cell: (p) => <span className="text-sm text-muted-foreground">{p.stage || "—"}</span> },
    { key: "ask", header: "Ask", width: "130px", cell: (p) => <span className="text-sm text-muted-foreground">{p.funding_ask || "—"}</span> },
    { key: "status", header: "Status", width: "130px", cell: (p) => <StatusPill label={p.status === "SUBMITTED" ? "Pending" : p.status} tone={tone(p.status)} /> },
    { key: "date", header: "Submitted", width: "140px", cell: (p) => <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(p.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short" })}</span> },
    { key: "actions", header: "", width: "260px", align: "right", cell: (p) => (
      <div className="flex items-center gap-1 justify-end">
        <Button asChild size="sm" variant="ghost" className="h-8 text-xs"><Link to={`/pitches/${p.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
        {p.status !== "APPROVED" && <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-700 hover:bg-emerald-50" onClick={() => approve(p.id)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve</Button>}
        {p.status !== "REJECTED" && <Button size="sm" variant="ghost" className="h-8 text-xs text-amber-700 hover:bg-amber-50" onClick={() => { setRejectFor(p); setReason(""); }}><XCircle className="h-3.5 w-3.5 mr-1" />Reject</Button>}
        <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    )},
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="All pitches"
        subtitle="Review, override and remove any pitch on the platform."
        actions={<>
          <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={exportCSV}><Download className="h-3.5 w-3.5" />Export CSV</Button>
          <RefreshButton onClick={load} loading={loading} />
        </>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.ALL} icon={FileText} loading={loading} />
        <StatCard label="Pending" value={counts.SUBMITTED || 0} icon={Clock} tone="warning" loading={loading} />
        <StatCard label="Approved" value={counts.APPROVED || 0} icon={CheckCircle2} tone="positive" loading={loading} />
        <StatCard label="Rejected" value={counts.REJECTED || 0} icon={XCircle} tone="danger" loading={loading} />
      </div>

      <SectionCard
        title="Pitch queue"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-lg bg-muted">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {t === "SUBMITTED" ? "Pending" : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pitches…" className="pl-8 h-9 text-[13px] rounded-lg" />
            </div>
          </div>
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No pitches match." />
      </SectionCard>

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent className="rounded-xl">
          <DialogHeader><DialogTitle>Reject pitch</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{rejectFor?.title}</p>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (shared with the founder)…" rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject}>Confirm reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
