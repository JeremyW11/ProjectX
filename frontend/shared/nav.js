(function(){
  var NAV = [
    {key:'brief',    href:'/brief.html',                  label:'總覽'},
    {key:'market',   href:'/pages/market.html',           label:'市場'},
    {key:'industry', href:'/pages/industry.html',         label:'產業'},
    {key:'research', href:'/pages/institutional.html',    label:'機構研報'},
    {key:'calendar', href:'/pages/calendar.html',         label:'市場日曆'},
    {key:'stories',  href:'/pages/stories.html',          label:'全球追蹤'},
    {key:'columns',  href:'/pages/columns.html',           label:'名家觀點'},
    {key:'predictions', href:'/pages/predictions.html',   label:'事件預判'},
    {key:'performance', href:'/pages/performance.html',   label:'歷史數據'},
    {key:'chart',    href:'/pages/chart.html',             label:'互動圖表'},
    {key:'member',   href:'/pages/targets.html',          label:'會員專屬'},
    {key:'archive',  href:'/pages/archive.html',          label:'歷史報告'},
    {key:'credits',  href:'/pages/credits.html',          label:'方案 / 點數'},
  ];

  // 縮排版頂部導覽：全球追蹤／互動圖表／歷史報告整併進會員中心側欄；名家觀點(columns)
  // 因落地頁主推、保留於 toolbar。方案點數(credits)作為訪客購點入口。個別頁面可用 data-nav-keys 覆寫。
  var TOOLBAR_KEYS = ['brief','market','industry','research','calendar','columns','predictions','performance','member','credits'];

  window.buildNav = function(activeKey){
    // Support both .header-nav (standard) and .nav-links (industry.html ul-based)
    var nav = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(!nav) return;
    // 可選：data-nav-keys 覆寫顯示項目（逗號分隔）；未指定則用縮排版預設
    var keys = nav.dataset.navKeys ? nav.dataset.navKeys.split(',').map(function(k){return k.trim();}) : TOOLBAR_KEYS;
    var list = NAV.filter(function(i){ return keys.indexOf(i.key) >= 0; });
    var isUl = nav.tagName === 'UL';
    nav.innerHTML = list.map(function(item){
      var active = item.key === activeKey;
      var link = '<a href="'+item.href+'" class="nav-item'+(active?' active':'')+'">'
        +(active?'<span class="nav-dot"></span>':'')+item.label+'</a>';
      return isUl ? '<li>'+link+'</li>' : link;
    }).join('');
  };

  // ── 行動裝置導覽（≤768px）：桌面 nav 在窄螢幕被各頁 CSS 隱藏卻無替代，
  //    這裡統一注入漢堡選單＋抽屜，從同一份 NAV 生成，一處修正涵蓋全站。
  //    頁面若已自帶漢堡（如 industry.html）則跳過，避免重複。
  function injectMobileCss(){
    if(document.getElementById('px-mnav-css')) return;
    var css = ".px-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;cursor:pointer;padding:6px;background:none;border:none;margin-left:8px;flex-shrink:0;}"
      + ".px-hamburger span{display:block;width:22px;height:2px;background:#334155;border-radius:2px;transition:transform .3s,opacity .3s;}"
      + ".px-hamburger.open span:nth-child(1){transform:rotate(45deg) translate(5px,5px);}"
      + ".px-hamburger.open span:nth-child(2){opacity:0;}"
      + ".px-hamburger.open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px);}"
      + ".px-mobile-menu{display:none;position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.975);backdrop-filter:blur(14px);z-index:198;padding:16px 22px 36px;flex-direction:column;overflow-y:auto;border-top:1px solid #e5e7eb;}"
      + ".px-mobile-menu.open{display:flex;}"
      + ".px-mobile-menu .px-mm-link{color:#475569;font-size:18px;font-weight:500;padding:15px 4px;border-bottom:1px solid #f1f5f9;text-decoration:none;font-family:'Noto Sans TC','DM Sans',sans-serif;}"
      + ".px-mobile-menu .px-mm-link.active{color:#2563eb;font-weight:700;}"
      + ".px-mm-btns{margin-top:20px;display:flex;flex-direction:column;gap:10px;}"
      + ".px-mm-btns a{text-align:center;padding:12px;border-radius:9px;text-decoration:none;font-size:15px;font-family:'Noto Sans TC',sans-serif;}"
      + ".px-mm-login{border:1px solid #cbd5e1;color:#475569;}"
      + ".px-mm-pro{background:linear-gradient(135deg,#1e40af,#2563eb);color:#fff;font-weight:600;}"
      + ".px-mm-foot{margin-top:24px;text-align:center;font-size:12px;color:#94a3b8;font-family:'DM Sans',sans-serif;letter-spacing:.02em;}"
      + "@media(max-width:768px){.header-nav{display:none!important;}.header-right{display:none!important;}.px-hamburger{display:flex;}}";
    var s=document.createElement('style'); s.id='px-mnav-css'; s.textContent=css;
    (document.head||document.documentElement).appendChild(s);
  }

  function buildMobileNav(activeKey){
    if(document.getElementById('px-mobile-menu')) return;
    if(document.getElementById('hamburger') || document.querySelector('.hamburger')) return; // 頁面自帶
    var navEl = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    var bar = navEl && navEl.closest ? navEl.closest('.topbar, .header, header') : null;
    if(!bar) return;
    injectMobileCss();

    var list = NAV.filter(function(i){ return TOOLBAR_KEYS.indexOf(i.key) >= 0; });

    var btn=document.createElement('button');
    btn.className='px-hamburger'; btn.id='px-hamburger'; btn.type='button';
    btn.setAttribute('aria-label','開啟選單'); btn.setAttribute('aria-expanded','false');
    btn.innerHTML='<span></span><span></span><span></span>';
    bar.appendChild(btn);

    var menu=document.createElement('div');
    menu.className='px-mobile-menu'; menu.id='px-mobile-menu';
    menu.innerHTML = list.map(function(item){
      return '<a class="px-mm-link'+(item.key===activeKey?' active':'')+'" href="'+item.href+'">'+item.label+'</a>';
    }).join('')
      + '<div class="px-mm-btns">'
      +   '<a class="px-mm-login" href="/pages/login.html">登入</a>'
      +   '<a class="px-mm-pro" href="/pages/credits.html">訂閱 Pro</a>'
      + '</div>'
      + '<div class="px-mm-foot">⚡ Powered by PulseAI</div>';
    document.body.appendChild(menu);

    function position(){ menu.style.top = bar.getBoundingClientRect().bottom + 'px'; }
    position();

    function close(){ menu.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
    btn.addEventListener('click', function(){
      position();
      var open = menu.classList.toggle('open');
      btn.classList.toggle('open');
      btn.setAttribute('aria-expanded', open?'true':'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });
    window.addEventListener('resize', function(){ if(window.innerWidth>768) close(); else position(); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var nav = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(nav){ window.buildNav(nav.dataset.active); buildMobileNav(nav.dataset.active); }
  });
})();

// ── 全站置頂公告（內測期間）──
// 注入固定頂部公告條，並把固定式 header(.topbar/.header) 與整體內文下移 banner 高度，
// 一處注入即涵蓋全站。高度隨換行/視窗變動即時重算；行動選單已改用 header 實際底緣定位故自動跟隨。
(function(){
  var TEXT_HTML = '內測實施中，所有權限<b>免費申請</b>，將由後台審核後開放。';
  function injectCss(){
    if(document.getElementById('px-announce-css')) return;
    var css = ".px-announce{position:fixed;top:0;left:0;right:0;z-index:300;"
      + "background:linear-gradient(135deg,#0d1630,#1d2d5a);color:#fff;"
      + "font-family:'Noto Sans TC','DM Sans',sans-serif;font-size:13px;font-weight:500;"
      + "letter-spacing:.02em;text-align:center;line-height:1.5;padding:8px 44px;"
      + "box-shadow:0 1px 6px rgba(8,15,40,.35);}"
      + ".px-announce b{color:#f6c84b;font-weight:700;}"
      + "@media(max-width:768px){.px-announce{font-size:12px;padding:7px 16px;}}";
    var s=document.createElement('style'); s.id='px-announce-css'; s.textContent=css;
    (document.head||document.documentElement).appendChild(s);
  }
  var _bar=null, _baseBodyPad=0;
  // 找出頁面頂部那條固定/吸附的 header bar。各頁寫法不一：.topbar / .header / 裸 <nav>
  // （industry.html）/ 裸 <header>。除了 class 比對，也從導覽清單往上找它所在的 bar，涵蓋無 class 的情況。
  function collectBars(){
    var set=[];
    function add(el){ if(el && set.indexOf(el)<0) set.push(el); }
    var q=document.querySelectorAll('.topbar, .header');
    for(var i=0;i<q.length;i++) add(q[i]);
    var navEl=document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(navEl && navEl.closest) add(navEl.closest('.topbar, .header, header, nav'));
    return set;
  }
  function apply(){
    if(!_bar) return;
    var h=_bar.offsetHeight||0;
    // 用 padding-top 而非 margin-top：margin 會與內文首個子元素的 margin-top 摺疊，
    // 導致實際沒推開、固定 header 下移後蓋住內文頂端。padding 不摺疊，能確實留白。
    document.body.style.paddingTop=(_baseBodyPad+h)+'px';
    var bars=collectBars();
    for(var i=0;i<bars.length;i++){
      var pos=window.getComputedStyle(bars[i]).position;
      if(pos==='fixed'||pos==='sticky') bars[i].style.top=h+'px';
    }
  }
  function init(){
    if(document.getElementById('px-announce')) return;
    if(!document.body) return;
    injectCss();
    _baseBodyPad=parseFloat(window.getComputedStyle(document.body).paddingTop)||0;
    _bar=document.createElement('div');
    _bar.className='px-announce'; _bar.id='px-announce'; _bar.setAttribute('role','status');
    _bar.innerHTML=TEXT_HTML;
    document.body.insertBefore(_bar, document.body.firstChild);
    apply();
    window.addEventListener('resize', apply);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

// ── PulseAI 文字 LOGO：全站自動把「PulseAI」字眼轉為品牌字標 ──
// Badge 樣式（漸層實心）：深藍→藍漸層膠囊，白字 Pulse + 青色 AI；行內隨文字自動縮放、垂直置中。含 MutationObserver 以涵蓋動態渲染內容。
(function(){
  var LOGO_CSS = ".pulseai-logo{display:inline-flex;align-items:baseline;font-family:'DM Sans','Noto Sans TC',sans-serif;font-weight:600;letter-spacing:-.01em;white-space:nowrap;font-style:normal;background:linear-gradient(135deg,#1e40af,#2563eb 50%,#0ea5e9);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 0 0 1px rgba(255,255,255,.30),inset 0 -1px 1px rgba(0,0,0,.22),0 1px 3px rgba(8,15,40,.45);color:#fff;border-radius:.45em;padding:.1em .46em;line-height:1.15;vertical-align:baseline;}"
    + ".pulseai-logo .pa-pulse,.pulseai-logo .pa-ai{-webkit-text-fill-color:initial;}"
    + ".pulseai-logo .pa-pulse{font-weight:700;color:#ffffff;text-shadow:0 1px 2px rgba(0,0,0,.45);}"
    + ".pulseai-logo .pa-ai{font-weight:800;color:#a5f9ff;margin-left:.04em;text-shadow:0 1px 2px rgba(0,0,0,.45);}"
    + "@supports ((-webkit-background-clip:text) or (background-clip:text)){"
    + ".pulseai-logo .pa-pulse{background:linear-gradient(180deg,#ffffff 0%,#ffffff 55%,#eaf1ff 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}"
    + ".pulseai-logo .pa-ai{background:linear-gradient(180deg,#dffcff 0%,#9bf6ff 55%,#5ee7f5 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}}";
  function injectCss(){
    if(document.getElementById('pulseai-logo-css')) return;
    var s=document.createElement('style'); s.id='pulseai-logo-css'; s.textContent=LOGO_CSS;
    (document.head||document.documentElement).appendChild(s);
  }
  var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,NOSCRIPT:1,TITLE:1};
  function makeLogo(){
    var s=document.createElement('span'); s.className='pulseai-logo';
    var p=document.createElement('span'); p.className='pa-pulse'; p.textContent='Pulse';
    s.appendChild(p);
    var ai=document.createElement('span'); ai.className='pa-ai'; ai.textContent='AI';
    s.appendChild(ai);
    return s;
  }
  function skipParent(p){
    while(p && p.nodeType===1){
      if(SKIP[p.tagName]) return true;
      if(p.classList && p.classList.contains('pulseai-logo')) return true;
      if(p.isContentEditable) return true;
      p=p.parentNode;
    }
    return false;
  }
  function wrapTextNode(node){
    var val=node.nodeValue;
    if(!val || val.indexOf('PulseAI')<0) return;
    if(skipParent(node.parentNode)) return;
    var parts=val.split('PulseAI');
    var frag=document.createDocumentFragment();
    for(var i=0;i<parts.length;i++){
      if(i>0) frag.appendChild(makeLogo());
      if(parts[i]) frag.appendChild(document.createTextNode(parts[i]));
    }
    node.parentNode.replaceChild(frag,node);
  }
  function scan(root){
    if(!root) return;
    if(root.nodeType===3){ wrapTextNode(root); return; }
    if(root.nodeType!==1 && root.nodeType!==9 && root.nodeType!==11) return;
    if(root.nodeType===1 && SKIP[root.tagName]) return;
    var walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes=[],n;
    while((n=walker.nextNode())){ if(n.nodeValue && n.nodeValue.indexOf('PulseAI')>=0) nodes.push(n); }
    nodes.forEach(wrapTextNode);
  }
  var _busy=false;
  function init(){
    injectCss();
    _busy=true; scan(document.body); _busy=false;
    if(window.MutationObserver){
      var obs=new MutationObserver(function(muts){
        if(_busy) return;
        _busy=true;
        for(var i=0;i<muts.length;i++){
          var added=muts[i].addedNodes;
          for(var j=0;j<added.length;j++) scan(added[j]);
        }
        _busy=false;
      });
      obs.observe(document.body,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
