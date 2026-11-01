const vectors = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const same = (a, b) => a.room === b.room && a.x === b.x && a.y === b.y;
const room = vertical => ({ width: 3, height: 3, floor: vertical ? [[1, 0], [1, 1], [1, 2]] : [[0, 1], [1, 1], [2, 1]] });
export const pocketLevels = [
  {
    rooms: { yard: { width: 7, height: 5, floor: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [2, 3], [3, 3], [4, 3], [5, 3], [5, 1]] }, A: room(true) },
    player: { room: 'yard', x: 1, y: 2 }, boxes: [{ id: 'A', room: 'yard', x: 2, y: 2 }], cargo: { room: 'A', x: 1, y: 1 }, goal: { room: 'yard', x: 5, y: 1 },
  },
  {
    rooms: { yard: { width: 5, height: 7, floor: [[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [3, 4], [3, 5], [1, 5]] }, A: room(false), B: room(false) },
    player: { room: 'yard', x: 2, y: 1 }, boxes: [{ id: 'A', room: 'yard', x: 2, y: 2 }, { id: 'B', room: 'A', x: 1, y: 1 }], cargo: { room: 'B', x: 1, y: 1 }, goal: { room: 'yard', x: 1, y: 5 },
  },
];
export const pocketInitial = level => structuredClone({ player: level.player, boxes: level.boxes, cargo: level.cargo });
const isFloor = (level, p) => level.rooms[p.room]?.floor.some(([x, y]) => x === p.x && y === p.y);
export const pocketWon = (level, state) => same(level.goal, state.cargo);

// ponytail: finite acyclic rooms only; self-containing worlds need separate infinity semantics.
export function pocketDestination(level, state, from, direction) {
  if (typeof direction !== 'string' || !Object.hasOwn(vectors, direction)) return null;
  const [dx, dy] = vectors[direction];
  const space = level.rooms[from.room];
  const to = { room: from.room, x: from.x + dx, y: from.y + dy };
  if (to.x >= 0 && to.y >= 0 && to.x < space.width && to.y < space.height) return isFloor(level, to) ? to : null;
  const parent = state.boxes.find(b => b.id === from.room);
  if (!parent) return null;
  return pocketDestination(level, state, parent, direction);
}
export function pocketEntry(level, state, direction) {
  if (typeof direction !== 'string' || !Object.hasOwn(vectors, direction)) return null;
  const [dx, dy] = vectors[direction];
  const next = { room: state.player.room, x: state.player.x + dx, y: state.player.y + dy };
  const box = state.boxes.find(b => same(b, next));
  if (!box) return null;
  const space = level.rooms[box.id];
  const entry = { room: box.id, x: dx === 0 ? Math.floor(space.width / 2) : dx > 0 ? 0 : space.width - 1, y: dy === 0 ? Math.floor(space.height / 2) : dy > 0 ? 0 : space.height - 1 };
  if (!isFloor(level, entry) || same(entry, state.cargo) || state.boxes.some(b => same(b, entry))) return null;
  return entry;
}
export function pocketStep(level, state, action) {
  if (typeof action !== 'string' || pocketWon(level, state)) return state;
  if (action.startsWith('enter-')) {
    const entry = pocketEntry(level, state, action.slice(6));
    return entry ? { ...state, player: entry } : state;
  }
  if (!Object.hasOwn(vectors, action)) return state;
  const next = structuredClone(state);
  function move(object, visited = new Set()) {
    if (visited.has(object)) return false;
    visited.add(object);
    const to = pocketDestination(level, next, object, action);
    if (!to || to.room === object.id) return false;
    const occupant = [next.cargo, ...next.boxes].find(o => o !== object && same(o, to));
    if (occupant && !move(occupant, visited)) return false;
    Object.assign(object, to);
    return true;
  }
  return move(next.player) ? next : state;
}
