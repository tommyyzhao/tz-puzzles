// The authored valley: seven 11×11 clearings sharing borders in one 31×31 room `v`, walked clockwise
// around a dry heart. The whole valley is also the inside of a small stone box standing in the meadow.
// That box has one arch, facing east, so the valley's east edge (the crossing) opens out beside it.
// Legend lives in model.mjs. Gate letter = the basin it waits for (a↔0, b↔1 …). Object coordinates are
// local to their clearing unless they name another room. Solutions live only in goldenhills.test.mjs and witness.mjs.

import { restore, key } from './model.mjs';

export const STEP = 10;
// Spoiler-light nudges for the end, once the stone box is open and the heart is still dry.
export const heartHints = ['Water is pouring out of the stone box.', 'The stone box can be pushed now. The old oak’s channel is dry.'];

export const clearings = [
  { id: 'meadow', at: [1, 2], basin: '1', name: 'Foxtail Meadow', entry: [5, 8], exit: [0, 5], hints: ['The pool wants the spring’s water.', 'Stones dam water. Something is in its way.'], block: [
    '####a%#####',
    '#....~....#',
    '#....~....#',
    '#....~....#',
    '#....~....#',
    'b.........#',
    '#S~~~~~~1.#',
    '#.........#',
    '#.........#',
    '#..=......#',
    '###########',
  ], objects: {
    dam: { x: 5, y: 6 },
    world: { x: 3, y: 8, interior: 'v', arches: ['right'], seal: '6', name: 'the stone box', tint: 0xcfc6b8 },
  } },
  { id: 'hollow', at: [0, 2], basin: '2', name: 'Well Hollow', exit: [5, 0], hints: ['Water runs through a box’s arches, in one side and out another.', 'What stands inside the well-house matters as much as where the house stands.'], block: [
    '#####c#####',
    '#...._....#',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........b',
    '#....~~~2.#',
    '#.........#',
    '#.........#',
    '#.........#',
    '###########',
  ], objects: {
    keep: { x: 4, y: 3, interior: 'keep', arches: ['left', 'right'], name: 'the well-house', tint: 0xe6d6b8 },
    pebble: { room: 'keep', x: 2, y: 2 },
  }, rooms: { keep: { grid: [
    '#####',
    '#S..#',
    '.+~~~',
    '#.#.#',
    '#####',
  ] } } },
  { id: 'bend', at: [0, 1], basin: '3', name: 'Creek Bend', exit: [5, 0], hints: ['The elbow turns whatever passes through it.', 'Things can be carried out of a box as well as into it.'], block: [
    '#####d#####',
    '#####._####',
    '######.3###',
    '#......~..#',
    '#......~..#',
    '#S~~~~~...#',
    '#.........#',
    '#.........#',
    '#.........#',
    '#.........#',
    '#####c#####',
  ], objects: {
    elbow: { x: 8, y: 8, interior: 'elbow', arches: ['left', 'up'], name: 'the elbow', tint: 0xd5e0c4 },
    chip: { room: 'elbow', x: 2, y: 2 },
  }, rooms: { elbow: { grid: [
    '##~##',
    '#.~.#',
    '~~~.#',
    '#...#',
    '#####',
  ] } } },
  { id: 'ford', at: [0, 0], basin: '4', name: 'Willow Ford', exit: [10, 2], hints: ['Flowing water stops you, but not a stone.', 'Sometimes the water has to stop before you can cross.'], block: [
    '###########',
    '#.........#',
    '#.........e',
    '#.........#',
    '###~~~~~~4#',
    '###~##.####',
    '#.=~......#',
    '#..S......#',
    '#.........#',
    '#.........#',
    '#####d#####',
  ], objects: {
    plug: { x: 3, y: 6 },
  } },
  { id: 'ravine', at: [1, 0], basin: null, name: 'Rock Gully', exit: [10, 2], hints: ['A stone pushed into a chasm fills it.', 'The turning-house turns stones as well as water.'], block: [
    '###########',
    '###########',
    'e.#...__...',
    '#.#.#######',
    '#.#.#######',
    '#.#.#######',
    '#.#.#######',
    '#.#.#######',
    '#.....#####',
    '###########',
    '###########',
  ], objects: {
    turn: { x: 3, y: 2, interior: 'turn', arches: ['down', 'right'], name: 'the turning-house', tint: 0xe3cfc4 },
    s1: { x: 3, y: 5 },
    s2: { x: 3, y: 6 },
  }, rooms: { turn: { grid: [
    '#####',
    '#...#',
    '#...#',
    '#....',
    '#...#',
    '#...#',
    '##.##',
  ] } } },
  { id: 'fork', at: [2, 0], basin: '5', name: 'Twin Springs', exit: [5, 10], hints: ['A box with three arches splits a river.', 'Which way does each arch face, and where should each branch go?'], block: [
    '###########',
    '#.........#',
    '..........#',
    '#.........#',
    '#.........#',
    '#S~~.~~~~~#',
    '###.%###.~#',
    '#...~~##.~#',
    '#..5~###.~#',
    '###%#####.#',
    '###%#f~~~~#',
  ], objects: {
    tee: { x: 4, y: 4, interior: 'tee', arches: ['left', 'right', 'down'], name: 'the fork-house', tint: 0xcadbe2 },
    pebble2: { room: 'tee', x: 2, y: 3 },
  }, rooms: { tee: { grid: [
    '#####',
    '#.#.#',
    '~~~~~',
    '#.~.#',
    '##~##',
  ] } } },
  { id: 'crossing', at: [2, 1], basin: '6', name: 'The Crossing', exit: [10, 5], hints: ['Boxes can go inside boxes.', 'One box can carry another where it could not go alone.'], block: [
    '###%#f~~~~#',
    '#..~..#####',
    '#..~......#',
    '#..~......#',
    '#..~.....g#',
    '#.~~.~~~6++',
    '#........g#',
    '#.........#',
    '#.........#',
    '#.........#',
    '###########',
  ], objects: {
    cart: { x: 7, y: 7, interior: 'cart', arches: ['up', 'down'], name: 'the cart', tint: 0xe6deb4 },
    pipe: { x: 7, y: 8, interior: 'pipe', arches: ['left', 'right'], name: 'the pipe', tint: 0xd6cce4 },
  }, rooms: {
    cart: { grid: ['#.#', '#.#', '#.#'] },
    pipe: { grid: ['###', '~~~', '###'] },
  } },
  { id: 'heart', at: [1, 1], basin: '0', name: 'The Old Oak', block: [
    '###########',
    '#.........#',
    '#.........#',
    '#...000...#',
    '#...000...#',
    '#...000...#',
    '#....~....#',
    '#....~....#',
    '#....~....#',
    '#....~....#',
    '####a%#####',
  ] },
];

