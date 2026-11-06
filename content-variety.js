
/* Academy question audit: distinct short tasks, not repeated drills.
   Works with the original Saudi Grade 1 lesson and answer generators.
   Does not modify local progress, student data, artwork or navigation. */
(function(){
'use strict';
const previous=questionsFor;
/* A shortcut or shared lesson link is a game, not a copy of the lesson practice. */
if(/^#\/?practice\//.test(location.hash||''))pageMode='games';
document.addEventListener('click',function(event){
 const target=event.target.closest?.('[data-lesson],[data-ac-open-lesson]');
 if(target&&(target.closest?.('.playhome')||target.closest?.('.academy-notice-board')||target.hasAttribute('data-ac-open-lesson'))){
  pageMode='games';
 }
},true);

const pos=(n,m)=>((n%m)+m)%m;
const word=(n)=>WORDS[n]||arabic(n);
const correct=(n,low=0,high=20,seed=0)=>numericChoices(n,low,high,seed);
const tag=(q)=>{
 const answer=q.choices?.find(x=>x.correct);
 return [q.prompt,q.visual.replace(/\sstyle="[^"]*"/g,''),answer?.text||answer?.html||''].join('|');
};
function optionsFor(n,lo,hi,seed,asWords=false){
 let values=[n],d=1;
 while(values.length<4&&d<=20){
  if(n+d<=hi)values.push(n+d);
  if(values.length<4&&n-d>=lo)values.push(n-d);
  d++;
 }
 return reorder([...new Set(values)].map(v=>({text:asWords?word(v):arabic(v),correct:v===n})),seed);
}
function picture(n,icon='🍎'){
 return '<div class="count-container" role="img" aria-label="'+arabic(n)+' أشياء"><div class="dots">'+
 Array.from({length:n},()=>'<span style="font-size:27px">'+icon+'</span>').join('')+'</div></div>';
}
function sumVisual(a,b){
 return '<div class="count-container">'+circleDots(a)+'<strong style="font-size:30px">+</strong>'+circleDots(b)+'</div>';
}
function numberTask(skill,type,seed){
 const [lo,hi]=rangeOf(skill),n=chooseNumber(lo,hi,seed);
 const readable=isRead(skill),unit=pos(type,5);
 if(readable){
  if(unit===0)return makeQuestion('كيف نقرأ العدد '+arabic(n)+'؟',frameText(arabic(n)),optionsFor(n,1,Math.max(hi,5),seed,true),'نقرأه '+word(n)+'.',seed);
  if(unit===1)return numQ('اختر رمز العدد «'+word(n)+'».',frameText(word(n)),n,1,hi,seed,'نكتب '+word(n)+' هكذا: '+arabic(n)+'.');
  if(unit===2)return makeQuestion('ما اسم العدد الذي تمثله الدوائر؟',circleDots(n),optionsFor(n,1,Math.max(hi,5),seed,true),'اسم العدد '+word(n)+'.',seed);
  if(unit===3)return numQ('كم عدد القطع الموضحة؟',n>10?'<div class="count-container">'+tenFrame(10)+tenFrame(n-10)+'</div>':tenFrame(n),n,1,hi,seed,'عددها '+arabic(n)+'.');
  return makeQuestion('اختر الاسم المناسب للعدد المكتوب.',visualSequence([n]),optionsFor(n,1,Math.max(hi,5),seed,true),'يُقرأ '+word(n)+'.',seed);
 }
 if(unit===0)return numQ('أعدّ الأشياء، ثم اختر العدد.',picture(n,'🍎'),n,1,hi,seed,'عدد التفاحات '+arabic(n)+'.');
 if(unit===1){
  const vals=[n];for(let d=1;vals.length<4&&d<=20;d++){
   if(n-d>=1)vals.push(n-d);if(vals.length<4&&n+d<=hi)vals.push(n+d);
  }
  return makeQuestion('أي مجموعة تمثل '+arabic(n)+'؟',frameText(arabic(n)),
    [...new Set(vals)].map(x=>htmlChoice(circleDots(x),x===n)),'المجموعة الصحيحة فيها '+arabic(n)+' عناصر.',seed);
 }
 if(unit===2){
  let visual=n>10?'<div class="count-container">'+tenFrame(10)+tenFrame(n-10)+'</div>':tenFrame(n);
  return numQ('كم عدادًا ملونًا في الإطار؟',visual,n,1,hi,seed,'العدادات الملونة '+arabic(n)+'.');
 }
 if(unit===3)return numQ('ما العدد الذي يمثله هذا الرسم؟',picture(n,'⭐'),n,1,hi,seed,'عدد النجوم '+arabic(n)+'.');
 return makeQuestion('اختر العدد المكتوب بالكلمات.',frameText(arabic(n)),
    optionsFor(n,1,Math.max(hi,5),seed,true),'هو '+word(n)+'.',seed);
}
function orderingTask(skill,type,seed){
 const max=skill==='order10'?10:20,unit=pos(type,5);
 const step=(unit===1||unit===4)?2:1;
 const count=unit===3||unit===4?4:3;
 const maxBase=Math.max(1,max-step*(count-1));
 const start=chooseNumber(1,maxBase,seed*3+unit);
 const nums=Array.from({length:count},(_,i)=>start+i*step);
 const shown=nums.slice(1).concat(nums[0]);
 if(unit===2){
  const answer=nums[1],visual=visualSequence([nums[0],'؟',nums[2]]);
  return numQ('ما العدد الناقص في الترتيب؟',visual,answer,1,max,seed,'العدد الناقص '+arabic(answer)+'.');
 }
 const asc=unit===0||unit===3,ordered=asc?nums:[...nums].reverse();
 const value=(v)=>numberList(v);
 const swap=(arr,i,j)=>{let cp=[...arr];[cp[i],cp[j]]=[cp[j],cp[i]];return cp;};
 const raw=[ordered,swap(ordered,0,1),[...ordered].reverse(),ordered.slice(1).concat(ordered[0])];
 const opts=[...new Map(raw.map((v,i)=>[value(v),strChoice(value(v),i===0)])).values()];
 return makeQuestion(
   unit===0?'رتّب البطاقات من الأصغر إلى الأكبر.':
   unit===1?'رتّب الأعداد غير المتتالية تنازليًا.':
   unit===3?'ما ترتيب الأعداد الأربعة تصاعديًا؟':'رتّب البطاقات الأربعة من الأكبر إلى الأصغر.',
   visualSequence(shown),opts,'الترتيب الصحيح: '+value(ordered)+'.',seed);
}
function comparisonTask(skill,type,seed){
 const max=skill==='compare10'?10:20,unit=pos(type,5);
 const a=chooseNumber(2,max-2,seed*3);
 const b=a+1+(seed%2);
 if(unit===0)return numQ('أي العددين أكبر؟',visualSequence([a,b]),b,1,max,seed,'الأكبر هو '+arabic(b)+'.');
 if(unit===1)return numQ('أي عدد هو الأصغر؟',visualSequence([b,a,a-1]),a-1,1,max,seed,'الأصغر هو '+arabic(a-1)+'.');
 if(unit===2)return makeQuestion('أي رمز مناسب بين العددين؟',
   '<div class="numbers-strip"><span>'+arabic(a)+'</span><span>؟</span><span>'+arabic(b)+'</span></div>',
   [strChoice('أكبر من (>)',false),strChoice('أصغر من (<)',true),strChoice('يساوي (=)',false)],
   arabic(a)+' أصغر من '+arabic(b)+'.',seed);
 if(unit===3)return makeQuestion('أي مجموعة فيها عناصر أكثر؟',pairVisual(a,b),
   [strChoice('المجموعة (أ)',false),strChoice('المجموعة (ب)',true)],
   'المجموعة (ب) فيها '+arabic(b)+' عناصر، وهي الأكثر.',seed);
 return makeQuestion('قارن العدد بالعدد نفسه.',
   visualSequence([a,'؟',a]),
   [strChoice('أكبر من (>)',false),strChoice('أصغر من (<)',false),strChoice('يساوي (=)',true)],
   'عند تساوي العددين نختار يساوي.',seed);
}
function patternTask(skill,type,seed){
 const unit=pos(type,5),colors=['red','blue','green','yellow'];
 const order=colors.slice(pos(seed,4)).concat(colors.slice(0,pos(seed,4)));
 const form=['circle','square','triangle'][pos(seed+unit,3)];
 let sequence,answer,prompt;
 if(unit===0){
  sequence=[order[0],order[1],order[0],order[1],'?'];
  answer=order[0];prompt='أكمل نمط اللونين.';
 }else if(unit===1){
  sequence=[order[0],order[0],order[1],order[0],'?',order[1]];
  answer=order[0];prompt='ما الشكل الناقص في وسط النمط؟';
 }else if(unit===2){
  sequence=[order[0],order[1],order[2],order[0],order[1],'?'];
  answer=order[2];prompt='لاحظ الألوان الثلاثة، ماذا يأتي؟';
 }else if(unit===3){
  sequence=[order[0],order[1],order[1],order[0],'?',order[1]];
  answer=order[1];prompt='أكمل نمط (واحد، اثنان).';
 }else{
  sequence=[order[1],order[0],order[1],order[0],'?'];
  answer=order[1];prompt='اختر الشكل الذي يواصل التكرار.';
 }
 return makeQuestion(prompt,patternVisual(sequence,form),
  colors.map(c=>htmlChoice(shape(form,c),c===answer)),'انظر إلى الوحدة المتكررة ثم أكمل.',seed);
}
function additionTask(skill,type,seed){
 const unit=pos(type,5);
 let a=chooseNumber(1,5,seed*2),b=chooseNumber(1,5,seed*3+1);
 if(skill==='addZero'){if(seed%2===0)a=0;else b=0;}
 const total=a+b,visual=sumVisual(a,b);
 if(skill==='verticalAdd'){
  return numQ('اجمع الأعداد المكتوبة رأسيًا.',
    '<div class="math-vertical"><div>'+arabic(a)+'</div><div class="under">+ '+arabic(b)+'</div><div>؟</div></div>',
    total,0,12,seed,arabic(a)+' + '+arabic(b)+' = '+arabic(total)+'.');
 }
 if(unit===0)return numQ('كم عنصرًا في المجموعتين معًا؟',visual,total,0,12,seed,'المجموع '+arabic(total)+'.');
 if(unit===1)return makeQuestion('اختر جملة الجمع التي تناسب الصورة.',visual,
   [strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(total),true),
    strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(total+1),false),
    strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(Math.max(0,total-1)),false),
    strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(total+2),false)],
   'الجملة الصحيحة: '+arabic(a)+' + '+arabic(b)+' = '+arabic(total)+'.',seed);
 if(unit===2)return numQ('ما العدد الناقص في جملة الجمع؟',
   frameText(arabic(a)+' + ؟ = '+arabic(total)),b,0,12,seed,
   arabic(a)+' + '+arabic(b)+' = '+arabic(total)+'.');
 if(unit===3)return numQ('أعدّ جميع العناصر بعد جمع المجموعتين.',picture(a,'🔵')+' '+picture(b,'🟡'),total,0,12,seed,'المجموع '+arabic(total)+'.');
 return numQ('أوجد ناتج الجمع.',frameText(arabic(a)+' + '+arabic(b)+' = ؟'),
   total,0,12,seed,'الناتج '+arabic(total)+'.');
}
function composingTask(skill,type,seed){
 const unit=pos(type,4),bounds=skill==='compose456'?[4,6]:skill==='compose789'?[7,9]:[10,12];
 const n=chooseNumber(bounds[0],bounds[1],seed),part=1+pos(seed+unit,n-1),missing=n-part;
 if(unit===0)return numQ('أكمل العدد الناقص.',frameText(arabic(part)+' + ؟ = '+arabic(n)),missing,0,12,seed,arabic(part)+' + '+arabic(missing)+' = '+arabic(n)+'.');
 if(unit===1)return numQ('كم قطعة نضيف ليصبح المجموع '+arabic(n)+'؟',
   circleDots(part),missing,0,12,seed,'نضيف '+arabic(missing)+' قطع.',seed);
 if(unit===2)return makeQuestion('أي جملة جمع تكوّن العدد '+arabic(n)+'؟',frameText(arabic(n)),
   [strChoice(arabic(part)+' + '+arabic(missing),true),
    strChoice(arabic(part)+' + '+arabic(Math.max(0,missing-1)),false),
    strChoice(arabic(part)+' + '+arabic(missing+1),false)],
   'نكوّن العدد '+arabic(n)+' من '+arabic(part)+' و'+arabic(missing)+'.',seed);
 return numQ('كم عنصرًا نحتاج لإكمال المجموعة؟',
   '<div class="count-container">'+circleDots(part)+'<strong>+ ؟ = '+arabic(n)+'</strong></div>',
   missing,0,12,seed,'العدد الناقص '+arabic(missing)+'.');
}
function ordinalTask(type,seed){
 const names=['🔴','🟡','🟢','🔵','⭐'],unit=pos(type,4),offset=pos(seed,5);
 const arr=names.slice(offset).concat(names.slice(0,offset)),target=arr.indexOf('⭐');
 const visual='<div class="pattern" style="font-size:36px">'+arr.map(x=>'<span>'+x+'</span>').join('')+'</div>';
 if(unit===0)return numQ('من جهة اليمين، ما ترتيب النجمة؟',visual,target+1,1,5,seed,'النجمة في المرتبة '+arabic(target+1)+' من اليمين.');
 if(unit===1)return numQ('من جهة اليسار، ما ترتيب النجمة؟',visual,5-target,1,5,seed,'النجمة في المرتبة '+arabic(5-target)+' من اليسار.');
 const number=unit===2?2:3,right=unit===2,answer=right?arr[number-1]:arr[5-number];
 return makeQuestion('أي شكل في المرتبة '+(number===2?'الثانية':'الثالثة')+' من جهة '+(right?'اليمين':'اليسار')+'؟',
 visual,[answer,...arr.filter(x=>x!==answer).slice(0,3)].map(x=>strChoice(x,x===answer)),
 'نبدأ العد من جهة '+(right?'اليمين':'اليسار')+' حتى نصل إلى الشكل المطلوب.',seed);
}

