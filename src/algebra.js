// 代数游乐场的纯计算层：不碰页面和浏览器存储，画板和测试都从这里取数。

/* ───────── 向量与小工具（画板拖拽也用） ───────── */
export const pt = (x, y) => ({ x, y });
export const add = (a, b) => pt(a.x + b.x, a.y + b.y);
export const sub = (a, b) => pt(a.x - b.x, a.y - b.y);
export const mul = (a, k) => pt(a.x * k, a.y * k);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

/* ───────── 写式子：统一用真正的减号「−」 ───────── */
export const MINUS = '−';

/** 数字转成短文字：最多两位小数，去掉多余的 0，负号用「−」 */
export function fmt(n, digits = 2) {
  if (!Number.isFinite(n)) return '—';
  const rounded = Math.round(n * 10 ** digits) / 10 ** digits;
  const text = String(Math.abs(rounded) < 1e-12 ? 0 : rounded);
  return text.replace('-', MINUS);
}

/** 拼一串项：terms 是 [系数, 字母] 的数组，系数为 0 的项省掉；全省掉时写 0 */
export function termsText(terms) {
  let out = '';
  for (const [coef, letter] of terms) {
    if (near(coef, 0)) continue;
    const abs = Math.abs(coef);
    const body = letter ? `${near(abs, 1) ? '' : fmt(abs)}${letter}` : fmt(abs);
    if (!out) out = coef < 0 ? `${MINUS}${body}` : body;
    else out += coef < 0 ? ` ${MINUS} ${body}` : ` + ${body}`;
  }
  return out || '0';
}

export const linearText = (m, b, y = 'y') => `${y} = ${termsText([[m, 'x'], [b, '']])}`;
export const sideText = side => termsText([[side.x, 'x'], [side.c, '']]);
export const equationText = state => `${sideText(state.left)} = ${sideText(state.right)}`;
export const polyText = ({ x2 = 0, x = 0, c = 0 }) => termsText([[x2, 'x²'], [x, 'x'], [c, '']]);

/** 顶点式 y = a(x − h)² + k 的文字 */
export function vertexText(a, h, k) {
  const inner = near(h, 0) ? 'x' : `(x ${h > 0 ? MINUS : '+'} ${fmt(Math.abs(h))})`;
  const lead = near(a, 1) ? '' : near(a, -1) ? MINUS : fmt(a);
  const square = `${lead}${inner}²`;
  if (near(k, 0)) return `y = ${square}`;
  return `y = ${square} ${k < 0 ? MINUS : '+'} ${fmt(Math.abs(k))}`;
}

/* ───────── 数字魔术：口袋 + 弹珠 ───────── */
/** 每一步之后手里有几个「口袋」（每袋装着你想的数）和几颗散弹珠 */
export const trickSteps = [
  { say: '心里想一个数', bags: 1, marbles: 0 },
  { say: '把它乘 2', bags: 2, marbles: 0 },
  { say: '再加 6', bags: 2, marbles: 6 },
  { say: '再除以 2', bags: 1, marbles: 3 },
  { say: '减去你一开始想的数', bags: 0, marbles: 3 },
];
export const trickValue = (step, n) => trickSteps[step].bags * n + trickSteps[step].marbles;
export const trickExpr = step => termsText([[trickSteps[step].bags, 'x'], [trickSteps[step].marbles, '']]);

/* ───────── 平衡挂件（SolveMe Mobiles 式谜题） ───────── */
/**
 * 一个挂件是一根横杆 { left: [...], right: [...] }，每边是一串从上往下挂着的东西：
 * 形状（字符串 key）、已知重量（数字）或者另一根横杆。
 */
export const mobileShapes = {
  circle: { name: '圆球' },
  square: { name: '方块' },
  triangle: { name: '三角' },
  hexagon: { name: '六边形' },
};

export const mobilePuzzles = [
  { name: '热身：两个圆球和一个方块', total: 12, bar: { left: ['circle', 'circle'], right: ['square'] }, solution: { circle: 3, square: 6 } },
  { name: '一样的东西两边抵消', total: 20, bar: { left: ['hexagon', 'circle'], right: ['hexagon', 4] }, solution: { hexagon: 6, circle: 4 } },
  { name: '挂件里还有挂件', total: 24, bar: { left: ['square'], right: [{ left: ['circle'], right: ['triangle', 'triangle'] }] }, solution: { square: 12, circle: 6, triangle: 3 } },
  { name: '三层大挑战', total: 24, bar: { left: [{ left: ['triangle', 'triangle', 'triangle'], right: ['square'] }], right: ['square', 'circle', 'circle'] }, solution: { triangle: 2, square: 6, circle: 3 } },
];

export function mobileWeight(item, values) {
  if (typeof item === 'number') return item;
  if (typeof item === 'string') return values[item] ?? 0;
  return armWeight(item.left, values) + armWeight(item.right, values);
}
export const armWeight = (arm, values) => arm.reduce((sum, item) => sum + mobileWeight(item, values), 0);

/** 每根横杆两边的重量，按从外到里的顺序列出 */
export function mobileBars(bar, values, depth = 0, out = []) {
  out.push({ depth, left: armWeight(bar.left, values), right: armWeight(bar.right, values) });
  for (const item of [...bar.left, ...bar.right]) if (item && typeof item === 'object') mobileBars(item, values, depth + 1, out);
  return out;
}

