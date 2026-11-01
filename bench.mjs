export const commands = ['wait', 'take', 'right', 'drop', 'left'];
export const benches = [
  { name: '1', length: 2, source: 0, output: 1, quota: 1, slots: 4 },
  { name: '2', length: 2, source: 0, output: 1, quota: 3, slots: 4 },
  { name: '3', length: 3, source: 2, output: 0, quota: 3, slots: 6 },
];

export function benchInitial(b, tape = Array(b.slots).fill('wait')) {
  if (!Array.isArray(tape) || tape.length !== b.slots || tape.some(x => !commands.includes(x))) throw new TypeError('Invalid tape');
  return { tape: [...tape], position: b.source, holding: false, pc: 0, produced: 0, ticks: 0, error: '' };
}

export function benchStep(b, state, condition = 'full') {
  if (state.error || state.produced >= b.quota) return state;
  const s = { ...state, ticks: state.ticks + 1 };
  const command = s.tape[s.pc];
  if (command === 'take') {
    if (s.position !== b.source || s.holding) s.error = 'Take requires an empty arm at the source.';
    else s.holding = true;
  } else if (command === 'drop') {
    if (s.position !== b.output || !s.holding) s.error = 'Drop requires a held item at the output.';
    else { s.holding = false; s.produced++; }
  } else if (command === 'left' || command === 'right') {
    const position = s.position + (command === 'left' ? -1 : 1);
    if (position < 0 || position >= b.length) s.error = 'Arm reached the end of the track.';
    else s.position = position;
  } else if (command !== 'wait') s.error = 'Unknown command.';
  if (!s.error) {
    s.pc = (s.pc + 1) % s.tape.length;
    if (s.pc === 0 && condition === 'return') s.position = b.source;
  }
  return s;
}

// ponytail: one arm, fixed tape, discrete steps; add synchronization only for a separate concurrency study.
export function benchRun(b, state, condition = 'full', limit = 60) {
  if (!Number.isInteger(limit) || limit < 0 || limit > 1000) return state;
  let next = state;
  for (let i = 0; i < limit && !next.error && next.produced < b.quota; i++) next = benchStep(b, next, condition);
  return next;
}

export function benchEdit(b, state, slot, command) {
  if (!Number.isInteger(slot) || slot < 0 || slot >= b.slots || !commands.includes(command)) return state;
  const tape = [...state.tape];
  tape[slot] = command;
  return benchInitial(b, tape);
}
