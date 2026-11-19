// roadmap.js — the five-stage route to the platinum, the Chapter 1 callout and
// the save-slot plan, all built from the official descriptions and the cited
// roadmap facts (PowerPyx: 4/10, about 200 hours, one playthrough).

export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Play the story — Chapters 1 to 5',
    hours: '60–80 hours (PowerPyx)',
    text: 'The 12 story trophies below pop on their own as missions and chapters complete; none can be missed. While you play: keep a save at the start and end of each chapter, scan vehicles with the WAiNK app and study animals through binoculars whenever you see new ones, meditate with both characters, and take optional missions as they appear. Turn on progress notifications in the settings so nothing ticks by unseen.',
  },
  {
    n: 2,
    title: 'Side stories and early wins, as they unlock',
    hours: 'Inside the story hours',
    text: 'The character questlines open chapter by chapter: Kenton in Chapter 1, Billy and Bret after Coffee Break in Chapter 2, Andy, Randy and Tyrone in Chapter 3. Start each line when it appears rather than saving them all for the end, and bank the quick activity wins (an arcade game, Cal\'s fishing challenge, one of each activity type) along the way. The only real clock in the game is the Chapter 1 meditation in the callout above.',
  },
  {
    n: 3,
    title: 'The 100% checklist — the long gold',
    hours: 'About 100 hours (PowerPyx)',
    text: 'After the credits, open Progress, then Stats, then 100% Completion and work the list: every robbery, bank vault and gang operation in full, underwater discoveries, all 42 range golds, all 42 drone races, Bret\'s 15 Target Decks, plus the partial quotas (200 of 277 vehicles, 100 of 255 animals, 300 stunts, 70 of 80 challenges, 15 of 18 meditations). A Long Road is rated the hardest trophy on the list (PowerPyx), and nothing on the checklist can be missed.',
  },
  {
    n: 4,
    title: 'Strangers, secrets and the money cleanup',
    hours: 'About 10 hours (PowerPyx)',
    text: 'Finish 8 qualifying Strangers & Freaks strands (Kirk, Kyle, Yago and Pilot Pete count; the character questlines do not), mop up the hidden one-off trophies at the airport, the air station, the showroom and the bowling alley, let the 500 criminal-profile actions accumulate, and close out the money trophies: $250,000 laundered, $100,000 spent, 8 garages bought, 10 vehicles registered.',
  },
  {
    n: 5,
    title: 'Vice Got a Price! — the platinum',
    hours: 'Automatic',
    text: 'When the other 54 trophies are earned, the platinum unlocks on its own. If anything is still open, it is almost certainly a counter: check the count chips in the tracker (stunts, scans, challenges, profile actions) before hunting for a missing mission.',
  },
];

export const CHAPTER_ONE_CALLOUT = {
  title: 'Do before leaving Chapter 1',
  text: 'Meditate with Lucia on the balcony at Jason\'s house. After the Chapter 1 mission Down to Earth, talk to Lucia in the kitchen in the morning; she goes out to the balcony, so follow her and accept. That spot closes for good when Chapter 1 ends, and whether Positive Mental Attitude requires it is still unconfirmed — PowerPyx earned the trophy having done it, so do it. It is the only step in the game with a deadline.',
};

export const SAVE_PLAN = {
  title: 'Save-slot plan (15 manual slots + 1 autosave)',
  text: 'There is no mission replay and no New Game+, so your saves are the only way back. Keep one save at the start and one at the end of each of the five chapters (10 slots), then rotate the remaining five during the free-roam cleanup, exactly the layout PowerPyx recommends. Two more rules for the whole run: never enable cheats on a trophy save, because cheats disable trophies and saving (PowerPyx), and keep a clean save before any point of no return in the story.',
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function renderRoadmap(stagesEl, calloutEl, saveEl, trophies, store, onSelect) {
  calloutEl.innerHTML = `<div class="callout"><h3>${escapeHtml(CHAPTER_ONE_CALLOUT.title)}</h3><p>${escapeHtml(CHAPTER_ONE_CALLOUT.text)}</p></div>`;
  saveEl.innerHTML = `<div class="savePlan"><h3>${escapeHtml(SAVE_PLAN.title)}</h3><p>${escapeHtml(SAVE_PLAN.text)}</p></div>`;
  stagesEl.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.roadmapStage === stage.n);
    const done = members.filter((t) => store.isEarned(t.id)).length;
    const card = document.createElement('article');
    card.className = 'stageCard';
    const chips = members.map((t) => {
      const earned = store.isEarned(t.id);
      return `<button type="button" class="stageChip${earned ? ' earned' : ''}" data-trophy-id="${t.id}">${earned ? '✓ ' : ''}${escapeHtml(t.name)}</button>`;
    }).join('');
    card.innerHTML = `
      <div class="stageHead"><span class="stageNum">${stage.n}</span>
        <h3>${escapeHtml(stage.title)}</h3>
        <span class="stageMeta">${done}/${members.length} earned · ${escapeHtml(stage.hours)}</span></div>
      <p>${escapeHtml(stage.text)}</p>
      <div class="stageChips">${chips}</div>`;
    card.querySelectorAll('.stageChip').forEach((chip) => {
      chip.addEventListener('click', () => onSelect(Number(chip.dataset.trophyId)));
    });
    stagesEl.append(card);
  }
}
