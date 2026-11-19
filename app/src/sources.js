// sources.js — the Sources view: every distinct source used anywhere in the
// data, with the trophies that cite it, so the citation coverage is checkable.

export function buildSourceIndex(trophies) {
  const index = new Map();
  for (const trophy of trophies) {
    for (const source of trophy.sources || []) {
      const key = `${source.site}|${source.url}`;
      if (!index.has(key)) {
        index.set(key, {
          site: source.site,
          title: source.title,
          url: source.url,
          accessed: source.accessed,
          trophies: [],
        });
      }
      index.get(key).trophies.push(trophy.name);
    }
  }
  return [...index.values()].sort((a, b) => b.trophies.length - a.trophies.length);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function renderSourcesTable(wrapEl, trophies) {
  const rows = buildSourceIndex(trophies).map((source, i) => `
    <tr>
      <td class="srcNum">${i + 1}</td>
      <td><strong>${escapeHtml(source.site)}</strong><br>
        <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)}</a><br>
        <span class="srcMeta">Read ${escapeHtml(source.accessed)} · cited by ${source.trophies.length} trophies</span></td>
      <td class="srcTrophies">${source.trophies.map(escapeHtml).join(' · ')}</td>
    </tr>`).join('');
  const cited = trophies.filter((t) => (t.sources || []).length > 0).length;
  wrapEl.innerHTML = `
    <p class="sourcesSummary">Citation coverage: <strong>${cited}/${trophies.length} trophies carry at least one linked source</strong>, and the non-trivial ones carry two or three. The official names, descriptions and grades themselves are PlayStation's published text, as carried by the PowerPyx and GTABase lists.</p>
    <table class="sourcesTable">
      <thead><tr><th>#</th><th>Source</th><th>Cited by</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}