function numberPatternTask(type,seed){
 const unit=pos(type,5),step=unit===1||unit===4?2:1;
 const start=chooseNumber(11,14,seed*3+unit),n=start+step*2;
 if(unit===0)return numQ('أكمل العد بزيادة واحد.',visualSequence([start,start+1,'؟']),start+2,11,20,seed,'نزيد واحدًا في كل مرة.');
 if(unit===1)return numQ('ما العدد التالي عند العدّ اثنين اثنين؟',
   visualSequence([start,start+2,start+4,'؟']),start+6,11,20,seed,'نزيد اثنين في كل مرة.');
 if(unit===2)return numQ('اكتشف العدد المفقود في الوسط.',
   visualSequence([start,'؟',start+2]),start+1,11,20,seed,'نزيد واحدًا في كل خطوة.');
 if(unit===3)return makeQuestion('أي قاعدة تصف هذا النمط؟',
   visualSequence([start,start+2,start+4,start+6]),
   [strChoice('نزيد ١',false),strChoice('نزيد ٢',true),strChoice('ننقص ١',false)],'يزيد كل عدد بمقدار اثنين.',seed);
 return numQ('ما العدد الناقص في تسلسل الأعداد؟',visualSequence([start,start+2,'؟',start+6]),
   start+4,11,20,seed,'نزيد اثنين في كل خطوة.');
}
function verticalAdditionTask(type,seed){
 const a=chooseNumber(1,5,seed*2),b=chooseNumber(1,5,seed+1),sum=a+b,unit=pos(type,4);
 const vertical='<div class="math-vertical"><div>'+arabic(a)+'</div><div class="under">+ '+arabic(b)+'</div><div>؟</div></div>';
 if(unit===0)return numQ('احسب ناتج الجمع الرأسي.',vertical,sum,0,12,seed,arabic(a)+' + '+arabic(b)+' = '+arabic(sum)+'.');
 if(unit===1)return makeQuestion('اختر الناتج الصحيح للجمع الرأسي.',vertical,
   optionsFor(sum,0,12,seed),'الناتج هو '+arabic(sum)+'.',seed);
 if(unit===2)return numQ('أعدّ القطع، ثم أكمل الجمع.',sumVisual(a,b),sum,0,12,seed,'عند جمع المجموعتين نحصل على '+arabic(sum)+'.');
 return makeQuestion('أي عبارة صحيحة للعملية المعروضة؟',vertical,
 [strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(sum),true),
 strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(sum+1),false),
 strChoice(arabic(a)+' + '+arabic(b)+' = '+arabic(Math.max(0,sum-1)),false)],
 'الجمع الرأسي يعطي '+arabic(sum)+'.',seed);
}
function modelTask(type,seed){
 const n=chooseNumber(1,5,seed);
 if(type%4===0)return makeQuestion('اختر عدد القطع المطابق.',frameText(arabic(n)),
  [n,n+1,n+2,Math.max(0,n-1)].filter((x,i,a)=>a.indexOf(x)===i).map(x=>htmlChoice(circleDots(x),x===n)),
  'المجموعة الصحيحة فيها '+arabic(n)+' قطع.',seed);
 if(type%4===1)return numQ('كم قطعة داخل المجموعة؟',circleDots(n),n,0,7,seed,'نعد '+arabic(n)+' قطع.',seed);
 if(type%4===2)return makeQuestion('أي إطار يمثّل '+arabic(n)+'؟',frameText(arabic(n)),
  [n,n+1,Math.max(0,n-1),n+2].filter((x,i,a)=>a.indexOf(x)===i).map(x=>htmlChoice(tenFrame(x),x===n)),
  'الإطار الصحيح يحتوي على '+arabic(n)+' عدادات.',seed);
 return numQ('انظر إلى الأشياء ثم اختر عددها.',picture(n,'🐟'),n,0,7,seed,'عددها '+arabic(n)+'.');
}
function moreLessTask(type,seed){
 const unit=pos(type,4),a=chooseNumber(2,6,seed),b=a+1;
 if(unit===0)return makeQuestion('أي مجموعة تحتوي على أكثر؟',pairVisual(a,b),
  [strChoice('المجموعة (أ)',false),strChoice('المجموعة (ب)',true)],
  'المجموعة (ب) أكبر في العدد.',seed);
 if(unit===1)return makeQuestion('أي مجموعة فيها عناصر أقل؟',pairVisual(a,b),
  [strChoice('المجموعة (أ)',true),strChoice('المجموعة (ب)',false)],
  'المجموعة (أ) أقل في العدد.',seed);
 if(unit===2)return makeQuestion('ما العبارة الصحيحة عن المجموعتين؟',pairVisual(a,b),
  [strChoice('المجموعتان متساويتان',false),strChoice('المجموعة (ب) أكثر',true),strChoice('المجموعة (أ) أكثر',false)],
  'المجموعة (ب) أكثر من المجموعة (أ).',seed);
 return numQ('كم عنصرًا في المجموعة الأكثر؟',pairVisual(a,b),b,0,10,seed,
  'في المجموعة الأكبر '+arabic(b)+' عناصر.');
}
function drawTask(skill,type,seed){
 const max=skill==='draw5'?5:10,n=chooseNumber(1,max,seed);
 const icons=['🍎','🐠','⚽','⭐'],unit=pos(type,4),pictured=picture(n,icons[unit]);
 if(unit===0)return makeQuestion('أي رسم بالدوائر يمثل الأشياء؟',pictured,
  [n,Math.max(0,n-1),Math.min(max,n+1),Math.min(max,n+2)].filter((x,i,a)=>a.indexOf(x)===i).map(x=>htmlChoice(circleDots(x),x===n)),
  'لكل شيء نرسم دائرة واحدة.',seed);
 if(unit===1)return numQ('كم دائرة نرسم لتمثيل الأشياء؟',pictured,n,0,max,seed,'نرسم '+arabic(n)+' دوائر.',seed);
 if(unit===2)return makeQuestion('أي مجموعة من النقاط لها العدد نفسه؟',pictured,
  [n,Math.min(max,n+1),Math.max(0,n-1),Math.min(max,n+2)].filter((x,i,a)=>a.indexOf(x)===i).map(x=>htmlChoice(tenFrame(x),x===n)),
  'نمثّل كل شيء بعدّاد واحد.',seed);
 return numQ('أعدّ الصور ثم اختر العدد الذي يُرسم.',pictured,n,0,max,seed,'نرسم '+arabic(n)+' أشكال.',seed);
}