/** 谜题里出现的未知形状，按第一次出现的顺序 */
export function puzzleShapes(puzzle) {
  const seen = [];
  const walk = item => {
    if (typeof item === 'string') { if (!seen.includes(item)) seen.push(item); }
    else if (item && typeof item === 'object') [...item.left, ...item.right].forEach(walk);
  };
  walk(puzzle.bar);
  return seen;
}

export function mobileStatus(puzzle, values) {
  const bars = mobileBars(puzzle.bar, values);
  const total = mobileWeight(puzzle.bar, values);
  const balanced = bars.every(b => near(b.left, b.right));
  return { bars, total, balanced, solved: balanced && near(total, puzzle.total) };
}

/** 在 1..max 的整数里穷举所有解（测试用来保证每道谜题答案唯一） */
export function mobileSolutions(puzzle, max = 20) {
  const shapes = puzzleShapes(puzzle), found = [];
  const values = {};
  const search = i => {
    if (i === shapes.length) { if (mobileStatus(puzzle, values).solved) found.push({ ...values }); return; }
    for (let v = 1; v <= max; v += 1) { values[shapes[i]] = v; search(i + 1); }
  };
  search(0);
  return found;
}

/** 横杆倾斜角（度）：右边重时为正（顺时针往右下沉），有上限，免得翻过去 */
export function tiltDegrees(left, right, max = 16) {
  const total = Math.abs(left) + Math.abs(right);
  if (near(left, right) || total === 0) return 0;
  return clamp(((right - left) / total) * max * 1.6, -max, max);
}

/* ───────── 天平（含气球表示的负数） ───────── */
/** 一边是 { x: x 盒子的个数, c: 常数 }，c 为负时用气球表示 */
export const scaleLevels = [
  { secret: 3, left: { x: 3, c: 2 }, right: { x: 1, c: 8 } },
  { secret: 3, left: { x: 2, c: 5 }, right: { x: 0, c: 11 } },
  { secret: 4, left: { x: 4, c: 1 }, right: { x: 2, c: 9 } },
  { secret: 2, left: { x: 5, c: 3 }, right: { x: 2, c: 9 } },
];

export const balloonLevels = [
  { secret: 8, left: { x: 1, c: -3 }, right: { x: 0, c: 5 } },
  { secret: 5, left: { x: 2, c: -4 }, right: { x: 0, c: 6 } },
  { secret: 4, left: { x: 3, c: -2 }, right: { x: 1, c: 6 } },
  { secret: 3, left: { x: 3, c: 1 }, right: { x: 1, c: 7 } },
];

export const sideWeight = (side, x) => side.x * x + side.c;
export const scaleDiff = (state, x) => sideWeight(state.left, x) - sideWeight(state.right, x);
export const cloneScale = s => ({ left: { ...s.left }, right: { ...s.right } });

/**
 * 对天平做一步操作，返回新状态；做不到时返回 null。
 * op: { kind: 'both' | 'left' | 'right', dx, dc } 或 { kind: 'divide', n }
 * allowNegative 为 false 时常数不能变成负数（没有气球可用）。
 */
export function applyScaleOp(state, op, { allowNegative = false } = {}) {
  const next = cloneScale(state);
  if (op.kind === 'divide') {
    const n = op.n;
    if (!canDivide(state, n)) return null;
    for (const side of [next.left, next.right]) { side.x /= n; side.c /= n; }
    return next;
  }
  const sides = op.kind === 'both' ? ['left', 'right'] : [op.kind];
  for (const key of sides) {
    next[key].x += op.dx ?? 0;
    next[key].c += op.dc ?? 0;
    if (next[key].x < 0) return null;
    if (!allowNegative && next[key].c < 0) return null;
  }
  return next;
}

export function canDivide(state, n) {
  if (n < 2) return false;
  return [state.left.x, state.left.c, state.right.x, state.right.c].every(v => v % n === 0)
    && state.left.x + state.right.x > 0;
}

/** 能整除两边的除数（2..9） */
export const divisors = state => [2, 3, 4, 5, 6, 7, 8, 9].filter(n => canDivide(state, n));

/** 一边只剩一个 x、另一边只剩常数，就解出来了 */
export function scaleSolution(state) {
  const { left: l, right: r } = state;
  if (l.x === 1 && l.c === 0 && r.x === 0) return r.c;
  if (r.x === 1 && r.c === 0 && l.x === 0) return l.c;
  return null;
}

/** 解一元一次方程 ax + b = cx + d 的标准步骤（演示与测试共用） */
export function solveSteps(state, opts = {}) {
  const steps = [];
  let s = cloneScale(state);
  const push = (op, label) => { s = applyScaleOp(s, op, opts) ?? s; steps.push({ op, label, state: cloneScale(s) }); };
  const fewer = Math.min(s.left.x, s.right.x);
  if (fewer > 0) push({ kind: 'both', dx: -fewer }, `两边各拿走 ${fewer} 个 x`);
  const xSide = s.left.x > 0 ? 'left' : 'right';
  const c = s[xSide].c;
  if (c !== 0) push({ kind: 'both', dc: -c }, c > 0 ? `两边各拿走 ${c} 个砝码` : `两边各放 ${-c} 个砝码`);
  const n = s[xSide].x;
  if (n > 1) push({ kind: 'divide', n }, `两边平分成 ${n} 份`);
  return steps;
}

