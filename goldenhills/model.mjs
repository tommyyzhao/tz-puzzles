// Stillwater rules. Pure and deterministic: rendering, timing and input never change legality.
//
// Grid legend (per room):
//   #  wall          .  floor         ~  channel (floor that carries water)
//   S  spring        _  chasm: a stone pushed in fills it and becomes ground
//   =  footbridge (player only; open gates become footbridges)
//   %  culvert: water passes, nothing else does
//   +  bridge: a channel the player can always cross; objects cannot be pushed onto it
//   0-9  basin (pool, impassable; awakens when water reaches it, then stays awake)
//   a-j  gate: wall until basin 0-9 wakes, then footbridge
//   A-J  sluice: wall until basin 0-9 wakes, then channel
// Flowing water (a wet channel) is a stream: the player cannot step into it; stones and boxes can be pushed in.
// Boxes are objects with an interior room. Moving into a box face with an open arch goes inside,
// landing on the interior edge cell at the middle of that side; moving into a solid face pushes the box.
// A box may contain the room it stands in (the world box): leaving that room's edge arrives beside it.

export const dirs = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
export const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
export const key = p => `${p.room},${p.x},${p.y}`;
export const isBasin = c => c >= '0' && c <= '9';

const MAX_DEPTH = 12;

export function edgeCell(room, side) {
  const w = room.grid[0].length, h = room.grid.length;
  return { up: [w >> 1, 0], down: [w >> 1, h - 1], left: [0, h >> 1], right: [w - 1, h >> 1] }[side];
}

// Static lookups derived once from the authored world.
export function prepare(world) {
  const containerOf = {};
  for (const [id, o] of Object.entries(world.objects)) if (o.interior) containerOf[o.interior] = id;
  return { ...world, containerOf };
}

export function cellAt(world, state, room, x, y) {
  const g = world.rooms[room].grid;
  if (y < 0 || y >= g.length || x < 0 || x >= g[0].length) return null;
  const c = g[y][x];
  if (c === '_') {
    for (const p of Object.values(state.objects)) if (p.sunk && p.x === x && p.y === y && p.room === room) return '.';
    return c;
  }
  if (c >= 'a' && c <= 'j') return state.awake.includes(String(c.charCodeAt(0) - 97)) ? '=' : '#';
  if (c >= 'A' && c <= 'J') return state.awake.includes(String(c.charCodeAt(0) - 65)) ? '~' : '#';
  return c;
}

const walkable = (c, mover) => c === '.' || c === '~' || ((c === '=' || c === '+') && mover === 'player');
const blockReason = c => c === '_' ? 'chasm' : c === '=' || c === '+' ? 'footbridge' : isBasin(c) ? 'pool' :
  c === 'S' ? 'spring' : c === '%' ? 'culvert' : 'wall';

export function archOpen(world, state, id, side) {
  const o = world.objects[id];
  return !!o.arches?.includes(side) && (!o.seal || state.awake.includes(o.seal));
}

// Is box `a` (transitively) inside box `b`?
export function inside(world, state, a, b) {
  const seen = new Set();
  for (let room = state.objects[a].room, c; (c = world.containerOf[room]) && !seen.has(c); room = state.objects[c].room) {
    if (c === b) return true;
    seen.add(c);
  }
  return false;
}

// The cell one step from `pos`, leaving rooms through open arches as needed.
export function next(world, state, pos, dir) {
  let { room, x, y } = pos;
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const g = world.rooms[room].grid, nx = x + dirs[dir][0], ny = y + dirs[dir][1];
    if (nx >= 0 && ny >= 0 && nx < g[0].length && ny < g.length) return { room, x: nx, y: ny };
    const [ex, ey] = edgeCell(world.rooms[room], dir), box = world.containerOf[room];
    if (x !== ex || y !== ey || !box || !archOpen(world, state, box, dir)) return { fail: 'wall' };
    ({ room, x, y } = state.objects[box]);
  }
  return { fail: 'loop' };
}

// Landing cell when entering box `id` while travelling in `dir`.
export function landing(world, id, dir) {
  const room = world.objects[id].interior, [x, y] = edgeCell(world.rooms[room], opposite[dir]);
  return { room, x, y };
}

