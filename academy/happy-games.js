
/* Original characters + real tap-based mini-games; preserves chapter/lesson records and local scores. */
(function(){
'use strict';
if(window.__littleMathAdventure)return;window.__littleMathAdventure=true;
var BUDDY_KEY='little-math-academy-buddy-v1',buddy='lulu';
try{if(localStorage.getItem(BUDDY_KEY)==='mishmish')buddy='mishmish'}catch(e){}
var chapters={
1:{name:'حديقة الأشكال',emoji:'🌼',sub:'ألوان وأشكال',mode:'garden',sample:'1-1'},
2:{name:'قطار الأعداد',emoji:'🚂',sub:'أعدّ وأتعلّم',mode:'train',sample:'2-1'},
3:{name:'مدينة الأنماط',emoji:'🌈',sub:'اكتشف النمط',mode:'stars',sample:'3-4'},
4:{name:'مغامرة الأعداد',emoji:'🎈',sub:'حتى العدد ١٠',mode:'balloons',sample:'4-6'},
5:{name:'كنز العشرين',emoji:'🗝️',sub:'حتى العدد ٢٠',mode:'treasure',sample:'5-6'},
6:{name:'مهرجان الجمع',emoji:'🧺',sub:'هيا نجمع',mode:'garden',sample:'6-1'}
};
function character(who){
var boy=who==='mishmish',shirt=boy?'#f9ad61':'#68c8d2',dark=boy?'#2a4259':'#493b57';
return '<svg class="buddy-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 175" role="img" aria-label="'+(boy?'بدر رفيق المغامرة':'لولو رفيقة المغامرة')+'">'
+'<ellipse cx="80" cy="167" rx="49" ry="7" fill="#3b7089" opacity=".15"/>'
+'<path d="M58 132L52 160Q65 169 74 162L77 141M94 140L98 162Q110 169 119 160L111 128" fill="#496a9c" stroke="#395b80" stroke-width="3"/>'
+'<path d="M45 121Q20 116 20 93M118 120Q140 116 140 94" fill="none" stroke="#e6a877" stroke-width="12" stroke-linecap="round"/>'
+'<circle cx="20" cy="91" r="8" fill="#e6a877"/><circle cx="140" cy="92" r="8" fill="#e6a877"/>'
+(!boy?'<ellipse cx="32" cy="77" rx="17" ry="26" fill="'+dark+'"/><ellipse cx="128" cy="77" rx="17" ry="26" fill="'+dark+'"/><path d="M21 72Q11 53 28 45M139 72Q150 52 131 45" stroke="'+dark+'" stroke-width="11" fill="none" stroke-linecap="round"/>':'')
+'<path d="M51 119Q80 110 109 119L119 151Q80 166 43 151Z" fill="'+shirt+'" stroke="'+(boy?'#d58d43':'#389cab')+'" stroke-width="4" stroke-linejoin="round"/>'
+'<path d="M51 115L43 126M109 115L117 126" stroke="'+shirt+'" stroke-width="12" stroke-linecap="round"/>'
+'<path d="M76 126L80 119 85 126 93 128 87 135 89 144 80 139 71 144 73 135 67 128Z" fill="#fff4ae" stroke="#fff" stroke-width="1.5"/>'
+'<ellipse cx="80" cy="77" rx="48" ry="49" fill="#edb585" stroke="#c68c65" stroke-width="3"/>'
+(!boy?'<path d="M34 76Q19 18 79 21Q135 18 126 76Q119 61 103 59Q81 44 69 54Q51 66 34 76Z" fill="'+dark+'"/><path d="M53 35Q80 11 110 34" fill="none" stroke="#ffe29a" stroke-width="9" stroke-linecap="round"/><circle cx="42" cy="44" r="5" fill="#ffe29a"/>':
'<path d="M35 63Q18 43 41 32Q43 13 65 24Q77 10 91 22Q115 10 121 31Q148 40 124 66L119 54Q96 49 84 40Q67 56 35 63Z" fill="'+dark+'"/><circle cx="51" cy="30" r="11" fill="'+dark+'"/><circle cx="96" cy="22" r="9" fill="'+dark+'"/>')
+'<g class="blink"><ellipse cx="63" cy="79" rx="6.5" ry="9" fill="#263748"/><ellipse cx="99" cy="79" rx="6.5" ry="9" fill="#263748"/><circle cx="65" cy="76" r="2.4" fill="#fff"/><circle cx="101" cy="76" r="2.4" fill="#fff"/></g>'
+'<path d="M54 68Q62 64 70 69M92 68Q99 64 107 69" stroke="'+dark+'" stroke-width="3" stroke-linecap="round" fill="none"/>'
+'<ellipse cx="49" cy="94" rx="10" ry="5" fill="#ec8892" opacity=".53"/><ellipse cx="113" cy="94" rx="10" ry="5" fill="#ec8892" opacity=".53"/>'
+'<path d="M73 102Q81 111 90 102" stroke="#ad6360" stroke-width="4" stroke-linecap="round" fill="none"/>'
+'<circle cx="82" cy="91" r="2.5" fill="#dc936d"/>'
+'<path d="M52 165Q64 171 75 166M98 165Q109 171 120 166" stroke="#263e5b" stroke-width="7" stroke-linecap="round" fill="none"/>'
+'</svg>';
}
function buddyPicker(){return '<section class="buddy-pick"><strong>اختر رفيقك في المغامرة ✨</strong><div class="buddy-pick-btns">'
+['lulu','mishmish'].map(function(x){return '<button type="button" data-buddy="'+x+'" aria-pressed="'+(x===buddy)+'">'+character(x)+'<span>'+(x==='lulu'?'لولو':'بدر')+'</span></button>'}).join('')+'</div></section>';}
function miniNav(){return '<nav class="play-mininav" aria-label="أقسام الأكاديمية">'
+[['lessons','📚','الدروس'],['games','🎮','الألعاب'],['tests','🏅','التحديات'],['evidence','⭐','نجومي']].map(function(x){
return '<button data-nav="'+x[0]+'"><span aria-hidden="true">'+x[1]+'</span>'+x[2]+'</button>'}).join('')+'</nav>';}
function worlds(mode,shortcuts){
return '<section class="play-chapters" aria-label="مغامرات الرياضيات">'+CHAPTERS.map(function(c){
var w=chapters[c.id];
return '<button class="play-chapter" type="button" '+(shortcuts?'data-lesson="'+w.sample+'"':'data-chapter="'+c.id+'" data-mode="'+(mode||'games')+'"')+'>'
+'<span class="world-num">'+arabic(c.id)+'</span><span class="world-emoji" aria-hidden="true">'+w.emoji+'</span>'
+'<span class="world-name">'+w.name+'</span><span class="world-sub">'+w.sub+'</span></button>';
}).join('')+'</section>';
}
var homeOld=renderHome;
renderHome=function(){
var total=CHAPTERS.reduce(function(n,c){return n+c.lessons.length},0),done=completedCount(),pct=Math.round(done/total*100);
return '<section class="playhome"><section class="playhero"><div class="playhero-copy">'
+'<span class="hey">🌞 أهلاً بك يا بطل الرياضيات!</span><h1>أكاديمية الرياضيات الصغيرة</h1>'
+'<p>عالم من الألعاب والنجوم والمغامرات الممتعة</p><button class="playbigbutton" data-lesson="4-6">🎈 العب تحدي المقارنة</button></div>'
+'<div class="playhero-figures">'+character('lulu')+character('mishmish')+'</div></section>'
+miniNav()+'<div class="quick-links" hidden aria-hidden="true" style="display:none!important"></div>'
+'<h2 class="play-section-head">🎮 اختر مغامرتك</h2>'+worlds('games',true)
+buddyPicker()
+'<section class="play-progress"><strong>🌟 نجومي: '+arabic(done)+' / '+arabic(total)+'</strong><div class="track" role="progressbar" aria-label="تقدمي" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+pct+'%"></span></div>'
+'<button data-nav="evidence">شاهد إنجازاتي</button></section>'
+'<p class="info-note" style="text-align:center">الصف الأول الابتدائي • الفصل الدراسي الأول • المعلمة ابتهال الحجيلي</p></section>';
};
var categoryOld=renderCategory;
renderCategory=function(mode){
if(mode==='games')return pageHeader('🎮 ألعابنا ومغامراتنا','اختر عالمك، ثم اختر الدرس الذي تريد لعبه.')+buddyPicker()+worlds('games',false);
return categoryOld(mode);
};
var skillMode=function(skill,chapter){
if(/^order/.test(skill)||skill==='ordinal'||skill==='beforeAfter'||skill==='positions'||skill==='abovebelow')return 'train';
if(/^pattern/.test(skill))return 'stars';
if(/^compare/.test(skill)||['equal','moreLess','classifyOne','classifyTwo'].includes(skill))return 'treasure';
if(/^add/.test(skill)||/^compose/.test(skill)||skill==='verticalAdd')return 'garden';
if(['num123','num45','num678','num910','num1112','num1315','num1617','num1820','read123','read45','read678','read910'].includes(skill))return 'balloons';
return chapters[chapter].mode;
};
var qOld=renderQuestion;
var sequenceState=null;
function sequenceView(q,s){
var choice=q.choices.find(function(c){return c.correct});
if(!choice||!choice.text||choice.text.indexOf('،')<0)return null;
var numbers=choice.text.split('،').map(function(x){return x.trim()});
if(numbers.length!==3)return null;
if(!sequenceState||sequenceState.key!==s.lesson.code+'-'+s.index)sequenceState={key:s.lesson.code+'-'+s.index,picked:[]};
var candidates=numbers.slice().reverse();if(s.index%2===0)candidates=[numbers[1],numbers[2],numbers[0]];
return '<div class="sequence-board" data-sequence-game="1"><div class="sequence-help">المس الأعداد بالترتيب من الأصغر إلى الأكبر 👆</div>'
+'<div class="sequence-slots">'+numbers.map(function(_,i){return '<span class="sequence-slot" data-order-slot="'+i+'">'+(sequenceState.picked[i]||'؟')+'</span>'}).join('')+'</div>'
+'<div class="sequence-tiles">'+candidates.map(function(n){return '<button type="button" class="sequence-tile" data-order-tile="'+n+'" '+(sequenceState.picked.includes(n)?'disabled':'')+'>'+n+'</button>'}).join('')+'</div>'
+'<button class="sequence-reset" type="button" data-order-reset="1">↻ أبدأ من جديد</button><div class="sequence-result" aria-live="polite"></div></div>';
}
function activeCountable(s,q){
var skill=s.lesson.skill;
if(!(/^(num|read|add|compose)/.test(skill)||['draw5','draw10','model','equal'].includes(skill)))return null;
if(!q.visual.includes('dot-shape'))return null;
var n=0,html=q.visual.replace(/<span class="dot-shape"([^>]*)>(.*?)<\/span>/g,function(_,attrs,inner){
n++;return '<button type="button" class="tap-dot" data-tap-dot="1" aria-pressed="false" aria-label="المس دائرة للعد" '+attrs+'>'+inner+'</button>';
});
return n?{html:html,total:n}:null;
}
renderQuestion=function(s,q){
var ch=s.lesson.chapter.id,w=chapters[ch],mode=skillMode(s.lesson.skill,ch);
var sequence=s.selected===null&&/^order/.test(s.lesson.skill)?sequenceView(q,s):null;
var count=s.selected===null&&!sequence?activeCountable(s,q):null;
var displayedQ=Object.assign({},q);
if(count)displayedQ.visual=count.html;
if(sequence)displayedQ.visual=sequence;
var html=qOld(s,displayedQ);
var steps=Array.from({length:s.questions.length},function(_,i){
return '<span class="'+(i<s.index?'done':i===s.index?'now':'')+'" aria-hidden="true">'+(i<s.index?'★':i===s.index?'✦':'•')+'</span>';
}).join('');
var scene='<div class="play-scene">'+character(buddy)+'<div><small>المرحلة '+arabic(s.index+1)+' من '+arabic(s.questions.length)+'</small>'
+'<h2>'+w.name+'</h2><div class="play-steps">'+steps+'</div></div></div>';
html=html.replace('<section class="practice-card">','<section class="practice-card playgame w'+ch+' mode-'+mode+'">'+scene);
if(sequence){html=html.replace(/<div class="options"[\s\S]*?<\/div>\s*(?=<div class="quiz-footer">|<div class="feedback)/,'');}
if(count)html=html.replace('<div class="options"','<div class="tap-counter" aria-live="polite">المعدود: <span data-tapped-count>٠</span></div><div class="options"');
return html;
};
var resultOld=renderResult;
renderResult=function(s){var h=resultOld(s);return h.replace('<section class="result-card">','<section class="result-card play-result"><div class="award-stars" aria-label="نجوم المكافأة">'+('⭐'.repeat(Math.max(1,Math.min(5,Math.ceil(s.score/2)))))+'</div>');};
var answerOld=answerQuestion;
answerQuestion=function(idx){
if(!session||session.selected!==null)return;
var q=session.questions[session.index],correct=q&&q.choices[idx]&&q.choices[idx].correct;
answerOld(idx);
var card=document.querySelector('.playgame');if(card&&correct&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
card.animate([{transform:'scale(1)'},{transform:'scale(1.018)'},{transform:'scale(1)'}],{duration:280});}
};
document.addEventListener('click',function(e){
var pick=e.target.closest('[data-buddy]');
if(pick){
buddy=pick.getAttribute('data-buddy')==='mishmish'?'mishmish':'lulu';
try{localStorage.setItem(BUDDY_KEY,buddy)}catch(err){}
var y=window.scrollY;render();window.scrollTo(0,y);return;
}
var dot=e.target.closest('[data-tap-dot]');
if(dot){
var active=dot.getAttribute('aria-pressed')!=='true';dot.setAttribute('aria-pressed',String(active));dot.classList.toggle('tapped',active);
var game=dot.closest('.playgame'),n=game?game.querySelectorAll('.tap-dot.tapped').length:0;
var counter=game&&game.querySelector('[data-tapped-count]');if(counter)counter.textContent=arabic(n);
return;
}
var tile=e.target.closest('[data-order-tile]');
if(tile&&session&&session.selected===null&&sequenceState){
var q=session.questions[session.index],correct=q.choices.find(function(c){return c.correct});
var target=correct&&correct.text?correct.text.split('،').map(function(x){return x.trim()}):[];
var picked=sequenceState.picked;
if(picked.includes(tile.dataset.orderTile))return;
picked.push(tile.dataset.orderTile);
var game=tile.closest('.sequence-board');
var slot=game&&game.querySelector('[data-order-slot="'+(picked.length-1)+'"]');
if(slot){slot.textContent=tile.dataset.orderTile;slot.classList.add('filled');}
tile.disabled=true;
if(picked.length===target.length){
var good=target.every(function(v,i){return picked[i]===v});
var answerIndex=q.choices.findIndex(function(c){return !!c.correct===good});
if(answerIndex>=0)answerQuestion(answerIndex);
}
return;
}
var reset=e.target.closest('[data-order-reset]');
if(reset&&session&&session.selected===null&&sequenceState){
sequenceState.picked=[];
var game=reset.closest('.sequence-board');
game.querySelectorAll('.sequence-slot').forEach(function(el){el.textContent='؟';el.classList.remove('filled')});
game.querySelectorAll('.sequence-tile').forEach(function(el){el.disabled=false});return;
}
});
})();