function zeroTask(type,seed){
 const unit=pos(type,4);
 if(unit===0)return numQ('كم عنصرًا داخل الإطار الخالي؟',circleDots(0),0,0,4,seed,'المجموعة الخالية عددها صفر.');
 if(unit===1)return makeQuestion('اختر المجموعة الخالية.',frameText('المجموعة الخالية'),
  [0,1,2,3].map(n=>htmlChoice(circleDots(n),n===0)),
  'المجموعة التي ليس فيها دوائر تمثّل الصفر.',seed);
 if(unit===2)return makeQuestion('كيف نقرأ الرمز ٠؟',frameText('٠'),
  [strChoice('صفر',true),strChoice('واحد',false),strChoice('اثنان',false),strChoice('ثلاثة',false)],
  'نقرأ الرمز ٠: صفر.',seed);
 return numQ('لا توجد أي أشياء في الصورة؛ أي عدد يصفها؟',
   '<div class="visual-zero" style="min-height:55px;padding:13px;border:2px dashed #b3cbd6;border-radius:15px">لا شيء هنا</div>',
   0,0,4,seed,'عندما لا توجد أشياء فالعدد هو صفر.');
}
function aboveBelowTask(type,seed){
 const unit=pos(type,4);
 const stack=(top,bottom)=>'<div class="position-stack"><span>'+top+'</span><span>'+bottom+'</span></div>';
 if(unit===0)return makeQuestion('أين النجمة بالنسبة إلى المربع؟',stack('⭐','🟦'),
  [strChoice('فوق',true),strChoice('تحت',false)],
  'النجمة فوق المربع.',seed);
 if(unit===1)return makeQuestion('أين الدائرة بالنسبة إلى المثلث؟',stack('🔺','🟢'),
  [strChoice('فوق',false),strChoice('تحت',true)],
  'الدائرة تحت المثلث.',seed);
 if(unit===2)return makeQuestion('أي شكل يقع فوق الدائرة الحمراء؟',stack('🟨','🔴'),
  [strChoice('المربع الأصفر',true),strChoice('الدائرة الحمراء',false)],
  'المربع الأصفر فوق الدائرة.',seed);
 return makeQuestion('ما الشكل الذي يقع أسفل النجمة؟',stack('⭐','🟦'),
  [strChoice('المربع الأزرق',true),strChoice('النجمة',false)],
  'المربع الأزرق تحت النجمة.',seed);
}

