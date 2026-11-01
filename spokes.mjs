// Candidate supplied by the user; not an addition to the frozen game corpus.
export const spokeLevels = [
  { values: [5, 6, 7, 8, 10, 18, 28, null], rotation: 0, direction: 0, answers: [8, 40] },
  { values: [5, 6, 7, 8, 10, 18, 28, null], rotation: 0, direction: 1, answers: [40] },
];
export function spokeRound(level, firstAnswer) {
  if (!level.direction || firstAnswer === 8) return level;
  if (firstAnswer === 40) return { ...level, values: [5, 6, 7, null, 10, 18, 28, 40], direction: -1, answers: [8] };
  throw new TypeError('Directed round requires an accepted first answer');
}
export const spokesInitial = (level = spokeLevels[0], firstAnswer = 8) => ({ answer: '', feedback: '', firstAnswer: level.direction ? firstAnswer : 0 });
export const spokesWon = (level, state) => state.feedback === 'Pattern completed.' && spokeRound(level, state.firstAnswer).answers.includes(Number(state.answer));
export function spokesNext(first, next) {
  if (!spokesWon(spokeLevels[0], first)) return null;
  const answer = Number(first.answer);
  return next?.firstAnswer === answer ? next : spokesInitial(spokeLevels[1], answer);
}
export function spokesStep(level, state, action) {
  if (action?.type === 'draft' && typeof action.answer === 'string' && /^\d{0,4}$/.test(action.answer)) return { ...state, answer: action.answer, feedback: '' };
  if (action?.type !== 'submit') return state;
  if (!/^\d{1,4}$/.test(state.answer)) return { ...state, feedback: 'Enter a whole number first.' };
  return { ...state, feedback: spokeRound(level, state.firstAnswer).answers.includes(Number(state.answer)) ? 'Pattern completed.' : 'Not the intended pattern. Try another number.' };
}
