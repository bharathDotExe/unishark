import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Handshake, DollarSign, Clock, CheckCircle2, XCircle, Eye, TrendingUp, FileText, Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type Deal = {
  id: string;
  pitchTitle: string;
  investorName: string;
  founderName: string;
  amount: number;
  stage: string;
  status: "NEGOTIATING" | "SIGNED" | "CLOSED" | "DROPPED";
  created_at: string;
  equity?: number;
};

const STATUS_COLORS: any = {
  NEGOTIATING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  SIGNED:      "bg-green-500/10 text-green-400 border-green-500/30",
  CLOSED:      "bg-blue-500/10 text-blue-400 border-blue-500/30",
  DROPPED:     "bg-red-500/10 text-red-400 border-red-500/30",
};

const STATUS_TABS = ["ALL", "NEGOTIATING", "SIGNED", "CLOSED", "DROPPED"];

export default function SuperAdminDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");

  const loadDeals = async () => {
    setLoading(true);
    // Note: If you encounter type errors here after regeneration, you can adjust the select query
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        amount_committed,
        status,
        created_at,
        pitches ( title, stage, equity_offered ),
        investor:investor_id ( full_name ),
        student:student_id ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
    } else if (data) {
      const formatted: Deal[] = (data as any[]).map(d => ({
        id: d.id,
        pitchTitle: d.pitches?.title || "Unknown Pitch",
        investorName: d.investor?.full_name || "Unknown Investor",
        founderName: d.student?.full_name || "Unknown Founder",
        amount: d.amount_committed || 0,
        stage: d.pitches?.stage || "N/A",
        status: d.status,
        created_at: d.created_at,
        equity: d.pitches?.equity_offered || 0,
      }));
      setDeals(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const filtered = tab === "ALL" ? deals : deals.filter(d => d.status === tab);
  const counts: any = {};
  STATUS_TABS.forEach(t => { counts[t] = t === "ALL" ? deals.length : deals.filter(d => d.status === t).length; });

  const totalVolume = deals.filter(d => d.status !== "DROPPED").reduce((acc, d) => acc + d.amount, 0);
  const signedVolume = deals.filter(d => d.status === "SIGNED").reduce((acc, d) => acc + d.amount, 0);

  const fmt = (v: number) => v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v.toLocaleString()}`;

  const updateStatus = async (id: string, status: Deal["status"]) => {
    const { error } = await supabase.from('deals').update({ status }).eq('id', id);
    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(`Deal marked as ${status}`);
      loadDeals();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-white">Deal Management</h1>
        <p className="text-white/40 text-sm mt-0.5">Monitor and manage investor-founder deal flow</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Deals",   value: loading ? "—" : deals.length,                       sub: "across all stages",     icon: Handshake,   grad: "from-teal-500 to-cyan-600" },
          { label: "Deal Volume",   value: loading ? "—" : fmt(totalVolume),                   sub: "active + signed",       icon: DollarSign,  grad: "from-green-500 to-emerald-600" },
          { label: "Signed",        value: loading ? "—" : fmt(signedVolume),                  sub: `${counts.SIGNED || 0} deals signed`, icon: CheckCircle2, grad: "from-blue-500 to-indigo-600" },
          { label: "Negotiating",   value: loading ? "—" : counts.NEGOTIATING || 0,                 sub: "in progress",           icon: TrendingUp,  grad: "from-amber-500 to-orange-600", urgent: counts.NEGOTIATING > 0 },
        ].map(kpi => (
          <Card key={kpi.label} className="p-4 border border-white/[0.08] bg-white/[0.03] relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10 bg-gradient-to-br ${kpi.grad} opacity-10 blur-2xl`}/>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40">{kpi.label}</p>
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${kpi.grad} flex items-center justify-center`}>
                <kpi.icon className="h-4 w-4 text-white"/>
              </div>
            </div>
            <p className="text-xl font-extrabold text-white">{kpi.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{kpi.sub}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${tab === t ? "bg-white text-black border-white" : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}>
            {t.charAt(0) + t.slice(1).toLowerCase()}<span className="ml-2 text-xs opacity-60">{counts[t] || 0}</span>
          </button>
        ))}
      </div>

      {/* Deal Cards */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Card key={i} className="h-28 bg-white/5 animate-pulse rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border border-white/[0.08] bg-white/[0.03] text-center">
          <Handshake className="h-10 w-10 text-white/20 mx-auto mb-3"/>
          <p className="text-white/50">No deals in this category</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(deal => (
            <Card key={deal.id} className="p-5 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-white/30">{deal.id.slice(0,8)}</span>
                    <h3 className="font-bold text-white">{deal.pitchTitle}</h3>
                    <Badge className={`border text-xs font-bold ${STATUS_COLORS[deal.status]}`}>{deal.status}</Badge>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-white/50">
                      <Building2 className="h-3.5 w-3.5 text-cyan-400"/>
                      <div><p className="text-[10px] text-white/30 leading-tight">Investor</p><p className="font-medium text-white/70">{deal.investorName}</p></div>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <FileText className="h-3.5 w-3.5 text-sky-400"/>
                      <div><p className="text-[10px] text-white/30 leading-tight">Founder</p><p className="font-medium text-white/70">{deal.founderName}</p></div>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <DollarSign className="h-3.5 w-3.5 text-green-400"/>
                      <div>
                        <p className="text-[10px] text-white/30 leading-tight">Amount · Equity</p>
                        <p className="font-bold text-white/90">{fmt(deal.amount)} <span className="text-white/40 font-normal">· {deal.equity}%</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <Badge className="bg-white/5 text-white/40 border border-white/[0.08]">{deal.stage}</Badge>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{new Date(deal.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 flex-col">
                  {deal.status === "NEGOTIATING" && (
                    <>
                      <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-xs" onClick={() => updateStatus(deal.id, "SIGNED")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5"/>Mark Signed
                      </Button>
                      <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs" onClick={() => updateStatus(deal.id, "DROPPED")}>
                        <XCircle className="h-3.5 w-3.5 mr-1.5"/>Cancel
                      </Button>
                    </>
                  )}
                  {deal.status === "SIGNED" && (
                    <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs" onClick={() => updateStatus(deal.id, "CLOSED")}>
                      <ArrowRight className="h-3.5 w-3.5 mr-1.5"/>Close Deal
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-xl text-white/30 hover:text-white text-xs">
                    <Eye className="h-3.5 w-3.5 mr-1.5"/>View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
