// ── Google Analytics 4（全站共用，單一檔案維護）──
// 用法：把下面 GA_MEASUREMENT_ID 換成你 GA4 資源的評估 ID（格式 G-XXXXXXXXXX）。
// 留空（''）時整段不執行，不影響網站。每個頁面都引入 footer.js，故只需在此設定一次。
(function(){
  var GA_MEASUREMENT_ID = 'G-5DY07S3K06'; // ← 在此填入 G-XXXXXXXXXX
  if(!GA_MEASUREMENT_ID || !/^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID)) return;
  if(window.__gaLoaded) return; window.__gaLoaded = true;
  var s=document.createElement('script'); s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+GA_MEASUREMENT_ID;
  (document.head||document.documentElement).appendChild(s);
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  window.gtag=gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
})();

// ── 全站免責聲明頁尾：自動注入至每個頁面底部 ──
// 內容僅供參考、非投資建議；部分由 AI 生成，可能有誤。單一檔案維護，於各頁 <script> 引入即可。
(function(){
  if(document.getElementById('site-disclaimer')) return;

  var CSS = ".site-disclaimer{margin-top:48px;padding:26px 20px 34px;border-top:1px solid rgba(100,116,139,.18);}"
    + ".site-disclaimer .sd-inner{max-width:920px;margin:0 auto;}"
    + ".site-disclaimer .sd-title{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;font-family:'DM Sans',sans-serif;margin-bottom:8px;}"
    + ".site-disclaimer .sd-text{font-size:11.5px;line-height:1.78;color:#94a3b8;font-family:'Noto Sans TC',sans-serif;}"
    + ".site-disclaimer .sd-copy{margin-top:14px;font-size:11px;color:#9aa6b8;font-family:'DM Sans',sans-serif;letter-spacing:.01em;}";

  function injectCss(){
    if(document.getElementById('site-disclaimer-css')) return;
    var s=document.createElement('style'); s.id='site-disclaimer-css'; s.textContent=CSS;
    (document.head||document.documentElement).appendChild(s);
  }

  var TEXT = '本網站所提供之所有內容，包括但不限於市場資訊、數據、分析、推演、研報摘要與圖表，'
    + '僅供一般資訊與教育參考，不構成任何投資建議、要約或招攬，亦不應作為買賣任何證券、'
    + '金融商品或加密資產之依據。部分內容由人工智慧自動生成，可能包含錯誤、延遲或不完整之處，'
    + '本網站不保證其準確性、即時性或完整性。投資涉及風險，價格可能波動，過往表現不代表未來績效。'
    + '使用者應自行判斷並承擔投資決策之全部風險，必要時請諮詢合格之專業顧問。'
    + '對於因使用本網站內容所造成之任何直接或間接損失，本網站及其營運者概不負責。';

  function build(){
    injectCss();
    var year=new Date().getFullYear();
    var foot=document.createElement('footer');
    foot.id='site-disclaimer';
    foot.className='site-disclaimer';
    var inner=document.createElement('div'); inner.className='sd-inner';
    var t=document.createElement('div'); t.className='sd-title'; t.textContent='免責聲明 · Disclaimer';
    var p=document.createElement('div'); p.className='sd-text'; p.textContent=TEXT;
    var c=document.createElement('div'); c.className='sd-copy'; c.textContent='© '+year+' Project X. 版權所有，內容非投資建議。';
    inner.appendChild(t); inner.appendChild(p); inner.appendChild(c);
    foot.appendChild(inner);
    document.body.appendChild(foot);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
})();
