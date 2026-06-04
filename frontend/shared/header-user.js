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

  function init(){
    if(!window.supabase || !window.supabase.createClient) return;
    var sb;
    try{
      sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{autoRefreshToken:false,persistSession:true}});
    }catch(e){ return; }

    function refresh(session){
      if(!session || !session.user){ setName(''); return; }
      var u=session.user;
      var name=(u.user_metadata && u.user_metadata.display_name) || (u.email ? u.email.split('@')[0] : '');
      setName(name);
      // 以 profiles 的暱稱校正（使用者若改過暱稱，metadata 可能較舊）
      sb.from('profiles').select('display_name').eq('id',u.id).single().then(function(r){
        if(r && r.data && r.data.display_name) setName(r.data.display_name);
      });
    }

    sb.auth.getSession().then(function(res){ refresh(res && res.data ? res.data.session : null); });
    sb.auth.onAuthStateChange(function(ev,session){ refresh(session); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
