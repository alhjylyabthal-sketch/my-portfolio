
const $=id=>document.getElementById(id);
const hide=(id,v)=>$(id).classList.toggle('hidden',v);
let client=null,user=null;
const status=t=>$('cloudStatus').textContent=t;
const saveCfg=()=>localStorage.setItem('engaz-cloud-config',JSON.stringify({url:$('projectUrl').value.trim(),key:$('publicKey').value.trim()}));
async function init(){
 const url=$('projectUrl').value.trim(),key=$('publicKey').value.trim();
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)||!key){status('تحققي من رابط المشروع والمفتاح العام.');return}
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
}
$('connectCloud').onclick=init;
$('signIn').onclick=async()=>{if(!client)return;const {error}=await client.auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});status(error?'تعذر الدخول: '+error.message:'تم تسجيل الدخول')};
$('signUp').onclick=async()=>{if(!client)return;const {error}=await client.auth.signUp({email:$('loginEmail').value.trim(),password:$('loginPassword').value});status(error?'تعذر إنشاء الحساب: '+error.message:'تحققي من بريدك لتأكيد الحساب ثم سجلي الدخول.');};
$('signOut').onclick=async()=>{await client?.auth.signOut();status('تم تسجيل الخروج')};
function idb(){return new Promise((resolve,reject)=>{const r=indexedDB.open('engaz-v2',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function localEntries(){const db=await idb();return new Promise((resolve,reject)=>{const r=db.transaction('entries').objectStore('entries').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function localPut(e){const db=await idb();return new Promise((resolve,reject)=>{const r=db.transaction('entries','readwrite').objectStore('entries').put(e);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})}
function validId(s){return /^[a-z0-9-]{1,80}$/i.test(s)}
$('uploadCloud').onclick=async()=>{
 if(!user)return;const entries=await localEntries();
 if(!confirm(`رفع ${entries.length} شاهد إلى حسابك؟ ستستبدل الشواهد ذات المعرف نفسه على السحابة.`))return;
 $('uploadCloud').disabled=true;
 try{
  for(const e of entries){
   if(!validId(e.id))throw Error('معرف شاهد غير صالح');
   const fileInfo=[];
   for(let i=0;i<(e.files||[]).length;i++){
    const f=e.files[i],path=`${user.id}/${e.id}/${i}-${crypto.randomUUID()}`;
    const {error}=await client.storage.from('evidence').upload(path,f.blob,{contentType:f.type||'application/octet-stream'});
    if(error)throw error;fileInfo.push({name:f.name,type:f.type,path});
   }
   const {error}=await client.from('evidence_entries').upsert({id:e.id,user_id:user.id,title:e.title,date:e.date||null,description:e.desc||'',impact:e.impact||'',bands:e.bands,files:fileInfo,created_at:new Date(e.created||Date.now()).toISOString()});
   if(error)throw error;
  }
  status(`تم رفع ${entries.length} شاهد بنجاح.`);
 }catch(e){status('تعذر إكمال الرفع: '+e.message)}finally{$('uploadCloud').disabled=false}
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
