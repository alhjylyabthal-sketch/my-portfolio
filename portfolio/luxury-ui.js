
(function(){
'use strict';
const H=document.getElementById('luxuryHome'), main=document.querySelector('main.main');
if(!H||!main)return;
const svg=(body)=>'<svg viewBox="0 0 48 48" aria-hidden="true">'+body+'</svg>';
const icon={
bands:svg('<path d="M6 11q10-5 18 2q8-7 18-2v27q-10-5-18 2q-8-7-18-2zM24 13v27M10 17h9M10 23h9M29 17h9M29 23h9"/>'),
library:svg('<rect x="7" y="13" width="34" height="27" rx="4"/><path d="M12 13V9h14l4 4M10 33l9-11 7 7 5-5 8 9"/><circle cx="33" cy="20" r="3"/>'),
reports:svg('<rect x="10" y="6" width="28" height="36" rx="4"/><path d="M18 6v-3h12v6H18V3M17 19l3 3 5-6M27 21h6M17 30l3 3 5-6M27 32h6"/>'),
metrics:svg('<path d="M6 41h36M11 35V23h7v12M23 35V15h7v20M35 35V8h7v27M10 15l10-6 8 4L39 4"/>'),
development:svg('<path d="M24 40V20M24 31c-11 0-16-6-16-14 11 0 16 4 16 14M24 26c0-12 5-17 16-17 0 10-6 17-16 17M16 41h16M10 44h28"/>'),
settings:svg('<circle cx="24" cy="24" r="8"/><path d="M20 5h8l2 6 4 2 6-2 4 7-5 5v4l5 4-4 7-7-2-3 2-2 6h-8l-2-6-4-2-6 2-4-7 5-5v-4l-5-4 4-7 7 2 3-2z"/>')
};
const items=[
['bands','بنود الأداء (١١)'],
['library','مكتبة الشواهد'],
['reports','التقارير'],
['metrics','مؤشرات الإنجاز'],
['development','التطوير المهني'],
['settings','الإعدادات']];
const brand=H.querySelector('.luxury-brand');
brand.innerHTML='<div class="ministry-brand">وزارة التعليم<br>المملكة العربية السعودية</div><div>روضة وابتدائية<br><strong>الأميرة نورة بنت عبد الرحمن الفيصل</strong></div>';
H.querySelector('.luxury-links').innerHTML=items.map(([id,label])=>'<button type="button" data-lux-nav="'+id+'">'+icon[id]+'<span>'+label+'</span></button>').join('');
H.querySelector('.luxury-bottom').textContent=' ';
const page=(id,title,body)=>{const section=document.createElement('section');section.id='lux'+id+'Page';section.className='lux-content-page';section.innerHTML='<h2 class="lux-page-heading">'+title+'</h2>'+body;main.insertBefore(section,document.querySelector('.footer'));return section};
page('Library','مكتبة الشواهد','<p class="lux-count" id="luxLibraryCount"></p><div class="lux-action-bar"><button type="button" id="luxCreateEvidence">＋ إضافة شاهد جديد</button></div><div id="luxLibraryList"></div>');
page('Reports','التقارير','<p>توثيق الشواهد المسجلة وتصديرها للطباعة. لا تُنشأ تواريخ أو نتائج لم يتم إدخالها.</p><div class="lux-action-bar"><button id="luxPrintReport">عرض الشواهد للطباعة / PDF</button><button id="luxBackupReport" class="alt">تنزيل نسخة احتياطية</button></div><p class="muted">يحتوي ملف PDF على الشواهد المحفوظة المتاحة في هذا الجهاز. استخدمي المعاينة قبل الحفظ.</p>');
page('Metrics','مؤشرات الإنجاز','<p class="lux-count">التغطية حسب البنود الإحدى عشرة</p><div id="luxMetricRows" class="lux-metric-list"></div>');
page('Development','التطوير المهني','<p>الشواهد المرتبطة ببند «التفاعل مع المجتمع المهني». يمكنك إضافة ورش وبرامج تطوير موثقة مع أدلتها.</p><div class="lux-action-bar"><button type="button" id="luxAddDevelopment">＋ إضافة شاهد تطوير مهني</button></div><div id="luxDevelopmentList"></div>');
const oldOpen=openForm,oldClose=closeForm,oldRender=render,oldBack=viewAll;
let from='library';
function nav(id,scroll=true){
if(id!=='form'&&document.getElementById('formPanel')&&!document.getElementById('formPanel').classList.contains('hidden'))oldClose();
if(id==='bands')oldBack();
document.body.classList.add('lux-mode');document.body.dataset.luxPage=id;
if(id==='settings'){document.getElementById('luxSettings').open=true}
if(id==='library'||id==='metrics'||id==='development')refresh().catch(()=>{});
if(scroll)window.scrollTo({top:0,behavior:'instant'});
}
window.luxNav=nav;
openForm=function(...args){if(document.body.dataset.luxPage!=='form')from=document.body.dataset.luxPage||'library';nav('form');oldOpen(...args)};
closeForm=function(){oldClose();nav(from)};
render=async function(...args){const out=await oldRender(...args);await refresh();return out};
async function refresh(){
if(typeof all!=='function'||typeof B==='undefined'||!window.indexedDB)return;
let entries;try{entries=await all()}catch{return}
const list=document.getElementById('luxLibraryList');
if(list){document.getElementById('luxLibraryCount').textContent='الشواهد المحفوظة: '+entries.length;renderEvidence(entries.slice(),list)}
const development=document.getElementById('luxDevelopmentList');
if(development)renderEvidence(entries.filter(e=>Array.isArray(e.bands)&&e.bands.includes(1)),development);
const metric=document.getElementById('luxMetricRows');
if(metric)metric.innerHTML=B.map((label,i)=>'<div class="lux-metric-row"><span>'+esc(label)+'</span><strong>'+entries.filter(e=>Array.isArray(e.bands)&&e.bands.includes(i)).length+' شاهد</strong></div>').join('');
}
document.querySelectorAll('[data-lux-nav]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.luxNav)));
document.getElementById('luxCreateEvidence').addEventListener('click',()=>openForm());
document.getElementById('luxAddDevelopment').addEventListener('click',()=>{openForm();document.querySelector('#checks input[value="1"]')?.click()});
document.getElementById('luxPrintReport').addEventListener('click',()=>document.getElementById('printBtn').click());
document.getElementById('luxBackupReport').addEventListener('click',()=>document.getElementById('exportBtn').click());
document.getElementById('topBack').textContent='↩ الرئيسية';
document.getElementById('topBack').onclick=()=>nav('home');
document.getElementById('backBtn').addEventListener('click',()=>nav('bands'));
document.getElementById('allBtn').addEventListener('click',()=>nav('bands'));
const oldClick=document.getElementById('addBtn').onclick;
document.getElementById('addBtn').onclick=()=>openForm();
nav('home',false);
})();
