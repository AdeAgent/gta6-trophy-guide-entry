// exportImport.js — progress leaves and returns as a JSON file: a Blob download
// for export, and a validating parser for import that reports what merged.

import { EXPORT_FORMAT } from './store.js';

export function exportProgress(store) {
  const payload = JSON.stringify(store.snapshot(), null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'leonida-ledger-progress.json';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function parseImport(text, validIds) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.earned)) {
    throw new Error('That file does not look like a progress export (no earned list).');
  }
  if (data.format && data.format !== EXPORT_FORMAT) {
    throw new Error('That file was exported by a different tracker.');
  }
  const earned = [];
  let skipped = 0;
  for (const raw of data.earned) {
    const id = Number(raw);
    if (Number.isInteger(id) && validIds.has(id)) earned.push(id);
    else skipped += 1;
  }
  const counts = {};
  if (data.counts && typeof data.counts === 'object') {
    for (const [key, value] of Object.entries(data.counts)) {
      const id = Number(key);
      const num = Number(value);
      if (Number.isInteger(id) && validIds.has(id) && Number.isFinite(num) && num > 0) {
        counts[id] = num;
      }
    }
  }
  return { earned, counts, skipped };
}

export function mergeSummary(result, skipped) {
  const parts = [];
  parts.push(result.added > 0 ? `${result.added} newly earned` : 'no new trophies');
  if (result.counters > 0) parts.push(`${result.counters} counters raised`);
  if (skipped > 0) parts.push(`${skipped} unknown entries skipped`);
  return `Import merged: ${parts.join(' · ')}.`;
}
