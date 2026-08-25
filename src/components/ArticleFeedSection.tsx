import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare, ArrowUp, RefreshCw, Newspaper } from "lucide-react";
import { useArticleFeed, FeedAudience, FeedSource } from "@/hooks/useArticleFeed";

const SOURCE_STYLES: Record<FeedSource, { color: string; bg: string }> = {
  "Hacker News": { color: "text-[#ff6600]", bg: "border-[#ff6600]" },
  "Dev.to":      { color: "text-foreground", bg: "border-foreground" },
  "a16z":        { color: "text-[#0a0a0a]", bg: "border-foreground" },
  "Y Combinator":{ color: "text-[#ff6600]", bg: "border-[#ff6600]" },
  "Paul Graham": { color: "text-[#b87333]", bg: "border-[#b87333]" },
  "Indie Hackers":{ color: "text-[#0e2439]", bg: "border-[#0e2439]" },
  "First Round": { color: "text-foreground", bg: "border-foreground" },
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - Date.parse(iso);
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export default function ArticleFeedSection({
  audience,
  title = "Live Startup Feed",
  subtitle = "Real articles from Hacker News, a16z, Y Combinator, Dev.to & more",
}: {
  audience: FeedAudience;
  title?: string;
  subtitle?: string;
}) {
  const { items, loading } = useArticleFeed(audience);

  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Newspaper className="h-6 w-6" /> {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
      </div>

      {loading ? (
        <Card className="p-8 text-center border-2 border-foreground/20 rounded-2xl">
          <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">Fetching live posts…</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed border-foreground/20 rounded-2xl">
          <p className="text-sm font-bold text-muted-foreground">Feed sources are temporarily unavailable.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.slice(0, 12).map((it) => {
            const s = SOURCE_STYLES[it.source];
            return (
              <Card
                key={it.id}
                className="p-5 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex flex-col gap-3 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))]"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={`text-[10px] font-bold gap-1 ${s.bg} ${s.color}`}>
                    {it.source}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {timeAgo(it.publishedAt)}
                  </span>
                </div>

                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display font-extrabold text-base leading-snug hover:underline"
                >
                  {it.title}
                </a>

                {it.excerpt && (
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-3">
                    {it.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 mt-auto border-t-2 border-foreground/10">
                  <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[60%]">
                    {it.author ? `by ${it.author}` : it.source}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground">
                    {typeof it.points === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" /> {it.points}
                      </span>
                    )}
                    {typeof it.comments === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {it.comments}
                      </span>
                    )}
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      Read <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}