export function occupancy(state) {
  const occ = new Map([[key(state.player), 'player']]);
  for (const [id, p] of Object.entries(state.objects)) if (!p.sunk) occ.set(key(p), id);
  return occ;
}

// Move `id` one step. Returns [[id, newPos], ...] for everything that moves, or a failure reason.
function shove(world, state, occ, wet, id, pos, dir, chain) {
  if (chain.has(id)) return 'loop';
  chain.add(id);
  let to = next(world, state, pos, dir);
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    if (to.fail) return to.fail;
    const cell = cellAt(world, state, to.room, to.x, to.y);
    if (cell === '_' && id !== 'player' && !world.objects[id].interior) return [[id, { ...to, sunk: true }]];
    if (!walkable(cell, id)) return blockReason(cell);
    const other = occ.get(key(to));
    if (id === 'player' && !other && cell === '~' && wet.has(key(to))) return 'stream';
    if (!other) return [[id, to]];
    if (other === 'player') return 'loop';
    const o = world.objects[other];
    if (o.interior && archOpen(world, state, other, opposite[dir])) {
      if (world.objects[id]?.interior && (other === id || inside(world, state, other, id))) return 'self';
      to = landing(world, other, dir);
      continue;
    }
    if (o.seal && !state.awake.includes(o.seal)) return 'sealed';
    if (o.fixed) return 'fixed';
    const moved = shove(world, state, occ, wet, other, to, dir, chain);
    return typeof moved === 'string' ? moved : [...moved, [id, to]];
  }
  return 'loop';
}

// Water spreads from springs (and the heart once awake) along channels and basins, through open arches.
// Stones and solid box faces dam it. Returns wet cells with their distance from a source, basins reached, and
// spills: places where water pours out of an arch onto ground that cannot carry it (shown, never stored).
export function water(world, state) {
  const occ = occupancy(state), wet = new Map(), basins = new Set(), queue = [], from = new Map(), spills = new Map();
  let src = null;
  const reach = (p, d, dir, arch) => {
    const c = cellAt(world, state, p.room, p.x, p.y), k = key(p);
    if (wet.has(k)) return;
    if (!(c === '~' || c === '%' || c === '+' || isBasin(c))) {
      if (arch && c !== '#' && c !== null && !spills.has(k)) spills.set(k, { ...p, dir, d, src });
      return;
    }
    wet.set(k, d); from.set(k, src);
    if (isBasin(c)) basins.add(c);
    queue.push([p, d]);
  };
  const arrive = (t, dir, d, arch) => {
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
      const other = occ.get(key(t));
      if (!other || other === 'player') return reach(t, d, dir, arch);
      if (!world.objects[other].interior || !archOpen(world, state, other, opposite[dir])) return;
      t = landing(world, other, dir);
      arch = true;
    }
  };
  for (const [room, r] of Object.entries(world.rooms))
    r.grid.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === 'S' || (c === world.heart && state.awake.includes(c))) {
        wet.set(key({ room, x, y }), 0);
        queue.push([{ room, x, y }, 0]);
      }
    }));
  for (let i = 0; i < queue.length; i++) {
    const [p, d] = queue[i];
    src = key(p);
    for (const dir of Object.keys(dirs)) {
      const t = next(world, state, p, dir);
      if (!t.fail) arrive(t, dir, d + 1, t.room !== p.room || Math.abs(t.x - p.x) + Math.abs(t.y - p.y) !== 1);
    }
  }
  return { wet, basins, from, spills: [...spills.values()].filter(s => !wet.has(key(s))) };
}

// The cells water took to reach `basin`, spring first (ignoring any source the basin itself has become).
export function supplyPath(world, state, basin) {
  const { wet, from } = water(world, { ...state, awake: state.awake.filter(b => b !== basin) });
  let best = null;
  for (const [k, d] of wet) {
    const [room, x, y] = k.split(',');
    if (world.rooms[room].grid[+y][+x] === basin && (!best || d < wet.get(best))) best = k;
  }
  return trace(from, best);
}
// The chain of cells water took to reach cell key `k`, spring first.
export function trace(from, k) {
  const path = [];
  for (; k; k = from.get(k)) { const [room, x, y] = k.split(','); path.unshift({ room, x: +x, y: +y }); }
  return path;
}

