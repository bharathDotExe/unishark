import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Bookmark, MessageSquare, Star, Eye, Filter, ArrowRight, Download, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy data to match the wireframe
const mockPitches = [
  {
    id: "p1",
    title: "AI Resume Builder",
    sector: "EdTech",
    founder: "John Doe",
    location: "Delhi",
    stage: "MVP",
    fundingAsk: "₹1Cr",
    teamSize: 3,
    traction: "500 users",
    matchScore: 94,
    rating: 4.8,
  },
  {
    id: "p2",
    title: "Student Learning Platform",
    sector: "EdTech",
    founder: "Priya Sharma",
    location: "Bangalore",
    stage: "MVP",
    fundingAsk: "₹80L",
    teamSize: 4,
    traction: "1000+ users",
    matchScore: 87,
    rating: 4.9,
  },
  {
    id: "p3",
    title: "FinTech Trading App",
    sector: "FinTech",
    founder: "Vedant Kumar",
    location: "Mumbai",
    stage: "Revenue",
    fundingAsk: "₹2Cr",
    teamSize: 5,
    traction: "$10k MRR",
    matchScore: 85,
    rating: 4.7,
  },
  {
    id: "p4",
    title: "Health Monitor API",
    sector: "HealthTech",
    founder: "Dr. Sarah Lee",
    location: "Pune",
    stage: "Growth",
    fundingAsk: "₹5Cr",
    teamSize: 12,
    traction: "20+ hospitals",
    matchScore: 78,
    rating: 4.5,
  },
  {
    id: "p5",
    title: "Sustainable Agri-SaaS",
    sector: "AgriTech",
    founder: "Rahul Singh",
    location: "Delhi",
    stage: "Idea",
    fundingAsk: "₹25L",
    teamSize: 2,
    traction: "Beta testing",
    matchScore: 72,
    rating: 4.2,
  }
];

