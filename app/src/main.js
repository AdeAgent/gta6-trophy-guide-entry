// main.js — boots the Leonida Platinum Ledger: loads the trophy data, wires the
// tracker (filters, spoilers, detail pane, counters), the roadmap, missables
// and sources views, and the export / import / reset controls.

import { createStore } from './store.js';
import { KIND_FILTERS, countForKind, matchesFilters } from './filters.js';
import { displayDescription, displayName, isMasked } from './spoilers.js';
import { escapeHtml, gradeBadge, renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';
import { renderMissables } from './missables.js';
import { renderSourcesTable } from './sources.js';
import { exportProgress, mergeSummary, parseImport } from './exportImport.js';

const DATA_URL = 'data/trophies.json';
const DEFAULT_DETAIL_ID = 28; // Positive Mental Attitude, the possibly-missable one

const els = {
  earnedBig: document.getElementById('earnedBig'),
  earnedLine: document.getElementById('earnedLine'),
  platFill: document.getElementById('platFill'),
  gradeCounts: document.getElementById('gradeCounts'),
  kindChips: document.getElementById('kindChips'),
  searchInput: document.getElementById('searchInput'),
  gradeSelect: document.getElementById('gradeSelect'),
  earnedSelect: document.getElementById('earnedSelect'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  showingLine: document.getElementById('showingLine'),
  trophyList: document.getElementById('trophyList'),
  detailPane: document.getElementById('detailPane'),
  toast: document.getElementById('toast'),
};

let trophies = [];
let store = createStore();
let selectedId = DEFAULT_DETAIL_ID;
let currentView = 'tracker';
const filters = { kind: 'all', grade: 'all', earned: 'all', query: '' };

function spoilersOn() {
  return els.spoilerToggle.checked;
}

let toastTimer = null;
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 4200);
}

function renderHeader() {
  const earned = store.earnedCount();
  const total = trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  els.earnedBig.innerHTML = `${earned}<span class="ofTotal"> / ${total}</span>`;
  els.earnedLine.textContent = `${earned} earned · ${total - earned} to go · platinum ${pct}% there`;
  els.platFill.style.width = `${pct}%`;
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const all = trophies.filter((t) => t.grade === grade);
    const got = all.filter((t) => store.isEarned(t.id)).length;
    const label = grade[0].toUpperCase() + grade.slice(1);
    return `${label} ${got}/${all.length}`;
  });
  els.gradeCounts.textContent = parts.join(' · ');
}

function renderChips() {
  els.kindChips.innerHTML = '';
  for (const kind of KIND_FILTERS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kindChip' + (filters.kind === kind.id ? ' active' : '');
    button.dataset.kind = kind.id;
    const count = countForKind(trophies, kind.id);
    button.textContent = kind.disabled ? `${kind.label} (0)` : `${kind.label} · ${count}`;
    if (kind.disabled) {
      button.disabled = true;
      button.title = kind.note;
    }
    button.addEventListener('click', () => {
      filters.kind = kind.id;
      renderChips();
      renderList();
    });
    els.kindChips.append(button);
  }
}

function metaChips(trophy) {
  const chips = [`<span class="metaChip kind-${trophy.kind}">${trophy.kind}</span>`];
  chips.push(`<span class="metaChip">Stage ${trophy.roadmapStage}</span>`);
  if (trophy.chapter) chips.push(`<span class="metaChip">Chapter ${trophy.chapter}</span>`);
  if (trophy.count) chips.push(`<span class="metaChip countChip">${store.getCount(trophy.id)}/${trophy.count.target} ${escapeHtml(trophy.count.label)}</span>`);
  if (trophy.hiddenOnPsn) chips.push('<span class="metaChip hiddenChip">HIDDEN ON PSN</span>');
  if (trophy.missable) chips.push('<span class="metaChip missableChip">POSSIBLY MISSABLE</span>');
  return chips.join('');
}

