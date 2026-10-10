// 錯題本 service worker：離線快取（版本 5c1c720ba2）
const CACHE='mn-5c1c720ba2';
const SHELL=["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/icon.svg", "vendor/mathjax-tex-svg.js", "vendor/jszip.min.js", "vendor/html2canvas.min.js"];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.startsWith('mn-')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// 先用快取（離線也能開），同時在背景更新，下次開啟就是新版
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const hit=(await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('index.html'):undefined);
    const net=fetch(r).then(res=>{if(res&&res.ok&&res.type==='basic')c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||new Response('目前離線，且這個檔案還沒有被快取。',{status:503,headers:{'content-type':'text/plain; charset=utf-8'}});
  })());
});
