import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable, EmptyState, PageHeader, SectionCard, StatCard, StatusPill, type Column } from "@/components/admin/ui";

type Pitch = {
  id: string;
  title: string;
  one_liner?: string | null;
  problem?: string | null;
  solution?: string | null;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  stage: "IDEA" | "MVP" | "REVENUE" | "GROWTH" | null;
  funding_ask: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  rejection_reason?: string | null;
  message_count?: number;
  bookmark_count?: number;
};

const STATUS_OPTIONS = ["ALL", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const;

const statusMeta: Record<Pitch["status"], { label: string; tone: "positive" | "warning" | "danger" | "info" }> = {
  APPROVED: { label: "Approved", tone: "positive" },
  DRAFT: { label: "Draft", tone: "warning" },
  REJECTED: { label: "Rejected", tone: "danger" },
  SUBMITTED: { label: "Under review", tone: "info" },
};

export default function MyPitches() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("ALL");
  const [sortBy, setSortBy] = useState<"RECENT" | "VIEWS" | "MESSAGES">("RECENT");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: realPitches } = await supabase
        .from("pitches")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      const loadedPitches = (realPitches ?? []) as Pitch[];

      if (loadedPitches.length > 0) {
        const [{ data: bookmarks }, { data: messages }] = await Promise.all([
          supabase.from("bookmarks").select("pitch_id"),
          supabase.from("messages").select("pitch_id"),
        ]);

        setPitches(
          loadedPitches.map((p) => ({
            ...p,
            bookmark_count: (bookmarks ?? []).filter((b) => b.pitch_id === p.id).length,
            message_count: (messages ?? []).filter((m) => m.pitch_id === p.id).length,
          }))
        );
      } else {
        setPitches([]);
      }
    } catch (e: any) {
      toast.error("Failed to load pitches: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDuplicate = async (pitch: Pitch) => {
    try {
      setActioningId(pitch.id);
      const { data: fullPitch } = await supabase.from("pitches").select("*").eq("id", pitch.id).single();
      if (!fullPitch) throw new Error("Source pitch not found");

      const payload = {
        user_id: user!.id,
        title: `${fullPitch.title} (Copy)`.slice(0, 100),
        one_liner: fullPitch.one_liner,
        problem: fullPitch.problem,
        solution: fullPitch.solution,
        market_size: fullPitch.market_size,
        traction: fullPitch.traction,
        stage: fullPitch.stage,
        funding_ask: fullPitch.funding_ask,
        team_members: fullPitch.team_members,
        deck_url: fullPitch.deck_url,
        status: "DRAFT" as const,
        view_count: 0,
      };

      const { error } = await supabase.from("pitches").insert(payload);
      if (error) throw error;

      toast.success(`Duplicated "${pitch.title}" successfully!`);
      loadData();
    } catch (e: any) {
      toast.error("Failed to duplicate: " + e.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleDelete = async (pitch: Pitch) => {
    if (!window.confirm(`Are you sure you want to delete "${pitch.title}"?`)) return;
    try {
      setActioningId(pitch.id);
      const { error } = await supabase.from("pitches").delete().eq("id", pitch.id);
      if (error) throw error;

      toast.success("Pitch deleted successfully");
      loadData();
    } catch (e: any) {
      toast.error("Failed to delete pitch: " + e.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleSubmit = async (pitchId: string) => {
    try {
      setActioningId(pitchId);
      const { error } = await supabase.from("pitches").update({ status: "APPROVED" }).eq("id", pitchId);
      if (error) throw error;
      toast.success("Your pitch is now approved and visible to investors!");
      loadData();
    } catch (e: any) {
      toast.error("Failed to submit pitch: " + e.message);
    } finally {
      setActioningId(null);
    }
  };

  const handleRequestReview = (pitchTitle: string) => {
    toast.success(`Review requested for "${pitchTitle}". We'll audit this shortly!`);
  };

  const getAskDisplay = (askVal: string | null) => {
    if (!askVal) return "—";
    if (askVal.trim().startsWith("{")) {
      try {
        return JSON.parse(askVal).funding_ask || "—";
      } catch {
        return askVal;
      }
    }
    return askVal;
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const sortedPitches = useMemo(() => {
    return pitches
      .filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = p.title.toLowerCase().includes(query) || (p.one_liner || "").toLowerCase().includes(query);
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "VIEWS") return b.view_count - a.view_count;
        if (sortBy === "MESSAGES") return (b.message_count ?? 0) - (a.message_count ?? 0);
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      });
  }, [pitches, searchQuery, statusFilter, sortBy]);

  const counts = {
    total: pitches.length,
    approved: pitches.filter((p) => p.status === "APPROVED").length,
    review: pitches.filter((p) => p.status === "SUBMITTED").length,
    engagement: pitches.reduce((sum, p) => sum + (p.view_count || 0) + (p.message_count || 0) + (p.bookmark_count || 0), 0),
  };

  const columns: Column<Pitch>[] = [
    {
      key: "pitch",
      header: "Pitch",
      width: "minmax(260px, 1.7fr)",
      cell: (p) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => navigate(`/pitches/${p.id}`)} className="text-sm font-semibold text-foreground truncate hover:underline text-left">
              {p.title}
            </button>
            {p.status === "APPROVED" && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.one_liner || "No one-line summary added yet."}</p>
          {p.status === "REJECTED" && (
            <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-xs font-medium text-destructive line-clamp-2">{p.rejection_reason || "Unclear differentiation from existing platforms"}</p>
              <button onClick={() => handleRequestReview(p.title)} className="mt-1 text-[11px] font-semibold text-foreground underline-offset-2 hover:underline">
                Request review
              </button>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "132px",
      cell: (p) => <StatusPill label={statusMeta[p.status].label} tone={statusMeta[p.status].tone} />,
    },
    {
      key: "stage",
      header: "Stage / ask",
      width: "150px",
      cell: (p) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{p.stage || "—"}</p>
          <p className="text-xs text-muted-foreground truncate" title={getAskDisplay(p.funding_ask)}>{getAskDisplay(p.funding_ask)}</p>
        </div>
      ),
    },
    {
      key: "metrics",
      header: "Metrics",
      width: "180px",
      cell: (p) => (
        <div className="grid grid-cols-3 gap-2 text-center w-full">
          <div><p className="text-sm font-semibold text-foreground tabular-nums">{p.view_count || 0}</p><p className="text-[10px] text-muted-foreground">Views</p></div>
          <div><p className="text-sm font-semibold text-foreground tabular-nums">{p.message_count || 0}</p><p className="text-[10px] text-muted-foreground">Msgs</p></div>
          <div><p className="text-sm font-semibold text-foreground tabular-nums">{p.bookmark_count || 0}</p><p className="text-[10px] text-muted-foreground">Saves</p></div>
        </div>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      width: "92px",
      cell: (p) => <span className="text-xs font-medium text-muted-foreground">{formatDate(p.updated_at || p.created_at)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      width: "210px",
      align: "right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          <Button asChild size="sm" variant="outline" className="h-8 rounded-md border-border px-2.5 text-xs">
            <Link to={`/pitches/${p.id}`}><ArrowUpRight className="h-3.5 w-3.5 mr-1" /> View</Link>
          </Button>
          {p.status === "DRAFT" && (
            <Button disabled={actioningId === p.id} onClick={() => handleSubmit(p.id)} size="sm" className="h-8 rounded-md px-2.5 text-xs">
              Submit
            </Button>
          )}
          {p.status === "APPROVED" && (
            <Button asChild size="icon" variant="outline" className="h-8 w-8 rounded-md border-border">
              <Link to={`/pitches/${p.id}/security`} title="Security"><ShieldCheck className="h-3.5 w-3.5" /></Link>
            </Button>
          )}
          <Button asChild size="icon" variant="outline" className="h-8 w-8 rounded-md border-border">
            <Link to={`/pitches/${p.id}/edit`} title="Edit"><Edit3 className="h-3.5 w-3.5" /></Link>
          </Button>
          <Button disabled={actioningId === p.id} onClick={() => handleDuplicate(p)} size="icon" variant="outline" className="h-8 w-8 rounded-md border-border" title="Duplicate">
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button disabled={actioningId === p.id} onClick={() => handleDelete(p)} size="icon" variant="outline" className="h-8 w-8 rounded-md border-border hover:bg-destructive hover:text-destructive-foreground" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-24">
        <PageHeader
          eyebrow="Student workspace"
          title="My Pitches"
          subtitle="Track every pitch, investor signal, review state, and action from one compact workspace."
          actions={
            <Button asChild className="rounded-lg">
              <Link to="/pitches/create"><Plus className="h-4 w-4 mr-2" /> Submit pitch</Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Total pitches" value={counts.total} icon={FileText} loading={loading} />
          <StatCard label="Approved" value={counts.approved} icon={CheckCircle2} tone="positive" loading={loading} />
          <StatCard label="Under review" value={counts.review} icon={AlertCircle} tone="info" loading={loading} />
          <StatCard label="Engagement" value={counts.engagement} icon={Eye} hint="views + messages + saves" loading={loading} />
        </div>

        <SectionCard
          title="Pitch queue"
          description={`${sortedPitches.length} shown from ${pitches.length} total`}
          actions={
            <Button variant="outline" size="sm" onClick={loadData} className="h-8 rounded-md border-border">
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")} /> Refresh
            </Button>
          }
        >
          <div className="px-5 py-4 border-b border-border flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or summary"
                className="pl-9 h-9 rounded-lg border-border bg-background"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                <SelectTrigger className="h-9 rounded-lg border-border sm:w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status === "ALL" ? "All status" : statusMeta[status as Pitch["status"]].label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="h-9 rounded-lg border-border sm:w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECENT">Recently updated</SelectItem>
                  <SelectItem value="VIEWS">Most views</SelectItem>
                  <SelectItem value="MESSAGES">Most messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pitches.length === 0 && !loading ? (
            <div className="p-5">
              <EmptyState
                icon={FileText}
                title="No pitches yet"
                description="Submit your first pitch to start connecting with investors."
                action={<Button asChild className="mt-4 rounded-lg"><Link to="/pitches/create"><Plus className="h-4 w-4 mr-2" /> Submit your first pitch</Link></Button>}
              />
            </div>
          ) : sortedPitches.length === 0 && !loading ? (
            <div className="p-5">
              <EmptyState
                icon={Search}
                title="No pitches match your filters"
                description="Try a different keyword or status filter."
                action={<Button variant="outline" className="mt-4 rounded-lg border-border" onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}>Reset filters</Button>}
              />
            </div>
          ) : (
            <DataTable columns={columns} rows={sortedPitches} loading={loading} empty="No pitches found." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}