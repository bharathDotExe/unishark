import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Download, RefreshCw, Shield, Clock, CheckCircle2, AlertTriangle, Play, Trash2, HardDrive, Server, Archive, Zap, Calendar } from "lucide-react";
import { toast } from "sonner";

type Backup = {
  id: string; name: string; type: "FULL" | "INCREMENTAL" | "SCHEMA_ONLY";
  size: string; status: "COMPLETED" | "IN_PROGRESS" | "FAILED" | "SCHEDULED";
  created_at: string; duration?: string; tables?: number;
};

const MOCK_BACKUPS: Backup[] = [
  { id: "B001", name: "full-backup-2024-01-15", type: "FULL", size: "2.4 GB", status: "COMPLETED", created_at: "2024-01-15T03:00:00Z", duration: "4m 23s", tables: 18 },
  { id: "B002", name: "incremental-2024-01-14", type: "INCREMENTAL", size: "124 MB", status: "COMPLETED", created_at: "2024-01-14T03:00:00Z", duration: "42s", tables: 18 },
  { id: "B003", name: "incremental-2024-01-13", type: "INCREMENTAL", size: "98 MB", status: "COMPLETED", created_at: "2024-01-13T03:00:00Z", duration: "38s", tables: 18 },
  { id: "B004", name: "schema-only-2024-01-12", type: "SCHEMA_ONLY", size: "1.2 MB", status: "COMPLETED", created_at: "2024-01-12T03:00:00Z", duration: "5s" },
  { id: "B005", name: "full-backup-2024-01-08", type: "FULL", size: "2.1 GB", status: "COMPLETED", created_at: "2024-01-08T03:00:00Z", duration: "3m 58s", tables: 17 },
  { id: "B006", name: "incremental-2024-01-16", type: "INCREMENTAL", size: "—", status: "SCHEDULED", created_at: "2024-01-16T03:00:00Z" },
];

const TYPE_COLORS: any = {
  FULL: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  INCREMENTAL: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  SCHEMA_ONLY: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};
const STATUS_COLORS: any = {
  COMPLETED: { badge: "bg-green-500/10 text-green-400 border-green-500/30", icon: CheckCircle2, color: "text-green-400" },
  IN_PROGRESS: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/30", icon: RefreshCw, color: "text-blue-400" },
  FAILED: { badge: "bg-red-500/10 text-red-400 border-red-500/30", icon: AlertTriangle, color: "text-red-400" },
  SCHEDULED: { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: Clock, color: "text-amber-400" },
};

