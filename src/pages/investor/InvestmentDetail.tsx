import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft, Calendar, FileText, Download, TrendingUp, Users, ExternalLink } from "lucide-react";

export default function InvestmentDetail() {
  const { id } = useParams();

  // Mock data for investment details
  const inv = {
    id: id,
    startup_name: "EcoLogix AI",
    pitch_id: "mock-pitch-1",
    amount: "$50,000",
    date: "2024-03-15",
    status: "ACTIVE",
    stage: "Seed",
    equity: "2.5%",
    roi: "+15%",
    valuation: "$2,000,000",
    description: "AI-driven supply chain optimization for sustainable retail.",
    website: "https://ecologix-ai.example.com",
    founders: ["Alex Rivera", "Sam Chen"],
    updates: [
      { date: "2024-05-01", text: "Q1 Results: ARR grew by 150%. Secured 3 new enterprise pilots." },
      { date: "2024-04-10", text: "Product Update: Version 2.0 launched with advanced forecasting models." },
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
      <Button asChild variant="ghost" className="mb-6 hover:bg-muted text-muted-foreground font-bold pl-0">
        <Link to="/portfolio" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
        <div className="h-24 w-24 rounded-2xl bg-[hsl(var(--pastel-mint))] border-2 border-foreground flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
          <Building2 className="h-10 w-10 text-foreground" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display font-extrabold text-4xl">{inv.startup_name}</h1>
            <Badge className="bg-success text-success-foreground border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))]">
              {inv.status}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground font-medium mb-4">{inv.description}</p>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
              <ExternalLink className="mr-2 h-4 w-4" /> Website
            </Button>
            <Button asChild size="sm" variant="outline" className="border-2 border-foreground font-bold shadow-[2px_2px_0_0_hsl(var(--foreground))] rounded-xl">
              <Link to={`/pitches/${inv.pitch_id}`}>
                <FileText className="mr-2 h-4 w-4" /> Original Pitch
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl bg-[hsl(var(--pastel-blue))] transition-transform hover:-translate-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-1">My Investment</p>
          <p className="text-2xl font-display font-extrabold">{inv.amount}</p>
        </Card>
        <Card className="p-4 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl transition-transform hover:-translate-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Equity</p>
          <p className="text-2xl font-display font-extrabold">{inv.equity}</p>
        </Card>
        <Card className="p-4 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl transition-transform hover:-translate-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current ROI</p>
          <p className="text-2xl font-display font-extrabold text-success flex items-center gap-1">
            {inv.roi} <TrendingUp className="h-5 w-5" />
          </p>
        </Card>
        <Card className="p-4 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-xl transition-transform hover:-translate-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Latest Valuation</p>
          <p className="text-2xl font-display font-extrabold">{inv.valuation}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2 border-b-2 border-foreground/10 pb-2">
            Founder Updates
          </h3>
          <div className="space-y-6 border-l-2 border-foreground/20 pl-6 ml-2 relative">
            {inv.updates.map((update, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-foreground border-4 border-background" />
                <Badge variant="outline" className="mb-2 font-bold border-foreground/20 text-muted-foreground">
                  <Calendar className="mr-1.5 h-3 w-3" /> {update.date}
                </Badge>
                <Card className="p-5 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
                  <p className="font-medium leading-relaxed">{update.text}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
            <h4 className="font-display font-extrabold text-lg mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" /> Team
            </h4>
            <ul className="space-y-3">
              {inv.founders.map((founder, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted border border-foreground/20 flex items-center justify-center font-bold text-xs">
                    {founder.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-semibold">{founder}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl bg-card">
            <h4 className="font-display font-extrabold text-lg mb-4">Documents</h4>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start font-bold border-2 border-foreground rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <Download className="mr-2 h-4 w-4" /> SAFE Agreement
              </Button>
              <Button variant="outline" className="w-full justify-start font-bold border-2 border-foreground rounded-xl shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                <Download className="mr-2 h-4 w-4" /> Q1 Financials
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
