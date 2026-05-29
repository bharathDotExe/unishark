import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, CheckCircle2, XCircle, Eye, AlertTriangle, MessageSquare, FileText, User } from "lucide-react";
import { toast } from "sonner";

type FlaggedItem = {
  id: string;
  type: "pitch" | "message" | "profile";
  title: string;
  reporter: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  created_at: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
};

// Mock data — replace with real Supabase queries when flagged_content table exists
const MOCK_FLAGGED: FlaggedItem[] = [
  { id: "1", type: "pitch", title: "AI-Powered Fake Revenue Claims", reporter: "user-a1b2", reason: "Misleading financial projections", status: "OPEN", created_at: "2024-01-15T10:30:00Z", severity: "HIGH" },
  { id: "2", type: "message", title: "Message from user-c3d4", reporter: "user-e5f6", reason: "Spam / unsolicited investment offers", status: "OPEN", created_at: "2024-01-14T08:00:00Z", severity: "MEDIUM" },
  { id: "3", type: "profile", title: "Investor Profile - John Fake", reporter: "user-g7h8", reason: "Fake credentials and identity", status: "OPEN", created_at: "2024-01-13T15:45:00Z", severity: "HIGH" },
  { id: "4", type: "pitch", title: "Crypto Pump Scheme", reporter: "user-i9j0", reason: "Potential scam / pyramid scheme", status: "RESOLVED", created_at: "2024-01-12T12:00:00Z", severity: "HIGH" },
  { id: "5", type: "message", title: "Bulk messages from user-k1l2", reporter: "user-m3n4", reason: "Harassment", status: "DISMISSED", created_at: "2024-01-11T09:15:00Z", severity: "LOW" },
];

const SEVERITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-600 border-red-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  LOW: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pitch: <FileText className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  profile: <User className="h-4 w-4" />,
};

export default function AdminFlagged() {
  const [items, setItems] = useState<FlaggedItem[]>(MOCK_FLAGGED);
  const [statusFilter, setStatusFilter] = useState("OPEN");

  const resolve = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: "RESOLVED" as const } : i));
    toast.success("Item marked as resolved");
  };
  const dismiss = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: "DISMISSED" as const } : i));
    toast.success("Flag dismissed");
  };

  const filtered = items.filter((i) => statusFilter === "ALL" || i.status === statusFilter);
  const counts = {
    ALL: items.length,
    OPEN: items.filter((i) => i.status === "OPEN").length,
    RESOLVED: items.filter((i) => i.status === "RESOLVED").length,
    DISMISSED: items.filter((i) => i.status === "DISMISSED").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Flagged Content</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review and moderate reported content</p>
        </div>
        {counts.OPEN > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-red-600">{counts.OPEN} open flags</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {["ALL", "OPEN", "RESOLVED", "DISMISSED"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              statusFilter === f
                ? "bg-foreground text-background border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-70">{counts[f as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <Flag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No flagged items</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} className={`p-5 border-2 transition-all ${item.status === "OPEN" ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40" : "border-foreground/10"}`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-muted-foreground">{TYPE_ICONS[item.type]}</span>
                    <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                    <Badge className={`border text-xs font-bold ${SEVERITY_COLORS[item.severity]}`}>
                      {item.severity}
                    </Badge>
                    {item.status === "OPEN" && (
                      <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 text-xs">Open</Badge>
                    )}
                    {item.status === "RESOLVED" && (
                      <Badge className="bg-green-500/10 text-green-600 border border-green-500/30 text-xs">Resolved</Badge>
                    )}
                    {item.status === "DISMISSED" && (
                      <Badge className="bg-foreground/10 text-muted-foreground border border-foreground/20 text-xs">Dismissed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    <span className="font-medium text-foreground">Reason: </span>{item.reason}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Reported by <span className="font-mono">{item.reporter}</span> ·{" "}
                    {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {item.status === "OPEN" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="rounded-xl border-2 border-foreground/15 text-xs">
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs" onClick={() => resolve(item.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Resolve
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl text-xs text-muted-foreground" onClick={() => dismiss(item.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5" /> Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