export default function SuperAdminBackup() {
  const [backups, setBackups] = useState<Backup[]>(MOCK_BACKUPS);
  const [running, setRunning] = useState(false);

  const triggerBackup = async (type: Backup["type"]) => {
    setRunning(true);
    const newId = `B${(backups.length + 1).toString().padStart(3, "0")}`;
    const names = { FULL: "full-backup", INCREMENTAL: "incremental", SCHEMA_ONLY: "schema-only" };
    const newBackup: Backup = {
      id: newId, name: `${names[type]}-${new Date().toISOString().slice(0,10)}`,
      type, size: "—", status: "IN_PROGRESS", created_at: new Date().toISOString(),
    };
    setBackups(prev => [newBackup, ...prev]);
    toast.success("Backup started…");
    await new Promise(r => setTimeout(r, 3000));
    const sizes = { FULL: "2.5 GB", INCREMENTAL: "85 MB", SCHEMA_ONLY: "1.2 MB" };
    const durations = { FULL: "4m 11s", INCREMENTAL: "39s", SCHEMA_ONLY: "5s" };
    setBackups(prev => prev.map(b => b.id === newId ? { ...b, status: "COMPLETED", size: sizes[type], duration: durations[type], tables: 18 } : b));
    setRunning(false);
    toast.success(`${type} backup completed ✓`);
  };

  const deleteBackup = (id: string) => {
    setBackups(prev => prev.filter(b => b.id !== id));
    toast.success("Backup deleted");
  };

  const restore = (name: string) => {
    toast.success(`Restore initiated from: ${name}`);
  };

  const stats = {
    total: backups.filter(b => b.status === "COMPLETED").length,
    lastFull: backups.find(b => b.type === "FULL" && b.status === "COMPLETED"),
    totalSize: "4.6 GB",
    nextScheduled: "2024-01-16 03:00 UTC",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">Database Backup & Recovery</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage database backups and point-in-time recovery</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Backups", value: stats.total,         icon: Archive,   grad: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/20" },
          { label: "Total Size",    value: stats.totalSize,     icon: HardDrive, grad: "from-sky-500 to-cyan-600",    glow: "shadow-sky-500/20" },
          { label: "Tables",        value: "18",                 icon: Database,  grad: "from-purple-500 to-indigo-600",glow:"shadow-purple-500/20" },
          { label: "Next Backup",   value: "03:00 UTC",         icon: Clock,     grad: "from-amber-500 to-orange-600",glow:"shadow-amber-500/20" },
        ].map(k=>(
          <Card key={k.label} className="p-4 border border-white/[0.08] bg-white/[0.03] relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -translate-y-8 translate-x-8 bg-gradient-to-br ${k.grad} opacity-10 blur-xl`}/>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/40">{k.label}</p>
              <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${k.grad} flex items-center justify-center shadow-lg ${k.glow}`}>
                <k.icon className="h-4 w-4 text-white"/>
              </div>
            </div>
            <p className="text-xl font-extrabold text-white">{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Alert */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0"/>
        <div>
          <p className="text-sm font-bold text-green-400">Backup policy: Healthy</p>
          <p className="text-xs text-green-400/60">Daily incremental + weekly full backups running on schedule. Last full: {stats.lastFull ? new Date(stats.lastFull.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "—"}</p>
        </div>
      </div>

      {/* Trigger Backup */}
      <Card className="p-5 border border-white/[0.08] bg-white/[0.03]">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400"/> Manual Backup
        </h2>
        <div className="flex flex-wrap gap-3">
          {([["FULL","Full Backup","~4 min","from-blue-500 to-indigo-600"],["INCREMENTAL","Incremental","~45 sec","from-sky-500 to-cyan-600"],["SCHEMA_ONLY","Schema Only","~5 sec","from-purple-500 to-indigo-600"]] as const).map(([type,label,est,grad])=>(
            <Button key={type} disabled={running}
              className={`bg-gradient-to-r ${grad} text-white border-0 rounded-xl shadow-lg hover:opacity-90 text-sm`}
              onClick={()=>triggerBackup(type as any)}>
              {running ? <RefreshCw className="h-4 w-4 mr-2 animate-spin"/> : <Play className="h-4 w-4 mr-2"/>}
              {label} <span className="ml-1.5 text-white/60 text-xs">({est})</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Backup History */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Archive className="h-4 w-4 text-white/40"/> Backup History
        </h2>
        <div className="space-y-2">
          {backups.map(backup => {
            const sc = STATUS_COLORS[backup.status];
            const StatusIcon = sc.icon;
            return (
              <Card key={backup.id} className="px-4 py-3 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-all">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <StatusIcon className={`h-4 w-4 shrink-0 ${sc.color} ${backup.status==="IN_PROGRESS"?"animate-spin":""}`}/>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-mono font-medium text-white/80 truncate">{backup.name}</p>
                        <Badge className={`border text-[10px] font-bold ${TYPE_COLORS[backup.type]}`}>{backup.type.replace("_"," ")}</Badge>
                        <Badge className={`border text-[10px] font-bold ${sc.badge}`}>{backup.status.replace("_"," ")}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-white/30">
                        <span>{backup.size}</span>
                        {backup.duration && <span>Duration: {backup.duration}</span>}
                        {backup.tables && <span>{backup.tables} tables</span>}
                        <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5"/>{new Date(backup.created_at).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                    </div>
                  </div>
                  {backup.status === "COMPLETED" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/[0.08] rounded-xl text-xs" onClick={()=>restore(backup.name)}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5"/>Restore
                      </Button>
                      <Button size="sm" className="bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/[0.08] rounded-xl text-xs">
                        <Download className="h-3.5 w-3.5"/>
                      </Button>
                      <Button size="sm" className="bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 rounded-xl text-xs" onClick={()=>deleteBackup(backup.id)}>
                        <Trash2 className="h-3.5 w-3.5"/>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