/* ───────── 代数瓷砖 ───────── */
export const tileProduct = (a, b) => ({ x2: 1, x: a + b, c: a * b });
export const factorText = (p, q) => `(x + ${p})(x + ${q})`.replace('(x + 0)', 'x');

export const factorLevels = [
  { b: 5, c: 6 },
  { b: 6, c: 8 },
  { b: 7, c: 12 },
  { b: 6, c: 9 },
  { b: 7, c: 10 },
];

/** 把 b 块 x 瓷砖分成右边 p 块、下边 b − p 块，角上要 p × (b − p) 块小方块 */
export function factorTry(b, c, p) {
  const q = b - p, need = p * q;
  return { p, q, need, have: c, fits: need === c, missing: Math.max(0, need - c), extra: Math.max(0, c - need) };
}

export function factorPairs(b, c) {
  const out = [];
  for (let p = 0; p <= b / 2; p += 1) if (p * (b - p) === c) out.push([p, b - p]);
  return out;
}

/** x² + bx + c = (x + b/2)² + k */
export function completeSquare(b, c = 0) {
  const half = b / 2, corner = half * half;
  return { half, corner, k: c - corner };
}

/** 花拉子米式：x² + bx = c 的正根 */
export function khwarizmiRoot(b, c) {
  const { half, corner } = completeSquare(b);
  return Math.sqrt(c + corner) - half;
}

/* ───────── 函数机器 ───────── */
export const machineLevels = [
  { a: 1, b: 3 },
  { a: 2, b: 0 },
  { a: 2, b: 1 },
  { a: 3, b: -2 },
  { a: -1, b: 10 },
];
export const machineOut = (rule, x) => rule.a * x + rule.b;
export const ruleMatches = (guess, rule, inputs) =>
  inputs.length > 0 && inputs.every(x => near(machineOut(guess, x), machineOut(rule, x)));
/** 只靠两组输入输出就能确定一次函数 */
export function ruleFromPairs([x1, y1], [x2, y2]) {
  if (x1 === x2) return null;
  const a = (y2 - y1) / (x2 - x1);
  return { a, b: y1 - a * x1 };
}

/* ───────── 火柴棒长图案 ───────── */
export const patternKinds = {
  squares: { name: '正方形一排', first: 1, step: 3 },
  triangles: { name: '三角形一排', first: 1, step: 2 },
  hexagons: { name: '六边形一排', first: 1, step: 5 },
};
export const matchCount = (kind, n) => patternKinds[kind].first + patternKinds[kind].step * n;

/**
 * 第 n 个图案的每根火柴（单位长度 1），group 0 是开头那一根，group i 是第 i 个图形新添的几根。
 * 坐标 y 向上。
 */
export function matchSticks(kind, n) {
  const sticks = [];
  const s = (a, b, group) => sticks.push({ a, b, group });
  if (kind === 'squares') {
    s(pt(0, 0), pt(0, 1), 0);
    for (let i = 0; i < n; i += 1) {
      s(pt(i, 1), pt(i + 1, 1), i + 1);
      s(pt(i, 0), pt(i + 1, 0), i + 1);
      s(pt(i + 1, 0), pt(i + 1, 1), i + 1);
    }
  } else if (kind === 'triangles') {
    const h = Math.sqrt(3) / 2, B = j => pt(j, 0), T = j => pt(j + 0.5, h);
    s(B(0), T(0), 0);
    for (let k = 0; k < n; k += 1) {
      const j = Math.floor(k / 2);
      if (k % 2 === 0) { s(B(j), B(j + 1), k + 1); s(B(j + 1), T(j), k + 1); }
      else { s(T(j), T(j + 1), k + 1); s(B(j + 1), T(j + 1), k + 1); }
    }
  } else {
    const w = Math.sqrt(3), r = Math.sqrt(3) / 2;
    const v = (i, dx, dy) => pt(i * w + dx, dy);
    s(v(0, -r, -0.5), v(0, -r, 0.5), 0);
    for (let i = 0; i < n; i += 1) {
      s(v(i, -r, 0.5), v(i, 0, 1), i + 1);
      s(v(i, 0, 1), v(i, r, 0.5), i + 1);
      s(v(i, r, 0.5), v(i, r, -0.5), i + 1);
      s(v(i, r, -0.5), v(i, 0, -1), i + 1);
      s(v(i, 0, -1), v(i, -r, -0.5), i + 1);
    }
  }
  return sticks;
}

/* ───────── 高斯的楼梯 ───────── */
export const staircaseSum = n => (n * (n + 1)) / 2;

/* ───────── 直线、交点 ───────── */
export const lineY = (m, b, x) => m * x + b;

export function intersect(m1, b1, m2, b2) {
  if (near(m1, m2)) return near(b1, b2) ? { kind: 'same' } : { kind: 'none' };
  const x = (b2 - b1) / (m1 - m2);
  return { kind: 'point', x, y: m1 * x + b1 };
}

export const pointLineDistance = (m, b, p) => Math.abs(m * p.x - p.y + b) / Math.hypot(m, 1);

