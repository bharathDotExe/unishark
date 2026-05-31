import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, StatCard, SectionCard, DataTable, RoleBadge, StatusPill, RefreshButton, Column } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Crown, UserCog, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

type Admin = {
  id: string;
  user_id: string;
  role: "admin" | "superadmin";
  created_at: string;
};

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .in("role", ["admin", "superadmin"])
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setAdmins((data as any[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const revoke = async (id: string) => {
    if (!confirm("Revoke this admin role?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Role revoked");
    load();
  };

  const counts = {
    total: admins.length,
    admin: admins.filter((a) => a.role === "admin").length,
    superadmin: admins.filter((a) => a.role === "superadmin").length,
  };

  const columns: Column<Admin>[] = [
    { key: "user", header: "User", cell: (a) => (
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${a.role === "superadmin" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
          {a.role === "superadmin" ? <Crown className="h-4 w-4" /> : <UserCog className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground font-mono truncate">{a.user_id.slice(0, 14)}…</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Granted {a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
        </div>
      </div>
    )},
    { key: "role", header: "Role", width: "160px", cell: (a) => <RoleBadge role={a.role} /> },
    { key: "status", header: "Status", width: "120px", cell: () => <StatusPill label="Active" tone="positive" /> },
    { key: "actions", header: "", width: "120px", align: "right", cell: (a) => (
      a.role === "superadmin" ? <span className="text-[11px] text-muted-foreground">Protected</span> :
      <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => revoke(a.id)}>
        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Revoke
      </Button>
    )},
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="Admin team"
        subtitle="Manage administrative roles and super-admin access."
        actions={<RefreshButton onClick={load} loading={loading} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total" value={counts.total} icon={Shield} loading={loading} />
        <StatCard label="Admins" value={counts.admin} icon={UserCog} tone="danger" loading={loading} />
        <StatCard label="Super admins" value={counts.superadmin} icon={Crown} tone="warning" loading={loading} />
      </div>

      <SectionCard title="Role assignments" description="Admins must already exist as users. Promote a user from the Users page first.">
        <DataTable columns={columns} rows={admins} loading={loading} empty="No admin roles assigned." />
      </SectionCard>
    </PageShell>
  );
}