function pickQuestion(skill,type,seed){
 if(rangeOf(skill))return numberTask(skill,type,seed);
 if(skill==='compare10'||skill==='compare20')return comparisonTask(skill,type,seed);
 if(skill==='order10'||skill==='order20')return orderingTask(skill,type,seed);
 if(['patternFind','patternBuild','patternSolve'].includes(skill))return patternTask(skill,type,seed);
 if(['addStory','addModel','addSentence','addSolve','addZero'].includes(skill))return additionTask(skill,type,seed);
 if(['compose456','compose789','compose101112'].includes(skill))return composingTask(skill,type,seed);
 if(skill==='ordinal')return ordinalTask(type,seed);
 if(skill==='zero')return zeroTask(type,seed);
 if(skill==='abovebelow')return aboveBelowTask(type,seed);
 if(skill==='pattern20')return numberPatternTask(type,seed);
 if(skill==='verticalAdd')return verticalAdditionTask(type,seed);
 if(skill==='model')return modelTask(type,seed);
 if(skill==='moreLess')return moreLessTask(type,seed);
 if(skill==='draw5'||skill==='draw10')return drawTask(skill,type,seed);
 return generate(skill,seed);
}
questionsFor=function(lesson,requested){
 const test=!!lesson.testType,cap=test?6:4;
 const count=Math.min(cap,requested||cap),attempts=progress[lesson.code]?.attempts||0;
 const mode=test?'tests':pageMode;
 const shift=mode==='games'?3:mode==='tests'?7:0;
 const rows=test?(()=>{const c=lesson.chapter,p=lesson.testType;
  const chapters=p==='cumulative'?CHAPTERS.filter(x=>x.id<=c.id):[c];
  const all=chapters.flatMap(x=>x.lessons);
  return p==='prep'?all.slice(0,3):p==='mid'||p==='reviewMid'?all.slice(0,Math.ceil(all.length/2)):all;})():null;
 const pools=test&&lesson.testType==='cumulative'
  ?CHAPTERS.filter(ch=>ch.id<=lesson.chapter.id).map(ch=>ch.lessons):null;
 const seen=new Set(),out=[];
 for(let i=0;i<count;i++){
  // Spread assessments through the chapter instead of taking only its first six skills.
  // Cumulative assessment picks from every completed chapter, rotating on retries.
  const group=pools?pools[pos(i,pools.length)]:null;
  const row=test?(group?group[pos(Math.floor(i/pools.length)+attempts,group.length)]
      :rows[pos(Math.floor((i+0.5)*rows.length/count)+attempts,rows.length)]):null;
  const skill=row?row[2]:lesson.skill;
  const modeType=pos(i+(test?shift:0),5);
  let q=null;
  for(let retry=0;retry<55;retry++){
   const seed=attempts*17+shift*23+i*7+retry*11;
   const next=pickQuestion(skill,modeType,seed);
   if(!next||!next.choices?.length||next.choices.filter(x=>x.correct).length!==1)continue;
   const key=tag(next);
   if(!seen.has(key)){q=next;q.sourceSkill=skill;seen.add(key);break;}
  }
  if(q)out.push(q); // Less content is better than showing the same task twice.
 }
 return out.length?out:previous(lesson,requested);
};
})();
