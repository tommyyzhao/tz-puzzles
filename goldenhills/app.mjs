import { prepare, initial, step, complete, validState, next, occupancy, key, archOpen, opposite, dirs, water } from './model.mjs';
import { build, clearings, clearingAt, origin, STEP, heartHints, areaOf, rewindArea, rewindable } from './world.mjs';
import { createRenderer } from './render.mjs';
import { miniatureAround } from './terrain.mjs';

const world = { ...prepare(build()), landmark: { x: 15, y: 14 } };   // centre of the heart pool
const $ = id => document.getElementById(id);
const SAVE = 'goldenhills:v2', OLD_SAVE = 'stillwater:v2';   // same log format; an old save carries over
const params = new URLSearchParams(location.search), study = params.has('study');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;

// ---- History: an action log. Entries are directions or `@n` (jump to the state after entry n).
// States are re-derived by replay, so undo survives reloads.
let log = [], cursor = 0, states = [initial(world)], seenEnding = false;
const state = () => states[cursor];

function apply(entry, from) {
  if (entry.startsWith('@')) {
    const i = Number(entry.slice(1));
    return Number.isInteger(i) && i >= 0 && i < states.length ? states[i] : null;
  }
  if (entry.startsWith('#')) return rewindArea(world, from, entry.slice(1));
  if (!dirs[entry]) return null;
  const r = step(world, from, entry);
  return r.events[0].type === 'blocked' ? null : r.state;
}
function load() {
  if (study) return;
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE) ?? localStorage.getItem(OLD_SAVE) ?? 'null');
    if (!saved || !Array.isArray(saved.log) || saved.log.length > 50000) return;
    for (const e of saved.log) {
      const s = typeof e === 'string' && apply(e, states.at(-1));
      if (!s || !validState(world, s)) break;
      log.push(e); states.push(s);
    }
    cursor = Math.max(0, Math.min(Number.isInteger(saved.cursor) ? saved.cursor : log.length, log.length));
    seenEnding = !!saved.seenEnding;
  } catch { /* corrupt save: start fresh */ }
}
let saveTimer;
function save() {
  if (study) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem(SAVE, JSON.stringify({ log, cursor, seenEnding })); } catch {} }, 150);
}
function push(entry, s) {
  log = log.slice(0, cursor); states = states.slice(0, cursor + 1);
  log.push(entry); states.push(s); cursor++;
}

// ---- Areas: the clearing you are in, looking through any boxes you are inside.
const area = s => areaOf(world, s);
// Camera frames the clearing you stand in; inside a box it frames the whole box room.
let lastFrame = null;
function frameOf(s) {
  if (s.player.room !== 'v') return null;
  const c = clearingAt(s.player.x, s.player.y);
  if (!c) return lastFrame;                     // standing in a gateway: keep the clearing you came from
  const [ox, oy] = origin(c);
  return (lastFrame = { room: 'v', cx: ox + STEP / 2 - 0.5, cy: oy + STEP / 2 - 0.5, span: STEP + 1.6 });
}
// A clearing is alive once its pool wakes; the whole valley once the heart does.
function lifeOf(s, room, x, y) {
  if (s.awake.includes(world.heart)) return true;
  if (room !== 'v') return false;              // box interiors stay timber until the heart wakes
  const c = clearingAt(x, y);
  return !!c?.basin && s.awake.includes(c.basin);
}
// Starting quality from a device guess; the renderer steps down further if frames stay slow. ?lite forces the floor.
const lowPower = params.has('lite') || navigator.hardwareConcurrency <= 4 || (navigator.deviceMemory ?? 8) <= 4;
const level = params.has('lite') ? 0 : lowPower ? 1 : coarse ? 1 : 2;
const view = createRenderer($('scene'), world, { frameOf, lifeOf, onCue: cue => finaleCue(cue), reducedMotion: reduced, level });
const seal = Object.values(world.objects).find(o => o.seal)?.seal;

