# ProjectX Changelog

Historical record of completed patch stacks. Not loaded into every Claude session — reference only when investigating why a specific past decision was made. Git log/blame is the primary source of truth; this file exists for the narrative grouping git log doesn't give.

## P5 (commit `8785e13`, 2026-05-20~21)
- **Prompt Caching**: 9 API calls (steps 3-10 + backfill) now use `cache_control: ephemeral, ttl: 1h` with `marketDataBlock` (80000 prefix) shared across steps. Expects 30-45% cost saving.
- **accumulated.json retention**: events filter changed to `past14 + future60` (was `past15 + future15`).
- **Step 10 logging**: clearer log when yesterday's predictions are absent.

## P6 (cumulative through 2026-05-21)
- **Target analysis cache** (`frontend/pages/targets.html`):
  - Same-day re-click on stock analysis reads cached `analysis` from Supabase `watchlist.analysis` + `analysis_date`.
  - Cache hit: NO credit deducted, NO API call (changed mid-day from "deduct credit" to "no deduct").
  - Next day: cache expires, re-runs.
- **Research source_url backend** (`commit 0182bca`):
  - `step 1c` prompt requires real URLs from web_search results (no hallucination).
  - `step 6` schema adds `source_url` field.
  - `validateSourceUrl()` white-lists 68 domains (intl. banks, news, TW financial institutions).
- **Research source_url frontend** (`commit 08c226e`):
  - `institutional.html` renders `📎 原文` button on each research card if `source_url` exists.
- **accumulated.json reset** (`commit b383781`):
  - Cleared all old research/earnings/events to let new ones accumulate with `source_url`.
- **Yahoo Finance fallback for TW stocks** (`commit b7e20b2`):
  - When TWSE API fails, calls `fetchTWStockYahooFallback(ticker)` using `{ticker}.TW` on Yahoo.
  - Applied to both main 5 TW stocks and extra 3.
  - `_source` flag now reflects real source (twse / yahoo_fallback / twse_prev).
- **Real S&P 500 / NASDAQ indices** (`commit edb3b8b`):
  - `fetchUSIndexData('^GSPC', 'S&P 500')` and `('^IXIC', 'NASDAQ')` parallel-fetched in pre-fetch stage.
  - tickers area now shows real indices (5-digit values) instead of SPY/QQQ ETF prices ($733 / $701).
  - schema prompt updated to "使用真實 S&P500/NASDAQ 指數".
- **trigger.html UI improvements** (`commit e67ed17`):
  - 7-stage fake progress (`0/20/60/180/300/420/540` sec).
  - Live elapsed time counter (mm:ss).
  - 15-minute AbortController timeout.
  - `data_quality_blocked` → yellow warning (not red error) + 🔄 retry button.
  - Real errors → red + retry button.
  - Timeout → yellow "backend may still be running" hint.

## P7 (2026-06-02, verified 2026-06-25)
- **Whitelist expansion**: `TRUSTED_URL_DOMAINS` 68 → 116 (added intl banks, intl media, TW banks/media). Mirrored in CLAUDE.md.
- **Global story tracking** (`Step 14` in `generate_brief.js`): `updateTrackedStories()` maintains persistent `accumulated.json.tracked_stories` — same global/geopolitical/trade/monetary/energy/tech news event tracked across days as a timeline (not disposable daily news). Caps ~10 active + 30-day ended retention; timeline last 5; source_url validated via whitelist; auto-落幕 after 14 days no update. NOT macro data-point tracking (CPI/FOMC) — tracks evolving global news storylines.
- **New Pro page** `frontend/pages/stories.html` (`全球追蹤` nav key `stories`): is_pro-gated reader of `tracked_stories`, renders each as a timeline card.
- Verified 2026-06-25: `tracked_stories` 10 active entries, structure normal.

## P8 (2026-06-25)
- **RSS expansion** (`commit 403c734`): added WSJ Markets, WSJ Tech, Ars Technica, EE Times; Yahoo ticker RSS 5→11 (NVDA/TSM/MSFT/AAPL/META/AMD/AVGO/MU/QCOM/ARM/AMAT); Finnhub news slice 20→40; usItems limit 30→50.
- **newsdata.io full-industry** (`commit 460c83b`): `fetchNewsdataIO()` now returns `{ twSummary, enSummary }`. Makes 6 parallel calls: 1 TW Chinese + 5 English sector queries (tech/AI, energy/commodity, finance/macro, healthcare/biotech, consumer/industrial). Both injected into marketData2/3.
- **Alpha Vantage NEWS_SENTIMENT** (`commit 460c83b`): new `fetchAlphaVantageNews()` with 6 API calls — 2 ticker-based (NVDA/AMD/AVGO, MU/QCOM/ARM) + 4 topic-based (energy_transportation, finance+financial_markets, life_sciences, manufacturing+retail_wholesale). Covers all major sectors. Key in `.env` as `ALPHA_VANTAGE_API_KEY`. 6 of 25 daily quota consumed per brief run. TSM excluded from ticker batches (breaks multi-ticker API). Injected into marketData3.
