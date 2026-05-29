import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, Download, Filter, Clock, User, Shield, FileText, ShieldCheck, MessageSquare, Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type LogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: "superadmin" | "admin" | "system";
  action: string;
  target: string;
  category: "AUTH" | "PITCH" | "INVESTOR" | "USER" | "SETTINGS" | "SYSTEM";
  severity: "INFO" | "WARN" | "ERROR";
  ip?: string;
};

const CATEGORY_ICONS: any = {
  AUTH: User, PITCH: FileText, INVESTOR: ShieldCheck, USER: User, SETTINGS: Settings, SYSTEM: Shield,
};
const CATEGORY_COLORS: any = {
  AUTH: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PITCH: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  INVESTOR: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  USER: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  SETTINGS: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  SYSTEM: "bg-slate-500/10 text-slate-400 border-slate-500/30",
};
const SEVERITY_COLORS: any = {
  INFO:  "bg-green-500/10 text-green-400 border-green-500/30",
  WARN:  "bg-amber-500/10 text-amber-400 border-amber-500/30",
  ERROR: "bg-red-500/10 text-red-400 border-red-500/30",
};
const ROLE_COLORS: any = {
  superadmin: "text-yellow-400", admin: "text-purple-400", system: "text-blue-400",
};

export default function SuperAdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [sevFilter, setSevFilter] = useState("ALL");

  const loadLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        id, action, target_id, category, severity, ip_address, created_at,
        actor:actor_id ( email, full_name )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else if (data) {
      const formatted: LogEntry[] = (data as any[]).map(l => ({
        id: l.id,
        timestamp: l.created_at,
        actor: l.actor?.email || l.actor?.full_name || "System",
        actorRole: l.actor ? "admin" : "system", // We default to admin/system for visual distinction
        action: l.action,
        target: l.target_id || "System",
        category: l.category,
        severity: l.severity,
        ip: l.ip_address,
      }));
      setLogs(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => {
    const matchCat = catFilter === "ALL" || l.category === catFilter;
    const matchSev = sevFilter === "ALL" || l.severity === sevFilter;
    const matchSearch = !search.trim() || l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSev && matchSearch;
  });

  const exportCSV = () => {
    const rows = [["ID","Timestamp","Actor","Role","Action","Target","Category","Severity","IP"],
      ...filtered.map(l=>[l.id,l.timestamp,l.actor,l.actorRole,`"${l.action}"`,l.target,l.category,l.severity,l.ip||""])];
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"})); a.download="audit-logs.csv"; a.click();
    toast.success("Exported ✓");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">Activity Logs & Audit</h1>
          <p className="text-white/40 text-sm mt-0.5">Complete trail of all admin and system actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-white/50 hover:text-white border border-white/[0.08] text-xs" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5"/>Export Logs</Button>
          <Button variant="ghost" size="sm" className="rounded-xl text-white/50 hover:text-white border border-white/[0.08] text-xs" onClick={loadLogs}><RefreshCw className="h-4 w-4 mr-1.5"/>Refresh</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Logs",   value: loading ? "—" : logs.length,                             color: "text-white",       b: "border-white/10" },
          { label: "Warnings",     value: loading ? "—" : logs.filter(l=>l.severity==="WARN").length, color: "text-amber-400", b: "border-amber-500/20" },
          { label: "Errors",       value: loading ? "—" : logs.filter(l=>l.severity==="ERROR").length, color: "text-red-400",  b: "border-red-500/20" },
        ].map(s=>(
          <Card key={s.label} className={`p-4 border ${s.b} bg-white/[0.03]`}><p className="text-xs text-white/40 mb-1">{s.label}</p><p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          {["ALL","INFO","WARN","ERROR"].map(s=>(
            <button key={s} onClick={()=>setSevFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${sevFilter===s?"bg-white text-black border-white":"border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL","AUTH","PITCH","INVESTOR","USER","SETTINGS","SYSTEM"].map(c=>(
            <button key={c} onClick={()=>setCatFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${catFilter===c?"bg-white text-black border-white":"border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30"/>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search logs..."
            className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 rounded-xl focus-visible:ring-0 text-sm"/>
        </div>
      </div>

      {/* Log Table */}
      {loading ? (
        <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Card key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border border-white/[0.08] bg-white/[0.03] text-center">
          <Filter className="h-10 w-10 text-white/20 mx-auto mb-3"/><p className="text-white/50">No logs match your filters</p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(log => {
            const CatIcon = CATEGORY_ICONS[log.category] || Shield;
            return (
              <Card key={log.id} className={`px-4 py-3 border bg-white/[0.02] hover:bg-white/[0.04] transition-all ${log.severity === "ERROR" ? "border-red-500/20" : log.severity === "WARN" ? "border-amber-500/15" : "border-white/[0.06]"}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${CATEGORY_COLORS[log.category]}`}>
                    <CatIcon className="h-3.5 w-3.5"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${ROLE_COLORS[log.actorRole]}`}>{log.actor}</span>
                      <span className="text-white/20 text-xs">·</span>
                      <p className="text-sm text-white/70 font-medium">{log.action}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={`border text-[10px] font-bold ${CATEGORY_COLORS[log.category]}`}>{log.category}</Badge>
                      <Badge className={`border text-[10px] font-bold ${SEVERITY_COLORS[log.severity]}`}>{log.severity}</Badge>
                      <span className="text-[10px] text-white/30">→ {log.target}</span>
                      {log.ip && <span className="text-[10px] text-white/20 font-mono">{log.ip}</span>}
                      <span className="text-[10px] text-white/25 flex items-center gap-1 ml-auto"><Clock className="h-2.5 w-2.5"/>{new Date(log.timestamp).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
