import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Row = { id: string; title: string; stage: string | null; funding_ask: string | null; status: string; created_at: string; user_id: string };

export default function Admin() {
  const [pending, setPending] = useState<Row[]>([]);
  const [investors, setInvestors] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0 });
  const [rejectFor, setRejectFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = async () => {
    const { data: pend } = await supabase.from("pitches").select("id,title,stage,funding_ask,status,created_at,user_id")
      .eq("status", "SUBMITTED").order("created_at", { ascending: false });
    setPending((pend ?? []) as Row[]);

    const { data: all } = await supabase.from("pitches").select("status");
    const a = all ?? [];
    setStats({
      total: a.length,
      approved: a.filter((p) => p.status === "APPROVED").length,
      rejected: a.filter((p) => p.status === "REJECTED").length,
    });

    const { data: inv } = await supabase.from("investor_profiles").select("id,user_id,sectors,linkedin_url,verified")
      .eq("verified", false);
    setInvestors(inv ?? []);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from("pitches").update({ status: "APPROVED" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Approved"); load();
  };
  const reject = async (id: string) => {
    const { error } = await supabase.from("pitches").update({ status: "REJECTED", rejection_reason: reason }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Rejected"); setRejectFor(null); setReason(""); load();
  };
  const verifyInvestor = async (id: string) => {
    const { error } = await supabase.from("investor_profiles").update({ verified: true }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Investor verified"); load();
  };

  return (
    <div className="min-h-screen bg-background relative"
      style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-10">
        <h1 className="text-3xl font-bold text-primary-dark">Admin</h1>
        <p className="text-muted-foreground mt-1">Manual vetting keeps the bar high.</p>

        <div className="grid gap-4 sm:grid-cols-3 mt-6 mb-8">
          {[
            { label: "Total pitches", value: stats.total },
            { label: "Approved", value: stats.approved },
            { label: "Rejected", value: stats.rejected },
          ].map((s) => (
            <Card key={s.label} className="p-5 shadow-card">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-bold text-primary-dark mt-1">{s.value}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pitches">
          <TabsList>
            <TabsTrigger value="pitches">Pending pitches ({pending.length})</TabsTrigger>
            <TabsTrigger value="investors">Pending investors ({investors.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pitches" className="mt-6 space-y-3">
            {pending.length === 0 && <p className="text-muted-foreground">No pitches awaiting review.</p>}
            {pending.map((p) => (
              <Card key={p.id} className="p-5 shadow-card">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-primary-dark">{p.title}</h3>
                      {p.stage && <Badge variant="outline">{p.stage}</Badge>}
                      <span className="text-sm text-muted-foreground">{p.funding_ask}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm"><Link to={`/pitches/${p.id}`}>Review</Link></Button>
                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => approve(p.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setRejectFor(p.id)}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
                {rejectFor === p.id && (
                  <div className="mt-4 space-y-2">
                    <Textarea placeholder="Reason for rejection (visible to founder)" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive" onClick={() => reject(p.id)}>Confirm reject</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setRejectFor(null); setReason(""); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="investors" className="mt-6 space-y-3">
            {investors.length === 0 && <p className="text-muted-foreground">No investors awaiting verification.</p>}
            {investors.map((i) => (
              <Card key={i.id} className="p-5 shadow-card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-primary-dark">Investor {i.user_id.slice(0, 8)}…</p>
                  <p className="text-sm text-muted-foreground">
                    {(i.sectors ?? []).join(", ") || "No sectors listed"}
                    {i.linkedin_url && <> · <a href={i.linkedin_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">LinkedIn</a></>}
                  </p>
                </div>
                <Button size="sm" onClick={() => verifyInvestor(i.id)}>
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verify
                </Button>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}