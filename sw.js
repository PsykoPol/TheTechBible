/* Zone DMX: funzionamento offline.
   Quando carichi una nuova versione dell'app cambia il numero qui sotto (v3 -> v4 ...). */
var C="zone-dmx-v3",A=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"];
var FONT=/^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
self.addEventListener("install",function(e){
 e.waitUntil(caches.open(C).then(function(c){return c.addAll(A);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
 e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function good(res){return res&&res.ok&&res.type==="basic"&&!res.redirected;}
self.addEventListener("fetch",function(e){
 var r=e.request;
 if(r.method!=="GET")return;
 /* caratteri (font): presi una volta e poi tenuti per l'uso offline */
 if(FONT.test(r.url)){
  e.respondWith(caches.match(r).then(function(hit){return hit||fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp);});return res;}).catch(function(){return hit;});}));
  return;
 }
 var u=new URL(r.url);
 if(u.origin!==location.origin)return;
 if(r.mode==="navigate"){
  /* pagina: prima la rete (per prendere gli aggiornamenti), se non c'e' rete o serve il login si usa la copia salvata */
  e.respondWith(fetch(r).then(function(res){
   if(good(res)){var cp=res.clone();caches.open(C).then(function(c){c.put("index.html",cp);});return res;}
   return caches.match("index.html").then(function(hit){return hit||res;});
  }).catch(function(){return caches.match("index.html");}));
  return;
 }
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(function(hit){
  var net=fetch(r).then(function(res){if(good(res)){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp);});}return res;}).catch(function(){return hit;});
  return hit||net;
 }));
});