// ---- Pool tracker: six small pools, then the heart. ----
const poolOrder = [...clearings.filter(c => c.basin && c.basin !== world.heart).map(c => c.basin), world.heart];
$('pools').innerHTML = poolOrder.map(b => `<i data-b="${b}"${b === world.heart ? ' class="heart"' : ''}></i>`).join('');
function updatePools(s, events) {
  document.documentElement.style.setProperty('--clear', String(s.awake.length / poolOrder.length));
  for (const el of $('pools').children) el.classList.toggle('awake', s.awake.includes(el.dataset.b));
  for (const e of events) if (e.type === 'awaken') {
    const el = $('pools').querySelector(`[data-b="${e.basin}"]`);
    if (el && !reduced) { el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse'); }
  }
  const n = s.awake.filter(b => b !== world.heart).length;
  $('pools').setAttribute('aria-label', `${n} of ${poolOrder.length - 1} pools awake; the heart is ${s.awake.includes(world.heart) ? 'full' : 'still dry'}`);
}

// ---- Feedback ----
const reasons = {
  wall: 'Solid rock.', chasm: 'Too wide to step across.', pool: 'Too deep to wade.', spring: 'The spring wells up here.',
  stream: 'The current is too strong to wade.', footbridge: 'Only you fit on the footbridge.', culvert: 'Only water slips through.',
  fixed: 'It will not budge.', sealed: 'The stone box is sealed shut. Something far off holds it.', self: 'A box cannot go inside itself.', loop: 'That would fold back on itself.',
};
function say(text, ms = 2600) {
  $('status').textContent = text;
  clearTimeout(say.t);
  say.t = setTimeout(() => ($('status').textContent = ''), ms);
}

// ---- Onboarding: each hint disappears once its action has been done. ----
const learned = new Set(study ? [] : JSON.parse(sessionStorage.getItem('goldenhills:learned') ?? '[]'));
const learn = k => { learned.add(k); try { sessionStorage.setItem('goldenhills:learned', JSON.stringify([...learned])); } catch {} };
let promptAt = null, pushesSeen = 0;
function updatePrompt() {
  const s = state(), el = $('prompt');
  promptAt = null;
  if (!$('title').hidden) return (el.hidden = true);
  // An arch you are facing: invite the step in, anchored to the box itself.
  for (const d of Object.keys(dirs)) {
    const t = next(world, s, s.player, d), id = !t.fail && occupancy(s).get(key(t));
    if (id && id !== 'player' && world.objects[id].interior && archOpen(world, s, id, opposite[d]) && !learned.has('enter')) {
      promptAt = { x: t.x, y: t.y, dir: d, text: `Step into the arch ${arrow[d]}` };
      break;
    }
  }
  if (!promptAt && !learned.has('walk'))
    promptAt = { x: s.player.x, y: s.player.y, text: coarse ? 'Tap a tile or swipe to walk' : 'Arrow keys or WASD to walk' };
  else if (!promptAt && learned.has('push') && !learned.has('undo') && pushesSeen > 0 && pushesSeen < 5 && s.player.room === 'v')
    promptAt = { x: s.player.x, y: s.player.y, text: coarse ? 'Undo any move with ↶' : 'Z undoes any move' };
  if (view.busy()) promptAt = null;
  el.hidden = !promptAt;
  if (promptAt) el.textContent = promptAt.text;
}
const arrow = { up: '↑', down: '↓', left: '←', right: '→' };
function placePrompt() {
  if (!promptAt) return;
  const [x, y, ok] = view.project(promptAt.x, promptAt.y, 1.15), el = $('prompt');
  el.style.left = `${Math.max(90, Math.min(innerWidth - 90, x))}px`;
  el.style.top = `${Math.max(80, y)}px`;
  el.style.visibility = ok ? 'visible' : 'hidden';
}

// ---- Actions ----
let lastArea = null, boxTold = 0;

// ---- Gentle nudges: a soft line when you have been still, or wandering, for a while without progress. ----
let hintTimer = null, sinceProgress = 0;
const hintsGiven = new Map();
function chasmsFilled(c, s) {
  const [ox, oy] = origin(c);
  return c.block.every((row, y) => [...row].every((ch, x) => ch !== '_' || world.rooms.v.grid[oy + y][ox + x] !== '_' ||
    Object.values(s.objects).some(p => p.sunk && p.room === 'v' && p.x === ox + x && p.y === oy + y)));
}
const REWIND_HINT = 'Stuck? Rewind (R) puts this clearing back as it began. Pools you woke stay awake.';
function boxFlowing(s) {
  const box = s.objects[world.containerOf.v], { wet, spills } = water(world, s);
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const k = key({ room: 'v', x: box.x + dx, y: box.y + dy }); return wet.has(k) || spills.some(p => key(p) === k); });
}
function currentHints(s) {
  if (s.awake.includes(world.heart)) return null;
  if (seal && s.awake.includes(seal))
    return boxFlowing(s) ? { id: 'heart', list: heartHints } : { id: 'dry-edge', list: ['The river no longer reaches the hills’ east edge.', 'Something upstream, at The Crossing or Twin Springs, has moved off the river. Rewind (R) can put any clearing back as it began, even one you finished.'] };
  const c = clearings.find(c => c.id === area(s));
  if (!c?.hints || (c.basin ? s.awake.includes(c.basin) : chasmsFilled(c, s))) return null;
  return { id: c.id, list: [...c.hints, REWIND_HINT] };
}
function showHint() {
  const h = currentHints(state());
  if (!h) return;
  if (view.busy() || !$('title').hidden || document.querySelector('dialog[open]')) return armHint([]);
  const i = hintsGiven.get(h.id) ?? 0;
  hintsGiven.set(h.id, i + 1);
  say(h.list[Math.min(i, h.list.length - 1)], 7000);
  if (h.id === 'heart') view.nudge();
  sinceProgress = 0;
  armHint([]);      // still stuck later: the next, plainer line
}
function armHint(events) {
  clearTimeout(hintTimer);
  if (events.some(e => e.type === 'awaken' || e.type === 'fill')) sinceProgress = 0;
  else if (events.length) sinceProgress++;
  if (sinceProgress > 140) return showHint();
  hintTimer = setTimeout(showHint, currentHints(state())?.id === 'heart' ? 25000 : 45000);
}
function refresh(events = []) {
  const s = state();
  view.show(s, events);
  const a = area(s), c = a && clearingAt(...(s.player.room === 'v' ? [s.player.x, s.player.y] : [0, 0]));
  const outer = clearings.find(c => c.id === a);
  $('place').textContent = s.player.room === 'v' ? (c?.name ?? '')
    : `Inside ${world.objects[world.containerOf[s.player.room]]?.name ?? 'a box'}${outer ? ` · ${outer.name}` : ''}`;
  $('undo').disabled = cursor === 0;
  $('redo').disabled = cursor === log.length;
  $('rewind').disabled = !clearings.some(c => rewindable(world, s, c.id));
  if (a !== lastArea && lastArea !== null && s.player.room === 'v') say(c?.name ?? '', 1800);
  lastArea = a;
  // Inside a box: a small window onto the room around it, with the box marked.
  const box = world.containerOf[s.player.room];
  $('outside').hidden = !box || s.player.room === 'v';
  if (!$('outside').hidden) miniatureAround(world, s, box, $('outside').querySelector('canvas'));
  updatePools(s, events);
  updatePrompt();
  armHint(events);
  save();
}

