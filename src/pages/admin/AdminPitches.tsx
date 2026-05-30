import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  PageShell,
  SectionCard,
  StatusPill,
  RefreshButton,
} from "@/components/admin/ui";

type Pitch = {
  id: string;
  title: string;
  stage: string | null;
  funding_ask: string | null;
  status: string;
  created_at: string;
  user_id: string;
  description?: string | null;
};

const STATUS_FILTERS = ["ALL", "SUBMITTED", "APPROVED", "REJECTED"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function AdminPitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("SUBMITTED");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("pitches")
      .select("id,title,stage,funding_ask,status,created_at,user_id,description")
      .order("created_at", { ascending: false });
    setPitches(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = pitches;
    if (statusFilter !== "ALL") result = result.filter((p) => p.status === statusFilter);
    if (search.trim())
      result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [pitches, statusFilter, search]);

  const approve = async (id: string) => {
    const { error } = await supabase.from("pitches").update({ status: "APPROVED" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pitch approved ✓"); load();
  };

  const reject = async (id: string) => {
    if (!reason.trim()) { toast.error("Please provide a rejection reason"); return; }
    const { error } = await supabase.from("pitches").update({ status: "REJECTED", rejection_reason: reason }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pitch rejected"); setRejectFor(null); setReason(""); load();
  };

  const tone = (s: string) =>
    s === "APPROVED" ? "positive" : s === "REJECTED" ? "danger" : "warning";
  const label = (s: string) =>
    s === "APPROVED" ? "Approved" : s === "REJECTED" ? "Rejected" : "Pending";

  const counts = {
    ALL: pitches.length,
    SUBMITTED: pitches.filter((p) => p.status === "SUBMITTED").length,
    APPROVED: pitches.filter((p) => p.status === "APPROVED").length,
    REJECTED: pitches.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Pitch queue"
        subtitle="Review submitted pitches and approve or reject with feedback."
        actions={<RefreshButton onClick={load} loading={loading} />}
      />

      <SectionCard
        title="Submissions"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "h-7 px-3 rounded-md text-[12px] font-medium transition-colors capitalize",
                    statusFilter === f
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f === "ALL" ? "All" : f === "SUBMITTED" ? "Pending" : f.toLowerCase()}
                  <span className="ml-1 text-muted-foreground/70 tabular-nums">
                    {counts[f as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search pitches…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 w-60 text-[13px] rounded-lg bg-muted/40 border-border"
              />
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-5">
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No pitches match your filters.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                      <StatusPill label={label(p.status)} tone={tone(p.status) as any} />
                      {p.stage && (
                        <span className="text-[11px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                          {p.stage}
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-[13px] text-muted-foreground mt-1.5 line-clamp-2 max-w-3xl">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      {p.funding_ask && <span>Ask · {p.funding_ask}</span>}
                      <span>
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="font-mono">{p.user_id.slice(0, 8)}…</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button asChild variant="outline" size="sm" className="h-8 rounded-lg border-border text-[12px]">
                      <Link to={`/pitches/${p.id}`}>
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Review
                      </Link>
                    </Button>
                    {p.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        className="h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px]"
                        onClick={() => approve(p.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                      </Button>
                    )}
                    {p.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-[12px]"
                        onClick={() => setRejectFor(p.id)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                      </Button>
                    )}
                  </div>
                </div>

                {rejectFor === p.id && (
                  <div className="mt-3 p-3.5 bg-red-50/60 border border-red-200 rounded-lg space-y-2.5">
                    <p className="text-[12px] font-semibold text-red-700">Reason for rejection</p>
                    <Textarea
                      placeholder="Visible to the founder. Be specific and constructive."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-[13px] bg-card border-red-200 focus-visible:ring-red-300"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[12px]"
                        onClick={() => reject(p.id)}
                      >
                        Confirm rejection
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-[12px]"
                        onClick={() => {
                          setRejectFor(null);
                          setReason("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
