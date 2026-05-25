// ── 客服設定 ──────────────────────────────────────────
// 取得 Tawk.to Property ID：登入 tawk.to → Administration → Chat Widget → 複製 embed code 中的 ID
// 格式：https://embed.tawk.to/{PROPERTY_ID}/{WIDGET_ID}
var TAWK_PROPERTY_ID = '';  // 填入後 Tawk.to 聊天視窗即自動啟用
var TAWK_WIDGET_ID   = 'default';

var SUPPORT_EMAIL = 'support@projectx.com';

if (TAWK_PROPERTY_ID) {
  var Tawk_API = Tawk_API || {};
  var Tawk_LoadStart = new Date();
  (function () {
    var s1 = document.createElement('script');
    var s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/' + TAWK_PROPERTY_ID + '/' + TAWK_WIDGET_ID;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode.insertBefore(s1, s0);
  })();
}
