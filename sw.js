/* Service Worker – Krypto-Wochen-Dashboard.
 *
 * Strategie
 *  - App-Dateien (HTML/CSS/JS/Schriften/Icons): werden beim Installieren der Version komplett in einen
 *    VERSIONIERTEN Cache gelegt und danach nur aus diesem Cache bedient (Cache-First). So entsteht nie
 *    eine Mischung aus alter und neuer Version.
 *  - Neue Version: wird im Hintergrund installiert und wartet („waiting“), bis der Nutzer
 *    „Jetzt aktualisieren“ wählt (Nachricht SKIP_WAITING). Der alte Cache bleibt bis dahin unangetastet.
 *  - Berichtsdaten (data/*.json): eigener, NICHT versionierter Cache, Network-First mit Zeitlimit und
 *    Fallback auf den zuletzt gespeicherten Stand. Ein App-Update ändert daher den Datenstand nicht.
 *  - Fremde Ursprünge (Quellenlinks) werden nicht angefasst.
 *
 * APP_VERSION/APP_BUILD stehen in app-version.js (erzeugt von tools/stamp.mjs; Build = Hash der App-Dateien).
 */
importScripts('./app-version.js');

const APP_CACHE = `krypto-app-${self.APP_VERSION}-${self.APP_BUILD}`;
const DATA_CACHE = 'krypto-data';
const DATA_TIMEOUT_MS = 4000;

const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './app-version.js',
  './core.js',
  './market.js',
  './news.js',
  './pwa.js',
  './app.js',
  './manifest.webmanifest',
  './vendor/chart.umd.min.js',
  './fonts/inter-latin-wght-normal.woff2',
  './fonts/jetbrains-mono-latin-wght-normal.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];
const DATA_FILES = [
  './data/report-2026-10-25.json',
  './data/news-archive.json'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const app = await caches.open(APP_CACHE);
    // cache:'reload' umgeht den HTTP-Cache des Browsers, damit wirklich der Stand des Servers gespeichert wird.
    await Promise.all(APP_FILES.map(async url => {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (!res.ok) throw new Error(`Precache fehlgeschlagen: ${url} (${res.status})`);
      await app.put(url, res);
    }));
    const data = await caches.open(DATA_CACHE);
    await Promise.all(DATA_FILES.map(async url => {
      try {
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if (res.ok) await data.put(url, res);
      } catch (e) { /* Daten werden bei Bedarf beim ersten Seitenaufruf nachgeladen */ }
    }));
    // bewusst KEIN skipWaiting(): Der Nutzer entscheidet über den Versionswechsel.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('krypto-app-') && k !== APP_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  const d = event.data || {};
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
  if (d.type === 'GET_VERSION' && event.ports && event.ports[0]) event.ports[0].postMessage({ version: self.APP_VERSION, build: self.APP_BUILD, cache: APP_CACHE });
});

function offlineFallback() {
  return new Response(
    '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title>' +
    '<body style="font-family:system-ui,sans-serif;background:#0d1117;color:#e8ebf0;padding:24px;line-height:1.5">' +
    '<h1 style="font-size:20px">Noch nicht offline gespeichert</h1>' +
    '<p>Die App konnte nicht aus dem Offline-Speicher geladen werden und es gibt gerade keine Internetverbindung. ' +
    'Bitte einmal mit Internet öffnen, damit App und Bericht gespeichert werden.</p></body></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function networkFirstData(request) {
  const cache = await caches.open(DATA_CACHE);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), DATA_TIMEOUT_MS);
  try {
    const res = await fetch(new Request(request, { cache: 'no-cache' }), { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) { await cache.put(request.url, res.clone()); return res; }
    throw new Error('HTTP ' + res.status);
  } catch (e) {
    clearTimeout(timer);
    const hit = await cache.match(request.url);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set('x-sw-source', 'cache');
      return new Response(await hit.blob(), { status: 200, statusText: 'OK', headers });
    }
    return new Response('{}', { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const base = new URL('./', self.location).pathname;
  const rel = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : null;
  if (rel === null) return;

  if (rel.startsWith('data/') && rel.endsWith('.json')) {
    event.respondWith(networkFirstData(req));
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const hit = (await cache.match('./index.html')) || (await cache.match('./'));
      if (hit) return hit;
      try { return await fetch(req); } catch (e) { return offlineFallback(); }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(APP_CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { return await fetch(req); } catch (e) { return new Response('', { status: 504, statusText: 'Offline' }); }
  })());
});
