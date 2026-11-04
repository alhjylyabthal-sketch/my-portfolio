// Enjaz: local shell only; never cache private Supabase/auth responses.
const CACHE_NAME='engaz-shell-v5';
const SHELL=['./','./index.html','./cloud.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('engaz-shell-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(!SHELL.some(path=>new URL(path,self.registration.scope).pathname===url.pathname))return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const cloned=response.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,cloned));}
    return response;
  }).catch(()=>caches.match(event.request)));
});
