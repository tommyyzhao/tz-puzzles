import test from 'node:test';
import assert from 'node:assert/strict';
import { prepare, initial, step, water, validState, key, complete, supplyPath } from './model.mjs';
import { build, clearings, origin } from './world.mjs';
import { solve, without } from './solve.mjs';

const pipeRoom = { grid: ['#####', '#...#', '~~~~~', '#...#', '#####'] };
const make = (grid, objects, start = { room: 'v', x: 1, y: 1 }, extra = {}) =>
  prepare({ heart: '0', start, rooms: { v: { grid }, p: pipeRoom, ...extra }, objects });
const play = (world, s, moves) => moves.split(' ').reduce((st, m) => step(world, st, m).state, s);

const valley = [
  '####.####',
  '#.......#',
  '#.......#',
  '#S~~.~~0#',
  '#########',
];
const pipe = { room: 'v', x: 4, y: 1, interior: 'p', arches: ['left', 'right'] };

test('walking into an arch enters; leaving by the far arch exits beside the box', () => {
  const w = make(valley, { pipe });
  let s = play(w, initial(w), 'right right right');
  assert.deepEqual(s.player, { room: 'p', x: 0, y: 2 });
  assert.deepEqual(s.objects.pipe, { room: 'v', x: 4, y: 1 });
  s = play(w, s, 'right right right right right');
  assert.deepEqual(s.player, { room: 'v', x: 5, y: 1 });
});

test('a solid face pushes the box; a box pushed onto a channel gap carries water through its arches', () => {
  const w = make(valley, { pipe }, { room: 'v', x: 4, y: 0 });
  let s = step(w, initial(w), 'down').state;
  assert.deepEqual(s.objects.pipe, { room: 'v', x: 4, y: 2 });
  assert.deepEqual(s.awake, []);
  const r = step(w, s, 'down');
  assert.deepEqual(r.state.objects.pipe, { room: 'v', x: 4, y: 3 });
  assert.deepEqual(r.state.awake, ['0']);
  assert.ok(r.events.some(e => e.type === 'awaken' && e.basin === '0'));
  assert.ok(water(w, r.state).wet.has(key({ room: 'p', x: 2, y: 2 })));
});

test('a box turned the wrong way dams the channel', () => {
  const w = make(valley, { pipe: { ...pipe, arches: ['up', 'down'] } }, { room: 'v', x: 4, y: 0 });
  const s = play(w, initial(w), 'left down right');
  assert.deepEqual(s.objects.pipe, { room: 'v', x: 4, y: 1 }, 'pushing into the up arch enters instead');
});

test('stones pushed into an arch land inside, and the next entrant pushes them on', () => {
  const w = make(valley, { pipe, rock: { room: 'v', x: 2, y: 1 } });
  let s = play(w, initial(w), 'right right');
  assert.deepEqual(s.objects.rock, { room: 'p', x: 0, y: 2 });
  s = step(w, s, 'right').state;
  assert.deepEqual(s.player, { room: 'p', x: 0, y: 2 });
  assert.deepEqual(s.objects.rock, { room: 'p', x: 1, y: 2 });
});

test('boxes nest, and a box cannot be pushed inside something it contains', () => {
  const w = make(valley, {
    pipe,
    crate: { room: 'v', x: 2, y: 1, interior: 'c', arches: ['up'] },
  }, undefined, { c: { grid: ['#.#', '#.#', '###'] } });
  let s = play(w, initial(w), 'right');
  assert.deepEqual(s.objects.crate, { room: 'v', x: 3, y: 1 });
  s = step(w, s, 'right').state;
  assert.deepEqual(s.objects.crate, { room: 'p', x: 0, y: 2 }, 'crate nested in pipe');
  // The world box contains everything in its valley, so it can never be pushed into one of them.
  const v2 = prepare({ heart: '0', start: { room: 'v', x: 1, y: 2 },
    rooms: { v: { grid: ['#####', '#...#', '#...#', '#...#', '#####'] }, p: pipeRoom },
    objects: { world: { room: 'v', x: 2, y: 2, interior: 'v', arches: ['up'] }, pipe: { room: 'v', x: 3, y: 2, interior: 'p', arches: ['left', 'right'] } } });
  const r = step(v2, initial(v2), 'right');
  assert.deepEqual(r.events[0], { type: 'blocked', reason: 'self', dir: 'right' });
});

