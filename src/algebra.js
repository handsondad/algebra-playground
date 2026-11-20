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
