(() => {
  'use strict';

  const CURRENT_VERSION = document.documentElement.dataset.appVersion || '0.0.0';
  const CHECK_INTERVAL = 30 * 60 * 1000;
  const VERSION_URL = './version.js';
  const SW_URL = './service-worker.js';

  let registration = null;
  let waitingWorker = null;
  let deferredInstallPrompt = null;
  let refreshing = false;
  let activateWhenReady = false;
  let checkTimer = null;

  const $ = id => document.getElementById(id);
  const installDock = $('pwaInstallDock');
  const installBtn = $('pwaInstallBtn');
  const updateBar = $('pwaUpdateBar');
  const updateText = $('pwaUpdateText');
  const updateBtn = $('pwaUpdateBtn');
  const overlay = $('pwaUpdateOverlay');
  const overlayTitle = $('pwaUpdateOverlayTitle');
  const overlayDetail = $('pwaUpdateOverlayDetail');
  const progress = $('pwaUpdateProgress');
  const progressText = $('pwaUpdateProgressText');
  const settingsStatus = $('pwaUpdateSettingsStatus');
  const settingsVersion = $('pwaCurrentVersion');

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  function compareVersions(a, b) {
    const clean = v => String(v || '').replace(/[^0-9.].*$/, '').split('.').map(n => Number(n) || 0);
    const aa = clean(a), bb = clean(b);
    for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
      const d = (aa[i] || 0) - (bb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  function parseVersionScript(text) {
    const version = text.match(/version:\s*["']([^"']+)["']/)?.[1] || '';
    const label = text.match(/label:\s*["']([^"']+)["']/)?.[1] || version;
    const build = text.match(/build:\s*["']([^"']+)["']/)?.[1] || '';
    return { version, label, build };
  }

  function setSettingsStatus(message, ok = true) {
    if (!settingsStatus) return;
    settingsStatus.textContent = message;
    settingsStatus.style.color = ok ? '#166534' : '#b91c1c';
  }

  function showUpdate(worker, meta = {}) {
    if (worker) waitingWorker = worker;
    if (updateText) updateText.textContent = meta.label
      ? `يتوفر تحديث جديد لمخطوطة — ${meta.label}`
      : 'يتوفر تحديث جديد لمخطوطة.';
    if (updateBar) updateBar.style.display = 'flex';
  }

  function hideUpdate() {
    if (updateBar) updateBar.style.display = 'none';
  }

  function showOverlay(title = 'تحديث مخطوطة', detail = 'جاري تجهيز الإصدار الجديد…') {
    if (!overlay) return;
    overlay.style.display = 'flex';
    if (overlayTitle) overlayTitle.textContent = title;
    if (overlayDetail) overlayDetail.textContent = detail;
  }

  function setProgress(done, total, file = '') {
    const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((done / total) * 100))) : 0;
    if (progress) progress.style.width = pct + '%';
    if (progressText) progressText.textContent = pct + '%';
    if (overlayDetail) overlayDetail.textContent = file ? `تنزيل: ${file}` : 'جاري تنزيل ملفات الإصدار…';
  }

  function showInstallIfUseful() {
    if (!installDock) return;
    installDock.style.display = (!isStandalone() && (deferredInstallPrompt || isIOS)) ? 'block' : 'none';
  }

  async function fetchLatestVersion() {
    const response = await fetch(VERSION_URL + '?t=' + Date.now(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error('version-check-' + response.status);
    return parseVersionScript(await response.text());
  }

  async function checkForUpdate(manual = false) {
    if (!('serviceWorker' in navigator)) {
      if (manual) setSettingsStatus('هذا المتصفح لا يدعم Service Worker.', false);
      return false;
    }
    try {
      if (manual) setSettingsStatus('جاري فحص التحديث…');
      const latest = await fetchLatestVersion();
      if (registration) await registration.update();
      const newer = latest.version && compareVersions(latest.version, CURRENT_VERSION) > 0;
      if (registration?.waiting) {
        showUpdate(registration.waiting, latest);
        if (manual) setSettingsStatus(`يتوفر ${latest.label || latest.version}.`);
        return true;
      }
      if (newer) {
        showUpdate(null, latest);
        if (manual) setSettingsStatus(`يتوفر ${latest.label || latest.version}.`);
        return true;
      }
      if (manual) setSettingsStatus(`أنت تستخدم أحدث إصدار: ${CURRENT_VERSION}`);
      return false;
    } catch (error) {
      console.warn('Makhtuta update check failed:', error);
      if (manual) setSettingsStatus(navigator.onLine ? 'تعذّر فحص التحديث الآن.' : 'لا يوجد اتصال بالإنترنت.', false);
      return false;
    }
  }

  function requestActivation() {
    activateWhenReady = true;
    showOverlay('تحديث مخطوطة', 'جاري تجهيز الإصدار الجديد…');
    if (waitingWorker || registration?.waiting) {
      (waitingWorker || registration.waiting).postMessage({ type: 'SKIP_WAITING' });
      if (overlayDetail) overlayDetail.textContent = 'تم التنزيل — جاري تفعيل الإصدار…';
      return;
    }
    registration?.update().catch(() => {});
  }

  function wireRegistration(reg) {
    registration = reg;
    if (reg.waiting) showUpdate(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      if (!worker) return;
      if (activateWhenReady) showOverlay('تحديث مخطوطة', 'جاري تنزيل ملفات الإصدار…');
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          waitingWorker = reg.waiting || worker;
          showUpdate(waitingWorker);
          if (activateWhenReady) {
            if (overlayDetail) overlayDetail.textContent = 'اكتمل التنزيل — جاري التفعيل…';
            waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallIfUseful();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installDock) installDock.style.display = 'none';
  });

  installBtn?.addEventListener('click', async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch (_) {}
      deferredInstallPrompt = null;
      showInstallIfUseful();
      return;
    }
    if (isIOS) {
      alert('لتثبيت مخطوطة على iPhone أو iPad:\n1) افتح زر المشاركة في Safari.\n2) اختر «إضافة إلى الشاشة الرئيسية».\n3) اضغط «إضافة».');
    } else {
      alert('استخدم خيار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» من قائمة المتصفح.');
    }
  });

  updateBtn?.addEventListener('click', requestActivation);

  navigator.serviceWorker?.addEventListener('message', event => {
    const data = event.data || {};
    if (data.type === 'UPDATE_PROGRESS') {
      if (activateWhenReady) showOverlay('تحديث مخطوطة', 'جاري تنزيل ملفات الإصدار…');
      setProgress(data.done || 0, data.total || 0, data.file || '');
    } else if (data.type === 'UPDATE_READY' && activateWhenReady) {
      setProgress(data.total || 1, data.total || 1, '');
      if (overlayDetail) overlayDetail.textContent = 'اكتمل التنزيل — جاري التفعيل…';
    }
  });

  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    hideUpdate();
    showOverlay('تم تحديث مخطوطة', 'جاري إعادة فتح التطبيق بالإصدار الجديد…');
    if (progress) progress.style.width = '100%';
    if (progressText) progressText.textContent = '100%';
    setTimeout(() => window.location.reload(), 180);
  });

  async function init() {
    if (settingsVersion) settingsVersion.textContent = CURRENT_VERSION;
    showInstallIfUseful();
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register(SW_URL, { scope: './', updateViaCache: 'none' });
      wireRegistration(reg);
      await checkForUpdate(false);
      checkTimer = setInterval(() => checkForUpdate(false), CHECK_INTERVAL);
    } catch (error) {
      console.warn('PWA service worker registration failed:', error);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate(false);
  });
  window.addEventListener('online', () => checkForUpdate(false));
  window.addEventListener('pageshow', event => {
    if (event.persisted) checkForUpdate(false);
  });

  window.MakhtutaUpdater = Object.freeze({
    checkNow: () => checkForUpdate(true),
    updateNow: requestActivation,
    currentVersion: CURRENT_VERSION
  });

  window.addEventListener('load', init, { once: true });
})();
