import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, CheckCircle2, Clock, AlertTriangle, FileText, Download, ExternalLink, RefreshCw, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type ComplianceItem = {
  id: string; title: string; category: "KYC" | "SEBI" | "PRIVACY" | "TAX" | "AML" | "GDPR";
  status: "COMPLIANT" | "REVIEW_NEEDED" | "NON_COMPLIANT" | "PENDING";
  description: string; lastReviewed: string; nextReview: string; owner: string; documents?: string[];
};

const ITEMS: ComplianceItem[] = [
  { id: "C001", title: "SEBI AIF Registration", category: "SEBI", status: "COMPLIANT", description: "Alternative Investment Fund registration for facilitating investments under SEBI AIF regulations.", lastReviewed: "2024-01-01", nextReview: "2025-01-01", owner: "Legal Team", documents: ["SEBI_AIF_Certificate.pdf", "Renewal_2024.pdf"] },
  { id: "C002", title: "Investor KYC Verification", category: "KYC", status: "REVIEW_NEEDED", description: "All investors must complete KYC via PAN + Aadhaar before investing. 12 investors have incomplete KYC.", lastReviewed: "2024-01-10", nextReview: "2024-04-10", owner: "Compliance Team" },
  { id: "C003", title: "IT Act Data Privacy Policy", category: "PRIVACY", status: "COMPLIANT", description: "Platform privacy policy complies with Indian IT Act 2000 and SPDI Rules. Last audited by external counsel.", lastReviewed: "2023-12-15", nextReview: "2024-06-15", owner: "Legal Team", documents: ["Privacy_Policy_v3.pdf"] },
  { id: "C004", title: "GST Registration & Filing", category: "TAX", status: "COMPLIANT", description: "GST registration active. Quarterly filings up to date. Commission income classified as financial services.", lastReviewed: "2024-01-15", nextReview: "2024-04-15", owner: "Finance Team" },
  { id: "C005", title: "Anti-Money Laundering (AML)", category: "AML", status: "NON_COMPLIANT", description: "AML policy draft pending board approval. Risk scoring model not yet implemented for deal transactions.", lastReviewed: "2023-11-01", nextReview: "2024-02-01", owner: "Compliance Team" },
  { id: "C006", title: "GDPR / DPDP Act Compliance", category: "GDPR", status: "PENDING", description: "India's Digital Personal Data Protection Act 2023 compliance audit in progress. Expected Q2 2024.", lastReviewed: "2023-10-01", nextReview: "2024-03-31", owner: "Legal Team", documents: ["DPDP_Roadmap.pdf"] },
];

const STATUS_COLORS: any = {
  COMPLIANT:      { badge: "bg-green-500/10 text-green-400 border-green-500/30",   icon: CheckCircle2, iconColor: "text-green-400" },
  REVIEW_NEEDED:  { badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",   icon: Clock,        iconColor: "text-amber-400" },
  NON_COMPLIANT:  { badge: "bg-red-500/10 text-red-400 border-red-500/30",         icon: AlertTriangle,iconColor: "text-red-400" },
  PENDING:        { badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",      icon: Clock,        iconColor: "text-blue-400" },
};

const CAT_COLORS: any = {
  KYC:     "bg-violet-500/10 text-violet-400 border-violet-500/30",
  SEBI:    "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PRIVACY: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  TAX:     "bg-green-500/10 text-green-400 border-green-500/30",
  AML:     "bg-red-500/10 text-red-400 border-red-500/30",
  GDPR:    "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

export default function SuperAdminCompliance() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("ALL");

  const filtered = catFilter === "ALL" ? ITEMS : ITEMS.filter(i => i.category === catFilter);
  const counts = {
    COMPLIANT: ITEMS.filter(i=>i.status==="COMPLIANT").length,
    REVIEW: ITEMS.filter(i=>i.status==="REVIEW_NEEDED").length,
    NON: ITEMS.filter(i=>i.status==="NON_COMPLIANT").length,
    PENDING: ITEMS.filter(i=>i.status==="PENDING").length,
  };

  const score = Math.round((counts.COMPLIANT / ITEMS.length) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Legal & Compliance</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Regulatory compliance tracking for UniShark platform</p>
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground border border-border text-xs">
          <Download className="h-4 w-4 mr-1.5"/>Export Report
        </Button>
      </div>

      {/* Compliance Score */}
      <Card className="p-6 border border-border bg-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"/>
        <div className="relative flex items-center gap-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 100 100" className="rotate-[-90deg] w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              <circle cx="50" cy="50" r="40" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                strokeDasharray={`${score * 2.51} ${251 - score * 2.51}`} strokeLinecap="round"/>
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%">
                  <stop offset="0%" stopColor="#22c55e"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-extrabold text-foreground">{score}%</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Compliance Score</h2>
            <p className="text-muted-foreground text-sm mt-1">{counts.COMPLIANT} of {ITEMS.length} items compliant</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className="bg-green-500/10 text-green-400 border border-green-500/30 text-xs">{counts.COMPLIANT} Compliant</Badge>
              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">{counts.REVIEW} Review Needed</Badge>
              <Badge className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs">{counts.NON} Non-Compliant</Badge>
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs">{counts.PENDING} Pending</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {["ALL","KYC","SEBI","PRIVACY","TAX","AML","GDPR"].map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${catFilter===c?"bg-white text-black border-white":"border-border text-muted-foreground hover:border-white/30 hover:text-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {filtered.map(item => {
          const sc = STATUS_COLORS[item.status];
          const StatusIcon = sc.icon;
          return (
            <Card key={item.id} className={`border overflow-hidden transition-all ${item.status==="NON_COMPLIANT"?"border-red-500/30":"border-border"} bg-muted/40`}>
              <div className="p-5 cursor-pointer" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${sc.iconColor}`}/>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                        <Badge className={`border text-[10px] font-bold ${CAT_COLORS[item.category]}`}>{item.category}</Badge>
                        <Badge className={`border text-[10px] font-bold ${sc.badge}`}>{item.status.replace("_"," ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground/70">
                        <span>Owner: <span className="text-muted-foreground font-medium">{item.owner}</span></span>
                        <span>Last review: <span className="text-muted-foreground">{item.lastReviewed}</span></span>
                        <span>Next: <span className={new Date(item.nextReview) < new Date() ? "text-red-400 font-bold" : "text-muted-foreground"}>{item.nextReview}</span></span>
                      </div>
                    </div>
                  </div>
                  {expanded===item.id?<ChevronUp className="h-4 w-4 text-muted-foreground/70 shrink-0"/>:<ChevronDown className="h-4 w-4 text-muted-foreground/70 shrink-0"/>}
                </div>
              </div>
              {expanded===item.id&&(
                <div className="border-t border-border p-5 space-y-4 bg-muted/40">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  {item.documents && (
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Documents</p>
                      <div className="flex flex-wrap gap-2">
                        {item.documents.map(d=>(
                          <Button key={d} variant="ghost" size="sm" className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground border border-border hover:bg-muted">
                            <FileText className="h-3.5 w-3.5 mr-1.5"/>{d}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-muted hover:bg-muted text-foreground rounded-xl text-xs border border-border">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5"/>Mark Reviewed
                    </Button>
                    <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs">
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5"/>Full Details
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
