/* Start der App: Daten laden, Bereiche (Marktdaten/Nachrichten) umschalten. */
(function () {
  'use strict';
  const K = window.K;
  const { $ } = K;

  const REPORT_URL = 'data/report-2026-10-25.json';
  const NEWS_URL = 'data/news-archive.json';
  const VIEWS = { market: { hash: '#markt', title: 'Marktdaten' }, news: { hash: '#nachrichten', title: 'Nachrichten' } };
  let marketReady = false;

  function setView(view, opts) {
    opts = opts || {};
    if (!VIEWS[view]) view = 'market';
    const news = view === 'news';
    $('market-panel').hidden = news;
    $('news-panel').hidden = !news;
    document.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    document.title = VIEWS[view].title + ' · Krypto-Wochen-Dashboard';
    K.settings.save({ view });
    if (opts.updateHash !== false && window.location.hash !== VIEWS[view].hash) history.replaceState(null, '', VIEWS[view].hash);
    if (!news && marketReady) requestAnimationFrame(() => K.market.resize());
  }
  const viewFromHash = () => (window.location.hash === '#nachrichten' ? 'news' : window.location.hash === '#markt' ? 'market' : null);

  function showError(id, title, err) {
    const el = $(id);
    el.hidden = false;
    el.innerHTML = `<p><b>${K.esc(title)}</b></p><p>${K.esc(err && err.message ? err.message : String(err))}</p>
      <p>Beim ersten Aufruf wird eine Internetverbindung benötigt. Wenn die App bereits geöffnet wurde, kann der gespeicherte Offline-Stand beschädigt sein.</p>
      <div class="btn-row"><button type="button" class="btn btn-accent" data-act="retry">Erneut versuchen</button><button type="button" class="btn btn-danger" data-act="reset">Offline-Speicher zurücksetzen</button></div>`;
    el.querySelector('[data-act=retry]').addEventListener('click', () => window.location.reload());
    el.querySelector('[data-act=reset]').addEventListener('click', () => K.pwa.resetCaches());
  }

  async function boot() {
    const settings = K.settings.load();
    K.pwa.init();
    document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
    window.addEventListener('hashchange', () => { const v = viewFromHash(); if (v) setView(v, { updateHash: false }); });
    setView(viewFromHash() || settings.view, { updateHash: true });

    if (!K.storage.available) K.banner('storage', '<b>Lokaler Speicher nicht verfügbar.</b> Einstellungen und die lokale Berichtskopie gelten nur für diese Sitzung. Die App bleibt nutzbar.', { warn: true });

    const [rep, news] = await Promise.allSettled([
      K.loadJson(REPORT_URL, 'report', K.validateReport),
      K.loadJson(NEWS_URL, 'news', K.validateNews)
    ]);

    if (rep.status === 'fulfilled') {
      const { data, source } = rep.value;
      K.market.init(data, settings);
      marketReady = true;
      $('market-loading').hidden = true;
      $('market-content').hidden = false;
      $('market-panel').setAttribute('aria-busy', 'false');
      K.pwa.setDataInfo({ report: data.meta.title + ' (' + data.meta.period.label + ')', stand: data.meta.priceAsOf.label, source });
      if (source === 'local-copy') K.banner('copy', '<b>Gespeicherte Kopie.</b> Der Bericht konnte nicht frisch geladen werden; angezeigt wird die zuletzt im Browser gespeicherte Kopie. Datenstand unverändert: ' + K.esc(data.meta.priceAsOf.label) + '.', { warn: true });
      if (!$('market-panel').hidden) requestAnimationFrame(() => K.market.resize());
    } else {
      $('market-loading').hidden = true;
      $('market-panel').setAttribute('aria-busy', 'false');
      $('stand-short').textContent = 'Kein Bericht geladen';
      showError('market-error', 'Der Bericht konnte nicht geladen werden.', rep.reason);
    }

    if (news.status === 'fulfilled') {
      $('news-error').hidden = true;
      K.news.init(news.value.data, settings);
    } else {
      $('news-content').hidden = true;
      showError('news-error', 'Das Nachrichtenarchiv konnte nicht geladen werden.', news.reason);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
