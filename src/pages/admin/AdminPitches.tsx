import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ExternalLink, Search, Filter, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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

const STATUS_FILTERS = ["ALL", "SUBMITTED", "APPROVED", "REJECTED"];

export default function AdminPitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [filtered, setFiltered] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
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

  useEffect(() => {
    let result = pitches;
    if (statusFilter !== "ALL") result = result.filter((p) => p.status === statusFilter);
    if (search.trim()) result = result.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
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

  const getStatusBadge = (status: string) => {
    if (status === "APPROVED") return <Badge className="bg-green-500/10 text-green-600 border border-green-500/30 font-bold">Approved</Badge>;
    if (status === "REJECTED") return <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 font-bold">Rejected</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 font-bold">Pending</Badge>;
  };

  const counts = {
    ALL: pitches.length,
    SUBMITTED: pitches.filter((p) => p.status === "SUBMITTED").length,
    APPROVED: pitches.filter((p) => p.status === "APPROVED").length,
    REJECTED: pitches.filter((p) => p.status === "REJECTED").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Pitch Approval Queue</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review and moderate startup pitches</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              statusFilter === f
                ? "bg-foreground text-background border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {f === "ALL" ? "All" : f === "SUBMITTED" ? "Pending" : f.charAt(0) + f.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-70">{counts[f as keyof typeof counts]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pitches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* Pitch List */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-5 border-2 border-foreground/10 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No pitches found</p>
          <p className="text-sm text-muted-foreground mt-1">Try changing your filters</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-5 border-2 border-foreground/10 hover:border-foreground/25 transition-all">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-foreground">{p.title}</h3>
                    {getStatusBadge(p.status)}
                    {p.stage && <Badge variant="outline" className="text-xs">{p.stage}</Badge>}
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {p.funding_ask && <span className="font-medium">Ask: {p.funding_ask}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="font-mono">ID: {p.user_id.slice(0, 8)}…</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm" className="rounded-xl border-2 border-foreground/15">
                    <Link to={`/pitches/${p.id}`}>
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Review
                    </Link>
                  </Button>
                  {p.status !== "APPROVED" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-xl" onClick={() => approve(p.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                    </Button>
                  )}
                  {p.status !== "REJECTED" && (
                    <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => setRejectFor(p.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject
                    </Button>
                  )}
                </div>
              </div>

              {rejectFor === p.id && (
                <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3">
                  <p className="text-sm font-bold text-red-600">Rejection Reason</p>
                  <Textarea
                    placeholder="Explain why this pitch is being rejected (visible to the founder)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-sm border-red-500/30 focus-visible:ring-red-500/30"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => reject(p.id)}>
                      Confirm Rejection
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setRejectFor(null); setReason(""); }}>
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
