const vectors = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const same = (a, b) => a.x === b.x && a.y === b.y;
const garden = Array.from({ length: 20 }, (_, i) => [i % 5 + 1, Math.floor(i / 5) + 1]);
export const driftLevels = [
  { width: 7, height: 6, floor: garden, player: { x: 1, y: 3 }, balls: [{ x: 2, y: 3, size: 1 }, { x: 3, y: 2, size: 3 }], snow: [[3, 1], [3, 3], [3, 4]], goals: [{ x: 4, y: 3, size: 1 }, { x: 5, y: 1, size: 3 }] },
  { width: 6, height: 7, floor: garden.map(([x, y]) => [y, x]), player: { x: 3, y: 1 }, balls: [{ x: 3, y: 2, size: 1 }, { x: 2, y: 3, size: 3 }], snow: [[1, 3], [3, 3], [4, 3]], goals: [{ x: 3, y: 5, size: 1 }, { x: 1, y: 4, size: 3 }] },
];
export const driftInitial = level => structuredClone({ player: level.player, balls: level.balls, snow: level.snow });
export const driftWon = (level, state) => level.goals.every(g => state.balls.some(b => same(g, b) && g.size === b.size));
export function driftStep(level, state, action, condition = 'full') {
  if (typeof action !== 'string' || !Object.hasOwn(vectors, action) || driftWon(level, state)) return state;
  const [dx, dy] = vectors[action];
  const floor = p => level.floor.some(([x, y]) => p.x === x && p.y === y);
  const destination = { x: state.player.x + dx, y: state.player.y + dy };
  if (!floor(destination)) return state;
  const index = state.balls.findIndex(b => same(b, destination));
  const next = structuredClone(state);
  if (index !== -1) {
    const landing = { x: destination.x + dx, y: destination.y + dy };
    if (!floor(landing) || state.balls.some(b => same(b, landing))) return state;
    const snow = next.snow.findIndex(([x, y]) => x === landing.x && y === landing.y);
    next.balls[index] = { ...next.balls[index], ...landing };
    if (snow !== -1) {
      next.snow.splice(snow, 1);
      if (condition !== 'fixed') next.balls[index].size = Math.min(3, next.balls[index].size + 1);
    }
  }
  next.player = destination;
  return next;
}
