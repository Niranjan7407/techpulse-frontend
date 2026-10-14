import type {
  HotSummaryData,
  HotSummaryDevelopment,
  HotSummarySource,
  NewsCategory,
  NewsItem,
} from "./types";

const DEFAULT_API_URL = "/api/news";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function firstString(record: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function firstNumber(record: UnknownRecord, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const raw = record[key];
    if (raw !== null && raw !== undefined && raw !== "") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
}

function stringArray(value: unknown, limit = 8): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === "string" ? item : "")
      .filter(Boolean)
      .slice(0, limit);
  }
  if (typeof value === "string") return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean).slice(0, limit);
  return [];
}

function normalizeSource(raw: string): string {
  const value = raw.toLowerCase();
  if (value.includes("hacker") || value.includes("ycombinator")) return "Hacker News";
  if (value.includes("techcrunch")) return "TechCrunch";
  if (value.includes("verge")) return "The Verge";
  if (value.includes("ars technica") || value.includes("arstechnica")) return "Ars Technica";
  if (value.includes("venturebeat") || value.includes("venture beat")) return "VentureBeat AI";
  return raw || "Unknown source";
}

function normalizeCategory(item: UnknownRecord, tags: string[]): NewsCategory | "Other" {
  const explicit = firstString(item, ["category", "topic", "section"]).toLowerCase();
  // The current PostgreSQL schema doesn't store topics yet, so infer them from the article text.
  const articleText = `${firstString(item, ["title", "headline"])} ${firstString(item, ["summary", "website_summary", "description"])}`;
  const all = `${explicit} ${tags.join(" ")} ${articleText}`.toLowerCase();
  if (all.includes("startup") || all.includes("funding")) return "Startups";
  if (all.includes("hardware") || all.includes("chip") || all.includes("gpu")) return "Hardware";
  if (all.includes("software") || all.includes("developer") || all.includes("programming")) return "Software";
  if (all.includes("business") || all.includes("market") || all.includes("revenue")) return "Business";
  if (all.includes("science") || all.includes("research")) return "Science & Tech";
  if (all.includes("ai") || all.includes("llm") || all.includes("machine learning")) return "AI";
  return "Other";
}

function inferImportanceScore(record: UnknownRecord): number {
  const text = `${firstString(record, ["title", "headline"])} ${firstString(record, ["summary", "website_summary", "description"])}`.toLowerCase();
  let score = 35;
  if (/security breach|critical vulnerability|zero.day|exploit|major outage|antitrust|acquisition|acquires|raises? \$|series [a-f] funding|lawsuit|ban(ned)?|recall/.test(text)) score += 28;
  if (/announc|launch|release|unveil|introduc|open.sourc|partnership|funding|raises|research breakthrough|model/.test(text)) score += 12;
  if (/ai|artificial intelligence|llm|nvidia|openai|google|microsoft|apple|meta|anthropic|amd|intel/.test(text)) score += 9;
  if (/developer|programming|browser|operating system|chip|gpu|cloud|robotics|quantum/.test(text)) score += 5;
  if (/opinion|review|rumou?r|sponsored|roundup/.test(text)) score -= 8;
  return Math.max(15, Math.min(96, score));
}

function normalizeItem(value: unknown, index: number): NewsItem | null {
  const record = asRecord(value);
  if (!record) return null;

  const title = firstString(record, ["title", "headline", "name"]);
  if (!title) return null;

  const nestedSource = asRecord(record.source);
  const sourceValue = firstString(record, ["source", "publisher", "site", "sourceName", "source_name", "source_domain", "sourceDomain"]);
  const source = normalizeSource(sourceValue || (nestedSource ? firstString(nestedSource, ["name", "title", "domain"]) : ""));
  const tags = stringArray(record.tags ?? record.topics ?? record.keywords ?? record.categories, 5);
  const publishedAt = firstString(record, ["publishedAt", "published_at", "pubDate", "published", "createdAt", "created_at", "date"]);
  const summary = firstString(record, ["summary", "aiSummary", "ai_summary", "website_summary", "description", "excerpt", "content"]);
  const whyItMatters = firstString(record, ["whyItMatters", "why_it_matters", "impact"]);
  const imageUrl = firstString(record, ["imageUrl", "image_url", "thumbnail", "image"]);
  const url = firstString(record, ["url", "link", "sourceUrl", "source_url", "canonicalUrl", "article_url", "articleUrl"]);

  return {
    id: firstString(record, ["id", "_id", "guid"]) || url || `story-${index}`,
    title,
    summary: summary || "Open the original story for more details.",
    ...(whyItMatters ? { whyItMatters } : {}),
    source,
    url: url || "#",
    publishedAt: publishedAt || new Date().toISOString(),
    ...(imageUrl ? { imageUrl } : {}),
    tags,
    category: normalizeCategory(record, tags),
    importanceScore: firstNumber(record, ["importanceScore", "importance_score", "score", "points"], inferImportanceScore(record)) || inferImportanceScore(record),
  };
}