/* ───────── 抛物线 ───────── */
export const quadY = (a, h, k, x) => a * (x - h) ** 2 + k;
export function quadRoots(a, h, k) {
  if (near(a, 0)) return [];
  const t = -k / a;
  if (t < -1e-12) return [];
  if (Math.abs(t) <= 1e-12) return [h];
  const r = Math.sqrt(t);
  return [h - r, h + r];
}
export const standardForm = (a, h, k) => ({ x2: a, x: -2 * a * h, c: a * h * h + k });

/* ───────── 闯关：激光救援 ───────── */
/** 斜率滑块步长 0.5（−3..3），截距步长 0.5（−6..6）；每关的 solution 必须落在滑块格点上 */
export const laserLevels = [
  { name: '两只外星人', targets: [pt(-2, -3), pt(2, 5)], solution: { m: 2, b: 1 } },
  { name: '往下走的激光', targets: [pt(-3, 6), pt(0, 3), pt(4, -1)], solution: { m: -1, b: 3 } },
  { name: '平平的一条', targets: [pt(-5, -2), pt(1, -2), pt(6, -2)], solution: { m: 0, b: -2 } },
  { name: '慢慢爬坡', targets: [pt(-6, -5), pt(0, -2), pt(4, 0)], solution: { m: 0.5, b: -2 } },
];
export const LASER_TOL = 0.3;
export const laserHits = (m, b, targets, tol = LASER_TOL) => targets.map(p => pointLineDistance(m, b, p) <= tol);

/* ───────── 闯关：弹珠滑梯 ───────── */
/**
 * 每关的轨道是直线 y = mx + b 或抛物线 y = a(x − h)² + k；
 * walls 是要绕开的砖墙 { x, y, w, h }（左下角 + 宽高，数学坐标）。
 */
export const marbleLevels = [
  { name: '直直的滑梯', kind: 'line', stars: [pt(-4, 3), pt(0, 1), pt(4, -1)], walls: [], solution: { m: -0.5, b: 1 } },
  { name: '山谷里的星星', kind: 'parabola', stars: [pt(-2, 2), pt(0, -2), pt(2, 2)], walls: [], solution: { a: 1, h: 0, k: -2 } },
  { name: '挪一挪顶点', kind: 'parabola', stars: [pt(1, 4), pt(3, 0), pt(5, 4)], walls: [{ x: -4, y: -1.5, w: 1.6, h: 2 }], solution: { a: 1, h: 3, k: 0 } },
  { name: '倒过来的拱桥', kind: 'parabola', stars: [pt(-4, -2), pt(-2, 4), pt(0, -2)], walls: [{ x: 3, y: -3, w: 1.5, h: 2.2 }], solution: { a: -1.5, h: -2, k: 4 } },
];
export const MARBLE_TOL = 0.35;
export const MARBLE_RANGE = [-8, 8];

export const trackFn = (kind, p) => (kind === 'line' ? x => lineY(p.m, p.b, x) : x => quadY(p.a, p.h, p.k, x));

export function insideWall(p, w) {
  return p.x >= w.x && p.x <= w.x + w.w && p.y >= w.y && p.y <= w.y + w.h;
}

/**
 * 让弹珠从左往右沿轨道滚：撞墙就停。返回每颗星星有没有被吃到、撞墙位置和走过的点。
 */
export function marbleRun(f, stars, walls, [xmin, xmax] = MARBLE_RANGE, samples = 640, tol = MARBLE_TOL) {
  const path = [];
  let crash = null;
  for (let i = 0; i <= samples; i += 1) {
    const x = xmin + ((xmax - xmin) * i) / samples, p = pt(x, f(x));
    if (!Number.isFinite(p.y)) break;
    if (walls.some(w => insideWall(p, w))) { crash = p; break; }
    path.push(p);
  }
  const collected = stars.map(s => path.some(p => dist(p, s) <= tol));
  return { path, crash, collected, won: !crash && collected.every(Boolean) };
}

/* ───────── 闯关：卡片配对 ───────── */
/** 每组 4 个函数，每个函数有式子、图像、表格三张卡 */
export const cardRounds = [
  {
    name: '直线家族',
    fns: [
      { id: 'a', kind: 'line', m: 2, b: 1 },
      { id: 'b', kind: 'line', m: 1, b: 2 },
      { id: 'c', kind: 'line', m: -1, b: 3 },
      { id: 'd', kind: 'line', m: 0, b: 3 },
    ],
    order: { eq: ['c', 'a', 'd', 'b'], graph: ['b', 'd', 'a', 'c'], table: ['d', 'c', 'b', 'a'] },
  },
  {
    name: '直线和抛物线',
    fns: [
      { id: 'a', kind: 'parabola', a: 1, h: 0, k: 0 },
      { id: 'b', kind: 'line', m: 2, b: 0 },
      { id: 'c', kind: 'parabola', a: 1, h: 0, k: -1 },
      { id: 'd', kind: 'line', m: -2, b: 2 },
    ],
    order: { eq: ['b', 'd', 'a', 'c'], graph: ['c', 'a', 'd', 'b'], table: ['a', 'b', 'c', 'd'] },
  },
];
export const CARD_XS = [0, 1, 2];
export const cardValue = (fn, x) => (fn.kind === 'line' ? lineY(fn.m, fn.b, x) : quadY(fn.a, fn.h, fn.k, x));
export const cardEquation = fn => (fn.kind === 'line' ? linearText(fn.m, fn.b) : `y = ${polyText(standardForm(fn.a, fn.h, fn.k))}`);
export const cardTable = fn => CARD_XS.map(x => [x, cardValue(fn, x)]);

