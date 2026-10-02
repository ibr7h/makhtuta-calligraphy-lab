const MOBILE_CACHE_VERSION='makhtuta-student-mobile-v0-3-0-2026-10-02-03';
const MOBILE_RUNTIME_CACHE=MOBILE_CACHE_VERSION+'-runtime';
const MOBILE_CORE=[
  './student-mobile.html',
  './student-mobile.webmanifest',
  './student-mobile-version.js',
  './student-mobile-updater.js',
  './offline.html',
  './icons/icon.svg',
  './icons/icon-maskable.svg'
];

async function mobileBroadcast(message){
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of clients)client.postMessage(message);
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(MOBILE_CACHE_VERSION);
    let done=0;
    for(const file of MOBILE_CORE){
      const res=await fetch(new Request(file,{cache:'reload'}));
      if(!res.ok)throw new Error('Failed to cache '+file+': '+res.status);
      await cache.put(file,res.clone());
      done++;
      await mobileBroadcast({type:'MOBILE_UPDATE_PROGRESS',done,total:MOBILE_CORE.length,file});
    }
    await mobileBroadcast({type:'MOBILE_UPDATE_READY',done:MOBILE_CORE.length,total:MOBILE_CORE.length});
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('makhtuta-student-mobile-')&&k!==MOBILE_CACHE_VERSION&&k!==MOBILE_RUNTIME_CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
});

async function versionNetworkFirst(request){
  try{
    const res=await fetch(new Request(request,{cache:'no-store'}));
    if(res?.ok){
      const cache=await caches.open(MOBILE_CACHE_VERSION);
      cache.put('./student-mobile-version.js',res.clone()).catch(()=>{});
    }
    return res;
  }catch(_){
    return (await caches.match('./student-mobile-version.js'))||Response.error();
  }
}

async function navigationNetworkFirst(request){
  try{
    const res=await fetch(new Request(request,{cache:'no-store'}));
    if(res?.ok){
      const cache=await caches.open(MOBILE_RUNTIME_CACHE);
      cache.put(request,res.clone()).catch(()=>{});
    }
    return res;
  }catch(_){
    return (await caches.match(request))||(await caches.match('./student-mobile.html'))||(await caches.match('./offline.html'));
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);

  if(url.origin===self.location.origin&&url.pathname.endsWith('/student-mobile-version.js')){
    event.respondWith(versionNetworkFirst(request));
    return;
  }
  if(request.mode==='navigate'){
    event.respondWith(navigationNetworkFirst(request));
    return;
  }
  if(url.origin===self.location.origin){
    event.respondWith((async()=>{
      const cached=await caches.match(request);
      try{
        const res=await fetch(request);
        if(res?.ok)caches.open(MOBILE_RUNTIME_CACHE).then(cache=>cache.put(request,res.clone())).catch(()=>{});
        return res;
      }catch(_){
        return cached||(await caches.match('./offline.html'))||Response.error();
      }
    })());
  }
});
