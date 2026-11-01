export function history(initial) {
  let current = structuredClone(initial);
  let past = [], future = [];
  return {
    get state() { return current; },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    apply(next) {
      if (JSON.stringify(next) === JSON.stringify(current)) return;
      past.push(current);
      current = next;
      future = [];
    },
    undo() { if (past.length) { future.push(current); current = past.pop(); } },
    redo() { if (future.length) { past.push(current); current = future.pop(); } },
    reset() { current = structuredClone(initial); past = []; future = []; },
  };
}
