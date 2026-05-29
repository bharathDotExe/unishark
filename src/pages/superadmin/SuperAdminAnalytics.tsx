import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, FileText, ShieldCheck, TrendingUp, TrendingDown, RefreshCw, Activity, PieChart, Globe, Calendar, Download } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPitches: 0, approvedPitches: 0, rejectedPitches: 0, pendingPitches: 0,
    totalStudents: 0, totalInvestors: 0, verifiedInvestors: 0,
    pitchesByStage: [] as any[], recentActivity: [] as any[],
  });

  const load = async () => {
    setLoading(true);
    const [pRes, sRes, iRes] = await Promise.all([
      supabase.from("pitches").select("status,stage,created_at"),
      supabase.from("student_profiles").select("id,created_at"),
      supabase.from("investor_profiles").select("verified,created_at"),
    ]);
    const p = pRes.data ?? [], s = sRes.data ?? [], inv = iRes.data ?? [];
    const stageMap: any = {};
    p.forEach(x => { if (x.stage) stageMap[x.stage] = (stageMap[x.stage]||0)+1; });

    // 7-day activity
    const activity = Array.from({length:7}, (_,i) => {
      const d = new Date(); d.setDate(d.getDate()-6+i);
      const ds = d.toISOString().slice(0,10);
      return {
        date: d.toLocaleDateString("en-IN",{day:"numeric",month:"short"}),
        pitches: p.filter(x=>x.created_at?.startsWith(ds)).length,
        students: s.filter(x=>x.created_at?.startsWith(ds)).length,
        investors: inv.filter(x=>x.created_at?.startsWith(ds)).length,
      };
    });

    setStats({
      totalPitches: p.length, approvedPitches: p.filter(x=>x.status==="APPROVED").length,
      rejectedPitches: p.filter(x=>x.status==="REJECTED").length, pendingPitches: p.filter(x=>x.status==="SUBMITTED").length,
      totalStudents: s.length, totalInvestors: inv.length, verifiedInvestors: inv.filter(x=>x.verified).length,
      pitchesByStage: Object.entries(stageMap).map(([stage,count])=>({stage,count})).sort((a:any,b:any)=>b.count-a.count),
      recentActivity: activity,
    });
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const maxBar = Math.max(...stats.recentActivity.map(d => Math.max(d.pitches, d.students, d.investors)), 1);
  const approvalRate = stats.totalPitches > 0 ? ((stats.approvedPitches/stats.totalPitches)*100).toFixed(1) : "0";
  const verifyRate   = stats.totalInvestors > 0 ? ((stats.verifiedInvestors/stats.totalInvestors)*100).toFixed(1) : "0";
  const maxStage = Math.max(...stats.pitchesByStage.map(s=>s.count as number),1);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white">Complete Analytics</h1>
          <p className="text-white/40 text-sm mt-0.5">Full platform performance intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <Calendar className="h-3.5 w-3.5"/>Live data
          <Button variant="ghost" size="sm" className="rounded-xl text-white/50 hover:text-white border border-white/[0.08] ml-2" onClick={load}><RefreshCw className="h-4 w-4 mr-2"/>Refresh</Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Total Users",    value:stats.totalStudents+stats.totalInvestors, sub:`${stats.totalStudents}S · ${stats.totalInvestors}I`, grad:"from-blue-500 to-indigo-600", glow:"shadow-blue-500/20",   icon:Users },
          { label:"Total Pitches",  value:stats.totalPitches,   sub:`${approvalRate}% approval rate`,  grad:"from-sky-500 to-cyan-600",     glow:"shadow-sky-500/20",    icon:FileText },
          { label:"Verified Inv.",  value:stats.verifiedInvestors, sub:`${verifyRate}% of investors`,  grad:"from-green-500 to-emerald-600",glow:"shadow-green-500/20",  icon:ShieldCheck },
          { label:"Platform Score", value:"9.2/10",             sub:"operational health",              grad:"from-yellow-400 to-orange-500",glow:"shadow-yellow-500/20", icon:Activity },
        ].map(k=>(
          <Card key={k.label} className="p-5 border border-white/[0.08] bg-white/[0.03] relative overflow-hidden hover:bg-white/[0.05] transition-all hover:translate-y-[-2px]">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-12 translate-x-12 bg-gradient-to-br ${k.grad} opacity-10 blur-2xl`}/>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40">{k.label}</p>
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${k.grad} flex items-center justify-center shadow-lg ${k.glow}`}>
                <k.icon className="h-4 w-4 text-white"/>
              </div>
            </div>
            {loading?<div className="h-8 bg-white/10 rounded animate-pulse"/>:<p className="text-3xl font-extrabold text-white">{k.value}</p>}
            <p className="text-xs text-white/30 mt-1">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-day Activity */}
        <Card className="p-5 border border-white/[0.08] bg-white/[0.03]">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2"><Activity className="h-4 w-4 text-white/40"/>7-Day Activity</h2>
          <div className="flex items-center gap-4 mb-4">
            {[{label:"Pitches",color:"bg-sky-400"},{label:"Students",color:"bg-blue-400"},{label:"Investors",color:"bg-cyan-400"}].map(l=>(
              <div key={l.label} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${l.color}`}/><span className="text-xs text-white/40">{l.label}</span></div>
            ))}
          </div>
          {loading?<div className="h-32 bg-white/5 rounded animate-pulse"/>:(
            <div className="flex items-end gap-2 h-32">
              {stats.recentActivity.map(d=>(
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-0.5 w-full justify-center">
                    {[{v:d.pitches,c:"bg-sky-400"},{v:d.students,c:"bg-blue-400"},{v:d.investors,c:"bg-cyan-400"}].map((b,i)=>(
                      <div key={i} className={`flex-1 ${b.c} rounded-t-sm opacity-70 hover:opacity-100 transition-opacity min-h-[2px]`} style={{height:`${(b.v/maxBar)*96}px`}}/>
                    ))}
                  </div>
                  <span className="text-[9px] text-white/30 whitespace-nowrap">{d.date}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Status Distribution */}
        <Card className="p-5 border border-white/[0.08] bg-white/[0.03]">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2"><PieChart className="h-4 w-4 text-white/40"/>Pitch Status</h2>
          {loading?<div className="space-y-3">{Array(4).fill(0).map((_,i)=><div key={i} className="h-8 bg-white/5 rounded animate-pulse"/>)}</div>:(
            <div className="space-y-4">
              {[
                {label:"Approved", value:stats.approvedPitches, color:"bg-green-400", text:"text-green-400"},
                {label:"Pending",  value:stats.pendingPitches,  color:"bg-amber-400", text:"text-amber-400"},
                {label:"Rejected", value:stats.rejectedPitches, color:"bg-red-400",   text:"text-red-400"},
              ].map(s=>{
                const pct = stats.totalPitches>0?(s.value/stats.totalPitches*100):0;
                return (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white/70">{s.label}</span>
                      <span className={`text-sm font-bold ${s.text}`}>{s.value} <span className="text-white/30 font-normal text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Stage Breakdown */}
        <Card className="p-5 border border-white/[0.08] bg-white/[0.03] lg:col-span-2">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-white/40"/>Pitches by Stage</h2>
          {loading?<div className="grid sm:grid-cols-3 gap-3">{Array(6).fill(0).map((_,i)=><div key={i} className="h-16 bg-white/5 rounded animate-pulse"/>)}</div>:
          stats.pitchesByStage.length===0?<p className="text-white/30 text-sm text-center py-6">No stage data</p>:(
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.pitchesByStage.map((s:any)=>{
                const pct = (s.count/maxStage)*100;
                return (
                  <Card key={s.stage} className="p-4 border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/50">{s.stage}</span>
                      <span className="text-sm font-extrabold text-white">{s.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full" style={{width:`${pct}%`}}/>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>

        {/* User Split */}
        <Card className="p-5 border border-white/[0.08] bg-white/[0.03] lg:col-span-2">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2"><Users className="h-4 w-4 text-white/40"/>User Distribution</h2>
          {loading?<div className="h-6 bg-white/5 rounded animate-pulse"/>:(
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex h-6 rounded-full overflow-hidden">
                  {[
                    {v:stats.totalStudents,c:"bg-blue-500",l:"Students"},
                    {v:stats.totalInvestors,c:"bg-cyan-500",l:"Investors"},
                  ].map(b=>{
                    const total=stats.totalStudents+stats.totalInvestors||1;
                    return <div key={b.l} className={`${b.c} transition-all duration-700 flex items-center justify-center`} style={{width:`${(b.v/total)*100}%`}}>
                      <span className="text-[10px] font-bold text-white/80 px-1 truncate">{b.l}</span>
                    </div>;
                  })}
                </div>
              </div>
              <div className="flex gap-4 text-sm shrink-0">
                <span className="flex items-center gap-1.5 text-white/60"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>{stats.totalStudents} Students</span>
                <span className="flex items-center gap-1.5 text-white/60"><span className="w-3 h-3 rounded-full bg-cyan-500 inline-block"/>{stats.totalInvestors} Investors</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
