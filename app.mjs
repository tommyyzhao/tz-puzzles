import { panels, edges, panelStep } from './panel.mjs';
import { cases, records, address, causeLabels, gateOpens, visualEvidence, archiveStep } from './archive.mjs';
import { benches, commands, benchInitial, benchStep, benchEdit } from './bench.mjs';
import { history } from './history.mjs';
import { icon, token, portrait, placePicture, clock, gateScene, machine, puzzleMark, tilesBoard, pocketBoard, driftBoard } from './visuals.mjs';
import { tilesStep, tilesWon, tileRules } from './tiles.mjs';
import { pocketStep, pocketWon, pocketEntry, pocketDestination } from './pocket.mjs';
import { driftStep, driftWon } from './drift.mjs';
import { spokeRound, spokesInitial, spokesNext, spokesStep, spokesWon } from './spokes.mjs';
import { spokesBoard } from './visuals.mjs';
import { stations, playableStations, parseRoute, routeKey, routeURL, snapshots } from './session.mjs';

const app = document.querySelector('#app'), dialog = document.querySelector('#help-dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let storage;
try { storage = window.sessionStorage; } catch { storage = null; }
const saved = snapshots(storage), sessions = new Map();
let canSave = saved.available();
let route = parseRoute(location.search), current, refreshView = () => {}, timer = null, steps = 0, lastOpener;
const spatial = { tiles: { step: tilesStep, won: tilesWon }, pocket: { step: pocketStep, won: pocketWon }, drift: { step: driftStep, won: driftWon } };
const el = (tag, text = null, attrs = {}) => {
  const node = document.createElement(tag);
  if (text !== null) node.textContent = text;
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
};
const append = (parent, ...children) => { parent.append(...children); return parent; };
function button(label, id, action, className = '', picture = null) {
  const node = el('button', null, { type: 'button', id, class: className });
  if (picture) { picture.setAttribute('aria-hidden', 'true'); node.append(picture); }
  node.append(el('span', label)); node.addEventListener('click', action); return node;
}
function tool(label, id, action, glyph) { return button(label, id, action, 'tool-button', icon(glyph)); }
function figure(picture, caption, className = '') { return append(el('figure', null, { class: className }), picture, el('figcaption', caption)); }
function section(title, className = '') { return append(el('section', null, { class: className, 'aria-label': title }), el('h3', title)); }
function link(label, target, className = '') {
  const node = el('a', label, { href: routeURL(target), class: className });
  node.addEventListener('click', event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) { event.preventDefault(); navigate(target); } });
  return node;
}
function stop() { if (timer !== null) clearTimeout(timer); timer = null; }
function getSession(r) {
  const key = routeKey(r);
  if (!sessions.has(key)) {
    const config = stations[r.station], level = config.levels[r.encounter];
    const state = saved.load(r) ?? config.initial(level);
    sessions.set(key, { history: history(state), slot: 0, tab: 'scene', record: 'receipt', frame: 0, message: '', query: r.station === 'archive' ? { person: level.people[0], place: level.places[0], time: level.times[0] } : null });
  }
  const session = sessions.get(key);
  if (r.station === 'spokes' && r.encounter === 1) {
    const next = spokesNext(getSession({ ...r, encounter: 0 }).history.state, session.history.state);
    if (!next) return null;
    if (next !== session.history.state) { session.history = history(next); session.message = ''; saved.save(r, next); }
  }
  return session;
}
function won(r, state) {
  if (r.station === 'spokes') return spokesWon(stations.spokes.levels[r.encounter], state);
  if (spatial[r.station]) return spatial[r.station].won(stations[r.station].levels[r.encounter], state, r.condition);
  if (r.station === 'panel') return state.feedback === 'Accepted.';
  if (r.station === 'bench') return state.produced >= benches[r.encounter].quota;
  return state.feedback === 'Report supported by the available evidence.';
}
function status(message, type = '') {
  const node = document.querySelector('#feedback');
  if (!node) return;
  node.textContent = message; node.dataset.tone = type;
}
function persist() {
  if (!route.study && !saved.save(route, current.history.state)) {
    canSave = false;
    document.querySelector('#privacy').textContent = 'Saving unavailable · progress kept in memory. Nothing sent.';
  }
}
function update(next, message = '') {
  stop(); current.history.apply(next); current.message = message; persist(); refresh();
}
function refresh() {
  const focused = document.activeElement, focusId = focused?.id;
  refreshView();
  if (focusId && !focused.isConnected) document.getElementById(focusId)?.focus({ preventScroll: true });
  else if (focused?.id === 'enter-room' && focused.hidden) document.querySelector('#move-up')?.focus({ preventScroll: true });
  const s = current.history.state, complete = won(route, s);
  if (route.station === 'spokes' && route.encounter === 0) document.querySelector('#encounter-1').disabled = !complete;
  document.querySelector('#undo').disabled = !current.history.canUndo;
  document.querySelector('#redo').disabled = !current.history.canRedo;
  const result = document.querySelector('#completion');
  result.hidden = !complete;
  document.querySelector('#workspace').classList.toggle('is-solved', complete);
  const message = complete ? 'Nicely done. Take a moment, or try the next one.' : current.message || s.feedback || (route.station === 'bench' ? s.error || (timer !== null ? 'Running…' : '') : '');
  status(message, complete ? 'success' : s.error || message === 'Blocked.' || message.includes('Not accepted') ? 'notice' : '');
}
function navigate(next, replace = false) {
  stop(); dialog.close(); route = next;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', routeURL(route));
  build(); document.querySelector('#page-title')?.focus({ preventScroll: true }); window.scrollTo(0, 0);
}
function undo() { stop(); current.history.undo(); current.message = 'Move undone.'; persist(); refresh(); }
function redo() { stop(); current.history.redo(); current.message = 'Move restored.'; persist(); refresh(); }
function restart() {
  const level = stations[route.station].levels[route.encounter];
  update(route.station === 'spokes' ? spokesInitial(level, current.history.state.firstAnswer) : stations[route.station].initial(level), 'Started fresh. Undo brings your previous state back.');
}

