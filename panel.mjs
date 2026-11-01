export const panels = [
  { name: '1', width: 2, height: 2, cells: ['A', 'B', 'A', 'B'], budget: 2 },
  { name: '2', width: 3, height: 2, cells: ['A', 'B', 'A', 'A', 'B', 'A'], budget: 4 },
  { name: '3', width: 3, height: 3, cells: ['A', '.', 'B', 'A', 'B', 'B', 'B', '.', 'A'], budget: 5 },
];

export function edges(panel) {
  const result = [];
  panel.cells.forEach((_, i) => {
    if (i % panel.width < panel.width - 1) result.push([i, i + 1]);
    if (i + panel.width < panel.cells.length) result.push([i, i + panel.width]);
  });
  return result;
}

export function regions(panel, walls) {
  const links = edges(panel).filter((_, i) => !walls.includes(i));
  const unseen = new Set(panel.cells.map((_, i) => i));
  const result = [];
  while (unseen.size) {
    const group = [unseen.values().next().value];
    unseen.delete(group[0]);
    for (let p = 0; p < group.length; p++) {
      for (const [a, b] of links) {
        const next = a === group[p] ? b : b === group[p] ? a : -1;
        if (unseen.delete(next)) group.push(next);
      }
    }
    result.push(group);
  }
  return result;
}

export function accepts(panel, walls) {
  const count = edges(panel).length;
  if (!Array.isArray(walls) || new Set(walls).size !== walls.length || walls.some(i => !Number.isInteger(i) || i < 0 || i >= count)) return false;
  return walls.length <= panel.budget && regions(panel, walls).every(group =>
    new Set(group.map(i => panel.cells[i]).filter(x => x !== '.')).size <= 1);
}

// Research-only candidate models; never rendered as player hints.
export function lawModels(panel, walls) {
  const valid = accepts(panel, walls);
  const groups = regions(panel, walls);
  return {
    exclusion: valid,
    grouped: valid && ['A', 'B'].every(mark => groups.filter(g => g.some(i => panel.cells[i] === mark)).length <= 1),
    adjacent: walls.length <= panel.budget && edges(panel).every(([a, b], i) =>
      panel.cells[a] === '.' || panel.cells[b] === '.' || panel.cells[a] === panel.cells[b] || walls.includes(i)),
  };
}

export function consistentLaws(observations) {
  return ['exclusion', 'grouped', 'adjacent'].filter(model => observations.every(({ panel, walls, accepted }) => lawModels(panel, walls)[model] === accepted));
}

export const panelInitial = () => ({ walls: [], feedback: '' });

export function panelStep(panel, state, action) {
  if (!action || typeof action !== 'object') return state;
  if (action.type === 'submit') return { ...state, feedback: accepts(panel, state.walls) ? 'Accepted.' : 'Not accepted.' };
  if (action.type !== 'toggle' || !Number.isInteger(action.edge) || !edges(panel)[action.edge]) return state;
  const removing = state.walls.includes(action.edge);
  if (!removing && state.walls.length >= panel.budget) return { ...state, feedback: 'Divider limit reached. Remove one first.' };
  return { walls: removing ? state.walls.filter(x => x !== action.edge) : [...state.walls, action.edge].sort((a, b) => a - b), feedback: '' };
}
