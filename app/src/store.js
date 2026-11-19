// store.js — progress persistence: earned trophies and per-trophy counters in a
// versioned localStorage key, with snapshot/replace for export and import.

export const STORAGE_KEY = 'leonida-platinum-ledger:v1';
export const EXPORT_FORMAT = 'leonida-platinum-ledger-progress';

function emptyState() {
  return { earned: new Set(), counts: {} };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.earned)) return emptyState();
    const counts = {};
    if (parsed.counts && typeof parsed.counts === 'object') {
      for (const [key, value] of Object.entries(parsed.counts)) {
        const id = Number(key);
        if (Number.isInteger(id) && Number.isFinite(value) && value > 0) counts[id] = value;
      }
    }
    return { earned: new Set(parsed.earned.filter((id) => Number.isInteger(id))), counts };
  } catch {
    return emptyState();
  }
}

export function createStore() {
  let state = loadState();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        earned: [...state.earned],
        counts: state.counts,
      }));
    } catch {
      // Storage can be unavailable (private mode); the tracker still works in memory.
    }
  }

  return {
    isEarned(id) {
      return state.earned.has(id);
    },
    toggle(id) {
      if (state.earned.has(id)) state.earned.delete(id);
      else state.earned.add(id);
      persist();
    },
    earnedCount() {
      return state.earned.size;
    },
    earnedIds() {
      return state.earned;
    },
    getCount(id) {
      return state.counts[id] || 0;
    },
    bump(id, delta, target) {
      const next = Math.min(target, Math.max(0, (state.counts[id] || 0) + delta));
      if (next > 0) state.counts[id] = next;
      else delete state.counts[id];
      persist();
      return next;
    },
    snapshot() {
      return {
        format: EXPORT_FORMAT,
        version: 1,
        exportedAt: new Date().toISOString(),
        earned: [...state.earned],
        counts: { ...state.counts },
      };
    },
    merge(data) {
      let added = 0;
      for (const id of data.earned) {
        if (!state.earned.has(id)) {
          state.earned.add(id);
          added += 1;
        }
      }
      let counters = 0;
      for (const [key, value] of Object.entries(data.counts)) {
        const id = Number(key);
        if (value > (state.counts[id] || 0)) {
          state.counts[id] = value;
          counters += 1;
        }
      }
      persist();
      return { added, counters };
    },
    clear() {
      state = emptyState();
      persist();
    },
  };
}