export const origin = c => [c.at[0] * STEP, c.at[1] * STEP];
// The clearing containing a cell. Gateway cells on a shared border belong to the clearing whose exit they are.
export const clearingAt = (x, y) =>
  clearings.find(c => { const [ox, oy] = origin(c); return x > ox && y > oy && x < ox + STEP && y < oy + STEP; }) ??
  clearings.find(c => { const [ox, oy] = origin(c); return c.exit && ox + c.exit[0] === x && oy + c.exit[1] === y; });

export function build(list = clearings) {
  const n = STEP * 3 + 1, grid = Array.from({ length: n }, () => Array(n).fill(null));
  const objects = {}, rooms = {};
  for (const c of list) {
    const [ox, oy] = origin(c);
    c.block.forEach((row, y) => [...row].forEach((ch, x) => {
      const prev = grid[oy + y][ox + x];
      if (prev !== null && prev !== '#' && ch !== '#' && prev !== ch) throw new Error(`${c.id} disagrees with a neighbour at ${x},${y}`);
      if (prev === null || prev === '#') grid[oy + y][ox + x] = ch;
    }));
    for (const [id, o] of Object.entries(c.objects ?? {}))
      objects[id] = o.room ? { ...o, home: c.id } : { ...o, home: c.id, room: 'v', x: ox + o.x, y: oy + o.y };
    Object.assign(rooms, c.rooms);
  }
  const [sx, sy] = origin(list[0]);
  return {
    heart: '0',
    start: { room: 'v', x: sx + list[0].entry[0], y: sy + list[0].entry[1] },
    rooms: { v: { grid: grid.map(r => r.map(ch => ch ?? '#').join('')) }, ...rooms },
    objects,
  };
}

