import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PageHeader,
  PageShell,
  SectionCard,
  DataTable,
  Column,
  RoleBadge,
  RefreshButton,
} from "@/components/admin/ui";

type UserRow = {
  id: string;
  user_id: string;
  full_name: string;
  role: "student" | "investor";
  city?: string | null;
  meta?: string | null;
  verified?: boolean;
  created_at: string;
  profile_complete?: boolean;
};

const ROLE_TABS = ["ALL", "student", "investor"] as const;
type Tab = typeof ROLE_TABS[number];

export default function AdminUsers() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const [students, investors] = await Promise.all([
      supabase
        .from("student_profiles")
        .select("id,user_id,full_name,city,college,created_at,profile_complete"),
      supabase
        .from("investor_profiles")
        .select("id,user_id,full_name,city,company_fund_name,verified,created_at,profile_complete"),
    ]);
    const mapped: UserRow[] = [
      ...((students.data as any[]) ?? []).map((s) => ({
        id: `s-${s.id}`,
        user_id: s.user_id,
        full_name: s.full_name,
        role: "student" as const,
        city: s.city,
        meta: s.college,
        created_at: s.created_at,
        profile_complete: s.profile_complete,
      })),
      ...((investors.data as any[]) ?? []).map((i) => ({
        id: `i-${i.id}`,
        user_id: i.user_id,
        full_name: i.full_name,
        role: "investor" as const,
        city: i.city,
        meta: i.company_fund_name,
        verified: i.verified,
        created_at: i.created_at,
        profile_complete: i.profile_complete,
      })),
    ].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    setRows(mapped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let r = rows;
    if (tab !== "ALL") r = r.filter((u) => u.role === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(q) ||
          (u.meta || "").toLowerCase().includes(q) ||
          (u.city || "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [rows, tab, search]);

  const counts = {
    ALL: rows.length,
    student: rows.filter((u) => u.role === "student").length,
    investor: rows.filter((u) => u.role === "investor").length,
  };

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: "Name",
      width: "1.4fr",
      cell: (u) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{u.full_name || "Unnamed"}</p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">{u.user_id.slice(0, 14)}…</p>
        </div>
      ),
    },
    {
      key: "meta",
      header: "Organization",
      width: "1.2fr",
      cell: (u) => <span className="text-muted-foreground truncate">{u.meta || "—"}</span>,
    },
    { key: "city", header: "City", width: "0.8fr", cell: (u) => <span className="text-muted-foreground">{u.city || "—"}</span> },
    { key: "role", header: "Role", width: "120px", cell: (u) => <RoleBadge role={u.role} /> },
    {
      key: "status",
      header: "Status",
      width: "130px",
      cell: (u) =>
        u.role === "investor" ? (
          <span className={cn("text-xs font-medium", u.verified ? "text-emerald-600" : "text-amber-600")}>
            {u.verified ? "Verified" : "Unverified"}
          </span>
        ) : (
          <span className={cn("text-xs font-medium", u.profile_complete ? "text-emerald-600" : "text-muted-foreground")}>
            {u.profile_complete ? "Complete" : "Incomplete"}
          </span>
        ),
    },
    {
      key: "joined",
      header: "Joined",
      width: "110px",
      cell: (u) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      ),
    },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        subtitle={`${rows.length.toLocaleString()} platform members across students and investors`}
        actions={<RefreshButton onClick={load} loading={loading} />}
      />

      <SectionCard
        title="Directory"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg">
              {ROLE_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-7 px-3 rounded-md text-[12px] font-medium capitalize transition-colors",
                    tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "ALL" ? "All" : t} <span className="ml-1 text-muted-foreground/70 tabular-nums">{counts[t]}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search name, city, org…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 w-64 text-[13px] rounded-lg bg-muted/40 border-border"
              />
            </div>
          </div>
        }
      >
        <DataTable<UserRow>
          columns={columns}
          rows={filtered}
          loading={loading}
          empty="No users match your filters."
        />
      </SectionCard>
    </PageShell>
  );
}
