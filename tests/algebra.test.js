import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyIneqOp, applyScaleOp, balloonLevels, binomialText, bounceHeight, bounceSeries, budgetFeasiblePoints,
  budgetLevels, budgetPolygon, cageCheck, cageLevels, cardRounds, cardTable, cardValue, chessboardCount, diffSquares,
  dotsPolyText, dotsValue, explodeAll, factorLevels, factorPairs, factorTry, fibNumbers, fibSquares, firstBounceBelow,
  gnomonCells, growthCompare, halvingPieces, ineqLevels, ineqRay, ineqSolved, intersect, khwarizmiRoot, laserHits,
  laserLevels, leverLevels, leverStatus, machineLevels, machineOut, marbleLevels, marbleRun, matchCount, matchSticks,
  mobilePuzzles, mobileSolutions, oddSum, oddTerm, patternKinds, PHI, proportionCheck, proportionLevels, radarCheck,
  radarLevels, ruleFromPairs, ruleMatches, sameFunction, scaleLevels, scaleSolution, solveCage, solveIneqSteps,
  solveSteps, staircaseSum, trackFn, trickSteps, trickValue, yanghuiRowSum, yanghuiRows,
} from '../src/algebra.js';

const onGrid = (v, min, max, step) => v >= min && v <= max && Math.abs(v / step - Math.round(v / step)) < 1e-9;

test('每道挂件谜题在 1..20 里只有一个答案，就是写好的 solution', () => {
  for (const puzzle of mobilePuzzles) {
    const found = mobileSolutions(puzzle);
    assert.equal(found.length, 1, puzzle.name);
    assert.deepEqual(found[0], puzzle.solution, puzzle.name);
  }
});

test('数字魔术最后只剩弹珠，结果和想的数无关', () => {
  const last = trickSteps.length - 1;
  assert.equal(trickSteps[last].bags, 0);
  const results = new Set([1, 7, 13, 20].map(n => trickValue(last, n)));
  assert.equal(results.size, 1);
});

test('天平关卡：按标准步骤每一步都合法，最后解出秘密重量', () => {
  for (const [levels, opts] of [[scaleLevels, {}], [balloonLevels, { allowNegative: true }]]) {
    for (const level of levels) {
      let s = { left: { ...level.left }, right: { ...level.right } };
      for (const step of solveSteps(level, opts)) {
        s = applyScaleOp(s, step.op, opts);
        assert.ok(s, `${JSON.stringify(level)} → ${step.label}`);
      }
      assert.equal(scaleSolution(s), level.secret, JSON.stringify(level));
    }
  }
});

test('没有气球时，砝码不能拿成负数；除不尽时不能平分', () => {
  assert.equal(applyScaleOp({ left: { x: 1, c: 0 }, right: { x: 0, c: 3 } }, { kind: 'both', dc: -1 }), null);
  assert.equal(applyScaleOp({ left: { x: 2, c: 1 }, right: { x: 0, c: 6 } }, { kind: 'divide', n: 2 }), null);
});

test('因式分解关卡都能拼成长方形，拼错时报告缺几块', () => {
  for (const { b, c } of factorLevels) assert.ok(factorPairs(b, c).length >= 1, `x² + ${b}x + ${c}`);
  assert.deepEqual(factorTry(5, 6, 1), { p: 1, q: 4, need: 4, have: 6, fits: false, missing: 0, extra: 2 });
  assert.equal(factorTry(5, 6, 2).fits, true);
});

test('配方法：花拉子米的 x² + 10x = 39 得 3', () => {
  assert.equal(khwarizmiRoot(10, 39), 3);
});

test('函数机器：两组输入输出就能确定规则', () => {
  for (const rule of machineLevels) {
    const guess = ruleFromPairs([1, machineOut(rule, 1)], [4, machineOut(rule, 4)]);
    assert.deepEqual(guess, rule);
    assert.ok(ruleMatches(guess, rule, [0, 5, 10]));
  }
});

test('火柴棒根数公式和真的拼出来的火柴一致；高斯楼梯 1 加到 100 = 5050', () => {
  for (const kind of Object.keys(patternKinds)) {
    for (let n = 1; n <= 6; n += 1) assert.equal(matchSticks(kind, n).length, matchCount(kind, n), `${kind} n=${n}`);
  }
  assert.equal(staircaseSum(100), 5050);
});

