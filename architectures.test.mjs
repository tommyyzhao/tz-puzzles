import test from 'node:test';
import assert from 'node:assert/strict';
import { tileLevels, tilesInitial, tilesStep, tilesWon, tileRules } from './tiles.mjs';
import { pocketLevels, pocketInitial, pocketStep, pocketWon, pocketDestination, pocketEntry } from './pocket.mjs';
import { driftLevels, driftInitial, driftStep, driftWon } from './drift.mjs';
import { history } from './history.mjs';

const moves = ['up', 'right', 'down', 'left'];
const freeze = object => {
  if (object && typeof object === 'object') { Object.freeze(object); Object.values(object).forEach(freeze); }
  return object;
};
const configs = [
  { name: 'tiles', levels: tileLevels, initial: tilesInitial, step: tilesStep, won: tilesWon, conditions: ['full', 'preset'], actions: moves, counts: [[36, 78], [11, 11]] },
  { name: 'pocket', levels: pocketLevels, initial: pocketInitial, step: pocketStep, won: pocketWon, conditions: ['full', 'forecast'], actions: [...moves, ...moves.map(d => `enter-${d}`)], counts: [[121, 121], [366, 366]] },
  { name: 'drift', levels: driftLevels, initial: driftInitial, step: driftStep, won: driftWon, conditions: ['full', 'fixed'], actions: moves, counts: [[36179, 22587], [36175, 22583]] },
];

function invariant(name, level, state) {
  const points = name === 'tiles' ? [state.player, ...state.tiles] : name === 'pocket' ? [state.player, state.cargo, ...state.boxes] : [state.player, ...state.balls];
  const key = p => `${p.room ?? ''}:${p.x},${p.y}`;
  assert.equal(new Set(points.map(key)).size, points.length);
  for (const p of points) {
    if (name === 'tiles') {
      assert.ok(p.x >= 0 && p.x < level.width && p.y >= 0 && p.y < level.height);
      assert.ok(!level.walls.some(w => w.x === p.x && w.y === p.y));
    } else {
      const space = name === 'pocket' ? level.rooms[p.room] : level;
      assert.ok(space.floor.some(([x, y]) => p.x === x && p.y === y));
    }
  }
  if (name === 'drift') {
    state.balls.forEach(b => assert.ok(b.size >= 1 && b.size <= 3));
    assert.equal(new Set(state.snow.map(String)).size, state.snow.length);
    state.snow.forEach(p => assert.ok(level.snow.some(s => String(s) === String(p))));
  }
  if (name === 'pocket') {
    for (const box of state.boxes) {
      const seen = new Set([box.id]); let parent = box.room;
      while (parent !== 'yard') { assert.ok(!seen.has(parent)); seen.add(parent); parent = state.boxes.find(b => b.id === parent).room; }
    }
  }
}

for (const config of configs) for (const [i, level] of config.levels.entries()) for (const [ci, condition] of config.conditions.entries()) {
  test(`${config.name} ${i + 1} ${condition}: complete reachable-state search`, () => {
    const initial = config.initial(level), queue = [{ state: initial, parent: -1, action: null }];
    const seen = new Map([[JSON.stringify(initial), 0]]);
    let cursor = 0, first = null, winning = 0;
    assert.equal(config.won(level, initial, condition), false);
    while (cursor < queue.length) {
      assert.ok(queue.length < 100000, 'search bound reached; no completeness claim');
      const index = cursor++, { state } = queue[index];
      invariant(config.name, level, state);
      if (config.won(level, state, condition)) { first ??= index; winning++; continue; }
      for (const action of config.actions) {
        const next = config.step(level, state, action, condition), key = JSON.stringify(next);
        if (!seen.has(key)) { seen.set(key, queue.length); queue.push({ state: next, parent: index, action }); }
      }
    }
    assert.equal(queue.length, config.counts[i][ci]);
    assert.notEqual(first, null);
    const solution = [];
    for (let node = queue[first]; node.parent !== -1; node = queue[node.parent]) solution.unshift(node.action);
    let replay = config.initial(level);
    const h = history(replay);
    for (const action of solution) {
      const before = JSON.stringify(replay);
      const next = config.step(level, freeze(replay), action, condition);
      assert.equal(JSON.stringify(replay), before);
      replay = next; h.apply(next);
    }
    assert.equal(config.won(level, replay, condition), true);
    h.undo(); assert.equal(config.won(level, h.state, condition), false);
    h.reset(); assert.deepEqual(h.state, initial); assert.equal(h.canUndo, false);
    assert.equal(config.step(level, initial, 'teleport', condition), initial);
    assert.equal(config.step(level, initial, 'constructor', condition), initial);
    assert.equal(config.step(level, initial, '__proto__', condition), initial);
    assert.equal(config.step(level, initial, null, condition), initial);
    console.log(JSON.stringify({ model: config.name, encounter: i + 1, condition, bound: 100000, explored: cursor, completed: cursor === queue.length, winning, solution }));
  });
}

