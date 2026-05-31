import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, StatCard, SectionCard, StatusPill, RefreshButton } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import {
  Users, FileText, ShieldCheck, Clock, ArrowRight, UserCog,
  Handshake, DollarSign, BarChart3, ScrollText, Database, Scale,
} from "lucide-react";

const quickLinks = [
  { name: "Admins", href: "/superadmin/admins", icon: UserCog },
  { name: "Users", href: "/superadmin/users", icon: Users },
  { name: "Pitches", href: "/superadmin/pitches", icon: FileText },
  { name: "Investors", href: "/superadmin/investors", icon: ShieldCheck },
  { name: "Deals", href: "/superadmin/deals", icon: Handshake },
  { name: "Revenue", href: "/superadmin/revenue", icon: DollarSign },
  { name: "Analytics", href: "/superadmin/analytics", icon: BarChart3 },
  { name: "Audit logs", href: "/superadmin/logs", icon: ScrollText },
  { name: "Compliance", href: "/superadmin/compliance", icon: Scale },
  { name: "Backups", href: "/superadmin/backup", icon: Database },
];

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPitches: 0, approvedPitches: 0, pendingPitches: 0, rejectedPitches: 0,
    totalStudents: 0, totalInvestors: 0, verifiedInvestors: 0,
  });
  const [recentPitches, setRecentPitches] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [p, s, i, r] = await Promise.all([
      supabase.from("pitches").select("status"),
      supabase.from("student_profiles").select("id"),
      supabase.from("investor_profiles").select("verified"),
      supabase.from("pitches").select("id,title,status,created_at,stage").order("created_at",{ascending:false}).limit(6),
    ]);
    const pp = p.data ?? [], inv = i.data ?? [];
    setStats({
      totalPitches: pp.length,
      approvedPitches: pp.filter((x:any)=>x.status==="APPROVED").length,
      pendingPitches: pp.filter((x:any)=>x.status==="SUBMITTED").length,
      rejectedPitches: pp.filter((x:any)=>x.status==="REJECTED").length,
      totalStudents: (s.data ?? []).length,
      totalInvestors: inv.length,
      verifiedInvestors: inv.filter((x:any)=>x.verified).length,
    });
    setRecentPitches(r.data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const statusTone = (s: string): any =>
    s === "APPROVED" ? "positive" : s === "REJECTED" ? "danger" : s === "SUBMITTED" ? "warning" : "neutral";

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="Platform overview"
        subtitle={`Operational snapshot · ${new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}`}
        actions={<RefreshButton onClick={load} loading={loading} />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={stats.totalStudents + stats.totalInvestors} hint={`${stats.totalStudents} students · ${stats.totalInvestors} investors`} icon={Users} loading={loading} />
        <StatCard label="Total pitches" value={stats.totalPitches} hint={`${stats.approvedPitches} approved`} icon={FileText} loading={loading} />
        <StatCard label="Verified investors" value={stats.verifiedInvestors} hint={`${stats.totalInvestors - stats.verifiedInvestors} pending`} icon={ShieldCheck} tone="positive" loading={loading} />
        <StatCard label="Pending review" value={stats.pendingPitches} hint="Pitches awaiting" icon={Clock} tone={stats.pendingPitches ? "warning" : "neutral"} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard title="Quick navigation" description="Jump to any module" className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
            {quickLinks.map((l) => (
              <Link key={l.href} to={l.href} className="bg-card hover:bg-muted/40 transition-colors flex flex-col items-center gap-2 py-5 text-center">
                <l.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-[12px] font-medium text-foreground">{l.name}</span>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent pitches"
          actions={<Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"><Link to="/superadmin/pitches">All <ArrowRight className="h-3 w-3 ml-1" /></Link></Button>}
        >
          <div className="divide-y divide-border">
            {loading ? Array.from({length:4}).map((_,i)=>(
              <div key={i} className="px-5 py-3.5"><div className="h-4 w-2/3 bg-muted rounded animate-pulse"/></div>
            )) : recentPitches.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No pitches yet.</div>
            ) : recentPitches.map((p)=>(
              <Link key={p.id} to={`/pitches/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(p.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                    {p.stage && ` · ${p.stage}`}
                  </p>
                </div>
                <StatusPill label={p.status === "SUBMITTED" ? "Pending" : p.status} tone={statusTone(p.status)} />
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
