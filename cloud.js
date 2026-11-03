
const $=id=>document.getElementById(id);
const hide=(id,v)=>$(id).classList.toggle('hidden',v);
let client=null,user=null;
const status=t=>$('cloudStatus').textContent=t;
const saveCfg=()=>localStorage.setItem('engaz-cloud-config',JSON.stringify({url:$('projectUrl').value.trim(),key:$('publicKey').value.trim()}));
async function init(){
 const url=$('projectUrl').value.trim(),key=$('publicKey').value.trim();
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)||!key){client=null;status('تحققي من رابط المشروع والمفتاح العام.');return}
 status('جارٍ تجهيز الاتصال السحابي...');
 try{
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  saveCfg();hide('cloudAuth',false);
  const {data:{session}}=await client.auth.getSession();await setUser(session?.user||null);
  client.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));
 }catch(e){status('تعذر الاتصال. تأكدي من الإنترنت والإعدادات: '+e.message)}
}
async function setUser(u){
 user=u;hide('cloudActions',!u);hide('signOut',!u);
 hide('signIn',!!u);hide('signUp',!!u);hide('loginEmail',!!u);hide('loginPassword',!!u);
 status(u?'متصلة بحساب: '+u.email:'المشروع مربوط. سجلي الدخول للبدء.');
 if(u)await refreshSafeWitnesses();
}
$('connectCloud').onclick=init;
// Show validation and network errors rather than silently ignoring taps.
async function authAction(mode){
 const email=$('loginEmail').value.trim(), password=$('loginPassword').value;
 if(!client){status('الاتصال غير جاهز. اضغطي ربط المشروع وانتظري رسالة نجاح الاتصال.');return;}
 if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){status('اكتبي بريدًا إلكترونيًا صحيحًا.');return;}
 if(!password || (mode==='signup' && password.length<8)){status('اكتبي كلمة مرور من 8 أحرف على الأقل.');return;}
 const btn=$(mode==='signup'?'signUp':'signIn');
 btn.disabled=true;status('جارٍ التواصل مع Supabase، انتظري قليلًا...');
 try{
  const {data,error}=mode==='signup' ? await client.auth.signUp({email,password}) : await client.auth.signInWithPassword({email,password});
  if(error){const msg=/email not confirmed/i.test(error.message)?'الحساب يحتاج تأكيد البريد الإلكتروني. افتحي رسالة التأكيد أولًا.':/invalid login credentials/i.test(error.message)?'بيانات الدخول غير صحيحة. تأكدي من البريد وكلمة المرور، أو استخدمي رابط استعادة كلمة المرور من Supabase.':error.message;status('تعذر إكمال العملية: '+msg);return;}
  if(mode==='signup')status(data?.session?'تم إنشاء الحساب وتسجيل الدخول.':'تم إرسال طلب التسجيل. افتحي بريدك لتأكيد الحساب إذا وصلتك رسالة.');
  else status('تم تسجيل الدخول بنجاح.');
 }catch(e){status('تعذر الاتصال بالخدمة: '+(e?.message||'خطأ غير معروف'));}
 finally{btn.disabled=false;}
}
$('signIn').onclick=()=>authAction('signin');
$('signUp').onclick=()=>authAction('signup');
$('signOut').onclick=async()=>{await client?.auth.signOut();status('تم تسجيل الخروج')};
function idb(){return new Promise((resolve,reject)=>{const r=indexedDB.open('engaz-v2',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function localEntries(){const db=await idb();return new Promise((resolve,reject)=>{const r=db.transaction('entries').objectStore('entries').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function localPut(e){const db=await idb();return new Promise((resolve,reject)=>{const r=db.transaction('entries','readwrite').objectStore('entries').put(e);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
function validId(s){return /^[a-z0-9-]{1,80}$/i.test(s)}
// Safe-by-default single-record cloud test. Never upload photos/attachments here.
const cloudUploadButton=$('uploadCloud');
cloudUploadButton.textContent='☁️ رفع الشاهد المختار فقط';
const witnessPanel=document.createElement('div');
witnessPanel.id='safeWitnessPanel';
witnessPanel.style.margin='14px 0 8px';
const witnessLabel=document.createElement('label');
witnessLabel.htmlFor='safeWitnessSelect';
witnessLabel.textContent='اختاري شاهدًا نصيًا واحدًا (بدون صور أو ملفات)';
const witnessSelect=document.createElement('select');
witnessSelect.id='safeWitnessSelect';
witnessSelect.setAttribute('aria-label','الشاهد النصي المطلوب رفعه إلى السحابة');
const witnessNote=document.createElement('p');
witnessNote.className='muted';
witnessNote.textContent='الصور ومقاطع الفيديو مستبعدة تلقائيًا من هذه القائمة ولن تُرفع. اختاري «اختبار الحفظ السحابي» للتجربة.';
witnessPanel.append(witnessLabel,witnessSelect,witnessNote);
cloudUploadButton.parentElement.before(witnessPanel);
let eligibleWitnesses=[];
async function refreshSafeWitnesses(){
 const selected=witnessSelect.value;
 try{
  eligibleWitnesses=(await localEntries()).filter(e=>e&&validId(e.id)&&Array.isArray(e.files)&&e.files.length===0);
  eligibleWitnesses.sort((a,b)=>(b.created||0)-(a.created||0));
  witnessSelect.replaceChildren();
  const placeholder=document.createElement('option');
  placeholder.value='';
  placeholder.textContent=eligibleWitnesses.length?'— اختاري شاهدًا واحدًا —':'لا توجد شواهد نصية بدون مرفقات';
  witnessSelect.append(placeholder);
  for(const e of eligibleWitnesses){
   const opt=document.createElement('option');
   opt.value=e.id; opt.textContent=e.title||'شاهد بلا عنوان';
   witnessSelect.append(opt);
  }
  witnessSelect.value=eligibleWitnesses.some(e=>e.id===selected)?selected:
    eligibleWitnesses.length===1?eligibleWitnesses[0].id:'';
  cloudUploadButton.disabled=eligibleWitnesses.length===0;
 }catch(e){
  cloudUploadButton.disabled=true;
  status('تعذرت قراءة الشواهد المحلية: '+(e?.message||'خطأ غير معروف'));
 }
}
witnessSelect.addEventListener('focus',()=>refreshSafeWitnesses());
cloudUploadButton.onclick=async()=>{
 if(!client||!user){status('سجلي الدخول أولًا.');return;}
 const wantedId=witnessSelect.value;
 await refreshSafeWitnesses();
 const e=eligibleWitnesses.find(x=>x.id===wantedId);
 if(!e){status('اختاري شاهدًا نصيًا من القائمة أولًا.');return;}
 if(!Array.isArray(e.files)||e.files.length!==0){status('لم يتم الرفع: هذا الشاهد يحتوي على مرفقات.');return;}
 if(!confirm('رفع شاهد واحد فقط إلى السحابة: «'+(e.title||'بدون عنوان')+'»؟ لن تُرفع أي صور أو ملفات.'))return;
 cloudUploadButton.disabled=true;
 try{
  const row={
   id:e.id,user_id:user.id,title:e.title||'شاهد تجريبي',date:e.date||null,
   description:e.desc||'',impact:e.impact||'',bands:Array.isArray(e.bands)?e.bands:[],
   files:[],created_at:new Date(e.created||Date.now()).toISOString()
  };
  const {data,error}=await client.from('evidence_entries').upsert(row,{onConflict:'id'}).select('id,user_id,title,files').single();
  if(error)throw error;
  if(data?.id!==e.id||data.user_id!==user.id||data.title!==row.title||!Array.isArray(data.files)||data.files.length!==0)
   throw Error('لم نستطع تأكيد حفظ الشاهد.');
  status('✅ تم رفع الشاهد النصي «'+row.title+'» والتحقق من حفظه سحابيًا. لم تُرفع أي صور.');
 }catch(err){status('تعذر الرفع السحابي: '+(err?.message||'خطأ غير معروف'))}
 finally{cloudUploadButton.disabled=false;}
};

// Let the signed-in owner set a password after signing in via the recovery link.
const passwordPanel=document.createElement('div');
passwordPanel.style.marginTop='16px';
const passwordLabel=document.createElement('label');
passwordLabel.htmlFor='newEngazPassword';
passwordLabel.textContent='تعيين كلمة مرور جديدة للدخول لاحقًا (اختياري)';
const passwordInput=document.createElement('input');
passwordInput.id='newEngazPassword';passwordInput.type='password';
passwordInput.autocomplete='new-password';passwordInput.minLength=12;
passwordInput.placeholder='12 خانة: حرف كبير وصغير ورقم ورمز';
const passwordButton=document.createElement('button');
passwordButton.type='button';passwordButton.className='alt';
passwordButton.textContent='حفظ كلمة المرور الجديدة';
passwordButton.style.marginTop='8px';
passwordPanel.append(passwordLabel,passwordInput,passwordButton);
$('cloudActions').append(passwordPanel);
passwordButton.onclick=async()=>{
 if(!client||!user){status('سجلي الدخول أولًا.');return;}
 const pw=passwordInput.value;
 if(pw.length<12||!/[a-z]/.test(pw)||!/[A-Z]/.test(pw)||!/[0-9]/.test(pw)||!/[!@#$%^&*()_+\-=[\]{};:'"\|,.<>/?`~]/.test(pw)){
  status('اختاري كلمة مرور من 12 خانة على الأقل، فيها حرف إنجليزي كبير وصغير ورقم ورمز.');return;
 }
 passwordButton.disabled=true;
 try{
  const {error}=await client.auth.updateUser({password:pw});
  if(error)throw error;
  passwordInput.value='';
  status('✅ تم تحديث كلمة مرور إنجاز. احتفظي بها في مدير كلمات المرور بجوالك.');
 }catch(e){status('تعذر تحديث كلمة المرور: '+(e?.message||'خطأ غير معروف'))}
 finally{passwordButton.disabled=false;}
};
$('downloadCloud').onclick=async()=>{
 if(!user)return;
 if(!confirm('استرجاع الشواهد السحابية إلى الجهاز؟ الشواهد ذات المعرف نفسه ستُستبدل محليًا.'))return;
 $('downloadCloud').disabled=true;
 try{
  const {data,error}=await client.from('evidence_entries').select('*').order('created_at',{ascending:false});
  if(error)throw error;
  for(const e of data){
   const files=[];
   for(const f of e.files||[]){
    const {data:blob,error:err}=await client.storage.from('evidence').download(f.path);
    if(err)throw err;files.push({name:f.name,type:f.type,blob});
   }
   await localPut({id:e.id,title:e.title,date:e.date||'',desc:e.description||'',impact:e.impact||'',bands:e.bands||[],files,created:Date.parse(e.created_at)||Date.now()});
  }
  status(`تم استرجاع ${data.length} شاهد. أعيدي تحميل الصفحة لعرضها.`);
 }catch(e){status('تعذر الاسترجاع: '+e.message)}finally{$('downloadCloud').disabled=false}
};
try{const c=JSON.parse(localStorage.getItem('engaz-cloud-config')||'null');if(c){$('projectUrl').value=c.url||'';$('publicKey').value=c.key||'';init()}}catch{}
