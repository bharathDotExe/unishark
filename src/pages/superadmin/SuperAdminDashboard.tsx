import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown, Users, FileText, ShieldCheck, Handshake, DollarSign,
  TrendingUp, TrendingDown, Activity, ArrowRight, Zap, AlertTriangle,
  CheckCircle2, Clock, Globe, Server, Database,
} from "lucide-react";

const quickLinks = [
  { name: "Manage Admins",  href: "/superadmin/admins",     icon: Crown,     color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/60",  text: "text-purple-400" },
  { name: "All Users",      href: "/superadmin/users",      icon: Users,     color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/60",          text: "text-blue-400" },
  { name: "All Pitches",    href: "/superadmin/pitches",    icon: FileText,  color: "from-sky-500/20 to-sky-600/10 border-sky-500/30 hover:border-sky-500/60",              text: "text-sky-400" },
  { name: "Investors",      href: "/superadmin/investors",  icon: ShieldCheck, color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/60",        text: "text-cyan-400" },
  { name: "Deals",          href: "/superadmin/deals",      icon: Handshake, color: "from-teal-500/20 to-teal-600/10 border-teal-500/30 hover:border-teal-500/60",          text: "text-teal-400" },
  { name: "Revenue",        href: "/superadmin/revenue",    icon: DollarSign, color: "from-green-500/20 to-green-600/10 border-green-500/30 hover:border-green-500/60",     text: "text-green-400" },
  { name: "Audit Logs",     href: "/superadmin/logs",       icon: Activity,  color: "from-orange-500/20 to-orange-600/10 border-orange-500/30 hover:border-orange-500/60",  text: "text-orange-400" },
  { name: "Analytics",      href: "/superadmin/analytics",  icon: TrendingUp, color: "from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-500/60",         text: "text-rose-400" },
  { name: "Compliance",     href: "/superadmin/compliance", icon: CheckCircle2, color: "from-pink-500/20 to-pink-600/10 border-pink-500/30 hover:border-pink-500/60",       text: "text-pink-400" },
  { name: "Backup",         href: "/superadmin/backup",     icon: Database,  color: "from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 hover:border-fuchsia-500/60", text: "text-fuchsia-400" },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalPitches: 0, approvedPitches: 0, pendingPitches: 0, rejectedPitches: 0,
    totalStudents: 0, totalInvestors: 0, verifiedInvestors: 0, unverifiedInvestors: 0,
  });
  const [recentPitches, setRecentPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [pitchRes, studentRes, investorRes, recentRes] = await Promise.all([
        supabase.from("pitches").select("status"),
        supabase.from("student_profiles").select("id"),
        supabase.from("investor_profiles").select("verified"),
        supabase.from("pitches").select("id,title,status,created_at,stage").order("created_at", { ascending: false }).limit(6),
      ]);
      const p = pitchRes.data ?? [];
      const inv = investorRes.data ?? [];
      setStats({
        totalPitches: p.length,
        approvedPitches: p.filter(x => x.status === "APPROVED").length,
        pendingPitches: p.filter(x => x.status === "SUBMITTED").length,
        rejectedPitches: p.filter(x => x.status === "REJECTED").length,
        totalStudents: (studentRes.data ?? []).length,
        totalInvestors: inv.length,
        verifiedInvestors: inv.filter(x => x.verified).length,
        unverifiedInvestors: inv.filter(x => !x.verified).length,
      });
      setRecentPitches(recentRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const kpiRows = [
    [
      { label: "Total Users",    value: stats.totalStudents + stats.totalInvestors, sub: `${stats.totalStudents} students · ${stats.totalInvestors} investors`, icon: Users,      grad: "from-blue-500 to-indigo-600",   glow: "shadow-blue-500/20" },
      { label: "Total Pitches",  value: stats.totalPitches,  sub: `${stats.approvedPitches} approved`,   icon: FileText,    grad: "from-sky-500 to-cyan-600",      glow: "shadow-sky-500/20" },
      { label: "Verified Inv.",  value: stats.verifiedInvestors, sub: `${stats.unverifiedInvestors} pending`,  icon: ShieldCheck, grad: "from-green-500 to-emerald-600", glow: "shadow-green-500/20" },
      { label: "Pending Review", value: stats.pendingPitches, sub: "pitches awaiting",  icon: Clock,       grad: "from-amber-500 to-orange-600",  glow: "shadow-amber-500/20", urgent: stats.pendingPitches > 0 },
    ],
  ];

  const systemStatus = [
    { label: "API Health",      status: "Operational", icon: Server,  color: "text-green-400" },
    { label: "Database",        status: "Healthy",     icon: Database, color: "text-green-400" },
    { label: "Auth Service",    status: "Operational", icon: ShieldCheck, color: "text-green-400" },
    { label: "Storage",         status: "Operational", icon: Globe,   color: "text-green-400" },
  ];

  const getStatusColor = (s: string) => {
    if (s === "APPROVED") return "text-green-400 bg-green-500/10 border-green-500/30";
    if (s === "REJECTED") return "text-red-400 bg-red-500/10 border-red-500/30";
    return "text-amber-400 bg-amber-500/10 border-amber-500/30";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Crown className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Platform Overview</h1>
              <p className="text-muted-foreground text-sm">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiRows[0].map((kpi) => (
          <Card key={kpi.label} className={`relative overflow-hidden border border-border bg-muted/40 hover:bg-muted/40 transition-all duration-300 hover:translate-y-[-2px] ${kpi.urgent ? "ring-1 ring-amber-500/40" : ""}`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 bg-gradient-to-br ${kpi.grad} opacity-10 blur-2xl`} />
            <div className="p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${kpi.grad} flex items-center justify-center shadow-lg ${kpi.glow}`}>
                  <kpi.icon className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-foreground">
                {loading ? <span className="inline-block h-8 w-16 bg-muted rounded animate-pulse" /> : kpi.value}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">{kpi.sub}</p>
              {kpi.urgent && <p className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Needs attention</p>}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Nav */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" /> Quick Navigation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className={`p-4 border bg-gradient-to-br ${link.color} transition-all duration-200 cursor-pointer hover:translate-y-[-2px] group`}>
                  <link.icon className={`h-5 w-5 ${link.text} mb-2`} />
                  <p className="font-bold text-sm text-foreground group-hover:text-foreground">{link.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* System Status */}
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" /> System Status
            </h2>
            <Card className="border border-border bg-muted/40 divide-y divide-border">
              {systemStatus.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className={`text-xs font-medium ${s.color}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Recent Pitches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" /> Recent Pitches
              </h2>
              <Link to="/superadmin/pitches">
                <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg text-muted-foreground hover:text-foreground">
                  All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {loading ? Array(4).fill(0).map((_, i) => (
                <Card key={i} className="p-3 border border-border bg-muted/40 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                </Card>
              )) : recentPitches.map((p) => (
                <Card key={p.id} className="p-3 border border-border bg-muted/40 hover:bg-muted/40 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate flex-1">{p.title}</p>
                    <Badge className={`text-[10px] border font-bold px-1.5 py-0.5 ${getStatusColor(p.status)}`}>
                      {p.status === "SUBMITTED" ? "PENDING" : p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {p.stage && ` · ${p.stage}`}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
