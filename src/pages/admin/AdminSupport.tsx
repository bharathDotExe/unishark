import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { HeadphonesIcon, Search, CheckCircle2, Clock, MessageSquare, ChevronDown, ChevronUp, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

type Ticket = {
  id: string;
  subject: string;
  user: string;
  userType: "student" | "investor";
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  message: string;
  created_at: string;
  response?: string;
};

const MOCK_TICKETS: Ticket[] = [
  { id: "T001", subject: "Can't upload pitch deck", user: "student-abc123", userType: "student", category: "Technical", status: "OPEN", priority: "HIGH", message: "I'm trying to upload my pitch PDF but I keep getting an error saying 'File too large'. The file is only 8MB. Please help!", created_at: "2024-01-15T10:30:00Z" },
  { id: "T002", subject: "Investor profile not showing as verified", user: "investor-def456", userType: "investor", category: "Account", status: "IN_PROGRESS", priority: "MEDIUM", message: "I submitted all documents 5 days ago but my profile still says unverified. I have meetings scheduled and need this resolved.", created_at: "2024-01-14T09:00:00Z" },
  { id: "T003", subject: "Urgent: Suspicious messages from investor", user: "student-ghi789", userType: "student", category: "Safety", status: "OPEN", priority: "URGENT", message: "An investor is asking me to transfer money before signing any agreement. This feels like a scam. Please investigate!", created_at: "2024-01-15T08:00:00Z" },
  { id: "T004", subject: "How to edit pitch after submission?", user: "student-jkl012", userType: "student", category: "General", status: "RESOLVED", priority: "LOW", message: "I submitted my pitch but need to update the financial projections. How can I edit it?", created_at: "2024-01-13T14:00:00Z", response: "Hi! Once a pitch is submitted for review, it's locked. However, you can withdraw it and resubmit with corrections from My Pitches page." },
  { id: "T005", subject: "Payment/fee clarification", user: "investor-mno345", userType: "investor", category: "Billing", status: "CLOSED", priority: "LOW", message: "Is there any fee for contacting founders? I'm not clear on the platform pricing.", created_at: "2024-01-12T11:00:00Z", response: "UniShark is completely free for both students and investors during our beta phase. No fees whatsoever!" },
];

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-600 text-white border-transparent",
  HIGH: "bg-red-500/10 text-red-600 border-red-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  LOW: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-500/10 text-red-600 border-red-500/30",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  RESOLVED: "bg-green-500/10 text-green-600 border-green-500/30",
  CLOSED: "bg-foreground/10 text-muted-foreground border-foreground/20",
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const filtered = tickets
    .filter((t) => statusFilter === "ALL" || t.status === statusFilter)
    .filter((t) => !search.trim() || t.subject.toLowerCase().includes(search.toLowerCase()) || t.user.includes(search));

  const counts = {
    ALL: tickets.length,
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    RESOLVED: tickets.filter((t) => t.status === "RESOLVED").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
  };

  const sendResponse = (id: string) => {
    const res = responses[id];
    if (!res?.trim()) { toast.error("Please write a response"); return; }
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "RESOLVED" as const, response: res } : t));
    setExpanded(null);
    toast.success("Response sent, ticket resolved ✓");
  };

  const assignToProgress = (id: string) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "IN_PROGRESS" as const } : t));
    toast.success("Ticket assigned to In Progress");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Handle user support requests</p>
        </div>
        <div className="flex gap-2">
          {counts.OPEN > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30">
              <Zap className="h-4 w-4 text-red-500" />
              <span className="text-sm font-bold text-red-600">{counts.OPEN} open tickets</span>
            </div>
          )}
          <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {[["ALL", "All"], ["OPEN", "Open"], ["IN_PROGRESS", "In Progress"], ["RESOLVED", "Resolved"], ["CLOSED", "Closed"]].map(([val, label]) => (
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
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Tickets */}
      {filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <HeadphonesIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No tickets found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <Card key={ticket.id} className={`border-2 transition-all overflow-hidden ${ticket.priority === "URGENT" ? "border-red-500/40" : "border-foreground/10"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                      <h3 className="font-bold text-foreground text-sm">{ticket.subject}</h3>
                      <Badge className={`border text-xs font-bold ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                      <Badge className={`border text-xs font-bold ${STATUS_COLORS[ticket.status]}`}>{ticket.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>From: <span className="font-mono text-foreground">{ticket.user}</span></span>
                      <Badge variant="outline" className="text-xs">{ticket.userType}</Badge>
                      <span className="bg-foreground/10 px-2 rounded-full">{ticket.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ticket.message}</p>

                    {ticket.response && (
                      <div className="mt-3 p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                        <p className="text-xs font-bold text-green-600 mb-1">Admin Response</p>
                        <p className="text-sm text-foreground">{ticket.response}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {ticket.status === "OPEN" && (
                      <Button size="sm" variant="outline" className="rounded-xl border-2 text-xs border-amber-500/30 text-amber-600" onClick={() => assignToProgress(ticket.id)}>
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Assign
                      </Button>
                    )}
                    {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                      <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-xl text-xs" onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Respond
                        {expanded === ticket.id ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                      </Button>
                    )}
                    {ticket.status === "RESOLVED" && (
                      <Button size="sm" variant="outline" className="rounded-xl border-2 border-foreground/10 text-xs" onClick={() => {
                        setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, status: "CLOSED" as const } : t));
                        toast.success("Ticket closed");
                      }}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Close
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {expanded === ticket.id && (
                <div className="border-t border-foreground/10 p-5 bg-foreground/[0.02] space-y-3">
                  <p className="text-sm font-bold text-foreground">Write Response</p>
                  <Textarea
                    placeholder="Type your response to the user..."
                    value={responses[ticket.id] || ""}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                    rows={4}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => sendResponse(ticket.id)}>
                      Send & Resolve
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setExpanded(null)}>Cancel</Button>
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