/** 三张卡是不是同一个函数：比较 7 个点上的取值，而不是比较 id */
export function sameFunction(f, g) {
  return [-3, -2, -1, 0, 1, 2, 3].every(x => near(cardValue(f, x), cardValue(g, x)));
}

/* ───────── 鸡兔同笼：抬脚法与二元一次方程组 ───────── */
export const cageLevels = [
  { name: '院子一角', heads: 8, legs: 22, solution: { chickens: 5, rabbits: 3 } },
  { name: '热闹竹笼', heads: 10, legs: 28, solution: { chickens: 6, rabbits: 4 } },
  { name: '孙子算经缩影', heads: 9, legs: 26, solution: { chickens: 5, rabbits: 4 } },
  { name: '兔子多起来', heads: 11, legs: 34, solution: { chickens: 5, rabbits: 6 } },
];

export function solveCage(heads, legs) {
  if (heads < 0 || legs < 2 * heads || legs > 4 * heads || legs % 2 !== 0) return null;
  const rabbits = (legs - 2 * heads) / 2;
  return { chickens: heads - rabbits, rabbits, liftedLegs: 2 * heads, remainingLegs: legs - 2 * heads };
}

export function cageCheck(heads, targetLegs, rabbits, lifted = false) {
  const r = clamp(Math.round(rabbits), 0, heads), c = heads - r;
  const totalLegs = 2 * c + 4 * r;
  return {
    chickens: c,
    rabbits: r,
    totalLegs,
    groundLegs: lifted ? 2 * r : totalLegs,
    targetGround: lifted ? targetLegs - 2 * heads : targetLegs,
    solved: totalLegs === targetLegs,
  };
}

/* ───────── 阿基米德跷跷板（力矩平衡 w₁d₁ = w₂d₂） ───────── */
export const leverLevels = [
  { name: '爸爸和小念', left: [{ w: 6, d: 2 }], rightFixed: [], moverWeight: 3, solution: 4 },
  { name: '重重的大西瓜', left: [{ w: 8, d: 3 }], rightFixed: [], moverWeight: 4, solution: 6 },
  { name: '两个包裹一起坐', left: [{ w: 4, d: 5 }, { w: 2, d: 2 }], rightFixed: [], moverWeight: 3, solution: 8 },
  { name: '右边也有帮手', left: [{ w: 5, d: 6 }], rightFixed: [{ w: 2, d: 3 }], moverWeight: 4, solution: 6 },
];

export function leverStatus(level, peg) {
  const d = clamp(Math.round(peg), 1, 8);
  const leftTorque = level.left.reduce((s, it) => s + it.w * it.d, 0);
  const rightFixedTorque = level.rightFixed.reduce((s, it) => s + it.w * it.d, 0);
  const rightTorque = rightFixedTorque + level.moverWeight * d;
  return {
    peg: d,
    leftTorque,
    rightFixedTorque,
    rightTorque,
    balanced: near(leftTorque, rightTorque),
    tilt: tiltDegrees(leftTorque, rightTorque, 13),
  };
}

/* ───────── 平方差割补：a² − b² = (a + b)(a − b) ───────── */
export function diffSquares(a, b) {
  const aa = Math.max(2, Math.round(a));
  const bb = clamp(Math.round(b), 1, aa - 1);
  const a2 = aa * aa, b2 = bb * bb, area = a2 - b2;
  const sum = aa + bb, diff = aa - bb;
  return { a: aa, b: bb, a2, b2, area, sum, diff, product: sum * diff, equal: area === sum * diff };
}

/* ───────── 杨辉三角与二项展开 (a + b)ⁿ ───────── */
const SUP_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
export const supText = n => String(n).split('').map(ch => SUP_DIGITS[Number(ch)] ?? ch).join('');

export function yanghuiRows(maxRow = 6) {
  const rows = [[1]];
  for (let r = 1; r <= maxRow; r += 1) {
    const prev = rows[r - 1];
    rows.push(Array.from({ length: r + 1 }, (_, k) => (prev[k - 1] ?? 0) + (prev[k] ?? 0)));
  }
  return rows;
}

export const yanghuiRowSum = n => yanghuiRows(n)[n].reduce((s, v) => s + v, 0);

export function binomialTermText(n, k, coef) {
  if (n === 0) return '1';
  const aExp = n - k, bExp = k;
  const aPart = aExp === 0 ? '' : aExp === 1 ? 'a' : `a${supText(aExp)}`;
  const bPart = bExp === 0 ? '' : bExp === 1 ? 'b' : `b${supText(bExp)}`;
  return `${coef === 1 ? '' : coef}${aPart}${bPart}`;
}

export function binomialText(n) {
  if (n === 0) return '1';
  const row = yanghuiRows(n)[n];
  return row.map((coef, k) => binomialTermText(n, k, coef)).join(' + ');
}

/* ───────── 数轴不等式与乘负翻号 ───────── */
const INEQ_FLIP = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' };
const INEQ_SYM = { '<': '<', '>': '>', '<=': '≤', '>=': '≥' };

export const flipIneqOp = op => INEQ_FLIP[op];
export const ineqSymbol = op => INEQ_SYM[op];

