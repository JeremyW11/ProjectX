async function loadData() {
  const res = await fetch('./data/daily.json');
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