export function normalizeNewsResponse(payload: unknown): NewsItem[] {
  if (Array.isArray(payload)) return payload.map(normalizeItem).filter((item): item is NewsItem => item !== null);

  const record = asRecord(payload);
  if (!record) return [];

  for (const candidate of [record.articles, record.news, record.items, record.results, record.data]) {
    if (Array.isArray(candidate)) return candidate.map(normalizeItem).filter((item): item is NewsItem => item !== null);
    const nested = asRecord(candidate);
    if (nested) {
      for (const nestedValue of [nested.articles, nested.news, nested.items, nested.results]) {
        if (Array.isArray(nestedValue)) return nestedValue.map(normalizeItem).filter((item): item is NewsItem => item !== null);
      }
    }
  }
  return [];
}

function normalizeSummarySource(value: unknown, index: number): HotSummarySource | null {
  const record = asRecord(value);
  if (!record) return null;
  const url = firstString(record, ["url", "article_url", "articleUrl", "sourceUrl", "source_url", "link"]);
  const title = firstString(record, ["title", "headline"]) || url || `Source ${index + 1}`;
  const sourceValue = firstString(record, ["source", "source_domain", "sourceDomain", "publisher", "domain", "name"]);
  return {
    id: firstString(record, ["id", "article_id", "articleId"]) || url || `source-${index}`,
    title,
    source: normalizeSource(sourceValue),
    url: url || "#",
  };
}

function normalizeDevelopment(value: unknown, index: number, sources: HotSummarySource[]): HotSummaryDevelopment | null {
  const record = asRecord(value);
  if (!record) return null;
  const headline = firstString(record, ["headline", "title", "name"]);
  const summary = firstString(record, ["summary", "description", "detail"]);
  if (!headline && !summary) return null;
  const articleIds = stringArray(record.articleIds ?? record.article_ids ?? record.sourceArticleIds ?? record.source_article_ids, 20);
  const developmentSources = Array.isArray(record.sources)
    ? record.sources.map(normalizeSummarySource).filter((item): item is HotSummarySource => item !== null)
    : sources.filter((source) => articleIds.includes(source.id));
  const whyItMatters = firstString(record, ["whyItMatters", "why_it_matters", "impact"]);
  return {
    headline: headline || `Key development ${index + 1}`,
    summary: summary || "See the linked original sources for details.",
    ...(whyItMatters ? { whyItMatters } : {}),
    articleIds,
    sources: developmentSources,
  };
}

export function normalizeHotSummaryResponse(payload: unknown): HotSummaryData | null {
  const envelope = asRecord(payload);
  if (!envelope) return null;
  const candidate = envelope.hot_summary ?? envelope.hotSummary ?? envelope.briefing ?? envelope.summary ?? envelope;
  const record = asRecord(candidate);
  if (!record) return null; // Legacy API returned an array of articles, not a synthesized briefing.

  const title = firstString(record, ["title", "headline"]);
  const summary = firstString(record, ["summary", "text", "briefing"]);
  if (!title || !summary) return null;

  const sourceValues = Array.isArray(record.sources) ? record.sources : [];
  const sources = sourceValues.map(normalizeSummarySource).filter((item): item is HotSummarySource => item !== null);
  const developmentValues = record.keyDevelopments ?? record.key_developments ?? record.developments ?? record.highlights;
  const keyDevelopments = Array.isArray(developmentValues)
    ? developmentValues.map((item, index) => normalizeDevelopment(item, index, sources)).filter((item): item is HotSummaryDevelopment => item !== null)
    : [];

  return {
    id: firstString(record, ["id"]) || "latest",
    title,
    summary,
    windowStart: firstString(record, ["windowStart", "window_start", "periodStart", "period_start"]),
    windowEnd: firstString(record, ["windowEnd", "window_end", "periodEnd", "period_end"]),
    generatedAt: firstString(record, ["generatedAt", "generated_at", "created_at"]) || new Date().toISOString(),
    articleCount: firstNumber(record, ["articleCount", "article_count", "storiesConsidered", "stories_considered"]),
    keyDevelopments,
    sources,
  };
}

export function getNewsApiUrl(): string {
  return process.env.NEXT_PUBLIC_NEWS_API_URL?.trim() || DEFAULT_API_URL;
}

function getHotSummaryApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_HOT_SUMMARY_API_URL?.trim();
  if (configured) return configured;
  const endpoint = getNewsApiUrl();
  const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL(endpoint, base);
  url.search = "";
  url.hash = "";
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/hot-summary`;
  return url.toString();
}

export async function fetchNews(signal?: AbortSignal): Promise<NewsItem[]> {
  const endpoint = getNewsApiUrl();
  const url = new URL(endpoint, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  if (!url.searchParams.has("sort")) url.searchParams.set("sort", "recent");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`News API returned ${response.status}`);
  return normalizeNewsResponse(await response.json());
}

export async function fetchHotSummary(signal?: AbortSignal): Promise<HotSummaryData | null> {
  const response = await fetch(getHotSummaryApiUrl(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`Hot Summary API returned ${response.status}`);
  return normalizeHotSummaryResponse(await response.json());
}
