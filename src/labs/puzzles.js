import {
  fmt, mobilePuzzles, mobileShapes, mobileStatus, pt, puzzleShapes, tiltDegrees, armWeight,
  trickExpr, trickSteps, trickValue,
} from '../algebra.js';
import { button, circle, line, metric, onAction, polygon, setSlider, slider, sliderValue, text } from '../board.js';

/* ───────── 平衡挂件 ───────── */
const SHAPE_SIZE = 38, GAP = 16, NEST_DROP = 10;

function shapeSvg(kind, c, label) {
  const r = SHAPE_SIZE / 2;
  let body;
  if (kind === 'circle') body = circle(c, r, 'mobile-shape is-circle');
  else if (kind === 'square') body = polygon([pt(c.x - r, c.y - r), pt(c.x + r, c.y - r), pt(c.x + r, c.y + r), pt(c.x - r, c.y + r)], 'mobile-shape is-square');
  else if (kind === 'triangle') body = polygon([pt(c.x, c.y - r - 2), pt(c.x + r + 2, c.y + r), pt(c.x - r - 2, c.y + r)], 'mobile-shape is-triangle');
  else if (kind === 'hexagon') body = polygon(Array.from({ length: 6 }, (_, i) => pt(c.x + r * Math.cos(i * Math.PI / 3), c.y + r * Math.sin(i * Math.PI / 3))), 'mobile-shape is-hexagon');
  else body = `<rect x="${c.x - r + 3}" y="${c.y - r + 5}" width="${SHAPE_SIZE - 6}" height="${SHAPE_SIZE - 10}" rx="6" class="mobile-shape is-known"/>`;
  return body + text(pt(c.x, c.y + (kind === 'triangle' ? 9 : 6)), label, 'mobile-label');
}

const shapeIcon = kind => `<svg class="mobile-icon" viewBox="-23 -23 46 46" aria-hidden="true">${shapeSvg(kind, pt(0, 0), '')}</svg>`;

const itemHeight = item => (item && typeof item === 'object' ? NEST_DROP + barHeight(item) : SHAPE_SIZE + 4);
const armHeight = arm => arm.reduce((sum, item) => sum + GAP + itemHeight(item), 0);
const barHeight = bar => Math.max(armHeight(bar.left), armHeight(bar.right));

function drawBar(bar, pivot, half, values, show) {
  const L = armWeight(bar.left, values), R = armWeight(bar.right, values);
  const theta = (tiltDegrees(L, R) * Math.PI) / 180;
  const d = pt(Math.cos(theta) * half, Math.sin(theta) * half);
  const ends = [pt(pivot.x - d.x, pivot.y - d.y), pt(pivot.x + d.x, pivot.y + d.y)];
  const level = Math.abs(L - R) < 1e-9;
  let out = line(ends[0], ends[1], `mobile-bar${level ? ' is-level' : ' is-tilted'}`) + circle(pivot, 4.5, 'mobile-pivot');
  [bar.left, bar.right].forEach((arm, side) => {
    let y = ends[side].y;
    const x = ends[side].x;
    for (const item of arm) {
      if (item && typeof item === 'object') {
        out += line(pt(x, y), pt(x, y + GAP + NEST_DROP), 'mobile-string');
        out += drawBar(item, pt(x, y + GAP + NEST_DROP), half * 0.48, values, show);
        y += GAP + itemHeight(item);
      } else {
        out += line(pt(x, y), pt(x, y + GAP), 'mobile-string');
        const label = typeof item === 'number' ? String(item) : show ? fmt(values[item]) : '?';
        out += `<g class="fade-in">${shapeSvg(typeof item === 'number' ? 'known' : item, pt(x, y + GAP + SHAPE_SIZE / 2), label)}</g>`;
        y += GAP + SHAPE_SIZE + 4;
      }
    }
  });
  return out;
}

