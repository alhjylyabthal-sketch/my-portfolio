/* إنجازات أبطالنا: عرض عام بإشراف المعلمة، وأوسمة شخصية محفوظة على جهاز الطالب. */
(function(){
'use strict';
if(window.__academyHeroesV1)return;
window.__academyHeroesV1=true;
var achievements=[],failed=false,visibleCount=8;
var heroFilters={search:'',badge:'all',grade:'all',section:'all'};
var e=x=>String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});

function categoryOf(a){
  if(['إتقان','تميز','مثابرة'].includes(a.category))return a.category;
  if(/إتقان|ذهبي/.test(a.badge||''))return 'إتقان';
  if(/مثابرة/.test(a.badge||''))return 'مثابرة';
  return 'تميز';
}
function simpleFirstName(value){
  return String(value||'').trim().split(/\s+/)[0].slice(0,35);
}
function validItems(data){
  if(!data||typeof data!=='object')return [];
  var source=Array.isArray(data.students)?data.students:[];
  if(!source.length&&Array.isArray(data.items)){
    var grouped=new Map();
    data.items.forEach(function(x){
      if(!x||x.approved!==true||x.guardianConsent!==true)return;
      var key=String(x.name||'').trim()+'|'+String(x.grade||'')+'|'+String(x.section||'');
      if(!grouped.has(key))grouped.set(key,{name:x.name,grade:x.grade,section:x.section,approved:true,guardianConsent:true,achievements:[]});
      grouped.get(key).achievements.push(x);
    });
    source=[...grouped.values()];
  }
  var ids=new Set();
  return source.filter(function(x){return x&&x.approved===true&&x.guardianConsent===true&&simpleFirstName(x.name);}).slice(0,2000)
    .map(function(x,i){
      var name=x.fullNameConsent===true?String(x.name||'').trim().replace(/\s+/g,' ').slice(0,60):simpleFirstName(x.name);
      var fallback='hero-'+Array.from(name).map(function(c){return c.codePointAt(0).toString(36)}).join('-')+'-'+i;
      var id=/^[a-z0-9_-]{1,50}$/i.test(String(x.id||''))?String(x.id):fallback;
      if(ids.has(id))id=fallback;
      ids.add(id);
      var list=Array.isArray(x.achievements)?x.achievements:[];
      var approved=list.filter(function(a){return a&&a.approved===true&&typeof(a.skill||a.title)==='string'&&String(a.skill||a.title).trim()});
      var badges=approved.slice(0,150).map(function(a){
        var item={skill:String(a.skill||a.title).trim().slice(0,105),badge:String(a.badge||'وسام الإنجاز').trim().slice(0,55),
          date:/^\d{4}-\d{2}-\d{2}$/.test(a.date||'')?a.date:'',category:categoryOf(a)};
        return item;
      });
      badges.sort(function(a,b){return b.date.localeCompare(a.date)});
      return {id:id,name:name,grade:String(x.grade||'').trim().slice(0,40),section:String(x.section||'').trim().slice(0,25),
        achievements:badges};
    })
    .filter(function(x){return x.achievements.length>0})
    .sort(function(a,b){return a.name.localeCompare(b.name,'ar')});
}

function cta(){
  return '<section class="heroes-home"><div class="heroes-home-icon" aria-hidden="true">🏅</div><div class="heroes-home-copy"><strong>إنجازات أبطالنا</strong><p>نحتفي بكل خطوة إتقان، ونوثّق الإنجازات بإشراف المعلمة</p></div><button type="button" data-ac-heroes="1">اكتشف إنجازاتنا</button></section>';
}
function formattedDate(value){
  if(!value)return '';
  try{return new Date(value+'T12:00:00').toLocaleDateString('ar-SA',{day:'numeric',month:'long',year:'numeric'})}catch{return ''}
}

