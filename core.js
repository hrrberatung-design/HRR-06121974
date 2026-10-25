/* Gemeinsame Hilfsfunktionen: Escaping, Formatierung, sicherer lokaler Speicher, Datenladen. */
(function () {
  'use strict';
  const K = (window.K = window.K || {});

  K.esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* Datentexte: nur **fett** als Auszeichnung zulässig, alles andere wird escaped. */
  K.rich = s => K.esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  K.fmt = (n, d = 2) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
  K.signed = (n, d = 2) => (n > 0 ? '+' : '') + K.fmt(n, d);
  K.$ = (id) => document.getElementById(id);

  /* ---------- Lokaler Speicher (localStorage mit Speicher-Fallback) ---------- */
  K.storage = (function () {
    const PREFIX = 'krypto:';
    const mem = {};
    let ok = false;
    try {
      const t = PREFIX + '__probe';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      ok = true;
    } catch (e) { ok = false; }
    return {
      get available() { return ok; },
      get(key) {
        if (ok) { try { const v = window.localStorage.getItem(PREFIX + key); if (v !== null) return v; } catch (e) { ok = false; } }
        return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
      },
      set(key, val) {
        mem[key] = String(val);
        if (ok) { try { window.localStorage.setItem(PREFIX + key, String(val)); } catch (e) { ok = false; } }
        return ok;
      },
      remove(key) {
        delete mem[key];
        if (ok) { try { window.localStorage.removeItem(PREFIX + key); } catch (e) { ok = false; } }
      },
      clearAll() {
        Object.keys(mem).forEach(k => delete mem[k]);
        if (ok) {
          try {
            Object.keys(window.localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => window.localStorage.removeItem(k));
          } catch (e) { ok = false; }
        }
      }
    };
  })();

  /* ---------- Einstellungen ---------- */
  const DEFAULTS = { view: 'market', coins: ['BTC', 'ETH', 'SOL', 'XRP'], grp: 'all', newsCoin: 'all', newsTopic: 'all' };
  K.settings = {
    defaults: DEFAULTS,
    load() {
      let s = {};
      try { s = JSON.parse(K.storage.get('settings') || '{}') || {}; } catch (e) { s = {}; }
      const out = Object.assign({}, DEFAULTS);
      if (s.view === 'market' || s.view === 'news') out.view = s.view;
      if (Array.isArray(s.coins)) {
        const c = DEFAULTS.coins.filter(x => s.coins.includes(x));
        if (c.length) out.coins = c;
      }
      if (['all', 'Kurs', 'ETF', 'Derivate', 'On-Chain'].includes(s.grp)) out.grp = s.grp;
      if (['all', 'BTC', 'ETH', 'SOL', 'XRP'].includes(s.newsCoin)) out.newsCoin = s.newsCoin;
      if (['all', 'ETF', 'Derivate', 'On-Chain', 'Regulierung', 'Makro'].includes(s.newsTopic)) out.newsTopic = s.newsTopic;
      K.settings.current = out;
      return out;
    },
    save(patch) {
      const cur = Object.assign({}, K.settings.current || DEFAULTS, patch);
      K.settings.current = cur;
      return K.storage.set('settings', JSON.stringify(cur));
    },
    reset() { K.storage.remove('settings'); K.settings.current = Object.assign({}, DEFAULTS); }
  };

  /* ---------- Daten laden ----------
     Reihenfolge: Netz bzw. Service-Worker-Cache -> lokale Kopie im Browser -> Fehler.
     Die Herkunft wird zurückgemeldet, damit die Oberfläche nichts als „aktuell“ ausgibt. */
  K.loadJson = async function (url, storeKey, validate) {
    let lastErr;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const data = JSON.parse(text);
      validate(data);
      K.storage.set('copy:' + storeKey, text);
      return { data, source: res.headers.get('x-sw-source') === 'cache' ? 'cache' : 'network' };
    } catch (e) { lastErr = e; }
    const copy = K.storage.get('copy:' + storeKey);
    if (copy) {
      try { const data = JSON.parse(copy); validate(data); return { data, source: 'local-copy', error: lastErr }; } catch (e) { /* defekte Kopie verwerfen */ K.storage.remove('copy:' + storeKey); }
    }
    throw lastErr;
  };

  K.sourceLabel = { network: 'aus dem Netz geladen', cache: 'aus dem Offline-Speicher (Service Worker)', 'local-copy': 'aus lokaler Kopie im Browser' };

  K.validateReport = function (d) {
    const need = (c, m) => { if (!c) throw new Error('Berichtsdaten ungültig: ' + m); };
    need(d && d.schema === 1, 'schema');
    need(d.meta && d.meta.priceAsOf && d.meta.priceAsOf.label, 'meta');
    need(Array.isArray(d.coinOrder) && d.coinOrder.length > 0, 'coinOrder');
    d.coinOrder.forEach(c => { const x = d.coins && d.coins[c]; need(x && typeof x.price === 'number' && Array.isArray(x.indexSeries) && x.previous && x.kpi && x.etfWeek, 'coin ' + c); });
    need(d.charts && d.charts.perf && d.charts.flow && d.charts.bp && d.charts.ret, 'charts');
    need(d.table && Array.isArray(d.table.groups) && d.table.groups.length > 0, 'table');
    d.table.groups.forEach(g => need(g.key && Array.isArray(g.rows), 'group'));
    need(Array.isArray(d.verdicts) && d.context && d.methodology && d.sources && Array.isArray(d.sources.links), 'texts');
  };
  K.validateNews = function (d) {
    if (!d || d.schema !== 1 || !d.meta || !Array.isArray(d.items)) throw new Error('Nachrichtendaten ungültig');
    d.items.forEach(n => { if (!n.id || !n.original_url || !n.display_title || !Array.isArray(n.coins) || !n.topic) throw new Error('Nachrichteneintrag ungültig'); });
  };

  /* ---------- Toast ---------- */
  let toastTimer;
  K.toast = function (msg, ms = 6000) {
    const t = K.$('toast');
    if (!t) return;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms);
  };

  /* ---------- Banner ---------- */
  K.banner = function (id, html, opts) {
    opts = opts || {};
    const host = K.$('banners');
    let el = document.getElementById('bn-' + id);
    if (!el) { el = document.createElement('div'); el.id = 'bn-' + id; host.appendChild(el); }
    el.className = 'banner' + (opts.warn ? ' warn' : '');
    el.innerHTML = '<span class="banner-text">' + html + '</span>';
    (opts.buttons || []).forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'btn' + (b.accent ? ' btn-accent' : ''); btn.textContent = b.label;
      btn.addEventListener('click', b.onClick);
      el.appendChild(btn);
    });
    return el;
  };
  K.unbanner = function (id) { const el = document.getElementById('bn-' + id); if (el) el.remove(); };
})();
