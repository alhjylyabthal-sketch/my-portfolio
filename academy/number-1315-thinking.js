/* درس الأعداد ١٣، ١٤، ١٥: تعلّم مستقل وتفكير ناقد وإبداعي، دون المساس بسجل النتائج. */
(function(){
'use strict';
if(window.__academyNumber1315Thinking)return;
window.__academyNumber1315Thinking=true;
var lessonCode='5-2',stage=0,answered=false,correct=false,target=14,parts=[];
var pastQuestions=questionsFor,oldStart=beginLesson,oldRender=render;
var digits=function(n){return String(n).replace(/[0-9]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[Number(d)]})};
function twoFrames(a,b){
 return '<div class="count-container n13-frames"><div><small>المجموعة الأولى</small>'+tenFrame(a)+'</div><div><small>المجموعة الثانية</small>'+tenFrame(b)+'</div></div>';
}
function challenge(prompt,visual,answers,right,explanation,seed){
 return makeQuestion(prompt,visual,answers.map(function(t,i){return strChoice(t,i===right)}),explanation,seed);
}
function challengeBank(){
 return {
 critical:[
  challenge('تقول لولو: عشر قطع و٤ آحاد تكوّن ١٥. ما التصحيح؟',twoFrames(10,4),
   ['تكوّن ١٤','تكوّن ١٣','تكوّن ١٥','تكوّن ١٦'],0,'نعدّ عشرة كاملة ثم ٤ آحاد، فالعدد ١٤.',1),
  challenge('يقول بدر: عشر قطع و٥ آحاد تكوّن ١٣. لماذا قوله غير صحيح؟',twoFrames(10,5),
   ['لأنها تكوّن ١٥','لأنها تكوّن ١٤','لأنها تكوّن ١٢','لأنها تكوّن ١٦'],0,'٥ آحاد بعد العشرة تكوّن العدد ١٥.',3),
  challenge('أي تمثيل لا يساوي ١٤؟',frameText('ابحث عن التمثيل المختلف'),
   ['١٠ مع ٤','٧ مع ٧','١٠ مع ٣','٨ مع ٦'],2,'عشرة و٣ آحاد يساوي ١٣، بينما بقية التمثيلات تكوّن ١٤.',5),
  challenge('المجموعة الأولى تمثّل ١٣ والثانية ١٥. ما التفسير الصحيح؟',twoFrames(10,3)+twoFrames(10,5),
   ['هما متساويتان','الثانية أكبر بآحادين','الأولى أكبر بآحادين','الفرق بينهما ٥'],1,'العشرة متساوية في المجموعتين، والفرق بين ٣ و٥ آحاد هو آحادان.',7),
  challenge('كتب أحد الطلاب ١٤ تحت هذا التمثيل. أين الخطأ؟',twoFrames(10,3),
   ['لا يوجد خطأ','أضاف آحادًا لا تظهر في الرسم','نقصت عشرية كاملة','العدد الصحيح ١٥'],1,'الرسم فيه عشرة و٣ آحاد فقط، لذلك يمثّل ١٣.',9),
  challenge('هل تمثيل ٧ مع ٧ يساوي تمثيل ١٠ مع ٤؟',frameText('٧ مع ٧      |      ١٠ مع ٤'),
   ['لا، الأول أكبر','نعم، كلاهما ١٤','لا، الثاني أكبر','نعم، كلاهما ١٥'],1,'٧ و٧ يساوي ١٤، وكذلك عشرة و٤؛ فالتمثيلان مختلفان والعدد واحد.',11)
 ],
 apply:[
  challenge('كوّنت ١٣ مكعبًا، وأريد أن تصبح ١٥. كم مكعبًا أضيف؟',twoFrames(10,3),
   ['مكعبًا واحدًا','مكعبين','٣ مكعبات','٤ مكعبات'],1,'أضيف مكعبين لأن ١٣ ثم ١٤ ثم ١٥.',13),
  challenge('صنعت ١٤ مكعبًا ثم أبعدت مكعبًا واحدًا. كم بقي؟',twoFrames(10,4),
   ['١٢','١٣','١٤','١٥'],1,'بعد إزالة واحد من ١٤ يبقى ١٣.',15),
  challenge('لديّ عشر قطع كاملة. كم قطعة إضافية أحتاج لتكوين ١٥؟',tenFrame(10),
   ['٣','٤','٥','٦'],2,'نضيف ٥ آحاد إلى العشرة لتكوين ١٥.',17),
  challenge('أمامك عشر قطع و٣ آحاد. أضف آحادًا واحدًا. ما العدد الجديد؟',twoFrames(10,3),
   ['١٣','١٥','١٤','١٦'],2,'عشرة و٤ آحاد يمثّلان ١٤.',19),
  challenge('كوّنت ١٤، ثم أزلت واحدًا من الآحاد. ما العدد الذي بقي؟',twoFrames(10,4),
   ['١٥','١٢','١٤','١٣'],3,'عشرة و٣ آحاد يمثّلان ١٣.',21),
  challenge('لديك ١٥ قطعة. أخذت منها قطعتين، فكم بقي؟',twoFrames(10,5),
   ['١٤','١٣','١٥','١٢'],1,'عندما نأخذ ٢ من ١٥ يبقى ١٣.',23)
 ],
 create:[
  challenge('أي فكرتين مختلفتين تصلحان لتمثيل العدد ١٤؟',frameText('أفكّر في أكثر من تمثيل'),
   ['١٠ مع ٤، و٧ مع ٧','١٠ مع ٣، و٧ مع ٧','١٠ مع ٤، و٨ مع ٧','١٠ مع ٥، و٧ مع ٧'],0,'يمكن تكوين ١٤ من عشرة و٤، أو من ٧ و٧. كلاهما صحيح.',25),
  challenge('أي طريقتين مختلفتين تمثّلان العدد ١٥؟',frameText('ليس هناك تمثيل واحد فقط'),
   ['١٠ مع ٤، و٨ مع ٧','١٠ مع ٥، و٨ مع ٧','١٠ مع ٥، و٧ مع ٧','٩ مع ٥، و٨ مع ٧'],1,'١٠ مع ٥ يساوي ١٥، وكذلك ٨ مع ٧.',27),
  challenge('تحدّي الابتكار: كيف تكوّن ١٣ من مجموعتين دون أن تكون إحداهما ١٠؟',frameText('١٣'),
   ['٧ مع ٧','٦ مع ٧','٦ مع ٨','٨ مع ٨'],1,'٦ مع ٧ يساوي ١٣، وهي طريقة تختلف عن عشرة و٣.',29),
  challenge('أي فكرتين مختلفتين كلتاهما تكوّنان ١٣؟',frameText('أبحث عن تمثيلين صحيحين'),
   ['٩ مع ٤، و٨ مع ٥','٩ مع ٥، و٨ مع ٥','٩ مع ٤، و٧ مع ٧','١٠ مع ٤، و٨ مع ٥'],0,'٩ مع ٤ يساوي ١٣، و٨ مع ٥ يساوي ١٣.',31),
  challenge('كيف تكوّن ١٤ من مجموعتين دون استعمال مجموعة من ١٠؟',frameText('١٤'),
   ['٦ مع ٧','٨ مع ٦','٨ مع ٧','٩ مع ٤'],1,'٨ مع ٦ يساوي ١٤؛ وهذه طريقة أخرى للتمثيل.',33),
  challenge('أي طريقتين مختلفتين تمثّلان ١٥ دون مجموعة من ١٠؟',frameText('١٥'),
   ['٩ مع ٦، و٧ مع ٨','٩ مع ٥، و٧ مع ٨','٩ مع ٦، و٦ مع ٨','٨ مع ٨، و٧ مع ٨'],0,'٩ مع ٦ يساوي ١٥، وكذلك ٧ مع ٨.',35)
 ]
 };
}
questionsFor=function(lesson,requested){
 if(!lesson||lesson.code!==lessonCode||lesson.testType)return pastQuestions(lesson,requested);
 var bank=challengeBank(),attempts=Number(progress[lessonCode]&&progress[lessonCode].attempts)||0;
 var pair=attempts%3,first=pair*2,second=first+1;
 var result=[bank.critical[first],bank.apply[first],bank.create[first],
             bank.critical[second],bank.apply[second],bank.create[second]];
 return result.map(function(q){q.sourceSkill='num1315';return q});
};
beginLesson=function(id){
 if(id===lessonCode&&pageMode==='lessons'){
  stage=0;answered=false;correct=false;target=14;parts=[];session=null;
  navigate('learn/'+lessonCode);return;
 }
 if(id===lessonCode)pageMode='games';
 return oldStart(id);
};
function styledSteps(){
 return '<div class="n13-tabs">'+['أستكشف','أفكّر وأصحّح','أبتكر','أتحدّى'].map(function(t,i){
  return '<span class="'+(i===stage?'active':i<stage?'done':'')+'">'+digits(i+1)+' '+t+'</span>'
 }).join('')+'</div>';
}
function feedback(){
 if(!answered)return '';
 return '<div class="n13-feedback '+(correct?'yes':'try')+'" role="status">'+
  (correct?(stage===0?'🌟 أحسنت! عشرة و٥ آحاد تكوّن ١٥.':'🌟 ممتاز! الرسم يمثّل ١٣؛ لأن الآحاد ٣ فقط.')
  :(stage===0?'💡 أعد النظر: بعد العشرة نعدّ ٥ آحاد.':'💡 دقّق في الآحاد: هل أمامك ٣ أم ٤؟'))+'</div>';
}
function questionStep(){
 var first=stage===0,opts=first?['نعم، العدد ١٤','لا، العدد ١٥']:['الرسم صحيح ويمثّل ١٤','العدد الصحيح ١٣','العدد الصحيح ١٥'];
 return '<div class="n13-prompt"><span class="n13-level">'+(first?'ألاحظ وأبرّر':'أكشف الخطأ')+'</span>'+
 '<h2>'+(first?'هذه عشرة كاملة و٥ آحاد. قالت لولو: هذا العدد ١٤. هل توافقها؟ ولماذا؟':'رسم بدر عشرة كاملة و٣ آحاد، ثم كتب ١٤. ما التصحيح المناسب؟')+'</h2>'+
 twoFrames(10,first?5:3)+'</div>'+
 '<div class="n13-answers">'+opts.map(function(label,i){
  var truth=first?i===1:i===1;
  return '<button type="button" data-n13-answer="'+(truth?'right':'wrong')+'" '+(answered&&correct?'disabled':'')+'>'+label+'</button>';
 }).join('')+'</div>'+feedback()+
 (answered&&correct?'<button type="button" class="n13-primary" data-n13-next="1">الخطوة التالية ←</button>':'');
}
function pairId(a,b){return [Math.min(a,b),Math.max(a,b)].join('-')}
function creativityStep(){
 var choices=[6,7,8,9,10].filter(function(x){return target-x>=1&&target-x<=10});
 var set=new Set(parts.map(function(x){return pairId(x,target-x)}));
 var done=parts.length>=2;
 return '<div class="n13-prompt"><span class="n13-level">تفكير إبداعي • حلول متعددة</span>'+
 '<h2>اختر عددًا، ثم ابتكر طريقتين مختلفتين لتكوينه بمجموعتين من المكعبات.</h2>'+
 '<p>لا نبحث عن إجابة واحدة؛ كل تمثيل صحيح ومختلف يُحتسب فكرة جديدة.</p></div>'+
 '<div class="n13-targets">'+[13,14,15].map(function(n){return '<button type="button" class="'+(target===n?'chosen':'')+'" data-n13-target="'+n+'">'+digits(n)+'</button>'}).join('')+'</div>'+
 '<p class="n13-label">اختر عدد مكعبات المجموعة الأولى، وسنكوّن المجموعة الثانية:</p>'+
 '<div class="n13-splits">'+choices.map(function(a){return '<button type="button" data-n13-part="'+a+'" '+(set.has(pairId(a,target-a))?'disabled':'')+'>'+digits(a)+'</button>'}).join('')+'</div>'+
 '<div class="n13-created">'+(parts.length?parts.map(function(a,i){
  return '<div class="n13-created-item"><strong>الفكرة '+digits(i+1)+'</strong>'+
  '<span>'+digits(a)+' مع '+digits(target-a)+' يساوي '+digits(target)+'</span></div>';
 }).join(''):'<span class="n13-muted">اختر فكرة أولى، ثم فكرة مختلفة عنها.</span>')+'</div>'+
 (done?'<div class="n13-feedback yes" role="status">✨ رائع! وجدت طريقتين مختلفتين لتكوين العدد نفسه. اشرح كيف تعرف أنهما صحيحتان.</div>'+
 '<button type="button" class="n13-primary" data-n13-next="1">أنتقل إلى التحدّي ←</button>':'');
}
function finalStep(){
 return '<div class="n13-end"><span class="n13-end-medal">🏆</span><h2>أحسنت! فكّرت وفسّرت وابتكرت.</h2>'+
 '<p>الآن تنتظرك لعبة مختلفة: ٦ أسئلة فيها اكتشاف الخطأ، والتطبيق، واختيار أفكار مبتكرة.</p>'+
 '<button type="button" class="n13-primary" data-n13-game="1">🎮 أبدأ لعبة التفكير</button></div>';
}
function lessonHTML(){
 return '<section class="n13-learning" dir="rtl"><button type="button" class="n13-back" data-n13-back="1">↩ العودة لدروس الفصل</button>'+
 '<header class="n13-hero"><span>📖 درس مستقل عن اللعبة</span><h1>الأعداد ١٣، ١٤، ١٥</h1>'+
 '<p>أتعلّم بالعشرات والآحاد، ثم أفسّر وأبتكر.</p></header>'+
 styledSteps()+
 '<div class="n13-panel">'+(stage===0||stage===1?questionStep():stage===2?creativityStep():finalStep())+'</div>'+
 '<p class="n13-sign">أكاديمية الرياضيات الصغيرة • إعداد وتنفيذ: أ. ابتهال الحجيلي</p></section>';
}
render=function(){
 if(!/^#\/?learn\/5-2$/.test(location.hash||''))return oldRender();
 var app=document.getElementById('app');if(!app)return;
 app.innerHTML=lessonHTML();
 document.title='درس الأعداد ١٣، ١٤، ١٥ | أكاديمية الرياضيات الصغيرة';
 var nav=document.getElementById('mainNav'),menu=document.getElementById('menuBtn');
 if(nav)nav.hidden=true;
 if(menu)menu.setAttribute('aria-expanded','false');
 window.scrollTo({top:0,behavior:'instant'});
};
document.addEventListener('click',function(e){
 var b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-n13-answer')){
  answered=true;correct=b.dataset.n13Answer==='right';render();return;
 }
 if(b.hasAttribute('data-n13-next')){stage=Math.min(3,stage+1);answered=false;correct=false;render();return;}
 if(b.hasAttribute('data-n13-target')){target=Number(b.dataset.n13Target);parts=[];render();return;}
 if(b.hasAttribute('data-n13-part')){
  var a=Number(b.dataset.n13Part);
  if(parts.length>=2||parts.some(function(x){return pairId(x,target-x)===pairId(a,target-a)}))return;
  if(a>0&&target-a>0){parts.push(a);render()}
  return;
 }
 if(b.hasAttribute('data-n13-back')){pageMode='lessons';navigate('chapter/5/lessons');return;}
 if(b.hasAttribute('data-n13-game')){pageMode='games';oldStart(lessonCode);return;}
 if(b.hasAttribute('data-ac-open-learning')){stage=0;answered=false;correct=false;target=14;parts=[];pageMode='lessons';navigate('learn/5-2');return;}
});
window.addEventListener('hashchange',function(){if(/^#\/?learn\/5-2$/.test(location.hash||''))render();});
if(/^#\/?learn\/5-2$/.test(location.hash||''))document.addEventListener('DOMContentLoaded',function(){render();},{once:true});
var style=document.createElement('style');
style.id='n13-thinking-style';
style.textContent=[
'.n13-learning{direction:rtl;max-width:820px;margin:0 auto;padding:14px 13px 28px;font-family:inherit;color:#14394e}',
'.n13-learning *{box-sizing:border-box}',
'.n13-back{background:#edf8f6;border:1px solid #b6d9d4;border-radius:15px;padding:10px 15px;color:#185f67;font:inherit;font-weight:800;margin-bottom:12px}',
'.n13-hero{text-align:center;border-radius:22px;background:linear-gradient(120deg,#064c61,#07817b);padding:18px 14px;color:white}',
'.n13-hero span{color:#ffda78;font-size:14px;font-weight:800}',
'.n13-hero h1{font-size:clamp(26px,5vw,38px);margin:5px 0;color:white!important;line-height:1.35}',
'.n13-hero p{margin:0;color:white;font-size:15px}',
'.n13-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:16px 0}',
'.n13-tabs span{text-align:center;background:#f2f7f5;border:1px solid #e1e9e3;padding:10px 3px;border-radius:12px;font-size:clamp(10px,2.2vw,13px);color:#557478;font-weight:800}',
'.n13-tabs .active{background:#d3efe7;border-color:#6ab9ae;color:#075e66}',
'.n13-tabs .done{background:#fff3d5;color:#7b6018}',
'.n13-panel{background:white;border:1px solid #dcebe8;border-radius:22px;padding:18px 15px;box-shadow:0 7px 22px #14364e0e}',
'.n13-prompt{text-align:center;line-height:1.8}',
'.n13-level{display:inline-block;border-radius:999px;background:#fff0c7;padding:5px 13px;color:#7a5512;font-size:13px;font-weight:900}',
'.n13-prompt h2{font-size:clamp(18px,3.4vw,24px);line-height:1.6;margin:12px 0;color:#123d55}',
'.n13-prompt p{font-size:14px;color:#49687a}',
'.n13-frames{display:flex;flex-wrap:wrap;justify-content:center;gap:12px!important;margin:16px auto}',
'.n13-frames>div{text-align:center;padding:9px;border:1px solid #dcebe8;border-radius:16px;background:#f9fdfb}',
'.n13-frames small{display:block;font-size:12px;font-weight:800;color:#235c64;padding-bottom:8px}',
'.n13-answers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:15px 0}',
'.n13-answers button,.n13-targets button,.n13-splits button{border:1px solid #c8ded9;background:#f7fcfb;color:#174f62;border-radius:14px;min-height:52px;padding:10px;font:inherit;font-weight:850;cursor:pointer}',
'.n13-answers button:focus-visible,.n13-targets button:focus-visible,.n13-splits button:focus-visible{outline:3px solid #d9a83d;outline-offset:2px}',
'.n13-feedback{padding:13px;border-radius:14px;margin:14px 0;font-weight:800;line-height:1.7}',
'.n13-feedback.yes{background:#e7f7f0;color:#185944}',
'.n13-feedback.try{background:#fff3e1;color:#785019}',
'.n13-primary{display:block;width:100%;min-height:51px;margin-top:13px;background:#087d79;border:0;color:white;border-radius:14px;font:inherit;font-weight:900;font-size:16px;cursor:pointer}',
'.n13-targets{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}',
'.n13-targets button.chosen{background:#0a7573;color:#fff}',
'.n13-label{font-size:14px;margin:17px 0 9px;font-weight:800;color:#32566a}',
'.n13-splits{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}',
'.n13-splits button{min-width:0;font-size:18px;padding:7px}',
'.n13-splits button:disabled{opacity:.35;cursor:default}',
'.n13-created{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:16px 0}',
'.n13-created-item{display:grid;gap:6px;border:1px solid #e6d7a9;border-radius:13px;background:#fffaf0;padding:12px 8px;text-align:center}',
'.n13-created-item strong{font-size:13px;color:#76591b}',
'.n13-created-item span{font-weight:900;color:#164d57}',
'.n13-muted{grid-column:1 / -1;text-align:center;color:#6a7f85;font-size:13px}',
'.n13-end{text-align:center;padding:20px 7px;line-height:1.8}',
'.n13-end h2{color:#155e62}.n13-end-medal{font-size:54px}',
'.n13-sign{text-align:center;font-size:12px;margin-top:19px;color:#5d7482}',
'@media(max-width:480px){.n13-learning{padding:10px 8px}.n13-panel{padding:14px 10px}.n13-answers{grid-template-columns:1fr}.n13-frames{gap:7px}.n13-frames>div{padding:6px}.n13-splits{gap:5px}.n13-created{gap:6px}}'
].join('');
document.head.appendChild(style);
})();