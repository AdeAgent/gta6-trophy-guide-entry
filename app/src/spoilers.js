// spoilers.js — the spoiler rule: while the setting is on, a trophy that is a
// story trophy or hidden on PSN stays masked until the player has earned it.

export const MASKED_NAME = 'Hidden trophy — earn it to reveal its name';
export const MASKED_DESCRIPTION = 'Hidden on PlayStation until earned. Spoiler setting is on.';

export function isMasked(trophy, spoilersOn, store) {
  if (!spoilersOn) return false;
  if (store.isEarned(trophy.id)) return false;
  // The platinum is the goal of the whole guide and is publicly listed, so it
  // is never masked even though it completes with the story.
  if (trophy.grade === 'platinum') return false;
  return trophy.kind === 'story' || trophy.hiddenOnPsn === true;
}

export function displayName(trophy, spoilersOn, store) {
  return isMasked(trophy, spoilersOn, store) ? MASKED_NAME : trophy.name;
}

export function displayDescription(trophy, spoilersOn, store) {
  return isMasked(trophy, spoilersOn, store) ? MASKED_DESCRIPTION : trophy.description;
}
