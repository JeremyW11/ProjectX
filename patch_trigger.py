#!/usr/bin/env python3
"""patch trigger.html: 加警告色 + 誠實時間 + 假進度 + 區分品質警告"""
import sys

INPUT = sys.argv[1] if len(sys.argv) > 1 else 'frontend/trigger.html'
OUTPUT = sys.argv[2] if len(sys.argv) > 2 else 'frontend/trigger.html'

with open(INPUT, 'r', encoding='utf-8') as f:
    src = f.read()

# ── 改動 1：加 .status.warning CSS ──
CSS_OLD = '''    .status.success { color: #48bb78; }
    .status.error { color: #fc8181; }
    .status.loading { color: #4da6ff; }'''

CSS_NEW = '''    .status.success { color: #48bb78; }
    .status.error { color: #fc8181; }
    .status.loading { color: #4da6ff; }
    .status.warning { color: #f6ad55; }
    .progress-stage { display: block; font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .retry-btn { margin-top: 10px; padding: 6px 16px; font-size: 12px; background: rgba(77,166,255,0.15); border: 1px solid #4da6ff; color: #4da6ff; border-radius: 4px; cursor: pointer; }
    .retry-btn:hover { background: rgba(77,166,255,0.25); }'''

if CSS_OLD not in src:
    print('❌ CSS marker 找不到', file=sys.stderr)
    sys.exit(1)
src = src.replace(CSS_OLD, CSS_NEW, 1)

# ── 改動 2：替換 triggerBrief 函數 ──
TRIGGER_OLD = '''    async function triggerBrief() {
      const btn = document.getElementById('trigger-btn');
      const status = document.getElementById('status');
      const date = getToday();

      btn.disabled = true;
      status.className = 'status loading';
      status.innerHTML = '<span class="spinner"></span>正在搜尋整理今日資訊...（約 1-2 分鐘）';

      try {
        const res = await fetch(`${API}/brief`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date })
        });

        const data = await res.json();

        if (data.success) {
          status.className = 'status success';
          status.textContent = '✅ 更新成功！網站將於 30 秒內自動更新';
          saveHistory(date);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        status.className = 'status error';
        status.textContent = `❌ 錯誤：${err.message}`;
      } finally {
        btn.disabled = false;
      }
    }'''

TRIGGER_NEW = '''    // 假進度提示（按時間切換訊息，僅 UI 安慰用，不真實追蹤後端步驟）
    const PROGRESS_STAGES = [
      { sec:   0, msg: '正在啟動服務...' },
      { sec:  20, msg: '搜尋市場資料中（CoinGecko、TWSE、Yahoo）...' },
      { sec:  60, msg: '搜尋宏觀新聞、機構研報、法說會...' },
      { sec: 180, msg: '整理資料、產出 JSON...' },
      { sec: 300, msg: '產出 Morning Brief、機會、事件預判...' },
      { sec: 420, msg: '驗證資料品質、寫入 daily.json...' },
      { sec: 540, msg: '即將完成，請稍候...' }
    ];

    function formatElapsed(ms) {
      const s = Math.floor(ms / 1000);
      const m = Math.floor(s / 60);
      const r = s % 60;
      return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
    }

    async function triggerBrief() {
      const btn = document.getElementById('trigger-btn');
      const status = document.getElementById('status');
      const date = getToday();

      btn.disabled = true;
      const startTime = Date.now();

      // 啟動假進度 timer（每秒更新訊息與經過時間）
      function renderProgress() {
        const elapsedMs = Date.now() - startTime;
        const elapsedSec = elapsedMs / 1000;
        let stage = PROGRESS_STAGES[0].msg;
        for (const p of PROGRESS_STAGES) {
          if (elapsedSec >= p.sec) stage = p.msg;
        }
        status.innerHTML = `<span class="spinner"></span>${stage}<span class="progress-stage">已耗時 ${formatElapsed(elapsedMs)}　·　預計總時長 9-10 分鐘</span>`;
      }
      status.className = 'status loading';
      renderProgress();
      const progressTimer = setInterval(renderProgress, 1000);

      try {
        // 用 AbortController 設 15 分鐘 timeout，避免瀏覽器自己斷線
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000);

        const res = await fetch(`${API}/brief`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await res.json();
        clearInterval(progressTimer);

        if (data.success) {
          status.className = 'status success';
          status.innerHTML = `✅ 更新成功（耗時 ${formatElapsed(Date.now() - startTime)}）！網站將於 30 秒內自動更新<span class="progress-stage">commit: ${(data.commit || '').substring(0, 7)}</span>`;
          saveHistory(date);
        } else {
          // 區分「資料品質警告」與「真錯誤」
          const err = data.error || '未知錯誤';
          if (err.includes('data_quality_blocked') || err.includes('quality')) {
            status.className = 'status warning';
            status.innerHTML = `⚠️ 資料品質檢查未通過<span class="progress-stage">原 daily.json 維持不變，未被覆蓋。可再試一次（市場開盤後資料更穩定）</span><button class="retry-btn" onclick="triggerBrief()">🔄 再試一次</button>`;
          } else {
            throw new Error(err);
          }
        }
      } catch (err) {
        clearInterval(progressTimer);
        const elapsed = formatElapsed(Date.now() - startTime);
        if (err.name === 'AbortError') {
          status.className = 'status warning';
          status.innerHTML = `⚠️ 前端等待逾時（15 分鐘，已耗時 ${elapsed}）<span class="progress-stage">後端可能仍在跑，1-2 分鐘後檢查 daily.json 是否更新</span>`;
        } else {
          status.className = 'status error';
          status.innerHTML = `❌ 錯誤：${err.message}<span class="progress-stage">已耗時 ${elapsed}</span><button class="retry-btn" onclick="triggerBrief()">🔄 再試一次</button>`;
        }
      } finally {
        btn.disabled = false;
      }
    }'''

if TRIGGER_OLD not in src:
    print('❌ triggerBrief 函數 marker 找不到', file=sys.stderr)
    sys.exit(1)
src = src.replace(TRIGGER_OLD, TRIGGER_NEW, 1)

with open(OUTPUT, 'w', encoding='utf-8') as f:
    f.write(src)

print('✓ trigger.html 已 patch 完成')
print('  - 新增 .status.warning（黃色）+ .progress-stage + .retry-btn CSS')
print('  - triggerBrief：假進度（7 階段）+ 已耗時計時 + 15 分鐘 AbortController timeout')
print('  - data_quality_blocked 顯示為「警告」而非「錯誤」+ 再試一次按鈕')
print('  - 真錯誤仍紅色顯示，也加再試一次按鈕')
print('  - 逾時情境顯示「後端可能仍在跑」提示')
