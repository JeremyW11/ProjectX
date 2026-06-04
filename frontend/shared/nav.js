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

  window.buildNav = function(activeKey){
    // Support both .header-nav (standard) and .nav-links (industry.html ul-based)
    var nav = document.querySelector('.header-nav[data-active], .nav-links[data-active]');
    if(!nav) return;
    var isUl = nav.tagName === 'UL';
    nav.innerHTML = NAV.map(function(item){
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