test('the world box contains the room it stands in', () => {
  const w = prepare({
    heart: '0', start: { room: 'v', x: 1, y: 2 },
    rooms: { v: { grid: ['#####', '#...#', '.....', '#...#', '#####'] } },
    objects: { world: { room: 'v', x: 2, y: 2, interior: 'v', arches: ['left', 'right'] } },
  });
  let s = step(w, initial(w), 'right').state;
  assert.deepEqual(s.player, { room: 'v', x: 0, y: 2 }, 'entering the world box lands at the valley edge');
  const out = step(w, s, 'left');
  s = out.state;
  assert.deepEqual(s.player, { room: 'v', x: 1, y: 2 }, 'leaving the valley edge arrives beside the box');
  assert.ok(out.events.some(e => e.type === 'exit' && e.box === 'world'), 'leaving through the world box is an exit even within one room');
  const blocked = step(w, play(w, s, 'up right'), 'down');
  assert.equal(blocked.events[0].type, 'push');
});

test('blocked moves report a reason and return the same state', () => {
  const w = make(valley, { pipe });
  const s = initial(w), r = step(w, s, 'up');
  assert.equal(r.state, s);
  assert.deepEqual(r.events, [{ type: 'blocked', reason: 'wall', dir: 'up' }]);
  assert.ok(validState(w, s));
  assert.ok(!validState(w, { ...s, player: { room: 'v', x: 0, y: 0 } }));
  assert.ok(!validState(w, { ...s, player: { room: 'v', x: 4, y: 1 } }), 'overlap rejected');
});

// ---- Authored valley ----

import { witness, witnessMoves } from './witness.mjs';
const vale = prepare(build());

test('the vale composes, starts dormant and is completed by the witness', () => {
  let s = initial(vale);
  assert.deepEqual(s.awake, []);
  assert.ok(validState(vale, s));
  for (const m of witnessMoves) {
    const before = JSON.stringify(s);
    const r = step(vale, s, m);
    assert.equal(JSON.stringify(s), before, 'step must not mutate its input');
    assert.notEqual(r.events[0].type, 'blocked', `witness move ${m} blocked: ${r.events[0].reason}`);
    s = r.state;
    assert.ok(validState(vale, s));
  }
  assert.ok(complete(vale, s));
  assert.deepEqual(s.awake, ['0', '1', '2', '3', '4', '5', '6']);
});

test('the finale needs the world box: water leaving the valley comes out of it', () => {
  let s = initial(vale);
  for (const m of witnessMoves) s = step(vale, s, m).state;
  // With the world box's arch closed, the same arrangement leaves the heart dry.
  const sealed = prepare({ ...build(), objects: { ...build().objects, world: { ...build().objects.world, arches: [] } } });
  assert.ok(!water(sealed, { ...s, awake: s.awake.filter(b => b !== '0') }).basins.has('0'));
  assert.ok(water(vale, { ...s, awake: s.awake.filter(b => b !== '0') }).basins.has('0'));
});

test('each clearing gate stays shut until its basin wakes', () => {
  for (const c of clearings.filter(c => c.basin && c.basin !== '0' && c.exit)) {
    const [ox, oy] = origin(c), ch = vale.rooms.v.grid[oy + c.exit[1]][ox + c.exit[0]];
    if (ch >= 'a' && ch <= 'j') assert.equal(String(ch.charCodeAt(0) - 97), c.basin, c.id);
  }
});

test('the finale is one connected system: the fork, the pipe and the world box all carry the final water', () => {
  let s = initial(vale);
  for (const m of witnessMoves) s = step(vale, s, m).state;
  const dry = { ...s, awake: s.awake.filter(b => b !== '0') };
  assert.ok(water(vale, dry).basins.has('0'));
  for (const id of ['tee', 'pipe', 'world']) {
    const w = without(build(), { object: id }), objects = { ...dry.objects };
    delete objects[id];
    assert.ok(!water(w, { ...dry, objects }).basins.has('0'), `${id} is part of the final flow`);
  }
});

test('the finale path the camera follows starts at a spring, threads the tee and the pipe, and ends in the heart', () => {
  let s = initial(vale);
  for (const m of witnessMoves) s = step(vale, s, m).state;
  const path = supplyPath(vale, s, vale.heart), first = path[0], last = path.at(-1);
  assert.equal(vale.rooms[first.room].grid[first.y][first.x], 'S');
  assert.equal(vale.rooms[last.room].grid[last.y][last.x], vale.heart);
  for (const room of ['tee', 'pipe']) assert.ok(path.some(p => p.room === room), room);
  // Each step is one cell, except where the river leaves the valley's edge and comes out of the stone box.
  const jumps = path.slice(1).filter((p, i) => p.room === path[i].room && Math.abs(p.x - path[i].x) + Math.abs(p.y - path[i].y) > 1);
  assert.equal(jumps.length, 1);
});

