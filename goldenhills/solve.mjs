// Authoring/verification tool, never loaded by the game: breadth-first search over the real rules.
import { step, initial, prepare } from './model.mjs';

const MOVES = ['up', 'right', 'down', 'left'];
export const stateKey = s =>
  `${s.player.room},${s.player.x},${s.player.y}|${Object.entries(s.objects).map(([id, p]) => `${id}:${p.room},${p.x},${p.y}${p.sunk ? '!' : ''}`).join(';')}|${s.awake.join('')}`;

// Shortest move list reaching `goal`, or null. `limit` caps discovered states; the result says if it was hit.
export function solve(world, start, goal, limit = 200000) {
  const seen = new Map([[stateKey(start), null]]), queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const s = queue[i];
    if (goal(s)) {
      const path = [];
      for (let k = stateKey(s); seen.get(k); k = seen.get(k)[0]) path.unshift(seen.get(k)[1]);
      return { path, explored: seen.size, complete: true };
    }
    for (const m of MOVES) {
      const n = step(world, s, m).state;
      if (n === s) continue;
      const k = stateKey(n);
      if (seen.has(k)) continue;
      seen.set(k, [stateKey(s), m]);
      if (seen.size > limit) return { path: null, explored: seen.size, complete: false };
      queue.push(n);
    }
  }
  return { path: null, explored: seen.size, complete: true };
}

// Variants for deletion tests: drop an object, drop an arch, or freeze an object in place.
export function without(world, { object, arch, freeze } = {}) {
  const objects = { ...world.objects };
  if (object) delete objects[object];
  if (arch) objects[arch[0]] = { ...objects[arch[0]], arches: objects[arch[0]].arches.filter(a => a !== arch[1]) };
  if (freeze) objects[freeze] = { ...objects[freeze], fixed: true };
  return prepare({ ...world, objects });
}

export const replay = (world, moves, state = initial(world)) =>
  moves.reduce((s, m) => step(world, s, m).state, state);