function act(dir, { quiet = false } = {}) {
  cancelWalk();
  const before = state(), r = step(world, before, dir);
  if (r.events[0].type === 'blocked') {
    view.bump(dir);
    if (!quiet) say(reasons[r.events[0].reason] ?? 'Blocked.');
    sound?.('blocked');
    return false;
  }
  push(dir, r.state);
  learn('walk');
  if (r.events[0].type === 'push') learn('push');
  if (learned.has('push')) pushesSeen++;
  if (r.events.some(e => e.type === 'enter')) learn('enter');
  for (const e of r.events) if (e.type === 'awaken' && e.basin !== world.heart && (e.basin !== seal || reduced)) say(e.basin === seal ? 'Water runs off the edge of the hills and out of the stone box. Its seal is open.' : 'Water reaches the pool.');

  sound?.(r.events);
  refresh(r.events);
  // The stone box's trick, said plainly the first few times it happens (after the place name, so it stays).
  const through = r.events.find(e => (e.type === 'exit' || e.type === 'enter') && e.box === world.containerOf.v);
  if (through && boxTold++ < 2) say(through.type === 'exit' ? 'You walked off the edge of the hills, and out of the stone box.' : 'Into the stone box. All the hills are inside it.', 5000);
  // Say so at once when a move cuts the river off from the stone box after its seal opened.
  if (seal && r.state.awake.includes(seal) && !complete(world, r.state) && boxFlowing(before) && !boxFlowing(r.state))
    say('The river no longer reaches the stone box. Undo, or Rewind (R) the clearing you changed.', 5000);
  if (complete(world, r.state) && !complete(world, before)) finale();
  return true;
}

