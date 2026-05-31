import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PageShell, PageHeader, StatCard, SectionCard,
  DataTable, RoleBadge, StatusPill, RefreshButton, Column,
} from "@/components/admin/ui";
import {
  Users, Search, Download, GraduationCap, Briefcase,
  Shield, Ban, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;          // profiles.id (= auth user id)
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_suspended: boolean;
  created_at: string;
  // resolved from student_profiles / investor_profiles / user_roles
  role: "student" | "investor" | "admin" | "superadmin" | "unknown";
  city: string | null;
};

const ROLE_FILTERS = ["ALL", "student", "investor", "admin"] as const;

export default function SuperAdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);

    // Fetch all data in parallel
    const [profilesRes, studentRes, investorRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, avatar_url, is_suspended, created_at"),
      supabase.from("student_profiles").select("user_id, city"),
      supabase.from("investor_profiles").select("user_id, city"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (profilesRes.error) toast.error(profilesRes.error.message);

    // Build lookup maps
    const studentMap = new Map<string, string | null>(
      (studentRes.data ?? []).map((s: any) => [s.user_id, s.city])
    );
    const investorMap = new Map<string, string | null>(
      (investorRes.data ?? []).map((i: any) => [i.user_id, i.city])
    );
    // user_roles can have multiple rows per user; pick the highest role
    const rolePriority: Record<string, number> = {
      superadmin: 4, admin: 3, investor: 2, student: 1,
    };
    const roleMap = new Map<string, string>();
    for (const r of (rolesRes.data ?? []) as any[]) {
      const current = roleMap.get(r.user_id);
      if (!current || (rolePriority[r.role] ?? 0) > (rolePriority[current] ?? 0)) {
        roleMap.set(r.user_id, r.role);
      }
    }

    const combined: Row[] = (profilesRes.data ?? []).map((p: any) => {
      // Determine role: prefer explicit user_roles, then infer from profile tables
      let role: Row["role"] = "unknown";
      if (roleMap.has(p.id)) {
        role = roleMap.get(p.id) as Row["role"];
      } else if (investorMap.has(p.id)) {
        role = "investor";
      } else if (studentMap.has(p.id)) {
        role = "student";
      }

      const city = studentMap.get(p.id) ?? investorMap.get(p.id) ?? null;

      return {
        id: p.id,
        email: p.email ?? "",
        full_name: p.full_name ?? null,
        avatar_url: p.avatar_url ?? null,
        is_suspended: p.is_suspended ?? false,
        created_at: p.created_at ?? "",
        role,
        city,
      };
    });

    combined.sort((a, b) => b.created_at.localeCompare(a.created_at));
    setRows(combined);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((u) => {
    if (roleFilter !== "ALL") {
      if (roleFilter === "admin" && u.role !== "admin" && u.role !== "superadmin") return false;
      if (roleFilter !== "admin" && u.role !== roleFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${u.full_name ?? ""} ${u.email} ${u.city ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    ALL: rows.length,
    student: rows.filter((r) => r.role === "student").length,
    investor: rows.filter((r) => r.role === "investor").length,
    admin: rows.filter((r) => r.role === "admin" || r.role === "superadmin").length,
  };

  const toggleSuspend = async (u: Row) => {
    const action = u.is_suspended ? "Unsuspend" : "Suspend";
    if (!confirm(`${action} ${u.email}?`)) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        is_suspended: !u.is_suspended,
        suspended_at: !u.is_suspended ? new Date().toISOString() : null,
      })
      .eq("id", u.id);
    if (error) return toast.error(error.message);
    toast.success(`${action}ed successfully.`);
    load();
  };

  const exportCSV = () => {
    const header = ["Name", "Email", "Role", "City", "Status", "Joined"];
    const body = filtered.map((r) => [
      r.full_name ?? "",
      r.email,
      r.role,
      r.city ?? "",
      r.is_suspended ? "Suspended" : "Active",
      r.created_at?.slice(0, 10) ?? "",
    ]);
    const csv = [header, ...body].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "users.csv";
    a.click();
    toast.success("Exported");
  };

  const initials = (u: Row) =>
    (u.full_name ?? u.email ?? "?").slice(0, 1).toUpperCase();

  const columns: Column<Row>[] = [
    {
      key: "user",
      header: "User",
      cell: (u) => (
        <div className="flex items-center gap-3 min-w-0">
          {u.avatar_url ? (
            <img src={u.avatar_url} alt={u.full_name ?? u.email} className="h-8 w-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
              {initials(u)}
            </div>
          )}
          <div className="min-w-0">
            {u.full_name && (
              <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
            )}
            <p className={`truncate ${u.full_name ? "text-[11px] text-muted-foreground mt-0.5" : "text-sm font-medium text-foreground"}`}>
              {u.email || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "140px",
      cell: (u) => <RoleBadge role={u.role} />,
    },
    {
      key: "city",
      header: "City",
      width: "140px",
      cell: (u) => <span className="text-sm text-muted-foreground">{u.city || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      cell: (u) =>
        u.is_suspended ? (
          <StatusPill label="Suspended" tone="danger" />
        ) : (
          <StatusPill label="Active" tone="positive" />
        ),
    },
    {
      key: "joined",
      header: "Joined",
      width: "130px",
      cell: (u) => (
        <span className="text-[12px] text-muted-foreground">
          {u.created_at
            ? new Date(u.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "110px",
      align: "right",
      cell: (u) =>
        u.role === "superadmin" ? (
          <span className="text-[11px] text-muted-foreground">Protected</span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className={`h-8 gap-1.5 text-[12px] ${
              u.is_suspended
                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                : "text-red-600 hover:text-red-700 hover:bg-red-50"
            }`}
            onClick={() => toggleSuspend(u)}
          >
            {u.is_suspended ? (
              <><CheckCircle className="h-3.5 w-3.5" /> Unsuspend</>
            ) : (
              <><Ban className="h-3.5 w-3.5" /> Suspend</>
            )}
          </Button>
        ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="All users"
        subtitle="Full directory of all registered users across the platform."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg gap-2 shadow-none"
              onClick={exportCSV}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <RefreshButton onClick={load} loading={loading} />
          </>
        }
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
                <button
                  key={f}
                  onClick={() => setRoleFilter(f)}
                  className={`px-3 h-7 rounded-md text-[12px] font-medium capitalize transition-colors ${
                    roleFilter === f
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "ALL" ? `All (${counts.ALL})` : f}
                </button>
              ))}
            </div>
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or city…"
                className="pl-8 h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No users match your filters." />
      </SectionCard>
    </PageShell>
  );
}
