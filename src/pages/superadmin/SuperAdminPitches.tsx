import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Search, RefreshCw, CheckCircle2, XCircle, ExternalLink, Clock, Trash2, Download, Filter } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Pitch = { id: string; title: string; stage: string | null; funding_ask: string | null; status: string; created_at: string; user_id: string; description?: string | null };

const STATUS_TABS = ["ALL", "SUBMITTED", "APPROVED", "REJECTED", "DRAFT"];

export default function SuperAdminPitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [filtered, setFiltered] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("pitches").select("id,title,stage,funding_ask,status,created_at,user_id,description").order("created_at", { ascending: false });
    setPitches(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    let res = pitches;
    if (tab !== "ALL") res = res.filter(p => p.status === tab);
    if (search.trim()) res = res.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [pitches, tab, search]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("pitches").update({ status: "APPROVED" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Approved ✓"); load();
  };
  const reject = async (id: string) => {
    if (!reason.trim()) { toast.error("Provide a reason"); return; }
    const { error } = await supabase.from("pitches").update({ status: "REJECTED", rejection_reason: reason }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Rejected"); setRejectFor(null); setReason(""); load();
  };
  const deletePitch = async (id: string) => {
    const { error } = await supabase.from("pitches").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pitch deleted"); load();
  };

  const counts: any = {};
  STATUS_TABS.forEach(t => { counts[t] = t === "ALL" ? pitches.length : pitches.filter(p => p.status === t).length; });

  const statusClass: any = {
    APPROVED: "bg-green-500/10 text-green-400 border-green-500/30",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
    SUBMITTED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    DRAFT: "bg-muted text-muted-foreground border-white/20",
  };

  const exportCSV = () => {
    const rows = [["ID","Title","Stage","Status","Funding Ask","Created"], ...filtered.map(p => [p.id,p.title,p.stage||"",p.status,p.funding_ask||"",p.created_at?.slice(0,10)||""])];
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"})); a.download="pitches.csv"; a.click();
    toast.success("Exported ✓");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">All Pitches — Full Control</h1>
          <p className="text-muted-foreground text-sm mt-0.5">View, approve, reject or delete any pitch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border text-xs" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1.5" /> Export
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${tab === t ? "bg-white text-black border-white" : "border-border text-muted-foreground hover:border-white/30 hover:text-foreground"}`}>
            {t === "SUBMITTED" ? "Pending" : t.charAt(0) + t.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-60">{counts[t]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pitches..."
            className="pl-9 h-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:ring-0 text-sm" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i)=>(
          <Card key={i} className="p-5 border border-border bg-muted/40 animate-pulse"><div className="h-5 bg-muted rounded w-1/3 mb-2"/><div className="h-4 bg-muted rounded w-2/3"/></Card>
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border border-border bg-muted/40 text-center">
          <Filter className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3"/><p className="text-muted-foreground">No pitches found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="p-5 border border-border bg-muted/40 hover:bg-muted/40 transition-all overflow-hidden">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground">{p.title}</h3>
                    <Badge className={`border text-xs font-bold ${statusClass[p.status] || "bg-muted text-muted-foreground border-white/20"}`}>{p.status === "SUBMITTED" ? "PENDING" : p.status}</Badge>
                    {p.stage && <Badge className="bg-muted/50 text-muted-foreground border border-border text-xs">{p.stage}</Badge>}
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground/70">
                    {p.funding_ask && <span>Ask: <span className="text-muted-foreground font-medium">{p.funding_ask}</span></span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{new Date(p.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                    <span className="font-mono">{p.user_id.slice(0,10)}…</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <Button asChild variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border text-xs">
                    <Link to={`/pitches/${p.id}`}><ExternalLink className="h-3.5 w-3.5 mr-1.5"/>View</Link>
                  </Button>
                  {p.status !== "APPROVED" && (
                    <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-xs" onClick={() => approve(p.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5"/>Approve
                    </Button>
                  )}
                  {p.status !== "REJECTED" && (
                    <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs" onClick={() => setRejectFor(p.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5"/>Reject
                    </Button>
                  )}
                  <Button size="sm" className="bg-muted/50 hover:bg-red-500/20 text-muted-foreground/70 hover:text-red-400 border border-border hover:border-red-500/30 rounded-xl text-xs" onClick={() => deletePitch(p.id)}>
                    <Trash2 className="h-3.5 w-3.5"/>
                  </Button>
                </div>
              </div>
              {rejectFor === p.id && (
                <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3">
                  <Textarea placeholder="Rejection reason..." value={reason} onChange={e => setReason(e.target.value)} rows={2} className="bg-muted/50 border-red-500/30 text-foreground placeholder:text-muted-foreground/70 text-sm focus-visible:ring-0"/>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-foreground rounded-xl text-xs" onClick={() => reject(p.id)}>Confirm Reject</Button>
                    <Button size="sm" variant="ghost" className="rounded-xl text-xs text-muted-foreground" onClick={() => { setRejectFor(null); setReason(""); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