function undo() { cancelWalk(); if (cursor > 0) { cursor--; learn('undo'); sound?.('undo'); refresh(); } }
function redo() { cancelWalk(); if (cursor < log.length) { cursor++; sound?.('undo'); refresh(); } }

// Rewind puts the current clearing back as it began (pools you woke stay awake). It is itself undoable, and it is
// logged as `#clearing`, so it replays after a reload like any move.
// Rewind works on any clearing, including ones already finished: here first, or pick another from the list.
function rewindTo(id) {
  const r = rewindArea(world, state(), id);
  if (!r) return false;
  cancelWalk();
  push(`#${id}`, r);
  const name = clearings.find(c => c.id === id).name;
  say(`${name} is back as it began. Pools you woke stay awake. Undo to change your mind.`, 4500);
  sound?.('undo');
  refresh();
  return true;
}
function rewind() {
  const here = area(state()), list = clearings.filter(c => rewindable(world, state(), c.id));
  if (!list.length) return;
  // Only the clearing you're in has changed: rewind it straight away. Otherwise ask which.
  if (list.length === 1 && list[0].id === here) return rewindTo(here);
  const ul = $('rewind-list');
  ul.innerHTML = '';
  for (const c of list) {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.textContent = c.id === here ? `${c.name} (here)` : c.name; b.dataset.id = c.id;
    b.onclick = () => { $('rewind-pick').close(); rewindTo(c.id); };
    li.append(b); ul.append(li);
  }
  $('rewind-pick').showModal();
  (ul.querySelector(`[data-id="${here}"]`) ?? ul.querySelector('button'))?.focus();
}

