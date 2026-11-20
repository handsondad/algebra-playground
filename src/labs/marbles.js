import {
  CARD_XS, cardEquation, cardRounds, cardTable, cardValue, fmt, linearText, marbleLevels, MARBLE_RANGE, MARBLE_TOL,
  marbleRun, pt, sameFunction, trackFn, vertexText,
} from '../algebra.js';
import { button, circle, hotspot, line, metric, onAction, onHotspot, plane, polygon, polyline, reducedMotion, slider, sliderValue, text } from '../board.js';

/* ───────── 弹珠滑梯 ───────── */
const SLIDERS = {
  line: [['ms-m', '斜率 m：滑梯有多陡', -2, 2, 0.5, 1], ['ms-b', '截距 b：滑梯在 y 轴的高度', -5, 5, 0.5, 0]],
  parabola: [['ms-a', 'a：开口朝向和胖瘦', -2, 2, 0.5, 1], ['ms-h', 'h：顶点左右挪', -5, 5, 0.5, 0], ['ms-k', 'k：顶点上下挪', -5, 5, 0.5, 0]],
};

function star(p, got, i) {
  const pts = Array.from({ length: 10 }, (_, j) => {
    const r = j % 2 ? 5 : 12, t = -Math.PI / 2 + (j * Math.PI) / 5;
    return pt(p.x + r * Math.cos(t), p.y + r * Math.sin(t));
  });
  return `<g class="star${got ? ' is-got' : ''}" data-star="${i}">${polygon(pts, 'star-shape')}</g>`;
}