test('Tiles changes class-wide laws after movement, not before', () => {
  const l = tileLevels[0], initial = tilesInitial(l);
  assert.deepEqual(tileRules(l, initial), [['star', 'goal'], ['crystal', 'solid']]);
  const beside = tilesStep(l, initial, 'right');
  assert.equal(tilesStep(l, beside, 'right'), beside);
  const broken = tilesStep(l, beside, 'up');
  assert.deepEqual(tileRules(l, broken), [['star', 'goal']]);
  assert.notDeepEqual(tilesStep(l, broken, 'right'), broken);
  assert.deepEqual(tileRules(l, broken, 'preset'), tileRules(l, initial, 'preset'));
  const t = tileLevels[1];
  const changed = tilesStep(t, tilesInitial(t), 'up');
  assert.deepEqual(tileRules(t, changed), [['crystal', 'goal']]);
  assert.equal(tileRules(t, changed).some(([kind]) => kind === 'star'), false);
});

test('Pocket preserves contained coordinates and resolves nested exits', () => {
  const l = pocketLevels[0], initial = pocketInitial(l);
  const moved = pocketStep(l, initial, 'right');
  assert.deepEqual(moved.cargo, initial.cargo);
  assert.equal(moved.boxes[0].x, initial.boxes[0].x + 1);
  assert.equal(pocketEntry(l, initial, 'right'), null, 'sealed side cannot be entered');
  const to = pocketDestination(l, moved, { room: 'A', x: 1, y: 0 }, 'up');
  assert.equal(to, null, 'exit outside available yard floor is blocked');
  const nested = pocketInitial(pocketLevels[1]);
  const fromB = pocketDestination(pocketLevels[1], nested, { room: 'B', x: 0, y: 1 }, 'left');
  assert.deepEqual(fromB, { room: 'A', x: 0, y: 1 });
  const fromA = pocketDestination(pocketLevels[1], nested, { room: 'A', x: 0, y: 1 }, 'left');
  assert.equal(fromA, null);
});

test('Drift counterexample grows small ball; fixed-size control does not', () => {
  const l = driftLevels[0], initial = driftInitial(l);
  const wrong = driftStep(l, initial, 'right');
  assert.equal(wrong.balls[0].size, 2);
  assert.equal(wrong.snow.length, initial.snow.length - 1);
  const control = driftStep(l, initial, 'right', 'fixed');
  assert.equal(control.balls[0].size, 1);
  assert.deepEqual(control.snow, wrong.snow);
  assert.deepEqual(driftStep(l, initial, 'up').snow, initial.snow, 'walking does not clear snow');
  const onSnow = { ...initial, player: { x: 3, y: 1 } };
  const capped = driftStep(l, onSnow, 'down');
  assert.equal(capped.balls[1].size, 3);
  assert.equal(capped.snow.length, initial.snow.length - 1);
  const controlTrace = ['right', 'right', 'up', 'left', 'up', 'right', 'right'];
  const full = controlTrace.reduce((s, a) => driftStep(l, s, a), initial);
  const fixed = controlTrace.reduce((s, a) => driftStep(l, s, a, 'fixed'), initial);
  assert.equal(driftWon(l, full), false); assert.equal(driftWon(l, fixed), true);
});
