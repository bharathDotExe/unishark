import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PageShell, PageHeader, SectionCard, StatCard,
  DataTable, StatusPill, RefreshButton, Column,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck, ShieldX, ExternalLink, Search,
  Download, Building2, Trash2, Clock,
} from "lucide-react";
import { toast } from "sonner";

type Investor = {
  id: string;
  user_id: string;
  full_name: string | null;
  company_fund_name: string | null;
  city: string | null;
  investment_experience: string | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  linkedin_url: string | null;
  profile_photo_url: string | null;
  verified: boolean;
  verification_status: string | null;
  verified_at: string | null;
  created_at: string;
  total_investments_count: number | null;
  // resolved from profiles
  email: string;
  avatar_url: string | null;
  has_profile?: boolean;
};

const TABS = ["ALL", "VERIFIED", "PENDING", "REJECTED"] as const;

export default function SuperAdminInvestors() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);

    const [rolesRes, profilesRes, invProfilesRes] = await Promise.all([
      supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "investor"),
      supabase.from("profiles").select("id, email, full_name, avatar_url, is_suspended, created_at"),
      supabase
        .from("investor_profiles")
        .select(
          "user_id,id,full_name,company_fund_name,city,investment_experience," +
          "ticket_size_min,ticket_size_max,linkedin_url,profile_photo_url," +
          "verified,verification_status,verified_at,total_investments_count"
        ),
    ]);

    if (rolesRes.error) toast.error("Roles fetch error: " + rolesRes.error.message);
    if (profilesRes.error) toast.error("Profiles fetch error: " + profilesRes.error.message);
    if (invProfilesRes.error) toast.error("Investor profiles fetch error: " + invProfilesRes.error.message);

    const investorIds = new Set((rolesRes.data ?? []).map((r: any) => r.user_id));

    const invProfileMap = new Map<string, any>(
      (invProfilesRes.data ?? []).map((ip: any) => [ip.user_id, ip])
    );

    const combined: Investor[] = (profilesRes.data ?? [])
      .filter((p: any) => investorIds.has(p.id))
      .map((profile: any) => {
        const ip = invProfileMap.get(profile.id) ?? {};
        return {
          id: ip.id ?? profile.id, // fallback to profile id if no investor_profile yet
          user_id: profile.id,
          full_name: ip.full_name ?? profile.full_name ?? null,
          company_fund_name: ip.company_fund_name ?? null,
          city: ip.city ?? null,
          investment_experience: ip.investment_experience ?? null,
          ticket_size_min: ip.ticket_size_min ?? null,
          ticket_size_max: ip.ticket_size_max ?? null,
          linkedin_url: ip.linkedin_url ?? null,
          profile_photo_url: ip.profile_photo_url ?? null,
          verified: ip.verified ?? false,
          verification_status: ip.verification_status ?? null,
          verified_at: ip.verified_at ?? null,
          total_investments_count: ip.total_investments_count ?? null,
          created_at: profile.created_at ?? "",
          email: profile.email ?? "",
          avatar_url: profile.avatar_url ?? null,
          has_profile: !!ip.id,
        };
      });

    // Sort newest first
    combined.sort((a, b) => b.created_at.localeCompare(a.created_at));

    setInvestors(combined);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = investors.filter((i) => {
    if (tab === "VERIFIED" && !i.verified) return false;
    if (tab === "PENDING" && (i.verified || i.verification_status === "REJECTED")) return false;
    if (tab === "REJECTED" && i.verification_status !== "REJECTED") return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${i.full_name ?? ""} ${i.company_fund_name ?? ""} ${i.email} ${i.city ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    ALL: investors.length,
    VERIFIED: investors.filter((i) => i.verified).length,
    PENDING: investors.filter((i) => !i.verified && i.verification_status !== "REJECTED").length,
    REJECTED: investors.filter((i) => i.verification_status === "REJECTED").length,
  };

  const verify = async (i: Investor) => {
    if (i.has_profile) {
      const { error } = await supabase.from("investor_profiles").update({ verified: true, verification_status: "APPROVED", verified_at: new Date().toISOString() } as any).eq("user_id", i.user_id);
      if (error) return toast.error(error.message);
    } else {
      const payload = { user_id: i.user_id, verified: true, verification_status: "APPROVED", verified_at: new Date().toISOString(), full_name: i.full_name || "—", contact_number: "—", city: "—", linkedin_url: "—", investment_experience: i.investment_experience || "First-time" };
      const { error } = await supabase.from("investor_profiles").insert(payload as any);
      if (error) return toast.error(error.message + " Payload: " + JSON.stringify(payload));
    }
    toast.success("Investor verified.");
    load();
  };

  const reject = async (i: Investor) => {
    if (!confirm("Reject this investor's verification?")) return;
    if (i.has_profile) {
      const { error } = await supabase.from("investor_profiles").update({ verified: false, verification_status: "REJECTED" } as any).eq("user_id", i.user_id);
      if (error) return toast.error(error.message);
    } else {
      const payload = { user_id: i.user_id, verified: false, verification_status: "REJECTED", full_name: i.full_name || "—", contact_number: "—", city: "—", linkedin_url: "—", investment_experience: i.investment_experience || "First-time" };
      const { error } = await supabase.from("investor_profiles").insert(payload as any);
      if (error) return toast.error(error.message + " Payload: " + JSON.stringify(payload));
    }
    toast.success("Verification rejected.");
    load();
  };

  const revoke = async (i: Investor) => {
    if (!confirm("Revoke this investor's verified status?")) return;
    if (i.has_profile) {
      const { error } = await supabase.from("investor_profiles").update({ verified: false, verification_status: "PENDING", verified_at: null } as any).eq("user_id", i.user_id);
      if (error) return toast.error(error.message);
    } else {
      const payload = { user_id: i.user_id, verified: false, verification_status: "PENDING", verified_at: null, full_name: i.full_name || "—", contact_number: "—", city: "—", linkedin_url: "—", investment_experience: i.investment_experience || "First-time" };
      const { error } = await supabase.from("investor_profiles").insert(payload as any);
      if (error) return toast.error(error.message + " Payload: " + JSON.stringify(payload));
    }
    toast.success("Verification revoked.");
    load();
  };

  const remove = async (i: Investor) => {
    if (!confirm("Delete this investor profile permanently?")) return;
    const { error } = await supabase.from("investor_profiles").delete().eq("user_id", i.user_id);
    if (error) return toast.error(error.message);
    toast.success("Profile deleted.");
    load();
  };

  const fmt = (v: number | null) =>
    !v ? "—" : v >= 1e7 ? `₹${(v / 1e7).toFixed(1)}Cr` : v >= 1e5 ? `₹${(v / 1e5).toFixed(1)}L` : `₹${v.toLocaleString("en-IN")}`;

  const statusTone = (i: Investor): any =>
    i.verified ? "positive" : i.verification_status === "REJECTED" ? "danger" : "warning";
  const statusLabel = (i: Investor) =>
    i.verified ? "Verified" : i.verification_status === "REJECTED" ? "Rejected" : "Pending";

  const initials = (i: Investor) =>
    (i.full_name ?? i.email ?? "?").slice(0, 1).toUpperCase();

  const exportCSV = () => {
    const header = ["Name", "Email", "Company", "City", "Verified", "Ticket Min", "Ticket Max", "Experience", "Joined"];
    const body = filtered.map((i) => [
      i.full_name ?? "",
      i.email,
      i.company_fund_name ?? "",
      i.city ?? "",
      i.verified ? "Yes" : "No",
      i.ticket_size_min ?? "",
      i.ticket_size_max ?? "",
      i.investment_experience ?? "",
      i.created_at?.slice(0, 10) ?? "",
    ]);
    const csv = [header, ...body].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "investors.csv";
    a.click();
    toast.success("Exported");
  };

  const columns: Column<Investor>[] = [
    {
      key: "investor",
      header: "Investor",
      cell: (i) => (
        <div className="flex items-center gap-3 min-w-0">
          {i.profile_photo_url || i.avatar_url ? (
            <img
              src={i.profile_photo_url ?? i.avatar_url!}
              alt={i.full_name ?? ""}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold shrink-0">
              {initials(i)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {i.full_name || "—"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{i.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company / Fund",
      width: "180px",
      cell: (i) => (
        <div className="min-w-0">
          {i.company_fund_name ? (
            <p className="text-[12px] font-medium text-foreground flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
              {i.company_fund_name}
            </p>
          ) : (
            <span className="text-[12px] text-muted-foreground">—</span>
          )}
          {i.city && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{i.city}</p>
          )}
        </div>
      ),
    },
    {
      key: "ticket",
      header: "Ticket size",
      width: "160px",
      cell: (i) => (
        <span className="text-[12px] text-muted-foreground">
          {i.ticket_size_min || i.ticket_size_max
            ? `${fmt(i.ticket_size_min)} – ${fmt(i.ticket_size_max)}`
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      cell: (i) => <StatusPill label={statusLabel(i)} tone={statusTone(i)} />,
    },
    {
      key: "joined",
      header: "Joined",
      width: "120px",
      cell: (i) => (
        <span className="text-[12px] text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {i.created_at
            ? new Date(i.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "2-digit",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "230px",
      align: "right",
      cell: (i) => (
        <div className="flex items-center gap-1 justify-end">
          {i.linkedin_url && (
            <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0">
              <a href={i.linkedin_url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {/* Pending: can verify or reject */}
          {!i.verified && i.verification_status !== "REJECTED" && (
            <>
              <Button
                size="sm" variant="ghost"
                className="h-8 text-xs text-emerald-700 hover:bg-emerald-50"
                onClick={() => verify(i)}
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />Verify
              </Button>
              <Button
                size="sm" variant="ghost"
                className="h-8 text-xs text-red-600 hover:bg-red-50"
                onClick={() => reject(i)}
              >
                <ShieldX className="h-3.5 w-3.5 mr-1" />Reject
              </Button>
            </>
          )}
          {/* Rejected: can re-verify */}
          {i.verification_status === "REJECTED" && !i.verified && (
            <Button
              size="sm" variant="ghost"
              className="h-8 text-xs text-emerald-700 hover:bg-emerald-50"
              onClick={() => verify(i)}
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />Verify
            </Button>
          )}
          {/* Verified: can revoke */}
          {i.verified && (
            <Button
              size="sm" variant="ghost"
              className="h-8 text-xs text-amber-700 hover:bg-amber-50"
              onClick={() => revoke(i)}
            >
              <ShieldX className="h-3.5 w-3.5 mr-1" />Revoke
            </Button>
          )}
          <Button
            size="sm" variant="ghost"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => remove(i)}
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
        title="All investors"
        subtitle="Verify, revoke and manage investor accounts on the platform."
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
        <StatCard label="Total" value={counts.ALL} icon={ShieldCheck} loading={loading} />
        <StatCard label="Verified" value={counts.VERIFIED} icon={ShieldCheck} tone="positive" loading={loading} />
        <StatCard label="Pending" value={counts.PENDING} tone="warning" loading={loading} />
        <StatCard label="Rejected" value={counts.REJECTED} icon={ShieldX} tone="danger" loading={loading} />
      </div>

      {/* Table */}
      <SectionCard
        title="Investor directory"
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
                  {t.charAt(0) + t.slice(1).toLowerCase()}
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
                placeholder="Search name, email or company…"
                className="pl-8 h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={filtered}
          loading={loading}
          empty="No investors match your filters."
        />
      </SectionCard>
    </PageShell>
  );
}
