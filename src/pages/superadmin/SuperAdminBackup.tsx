import { useState } from "react";
import { PageShell, PageHeader, SectionCard, StatCard, StatusPill, DataTable, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Database, Download, RefreshCw, Clock, Play, Trash2, HardDrive, Archive, Calendar } from "lucide-react";
import { toast } from "sonner";

type Backup = { id: string; name: string; type: "FULL"|"INCREMENTAL"|"SCHEMA_ONLY"; size: string; status: "COMPLETED"|"IN_PROGRESS"|"FAILED"|"SCHEDULED"; created_at: string; duration?: string };

const SEED: Backup[] = [
  { id: "B001", name: "full-2024-01-15", type: "FULL", size: "2.4 GB", status: "COMPLETED", created_at: "2024-01-15T03:00:00Z", duration: "4m 23s" },
  { id: "B002", name: "incremental-2024-01-14", type: "INCREMENTAL", size: "124 MB", status: "COMPLETED", created_at: "2024-01-14T03:00:00Z", duration: "42s" },
  { id: "B003", name: "incremental-2024-01-13", type: "INCREMENTAL", size: "98 MB", status: "COMPLETED", created_at: "2024-01-13T03:00:00Z", duration: "38s" },
  { id: "B004", name: "schema-2024-01-12", type: "SCHEMA_ONLY", size: "1.2 MB", status: "COMPLETED", created_at: "2024-01-12T03:00:00Z", duration: "5s" },
];

const tone = (s: Backup["status"]): any => s === "COMPLETED" ? "positive" : s === "FAILED" ? "danger" : s === "SCHEDULED" ? "warning" : "info";

export default function SuperAdminBackup() {
  const [backups, setBackups] = useState<Backup[]>(SEED);
  const [running, setRunning] = useState(false);

  const trigger = async (type: Backup["type"]) => {
    setRunning(true);
    const id = `B${(backups.length + 1).toString().padStart(3, "0")}`;
    const names = { FULL: "full", INCREMENTAL: "incremental", SCHEMA_ONLY: "schema" };
    setBackups((p) => [{ id, name: `${names[type]}-${new Date().toISOString().slice(0,10)}`, type, size: "—", status: "IN_PROGRESS", created_at: new Date().toISOString() }, ...p]);
    toast.success("Backup started");
    await new Promise((r) => setTimeout(r, 1500));
    setBackups((p) => p.map((b) => b.id === id ? { ...b, status: "COMPLETED", size: type === "FULL" ? "2.5 GB" : type === "INCREMENTAL" ? "85 MB" : "1.2 MB", duration: type === "FULL" ? "4m" : "30s" } : b));
    setRunning(false);
    toast.success("Backup complete");
  };
  const remove = (id: string) => { setBackups((p) => p.filter((b) => b.id !== id)); toast.success("Deleted"); };

  const columns: Column<Backup>[] = [
    { key: "name", header: "Backup", cell: (b) => (
      <div className="min-w-0">
        <p className="text-sm font-mono text-foreground truncate">{b.name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{b.type.replace("_", " ").toLowerCase()}</p>
      </div>
    )},
    { key: "size", header: "Size", width: "100px", cell: (b) => <span className="text-sm text-muted-foreground">{b.size}</span> },
    { key: "dur", header: "Duration", width: "120px", cell: (b) => <span className="text-sm text-muted-foreground">{b.duration || "—"}</span> },
    { key: "status", header: "Status", width: "120px", cell: (b) => <StatusPill label={b.status.replace("_", " ").toLowerCase()} tone={tone(b.status)} /> },
    { key: "when", header: "When", width: "150px", cell: (b) => <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
    { key: "actions", header: "", width: "180px", align: "right", cell: (b) => b.status === "COMPLETED" ? (
      <div className="flex items-center gap-1 justify-end">
        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => toast.success(`Restore from ${b.name}`)}><RefreshCw className="h-3.5 w-3.5 mr-1" />Restore</Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs"><Download className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) : null },
  ];

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Backup & recovery" subtitle="Manage database backups and point-in-time recovery." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Backups" value={backups.filter((b) => b.status === "COMPLETED").length} icon={Archive} />
        <StatCard label="Total size" value="4.6 GB" icon={HardDrive} />
        <StatCard label="Tables" value={18} icon={Database} />
        <StatCard label="Next backup" value="03:00 UTC" icon={Clock} />
      </div>

      <SectionCard title="Manual backup" description="Trigger a new backup snapshot.">
        <div className="p-5 flex flex-wrap gap-2">
          {([["FULL","Full backup","~4 min"],["INCREMENTAL","Incremental","~45 sec"],["SCHEMA_ONLY","Schema only","~5 sec"]] as const).map(([t, l, est]) => (
            <Button key={t} disabled={running} size="sm" variant="outline" className="h-9 rounded-lg gap-2 shadow-none" onClick={() => trigger(t as any)}>
              {running ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {l} <span className="text-muted-foreground text-xs">{est}</span>
            </Button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Backup history">
        <DataTable columns={columns} rows={backups} empty="No backups yet." />
      </SectionCard>
    </PageShell>
  );
}
