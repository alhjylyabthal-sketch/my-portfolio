(function(){
'use strict';
const home=document.getElementById('luxuryHome');
if(!home||typeof window.luxNav!=='function')return;
const navigation=(page)=>{
  window.luxNav(page);
  closeMenu();
  updateActive();
};
const icon={
 home:'<path d="M3 11 12 3l9 8v10h-7v-6h-4v6H3z"/>',
 bands:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 library:'<path d="M4 6h16v15H4zM8 3h12M7 10h10M7 14h10M7 18h7"/>',
 reports:'<path d="M5 3h14v18H5zM8 8h8M8 12h8M8 16h5"/>'
};
function svg(inner){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+inner+'</svg>'}
home.innerHTML=
'<button type="button" class="fc-menu-toggle" id="fcHomeMenu" aria-expanded="false" aria-label="فتح قائمة الأقسام">☰</button>'+
'<img class="fc-home-logo" src="./approved-school-logo.webp" alt="الشعار الأصلي لروضة وابتدائية الأميرة نورة بنت عبد الرحمن الفيصل">'+
'<p class="fc-school">روضة وابتدائية الأميرة نورة بنت عبد الرحمن الفيصل</p>'+
'<h1 class="fc-hero-title">ملف الإنجاز المهني</h1>'+
'<p class="fc-teacher">المعلمة | ابتهال الحجيلي</p><div class="fc-gold-rule"></div>'+
'<section class="fc-statement"><h2>الرؤية</h2><p>بيئة تعليمية ملهمة تعزز التعلم العميق، وتنمّي الثقة والإبداع وحب الرياضيات.</p></section>'+
'<section class="fc-statement"><h2>الرسالة</h2><p>تقديم تعليم نوعي باستراتيجيات حديثة، يراعي الفروق الفردية وينمّي مهارات التفكير والتعلّم.</p></section>'+
'<div class="fc-cover-foot">١٤٤٨ هـ</div>';
const header=document.querySelector('body>header .topline');
if(header){
  const heading=header.querySelector('h1'); if(heading)heading.textContent='ملف الإنجاز المهني';
  const sub=header.querySelector('p');if(sub)sub.textContent='روضة وابتدائية الأميرة نورة بنت عبد الرحمن الفيصل · ابتهال الحجيلي';
  if(!header.querySelector('.fc-header-logo')){
    const img=document.createElement('img');img.className='fc-header-logo';img.alt='شعار المدرسة';img.src='./approved-school-logo.webp';header.prepend(img);
  }
  const btn=document.getElementById('topBack'); if(btn){btn.textContent='↩ الرئيسية';btn.setAttribute('aria-label','العودة للرئيسية');btn.onclick=()=>navigation('home');}
}
const secondary=document.createElement('button');secondary.type='button';secondary.className='fc-head-menu';secondary.id='fcHeaderMenu';secondary.textContent='☰';secondary.setAttribute('aria-label','فتح قائمة الأقسام');
if(header)header.insertBefore(secondary,document.getElementById('topBack'));
const shade=document.createElement('div');shade.className='fc-menu-shade';shade.id='fcMenuShade';shade.setAttribute('aria-hidden','true');document.body.append(shade);
const menu=document.createElement('aside');menu.id='fcMenu';menu.className='fc-menu';menu.setAttribute('aria-label','الأقسام الإضافية');
menu.innerHTML='<h3>أقسام ملف الإنجاز</h3>'+[
 ['metrics','مؤشرات الإنجاز'],['development','التطوير المهني'],['settings','الإعدادات والحفظ السحابي'],['form','إضافة شاهد جديد']
].map(([p,t])=>'<button type="button" data-fc-menu="'+p+'">'+t+'</button>').join('');
document.body.append(menu);
const nav=document.createElement('nav');nav.id='fcBottomNav';nav.className='fc-bottom-nav';nav.setAttribute('aria-label','التنقل بين الأقسام الرئيسية');
nav.innerHTML=[['home','الرئيسية'],['bands','البنود'],['library','الشواهد'],['reports','التقارير']]
 .map(([id,label])=>'<button type="button" data-fc-page="'+id+'" aria-label="'+label+'">'+svg(icon[id])+'<span>'+label+'</span></button>').join('');
document.body.append(nav);
const printBrand=document.createElement('div');printBrand.className='fc-print-letterhead';
printBrand.innerHTML='<img src="./approved-school-logo.webp" alt="شعار المدرسة"><div><strong>روضة وابتدائية الأميرة نورة بنت عبد الرحمن الفيصل</strong><div>ملف الإنجاز المهني – المعلمة: ابتهال الحجيلي</div><div>مديرة المدرسة: تهاني سحلول</div></div>';
document.body.insertBefore(printBrand,document.body.firstChild);
function openMenu(){shade.classList.add('is-open');menu.classList.add('is-open');document.getElementById('fcHomeMenu')?.setAttribute('aria-expanded','true');}
function closeMenu(){shade.classList.remove('is-open');menu.classList.remove('is-open');document.getElementById('fcHomeMenu')?.setAttribute('aria-expanded','false');}
const toggle=()=>menu.classList.contains('is-open')?closeMenu():openMenu();
shade.addEventListener('click',closeMenu);
document.getElementById('fcHomeMenu').addEventListener('click',toggle);
secondary.addEventListener('click',toggle);
nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>navigation(b.dataset.fcPage)));
menu.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
 const p=b.dataset.fcMenu; if(p==='form'){openForm();closeMenu();updateActive()}else navigation(p);
}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
function updateActive(){
 const page=document.body.dataset.luxPage||'home';nav.querySelectorAll('button').forEach(b=>{
  if(page===b.dataset.fcPage)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
 });
}
new MutationObserver(updateActive).observe(document.body,{attributes:true,attributeFilter:['data-lux-page']});
updateActive();
})();