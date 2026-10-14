"use client";

import {
  Activity,
  ArrowDownUp,
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  Cpu,
  Flame,
  FlaskConical,
  Home,
  Menu,
  Newspaper,
  RefreshCw,
  Rocket,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Moon,
  X,
  Code2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import HotSummary from "./hot-summary";
import NewsCard from "./news-card";
import SourcePanel from "./source-panel";
import { DEMO_HOT_SUMMARY, DEMO_NEWS } from "@/lib/demo-news";
import { fetchHotSummary, fetchNews } from "@/lib/news-api";
import type { ApiConnectionStatus, HotSummaryData, NewsCategory, NewsItem } from "@/lib/types";

type NavItem = { label: string; icon: typeof Home; category?: NewsCategory | "All"; section?: "trending" };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", icon: Home, category: "All" },
  { label: "All news", icon: Newspaper, category: "All" },
  { label: "Trending", icon: Flame, section: "trending" },
  { label: "AI & LLMs", icon: BrainCircuit, category: "AI" },
  { label: "Startups", icon: Rocket, category: "Startups" },
  { label: "Hardware", icon: Cpu, category: "Hardware" },
  { label: "Software", icon: Code2, category: "Software" },
  { label: "Science & tech", icon: FlaskConical, category: "Science & Tech" },
  { label: "Business", icon: BriefcaseBusiness, category: "Business" },
];

const CATEGORY_TABS: Array<{ label: string; value: NewsCategory | "All" }> = [
  { label: "All stories", value: "All" },
  { label: "AI", value: "AI" },
  { label: "Startups", value: "Startups" },
  { label: "Hardware", value: "Hardware" },
  { label: "Software", value: "Software" },
  { label: "Business", value: "Business" },
];

const PREFERRED_SOURCES = ["Hacker News", "TechCrunch", "The Verge", "Ars Technica", "VentureBeat AI"];

