import { mobilePuzzle, numberTrick } from './labs/puzzles.js';
import { balanceScale } from './labs/scales.js';
import { chickenRabbit, leverBalance } from './labs/equations-extra.js';
import { completeSquareLab, tileFactor, tileMultiply } from './labs/tiles.js';
import { diffSquaresLab, yanghuiTriangle } from './labs/expressions-extra.js';
import { halfPlaneRadar, numberLineIneq, pocketBudget } from './labs/inequalities.js';
import { functionMachine, gaussStaircase, matchstickPattern } from './labs/machines.js';
import { fibonacciSpiral, halvingSquare, oddSquares } from './labs/patterns-extra.js';
import { laserRescue, proportionMix, twoLines } from './labs/lines.js';
import { cardSort, marbleSlides } from './labs/marbles.js';
import { bouncingDecay, explodingDots, wheatChessboard } from './labs/exponents.js';

const modes = {
  'mobile-puzzle': mobilePuzzle,
  'balance-scale': balanceScale,
  'balloon-scale': balanceScale,
  'chicken-rabbit': chickenRabbit,
  'lever-balance': leverBalance,

  'number-trick': numberTrick,
  'tile-multiply': tileMultiply,
  'tile-factor': tileFactor,
  'diff-squares': diffSquaresLab,
  'complete-square': completeSquareLab,
  'yanghui-triangle': yanghuiTriangle,

  'number-line-ineq': numberLineIneq,
  'half-plane-radar': halfPlaneRadar,
  'pocket-budget': pocketBudget,

  'matchstick-pattern': matchstickPattern,
  'odd-squares': oddSquares,
  'gauss-staircase': gaussStaircase,
  'fibonacci-spiral': fibonacciSpiral,
  'halving-square': halvingSquare,

  'proportion-mix': proportionMix,
  'function-machine': functionMachine,
  'laser-rescue': laserRescue,
  'two-lines': twoLines,
  'marble-slides': marbleSlides,
  'card-sort': cardSort,

  'wheat-chessboard': wheatChessboard,
  'exploding-dots': explodingDots,
  'bouncing-decay': bouncingDecay,
};

export const labIds = Object.keys(modes);

export function labMode(id) {
  const mode = modes[id];
  if (!mode) throw new Error(`没有登记的实验：${id}`);
  return mode;
}
