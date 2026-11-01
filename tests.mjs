import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { panels, edges, regions, accepts, lawModels, consistentLaws, panelInitial, panelStep } from './panel.mjs';
import { cases, worlds, candidates, records, address, gateOpens, causeOf, visualEvidence, archiveInitial, archiveStep } from './archive.mjs';
import { benches, commands, benchInitial, benchStep, benchRun, benchEdit } from './bench.mjs';
import { history } from './history.mjs';

const freeze = value => {
  if (value && typeof value === 'object') { Object.freeze(value); Object.values(value).forEach(freeze); }
  return value;
};

function partitions(p) {
  const solutions = [];
  const n = edges(p).length;
  for (let mask = 0; mask < 2 ** n; mask++) {
    const walls = Array.from({ length: n }, (_, i) => i).filter(i => mask & 2 ** i);
    if (accepts(p, walls)) solutions.push(walls);
  }
  return { explored: 2 ** n, solutions };
}

function grouping(p, walls, symbol) {
  return regions(p, walls).filter(g => g.some(i => p.cells[i] === symbol)).length;
}

for (const [i, panel] of panels.entries()) {
  test(`panel ${i + 1}: exhaustive partitions, exact traces, full/given`, () => {
    const result = partitions(panel);
    assert.ok(result.solutions.length > 0);
    for (const solution of result.solutions) {
      let state = panelInitial();
      for (const edge of solution) {
        const before = JSON.stringify(state);
        state = panelStep(panel, freeze(state), { type: 'toggle', edge });
        assert.ok(state.walls.length <= panel.budget);
        assert.equal(new Set(state.walls).size, state.walls.length);
        assert.notEqual(JSON.stringify(state), before);
      }
      assert.equal(panelStep(panel, state, { type: 'submit' }).feedback, 'Accepted.');
    }
    if (i === 0) assert.ok(result.solutions.some(w => grouping(panel, w, 'A') === 1));
    if (i === 1) assert.ok(result.solutions.every(w => grouping(panel, w, 'A') === 2));
    console.log(JSON.stringify({ model: 'panel', encounter: i + 1, conditions: ['full', 'given'], completed: true, ...result }));
  });
}

test('panel explicitly modeled competing laws and discriminating evidence', () => {
  const observations = [{ panel: panels[0], walls: [0, 3], accepted: true }];
  assert.deepEqual(consistentLaws(observations), ['exclusion', 'grouped', 'adjacent']);
  observations.push({ panel: panels[1], walls: [0, 2, 5, 6], accepted: true });
  assert.deepEqual(consistentLaws(observations), ['exclusion', 'adjacent']);
  const p = panels[2];
  const walls = edges(p).flatMap(([a, b], i) => p.cells[a] !== '.' && p.cells[b] !== '.' && p.cells[a] !== p.cells[b] ? [i] : []);
  assert.equal(lawModels(p, walls).adjacent, true);
  assert.equal(accepts(p, walls), false);
  observations.push({ panel: p, walls, accepted: false });
  assert.deepEqual(consistentLaws(observations), ['exclusion']);
  console.log(JSON.stringify({ model: 'panel-hypotheses', counts: [3, 2, 1], adjacentCounterexample: walls, scope: 'three named models only' }));
});

test('panel invalid actions, budget, undo and reset', () => {
  const p = panels[0], initial = panelInitial();
  assert.equal(accepts(p, [-1]), false);
  assert.equal(accepts(p, [0, 0]), false);
  assert.equal(accepts(p, null), false);
  assert.equal(panelStep(p, initial, { type: 'toggle', edge: -1 }), initial);
  assert.equal(panelStep(p, initial, { type: 'toggle', edge: 0.5 }), initial);
  assert.equal(panelStep(p, initial, { type: 'other' }), initial);
  const h = history(initial);
  h.apply(panelStep(p, h.state, { type: 'toggle', edge: 0 }));
  h.apply(panelStep(p, h.state, { type: 'toggle', edge: 1 }));
  const full = h.state;
  assert.deepEqual(panelStep(p, full, { type: 'toggle', edge: 2 }).walls, full.walls);
  h.undo(); assert.deepEqual(h.state.walls, [0]);
  h.apply(panelStep(p, h.state, { type: 'toggle', edge: 0 })); assert.deepEqual(h.state.walls, []);
  h.reset(); assert.deepEqual(h.state, initial); assert.equal(h.canUndo, false);
});

