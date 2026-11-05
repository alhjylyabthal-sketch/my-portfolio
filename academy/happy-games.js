
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
 var boy=who==='mishmish',hair=boy?'#263e59':'#3a3157',outfit=boy?'#f6a65f':'#63c9c9',name=boy?'بدر':'لولو';
 return `<svg class="buddy-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" role="img" aria-label="${name} ${boy?'رفيق':'رفيقة'} المغامرة">
 <ellipse cx="80" cy="173" rx="43" ry="5" fill="#57768e" opacity=".17"/>
 <path d="M61 132L57 164Q65 171 75 164L78 143M95 143L99 164Q111 171 119 163L111 132" fill="#496c91" stroke="#345775" stroke-width="3.5" stroke-linejoin="round"/>
 <path d="M55 164Q64 170 76 164M98 164Q108 170 119 163" fill="none" stroke="#263e59" stroke-width="8" stroke-linecap="round"/>
 <path d="M51 120Q34 111 28 100M112 120Q128 111 133 100" fill="none" stroke="#eab68e" stroke-width="12" stroke-linecap="round"/>
 <circle cx="28" cy="99" r="7" fill="#eab68e"/><circle cx="133" cy="99" r="7" fill="#eab68e"/>
 ${boy?'<path d="M45 118Q80 106 115 118L122 154Q80 169 39 154Z" fill="'+outfit+'" stroke="#df874c" stroke-width="3.5"/>':'<path d="M52 116Q80 106 108 116L123 156Q80 174 37 156Z" fill="'+outfit+'" stroke="#349eae" stroke-width="3.5"/><path d="M53 125L107 125" stroke="#e8fbff" stroke-width="5" stroke-linecap="round"/>'}
 <path d="M51 120L39 132M109 120L121 131" stroke="${outfit}" stroke-width="12" stroke-linecap="round"/>
 <circle cx="81" cy="137" r="14" fill="#fff8cd" stroke="#fff" stroke-width="2"/>
 <path d="M81 126L84 133 92 134 86 140 88 149 81 145 74 149 76 140 70 134 78 133Z" fill="#e9ae4d"/>
 ${boy?'<path d="M39 61Q25 44 36 31Q40 17 56 18Q71 6 85 17Q102 7 116 19Q134 28 123 54L115 64Q108 45 94 48Q72 35 53 61Z" fill="'+hair+'"/><path d="M44 29Q80 5 119 28" fill="none" stroke="#e8b16e" stroke-width="7" stroke-linecap="round"/>':'<path d="M31 81Q18 53 29 31Q45 7 79 12Q123 10 132 43Q139 68 126 92L115 88L116 56Q87 41 62 54L44 71L47 93Z" fill="'+hair+'"/><ellipse cx="31" cy="88" rx="13" ry="24" fill="'+hair+'"/><ellipse cx="129" cy="88" rx="13" ry="24" fill="'+hair+'"/>'}
 <ellipse cx="80" cy="78" rx="44" ry="47" fill="#efbd94" stroke="#d79d77" stroke-width="2.5"/>
 ${boy?'<path d="M37 66Q30 44 43 36Q61 24 80 39Q100 30 119 44L123 65Q104 60 95 50Q75 66 58 58Z" fill="'+hair+'"/>':'<path d="M36 71Q27 39 49 25Q75 10 108 26Q131 37 124 72Q108 54 101 47Q70 62 51 56Z" fill="'+hair+'"/><path d="M109 38Q119 27 128 37" fill="none" stroke="#ffe38e" stroke-width="7" stroke-linecap="round"/><circle cx="125" cy="35" r="8" fill="#ffd36c"/><circle cx="125" cy="35" r="3" fill="#fff9df"/>'}
 <ellipse cx="63" cy="80" rx="6" ry="8" fill="#293b4b"/><ellipse cx="99" cy="80" rx="6" ry="8" fill="#293b4b"/>
 <circle cx="65" cy="77" r="2.2" fill="#fff"/><circle cx="101" cy="77" r="2.2" fill="#fff"/>
 <path d="M55 68Q63 64 70 68M92 68Q100 64 107 68" fill="none" stroke="${hair}" stroke-width="2.8" stroke-linecap="round"/>
 <ellipse cx="50" cy="95" rx="9" ry="5" fill="#ee8793" opacity=".43"/><ellipse cx="112" cy="95" rx="9" ry="5" fill="#ee8793" opacity=".43"/>
 <path d="M73 103Q81 112 90 103" fill="none" stroke="#a65857" stroke-width="3.8" stroke-linecap="round"/>
 <path d="M80 91L78 96 82 96" fill="none" stroke="#d89575" stroke-width="2" stroke-linecap="round"/>
 </svg>`;
}
function buddyPicker(){return '<section class="buddy-pick" aria-label="اختيار شخصية المغامرة"><div class="buddy-pick-copy"><strong>من يرافقك في المغامرة؟ ✨</strong><p>اختاري شخصيتك، وسترافقك في الألعاب والتحديات.</p></div><div class="buddy-pick-btns">'
+['lulu','mishmish'].map(function(x){return '<button type="button" data-buddy="'+x+'" aria-pressed="'+(x===buddy)+'">'+character(x)+'<span>'+(x==='lulu'?'لولو':'بدر')+'</span><small>'+(x===buddy?'شخصيتي':'اختاري')+'</small></button>'}).join('')+'</div></section>';}
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
var pageHeaderOld=pageHeader;
pageHeader=function(title,description,back){return pageHeaderOld(title,description,back).replace(/<div class="mascot-strip"[\s\S]*?<\/div>/,'<div class="buddy-header-strip">'+character(buddy)+'<span>🌟 '+(buddy==='lulu'?'لولو':'بدر')+' معك في رحلة الرياضيات</span></div>');};
var homeOld=renderHome;
renderHome=function(){
var total=CHAPTERS.reduce(function(n,c){return n+c.lessons.length},0),done=completedCount(),pct=Math.round(done/total*100);
return '<section class="playhome"><section class="playhero"><div class="playhero-copy">'
+'<span class="hey">🌟 أهلاً بكِ يا نجمة الرياضيات!</span><h1>أكاديمية الرياضيات الصغيرة</h1>'
+'<p>عالم من الألعاب والنجوم والمغامرات الممتعة</p><button class="playbigbutton" data-lesson="4-6">🎈 العب تحدي المقارنة</button></div>'
+'<div class="playhero-figures">'+character(buddy)+'</div></section>'
 +buddyPicker()+miniNav()+'<div class="quick-links" hidden aria-hidden="true" style="display:none!important"></div>'
+'<h2 class="play-section-head">🎮 اختر مغامرتك</h2>'+worlds('games',true)
+ '<section class="play-progress"><strong>🌟 نجومي: '+arabic(done)+' / '+arabic(total)+'</strong><div class="track" role="progressbar" aria-label="تقدمي" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+pct+'%"></span></div>'
+'<button data-nav="evidence">شاهد إنجازاتي</button></section>'
+'<p class="info-note" style="text-align:center">طالبات الصف الأول الابتدائي • الفصل الدراسي الأول • المعلمة ابتهال الحجيلي</p></section>';
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
renderResult=function(s){var h=resultOld(s);return h.replace('<section class="result-card">','<section class="result-card play-result"><div class="buddy-celebrate">'+character(buddy)+'<strong>رائع! أنجزتِ المغامرة 🌟</strong></div><div class="award-stars" aria-label="نجوم المكافأة">'+('⭐'.repeat(Math.max(1,Math.min(5,Math.ceil(s.score/2)))))+'</div>');};
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
