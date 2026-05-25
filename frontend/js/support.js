// ── 客服設定 ──────────────────────────────────────────
var SUPPORT_EMAIL    = 'support@projectx.com';
var TELEGRAM_USERNAME = 'projectx_support'; // 不含 @

(function () {
  var btn = document.createElement('a');
  btn.href = 'https://t.me/' + TELEGRAM_USERNAME;
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.title = '聯繫客服';
  btn.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
    'width:52px', 'height:52px', 'border-radius:50%',
    'background:#2AABEE', 'display:flex', 'align-items:center', 'justify-content:center',
    'box-shadow:0 4px 16px rgba(0,0,0,.18)', 'transition:transform .2s,box-shadow .2s',
    'cursor:pointer'
  ].join(';');
  btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.48 13.695l-2.95-.924c-.64-.203-.658-.64.136-.954l11.57-4.461c.537-.194 1.006.131.658.865z"/></svg>';
  btn.addEventListener('mouseenter', function () {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 6px 24px rgba(42,171,238,.4)';
  });
  btn.addEventListener('mouseleave', function () {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 16px rgba(0,0,0,.18)';
  });
  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(btn);
  });
})();
