# ProjectX

A daily market intelligence dashboard with a backend that aggregates news, research, financial data via Claude API + web searches, and a static frontend served on Netlify.

## Architecture
~/ProjectX/         (this repo, frontend)
frontend/
index.html, trigger.html, brief.html
pages/
market.html, institutional.html, targets.html, ...
data/
daily.json        (current day snapshot, overwritten daily)
accumulated.json  (rolling 30-day research/earnings/events)
history/
2026-05-20.json, 2026-05-21.json, ...
~/ProjectX-backend/  (sibling repo, Render deployment)
server.js          (Express server, runs /brief endpoint that generates daily.json)

- **Frontend**: Netlify auto-deploys from `JeremyW11/ProjectX` main branch
  - URL: https://projectxbrief.netlify.app
- **Backend**: Render auto-deploys from `JeremyW11/ProjectX-backend` main branch
  - URL: https://projectx-backend-o2pl.onrender.com
- **User DB**: Supabase (watchlist table for stock analysis cache; profiles for credits)
- **AI**: Anthropic API (model: claude-opus-4-5)

## Workflow conventions

- Frontend changes: edit files under `frontend/`, then `git add/commit/push`. Netlify auto-deploys in ~1 min.
- Backend changes: switch to `~/ProjectX-backend/`, edit `server.js`, then push. Render auto-deploys in ~2 min.
- Triggering brief: `curl -X POST https://projectx-backend-o2pl.onrender.com/brief -H "Content-Type: application/json" -d '{"date":"2026-MM-DD"}' --max-time 900` — takes 9-10 min.

## Critical: cost discipline

**Triggering brief is expensive** (high token + API cost per run). Do NOT trigger for testing.

**Verify everything zero-cost first**:
- Syntax: `node -c server.js`
- Function logic: extract function, run with `node -e "..."` against real APIs
- Data structure: `curl -s https://projectxbrief.netlify.app/data/daily.json | python3 -c "..."`
- White-list logic: feed fake URLs to validator in node REPL
- Prompt changes: read prompt by hand, check semantic correctness

**Only trigger when**: (1) all zero-cost checks pass, AND (2) accumulating multiple changes for a single verification run, AND (3) at the user's regular trigger time (~08:20 Taipei) so it serves dual purpose.

## Today's stack of changes (deployed 2026-05-20 ~ 2026-05-21)

### P5 (commit `8785e13`)
- **Prompt Caching**: 9 API calls (steps 3-10 + backfill) now use `cache_control: ephemeral, ttl: 1h` with `marketDataBlock` (80000 prefix) shared across steps. Expects 30-45% cost saving.
- **accumulated.json retention**: events filter changed to `past14 + future60` (was `past15 + future15`).
- **Step 10 logging**: clearer log when yesterday's predictions are absent.

### P6 (cumulative through 2026-05-21)
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

### P7 (2026-06-02, awaiting first trigger to verify)

- **Whitelist expansion**: `TRUSTED_URL_DOMAINS` 68 → 116 (added intl banks, intl media, TW banks/media). Mirrored here.
- **Global story tracking** (`Step 14` in `generate_brief.js`): `updateTrackedStories()` maintains persistent `accumulated.json.tracked_stories` — same global/geopolitical/trade/monetary/energy/tech news event tracked across days as a timeline (not disposable daily news). Caps ~10 active + 30-day ended retention; timeline last 5; source_url validated via whitelist; auto-落幕 after 14 days no update. NOT macro data-point tracking (CPI/FOMC) — tracks evolving global news storylines.
- **New Pro page** `frontend/pages/stories.html` (`全球追蹤` nav key `stories`): is_pro-gated reader of `tracked_stories`, renders each as a timeline card.
- **Pending verify**: Step 14 prompt can only be validated on a real trigger (cost). Backend changes not yet pushed to Render.

## Backlog (not yet started)

