import test from 'node:test';
import assert from 'node:assert/strict';
import { history } from './history.mjs';
import { stations, playableStations, parseRoute, routeKey, routeURL, validSnapshot, snapshots } from './session.mjs';
import { spokeLevels, spokeRound, spokesInitial, spokesNext, spokesStep, spokesWon } from './spokes.mjs';
import { archiveStep, cases, records } from './archive.mjs';

const route = (station, encounter = 0, condition = 'full', study = false) => ({ station, encounter, condition, study });
const memoryStorage = () => { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k), data }; };

test('routes validate station, level, condition; round-trip study isolation', () => {
  for (const id of [null, '', 'bad', '__proto__', 'constructor']) assert.equal(parseRoute(`?station=${id}`).station, null);
  assert.deepEqual(playableStations.map(([id]) => id), ['panel', 'bench', 'tiles', 'pocket', 'drift', 'spokes']);
  assert.deepEqual(parseRoute('?station=archive&encounter=1&condition=finding&study=1'), route(null, 0, 'full', true));
  for (const [id] of playableStations) for (const condition of stations[id].conditions) for (let encounter = 0; encounter < stations[id].levels.length; encounter++) {
    const r = route(id, encounter, condition, true);
    assert.deepEqual(parseRoute(routeURL(r)), r);
    assert.notEqual(routeKey(r), routeKey({ ...r, study: false }));
  }
  for (const encounter of ['-1', 'NaN', 'Infinity', '0.5', '999']) assert.equal(parseRoute(`?station=tiles&encounter=${encounter}`).encounter, 0);
  assert.equal(parseRoute('?station=pocket&condition=given').condition, 'full');
  assert.deepEqual(parseRoute(''), route(null));
});

test('history supports redo, branching, no-op, undoable restart and hard reset', () => {
  const h = history({ n: 0 });
  assert.equal(h.canUndo, false); assert.equal(h.canRedo, false);
  h.apply({ n: 1 }); h.apply({ n: 2 }); h.undo(); assert.equal(h.state.n, 1);
  h.apply({ n: 1 }); assert.equal(h.canRedo, true);
  h.redo(); assert.equal(h.state.n, 2);
  h.apply({ n: 0 }); h.undo(); assert.equal(h.state.n, 2);
  h.undo(); h.apply({ n: 3 }); assert.equal(h.canRedo, false);
  h.reset(); assert.deepEqual(h.state, { n: 0 }); assert.equal(h.canUndo, false); assert.equal(h.canRedo, false);
});

test('all initial snapshots accepted; malformed data rejected without throws', () => {
  for (const [id, config] of Object.entries(stations)) config.levels.forEach((level, i) => {
    const r = route(id, i), initial = config.initial(level);
    assert.equal(validSnapshot(r, initial), true, id);
    for (const invalid of [null, [], {}, 4, { player: null, boxes: [null], balls: [null], tiles: [null] }]) assert.equal(validSnapshot(r, invalid), false, id);
    for (const key of Object.keys(initial)) assert.equal(validSnapshot(r, { ...initial, [key]: null }), false, `${id}.${key}`);
  });
  assert.equal(validSnapshot(route('constructor'), {}), false);
  assert.equal(validSnapshot(route('tiles', 999), {}), false);
  const pocket = stations.pocket.initial(stations.pocket.levels[1]);
  pocket.boxes[0].room = 'B'; assert.equal(validSnapshot(route('pocket', 1), pocket), false);
  const tiles = stations.tiles.initial(stations.tiles.levels[0]);
  tiles.tiles[0].x++; assert.equal(validSnapshot(route('tiles'), tiles), false);
});

test('snapshots isolate levels, conditions and study; tolerate corrupt/disabled storage', () => {
  const storage = memoryStorage(), store = snapshots(storage), r = route('panel'), state = { walls: [0], feedback: '' };
  assert.equal(store.available(), true); assert.equal(store.save(r, state), true);
  assert.deepEqual(store.load(r), state);
  for (const other of [route('panel', 1), route('panel', 0, 'given'), route('panel', 0, 'full', true)]) assert.equal(store.load(other), null);
  assert.equal(store.save(route('panel', 0, 'full', true), state), false);
  for (const raw of ['{', 'null', '{"walls":[999],"feedback":""}', ' '.repeat(30001)]) {
    storage.setItem(`tz-puzzles:studio-v4:${routeKey(r)}`, raw); assert.equal(store.load(r), null);
  }
  for (const denied of [null, { getItem() { throw Error('disabled'); }, setItem() { throw Error('quota'); } }]) {
    const unavailable = snapshots(denied); assert.equal(unavailable.available(), false); assert.equal(unavailable.load(r), null); assert.equal(unavailable.save(r, state), false);
  }
});