function renderList() {
  const visible = trophies.filter((t) => matchesFilters(t, filters, store));
  const spoilerNote = spoilersOn()
    ? 'Spoilers on: unearned story and PSN-hidden trophies stay masked until earned.'
    : 'Spoilers off: every name and description is shown.';
  els.showingLine.textContent = `Showing ${visible.length} of ${trophies.length} trophies (${filters.kind} · ${filters.grade} · ${filters.earned}). ${spoilerNote}`;
  els.trophyList.innerHTML = '';
  for (const trophy of visible) {
    const masked = isMasked(trophy, spoilersOn(), store);
    const row = document.createElement('article');
    row.className = 'trophyRow' + (trophy.id === selectedId ? ' selected' : '') + (store.isEarned(trophy.id) ? ' earned' : '');
    row.dataset.trophyId = String(trophy.id);
    row.id = `trophy-${trophy.id}`;
    row.innerHTML = `
      <label class="rowCheck"><input type="checkbox" class="earnedBox" ${store.isEarned(trophy.id) ? 'checked' : ''} aria-label="Mark earned"></label>
      <div class="rowMain">
        <div class="rowTop">${gradeBadge(trophy.grade)}<h3 class="trophyName">${escapeHtml(displayName(trophy, spoilersOn(), store))}</h3></div>
        <p class="trophyDesc">${escapeHtml(displayDescription(trophy, spoilersOn(), store))}</p>
        <div class="rowMeta">${metaChips(trophy)}</div>
      </div>`;
    row.querySelector('.earnedBox').addEventListener('change', () => {
      store.toggle(trophy.id);
      refresh();
    });
    row.addEventListener('click', (event) => {
      if (event.target.closest('.rowCheck')) return;
      select(trophy.id, false);
    });
    els.trophyList.append(row);
  }
  if (!visible.length) {
    els.trophyList.innerHTML = '<p class="emptyList">No trophies match those filters. Loosen the search or pick another kind.</p>';
  }
}

function renderDetailPane() {
  const trophy = trophies.find((t) => t.id === selectedId) || trophies[0];
  if (!trophy) return;
  renderDetail(els.detailPane, trophy, store, spoilersOn(), {
    onToggleEarned(id) {
      store.toggle(id);
      refresh();
    },
    onBump(id, delta) {
      const t = trophies.find((x) => x.id === id);
      if (t && t.count) store.bump(id, delta, t.count.target);
      refresh();
    },
  });
}

function renderViews() {
  renderRoadmap(
    document.getElementById('roadmapStages'),
    document.getElementById('chapterOneCallout'),
    document.getElementById('savePlan'),
    trophies, store, (id) => select(id, true),
  );
  renderMissables(
    document.getElementById('missableFeature'),
    document.getElementById('watchList'),
    document.getElementById('honestyNotes'),
    trophies, store, (id) => select(id, true),
  );
  renderSourcesTable(document.getElementById('sourcesTableWrap'), trophies);
}

function refresh() {
  renderHeader();
  renderList();
  renderDetailPane();
  renderViews();
}

function select(id, jumpToTracker) {
  selectedId = id;
  if (jumpToTracker) switchView('tracker');
  renderList();
  renderDetailPane();
  const row = document.getElementById(`trophy-${id}`);
  if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  history.replaceState(null, '', `#trophy-${id}`);
}

function switchView(name) {
  currentView = name;
  document.querySelectorAll('.viewTab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });
  document.querySelectorAll('.view').forEach((view) => {
    view.hidden = view.id !== `view-${name}`;
  });
}

function bindControls() {
  document.querySelectorAll('.viewTab').forEach((tab) => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
  els.searchInput.addEventListener('input', () => {
    filters.query = els.searchInput.value.trim().toLowerCase();
    renderList();
  });
  els.gradeSelect.addEventListener('change', () => {
    filters.grade = els.gradeSelect.value;
    renderList();
  });
  els.earnedSelect.addEventListener('change', () => {
    filters.earned = els.earnedSelect.value;
    renderList();
  });
  els.spoilerToggle.addEventListener('change', () => {
    renderList();
    renderDetailPane();
  });
  document.getElementById('exportButton').addEventListener('click', () => {
    exportProgress(store);
    showToast(`Progress exported: ${store.earnedCount()} of ${trophies.length} earned, saved as leonida-ledger-progress.json. Import it any time to restore.`);
  });
  const importFile = document.getElementById('importFile');
  document.getElementById('importButton').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    importFile.value = '';
    if (!file) return;
    try {
      const parsed = parseImport(await file.text(), new Set(trophies.map((t) => t.id)));
      const result = store.merge(parsed);
      refresh();
      showToast(mergeSummary(result, parsed.skipped));
    } catch (error) {
      showToast(`Import failed: ${error.message}`);
    }
  });
  document.getElementById('resetButton').addEventListener('click', () => {
    if (!window.confirm('Reset all progress? Earned ticks and counters in this browser will be cleared.')) return;
    store.clear();
    refresh();
    showToast('Progress reset. Fresh ledger, fresh run.');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      event.preventDefault();
      switchView('tracker');
      els.searchInput.focus();
    }
  });
}

async function boot() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    trophies = data.trophies;
  } catch (error) {
    els.showingLine.textContent = `Could not load the trophy data (${error.message}). Serve the app folder over HTTP, for example with node serve.ts.`;
    return;
  }
  const deep = /^#trophy-(\d+)$/.exec(location.hash);
  if (deep && trophies.some((t) => t.id === Number(deep[1]))) selectedId = Number(deep[1]);
  bindControls();
  renderChips();
  refresh();
}

boot();