// ---- Pointer: tap an adjacent tile to step; tap further to walk there (never pushing or entering);
// swipe to step once. Steps animate one at a time; any new input cancels the walk.
let walkTimer = null;
function cancelWalk() { clearTimeout(walkTimer); walkTimer = null; }
function walkPath(target) {
  const s0 = state(), start = key(s0.player), goal = key({ room: s0.player.room, ...target });
  const prev = new Map([[start, null]]), queue = [s0];
  for (let i = 0; i < queue.length && i < 4000; i++) {
    const s = queue[i];
    if (key(s.player) === goal) {
      const path = [];
      for (let k = goal; prev.get(k); k = prev.get(k)[0]) path.unshift(prev.get(k)[1]);
      return path;
    }
    for (const d of Object.keys(dirs)) {
      const r = step(world, s, d);
      if (r.events.length !== 1 || r.events[0].type !== 'walk' || r.state.player.room !== s0.player.room) continue;
      const k = key(r.state.player);
      if (!prev.has(k)) { prev.set(k, [key(s.player), d]); queue.push(r.state); }
    }
  }
  return null;
}
function tapCell(cell) {
  const p = state().player, dx = cell.x - p.x, dy = cell.y - p.y;
  if (!dx && !dy) return;
  if (Math.abs(dx) + Math.abs(dy) === 1) return act(dx ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  const path = walkPath(cell);
  if (!path) return view.ping(cell, false);
  view.ping(cell, true);
  const go = () => {
    const d = path.shift();
    if (!d) return;
    const r = step(world, state(), d);
    if (r.events.length !== 1 || r.events[0].type !== 'walk') return cancelWalk();
    push(d, r.state); learn('walk'); sound?.(r.events); refresh(r.events);
    walkTimer = path.length ? setTimeout(go, reduced ? 40 : 105) : null;
  };
  cancelWalk();
  go();
}

const canvas = $('scene');
let down = null;
canvas.addEventListener('pointerdown', e => {
  if (!e.isPrimary) { down = null; return; }
  down = { x: e.clientX, y: e.clientY, id: e.pointerId, t: performance.now() };
});
canvas.addEventListener('pointercancel', () => (down = null));
canvas.addEventListener('pointerup', e => {
  if (!down || e.pointerId !== down.id || !$('title').hidden) return;
  const dx = e.clientX - down.x, dy = e.clientY - down.y, dist = Math.hypot(dx, dy);
  down = null;
  if (dist >= 18) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 1.4 * Math.min(Math.abs(dx), Math.abs(dy))) return; // ambiguous diagonal
    return act(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }
  const cell = view.pick(e.clientX, e.clientY);
  if (cell) tapCell(cell);
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse' && !down) view.hover(view.pick(e.clientX, e.clientY));
});
canvas.addEventListener('pointerleave', () => view.hover(null));
$('prompt').addEventListener('click', () => promptAt?.dir && act(promptAt.dir));

