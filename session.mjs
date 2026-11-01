import { panels, panelInitial, edges } from './panel.mjs';
import { cases, archiveInitial, candidates } from './archive.mjs';
import { benches, benchInitial, commands } from './bench.mjs';
import { tileLevels, tilesInitial } from './tiles.mjs';
import { pocketLevels, pocketInitial } from './pocket.mjs';
import { driftLevels, driftInitial } from './drift.mjs';
import { spokeLevels, spokesInitial, spokesWon } from './spokes.mjs';

export const stations = {
  panel: { title: 'Panel', subtitle: 'A line can change everything.', task: 'Find a partition the panel accepts.', levels: panels, initial: panelInitial, conditions: ['full', 'given'], category: 'Shapes & boundaries' },
  archive: { title: 'Archive', subtitle: 'Every detail has a place.', task: 'Find who wore badge 2 and what opened the gate.', levels: cases, initial: archiveInitial, conditions: ['full', 'directory', 'finding'], category: 'Observation & evidence', retired: true },
  bench: { title: 'Bench', subtitle: 'Make a little machine work.', task: 'Program the arm to deliver the order.', levels: benches, initial: benchInitial, conditions: ['full', 'return'], category: 'Making & experimenting' },
  tiles: { title: 'Tiles', subtitle: 'A small world of possibilities.', task: 'Reach a goal object.', levels: tileLevels, initial: tilesInitial, conditions: ['full', 'preset'], category: 'Objects & symbols' },
  pocket: { title: 'Pocket', subtitle: 'There’s more room inside.', task: 'Deliver the crate to the ring.', levels: pocketLevels, initial: pocketInitial, conditions: ['full', 'forecast'], category: 'Space & perspective' },
  drift: { title: 'Drift', subtitle: 'Leave a different path behind.', task: 'Put both snowballs on matching size rings.', levels: driftLevels, initial: driftInitial, conditions: ['full', 'fixed'], category: 'Movement & possibility' },
  spokes: { title: 'Spokes', subtitle: 'A pattern hiding in plain sight.', task: 'Find the missing number.', levels: spokeLevels, initial: spokesInitial, conditions: ['full', 'paired'], category: 'Numbers & relationships' },
};
export const playableStations = Object.entries(stations).filter(([, config]) => !config.retired);
export function parseRoute(search) {
  const p = new URLSearchParams(search), id = p.get('station');
  if (!Object.hasOwn(stations, id) || stations[id].retired) return { station: null, encounter: 0, condition: 'full', study: p.get('study') === '1' };
  const config = stations[id], i = Number(p.get('encounter'));
  return { station: id, encounter: Number.isInteger(i) && i >= 0 && i < config.levels.length ? i : 0, condition: config.conditions.includes(p.get('condition')) ? p.get('condition') : 'full', study: p.get('study') === '1' };
}
export const routeKey = r => `${r.station}:${r.encounter}:${r.condition}:${r.study ? 'study' : 'play'}`;
export function routeURL(r) {
  const p = new URLSearchParams();
  if (r.station) { p.set('station', r.station); p.set('encounter', r.encounter); if (r.condition !== 'full') p.set('condition', r.condition); }
  if (r.study) p.set('study', '1');
  return p.size ? `?${p}` : './';
}
const point = (p, w, h) => p && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < w && p.y < h;
const unique = a => new Set(a.map(x => JSON.stringify(x))).size === a.length;
const integer = (n, max) => Number.isInteger(n) && n >= 0 && n <= max;
export function validSnapshot(route, s) {
  try { return Boolean(validState(route, s)); } catch { return false; }
}
function validState(route, s) {
  if (!s || typeof s !== 'object' || Array.isArray(s) || !Object.hasOwn(stations, route.station)) return false;
  const l = stations[route.station].levels[route.encounter];
  if (!l) return false;
  switch (route.station) {
    case 'spokes': return (route.encounter === 0 ? s.firstAnswer === 0 : [8, 40].includes(s.firstAnswer)) && typeof s.answer === 'string' && /^\d{0,4}$/.test(s.answer) && ['', 'Pattern completed.', 'Enter a whole number first.', 'Not the intended pattern. Try another number.'].includes(s.feedback) && (s.feedback !== 'Pattern completed.' || spokesWon(l, s));
    case 'panel': return Array.isArray(s.walls) && unique(s.walls) && s.walls.length <= l.budget && s.walls.every(i => integer(i, edges(l).length - 1)) && ['', 'Accepted.', 'Not accepted.', 'Divider limit reached. Remove one first.'].includes(s.feedback);
    case 'archive': return Array.isArray(s.seen) && unique(s.seen) && s.seen.every(id => ['receipt', 'worker', 'controller'].includes(id)) && ['', ...l.people].includes(s.identity) && ['', 'power', 'manual'].includes(s.cause) && Array.isArray(s.queries) && s.queries.length === 0 && (s.feedback === '' || s.feedback === 'Report supported by the available evidence.' && candidates(l, s.seen, route.condition).every(w => w.badges[1] === s.identity && w.cause === s.cause));
    case 'bench': return Array.isArray(s.tape) && s.tape.length === l.slots && s.tape.every(c => commands.includes(c)) && integer(s.position, l.length - 1) && typeof s.holding === 'boolean' && integer(s.pc, l.slots - 1) && integer(s.produced, l.quota) && integer(s.ticks, 100000) && ['', 'Take requires an empty arm at the source.', 'Drop requires a held item at the output.', 'Arm reached the end of the track.'].includes(s.error);
    case 'tiles': return point(s.player, l.width, l.height) && Array.isArray(s.tiles) && s.tiles.length === l.tiles.length && s.tiles.every((t, i) => point(t, l.width, l.height) && t.word === l.tiles[i].word && t.fixed === l.tiles[i].fixed && (!t.fixed || t.x === l.tiles[i].x && t.y === l.tiles[i].y)) && unique([s.player, ...s.tiles].map(p => [p.x, p.y])) && [s.player, ...s.tiles].every(p => !l.walls.some(w => w.x === p.x && w.y === p.y));
    case 'drift': return Array.isArray(s.balls) && s.balls.length === l.balls.length && s.balls.every(b => integer(b.size, 3) && b.size >= 1) && [s.player, ...s.balls].every(p => point(p, l.width, l.height) && l.floor.some(([x, y]) => x === p.x && y === p.y)) && unique([s.player, ...s.balls].map(p => [p.x, p.y])) && Array.isArray(s.snow) && unique(s.snow) && s.snow.every(p => Array.isArray(p) && p.length === 2 && l.snow.some(q => q[0] === p[0] && q[1] === p[1]));
    case 'pocket': {
      if (!Array.isArray(s.boxes) || s.boxes.length !== l.boxes.length || !s.boxes.every((b, i) => b.id === l.boxes[i].id)) return false;
      const objects = [s.player, s.cargo, ...s.boxes];
      if (!objects.every(p => p && Object.hasOwn(l.rooms, p.room) && point(p, l.rooms[p.room].width, l.rooms[p.room].height) && l.rooms[p.room].floor.some(([x, y]) => x === p.x && y === p.y)) || !unique(objects.map(p => [p.room, p.x, p.y]))) return false;
      return s.boxes.every(box => {
        const seen = new Set([box.id]); let parent = box.room;
        while (parent !== 'yard') { if (seen.has(parent)) return false; seen.add(parent); parent = s.boxes.find(b => b.id === parent)?.room; if (!parent) return false; }
        return true;
      });
    }
    default: return false;
  }
}
export function snapshots(storage) {
  const key = r => `tz-puzzles:${r.station === 'spokes' ? 'spokes-v2' : 'studio-v4'}:${routeKey(r)}`;
  return {
    available() { try { storage.setItem('tz-puzzles:probe', '1'); storage.removeItem('tz-puzzles:probe'); return true; } catch { return false; } },
    load(r) {
      if (r.study) return null;
      try { const raw = storage.getItem(key(r)); if (!raw || raw.length > 30000) return null; const s = JSON.parse(raw); return validSnapshot(r, s) ? s : null; } catch { return null; }
    },
    save(r, state) {
      if (r.study) return false;
      // Functional checkpoint only: no query/event log is stored.
      const s = r.station === 'archive' ? { seen: state.seen, identity: state.identity, cause: state.cause, feedback: state.feedback === 'Report supported by the available evidence.' ? state.feedback : '', queries: [] } : state;
      if (!validSnapshot(r, s)) return false;
      try { storage.setItem(key(r), JSON.stringify(s)); return true; } catch { return false; }
    },
  };
}
