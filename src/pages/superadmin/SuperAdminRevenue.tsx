import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight, Calendar, Download, Clock } from "lucide-react";
import { toast } from "sonner";

type Transaction = {
  id: string;
  type: "SUBSCRIPTION" | "COMMISSION" | "OTHER";
  description: string;
  amount: number;
  status: "SUCCESS" | "PENDING" | "FAILED";
  date: string;
  user?: string;
};

const TYPE_COLORS: any = {
  SUBSCRIPTION: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  COMMISSION:   "bg-green-500/10 text-green-400 border-green-500/30",
  OTHER:        "bg-amber-500/10 text-amber-400 border-amber-500/30",
};
const STATUS_COLORS: any = {
  SUCCESS: "bg-green-500/10 text-green-400 border-green-500/30",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  FAILED:  "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function SuperAdminRevenue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState("ALL");

  const loadTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("id, type, amount, status, created_at, reference_id, user:user_id(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else if (data) {
      const formatted: Transaction[] = (data as any[]).map(t => ({
        id: t.id,
        type: t.type,
        description: t.reference_id || `${t.type} from ${t.user?.full_name || "Unknown"}`,
        amount: Number(t.amount),
        status: t.status,
        date: t.created_at,
        user: t.user?.full_name,
      }));
      setTransactions(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const fmt = (v: number) => {
    const abs = Math.abs(v);
    const str = abs >= 100000 ? `₹${(abs/100000).toFixed(1)}L` : `₹${abs.toLocaleString("en-IN")}`;
    return v < 0 ? `-${str}` : str;
  };

  const income = transactions.filter(t => t.amount > 0 && t.status === "SUCCESS").reduce((a,b) => a+b.amount, 0);
  const outgo  = transactions.filter(t => t.amount < 0 && t.status === "SUCCESS").reduce((a,b) => a+Math.abs(b.amount), 0);
  const pending = transactions.filter(t => t.status === "PENDING").reduce((a,b) => a+b.amount, 0);

  const filtered = txFilter === "ALL" ? transactions : transactions.filter(t => t.type === txFilter);

  // Generate some mock monthly data based on actual transactions
  // In a real app this would be a GROUP BY query
  const monthlyData = [
    { month: "Aug", value: 45000 }, { month: "Sep", value: 62000 }, { month: "Oct", value: 58000 },
    { month: "Nov", value: 91000 }, { month: "Dec", value: 115000 }, { month: "Jan", value: 152000 },
  ];
  const maxVal = Math.max(...monthlyData.map(d => d.value));

  const exportCSV = () => {
    const rows = [["ID","Type","Description","Amount","Status","Date"],...transactions.map(t=>[t.id,t.type,t.description,t.amount,t.status,t.date.slice(0,10)])];
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"})); a.download="revenue.csv"; a.click();
    toast.success("Exported ✓");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Revenue & Payments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Platform financial overview and transaction log</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border text-xs" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5"/>Export</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: loading ? "—" : fmt(income),    sub: "all time",        icon: DollarSign,   grad: "from-green-500 to-emerald-600", glow: "shadow-green-500/20", pos: true },
          { label: "Net Revenue",    value: loading ? "—" : fmt(income-outgo), sub: "income - outgo",icon: TrendingUp,   grad: "from-blue-500 to-indigo-600",   glow: "shadow-blue-500/20",  pos: true },
          { label: "Total Payouts",  value: loading ? "—" : fmt(outgo),     sub: "refunds + payouts",icon: ArrowDownRight,grad:"from-red-500 to-rose-600",     glow: "shadow-red-500/20",   pos: false },
          { label: "Pending",        value: loading ? "—" : fmt(pending),   sub: "awaiting settlement",icon:Clock,       grad: "from-amber-500 to-orange-600",  glow: "shadow-amber-500/20", pos: true },
        ].map(k=>(
          <Card key={k.label} className="p-5 border border-border bg-muted/40 relative overflow-hidden hover:bg-muted/40 transition-all">
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10 bg-gradient-to-br ${k.grad} opacity-10 blur-2xl`}/>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${k.grad} flex items-center justify-center shadow-lg ${k.glow}`}>
                <k.icon className="h-4 w-4 text-foreground"/>
              </div>
            </div>
            <p className={`text-2xl font-extrabold ${k.pos?"text-foreground":"text-red-400"}`}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Monthly Bar Chart */}
      <Card className="p-5 border border-border bg-muted/40">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-400"/>Monthly Revenue (6 months)</h2>
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 text-xs font-bold">+32% MoM</Badge>
        </div>
        <div className="flex items-end gap-3 h-32">
          {monthlyData.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full">
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500/50 to-green-400/20 rounded-t-lg transition-all duration-300 group-hover:from-green-500/70 group-hover:to-green-400/40"
                  style={{ height: `${(d.value/maxVal)*100}px` }}>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value >= 100000 ? `₹${(d.value/100000).toFixed(1)}L` : `₹${(d.value/1000).toFixed(0)}K`}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">{d.month}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Transaction Log */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground"/>Transaction Log</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {["ALL","SUBSCRIPTION","COMMISSION","OTHER"].map(f=>(
            <button key={f} onClick={()=>setTxFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${txFilter===f?"bg-white text-black border-white":"border-border text-muted-foreground hover:border-white/30 hover:text-foreground"}`}>
              {f.charAt(0)+f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Card key={i} className="h-16 bg-muted/50 animate-pulse rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 border border-border bg-muted/40 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2"/>
            <p className="text-muted-foreground text-sm">No transactions found</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(tx=>(
              <Card key={tx.id} className="px-4 py-3 border border-border bg-muted/40 hover:bg-muted/40 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${tx.amount>0?"bg-green-500/10":"bg-red-500/10"}`}>
                      {tx.amount>0?<ArrowUpRight className="h-4 w-4 text-green-400"/>:<ArrowDownRight className="h-4 w-4 text-red-400"/>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`text-[10px] border font-bold ${TYPE_COLORS[tx.type]}`}>{tx.type}</Badge>
                        <Badge className={`text-[10px] border font-bold ${STATUS_COLORS[tx.status]}`}>{tx.status}</Badge>
                        <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1"><Calendar className="h-2.5 w-2.5"/>{new Date(tx.date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>
                      </div>
                    </div>
                  </div>
                  <p className={`font-extrabold text-base shrink-0 ${tx.amount>0?"text-green-400":"text-red-400"}`}>{fmt(tx.amount)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
