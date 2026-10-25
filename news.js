/* Nachrichtenarchiv: Suche, Coin-/Themenfilter, Trefferzahl, Leerzustände.
   Archivverweise aus dem Bericht – kein Live-Feed, keine neu geprüften Meldungen.
   Daten: data/news-archive.json (Schema siehe README / NACHRICHTEN_ANFORDERUNGEN.md). */
(function () {
  'use strict';
  const K = window.K;
  const { esc, rich, $ } = K;
  const N = (K.news = {});
  let ITEMS = [];

  function render() {
    const q = $('news-search').value.trim().toLocaleLowerCase('de');
    const coin = $('news-coin').value, topic = $('news-topic').value;
    const items = ITEMS.filter(n =>
      (coin === 'all' || n.coins.includes(coin)) &&
      (topic === 'all' || n.topic === topic) &&
      [n.display_title, n.summary, n.source_name, n.topic, ...n.coins].join(' ').toLocaleLowerCase('de').includes(q));
    $('news-count').textContent = `${items.length} von ${ITEMS.length} Archivverweisen · kein automatischer Abruf`;
    $('news-grid').innerHTML = items.map(n =>
      `<article class="news-card" data-news-id="${esc(n.id)}">
        <div class="news-meta"><span class="news-badge">Archiv · nicht neu geprüft</span><span>${esc(n.source_name)}</span><span>${esc(n.topic)} · ${esc(n.coins.join(', '))}</span></div>
        <h3>${esc(n.display_title)}</h3>
        <p>${esc(n.summary)}</p>
        <div class="news-date">Publikationszeit: ${n.published_at ? esc(n.published_at) : 'nicht verifiziert'}<br>Berichtsbezug: 19.–25.10.2026</div>
        <a class="news-link" href="${esc(n.original_url)}" target="_blank" rel="noopener noreferrer">Originalseite öffnen ↗</a>
      </article>`).join('');
    const empty = $('news-empty');
    empty.hidden = items.length > 0;
    empty.textContent = topic === 'Regulierung' && items.length === 0
      ? 'Keine passenden Archivverweise zu Regulierung hinterlegt. Es werden keine Meldungen erfunden. Setze die Filter zurück oder wähle ein anderes Thema.'
      : 'Keine passenden Archivverweise. Ändere die Suche oder setze die Filter zurück.';
  }

  N.init = function (data, settings) {
    ITEMS = data.items.slice();
    $('news-intro-text').textContent = data.meta.intro;
    $('news-status').innerHTML = rich(data.meta.status);
    $('news-coin').value = settings.newsCoin;
    $('news-topic').value = settings.newsTopic;
    $('news-search').addEventListener('input', render);
    $('news-coin').addEventListener('change', () => { K.settings.save({ newsCoin: $('news-coin').value }); render(); });
    $('news-topic').addEventListener('change', () => { K.settings.save({ newsTopic: $('news-topic').value }); render(); });
    $('news-reset').addEventListener('click', () => {
      $('news-search').value = ''; $('news-coin').value = 'all'; $('news-topic').value = 'all';
      K.settings.save({ newsCoin: 'all', newsTopic: 'all' });
      render();
    });
    render();
  };
  N.count = () => ITEMS.length;
})();
