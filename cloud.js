/* إنجاز — نسخة المزامنة الآمنة للصور والمستندات، 2026-11-03.
   المتطلبات: تنفيذ setup.sql في Supabase. لا تضعي مفتاح service_role في المتصفح. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const BUCKET = 'engaz-evidence';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','application/pdf']);
const projectUrl = $('projectUrl'), publicKey = $('publicKey');
const cloudStatus = $('cloudStatus'), uploadBtn = $('uploadCloud'), downloadBtn = $('downloadCloud');
let client = null, user = null, syncing = false;
let autoSync = localStorage.getItem('engaz-auto-sync-v3') === '1';
const setStatus = (message) => {cloudStatus.textContent = message; cloudStatus.setAttribute('role','status');};
const show = (id, visible) => $(id).classList.toggle('hidden', !visible);

function setUI() {
  show('cloudAuth', !!client);
  show('cloudActions', !!user);
  show('signIn', !user); show('signUp', !user);
  show('signOut', !!user);
  show('loginEmail', !user); show('loginPassword', !user);
  uploadBtn.disabled = !user || syncing;
  downloadBtn.disabled = !user || syncing;
  const badge = $('autoSyncText');
  if (badge) badge.textContent = autoSync ? 'المزامنة التلقائية: مفعّلة' : 'المزامنة التلقائية: غير مفعّلة';
  const button = $('toggleAutoSync');
  if (button) button.textContent = autoSync ? 'إيقاف المزامنة التلقائية' : 'تفعيل المزامنة التلقائية';
}
async function localDB() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('engaz-v2', 1);
    r.onsuccess = () => {if (!r.result.objectStoreNames.contains('entries')) {r.result.close();reject(new Error('لم يكتمل إنشاء مخزن الشواهد.'));} else resolve(r.result);};
    r.onerror = () => reject(r.error);
    r.onupgradeneeded = () => r.result.createObjectStore('entries', {keyPath:'id'});
  });
}
async function dbAction(mode, callback) {
  const db = await localDB();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('entries', mode);
      const request = callback(tx.objectStore('entries'));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error || request.error);
      tx.onabort = () => reject(tx.error || new Error('أُلغيت عملية التخزين.'));
    });
  } finally {db.close();}
}
const getLocal = () => dbAction('readonly', store => store.getAll());
const putLocal = entry => dbAction('readwrite', store => store.put(entry));
const isUUID = v => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
function validEntry(e) {
  return e && isUUID(e.id) && typeof e.title === 'string' &&
    Array.isArray(e.bands) && Array.isArray(e.files);
}
function mimeOf(file) {
  let mime = (file.type || file.blob?.type || '').toLowerCase();
  if (mime === 'image/jpg') mime = 'image/jpeg';
  if (!ALLOWED_MIME.has(mime)) {
    const ext = (file.name || '').toLowerCase().split('.').pop();
    mime = ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',heic:'image/heic',heif:'image/heif',pdf:'application/pdf'})[ext] || mime;
  }
  if (!ALLOWED_MIME.has(mime)) throw new Error('نوع الملف غير مدعوم: ' + (file.name || 'مرفق'));
  return mime;
}
function extension(mime) {
  return ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','image/heic':'heic','image/heif':'heif','application/pdf':'pdf'})[mime];
}
async function fileDigest(blob) {
  const bytes = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2,'0')).join('');
}
async function uploadEntry(e) {
  if (!validEntry(e)) throw new Error('بيانات شاهد غير صالحة، لم تُرفع: ' + (e?.title || 'بدون عنوان'));
  if (!user || !client) throw new Error('يجب تسجيل الدخول أولًا.');
  if (e.files.length > 30) throw new Error('عدد المرفقات كبير جدًا في شاهد ' + e.title);
  const remoteFiles = [];
  for (const f of e.files) {
    if (!(f.blob instanceof Blob)) throw new Error('تعذر قراءة المرفق ' + (f.name || 'بدون اسم'));
    if (!f.blob.size || f.blob.size > MAX_FILE_SIZE) throw new Error('الملف يجب أن يكون بين 1 بايت و5 ميجابايت: ' + f.name);
    const mime = mimeOf(f);
    const hash = await fileDigest(f.blob);
    const path = `${user.id}/${e.id}/${hash}.${extension(mime)}`;
    const {error} = await client.storage.from(BUCKET).upload(path, f.blob, {
      upsert: true, contentType: mime, cacheControl: '3600'
    });
    if (error) throw new Error('رفع ' + f.name + ': ' + error.message);
    remoteFiles.push({path, name:String(f.name || 'مرفق').slice(0,255), type:mime, size:f.blob.size});
  }
  const row = {
    id:e.id, user_id:user.id, title:e.title.slice(0,120),
    date:e.date || null, description:e.desc || '', impact:e.impact || '',
    bands:e.bands, files:remoteFiles,
    created_at:new Date(Number(e.created) || Date.now()).toISOString()
  };
  const {data,error} = await client.from('evidence_entries').upsert(row,{onConflict:'id'})
    .select('id,user_id,files').single();
  if (error) throw new Error('حفظ بيانات الشاهد: ' + error.message);
  if (data?.id !== e.id || data.user_id !== user.id || !Array.isArray(data.files) || data.files.length !== remoteFiles.length)
    throw new Error('تعذر تأكيد الحفظ السحابي للشاهد ' + e.title);
}
async function syncEntries({quiet=false}={}) {
  if (!client || !user) {setStatus('سجّلي الدخول أولًا ثم ارفعي الشواهد.');return false;}
  if (syncing) return false;
  syncing = true;setUI();
  try {
    const entries = (await getLocal()).sort((a,b)=>(a.created||0)-(b.created||0));
    if (!entries.length) {setStatus('لا توجد شواهد محلية لرفعها.');return false;}
    for (let i=0;i<entries.length;i++) {
      setStatus(`☁️ رفع الشواهد والصور: ${i+1} من ${entries.length} — ${entries[i].title || 'شاهد'}`);
      await uploadEntry(entries[i]);
    }
    // Read back every uploaded record, not merely rely on a green local success message.
    const ids = entries.map(e => e.id);
    const {data,error} = await client.from('evidence_entries').select('id,files').in('id',ids);
    if (error) throw error;
    if (!data || data.length !== ids.length || entries.some(e => !data.some(r => r.id === e.id && r.files?.length === e.files.length)))
      throw new Error('لم يكتمل التحقق من الشواهد المحفوظة.');
    setStatus(`✅ تم حفظ ${entries.length} شاهد سحابيًا مع مرفقاتها والتحقق من البيانات. ${autoSync?'المزامنة التلقائية مفعّلة.':''}`);
    return true;
  } catch (err) {
    setStatus('❌ تعذر إكمال الرفع السحابي: ' + (err?.message || 'خطأ غير معروف') + '. الشواهد الأصلية محفوظة محليًا.');
    return false;
  } finally {syncing=false;setUI();}
}
async function restoreEntries() {
  if (!client || !user || syncing) return;
  if (!confirm('استرجاع الشواهد من حسابك إلى هذا الجهاز؟ سيتم تحديث الشواهد ذات المعرف نفسه محليًا، دون حذف الشواهد الأخرى.')) return;
  syncing=true;setUI();
  try {
    const {data,error} = await client.from('evidence_entries').select('*').order('created_at',{ascending:false});
    if (error) throw error;
    const restored=[];
    for (let i=0;i<(data||[]).length;i++) {
      const e=data[i], files=[];
      setStatus(`⬇️ استرجاع الشواهد: ${i+1} من ${data.length}`);
      if (e.user_id !== user.id) throw new Error('توقفت الاستعادة بسبب اختلاف مالك الشاهد.');
      for (const f of (e.files||[])) {
        if (!f.path?.startsWith(user.id+'/') || !f.path.includes('/'+e.id+'/')) throw new Error('مسار المرفق غير آمن.');
        const {data:blob,error:err} = await client.storage.from(BUCKET).download(f.path);
        if (err) throw new Error('استرجاع ' + f.name + ': ' + err.message);
        files.push({name:String(f.name || 'مرفق'),type:mimeOf({type:f.type,name:f.name}),blob});
      }
      restored.push({id:e.id,title:e.title,date:e.date||'',desc:e.description||'',impact:e.impact||'',bands:e.bands||[],files,created:Date.parse(e.created_at)||Date.now()});
    }
    // Download all the attachments before touching the local copies.
    for (const e of restored) await putLocal(e);
    setStatus(`✅ تم استرجاع ${restored.length} شاهد ومرفقاتها. أعيدي تحميل الصفحة لعرضها.`);
    if (typeof window.render === 'function') await window.render();
  } catch (err) {setStatus('❌ تعذر الاسترجاع: ' + (err?.message || 'خطأ غير معروف') + '. لن تُحذف الشواهد الموجودة.');}
  finally {syncing=false;setUI();}
}
function saveConfiguration() {
  localStorage.setItem('engaz-cloud-config',JSON.stringify({url:projectUrl.value.trim(), key:publicKey.value.trim()}));
}
async function setUser(nextUser) {
  user=nextUser || null;setUI();
  setStatus(user ? `🔐 متصلة بحساب: ${user.email}. الصور تُرفع إلى مساحة خاصة عند الضغط على الرفع السحابي.`
    : 'تم ربط المشروع. سجّلي الدخول لحفظ الشواهد والصور سحابيًا.');
}
async function connect() {
  const url=projectUrl.value.trim(),key=publicKey.value.trim();
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url) || !key) {setStatus('تحققي من رابط المشروع والمفتاح العام Publishable / anon.');return;}
  setStatus('جارٍ الاتصال الآمن بـ Supabase...');
  try {
    const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    saveConfiguration();
    const {data:{session},error}=await client.auth.getSession();
    if(error) throw error;
    await setUser(session?.user || null);
    client.auth.onAuthStateChange((_event,session) => {void setUser(session?.user || null);});
  } catch (err) {client=null;user=null;setUI();setStatus('تعذر الاتصال: '+(err?.message||'خطأ غير معروف'));}
}
async function sign(mode) {
  if (!client) {setStatus('اربطي المشروع أولًا.');return;}
  const email=$('loginEmail').value.trim(), password=$('loginPassword').value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {setStatus('اكتبي بريدًا صحيحًا.');return;}
  if (!password || (mode==='signup' && password.length<8)) {setStatus('اكتبي كلمة مرور صحيحة (8 أحرف على الأقل للتسجيل).');return;}
  const button=$(mode==='signup'?'signUp':'signIn');button.disabled=true;
  try {
    const {data,error}=mode==='signup' ? await client.auth.signUp({email,password}) : await client.auth.signInWithPassword({email,password});
    if (error) throw error;
    setStatus(mode==='signup'&&!data?.session ? 'تفقدي البريد لتأكيد حسابك ثم سجّلي الدخول.' : '✅ تم تسجيل الدخول بنجاح.');
  } catch (e) {setStatus('تعذر تسجيل الدخول: '+(e?.message||'خطأ غير معروف'));}
  finally {button.disabled=false;}
}
function makeAutoSyncUI() {
  uploadBtn.textContent='☁️ حفظ جميع الشواهد والصور سحابيًا';
  const note=$('cloudActions').querySelector('.muted');
  if (note) note.textContent='تخزين خاص بحسابك. لا ترفعي صور الطالبات أو بياناتهن الشخصية إلا وفق موافقات وسياسات المدرسة.';
  const line=document.createElement('div');line.className='actions';
  const button=document.createElement('button');button.id='toggleAutoSync';button.type='button';button.className='alt';
  const label=document.createElement('small');label.id='autoSyncText';label.className='muted';
  line.append(button,label);$('cloudActions').append(line);
  button.onclick=()=>{
    if (!user) {setStatus('سجّلي الدخول أولًا.');return;}
    if (!autoSync && !confirm('تفعيل المزامنة التلقائية؟ بعد كل حفظ جديد، سيُرسل التطبيق الشواهد والصور إلى حسابك الخاص على Supabase عند توفر الإنترنت.')) return;
    autoSync=!autoSync;localStorage.setItem('engaz-auto-sync-v3',autoSync?'1':'0');setUI();
    setStatus(autoSync?'✅ فُعّلت المزامنة التلقائية بعد الحفظ.':'تم إيقاف المزامنة التلقائية.');
  };
  setUI();
}
function enableAutoAfterLocalSave() {
  const form=$('form');
  const oldSubmit=form.onsubmit;
  if (typeof oldSubmit !== 'function') return;
  form.onsubmit=async (event)=>{
    // Prevent navigation before the existing asynchronous local save runs.
    event.preventDefault();
    await oldSubmit.call(form,event);
    if (autoSync && user && !syncing) await syncEntries({quiet:true});
  };
}
function updateTrialLabels() {
  const note=document.querySelector('.note.no-print');
  if(note) note.textContent='الشواهد تحفظ على الجهاز أولًا. لحفظ نسخة آمنة على السحابة، سجّلي الدخول واضغطي «حفظ جميع الشواهد والصور سحابيًا» أو فعّلي المزامنة التلقائية. لا تضعي بيانات طالبات حساسة دون موافقة.';
  const footer=document.querySelector('.footer');
  if(footer) footer.textContent='إنجاز · حفظ محلي مع خيار المزامنة إلى حساب Supabase خاص. احفظي نسخة احتياطية دورية.';
}
function addChangePassword() {
  const panel=document.createElement('div');panel.className='actions';
  const input=document.createElement('input');input.type='password';input.minLength=12;
  input.placeholder='كلمة مرور جديدة (12 خانة فيها حرف كبير وصغير ورقم ورمز)';
  input.autocomplete='new-password';
  const button=document.createElement('button');button.type='button';button.className='alt';
  button.textContent='تحديث كلمة المرور';
  panel.append(input,button);$('cloudActions').append(panel);
  button.onclick=async()=>{
    if(!client||!user) {setStatus('سجّلي الدخول أولًا.');return;}
    const password=input.value;
    if(password.length<12||!/[a-z]/.test(password)||!/[A-Z]/.test(password)||!/[0-9]/.test(password)||!/[!@#$%^&*()_+\-=[\]{};:\'"|,.<>/?`~]/.test(password)) {
      setStatus('كلمة المرور يجب أن تضم 12 خانة، وأحرفًا كبيرة وصغيرة ورقمًا ورمزًا.');return;
    }
    button.disabled=true;
    try {
      const {error}=await client.auth.updateUser({password});
      if(error) throw error;
      input.value='';setStatus('✅ تم تغيير كلمة المرور.');
    }catch(e){setStatus('تعذر تغيير كلمة المرور: '+(e?.message||'خطأ غير معروف'));}
    finally {button.disabled=false;}
  };
}
function addPasswordReset() {
  const btn=document.createElement('button');btn.className='alt';btn.type='button';btn.textContent='نسيت كلمة المرور؟';
  $('signUp').after(btn);
  btn.onclick=async()=>{
    if (!client) {setStatus('اربطي المشروع أولًا.');return;}
    const email=$('loginEmail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {setStatus('اكتبي البريد أولًا لاستعادة كلمة المرور.');return;}
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
    setStatus(error?'تعذر إرسال الرابط: '+error.message:'إذا كان البريد مسجلاً فستصل إليه رسالة الاستعادة.');
  };
}

$('connectCloud').onclick=connect;
$('signIn').onclick=()=>sign('signin');
$('signUp').onclick=()=>sign('signup');
$('signOut').onclick=async()=>{
  if(client) {const {error}=await client.auth.signOut();if(error){setStatus('تعذر تسجيل الخروج: '+error.message);return;}}
  await setUser(null);
};
uploadBtn.onclick=async()=>{
  if (!client || !user) {setStatus('سجّلي الدخول أولًا.');return;}
  const entries=await getLocal();
  const fileCount=entries.reduce((n,e)=>n+(e.files?.length||0),0);
  if (!confirm(`رفع ${entries.length} شاهد و${fileCount} مرفقًا إلى حسابك الخاص على Supabase؟\nلا ترفعي صور طالبات أو بيانات حساسة دون موافقة.`)) return;
  await syncEntries();
};
downloadBtn.onclick=restoreEntries;
makeAutoSyncUI();updateTrialLabels();enableAutoAfterLocalSave();addPasswordReset();addChangePassword();
try {
  const c=JSON.parse(localStorage.getItem('engaz-cloud-config')||'null');
  projectUrl.value=c?.url||'https://udgzmrooidxsopvgqinx.supabase.co';
  publicKey.value=c?.key||'';
  if (publicKey.value) void connect();
} catch {setStatus('أعيدي ربط المشروع بالمفتاح العام.');}
})();
