(()=>{
  'use strict';
  const CURRENT_VERSION=document.documentElement.dataset.appVersion||'0.0.0';
  const VERSION_URL='./student-mobile-version.js';
  const SW_URL='./student-mobile-service-worker.js';
  const SW_SCOPE='./student-mobile.html';
  const CHECK_INTERVAL=15*60*1000;
  let registration=null,waitingWorker=null,refreshing=false,timer=null,deferredInstallPrompt=null,latestMeta=null;

  const $=id=>document.getElementById(id);
  const bar=$('pwaUpdateBar'),text=$('pwaUpdateText'),button=$('pwaUpdateBtn');
  const overlay=$('pwaUpdateOverlay'),detail=$('pwaUpdateOverlayDetail'),progress=$('pwaUpdateProgress'),progressText=$('pwaUpdateProgressText');
  const status=$('pwaUpdateSettingsStatus'),versionEl=$('pwaCurrentVersion');
  const installDock=$('pwaInstallDock'),installBtn=$('pwaInstallBtn');

  const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);

  function parseVersion(v){return String(v||'').split('.').map(n=>Number(n)||0)}
  function compare(a,b){
    const aa=parseVersion(a),bb=parseVersion(b);
    for(let i=0;i<Math.max(aa.length,bb.length);i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d}
    return 0;
  }
  function parseVersionScript(source){
    return{
      version:source.match(/version:\s*["']([^"']+)["']/)?.[1]||'',
      label:source.match(/label:\s*["']([^"']+)["']/)?.[1]||''
    };
  }
  function setStatus(message,ok=true){if(status){status.textContent=message;status.style.color=ok?'#166534':'#b91c1c'}}
  function showUpdate(worker,meta={}){
    waitingWorker=worker||waitingWorker;
    if(text)text.textContent=meta.label?('يتوفر '+meta.label):'يتوفر تحديث جديد لنسخة الجوال.';
    if(bar)bar.style.display='flex';
  }
  function showOverlay(message='جاري تجهيز الإصدار الجديد…'){
    if(overlay)overlay.style.display='flex';
    if(detail)detail.textContent=message;
  }
  function setProgress(done,total,file=''){
    const pct=total?Math.round(done/total*100):0;
    if(progress)progress.style.width=Math.max(0,Math.min(100,pct))+'%';
    if(progressText)progressText.textContent=pct+'%';
    if(detail&&file)detail.textContent='تنزيل: '+file;
  }
  async function latest(){
    const r=await fetch(VERSION_URL+'?t='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
    if(!r.ok)throw new Error('version-'+r.status);
    return parseVersionScript(await r.text());
  }
  async function check(manual=false){
    if(!('serviceWorker'in navigator)){if(manual)setStatus('المتصفح لا يدعم التحديث التلقائي.',false);return false}
    try{
      if(manual)setStatus('جاري فحص التحديث…');
      const meta=await latest();
      latestMeta=meta;
      if(registration)await registration.update();
      if(registration?.waiting){showUpdate(registration.waiting,meta);if(manual)setStatus('التحديث جاهز.');return true}
      if(meta.version&&compare(meta.version,CURRENT_VERSION)>0){showUpdate(null,meta);if(manual)setStatus('تم العثور على تحديث جديد.');return true}
      if(manual)setStatus('أنت تستخدم أحدث إصدار: '+CURRENT_VERSION);
      return false;
    }catch(err){
      console.warn('Mobile update check failed',err);
      if(manual)setStatus(navigator.onLine?'تعذّر فحص التحديث الآن.':'لا يوجد اتصال بالإنترنت.',false);
      return false;
    }
  }
  async function activate(){
    showOverlay('جاري تنزيل وتفعيل الإصدار الجديد…');
    let worker=waitingWorker||registration?.waiting;
    if(worker){worker.postMessage({type:'SKIP_WAITING'});return}
    try{
      if(registration)await registration.update();
      worker=registration?.waiting||waitingWorker;
      if(worker){worker.postMessage({type:'SKIP_WAITING'});return}
    }catch(_){}
    // The page itself is navigation-network-first. If the worker script bytes did
    // not change in this release, force a cache-busted navigation so the new HTML
    // still opens immediately instead of leaving the update overlay waiting forever.
    const target=latestMeta?.version||CURRENT_VERSION;
    if(detail)detail.textContent='جاري فتح الإصدار الجديد…';
    setProgress(1,1);
    setTimeout(()=>location.replace('./student-mobile.html?v='+encodeURIComponent(target)+'&t='+Date.now()),220);
  }
  function wire(reg){
    registration=reg;
    if(reg.waiting)showUpdate(reg.waiting);
    reg.addEventListener('updatefound',()=>{
      const worker=reg.installing;if(!worker)return;
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller){
          waitingWorker=reg.waiting||worker;showUpdate(waitingWorker);
        }
      });
    });
  }

  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;if(installDock&&!isStandalone())installDock.style.display='block'});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;if(installDock)installDock.style.display='none'});
  installBtn?.addEventListener('click',async()=>{
    if(deferredInstallPrompt){deferredInstallPrompt.prompt();try{await deferredInstallPrompt.userChoice}catch(_){}deferredInstallPrompt=null;if(installDock)installDock.style.display='none';return}
    if(isIOS)alert('في Safari: مشاركة ← إضافة إلى الشاشة الرئيسية ← إضافة.');
  });
  button?.addEventListener('click',activate);

  navigator.serviceWorker?.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type==='MOBILE_UPDATE_PROGRESS')setProgress(d.done||0,d.total||0,d.file||'');
    if(d.type==='MOBILE_UPDATE_READY')setProgress(d.total||1,d.total||1,'');
  });
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(refreshing)return;refreshing=true;
    showOverlay('تم التحديث — جاري إعادة فتح التطبيق…');setProgress(1,1);
    setTimeout(()=>location.replace('./student-mobile.html?v='+Date.now()),180);
  });

  async function init(){
    if(versionEl)versionEl.textContent=CURRENT_VERSION;
    if(installDock&&!isStandalone()&&isIOS)installDock.style.display='block';
    if(!('serviceWorker'in navigator))return;
    try{
      const reg=await navigator.serviceWorker.register(SW_URL,{scope:SW_SCOPE,updateViaCache:'none'});
      wire(reg);
      await check(false);
      timer=setInterval(()=>check(false),CHECK_INTERVAL);
    }catch(err){console.warn('Mobile service worker registration failed',err)}
  }
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check(false)});
  window.addEventListener('online',()=>check(false));
  window.MakhtutaUpdater=Object.freeze({checkNow:()=>check(true),updateNow:activate,currentVersion:CURRENT_VERSION});
  window.addEventListener('load',init,{once:true});
})();