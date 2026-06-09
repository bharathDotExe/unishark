import { useEffect, useState } from "react";

export type FeedSource =
  | "Hacker News"
  | "Dev.to"
  | "a16z"
  | "Y Combinator"
  | "Paul Graham"
  | "Indie Hackers"
  | "First Round";

export type FeedItem = {
  id: string;
  source: FeedSource;
  title: string;
  url: string;
  author?: string;
  excerpt?: string;
  publishedAt?: string;
  thumbnail?: string;
  points?: number;
  comments?: number;
};

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";

async function fetchRss(source: FeedSource, url: string, limit = 4): Promise<FeedItem[]> {
  try {
    const r = await fetch(`${RSS2JSON}${encodeURIComponent(url)}`);
    if (!r.ok) return [];
    const json = await r.json();
    const items = (json.items || []).slice(0, limit);
    return items.map((it: any, i: number): FeedItem => ({
      id: `${source}-${it.guid || it.link || i}`,
      source,
      title: it.title,
      url: it.link,
      author: it.author || json.feed?.title || source,
      excerpt: (it.description || "").replace(/<[^>]+>/g, "").slice(0, 200),
      publishedAt: it.pubDate,
      thumbnail: it.thumbnail || it.enclosure?.link,
    }));
  } catch {
    return [];
  }
}

async function fetchHackerNews(limit = 6): Promise<FeedItem[]> {
  try {
    const idsRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    const ids: number[] = await idsRes.json();
    const top = ids.slice(0, limit);
    const items = await Promise.all(
      top.map(async (id) => {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return r.json();
      })
    );
    return items
      .filter((it) => it && it.title)
      .map((it: any): FeedItem => ({
        id: `hn-${it.id}`,
        source: "Hacker News",
        title: it.title,
        url: it.url || `https://news.ycombinator.com/item?id=${it.id}`,
        author: it.by,
        publishedAt: new Date(it.time * 1000).toISOString(),
        points: it.score,
        comments: it.descendants,
      }));
  } catch {
    return [];
  }
}

async function fetchDevTo(tag: string, limit = 4): Promise<FeedItem[]> {
  try {
    const r = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=${limit}&top=7`);
    if (!r.ok) return [];
    const items = await r.json();
    return items.map((it: any): FeedItem => ({
      id: `dev-${it.id}`,
      source: "Dev.to",
      title: it.title,
      url: it.url,
      author: it.user?.name,
      excerpt: it.description,
      publishedAt: it.published_at,
      thumbnail: it.cover_image || it.social_image,
      points: it.public_reactions_count,
      comments: it.comments_count,
    }));
  } catch {
    return [];
  }
}

export type FeedAudience = "investor" | "student";

export function useArticleFeed(audience: FeedAudience) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const tasks =
      audience === "investor"
        ? [
            fetchHackerNews(6),
            fetchRss("a16z", "https://a16z.com/feed/", 3),
            fetchRss("Y Combinator", "https://www.ycombinator.com/blog/rss", 3),
            fetchRss("Paul Graham", "http://www.aaronsw.com/2002/feeds/pgessays.rss", 2),
          ]
        : [
            fetchDevTo("startup", 4),
            fetchDevTo("entrepreneur", 3),
            fetchHackerNews(4),
            fetchRss("Indie Hackers", "https://www.indiehackers.com/feed.xml", 3),
            fetchRss("Y Combinator", "https://www.ycombinator.com/blog/rss", 2),
          ];

    Promise.all(tasks).then((all) => {
      if (!alive) return;
      const merged = all.flat();
      // shuffle by published date desc when available
      merged.sort((a, b) => {
        const da = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const db = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return db - da;
      });
      setItems(merged);
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [audience]);

  return { items, loading };
}