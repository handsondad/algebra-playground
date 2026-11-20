import { completeSquare, factorLevels, factorText, factorTry, polyText, pt, tileProduct } from '../algebra.js';
import { button, metric, onAction, setSlider, slider, sliderValue, text } from '../board.js';

const tile = (x, y, w, h, kind, label = '') =>
  `<g class="tile-g"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="tile is-${kind}"/>${label ? text(pt(x + w / 2, y + h / 2 + 5), label, `tile-label is-${kind}`) : ''}</g>`;

/** 上边和左边的尺子：x 一段、1 一段一段 */
function rulers(o, X, U, across, down) {
  let out = '';
  const top = o.y - 10, left = o.x - 12;
  out += `<path d="M${o.x} ${top}H${o.x + X}" class="tile-ruler"/>` + text(pt(o.x + X / 2, top - 6), 'x', 'tile-ruler-label');
  for (let i = 0; i < across; i += 1) out += `<path d="M${o.x + X + i * U + 2} ${top}H${o.x + X + (i + 1) * U - 2}" class="tile-ruler is-unit"/>` + text(pt(o.x + X + (i + 0.5) * U, top - 6), '1', 'tile-ruler-label is-unit');
  out += `<path d="M${left} ${o.y}V${o.y + X}" class="tile-ruler"/>` + text(pt(left - 9, o.y + X / 2 + 5), 'x', 'tile-ruler-label');
  for (let j = 0; j < down; j += 1) out += `<path d="M${left} ${o.y + X + j * U + 2}V${o.y + X + (j + 1) * U - 2}" class="tile-ruler is-unit"/>` + text(pt(left - 9, o.y + X + (j + 0.5) * U + 5), '1', 'tile-ruler-label is-unit');
  return out;
}

const panelLines = (lines, x = 372, y = 58, gap = 34) =>
  lines.map(([value, cls = 'tile-panel'], i) => text(pt(x, y + i * gap), value, cls)).join('');

/* ───────── (x + a)(x + b) ───────── */
export function tileMultiply({ board, controls, stats, signal }) {
  controls.innerHTML = slider('右边加几个 1：a', 'tm-a', 2, 0, 5) + slider('下边加几个 1：b', 'tm-b', 3, 0, 5) +
    slider('x 有多长（换一个 x 试试）', 'tm-x', 4, 2, 6) +
    '<p class="lab-note">蓝色大方块是 x²，绿色长条是 x，黄色小方块是 1。长 × 宽 = 拼出来的所有瓷砖。</p>';

  function draw() {
    const a = sliderValue(controls, 'tm-a'), b = sliderValue(controls, 'tm-b'), n = sliderValue(controls, 'tm-x');
    const U = 26, X = n * U, o = pt(52, 58);
    let out = rulers(o, X, U, a, b) + tile(o.x, o.y, X, X, 'x2', 'x²');
    for (let i = 0; i < a; i += 1) out += tile(o.x + X + i * U, o.y, U, X, 'x', 'x');
    for (let j = 0; j < b; j += 1) out += tile(o.x, o.y + X + j * U, X, U, 'x', 'x');
    for (let i = 0; i < a; i += 1) for (let j = 0; j < b; j += 1) out += tile(o.x + X + i * U, o.y + X + j * U, U, U, 'one');
    const p = tileProduct(a, b);
    out += panelLines([
      [`(x + ${a})(x + ${b})`, 'tile-panel is-big'],
      [`= ${polyText(p)}`, 'tile-panel is-big'],
      [`🟦 x²：1 块`], [`🟩 x：${a} + ${b} = ${a + b} 条`], [`🟨 1：${a} × ${b} = ${a * b} 块`],
      [`x = ${n} 时验算：`, 'tile-panel is-soft'],
      [`(${n} + ${a})(${n} + ${b}) = ${(n + a) * (n + b)}`, 'tile-panel is-soft'],
      [`${n}² + ${a + b}×${n} + ${a * b} = ${n * n + (a + b) * n + a * b}`, 'tile-panel is-soft'],
    ], 362, 52, 38);
    board.draw(out);
    stats.innerHTML = metric('长 × 宽', `(x + ${a})(x + ${b})`) + metric('瓷砖加起来', polyText(p)) + metric(`x = ${n} 时面积`, (n + a) * (n + b));
  }
  controls.addEventListener('input', draw, { signal });
  draw();
  return (a = 2, b = 3, n = 4) => {
    setSlider(controls, 'tm-a', a); setSlider(controls, 'tm-b', b); setSlider(controls, 'tm-x', n);
    draw();
    board.animate('.tile-g .tile, .tile-ruler');
  };
}