// ---- Keyboard ----
const keys = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
const held = new Map();
addEventListener('keydown', e => {
  if (e.target.closest?.('dialog, input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (!$('title').hidden && (k === 'enter' || k === ' ' || keys[k])) { e.preventDefault(); return begin(); }
  if (keys[k]) {
    e.preventDefault();
    // Own key repeat: first repeat after 200 ms, then every 110 ms; ignore the OS repeat rate.
    if (e.repeat) return;
    act(keys[k]);
    const again = () => { if (held.has(k)) { act(keys[k], { quiet: true }); held.set(k, setTimeout(again, 110)); } };
    held.set(k, setTimeout(again, 200));
  } else if (k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  else if (k === 'y') { e.preventDefault(); redo(); }
  else if (k === 'r') { e.preventDefault(); rewind(); }
});
addEventListener('keyup', e => { const k = e.key.toLowerCase(); clearTimeout(held.get(k)); held.delete(k); });
addEventListener('blur', () => { for (const t of held.values()) clearTimeout(t); held.clear(); cancelWalk(); });

// ---- Buttons and dialogs ----
document.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => act(b.dataset.dir)));
$('undo').onclick = undo;
$('redo').onclick = redo;
$('rewind').onclick = rewind;
$('help-open').onclick = () => $('help').showModal();
$('credits-open').onclick = () => $('credits').showModal();
$('replay').onclick = () => {
  $('help').close();
  push('@0', states[0]);
  say('Dry hills again. Undo to return.');
  refresh();
};
function begin() {
  $('title').hidden = true;
  startAudio?.();
  refresh();
  // A first look: the dry heart the valley needs, then back to you and the stone box.
  if (cursor === 0 && !reduced) { view.intro(); say('The old oak at the heart of the hills is dying of thirst.', 3800); }
}
$('begin').onclick = begin;

// ---- Sound (optional module; the game is complete without it) ----
let sound = null, startAudio = null;
import('./audio.mjs').then(m => {
  const a = m.createAudio(world);
  const on = localStorage.getItem('goldenhills:sound') !== 'off';
  a.enabled(on);
  $('sound').setAttribute('aria-pressed', String(on));
  $('sound').onclick = () => {
    const v = $('sound').getAttribute('aria-pressed') !== 'true';
    $('sound').setAttribute('aria-pressed', String(v)); a.enabled(v); a.start();
    try { localStorage.setItem('goldenhills:sound', v ? 'on' : 'off'); } catch {}
  };
  sound = ev => a.play(ev, state());
  startAudio = () => a.start(state());
}).catch(() => { $('sound').hidden = true; });

// ---- Finale: the renderer follows the water and calls back at each beat; the words name what is happening. ----
const showEnding = () => { if ($('ending').open) return; $('ending').showModal(); seenEnding = true; save(); };
function finaleCue(cue) {
  if (cue === 'seal-edge') say('Water runs off the edge of the hills…', 3200);
  if (cue === 'seal-box') { say('…and pours out of the stone box. Its seal is open.', 5000); sound?.([{ type: 'exit' }]); }
  if (cue === 'start') say('The river pours out of the stone box, on toward the heart…', 4500);
  if (cue === 'heart') { say('The old oak drinks.', 4000); sound?.('finale'); }
  if (cue === 'bloom') say('The rain comes back to Golden Hills.', 3500);
  if (cue === 'safii-out') sound?.('safii-peek');
  if (cue === 'safii-hi') { sound?.('safii-hi'); $('status').textContent = ''; $('bubble').setAttribute('aria-hidden', 'false'); say('hi! thanks for the rain!', 4000); }
  if (cue === 'done' && complete(world, state())) showEnding();
  if (cue === 'cine-done' || cue === 'done') updatePrompt();
}
function finale() {
  if (view.busy()) return;       // the renderer is running the sequence and cues the words
  say('The river ran out of the stone box and into the old oak. The rain comes back to Golden Hills. A pair of eyes peeks out of the oak: hi! thanks for the rain!', 9000);
  sound?.('finale');
  setTimeout(showEnding, 300);
}

// ---- Start ----
// The back link only makes sense inside the puzzle collection, not on the game's own site.
$('back').hidden = !location.pathname.includes('/goldenhills/');
load();
if (cursor > 0) $('title').hidden = true;
if (coarse) $('title').querySelector('.fine').textContent = 'Tap a tile or swipe to walk · ↶ undoes anything';
addEventListener('resize', () => view.resize());
addEventListener('pagehide', () => { clearTimeout(saveTimer); if (!study) try { localStorage.setItem(SAVE, JSON.stringify({ log, cursor, seenEnding })); } catch {} });
view.resize();
refresh();
// Painterly splat backdrop: only where the device can afford it, loaded after the first playable frame.
let backdrop = null;
if (!lowPower && !params.has('nosplat')) setTimeout(() => import('./backdrop.mjs').then(m => {
  backdrop = m.createBackdrop($('game'), { reducedMotion: reduced });
  backdrop.resize();
  backdrop.setLife(state().awake.length / 7);
}).catch(() => {}), 600);

let running = true, frames = 0;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) requestAnimationFrame(loop); });
function loop(t) {
  if (!running) return;
  view.render(t);
  // The backdrop moves slowly; half rate is plenty.
  if (backdrop && (frames++ & 1) === 0) { backdrop.setLife(state().awake.length / 7); backdrop.render(t); }
  placePrompt();
  // Touch the DOM only on change: setting a boolean attribute, even to its current value, is a mutation.
  const sp = view.safiiSpeech(), bubble = $('bubble');
  if (bubble.hidden !== !sp) bubble.hidden = !sp;
  if (sp) { bubble.style.left = `${Math.round(sp[0])}px`; bubble.style.top = `${Math.round(sp[1])}px`; }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
addEventListener('resize', () => backdrop?.resize());

// Test hook (study mode only): exposes state for automated checks, never for play.
if (study) window.__goldenhills = { state, get log() { return log.slice(0, cursor); }, project: (x, y) => view.project(x, y, 0), quality: () => view.quality(), renderNow: () => view.renderNow(), info: () => view.info(), act: d => act(d) };
