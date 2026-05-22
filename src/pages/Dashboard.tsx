import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Eye } from "lucide-react";

type Pitch = {
  id: string;
  title: string;
  status: string;
  stage: string | null;
  funding_ask: string | null;
  view_count: number;
  updated_at: string;
  thumbnail_url: string | null;
};

const statusStyle: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-primary/10 text-primary",
  APPROVED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("pitches").select("id,title,status,stage,funding_ask,view_count,updated_at,thumbnail_url")
      .eq("user_id", user.id).order("updated_at", { ascending: false })
      .then(({ data }) => { setPitches((data ?? []) as Pitch[]); setLoading(false); });
  }, [user]);

  return (
    <div className="min-h-screen bg-background relative"
      style={{ backgroundImage: "var(--gradient-mesh)" }}>
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">My pitches</h1>
            <p className="text-muted-foreground mt-1">Manage your submissions and track investor interest.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/pitches/create"><Plus className="mr-2 h-4 w-4" /> New pitch</Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : pitches.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-dark">No pitches yet</h3>
            <p className="text-muted-foreground mt-2 mb-6">Submit your first pitch to start meeting investors.</p>
            <Button asChild><Link to="/pitches/create"><Plus className="mr-2 h-4 w-4" /> Create your pitch</Link></Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pitches.map((p) => (
              <Card key={p.id} className="p-6 shadow-card hover:shadow-elevated transition-shadow">
                <div className="flex items-start gap-4 flex-col sm:flex-row">
                  {/* Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-lg border-2 border-foreground overflow-hidden bg-background shrink-0 shadow-[2px_2px_0_0_hsl(var(--foreground))]">
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/40 font-mono select-none">
                        <span className="text-xl font-black text-foreground/20">{(p.title || "UN").slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex items-start justify-between flex-wrap gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-primary-dark truncate">{p.title || "Untitled pitch"}</h3>
                        <Badge className={statusStyle[p.status]} variant="outline">{p.status}</Badge>
                        {p.stage && <Badge variant="outline">{p.stage}</Badge>}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        {p.funding_ask && <span>Asking {p.funding_ask}</span>}
                        <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {p.view_count} views</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-x-[1px] hover:translate-y-[1px]">
                      <Link to={`/pitches/${p.id}/edit`}>{p.status === "DRAFT" ? "Continue editing" : "View"}</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}