test('两条直线的交点', () => {
  assert.deepEqual(intersect(2, 10, 4, 2), { kind: 'point', x: 4, y: 18 });
  assert.equal(intersect(2, 1, 2, 3).kind, 'none');
  assert.equal(intersect(2, 1, 2, 1).kind, 'same');
});

test('激光救援：答案在滑块格点上且全部救下，默认激光救不全', () => {
  for (const { targets, solution, name } of laserLevels) {
    assert.ok(onGrid(solution.m, -3, 3, 0.5) && onGrid(solution.b, -6, 6, 0.5), name);
    assert.ok(laserHits(solution.m, solution.b, targets).every(Boolean), name);
    assert.ok(!laserHits(1, 0, targets).every(Boolean), name);
  }
});

test('弹珠滑梯：答案在滑块格点上且能过关，默认轨道过不了', () => {
  for (const { kind, stars, walls, solution, name } of marbleLevels) {
    const keys = kind === 'line' ? [['m', -2, 2], ['b', -5, 5]] : [['a', -2, 2], ['h', -5, 5], ['k', -5, 5]];
    for (const [k, min, max] of keys) assert.ok(onGrid(solution[k], min, max, 0.5), `${name} ${k}`);
    assert.ok(marbleRun(trackFn(kind, solution), stars, walls).won, name);
    const start = kind === 'line' ? { m: 1, b: 0 } : { a: 1, h: 0, k: 0 };
    assert.ok(!marbleRun(trackFn(kind, start), stars, walls).won, `${name} 默认轨道`);
  }
});

test('弹珠撞墙会停下', () => {
  const run = marbleRun(() => 0, [{ x: 5, y: 0 }], [{ x: 0, y: -1, w: 1, h: 2 }]);
  assert.ok(run.crash && !run.won);
  assert.ok(run.crash.x >= 0 && run.crash.x <= 1);
});

test('卡片配对：每列都是同一组函数，函数各不相同，表格也互不相同', () => {
  for (const round of cardRounds) {
    const ids = round.fns.map(f => f.id).sort();
    for (const col of ['eq', 'graph', 'table']) assert.deepEqual([...round.order[col]].sort(), ids, `${round.name} ${col}`);
    for (const f of round.fns) {
      assert.ok(round.fns.filter(g => sameFunction(f, g)).length === 1, `${round.name} ${f.id}`);
      for (const [x, y] of cardTable(f)) assert.equal(y, cardValue(f, x));
    }
    assert.equal(new Set(round.fns.map(f => JSON.stringify(cardTable(f)))).size, round.fns.length, round.name);
  }
});

test('鸡兔同笼：每关答案唯一，抬脚法留下的脚等于兔子数的两倍，默认 1 只兔不过关', () => {
  for (const lv of cageLevels) {
    const solved = solveCage(lv.heads, lv.legs);
    assert.deepEqual({ chickens: solved.chickens, rabbits: solved.rabbits }, lv.solution, lv.name);
    assert.equal(solved.remainingLegs, 2 * lv.solution.rabbits, lv.name);
    assert.equal(cageCheck(lv.heads, lv.legs, lv.solution.rabbits, true).solved, true, lv.name);
    assert.equal(cageCheck(lv.heads, lv.legs, 1, false).solved, false, `${lv.name} 默认值`);
  }
});

test('阿基米德跷跷板：每关在 1..8 上只有唯一平衡格点，默认第 1 格不平衡', () => {
  for (const lv of leverLevels) {
    const winners = [1, 2, 3, 4, 5, 6, 7, 8].filter(d => leverStatus(lv, d).balanced);
    assert.deepEqual(winners, [lv.solution], lv.name);
    assert.equal(leverStatus(lv, 1).balanced, false, `${lv.name} 默认第 1 格`);
  }
});

test('平方差割补与杨辉三角展开式', () => {
  for (let a = 3; a <= 9; a += 1) {
    for (let b = 1; b < a; b += 1) {
      const r = diffSquares(a, b);
      assert.equal(r.equal, true);
      assert.equal(r.area, (a + b) * (a - b));
    }
  }
  const rows = yanghuiRows(6);
  assert.deepEqual(rows[4], [1, 4, 6, 4, 1]);
  for (let n = 0; n <= 6; n += 1) assert.equal(yanghuiRowSum(n), 2 ** n);
  assert.equal(binomialText(3), 'a³ + 3a²b + 3ab² + b³');
});

