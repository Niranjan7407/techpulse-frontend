import { AudioLines, CalendarDays, Flame, Sparkles, Clock3, Newspaper, ArrowUpRight } from "lucide-react";
import type { HotSummaryData } from "@/lib/types";
import { SourceMark } from "./news-card";

function formattedDate(input: string, includeTime = false): string {
  const parsed = new Date(input);
  if (!input || Number.isNaN(parsed.getTime())) return "Latest crawl";
  return new Intl.DateTimeFormat("en", includeTime
    ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
    : { month: "short", day: "numeric" }).format(parsed);
}

export default function HotSummary({ summary, loading = false }: { summary: HotSummaryData | null; loading?: boolean }) {
  const articleCount = summary?.articleCount ?? 0;
  const allSources = summary?.sources ?? [];
  const sources = [...new Map(allSources.map((source) => [source.source, source])).values()];

  return (
    <section className={`tp-hero ${!summary ? "tp-hero-empty tp-hero-no-briefing" : ""}`} aria-labelledby="hot-summary-title">
      <div className="tp-hero-content">
        <div className="tp-hot-label"><Flame size={14} fill="currentColor" /> HOT SUMMARY <span className="tp-hot-spark"><Sparkles size={13} /></span></div>
        <p className="tp-hero-eyebrow">THE IMPORTANT SIGNALS FROM YOUR NEWS ROUNDUP</p>
        <h1 id="hot-summary-title" className="tp-hero-title">
          {summary?.title ?? (loading ? "Preparing your hourly briefing…" : "Your next briefing is on its way")}
        </h1>
        <p className="tp-hero-summary">
          {summary?.summary ?? "TechPulse combines articles collected from your tracked sources into one concise AI briefing. Run the ingestion job to generate the first summary."}
        </p>

        {summary?.keyDevelopments?.length ? (
          <div className="tp-summary-highlights" aria-label="Key developments">
            {summary.keyDevelopments.slice(0, 3).map((development, index) => (
              <div className="tp-summary-highlight" key={`${development.headline}-${index}`}>
                <span className="tp-summary-highlight-index">0{index + 1}</span>
                <div>
                  <strong>{development.headline}</strong>
                  <p>{development.summary}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {summary?.keyDevelopments?.some((development) => development.whyItMatters) ? (
          <div className="tp-why-matters"><Sparkles size={15} /><span><strong>Why it matters</strong> — {summary.keyDevelopments.find((development) => development.whyItMatters)?.whyItMatters}</span></div>
        ) : null}

        <div className="tp-hero-meta">
          <span><CalendarDays size={14} /> {summary ? formattedDate(summary.windowStart || summary.generatedAt) : "Hourly collection window"}</span>
          <span className="tp-hero-meta-dot">·</span>
          <span><Newspaper size={14} /> {summary ? `${articleCount} articles considered` : "Compiled from multiple sources"}</span>
          <span className="tp-hero-meta-dot">·</span>
          <span><Clock3 size={14} /> {summary ? `Updated ${formattedDate(summary.generatedAt, true)}` : "Waiting for ingestion"}</span>
        </div>
        <div className="tp-hero-actions">
          {sources.length ? (
            <div className="tp-hero-sources" aria-label="Sources included">
              {sources.slice(0, 5).map((source) => (
                <a key={source.id} className="tp-hero-source-chip" href={source.url} target="_blank" rel="noreferrer" title={`${source.source}: ${source.title}`}>
                  <SourceMark source={source.source} /> <span>{source.source}</span> <ArrowUpRight size={11} />
                </a>
              ))}
            </div>
          ) : (
            <span className="tp-ai-note"><AudioLines size={15} /> {summary ? "AI-generated hourly brief" : "One briefing, many stories"}</span>
          )}
          {summary && <span className="tp-ai-note tp-briefing-generated"><Sparkles size={14} /> Synthesized by AI</span>}
        </div>
      </div>
      <div className="tp-hero-art" aria-hidden="true">
        <div className="tp-orbit tp-orbit-one" />
        <div className="tp-orbit tp-orbit-two" />
        <div className="tp-orbit tp-orbit-three" />
        <div className="tp-hero-glass-card">
          <div className="tp-hero-glass-top"><span /><span /><span /></div>
          <div className="tp-hero-emblem"><Sparkles size={68} strokeWidth={1.3} /></div>
          <div className="tp-hero-art-label">HOURLY SIGNAL / AI</div>
        </div>
        <div className="tp-hero-orb tp-hero-orb-a" />
        <div className="tp-hero-orb tp-hero-orb-b" />
      </div>
    </section>
  );
}