test('water pouring out of an arch onto dry ground is a spill: shown, never stored', () => {
  let s = initial(vale);
  const at = witnessMoves.length - 10;           // the stone box is open, before the last pushes
  for (const m of witnessMoves.slice(0, at)) s = step(vale, s, m).state;
  const { spills } = water(vale, s), box = s.objects.world;
  assert.deepEqual(spills.map(p => [p.room, p.x, p.y, p.dir]), [['v', box.x + 1, box.y, 'right']], 'the stone box spills from its east arch');
  for (const m of witnessMoves.slice(at)) s = step(vale, s, m).state;
  assert.deepEqual(water(vale, s).spills, [], 'once the box feeds a channel there is no spill');
});

test('the sealed stone box reports why it will not move', () => {
  const w = prepare({ ...build(), start: { room: 'v', x: 12, y: 28 } });
  const r = step(w, initial(w), 'right');
  assert.deepEqual(r.events[0], { type: 'blocked', reason: 'sealed', dir: 'right' });
});

import { rewindArea, areaOf } from './world.mjs';

test('rewind puts a clearing back as it began, keeps woken pools, and rescues a stranded crossing', () => {
  let s = initial(vale);
  for (const m of witnessMoves.slice(0, 186)) s = step(vale, s, m).state;   // basin 6 just woke
  // A player can strand the cart and pipe against the west wall; the river then never reaches the valley's edge.
  const stuck = { ...s, player: { room: 'v', x: 28, y: 16 }, objects: { ...s.objects, pipe: { room: 'v', x: 21, y: 15 }, cart: { room: 'v', x: 21, y: 17 } } };
  assert.ok(validState(vale, stuck));
  assert.ok(!water(vale, stuck).wet.has(key({ room: 'v', x: 30, y: 15 })));
  assert.equal(areaOf(vale, stuck), 'crossing');
  const r = rewindArea(vale, stuck, 'crossing');
  assert.ok(validState(vale, r));
  assert.deepEqual(r.awake, stuck.awake, 'woken pools stay awake');
  for (const id of ['cart', 'pipe']) assert.deepEqual(r.objects[id], { room: vale.objects[id].room, x: vale.objects[id].x, y: vale.objects[id].y });
  const free = ['cart', 'pipe'], raw = build();
  const crossingOnly = prepare({ ...raw, objects: Object.fromEntries(Object.entries(raw.objects).map(([id, o]) => [id, free.includes(id) ? o : { ...o, fixed: true }])) });
  assert.ok(solve(crossingOnly, r, t => water(vale, t).wet.has(key({ room: 'v', x: 30, y: 15 })), 100000).path, 'solvable again');
  assert.equal(rewindArea(vale, initial(vale), 'meadow'), null, 'nothing to put back in an untouched clearing');
});

test('rewinding any clearing at any point of the witness gives a valid state', () => {
  let s = initial(vale);
  witnessMoves.forEach((m, i) => {
    s = step(vale, s, m).state;
    if (i % 7) return;
    for (const c of clearings) { const r = rewindArea(vale, s, c.id); if (r) assert.ok(validState(vale, r), `${c.id} at move ${i}`); }
  });
});

test('any clearing can be rewound later, from anywhere, without touching the others', () => {
  let s = initial(vale);
  for (const m of witnessMoves.slice(0, 186)) s = step(vale, s, m).state;
  for (const c of clearings) {
    const r = rewindArea(vale, s, c.id);
    if (!r) continue;
    assert.ok(validState(vale, r), c.id);
    assert.deepEqual(r.awake, s.awake, `${c.id}: woken pools stay awake`);
    for (const [id, o] of Object.entries(vale.objects)) {
      if (o.home === c.id) assert.deepEqual({ ...r.objects[id] }, { room: o.room, x: o.x, y: o.y }, `${id} back home`);
      else if (areaOf(vale, s, s.objects[id]) !== c.id) assert.deepEqual(r.objects[id], s.objects[id], `${c.id} left ${id} alone`);
    }
  }
  // From the crossing, rewind the meadow (finished long ago): the dam and stone box go home.
  const far = rewindArea(vale, s, 'meadow');
  assert.ok(far && far.player.room === 'v' && areaOf(vale, far) === 'crossing', 'player stays in the crossing');
});
