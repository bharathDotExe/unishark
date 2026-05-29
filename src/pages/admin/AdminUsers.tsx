import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, RefreshCw, GraduationCap, Briefcase, Shield, Mail, Calendar, Ban, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  role?: string;
  full_name?: string;
  profile_complete?: boolean;
};

const ROLE_FILTERS = ["ALL", "student", "investor", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filtered, setFiltered] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    // Load from profiles table which has role info
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, profile_complete")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Could not load users: " + error.message);
      // Fallback: load student profiles
      const { data: students } = await supabase.from("student_profiles").select("id,user_id,full_name,created_at,profile_complete").order("created_at", { ascending: false });
      const mapped = (students ?? []).map((s) => ({
        id: s.user_id,
        email: `user-${s.user_id.slice(0, 8)}@…`,
        created_at: s.created_at,
        role: "student",
        full_name: s.full_name,
        profile_complete: s.profile_complete,
      }));
      setUsers(mapped);
    } else {
      setUsers(profiles ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter !== "ALL") result = result.filter((u) => u.role === roleFilter);
    if (search.trim()) result = result.filter((u) =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [users, roleFilter, search]);

  const getRoleIcon = (role?: string) => {
    if (role === "investor") return <Briefcase className="h-3.5 w-3.5" />;
    if (role === "admin") return <Shield className="h-3.5 w-3.5" />;
    return <GraduationCap className="h-3.5 w-3.5" />;
  };

  const getRoleBadge = (role?: string) => {
    if (role === "investor") return <Badge className="bg-violet-500/10 text-violet-600 border border-violet-500/30 font-bold gap-1">{getRoleIcon(role)} Investor</Badge>;
    if (role === "admin") return <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 font-bold gap-1">{getRoleIcon(role)} Admin</Badge>;
    return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 font-bold gap-1">{getRoleIcon(role)} Student</Badge>;
  };

  const counts = {
    ALL: users.length,
    student: users.filter((u) => u.role === "student").length,
    investor: users.filter((u) => u.role === "investor").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage platform users and roles</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-foreground/5 border border-foreground/10 text-sm font-semibold">
            <Users className="h-4 w-4 inline mr-1.5 text-muted-foreground" />
            {users.length} total users
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all capitalize ${
              roleFilter === f
                ? "bg-foreground text-background border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {f === "ALL" ? "All Users" : f}
            <span className="ml-2 text-xs opacity-70">{counts[f as keyof typeof counts]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Table-style list */}
      {loading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i} className="p-4 border-2 border-foreground/10 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No users found</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1fr_200px_120px_100px_80px] gap-4 px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {filtered.map((u) => (
            <Card key={u.id} className="px-4 py-3 border-2 border-foreground/10 hover:border-foreground/25 transition-all">
              <div className="md:grid md:grid-cols-[1fr_200px_120px_100px_80px] md:gap-4 md:items-center flex flex-col gap-2">
                {/* Name */}
                <div>
                  <p className="font-bold text-foreground text-sm">{u.full_name || "Unnamed User"}</p>
                  <p className="text-xs text-muted-foreground font-mono">{u.id.slice(0, 12)}…</p>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{u.email || "—"}</span>
                </div>

                {/* Role */}
                <div>{getRoleBadge(u.role)}</div>

                {/* Joined */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                </div>

                {/* Actions */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 rounded-xl border-2 border-foreground/10 text-xs">
                        Actions <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-2 border-foreground/10">
                      <DropdownMenuItem className="text-xs cursor-pointer">
                        <Mail className="h-3.5 w-3.5 mr-2" /> Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs cursor-pointer text-destructive">
                        <Ban className="h-3.5 w-3.5 mr-2" /> Suspend User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