test('archive checkpoints exclude query logs; only checked reports retain completion', () => {
  const storage = memoryStorage(), store = snapshots(storage), r = route('archive'), c = cases[0];
  let state = stations.archive.initial();
  for (const record of records(c)) state = archiveStep(c, 'full', state, { type: 'query', query: record });
  state = archiveStep(c, 'full', state, { type: 'draft', identity: 'Bo', cause: 'power' });
  store.save(r, state); assert.equal(store.load(r).feedback, '');
  state = archiveStep(c, 'full', state, { type: 'report', identity: 'Bo', cause: 'power' });
  assert.equal(store.save(r, state), true);
  assert.deepEqual(store.load(r).queries, []);
  assert.equal(store.load(r).feedback, 'Report supported by the available evidence.');
  assert.equal(validSnapshot(r, { ...store.load(r), identity: 'Ari' }), false);
  assert.equal(JSON.stringify([...storage.data.values()]).includes('person'), false);
});

test('Spokes accepts both first answers, then requires the opposite directed answer', () => {
  assert.equal(spokeLevels.length, 2);
  assert.deepEqual(spokeLevels[0].values, [5, 6, 7, 8, 10, 18, 28, null]);
  assert.deepEqual(spokeRound(spokeLevels[1], 8).values, spokeLevels[0].values);
  assert.deepEqual(spokeRound(spokeLevels[1], 40).values, [5, 6, 7, null, 10, 18, 28, 40]);
  assert.equal(spokeRound(spokeLevels[1], 8).direction, 1);
  assert.equal(spokeRound(spokeLevels[1], 40).direction, -1);
  assert.throws(() => spokeRound(spokeLevels[1], 60), TypeError);
  const check = (level, state, answer) => spokesStep(level, spokesStep(level, state, { type: 'draft', answer: String(answer) }), { type: 'submit' });
  assert.equal(spokesNext(spokesInitial()), null);
  for (const firstAnswer of [8, 40]) {
    const first = check(spokeLevels[0], spokesInitial(), firstAnswer);
    assert.equal(spokesWon(spokeLevels[0], first), true);
    const next = spokesNext(first), level = spokeLevels[1], expected = firstAnswer === 8 ? 40 : 8;
    assert.equal(next.firstAnswer, firstAnswer);
    assert.equal(spokesNext(first, next), next);
    assert.equal(spokesWon(level, check(level, next, firstAnswer)), false);
    assert.equal(spokesWon(level, check(level, next, 60)), false);
    const h = history(next);
    h.apply(check(level, h.state, expected)); assert.equal(spokesWon(level, h.state), true);
    h.undo(); assert.equal(spokesWon(level, h.state), false); h.redo(); assert.equal(spokesWon(level, h.state), true);
    h.apply(spokesInitial(level, h.state.firstAnswer)); assert.equal(h.state.firstAnswer, firstAnswer);
    h.undo(); assert.equal(spokesWon(level, h.state), true);
    assert.equal(spokesNext(check(spokeLevels[0], first, expected), h.state).answer, '');
    const store = snapshots(memoryStorage()), r = route('spokes', 1);
    assert.equal(store.save(r, h.state), true); assert.deepEqual(store.load(r), h.state);
    assert.equal(validSnapshot(r, { ...h.state, firstAnswer: expected }), false);
  }
  for (const [level, initial, answers] of [[spokeLevels[0], spokesInitial(), [8, 40]], [spokeLevels[1], spokesInitial(spokeLevels[1], 8), [40]], [spokeLevels[1], spokesInitial(spokeLevels[1], 40), [8]]]) {
    Object.freeze(initial);
    for (const answer of ['-1', '1.5', '1e2', '10000', 'abc', null, 40]) assert.equal(spokesStep(level, initial, { type: 'draft', answer }), initial);
    assert.equal(spokesStep(level, initial, { type: 'submit' }).feedback, 'Enter a whole number first.');
    const accepted = [];
    for (let n = 0; n <= 9999; n++) if (spokesWon(level, check(level, initial, n))) accepted.push(n);
    assert.deepEqual(accepted, answers); // Checker acceptance only, not uniqueness of a mathematical law.
    assert.equal(spokesWon(level, spokesStep(level, initial, { type: 'draft', answer: String(answers[0]) })), false);
  }
  const storage = memoryStorage();
  storage.setItem(`tz-puzzles:studio-v4:${routeKey(route('spokes', 1))}`, JSON.stringify({ answer: '60', feedback: 'Pattern completed.' }));
  assert.equal(snapshots(storage).load(route('spokes', 1)), null);
});
