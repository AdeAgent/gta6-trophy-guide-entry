// missables.js — the Missables view: the one possibly-missable trophy in full,
// an honest watch list, and the notes that keep both from overstating the risk.

export const WATCH_ITEMS = [
  {
    title: 'This Was No Boat Accident — Kenton\'s long pause',
    label: 'Not missable · delayed',
    confidence: 'Confirmed by PowerPyx',
    text: 'Kenton becomes temporarily unavailable after Chapter 1 and comes back in Chapter 2–3, when he texts Jason. His treasure line can always be finished, so treat the gap as a pause, not a loss.',
  },
  {
    title: 'Stranger strands and optional missions',
    label: 'Not missable',
    confidence: 'Confirmed by PowerPyx',
    text: 'Some optional missions disappear after a while and some quest givers go quiet during the story, but every trophy-related quest giver is available again after the story in free roam. The disappearing optional content does not affect trophies or 100% completion.',
  },
  {
    title: 'Actions Speak Louder — the Irredeemable profile',
    label: 'Permanent · avoid',
    confidence: 'Confirmed by PowerPyx',
    text: 'The trophy counts 500 criminal-profile actions of any kind, but the Irredeemable profile at the violent end is a permanent status: police stay more aggressive for the rest of the run. Earn the counter through ordinary robberies and fights instead of cop-killing sprees.',
  },
  {
    title: 'Four secret trophies are still unsolved',
    label: 'Unconfirmed',
    confidence: 'Stated openly by PowerPyx',
    text: 'In The Beginning…, Bad Luck, I Guess, The Truth Is Out There and Ten Pin have no verified method yet. Their guides in this app say exactly that, with the sources\' current theories labelled as theories.',
  },
];

export const HONESTY_NOTES = [
  'Only one trophy, Positive Mental Attitude, is flagged as possibly missable, and the flag itself is unconfirmed: the Chapter 1 spot may not even be required. Both PowerPyx and GTABase carry the same warning, and both say everything else can be done after the story.',
  'A signup here would be easy — plenty of guides pad their missables page. Ours stays at one real risk, three watch items and four admitted unknowns, because that is what the sources support.',
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function renderMissables(featureEl, watchEl, notesEl, trophies, store, onSelect) {
  const trophy = trophies.find((t) => t.missable);
  if (trophy) {
    const earned = store.isEarned(trophy.id);
    featureEl.innerHTML = `
      <article class="missableCard">
        <div class="missableHead">
          <span class="flagMissable">POSSIBLY MISSABLE</span>
          <h3>${escapeHtml(trophy.name)}</h3>
          <span class="missableState">${earned ? '✓ Earned' : 'Not earned yet'}</span>
        </div>
        <p class="officialDesc">“${escapeHtml(trophy.description)}”</p>
        <p class="missableNote">${escapeHtml(trophy.missableNote || '')}</p>
        <p>${escapeHtml(trophy.guide)}</p>
        <button type="button" class="openInTracker" data-trophy-id="${trophy.id}">Open in the tracker</button>
      </article>`;
    featureEl.querySelector('.openInTracker').addEventListener('click', () => onSelect(trophy.id));
  }
  watchEl.innerHTML = '';
  for (const item of WATCH_ITEMS) {
    const card = document.createElement('article');
    card.className = 'watchCard';
    card.innerHTML = `
      <div class="watchHead"><h4>${escapeHtml(item.title)}</h4><span class="watchLabel">${escapeHtml(item.label)}</span></div>
      <p>${escapeHtml(item.text)}</p>
      <p class="confidence">${escapeHtml(item.confidence)}</p>`;
    watchEl.append(card);
  }
  notesEl.innerHTML = HONESTY_NOTES.map((note) => `<p class="honestyNote">${escapeHtml(note)}</p>`).join('');
}
