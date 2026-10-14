import {
  ArrowUpRight,
  BrainCircuit,
  BriefcaseBusiness,
  Code2,
  Cpu,
  FlaskConical,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import type { NewsItem } from "@/lib/types";

const SOURCE_STYLE: Record<string, { mark: string; className: string }> = {
  "Hacker News": { mark: "Y", className: "tp-source-hn" },
  TechCrunch: { mark: "TC", className: "tp-source-tc" },
  "The Verge": { mark: "V", className: "tp-source-verge" },
  "Ars Technica": { mark: "ars", className: "tp-source-ars" },
  "VentureBeat AI": { mark: "VB", className: "tp-source-vb" },
};

const CATEGORY_ICONS = {
  AI: BrainCircuit,
  Startups: Rocket,
  Hardware: Cpu,
  Software: Code2,
  "Science & Tech": FlaskConical,
  Business: BriefcaseBusiness,
  Other: ShieldCheck,
};

export function SourceMark({ source }: { source: string }) {
  const style = SOURCE_STYLE[source] ?? { mark: source.slice(0, 2).toUpperCase(), className: "tp-source-default" };
  return <span className={`tp-source-mark ${style.className}`}>{style.mark}</span>;
}

function relativeTime(input: string): string {
  const timestamp = Date.parse(input);
  if (!Number.isFinite(timestamp)) return "Recently";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function visualClass(category: NewsItem["category"]): string {
  switch (category) {
    case "AI": return "tp-visual-ai";
    case "Startups": return "tp-visual-startups";
    case "Hardware": return "tp-visual-hardware";
    case "Software": return "tp-visual-software";
    case "Business": return "tp-visual-business";
    case "Science & Tech": return "tp-visual-science";
    default: return "tp-visual-default";
  }
}

export default function NewsCard({ item, compact = false }: { item: NewsItem; compact?: boolean }) {
  const CategoryIcon = CATEGORY_ICONS[item.category] ?? ShieldCheck;
  const sourceIsSafe = item.url.startsWith("https://") || item.url.startsWith("http://");

  return (
    <article className={`tp-news-card ${compact ? "tp-news-card-compact" : ""}`}>
      <div
        className={`tp-news-visual ${visualClass(item.category)}`}
        style={item.imageUrl ? { backgroundImage: `linear-gradient(180deg, rgba(8, 12, 27, 0.02), rgba(8, 12, 27, 0.34)), url("${item.imageUrl.replace(/"/g, "\\\"")}")` } : undefined}
        aria-hidden="true"
      >
        {!item.imageUrl && <CategoryIcon size={42} strokeWidth={1.35} />}
        <span className="tp-visual-glow" />
        <span className="tp-visual-kicker">{item.category === "Other" ? "TECH BRIEFING" : item.category.toUpperCase()}</span>
      </div>
      <div className="tp-news-card-copy">
        <div className="tp-news-source-line">
          <SourceMark source={item.source} />
          <span>{item.source}</span>
          <span className="tp-dot-separator">·</span>
          <span className="tp-muted">{relativeTime(item.publishedAt)}</span>
        </div>
        <h3 className="tp-news-card-title">
          {item.title}
        </h3>
        <p className="tp-news-card-summary">{item.summary}</p>
        <div className="tp-news-card-bottom">
          <div className="tp-tag-row">
            {(item.tags.length ? item.tags : [item.category]).slice(0, 3).map((tag) => (
              <span className="tp-tag" key={`${item.id}-${tag}`}>{tag}</span>
            ))}
          </div>
          {sourceIsSafe ? (
            <a className="tp-card-open" href={item.url} target="_blank" rel="noreferrer" aria-label={`Read ${item.title} at ${item.source}`}>
              <ArrowUpRight size={17} />
            </a>
          ) : <span className="tp-card-open tp-card-open-muted"><ArrowUpRight size={17} /></span>}
        </div>
      </div>
    </article>
  );
}
