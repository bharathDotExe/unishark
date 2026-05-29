import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ShieldCheck,
  Users,
  Flag,
  Scale,
  MessageSquare,
  BarChart3,
  HeadphonesIcon,
  TrendingUp,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const quickLinks = [
  { name: "Pitch Queue", href: "/admin/pitches", icon: FileText, color: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20", iconColor: "text-blue-500", description: "Review & approve pitches" },
  { name: "Investor Verify", href: "/admin/investors", icon: ShieldCheck, color: "bg-green-500/10 border-green-500/30 hover:bg-green-500/20", iconColor: "text-green-500", description: "Verify investor accounts" },
  { name: "User Management", href: "/admin/users", icon: Users, color: "bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20", iconColor: "text-violet-500", description: "Manage all users" },
  { name: "Flagged Content", href: "/admin/flagged", icon: Flag, color: "bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20", iconColor: "text-orange-500", description: "Review flagged items" },
  { name: "Disputes", href: "/admin/disputes", icon: Scale, color: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20", iconColor: "text-red-500", description: "Handle open disputes" },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare, color: "bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/20", iconColor: "text-sky-500", description: "Monitor communications" },
  { name: "Reports", href: "/admin/reports", icon: BarChart3, color: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20", iconColor: "text-amber-500", description: "Generate reports" },
  { name: "Support Tickets", href: "/admin/support", icon: HeadphonesIcon, color: "bg-pink-500/10 border-pink-500/30 hover:bg-pink-500/20", iconColor: "text-pink-500", description: "Handle support cases" },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp, color: "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20", iconColor: "text-emerald-500", description: "Platform insights" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPitches: 0,
    pendingPitches: 0,
    approvedPitches: 0,
    rejectedPitches: 0,
    totalInvestors: 0,
    pendingInvestors: 0,
    totalStudents: 0,
  });
  const [recentPitches, setRecentPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [pitchAll, investorAll, studentAll, recentP] = await Promise.all([
        supabase.from("pitches").select("status"),
        supabase.from("investor_profiles").select("verified"),
        supabase.from("student_profiles").select("id"),
        supabase.from("pitches").select("id,title,status,created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const pitches = pitchAll.data ?? [];
      const investors = investorAll.data ?? [];

      setStats({
        totalPitches: pitches.length,
        pendingPitches: pitches.filter((p) => p.status === "SUBMITTED").length,
        approvedPitches: pitches.filter((p) => p.status === "APPROVED").length,
        rejectedPitches: pitches.filter((p) => p.status === "REJECTED").length,
        totalInvestors: investors.length,
        pendingInvestors: investors.filter((i) => !i.verified).length,
        totalStudents: (studentAll.data ?? []).length,
      });
      setRecentPitches(recentP.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Pitches", value: stats.totalPitches, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Review", value: stats.pendingPitches, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", urgent: stats.pendingPitches > 0 },
    { label: "Approved", value: stats.approvedPitches, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Rejected", value: stats.rejectedPitches, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Total Investors", value: stats.totalInvestors, icon: ShieldCheck, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Unverified Investors", value: stats.pendingInvestors, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", urgent: stats.pendingInvestors > 0 },
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-sky-500", bg: "bg-sky-500/10" },
    { label: "Platform Health", value: "99.9%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Approved</Badge>;
    if (status === "REJECTED") return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Rejected</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Pending</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platform overview · {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-600">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className={`p-4 border-2 ${s.urgent ? "border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "border-foreground/10"} hover:border-foreground/20 transition-all duration-200 hover:translate-y-[-2px]`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-extrabold ${s.urgent ? "text-orange-500" : "text-foreground"}`}>
              {loading ? "—" : s.value}
            </p>
            {s.urgent && (
              <p className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">Needs attention</p>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Nav + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Navigation */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Quick Navigation
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className={`p-4 border-2 ${link.color} transition-all duration-200 cursor-pointer hover:translate-y-[-2px] hover:shadow-md group`}>
                  <link.icon className={`h-5 w-5 ${link.iconColor} mb-2`} />
                  <p className="font-bold text-sm text-foreground group-hover:text-foreground">{link.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Pitches */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Recent Pitches
            </h2>
            <Link to="/admin/pitches">
              <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <Card key={i} className="p-3 border-2 border-foreground/10 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </Card>
              ))
            ) : recentPitches.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No pitches yet</p>
            ) : (
              recentPitches.map((p) => (
                <Card key={p.id} className="p-3 border-2 border-foreground/10 hover:border-foreground/20 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground truncate flex-1">{p.title}</p>
                    {getStatusBadge(p.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
