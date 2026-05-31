import { useState } from "react";
import { PageShell, PageHeader, SectionCard, StatCard, StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Scale, CheckCircle2, Clock, AlertTriangle, FileText, Download } from "lucide-react";

type Item = { id: string; title: string; category: string; status: "COMPLIANT"|"REVIEW_NEEDED"|"NON_COMPLIANT"|"PENDING"; description: string; lastReviewed: string; nextReview: string; owner: string; documents?: string[] };

const ITEMS: Item[] = [
  { id: "C001", title: "SEBI AIF registration", category: "SEBI", status: "COMPLIANT", description: "Alternative Investment Fund registration under SEBI AIF regulations.", lastReviewed: "2024-01-01", nextReview: "2025-01-01", owner: "Legal", documents: ["SEBI_AIF.pdf"] },
  { id: "C002", title: "Investor KYC verification", category: "KYC", status: "REVIEW_NEEDED", description: "Investors must complete KYC via PAN + Aadhaar before investing.", lastReviewed: "2024-01-10", nextReview: "2024-04-10", owner: "Compliance" },
  { id: "C003", title: "IT Act data privacy", category: "PRIVACY", status: "COMPLIANT", description: "Privacy policy compliant with IT Act 2000 and SPDI Rules.", lastReviewed: "2023-12-15", nextReview: "2024-06-15", owner: "Legal" },
  { id: "C004", title: "GST registration & filing", category: "TAX", status: "COMPLIANT", description: "Quarterly filings up to date.", lastReviewed: "2024-01-15", nextReview: "2024-04-15", owner: "Finance" },
  { id: "C005", title: "Anti-Money Laundering", category: "AML", status: "NON_COMPLIANT", description: "AML policy pending board approval.", lastReviewed: "2023-11-01", nextReview: "2024-02-01", owner: "Compliance" },
  { id: "C006", title: "DPDP Act compliance", category: "GDPR", status: "PENDING", description: "DPDP Act 2023 audit in progress.", lastReviewed: "2023-10-01", nextReview: "2024-03-31", owner: "Legal" },
];

const tone = (s: Item["status"]): any => s === "COMPLIANT" ? "positive" : s === "REVIEW_NEEDED" ? "warning" : s === "NON_COMPLIANT" ? "danger" : "info";
const icon = (s: Item["status"]) => s === "COMPLIANT" ? CheckCircle2 : s === "NON_COMPLIANT" ? AlertTriangle : Clock;

export default function SuperAdminCompliance() {
  const [cat, setCat] = useState("ALL");
  const filtered = cat === "ALL" ? ITEMS : ITEMS.filter((i) => i.category === cat);
  const compliant = ITEMS.filter((i) => i.status === "COMPLIANT").length;
  const score = Math.round((compliant / ITEMS.length) * 100);

  return (
    <PageShell>
      <PageHeader eyebrow="Super admin" title="Legal & compliance" subtitle="Regulatory tracking across SEBI, KYC, AML, tax, and data privacy."
        actions={<Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none"><Download className="h-3.5 w-3.5" />Report</Button>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Compliance score" value={`${score}%`} icon={Scale} tone={score >= 75 ? "positive" : "warning"} />
        <StatCard label="Compliant" value={compliant} tone="positive" />
        <StatCard label="Review needed" value={ITEMS.filter((i) => i.status === "REVIEW_NEEDED").length} tone="warning" />
        <StatCard label="Non-compliant" value={ITEMS.filter((i) => i.status === "NON_COMPLIANT").length} tone="danger" />
      </div>

      <SectionCard title="Controls" actions={
        <div className="flex p-1 rounded-lg bg-muted">
          {["ALL","KYC","SEBI","PRIVACY","TAX","AML","GDPR"].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${cat === c ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
      }>
        <div className="divide-y divide-border">
          {filtered.map((item) => {
            const Icon = icon(item.status);
            return (
              <div key={item.id} className="px-5 py-4 flex items-start gap-4">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${item.status === "COMPLIANT" ? "bg-emerald-50 text-emerald-600" : item.status === "NON_COMPLIANT" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{item.category}</span>
                    <StatusPill label={item.status.replace("_", " ").toLowerCase()} tone={tone(item.status)} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">{item.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                    <span>Owner: <span className="text-foreground">{item.owner}</span></span>
                    <span>Last review: {item.lastReviewed}</span>
                    <span>Next: <span className={new Date(item.nextReview) < new Date() ? "text-red-600 font-medium" : ""}>{item.nextReview}</span></span>
                  </div>
                  {item.documents && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {item.documents.map((d) => (
                        <Button key={d} size="sm" variant="outline" className="h-7 text-xs rounded-md gap-1.5"><FileText className="h-3 w-3" />{d}</Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </PageShell>
  );
}
