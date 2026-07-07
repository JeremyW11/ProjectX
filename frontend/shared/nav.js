(function(){
  // 桌面版頂部導覽：總覽｜情報▾｜觀點▾｜數據▾｜會員專屬。方案/點數移至 header-right 作 CTA，不佔一級選單。
  // 分組後不受寬度限制，全部 13 個功能皆可從此結構抵達（先前縮排版隱藏的全球追蹤/互動圖表/歷史報告已收回選單）。
  var NAV_GROUPS = [
    {type:'link', key:'brief', href:'/brief.html', label:'總覽'},
    {type:'group', label:'情報', items:[
      {key:'market',   href:'/pages/market.html',        label:'市場',     icon:'chart',  pro:false, desc:'美股、台股、加密即時報價，Pro 可開互動圖表'},
      {key:'industry', href:'/pages/industry.html',      label:'產業',     icon:'chip',   pro:false, desc:'半導體、AI 等重點產業資金與族群動態'},
      {key:'research', href:'/pages/institutional.html', label:'機構研報', icon:'bank',   pro:false, desc:'國際大行評級調整、財報日曆與法說摘要'},
      {key:'calendar', href:'/pages/calendar.html',      label:'市場日曆', icon:'cal',    pro:false, desc:'重要經濟數據與財報公布時程一覽'},
      {key:'stories',  href:'/pages/stories.html',       label:'全球追蹤', icon:'world',  pro:true,  desc:'地緣政治、政策事件跨日時間軸持續追蹤'}
    ]},
    {type:'group', label:'觀點', items:[
      {key:'columns',     href:'/pages/columns.html',     label:'名家觀點', icon:'users',  pro:true, desc:'七位投資名家 AI 人格輪番評述市場'},
      {key:'predictions', href:'/pages/predictions.html', label:'事件預判', icon:'target', pro:true, desc:'每日三類市場預判，追蹤至驗收命中率'}
    ]},
    {type:'group', label:'數據', items:[
      {key:'performance', href:'/pages/performance.html', label:'歷史數據', icon:'history', pro:true,  desc:'機會清單與事件預判的完整命中率戰績'},
      {key:'chart',       href:'/pages/chart.html',       label:'互動圖表', icon:'chart',   pro:true,  desc:'K 線圖表、訂單簿熱力圖與技術訊號'},
      {key:'archive',     href:'/pages/archive.html',     label:'歷史報告', icon:'folder',  pro:false, desc:'每日早報歷史存檔，隨時回顧'}
    ]},
    {type:'link', key:'member', href:'/pages/targets.html', label:'會員專屬'}
  ];

  function injectDropdownCss(){
    if(document.getElementById('px-navdrop-css')) return;
    var css = ".nav-group{position:relative;}"
      + ".nav-trigger{background:none;border:none;cursor:pointer;font-family:var(--font-zh);}"
      + ".nav-caret{font-size:10px;margin-left:3px;opacity:.55;display:inline-block;transition:transform .15s;}"
      + ".nav-group.open .nav-caret{transform:rotate(180deg);}"
      + ".nav-dropdown{position:absolute;top:100%;left:0;margin-top:8px;min-width:270px;background:var(--white);border-radius:var(--r-lg);box-shadow:var(--shadow-md);padding:8px;opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .15s,transform .15s;z-index:150;}"
      + ".nav-group.open .nav-dropdown{opacity:1;visibility:visible;transform:translateY(0);}"
      + ".nav-drop-item{display:flex;align-items:flex-start;gap:10px;padding:9px 10px;border-radius:var(--r-sm);text-decoration:none;color:inherit;}"
      + ".nav-drop-item:hover,.nav-drop-item.active{background:var(--navy-50);}"
      + ".ndi-ico{flex-shrink:0;width:18px;height:18px;color:var(--navy-500);margin-top:2px;}"
      + ".ndi-ico svg{width:100%;height:100%;}"
      + ".ndi-body{display:flex;flex-direction:column;gap:2px;min-width:0;}"
      + ".ndi-title{font-size:var(--fs-4);font-weight:600;color:var(--navy-700);font-family:var(--font-zh);display:flex;align-items:center;gap:6px;}"
      + ".ndi-desc{font-size:var(--fs-2);color:var(--gray-500);line-height:1.4;font-family:var(--font-zh);}"
      + "@media(max-width:768px){.nav-dropdown{display:none!important;}}";
    var s=document.createElement('style'); s.id='px-navdrop-css'; s.textContent=css;
    (document.head||document.documentElement).appendChild(s);
  }

  function bindDropdowns(nav){
    var groups = nav.querySelectorAll('.nav-group');
    function closeAll(){ groups.forEach(function(g){ g.classList.remove('open'); var t=g.querySelector('.nav-trigger'); if(t) t.setAttribute('aria-expanded','false'); }); }
    groups.forEach(function(g){
      var trigger = g.querySelector('.nav-trigger');
      var closeTimer = null;
      function open(){
        clearTimeout(closeTimer);
        groups.forEach(function(o){ if(o!==g) o.classList.remove('open'); });
        g.classList.add('open'); trigger.setAttribute('aria-expanded','true');
      }
      trigger.addEventListener('click', function(e){
        e.stopPropagation();
        g.classList.contains('open') ? closeAll() : open();
      });
      g.addEventListener('mouseenter', open);
      g.addEventListener('mouseleave', function(){ closeTimer = setTimeout(function(){ g.classList.remove('open'); trigger.setAttribute('aria-expanded','false'); }, 150); });
    });
    document.addEventListener('click', function(e){
      groups.forEach(function(g){ if(!g.contains(e.target)) g.classList.remove('open'); });
    });
  }

  window.buildNav = function(activeKey){
    // Support both .header-nav (standard) and .nav-links (industry.html ul-based)
    var nav = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(!nav) return;
    injectDropdownCss();
    var isUl = nav.tagName === 'UL';
    var activeGroupLabel = null;
    NAV_GROUPS.forEach(function(g){ if(g.type==='group' && g.items.some(function(it){ return it.key===activeKey; })) activeGroupLabel = g.label; });
    var ico = window.ICO || {};
    nav.innerHTML = NAV_GROUPS.map(function(g){
      if(g.type==='link'){
        var active = g.key === activeKey;
        var link = '<a href="'+g.href+'" class="nav-item'+(active?' active':'')+'">'
          +(active?'<span class="nav-dot"></span>':'')+g.label+'</a>';
        return isUl ? '<li>'+link+'</li>' : link;
      }
      var groupActive = g.label === activeGroupLabel;
      var itemsHtml = g.items.map(function(it){
        var active = it.key === activeKey;
        return '<a href="'+it.href+'" class="nav-drop-item'+(active?' active':'')+'">'
          +'<span class="ndi-ico">'+(ico[it.icon]||'')+'</span>'
          +'<span class="ndi-body"><span class="ndi-title">'+it.label+(it.pro?' <span class="pro-badge">PRO</span>':'')+'</span>'
          +'<span class="ndi-desc">'+it.desc+'</span></span>'
          +'</a>';
      }).join('');
      var trigger = '<button type="button" class="nav-item nav-trigger'+(groupActive?' active':'')+'" aria-haspopup="true" aria-expanded="false">'
        +(groupActive?'<span class="nav-dot"></span>':'')+g.label+'<span class="nav-caret">▾</span></button>';
      var body = '<div class="nav-group">'+trigger+'<div class="nav-dropdown">'+itemsHtml+'</div></div>';
      return isUl ? '<li class="nav-group-li">'+body+'</li>' : body;
    }).join('');
    bindDropdowns(nav);
  };

  // ── 行動裝置導覽（≤768px）：桌面 nav 在窄螢幕被各頁 CSS 隱藏卻無替代，
  //    這裡統一注入漢堡選單＋抽屜，從同一份 NAV_GROUPS 生成，一處修正涵蓋全站。
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
      + ".px-mobile-menu .px-mm-link{color:#475569;font-size:18px;font-weight:500;padding:15px 4px;padding-left:8px;border-bottom:1px solid #f1f5f9;text-decoration:none;font-family:'Noto Sans TC','DM Sans',sans-serif;}"
      + ".px-mobile-menu .px-mm-link.active{color:#2563eb;font-weight:700;}"
      + ".px-mobile-menu .px-mm-section{margin-top:14px;font-size:12px;font-weight:700;letter-spacing:.06em;color:#94a3b8;text-transform:uppercase;font-family:'DM Sans',sans-serif;}"
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

    var btn=document.createElement('button');
    btn.className='px-hamburger'; btn.id='px-hamburger'; btn.type='button';
    btn.setAttribute('aria-label','開啟選單'); btn.setAttribute('aria-expanded','false');
    btn.innerHTML='<span></span><span></span><span></span>';
    bar.appendChild(btn);

    var menu=document.createElement('div');
    menu.className='px-mobile-menu'; menu.id='px-mobile-menu';
    menu.innerHTML = NAV_GROUPS.map(function(g){
      if(g.type==='link'){
        return '<a class="px-mm-link'+(g.key===activeKey?' active':'')+'" href="'+g.href+'">'+g.label+'</a>';
      }
      return '<div class="px-mm-section">'+g.label+'</div>' + g.items.map(function(it){
        return '<a class="px-mm-link'+(it.key===activeKey?' active':'')+'" href="'+it.href+'">'+it.label+(it.pro?' <span class="pro-badge">PRO</span>':'')+'</a>';
      }).join('');
    }).join('')
      + '<div class="px-mm-btns">'
      +   '<a class="px-mm-login" href="/pages/login.html">登入</a>'
      +   '<a class="px-mm-pro" href="/pages/credits.html">訂閱 Pro</a>'
      + '</div>'
      + '<div class="px-mm-foot">'+(window.ICO&&ICO.lightning||'')+' Powered by OrionAI</div>';
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

  // 方案/點數(credits)不佔一級選單，改在 header-right 插入金色 CTA，全站一致（credits.html 本身不插自連結）
  function injectCreditsLink(activeKey){
    if(activeKey==='credits') return;
    var box=document.querySelector('.header-right, .topbar-right, .nav-right');
    if(!box || box.querySelector('.nav-credits-link')) return;
    if(document.getElementById('px-credits-css')===null){
      var css = ".nav-credits-link{display:inline-flex;align-items:center;padding:7px 14px;border-radius:var(--r-sm);font-size:var(--fs-3);font-weight:600;color:var(--pro-gold-dark);background:var(--pro-gold-light);font-family:var(--font-zh);text-decoration:none;white-space:nowrap;}"
        + ".nav-credits-link:hover{background:var(--pro-gold);color:#fff;}"
        + "@media(max-width:768px){.nav-credits-link{display:none;}}";
      var s=document.createElement('style'); s.id='px-credits-css'; s.textContent=css;
      (document.head||document.documentElement).appendChild(s);
    }
    var a=document.createElement('a');
    a.className='nav-credits-link'; a.href='/pages/credits.html'; a.textContent='方案 / 點數';
    var anchor=box.querySelector('.btn-login,#auth-btn,a[href*="login"]');
    if(anchor) box.insertBefore(a,anchor); else box.appendChild(a);
  }

  document.addEventListener('DOMContentLoaded', function(){
    var nav = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(nav){
      window.buildNav(nav.dataset.active);
      buildMobileNav(nav.dataset.active);
      injectCreditsLink(nav.dataset.active);
    }
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

// ── OrionAI 文字 LOGO：全站自動把「OrionAI」字眼轉為品牌字標 ──
// Badge 樣式（純色，對齊 Vela 識別）：ink #0B1F4D 膠囊，白字 Orion + 青色 #39D5FF AI；無漸層/陰影/發光。行內隨文字自動縮放、垂直置中。含 MutationObserver 以涵蓋動態渲染內容。
(function(){
  var LOGO_CSS = ".pulseai-logo{display:inline-flex;align-items:baseline;font-family:'DM Sans','Noto Sans TC',sans-serif;font-weight:600;letter-spacing:-.01em;white-space:nowrap;font-style:normal;background:#0B1F4D;color:#fff;border-radius:.42em;padding:.1em .5em;line-height:1.15;vertical-align:baseline;}"
    + ".pulseai-logo .pa-pulse{font-weight:700;color:#ffffff;}"
    + ".pulseai-logo .pa-ai{font-weight:800;color:#39D5FF;margin-left:.05em;}";
  function injectCss(){
    if(document.getElementById('pulseai-logo-css')) return;
    var s=document.createElement('style'); s.id='pulseai-logo-css'; s.textContent=LOGO_CSS;
    (document.head||document.documentElement).appendChild(s);
  }
  var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,SELECT:1,OPTION:1,NOSCRIPT:1,TITLE:1};
  function makeLogo(){
    var s=document.createElement('span'); s.className='pulseai-logo';
    var p=document.createElement('span'); p.className='pa-pulse'; p.textContent='Orion';
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
    if(!val || val.indexOf('OrionAI')<0) return;
    if(skipParent(node.parentNode)) return;
    var parts=val.split('OrionAI');
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
    while((n=walker.nextNode())){ if(n.nodeValue && n.nodeValue.indexOf('OrionAI')>=0) nodes.push(n); }
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