test('archive physical law: all eight configurations and causal counterfactuals', () => {
  let opened = 0;
  for (const powerOn of [false, true]) for (const springInstalled of [false, true]) for (const leverBefore of [false, true]) {
    const scene = { powerOn, springInstalled, leverBefore };
    assert.equal(gateOpens(scene), powerOn ? leverBefore : !springInstalled);
    if (gateOpens(scene)) opened++;
  }
  assert.equal(opened, 4);
  const [failure, release] = cases.map(c => c.observation);
  assert.equal(gateOpens(failure), true);
  assert.equal(gateOpens({ ...failure, springInstalled: true }), false);
  assert.equal(gateOpens({ ...failure, leverBefore: true }), true);
  assert.equal(gateOpens(release), true);
  assert.equal(gateOpens({ ...release, leverBefore: false }), false);
  cases.forEach(c => assert.equal(causeOf(c.observation), c.cause));
});

for (const [i, c] of cases.entries()) {
  test(`archive ${i + 1}: worlds, omissions, reports, addresses and controls`, () => {
    assert.equal(worlds(c).length, 12);
    assert.equal(candidates(c, []).length, 4);
    assert.equal(candidates(c, ['receipt']).length, 2);
    assert.equal(candidates(c, ['controller']).length, 2);
    assert.equal(candidates(c, ['receipt', 'controller']).length, 1);
    assert.equal(candidates(c, [], 'finding').length, 2);
    const rs = records(c);
    let explored = 0, hits = 0;
    for (const person of [...c.people, 'Controller']) for (const place of c.places) for (const time of c.times) {
      explored++;
      const state = archiveStep(c, 'full', freeze(archiveInitial()), { type: 'query', query: { person, place, time } });
      if (state.seen.length) hits++;
      assert.equal(state.queries.length, 1);
    }
    assert.equal(hits, 3); assert.equal(explored, 36);
    for (const condition of ['full', 'directory', 'finding']) {
      const h = history(archiveInitial());
      const blind = archiveStep(c, condition, h.state, { type: 'report', identity: c.worker.person, cause: c.cause });
      assert.equal(blind.feedback, 'Available evidence does not establish this report.');
      for (const r of rs) h.apply(archiveStep(c, condition, freeze(h.state), { type: 'query', query: r }));
      assert.deepEqual(h.state.seen, ['receipt', 'worker', 'controller']);
      const duplicate = archiveStep(c, condition, h.state, { type: 'query', query: rs[2] });
      assert.equal(duplicate.seen.length, 3);
      for (const identity of c.people) for (const cause of ['power', 'manual']) {
        const next = archiveStep(c, condition, h.state, { type: 'report', identity, cause });
        assert.equal(next.feedback === 'Report supported by the available evidence.', identity === c.worker.person && cause === c.cause);
      }
      h.undo(); assert.deepEqual(h.state.seen, ['receipt', 'worker']);
      h.reset(); assert.deepEqual(h.state, archiveInitial());
    }
    // A guessed address can skip the worker note: useful retrieval is not logically forced.
    let shortcut = archiveInitial();
    for (const r of [rs[0], rs[2]]) shortcut = archiveStep(c, 'full', shortcut, { type: 'query', query: r });
    assert.equal(archiveStep(c, 'full', shortcut, { type: 'report', identity: c.worker.person, cause: c.cause }).feedback, 'Report supported by the available evidence.');
    const invalid = archiveInitial();
    const drafted = archiveStep(c, 'full', invalid, { type: 'draft', identity: c.people[0], cause: '' });
    const retrieved = archiveStep(c, 'full', drafted, { type: 'query', query: rs[0] });
    assert.equal(retrieved.identity, c.people[0]);
    assert.equal(retrieved.cause, '');
    assert.equal(archiveStep(c, 'full', invalid, { type: 'draft', identity: 'nobody', cause: '' }), invalid);
    assert.equal(archiveStep(c, 'full', invalid, { type: 'query', query: { person: '<script>', place: c.places[0], time: c.times[0] } }), invalid);
    assert.equal(archiveStep(c, 'full', invalid, { type: 'report', identity: 'nobody', cause: 'manual' }), invalid);
    console.log(JSON.stringify({ model: 'archive', encounter: i + 1, completed: true, worlds: 12, public: 4, receiptOnly: 2, controllerOnly: 2, both: 1, addresses: explored, hits, trace: rs.map(address) }));
  });
}

test('visual evidence reveals only retrieved facts, in causal order', () => {
  for (const c of cases) {
    const initial = visualEvidence(c);
    assert.deepEqual(initial.scene, { place: c.worker.place, time: c.worker.time, badge: 2 });
    assert.deepEqual(initial.records, []);
    assert.equal(initial.people.filter(p => p.badge !== null).length, 1);
    assert.equal(initial.people.find(p => p.name === c.worker.person).badge, null);
    assert.equal(JSON.stringify(initial).includes('powerOn'), false);
    for (let mask = 0; mask < 8; mask++) {
      const seen = ['receipt', 'worker', 'controller'].filter((_, i) => mask & 2 ** i);
      const evidence = visualEvidence(c, seen);
      assert.deepEqual(evidence.records.map(r => r.id), seen);
      const controller = evidence.records.find(r => r.id === 'controller');
      if (controller) {
        assert.deepEqual(controller.frames.map(f => f.moment), ['Before', 'Fall', 'After']);
        assert.deepEqual(controller.frames.map(f => f.fallen), [false, true, true]);
        assert.deepEqual(controller.frames.map(f => f.leverPulled), [c.observation.leverBefore, c.observation.leverBefore, true]);
        controller.frames.forEach(f => {
          assert.equal(f.powerOn, c.observation.powerOn);
          assert.equal(f.springInstalled, c.observation.springInstalled);
        });
      }
    }
    const isolated = visualEvidence(c, ['worker']);
    isolated.records[0].address.place = 'changed';
    assert.notEqual(c.controller.place, 'changed');
  }
});