function partitionBoard(p, walls, interactive = false) {
  const board = el('div', null, { class: 'partition-board', role: interactive ? 'group' : 'img', 'aria-label': interactive ? 'Partition board' : `${p.cells.map(x => x === 'A' ? 'circle' : x === 'B' ? 'diamond' : 'empty').join(', ')}; ${walls.length ? 'separated by barriers' : 'no barriers'}` });
  board.style.setProperty('--columns', p.width); board.style.setProperty('--rows', p.height);
  board.style.aspectRatio = `${p.width}/${p.height}`;
  p.cells.forEach((symbol, i) => {
    const picture = token(symbol); picture.setAttribute('aria-label', `Row ${Math.floor(i / p.width) + 1}, column ${i % p.width + 1}: ${symbol === 'A' ? 'circle' : symbol === 'B' ? 'diamond' : 'empty'}`);
    board.append(append(el('div', null, { class: 'panel-cell' }), picture));
  });
  edges(p).forEach(([a, b], i) => {
    const vertical = b === a + 1, row = Math.floor(a / p.width), col = a % p.width;
    const label = `Divider between row ${row + 1} column ${col + 1} and row ${Math.floor(b / p.width) + 1} column ${b % p.width + 1}`;
    const edge = interactive ? button('', `edge-${i}`, () => update(panelStep(p, current.history.state, { type: 'toggle', edge: i })), `panel-edge ${vertical ? 'vertical' : 'horizontal'}`) : el('span', null, { class: `panel-edge ${vertical ? 'vertical' : 'horizontal'}` });
    edge.setAttribute('aria-label', label); edge.setAttribute('aria-pressed', String(walls.includes(i)));
    edge.style.left = `${(col + (vertical ? 1 : .5)) / p.width * 100}%`;
    edge.style.top = `${(row + (vertical ? .5 : 1)) / p.height * 100}%`;
    if (!interactive) edge.setAttribute('aria-hidden', 'true');
    board.append(edge);
  });
  return board;
}
function preview(id) {
  const level = stations[id].levels[0], state = stations[id].initial(level);
  if (id === 'spokes') return spokesBoard(level);
  if (id === 'panel') return partitionBoard({ width: 3, height: 2, cells: ['A', 'B', 'A', 'A', 'B', 'A'] }, [0, 2, 5]);
  if (id === 'archive') return gateScene({ worker: true, title: '' });
  if (id === 'bench') return machine(level, state);
  if (id === 'tiles') return tilesBoard(level, state, tileRules(level, state));
  if (id === 'pocket') return pocketBoard(level, state, 'yard');
  return driftBoard(level, state);
}
function collection() {
  document.title = 'Small encounters · A puzzle collection';
  const intro = append(el('section', null, { class: 'collection-intro' }), el('p', 'THE COLLECTION', { class: 'eyebrow' }), el('h1', 'Small worlds.\nUnexpected possibilities.', { id: 'page-title', tabindex: '-1' }), el('p', 'Six quiet invitations to look closer, try something, and think a little differently.', { class: 'collection-copy' }));
  const feature = el('a', null, { href: './goldenhills/', class: 'journey-feature', 'aria-label': 'Play Golden Hills. Dry hills, and a small stone box.' });
  const featureCopy = append(el('div'), el('p', 'A NEW JOURNEY', { class: 'eyebrow' }), el('h2', 'Golden Hills'), el('p', 'Dry hills, and a small stone box.'), el('span', 'Begin ↗', { class: 'journey-cta' }));
  const featureArt = el('div', null, { class: 'journey-preview', 'aria-hidden': 'true' });
  for (let i = 0; i < 9; i++) featureArt.append(el('i', null, { class: i === 4 ? 'spring' : i === 2 ? 'plant' : '' }));
  feature.append(featureCopy, featureArt);
  app.append(intro, feature);
  const grid = el('div', null, { class: 'collection-grid' });
  playableStations.forEach(([id, config], index) => {
    const target = { station: id, encounter: 0, condition: 'full', study: route.study };
    const card = link('', target, `collection-card card-${id}`);
    card.setAttribute('aria-label', `Play ${config.title}. ${config.subtitle} ${config.levels.length} levels.`);
    const art = append(el('div', null, { class: 'card-art', 'aria-hidden': 'true' }), preview(id));
    const solved = config.levels.filter((_, i) => { const r = { ...target, encounter: i }; const s = id === 'spokes' ? getSession(r)?.history.state : sessions.get(routeKey(r))?.history.state ?? saved.load(r); return s && won(r, s); }).length;
    const meta = append(el('div', null, { class: 'card-meta' }), el('span', `0${index + 1}`, { class: 'card-number' }), el('span', solved ? `${solved} / ${config.levels.length} complete` : `${config.levels.length} levels`));
    const heading = append(el('div', null, { class: 'card-title' }), el('h2', config.title), icon('right'));
    card.append(art, meta, heading, el('p', config.subtitle)); grid.append(card);
  });
  app.append(grid, el('p', 'No timers. No scores to chase. Just you and the next idea.', { class: 'collection-note' }));
}
function build() {
  app.replaceChildren(); document.body.dataset.view = route.station ? 'play' : 'collection';
  document.querySelector('#privacy').textContent = route.study ? 'Study session · nothing saved.' : canSave ? 'Progress saved in this tab. Nothing sent.' : 'Private, in-memory play. Nothing sent.';
  if (!route.station) { collection(); return; }
  current = getSession(route);
  if (!current) { navigate({ ...route, encounter: 0 }, true); return; }
  const config = stations[route.station];
  document.title = `${config.title} · Level ${route.encounter + 1} · Small encounters`;
  const bar = el('div', null, { class: 'play-topbar' });
  const back = link('Collection', { station: null, encounter: 0, condition: 'full', study: route.study }, 'back-link'); const backIcon = icon('left'); backIcon.setAttribute('aria-hidden', 'true'); back.prepend(backIcon);
  const switcher = el('select', null, { id: 'station-switcher', 'aria-label': 'Choose puzzle' });
  for (const [id, data] of playableStations) { const option = el('option', data.title, { value: id }); option.selected = id === route.station; switcher.append(option); }
  switcher.addEventListener('change', () => navigate({ station: switcher.value, encounter: 0, condition: 'full', study: route.study }));
  bar.append(back, switcher, tool('How to play', 'help', openHelp, 'help')); app.append(bar);
  const heading = el('div', null, { class: 'play-heading' });
  heading.append(append(el('div'), el('h1', config.title, { id: 'page-title', tabindex: '-1' }), el('p', config.task, { class: 'task' })));
  const levels = el('div', null, { class: 'level-picker' });
  levels.append(el('span', `Level ${route.encounter + 1} of ${config.levels.length}`, { class: 'level-caption' }));
  config.levels.forEach((_, i) => levels.append(button(String(i + 1), `encounter-${i}`, () => navigate({ ...route, encounter: i }), i === route.encounter ? 'level selected' : 'level')));
  [...levels.querySelectorAll('button')].forEach((n, i) => { n.setAttribute('aria-label', `Level ${i + 1}`); if (i === route.encounter) n.setAttribute('aria-current', 'step'); });
  heading.append(levels); app.append(heading);
  if (route.condition !== 'full' && !route.study) app.append(el('p', `Comparison version · ${route.condition}`, { class: 'condition-label' }));
  const workspace = el('div', null, { id: 'workspace', class: `workspace workspace-${route.station}` }); app.append(workspace);
  refreshView = ({ panel: buildPanel, archive: buildArchive, bench: buildBench, tiles: buildSpatial, pocket: buildSpatial, drift: buildSpatial, spokes: buildSpokes })[route.station](workspace);
  const dock = el('div', null, { class: 'action-dock' });
  const recovery = append(el('div', null, { class: 'recovery' }), tool('Undo', 'undo', undo, 'undo'), tool('Redo', 'redo', redo, 'redo'), tool('Restart', 'reset', restart, 'restart'));
  dock.append(recovery, el('p', '', { id: 'feedback', class: 'feedback', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' }));
  (route.station === 'archive' ? app : workspace.firstElementChild).append(dock);
  const complete = append(el('section', null, { id: 'completion', class: 'completion', 'aria-label': 'Level complete' }), append(el('div'), el('span', '✓', { class: 'success-mark', 'aria-hidden': 'true' }), el('h2', 'A little discovery.')));
  const next = route.encounter + 1 < config.levels.length ? { ...route, encounter: route.encounter + 1 } : { station: null, encounter: 0, condition: 'full', study: route.study };
  complete.append(link(next.station ? 'Next level' : 'Back to collection', next, 'primary-link'), button('Play again', 'replay', restart, 'quiet-button')); app.append(complete);
  refresh();
}

function buildSpokes(root) {
  const level = spokeRound(stations.spokes.levels[route.encounter], current.history.state.firstAnswer);
  const stage = el('section', null, { class: 'spokes-stage' }), art = el('div', null, { class: 'spokes-art' });
  const form = el('form', null, { class: 'spokes-form' }), input = el('input', null, { id: 'spoke-answer', type: 'text', inputmode: 'numeric', pattern: '[0-9]{1,4}', maxlength: '4', autocomplete: 'off', 'aria-describedby': 'feedback' });
  input.value = current.history.state.answer;
  input.addEventListener('input', () => {
    const next = spokesStep(level, current.history.state, { type: 'draft', answer: input.value });
    update(next); input.value = current.history.state.answer;
  });
  const submit = el('button', 'Check number', { type: 'submit', class: 'primary-button', id: 'submit-spokes' });
  form.append(append(el('label', 'Missing number', { for: 'spoke-answer' }), input), submit);
  form.addEventListener('submit', event => { event.preventDefault(); update(spokesStep(level, current.history.state, { type: 'submit' })); });
  const explanation = el('div', null, { class: 'spokes-explanation' });
  stage.append(art, form, explanation); root.append(stage);
  const rail = section('A small observation', 'support-rail');
  rail.append(el('p', level.direction ? 'Same numbers. Now follow the arrows. What belongs in the empty place?' : 'Seven numbers. One empty place. What connects them?', { class: 'instruction' }), el('p', 'There’s no timer. Try a number when you have a pattern in mind.', { class: 'caption' }));
  if (route.condition === 'paired') {
    const pairs = el('div', null, { class: 'spoke-pairs', 'aria-label': 'Opposite pairs' });
    level.values.slice(0, 4).forEach((n, i) => pairs.append(el('p', level.direction < 0 ? `${level.values[i + 4]} → ${n ?? '?'}` : `${n} ${level.direction ? '→' : '↔'} ${level.values[i + 4] ?? '?'}`)));
    rail.append(el('h3', 'Opposite pairs'), pairs);
  }
  root.append(rail);
  let wasComplete = false;
  return () => {
    const s = current.history.state, complete = spokesWon(level, s);
    art.replaceChildren(spokesBoard(level, complete ? s.answer : ''));
    if (input.value !== s.answer) input.value = s.answer;
    if (wasComplete !== complete) {
      explanation.replaceChildren();
      if (complete && level.direction) {
        const details = append(el('details'), el('summary', 'See the intended pattern'));
        details.append(el('p', level.direction > 0 ? 'Following the arrows, multiply by 2, 3, 4, then 5.' : 'Following the arrows, divide by 2, 3, 4, then 5.'), ...[5, 6, 7, 8].map((n, i) => el('p', level.direction > 0 ? `${n} × ${i + 2} = ${n * (i + 2)}` : `${n * (i + 2)} ÷ ${i + 2} = ${n}`)), el('p', 'Direction selects the intended relationship. Finite number patterns can still admit other explanations.'));
        explanation.append(details);
      }
    }
    wasComplete = complete;
  };
}

function buildPanel(root) {
  const p = panels[route.encounter], board = partitionBoard(p, current.history.state.walls, true);
  const stage = append(el('section', null, { class: 'board-stage' }), board);
  const bottom = el('div', null, { class: 'panel-bottom' }), count = el('span', '', { id: 'barriers', class: 'caption' });
  bottom.append(count, button('Check partition', 'submit-panel', () => update(panelStep(p, current.history.state, { type: 'submit' })), 'primary-button'));
  stage.append(bottom); root.append(stage);
  const rail = section('A place to start', 'support-rail');
  rail.append(el('p', 'Tap a seam to place a barrier. Tap again to remove it.', { class: 'instruction' }));
  const examples = el('div', null, { class: 'panel-examples' });
  examples.append(figure(partitionBoard({ width: 2, height: 1, cells: ['A', 'B'] }, [0]), 'Accepted'), figure(partitionBoard({ width: 2, height: 1, cells: ['A', 'B'] }, []), 'Not accepted'));
  rail.append(examples);
  if (route.condition === 'given') rail.append(el('p', 'No region may mix circles and diamonds. Matching shapes may be separate. Empty regions are allowed.'));
  root.append(rail);
  return () => {
    const s = current.history.state;
    board.querySelectorAll('button.panel-edge').forEach((node, i) => node.setAttribute('aria-pressed', String(s.walls.includes(i))));
    count.textContent = `${p.budget - s.walls.length} of ${p.budget} barriers available`;
  };
}

function play() {
  if (timer !== null) { stop(); refresh(); return; }
  const b = benches[route.encounter];
  if (current.history.state.error || won(route, current.history.state)) return;
  steps = 0; const key = routeKey(route);
  const tick = () => {
    if (key !== routeKey(route)) { stop(); return; }
    current.history.apply(benchStep(b, current.history.state, route.condition)); steps++;
    if (current.history.state.error || won(route, current.history.state) || steps >= 60) stop();
    else timer = setTimeout(tick, reducedMotion.matches ? 650 : 420);
    current.message = ''; persist(); refresh();
  };
  timer = setTimeout(tick, 0); refresh();
}
function buildBench(root) {
  const b = benches[route.encounter];
  const bench = el('section', null, { class: 'workbench' });
  const art = el('div', null, { class: 'machine-art' }), count = el('p', '', { id: 'machine-count', class: 'caption' });
  bench.append(art, count);
  const tape = el('div', null, { class: 'tape', 'aria-label': 'Instruction loop' });
  for (let i = 0; i < b.slots; i++) {
    const slot = button('', `slot-${i}`, () => { stop(); current.slot = i; refresh(); }, 'tape-slot');
    slot.setAttribute('aria-label', `Edit slot ${i + 1}`);
    slot.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (i + 1) % b.slots : event.key === 'ArrowLeft' ? (i + b.slots - 1) % b.slots : event.key === 'Home' ? 0 : event.key === 'End' ? b.slots - 1 : null;
      if (next !== null) { event.preventDefault(); stop(); current.slot = next; refresh(); document.querySelector(`#slot-${next}`).focus(); }
    });
    tape.append(slot);
  }
  bench.append(tape, el('p', 'Choose a slot, then a command. The last slot loops back to the first.', { class: 'tape-caption' }));
  const palette = el('div', null, { class: 'command-palette', 'aria-label': 'Commands' });
  for (const command of commands) palette.append(button(command, `command-${command}`, () => update(benchEdit(b, current.history.state, current.slot, command)), 'command-button', icon(command)));
  bench.append(palette);
  const playback = append(el('div', null, { class: 'playback' }), tool('Step', 'step', () => update(benchStep(b, current.history.state, route.condition)), 'step'), button('Run', 'run', play, 'primary-button', icon('run')), tool('Rewind', 'rewind', () => update(benchInitial(b, current.history.state.tape), 'Execution rewound. Your program is unchanged.'), 'rewind'));
  bench.append(playback);
  if (route.condition === 'return') bench.append(el('p', 'Return fixture: the arm returns to source after each loop.', { class: 'caption' }));
  root.append(bench);
  const aside = section('Your workbench', 'support-rail');
  aside.append(el('p', 'One arm. An endless supply. A loop of your own making.'), el('p', 'Take at the source. Drop at the output. Left and right move one position. Wait stays still.', { class: 'instruction' }), el('p', 'Editing restarts execution. You can pause, rewind, or undo at any point.', { class: 'caption' })); root.append(aside);
  return () => {
    const s = current.history.state; art.replaceChildren(machine(b, s, route.condition === 'return'));
    count.textContent = `${s.produced} / ${b.quota} delivered · ${s.holding ? 'Carrying a crate' : 'Arm empty'} · Step ${s.ticks}`;
    [...tape.children].forEach((node, i) => {
      if (node.dataset.command !== s.tape[i]) { node.replaceChildren(el('span', String(i + 1), { class: 'slot-number' }), icon(s.tape[i]), el('span', s.tape[i], { class: 'slot-label' })); node.dataset.command = s.tape[i]; }
      node.setAttribute('aria-label', `Slot ${i + 1}: ${s.tape[i]}`); node.setAttribute('aria-pressed', String(current.slot === i));
      const executing = s.ticks > 0 && s.pc === i && !s.error && !won(route, s);
      node.classList.toggle('executing', executing);
      if (executing) node.setAttribute('aria-current', 'step'); else node.removeAttribute('aria-current');
    });
    palette.querySelectorAll('button').forEach(n => n.setAttribute('aria-pressed', String(n.id === `command-${s.tape[current.slot]}`)));
    document.querySelector('#run span').textContent = timer !== null ? 'Pause' : 'Run';
    document.querySelector('#run').setAttribute('aria-label', timer !== null ? 'Pause' : 'Run');
    const playIcon = icon(timer !== null ? 'wait' : 'run'); playIcon.setAttribute('aria-hidden', 'true'); document.querySelector('#run svg').replaceWith(playIcon);
    document.querySelector('#run').disabled = Boolean(s.error || won(route, s));
    document.querySelector('#step').disabled = Boolean(s.error || won(route, s));
  };
}

function move(action) {
  const next = spatial[route.station].step(stations[route.station].levels[route.encounter], current.history.state, action, route.condition);
  if (next === current.history.state && !won(route, next)) { current.message = 'That move is blocked. Try another direction, or undo.'; status(current.message, 'notice'); return; }
  update(next);
}
function directionPad() {
  const pad = el('div', null, { class: 'direction-pad', role: 'group', 'aria-label': 'Move' });
  for (const direction of ['up', 'left', 'down', 'right']) {
    const node = button('', `move-${direction}`, () => move(direction), `direction ${direction}`, icon(direction)); node.setAttribute('aria-label', `Move ${direction}`); node.title = `Move ${direction}`; pad.append(node);
  }
  return pad;
}
function buildSpatial(root) {
  const id = route.station, l = stations[id].levels[route.encounter];
  const stage = el('section', null, { class: `spatial-stage ${id}-stage`, tabindex: '0', 'aria-label': `${stations[id].title} play area. Arrow keys or W A S D to move.` });
  const art = el('div', null, { class: 'spatial-art' }), context = el('div', null, { class: 'board-context' }); stage.append(context, art);
  const overview = el('div', null, { class: 'room-overview' }); if (id === 'pocket') stage.append(overview);
  const input = el('div', null, { class: 'spatial-input' }); input.append(directionPad());
  const enter = button('Enter room', 'enter-room', () => { const directions = ['up', 'right', 'down', 'left'].filter(d => pocketEntry(l, current.history.state, d)); if (directions.length === 1) move(`enter-${directions[0]}`); }, 'secondary-button', icon('enter'));
  const alternatives = el('div', null, { class: 'entry-options' });
  if (id === 'pocket') input.append(enter, alternatives);
  input.append(el('span', 'Arrow keys or WASD', { class: 'keyboard-hint' })); stage.append(input); root.append(stage);
  const rail = section(id === 'tiles' ? 'In this world' : id === 'pocket' ? 'Keep your bearings' : 'On the ground', 'support-rail');
  const details = el('div', null, { class: 'state-guide' }); rail.append(details);
  if (id === 'tiles') rail.append(el('p', 'Push loose tiles. Rivets mean a tile stays put. Read a line left-to-right or top-to-bottom.', { class: 'instruction' }));
  if (id === 'pocket') rail.append(el('p', 'Move to push a room. Use Enter beside an opening. Walk through an open edge to come out again.', { class: 'instruction' }));
  if (id === 'drift') rail.append(el('p', route.condition === 'fixed' ? 'Fixed-size fixture: snow disappears, but sizes stay unchanged.' : 'Rolling across snow grows a ball by one size, up to 3. Walking leaves snow untouched.', { class: 'instruction' }));
  rail.append(button('Board description', 'description', openDescription, 'text-button')); root.append(rail);
  return () => {
    const s = current.history.state;
    if (id === 'tiles') {
      const laws = tileRules(l, s, route.condition); art.replaceChildren(tilesBoard(l, s, laws));
      context.textContent = 'Find a goal object'; details.replaceChildren();
      if (route.condition === 'preset') details.append(el('p', 'Preset laws · tile movement does not change them.', { class: 'caption' }));
      for (const [subject, property] of laws) {
        const row = el('div', null, { class: 'law', role: 'img', 'aria-label': `${subject} is ${property}` });
        for (const word of [subject, 'is', property]) { const mark = puzzleMark(word); mark.setAttribute('aria-hidden', 'true'); row.append(mark); }
        row.append(el('span', `${subject} is ${property}`)); details.append(row);
      }
      if (!laws.length) details.append(el('p', 'No active laws.', { class: 'caption' }));
    } else if (id === 'pocket') {
      const forecasts = pocketForecasts(l, s); const active = s.player.room;
      context.replaceChildren(el('span', 'YOU ARE IN', { class: 'eyebrow' }), el('strong', active === 'yard' ? 'The yard' : `Room ${active}`));
      art.replaceChildren(pocketBoard(l, s, active, forecasts)); overview.replaceChildren();
      for (const room of Object.keys(l.rooms).filter(r => r !== active)) {
        const label = room === 'yard' ? 'Yard' : `Room ${room}`;
        const inspect = button(label, `inspect-${room}`, () => showDialog(label, [pocketBoard(l, current.history.state, room, pocketForecasts(l, current.history.state))]), 'room-preview', pocketBoard(l, s, room, forecasts));
        inspect.setAttribute('aria-label', `Inspect ${label}`); overview.append(inspect);
      }
      const choices = ['up', 'right', 'down', 'left'].filter(d => pocketEntry(l, s, d));
      enter.hidden = choices.length !== 1; alternatives.replaceChildren();
      if (choices.length === 1) { const entry = pocketEntry(l, s, choices[0]); enter.querySelector('span').textContent = `Enter room ${entry.room}`; enter.dataset.direction = choices[0]; }
      if (choices.length > 1) choices.forEach(d => alternatives.append(button(`Enter ${d}`, `enter-${d}`, () => move(`enter-${d}`), 'secondary-button')));
      details.replaceChildren(el('p', `Crate: ${s.cargo.room === 'yard' ? 'in the yard' : `in room ${s.cargo.room}`}. Goal: in the yard.`));
      for (const box of s.boxes) details.append(el('p', `Room ${box.id} is inside ${box.room === 'yard' ? 'the yard' : `room ${box.room}`}.`, { class: 'caption' }));
      if (route.condition === 'forecast') details.append(el('p', 'Dashed cells forecast exits. Occupancy can still block them.', { class: 'caption' }));
    } else {
      art.replaceChildren(driftBoard(l, s)); context.textContent = 'Match the rings · 1 and 3';
      details.replaceChildren();
      const legend = el('div', null, { class: 'drift-legend' }); legend.append(figure(puzzleMark('snow'), 'Fresh snow'), figure(puzzleMark('goal'), 'Size ring'));
      details.append(legend, el('p', 'You can push, not pull. Undo is always there.', { class: 'caption' }));
    }
  };
}
function pocketForecasts(level, state) {
  const forecasts = [];
  if (route.condition !== 'forecast') return forecasts;
  for (const [id, space] of Object.entries(level.rooms).filter(([id]) => id !== 'yard')) for (const [direction, x, y, arrow] of [['up', 1, 0, '↑'], ['down', 1, space.height - 1, '↓'], ['left', 0, 1, '←'], ['right', space.width - 1, 1, '→']]) if (space.floor.some(([fx, fy]) => fx === x && fy === y)) forecasts.push({ room: id, arrow, to: pocketDestination(level, state, { room: id, x, y }, direction) });
  return forecasts;
}

function addressCard(c, q) {
  const row = el('div', null, { class: 'address-card', 'aria-label': address(q) });
  row.append(figure(portrait(q.person, c.people.indexOf(q.person)), q.person), figure(placePicture(q.place, c.places.indexOf(q.place)), q.place), figure(clock(q.time), q.time)); return row;
}
function choiceGroup(label, name, options, value, onChange) {
  const group = append(el('fieldset', null, { class: 'choice-group' }), el('legend', label)), row = el('div', null, { class: 'choice-row' });
  options.forEach(([key, text, picture]) => {
    const input = el('input', null, { type: 'radio', name, value: key, id: `${name}-${key}` }); input.checked = key === value;
    input.addEventListener('change', () => { if (input.checked) onChange(key); });
    picture.setAttribute('aria-hidden', 'true');
    const face = append(el('span', null, { class: 'choice-face' }), picture, el('span', text));
    row.append(append(el('label', null, { class: 'visual-choice' }), input, face));
  }); group.append(row); return group;
}
function buildArchive(root) {
  const c = cases[route.encounter];
  const tabs = el('div', null, { role: 'tablist', 'aria-label': 'Investigation workspace', class: 'archive-tabs' });
  const panes = {};
  for (const [id, label] of [['scene', 'Scene'], ['records', 'Records'], ['report', 'Reconstruct']]) {
    const tab = button(label, `tab-${id}`, () => { current.tab = id; refresh(); }, 'archive-tab');
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', `pane-${id}`);
    tab.addEventListener('keydown', event => {
      const keys = ['scene', 'records', 'report'], i = keys.indexOf(id);
      let next = event.key === 'ArrowRight' ? keys[(i + 1) % 3] : event.key === 'ArrowLeft' ? keys[(i + 2) % 3] : event.key === 'Home' ? keys[0] : event.key === 'End' ? keys[2] : null;
      if (next) { event.preventDefault(); current.tab = next; refresh(); document.querySelector(`#tab-${next}`).focus(); }
    });
    tabs.append(tab); panes[id] = el('section', null, { id: `pane-${id}`, role: 'tabpanel', 'aria-labelledby': `tab-${id}`, class: `archive-pane ${id}-pane` });
  }
  root.append(tabs, ...Object.values(panes));
  const visible = visualEvidence(c);
  const incident = append(el('div', null, { class: 'incident' }), el('h3', `${visible.scene.place} · ${visible.scene.time}:00`), gateScene({ worker: true, title: 'After the fall' }), el('p', 'Immediately afterward · badge 2 beside the lever', { class: 'caption scene-caption' }));
  const facts = el('div', null, { class: 'scene-facts' }), roster = section('On the shift', 'roster'), people = el('div', null, { class: 'people-row' });
  visible.people.forEach(p => people.append(figure(portrait(p.name, c.people.indexOf(p.name), p.badge), p.name)));
  roster.append(people, el('p', 'Badges 1, 2, 3. One each. No swaps.', { class: 'caption' }));
  const lead = section('An appointment', 'appointment'); lead.append(addressCard(c, visible.appointment)); facts.append(roster, lead);
  panes.scene.append(incident, facts, tool('Gate reference', 'gate-help', openGateHelp, 'help'), button('Find a record', 'find-record', () => { current.tab = 'records'; refresh(); document.querySelector('#tab-records').focus(); }, 'primary-button'));
  if (route.condition === 'finding') panes.scene.append(figure(causePicture(c.cause), 'Authoritative finding', 'finding'));
  const composer = section('Retrieve a record', 'query-composer');
  for (const [key, label, items] of [['person', 'Source', [...c.people, 'Controller']], ['place', 'Place', c.places], ['time', 'Time', c.times]]) {
    composer.append(choiceGroup(label, `query-${key}`, items.map((v, i) => [v, v, key === 'person' ? portrait(v, i) : key === 'place' ? placePicture(v, i) : clock(v)]), current.query[key], value => { current.query[key] = value; }));
  }
  composer.append(button('Retrieve', 'retrieve', () => {
    const next = archiveStep(c, route.condition, current.history.state, { type: 'query', query: current.query });
    if (next.seen.length) { const match = records(c).find(r => address(r) === address(current.query)); if (match) current.record = match.id; }
    update(next);
    if (records(c).some(r => address(r) === address(current.query))) document.getElementById(`record-${current.record}`)?.focus();
  }, 'primary-button'), el('p', '', { id: 'query-feedback', class: 'query-feedback', 'aria-live': 'polite' }));
  const viewer = section('Collected evidence', 'evidence-viewer'), evidenceTabs = el('div', null, { class: 'record-picker', 'aria-label': 'Choose evidence' }), evidenceBody = el('div', null, { class: 'evidence-body' }); viewer.append(evidenceTabs, evidenceBody);
  panes.records.append(composer, viewer);
  if (route.condition === 'directory') { const directory = section('Directory', 'directory'); records(c).forEach(r => directory.append(addressCard(c, r))); panes.records.append(directory); }
  const report = section('Your reconstruction', 'report-form');
  const s = current.history.state;
  report.append(choiceGroup('Who wore badge 2?', 'identity', c.people.map((p, i) => [p, p, portrait(p, i)]), s.identity, value => update(archiveStep(c, route.condition, current.history.state, { type: 'draft', identity: value, cause: current.history.state.cause }))));
  report.append(choiceGroup('What opened the gate?', 'cause', Object.entries(causeLabels).map(([key, label]) => [key, key === 'manual' ? 'Powered release' : 'Power loss · no spring', causePicture(key)]), s.cause, value => update(archiveStep(c, route.condition, current.history.state, { type: 'draft', identity: current.history.state.identity, cause: value }))));
  report.append(button('Check reconstruction', 'submit-report', () => update(archiveStep(c, route.condition, current.history.state, { type: 'report', identity: current.history.state.identity, cause: current.history.state.cause })), 'primary-button'));
  panes.report.append(report, button('Review evidence', 'review-evidence', () => { current.tab = 'records'; refresh(); document.querySelector('#tab-records').focus(); }, 'text-button'));
  let evidenceKey = '';
  return () => {
    const state = current.history.state;
    root.dataset.tab = current.tab;
    Object.entries(panes).forEach(([id, pane]) => { pane.hidden = id !== current.tab; const tab = document.querySelector(`#tab-${id}`); tab.setAttribute('aria-selected', String(id === current.tab)); tab.tabIndex = id === current.tab ? 0 : -1; });
    report.querySelectorAll('input').forEach(input => { input.checked = input.value === state[input.name]; });
    document.querySelector('#submit-report').disabled = !state.identity || !state.cause;
    document.querySelector('#query-feedback').textContent = state.feedback.includes('record') || state.feedback.includes('Record') ? state.feedback : '';
    const key = JSON.stringify([state.seen, current.record, current.frame]);
    if (key === evidenceKey) return;
    evidenceKey = key; evidenceTabs.replaceChildren(); evidenceBody.replaceChildren();
    const names = { receipt: 'Check-in', worker: 'File address', controller: 'Snapshots' };
    state.seen.forEach(id => {
      const item = button(names[id], `record-${id}`, () => { current.record = id; refresh(); }, id === current.record ? 'record-button selected' : 'record-button'); item.setAttribute('aria-pressed', String(id === current.record)); evidenceTabs.append(item);
    });
    const record = visualEvidence(c, state.seen).records.find(r => r.id === current.record);
    if (!record) { evidenceBody.append(append(el('div', null, { class: 'empty-evidence' }), icon('records'), el('p', 'A good question opens a new record.'), el('span', 'Choose a source, place and time.', { class: 'caption' }))); return; }
    if (record.id === 'receipt') evidenceBody.append(figure(portrait(record.person, c.people.indexOf(record.person), record.badge), `${record.person} · badge ${record.badge}`, 'receipt-portrait'));
    else if (record.id === 'worker') evidenceBody.append(el('p', 'Controller file address', { class: 'caption' }), addressCard(c, record.address));
    else {
      const frames = el('div', null, { class: 'frame-picker', role: 'group', 'aria-label': 'Snapshot time' });
      record.frames.forEach((f, i) => { const n = button(f.moment, `frame-${i}`, () => { current.frame = i; refresh(); }, i === current.frame ? 'selected' : ''); n.setAttribute('aria-pressed', String(i === current.frame)); frames.append(n); });
      const f = record.frames[current.frame]; evidenceBody.append(frames, gateScene({ ...f, open: gateOpens({ ...f, leverBefore: f.leverPulled }), title: f.moment }));
    }
  };
}
function causePicture(cause) { return gateScene({ powerOn: cause === 'manual', springInstalled: cause === 'manual', leverPulled: cause === 'manual', fallen: true, open: true, title: '' }); }

function showDialog(title, content, opener = document.activeElement) {
  stop(); lastOpener = opener; document.querySelector('#help-title').textContent = title; document.querySelector('#help-content').replaceChildren(...content); dialog.showModal(); document.querySelector('#close-help').focus(); if (route.station) refresh();
}
function openHelp() {
  const id = route.station, title = stations[id].title;
  const descriptions = {
    spokes: ['Look for a relationship among the numbers on the spokes. Enter a whole number for the empty place, then check it.', 'The picture has an intended pattern; finite number patterns can admit other explanations. There is no penalty for experimenting.'],
    panel: ['Tap an interior seam to add a barrier. Tap it again to remove it.', 'Use the observed panels as evidence. Check your partition when you’re ready.'],
    archive: ['Scene holds the incident and public clues. Records lets you choose a source, place and time.', 'Collected evidence stays available. Inspect each snapshot, then select a person and cause in Reconstruct.', 'All records are reliable. Missing records prove nothing.'],
    bench: ['Select a numbered slot, then choose its command. Editing restarts execution but keeps the other commands.', 'Take works with an empty arm at source. Drop works while holding a crate at output. Left/right move one position; wait stays still.', 'Run repeats the tape. Pause, step, rewind, or undo whenever you want.'],
    tiles: ['Use arrow keys, WASD, or the direction pad. Walking into a loose tile pushes it.', 'Riveted tiles stay put. Lines read left-to-right or top-to-bottom. Solid objects block; goal objects finish the level.'],
    pocket: ['Use arrows or the direction pad to move and push rooms.', 'Beside an open side, Enter room takes you inside. Walk through an open room edge to exit.', 'The main board follows you; the other room views keep their current state.'],
    drift: ['Move with arrows, WASD, or the direction pad. You can push snowballs, but not pull them.', 'Rolling onto snow uses it and grows the ball by one size, up to 3. Walking does not use snow.', 'Dashed rings show the required ball size. Undo restores every part of a move.'],
  };
  const content = descriptions[id].map(p => el('p', p));
  if (id === 'tiles') { const legend = el('div', null, { class: 'help-legend' }); ['crystal', 'star', 'is', 'solid', 'goal'].forEach(k => legend.append(figure(puzzleMark(k), k))); content.push(legend); }
  content.push(el('hr'), el('h3', 'Make room for experiments'), el('p', 'Undo and Redo are always free. Restart is undoable. Switching puzzles keeps your progress in this tab.'), el('p', 'Keyboard: arrows / WASD to move; Z or Ctrl/⌘ Z to undo; Shift Z or Ctrl/⌘ Shift Z to redo. Escape closes this panel.', { class: 'caption' }));
  showDialog(`How to play ${title}`, content);
}
function openGateHelp() {
  const grid = el('div', null, { class: 'gate-reference-grid' });
  for (const [powerOn, springInstalled, leverPulled, title] of [[true, true, false, 'Powered · at rest'], [true, true, true, 'Powered · pulled'], [false, true, false, 'Unpowered · spring'], [false, false, false, 'Unpowered · no spring']]) {
    const open = gateOpens({ powerOn, springInstalled, leverBefore: leverPulled }); grid.append(figure(gateScene({ powerOn, springInstalled, leverPulled, open, fallen: open, title }), open ? 'Gate opens' : 'Gate stays closed'));
  }
  showDialog('How the gate works', [grid, el('p', 'With power, the lever opens the gate. Without power, an installed spring keeps it closed. These are the machine’s known rules, not a finding about this incident.')]);
}
function openDescription() {
  const id = route.station, l = stations[id].levels[route.encounter], s = current.history.state;
  const pos = p => `${p.room ? `${p.room}, ` : ''}row ${p.y + 1}, column ${p.x + 1}`;
  const lines = [`You: ${pos(s.player)}.`];
  if (id === 'tiles') lines.push(...s.tiles.map(t => `${t.fixed ? 'Fixed' : 'Loose'} ${t.word} tile: ${pos(t)}.`), ...l.objects.map(o => `${o.kind}: ${pos(o)}.`), `Walls: ${l.walls.map(pos).join('; ')}.`);
  if (id === 'drift') lines.push(...s.balls.map(b => `Size ${b.size} ball: ${pos(b)}.`), ...l.goals.map(g => `Size ${g.size} goal: ${pos(g)}.`), `Snow: ${s.snow.map(([x, y]) => pos({ x, y })).join('; ')}.`, `Floor: ${l.floor.map(([x, y]) => pos({ x, y })).join('; ')}. Other cells are walls.`);
  if (id === 'pocket') lines.push(`Crate: ${pos(s.cargo)}.`, `Goal: ${pos(l.goal)}.`, ...s.boxes.map(b => `Room ${b.id} box: ${pos(b)}.`), ...Object.entries(l.rooms).map(([name, r]) => `${name} floor: ${r.floor.map(([x, y]) => pos({ x, y })).join('; ')}. Other cells are walls.`), ...pocketForecasts(l, s).map(f => `${f.room} ${f.arrow} exit: ${f.to ? pos(f.to) : 'blocked'}.`));
  showDialog('Board description', [append(el('ul'), ...lines.map(t => el('li', t)))]);
}

document.querySelector('#close-help').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  const opener = lastOpener?.isConnected ? lastOpener : lastOpener?.id ? document.getElementById(lastOpener.id) : null;
  opener?.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
document.querySelector('.brand').addEventListener('click', event => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault(); navigate({ station: null, encounter: 0, condition: 'full', study: route.study }); } });
let theme = 'system';
try { theme = storage?.getItem('tz-puzzles:appearance') ?? 'system'; } catch { /* Storage can be disabled. */ }
function applyTheme() { if (!['system', 'light', 'dark'].includes(theme)) theme = 'system'; document.documentElement.dataset.theme = theme; document.querySelector('#appearance').setAttribute('aria-label', `Appearance: ${theme}. Change appearance`); }
document.querySelector('#appearance').addEventListener('click', () => { theme = ['system', 'light', 'dark'][(['system', 'light', 'dark'].indexOf(theme) + 1) % 3]; applyTheme(); try { storage?.setItem('tz-puzzles:appearance', theme); } catch { /* Optional preference. */ } });
window.addEventListener('popstate', () => { stop(); dialog.close(); route = parseRoute(location.search); build(); });
window.addEventListener('pagehide', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden && timer !== null) { stop(); if (route.station) refresh(); } });
document.addEventListener('keydown', event => {
  if (!route.station || dialog.open || event.altKey || event.target.closest('input, select, textarea, [contenteditable="true"], [role="tablist"]')) return;
  if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
  if (event.metaKey || event.ctrlKey) return;
  const direction = { ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left', w: 'up', d: 'right', s: 'down', a: 'left' }[event.key];
  if (direction && spatial[route.station]) { event.preventDefault(); if (!event.repeat) move(direction); }
});
applyTheme(); build();
