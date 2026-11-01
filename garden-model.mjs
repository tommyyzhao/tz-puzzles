export const directions = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
export const same = (a, b) => a.room === b.room && a.x === b.x && a.y === b.y;
export const cellKey = p => `${p.room}:${p.x},${p.y}`;
const at = (cells, p) => cells.some(([x, y]) => p.x === x && p.y === y);
export const objectAt = (state, p) => state.objects.find(o => same(o, p));
export const complete = (world, state) => world.beds.every(b => state.grown.includes(b.id));
export function floorAt(world, state, p) {
  const room = world.rooms[p.room];
  return Boolean(room && (at(room.floor, p) || p.room === 'outside' && world.beds.some(b => state.grown.includes(b.id) && at(b.bridge ?? [], p))));
}
export function destination(world, state, from, direction, visited = new Set()) {
  if (!Object.hasOwn(directions, direction) || !world.rooms[from.room] || visited.has(from.room)) return null;
  const [dx, dy] = directions[direction], space = world.rooms[from.room];
  const to = { room: from.room, x: from.x + dx, y: from.y + dy };
  if (to.x >= 0 && to.x < space.width && to.y >= 0 && to.y < space.height) return floorAt(world, state, to) ? to : null;
  const parent = state.objects.find(o => o.kind === 'garden' && o.interior === from.room);
  if (!parent) return null;
  visited.add(from.room);
  return destination(world, state, parent, direction, visited);
}
export function entry(world, state, from, direction, forWater = false) {
  if (!Object.hasOwn(directions, direction)) return null;
  const [dx, dy] = directions[direction];
  const box = objectAt(state, { ...from, x: from.x + dx, y: from.y + dy });
  if (box?.kind === 'portal') {
    const other = state.objects.find(o => o.kind === 'portal' && o.id !== box.id && o.pair === box.pair);
    const to = other && destination(world, state, other, direction);
    return to && !objectAt(state, to) ? to : null;
  }
  if (box?.kind !== 'garden') return null;
  const room = world.rooms[box.interior];
  const to = { room: box.interior, x: dx === 0 ? Math.floor(room.width / 2) : dx > 0 ? 0 : room.width - 1, y: dy === 0 ? Math.floor(room.height / 2) : dy > 0 ? 0 : room.height - 1 };
  const occupant = objectAt(state, to);
  return floorAt(world, state, to) && (!occupant || forWater && occupant.kind === 'seed') ? to : null;
}
export function entries(world, state) {
  return Object.keys(directions).flatMap(d => { const to = entry(world, state, state.player, d); return to ? [{ direction: d, room: to.room }] : []; });
}
function channel(world, state, p) {
  const room = world.rooms[p.room];
  return room && (at(room.channels ?? [], p) || (room.sources ?? []).some(s => s[0] === p.x && s[1] === p.y) || world.beds.some(b => same(b, p)));
}
function waterDestination(world, state, from, direction) {
  const to = destination(world, state, from, direction);
  if (!to) return null;
  if (to.room !== from.room && !world.rooms[from.room].waterExits?.includes(direction)) return null;
  const obj = objectAt(state, to);
  if (obj?.kind === 'garden') return entry(world, state, from, direction, true);
  if (obj?.kind === 'stone') return null;
  if (obj?.kind === 'portal') {
    const other = state.objects.find(o => o.kind === 'portal' && o.id !== obj.id && o.pair === obj.pair);
    if (other) return { room: other.room, x: other.x, y: other.y };
  }
  return channel(world, state, to) ? to : null;
}
export function water(world, state) {
  const wet = new Map(), queue = [];
  for (const [room, space] of Object.entries(world.rooms)) for (const [x, y] of space.sources ?? []) {
    const p = { room, x, y };
    if (objectAt(state, p)?.kind !== 'stone') { wet.set(cellKey(p), p); queue.push(p); }
  }
  // A restored root draws its own water; the travelling spring can move on.
  for (const b of world.beds.filter(b => state.grown.includes(b.id))) { const p = { room: b.room, x: b.x, y: b.y }; wet.set(cellKey(p), p); queue.push(p); }
  for (let i = 0; i < queue.length; i++) for (const d of Object.keys(directions)) {
    const to = waterDestination(world, state, queue[i], d);
    if (to && !wet.has(cellKey(to))) { wet.set(cellKey(to), to); queue.push(to); }
  }
  return wet;
}
export function gardenCheckpoint(world, state) {
  const region = regionOf(world, state);
  if (!world.regions.slice(0, world.regions.indexOf(region)).every(r => state.grown.includes(r.bed))) return false;
  // Arrival is safe only after the travelling spring reaches the same clearing.
  const spring = state.objects.find(o => o.id === 'spring');
  return state.player.room === 'outside' && (!spring || world.regions.indexOf(region) <= 1 || spring.room === 'outside' && spring.x >= region.x && spring.x < region.x + region.width && spring.y >= region.y && spring.y < region.y + region.height);
}
function settle(world, state) {
  const wet = water(world, state);
  for (const o of state.objects) if (o.kind === 'seed' && wet.has(cellKey(o))) o.rooted = true;
  for (const b of world.beds) if (!state.grown.includes(b.id) && state.objects.some(o => o.kind === 'seed' && o.rooted && same(o, b))) state.grown.push(b.id);
  state.grown.sort();
  return state;
}
export function gardenInitial(world) { return settle(world, structuredClone({ player: world.player, objects: world.objects, grown: [] })); }
export function gardenSave(storage, key, world) {
  return {
    load() { try { const raw = storage.getItem(key); if (!raw || raw.length > 120000) return null; const data = JSON.parse(raw); return typeof data.started === 'boolean' && validGardenState(world, data.state) && validGardenState(world, data.checkpoint) && data.checkpoint.grown.every(id => data.state.grown.includes(id)) ? data : null; } catch { return null; } },
    save(data) { if (!data || typeof data.started !== 'boolean' || !validGardenState(world, data.state) || !validGardenState(world, data.checkpoint) || !data.checkpoint.grown.every(id => data.state.grown.includes(id))) return false; try { storage.setItem(key, JSON.stringify(data)); return true; } catch { return false; } },
  };
}
export function gardenStep(world, state, action) {
  if (typeof action !== 'string' || complete(world, state)) return state;
  if (action.startsWith('enter-')) {
    const to = entry(world, state, state.player, action.slice(6));
    return to ? settle(world, { ...structuredClone(state), player: to }) : state;
  }
  if (!Object.hasOwn(directions, action)) return state;
  const next = structuredClone(state);
  function push(object, seen = new Set()) {
    if (seen.has(object) || object.rooted) return false;
    seen.add(object);
    const to = destination(world, next, object, action);
    if (!to || object.kind === 'garden' && to.room === object.interior) return false;
    if (object.kind === 'garden') {
      let parent = to.room;
      const rooms = new Set([object.interior]);
      while (parent !== 'outside') {
        if (rooms.has(parent)) return false;
        rooms.add(parent); parent = next.objects.find(o => o.kind === 'garden' && o.interior === parent)?.room;
        if (!parent) return false;
      }
    }
    const occupant = objectAt(next, to);
    if (occupant && occupant !== object && !push(occupant, seen)) return false;
    Object.assign(object, to); return true;
  }
  return push(next.player) ? settle(world, next) : state;
}
export function regionOf(world, state) {
  let p = state.player;
  const seen = new Set();
  while (p.room !== 'outside') {
    if (seen.has(p.room)) return world.regions[0];
    seen.add(p.room); p = state.objects.find(o => o.kind === 'garden' && o.interior === p.room);
    if (!p) return world.regions[0];
  }
  return world.regions.find(r => p.x >= r.x && p.x < r.x + r.width && p.y >= r.y && p.y < r.y + r.height) ?? world.regions.reduce((best, r) => Math.hypot(p.x - r.x - r.width / 2, p.y - r.y - r.height / 2) < Math.hypot(p.x - best.x - best.width / 2, p.y - best.y - best.height / 2) ? r : best);
}
export function validGardenState(world, s) {
  try {
    if (!s || !Array.isArray(s.objects) || s.objects.length !== world.objects.length || !Array.isArray(s.grown) || new Set(s.grown).size !== s.grown.length || s.grown.some(id => !world.beds.some(b => b.id === id))) return false;
    if (![s.player, ...s.objects].every(p => p && Number.isInteger(p.x) && Number.isInteger(p.y) && floorAt(world, s, p))) return false;
    if (new Set([s.player, ...s.objects].map(cellKey)).size !== s.objects.length + 1) return false;
    if (s.player.room !== 'outside' && !s.objects.some(o => o.kind === 'garden' && o.interior === s.player.room)) return false;
    if (!s.objects.every((o, i) => o.id === world.objects[i].id && o.kind === world.objects[i].kind && o.interior === world.objects[i].interior && o.pair === world.objects[i].pair && (o.kind === 'seed' ? typeof o.rooted === 'boolean' : o.rooted === undefined))) return false;
    for (const box of s.objects.filter(o => o.kind === 'garden')) {
      const seen = new Set([box.interior]); let parent = box.room;
      while (parent !== 'outside') { if (seen.has(parent)) return false; seen.add(parent); parent = s.objects.find(o => o.kind === 'garden' && o.interior === parent)?.room; if (!parent) return false; }
    }
    return s.grown.every(id => { const b = world.beds.find(b => b.id === id); return s.objects.some(o => o.kind === 'seed' && o.rooted && same(o, b)); });
  } catch { return false; }
}