// The clearing a state's player is in, looking out through any boxes they are inside.
export function areaOf(world, s, p = s.player) {
  for (let i = 0; i < 12 && p && p.room !== 'v'; i++) p = s.objects[world.containerOf[p.room]];
  return p?.room === 'v' ? clearingAt(p.x, p.y)?.id ?? null : null;
}

// Rewind: put clearing `id` back as it was at the very start: every object that began there, anything that has strayed
// into it, and anything sitting where those belong. Pools already awake stay awake. The player stays put if they can,
// otherwise they stand just inside the way in. Returns null when there is nothing to put back.
function rewindSet(world, s, id) {
  const ids = new Set(Object.keys(s.objects).filter(o => world.objects[o].home === id || areaOf(world, s, s.objects[o]) === id));
  for (let n = 0; n < 20; n++) {
    const homes = new Set([...ids].map(o => key(world.objects[o])));
    const more = Object.keys(s.objects).filter(o => !ids.has(o) && !s.objects[o].sunk && homes.has(key(s.objects[o])));
    if (!more.length) break;
    more.forEach(o => ids.add(o));
  }
  return ids;
}
const moved = (world, s, ids) => [...ids].some(o => { const a = s.objects[o], b = world.objects[o]; return a.room !== b.room || a.x !== b.x || a.y !== b.y || a.sunk; });
// Cheap check: has anything in clearing `id` moved from where it began?
export const rewindable = (world, s, id) => moved(world, s, rewindSet(world, s, id));
export function rewindArea(world, s, id) {
  const c = clearings.find(c => c.id === id);
  if (!c) return null;
  const ids = rewindSet(world, s, id);
  if (!moved(world, s, ids)) return null;
  // The player stays put if they can; otherwise they stand just inside the way in, or failing that on the nearest
  // free floor of the clearing, so a rewind is always possible.
  const [ox, oy] = origin(c), p0 = s.player.room === 'v' ? s.player : { x: ox + 5, y: oy + 5 }, floor = [];
  for (let y = oy; y <= oy + STEP; y++) for (let x = ox; x <= ox + STEP; x++) if (clearingAt(x, y) === c) floor.push({ room: 'v', x, y });
  floor.sort((a, b) => Math.abs(a.x - p0.x) + Math.abs(a.y - p0.y) - Math.abs(b.x - p0.x) - Math.abs(b.y - p0.y));
  for (const at of [s.player, ...entryCells(c), ...floor]) {
    const r = restore(world, s, [...ids], at);
    if (r) return r;
  }
  return null;
}
// Where a player arriving in clearing `c` stands: one step inside its way in, then the way in itself.
function entryCells(c) {
  const i = clearings.indexOf(c), [ox, oy] = origin(c);
  if (i === 0) return [{ room: 'v', x: ox + c.entry[0], y: oy + c.entry[1] }];
  const p = clearings[i - 1], [px, py] = origin(p), gate = { room: 'v', x: px + p.exit[0], y: py + p.exit[1] };
  const inside = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => ({ room: 'v', x: gate.x + dx, y: gate.y + dy }))
    .filter(q => clearingAt(q.x, q.y) === c && !(q.x === gate.x && q.y === gate.y));
  return [...inside, gate];
}
