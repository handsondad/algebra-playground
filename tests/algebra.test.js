import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyScaleOp, balloonLevels, cardRounds, cardTable, cardValue, factorLevels, factorPairs, factorTry, intersect,
  khwarizmiRoot, laserHits, laserLevels, machineLevels, machineOut, marbleLevels, marbleRun, matchCount, matchSticks,
  mobilePuzzles, mobileSolutions, patternKinds, ruleFromPairs, ruleMatches, sameFunction, scaleLevels, scaleSolution,
  solveSteps, staircaseSum, trackFn, trickSteps, trickValue,
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
