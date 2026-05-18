import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowRight, Eye } from "lucide-react";

type Row = {
  id: string; title: string; one_liner: string | null; problem: string | null;
  stage: string | null; funding_ask: string | null; view_count: number;
};

export default function BrowsePitches() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let q = supabase.from("pitches")
      .select("id,title,one_liner,problem,stage,funding_ask,view_count")
      .eq("status", "APPROVED")
      .order("created_at", { ascending: false }).limit(50);
    if (stage !== "ALL") q = q.eq("stage", stage as any);
    q.then(({ data }) => { setRows((data ?? []) as Row[]); setLoading(false); });
  }, [stage]);

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.title.toLowerCase().includes(s) || (r.problem ?? "").toLowerCase().includes(s);
  });

  return (
    <div className="min-h-screen bg-background relative"
      style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-8 sm:pt-32 sm:pb-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark">Discover pitches</h1>
          <p className="text-muted-foreground mt-1">Hand-vetted founders building the next wave of Indian startups.</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by keyword…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All stages</SelectItem>
              <SelectItem value="IDEA">Idea</SelectItem>
              <SelectItem value="MVP">MVP</SelectItem>
              <SelectItem value="REVENUE">Revenue</SelectItem>
              <SelectItem value="GROWTH">Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <p className="text-muted-foreground">No pitches match your filters yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p.id} className="p-6 shadow-card hover:shadow-elevated transition-all flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  {p.stage && <Badge variant="outline">{p.stage}</Badge>}
                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                    <Eye className="h-3 w-3" /> {p.view_count}
                  </span>
                </div>
                <h3 className="font-semibold text-primary-dark text-lg leading-snug">{p.title}</h3>
                {p.one_liner && <p className="text-sm text-muted-foreground mt-1">{p.one_liner}</p>}
                <p className="text-sm text-foreground mt-3 line-clamp-3">{p.problem}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">{p.funding_ask || "—"}</span>
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/pitches/${p.id}`}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}