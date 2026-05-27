import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bookmark, MessageSquare, Share2, FileText, Download, 
  X, CheckCircle, ExternalLink, Linkedin, Info, Star,
  TrendingUp, Users, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Assume we pass in `pitch`, `authorProfile`, `deckSignedUrl` as props
export default function InvestorPitchView({ pitch, authorProfile, deckSignedUrl }: any) {
  
  // MOCK DATA TO MATCH WIREFRAME
  const matchScore = 94;
  const rating = 4.8;
  const reviewCount = 45;
  const sector = "EdTech";
  const formattedAsk = "₹1 Crore";
  const views = 23;
  const bookmarks = 8;
  const messagesReceived = 5;
  const targetMarket = "Engineering students, first-time job seekers (100M TAM)";
  const oneLiner = pitch?.one_liner || "AI-powered resume builder for students and job seekers";
  
  const competitors = [
    { name: "LinkedIn", desc: "(Expensive, not AI) → We're 10x faster" },
    { name: "Indeed", desc: "(Job board, not tools) → We focus on resumes" },
    { name: "Canva", desc: "(Basic, no AI) → 90% accuracy in matching" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-24">
      {/* HEADER */}
      <Card className="p-6 mb-8 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-success text-success-foreground px-4 py-2 font-bold text-sm border-b-2 border-l-2 border-foreground rounded-bl-xl shadow-[-2px_2px_0_0_hsl(var(--foreground))]">
          Match Score: {matchScore}% 
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-extrabold text-foreground">{pitch?.title || "AI Resume Builder"}</h1>
              <Badge className="bg-success text-success-foreground border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] text-xs">
                Status:  APPROVED
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <span className="text-foreground">{sector}</span>
              <span>|</span>
              <span className="text-foreground">{pitch?.stage || "MVP"}</span>
              <span>|</span>
              <span className="text-[hsl(var(--pastel-blue))]">Funding Ask: {formattedAsk}</span>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", i < Math.floor(rating) ? "fill-[hsl(var(--pastel-yellow))] text-[hsl(var(--pastel-yellow))]" : "fill-muted text-muted")} />
              ))}
              <span className="ml-2 text-sm font-bold text-foreground">({rating} stars, {reviewCount} investor ratings)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--pastel-yellow))] hover:text-foreground">
              <Bookmark className="h-4 w-4 mr-2" /> Bookmark
            </Button>
            <Button className="border-2 border-foreground bg-[hsl(var(--pastel-mint))] text-foreground hover:bg-[hsl(var(--pastel-mint))/80] font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
              <MessageSquare className="h-4 w-4 mr-2" /> Message Founder
            </Button>
            <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--pastel-blue))] hover:text-foreground">
              <TrendingUp className="h-4 w-4 mr-2" /> View Analytics
            </Button>
            <Button size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-muted">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-destructive hover:text-destructive-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* 2-COLUMN LAYOUT (70/30) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        
        {/* LEFT COLUMN (70%) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. FOUNDER PROFILE */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Founder Profile</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-foreground bg-[hsl(var(--pastel-blue))] flex items-center justify-center shadow-[2px_2px_0_0_hsl(var(--foreground))] shrink-0">
                  <span className="font-display font-black text-2xl text-foreground">JD</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-lg">{authorProfile?.full_name || "John Doe"}</h4>
                  <p className="text-sm font-bold text-muted-foreground mb-2">Founder & CEO | IIT Delhi '21</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-[hsl(var(--pastel-blue))]"><Linkedin className="h-3 w-3" /> linkedin.com/in/johndoe</span>
                    <span>Email: john@example.com</span>
                    <span>Phone: +91 98765 43210</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Bio:</span>
                  <p className="text-sm font-semibold italic bg-muted/20 p-3 rounded-lg border-l-4 border-[hsl(var(--pastel-pink))] mt-1">
                    "Building AI tools to help students get better jobs. Previously at Google working on ML."
                  </p>
                </div>
                
                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Experience:</span>
                  <ul className="text-sm font-semibold mt-1 space-y-1 ml-2 border-l-2 border-foreground/10 pl-4 py-1">
                    <li className="relative before:absolute before:-left-[21px] before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-foreground">Software Engineer @ Google (2022-2024)</li>
                    <li className="relative before:absolute before:-left-[21px] before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-muted-foreground">Intern @ Microsoft (2021)</li>
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Co-Founders:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="p-3 border-2 border-foreground bg-muted/10 rounded-xl">
                      <p className="font-extrabold text-sm">1. Priya Sharma (CTO)</p>
                      <p className="text-xs font-semibold text-muted-foreground">Full Stack Dev @ Flipkart</p>
                    </div>
                    <div className="p-3 border-2 border-foreground bg-muted/10 rounded-xl">
                      <p className="font-extrabold text-sm">2. Vedant Kumar (COO)</p>
                      <p className="text-xs font-semibold text-muted-foreground">PM @ Amazon</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8">View Full Profile</Button>
                <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8 text-[hsl(var(--pastel-blue))]"><Linkedin className="h-3 w-3 mr-1" /> Connect on LinkedIn</Button>
              </div>
            </div>
          </Card>

          {/* 2. PITCH OVERVIEW */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Pitch Overview</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <span className="text-xs font-extrabold text-muted-foreground uppercase">One-Liner:</span>
                <p className="text-lg font-bold text-foreground mt-1">"{oneLiner}"</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Problem:</span>
                  <p className="text-sm font-semibold mt-1 p-3 bg-destructive/5 rounded-lg border-l-4 border-destructive">
                    "{pitch?.problem || "Students struggle to build resumes that impress recruiters. Current tools are outdated and time-consuming."}"
                  </p>
                </div>
                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Solution:</span>
                  <p className="text-sm font-semibold mt-1 p-3 bg-success/5 rounded-lg border-l-4 border-success">
                    "{pitch?.solution || "AI analyzes job descriptions and tailors resumes in seconds. ML-powered suggestions ensure ATS optimization."}"
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-extrabold text-muted-foreground uppercase">Target Market:</span>
                <p className="text-sm font-semibold mt-1">"{targetMarket}"</p>
              </div>

              <div>
                <span className="text-xs font-extrabold text-muted-foreground uppercase">Competitors & Advantage:</span>
                <div className="mt-2 space-y-2">
                  {competitors.map((comp, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm font-semibold">
                      <span className="text-destructive font-bold">• {comp.name}</span>
                      <span className="text-muted-foreground">{comp.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 3. TRACTION & METRICS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Traction & Metrics</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                
                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Users:</span>
                  <ul className="text-sm font-semibold mt-1 space-y-1">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> 500 active users (20% weekly growth)</li>
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Revenue:</span>
                  <ul className="text-sm font-semibold mt-1 space-y-1">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> $5k MRR (monthly recurring revenue)</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Estimated $60k ARR</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Growth: 35% month-over-month</li>
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">User Retention:</span>
                  <ul className="text-sm font-semibold mt-1 space-y-1">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> 60% month-over-month retention</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> NPS (Net Promoter Score): 62 (Excellent)</li>
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Media Coverage:</span>
                  <ul className="text-sm font-semibold mt-1 space-y-1">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Featured in TechCrunch, ProductHunt</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> 2 awards for Best EdTech Startup</li>
                  </ul>
                </div>

              </div>

              <div className="border-t-2 border-foreground/10 pt-6">
                <span className="text-xs font-extrabold text-muted-foreground uppercase mb-2 block">Chart: Revenue Growth</span>
                <div className="h-32 bg-muted/20 border-2 border-foreground/10 rounded-xl flex items-center justify-center p-4 relative overflow-hidden">
                  {/* Mock Line Chart */}
                  <div className="absolute inset-x-0 bottom-0 h-[80%] border-b-2 border-l-2 border-foreground/20 ml-8 mb-4">
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      <polyline points="0,40 25,35 50,25 75,10 100,5" fill="none" stroke="hsl(var(--pastel-blue))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="0" cy="40" r="2" fill="hsl(var(--pastel-blue))" />
                      <circle cx="25" cy="35" r="2" fill="hsl(var(--pastel-blue))" />
                      <circle cx="50" cy="25" r="2" fill="hsl(var(--pastel-blue))" />
                      <circle cx="75" cy="10" r="2" fill="hsl(var(--pastel-blue))" />
                      <circle cx="100" cy="5" r="2" fill="hsl(var(--pastel-blue))" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground relative z-10">[Line chart showing: Jan: $1k → May: $5k]</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. FUNDRAISING DETAILS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Fundraising Details</h3>
            </div>
            <div className="p-6">
              
              <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b-2 border-foreground/10">
                <div className="flex-1">
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Funding Ask:</span>
                  <p className="text-xl font-black text-[hsl(var(--pastel-blue))]">{formattedAsk} <span className="text-sm font-bold text-muted-foreground">(10 Million INR)</span></p>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-extrabold text-muted-foreground uppercase">Equity Offered:</span>
                  <p className="text-xl font-black text-foreground">10% <span className="text-sm font-bold text-muted-foreground">for first lead investor</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-extrabold text-muted-foreground uppercase mb-2 block">Use of Funds:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-foreground" /> 40% (₹40L)</span>
                      <span className="text-muted-foreground">Product & Tech</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-blue))]" /> 35% (₹35L)</span>
                      <span className="text-muted-foreground">Marketing</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-yellow))]" /> 20% (₹20L)</span>
                      <span className="text-muted-foreground">Operations</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[hsl(var(--pastel-pink))]" /> 5% (₹5L)</span>
                      <span className="text-muted-foreground">Legal</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="h-2 w-full flex rounded-full overflow-hidden mt-3 border border-foreground/10">
                      <div className="h-full bg-foreground" style={{ width: "40%" }} />
                      <div className="h-full bg-[hsl(var(--pastel-blue))]" style={{ width: "35%" }} />
                      <div className="h-full bg-[hsl(var(--pastel-yellow))]" style={{ width: "20%" }} />
                      <div className="h-full bg-[hsl(var(--pastel-pink))]" style={{ width: "5%" }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-extrabold text-muted-foreground uppercase mb-1 block">Current Funding:</span>
                    <ul className="text-sm font-semibold space-y-1">
                      <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Bootstrapped until now</li>
                      <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Angel investment (friends)</li>
                      <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Total raised so far: ₹20L</li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-muted-foreground uppercase mb-1 block">Valuation & Terms:</span>
                    <ul className="text-sm font-semibold space-y-1">
                      <li className="flex items-start gap-2"><span className="text-foreground/30">├─</span> <div>Valuation: ₹10 Crore <span className="block text-xs text-muted-foreground">(Based on 500 users, $60k ARR)</span></div></li>
                      <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> SAFE agreement</li>
                      <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Next round: Series A (6-12 mos)</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </Card>

          {/* 5. FINANCIAL PROJECTIONS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Financial Projections (Next 3 Years)</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                
                <div className="p-4 border-2 border-foreground bg-muted/10 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-foreground text-background font-black flex items-center justify-center rounded-bl-xl">Y1</div>
                  <h4 className="font-bold text-sm mb-3 mt-1">Next 12 months</h4>
                  <ul className="text-xs font-semibold space-y-2">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Users: 5,000 (10x)</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Revenue: ₹50L ARR</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Runway: 18 months</li>
                  </ul>
                </div>

                <div className="p-4 border-2 border-foreground bg-muted/10 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-foreground text-background font-black flex items-center justify-center rounded-bl-xl">Y2</div>
                  <h4 className="font-bold text-sm mb-3 mt-1">Scaling Phase</h4>
                  <ul className="text-xs font-semibold space-y-2">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Users: 50,000</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Revenue: ₹5Cr ARR</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Raise: Series A</li>
                  </ul>
                </div>

                <div className="p-4 border-2 border-foreground bg-[hsl(var(--pastel-blue))] rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-foreground text-background font-black flex items-center justify-center rounded-bl-xl">Y3</div>
                  <h4 className="font-bold text-sm mb-3 mt-1 text-foreground">Market Leadership</h4>
                  <ul className="text-xs font-semibold space-y-2 text-foreground/90">
                    <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Users: 500,000</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">├─</span> Revenue: ₹30Cr ARR</li>
                    <li className="flex items-center gap-2"><span className="text-foreground/30">└─</span> Raise: Series B</li>
                  </ul>
                </div>

              </div>

              <Button variant="outline" className="w-full border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-sm">
                <Download className="h-4 w-4 mr-2" /> Download Financial Model
              </Button>
            </div>
          </Card>

          {/* 6. PITCH DECK */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Pitch Deck</h3>
            </div>
            <div className="p-6">
              <div className="aspect-[16/9] w-full flex flex-col items-center justify-center border-2 border-dashed border-foreground/30 bg-muted/5 rounded-xl mb-4 p-8 text-center cursor-pointer hover:bg-muted/10 transition-colors">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <Button className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl mb-2">View Full Pitch Deck (PDF)</Button>
                <p className="text-xs font-semibold text-muted-foreground">└─ 15 slides: Problem, Solution, Market, Team, Tech, Traction, Financials, Ask, Roadmap</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8">
                  <Download className="h-3 w-3 mr-1" /> Download PDF
                </Button>
                <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8">
                  <Share2 className="h-3 w-3 mr-1" /> Share Link
                </Button>
                <Button variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8">
                  <Info className="h-3 w-3 mr-1" /> Request Info
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN (30%) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* PITCH STATISTICS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Pitch Statistics</h3>
            </div>
            <div className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-foreground/10">
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-muted-foreground">Views</p>
                  <p className="font-black text-lg">{views}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-muted-foreground">Bookmarks</p>
                  <p className="font-black text-lg">{bookmarks}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase font-extrabold text-muted-foreground">Messages Received</p>
                  <p className="font-black text-lg">{messagesReceived}</p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase font-extrabold text-muted-foreground mb-1">Interest Level:</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-4 h-4 rounded-full bg-success flex items-center justify-center border border-foreground/10">
                        <span className="text-[8px] text-success-foreground font-black"></span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-success">(Very High)</span>
                </div>
              </div>

              <div className="bg-muted/20 p-3 rounded-xl border border-foreground/10">
                <p className="text-xs uppercase font-extrabold text-foreground mb-2 flex justify-between">
                  <span>Match Score:</span>
                  <span className="text-success">{matchScore}%</span>
                </p>
                <ul className="text-[10px] font-bold text-muted-foreground space-y-1">
                  <li className="flex justify-between"><span>└─ EdTech preference</span> <span className="text-success"></span></li>
                  <li className="flex justify-between"><span>└─ MVP stage</span> <span className="text-success"></span></li>
                  <li className="flex justify-between"><span>└─ Funding range</span> <span className="text-success"></span></li>
                  <li className="flex justify-between"><span>└─ Strong team</span> <span className="text-success"></span></li>
                  <li className="flex justify-between"><span>└─ Good traction</span> <span className="text-success"></span></li>
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase font-extrabold text-muted-foreground mb-1">Rating:</p>
                <p className="font-bold text-sm flex items-center gap-1">
                   {rating}/5
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold">(Based on {reviewCount} investor reviews)</p>
              </div>

              <div className="pt-3 border-t-2 border-foreground/10 text-[10px] font-bold text-muted-foreground">
                <p>Created: May 14, 2024</p>
                <p>Last Updated: May 15, 2024</p>
              </div>

            </div>
          </Card>

          {/* INVESTOR INTEREST */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Investor Interest</h3>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-muted-foreground mb-3">Other interested investors:</p>
              <ul className="text-sm font-semibold space-y-2 mb-4">
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[hsl(var(--pastel-blue))]" /> Raj Patel <span className="text-xs text-muted-foreground">(TechVentures)</span></li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[hsl(var(--pastel-blue))]" /> Priya Sharma <span className="text-xs text-muted-foreground">(EdFunds)</span></li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[hsl(var(--pastel-blue))]" /> Vedant Kumar <span className="text-xs text-muted-foreground">(AngelNetwork)</span></li>
                <li className="text-xs font-bold text-muted-foreground italic pl-4">+ 5 more investors</li>
              </ul>
              <Button variant="outline" className="w-full border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-xs h-8">
                View All Interested Investors
              </Button>
            </div>
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Quick Actions</h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <Button className="justify-start border-2 border-foreground bg-[hsl(var(--pastel-mint))] text-foreground hover:bg-[hsl(var(--pastel-mint))/80] font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                <MessageSquare className="h-4 w-4 mr-2" /> Message Founder
              </Button>
              <Button variant="outline" className="justify-start border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--pastel-yellow))] hover:text-foreground">
                <Bookmark className="h-4 w-4 mr-2" /> Bookmark This Pitch
              </Button>
              <Button variant="outline" className="justify-start border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                <Info className="h-4 w-4 mr-2" /> Request More Info
              </Button>
              <Button variant="outline" className="justify-start border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--pastel-pink))] hover:text-foreground">
                <Heart className="h-4 w-4 mr-2" /> Interested (Commit)
              </Button>
              <Button variant="outline" className="justify-start border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <X className="h-4 w-4 mr-2" /> Not Interested
              </Button>
              <Button variant="outline" className="justify-start border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                <Share2 className="h-4 w-4 mr-2" /> Share with Partners
              </Button>
            </div>
          </Card>

          {/* FOUNDER'S OTHER PITCHES */}
          <Card className="border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
            <div className="bg-muted/30 border-b-2 border-foreground p-4">
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">Founder's Other Pitches</h3>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-muted-foreground mb-3">This founder has 1 other pitch:</p>
              <div className="flex items-start gap-2">
                <div className="mt-1"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                <div>
                  <p className="font-bold text-sm hover:underline cursor-pointer">"Resume AI - Enterprise Version"</p>
                  <p className="text-[10px] font-bold text-muted-foreground">(Not published)</p>
                </div>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
}
