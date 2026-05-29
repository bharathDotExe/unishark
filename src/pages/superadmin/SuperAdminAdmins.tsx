import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown, UserCog, Plus, Trash2, Shield, ShieldOff, Search,
  Mail, Calendar, MoreHorizontal, Check, X, Eye, KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  status: "active" | "suspended";
  created_at: string;
  permissions: string[];
};

const ALL_PERMISSIONS = ["pitches", "investors", "users", "flagged", "disputes", "messages", "reports", "support", "analytics"];

export default function SuperAdminAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    // Fetch profiles that are admins or superadmins
    const { data: rolesData, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["admin", "superadmin"]);

    if (rolesError) {
      toast.error(rolesError.message);
      setLoading(false);
      return;
    }

    const adminIds = (rolesData || []).map(r => r.user_id);
    if (adminIds.length === 0) {
      setAdmins([]);
      setLoading(false);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at, is_suspended")
      .in("id", adminIds);

    if (profilesError) {
      toast.error(profilesError.message);
    } else {
      const merged: AdminUser[] = (profilesData || []).map(p => {
        const roleObj = rolesData?.find(r => r.user_id === p.id);
        return {
          id: p.id,
          email: p.email || "",
          name: p.full_name || "Unnamed",
          role: (roleObj?.role || "admin") as "admin" | "superadmin",
          status: p.is_suspended ? "suspended" : "active",
          created_at: p.created_at || new Date().toISOString(),
          permissions: roleObj?.role === "superadmin" ? ["all"] : ["pitches", "investors", "users"], // Mocked permissions for now
        };
      });
      setAdmins(merged);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = admins.filter(a =>
    !search.trim() ||
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id: string, currentStatus: "active" | "suspended") => {
    const isSuspending = currentStatus === "active";
    if (!confirm(`Are you sure you want to ${isSuspending ? 'suspend' : 'reinstate'} this admin?`)) return;

    const updates: any = { is_suspended: isSuspending };
    if (isSuspending) {
      updates.suspended_at = new Date().toISOString();
      updates.suspension_reason = "Suspended by Super Admin";
    } else {
      updates.suspended_at = null;
      updates.suspension_reason = null;
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", id);
    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(`Admin ${isSuspending ? 'suspended' : 'reinstated'}`);
      load();
    }
  };

  const removeAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to revoke admin privileges?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", id).eq("role", "admin");
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Admin privileges revoked");
      load();
    }
  };

  const addAdmin = () => {
    if (!newEmail || !newName) { toast.error("Email and name required"); return; }
    // Note: Creating auth users requires Edge Functions or admin API.
    toast.error("User creation requires Supabase Auth Admin API (Edge Function needed).");
    setShowAdd(false);
  };

  const togglePerm = (p: string) =>
    setNewPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Manage Admins</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create, configure and revoke admin access</p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-foreground rounded-xl border-0 shadow-lg shadow-purple-500/20"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Admins",     value: admins.filter(a => a.role === "admin").length,      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Active",           value: admins.filter(a => a.status === "active").length,    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
          { label: "Suspended",        value: admins.filter(a => a.status === "suspended").length, color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20" },
        ].map(s => (
          <Card key={s.label} className={`p-4 border ${s.bg} bg-transparent`}>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl font-extrabold ${s.color}`}>{loading ? "—" : s.value}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
        <Input
          placeholder="Search admins..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:border-white/20 focus-visible:ring-0 text-sm"
        />
      </div>

      {/* Admin List */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Card key={i} className="h-24 bg-muted/50 animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(admin => (
            <Card key={admin.id} className={`p-5 border ${admin.status === "suspended" ? "border-red-500/20 bg-red-500/5 opacity-80" : "border-border bg-muted/40"} hover:bg-muted/40 transition-all`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${admin.role === "superadmin" ? "bg-gradient-to-br from-yellow-400 to-orange-500" : "bg-gradient-to-br from-purple-500 to-indigo-600"}`}>
                    {admin.role === "superadmin" ? <Crown className="h-4 w-4 text-foreground" /> : <UserCog className="h-4 w-4 text-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold ${admin.status === "suspended" ? "text-red-400 line-through decoration-red-500/50" : "text-foreground"}`}>{admin.name}</p>
                      <Badge className={`text-[10px] border font-bold px-1.5 ${admin.role === "superadmin" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" : "bg-purple-500/10 text-purple-400 border-purple-500/30"}`}>
                        {admin.role.toUpperCase()}
                      </Badge>
                      <Badge className={`text-[10px] border font-bold px-1.5 ${admin.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                        {admin.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{admin.email}</span>
                      <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(admin.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {admin.permissions.includes("all") ? (
                        <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px]">All Permissions</Badge>
                      ) : admin.permissions.map(p => (
                        <Badge key={p} className="bg-muted/50 text-muted-foreground border border-border text-[10px] capitalize">{p}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {admin.role !== "superadmin" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className={`rounded-xl text-xs ${admin.status === "active" ? "text-red-400 hover:bg-red-500/10" : "text-green-400 hover:bg-green-500/10"}`}
                      onClick={() => toggleStatus(admin.id, admin.status)}>
                      {admin.status === "active" ? <><ShieldOff className="h-3.5 w-3.5 mr-1" />Suspend</> : <><Shield className="h-3.5 w-3.5 mr-1" />Reinstate</>}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-card border border-border rounded-xl text-foreground">
                        <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                          <Eye className="h-3.5 w-3.5 mr-2" /> View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                          <KeyRound className="h-3.5 w-3.5 mr-2" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs cursor-pointer text-red-400 hover:bg-red-500/10" onClick={() => removeAdmin(admin.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Revoke Admin Role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Admin Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border border-border text-foreground max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-400" /> Create Admin Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Full Name</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Admin full name"
                className="bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:ring-0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Email</label>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@unishark.in" type="email"
                className="bg-muted/40 border-border text-foreground placeholder:text-muted-foreground/70 rounded-xl focus-visible:ring-0" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block font-medium">Permissions</label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_PERMISSIONS.map(p => (
                  <button key={p} onClick={() => togglePerm(p)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${newPerms.includes(p) ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "bg-muted/50 border-border text-muted-foreground hover:text-muted-foreground"}`}>
                    {newPerms.includes(p) ? <Check className="h-3 w-3 inline mr-1" /> : null}{p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-foreground border-0 rounded-xl" onClick={addAdmin}>
              <Check className="h-4 w-4 mr-1" /> Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
