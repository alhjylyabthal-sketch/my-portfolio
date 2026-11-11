// Service worker dedicated to the professional portfolio only.
// No private records or authenticated/cloud responses are cached.
const CACHE_NAME='enjaz-portfolio-v1';
const SHELL=['./','./index.html','./cloud.js','./luxury-ui.css','./luxury-ui.js','./luxury-ornaments.svg','./approved-ornaments.webp','./approved-school-logo.webp','./final-cover.css','./final-cover.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(n=>n.startsWith('enjaz-portfolio-')&&n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin||!SHELL.some(p=>new URL(p,self.registration.scope).pathname===url.pathname))return;
  e.respondWith(fetch(e.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(c=>c.put(e.request,r.clone()));return r}).catch(()=>caches.match(e.request)));
});