export function ineqHolds(lhs, op, rhs) {
  if (op === '<') return lhs < rhs - 1e-9;
  if (op === '>') return lhs > rhs + 1e-9;
  if (op === '<=') return lhs <= rhs + 1e-9;
  return lhs >= rhs - 1e-9;
}

export const ineqLevels = [
  { name: '两边同减', state: { a: 1, b: 3, op: '<', c: 7 }, solution: { op: '<', bound: 4 } },
  { name: '同加再平分', state: { a: 2, b: -2, op: '>=', c: 4 }, solution: { op: '>=', bound: 3 } },
  { name: '乘 −1 照镜子翻号', state: { a: -1, b: 0, op: '<', c: -2 }, solution: { op: '>', bound: 2 } },
  { name: '移项再翻号', state: { a: -2, b: 4, op: '<=', c: 10 }, solution: { op: '>=', bound: -3 } },
];

export const ineqText = s => `${termsText([[s.a, 'x'], [s.b, '']])} ${ineqSymbol(s.op)} ${fmt(s.c)}`;
export const ineqSatisfies = (s, x) => ineqHolds(s.a * x + s.b, s.op, s.c);

export function ineqRay(s) {
  const bound = (s.c - s.b) / s.a;
  const op = s.a < 0 ? flipIneqOp(s.op) : s.op;
  return { op, bound, inclusive: op === '<=' || op === '>=', right: op === '>' || op === '>=' };
}

export const ineqSolved = s => s.a === 1 && s.b === 0;

export function applyIneqOp(s, action) {
  if (action.kind === 'add') {
    const nextB = s.b + action.d, nextC = s.c + action.d;
    if (Math.abs(nextB) > 16 || Math.abs(nextC) > 20) return null;
    return { a: s.a, b: nextB, op: s.op, c: nextC };
  }
  if (action.kind === 'divPos') {
    const k = action.k;
    if (k < 2 || [s.a, s.b, s.c].some(v => v % k !== 0)) return null;
    return { a: s.a / k, b: s.b / k, op: s.op, c: s.c / k };
  }
  if (action.kind === 'negate') {
    return { a: -s.a, b: -s.b, op: flipIneqOp(s.op), c: -s.c };
  }
  return null;
}

export function solveIneqSteps(initial) {
  const steps = [];
  let s = { ...initial };
  if (s.b !== 0) {
    const d = -s.b;
    s = applyIneqOp(s, { kind: 'add', d });
    steps.push({ label: d > 0 ? `两边同加 ${d}` : `两边同减 ${-d}`, state: { ...s } });
  }
  if (s.a < 0) {
    s = applyIneqOp(s, { kind: 'negate' });
    steps.push({ label: '两边同乘 −1（不等号掉头！）', state: { ...s } });
  }
  if (s.a > 1) {
    const k = s.a;
    s = applyIneqOp(s, { kind: 'divPos', k });
    steps.push({ label: `两边同除以 ${k}`, state: { ...s } });
  }
  return steps;
}

/* ───────── 半平面探照灯（二元一次不等式组） ───────── */
/** 用半平面 ax + by ≤ c 裁剪凸多边形（Sutherland–Hodgman） */
export function clipHalfPlane(poly, a, b, c) {
  if (!poly.length) return [];
  const val = p => a * p.x + b * p.y - c;
  const out = [];
  for (let i = 0; i < poly.length; i += 1) {
    const cur = poly[i], nxt = poly[(i + 1) % poly.length];
    const vc = val(cur), vn = val(nxt);
    const inC = vc <= 1e-9, inN = vn <= 1e-9;
    if (inC) out.push(cur);
    if (inC !== inN) {
      const t = vc / (vc - vn);
      out.push(pt(cur.x + (nxt.x - cur.x) * t, cur.y + (nxt.y - cur.y) * t));
    }
  }
  return out;
}

/** dir = 1 表示 y ≥ mx + b（即 mx − y ≤ −b）；dir = -1 表示 y ≤ mx + b（即 −mx + y ≤ b） */
export const halfPlaneCoeffs = (m, b, dir) => (dir > 0 ? { a: m, b: -1, c: -b } : { a: -m, b: 1, c: b });
export const inHalfPlane = (p, m, b, dir) => (dir > 0 ? p.y >= m * p.x + b - 1e-9 : p.y <= m * p.x + b + 1e-9);
export const halfPlaneText = (m, b, dir) => `y ${dir > 0 ? '≥' : '≤'} ${termsText([[m, 'x'], [b, '']])}`;

export const radarLevels = [
  {
    name: '屋顶下的宝石',
    gems: [pt(0, 1), pt(-1, 0), pt(1, 0)],
    mines: [pt(0, 4), pt(-4, 0), pt(4, 0)],
    solution: { m1: 1, b1: 2, dir1: -1, m2: -1, b2: 2, dir2: -1 },
  },
  {
    name: '山谷安全区',
    gems: [pt(0, 2), pt(-1, 3), pt(2, 3)],
    mines: [pt(0, -1), pt(-3, 2), pt(4, 1)],
    solution: { m1: -1, b1: 1, dir1: 1, m2: 0.5, b2: 1, dir2: 1 },
  },
  {
    name: '斜走廊通道',
    gems: [pt(-2, -1), pt(0, 1), pt(2, 3)],
    mines: [pt(-2, 3), pt(2, -1), pt(0, 4)],
    solution: { m1: 1, b1: 2, dir1: -1, m2: 1, b2: 0, dir2: 1 },
  },
  {
    name: '右上宝藏角',
    gems: [pt(2, 2), pt(3, 1), pt(4, 2)],
    mines: [pt(0, 2), pt(2, -2), pt(3, 4)],
    solution: { m1: -0.5, b1: 4, dir1: -1, m2: -2, b2: 4, dir2: 1 },
  },
];

