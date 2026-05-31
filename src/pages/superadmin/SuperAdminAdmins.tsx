import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PageShell, PageHeader, StatCard, SectionCard,
  DataTable, RoleBadge, StatusPill, RefreshButton, Column,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, UserCog, Trash2, Shield, UserPlus, Search } from "lucide-react";
import { toast } from "sonner";

type Admin = {
  id: string;
  user_id: string;
  role: "admin" | "superadmin";
  created_at: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

type UserOption = {
  id: string;
  email: string;
  full_name: string | null;
};

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantOpen, setGrantOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "superadmin">("admin");
  const [granting, setGranting] = useState(false);

  const load = async () => {
    setLoading(true);
    // Join user_roles with profiles to get email + name
    const { data, error } = await supabase
      .from("user_roles")
      .select(`
        id,
        user_id,
        role,
        created_at,
        profiles:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .in("role", ["admin", "superadmin"])
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      const normalized = (data ?? []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        role: r.role,
        created_at: r.created_at,
        email: r.profiles?.email ?? r.user_id,
        full_name: r.profiles?.full_name ?? null,
        avatar_url: r.profiles?.avatar_url ?? null,
      }));
      setAdmins(normalized);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openGrant = async () => {
    setGrantOpen(true);
    setSearch("");
    setSelectedUser("");
    setSelectedRole("admin");
    setUsersLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .order("email");
    setUsers((data ?? []) as UserOption[]);
    setUsersLoading(false);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.full_name ?? "").toLowerCase().includes(q)
    );
  });

  const grant = async () => {
    if (!selectedUser) return toast.error("Select a user first.");
    setGranting(true);
    // Check if role already exists
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", selectedUser)
      .eq("role", selectedRole)
      .maybeSingle();

    if (existing) {
      toast.warning("User already has this role.");
      setGranting(false);
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: selectedUser, role: selectedRole });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Role granted successfully.");
      setGrantOpen(false);
      load();
    }
    setGranting(false);
  };

  const revoke = async (id: string, role: string) => {
    if (role === "superadmin") {
      toast.error("Super admin roles cannot be revoked here.");
      return;
    }
    if (!confirm("Revoke this admin role? The user will lose admin access.")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Role revoked.");
    load();
  };

  const counts = {
    total: admins.length,
    admin: admins.filter((a) => a.role === "admin").length,
    superadmin: admins.filter((a) => a.role === "superadmin").length,
  };

  const initials = (a: Admin) =>
    (a.full_name ?? a.email ?? "?").slice(0, 1).toUpperCase();

  const columns: Column<Admin>[] = [
    {
      key: "user",
      header: "User",
      cell: (a) => (
        <div className="flex items-center gap-3 min-w-0">
          {a.avatar_url ? (
            <img
              src={a.avatar_url}
              alt={a.full_name ?? a.email}
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-white ${
                a.role === "superadmin" ? "bg-amber-500" : "bg-red-500"
              }`}
            >
              {initials(a)}
            </div>
          )}
          <div className="min-w-0">
            {a.full_name && (
              <p className="text-sm font-medium text-foreground truncate">{a.full_name}</p>
            )}
            <p className={`truncate ${a.full_name ? "text-[11px] text-muted-foreground mt-0.5" : "text-sm font-medium text-foreground"}`}>
              {a.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "160px",
      cell: (a) => <RoleBadge role={a.role} />,
    },
    {
      key: "granted",
      header: "Granted",
      width: "140px",
      cell: (a) => (
        <span className="text-[12px] text-muted-foreground">
          {a.created_at
            ? new Date(a.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      cell: () => <StatusPill label="Active" tone="positive" />,
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      align: "right",
      cell: (a) =>
        a.role === "superadmin" ? (
          <span className="text-[11px] text-muted-foreground">Protected</span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => revoke(a.id, a.role)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Revoke
          </Button>
        ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="Admin team"
        subtitle="Manage administrative roles and super-admin access."
        actions={
          <div className="flex items-center gap-2">
            <RefreshButton onClick={load} loading={loading} />
            <Button size="sm" className="h-9 gap-2" onClick={openGrant}>
              <UserPlus className="h-4 w-4" />
              Grant role
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total" value={counts.total} icon={Shield} loading={loading} />
        <StatCard label="Admins" value={counts.admin} icon={UserCog} tone="danger" loading={loading} />
        <StatCard label="Super admins" value={counts.superadmin} icon={Crown} tone="warning" loading={loading} />
      </div>

      <SectionCard
        title="Role assignments"
        description="All users with admin or super-admin access."
      >
        <DataTable
          columns={columns}
          rows={admins}
          loading={loading}
          empty="No admin roles assigned yet."
        />
      </SectionCard>

      {/* Grant role dialog */}
      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grant admin role</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Search users */}
            <div className="space-y-1.5">
              <Label>User</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name…"
                  className="pl-8 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {usersLoading ? (
                <p className="text-xs text-muted-foreground px-1">Loading users…</p>
              ) : (
                <div className="border border-border rounded-lg max-h-48 overflow-y-auto divide-y divide-border">
                  {filteredUsers.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-3 py-4 text-center">No users found.</p>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setSelectedUser(u.id)}
                        className={`w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-center gap-2 ${
                          selectedUser === u.id ? "bg-muted" : ""
                        }`}
                      >
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                          {(u.full_name ?? u.email ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          {u.full_name && (
                            <p className="text-[13px] font-medium text-foreground truncate">{u.full_name}</p>
                          )}
                          <p className={`truncate ${u.full_name ? "text-[11px] text-muted-foreground" : "text-[13px] font-medium text-foreground"}`}>
                            {u.email}
                          </p>
                        </div>
                        {selectedUser === u.id && (
                          <div className="ml-auto h-4 w-4 rounded-full bg-foreground flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-card" />
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)}>Cancel</Button>
            <Button onClick={grant} disabled={!selectedUser || granting}>
              {granting ? "Granting…" : "Grant role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
