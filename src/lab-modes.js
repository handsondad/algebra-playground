import { mobilePuzzle, numberTrick } from './labs/puzzles.js';
import { balanceScale } from './labs/scales.js';
import { completeSquareLab, tileFactor, tileMultiply } from './labs/tiles.js';
import { functionMachine, gaussStaircase, matchstickPattern } from './labs/machines.js';
import { laserRescue, twoLines } from './labs/lines.js';
import { cardSort, marbleSlides } from './labs/marbles.js';

const modes = {
  'mobile-puzzle': mobilePuzzle, 'number-trick': numberTrick,
  'balance-scale': balanceScale, 'balloon-scale': balanceScale,
  'tile-multiply': tileMultiply, 'tile-factor': tileFactor, 'complete-square': completeSquareLab,
  'function-machine': functionMachine, 'matchstick-pattern': matchstickPattern, 'gauss-staircase': gaussStaircase,
  'laser-rescue': laserRescue, 'two-lines': twoLines,
  'marble-slides': marbleSlides, 'card-sort': cardSort,
};

export const labIds = Object.keys(modes);

export function labMode(id) {
  const mode = modes[id];
  if (!mode) throw new Error(`没有登记的实验：${id}`);
  return mode;
}