export function radarCheck(level, cfg) {
  const inside = p => inHalfPlane(p, cfg.m1, cfg.b1, cfg.dir1) && inHalfPlane(p, cfg.m2, cfg.b2, cfg.dir2);
  const gemHits = level.gems.map(inside);
  const mineHits = level.mines.map(inside);
  return { gemHits, mineHits, won: gemHits.every(Boolean) && mineHits.every(h => !h) };
}

/* ───────── 零花钱采购计划（线性规划 · 可行域与顶点最优） ───────── */
export const budgetLevels = [
  {
    name: '画册与彩笔',
    xLabel: '画册', yLabel: '彩笔', goalUnit: '张贴纸',
    c1: { a: 2, b: 3, max: 18, name: '零花钱 2x + 3y ≤ 18 元' },
    c2: { a: 1, b: 1, max: 7, name: '书包容量 x + y ≤ 7 件' },
    obj: { p: 3, q: 4, name: '赠品贴纸 3x + 4y' },
    solution: { x: 3, y: 4, best: 25 },
  },
  {
    name: '班级义卖烘焙',
    xLabel: '饼干盒', yLabel: '松饼盒', goalUnit: '元善款',
    c1: { a: 1, b: 2, max: 10, name: '黄油 x + 2y ≤ 10 份' },
    c2: { a: 2, b: 1, max: 11, name: '鸡蛋 2x + y ≤ 11 个' },
    obj: { p: 3, q: 4, name: '义卖善款 3x + 4y' },
    solution: { x: 4, y: 3, best: 24 },
  },
  {
    name: '科学社做模型',
    xLabel: '小车', yLabel: '飞船', goalUnit: '分积分',
    c1: { a: 2, b: 1, max: 12, name: '轮子组 2x + y ≤ 12' },
    c2: { a: 1, b: 2, max: 12, name: '马达组 x + 2y ≤ 12' },
    obj: { p: 5, q: 4, name: '比赛积分 5x + 4y' },
    solution: { x: 4, y: 4, best: 36 },
  },
];

export const budgetFeasible = (lv, x, y) =>
  x >= 0 && y >= 0 && lv.c1.a * x + lv.c1.b * y <= lv.c1.max + 1e-9 && lv.c2.a * x + lv.c2.b * y <= lv.c2.max + 1e-9;

export const budgetScore = (lv, x, y) => lv.obj.p * x + lv.obj.q * y;

export function budgetFeasiblePoints(lv, maxCoord = 10) {
  const pts = [];
  for (let x = 0; x <= maxCoord; x += 1) {
    for (let y = 0; y <= maxCoord; y += 1) {
      if (budgetFeasible(lv, x, y)) pts.push({ x, y, score: budgetScore(lv, x, y) });
    }
  }
  return pts;
}

export function budgetPolygon(lv, bound = 10) {
  let poly = [pt(0, 0), pt(bound, 0), pt(bound, bound), pt(0, bound)];
  poly = clipHalfPlane(poly, lv.c1.a, lv.c1.b, lv.c1.max);
  poly = clipHalfPlane(poly, lv.c2.a, lv.c2.b, lv.c2.max);
  return poly;
}

/* ───────── 奇数拐尺拼正方形：1 + 3 + … + (2n − 1) = n² ───────── */
export const oddTerm = k => 2 * k - 1;
export const oddSum = n => Array.from({ length: n }, (_, i) => oddTerm(i + 1)).reduce((s, v) => s + v, 0);

export function gnomonCells(n) {
  const cells = [];
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      cells.push({ row: r, col: c, layer: Math.max(r, c) + 1, lowerTri: r >= c });
    }
  }
  return cells;
}

/* ───────── 斐波那契数列与黄金长方形 ───────── */
export const PHI = (1 + Math.sqrt(5)) / 2;

export function fibNumbers(count) {
  const out = [];
  for (let i = 0; i < count; i += 1) out.push(i < 2 ? 1 : out[i - 1] + out[i - 2]);
  return out;
}

/**
 * 把边长 1, 1, 2, 3, 5, … 的正方形依次往右、上、左、下拼成大长方形。
 * 数学坐标 y 向上；每个正方形记左下角 (x, y) 和边长 size，以及四分之一圆弧的起点、终点和圆心。
 */
export function fibSquares(count) {
  const nums = fibNumbers(Math.max(2, count));
  const squares = [
    { index: 0, size: 1, x: 0, y: 0, dir: 3 },
    { index: 1, size: 1, x: 1, y: 0, dir: 0 },
  ];
  let xmin = 0, xmax = 2, ymin = 0, ymax = 1;
  // 依次往：上(1)、左(2)、下(3)、右(0) 贴正方形
  const dirs = [1, 2, 3, 0];
  for (let i = 2; i < nums.length; i += 1) {
    const s = nums[i], dir = dirs[(i - 2) % 4];
    let x = xmin, y = ymin;
    if (dir === 1) { x = xmin; y = ymax; ymax += s; }
    else if (dir === 2) { x = xmin - s; y = ymin; xmin -= s; }
    else if (dir === 3) { x = xmin; y = ymin - s; ymin -= s; }
    else { x = xmax; y = ymin; xmax += s; }
    squares.push({ index: i, size: s, x, y, dir });
  }
  return {
    squares: squares.slice(0, count),
    nums: nums.slice(0, count),
    box: { xmin, ymin, xmax, ymax, width: xmax - xmin, height: ymax - ymin },
    ratio: nums[count - 1] / nums[count - 2],
  };
}

