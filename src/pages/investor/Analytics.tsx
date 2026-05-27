import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Download, PieChart, Activity, AlertTriangle, Lightbulb, Share, FileText, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState("1 Year");
  const [sectorFilter, setSectorFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24 space-y-8">
      
      {/* HEADER & FILTERS */}
      <div className="border-b-2 border-foreground/10 pb-6 mb-8">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight uppercase flex items-center gap-3">
          <TrendingUp className="w-10 h-10 text-[hsl(var(--pastel-blue))]" />
          INVESTMENT ANALYTICS
        </h1>
        <p className="text-lg font-bold text-muted-foreground mt-2">
          (Track your portfolio performance)
        </p>
      </div>

      <Card className="p-4 border-2 border-foreground bg-muted/20 shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl flex flex-wrap gap-4 items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Time Period:</span>
          <div className="flex gap-2">
            {["All Time", "1 Year", "6 Months", "3 Months"].map(f => (
              <button key={f} onClick={() => setTimeFilter(f)} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all", timeFilter === f ? "bg-foreground text-background translate-y-[-1px] translate-x-[-1px]" : "bg-card text-foreground")}>{f}</button>
            ))}
          </div>
        </div>
        <div className="w-px h-10 bg-foreground/10 mx-2 hidden md:block"></div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Sector:</span>
          <div className="flex gap-2">
            {["All", "EdTech", "SaaS", "FinTech"].map(f => (
              <button key={f} onClick={() => setSectorFilter(f)} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all", sectorFilter === f ? "bg-foreground text-background translate-y-[-1px] translate-x-[-1px]" : "bg-card text-foreground")}>{f}</button>
            ))}
          </div>
        </div>
        <div className="w-px h-10 bg-foreground/10 mx-2 hidden lg:block"></div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Stage:</span>
          <div className="flex gap-2">
            {["All", "MVP", "Seed", "Series A"].map(f => (
              <button key={f} onClick={() => setStageFilter(f)} className={cn("text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] transition-all", stageFilter === f ? "bg-foreground text-background translate-y-[-1px] translate-x-[-1px]" : "bg-card text-foreground")}>{f}</button>
            ))}
          </div>
        </div>
      </Card>

      {/* SECTION 1 & 2 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SECTION 1: KEY METRICS */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 md:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl h-full">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider mb-6 border-b-2 border-foreground/10 pb-2 flex justify-between">
              <span>Section 1</span> <span>KEY METRICS</span>
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end border-b-2 border-foreground/10 pb-2">
                <span className="text-sm font-bold text-muted-foreground">Total Invested:</span>
                <span className="text-xl font-extrabold text-foreground">₹3.5 Crore</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-foreground/10 pb-2">
                <span className="text-sm font-bold text-muted-foreground">Portfolio Value:</span>
                <span className="text-2xl font-display font-extrabold text-success">₹6.2 Crore</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-foreground/10 pb-2">
                <span className="text-sm font-bold text-muted-foreground">Unrealized Gain:</span>
                <span className="text-lg font-extrabold text-success">₹2.7 Crore (77%)</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-foreground/10 pb-2">
                <span className="text-sm font-bold text-muted-foreground">Realized Gain:</span>
                <span className="text-lg font-extrabold text-foreground">₹0 (0 exits)</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-foreground/10 pb-2">
                <span className="text-sm font-bold text-muted-foreground">Avg Annual Return:</span>
                <span className="text-lg font-extrabold text-foreground">18%</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-extrabold text-foreground uppercase tracking-widest mb-3">Portfolio Metrics:</p>
              <ul className="text-xs font-bold text-muted-foreground space-y-2.5">
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Number of Investments:</span> <span className="text-foreground">5 companies</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Average Check Size:</span> <span className="text-foreground">₹70L</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Success Rate:</span> <span className="text-foreground">80% (4 of 5 growing)</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Time to Break-even:</span> <span className="text-foreground">18 months (avg)</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">├─</span> <span>Best Performer:</span> <span className="text-success">FinTech App (400% return)</span></li>
                <li className="flex gap-2"><span className="text-foreground/30">└─</span> <span>Worst Performer:</span> <span className="text-destructive">EdTech Learning (8% return)</span></li>
              </ul>
            </div>
          </Card>
        </div>

        {/* SECTION 2: GROWTH CHART & SECTION 3: SECTOR */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* GROWTH CHART */}
          <Card className="p-6 md:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl flex-1 flex flex-col">
            <div className="flex justify-between items-start border-b-2 border-foreground/10 pb-2 mb-6">
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                PORTFOLIO VALUE GROWTH (LAST 12M)
              </h2>
              <Badge className="bg-success text-success-foreground font-black text-xs px-2 py-0 border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]">+77%</Badge>
            </div>
            
            <div className="flex-1 relative min-h-[200px] w-full flex items-end pt-8 pb-8 pl-12 pr-4 bg-muted/10 rounded-xl border-2 border-foreground/10">
              
              {/* Y-Axis Labels */}
              <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-[10px] font-extrabold text-muted-foreground h-full py-4">
                <span>₹7Cr</span>
                <span>₹6Cr</span>
                <span>₹5Cr</span>
                <span>₹4Cr</span>
                <span>₹3Cr</span>
              </div>

              {/* Custom SVG Line Chart matching wireframe spikes */}
              <div className="w-full h-full relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" className="text-foreground/10 stroke-dasharray-[2,2]" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.5" className="text-foreground/10 stroke-dasharray-[2,2]" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-foreground/10 stroke-dasharray-[2,2]" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.5" className="text-foreground/10 stroke-dasharray-[2,2]" />
                  <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="1" className="text-foreground" />
                  
                  {/* The Line - Starts at 3.5Cr (approx 85% y), ends at 6.2Cr (approx 20% y) */}
                  <polyline 
                    points="0,85 20,80 40,50 50,70 70,30 85,25 100,20" 
                    fill="none" 
                    stroke="hsl(var(--pastel-blue))" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
                  />
                  
                  {/* Points */}
                  <circle cx="0" cy="85" r="3" fill="currentColor" className="text-foreground" />
                  <circle cx="20" cy="80" r="3" fill="currentColor" className="text-foreground" />
                  <circle cx="40" cy="50" r="3" fill="currentColor" className="text-foreground" />
                  <circle cx="50" cy="70" r="3" fill="currentColor" className="text-foreground" />
                  <circle cx="70" cy="30" r="3" fill="currentColor" className="text-foreground" />
                  <circle cx="85" cy="25" r="3" fill="currentColor" className="text-foreground" />
                  <circle cx="100" cy="20" r="3" fill="currentColor" className="text-[hsl(var(--pastel-blue))]" stroke="currentColor" strokeWidth="2" />
                </svg>
                
                {/* Annotations */}
                <div className="absolute left-0 bottom-[12%] text-[9px] font-bold bg-background px-1 border border-foreground/20 rounded translate-y-[50%]">Started: ₹3.5Cr</div>
                <div className="absolute right-0 top-[15%] text-[9px] font-bold bg-foreground text-background px-1 border border-foreground/20 rounded translate-y-[-100%]">Today: ₹6.2Cr</div>
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-1 left-12 right-4 flex justify-between text-[10px] font-extrabold text-muted-foreground">
                <span>May'23</span>
                <span>Aug'23</span>
                <span>Nov'23</span>
                <span>Feb'24</span>
                <span>May'24</span>
              </div>
            </div>
            
            <p className="text-xs font-bold text-muted-foreground mt-4 text-center border-t-2 border-foreground/10 pt-4">
              Growth: <span className="text-success font-extrabold">+77%</span> (₹2.7Cr gain in 12 months)
            </p>
          </Card>

        </div>
      </div>

      {/* SECTION 3 & 4 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SECTION 3: SECTOR ALLOCATION */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <Card className="p-6 md:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl flex-1 flex flex-col">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider mb-6 border-b-2 border-foreground/10 pb-2">
              SECTOR BREAKDOWN
            </h2>
            
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              {/* Custom SVG Donut Chart */}
              <div className="relative w-48 h-48 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  {/* EdTech 40% */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="hsl(var(--pastel-blue))" strokeWidth="20" strokeDasharray="100 151.3" strokeDashoffset="0" />
                  {/* SaaS 35% */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="hsl(var(--pastel-pink))" strokeWidth="20" strokeDasharray="88 163.3" strokeDashoffset="-100" />
                  {/* FinTech 25% */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="hsl(var(--pastel-yellow))" strokeWidth="20" strokeDasharray="63.3 188" strokeDashoffset="-188" />
                  
                  {/* White separators */}
                  <line x1="50" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" className="text-background" />
                  <line x1="50" y1="50" x2="37.6" y2="88" stroke="currentColor" strokeWidth="2" className="text-background" />
                  <line x1="50" y1="50" x2="17.6" y2="26.5" stroke="currentColor" strokeWidth="2" className="text-background" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase">Total</span>
                  <span className="text-sm font-black text-foreground">₹6.2Cr</span>
                </div>
              </div>

              <div className="w-full space-y-3 text-xs font-bold text-muted-foreground">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-blue))] border border-foreground" /> 
                    <span className="text-foreground">EdTech (40%)</span>
                  </div>
                  <span>₹2.48Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-pink))] border border-foreground" /> 
                    <span className="text-foreground">SaaS (35%)</span>
                  </div>
                  <span>₹2.17Cr</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-yellow))] border border-foreground" /> 
                    <span className="text-foreground">FinTech (25%)</span>
                  </div>
                  <span>₹1.55Cr</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-foreground/10 text-xs font-bold">
              <p className="font-extrabold uppercase mb-2">Top Sectors:</p>
              <p className="text-muted-foreground mb-1">1. EdTech: 2 companies (AI Resume, EdTech Platform)</p>
              <p className="text-muted-foreground mb-1">2. SaaS: 2 companies (B2B Tools, Automation)</p>
              <p className="text-muted-foreground">3. FinTech: 1 company (Trading App)</p>
            </div>
          </Card>
        </div>

        {/* SECTION 4: INVESTMENT PERFORMANCE BY COMPANY */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <Card className="p-6 md:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl flex-1 flex flex-col overflow-hidden">
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider mb-6 border-b-2 border-foreground/10 pb-2">
              PERFORMANCE BY COMPANY
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-foreground/30 text-xs uppercase tracking-widest text-muted-foreground font-extrabold">
                    <th className="pb-3 px-2">Company</th>
                    <th className="pb-3 px-2">Invested</th>
                    <th className="pb-3 px-2">Current</th>
                    <th className="pb-3 px-2">Return</th>
                    <th className="pb-3 px-2">Growth</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-foreground">
                  <tr className="border-b border-foreground/10 hover:bg-muted/30">
                    <td className="py-4 px-2">FinTech App</td>
                    <td className="py-4 px-2 text-muted-foreground">₹1Cr</td>
                    <td className="py-4 px-2">₹5Cr</td>
                    <td className="py-4 px-2 text-success">+₹4Cr</td>
                    <td className="py-4 px-2 text-success">400%</td>
                    <td className="py-4 px-2 text-right"><Badge className="bg-success text-success-foreground border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"> Hot</Badge></td>
                  </tr>
                  <tr className="border-b border-foreground/10 hover:bg-muted/30">
                    <td className="py-4 px-2">AI Resume Bld.</td>
                    <td className="py-4 px-2 text-muted-foreground">₹50L</td>
                    <td className="py-4 px-2">₹60L</td>
                    <td className="py-4 px-2 text-success">+₹10L</td>
                    <td className="py-4 px-2 text-success">20%</td>
                    <td className="py-4 px-2 text-right"><Badge className="bg-success text-success-foreground border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"> Good</Badge></td>
                  </tr>
                  <tr className="border-b border-foreground/10 hover:bg-muted/30">
                    <td className="py-4 px-2">EdTech Learn</td>
                    <td className="py-4 px-2 text-muted-foreground">₹50L</td>
                    <td className="py-4 px-2">₹54L</td>
                    <td className="py-4 px-2 text-emerald-600 dark:text-emerald-400">+₹4L</td>
                    <td className="py-4 px-2 text-emerald-600 dark:text-emerald-400">8%</td>
                    <td className="py-4 px-2 text-right"><Badge className="bg-warning text-warning-foreground border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"> OK</Badge></td>
                  </tr>
                  <tr className="border-b border-foreground/10 hover:bg-muted/30">
                    <td className="py-4 px-2">SaaS Platform</td>
                    <td className="py-4 px-2 text-muted-foreground">₹75L</td>
                    <td className="py-4 px-2">₹72L</td>
                    <td className="py-4 px-2 text-destructive">-₹3L</td>
                    <td className="py-4 px-2 text-destructive">-4%</td>
                    <td className="py-4 px-2 text-right"><Badge className="bg-destructive text-destructive-foreground border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"> Slow</Badge></td>
                  </tr>
                  <tr className="border-b-2 border-foreground/30 hover:bg-muted/30">
                    <td className="py-4 px-2">Climate Startup</td>
                    <td className="py-4 px-2 text-muted-foreground">₹75L</td>
                    <td className="py-4 px-2">₹81L</td>
                    <td className="py-4 px-2 text-emerald-600 dark:text-emerald-400">+₹6L</td>
                    <td className="py-4 px-2 text-emerald-600 dark:text-emerald-400">8%</td>
                    <td className="py-4 px-2 text-right"><Badge className="bg-warning text-warning-foreground border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))]"> OK</Badge></td>
                  </tr>
                  <tr className="bg-muted/30 text-lg">
                    <td className="py-4 px-2 font-black">TOTAL</td>
                    <td className="py-4 px-2 font-black">₹3.5Cr</td>
                    <td className="py-4 px-2 font-black text-[hsl(var(--pastel-blue))]">₹6.2Cr</td>
                    <td className="py-4 px-2 font-black text-success">+₹2.7Cr</td>
                    <td className="py-4 px-2 font-black text-success">77%</td>
                    <td className="py-4 px-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 5 & 6 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 5: STAGE-WISE ANALYSIS */}
        <Card className="p-6 md:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl flex-1">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider mb-6 border-b-2 border-foreground/10 pb-2">
            STAGE-WISE ANALYSIS
          </h2>
          
          <div className="space-y-6">
            <div className="p-4 border-2 border-foreground/10 rounded-xl bg-muted/10">
              <h3 className="font-extrabold text-sm mb-2 text-foreground">MVP Stage <span className="text-xs text-muted-foreground">(2 companies)</span></h3>
              <ul className="text-xs font-bold text-muted-foreground space-y-1">
                <li>└─ <span className="text-foreground">Average Return:</span> 14% (Low, but growing)</li>
                <li>└─ <span className="text-foreground">Time in stage:</span> 8 months avg</li>
                <li>└─ <span className="text-foreground">Next step:</span> Series A rounds</li>
              </ul>
            </div>
            
            <div className="p-4 border-2 border-[hsl(var(--pastel-blue))] rounded-xl bg-[hsl(var(--pastel-blue))]/10 shadow-[2px_2px_0_0_hsl(var(--pastel-blue))]">
              <h3 className="font-extrabold text-sm mb-2 text-foreground">Seed Stage <span className="text-xs text-muted-foreground">(2 companies)</span></h3>
              <ul className="text-xs font-bold text-muted-foreground space-y-1">
                <li>└─ <span className="text-foreground">Average Return:</span> 200% (High performing)</li>
                <li>└─ <span className="text-foreground">Time in stage:</span> 18 months avg</li>
                <li>└─ <span className="text-foreground">Next step:</span> Series A funding</li>
              </ul>
            </div>

            <div className="p-4 border-2 border-success rounded-xl bg-success/10 shadow-[2px_2px_0_0_hsl(var(--success))]">
              <h3 className="font-extrabold text-sm mb-2 text-foreground">Series A <span className="text-xs text-muted-foreground">(1 company)</span></h3>
              <ul className="text-xs font-bold text-muted-foreground space-y-1">
                <li>└─ <span className="text-foreground">Return:</span> 400% (Best performer!)</li>
                <li>└─ <span className="text-foreground">Time at Series A:</span> 8 months</li>
                <li>└─ <span className="text-foreground">Next step:</span> Series B (upcoming)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* SECTION 6: RECOMMENDATIONS */}
        <Card className="p-6 md:p-8 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-2xl flex-1 flex flex-col bg-[hsl(var(--pastel-yellow))]/20">
          <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider mb-6 border-b-2 border-foreground/10 pb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-foreground" /> PORTFOLIO INSIGHTS
          </h2>
          
          <div className="flex-1 space-y-4 text-sm font-bold leading-relaxed">
            <p className="flex gap-2 items-start"><span className="text-success font-black text-base"></span> <span className="text-foreground">Strength: 80% of investments are growing.</span></p>
            <p className="flex gap-2 items-start"><span className="text-success font-black text-base"></span> <span className="text-foreground">Diversified across EdTech, SaaS, FinTech.</span></p>
            <p className="flex gap-2 items-start"><span className="text-destructive font-black text-base"></span> <span className="text-foreground">Action: Monitor SaaS Platform (negative growth).</span></p>
            <p className="flex gap-2 items-start"><span className="text-warning font-black text-base"></span> <span className="text-foreground">Opportunity: Consider rebalancing toward FinTech (best performers, highest returns).</span></p>
            
            <div className="p-4 bg-background border-2 border-foreground rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))] mt-6 mb-4">
              <p className="flex gap-2 items-start text-foreground"><span className="font-black text-lg">→</span> <span>Suggested: Increase exposure to revenue-stage startups (higher success rate, faster returns).</span></p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t-2 border-foreground/10">
            <Button size="sm" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background">[View Recommendations]</Button>
            <Button size="sm" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] bg-background">[Rebalance Portfolio]</Button>
            <Button size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">[Get Advice]</Button>
          </div>
        </Card>

      </div>

      {/* SECTION 7: DOWNLOAD & EXPORT */}
      <Card className="p-6 border-2 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-xl">
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[-1px] hover:translate-x-[-1px] transition-all">
            <PieChart className="w-4 h-4 mr-2" /> [Download Portfolio Summary]
          </Button>
          <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[-1px] hover:translate-x-[-1px] transition-all">
            <FileText className="w-4 h-4 mr-2" /> [Download Full Report (PDF)]
          </Button>
          <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[-1px] hover:translate-x-[-1px] transition-all">
            <Download className="w-4 h-4 mr-2" /> [Export as CSV]
          </Button>
          <Button className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[-1px] hover:translate-x-[-1px] transition-all">
            <Mail className="w-4 h-4 mr-2" /> [Email Monthly Report]
          </Button>
        </div>
      </Card>

    </div>
  );
}