function formatLastUpdated(input: string | null): string {
  if (!input) return "Waiting for sync";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export default function TechPulseDashboard() {
  const [items, setItems] = useState<NewsItem[]>(DEMO_NEWS);
  const [hotSummary, setHotSummary] = useState<HotSummaryData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ApiConnectionStatus>("loading");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<NewsCategory | "All">("All");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("Home");
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadNews = useCallback(async (signal?: AbortSignal) => {
    setIsRefreshing(true);
    try {
      const liveNews = await fetchNews(signal);
      if (signal?.aborted) return;
      setItems(liveNews);
      setConnectionStatus("live");
      setLastUpdated(new Date().toISOString());
      try {
        const liveSummary = await fetchHotSummary(signal);
        if (!signal?.aborted) setHotSummary(liveSummary);
      } catch (summaryError) {
        if (!signal?.aborted) setHotSummary(null);
        console.info("TechPulse: the news feed is available, but no synthesized Hot Summary could be loaded.", summaryError);
      }
    } catch (error) {
      if (signal?.aborted) return;
      console.info("TechPulse: showing preview content because the configured news API could not be reached.", error);
      setItems(DEMO_NEWS);
      setHotSummary(DEMO_HOT_SUMMARY);
      setConnectionStatus("demo");
      setLastUpdated(null);
    } finally {
      if (!signal?.aborted) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadNews(controller.signal);
    return () => controller.abort();
  }, [loadNews]);

  useEffect(() => {
    const stored = window.localStorage.getItem("techpulse-theme");
    if (stored === "dark" || stored === "light") setTheme(stored);
    document.documentElement.dataset.theme = stored === "light" ? "light" : "dark";
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem("techpulse-theme", next);
    document.documentElement.dataset.theme = next;
  };

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = items.filter((item) => {
      const searchable = `${item.title} ${item.summary} ${item.whyItMatters ?? ""} ${item.source} ${item.tags.join(" ")} ${item.category}`.toLowerCase();
      const categoryMatches = category === "All" || item.category === category || item.tags.some((tag) => tag.toLowerCase() === category.toLowerCase());
      const sourceMatches = !selectedSource || item.source === selectedSource;
      return categoryMatches && sourceMatches && (!query || searchable.includes(query));
    });
    if (trendingOnly) return [...matches].sort((a, b) => b.importanceScore - a.importanceScore);
    return matches;
  }, [items, search, category, selectedSource, trendingOnly]);

  const feedItems = visibleItems;
  const isDemo = connectionStatus === "demo" || connectionStatus === "error";

  const chooseNav = (item: NavItem) => {
    setActiveNav(item.label);
    setCategory(item.category ?? "All");
    setTrendingOnly(item.section === "trending");
    setSelectedSource(null);
    setMobileMenuOpen(false);
  };

  const chooseSource = (source: string) => {
    setSelectedSource((current) => current === source ? null : source);
    setActiveNav("All news");
    setCategory("All");
    setTrendingOnly(false);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSelectedSource(null);
    setTrendingOnly(false);
    setActiveNav("Home");
  };

  return (
    <div className="tp-app-shell" data-theme={theme}>
      <aside className={`tp-sidebar ${mobileMenuOpen ? "tp-sidebar-open" : ""}`}>
        <a className="tp-brand" href="#home" onClick={clearFilters} aria-label="TechPulse home">
          <span className="tp-brand-mark"><Activity size={22} strokeWidth={2.7} /></span>
          <span>Tech<span>Pulse</span></span>
          <span className="tp-brand-ai">AI</span>
        </a>
        <div className="tp-mobile-sidebar-top">
          <span>Navigation</span>
          <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="tp-main-nav" aria-label="Main navigation">
          <span className="tp-nav-caption">DISCOVER</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.label;
            return (
              <button className={`tp-nav-item ${active ? "tp-nav-item-active" : ""}`} type="button" key={item.label} onClick={() => chooseNav(item)} aria-current={active ? "page" : undefined}>
                <Icon size={18} strokeWidth={active ? 2.3 : 1.8} /><span>{item.label}</span>
                {item.label === "Trending" && <span className="tp-nav-hot-dot" />}
              </button>
            );
          })}
        </nav>
        <div className="tp-sidebar-divider" />
        <div className="tp-sidebar-sources">
          <div className="tp-sidebar-section-heading"><span className="tp-nav-caption">SOURCES</span><ChevronDown size={14} /></div>
          {PREFERRED_SOURCES.map((source) => {
            const count = items.filter((item) => item.source === source).length;
            const sourceInitial = source === "Hacker News" ? "Y" : source === "TechCrunch" ? "TC" : source === "The Verge" ? "V" : source === "Ars Technica" ? "ars" : "VB";
            const sourceClass = source === "Hacker News" ? "tp-source-hn" : source === "TechCrunch" ? "tp-source-tc" : source === "The Verge" ? "tp-source-verge" : source === "Ars Technica" ? "tp-source-ars" : "tp-source-vb";
            return (
              <button type="button" className={`tp-sidebar-source ${selectedSource === source ? "tp-sidebar-source-active" : ""}`} key={source} onClick={() => chooseSource(source)}>
                <span className={`tp-source-mark ${sourceClass}`}>{sourceInitial}</span><span>{source}</span><small>{count > 0 ? count : "—"}</small>
              </button>
            );
          })}
        </div>
        <div className="tp-sidebar-bottom">
          <div className="tp-sidebar-callout"><span className="tp-callout-icon"><Sparkles size={18} /></span><div><strong>Less noise.<br />More signal.</strong><span>Your daily tech briefing.</span></div></div>
          <button className="tp-sidebar-utility" type="button" onClick={() => window.open("https://github.com/", "_blank", "noopener,noreferrer")}><CircleHelp size={16} /> Help & feedback <ArrowRight size={14} /></button>
          <div className="tp-sidebar-profile"><span className="tp-profile-avatar">TP</span><span><strong>TechPulse Reader</strong><small>Personal briefing</small></span><Settings2 size={16} className="tp-profile-settings" /></div>
        </div>
      </aside>

      {mobileMenuOpen && <button className="tp-mobile-scrim" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} />}

      <main className="tp-main" id="home">
        <header className="tp-topbar">
          <button className="tp-menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
          <div className="tp-search-wrap"><Search size={18} /><input aria-label="Search latest tech news" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search latest tech news..." /><kbd>⌘ K</kbd>{search && <button type="button" className="tp-clear-search" onClick={() => setSearch("")} aria-label="Clear search"><X size={15} /></button>}</div>
          <div className="tp-topbar-right"><span className={`tp-live-indicator ${isDemo ? "tp-live-indicator-demo" : ""}`} /><span className="tp-live-label">{connectionStatus === "loading" ? "Connecting" : isDemo ? "Preview mode" : "Live feed"}</span><span className="tp-topbar-divider" /><span className="tp-updated-text">Updated {formatLastUpdated(lastUpdated)}</span><button className="tp-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button><button className={`tp-refresh-button ${isRefreshing ? "tp-refreshing" : ""}`} type="button" onClick={() => void loadNews()} disabled={isRefreshing} aria-label="Refresh news"><RefreshCw size={16} /></button></div>
        </header>

        <div className="tp-main-inner">
          {isDemo && connectionStatus !== "loading" && (
            <div className="tp-demo-banner"><Sparkles size={15} /><span>You're viewing preview stories. Connect your news API in <code>.env.local</code> to show live summaries.</span><button type="button" onClick={() => void loadNews()}><RefreshCw size={13} /> Retry</button></div>
          )}

          <HotSummary summary={hotSummary} loading={connectionStatus === "loading"} />

          <section className="tp-feed-layout" aria-label="Latest news feed">
            <div className="tp-feed-main">
              <div className="tp-section-heading-row">
                <div><span className="tp-section-kicker">CURATED FOR YOU</span><h2>Latest tech news <span className="tp-count-pill">{visibleItems.length}</span></h2><p>Individual stories behind the hourly briefing.</p></div>
                <button className={`tp-sort-button ${trendingOnly ? "tp-sort-button-active" : ""}`} type="button" onClick={() => { setTrendingOnly((current) => !current); setActiveNav((current) => current === "Trending" ? "All news" : "Trending"); }}><ArrowDownUp size={15} /> {trendingOnly ? "Most important" : "Sort: relevance"}<ChevronDown size={14} /></button>
              </div>
              <div className="tp-filter-row" aria-label="Filter by topic">
                {CATEGORY_TABS.map((tab) => <button type="button" className={`tp-filter-pill ${category === tab.value ? "tp-filter-pill-active" : ""}`} key={tab.value} onClick={() => { setCategory(tab.value); setSelectedSource(null); setActiveNav(tab.value === "All" ? "All news" : NAV_ITEMS.find((item) => item.category === tab.value)?.label ?? "All news"); }} aria-pressed={category === tab.value}>{tab.label}</button>)}
                {selectedSource && <button type="button" className="tp-filter-pill tp-source-filter-active" onClick={() => setSelectedSource(null)}>Source: {selectedSource} <X size={12} /></button>}
              </div>

              {feedItems.length > 0 ? <div className="tp-news-grid">{feedItems.map((item) => <NewsCard item={item} key={item.id} />)}</div> : (
                <div className="tp-empty-feed"><span className="tp-empty-icon"><Search size={22} /></span><h3>No matching stories</h3><p>Try a different keyword or category.</p><button className="tp-secondary-button" type="button" onClick={clearFilters}>Clear filters</button></div>
              )}
              <div className="tp-feed-bottom-note"><span className="tp-feed-bottom-line" /><span><Sparkles size={13} /> AI summaries are designed to get you to the point faster.</span><span className="tp-feed-bottom-line" /></div>
            </div>
            <SourcePanel items={items} lastUpdated={lastUpdated} isDemo={isDemo} onSourceSelect={chooseSource} />
          </section>

          <footer className="tp-footer"><span>© {new Date().getFullYear()} TechPulse</span><span><span className="tp-footer-status-dot" /> {isDemo ? "Preview environment" : "Systems operational"}</span><span>Built for curious minds <span className="tp-footer-heart">✦</span></span></footer>
        </div>
      </main>
    </div>
  );
}
