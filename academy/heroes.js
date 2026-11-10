/* إنجازات أبطالنا: عرض عام بإشراف المعلمة، وأوسمة شخصية محفوظة على جهاز الطالب. */
(function(){
'use strict';
if(window.__academyHeroesV1)return;
window.__academyHeroesV1=true;
var achievements=[],failed=false;
var e=x=>String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});
function validItems(data){
  if(!data||!Array.isArray(data.items))return [];
  return data.items.filter(function(x){
    return x&&x.approved===true&&x.guardianConsent===true&&typeof x.name==='string'&&x.name.trim()&&typeof x.skill==='string'&&x.skill.trim();
  }).slice(0,48).map(function(x){
    return {name:x.name.trim().slice(0,60),skill:x.skill.trim().slice(0,90),badge:typeof x.badge==='string'?x.badge.trim().slice(0,50):'وسام الإنجاز',date:/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')?x.date:''};
  });
}
function cta(){
  return '<section class="heroes-home"><div class="heroes-home-icon" aria-hidden="true">🏅</div><div class="heroes-home-copy"><strong>إنجازات أبطالنا</strong><p>نحتفي بكل خطوة إتقان، ونوثّق الإنجازات بإشراف المعلمة</p></div><button type="button" data-ac-heroes="1">اكتشف إنجازاتنا</button></section>';
}
function formattedDate(value){
  if(!value)return '';
  try{return new Date(value+'T12:00:00').toLocaleDateString('ar-SA',{day:'numeric',month:'long',year:'numeric'})}catch{return ''}
}
function heroCards(){
  if(failed)return '<div class="heroes-empty"><div aria-hidden="true">📶</div><strong>تعذر تحديث الإنجازات الآن</strong><p>تحقق من الاتصال ثم افتح الركن مرة أخرى</p><button type="button" data-ac-refresh-heroes="1">تحديث</button></div>';
  if(!achievements.length)return '<div class="heroes-empty"><div aria-hidden="true">🌟</div><strong>إنجازات جميلة في الطريق!</strong><p>تُضاف أسماء الأبطال بعد التحقق من إنجازاتهم والحصول على موافقة الأسرة، دون صور أو بيانات إضافية</p></div>';
  return '<div class="heroes-gallery">'+achievements.map(function(a){
    return '<article class="heroes-student"><div class="heroes-medal" aria-hidden="true">🏆</div><span class="heroes-badge">'+e(a.badge)+'</span><h2>'+e(a.name)+'</h2><p>'+e(a.skill)+'</p>'+(a.date?'<small>تاريخ الإنجاز: '+e(formattedDate(a.date))+'</small>':'')+'</article>';
  }).join('')+'</div>';
}
function heroPage(){
  return '<section class="heroes-page"><button type="button" class="heroes-back" data-nav="home">↩ الرجوع للرئيسية</button><div class="heroes-title"><span aria-hidden="true">🏆</span><div><p>أكاديمية الرياضيات الصغيرة</p><h1>إنجازات أبطالنا</h1><p>كل إنجاز صغير بداية لنجاح كبير</p></div></div><div id="heroesPublicList">'+heroCards()+'</div><div class="heroes-privacy">🔒 تُعرض الأسماء بعد مراجعة المعلمة وموافقة ولي الأمر فقط. لا تُنشر صور الطلاب أو درجاتهم أو بياناتهم الشخصية.</div><p class="heroes-teacher">إعداد وتنفيذ: أ. ابتهال الحجيلي</p></section>';
}
function refreshWall(){
  if(!/^#\/?heroes(?:\/|$)/.test(location.hash))return;
  var list=document.getElementById('heroesPublicList');
  if(list)list.innerHTML=heroCards();
}
async function fetchWall(){
  try{
    var response=await fetch('./heroes.json?at='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('No published roster');
    achievements=validItems(await response.json());failed=false;
  }catch(error){failed=true;}
  refreshWall();
}
function awardSection(s){
  var count=s.questions.length;
  if(!count||s.score/count<0.75)return '';
  var stars='★'.repeat(Math.max(1,Math.round(s.score/count*5)));
  return '<section class="heroes-award"><div class="heroes-award-icon" aria-hidden="true">🏆</div><div><small>أكاديمية الرياضيات الصغيرة</small><h3>وسام بطل الرياضيات</h3><p>أحسنت! أكملت مغامرة <strong>'+e(s.lesson.title)+'</strong></p><div class="heroes-award-stars" aria-label="نجوم الإنجاز">'+stars+'</div></div><div class="heroes-award-actions"><button type="button" data-ac-award-save="1">⬇ حفظ الوسام صورة</button><button type="button" data-ac-award-share="1">♡ مشاركة الوسام</button></div><small class="heroes-award-hint">هذا وسام شخصي على جهازك، ولا ينشر اسمك أو نتيجتك في الركن العام</small></section>';
}
function awardBlob(s){
  return new Promise(function(resolve){
    var cv=document.createElement('canvas');cv.width=1200;cv.height=675;
    var c=cv.getContext('2d');if(!c){resolve(null);return;}
    var g=c.createLinearGradient(0,0,1200,675);g.addColorStop(0,'#e8fbf9');g.addColorStop(.68,'#fffdf7');g.addColorStop(1,'#fff1d1');
    c.fillStyle=g;c.fillRect(0,0,1200,675);
    c.strokeStyle='#183957';c.lineWidth=16;c.strokeRect(20,20,1160,635);
    c.strokeStyle='#d5a944';c.lineWidth=4;c.strokeRect(39,39,1122,597);
    c.direction='rtl';c.textAlign='center';c.fillStyle='#183957';
    c.font='bold 32px Tahoma,Arial,sans-serif';c.fillText('أكاديمية الرياضيات الصغيرة',600,116);
    c.font='92px Arial,sans-serif';c.fillText('🏆',600,218);
    c.font='bold 60px Tahoma,Arial,sans-serif';c.fillText('وسام بطل الرياضيات',600,305);
    c.font='bold 36px Tahoma,Arial,sans-serif';c.fillText('أحسنت! لقد أتممت مغامرة',600,375);
    c.font='bold 45px Tahoma,Arial,sans-serif';c.fillText(s.lesson.title,600,441,1000);
    c.fillStyle='#b78c20';c.font='52px Tahoma,Arial,sans-serif';c.fillText('★ ★ ★ ★ ★',600,516);
    c.fillStyle='#183957';c.font='bold 27px Tahoma,Arial,sans-serif';c.fillText('تعلّم، فكّر، اكتشف، وأبدع',600,583);
    c.font='21px Tahoma,Arial,sans-serif';c.fillText('إعداد وتنفيذ: أ. ابتهال الحجيلي',600,620);
    cv.toBlob(function(blob){resolve(blob)},'image/png');
  });
}
function saveBlob(blob,name){
  var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url)},3000);
}
async function exportAward(share){
  var s=session;
  if(!s||!s.saved||!s.questions.length||s.score/s.questions.length<.75){showToast('أكمل التدريب أولًا لتحصل على الوسام');return;}
  var blob=await awardBlob(s);if(!blob){showToast('تعذر تجهيز الوسام');return;}
  var filename='وسام-أكاديمية-الرياضيات.png';
  if(share&&navigator.share&&navigator.canShare){
    var file=new File([blob],filename,{type:'image/png'});
    if(navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file],title:'وسام بطل الرياضيات',text:'أكملت مغامرة '+s.lesson.title});return}
      catch(error){if(error.name==='AbortError')return}
    }
  }
  saveBlob(blob,filename);showToast('تم تجهيز الوسام للصورة، يمكنك مشاركته من المعرض');
}
function installStyles(){
  var style=document.createElement('style');
  style.textContent='.heroes-home{max-width:1040px;margin:18px auto;display:flex;align-items:center;gap:16px;padding:20px 23px;background:linear-gradient(115deg,#eafaf7,#fff9ea);border:1px solid #d6e4db;border-radius:24px;color:#183957}.heroes-home-icon{font-size:40px}.heroes-home-copy{flex:1}.heroes-home-copy strong{font-size:22px}.heroes-home-copy p{font-size:14px;margin:5px 0}.heroes-home button,.heroes-back,.heroes-empty button{border:0;border-radius:13px;background:#127e7c;color:#fff;font-weight:900;padding:13px 18px;cursor:pointer}.heroes-page{max-width:1000px;margin:auto;padding:24px 8px 35px;color:#183957}.heroes-back{background:#e3f3f1;color:#145c60}.heroes-title{text-align:center;background:linear-gradient(125deg,#e9faf7,#fff8e3);border:1px solid #cddfdc;border-radius:27px;margin-top:20px;padding:30px 18px}.heroes-title>span{font-size:64px}.heroes-title h1{font-size:clamp(30px,5vw,44px);margin:8px}.heroes-title p{margin:5px;font-size:17px}.heroes-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:16px;margin:25px auto}.heroes-student{text-align:center;background:#fff;border:1px solid #d9e7e8;border-top:6px solid #d8ab45;border-radius:22px;padding:26px 15px;box-shadow:0 7px 26px #18395711}.heroes-medal{font-size:49px}.heroes-student h2{font-size:24px;margin:8px 0;color:#183957}.heroes-student p{font-size:16px;line-height:1.7;margin:10px 0}.heroes-student small{font-size:13px;color:#557181}.heroes-badge{display:inline-block;background:#fff4d6;color:#836018;border-radius:20px;padding:6px 12px;font-size:13px;font-weight:800}.heroes-empty{margin:25px auto;text-align:center;border:1px dashed #bdd7d2;background:#fff;border-radius:23px;max-width:680px;padding:35px 18px}.heroes-empty>div{font-size:48px}.heroes-empty strong{font-size:22px;display:block;margin:10px 0}.heroes-empty p{line-height:1.9}.heroes-privacy{margin:16px auto;padding:14px;border:1px solid #d7e6e7;border-radius:14px;background:#f4f9fa;font-size:13px;line-height:1.8}.heroes-teacher{text-align:center;font-size:13px;color:#607887}.heroes-award{margin:19px auto 0;padding:22px;max-width:700px;background:linear-gradient(135deg,#fff9e4,#ecfaf8);border:2px solid #ddbe71;border-radius:25px;text-align:center;color:#183957}.heroes-award-icon{font-size:49px}.heroes-award h3{font-size:26px;margin:6px 0}.heroes-award p{font-size:17px;line-height:1.7}.heroes-award-stars{font-size:37px;color:#bd8a11;letter-spacing:3px}.heroes-award-actions{display:flex;gap:10px;justify-content:center;margin:15px 0;flex-wrap:wrap}.heroes-award-actions button{border:0;border-radius:12px;padding:12px 17px;font-weight:900;font-size:15px;background:#147e7b;color:#fff;cursor:pointer}.heroes-award-actions button+button{background:#183957}.heroes-award-hint{display:block;font-size:12px;color:#62798b;line-height:1.7}@media(max-width:650px){.heroes-home{padding:17px 13px;flex-wrap:wrap}.heroes-home-icon{font-size:34px}.heroes-home-copy strong{font-size:19px}.heroes-home button{width:100%}.heroes-award-actions button{width:100%}.heroes-gallery{grid-template-columns:1fr}}';
  document.head.appendChild(style);
}
function mount(){
  installStyles();
  var oldHome=renderHome;
  renderHome=function(){
    return oldHome().replace('<div class="quick-links"',cta()+'<div class="quick-links"');
  };
  var oldRender=render;
  render=function(){
    if(/^#\/?heroes(?:\/|$)/.test(location.hash)){
      document.getElementById('app').innerHTML=heroPage();
      var nav=document.getElementById('mainNav');if(nav)nav.hidden=true;
      document.title='إنجازات أبطالنا | أكاديمية الرياضيات الصغيرة';
      window.scrollTo(0,0);
      return;
    }
    oldRender();
  };
  var oldResult=renderResult;
  renderResult=function(s){return oldResult(s)+awardSection(s)};
  document.addEventListener('click',function(event){
    var b=event.target.closest('button');if(!b)return;
    if(b.dataset.acHeroes){navigate('heroes');return}
    if(b.dataset.acRefreshHeroes){fetchWall();return}
    if(b.dataset.acAwardSave){exportAward(false);return}
    if(b.dataset.acAwardShare){exportAward(true);return}
  });
  var home=document.querySelector('#app .quick-links');
  if(home&&!document.querySelector('.heroes-home'))home.insertAdjacentHTML('beforebegin',cta());
  if(/^#\/?heroes(?:\/|$)/.test(location.hash))render();
  fetchWall();
}
mount();
})();