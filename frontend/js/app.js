async function loadData() {
  const res = await fetch('/data/daily.json');
  const data = await res.json();
  renderDate(data.date);
  renderTickers(data.tickers);
  renderNews('macro-list', data.macro);
  renderNews('industry-list', data.industry);
  renderPersons(data.persons);
  renderSignals(data.signals);
}

function renderDate(date) {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  document.getElementById('date-display').textContent =
    d.toLocaleDateString('zh-TW', options);
}

function renderTickers(tickers) {
  const container = document.getElementById('ticker-strip');
  container.innerHTML = tickers.map(t => `
    <div class="ticker-item">
      <div class="t-label">${t.label}</div>
      <div class="t-value">${t.value}</div>
      <div class="t-change ${t.dir}">${t.dir === 'up' ? '▲' : t.dir === 'down' ? '▼' : '—'} ${t.change}</div>
    </div>
  `).join('');
}

function renderNews(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = items.map((item, i) => `
    <div class="news-item expandable" onclick="toggleExpand(this)">
      <span class="news-tag tag-${item.type}">${item.tag}</span>
      <div class="news-body">
        <div class="news-text">${item.text}</div>
        <div class="news-footer">
          <span class="news-time">${item.time}</span>
          <span class="news-impact">${item.impact}</span>
        </div>
        <div class="news-expand">
          <div class="expand-divider"></div>
          <div class="expand-row" style="align-items:flex-start; gap:12px;">
            <span class="expand-label" style="flex-shrink:0; margin-top:2px;">深度分析</span>
            <span class="expand-value" style="text-align:right; line-height:1.6;">${item.expand_analysis || item.impact}</span>
          </div>
          <div class="expand-row">
            <span class="expand-label">關注標的</span>
            <span class="expand-value">${item.expand_tickers || getRelatedTickers(item.tag)}</span>
          </div>
          <div class="expand-row" style="align-items:flex-start; gap:12px;">
            <span class="expand-label" style="flex-shrink:0; margin-top:2px;">持續追蹤</span>
            <span class="expand-value" style="text-align:right; line-height:1.6;">${item.expand_watch || '待觀察'}</span>
          </div>
        </div>
      </div>
      <div class="expand-arrow">›</div>
    </div>
  `).join('');
}

function getRelatedTickers(tag) {
  const map = {
    '半導體': 'NVDA / TSM / 2330 / MU',
    'AI': 'NVDA / MSFT / GOOGL / 2330',
    '加密': 'BTC / ETH / SOL',
    '台股': 'TAIEX / 2330 / 2317',
    '能源': 'XOM / CVX / OIL',
    '航運': '2603 / 2609 / ZIM',
    '科技': 'NVDA / AAPL / MSFT / META',
    '政策': 'SPY / TLT / DXY',
    '地緣': 'GC / OIL / VIX',
    '數據': 'SPY / TLT / USD',
    '央行': 'TLT / DXY / GC',
    'OPEC': 'XOM / OIL / Brent',
    'IMF': 'SPY / EEM / DXY',
    '消費': 'XRT / AMZN / WMT',
    '貴金屬': 'GC / SI / GDX'
  };
  return map[tag] || '—';
}

function renderPersons(persons) {
  const container = document.getElementById('persons-list');
  container.innerHTML = persons.map(p => `
    <div class="person-item expandable" onclick="toggleExpand(this)">
      <div class="person-avatar">${p.initials}</div>
      <div class="person-body">
        <div class="person-name">${p.name}</div>
        <div class="person-title">${p.title}</div>
        <div class="person-note">${p.note}</div>
        <div class="news-expand">
          <div class="expand-divider"></div>
          <div class="expand-row">
            <span class="expand-label">機構</span>
            <span class="expand-value">${p.title.split('｜')[1] || p.title}</span>
          </div>
          <div class="expand-row">
            <span class="expand-label">職位</span>
            <span class="expand-value">${p.title.split('｜')[0] || '—'}</span>
          </div>
          <div class="expand-row" style="align-items:flex-start; gap:12px;">
            <span class="expand-label" style="flex-shrink:0; margin-top:2px;">觀察重點</span>
            <span class="expand-value" style="text-align:right; line-height:1.6;">${p.expand_watch || p.note}</span>
          </div>
        </div>
      </div>
      <div class="expand-arrow">›</div>
    </div>
  `).join('');
}

function renderSignals(signals) {
  const container = document.getElementById('signals-list');
  container.innerHTML = signals.map(s => `
    <div class="industry-row">
      <div class="ind-left">
        <div class="ind-dot" style="background:${dotColor(s.signal)}"></div>
        <span class="ind-name">${s.name}</span>
      </div>
      <span class="signal-pill ${s.signal}">${s.label}</span>
    </div>
  `).join('');
}

function dotColor(signal) {
  const map = {
    bull: 'var(--accent-green)',
    bear: 'var(--accent-red)',
    watch: 'var(--accent-orange)',
    neutral: 'var(--text-muted)'
  };
  return map[signal] || 'var(--text-muted)';
}

function toggleExpand(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.expandable.open').forEach(item => {
    item.classList.remove('open');
    const arrow = item.querySelector('.expand-arrow');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  });
  if (!isOpen) {
    el.classList.add('open');
    const arrow = el.querySelector('.expand-arrow');
    if (arrow) arrow.style.transform = 'rotate(90deg)';
  }
}

loadData();