export function mobilePuzzle({ board, controls, stats, notify, signal }) {
  let level = 0, values = {};

  function reset(index, preset) {
    level = index;
    values = Object.fromEntries(puzzleShapes(mobilePuzzles[level]).map(k => [k, preset?.[k] ?? 1]));
    renderControls();
    draw();
  }

  function renderControls() {
    const puzzle = mobilePuzzles[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${mobilePuzzles
      .map((_, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>
      <p class="lab-note">「${puzzle.name}」：整串挂件总重 <b>${puzzle.total}</b>。每种形状一样重，给它们配上重量，让每根横杆都水平。</p>
      ${puzzleShapes(puzzle).map(k => `<div class="stepper" data-shape="${k}">
        <span>${shapeIcon(k)} ${mobileShapes[k].name}</span>
        ${button('−', 'dec', `data-shape="${k}" aria-label="${mobileShapes[k].name}减 1"`)}
        <output aria-live="polite">${values[k]}</output>
        ${button('+', 'inc', `data-shape="${k}" aria-label="${mobileShapes[k].name}加 1"`)}
      </div>`).join('')}
      <div class="control-row">${button('全部归 1 重来', 'reset')}</div>`;
  }

  function draw(show = true) {
    const puzzle = mobilePuzzles[level], status = mobileStatus(puzzle, values);
    const top = pt(320, 58), height = barHeight(puzzle.bar);
    const pivot = pt(320, Math.min(top.y, 380 - height - 40));
    board.draw(`<rect x="200" y="6" width="240" height="10" rx="5" class="mobile-ceiling"/>` +
      line(pt(320, 16), pivot, 'mobile-string') +
      drawBar(puzzle.bar, pivot, 175, values, show) +
      text(pt(24, 34), `总重 = ${puzzle.total}`, 'mobile-total') +
      (status.solved ? text(pt(616, 34), '✔ 全部平衡', 'mobile-win') : ''));
    board.svg.classList.toggle('is-solved', status.solved);
    stats.innerHTML = metric('目标总重', puzzle.total) + metric('现在总重', fmt(status.total)) +
      metric('横杆', status.balanced ? '全都水平 ✔' : `${status.bars.filter(b => Math.abs(b.left - b.right) > 1e-9).length} 根歪着`);
    for (const [k, v] of Object.entries(values)) {
      const out = controls.querySelector(`.stepper[data-shape="${k}"] output`);
      if (out) out.value = v;
    }
    notify(status.solved ? '🎉 每根横杆都水平，总重也对上了！' : status.balanced ? '横杆都平了，可总重还不对：整体放大或缩小试试。' : '');
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level)),
    inc: btn => { values[btn.dataset.shape] = Math.min(20, values[btn.dataset.shape] + 1); draw(); },
    dec: btn => { values[btn.dataset.shape] = Math.max(1, values[btn.dataset.shape] - 1); draw(); },
    reset: () => reset(level),
  }, signal);

  reset(0);
  return (index = 0, preset = null) => {
    reset(index, preset ?? undefined);
    board.animate('.mobile-bar, .fade-in');
  };
}

/* ───────── 数字魔术 ───────── */
function bagSvg(c, label, open) {
  return `<g class="fade-in">
    <path d="M${c.x - 26} ${c.y + 30}Q${c.x - 34} ${c.y - 6} ${c.x - 14} ${c.y - 18}L${c.x - 18} ${c.y - 28}H${c.x + 18}L${c.x + 14} ${c.y - 18}Q${c.x + 34} ${c.y - 6} ${c.x + 26} ${c.y + 30}Z" class="trick-bag${open ? ' is-open' : ''}"/>
    <path d="M${c.x - 16} ${c.y - 20}H${c.x + 16}" class="trick-tie"/>
    ${text(pt(c.x, c.y + 14), label, 'trick-bag-label')}</g>`;
}

export function numberTrick({ board, controls, stats, signal }) {
  controls.innerHTML = slider('你心里想的数', 'trick-n', 7, 1, 20) +
    `<div class="control-row">${button('← 上一步', 'prev')}${button('下一步 →', 'next', 'class="primary"')}</div>
    <div class="control-row">${button('🎒 打开口袋看看', 'open', 'aria-pressed="false"')}</div>
    <p class="lab-note">口袋里装着你想的数，别人看不见。每一步都对口袋和弹珠做同样的事，最后口袋全拿走了，只剩弹珠。</p>`;
  let step = 0, open = false;
  const openBtn = controls.querySelector('[data-action="open"]');

  function draw() {
    const n = sliderValue(controls, 'trick-n'), s = trickSteps[step];
    let out = text(pt(30, 44), `第 ${step + 1} 步：${s.say}`, 'trick-title');
    const bagGap = 90, bagStart = 200 - ((s.bags - 1) * bagGap) / 2;
    for (let i = 0; i < s.bags; i += 1) out += bagSvg(pt(bagStart + i * bagGap, 150), open ? String(n) : 'x', open);
    if (!s.bags) out += text(pt(200, 160), '口袋都拿走啦', 'trick-empty');
    for (let i = 0; i < s.marbles; i += 1) {
      const c = pt(200 - ((Math.min(s.marbles, 6) - 1) * 32) / 2 + (i % 6) * 32, 250 + Math.floor(i / 6) * 32);
      out += `<circle cx="${c.x}" cy="${c.y}" r="12" class="trick-marble fade-in"/>`;
    }
    const value = trickValue(step, n);
    out += text(pt(200, 318), `代数写法：${trickExpr(step)}`, 'trick-expr');
    out += text(pt(200, 352), `用 ${n} 来算：${s.bags ? `${s.bags > 1 ? `${s.bags} × ` : ''}${n}${s.marbles ? ` + ${s.marbles}` : ''}` : s.marbles} = ${value}`, 'trick-calc');
    trickSteps.forEach((row, i) => {
      const y = 46 + i * 66, cls = i === step ? 'is-on' : i < step ? 'is-done' : '';
      out += `<g class="trick-row ${cls}"><rect x="404" y="${y - 22}" width="216" height="54" rx="12"/>
        ${text(pt(418, y), `${i + 1}. ${row.say}`, 'trick-row-say')}
        ${text(pt(418, y + 22), i <= step ? `${trickExpr(i)}   →   ${trickValue(i, n)}` : '…', 'trick-row-expr')}</g>`;
    });
    board.draw(out);
    stats.innerHTML = metric('你想的数', open ? n : '保密 🤫') + metric('现在的式子', trickExpr(step)) + metric('现在的结果', value);
    controls.querySelector('[data-action="prev"]').disabled = step === 0;
    controls.querySelector('[data-action="next"]').disabled = step === trickSteps.length - 1;
    openBtn.setAttribute('aria-pressed', String(open));
  }

  onAction(controls, {
    prev: () => { step = Math.max(0, step - 1); draw(); board.animate('.fade-in'); },
    next: () => { step = Math.min(trickSteps.length - 1, step + 1); draw(); board.animate('.fade-in'); },
    open: () => { open = !open; draw(); },
  }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();
  return (n = 7, nextStep = 0, nextOpen = false) => {
    setSlider(controls, 'trick-n', n);
    step = nextStep;
    open = nextOpen;
    draw();
    board.animate('.fade-in');
  };
}
