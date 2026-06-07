import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  PageShell, PageHeader, SectionCard, StatCard,
  DataTable, StatusPill, RefreshButton, Column,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText, CheckCircle2, XCircle, Trash2, Download,
  Search, ExternalLink, Clock,
} from "lucide-react";
import { toast } from "sonner";

type Pitch = {
  id: string;
  title: string;
  one_liner: string | null;
  stage: string | null;
  funding_ask: string | null;
  status: string;
  created_at: string;
  view_count: number | null;
  thumbnail_url: string | null;
  rejection_reason: string | null;
  // resolved from profiles / student_profiles
  user_id: string;
  founder_email: string;
  founder_name: string | null;
  founder_avatar: string | null;
};

const TABS = ["ALL", "SUBMITTED", "APPROVED", "REJECTED", "DRAFT"] as const;

const tone = (s: string): any =>
  s === "APPROVED" ? "positive" : s === "REJECTED" ? "danger" : s === "SUBMITTED" ? "warning" : "neutral";

const tabLabel = (t: string) =>
  t === "ALL" ? "All" : t === "SUBMITTED" ? "Pending" : t.charAt(0) + t.slice(1).toLowerCase();

export default function SuperAdminPitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [rejectFor, setRejectFor] = useState<Pitch | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);

    const [pitchRes, profilesRes, studentRes] = await Promise.all([
      supabase
        .from("pitches")
        .select("id,title,one_liner,stage,funding_ask,status,created_at,view_count,thumbnail_url,rejection_reason,user_id")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,email,full_name,avatar_url"),
      supabase.from("student_profiles").select("user_id,full_name,profile_photo_url"),
    ]);

    if (pitchRes.error) toast.error(pitchRes.error.message);

    // Build profile lookups
    const profileMap = new Map<string, { email: string; full_name: string | null; avatar_url: string | null }>(
      (profilesRes.data ?? []).map((p: any) => [p.id, { email: p.email ?? "", full_name: p.full_name, avatar_url: p.avatar_url }])
    );
    const studentMap = new Map<string, { full_name: string | null; avatar: string | null }>(
      (studentRes.data ?? []).map((s: any) => [s.user_id, { full_name: s.full_name, avatar: s.profile_photo_url }])
    );

    const combined: Pitch[] = (pitchRes.data ?? []).map((p: any) => {
      const profile = profileMap.get(p.user_id);
      const student = studentMap.get(p.user_id);
      return {
        ...p,
        founder_email: profile?.email ?? p.user_id,
        founder_name: student?.full_name ?? profile?.full_name ?? null,
        founder_avatar: student?.avatar ?? profile?.avatar_url ?? null,
      };
    });

    setPitches(combined);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = pitches.filter((p) => {
    if (tab !== "ALL" && p.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${p.title} ${p.one_liner ?? ""} ${p.founder_name ?? ""} ${p.founder_email}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts: Record<string, number> = { ALL: pitches.length };
  TABS.slice(1).forEach((t) => { counts[t] = pitches.filter((p) => p.status === t).length; });

  const approve = async (id: string) => {
    const { error } = await supabase.from("pitches").update({ status: "APPROVED" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pitch approved.");
    load();
  };

  const submitReject = async () => {
    if (!rejectFor || !reason.trim()) return toast.error("Please provide a rejection reason.");
    setSubmitting(true);
    const { error } = await supabase
      .from("pitches")
      .update({ status: "REJECTED", rejection_reason: reason } as any)
      .eq("id", rejectFor.id);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Pitch rejected.");
    setRejectFor(null);
    setReason("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this pitch permanently? This cannot be undone.")) return;
    const { error } = await supabase.from("pitches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Pitch deleted.");
    load();
  };

  const exportCSV = () => {
    const header = ["ID", "Title", "Founder", "Email", "Stage", "Status", "Funding Ask", "Views", "Created"];
    const body = filtered.map((p) => [
      p.id, p.title, p.founder_name ?? "", p.founder_email,
      p.stage ?? "", p.status, p.funding_ask ?? "",
      p.view_count ?? 0, p.created_at?.slice(0, 10) ?? "",
    ]);
    const csv = [header, ...body].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "pitches.csv";
    a.click();
    toast.success("Exported");
  };

  const founderInitials = (p: Pitch) =>
    (p.founder_name ?? p.founder_email ?? "?").slice(0, 1).toUpperCase();

  const columns: Column<Pitch>[] = [
    {
      key: "pitch",
      header: "Pitch",
      cell: (p) => (
        <div className="flex items-center gap-3 min-w-0">
          {p.thumbnail_url ? (
            <img src={p.thumbnail_url} alt={p.title} className="h-10 w-10 rounded-lg object-cover shrink-0 border border-border" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
            {p.one_liner && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{p.one_liner}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "founder",
      header: "Founder",
      width: "200px",
      cell: (p) => (
        <div className="flex items-center gap-2 min-w-0">
          {p.founder_avatar ? (
            <img src={p.founder_avatar} alt={p.founder_name ?? ""} className="h-6 w-6 rounded-full object-cover shrink-0" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
              {founderInitials(p)}
            </div>
          )}
          <div className="min-w-0">
            {p.founder_name && (
              <p className="text-[12px] font-medium text-foreground truncate">{p.founder_name}</p>
            )}
            <p className={`truncate ${p.founder_name ? "text-[11px] text-muted-foreground" : "text-[12px] font-medium text-foreground"}`}>
              {p.founder_email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "stage",
      header: "Stage",
      width: "110px",
      cell: (p) => <span className="text-[12px] text-muted-foreground">{p.stage || "—"}</span>,
    },
    {
      key: "ask",
      header: "Ask",
      width: "120px",
      cell: (p) => <span className="text-[12px] text-muted-foreground">{p.funding_ask || "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      cell: (p) => (
        <StatusPill
          label={p.status === "SUBMITTED" ? "Pending" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
          tone={tone(p.status)}
        />
      ),
    },
    {
      key: "date",
      header: "Date",
      width: "120px",
      cell: (p) => (
        <span className="text-[12px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "230px",
      align: "right",
      cell: (p) => (
        <div className="flex items-center gap-1 justify-end">
          <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Link to={`/superadmin/pitches/${p.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
          </Button>
          {p.status !== "APPROVED" && (
            <Button
              size="sm" variant="ghost"
              className="h-8 text-xs text-emerald-700 hover:bg-emerald-50"
              onClick={() => approve(p.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve
            </Button>
          )}
          {p.status !== "REJECTED" && (
            <Button
              size="sm" variant="ghost"
              className="h-8 text-xs text-amber-700 hover:bg-amber-50"
              onClick={() => { setRejectFor(p); setReason(p.rejection_reason ?? ""); }}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />Reject
            </Button>
          )}
          <Button
            size="sm" variant="ghost"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => remove(p.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Super admin"
        title="All pitches"
        subtitle="Review, approve, reject and remove any pitch on the platform."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9 rounded-lg gap-2 shadow-none" onClick={exportCSV}>
              <Download className="h-3.5 w-3.5" />Export CSV
            </Button>
            <RefreshButton onClick={load} loading={loading} />
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={counts.ALL} icon={FileText} loading={loading} />
        <StatCard label="Pending review" value={counts.SUBMITTED || 0} icon={Clock} tone="warning" loading={loading} />
        <StatCard label="Approved" value={counts.APPROVED || 0} icon={CheckCircle2} tone="positive" loading={loading} />
        <StatCard label="Rejected" value={counts.REJECTED || 0} icon={XCircle} tone="danger" loading={loading} />
      </div>

      {/* Table */}
      <SectionCard
        title="Pitch queue"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-lg bg-muted">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 h-7 rounded-md text-[12px] font-medium transition-colors ${
                    tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tabLabel(t)}
                  {t !== "ALL" && counts[t] > 0 && (
                    <span className="ml-1.5 text-[10px] bg-foreground/10 rounded-full px-1.5 py-0.5">
                      {counts[t]}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, founder, email…"
                className="pl-8 h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>
        }
      >
        <DataTable columns={columns} rows={filtered} loading={loading} empty="No pitches match your filters." />
      </SectionCard>

      {/* Reject dialog */}
      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject pitch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <p className="text-sm font-medium text-foreground">{rejectFor?.title}</p>
            <p className="text-[12px] text-muted-foreground">
              By {rejectFor?.founder_name ?? rejectFor?.founder_email}
            </p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason — this will be visible to the founder…"
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={submitReject} disabled={!reason.trim() || submitting}>
              {submitting ? "Rejecting…" : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
