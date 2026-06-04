(function(){
  var NAV = [
    {key:'brief',    href:'/brief.html',                  label:'總覽'},
    {key:'market',   href:'/pages/market.html',           label:'市場'},
    {key:'industry', href:'/pages/industry.html',         label:'產業'},
    {key:'research', href:'/pages/institutional.html',    label:'機構研報'},
    {key:'calendar', href:'/pages/calendar.html',         label:'市場日曆'},
    {key:'stories',  href:'/pages/stories.html',          label:'全球追蹤'},
    {key:'chart',    href:'/pages/chart.html',             label:'互動圖表'},
    {key:'member',   href:'/pages/targets.html',          label:'會員中心'},
    {key:'archive',  href:'/pages/archive.html',          label:'歷史報告'},
    {key:'credits',  href:'/pages/credits.html',          label:'方案 / 點數'},
  ];

  // 縮排版頂部導覽：全球追蹤／互動圖表／歷史報告已整併進會員中心側欄；
  // 方案點數(credits)保留於 toolbar 作為訪客購點入口。個別頁面仍可用 data-nav-keys 覆寫。
  var TOOLBAR_KEYS = ['brief','market','industry','research','calendar','member','credits'];

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

  document.addEventListener('DOMContentLoaded', function(){
    var nav = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(nav) window.buildNav(nav.dataset.active);
  });
})();

// ── PulseAI 文字 LOGO：全站自動把「PulseAI」字眼轉為品牌字標 ──
// Badge 樣式（漸層實心）：深藍→藍漸層膠囊，白字 Pulse + 青色 AI；行內隨文字自動縮放、垂直置中。含 MutationObserver 以涵蓋動態渲染內容。
(function(){
  var LOGO_CSS = ".pulseai-logo{display:inline-flex;align-items:baseline;font-family:'DM Sans','Noto Sans TC',sans-serif;font-weight:600;letter-spacing:-.01em;white-space:nowrap;font-style:normal;background:linear-gradient(135deg,#1e40af,#2563eb 50%,#0ea5e9);box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 0 0 1px rgba(255,255,255,.30),inset 0 -1px 1px rgba(0,0,0,.22),0 1px 3px rgba(8,15,40,.45);color:#fff;border-radius:.45em;padding:.1em .46em;line-height:1.15;vertical-align:baseline;}"
    + ".pulseai-logo .pa-pulse,.pulseai-logo .pa-ai{-webkit-text-fill-color:initial;}"
    + ".pulseai-logo .pa-pulse{color:#f4f8ff;text-shadow:0 1px 1px rgba(0,0,0,.35);}"
    + ".pulseai-logo .pa-ai{font-weight:700;color:#9af0fb;margin-left:.02em;text-shadow:0 1px 1px rgba(0,0,0,.35);}"
    + "@supports ((-webkit-background-clip:text) or (background-clip:text)){"
    + ".pulseai-logo .pa-pulse{background:linear-gradient(180deg,#ffffff 0%,#ffffff 42%,#d4e1f8 60%,#f3f7ff 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}"
    + ".pulseai-logo .pa-ai{background:linear-gradient(180deg,#ecfdff 0%,#a5f3fc 44%,#3fdcf5 62%,#cdf7fd 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;}}";
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
