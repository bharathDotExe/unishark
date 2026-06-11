import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Flame, RefreshCw, Rocket, ArrowUp } from "lucide-react";

type PHItem = {
  id: string;
  title: string;
  tagline: string;
  url: string;
  thumbnail?: string;
  publishedAt?: string;
  author?: string;
};

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
const PH_FEED = "https://www.producthunt.com/feed?category=undefined";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - Date.parse(iso);
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function extractImage(html: string): string | undefined {
  const m = html?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1];
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export default function ProductHuntSection() {
  const [items, setItems] = useState<PHItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${RSS2JSON}${encodeURIComponent(PH_FEED)}`);
        const json = await r.json();
        const list: PHItem[] = (json.items || []).slice(0, 8).map((it: any, i: number) => {
          const desc = it.description || it.content || "";
          const tagline = stripHtml(desc).slice(0, 160);
          const thumb = it.thumbnail || it.enclosure?.link || extractImage(desc);
          return {
            id: `ph-${it.guid || it.link || i}`,
            title: it.title,
            tagline,
            url: it.link,
            thumbnail: thumb,
            publishedAt: it.pubDate,
            author: it.author,
          };
        });
        if (alive) setItems(list);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-2xl font-display font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Rocket className="h-6 w-6 text-[#da552f]" /> Trending on Product Hunt
        </h3>
        <a
          href="https://www.producthunt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          producthunt.com <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {loading ? (
        <Card className="p-8 text-center border-2 border-foreground/20 rounded-2xl">
          <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin mx-auto mb-2" />
          <p className="text-sm font-semibold text-muted-foreground">Loading today's launches…</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed border-foreground/20 rounded-2xl">
          <p className="text-sm font-bold text-muted-foreground">Product Hunt feed temporarily unavailable.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((p, idx) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="p-5 border-2 border-foreground bg-card shadow-[4px_4px_0_0_hsl(var(--foreground))] rounded-2xl flex gap-4 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] h-full">
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    loading="lazy"
                    className="h-20 w-20 rounded-xl object-cover border-2 border-foreground/10 flex-shrink-0"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-[#da552f]/10 border-2 border-[#da552f]/30 flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-8 w-8 text-[#da552f]" />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold border-[#da552f] text-[#da552f] gap-1">
                      <Flame className="h-2.5 w-2.5" /> #{idx + 1}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {timeAgo(p.publishedAt)}
                    </span>
                  </div>
                  <h4 className="font-display font-extrabold text-base leading-tight truncate group-hover:underline">
                    {p.title}
                  </h4>
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-2">
                    {p.tagline}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground mt-auto pt-1">
                    <span className="inline-flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" /> Upvote
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:text-foreground">
                      View launch <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}