function tapeAt(code, slots) {
  return Array.from({ length: slots }, () => { const command = commands[code % commands.length]; code = Math.floor(code / commands.length); return command; });
}

function exhaustiveBench(b, condition) {
  let solved = 0, maximumTicks = 0;
  const examples = [];
  const count = commands.length ** b.slots;
  for (let code = 0; code < count; code++) {
    let s = benchInitial(b, tapeAt(code, b.slots));
    const seen = new Set();
    while (!s.error && s.produced < b.quota) {
      const key = JSON.stringify([s.position, s.holding, s.pc, s.produced]);
      if (seen.has(key)) break;
      seen.add(key);
      s = benchStep(b, s, condition);
      assert.ok(s.position >= 0 && s.position < b.length);
      assert.ok(s.pc >= 0 && s.pc < b.slots);
      assert.ok(s.produced <= b.quota);
      assert.ok(seen.size <= b.length * 2 * b.slots * b.quota);
    }
    maximumTicks = Math.max(maximumTicks, s.ticks);
    if (s.produced === b.quota) { solved++; if (examples.length < 3) examples.push(s.tape); }
  }
  return { completed: true, tapes: count, solved, maximumTicks, examples };
}

for (const [i, b] of benches.entries()) for (const condition of ['full', 'return']) {
  test(`bench ${i + 1} ${condition}: enumerate every fixed-length tape to termination or repeated state`, () => {
    const result = exhaustiveBench(b, condition);
    assert.ok(result.solved > 0);
    console.log(JSON.stringify({ model: 'bench', encounter: i + 1, condition, ...result }));
  });
}

test('bench boundary counterexample, transfer, invalid commands, history', () => {
  const once = ['take', 'right', 'drop', 'wait'];
  assert.equal(benchRun(benches[0], benchInitial(benches[0], once)).produced, 1);
  const failed = benchRun(benches[1], benchInitial(benches[1], once));
  assert.equal(failed.produced, 1); assert.match(failed.error, /Take requires/);
  assert.equal(benchRun(benches[1], benchInitial(benches[1], once), 'return').produced, 3);
  for (const [i, tape] of [[1, ['take', 'right', 'drop', 'left']], [2, ['take', 'left', 'left', 'drop', 'right', 'right']]]) {
    const b = benches[i];
    const initial = freeze(benchInitial(b, tape));
    const h = history(initial);
    h.apply(benchStep(b, h.state));
    assert.equal(h.state.holding, true); h.undo(); assert.deepEqual(h.state, initial);
    h.apply(benchRun(b, h.state)); assert.equal(h.state.produced, 3);
    h.reset(); assert.deepEqual(h.state, initial);
    const edited = benchEdit(b, h.state, 0, 'wait'); assert.equal(edited.ticks, 0);
    assert.equal(benchEdit(b, initial, -1, 'wait'), initial);
    assert.equal(benchEdit(b, initial, 0, 'jump'), initial);
    assert.equal(benchRun(b, initial, 'full', -1), initial);
  }
  assert.throws(() => benchInitial(benches[0], ['jump']), TypeError);
  const initial = benchInitial(benches[1]);
  const running = benchRun(benches[1], freeze(initial));
  assert.equal(running.ticks, 60); assert.equal(running.produced, 0);
  assert.equal(initial.ticks, 0);
});

test('prior research unchanged; complete closed comparison IDs', () => {
  const research = readFileSync(new URL('./RESEARCH.md', import.meta.url));
  assert.equal(createHash('sha256').update(research).digest('hex'), '5b019130066119d15b7a8bf37d582ec543c49a75834cef206da3036651f9ef12');
  const corpus = readFileSync(new URL('./CORPUS.md', import.meta.url), 'utf8');
  const mapping = readFileSync(new URL('./COMPARISON.md', import.meta.url), 'utf8');
  for (let i = 1; i <= 71; i++) {
    const id = `C${String(i).padStart(2, '0')}`;
    assert.equal(corpus.split(`| ${id} |`).length - 1, 1, id);
    assert.equal(mapping.split(`| ${id} |`).length - 1, 1, id);
  }
});
