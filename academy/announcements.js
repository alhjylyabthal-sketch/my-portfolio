/* لوحة إعلانات الأكاديمية: رسائل مشاركة لا تحتاج خادمًا أو حساب طالب. */
(function () {
  'use strict';
  const KEY='academy-teacher-notice-v1', SESSION_KEY='academy-visitor-notice-v1';
  const LIVE_KEY='academy-public-notice-v1';
  let liveNotice=null,liveLoading=false;
  function cachedLiveNotice(){try{return validAnnouncement(JSON.parse(localStorage.getItem(LIVE_KEY)||'null'))}catch{return null}}
  async function refreshLiveNotice(){
    if(liveLoading)return;liveLoading=true;
    try{
      const response=await fetch('./live-notice.json?at='+Date.now(),{cache:'no-store'});
      if(!response.ok)throw Error('Unable to fetch current assignment');
      const current=validAnnouncement(await response.json());
      if(!current)throw Error('Invalid assignment');
      const changed=JSON.stringify(current)!==JSON.stringify(liveNotice);
      liveNotice=current;
      try{localStorage.setItem(LIVE_KEY,JSON.stringify(current))}catch{}
      if(changed){
        const card=document.querySelector('.academy-notice-board:not(.academy-notice-shared)');
        if(card)card.outerHTML=renderHomeNotice();
        syncEditorFromPublicNotice(current);
      }
    }catch(err){
      if(!liveNotice)liveNotice=cachedLiveNotice();
    }finally{liveLoading=false}
  }
  const TODAY_NOTICE={"title":"العددان ١١ و١٢","task":"🌟 تعلّمنا اليوم العددين ١١ و١٢: نعدّ ونقرأ ونكتب ونمثّل كل عدد باستعمال عشر قطع وقطعة أو قطعتين.\n🎮 مغامرة اليوم: امسح الباركود في كتابك، وافتح تحدّي «العددان ١١ و١٢» في الأكاديمية، وأجب عن الأسئلة واجمع النجوم.\n🏡 مهمتي مع أسرتي: كوّن ١٠ مكعبات، ثم أضف مكعبًا واكتب العدد ١١. أضف مكعبًا ثانيًا واكتب العدد ١٢.\n💡 تحدّي العباقرة: يقول بدر «١٠ مكعبات ومكعبان يساوي ١١». هل توافقه؟ فسّر إجابتك.\n⭐ تعلّم واكتشف وأبدع!\nإعداد وتنفيذ: أ. ابتهال الحجيلي","id":"5-1","date":"2026-11-10","url":""};
  const acEscape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
  const acRoot=()=>location.href.split('#')[0].split('?')[0];
  const acLessonLink=id=>acRoot()+'#practice/'+encodeURIComponent(id);
  function normalizedUrl(value){
    let raw=String(value||'').trim();if(!raw)return '';
    if(/^www\./i.test(raw))raw='https://'+raw;
    try{const u=new URL(raw);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}
  }
  function validAnnouncement(obj){
    if(!obj || typeof obj!=='object')return null;
    const title=String(obj.title||'').trim().slice(0,110),task=String(obj.task||'').trim().slice(0,500);
    const id=String(obj.id||'').trim(),lesson=typeof lessonById==='function'?lessonById(id):null;
    const url=normalizedUrl(obj.url),date=/^\d{4}-\d{2}-\d{2}$/.test(obj.date||'')?obj.date:today();
    if(!title||!task)return null;
    return {title,task,id:lesson?id:'',date,url};
  }
  function encodeNotice(obj){
    const bytes=new TextEncoder().encode(JSON.stringify(obj));
    let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function decodeNotice(s){
    try{
      if(!/^[A-Za-z0-9_-]{3,6000}$/.test(s))return null;
      const b=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));
      const bytes=Uint8Array.from(b,c=>c.charCodeAt(0));
      return validAnnouncement(JSON.parse(new TextDecoder().decode(bytes)));
    }catch{return null}
  }
  function savedNotice(key){try{return validAnnouncement(JSON.parse((key===KEY?localStorage:sessionStorage).getItem(key)||'null'))}catch{return null}}
  const labelDate=date=>{try{return new Date(date+'T12:00:00').toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}catch{return date}};
  function noticeBody(a,full=false){
    const lesson=a.id&&lessonById(a.id);
    return `<div class="academy-notice-info"><div class="academy-notice-datelabel">📅 ${acEscape(labelDate(a.date))}</div>
      <h3>${acEscape(a.title)}</h3>
      ${lesson?`<div class="academy-notice-course">📗 الفصل ${arabic(lesson.chapter.id)} · صفحة ${arabic(lesson.page)}</div>`:''}
      ${lesson?`<div class="academy-notice-adventure"><span class="academy-adventure-symbol" aria-hidden="true">${lesson.chapter.icon||'🎈'}</span><div class="academy-adventure-copy"><strong>تحدي الرياضيات!</strong><span>العب، تعلّم، واجمع النجوم</span></div><button type="button" class="academy-adventure-play" data-ac-open-lesson="${acEscape(a.id)}">🎮 ابدأ المغامرة</button></div>`:''}
      <details class="academy-notice-task" ${full?'open':''}><summary>📝 ${full?'مهمتك بعد الدرس':'عرض المهمة المنزلية'}</summary><p>${acEscape(a.task).replace(/\n/g,'<br>')}</p></details>
      <div class="academy-notice-actions">
        
        ${a.url?`<a class="academy-notice-secondary" href="${acEscape(a.url)}" target="_blank" rel="noopener noreferrer">${/^https:\/\/(?:www\.)?padlet\.com\//i.test(a.url)?'📸 أشارك حلّي في لوحة الفصل':'🌟 افتح النشاط الإضافي'}</a>`:''}
        ${full?`<button class="academy-notice-secondary" data-ac-share-notice="1">📤 مشاركة الإعلان</button>`:''}
      </div></div>`;
  }
  function renderHomeNotice(){
    const a=liveNotice||cachedLiveNotice()||TODAY_NOTICE;
    return `<section class="academy-notice-board" aria-label="إعلانات الفصل">
      <div class="academy-notice-head"><span class="academy-notice-icon" aria-hidden="true">📣</span><div><span class="academy-notice-overline">لوحة الإعلانات</span><h2>${a&&a.date===today()?'مغامرة اليوم':'آخر مغامرة'}</h2></div></div>
      ${a?noticeBody(a):`<p class="academy-notice-empty">لا توجد إعلانات جديدة.</p>`}
      <button class="academy-notice-teacher" data-nav="announce-edit">إدارة مغامرة اليوم <span aria-hidden="true">✎</span></button>
    </section>`;
  }
  function lessonOptions(){return `<option value="">بدون ربط بدرس من الأكاديمية</option>`+
    CHAPTERS.map(ch=>`<optgroup label="الفصل ${arabic(ch.id)}: ${acEscape(ch.title)}">${ch.lessons.map(l=>`<option value="${acEscape(l[0])}">${acEscape(l[1])} (ص ${arabic(l[4])})</option>`).join('')}</optgroup>`).join('');
  }
  function syncEditorFromPublicNotice(a){
    const form=document.getElementById('academyNoticeForm');
    if(!form||form.dataset.userEdited==='1')return;
    for(const name of ['date','id','title','task','url']){
      const field=form.elements.namedItem(name);
      if(field)field.value=a[name]||'';
    }
  }
  document.addEventListener('input',e=>{
    const form=e.target.closest?.('#academyNoticeForm');
    if(form)form.dataset.userEdited='1';
  });
  document.addEventListener('change',e=>{
    const form=e.target.closest?.('#academyNoticeForm');
    if(form)form.dataset.userEdited='1';
  });
  function renderNoticeEditor(){
    const a=liveNotice||cachedLiveNotice()||TODAY_NOTICE;
    return `<div class="academy-notice-page">
      <div class="academy-notice-top"><button class="academy-notice-back" data-nav="home">← العودة إلى الأكاديمية</button>
        <span class="academy-notice-pill">للمعلمة</span></div>
      <h1>📣 نشر مغامرة اليوم</h1><p class="academy-notice-lead">اختاري الدرس واكتبي المهمة. سيشاهدها الطلاب عند فتح رابط الأكاديمية نفسه.</p>
      <form id="academyNoticeForm" class="academy-notice-form">
        <label>تاريخ الحصة <input type="date" name="date" required value="${acEscape(a.date)}"></label>
        <label>اختاري الدرس <select name="id" id="academyNoticeLesson">${lessonOptions()}</select></label>
        <label>عنوان الإعلان <input name="title" required maxlength="110" placeholder="مثال: تعلّم الأعداد ٩ و١٠" value="${acEscape(a.title)}"></label>
        <label>مهمة اليوم <textarea name="task" required maxlength="500" rows="4" placeholder="مثال: حلّ تدريب الدرس ثم كتابة العددين في الدفتر.">${acEscape(a.task)}</textarea></label>
        <label>رابط لوحة الأعمال أو النشاط (اختياري) <input name="url" inputmode="url" dir="ltr" placeholder="https://padlet.com/..." value="${acEscape(a.url)}"><small>يمكنك ربط لوحة Padlet لعرض حلول الطلاب؛ يبقى رابط الأكاديمية كما هو.</small></label>
        <div class="academy-notice-form-actions"><button type="submit" class="academy-notice-primary">📣 نشر مغامرة اليوم</button></div>
      </form>
      <div class="academy-notice-preview" id="academyNoticePreview" aria-live="polite"></div>
      <p class="academy-notice-tip">لأمان النشر، يلزم تأكيد الإعلان من حساب GitHub الذي يملك الموقع. بعد التأكيد، يظهر للطلاب في رابط الأكاديمية الدائم.</p>
    </div>`;
  }
  function renderSharedNotice(payload){
    const a=decodeNotice(payload);
    if(!a)return `<div class="academy-notice-page"><button class="academy-notice-back" data-nav="home">← الرئيسية</button><h1>هذا الإعلان غير متاح</h1><p>الرجاء فتح الرابط الذي أرسلته المعلمة.</p></div>`;
    try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(a))}catch{}
    return `<div class="academy-notice-page"><button class="academy-notice-back" data-nav="home">← الرئيسية</button>
      <section class="academy-notice-board academy-notice-shared"><div class="academy-notice-head"><span class="academy-notice-icon">📣</span>
        <div><span class="academy-notice-overline">أكاديمية الرياضيات الصغيرة</span><h1>إعلان الحصة</h1></div></div>
        ${noticeBody(a,true)}</section><p class="academy-notice-signature">معلمتكم: ابتهال الحجيلي ✨</p></div>`;
  }
  async function copyText(value){
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);showToast('تم نسخ الرابط');return true;}}catch{}
    const el=document.createElement('textarea');el.value=value;el.style.cssText='position:fixed;left:-10000px;top:-10000px';document.body.appendChild(el);el.select();
    let ok=false;try{ok=document.execCommand('copy')}catch{}el.remove();if(ok)showToast('تم نسخ الرابط');else showToast('استخدمي زر مشاركة الرابط');return ok;
  }
  async function shareUrl(url,title,text){
    if(navigator.share){try{await navigator.share({url,title,text});return}catch(e){if(e?.name==='AbortError')return;}}
    await copyText(url);
  }
  function formData(){
    const f=document.getElementById('academyNoticeForm');if(!f)return null;
    const data=new FormData(f),id=String(data.get('id')||''),lesson=lessonById(id);
    let title=String(data.get('title')||'').trim();if(!title&&lesson)title=lesson.title;
    const task=String(data.get('task')||'').trim(),value=String(data.get('url')||'').trim(),url=normalizedUrl(value);
    if(value&&!url){showToast('الرابط الإضافي يجب أن يبدأ بـ https://');return null;}
    return validAnnouncement({date:data.get('date'),title,task,id,url});
  }
  const oldHome=renderHome,oldRender=render;
  window.removeEventListener('hashchange',oldRender);
  window.addEventListener('hashchange',()=>render());
  renderHome=function(){return oldHome().replace('<div class="quick-links"',renderHomeNotice()+'<div class="quick-links"')};
  render=function(){
    const raw=location.hash.replace(/^#\/?/,'');const parts=raw.split('/');const route=parts[0];
    if(route==='announce-edit'||route==='notice'){
      document.getElementById('app').innerHTML=route==='announce-edit'?renderNoticeEditor():renderSharedNotice(parts[1]||'');
      if(route==='announce-edit'){const sel=document.getElementById('academyNoticeLesson');if(sel)sel.value=(liveNotice||cachedLiveNotice()||TODAY_NOTICE)?.id||'';}
      const nav=document.getElementById('mainNav');if(nav)nav.hidden=true;
      document.getElementById('menuBtn')?.setAttribute('aria-expanded','false');
      document.title=(route==='announce-edit'?'إعداد الإعلان':'إعلان الحصة')+' | أكاديمية الرياضيات الصغيرة';
      window.scrollTo(0,0);return;
    }
    oldRender();

  };
  document.addEventListener('submit',e=>{
    if(e.target.getAttribute('id')!=='academyNoticeForm')return;e.preventDefault();
    const a=formData();if(!a){showToast('أكملي عنوان الإعلان والمهمة والتاريخ');return;}
    try{localStorage.setItem(KEY,JSON.stringify(a));localStorage.setItem('academy-teacher-notice-edit-ts',String(Date.now()))}catch{}
    const issueTitle='[نشر مغامرة] '+a.title;
    const issueBody='ACADEMY_NOTICE_V1\n'+JSON.stringify(a);
    const publishLink='https://github.com/alhjylyabthal-sketch/my-portfolio/issues/new?title='
      +encodeURIComponent(issueTitle)+'&body='+encodeURIComponent(issueBody);
    const box=document.getElementById('academyNoticePreview');
    if(box){
      box.innerHTML='<h2>✨ خطوة أخيرة للنشر</h2><p>اضغطي الزر، ثم أكّدي النشر في GitHub بالضغط على <strong>Submit new issue</strong>. سيتحدث إعلان الأكاديمية للجميع، ولا تحتاجين إرسال رابط جديد.</p>'
        +'<a class="academy-notice-primary academy-notice-publish-link" href="'+acEscape(publishLink)+'" target="_blank" rel="noopener noreferrer">🔐 تأكيد النشر في GitHub</a>';
      box.dataset.link=publishLink;
    }
    showToast('جهزت المهمة، أكّدي نشرها في GitHub');
  });
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.acOpenCurrent){
      const published=liveNotice||cachedLiveNotice()||TODAY_NOTICE;
      const id=published.id,lesson=id&&lessonById(id);
      if(!lesson){showToast('مغامرة اليوم غير متاحة الآن');return;}
      pageMode='games';
      beginLesson(id);
      return;
    }
    if(b.dataset.acOpenLesson){navigate('practice/'+b.dataset.acOpenLesson);return;}
    if(b.dataset.acShareCurrent){const l=lessonById(b.dataset.acShareCurrent);if(l)await shareUrl(acLessonLink(l.code),l.title,'تدريب درس '+l.title);return;}
    if(b.dataset.acShareLesson){const a=formData(),id=a?.id||document.getElementById('academyNoticeLesson')?.value;
      const l=lessonById(id);if(!l){showToast('اختاري درسًا أولًا');return;}
      await copyText(acLessonLink(l.code));return;}
    if(b.dataset.acCopyNotice){const a=savedNotice(KEY);if(a)await copyText(acRoot()+'#notice/'+encodeNotice(a));return;}
    if(b.dataset.acShareNotice){const a=savedNotice(SESSION_KEY)||savedNotice(KEY);if(a)await shareUrl(acRoot()+'#notice/'+encodeNotice(a),'إعلان حصة الرياضيات',`${a.title}\nمهمة اليوم: ${a.task}`);return;}
  });
  const styles=`
    .academy-notice-board,.academy-notice-page{--ac-navy:#183957;--ac-gold:#d9af47;--ac-teal:#127e7c;color:var(--ac-navy)}
    .academy-notice-board{margin:20px auto 24px;background:linear-gradient(125deg,#fff,#f7fcfc 75%,#fff9ed);border:1px solid #d9e8eb;border-radius:25px;box-shadow:0 8px 28px #1939570b;padding:22px;position:relative;overflow:hidden}
    .academy-notice-board::before{content:'';position:absolute;inset:0 0 auto;height:5px;background:linear-gradient(90deg,#147e7b,#e4b24c,#147e7b)}
    .academy-notice-head{display:flex;align-items:center;gap:14px;margin-bottom:10px}.academy-notice-icon{font-size:32px;display:grid;place-items:center;width:64px;height:64px;border-radius:19px;background:#e5f7f4}
    .academy-notice-overline{font-size:13px;font-weight:800;color:#387875}.academy-notice-head h1,.academy-notice-head h2{margin:3px 0;font-size:clamp(22px,3vw,29px);color:var(--ac-navy)}
    .academy-notice-empty{margin:10px 0 3px;color:#627689}.academy-notice-datelabel{font-size:13px;font-weight:700;color:#547584}
    .academy-notice-info h3{font-size:clamp(20px,3vw,25px);margin:8px 0}.academy-notice-course{font-size:14px;color:#516f7e}
    .academy-notice-task{background:#fff;border:1px solid #e3ebeb;border-radius:16px;padding:16px 18px;margin-top:14px}.academy-notice-task strong{font-size:16px}.academy-notice-task p{margin:8px 0 0;line-height:1.85;white-space:normal;color:#324c60}
    .academy-notice-actions,.academy-notice-form-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:17px}
    .academy-notice-actions button,.academy-notice-actions a,.academy-notice-form-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;border-radius:12px;padding:10px 18px;text-align:center;text-decoration:none;font:700 15px inherit;cursor:pointer}
    .academy-notice-primary{background:var(--ac-teal);color:white;border:2px solid var(--ac-teal);font-weight:800!important}
    .academy-notice-secondary{background:#fff;color:var(--ac-navy);border:2px solid #d9e5e9;font-weight:800!important}
    .academy-notice-teacher{border:0;background:transparent;color:#687d87;padding:9px 0 0;font-size:12px;cursor:pointer;margin-top:7px;text-decoration:underline;text-underline-offset:3px}
    .academy-notice-page{max-width:800px;margin:0 auto;padding:22px 16px 55px}.academy-notice-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
    .academy-notice-back{background:#e7f5f4;border:0;border-radius:10px;padding:12px 16px;color:#1a6463;font-weight:800;cursor:pointer}
    .academy-notice-pill{padding:7px 13px;border:1px solid #e4c576;border-radius:25px;font-size:12px;color:#907126;background:#fff9e5;font-weight:700}
    .academy-notice-page>h1{font-size:clamp(25px,4vw,35px);margin:22px 0 7px}.academy-notice-lead{line-height:1.9;color:#5c7180;margin:0 0 22px}
    .academy-notice-form{background:#fff;border:1px solid #e2e9ed;border-radius:23px;padding:23px;box-shadow:0 8px 24px #102e4e0b;display:grid;gap:18px}
    .academy-notice-form label{display:grid;gap:8px;font-size:15px;font-weight:800}.academy-notice-form input,.academy-notice-form select,.academy-notice-form textarea{width:100%;border:1.5px solid #cddde3;border-radius:12px;background:#fcfefe;padding:14px;min-height:49px;font:500 16px Tahoma,Arial,sans-serif;box-sizing:border-box;color:#183957}
    .academy-notice-form input:focus,.academy-notice-form select:focus,.academy-notice-form textarea:focus{outline:3px solid #cfede9;border-color:#188782}.academy-notice-form small{color:#78848d;font-weight:400;line-height:1.6}
    .academy-notice-preview{margin-top:22px}.academy-notice-preview:not(:empty){border:1px solid #c5e2d9;border-radius:18px;padding:20px;background:#f6fcfa}.academy-notice-preview h2{font-size:20px;margin:0 0 8px}
    .academy-notice-tip{margin-top:18px;color:#71818c;line-height:1.7;font-size:12px}.academy-notice-signature{text-align:center;color:#64798b;margin-top:26px}.academy-notice-shared{margin:24px 0}
    .academy-notice-share-activity{border:1px solid #b9dcd8;border-radius:11px;padding:11px 16px;background:#f4fcfa;color:#117b73;font-weight:800;margin:0 0 15px;cursor:pointer}
    @media(max-width:560px){.academy-notice-board{padding:19px 16px;border-radius:20px}.academy-notice-actions button,.academy-notice-actions a,.academy-notice-form-actions button{width:100%}.academy-notice-form{padding:17px}.academy-notice-head{gap:10px}.academy-notice-icon{width:53px;height:53px;font-size:27px}}
  `;
  const css=document.createElement('style');css.textContent=styles
    +'.academy-notice-publish-link{display:inline-flex;align-items:center;justify-content:center;min-height:48px;border-radius:13px;padding:12px 17px;text-decoration:none;color:#fff;font-weight:900;margin-top:10px}.academy-notice-publish-link:hover{filter:brightness(1.06)}';
  document.head.appendChild(css);
  refreshLiveNotice();
  window.addEventListener('focus',refreshLiveNotice);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLiveNotice()});
}());
/* ركن إنجازات الأبطال مستقل عن سجل الدرجات وبيانات الطلاب */
(function(){var s=document.createElement('script');s.src='./heroes.js?v=1';s.async=true;document.body.appendChild(s);}());
