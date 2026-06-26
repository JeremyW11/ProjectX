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
    var pa=document.createElement('div'); pa.className='sd-copy'; pa.style.cssText='margin-top:16px;font-size:12px;color:#94a3b8;'; pa.textContent='⚡ Powered by OrionAI · Vela 的 AI 分析引擎';
    var c=document.createElement('div'); c.className='sd-copy'; c.textContent='© '+year+' Vela. 版權所有，內容非投資建議。';
    inner.appendChild(t); inner.appendChild(p); inner.appendChild(pa); inner.appendChild(c);
    foot.appendChild(inner);
    document.body.appendChild(foot);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
})();

// ── 全站共用：登入/升級回跳（?next=）與資料載入錯誤橫幅 ──
// footer.js 幾乎在每頁載入（含 login/index），故集中於此維護，避免各頁重複又漂移。
(function(){
  // 僅接受站內相對路徑（/ 開頭、非 //），且不可指回登入頁，避免 open redirect 與回圈。
  function safeNext(raw){
    if(!raw) return '';
    try{ raw=decodeURIComponent(raw); }catch(e){}
    if(raw.charAt(0)!=='/'||raw.charAt(1)==='/') return '';
    if(/login\.html/.test(raw)) return '';
    return raw;
  }
  function currentAsNext(){
    return encodeURIComponent(location.pathname+location.search);
  }
  // 來源頁兜底：程式化 window.location.href='/pages/login.html' 不會帶 ?next=，
  // 但同源導向下 document.referrer 會帶完整路徑，可據此回到原頁。
  function safeNextFromReferrer(){
    var r=document.referrer;
    if(!r) return '';
    try{
      var u=new URL(r);
      if(u.origin!==location.origin) return '';
      return safeNext(u.pathname+u.search);
    }catch(e){ return ''; }
  }
  // 登入/註冊成功後的去處：優先 ?next=，再退而求其次用來源頁，最後回總覽。
  window.PX_postAuthDest=function(){
    var p=null;
    try{ p=new URLSearchParams(location.search).get('next'); }catch(e){}
    return safeNext(p)||safeNextFromReferrer()||'/brief.html';
  };

  // 點擊當下才決定 next：各頁 auth JS 常在驗證回來後重設 btn.href 成裸登入網址，
  // 會洗掉 DOMContentLoaded 階段裝飾的 ?next=。用捕獲階段的委派監聽在點擊瞬間補上，
  // 讀的是當下 href，不受之後覆寫影響，亦不需逐頁修改。
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;
    if(!a) return;
    var href=a.getAttribute('href')||'';
    var m=href.match(/(login|credits)\.html/);
    if(!m) return;
    if(/[?&]next=/.test(href)) return;            // 已帶 next，不重複
    if(new RegExp(m[1]+'\\.html').test(location.pathname)) return; // 不在同類型頁自我回跳
    a.setAttribute('href',href+(href.indexOf('?')>=0?'&':'?')+'next='+currentAsNext());
  },true);

  // 把當前頁夾帶進站內所有 login / credits 連結（含 onclick 版），讓回跳成立。
  function injectNext(){
    var onCredits=/credits\.html/.test(location.pathname);
    var onLogin=/login\.html/.test(location.pathname);
    var nx=currentAsNext();
    function appendHref(a){
      var h=a.getAttribute('href'); if(!h) return;
      if(/[?&]next=/.test(h)) return;
      a.setAttribute('href',h+(h.indexOf('?')>=0?'&':'?')+'next='+nx);
    }
    if(!onLogin){
      document.querySelectorAll('a[href*="login.html"]').forEach(appendHref);
    }
    if(!onCredits){
      document.querySelectorAll('a[href*="credits.html"]').forEach(appendHref);
      // onclick="...credits.html..." 改用事件監聽帶上 next（靜態鎖點按鈕）。
      document.querySelectorAll('[onclick*="credits.html"]').forEach(function(el){
        el.removeAttribute('onclick');
        el.style.cursor='pointer';
        el.addEventListener('click',function(e){
          e.preventDefault();
          window.location.href='/pages/credits.html?next='+nx;
        });
      });
    }
  }

  // 資料抓取失敗時：明確標示下方為示意內容，不讓靜態 fallback 假冒真資料。
  window.PX_showDataError=function(msg){
    if(document.getElementById('px-data-error')) return;
    var bar=document.createElement('div');
    bar.id='px-data-error';
    bar.textContent=msg||'⚠ 今日資料載入失敗，下方為示意內容，請稍後重新整理。';
    bar.style.cssText='position:sticky;top:56px;z-index:90;background:#fef3c7;color:#92400e;'
      +'border-bottom:1px solid #fcd34d;font:600 13px/1.5 "Noto Sans TC",sans-serif;'
      +'padding:10px 16px;text-align:center;';
    document.body.insertBefore(bar,document.body.firstChild);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',injectNext);
  else injectNext();
})();
