import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Briefcase, TrendingUp, BarChart3, Download, Scale, ArrowUpRight, 
  MessageSquare, FileText, FileDown, Calendar, AlertCircle, Building2
} from "lucide-react";

export default function Portfolio() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
      
      {/* HEADER */}
      <div className="mb-8 border-b-2 border-foreground/10 pb-6">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-foreground" /> My Portfolio
        </h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1 pl-11">
          (Your investment tracking)
        </p>
      </div>

      {/* PORTFOLIO SUMMARY & CHARTS (TOP GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        
        {/* Summary Card */}
        <Card className="lg:col-span-7 p-6 md:p-8 border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] bg-card">
          <h2 className="font-display font-extrabold text-xl uppercase tracking-wider mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Portfolio Summary
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="bg-[hsl(var(--pastel-blue))]/20 p-4 border-2 border-foreground rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Investments</p>
              <p className="text-2xl font-black text-foreground">₹3.5 Crore</p>
              <p className="text-xs font-semibold text-foreground/80 mt-1">across 5 companies</p>
            </div>
            <div className="bg-[hsl(var(--pastel-mint))]/20 p-4 border-2 border-foreground rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2"><TrendingUp className="h-6 w-6 text-success opacity-50" /></div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current Value</p>
              <p className="text-2xl font-black text-foreground">₹6.2 Crore</p>
              <p className="text-xs font-semibold text-success mt-1">Unrealized: ₹2.7Cr (77% return)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-t-2 border-foreground/10 pt-6">
            <div className="w-full sm:w-1/2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Distribution</p>
              <ul className="text-sm font-semibold space-y-1">
                <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(var(--pastel-blue))]" /> EdTech: 2 companies (40%)</li>
                <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(var(--pastel-pink))]" /> SaaS: 2 companies (35%)</li>
                <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[hsl(var(--pastel-yellow))]" /> FinTech: 1 company (25%)</li>
              </ul>
            </div>
            
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <p className="text-sm font-bold bg-muted p-2 rounded-lg text-center border border-foreground/10">Avg Annual Return: 18%</p>
              <Button size="sm" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8">
                <Download className="h-3 w-3 mr-2" /> Download Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Charts Card */}
        <Card className="lg:col-span-5 p-6 border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] bg-card flex flex-col">
          <h2 className="font-display font-extrabold text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
            Portfolio Charts
          </h2>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Mock Line Chart */}
            <div className="w-full sm:w-1/2 flex flex-col items-center">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Growth (₹3.5Cr → ₹6.2Cr)</p>
              <div className="w-full h-32 bg-muted/20 border-2 border-foreground/10 rounded-xl relative overflow-hidden flex items-end justify-between px-2 pt-2 pb-1">
                 <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <polyline points="0,40 25,38 50,25 75,15 100,5" fill="none" stroke="hsl(var(--pastel-mint))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="100" cy="5" r="3" fill="hsl(var(--pastel-mint))" />
                 </svg>
              </div>
            </div>

            {/* Mock Pie/Donut Chart */}
            <div className="w-full sm:w-1/2 flex flex-col items-center">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Allocation</p>
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-md">
                  {/* EdTech 40% */}
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 15.14 10.9" fill="none" stroke="hsl(var(--pastel-blue))" strokeWidth="6" />
                  {/* SaaS 35% */}
                  <path d="M33.14 12.9845 a 15.9155 15.9155 0 0 1 -11.9 20.2" fill="none" stroke="hsl(var(--pastel-pink))" strokeWidth="6" />
                  {/* FinTech 25% */}
                  <path d="M21.24 33.1845 a 15.9155 15.9155 0 0 1 -3.24 -31.1" fill="none" stroke="hsl(var(--pastel-yellow))" strokeWidth="6" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-card rounded-full border-2 border-foreground/10"></div>
                </div>
              </div>
            </div>

          </div>
        </Card>

      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-8 bg-muted/20 p-4 rounded-2xl border-2 border-foreground/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-muted-foreground uppercase">Status:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent><SelectItem value="all" className="font-bold">All</SelectItem><SelectItem value="growing" className="font-bold">Growing</SelectItem><SelectItem value="stable" className="font-bold">Stable</SelectItem><SelectItem value="declining" className="font-bold">Declining</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-muted-foreground uppercase">Stage:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent><SelectItem value="all" className="font-bold">All</SelectItem><SelectItem value="mvp" className="font-bold">MVP</SelectItem><SelectItem value="seed" className="font-bold">Seed</SelectItem><SelectItem value="series_a" className="font-bold">Series A</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-muted-foreground uppercase">Sector:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-[120px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent><SelectItem value="all" className="font-bold">All</SelectItem><SelectItem value="edtech" className="font-bold">EdTech</SelectItem><SelectItem value="saas" className="font-bold">SaaS</SelectItem><SelectItem value="fintech" className="font-bold">FinTech</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-muted-foreground uppercase">Sort By:</span>
          <Select defaultValue="return">
            <SelectTrigger className="w-[140px] h-9 border-2 border-foreground font-bold rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              <SelectValue placeholder="Return" />
            </SelectTrigger>
            <SelectContent><SelectItem value="date" className="font-bold">Date</SelectItem><SelectItem value="return" className="font-bold">Return</SelectItem><SelectItem value="valuation" className="font-bold">Valuation</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      {/* ACTIVE INVESTMENTS */}
      <h2 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2 mb-6">
        Active Investments
      </h2>

      <div className="space-y-8">
        
        {/* INVESTMENT 1 */}
        <Card className="border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_0_hsl(var(--foreground))] bg-card">
          <div className="bg-muted/10 border-b-2 border-foreground/10 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-foreground flex items-center gap-3">
                <Building2 className="h-6 w-6 text-muted-foreground" />
                AI Resume Builder
              </h3>
              <p className="text-sm font-bold text-muted-foreground mt-1 ml-9">
                Founder: John Doe <span className="mx-2">|</span> Stage: MVP → Seed
              </p>
            </div>
            <div className="flex flex-col items-end">
               <Badge className="bg-success text-success-foreground border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] text-sm py-1">
                  Status: Growing
               </Badge>
            </div>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Col */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-extrabold text-muted-foreground border-b-2 border-foreground/10 pb-1 mb-3">Investment Details</h4>
                <ul className="text-sm font-semibold space-y-2">
                  <li className="flex justify-between"><span>├─ Your Investment:</span> <span className="font-bold text-foreground">₹50 Lakhs</span></li>
                  <li className="flex justify-between"><span>├─ Date Invested:</span> <span>May 1, 2024</span></li>
                  <li className="flex justify-between"><span>├─ Equity Stake:</span> <span className="font-bold text-foreground">5%</span></li>
                  <li className="flex justify-between"><span>└─ Entry Valuation:</span> <span>₹10Cr</span></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-xs uppercase font-extrabold text-muted-foreground border-b-2 border-foreground/10 pb-1 mb-3">Current Status</h4>
                <ul className="text-sm font-semibold space-y-2">
                  <li className="flex justify-between"><span>├─ Current Valuation:</span> <span className="font-bold text-success">₹12Cr (20% growth)</span></li>
                  <li className="flex justify-between"><span>├─ Your Share Value:</span> <span className="font-bold text-[hsl(var(--pastel-blue))]-dark font-sans text-base">₹60L</span></li>
                  <li className="flex justify-between"><span>└─ Unrealized Gain:</span> <span className="font-bold text-success">₹10L (20% return)</span></li>
                </ul>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs uppercase font-extrabold text-muted-foreground border-b-2 border-foreground/10 pb-1 mb-3">Metrics (Month over Month)</h4>
                <ul className="text-sm font-semibold space-y-2">
                  <li className="flex items-center gap-2"><span>├─ Users:</span> <span>500 → <span className="font-bold text-success">620</span> (24% growth)</span></li>
                  <li className="flex items-center gap-2"><span>├─ MRR:</span> <span>$5k → <span className="font-bold text-success">$6.5k</span> (30% growth)</span></li>
                  <li className="flex items-center gap-2"><span>└─ Monthly Growth:</span> <span className="font-bold text-success">15%</span></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs uppercase font-extrabold text-muted-foreground border-b-2 border-foreground/10 pb-1 mb-3">Founder Updates</h4>
                <div className="bg-[hsl(var(--pastel-yellow))]/10 border-l-4 border-[hsl(var(--pastel-yellow))] p-3 rounded-r-lg">
                  <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase flex items-center gap-1"><Calendar className="h-3 w-3" /> Last update: May 12 (3 days ago)</p>
                  <p className="text-sm font-bold italic text-foreground">"Reached 500 users, $6.5k MRR. Hiring for product."</p>
                </div>
              </div>
              
              <div>
                 <h4 className="text-xs uppercase font-extrabold text-muted-foreground border-b-2 border-foreground/10 pb-1 mb-2">Documents</h4>
                 <div className="flex flex-wrap gap-2">
                   <Badge variant="outline" className="border-foreground/20 font-bold bg-muted/20 hover:bg-muted cursor-pointer"><FileDown className="h-3 w-3 mr-1" /> SAFE</Badge>
                   <Badge variant="outline" className="border-foreground/20 font-bold bg-muted/20 hover:bg-muted cursor-pointer"><FileDown className="h-3 w-3 mr-1" /> Pitch Deck</Badge>
                   <Badge variant="outline" className="border-foreground/20 font-bold bg-muted/20 hover:bg-muted cursor-pointer"><FileDown className="h-3 w-3 mr-1" /> Cap Table</Badge>
                   <Badge variant="outline" className="border-foreground/20 font-bold bg-muted/20 hover:bg-muted cursor-pointer"><FileDown className="h-3 w-3 mr-1" /> Metrics (May)</Badge>
                 </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-muted/30 border-t-2 border-foreground/10 p-4 flex flex-wrap gap-2">
            <Button asChild size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
              <Link to="/portfolio/1">View Full Details</Link>
            </Button>
            <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl bg-background hover:bg-[hsl(var(--pastel-mint))]">
              <MessageSquare className="h-4 w-4 mr-2" /> Message Founder
            </Button>
            <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl bg-background">
              <AlertCircle className="h-4 w-4 mr-2" /> View Updates
            </Button>
            <div className="flex-1 min-w-[20px]" />
            <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-foreground">
              Download Documents
            </Button>
          </div>
        </Card>

        {/* INVESTMENT 2 */}
        <Card className="border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-[24px] overflow-hidden bg-card">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
              <div>
                <h3 className="font-display font-extrabold text-xl text-foreground">EdTech Learning Platform</h3>
                <p className="text-xs font-bold text-muted-foreground mt-1">Founder: Priya Sharma <span className="mx-2">|</span> Stage: MVP → Series A</p>
              </div>
              <Badge className="bg-[hsl(var(--pastel-yellow))] text-foreground border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                 Status: Growing (Slower)
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold mb-6 pb-6 border-b border-foreground/10">
              <div><span className="text-muted-foreground">Investment:</span> <span className="font-bold">₹50L</span></div>
              <div><span className="text-muted-foreground">Equity:</span> <span className="font-bold">3%</span></div>
              <div><span className="text-muted-foreground">Entry:</span> <span className="font-bold">₹15Cr</span></div>
              <div><span className="text-muted-foreground">Valuation:</span> <span className="font-bold text-success">₹18Cr</span></div>
              <div><span className="text-muted-foreground">Share Value:</span> <span className="font-bold text-[hsl(var(--pastel-blue))]-dark font-sans text-base">₹54L</span></div>
              <div><span className="text-muted-foreground">Unrealized Gain:</span> <span className="font-bold text-success">₹4L (8% return)</span></div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                <Link to="/portfolio/2">View Full Details</Link>
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                Message Founder
              </Button>
              <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-foreground">
                View Updates
              </Button>
            </div>
          </div>
        </Card>

        {/* INVESTMENT 3 */}
        <Card className="border-2 border-[hsl(var(--pastel-blue))] shadow-[6px_6px_0_0_hsl(var(--pastel-blue))] rounded-[24px] overflow-hidden bg-card/50 relative">
          <div className="absolute top-4 right-4 text-4xl animate-bounce"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 pr-12">
              <div>
                <h3 className="font-display font-extrabold text-xl text-foreground">FinTech Trading App</h3>
                <p className="text-xs font-bold text-muted-foreground mt-1">Founder: Vedant Kumar <span className="mx-2">|</span> Stage: Series A</p>
              </div>
              <Badge className="bg-success text-success-foreground border-2 border-success-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] px-3 py-1">
                 Status: Scaling (5x YoY)
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-semibold mb-6 pb-6 border-b border-foreground/10">
              <div><span className="text-muted-foreground">Investment:</span> <span className="font-bold">₹1Cr</span></div>
              <div><span className="text-muted-foreground">Equity:</span> <span className="font-bold">2%</span></div>
              <div><span className="text-muted-foreground">Entry:</span> <span className="font-bold">₹50Cr</span></div>
              <div><span className="text-muted-foreground">Valuation:</span> <span className="font-bold text-success">₹250Cr</span></div>
              <div><span className="text-muted-foreground">Share Value:</span> <span className="font-black text-2xl text-[hsl(var(--pastel-pink))]-dark font-sans">₹5Cr</span></div>
              <div className="bg-success/20 px-3 py-1 rounded-md border border-success/30"><span className="text-success-foreground font-extrabold">Gain: ₹4Cr (400% return!)</span></div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="border-2 border-foreground bg-foreground text-background hover:bg-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                <Link to="/portfolio/3">View Full Details</Link>
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl bg-background hover:bg-[hsl(var(--pastel-blue))]">
                Message Founder
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl bg-background">
                View Updates
              </Button>
            </div>
          </div>
        </Card>

      </div>

      <div className="mt-12 flex justify-center">
        <Button className="border-2 border-foreground bg-background hover:bg-muted text-foreground font-extrabold shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl px-8 h-12 text-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          View More Investments
        </Button>
      </div>

    </div>
  );
}
