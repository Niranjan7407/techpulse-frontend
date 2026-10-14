import { Activity, ArrowUpRight, Clock3, RadioTower } from "lucide-react";
import { SourceMark } from "./news-card";
import type { NewsItem } from "@/lib/types";

const PREFERRED_SOURCES = ["Hacker News", "TechCrunch", "The Verge", "Ars Technica", "VentureBeat AI"];

function displayUpdatedAt(input: string | null): string {
  if (!input) return "Waiting for first sync";
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(parsed);
}

export default function SourcePanel({ items, lastUpdated, isDemo, onSourceSelect }: {
  items: NewsItem[];
  lastUpdated: string | null;
  isDemo: boolean;
  onSourceSelect: (source: string) => void;
}) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
  const sortedSources = [...PREFERRED_SOURCES].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
  const totalSources = new Set(items.map((item) => item.source)).size;

  return (
    <aside className="tp-right-rail" aria-label="News activity and sources">
      <section className="tp-panel tp-source-panel">
        <div className="tp-panel-heading"><div><span className="tp-panel-overline">YOUR SIGNAL FEED</span><h2>Top sources</h2></div><RadioTower size={17} /></div>
        <div className="tp-source-list">
          {sortedSources.map((source) => (
            <button className="tp-source-row" onClick={() => onSourceSelect(source)} key={source} type="button">
              <SourceMark source={source} />
              <span className="tp-source-row-name">{source}</span>
              <span className="tp-source-count">{counts.get(source) ?? 0}</span>
              <ArrowUpRight className="tp-source-arrow" size={14} />
            </button>
          ))}
        </div>
        <div className="tp-panel-footer"><span>Tracked publications</span><span>{totalSources} active</span></div>
      </section>

      <section className="tp-panel tp-activity-panel">
        <div className="tp-panel-heading"><div><span className="tp-panel-overline">YOUR DAILY BRIEF</span><h2>Feed activity</h2></div><Activity size={17} /></div>
        <div className="tp-stat-grid">
          <div className="tp-stat"><span className="tp-stat-icon"><RadioTower size={16} /></span><div><span className="tp-stat-label">Stories loaded</span><strong>{items.length.toString().padStart(2, "0")}</strong></div></div>
          <div className="tp-stat"><span className="tp-stat-icon"><Clock3 size={16} /></span><div><span className="tp-stat-label">Last sync</span><strong className="tp-stat-time">{displayUpdatedAt(lastUpdated)}</strong></div></div>
        </div>
        <div className={`tp-sync-status ${isDemo ? "tp-sync-demo" : ""}`}><span className="tp-status-dot" />{isDemo ? "Preview data · API not connected" : "Feed connected and ready"}</div>
      </section>

      <div className="tp-rail-note"><span className="tp-rail-note-icon"><Activity size={17} /></span><div><strong>Stay ahead of the signal</strong><p>One concise briefing for the stories shaping tech.</p></div></div>
    </aside>
  );
}