/* ───────── 切半正方形：1/2 + 1/4 + 1/8 + … + 1/2ⁿ = 1 − 1/2ⁿ ───────── */
export function halvingPieces(steps) {
  const n = clamp(Math.round(steps), 1, 8);
  const pieces = [];
  let rx = 0, ry = 0, rw = 1, rh = 1;
  for (let k = 1; k <= n; k += 1) {
    if (k % 2 === 1) {
      rw /= 2;
      pieces.push({ step: k, x: rx, y: ry, w: rw, h: rh, denom: 2 ** k, area: 2 ** -k });
      rx += rw;
    } else {
      rh /= 2;
      pieces.push({ step: k, x: rx, y: ry, w: rw, h: rh, denom: 2 ** k, area: 2 ** -k });
      ry += rh;
    }
  }
  const remDenom = 2 ** n;
  return {
    pieces,
    remainder: { x: rx, y: ry, w: rw, h: rh, denom: remDenom, area: 1 / remDenom },
    sumNumer: remDenom - 1,
    sumDenom: remDenom,
    sumValue: (remDenom - 1) / remDenom,
  };
}

/* ───────── 正比例柠檬水配比：y = kx ───────── */
export const proportionLevels = [
  { name: '爸爸的黄金配方', targetLemons: 2, targetCups: 3, askLemons: 4, solutionCups: 6 },
  { name: '酸爽冰柠茶', targetLemons: 3, targetCups: 3, askLemons: 5, solutionCups: 5 },
  { name: '清淡夏日饮', targetLemons: 2, targetCups: 5, askLemons: 4, solutionCups: 10 },
  { name: '派对大水壶', targetLemons: 3, targetCups: 4, askLemons: 6, solutionCups: 8 },
];

export function proportionCheck(level, lemons, cups) {
  const crossDiff = cups * level.targetLemons - lemons * level.targetCups;
  const sameRatio = crossDiff === 0;
  const taste = sameRatio ? '一样好喝' : crossDiff < 0 ? '更酸一点' : '更淡一点';
  return {
    sameRatio,
    taste,
    unitCups: level.targetCups / level.targetLemons,
    userUnitCups: cups / lemons,
    partySolved: sameRatio && lemons === level.askLemons,
  };
}

/* ───────── 棋盘麦粒：2n vs n² vs 2ⁿ⁻¹ ───────── */
export function chessboardCount(square) {
  const k = clamp(Math.round(square), 1, 64);
  const grain = 2n ** BigInt(k - 1);
  const total = (2n ** BigInt(k)) - 1n;
  return { square: k, grain, total };
}

export function growthCompare(n) {
  const k = clamp(Math.round(n), 1, 16);
  return {
    n: k,
    linear: 2 * k,
    quadratic: k * k,
    exponential: 2 ** (k - 1),
    expTotal: (2 ** k) - 1,
  };
}

/* ───────── 爆炸圆点进制机（1 ← b 与 1 ← x） ───────── */
export const initDots = (n, width = 5) => Array.from({ length: width }, (_, i) => (i === 0 ? Math.max(0, Math.round(n)) : 0));

export function explodeStep(boxes, base) {
  for (let i = 0; i < boxes.length - 1; i += 1) {
    if (boxes[i] >= base) {
      const next = [...boxes];
      next[i] -= base;
      next[i + 1] += 1;
      return { boxes: next, explodedAt: i };
    }
  }
  return null;
}

export function explodeAll(n, base, width = 6) {
  let boxes = initDots(n, width);
  const history = [boxes];
  let step = explodeStep(boxes, base);
  while (step) {
    boxes = step.boxes;
    history.push(boxes);
    step = explodeStep(boxes, base);
  }
  return { boxes, steps: history.length - 1, history };
}

export const dotsValue = (boxes, base) => boxes.reduce((sum, c, i) => sum + c * (base ** i), 0);

export function dotsPolyText(boxes) {
  const terms = [];
  for (let i = boxes.length - 1; i >= 0; i -= 1) {
    if (!boxes[i]) continue;
    const unit = i === 0 ? '' : i === 1 ? 'x' : `x${supText(i)}`;
    terms.push([boxes[i], unit]);
  }
  return termsText(terms);
}

/* ───────── 弹跳小球：指数衰减 h₀ · rⁿ ───────── */
export const bounceHeight = (h0, r, n) => h0 * (r ** n);

export function bounceSeries(h0, r, count = 7) {
  return Array.from({ length: count + 1 }, (_, n) => ({ n, h: bounceHeight(h0, r, n) }));
}

export function firstBounceBelow(h0, r, threshold = 1) {
  for (let n = 0; n <= 30; n += 1) if (bounceHeight(h0, r, n) < threshold - 1e-9) return n;
  return 30;
}