- **Prefetch TW/US rebalance**: `/morning` skill's 16 queries are ~1/16 TW-specific (rest US/global). Suggest cutting 1 of the 3 overlapping US-equity queries (#10/11/12) and adding 2 TW-specific (大盤外資法人 + 台股財報法說/題材). Not yet done.
- **"Since last trigger" data window logic**: Shelved (user is concerned about content sparsity).
- **TWSE primary/fallback inversion**: If TWSE stays broken, swap order so Yahoo is primary.
- **Market data-source gaps** (frontend `market.html` falls back to `--` correctly; needs backend fetch in `generate_brief.js`): (1) **VIX** — no field in daily.json at all (line ~827 hardcoded `--`). (2) **投信買賣超** — `tw_market_summary` only has `trade_value`+`foreign_net`, no 投信 (line ~843 hardcoded `--`). (3) **台股成交量** — `tw_market_summary.trade_value` is `"--"` from backend though tw_news text contains it (e.g. 「成交值1.607兆」). (4) **crypto high/low** — coingecko fetch doesn't include当日 high/low. Verified 2026-06-03 against live daily.json. Requires backend change + paid trigger to validate.

## Code style notes

- Avoid bullet points or headers in conversational responses; use prose.
- Push back when user requests something that hurts code quality or cost.
- Prefer minimal patches over rewrites.
- Always backup before destructive operations: `cp server.js server.js.backup-before-X`.
- After file changes: `node -c server.js && echo "✓ OK"` before commit.

## Common git commands

```bash
# Frontend changes
cd ~/ProjectX
git add <files>
git commit -m "..."
git push   # if rejected → git pull --rebase origin main && git push

# Backend changes
cd ~/ProjectX-backend
# same flow

# Common rebase resolution:
# (1) Edit conflicting file directly with final content
# (2) git add <file>
# (3) GIT_EDITOR=true git rebase --continue
# (4) git push
```

## Trusted domain whitelist for research source_url

(116 domains total as of 2026-06-02 expansion)

International banks: goldmansachs.com, morganstanley.com, jpmorgan.com, citigroup.com, citi.com, bankofamerica.com, merrilledge.com, wellsfargo.com, ubs.com, credit-suisse.com, barclays.com, db.com, deutsche-bank.com, hsbc.com, nomura.com, rbccm.com, jefferies.com, cowen.com, bairdgroup.com, piperjaffray.com, piper-sandler.com, bernstein.com, evercore.com, raymondjames.com, wedbush.com, oppenheimer.com, needham.com, stifel.com, truist.com, mizuhogroup.com, smbcgroup.com, macquarie.com, tdsecurities.com, bmo.com, scotiabank.com, mufgamericas.com, guggenheimpartners.com

International media: bloomberg.com, reuters.com, cnbc.com, marketwatch.com, wsj.com, barrons.com, ft.com, seekingalpha.com, finance.yahoo.com, yahoo.com, investing.com, benzinga.com, thefly.com, streetinsider.com, fool.com, forbes.com, apnews.com, axios.com, businessinsider.com, fortune.com, economist.com, nytimes.com, theinformation.com, semafor.com, morningstar.com, zacks.com, tipranks.com, marketbeat.com, nikkei.com, scmp.com, cnn.com

Taiwan financial institutions: kgi.com.tw, kgisia.com.tw, yuanta.com.tw, yuanta-consulting.com.tw, capitalim.com.tw, capital.com.tw, fbs.com.tw, fubon.com, sinopac.com, sinotrade.com.tw, esunsec.com.tw, esunbank.com.tw, megasia.com.tw, megabank.com.tw, cathaysite.com.tw, cathaybk.com.tw, masterlink.com.tw, tsib.com.tw, mlife.com.tw, ctbcbank.com, taishinbank.com.tw, firstbank.com.tw, hncb.com.tw, scsb.com.tw, jihsun.com.tw, pscnet.com.tw, concords.com.tw, president.com.tw

Taiwan media: cnyes.com, moneydj.com, udn.com, chinatimes.com, ltn.com.tw, wealth.com.tw, businesstoday.com.tw, ettoday.net, technews.tw, bnext.com.tw, storm.mg, ctee.com.tw, nownews.com, wantgoo.com, businessweekly.com.tw, gvm.com.tw, money.com.tw, twreporter.org, blockcast.it, abmedia.io