test('数轴不等式：乘负数翻号，标准步骤都能把系数化成 x', () => {
  for (const lv of ineqLevels) {
    const steps = solveIneqSteps(lv.state);
    const last = steps.at(-1).state;
    assert.ok(ineqSolved(last), lv.name);
    const ray = ineqRay(last);
    assert.equal(ray.op, lv.solution.op, lv.name);
    assert.equal(ray.bound, lv.solution.bound, lv.name);
  }
  const flipped = applyIneqOp({ a: -2, b: 0, op: '<=', c: 6 }, { kind: 'negate' });
  assert.equal(flipped.op, '>=');
});

test('半平面探照灯：答案落在滑块格点上且全包宝石、全避地雷，默认配置不过关', () => {
  const start = { m1: 1, b1: 0, dir1: 1, m2: -1, b2: 0, dir2: -1 };
  for (const lv of radarLevels) {
    const s = lv.solution;
    assert.ok(onGrid(s.m1, -2, 2, 0.5) && onGrid(s.b1, -4, 4, 1), `${lv.name} 线1`);
    assert.ok(onGrid(s.m2, -2, 2, 0.5) && onGrid(s.b2, -4, 4, 1), `${lv.name} 线2`);
    assert.equal(radarCheck(lv, s).won, true, lv.name);
    assert.equal(radarCheck(lv, start).won, false, `${lv.name} 默认`);
  }
});

test('零花钱采购计划：可行域非空，最优整数解唯一且落在答案顶点上', () => {
  for (const lv of budgetLevels) {
    const pts = budgetFeasiblePoints(lv);
    assert.ok(pts.length >= 10 && budgetPolygon(lv).length >= 3, lv.name);
    const best = Math.max(...pts.map(p => p.score));
    assert.equal(best, lv.solution.best, lv.name);
    const winners = pts.filter(p => p.score === best);
    assert.equal(winners.length, 1, `${lv.name} 最优解唯一`);
    assert.equal(winners[0].x, lv.solution.x);
    assert.equal(winners[0].y, lv.solution.y);
  }
});

test('奇数拐尺、斐波那契长方形与切半正方形无穷级数', () => {
  for (let n = 1; n <= 8; n += 1) {
    assert.equal(oddSum(n), n * n);
    const cells = gnomonCells(n);
    assert.equal(cells.filter(c => c.layer === n).length, oddTerm(n));
    assert.equal(cells.filter(c => c.lowerTri).length, staircaseSum(n));
  }
  const fib = fibSquares(8);
  const nums = fibNumbers(9);
  const sumSquares = fib.nums.reduce((s, v) => s + v * v, 0);
  assert.equal(sumSquares, fib.box.width * fib.box.height);
  assert.equal(fib.box.width * fib.box.height, nums[7] * nums[8]);
  assert.ok(Math.abs(fib.ratio - PHI) < 0.02);

  const half = halvingPieces(6);
  assert.equal(half.sumNumer, 63);
  assert.equal(half.sumDenom, 64);
  assert.ok(Math.abs(half.sumValue + half.remainder.area - 1) < 1e-12);
});

test('正比例柠檬水、棋盘麦粒、爆炸圆点机与弹跳小球衰减', () => {
  for (const lv of proportionLevels) {
    assert.equal(proportionCheck(lv, lv.askLemons, lv.solutionCups).partySolved, true, lv.name);
    assert.equal(proportionCheck(lv, 1, 1).partySolved, false, `${lv.name} 默认`);
  }
  assert.equal(chessboardCount(1).grain, 1n);
  assert.equal(chessboardCount(10).total, 1023n);
  assert.equal(chessboardCount(64).total, (2n ** 64n) - 1n);
  assert.equal(growthCompare(10).exponential, 512);

  for (const base of [2, 3, 10]) {
    for (const n of [0, 5, 13, 27]) {
      const { boxes } = explodeAll(n, base, 6);
      assert.equal(dotsValue(boxes, base), n, `base=${base} n=${n}`);
      assert.ok(boxes.every(c => c < base), `base=${base} n=${n}`);
    }
  }
  assert.equal(dotsPolyText(explodeAll(13, 2, 6).boxes), 'x³ + x² + 1');

  assert.equal(bounceHeight(8, 0.5, 3), 1);
  assert.equal(firstBounceBelow(8, 0.5, 1), 4);
  assert.equal(bounceSeries(8, 0.5, 4).length, 5);
});

