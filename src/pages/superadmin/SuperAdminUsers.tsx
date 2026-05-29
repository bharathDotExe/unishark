import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, RefreshCw, GraduationCap, Briefcase, Shield, Mail, Calendar, Ban, ChevronDown, MoreHorizontal, Eye, KeyRound, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ROLE_FILTERS = ["ALL", "student", "investor", "admin", "suspended"];

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, created_at, is_suspended, suspended_at, suspension_reason, user_roles(role)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      const formatted = (profiles || []).map((p: any) => ({
        ...p,
        role: p.user_roles?.[0]?.role || "student"
      }));
      setUsers(formatted);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let res = users;
    if (roleFilter === "suspended") {
      res = res.filter(u => u.is_suspended);
    } else if (roleFilter !== "ALL") {
      res = res.filter(u => u.role === roleFilter);
    }
    if (search.trim()) res = res.filter(u =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(res);
  }, [users, roleFilter, search]);

  const toggleSuspend = async (userId: string, isCurrentlySuspended: boolean) => {
    const actionStr = isCurrentlySuspended ? "unsuspend" : "suspend";
    if (!confirm(`Are you sure you want to ${actionStr} this user?`)) return;

    const updates: any = { is_suspended: !isCurrentlySuspended };
    if (!isCurrentlySuspended) {
      updates.suspended_at = new Date().toISOString();
      updates.suspension_reason = "Suspended by Super Admin";
    } else {
      updates.suspended_at = null;
      updates.suspension_reason = null;
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
    if (error) {
      toast.error(`Failed to ${actionStr}: ${error.message}`);
    } else {
      toast.success(`User successfully ${actionStr}ed.`);
      load();
    }
  };

  const exportCSV = () => {
    const rows = [["ID","Name","Email","Role","Joined","Status"], ...filtered.map(u => [u.id, u.full_name||"", u.email||"", u.role||"", u.created_at?.slice(0,10)||"", u.is_suspended?"Suspended":"Active"])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "users.csv"; a.click();
    toast.success("Exported ✓");
  };

  const counts: any = { ALL: users.length, student: 0, investor: 0, admin: 0, suspended: 0 };
  users.forEach(u => {
    if (counts[u.role] !== undefined) counts[u.role]++;
    if (u.is_suspended) counts.suspended++;
  });

  const roleIcon = (role?: string) => {
    if (role === "investor") return <Briefcase className="h-3.5 w-3.5" />;
    if (role === "admin") return <Shield className="h-3.5 w-3.5" />;
    return <GraduationCap className="h-3.5 w-3.5" />;
  };
  const roleBadgeClass: any = {
    investor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    admin: "bg-red-500/10 text-red-400 border-red-500/30",
    student: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Full User Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Complete control over all platform accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border text-xs" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",     value: users.length,                              color: "text-foreground",      bg: "border-border" },
          { label: "Students",  value: counts.student,                            color: "text-blue-400",   bg: "border-blue-500/20" },
          { label: "Investors", value: counts.investor,                           color: "text-cyan-400",   bg: "border-cyan-500/20" },
          { label: "Suspended", value: counts.suspended,                          color: "text-red-400",    bg: "border-red-500/20" },
        ].map(s => (
          <Card key={s.label} className={`p-4 border ${s.bg} bg-muted/40`}>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? "—" : s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {ROLE_FILTERS.map(f => (
          <button key={f} onClick={() => setRoleFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all capitalize ${roleFilter === f ? "bg-white text-black border-white" : "border-border text-muted-foreground hover:border-white/30 hover:text-foreground"}`}>
            {f === "ALL" ? "All Users" : f}
            <span className="ml-2 text-xs opacity-60">{counts[f]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="pl-9 h-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:ring-0 text-sm" />
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="space-y-2">{Array(6).fill(0).map((_, i) => (
          <Card key={i} className="p-4 border border-border bg-muted/40 animate-pulse"><div className="h-4 bg-muted rounded w-1/3" /></Card>
        ))}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border border-border bg-muted/40 text-center">
          <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">No users found</p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          <div className="hidden md:grid grid-cols-[1fr_200px_120px_110px_80px] gap-4 px-4 py-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
            <span>User</span><span>Email</span><span>Role</span><span>Joined</span><span>Actions</span>
          </div>
          {filtered.map(u => (
            <Card key={u.id} className={`px-4 py-3 border bg-muted/40 hover:bg-muted/40 transition-all ${u.is_suspended ? 'border-red-500/30 opacity-70' : 'border-border'}`}>
              <div className="md:grid md:grid-cols-[1fr_200px_120px_110px_80px] md:gap-4 md:items-center flex flex-col gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${u.is_suspended ? 'text-red-400 line-through decoration-red-500/50' : 'text-foreground'}`}>{u.full_name || "Unnamed"}</p>
                    {u.is_suspended && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px] px-1.5 py-0">Suspended</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">{u.id?.slice(0, 12)}…</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{u.email || "—"}</span>
                </div>
                <div>
                  <Badge className={`border text-xs font-bold gap-1 ${roleBadgeClass[u.role] || "bg-muted text-muted-foreground border-white/20"}`}>
                    {roleIcon(u.role)} {u.role || "—"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border border-border rounded-xl text-foreground">
                    <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5 mr-2" />View Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground hover:text-foreground"><Mail className="h-3.5 w-3.5 mr-2" />Send Email</DropdownMenuItem>
                    
                    {!u.is_suspended ? (
                      <DropdownMenuItem className="text-xs cursor-pointer text-red-400 hover:bg-red-500/10" onClick={() => toggleSuspend(u.id, false)}>
                        <Ban className="h-3.5 w-3.5 mr-2" />Suspend User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-xs cursor-pointer text-green-400 hover:bg-green-500/10" onClick={() => toggleSuspend(u.id, true)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-2" />Unsuspend User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
