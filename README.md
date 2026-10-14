# TechPulse — Next.js + Tailwind CSS

Responsive TechPulse frontend with the dark navy/purple design, an hourly multi-article Hot Summary, individual news cards, topic/source filters, search, refresh, and a persisted dark/light mode switch.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`. Open `http://localhost:3000`.

## Connect to the included FastAPI backend

Start the backend on `http://localhost:8000`, then set these values in `.env.local`:

```env
NEXT_PUBLIC_NEWS_API_URL=http://localhost:8000/api/news
# Optional; derived automatically from NEWS_API_URL if omitted.
NEXT_PUBLIC_HOT_SUMMARY_API_URL=http://localhost:8000/api/news/hot-summary
```

Restart the Next.js dev server after editing `.env.local`. The frontend fetches the news feed and synthesized Hot Summary separately. If the feed API is available but no briefing exists yet, it shows a “briefing on its way” state. Demo stories are used only if the main news endpoint can't be reached.

## API contract used by the frontend

- `GET /api/news?sort=recent&limit=30&offset=0` — article list.
- `GET /api/news/hot-summary` — latest synthesized multi-article briefing.
- `GET /api/sources` — tracked source counts (available for future UI wiring).
- `GET /api/health` — basic health check.
- Protected `POST /api/admin/ingestion/run` — starts a crawl and one additional Gemini request for the batch briefing.

The news adapter accepts your PostgreSQL field names including `article_url`, `source_domain`, `website_summary`, `image_url`, and `created_at`. It does not require changes to the article-card components if the backend field names evolve; update `lib/news-api.ts` if you change the API contract.

## Dark/light mode

Use the sun/moon control in the top bar. The selected mode is stored in `localStorage` as `techpulse-theme`.

## Integration into an existing Next.js application

Copy `components/techpulse`, `lib`, and the homepage component. Merge `app/globals.css` into the existing global stylesheet instead of blindly replacing it. Add `lucide-react` if it isn't already installed. Keep existing backend routes and crawler code separate from the frontend.

## Notes

- Crawl4AI and Playwright stay on the Python backend; they never run in the browser.
- The Hot Summary is a persisted briefing generated after an ingestion batch. A public GET never calls Gemini.
- The UI keeps the article feed visible when a summary has not been generated yet.
