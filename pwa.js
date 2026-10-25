/* PWA-Schicht: Service-Worker-Registrierung, App-Updates, Online/Offline-Status,
   Installations-Unterstützung (nur wo der Browser sie wirklich anbietet), Info-Dialog. */
(function () {
  'use strict';
  const K = window.K;
  const { $ } = K;
  const P = (K.pwa = {});

  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isWindows = /Windows/.test(ua);
  const isEdge = /Edg\//.test(ua);
  const isChrome = /Chrome\//.test(ua) && !isEdge && !/OPR\//.test(ua);
  const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: window-controls-overlay), (display-mode: minimal-ui)').matches) || window.navigator.standalone === true;

  let deferredPrompt = null;
  let reg = null;
  let swState = 'nicht gestartet';
  let userRequestedUpdate = false;
  let dataInfo = null; // { report, stand, source }

  /* ---------- Online/Offline ---------- */
  function renderNet() {
    const off = !navigator.onLine;
    const pill = $('pill-net');
    pill.dataset.state = off ? 'offline' : 'online';
    pill.textContent = off ? 'Offline' : 'Online';
    if (off) {
      const s = dataInfo ? ` (Datenstand ${dataInfo.stand})` : '';
      K.banner('offline', `<b>Offline.</b> Es wird der zuletzt gespeicherte Archivbericht angezeigt${s}. Es werden keine neuen Zahlen geladen; Links zu Originalseiten funktionieren erst wieder online.`, { warn: true });
    } else K.unbanner('offline');
    renderDialog();
  }

  /* ---------- Service Worker ---------- */
  function showUpdate(worker) {
    const stand = dataInfo ? dataInfo.stand : '';
    K.banner('update', `<b>Neue App-Version verfügbar.</b> Das betrifft nur den App-Code. Der Datenstand des Berichts bleibt unverändert${stand ? ' (Archivbericht, Stand ' + stand + ')' : ''}.`, {
      buttons: [
        { label: 'Jetzt aktualisieren', accent: true, onClick: () => { userRequestedUpdate = true; (worker || (reg && reg.waiting)).postMessage({ type: 'SKIP_WAITING' }); } },
        { label: 'Später', onClick: () => K.unbanner('update') }
      ]
    });
  }
  async function registerSW() {
    if (!('serviceWorker' in navigator)) { swState = 'wird von diesem Browser nicht unterstützt'; return; }
    if (!window.isSecureContext) { swState = 'nicht verfügbar (Seite nicht über HTTPS oder localhost geöffnet)'; return; }
    try {
      reg = await navigator.serviceWorker.register('sw.js', { scope: './', updateViaCache: 'none' });
      swState = reg.active ? 'aktiv' : 'wird eingerichtet …';
      navigator.serviceWorker.ready.then(() => { swState = 'aktiv – Bericht und App sind offline lesbar'; renderDialog(); });
      if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(nw);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (userRequestedUpdate) { try { sessionStorage.setItem('krypto:updated', '1'); } catch (e) { /* ignorieren */ } window.location.reload(); }
      });
      const check = () => { if (navigator.onLine && reg) reg.update().catch(() => {}); };
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
      window.addEventListener('online', check);
      setInterval(check, 60 * 60 * 1000);
    } catch (e) {
      swState = 'Registrierung fehlgeschlagen: ' + (e && e.message ? e.message : e);
    }
    renderDialog();
  }
  function getSwVersion() {
    return new Promise(resolve => {
      const w = navigator.serviceWorker && navigator.serviceWorker.controller;
      if (!w) return resolve(null);
      const ch = new MessageChannel();
      const t = setTimeout(() => resolve(null), 1500);
      ch.port1.onmessage = e => { clearTimeout(t); resolve(e.data); };
      w.postMessage({ type: 'GET_VERSION' }, [ch.port2]);
    });
  }

  /* ---------- Installation ---------- */
  function renderInstall() {
    const btn = $('btn-install');
    btn.hidden = !deferredPrompt || standalone();
    const st = $('i-install-state');
    if (!st) return;
    if (standalone()) st.textContent = 'Du nutzt gerade die installierte App (eigenes Fenster bzw. Home-Bildschirm-App).';
    else if (deferredPrompt) st.textContent = 'Dein Browser bietet die Installation an: Nutze den Knopf „App installieren“ oben oder die Anleitung unten.';
    else if (isIOS) st.textContent = 'Auf dem iPhone gibt es keinen automatischen Installationsdialog. Bitte die Schritte für Safari unten befolgen.';
    else st.textContent = 'Dieser Browser bietet gerade keinen Installationsdialog an (nicht unterstützt, bereits installiert oder noch nicht freigegeben). Die Anleitung unten zeigt den manuellen Weg.';
    const open = id => { const d = $(id); if (d) d.open = true; };
    if (isIOS) open('g-ios'); else if (isWindows && isEdge) open('g-edge'); else if (isWindows && isChrome) open('g-chrome'); else if (!standalone()) open('g-other');
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; renderInstall(); });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null; renderInstall();
    K.banner('installed', '<b>App installiert.</b> Du kannst sie jetzt über Start-Menü, Taskleiste bzw. Home-Bildschirm öffnen. Einstellungen bleiben auf diesem Gerät gespeichert (keine Synchronisation zwischen Geräten).', { buttons: [{ label: 'OK', onClick: () => K.unbanner('installed') }] });
  });
  async function doInstall() {
    if (!deferredPrompt) { openDialog(); return; }
    const p = deferredPrompt; deferredPrompt = null; renderInstall();
    try { await p.prompt(); await p.userChoice; } catch (e) { /* abgebrochen */ }
  }

  /* ---------- Info-Dialog ---------- */
  function openDialog() {
    const d = $('info-dialog');
    renderDialog();
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  }
  async function renderDialog() {
    if (!$('i-report')) return;
    const di = dataInfo;
    $('i-report').textContent = di ? di.report : '–';
    $('i-stand').textContent = di ? di.stand + ' (Archivbericht, keine Live-Daten)' : '–';
    $('i-source').textContent = di ? K.sourceLabel[di.source] + (navigator.onLine ? '' : ' · gerade offline') : '–';
    const v = window.APP_VERSION ? `${window.APP_VERSION} (Build ${window.APP_BUILD})` : 'unbekannt';
    $('i-version').textContent = v;
    $('i-sw').textContent = swState;
    getSwVersion().then(r => { if (r && r.build) $('i-sw').textContent = swState + ' · Service-Worker-Build ' + r.build + (r.build !== window.APP_BUILD ? ' (weicht von der Seite ab – bitte neu laden)' : ''); });
    $('i-storage').textContent = K.storage.available ? 'lokal gespeichert (nur dieses Gerät/diese App)' : 'nicht verfügbar – Einstellungen gelten nur für diese Sitzung';
    $('i-mode').textContent = standalone() ? 'installierte App (Standalone)' : 'Browser-Tab';
  }

  /* ---------- Externe Links offline ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="http"]');
    if (a && !navigator.onLine) {
      e.preventDefault();
      K.toast('Du bist offline: Die Originalseite kann nicht geöffnet werden. Die gespeicherten Archivkarten bleiben lesbar.');
    }
  });

  P.setDataInfo = function (info) {
    dataInfo = info;
    $('stand-short').textContent = 'Datenstand: ' + info.stand + ' · ' + K.sourceLabel[info.source];
    renderNet();
  };
  P.resetCaches = async function () {
    try {
      if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); }
      if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); }
    } catch (e) { /* weiter */ }
    K.storage.remove('copy:report'); K.storage.remove('copy:news');
    window.location.reload();
  };
  P.init = function () {
    window.addEventListener('online', renderNet);
    window.addEventListener('offline', renderNet);
    $('btn-install').addEventListener('click', doInstall);
    $('btn-info').addEventListener('click', openDialog);
    $('info-close').addEventListener('click', () => { const d = $('info-dialog'); if (d.close) d.close(); else d.removeAttribute('open'); });
    $('btn-reset-settings').addEventListener('click', () => {
      K.settings.reset();
      K.toast('Einstellungen zurückgesetzt. Die Seite wird neu geladen …', 1500);
      setTimeout(() => window.location.reload(), 600);
    });
    $('btn-reset-cache').addEventListener('click', () => {
      if (window.confirm('Offline-Speicher leeren? Danach braucht die App einmal Internet, um den Bericht erneut zu speichern.')) P.resetCaches();
    });
    renderInstall(); renderNet(); renderDialog();
    try {
      if (sessionStorage.getItem('krypto:updated')) {
        sessionStorage.removeItem('krypto:updated');
        K.banner('updated', `<b>App aktualisiert</b> auf Version ${window.APP_VERSION || ''}. Der Datenstand des Berichts hat sich dadurch nicht geändert.`, { buttons: [{ label: 'OK', onClick: () => K.unbanner('updated') }] });
      }
    } catch (e) { /* ignorieren */ }
    // iPhone: einmaliger Hinweis, solange nicht installiert
    if (isIOS && !standalone() && K.storage.get('ios-hint') !== 'dismissed') {
      K.banner('ioshint', '<b>Als App nutzen:</b> In Safari auf <b>Teilen → Zum Home-Bildschirm</b> tippen.', { buttons: [
        { label: 'Anleitung', onClick: openDialog },
        { label: 'Ausblenden', onClick: () => { K.storage.set('ios-hint', 'dismissed'); K.unbanner('ioshint'); } }] });
    }
    registerSW();
    if (navigator.storage && navigator.storage.persist && standalone()) navigator.storage.persist().catch(() => {});
  };
  P.openDialog = openDialog;
  P.isStandalone = standalone;
})();
