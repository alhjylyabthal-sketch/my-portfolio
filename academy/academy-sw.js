/* Offline public academy shell; independent from Enjaz portfolio service worker. */
const ACADEMY_CACHE='little-math-academy-shell-v8';
const ACADEMY_ASSETS=['./','./index.html','./happy-games.css','./content-variety.js','./live-notice.json','./happy-games.js','./announcements.js','./academy-approved-visual.css','./academy-characters.webp','./academy-hero-art.webp','./academy-manifest.webmanifest','./academy-icon.svg'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(ACADEMY_CACHE).then(cache=>cache.addAll(ACADEMY_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('little-math-academy-shell-') && key!==ACADEMY_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin || !url.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok && response.type==='basic'){
   const copy=response.clone();
   const key=url.pathname.endsWith('/live-notice.json')?'./live-notice.json':event.request;
   caches.open(ACADEMY_CACHE).then(cache=>cache.put(key,copy)).catch(()=>{});
  }
  return response;
 }).catch(()=>{
   const key=url.pathname.endsWith('/live-notice.json')?'./live-notice.json':event.request;
   return caches.match(key).then(response=>response||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()));
 }));
});
