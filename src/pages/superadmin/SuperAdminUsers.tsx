import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageShell, PageHeader, StatCard, SectionCard, DataTable, RoleBadge, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Users, Search, Mail, Download, GraduationCap, Briefcase, Shield } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  user_id: string;
  full_name: string;
  role: "student" | "investor" | "admin" | "superadmin";
  city?: string | null;
  created_at: string;
  email?: string;
};

const ROLE_FILTERS = ["ALL", "student", "investor", "admin"] as const;

export default function SuperAdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const [s, i, r] = await Promise.all([
      supabase.from("student_profiles").select("id,user_id,full_name,city,created_at"),
      supabase.from("investor_profiles").select("id,user_id,full_name,city,created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, string>();
    (r.data ?? []).forEach((x: any) => roleMap.set(x.user_id, x.role));

    const students: Row[] = (s.data ?? []).map((x: any) => ({
      id: x.id, user_id: x.user_id, full_name: x.full_name, city: x.city,
      created_at: x.created_at, role: (roleMap.get(x.user_id) as any) || "student",
    }));
    const investors: Row[] = (i.data ?? []).map((x: any) => ({
      id: x.id, user_id: x.user_id, full_name: x.full_name, city: x.city,
      created_at: x.created_at, role: (roleMap.get(x.user_id) as any) || "investor",
    }));
    setRows([...students, ...investors].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search && !`${u.full_name} ${u.city ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    ALL: rows.length,
    student: rows.filter((r) => r.role === "student").length,
    investor: rows.filter((r) => r.role === "investor").length,
    admin: rows.filter((r) => r.role === "admin" || r.role === "superadmin").length,
  };

  const exportCSV = () => {
    const data = [["Name", "Role", "City", "Joined", "UserID"], ...filtered.map((r) => [r.full_name, r.role, r.city ?? "", r.created_at?.slice(0, 10) ?? "", r.user_id])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "users.csv"; a.click();
    toast.success("Exported");
  };

  const columns: Column<Row>[] = [
    { key: "name", header: "Name", cell: (r) => (
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{r.full_name || "—"}</p>
        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{r.user_id.slice(0, 12)}…</p>
      </div>
    )},
    { key: "role", header: "Role", width: "140px", cell: (r) => <RoleBadge role={r.role} /> },
    { key: "city", header: "City", width: "160px", cell: (r) => <span className="text-sm text-muted-foreground">{r.city || "—"}</span> },
    { key: "joined", header: "Joined", width: "140px", cell: (r) => (
      <span className="text-sm text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
    )},
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="All users"
        subtitle="Full directory of student founders and investors across the platform."
        actions={<>
          <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={exportCSV}><Download className="h-3.5 w-3.5" />Export CSV</Button>
          <RefreshButton onClick={load} loading={loading} />
        </>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.ALL} icon={Users} loading={loading} />
        <StatCard label="Students" value={counts.student} icon={GraduationCap} tone="info" loading={loading} />
        <StatCard label="Investors" value={counts.investor} icon={Briefcase} tone="positive" loading={loading} />
        <StatCard label="Admins" value={counts.admin} icon={Shield} tone="warning" loading={loading} />
      </div>

      <SectionCard
        title="Directory"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
              {ROLE_FILTERS.map((f) => (
                <button key={f} onClick={() => setRoleFilter(f)} className={`px-3 h-7 rounded-md text-[12px] font-medium capitalize transition-colors ${roleFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {f === "ALL" ? "All" : f}
                </button>
              ))}
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or city…" className="pl-8 h-9 text-[13px] rounded-lg" />
            </div>
          </div>
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No users match." />
      </SectionCard>
    </PageShell>
  );
}