/* ───────── 拼长方形：因式分解 ───────── */
export function tileFactor({ board, controls, stats, notify, signal }) {
  let level = 0;
  function renderControls(p) {
    const { b } = factorLevels[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${factorLevels
      .map((lv, i) => button(polyText({ x2: 1, x: lv.b, c: lv.c }), 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider('放到右边的 x 条（其余放到下边）', 'tf-p', p, 0, b) +
      '<p class="lab-note">把绿色长条分成右边一组、下边一组，右下角就空出一块。小方块正好铺满那一角，长方形就拼成了。</p>';
  }

  function draw() {
    const { b, c } = factorLevels[level];
    const p = sliderValue(controls, 'tf-p'), t = factorTry(b, c, p);
    const U = 24, X = 120, o = pt(52, 58);
    let out = rulers(o, X, U, t.p, t.q) + tile(o.x, o.y, X, X, 'x2', 'x²');
    for (let i = 0; i < t.p; i += 1) out += tile(o.x + X + i * U, o.y, U, X, 'x', 'x');
    for (let j = 0; j < t.q; j += 1) out += tile(o.x, o.y + X + j * U, X, U, 'x', 'x');
    let used = 0;
    for (let j = 0; j < t.q; j += 1) for (let i = 0; i < t.p; i += 1) {
      const x = o.x + X + i * U, y = o.y + X + j * U;
      if (used < c) { out += tile(x, y, U, U, 'one'); used += 1; }
      else out += `<rect x="${x + 2}" y="${y + 2}" width="${U - 4}" height="${U - 4}" rx="3" class="tile-missing"/>`;
    }
    const extra = c - used;
    out += panelLines([
      [`目标：${polyText({ x2: 1, x: b, c })}`, 'tile-panel is-big'],
      [`右边 ${t.p} 条，下边 ${t.q} 条`],
      [`角上要 ${t.p} × ${t.q} = ${t.need} 块`],
      [`手里有 ${c} 块小方块`],
      [t.fits ? `= ${factorText(t.p, t.q)} ✔` : t.missing ? `还缺 ${t.missing} 块 ✗` : `多出 ${t.extra} 块 ✗`, t.fits ? 'tile-panel is-win' : 'tile-panel is-warn'],
    ], 372, 58, 40);
    if (extra > 0) {
      out += text(pt(372, 282), '放不进去的：', 'tile-panel is-soft');
      for (let k = 0; k < extra; k += 1) out += tile(372 + (k % 9) * (U + 3), 296 + Math.floor(k / 9) * (U + 3), U, U, 'one');
    }
    board.draw(out);
    stats.innerHTML = metric('长 × 宽', `(x + ${t.p})(x + ${t.q})`) + metric('角上需要', `${t.need} 块`) + metric('拼成长方形', t.fits ? '成功 ✔' : '还不行');
    notify(t.fits ? `🎉 拼成了！${polyText({ x2: 1, x: b, c })} = ${factorText(t.p, t.q)}` : '');
  }

  function reset(index, p = 0) {
    level = index;
    renderControls(p);
    draw();
  }
  onAction(controls, { level: btn => reset(Number(btn.dataset.level)) }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0, 1);
  return (index = 0, p = 1) => {
    reset(index, p);
    board.animate('.tile-g .tile, .tile-missing');
  };
}

/* ───────── 配方法：花拉子米的补角 ───────── */
const SQUARE_STEPS = ['摆出 x² + bx', '把 x 条对半分', '缺了一个角', '补上角，变成大正方形'];
const ROOT = 3;

export function completeSquareLab({ board, controls, stats, signal }) {
  controls.innerHTML = slider('x 条一共有几条：b', 'cs-b', 10, 2, 10, 2) +
    `<div class="control-row" role="group" aria-label="步骤">${SQUARE_STEPS.map((s, i) => button(`${i + 1}. ${s}`, 'step', `data-step="${i}"`)).join('')}</div>
    <p class="lab-note">花拉子米的办法：把 b 条 x 平分到正方形的两条边上，缺的那个角补上，整块就成了正方形。</p>`;
  let step = 0;

  function draw() {
    const b = sliderValue(controls, 'cs-b'), c = ROOT * ROOT + ROOT * b;
    const { half, corner } = completeSquare(b);
    const U = 14, X = 140, o = pt(40, 60), H = half * U;
    let out = tile(o.x, o.y, X, X, 'x2', 'x²');
    if (step === 0) {
      for (let i = 0; i < b; i += 1) out += tile(o.x + X + i * U, o.y, U, X, 'x');
      out += text(pt(o.x + X + (b * U) / 2, o.y + X + 26), `${b} 条 x`, 'tile-note');
    } else {
      for (let i = 0; i < half; i += 1) out += tile(o.x + X + i * U, o.y, U, X, 'x');
      for (let j = 0; j < half; j += 1) out += tile(o.x, o.y + X + j * U, X, U, 'x');
      if (step === 2) out += `<rect x="${o.x + X}" y="${o.y + X}" width="${H}" height="${H}" class="tile-missing is-corner"/>`;
      if (step === 3) {
        for (let i = 0; i < half; i += 1) for (let j = 0; j < half; j += 1) out += tile(o.x + X + i * U, o.y + X + j * U, U, U, 'gold');
        out += `<rect x="${o.x - 4}" y="${o.y - 4}" width="${X + H + 8}" height="${X + H + 8}" rx="6" class="tile-outline"/>`;
        out += text(pt(o.x + (X + H) / 2, o.y - 14), `x + ${half}`, 'tile-ruler-label');
      }
      if (step >= 2) out += text(pt(o.x + X + H / 2, o.y + X + H + 22), `${half} × ${half} = ${corner}`, 'tile-note');
    }
    const lines = [[`x² + ${b}x = ${c}`, 'tile-panel is-big']];
    if (step >= 1) lines.push([`右边 ${half} 条，下边 ${half} 条`]);
    if (step >= 2) lines.push([`缺的角：${half}² = ${corner}`]);
    if (step >= 3) {
      lines.push([`两边都补上 ${corner}：`]);
      lines.push([`(x + ${half})² = ${c} + ${corner} = ${c + corner}`, 'tile-panel is-big']);
      lines.push([`x + ${half} = ${Math.sqrt(c + corner)}`]);
      lines.push([`x = ${ROOT} ✔`, 'tile-panel is-win']);
    }
    out += panelLines(lines, 372, 58, 38);
    out += text(pt(372, 380), `第 ${step + 1} 步：${SQUARE_STEPS[step]}`, 'tile-step');
    board.draw(out);
    controls.querySelectorAll('[data-action="step"]').forEach(btn => btn.setAttribute('aria-pressed', String(Number(btn.dataset.step) === step)));
    stats.innerHTML = metric('方程', `x² + ${b}x = ${c}`) + metric('要补的角', step >= 2 ? `${corner} 块` : '？') + metric('答案', step >= 3 ? `x = ${ROOT}` : '先补成正方形');
  }

  onAction(controls, { step: btn => { step = Number(btn.dataset.step); draw(); board.animate('.tile-g .tile, .tile-missing, .tile-outline'); } }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();
  return (b = 10, nextStep = 0) => {
    setSlider(controls, 'cs-b', b);
    step = nextStep;
    draw();
    board.animate('.tile-g .tile, .tile-missing, .tile-outline');
  };
}
