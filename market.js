/* Marktdaten-Ansicht: KPI-Karten, vier Charts, Kennzahlentabelle/-karten, Vorwochenvergleich. */
(function () {
  'use strict';
  const K = window.K;
  const { esc, rich, fmt, signed, $ } = K;
  const M = (K.market = {});

  let R, ORDER, coinSet, grpSel;
  const charts = {};
  const chFont = { family: "'Inter', system-ui, sans-serif", size: 10.5 };
  const chGrid = 'rgba(255,255,255,0.06)';
  const chTick = '#98a2b6';
  const POS = '#34d399', NEG = '#f87171';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const priceDigits = c => (c === 'XRP' ? 4 : 2);
  const cellHtml = cell => (!cell ? '<span class="na">–</span>' : cell.tone ? `<span class="v ${cell.tone}">${esc(cell.t)}</span>` : esc(cell.t));

  /* ---------- Vorwochenvergleich (berechnet aus den archivierten Vorwochendaten) ---------- */
  function wowFor(row, c) {
    const w = row.wow || { type: 'static', default: { text: 'Kein vergleichbarer Vorwochenwert hinterlegt.' } };
    const p = R.coins[c].previous, d = priceDigits(c);
    const prior = (p.end / p.start - 1) * 100;      // Vorwochenrendite 11.→18.10.
    const cur = (p.current / p.end - 1) * 100;       // Berichtsrendite 18.→25.10. (vorläufig)
    switch (w.type) {
      case 'price': return { text: `18.10.: $${fmt(p.end, d)}`, detail: `Aktuell ggü. 18.10.: ${signed(cur)} % (vorläufig)` };
      case 'perf': return { text: `Vorwoche: ${signed(prior)} %`, detail: `Renditedifferenz: ${signed(cur - prior)} pp (vorläufig)` };
      case 'hilo': return { text: `Vorwoche: $${fmt(p.high, d)} / $${fmt(p.low, d)}`, detail: 'Hoch / Tief, 12.–18.10.; aktuelle Woche unvollständig.' };
      case 'static': return (w.coins && w.coins[c]) || w.default;
      default: return null;
    }
  }
  const wowInner = w => esc(w.text) + (w.detail ? `<span class="wow-detail">${esc(w.detail)}</span>` : '');
  function wowColumn(row, sel) {
    if (row.wow && row.wow.type === 'shared') return `<span class="wow-detail">${esc(row.wow.text)}</span>`;
    return sel.map(c => { const w = wowFor(row, c); return `<div class="wow-entry"><b>${c}</b><span>${w ? wowInner(w) : ''}</span></div>`; }).join('');
  }

  /* ---------- Statische Texte ---------- */
  function renderStatic() {
    const m = R.meta;
    $('hero-eyebrow').textContent = m.eyebrow;
    $('hero-title').textContent = m.title;
    $('hero-sub').innerHTML = rich(m.subtitle);
    ['perf', 'flow', 'bp', 'ret'].forEach(k => { $('t-' + k).textContent = R.charts[k].title; $('n-' + k).textContent = R.charts[k].note; });
    $('wow-note').innerHTML = rich(R.comparison.note);
    $('context').innerHTML = `<h2>${esc(R.context.title)}</h2>` + R.context.paragraphs.map(p => `<p>${rich(p)}</p>`).join('');
    $('verdicts-title').textContent = R.verdictsTitle;
    $('method').innerHTML = `<h2>${esc(R.methodology.title)}</h2><ul>` + R.methodology.items.map(i => `<li>${rich(i)}</li>`).join('') + '</ul>';
    $('sources').innerHTML = `<h2>${esc(R.sources.title)}</h2><div class="src-grid">` +
      R.sources.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join('') +
      `<span>${esc(R.sources.note)}</span></div>`;
    $('tbl-foot').innerHTML = R.table.footnotes.map(f => '· ' + esc(f)).join('<br>');
  }

  /* ---------- KPI, Legenden, Urteile ---------- */
  function renderKpis(sel) {
    $('kpis').innerHTML = sel.map(c => {
      const co = R.coins[c], tone = co.etfWeek.bp == null ? '' : co.etfWeek.bp < 0 ? 'dn' : 'up';
      return `<div class="kpi" data-coin="${c}">
        <h3>${c} <span class="dot"></span></h3>
        <div class="price mono">$${co.price.toLocaleString('de-DE', { maximumFractionDigits: c === 'XRP' ? 4 : 0 })}</div>
        <div class="row">
          <span>Woche <b class="${co.weekReturnPct < 0 ? 'dn' : 'up'}">${fmt(co.weekReturnPct)} %</b></span>
          <span>ETF <b class="${tone}">${esc(co.etfWeek.text)}</b></span>
          <span>Mcap <b>${esc(co.kpi.mcapText)}</b></span>
        </div>
        <div class="row"><span>${esc(co.kpi.hiLoLabel)} <b class="mono">${esc(co.kpi.hiLo)}</b></span></div>
      </div>`;
    }).join('');
  }
  function renderLegend(sel) {
    $('lg-perf').innerHTML = sel.map(c => `<li data-coin="${c}"><i></i>${c}</li>`).join('');
    const flowSel = sel.filter(c => R.charts.flow.series[c]);
    $('lg-flow').innerHTML = flowSel.map(c => `<li data-coin="${c}"><i></i>${c}</li>`).join('') +
      (flowSel.length < sel.length || Object.keys(R.charts.flow.series).length < R.coinOrder.length ? '<li class="na">SOL/XRP: kein Tageswert dargestellt (siehe Hinweis)</li>' : '');
  }
  function renderVerdicts(sel) {
    $('verdicts').innerHTML = R.verdicts.filter(v => sel.includes(v.coin))
      .map(v => `<div class="vc" data-coin="${esc(v.coin)}"><h3><i></i><span>${esc(v.coin)} · ${esc(v.title)}</span></h3><p>${rich(v.text)}</p></div>`).join('');
  }

  /* ---------- Charts ---------- */
  function baseOptions(extra) {
    const o = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
    if (reduceMotion) o.animation = false;
    return Object.assign(o, extra);
  }
  function buildCharts() {
    charts.perf = new Chart($('chPerf'), {
      type: 'line',
      data: { labels: R.charts.perf.labels, datasets: ORDER.map(c => ({ label: c, data: R.coins[c].indexSeries, borderColor: R.coins[c].color, backgroundColor: R.coins[c].color, borderWidth: 2, pointRadius: 2.5, pointHoverRadius: 6, tension: 0.25 })) },
      options: Object.assign(baseOptions({
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { min: 94, max: 106, ticks: { stepSize: 2, callback: v => (v - 100) + ' %', color: chTick, font: chFont }, grid: { color: chGrid } },
          x: { ticks: { color: chTick, font: chFont, maxRotation: 0, autoSkip: true }, grid: { display: false } }
        }
      }), { plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + signed(ctx.parsed.y - 100) + ' %' } } } })
    });
    const flowKeys = Object.keys(R.charts.flow.series);
    charts.flow = new Chart($('chFlow'), {
      type: 'bar',
      data: { labels: R.charts.flow.labels, datasets: flowKeys.map(c => ({ label: c, data: R.charts.flow.series[c], backgroundColor: R.coins[c].color, borderRadius: 3 })) },
      options: baseOptions({
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('de-DE') + ' ' + R.charts.flow.unit } } },
        scales: { y: { ticks: { color: chTick, font: chFont, callback: v => v.toLocaleString('de-DE') }, grid: { color: chGrid } }, x: { ticks: { color: chTick, font: chFont, maxRotation: 0, autoSkip: true }, grid: { display: false } } }
      })
    });
    const hbar = (id, unit) => new Chart($(id), {
      type: 'bar',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 4, barPercentage: 0.55 }] },
      options: baseOptions({
        indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed.x.toLocaleString('de-DE') + ' ' + unit } } },
        scales: { x: { ticks: { color: chTick, font: chFont }, grid: { color: chGrid } }, y: { ticks: { color: chTick, font: Object.assign({}, chFont, { weight: 600 }) }, grid: { display: false } } }
      })
    });
    charts.bp = hbar('chBp', 'bp');
    charts.ret = hbar('chRet', '%');
    charts.ret.options.scales.x.ticks.callback = v => fmt(v, Number.isInteger(v) ? 0 : 1) + ' %';
  }
  function setBar(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = data.map(v => (v >= 0 ? POS : NEG));
    chart.update();
  }
  function updateCharts(sel) {
    charts.perf.data.datasets.forEach((ds, i) => { ds.hidden = !sel.includes(ORDER[i]); });
    charts.flow.data.datasets.forEach(ds => { ds.hidden = !sel.includes(ds.label); });
    charts.perf.update(); charts.flow.update();
    const bpCoins = sel.filter(c => R.coins[c].etfWeek.bp != null);
    setBar(charts.bp, bpCoins.map(c => c + R.coins[c].etfWeek.bpMark), bpCoins.map(c => R.coins[c].etfWeek.bp));
    const rets = sel.map(c => R.coins[c].weekReturnPct);
    charts.ret.options.scales.x.max = Math.max(1, Math.ceil(Math.max(...rets)));
    setBar(charts.ret, sel, rets);
  }

  function simpleTable(head, rows) {
    return '<table><thead><tr>' + head.map(h => `<th scope="col">${esc(h)}</th>`).join('') + '</tr></thead><tbody>' +
      rows.map(r => '<tr>' + r.map((c, i) => (i ? `<td>${esc(c)}</td>` : `<th scope="row">${esc(c)}</th>`)).join('') + '</tr>').join('') + '</tbody></table>';
  }
  function renderChartTables(sel) {
    const P = R.charts.perf;
    $('ct-perf').innerHTML = simpleTable(['Tag', ...sel.map(c => c + ' (%)')], P.labels.map((l, i) => [l, ...sel.map(c => signed(R.coins[c].indexSeries[i] - 100) + ' %')]));
    const fk = Object.keys(R.charts.flow.series).filter(c => sel.includes(c));
    $('ct-flow').innerHTML = simpleTable(['Tag', ...fk.map(c => c + ' (' + R.charts.flow.unit + ')')], R.charts.flow.labels.map((l, i) => [l, ...fk.map(c => R.charts.flow.series[c][i].toLocaleString('de-DE'))]));
    const bp = sel.filter(c => R.coins[c].etfWeek.bp != null);
    $('ct-bp').innerHTML = simpleTable(['Coin', 'Fluss (bp)'], bp.map(c => [c + R.coins[c].etfWeek.bpMark, fmt(R.coins[c].etfWeek.bp, 1)]));
    $('ct-ret').innerHTML = simpleTable(['Coin', 'Wochenrendite (%)'], sel.map(c => [c, signed(R.coins[c].weekReturnPct) + ' %']));
    const d = (id, text) => $(id).setAttribute('aria-label', text);
    d('chPerf', 'Liniendiagramm Wochenperformance indiziert. ' + sel.map(c => c + ' ' + signed(R.coins[c].weekReturnPct) + ' % zum Zwischenstand').join(', ') + '. Alle Werte stehen in der Tabelle unter dem Diagramm.');
    d('chFlow', 'Balkendiagramm ETF-Tagesflüsse in Mio. US-Dollar für ' + (fk.join(' und ') || 'keinen ausgewählten Coin') + '. Alle Werte stehen in der Tabelle unter dem Diagramm.');
    d('chBp', 'Balkendiagramm ETF-Wochenfluss in Basispunkten: ' + (bp.map(c => c + ' ' + fmt(R.coins[c].etfWeek.bp, 1)).join(', ') || 'kein darstellbarer Wert für die Auswahl') + '.');
    d('chRet', 'Balkendiagramm Wochenrendite in Prozent: ' + sel.map(c => c + ' ' + signed(R.coins[c].weekReturnPct)).join(', ') + '.');
  }

  /* ---------- Tabelle (breit) und Karten (schmal) ---------- */
  function renderTable(sel, groups) {
    const th = R.comparison.header.replace(' ', '\u0000');
    const [h1, h2] = th.split('\u0000');
    $('thead').innerHTML = '<tr><th scope="col">Kennzahl</th>' + sel.map(c => `<th scope="col">${c}</th>`).join('') +
      `<th scope="col" class="wow-col">${esc(h1)}<br>${esc(h2 || '')}</th></tr>`;
    const span = sel.length + 2;
    let h = '';
    for (const g of groups) {
      h += `<tr class="g"><td colspan="${span}">${esc(g.name)}</td></tr>`;
      for (const r of g.rows) {
        h += `<tr><td>${esc(r.label)}</td>`;
        if (r.wide) h += `<td class="wide" colspan="${sel.length}">${esc(r.wide)}</td>`;
        else h += sel.map(c => `<td>${cellHtml(r.cells[c])}</td>`).join('');
        h += `<td class="wow-col">${wowColumn(r, sel)}</td></tr>`;
      }
      h += `<tr class="src"><td colspan="${span}">${esc(g.source)}</td></tr>`;
    }
    $('tbody').innerHTML = h;
  }
  function renderCards(sel, groups) {
    let h = '';
    for (const c of sel) {
      const co = R.coins[c];
      h += `<section class="mcard" data-coin="${c}" aria-label="${c}"><h3><i></i>${c}<span class="mono">$${co.price.toLocaleString('de-DE', { maximumFractionDigits: c === 'XRP' ? 4 : 0 })}</span></h3>`;
      for (const g of groups) {
        const rows = g.rows.filter(r => !r.wide);
        if (!rows.length) continue;
        h += `<h4>${esc(g.name)}</h4>`;
        for (const r of rows) {
          const w = wowFor(r, c);
          h += `<div class="mrow"><div class="mlabel">${esc(r.label)}</div><div class="mval">${cellHtml(r.cells[c])}</div>` +
            (w ? `<div class="mwow"><span class="mwow-l">Vorwochenvergleich</span>${wowInner(w)}</div>` : '') + '</div>';
        }
      }
      h += '</section>';
    }
    const wide = [];
    groups.forEach(g => g.rows.filter(r => r.wide).forEach(r => wide.push([g, r])));
    if (wide.length) {
      h += '<section class="mcard" aria-label="Marktweite Angaben"><h3>Marktweite Angaben</h3>' +
        wide.map(([g, r]) => `<div class="mrow"><div class="mlabel">${esc(g.name)} · ${esc(r.label)}</div><div class="mwide">${esc(r.wide)}</div>` +
          (r.wow && r.wow.text ? `<div class="mwow"><span class="mwow-l">Vorwochenvergleich</span>${esc(r.wow.text)}</div>` : '') + '</div>').join('') + '</section>';
    }
    h += '<details class="msrc"><summary>Quellen je Kategorie</summary>' + groups.map(g => `<p><b>${esc(g.name)}:</b> ${esc(g.source)}</p>`).join('') + '</details>';
    $('coin-cards').innerHTML = h;
  }

  /* ---------- Filter ---------- */
  function syncChips() {
    document.querySelectorAll('.filters [data-coin]').forEach(b => {
      const on = b.dataset.coin === 'all' ? coinSet.size === ORDER.length : coinSet.has(b.dataset.coin);
      b.setAttribute('aria-pressed', String(on));
    });
    document.querySelectorAll('.filters [data-grp]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.grp === grpSel)));
  }
  function apply() {
    const sel = ORDER.filter(c => coinSet.has(c));
    const groups = R.table.groups.filter(g => grpSel === 'all' || g.key === grpSel);
    renderKpis(sel); renderLegend(sel); updateCharts(sel); renderChartTables(sel);
    renderTable(sel, groups); renderCards(sel, groups); renderVerdicts(sel);
  }
  function wire() {
    document.querySelectorAll('.filters [data-coin]').forEach(b => b.addEventListener('click', () => {
      const c = b.dataset.coin;
      let note = '';
      if (c === 'all') coinSet = new Set(ORDER);
      else if (coinSet.has(c) && coinSet.size === 1) { coinSet = new Set(ORDER); note = 'Der letzte ausgewählte Coin wurde abgewählt – es werden wieder alle Coins angezeigt.'; }
      else if (coinSet.has(c)) coinSet.delete(c);
      else coinSet.add(c);
      $('filter-note').textContent = note;
      K.settings.save({ coins: [...coinSet] });
      syncChips(); apply();
    }));
    document.querySelectorAll('.filters [data-grp]').forEach(b => b.addEventListener('click', () => {
      grpSel = b.dataset.grp;
      $('filter-note').textContent = '';
      K.settings.save({ grp: grpSel });
      syncChips(); apply();
    }));
  }

  M.init = function (report, settings) {
    R = report; ORDER = R.coinOrder;
    coinSet = new Set(ORDER.filter(c => settings.coins.includes(c)));
    if (!coinSet.size) coinSet = new Set(ORDER);
    grpSel = settings.grp;
    renderStatic(); buildCharts(); wire(); syncChips(); apply();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => Object.values(charts).forEach(c => c.update('none')));
  };
  M.resize = function () { Object.values(charts).forEach(c => c.resize()); };
  M.getState = function () { return { coins: ORDER.filter(c => coinSet.has(c)), grp: grpSel }; };
})();
