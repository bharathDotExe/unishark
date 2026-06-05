import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bookmark, Download, Eye, FileText, Linkedin, MessageSquare, Share2, Star, TrendingUp, Users } from "lucide-react";
import { PageHeader, SectionCard, StatCard, StatusPill } from "@/components/admin/ui";

type InvestorPitchViewProps = {
  pitch: any;
  authorProfile: any;
  deckSignedUrl: string | null;
};

function parseJsonField(value: string | null | undefined, key: string) {
  if (!value) return "";
  if (value.trim().startsWith("{")) {
    try {
      return JSON.parse(value)[key] || "";
    } catch {
      return value;
    }
  }
  return value;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SectionCard title={title}>
      <div className="p-5 md:p-6">{children}</div>
    </SectionCard>
  );
}

export default function InvestorPitchView({ pitch, authorProfile, deckSignedUrl }: InvestorPitchViewProps) {
  const ask = parseJsonField(pitch?.funding_ask, "funding_ask") || pitch?.funding_ask || "—";
  const marketSize = parseJsonField(pitch?.market_size, "market_size") || pitch?.market_size || "—";
  const targetMarket = parseJsonField(pitch?.market_size, "target_market") || "Not specified";
  const competitors = parseJsonField(pitch?.market_size, "competitors");
  const advantage = parseJsonField(pitch?.market_size, "advantage");
  const useOfFunds = parseJsonField(pitch?.funding_ask, "use_of_funds");
  const team = Array.isArray(pitch?.team_members) ? pitch.team_members.filter((m: any) => m?.name) : [];
  const tractionLines = pitch?.traction ? String(pitch.traction).split("\n").filter(Boolean) : [];
  const matchScore = Math.min(98, Math.max(62, 72 + (pitch?.stage === "REVENUE" ? 12 : 0) + (tractionLines.length * 4)));

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-24">
        <PageHeader
          eyebrow="Investor pitch view"
          title={pitch?.title || "Startup pitch"}
          subtitle={pitch?.one_liner || "Review founder, market, traction, and funding details in one clean view."}
          actions={
            <>
              <Button variant="outline" size="sm" className="h-9 rounded-lg border-border"><Bookmark className="h-3.5 w-3.5 mr-1.5" /> Bookmark</Button>
              <Button asChild size="sm" className="h-9 rounded-lg"><Link to="/messages"><MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Message founder</Link></Button>
              <Button variant="outline" size="sm" className="h-9 rounded-lg border-border"><Share2 className="h-3.5 w-3.5 mr-1.5" /> Share</Button>
            </>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Match score" value={`${matchScore}%`} icon={Star} tone="positive" hint="Fit with investor focus" />
          <StatCard label="Stage" value={pitch?.stage || "—"} icon={TrendingUp} tone="info" />
          <StatCard label="Funding ask" value={ask} icon={FileText} />
          <StatCard label="Views" value={pitch?.view_count || 0} icon={Eye} />
        </div>

        <SectionCard>
          <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusPill label="Approved" tone="positive" />
              {pitch?.stage && <span className="text-xs font-medium text-muted-foreground border border-border rounded-full px-2.5 py-1">{pitch.stage}</span>}
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> {authorProfile?.full_name || "Founder"}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
              <span className="ml-1 text-muted-foreground">Investor-ready profile</span>
            </div>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DetailSection title="Pitch overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Problem</p>
                  <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{pitch?.problem || "Problem statement not provided."}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Solution</p>
                  <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{pitch?.solution || "Solution summary not provided."}</p>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Market and traction">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-4"><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Market size</p><p className="text-sm font-medium text-foreground mt-1">{marketSize}</p></div>
                  <div className="rounded-lg border border-border p-4"><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Target market</p><p className="text-sm font-medium text-foreground mt-1">{targetMarket}</p></div>
                </div>
                {tractionLines.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tractionLines.map((line: string, i: number) => <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm text-foreground/85">{line}</div>)}
                  </div>
                )}
                {(competitors || advantage) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {competitors && <div><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Competitors</p><p className="text-sm text-foreground/85">{competitors}</p></div>}
                    {advantage && <div><p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Advantage</p><p className="text-sm text-foreground/85">{advantage}</p></div>}
                  </div>
                )}
              </div>
            </DetailSection>

            <DetailSection title="Fundraising">
              <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Funding ask</p>
                  <p className="text-xl font-semibold text-foreground mt-2">{ask}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Use of funds</p>
                  <p className="text-sm text-foreground/85 whitespace-pre-line">{useOfFunds || "Use of funds not specified."}</p>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Pitch deck">
              {deckSignedUrl ? (
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted mb-4">
                  <iframe src={deckSignedUrl} title="Pitch Deck" className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-center p-6 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">No deck attached</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask the founder to upload a deck for full review.</p>
                </div>
              )}
              <Button size="sm" variant="outline" className="rounded-lg border-border" disabled={!deckSignedUrl} onClick={() => deckSignedUrl && window.open(deckSignedUrl, "_blank")}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download deck
              </Button>
            </DetailSection>
          </div>

          <div className="space-y-6">
            <Card className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-muted/20"><h3 className="text-sm font-semibold text-foreground">Founder profile</h3></div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-semibold text-foreground">
                    {(authorProfile?.full_name || "F").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{authorProfile?.full_name || "Founder"}</p>
                    <p className="text-xs text-muted-foreground truncate">{authorProfile?.email || "Email not available"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full rounded-lg border-border"><Linkedin className="h-3.5 w-3.5 mr-1.5" /> View founder profile</Button>
              </div>
            </Card>

            {team.length > 0 && (
              <Card className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border bg-muted/20"><h3 className="text-sm font-semibold text-foreground">Team</h3></div>
                <div className="p-5 space-y-3">
                  {team.map((member: any, i: number) => (
                    <div key={i} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-semibold text-foreground">{member.name}</p>
                      {member.role && <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-muted/20"><h3 className="text-sm font-semibold text-foreground">Quick actions</h3></div>
              <div className="p-2 flex flex-col">
                <Button asChild variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium"><Link to="/messages"><MessageSquare className="h-3.5 w-3.5 mr-2" /> Message founder</Link></Button>
                <Button variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium"><Bookmark className="h-3.5 w-3.5 mr-2" /> Save pitch</Button>
                <Button variant="ghost" className="justify-start h-9 px-3 rounded-md text-[13px] font-medium"><Share2 className="h-3.5 w-3.5 mr-2" /> Share with partners</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}