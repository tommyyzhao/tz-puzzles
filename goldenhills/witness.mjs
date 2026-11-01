// Verification witness: one known route through the whole valley. Spoilers; never loaded by the game.
const letters = { U: 'up', R: 'right', D: 'down', L: 'left' };
export const witness = {
  meadow: 'UUULLLLL',
  hollow: 'LULLLLLLURRRRRRULDDDURRUURULLU',
  bend: 'URRRUUURUULDDRDLLLLURRDLDLLUUUUULU',
  ford: 'UULLLUURRRDRUUUUURRRR',
  ravine: 'RDDDDDDRRUUUUUUULURDRULLURRRRRRRRRR',
  fork: 'RRRRRDDDLUULURLLLURDRRRRRDDDDDDLLLL',
  crossing: 'DDRDDDDDDDRURULLLDLUUUU',
  finale: 'RRRRRURRDLUUUUULUR',
};
export const witnessMoves = Object.values(witness).join('').split('').map(c => letters[c]);
