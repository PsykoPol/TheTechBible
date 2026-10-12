/* Zone DMX: funzionamento offline. Cambia la versione per forzare l'aggiornamento. */
var C="zone-dmx-v1",A=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(C).then(function(c){return c.addAll(A);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch",function(e){
 var r=e.request;
 if(r.method!=="GET")return;
 var u=new URL(r.url);
 if(u.origin!==location.origin)return;
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(hit){
  var net=fetch(r).then(function(res){
   if(res&&res.ok){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp);});}
   return res;
  }).catch(function(){return hit||(r.mode==="navigate"?caches.match("index.html"):undefined);});
  return hit||net;
 }));
});