export default function BrowsePitches() {
  const [fundingRange, setFundingRange] = useState([50, 200]); // 50L to 200L (2Cr)

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1600px] pb-24">
      
      <div className="mb-8">
        <h1 className="text-4xl font-display font-extrabold text-foreground tracking-tight">Browse Pitches</h1>
        <p className="text-muted-foreground font-semibold text-lg mt-1">Find investment opportunities</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ==========================================
            LEFT COLUMN: FILTERS (approx 25-30%)
            ========================================== */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
          <Card className="p-6 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-foreground/10">
              <h3 className="font-display font-extrabold text-xl flex items-center gap-2">
                <Filter className="h-5 w-5" /> Filters
              </h3>
              <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-foreground">
                Reset All
              </Button>
            </div>

            <div className="space-y-8">
              {/* STAGE */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  📌 Stage
                </h4>
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox defaultChecked className="border-2 border-foreground data-[state=checked]:bg-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold group-hover:text-primary transition-colors">All Stages <span className="text-muted-foreground font-normal">(234)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox className="border-2 border-foreground data-[state=checked]:bg-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold group-hover:text-primary transition-colors">Idea <span className="text-muted-foreground font-normal">(45)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox defaultChecked className="border-2 border-foreground data-[state=checked]:bg-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold group-hover:text-primary transition-colors">MVP <span className="text-muted-foreground font-normal">(89)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox className="border-2 border-foreground data-[state=checked]:bg-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold group-hover:text-primary transition-colors">Revenue <span className="text-muted-foreground font-normal">(67)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox className="border-2 border-foreground data-[state=checked]:bg-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold group-hover:text-primary transition-colors">Growth <span className="text-muted-foreground font-normal">(33)</span></span>
                  </Label>
                </div>
              </div>

              {/* FUNDING ASK */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  💰 Funding Ask
                </h4>
                <Slider
                  defaultValue={[50, 200]}
                  max={1000}
                  step={10}
                  className="mb-4"
                  onValueChange={setFundingRange}
                />
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span>₹10L</span>
                  <span>₹10Cr</span>
                </div>
                <div className="bg-muted p-3 rounded-xl border-2 border-foreground/10">
                  <p className="text-sm font-bold">Your range: ₹{fundingRange[0]}L to ₹{fundingRange[1] >= 100 ? `${(fundingRange[1]/100).toFixed(1)}Cr` : `${fundingRange[1]}L`}</p>
                  <p className="text-xs text-muted-foreground font-semibold mt-1">(Showing: 156 pitches in your range)</p>
                </div>
              </div>

              {/* SECTOR */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  🏢 Sector
                </h4>
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked className="border-2 border-foreground data-[state=checked]:bg-[hsl(var(--pastel-blue))] data-[state=checked]:text-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">EdTech <span className="text-muted-foreground font-normal">(45)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked className="border-2 border-foreground data-[state=checked]:bg-[hsl(var(--pastel-blue))] data-[state=checked]:text-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">SaaS <span className="text-muted-foreground font-normal">(52)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground data-[state=checked]:bg-[hsl(var(--pastel-blue))] data-[state=checked]:text-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">FinTech <span className="text-muted-foreground font-normal">(38)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground data-[state=checked]:bg-[hsl(var(--pastel-blue))] data-[state=checked]:text-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">HealthTech <span className="text-muted-foreground font-normal">(28)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground data-[state=checked]:bg-[hsl(var(--pastel-blue))] data-[state=checked]:text-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">E-commerce <span className="text-muted-foreground font-normal">(22)</span></span>
                  </Label>
                </div>
                <Button variant="link" className="px-0 mt-2 font-bold text-foreground hover:underline">
                  + Show More
                </Button>
              </div>

              {/* TRACTION */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  📊 Traction
                </h4>
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">With revenue <span className="text-muted-foreground font-normal">(67)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">With users (100+) <span className="text-muted-foreground font-normal">(89)</span></span>
                  </Label>
                </div>
              </div>

              {/* LOCATION */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  📍 Location
                </h4>
                <div className="space-y-3">
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox defaultChecked className="border-2 border-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">All Locations</span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">Delhi <span className="text-muted-foreground font-normal">(34)</span></span>
                  </Label>
                  <Label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox className="border-2 border-foreground shadow-[1px_1px_0_0_hsl(var(--foreground))]" />
                    <span className="font-semibold">Bangalore <span className="text-muted-foreground font-normal">(56)</span></span>
                  </Label>
                </div>
                <Button variant="link" className="px-0 mt-2 font-bold text-foreground hover:underline">
                  + Show More
                </Button>
              </div>

              <Button className="w-full h-12 text-lg border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] bg-[hsl(var(--pastel-yellow))] text-foreground hover:bg-[hsl(var(--pastel-yellow))/80] font-extrabold rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                Apply Filters
              </Button>
            </div>
          </Card>
        </aside>

        {/* ==========================================
            MIDDLE COLUMN: PITCH GRID (approx 50%)
            ========================================== */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-card p-4 rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]">
            <div>
              <p className="font-display font-extrabold text-lg">Results: 156 Pitches</p>
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mt-1 flex-wrap">
                <span>Showing:</span>
                <button className="text-foreground border-b-2 border-foreground">All</button>
                <span>|</span>
                <button className="hover:text-foreground transition-colors">New</button>
                <span>|</span>
                <button className="hover:text-foreground transition-colors">Top Rated</button>
                <span>|</span>
                <button className="hover:text-foreground transition-colors">Most Bookmarked</button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-muted-foreground">Sort by:</span>
              <Select defaultValue="match">
                <SelectTrigger className="w-[160px] border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] font-bold rounded-xl">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match" className="font-bold">Match Score</SelectItem>
                  <SelectItem value="newest" className="font-bold">Newest First</SelectItem>
                  <SelectItem value="funding" className="font-bold">Funding Ask</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPitches.map((pitch) => (
              <Card key={pitch.id} className="flex flex-col p-0 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                
                {/* Card Header */}
                <div className="p-5 border-b-2 border-foreground/10 bg-muted/20 relative">
                  {pitch.matchScore > 80 && (
                    <div className="absolute top-0 right-0 bg-success text-success-foreground font-bold text-xs px-3 py-1 border-b-2 border-l-2 border-foreground rounded-bl-xl shadow-[-2px_2px_0_0_hsl(var(--foreground))]">
                      Match: {pitch.matchScore}% ✅
                    </div>
                  )}
                  <Badge variant="outline" className="mb-3 bg-background border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                    {pitch.sector}
                  </Badge>
                  <h3 className="font-display font-extrabold text-xl leading-tight mb-1 pr-20">{pitch.title}</h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <span className="text-foreground">{pitch.founder}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {pitch.location}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 bg-card">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-semibold mb-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Stage</p>
                      <p>{pitch.stage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Funding Ask</p>
                      <p className="text-[hsl(var(--pastel-blue))] font-extrabold">{pitch.fundingAsk}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Team</p>
                      <p>{pitch.teamSize} members</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Traction</p>
                      <p>{pitch.traction}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-4 w-4", i < Math.floor(pitch.rating) ? "fill-[hsl(var(--pastel-yellow))] text-[hsl(var(--pastel-yellow))]" : "fill-muted text-muted")} />
                    ))}
                    <span className="ml-2 text-sm font-bold text-muted-foreground">({pitch.rating})</span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 border-t-2 border-foreground/10 bg-muted/10 flex gap-2">
                  <Button asChild size="sm" className="flex-1 border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
                    <Link to={`/pitches/${pitch.id}`}>View</Link>
                  </Button>
                  <Button size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--pastel-pink))] hover:text-foreground transition-all">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl hover:bg-[hsl(var(--pastel-mint))] hover:text-foreground transition-all">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">1</Button>
              <Button variant="ghost" size="icon" className="font-bold">2</Button>
              <Button variant="ghost" size="icon" className="font-bold">3</Button>
              <span className="font-bold text-muted-foreground px-2">...</span>
              <Button variant="ghost" size="icon" className="font-bold">8</Button>
            </div>
            <Button className="border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] font-bold rounded-xl bg-card text-foreground hover:bg-muted">
              Load More
            </Button>
          </div>
        </main>

        {/* ==========================================
            RIGHT COLUMN: MAP VIEW (approx 20%)
            ========================================== */}
        <aside className="w-full lg:w-[280px] shrink-0 xl:block hidden">
          <div className="sticky top-24 space-y-6">
            <Card className="p-5 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl overflow-hidden">
              <h3 className="font-display font-extrabold text-lg flex items-center gap-2 mb-4">
                🗺️ Location Heat Map
              </h3>
              
              <div className="aspect-square bg-muted border-2 border-foreground/10 rounded-xl mb-6 relative flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">[Interactive India Map]</p>
                
                {/* Mock Map Pins overlay */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-destructive rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-destructive rounded-full animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[hsl(var(--pastel-yellow))] rounded-full shadow-[0_0_10px_hsl(var(--pastel-yellow))]" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /> Delhi</span>
                  <span>34 pitches</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-destructive" /> Bangalore</span>
                  <span>56 pitches</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--pastel-yellow))]" /> Mumbai</span>
                  <span>28 pitches</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--pastel-yellow))]" /> Pune</span>
                  <span>22 pitches</span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--pastel-mint))]" /> Others</span>
                  <span>16 pitches</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                  <EyeOff className="h-4 w-4 mr-2" /> Hide Map
                </Button>
                <Button variant="outline" className="w-full border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
                  <Download className="h-4 w-4 mr-2" /> Download CSV
                </Button>
              </div>
            </Card>
          </div>
        </aside>

      </div>
    </div>
  );
}