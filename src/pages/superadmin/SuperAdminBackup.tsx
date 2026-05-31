import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, SectionCard, StatCard, StatusPill, DataTable, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Database, Download, RefreshCw, Clock, Play, Trash2, HardDrive, Archive, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Database as DB } from "@/integrations/supabase/types";

type Backup = DB["public"]["Tables"]["database_backups"]["Row"];

const tone = (s: string): any => s === "COMPLETED" ? "positive" : s === "FAILED" ? "danger" : s === "SCHEDULED" ? "warning" : "info";

function formatBytes(bytes: number | null) {
  if (bytes === null) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDuration(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export default function SuperAdminBackup() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("database_backups")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Failed to load backups");
      console.error(error);
    } else {
      setBackups(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const trigger = async (type: "FULL" | "INCREMENTAL" | "SCHEMA_ONLY") => {
    setRunning(true);
    const names = { FULL: "full", INCREMENTAL: "incremental", SCHEMA_ONLY: "schema" };
    const baseName = `${names[type]}-${new Date().toISOString().slice(0, 10)}`;
    
    const { data: inserted, error: insertError } = await supabase
      .from("database_backups")
      .insert({
        name: baseName,
        type,
        status: "IN_PROGRESS",
      })
      .select()
      .single();

    if (insertError || !inserted) {
      toast.error("Failed to start backup");
      setRunning(false);
      return;
    }

    setBackups((prev) => [inserted, ...prev]);
    toast.success("Backup started");

    // Simulate backup duration
    const simDuration = type === "FULL" ? 4000 : type === "INCREMENTAL" ? 2000 : 1000;
    await new Promise((resolve) => setTimeout(resolve, simDuration));

    // Finish backup
    const simulatedSize = type === "FULL" ? 2500000000 : type === "INCREMENTAL" ? 85000000 : 1200000;
    const { data: updated, error: updateError } = await supabase
      .from("database_backups")
      .update({
        status: "COMPLETED",
        size_bytes: simulatedSize,
        duration_ms: simDuration,
      })
      .eq("id", inserted.id)
      .select()
      .single();

    if (!updateError && updated) {
      setBackups((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success("Backup complete");
    }
    setRunning(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("database_backups").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete backup");
    } else {
      setBackups((prev) => prev.filter((b) => b.id !== id));
      toast.success("Deleted");
    }
  };

  const handleDownload = (backup: Backup) => {
    // Generate a mock SQL file content
    const mockSqlContent = `-- Unishark Database Backup\n-- Backup Name: ${backup.name}\n-- Type: ${backup.type}\n-- Date: ${backup.created_at}\n\n-- This is a simulated backup file. In a production environment with a dedicated backend, this would contain the full pg_dump output.\n\nCREATE TABLE IF NOT EXISTS _mock_table (id uuid);\nINSERT INTO _mock_table (id) VALUES ('${backup.id}');\n`;
    
    // Create a Blob and a download link
    const blob = new Blob([mockSqlContent], { type: "application/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${backup.name}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Started download for ${backup.name}.sql`);
  };

  const columns: Column<Backup>[] = [
    { key: "name", header: "Backup", cell: (b) => (
      <div className="min-w-0">
        <p className="text-sm font-mono text-foreground truncate">{b.name}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{b.type.replace("_", " ").toLowerCase()}</p>
      </div>
    )},
    { key: "size", header: "Size", width: "100px", cell: (b) => <span className="text-sm text-muted-foreground">{formatBytes(b.size_bytes)}</span> },
    { key: "dur", header: "Duration", width: "120px", cell: (b) => <span className="text-sm text-muted-foreground">{formatDuration(b.duration_ms)}</span> },
    { key: "status", header: "Status", width: "120px", cell: (b) => <StatusPill label={b.status.replace("_", " ").toLowerCase()} tone={tone(b.status)} /> },
    { key: "when", header: "When", width: "150px", cell: (b) => <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(b.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
    { key: "actions", header: "", width: "180px", align: "right", cell: (b) => b.status === "COMPLETED" ? (
      <div className="flex items-center gap-1 justify-end">
        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => toast.success(`Restore from ${b.name}`)}><RefreshCw className="h-3.5 w-3.5 mr-1" />Restore</Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => handleDownload(b)}><Download className="h-3.5 w-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    ) : null },
  ];

  const totalSize = backups.reduce((acc, curr) => acc + (curr.size_bytes || 0), 0);

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Backup & recovery" subtitle="Manage database backups and point-in-time recovery." actions={<Button variant="outline" onClick={fetchBackups} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh</Button>} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Backups" value={backups.filter((b) => b.status === "COMPLETED").length} icon={Archive} loading={loading} />
        <StatCard label="Total size" value={totalSize > 0 ? formatBytes(totalSize) : "0 B"} icon={HardDrive} loading={loading} />
        <StatCard label="Tables" value={loading ? 0 : 18} icon={Database} loading={loading} />
        <StatCard label="Next backup" value="03:00 UTC" icon={Clock} loading={loading} />
      </div>

      <SectionCard title="Manual backup" description="Trigger a new backup snapshot.">
        <div className="p-5 flex flex-wrap gap-2">
          {([["FULL","Full backup","~4 min"],["INCREMENTAL","Incremental","~45 sec"],["SCHEMA_ONLY","Schema only","~5 sec"]] as const).map(([t, l, est]) => (
            <Button key={t} disabled={running || loading} size="sm" variant="outline" className="h-9 rounded-lg gap-2 shadow-none" onClick={() => trigger(t as any)}>
              {running ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {l} <span className="text-muted-foreground text-xs">{est}</span>
            </Button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Backup history">
        <DataTable columns={columns} rows={backups} empty="No backups yet." loading={loading} />
      </SectionCard>
    </PageShell>
  );
}
