// Route the public project home to the math academy. Portfolio kept separately.
const ROOT = new URL('./', self.registration.scope);
const ACADEMY = new URL('academy/', ROOT);
function isHome(url) {
  return url.origin === ROOT.origin && (url.pathname === ROOT.pathname || url.pathname === ROOT.pathname + 'index.html');
}
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('engaz-shell-')).map(name => caches.delete(name)));
    await self.clients.claim();
    // Move already opened/installable legacy home clients away from the private portfolio.
    const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
    await Promise.all(clients.filter(c=>{try{return isHome(new URL(c.url))}catch{return false}}).map(c=>c.navigate(ACADEMY.href).catch(()=>{})));
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method === 'GET' && event.request.mode === 'navigate' && isHome(new URL(event.request.url))) {
    event.respondWith(Response.redirect(ACADEMY.href, 302));
  }
});