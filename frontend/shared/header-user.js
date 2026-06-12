// 在頂部導覽列右側顯示已登入會員名稱（全站共用）。
// 需在 @supabase/supabase-js 載入之後引用。
(function(){
  var SUPABASE_URL='https://eezhmeccakaeiprviqra.supabase.co';
  var SUPABASE_KEY='sb_publishable_qb__g5BMRYLiV2Bin6b1Bw_LwmVARqM';

  function container(){
    return document.querySelector('.header-right, .topbar-right, .nav-right');
  }
  function ensureSpan(){
    var box=container();
    if(!box) return null;
    var el=document.getElementById('header-user');
    if(!el){
      el=document.createElement('span');
      el.id='header-user';
      el.style.cssText='display:none;font-size:13px;color:#1d2d5a;font-weight:600;font-family:"Noto Sans TC",sans-serif;white-space:nowrap;';
      var anchor=box.querySelector('.btn-login,#auth-btn,a[href*="login"]');
      if(anchor) box.insertBefore(el,anchor); else box.appendChild(el);
    }
    return el;
  }
  function setName(name){
    var el=ensureSpan();
    if(!el) return;
    if(name){ el.textContent=name; el.style.display='inline'; }
    else { el.textContent=''; el.style.display='none'; }
  }

  // 工具列站內信箱圖示（全站共用）；未讀紅點掛在圖示右上角
  function ensureInboxIcon(){
    var box=container();
    if(!box) return null;
    var el=document.getElementById('header-inbox');
    if(!el){
      el=document.createElement('a');
      el.id='header-inbox';
      el.href='/pages/inbox.html';
      el.title='站內信箱';
      el.style.cssText='display:none;position:relative;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;color:#475569;transition:background .15s;';
      el.onmouseover=function(){ el.style.background='#f1f5f9'; };
      el.onmouseout=function(){ el.style.background='transparent'; };
      el.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 6L2 7"></path></svg>'
        +'<span class="inbox-badge" style="display:none;position:absolute;top:-3px;right:-3px;min-width:15px;height:15px;line-height:15px;padding:0 3px;border-radius:8px;background:#d92d20;color:#fff;font-size:9.5px;font-weight:700;text-align:center;font-family:\'DM Sans\',sans-serif;box-sizing:border-box;"></span>';
      var anchor=box.querySelector('.btn-login,#auth-btn,a[href*="login"]');
      if(anchor) box.insertBefore(el,anchor); else box.appendChild(el);
    }
    return el;
  }
  function showInboxIcon(show){
    var el=ensureInboxIcon();
    if(el) el.style.display=show?'inline-flex':'none';
  }
  function setBadge(n){
    var el=ensureInboxIcon(); if(!el) return;
    var b=el.querySelector('.inbox-badge'); if(!b) return;
    if(!n){ b.style.display='none'; return; }
    b.textContent=n>99?'99+':n; b.style.display='inline-block';
  }

  function init(){
    if(!window.supabase || !window.supabase.createClient) return;
    var sb;
    try{
      sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{autoRefreshToken:false,persistSession:true}});
    }catch(e){ return; }

    var _loggedIn=false;
    function refreshBadge(){
      if(!_loggedIn){ setBadge(0); return; }
      sb.rpc('inbox_unread_count').then(function(r){
        if(r && !r.error && typeof r.data==='number') setBadge(r.data);
      });
    }
    window.refreshInboxBadge=refreshBadge;

    function refresh(session){
      if(!session || !session.user){ _loggedIn=false; setName(''); showInboxIcon(false); setBadge(0); return; }
      _loggedIn=true;
      showInboxIcon(true);
      var u=session.user;
      var name=(u.user_metadata && u.user_metadata.display_name) || (u.email ? u.email.split('@')[0] : '');
      setName(name);
      // 以 profiles 的暱稱校正（使用者若改過暱稱，metadata 可能較舊）
      sb.from('profiles').select('display_name').eq('id',u.id).single().then(function(r){
        if(r && r.data && r.data.display_name) setName(r.data.display_name);
      });
      refreshBadge();
    }

    sb.auth.getSession().then(function(res){ refresh(res && res.data ? res.data.session : null); });
    sb.auth.onAuthStateChange(function(ev,session){ refresh(session); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