// Awakening is latched: once water reaches a basin it stays awake. Gates it opens may let water further.
function settle(world, state) {
  const awakened = [];
  for (;;) {
    const fresh = [...water(world, state).basins].filter(b => !state.awake.includes(b));
    if (!fresh.length) return { state, awakened };
    state = { ...state, awake: [...state.awake, ...fresh].sort() };
    awakened.push(...fresh.sort());
  }
}

// Put objects `ids` back where the world starts them (stones come back out of chasms) and the player at `player`.
// Pools already awake stay awake. Returns the settled state, or null if the result would be invalid.
export function restore(world, state, ids, player = state.player) {
  const objects = { ...state.objects };
  for (const id of ids) { const o = world.objects[id]; objects[id] = { room: o.room, x: o.x, y: o.y }; }
  const s = { ...state, player: { ...player }, objects };
  return validState(world, s) ? settle(world, s).state : null;
}

export function initial(world) {
  const objects = {};
  for (const [id, o] of Object.entries(world.objects)) objects[id] = { room: o.room, x: o.x, y: o.y };
  return settle(world, { player: { ...world.start }, objects, awake: [] }).state;
}

// One player action. Returns the next state plus events describing what happened, for feedback and sound.
export function step(world, state, dir) {
  if (!dirs[dir]) return { state, events: [{ type: 'invalid' }] };
  const moved = shove(world, state, occupancy(state), water(world, state).wet, 'player', state.player, dir, new Set());
  if (typeof moved === 'string') return { state, events: [{ type: 'blocked', reason: moved, dir }] };
  const objects = { ...state.objects };
  let player = state.player;
  for (const [id, to] of moved) id === 'player' ? (player = to) : (objects[id] = to);
  const { state: settled, awakened } = settle(world, { player, objects, awake: state.awake });
  const events = [{ type: moved.length > 1 ? 'push' : 'walk', dir, moved: moved.map(([id]) => id).filter(id => id !== 'player') }];
  for (const [id, to] of moved) if (to.sunk) events.push({ type: 'fill', id });
  // Passing through an arch: leaving this room through its container's arch (even when the container stands in
  // this very room, as the world box does), or stepping into a box's arch.
  const p0 = state.player, [dx, dy] = dirs[dir], g = world.rooms[p0.room].grid;
  const offEdge = p0.x + dx < 0 || p0.y + dy < 0 || p0.x + dx >= g[0].length || p0.y + dy >= g.length;
  const ahead = offEdge ? null : occupancy(state).get(key({ room: p0.room, x: p0.x + dx, y: p0.y + dy }));
  if (offEdge) events.push({ type: 'exit', box: world.containerOf[p0.room], from: p0.room, to: player.room });
  else if (ahead && ahead !== 'player' && world.objects[ahead].interior && archOpen(world, state, ahead, opposite[dir]))
    events.push({ type: 'enter', box: ahead, from: p0.room, to: player.room });
  for (const b of awakened) events.push({ type: 'awaken', basin: b });
  return { state: settled, events };
}

export const complete = (world, state) => state.awake.includes(world.heart);

export function validState(world, state) {
  try {
    const ok = (p, mover) => p && world.rooms[p.room] && Number.isInteger(p.x) && Number.isInteger(p.y) &&
      walkable(cellAt(world, state, p.room, p.x, p.y), mover);
    if (!ok(state.player, 'player') || !Array.isArray(state.awake) || !state.awake.every(isBasin)) return false;
    if (Object.keys(state.objects).sort().join() !== Object.keys(world.objects).sort().join()) return false;
    const sunk = Object.values(state.objects).filter(p => p.sunk);
    if (!sunk.every(p => world.rooms[p.room].grid[p.y]?.[p.x] === '_')) return false;
    if (new Set(sunk.map(key)).size !== sunk.length) return false;
    if (!Object.entries(state.objects).every(([id, p]) => p.sunk ? !world.objects[id].interior : ok(p, id))) return false;
    return occupancy(state).size === Object.keys(state.objects).length - sunk.length + 1;
  } catch {
    return false;
  }
}
