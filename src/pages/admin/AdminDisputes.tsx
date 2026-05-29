import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Scale, CheckCircle2, Clock, AlertCircle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

type Dispute = {
  id: string;
  title: string;
  claimant: string;
  respondent: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  created_at: string;
  resolution?: string;
};

const MOCK_DISPUTES: Dispute[] = [
  { id: "1", title: "Investment Terms Dispute", claimant: "student-abc", respondent: "investor-xyz", description: "Investor is claiming different equity terms than what was verbally agreed upon during the pitch meeting.", status: "OPEN", priority: "HIGH", created_at: "2024-01-15T10:30:00Z" },
  { id: "2", title: "Pitch Plagiarism Claim", claimant: "student-def", respondent: "student-ghi", description: "Claimant alleges that respondent has copied significant portions of their pitch deck.", status: "IN_REVIEW", priority: "MEDIUM", created_at: "2024-01-14T09:00:00Z" },
  { id: "3", title: "Fake Investor Identity", claimant: "student-jkl", respondent: "investor-mno", description: "Claims the investor profile is fraudulent and does not represent a real entity.", status: "OPEN", priority: "HIGH", created_at: "2024-01-13T14:00:00Z" },
  { id: "4", title: "Data Misuse Complaint", claimant: "student-pqr", respondent: "investor-stu", description: "Student claims investor shared their pitch information with third parties without consent.", status: "RESOLVED", priority: "MEDIUM", created_at: "2024-01-10T11:00:00Z", resolution: "Investor account suspended for 30 days; warning issued." },
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-500/10 text-red-600 border-red-500/30",
  IN_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  RESOLVED: "bg-green-500/10 text-green-600 border-green-500/30",
  CLOSED: "bg-foreground/10 text-muted-foreground border-foreground/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-600 border-red-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  LOW: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<Record<string, string>>({});

  const startReview = (id: string) => {
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "IN_REVIEW" as const } : d));
    toast.success("Dispute moved to In Review");
  };

  const resolve = (id: string) => {
    const res = resolutionText[id];
    if (!res?.trim()) { toast.error("Please write a resolution note"); return; }
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "RESOLVED" as const, resolution: res } : d));
    setExpanded(null);
    toast.success("Dispute resolved ✓");
  };

  const filtered = disputes.filter((d) => statusFilter === "ALL" || d.status === statusFilter);
  const counts = {
    ALL: disputes.length,
    OPEN: disputes.filter((d) => d.status === "OPEN").length,
    IN_REVIEW: disputes.filter((d) => d.status === "IN_REVIEW").length,
    RESOLVED: disputes.filter((d) => d.status === "RESOLVED").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Handle Disputes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Mediate and resolve platform disputes</p>
        </div>
        {counts.OPEN > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-red-600">{counts.OPEN} open disputes</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {[["ALL", "All"], ["OPEN", "Open"], ["IN_REVIEW", "In Review"], ["RESOLVED", "Resolved"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setStatusFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              statusFilter === val
                ? "bg-foreground text-background border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {label}
            <span className="ml-2 text-xs opacity-70">{counts[val as keyof typeof counts] ?? ""}</span>
          </button>
        ))}
      </div>

      {/* Disputes */}
      {filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <Scale className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No disputes in this category</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((dispute) => (
            <Card key={dispute.id} className={`border-2 transition-all overflow-hidden ${dispute.status === "OPEN" || dispute.status === "IN_REVIEW" ? "border-amber-500/20" : "border-foreground/10"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground">{dispute.title}</h3>
                      <Badge className={`border text-xs font-bold ${STATUS_COLORS[dispute.status]}`}>
                        {dispute.status.replace("_", " ")}
                      </Badge>
                      <Badge className={`border text-xs font-bold ${PRIORITY_COLORS[dispute.priority]}`}>
                        {dispute.priority}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Claimant: <span className="font-mono font-medium text-foreground">{dispute.claimant}</span></span>
                      <span>vs</span>
                      <span>Respondent: <span className="font-mono font-medium text-foreground">{dispute.respondent}</span></span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(dispute.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {dispute.status === "OPEN" && (
                      <Button size="sm" variant="outline" className="rounded-xl border-2 border-amber-500/30 text-amber-600 text-xs" onClick={() => startReview(dispute.id)}>
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Start Review
                      </Button>
                    )}
                    {(dispute.status === "OPEN" || dispute.status === "IN_REVIEW") && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs" onClick={() => setExpanded(expanded === dispute.id ? null : dispute.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Resolve
                        {expanded === dispute.id ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{dispute.description}</p>

                {dispute.resolution && (
                  <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                    <p className="text-xs font-bold text-green-600 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Resolution
                    </p>
                    <p className="text-sm text-foreground">{dispute.resolution}</p>
                  </div>
                )}
              </div>

              {/* Resolve Panel */}
              {expanded === dispute.id && (
                <div className="border-t border-foreground/10 p-5 bg-foreground/[0.02] space-y-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Resolution Note
                  </p>
                  <Textarea
                    placeholder="Document the resolution decision and any actions taken..."
                    value={resolutionText[dispute.id] || ""}
                    onChange={(e) => setResolutionText((prev) => ({ ...prev, [dispute.id]: e.target.value }))}
                    rows={3}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => resolve(dispute.id)}>
                      Confirm Resolution
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setExpanded(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
