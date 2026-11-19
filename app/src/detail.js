// detail.js — the guide pane beside the checklist: official description in a
// quote box, our guide, numbered steps, the missable warning, a saved counter
// for counted trophies, and the numbered, linked sources behind the guide.

import { displayDescription, displayName, isMasked } from './spoilers.js';

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function gradeBadge(grade) {
  return `<span class="gradeBadge grade-${grade}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12v3h3v2c0 3-2.2 5.4-5.1 5.9A6 6 0 0 1 13 16.9V19h3v3H8v-3h3v-2.1A6 6 0 0 1 8.1 12.9C5.2 12.4 3 10 3 7V5h3V2zm-1 5c.3 1.7 1.4 3 3 3.6V7H5zm14 0h-3v3.6c1.6-.6 2.7-1.9 3-3.6z"/></svg>${GRADE_LABELS[grade]}</span>`;
}

export function renderDetail(pane, trophy, store, spoilersOn, handlers) {
  const masked = isMasked(trophy, spoilersOn, store);
  const earned = store.isEarned(trophy.id);
  const steps = (trophy.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('');
  const sources = (trophy.sources || []).map((source, i) => `
    <li class="sourceItem">
      <span class="sourceNum">${i + 1}</span>
      <div><strong>${escapeHtml(source.site)}</strong> — <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.title)}</a><br>
      <span class="sourceMeta">Read ${escapeHtml(source.accessed)} · backs: ${escapeHtml(source.supports)}</span></div>
    </li>`).join('');
  const counter = trophy.count ? `
    <div class="counterBox">
      <span class="counterLabel">Your progress: <strong id="counterValue">${store.getCount(trophy.id)} / ${trophy.count.target}</strong> ${escapeHtml(trophy.count.label)}</span>
      <span class="counterButtons">
        <button type="button" id="counterMinus" aria-label="Decrease counter">−</button>
        <button type="button" id="counterPlus" aria-label="Increase counter">+</button>
      </span>
    </div>` : '';
  const missable = trophy.missable ? `
    <div class="missableWarning"><strong>Possibly missable.</strong> ${escapeHtml((trophy.missableNote || '').replace(/^Possibly missable:\s*/, ''))}</div>` : '';
  const guideBody = masked
    ? '<p class="maskedNote">Spoiler setting is on and this trophy is still unearned, so its name and description stay hidden here too. Its guide appears once you earn it or turn spoilers off.</p>'
    : `<p>${escapeHtml(trophy.guide)}</p>${steps ? `<h4>Steps</h4><ol class="stepList">${steps}</ol>` : ''}`;

  pane.innerHTML = `
    <div class="detailHead">
      ${gradeBadge(trophy.grade)}
      ${trophy.hiddenOnPsn ? '<span class="flagHidden">HIDDEN ON PSN</span>' : ''}
      ${trophy.missable ? '<span class="flagMissable">POSSIBLY MISSABLE</span>' : ''}
      <span class="flagStage">Roadmap stage ${trophy.roadmapStage}</span>
      <label class="earnedToggle"><input type="checkbox" id="detailEarned" ${earned ? 'checked' : ''}> Earned</label>
    </div>
    <h3 class="detailName">${escapeHtml(displayName(trophy, spoilersOn, store))}</h3>
    <blockquote class="officialQuote">“${escapeHtml(displayDescription(trophy, spoilersOn, store))}”<cite> — official PlayStation description</cite></blockquote>
    ${missable}
    <div class="detailCols">
      <div class="detailMain">
        <h4>Guide — in our own words</h4>
        ${guideBody}
      </div>
      <div class="detailSide">
        ${counter}
        <h4>Sources</h4>
        <ol class="sourceList">${sources}</ol>
      </div>
    </div>`;

  pane.querySelector('#detailEarned').addEventListener('change', () => handlers.onToggleEarned(trophy.id));
  if (trophy.count) {
    pane.querySelector('#counterPlus').addEventListener('click', () => handlers.onBump(trophy.id, 1));
    pane.querySelector('#counterMinus').addEventListener('click', () => handlers.onBump(trophy.id, -1));
  }
}
