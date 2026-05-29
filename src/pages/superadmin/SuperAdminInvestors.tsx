import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, ShieldX, ExternalLink, Search, RefreshCw, Building2, DollarSign, Clock, Download, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function SuperAdminInvestors() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("investor_profiles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setInvestors(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    let res = investors;
    if (tab === "VERIFIED") res = res.filter(i => i.verified);
    else if (tab === "PENDING") res = res.filter(i => !i.verified && i.verification_status !== "REJECTED");
    else if (tab === "REJECTED") res = res.filter(i => i.verification_status === "REJECTED");
    if (search.trim()) res = res.filter(i => (i.full_name||"").toLowerCase().includes(search.toLowerCase()) || (i.company_fund_name||"").toLowerCase().includes(search.toLowerCase()));
    setFiltered(res);
  }, [investors, tab, search]);

  const verify = async (id: string) => {
    await supabase.from("investor_profiles").update({ verified: true, verification_status: "APPROVED", verified_at: new Date().toISOString() }).eq("id", id);
    toast.success("Verified ✓"); load();
  };
  const revoke = async (id: string) => {
    await supabase.from("investor_profiles").update({ verified: false, verification_status: "REJECTED" }).eq("id", id);
    toast.success("Verification revoked"); load();
  };
  const deleteInvestor = async (id: string) => {
    await supabase.from("investor_profiles").delete().eq("id", id);
    toast.success("Profile deleted"); load();
  };

  const fmt = (v: number|null) => !v ? "—" : v >= 10000000 ? `₹${(v/10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${v.toLocaleString()}`;

  const counts = {
    ALL: investors.length,
    VERIFIED: investors.filter(i => i.verified).length,
    PENDING: investors.filter(i => !i.verified && i.verification_status !== "REJECTED").length,
    REJECTED: investors.filter(i => i.verification_status === "REJECTED").length,
  };

  const statusBadge = (i: any) => {
    if (i.verified) return <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 font-bold text-xs">Verified</Badge>;
    if (i.verification_status === "REJECTED") return <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-xs">Rejected</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs">Pending</Badge>;
  };

  const exportCSV = () => {
    const rows = [["ID","Name","Company","Verified","Experience","Min","Max"],
      ...filtered.map(i=>[i.id,i.full_name||"",i.company_fund_name||"",i.verified,i.investment_experience||"",i.ticket_size_min||"",i.ticket_size_max||""])];
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"})); a.download="investors.csv"; a.click();
    toast.success("Exported ✓");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">All Investors</h1>
          <p className="text-white/40 text-sm mt-0.5">Complete investor roster — verify, revoke, manage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-white/50 hover:text-white border border-white/[0.08] text-xs" onClick={exportCSV}><Download className="h-4 w-4 mr-1.5"/>Export</Button>
          <Button variant="ghost" size="sm" className="rounded-xl text-white/50 hover:text-white border border-white/[0.08]" onClick={load}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[{l:"Total",v:counts.ALL,c:"text-white",b:"border-white/10"},{l:"Verified",v:counts.VERIFIED,c:"text-green-400",b:"border-green-500/20"},{l:"Pending",v:counts.PENDING,c:"text-amber-400",b:"border-amber-500/20"},{l:"Rejected",v:counts.REJECTED,c:"text-red-400",b:"border-red-500/20"}].map(s=>(
          <Card key={s.l} className={`p-4 border ${s.b} bg-white/[0.03]`}><p className="text-xs text-white/40 mb-1">{s.l}</p><p className={`text-2xl font-extrabold ${s.c}`}>{loading?"—":s.v}</p></Card>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap gap-3">
        {["ALL","VERIFIED","PENDING","REJECTED"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${tab===t?"bg-white text-black border-white":"border-white/10 text-white/50 hover:border-white/30 hover:text-white"}`}>
            {t.charAt(0)+t.slice(1).toLowerCase()}<span className="ml-2 text-xs opacity-60">{counts[t as keyof typeof counts]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30"/>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or fund..."
            className="pl-9 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 rounded-xl focus-visible:ring-0 text-sm"/>
        </div>
      </div>

      {/* List */}
      {loading?(
        <div className="space-y-3">{Array(4).fill(0).map((_,i)=><Card key={i} className="p-5 border border-white/[0.08] bg-white/[0.03] animate-pulse"><div className="h-5 bg-white/10 rounded w-1/4 mb-2"/><div className="h-4 bg-white/10 rounded w-1/2"/></Card>)}</div>
      ):filtered.length===0?(
        <Card className="p-10 border border-white/[0.08] bg-white/[0.03] text-center"><ShieldCheck className="h-10 w-10 text-white/20 mx-auto mb-3"/><p className="text-white/50">No investors found</p></Card>
      ):(
        <div className="space-y-3">
          {filtered.map(inv=>(
            <Card key={inv.id} className="p-5 border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white">{inv.full_name||`Investor ${inv.user_id?.slice(0,8)}…`}</h3>
                    {statusBadge(inv)}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-white/40">
                    {inv.company_fund_name&&<span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5"/>{inv.company_fund_name}</span>}
                    {(inv.ticket_size_min||inv.ticket_size_max)&&<span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5"/>{fmt(inv.ticket_size_min)} – {fmt(inv.ticket_size_max)}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{new Date(inv.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                  </div>
                  {(inv.investment_sectors||inv.sectors)&&(
                    <div className="flex flex-wrap gap-1 mt-2">
                      {((inv.investment_sectors||inv.sectors)??[]).slice(0,4).map((s:string)=>(
                        <Badge key={s} className="bg-white/5 text-white/40 border border-white/[0.08] text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {inv.linkedin_url&&<Button asChild variant="ghost" size="sm" className="rounded-xl text-white/40 hover:text-white border border-white/[0.08] text-xs"><a href={inv.linkedin_url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1.5"/>LinkedIn</a></Button>}
                  {!inv.verified&&inv.verification_status!=="REJECTED"&&(
                    <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl text-xs" onClick={()=>verify(inv.id)}><ShieldCheck className="h-3.5 w-3.5 mr-1.5"/>Verify</Button>
                  )}
                  {inv.verified&&(
                    <Button size="sm" className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs" onClick={()=>revoke(inv.id)}><ShieldX className="h-3.5 w-3.5 mr-1.5"/>Revoke</Button>
                  )}
                  <Button size="sm" className="bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 border border-white/[0.08] hover:border-red-500/30 rounded-xl text-xs" onClick={()=>deleteInvestor(inv.id)}><Trash2 className="h-3.5 w-3.5"/></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
