import type { HotSummaryData, NewsItem } from "./types";

// Clearly labeled preview stories used only when the configured API is unavailable.
// Replace these examples with live stories by setting NEXT_PUBLIC_NEWS_API_URL.
export const DEMO_NEWS: NewsItem[] = [
  {
    id: "demo-ai-agents",
    title: "AI agents are moving from experiments into everyday developer workflows",
    summary:
      "A new wave of developer tools is focusing on agents that can plan multi-step work, use tools, and keep humans in the loop for important decisions.",
    whyItMatters:
      "Teams are starting to measure AI by the work it reliably completes, not just the quality of its answers.",
    source: "TechCrunch",
    url: "https://techcrunch.com/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    tags: ["AI", "Developers", "Productivity"],
    category: "AI",
    importanceScore: 98,
  },
  {
    id: "demo-open-source-models",
    title: "Open model releases make local AI workflows more practical",
    summary:
      "Smaller, efficient models are giving developers more options to prototype assistants locally, control their data, and manage inference costs.",
    source: "Hacker News",
    url: "https://news.ycombinator.com/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tags: ["AI", "Open Source", "LLMs"],
    category: "AI",
    importanceScore: 91,
  },
  {
    id: "demo-chip-design",
    title: "Chipmakers look for new ways to improve AI inference efficiency",
    summary:
      "Hardware teams are balancing memory bandwidth, power consumption, and accelerator design as inference workloads continue to diversify.",
    source: "The Verge",
    url: "https://www.theverge.com/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    tags: ["Hardware", "AI", "Chips"],
    category: "Hardware",
    importanceScore: 86,
  },
  {
    id: "demo-startup-funding",
    title: "Early-stage startups rethink what a lean AI team can build",
    summary:
      "Founders are pairing smaller teams with AI-assisted development, while investors put more emphasis on retention, margins, and defensible distribution.",
    source: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    tags: ["Startups", "Funding", "AI"],
    category: "Startups",
    importanceScore: 80,
  },
  {
    id: "demo-browser-security",
    title: "Browser vendors expand built-in protections against tracking",
    summary:
      "Privacy features are increasingly being designed into default browser settings, changing how websites handle identifiers and analytics.",
    source: "Ars Technica",
    url: "https://arstechnica.com/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    tags: ["Software", "Privacy", "Security"],
    category: "Software",
    importanceScore: 73,
  },
  {
    id: "demo-cloud-costs",
    title: "Cloud teams revisit infrastructure costs as AI workloads grow",
    summary:
      "Engineering leaders are reviewing utilization, caching, and workload placement to keep model serving and data processing bills predictable.",
    source: "TechCrunch",
    url: "https://techcrunch.com/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    tags: ["Cloud", "Business", "Infrastructure"],
    category: "Business",
    importanceScore: 69,
  },
  {
    id: "demo-web-platform",
    title: "Web platform tooling keeps pushing toward faster feedback loops",
    summary:
      "Framework and browser-tooling teams continue to optimize local development, debugging, and performance measurement for modern web apps.",
    source: "Hacker News",
    url: "https://news.ycombinator.com/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    tags: ["Web Dev", "Tools", "Performance"],
    category: "Software",
    importanceScore: 64,
  },
  {
    id: "demo-research",
    title: "Researchers explore more efficient ways to evaluate AI systems",
    summary:
      "Evaluation work is moving beyond single benchmarks toward tests that measure reliability, tool use, and performance under realistic constraints.",
    source: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    tags: ["Research", "AI", "Evaluation"],
    category: "Science & Tech",
    importanceScore: 61,
  },
];

export const DEMO_HOT_SUMMARY: HotSummaryData = {
  id: "demo-hourly-briefing",
  title: "The biggest technology signals to know right now",
  summary:
    "Across the current tech cycle, AI tools are moving toward practical, multi-step work while hardware teams focus on the cost of running those systems. Meanwhile, software teams are emphasizing faster developer feedback and more careful evaluation. Taken together, the signal is a shift from impressive demos toward products that are reliable, efficient, and useful in everyday workflows.",
  windowStart: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  windowEnd: new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  articleCount: 8,
  sources: [
    { id: "demo-source-1", title: "AI agents in developer workflows", source: "TechCrunch", url: "https://techcrunch.com/" },
    { id: "demo-source-2", title: "Open model releases", source: "Hacker News", url: "https://news.ycombinator.com/" },
    { id: "demo-source-3", title: "AI inference hardware", source: "The Verge", url: "https://www.theverge.com/" },
  ],
  keyDevelopments: [
    {
      headline: "AI products are shifting toward practical workflows",
      summary: "Tools are increasingly judged on whether they can complete useful multi-step work with clear human oversight.",
      whyItMatters: "Reliability and integration may matter more than isolated benchmark gains for adoption.",
      articleIds: ["demo-source-1"],
      sources: [{ id: "demo-source-1", title: "AI agents in developer workflows", source: "TechCrunch", url: "https://techcrunch.com/" }],
    },
    {
      headline: "Efficiency remains a core constraint for AI infrastructure",
      summary: "Model size, memory bandwidth, and inference cost continue to shape how AI systems are built and deployed.",
      articleIds: ["demo-source-3"],
      sources: [{ id: "demo-source-3", title: "AI inference hardware", source: "The Verge", url: "https://www.theverge.com/" }],
    },
  ],
};
