var currentDate = null;

async function loadData(date) {
  var url = date ? '/data/history/' + date + '.json' : '/data/daily.json';
  var res = await fetch(url);
  var data = await res.json();
  currentDate = data.date;
  renderDate(data.date);
  renderTickers(data.tickers);
  renderNews('macro-list', data.macro);
  renderNews('industry-list', data.industry);
  renderPersons(data.persons);
  renderSignals(data.signals);
  renderSentiment(data.sentiment);
}

async function loadHistory() {
  try {
    var res = await fetch('https://projectx-backend-o2pl.onrender.com/history');
    var data = await res.json();
    renderDatePicker(data.dates);
  } catch(e) {
    console.log('歷史版本載入失敗', e);
  }
}

function renderDatePicker(dates) {
  var picker = document.getElementById('date-picker');
  if (!picker || !dates || dates.length === 0) return;
  picker.innerHTML =
    '<div class="date-picker-wrap">' +
      '<button class="date-btn active" onclick="switchDate(null, this)">今日</button>' +
      dates.slice(0, 7).map(function(d) {
        var label = d.substring(5).replace('-', '/');
        return '<button class="date-btn" onclick="switchDate(\'' + d + '\', this)">' + label + '</button>';
      }).join('') +
    '</div>';
}

function switchDate(date, btn) {
  document.querySelectorAll('.date-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  loadData(date);
}

function renderDate(date) {
  var d = new Date(date);
  var options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  document.getElementById('date-display').textContent =
    d.toLocaleDateString('zh-TW', options);
}

function renderTickers(tickers) {
  var container = document.getElementById('ticker-strip');
  container.innerHTML = tickers.map(function(t) {
    var dirIcon = t.dir === 'up' ? '▲' : t.dir === 'down' ? '▼' : '—';
    var isEmpty = !t.value || t.value === '--';
    return '<div class="ticker-item">' +
      '<div class="t-label">' + t.label + '</div>' +
      '<div class="t-value ' + (isEmpty ? 'flat' : '') + '">' + t.value + '</div>' +
      '<div class="t-change ' + t.dir + '">' + (isEmpty ? '休市' : dirIcon + ' ' + t.change) + '</div>' +
    '</div>';
  }).join('');
}

function renderNews(containerId, items) {
  var container = document.getElementById(containerId);
  container.innerHTML = items.map(function(item) {
    return '<div class="news-item expandable" onclick="toggleExpand(this)">' +
      '<span class="news-tag tag-' + item.type + '">' + item.tag + '</span>' +
      '<div class="news-body">' +
        '<div class="news-text">' + item.text + '</div>' +
        '<div class="news-footer">' +
          '<span class="news-time">' + item.time + '</span>' +
          '<span class="news-impact">' + item.impact + '</span>' +
        '</div>' +
        '<div class="news-expand">' +
          '<div class="expand-divider"></div>' +
          '<div class="expand-row" style="align-items:flex-start;gap:12px;">' +
            '<span class="expand-label" style="flex-shrink:0;margin-top:2px;">深度分析</span>' +
            '<span class="expand-value" style="text-align:left;line-height:1.6;">' + (item.expand_analysis || item.impact) + '</span>' +
          '</div>' +
          '<div class="expand-row">' +
            '<span class="expand-label">關注標的</span>' +
            '<span class="expand-value">' + (item.expand_tickers || getRelatedTickers(item.tag)) + '</span>' +
          '</div>' +
          '<div class="expand-row" style="align-items:flex-start;gap:12px;">' +
            '<span class="expand-label" style="flex-shrink:0;margin-top:2px;">持續追蹤</span>' +
            '<span class="expand-value" style="text-align:left;line-height:1.6;">' + (item.expand_watch || '待觀察') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="expand-arrow">›</div>' +
    '</div>';
  }).join('');
}

function getRelatedTickers(tag) {
  var map = {
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
    '消費': 'XRT / AMZN / WMT',
    '貴金屬': 'GC / SI / GDX'
  };
  return map[tag] || '—';
}

function renderPersons(persons) {
  var container = document.getElementById('persons-list');
  container.innerHTML = persons.map(function(p) {
    var parts = p.title.split('｜');
    return '<div class="person-item expandable" onclick="toggleExpand(this)">' +
      '<div class="person-avatar">' + p.initials + '</div>' +
      '<div class="person-body">' +
        '<div class="person-name">' + p.name + '</div>' +
        '<div class="person-title">' + p.title + '</div>' +
        '<div class="person-note">' + p.note + '</div>' +
        '<div class="news-expand">' +
          '<div class="expand-divider"></div>' +
          '<div class="expand-row">' +
            '<span class="expand-label">機構</span>' +
            '<span class="expand-value">' + (parts[1] || p.title) + '</span>' +
          '</div>' +
          '<div class="expand-row">' +
            '<span class="expand-label">職位</span>' +
            '<span class="expand-value">' + (parts[0] || '—') + '</span>' +
          '</div>' +
          '<div class="expand-row" style="align-items:flex-start;gap:12px;">' +
            '<span class="expand-label" style="flex-shrink:0;margin-top:2px;">觀察重點</span>' +
            '<span class="expand-value" style="text-align:left;line-height:1.6;">' + (p.expand_watch || p.note) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="expand-arrow">›</div>' +
    '</div>';
  }).join('');
}

function renderSignals(signals) {
  var container = document.getElementById('signals-list');
  container.innerHTML = signals.map(function(s) {
    return '<div class="industry-row">' +
      '<div class="ind-left">' +
        '<div class="ind-dot" style="background:' + dotColor(s.signal) + '"></div>' +
        '<div>' +
          '<div class="ind-name">' + s.name + '</div>' +
          (s.reason ? '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;line-height:1.4;">' + s.reason + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<span class="signal-pill ' + s.signal + '">' + s.label + '</span>' +
    '</div>';
  }).join('');
}

function renderSentiment(sentiment) {
  if (!sentiment) return;

  if (sentiment.fear_greed) {
    var fg = sentiment.fear_greed;
    var val = parseInt(fg.value) || 50;
    var colorClass = val <= 20 ? 'extreme-fear' : val <= 40 ? 'fear' : val <= 60 ? 'neutral-fg' : val <= 80 ? 'greed' : 'extreme-greed';
    var fgEl = document.getElementById('fear-greed');
    if (fgEl) fgEl.innerHTML =
      '<div class="fg-container">' +
        '<div class="fg-value ' + colorClass + '">' + fg.value + '</div>' +
        '<div class="fg-label ' + colorClass + '">' + fg.label + '</div>' +
        '<div class="fg-change">' + (fg.change ? '較昨日 ' + fg.change : '') + '</div>' +
        '<div class="fg-bar"><div class="fg-indicator" style="left:' + val + '%"></div></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text-muted);margin-bottom:10px;">' +
          '<span>極度恐懼</span><span>恐懼</span><span>中性</span><span>貪婪</span><span>極貪婪</span>' +
        '</div>' +
        '<div class="fg-note">' + fg.note + '</div>' +
      '</div>';
  }

  if (sentiment.polymarket && sentiment.polymarket.length > 0) {
    var polyEl = document.getElementById('polymarket-list');
    if (polyEl) polyEl.innerHTML = sentiment.polymarket.map(function(p) {
      var prob = parseInt(p.prob) || 50;
      return '<div class="poly-item">' +
        '<div class="poly-header">' +
          '<div class="poly-title">' + p.title + '</div>' +
          '<div class="poly-prob">' + p.prob + '</div>' +
        '</div>' +
        '<div class="poly-bar-bg"><div class="poly-bar" style="width:' + prob + '%"></div></div>' +
        '<div class="poly-note">' + (p.note || '') + '</div>' +
      '</div>';
    }).join('');
  }

  if (sentiment.coinglass) {
    var cg = sentiment.coinglass;
    var cgEl = document.getElementById('coinglass');
    if (cgEl) cgEl.innerHTML =
      '<div class="cg-funding">' + (cg.funding_rate || '資金費率載入中') + '</div>' +
      '<div class="cg-grid">' +
        '<div class="cg-item"><div class="cg-label">BTC 多單清算</div><div class="cg-value long">' + (cg.btc_long_liq || '—') + '</div></div>' +
        '<div class="cg-item"><div class="cg-label">BTC 空單清算</div><div class="cg-value short">' + (cg.btc_short_liq || '—') + '</div></div>' +
        '<div class="cg-item"><div class="cg-label">ETH 多單清算</div><div class="cg-value long">' + (cg.eth_long_liq || '—') + '</div></div>' +
        '<div class="cg-item"><div class="cg-label">ETH 空單清算</div><div class="cg-value short">' + (cg.eth_short_liq || '—') + '</div></div>' +
      '</div>' +
      '<div class="cg-note">多空比：' + (cg.long_short_ratio || '—') + ' ｜ ' + (cg.note || '') + '</div>';
  }
}

function dotColor(signal) {
  var map = {
    bull: 'var(--accent-green)',
    bear: 'var(--accent-red)',
    watch: 'var(--accent-orange)',
    neutral: 'var(--text-muted)'
  };
  return map[signal] || 'var(--text-muted)';
}

function toggleExpand(el) {
  var isOpen = el.classList.contains('open');
  document.querySelectorAll('.expandable.open').forEach(function(item) {
    item.classList.remove('open');
    var arrow = item.querySelector('.expand-arrow');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  });
  if (!isOpen) {
    el.classList.add('open');
    var arrow = el.querySelector('.expand-arrow');
    if (arrow) arrow.style.transform = 'rotate(90deg)';
  }
}

loadData(null);
loadHistory();