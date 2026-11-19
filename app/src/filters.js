// filters.js — the kind chips and the predicate every trophy row is tested
// against: kind, grade, earned state and the search text.

export const KIND_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'crime', label: 'Crime' },
  { id: 'money', label: 'Money' },
  { id: 'exploration', label: 'Exploration' },
  { id: 'online', label: 'Online', disabled: true, note: '0 online trophies in GTA VI' },
];

export function countForKind(trophies, kindId) {
  if (kindId === 'all') return trophies.length;
  if (kindId === 'missable') return trophies.filter((t) => t.missable).length;
  if (kindId === 'online') return 0;
  return trophies.filter((t) => t.kind === kindId).length;
}

export function matchesFilters(trophy, filters, store) {
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.earned === 'earned' && !store.isEarned(trophy.id)) return false;
  if (filters.earned === 'unearned' && store.isEarned(trophy.id)) return false;
  if (filters.query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.query)) return false;
  }
  return true;
}
