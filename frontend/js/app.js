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
  container.innerHTML = items.map(item => `
    <div class="news-item">
      <span class="news-tag tag-${item.type}">${item.tag}</span>
      <div class="news-body">
        <div class="news-text">${item.text}</div>
        <div class="news-footer">
          <span class="news-time">${item.time}</span>
          <span class="news-impact">${item.impact}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPersons(persons) {
  const container = document.getElementById('persons-list');
  container.innerHTML = persons.map(p => `
    <div class="person-item">
      <div class="person-avatar">${p.initials}</div>
      <div>
        <div class="person-name">${p.name}</div>
        <div class="person-title">${p.title}</div>
        <div class="person-note">${p.note}</div>
      </div>
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

loadData();