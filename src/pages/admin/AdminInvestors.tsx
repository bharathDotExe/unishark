import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck, ShieldX, ExternalLink, Search, RefreshCw,
  Building2, DollarSign, Clock, MapPin, Phone,
} from "lucide-react";
import { toast } from "sonner";

type Investor = {
  id: string;
  user_id: string;
  full_name: string;
  company_fund_name: string | null;
  bio: string | null;
  contact_number: string | null;
  city: string | null;
  linkedin_url: string | null;
  investment_experience: string | null;
  preferred_stages: string[] | null;
  investment_sectors: string[] | null;
  preferred_sectors: string | null;
  sectors: string[] | null;
  verified: boolean | null;
  verification_status: string | null;
  verified_at: string | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  profile_complete: boolean | null;
  created_at: string | null;
};

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED"];

export default function AdminInvestors() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filtered, setFiltered] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("investor_profiles")
      .select(
        "id, user_id, full_name, company_fund_name, bio, contact_number, city, linkedin_url, " +
        "investment_experience, preferred_stages, investment_sectors, preferred_sectors, sectors, " +
        "verified, verification_status, verified_at, ticket_size_min, ticket_size_max, " +
        "profile_complete, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setInvestors((data ?? []) as unknown as Investor[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = investors;
    if (tab === "PENDING") {
      result = result.filter((i) => !i.verified && i.verification_status !== "REJECTED");
    } else if (tab === "APPROVED") {
      result = result.filter((i) => i.verified === true);
    } else if (tab === "REJECTED") {
      result = result.filter((i) => i.verification_status === "REJECTED");
    }
    if (search.trim()) {
      result = result.filter((i) =>
        (i.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (i.company_fund_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (i.city ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [investors, tab, search]);

  const verify = async (id: string) => {
    const { error } = await supabase
      .from("investor_profiles")
      .update({
        verified: true,
        verification_status: "APPROVED",
        verified_at: new Date().toISOString(),
      } as any)
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Investor verified ✓");
    load();
  };

  const rejectInvestor = async (id: string) => {
    const { error } = await supabase
      .from("investor_profiles")
      .update({
        verified: false,
        verification_status: "REJECTED",
      } as any)
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Investor application rejected");
    load();
  };

  const counts = {
    PENDING: investors.filter((i) => !i.verified && i.verification_status !== "REJECTED").length,
    APPROVED: investors.filter((i) => i.verified === true).length,
    REJECTED: investors.filter((i) => i.verification_status === "REJECTED").length,
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return "—";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const getSectors = (inv: Investor): string[] => {
    const arr = inv.investment_sectors ?? inv.sectors ?? [];
    return arr;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground">Investor Verification</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review and verify investor applications</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-2 border-foreground/10" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <Clock className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{counts.PENDING} Pending</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/30">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span className="text-sm font-bold text-green-700 dark:text-green-400">{counts.APPROVED} Verified</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30">
          <ShieldX className="h-4 w-4 text-red-600" />
          <span className="text-sm font-bold text-red-700 dark:text-red-400">{counts.REJECTED} Rejected</span>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap gap-3">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              tab === t
                ? "bg-foreground text-background border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] translate-x-[-1px] translate-y-[-1px]"
                : "border-foreground/15 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
            <span className="ml-2 text-xs opacity-70">{counts[t as keyof typeof counts]}</span>
          </button>
        ))}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, fund or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl border-2 border-foreground/10 focus-visible:border-foreground focus-visible:ring-0 text-sm"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-5 border-2 border-foreground/10 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 border-2 border-foreground/10 text-center">
          <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">No investors in this category</p>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "PENDING" ? "All investors have been reviewed." : `No ${tab.toLowerCase()} investors found.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const sectors = getSectors(inv);
            return (
              <Card key={inv.id} className="p-5 border-2 border-foreground/10 hover:border-foreground/25 transition-all">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="min-w-0 flex-1">
                    {/* Name + status badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground">
                        {inv.full_name || `Investor ${(inv.user_id ?? "").slice(0, 8)}…`}
                      </h3>
                      {inv.verified ? (
                        <Badge className="bg-green-500/10 text-green-600 border border-green-500/30 font-bold">
                          ✓ Verified
                        </Badge>
                      ) : inv.verification_status === "REJECTED" ? (
                        <Badge className="bg-red-500/10 text-red-600 border border-red-500/30 font-bold">
                          Rejected
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 font-bold">
                          Pending
                        </Badge>
                      )}
                      {!inv.profile_complete && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Profile Incomplete
                        </Badge>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      {inv.company_fund_name && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 shrink-0" /> {inv.company_fund_name}
                        </span>
                      )}
                      {inv.city && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {inv.city}
                        </span>
                      )}
                      {inv.contact_number && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" /> {inv.contact_number}
                        </span>
                      )}
                      {(inv.ticket_size_min || inv.ticket_size_max) && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3.5 w-3.5 shrink-0" />
                          {formatAmount(inv.ticket_size_min)} – {formatAmount(inv.ticket_size_max)}
                        </span>
                      )}
                      {inv.investment_experience && (
                        <span className="text-sm text-muted-foreground">
                          {inv.investment_experience} exp
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        {inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>

                    {/* Bio */}
                    {inv.bio && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 max-w-xl">{inv.bio}</p>
                    )}

                    {/* Sectors */}
                    {sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sectors.slice(0, 5).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                        {sectors.length > 5 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            +{sectors.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Preferred stages */}
                    {(inv.preferred_stages ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(inv.preferred_stages ?? []).map((s) => (
                          <Badge key={s} className="bg-foreground/5 text-muted-foreground border border-foreground/10 text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Verified at */}
                    {inv.verified && inv.verified_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Verified on {new Date(inv.verified_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {inv.linkedin_url && (
                      <Button asChild variant="outline" size="sm" className="rounded-xl border-2 border-foreground/15">
                        <a href={inv.linkedin_url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> LinkedIn
                        </a>
                      </Button>
                    )}
                    {!inv.verified && inv.verification_status !== "REJECTED" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl"
                          onClick={() => verify(inv.id)}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-xl"
                          onClick={() => rejectInvestor(inv.id)}
                        >
                          <ShieldX className="h-3.5 w-3.5 mr-1.5" /> Reject
                        </Button>
                      </>
                    )}
                    {inv.verified && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-2 border-red-500/30 text-red-600 hover:bg-red-500/10"
                        onClick={() => rejectInvestor(inv.id)}
                      >
                        <ShieldX className="h-3.5 w-3.5 mr-1.5" /> Revoke
                      </Button>
                    )}
                    {inv.verification_status === "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl border-2 border-green-500/30 text-green-600 hover:bg-green-500/10"
                        onClick={() => verify(inv.id)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Re-verify
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
