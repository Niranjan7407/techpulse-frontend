export type NewsCategory =
  | "AI"
  | "Startups"
  | "Hardware"
  | "Software"
  | "Science & Tech"
  | "Business";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  whyItMatters?: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  category: NewsCategory | "Other";
  importanceScore: number;
};

export type HotSummarySource = {
  id: string;
  title: string;
  source: string;
  url: string;
};

export type HotSummaryDevelopment = {
  headline: string;
  summary: string;
  whyItMatters?: string;
  articleIds: string[];
  sources: HotSummarySource[];
};

export type HotSummaryData = {
  id: string;
  title: string;
  summary: string;
  windowStart: string;
  windowEnd: string;
  generatedAt: string;
  articleCount: number;
  keyDevelopments: HotSummaryDevelopment[];
  sources: HotSummarySource[];
};

export type ApiConnectionStatus = "loading" | "live" | "demo" | "error";