export function marbleSlides({ board, controls, stats, notify, signal }) {
  const P = plane({ xmin: MARBLE_RANGE[0], xmax: MARBLE_RANGE[1], ymin: -6, ymax: 6 });
  let level = 0, run = null, frame = 0;

  const params = () => Object.fromEntries(SLIDERS[marbleLevels[level].kind].map(([id]) => [id.slice(3), sliderValue(controls, id)]));
  const trackText = p => (marbleLevels[level].kind === 'line' ? linearText(p.m, p.b) : vertexText(p.a, p.h, p.k));

  function renderControls(values) {
    const { kind } = marbleLevels[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${marbleLevels
      .map((lv, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      SLIDERS[kind].map(([id, label, min, max, step, def], i) => slider(label, id, values?.[i] ?? def, min, max, step)).join('') +
      `<div class="control-row">${button('🔵 放弹珠！', 'drop', 'class="primary"')}</div>
      <p class="lab-note">弹珠从最左边出发，沿着函数图像往右滚。吃到所有星星、又不撞砖墙，就过关。</p>`;
  }

  function scene(path = null, got = null) {
    const { stars, walls, name } = marbleLevels[level];
    const p = params(), f = trackFn(marbleLevels[level].kind, p);
    let out = P.grid();
    out += walls.map(w => {
      const a = P.px(pt(w.x, w.y + w.h));
      return `<rect x="${a.x}" y="${a.y}" width="${w.w * P.sx}" height="${w.h * P.sy}" rx="3" class="marble-wall"/>`;
    }).join('');
    out += P.curve(f, 'marble-track');
    if (path?.length > 1) out += polyline(path.map(P.px).filter((q, i, all) => i % 4 === 0 || i === all.length - 1), 'marble-trail');
    out += stars.map((s, i) => star(P.px(s), got?.[i], i)).join('');
    out += text(pt(32, 40), `第 ${level + 1} 关 · ${name}`, 'laser-title') + text(pt(608, 40), trackText(p), 'laser-eq');
    return out;
  }

  function report(result) {
    const { stars } = marbleLevels[level];
    const got = result ? result.collected.filter(Boolean).length : 0;
    stats.innerHTML = metric('轨道', trackText(params())) + metric('星星', result ? `${got} / ${stars.length}` : '还没放弹珠') +
      metric('结果', !result ? '等你调好轨道' : result.won ? '全部吃到 🎉' : result.crash ? '撞到砖墙' : '还有星星没吃到');
    if (!result) notify('');
    else if (result.won) notify(`🎉 过关！轨道是 ${trackText(params())}。`);
    else if (result.crash) notify(`弹珠在 x ≈ ${fmt(Math.round(result.crash.x * 2) / 2)} 撞墙了，让轨道绕开砖墙。`);
    else notify(`吃到 ${got} 颗，还差 ${stars.length - got} 颗。看看哪颗星星离轨道最远。`);
  }

  function draw() {
    cancelAnimationFrame(frame);
    run = null;
    board.draw(scene());
    report(null);
  }

  function marble(p, crashed = false) {
    return circle(P.px(p), 9, `marble${crashed ? ' is-crashed' : ''}`);
  }

  function finish(result) {
    const end = result.crash ?? result.path.at(-1);
    board.draw(scene(result.path, result.collected) + (end && P.inside(end) ? marble(end, !!result.crash) : ''));
    report(result);
  }

  function drop(animated) {
    const { stars, walls, kind } = marbleLevels[level];
    run = marbleRun(trackFn(kind, params()), stars, walls);
    if (!animated || reducedMotion() || run.path.length < 2) { finish(run); board.animate('.marble-trail'); return; }
    const result = run, firstHit = stars.map(s => result.path.findIndex(q => Math.hypot(q.x - s.x, q.y - s.y) <= MARBLE_TOL));
    const total = result.path.length, duration = 1800, start = performance.now();
    cancelAnimationFrame(frame);
    const tick = now => {
      if (signal.aborted || run !== result) return;
      const i = Math.max(0, Math.min(total - 1, Math.floor(((now - start) / duration) * total)));
      const got = firstHit.map(h => h >= 0 && h <= i);
      const head = result.path[i];
      board.draw(scene(result.path.slice(0, i + 1), got) + (P.inside(head) ? marble(head) : ''));
      if (i < total - 1) frame = requestAnimationFrame(tick);
      else finish(result);
    };
    frame = requestAnimationFrame(tick);
    stats.innerHTML = metric('轨道', trackText(params())) + metric('星星', '弹珠在滚…') + metric('结果', '看着它滚');
  }

  function reset(index, values = null) {
    level = index;
    renderControls(values);
    draw();
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level)),
    drop: () => drop(true),
  }, signal);
  controls.addEventListener('input', draw, { signal });
  signal.addEventListener('abort', () => cancelAnimationFrame(frame));
  reset(0);
  return (index = 0, values = null, go = false) => {
    reset(index, values);
    if (go) drop(false);
    else board.animate('.marble-track');
  };
}

/* ───────── 卡片配对：式子、图像、表格 ───────── */
const COLS = [['eq', '式子'], ['graph', '图像'], ['table', '表格']];
const CARD_W = 192, CARD_H = 80, GAP = 12, LEFT = 14, TOP = 40;

function cardBox(col, row) {
  return { x: LEFT + col * (CARD_W + GAP + 8), y: TOP + row * (CARD_H + 9) };
}

function graphCard(fn, { x, y }) {
  const P = plane({ xmin: -3, xmax: 3, ymin: -3, ymax: 5, box: [x + 30, y + 6, x + CARD_W - 30, y + CARD_H - 6], equal: false });
  let out = line(P.px(pt(-3, 0)), P.px(pt(3, 0)), 'card-axis') + line(P.px(pt(0, -3)), P.px(pt(0, 5)), 'card-axis');
  for (const t of [-2, -1, 1, 2]) out += line(P.px(pt(t, -0.18)), P.px(pt(t, 0.18)), 'card-axis');
  for (const t of [-2, 2, 4]) out += line(P.px(pt(-0.12, t)), P.px(pt(0.12, t)), 'card-axis');
  return out + P.curve(x0 => cardValue(fn, x0), 'card-curve', 80);
}

function tableCard(fn, { x, y }) {
  const rows = cardTable(fn), cw = 44, x0 = x + 20, y0 = y + 32;
  let out = text(pt(x0, y0), 'x', 'card-th') + text(pt(x0, y0 + 30), 'y', 'card-th');
  rows.forEach(([xv, yv], i) => {
    out += text(pt(x0 + (i + 1) * cw, y0), fmt(xv), 'card-td') + text(pt(x0 + (i + 1) * cw, y0 + 30), fmt(yv), 'card-td');
  });
  return out + line(pt(x0 - 12, y0 + 10), pt(x0 + CARD_XS.length * cw + 18, y0 + 10), 'card-axis');
}

export function cardSort({ board, controls, stats, notify, signal }) {
  let round = 0, matched = [], pick = { eq: null, graph: null, table: null };

  const fnOf = id => cardRounds[round].fns.find(f => f.id === id);
  const idAt = (col, row) => cardRounds[round].order[col][row];

  function renderControls() {
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选组">${cardRounds
      .map((r, i) => button(r.name, 'round', `data-round="${i}" aria-pressed="${i === round}"`)).join('')}</div>
      <div class="control-row">${button('↺ 重新配对', 'reset')}</div>
      <p class="lab-note">每一列点一张卡：式子、图像、表格说的是同一个函数，就能配成一组。小窍门：先算 x = 0 时 y 是几。</p>`;
  }

  function draw() {
    let out = COLS.map(([, name], c) => text(pt(cardBox(c, 0).x + CARD_W / 2, 28), name, 'card-head')).join('');
    COLS.forEach(([col], c) => {
      cardRounds[round].order[col].forEach((id, row) => {
        const box = cardBox(c, row), fn = fnOf(id), group = matched.indexOf(id);
        const picked = pick[col] === row;
        const cls = `sort-card${group >= 0 ? ` is-done is-g${group}` : ''}${picked ? ' is-picked' : ''}`;
        let body = `<rect x="${box.x}" y="${box.y}" width="${CARD_W}" height="${CARD_H}" rx="12" class="card-bg"/>`;
        if (col === 'eq') body += text(pt(box.x + CARD_W / 2, box.y + CARD_H / 2 + 8), cardEquation(fn), 'card-eq');
        else if (col === 'graph') body += graphCard(fn, box);
        else body += tableCard(fn, box);
        if (group >= 0) body += text(pt(box.x + CARD_W - 16, box.y + 20), '✓', 'card-check');
        out += group >= 0 ? `<g class="${cls}">${body}</g>` : hotspot(`${col}:${row}`, `${COLS[c][1]}卡片 ${row + 1}`, body, cls);
      });
    });
    board.draw(out);
    const fns = cardRounds[round].fns.length;
    stats.innerHTML = metric('这一组', cardRounds[round].name) + metric('配好', `${matched.length} / ${fns}`) +
      metric('已选', COLS.filter(([col]) => pick[col] !== null).map(([, n]) => n).join('、') || '还没选');
  }

  function check() {
    const [e, g, t] = COLS.map(([col]) => fnOf(idAt(col, pick[col])));
    if (sameFunction(e, g) && sameFunction(e, t)) {
      matched.push(e.id);
      notify(matched.length === cardRounds[round].fns.length
        ? `🎉 全部配对成功！同一个函数，可以写成式子、画成图像、列成表格。`
        : `✓ 配上了：${cardEquation(e)}。`);
    } else {
      const bad = !sameFunction(e, g) ? ['式子', '图像', g] : ['式子', '表格', t];
      const x = [0, 1, 2, -1].find(v => cardValue(e, v) !== cardValue(bad[2], v));
      notify(`再看看：x = ${x} 时，${bad[0]}算出 y = ${fmt(cardValue(e, x))}，${bad[1]}上却是 ${fmt(cardValue(bad[2], x))}。`);
    }
    pick = { eq: null, graph: null, table: null };
  }

  function choose(key) {
    const [col, row] = key.split(':');
    pick[col] = pick[col] === Number(row) ? null : Number(row);
    if (COLS.every(([c]) => pick[c] !== null)) check();
    else notify('');
    draw();
  }

  function reset(index, done = [], picks = [null, null, null]) {
    round = index;
    matched = [...done];
    pick = { eq: picks[0], graph: picks[1], table: picks[2] };
    renderControls();
    notify('');
    draw();
  }

  onHotspot(board, choose, signal);
  onAction(controls, {
    round: btn => reset(Number(btn.dataset.round)),
    reset: () => reset(round),
  }, signal);
  reset(0);
  return (index = 0, done = [], picks = [null, null, null]) => {
    reset(index, done, picks);
    board.animate('.card-bg');
  };
}