function selectedStudentId(){
  var match=location.hash.match(/^#\/?heroes\/student\/([a-z0-9_-]{1,65})$/i);
  return match?match[1]:'';
}
function heroRoute(){
  return /^#\/?heroes(?:\/|$)/.test(location.hash);
}
function normalizedSearch(value){
  return String(value||'').toLocaleLowerCase('ar').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').trim();
}
function arabicDigits(value){
  return String(value).replace(/[0-9]/g,function(c){return '٠١٢٣٤٥٦٧٨٩'[Number(c)]});
}
function numericDigits(value){
  return String(value||'').replace(/[٠-٩]/g,function(c){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))});
}
function activeGradeNumber(){
  var grade=heroFilters.grade;
  if(grade==='all'){
    var observed=[...new Set(achievements.map(function(x){return x.grade}).filter(Boolean))];
    grade=observed.length===1?observed[0]:'الصف الأول الابتدائي';
  }
  if(/السادس/.test(grade))return 6;
  if(/الخامس/.test(grade))return 5;
  if(/الرابع/.test(grade))return 4;
  if(/الثالث/.test(grade))return 3;
  if(/الثاني/.test(grade))return 2;
  return 1;
}
function classLabel(grade,number){
  var names=['','الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة'];
  return (names[grade]||'الفصل')+' '+arabicDigits(number);
}
function classCodeFor(student){
  var raw=numericDigits(student.section).trim();
  if(/^[1-6]\/[1-4]$/.test(raw))return arabicDigits(raw);
  var match=raw.match(/([1-4])\s*$/);
  if(match)return arabicDigits(activeGradeNumber()+'/'+match[1]);
  return raw;
}
function filteredStudents(){
  var search=normalizedSearch(heroFilters.search);
  return achievements.filter(function(student){
    if(heroFilters.grade!=='all'&&student.grade!==heroFilters.grade)return false;
    if(heroFilters.section!=='all'&&classCodeFor(student)!==heroFilters.section)return false;
    if(heroFilters.badge!=='all'&&!student.achievements.some(function(a){return a.category===heroFilters.badge}))return false;
    if(search&&!normalizedSearch(student.name+' '+student.achievements.map(function(a){return a.skill+' '+a.badge}).join(' ')).includes(search))return false;
    return true;
  });
}
function optionsForFilter(items,selected){
  return items.map(function(item){
    return '<option value="'+e(item)+'"'+(item===selected?' selected':'')+'>'+e(item)+'</option>';
  }).join('');
}
function filtersView(){
  var grades=[...new Set(achievements.map(function(x){return x.grade}).filter(Boolean))].sort(function(a,b){return a.localeCompare(b,'ar')});
  var grade=activeGradeNumber();
  return '<div class="heroes-controls">'
    +'<label class="heroes-grade">الصف<span class="heroes-select-wrap"><select data-ac-filter="grade" aria-label="اختر الصف"><option value="all">كل الصفوف</option>'+optionsForFilter(grades,heroFilters.grade)+'</select></span></label>'
    +'<label class="heroes-search"><span>البحث عن بطل أو مهارة</span><input type="search" data-ac-search="1" aria-label="البحث عن بطل أو مهارة" placeholder="ابحث عن بطل أو مهارة" autocomplete="off" value="'+e(heroFilters.search)+'"></label>'
    +'</div><section class="heroes-class-group" aria-label="الفصول الدراسية"><div class="heroes-class-head"><h2>الفصول الدراسية</h2>'
    +'<button type="button" data-ac-class="all" class="heroes-all-class'+(heroFilters.section==='all'?' is-active':'')+'" aria-pressed="'+(heroFilters.section==='all')+'">كل الفصول</button></div>'
    +'<div class="heroes-class-tabs">'
    +[1,2,3,4].map(function(number){
      var code=arabicDigits(grade+'/'+number),selected=heroFilters.section===code;
      return '<button type="button" data-ac-class="'+e(code)+'" class="'+(selected?'is-active':'')+'" aria-pressed="'+selected+'">'+e(classLabel(grade,number))+'</button>';
    }).join('')+'</div></section>'
    +'<div class="heroes-filter-tabs" role="group" aria-label="تصفية الأوسمة">'
    +[['all','جميع الأبطال','👥'],['إتقان','الإتقان','🏅'],['تميز','التميز','⭐'],['مثابرة','المثابرة','🌱']].map(function(option){
      return '<button type="button" data-ac-badge="'+e(option[0])+'" class="'+(heroFilters.badge===option[0]?'is-active':'')+'" aria-pressed="'+(heroFilters.badge===option[0])+'"><span class="heroes-tab-icon" aria-hidden="true">'+option[2]+'</span>'+e(option[1])+'</button>';
    }).join('')+'</div>';
}
function studentCard(student){
  var main=student.achievements[0],count=student.achievements.length;
  return '<article class="heroes-student"><button type="button" class="heroes-student-open" data-ac-profile="'+e(student.id)+'" aria-label="عرض إنجازات '+e(student.name)+'">'
    +'<span class="heroes-medal" aria-hidden="true">🏅</span><span class="heroes-badge">'+e(main.badge)+'</span>'
    +'<h2>'+e(student.name)+'</h2><p>'+e(main.skill)+'</p>'
    +'<small>📋 إنجازات موثقة: '+arabic(count)+'</small>'
    +'<span class="heroes-student-more"><span class="heroes-action-icon" aria-hidden="true">🏅</span> عرض الأوسمة</span></button></article>';
}
function gridBody(){
  var results=filteredStudents(),shown=results.slice(0,visibleCount);
  if(!results.length)return '<div class="heroes-empty"><div aria-hidden="true">🌟</div><strong>'+(heroFilters.section!=='all'?'إنجازات هذا الفصل في الطريق':'لا توجد نتائج مطابقة')+'</strong><p>'+(heroFilters.section!=='all'?'لم تُنشر إنجازات لهذا الفصل بعد، أو لا توجد نتائج مطابقة للتصفية الحالية.':'جرّب اسمًا أو مهارة أخرى، أو اختر جميع الأبطال.')+'</p><button type="button" data-ac-reset-filters="1">إظهار الجميع</button></div>';
  return '<p class="heroes-count">عدد الأبطال: '+arabic(shown.length)+' من '+arabic(results.length)+'</p>'
    +'<div class="heroes-gallery">'+shown.map(studentCard).join('')+'</div>'
    +(shown.length<results.length?'<button type="button" class="heroes-more" data-ac-more="1">عرض المزيد من الأبطال</button>':'');
}
function heroCards(){
  if(failed&&!achievements.length)return '<div class="heroes-empty"><div aria-hidden="true">📶</div><strong>تعذر تحديث الإنجازات الآن</strong><p>تحقق من الاتصال ثم افتح الركن مرة أخرى</p><button type="button" data-ac-refresh-heroes="1">تحديث</button></div>';
  if(!achievements.length)return '<div class="heroes-empty"><div aria-hidden="true">🌟</div><strong>إنجازات جميلة في الطريق!</strong><p>تُضاف أسماء الأبطال بعد مراجعة المعلمة وموافقة الأسرة، دون صور أو درجات.</p></div>';
  return filtersView()+'<div id="heroesGridArea">'+gridBody()+'</div>';
}
function heroProfile(student){
  var badges=[...new Set(student.achievements.map(function(a){return a.badge}))];
  return '<section class="heroes-page"><button type="button" class="heroes-back" data-ac-back-heroes="1">↩ العودة لجميع الأبطال</button>'
    +'<div class="heroes-profile-head"><div class="heroes-profile-icon" aria-hidden="true">🏆</div><p>أكاديمية الرياضيات الصغيرة</p><h1>إنجازات '+e(student.name)+'</h1>'
    +'<div class="heroes-profile-meta">'+(student.grade?'<span>'+e(student.grade)+'</span>':'')+(student.section?'<span>الفصل '+e(student.section)+'</span>':'')+'<span>'+arabic(student.achievements.length)+' إنجازات موثقة</span></div>'
    +'<div class="heroes-profile-badges">'+badges.map(function(b){return '<span>⭐ '+e(b)+'</span>'}).join('')+'</div></div>'
    +'<h2 class="heroes-section-heading">سجل الإنجازات</h2>'
    +'<div class="heroes-profile-records">'+student.achievements.map(function(a){
      return '<article class="heroes-record"><span class="heroes-record-icon" aria-hidden="true">🌟</span><div><strong>'+e(a.skill)+'</strong><p>'+e(a.badge)+'</p>'
        +(a.date?'<small>'+e(formattedDate(a.date))+'</small>':'')+'</div></article>';
    }).join('')+'</div><p class="heroes-teacher">إعداد وتنفيذ: أ. ابتهال الحجيلي</p></section>';
}
function heroPage(){
  var id=selectedStudentId();
  if(id){
    var selected=achievements.find(function(x){return x.id===id});
    if(selected)return heroProfile(selected);
    return '<section class="heroes-page"><button type="button" class="heroes-back" data-ac-back-heroes="1">↩ العودة لإنجازات أبطالنا</button>'
      +'<div class="heroes-empty"><strong>لم يُعثر على هذا الإنجاز</strong><p>قد يكون العرض ما زال قيد التحديث.</p></div></section>';
  }
  return '<section class="heroes-page"><button type="button" class="heroes-back" data-nav="home">↩ الرجوع للرئيسية</button>'
    +'<div class="heroes-brand"><span class="heroes-brand-icon" aria-hidden="true">📖</span><strong>أكاديمية الرياضيات الصغيرة</strong></div>'
    +'<header class="heroes-title"><span class="heroes-title-laurel right" aria-hidden="true">❧</span><div class="heroes-title-inner"><span class="heroes-title-kicker" aria-hidden="true">🏆</span><h1>إنجازات أبطالنا</h1><p>كل إنجاز صغير بداية لنجاح كبير</p></div><span class="heroes-title-laurel left" aria-hidden="true">❧</span></header>'
    +'<div id="heroesPublicList">'+heroCards()+'</div>'
    +'<div class="heroes-privacy"><span class="heroes-privacy-icon" aria-hidden="true">🔒</span><span>تُعرض الأسماء وفق موافقة ولي الأمر ومراجعة المعلمة فقط، دون صور أو درجات.</span></div>'
    +'<p class="heroes-teacher">إعداد وتنفيذ: أ. ابتهال الحجيلي</p></section>';
}
function refreshWall(){
  if(!heroRoute())return;
  var app=document.getElementById('app');
  if(app)app.innerHTML=heroPage();
}
async function fetchWall(){
  try{
    var response=await fetch('./heroes.json?at='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('No published roster');
    achievements=validItems(await response.json());failed=false;
  }catch(error){failed=!achievements.length;}
  refreshWall();
}
function refreshGridOnly(){
  var grid=document.getElementById('heroesGridArea');
  if(grid)grid.innerHTML=gridBody();
  document.querySelectorAll('[data-ac-badge]').forEach(function(button){
    var selected=button.dataset.acBadge===heroFilters.badge;
    button.classList.toggle('is-active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
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

  style.textContent += '.heroes-page .heroes-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:17px 0}.heroes-page .heroes-student{min-width:0;padding:0;overflow:hidden;border-top-width:4px}.heroes-student-open{display:flex;align-items:center;flex-direction:column;gap:7px;width:100%;height:100%;min-height:205px;padding:18px 9px;background:transparent;border:0;font:inherit;color:inherit;text-align:center;cursor:pointer}.heroes-student-open:focus-visible{outline:3px solid #127e7c;outline-offset:-5px}.heroes-student .heroes-medal{font-size:32px}.heroes-student .heroes-badge{font-size:11px;padding:5px 9px}.heroes-student h2{font-size:21px;margin:2px 0}.heroes-student p{font-size:13px;line-height:1.6;margin:0;flex:1}.heroes-student small{font-size:11px}.heroes-student-more{font-size:12px;color:#116f74;font-weight:900}.heroes-controls{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin:24px 0 14px}.heroes-controls label{display:flex;flex-direction:column;gap:7px;color:#183957;font-size:13px;font-weight:800}.heroes-controls input,.heroes-controls select{min-width:0;width:100%;padding:12px;border:1px solid #cddfdf;border-radius:12px;background:#fff;color:#183957;font:inherit;font-size:15px}.heroes-controls select:disabled{opacity:.55}.heroes-filter-tabs{display:flex;flex-wrap:wrap;gap:9px}.heroes-filter-tabs button{border:1px solid #cddfdf;border-radius:20px;background:#fff;color:#285068;padding:9px 15px;cursor:pointer;font-weight:800;font-size:14px}.heroes-filter-tabs .is-active{background:#147d79;border-color:#147d79;color:#fff}.heroes-count{text-align:right;font-size:13px;color:#536e7b;margin:16px 0 0}.heroes-more{width:100%;padding:13px;margin:6px 0 16px;border-radius:14px;border:1px solid #b8d9d6;background:#e9f7f3;color:#145b62;font-weight:900;cursor:pointer}.heroes-profile-head{text-align:center;margin:20px 0;padding:26px 15px;background:linear-gradient(125deg,#e7f8f5,#fff5db);border-radius:26px;border:1px solid #d5e5df}.heroes-profile-icon{font-size:60px}.heroes-profile-head h1{margin:7px;font-size:34px}.heroes-profile-head p{margin:4px;font-size:15px}.heroes-profile-meta,.heroes-profile-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px}.heroes-profile-meta span,.heroes-profile-badges span{padding:7px 12px;background:#fff;border:1px solid #e1e5e4;border-radius:25px;font-size:13px}.heroes-profile-badges span{background:#fff7dd;color:#7c6016}.heroes-section-heading{margin:27px 0 12px;font-size:22px}.heroes-profile-records{display:grid;gap:11px}.heroes-record{display:flex;align-items:center;gap:13px;border:1px solid #e0e8e9;border-radius:16px;padding:15px;background:#fff}.heroes-record-icon{font-size:27px}.heroes-record strong{font-size:17px}.heroes-record p{font-size:14px;margin:6px 0;color:#526c7e}.heroes-record small{color:#7b8a90;font-size:12px}@media(min-width:720px){.heroes-page .heroes-gallery{grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}}@media(min-width:1060px){.heroes-page .heroes-gallery{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:620px){.heroes-controls{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.heroes-controls .heroes-search{grid-column:1 / -1}.heroes-page .heroes-gallery{grid-template-columns:repeat(2,minmax(0,1fr))}.heroes-page{padding-left:2px;padding-right:2px}.heroes-filter-tabs button{flex:1;min-width:44%;padding:9px 7px}.heroes-student-open{min-height:209px}}@media(max-width:350px){.heroes-page .heroes-gallery{gap:7px}.heroes-student h2{font-size:19px}.heroes-student .heroes-badge{font-size:10px}.heroes-student-open{padding:13px 5px}}';
  document.head.appendChild(style);
  var design=document.createElement('link');
  design.rel='stylesheet';
  design.href='./heroes-premium.css?v=1';
  document.head.appendChild(design);
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
    if(b.hasAttribute('data-ac-class')){heroFilters.section=b.dataset.acClass;visibleCount=8;refreshWall();return}
    if(b.dataset.acBadge){heroFilters.badge=b.dataset.acBadge;visibleCount=8;refreshGridOnly();return}
    if(b.dataset.acMore){visibleCount+=8;refreshGridOnly();return}
    if(b.dataset.acResetFilters){heroFilters={search:'',badge:'all',grade:'all',section:'all'};visibleCount=8;refreshWall();return}
    if(b.dataset.acProfile){navigate('heroes/student/'+b.dataset.acProfile);return}
    if(b.dataset.acBackHeroes){navigate('heroes');return}
    if(b.dataset.acAwardSave){exportAward(false);return}
    if(b.dataset.acAwardShare){exportAward(true);return}
  });
  document.addEventListener('input',function(event){
    if(!event.target.matches('[data-ac-search]'))return;
    heroFilters.search=event.target.value;visibleCount=8;refreshGridOnly();
  });
  document.addEventListener('change',function(event){
    var field=event.target.dataset.acFilter;
    if(!['grade','section'].includes(field))return;
    heroFilters[field]=event.target.value;if(field==='grade')heroFilters.section='all';visibleCount=8;refreshWall();
  });
  var home=document.querySelector('#app .quick-links');
  if(home&&!document.querySelector('.heroes-home'))home.insertAdjacentHTML('beforebegin',cta());
  if(/^#\/?heroes(?:\/|$)/.test(location.hash))render();
  fetchWall();
}
mount();
})();