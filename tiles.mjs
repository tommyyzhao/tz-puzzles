export const directions = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const same = (a, b) => a.x === b.x && a.y === b.y;
const frame = (w, h) => Array.from({ length: w * h }, (_, i) => ({ x: i % w, y: Math.floor(i / w) })).filter(p => p.x === 0 || p.y === 0 || p.x === w - 1 || p.y === h - 1);
export const tileLevels = [
  {
    width: 7, height: 5, walls: frame(7, 5), player: { x: 2, y: 3 },
    objects: [{ kind: 'crystal', x: 4, y: 1 }, { kind: 'crystal', x: 4, y: 2 }, { kind: 'crystal', x: 4, y: 3 }, { kind: 'star', x: 5, y: 2 }],
    tiles: [{ word: 'crystal', x: 1, y: 2, fixed: true }, { word: 'is', x: 2, y: 2, fixed: true }, { word: 'solid', x: 3, y: 2, fixed: false }],
    base: [['star', 'goal']], preset: [['star', 'goal']],
  },
  {
    width: 7, height: 6, walls: [...frame(7, 6), { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 5, y: 2 }], player: { x: 1, y: 4 },
    objects: [{ kind: 'star', x: 5, y: 4 }, { kind: 'crystal', x: 3, y: 4 }, { kind: 'crystal', x: 4, y: 1 }],
    tiles: [{ word: 'star', x: 1, y: 2, fixed: false }, { word: 'is', x: 2, y: 2, fixed: true }, { word: 'goal', x: 3, y: 2, fixed: true }, { word: 'crystal', x: 1, y: 3, fixed: false }],
    base: [], preset: [['crystal', 'goal']],
  },
];
export const tilesInitial = level => ({ player: { ...level.player }, tiles: structuredClone(level.tiles) });
export function tileRules(level, state, condition = 'full') {
  if (condition === 'preset') return level.preset;
  const rules = level.base.map(r => [...r]);
  for (const tile of state.tiles.filter(t => ['crystal', 'star'].includes(t.word))) {
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const link = state.tiles.find(t => t.x === tile.x + dx && t.y === tile.y + dy);
      const property = state.tiles.find(t => t.x === tile.x + dx * 2 && t.y === tile.y + dy * 2);
      if (link?.word === 'is' && ['solid', 'goal'].includes(property?.word)) rules.push([tile.word, property.word]);
    }
  }
  return rules;
}
export function tilesWon(level, state, condition = 'full') {
  const rules = tileRules(level, state, condition);
  return level.objects.some(o => same(o, state.player) && rules.some(([kind, property]) => kind === o.kind && property === 'goal'));
}
export function tilesStep(level, state, action, condition = 'full') {
  if (typeof action !== 'string' || !Object.hasOwn(directions, action) || tilesWon(level, state, condition)) return state;
  const [dx, dy] = directions[action], rules = tileRules(level, state, condition);
  const blocked = p => p.x < 0 || p.x >= level.width || p.y < 0 || p.y >= level.height || level.walls.some(w => same(w, p)) || level.objects.some(o => same(o, p) && rules.some(([kind, property]) => kind === o.kind && property === 'solid'));
  const next = structuredClone(state);
  function push(p) {
    if (blocked(p)) return false;
    const tile = next.tiles.find(t => same(t, p));
    if (!tile) return true;
    if (tile.fixed || !push({ x: p.x + dx, y: p.y + dy })) return false;
    tile.x += dx; tile.y += dy;
    return true;
  }
  const destination = { x: state.player.x + dx, y: state.player.y + dy };
  if (!push(destination)) return state;
  next.player = destination;
  return next;
}
