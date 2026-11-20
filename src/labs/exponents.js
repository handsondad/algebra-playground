import {
  bounceSeries, chessboardCount, dotsPolyText, dotsValue, explodeAll, explodeStep, firstBounceBelow, fmt,
  growthCompare, initDots, pt, supText,
} from '../algebra.js';
import {
  button, circle, line, metric, onAction, polyline, setSlider, slider, sliderValue, text,
} from '../board.js';

/* ───────── 棋盘上的麦粒：翻倍有多快 ───────── */
export function wheatChessboard({ board, controls, stats, signal }) {
  controls.innerHTML = slider('走到棋盘第几格：n', 'wc-n', 6, 1, 16) +
    `<p class="lab-note">第 1 格放 1 颗麦子，以后每走一格就<b>翻一倍</b>（×2）。跟「每次加 2 颗」和「n² 颗」比一比，谁追得最快？</p>`;

  function draw() {
    const n = sliderValue(controls, 'wc-n');
    const g = growthCompare(n);
    const cell = 38, ox = 32, oy = 68;
    let out = text(pt(184, 44), '棋盘前 16 格（每格麦粒数）', 'stair-label');

    for (let idx = 0; idx < 16; idx += 1) {
      const r = Math.floor(idx / 4), c = idx % 4, sq = idx + 1;
      const x = ox + c * (cell + 36), y = oy + r * (cell + 26);
      const w = 68, h = 54;
      const active = sq === n, passed = sq < n;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="chess-sq${active ? ' is-on' : passed ? ' is-done' : ''}"/>`;
      out += text(pt(x + 12, y + 17), `#${sq}`, 'chess-idx');
      const val = 2 ** idx;
      out += text(pt(x + w / 2, y + 40), val >= 10000 ? `${(val / 1000).toFixed(1)}k` : String(val), 'chess-val');
    }

    // 右侧柱状对比：2n vs n² vs 2ⁿ⁻¹（按当前最大值归一化，让倍数差距一目了然）
    const maxV = Math.max(g.linear, g.quadratic, g.exponential, 8);
    const bars = [
      { name: `2n = ${g.linear}`, sub: '每次 +2', val: g.linear, cls: 'is-lin' },
      { name: `n² = ${g.quadratic}`, sub: '正方形', val: g.quadratic, cls: 'is-quad' },
      { name: `2${supText(n - 1)} = ${g.exponential}`, sub: '每次 ×2', val: g.exponential, cls: 'is-exp' },
    ];
    const baseY = 278, maxBarH = 166;
    out += text(pt(486, 44), `第 ${n} 格三种规则对比`, 'stair-label');
    bars.forEach((b, i) => {
      const bx = 374 + i * 86, bh = Math.max(6, (b.val / maxV) * maxBarH);
      out += `<rect x="${bx}" y="${baseY - bh}" width="58" height="${bh}" rx="7" class="growth-bar ${b.cls} fade-in"/>`;
      out += text(pt(bx + 29, baseY - bh - 8), String(b.val), 'growth-num');
      out += text(pt(bx + 29, baseY + 20), b.sub, 'plane-tick');
    });
    out += line(pt(358, baseY), pt(622, baseY), 'plane-axis');

    const all64 = chessboardCount(64);
    out += text(pt(320, 344),
      `前 ${n} 格加起来：1 + 2 + … + 2${supText(n - 1)} = 2${supText(n)} − 1 = ${g.expTotal} 颗`,
      'exp-banner');
    out += text(pt(320, 376),
      `如果铺满 64 格：一共 2⁶⁴ − 1 ≈ 1845 亿亿颗麦子（比全世界几百年麦子还多）！`,
      'tile-note');
    void all64;

    board.draw(out);
    stats.innerHTML = metric(`第 ${n} 格（2${supText(n - 1)}）`, `${g.exponential} 颗`) +
      metric(`前 ${n} 格总和`, `${g.expTotal} 颗`) +
      metric('对比 n²', `${g.quadratic} 颗`);
  }

  controls.addEventListener('input', draw, { signal });
  draw();

  return (n = 6) => {
    setSlider(controls, 'wc-n', n);
    draw();
    board.animate('.fade-in, .chess-sq.is-on');
  };
}

/* ───────── 爆炸圆点进制机（Global Math Project 1 ← b 与 1 ← x） ───────── */
const BASES = [
  [2, '1 ← 2 二进制'],
  [3, '1 ← 3 三进制'],
  [10, '1 ← 10 十进制'],
];

export function explodingDots({ board, controls, stats, notify, signal }) {
  const WIDTH = 5;
  let base = 2, boxes = initDots(13, WIDTH), showX = false, flashIdx = -1;

  controls.innerHTML = `<div class="control-row" role="group" aria-label="选机器规则">${BASES
    .map(([b, label]) => button(label, 'base', `data-base="${b}" aria-pressed="${b === base}"`)).join('')}</div>` +
    slider('往最右边的格子里放几颗圆点：N', 'ed-n', 13, 0, 30) +
    `<div class="control-row">
      ${button('💥 爆炸一步！', 'step', 'class="primary"')}
      ${button('⚡ 全部炸完', 'all')}
      ${button('🔤 把进位写成 x 的幂', 'poly', 'aria-pressed="false"')}
      ${button('重置圆点', 'reset')}
    </div>
    <p class="lab-note">「1 ← b」机器的规矩超简单：同一个格子里每攒够 <b>b 颗圆点</b>，就「砰！」合体成左边相邻格里的 <b>1 颗圆点</b>。</p>`;

  function resetBoxes(n) {
    boxes = initDots(n, WIDTH);
    flashIdx = -1;
  }

  function draw() {
    const n = sliderValue(controls, 'ed-n');
    const canBoom = boxes.slice(0, -1).some(c => c >= base);
    let out = text(pt(320, 40),
      showX ? `多项式眼光（令 x = ${base}）：每往左一格就是乘一次 x` : `当前机器：1 ← ${base}（满 ${base} 进 1）`,
      'exp-banner');

    // 从左到右画 i = 4, 3, 2, 1, 0 五个盒子
    for (let pos = 0; pos < WIDTH; pos += 1) {
      const i = WIDTH - 1 - pos;
      const x = 32 + pos * 118, y = 70, w = 104, h = 166;
      const ready = i < WIDTH - 1 && boxes[i] >= base;
      const boomed = i === flashIdx + 1;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="dot-box${ready ? ' is-ready' : boomed ? ' is-boom' : ''}"/>`;
      const unitLabel = showX
        ? (i === 0 ? '1' : i === 1 ? 'x' : `x${supText(i)}`)
        : `${base ** i}`;
      out += text(pt(x + w / 2, y - 10), unitLabel, 'stair-label');

      const count = boxes[i];
      const shown = Math.min(count, 20);
      for (let d = 0; d < shown; d += 1) {
        const dc = pt(x + 20 + (d % 4) * 21, y + 28 + Math.floor(d / 4) * 22);
        out += circle(dc, 7.5, d < base && ready ? 'exp-dot is-hot fade-in' : 'exp-dot fade-in');
      }
      if (count > 20) out += text(pt(x + w / 2, y + 138), `+${count - 20}`, 'plane-tick');
      out += text(pt(x + w / 2, y + h + 26), String(count), 'dot-digit');
    }

    const digits = [...boxes].reverse().join('');
    const poly = dotsPolyText(boxes);
    out += text(pt(320, 316),
      canBoom ? `还有格子满 ${base} 颗！点「💥 爆炸一步」看看会发生什么`
        : `✔ 稳定啦！${n} 在 ${base} 进制下写作 ${digits.replace(/^0+(?=\d)/, '')}`,
      canBoom ? 'ineq-sub is-warn' : 'cage-verdict is-win');
    out += text(pt(320, 356),
      `写成 x 的多项式：${poly}（把 x = ${base} 代进去正好等于 ${dotsValue(boxes, base)}）`,
      'yh-formula');

    board.draw(out);
    controls.querySelectorAll('[data-action="base"]').forEach(btn =>
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.base) === base)));
    controls.querySelector('[data-action="poly"]').setAttribute('aria-pressed', String(showX));
    controls.querySelector('[data-action="step"]').disabled = !canBoom;
    stats.innerHTML = metric('总数值不变', dotsValue(boxes, base)) +
      metric(`${base} 进制读数`, canBoom ? '还在爆炸中…' : digits.replace(/^0+(?=\d)/, '')) +
      metric('多项式写法', poly);
  }

  onAction(controls, {
    base: btn => {
      base = Number(btn.dataset.base);
      resetBoxes(sliderValue(controls, 'ed-n'));
      notify('');
      draw();
    },
    step: () => {
      const res = explodeStep(boxes, base);
      if (!res) return;
      boxes = res.boxes;
      flashIdx = res.explodedAt;
      draw();
      board.animate('.fade-in, .dot-box.is-boom');
      if (!explodeStep(boxes, base)) notify(`🎉 全部炸完！${sliderValue(controls, 'ed-n')} 变成了 ${polyLabel()}。`);
    },
    all: () => {
      const n = sliderValue(controls, 'ed-n');
      boxes = explodeAll(n, base, WIDTH).boxes;
      flashIdx = -1;
      draw();
      board.animate('.fade-in');
      notify(`🎉 ${n} 在 1 ← ${base} 机器里稳定为 ${dotsPolyText(boxes)}！`);
    },
    poly: () => { showX = !showX; draw(); },
    reset: () => { resetBoxes(sliderValue(controls, 'ed-n')); notify(''); draw(); },
  }, signal);

  const polyLabel = () => [...boxes].reverse().join('').replace(/^0+(?=\d)/, '');

  controls.addEventListener('input', () => {
    resetBoxes(sliderValue(controls, 'ed-n'));
    notify('');
    draw();
  }, { signal });
  draw();

  return (nextBase = 2, n = 13, exploded = false, nextShowX = false) => {
    base = nextBase;
    showX = nextShowX;
    setSlider(controls, 'ed-n', n);
    boxes = exploded ? explodeAll(n, base, WIDTH).boxes : initDots(n, WIDTH);
    flashIdx = -1;
    draw();
    board.animate('.fade-in');
  };
}

/* ───────── 弹跳小球的高度：指数衰减 h₀ · rⁿ ───────── */
export function bouncingDecay({ board, controls, stats, signal }) {
  let showLinear = false;
  controls.innerHTML = slider('松手时的初始高度 h₀（米）', 'bd-h0', 8, 4, 10) +
    slider('每次弹起上次的几分之几：r', 'bd-r', 0.5, 0.4, 0.8, 0.1) +
    `<div class="control-row">${button('📉 对比「每次固定少 2 米」的直线', 'cmp', 'aria-pressed="false"')}</div>
    <p class="lab-note">指数衰减每次都<b>乘同一个小于 1 的数 r</b>：一开始掉得猛，越往后掉得越慢，贴近地面却不会穿到地下去。</p>`;

  function draw() {
    const h0 = sliderValue(controls, 'bd-h0');
    const r = sliderValue(controls, 'bd-r');
    const series = bounceSeries(h0, r, 6);
    const left = 62, right = 602, top = 42, bottom = 330;
    const xAt = n => left + (n / 6) * (right - left);
    const yAt = h => bottom - (Math.max(0, h) / 10) * (bottom - top);

    let out = `<rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}" class="plane-bg"/>`;
    for (let h = 0; h <= 10; h += 2) {
      const py = yAt(h);
      out += line(pt(left, py), pt(right, py), h === 0 ? 'plane-axis' : 'plane-grid');
      out += text(pt(left - 10, py + 4), `${h}m`, 'plane-tick is-y');
    }
    // 1 米观察虚线
    out += line(pt(left, yAt(1)), pt(right, yAt(1)), 'decay-threshold');
    out += text(pt(right - 6, yAt(1) - 6), '1 米线', 'decay-tag');

    // 弹跳拱形轨迹
    let arcPath = '';
    for (let i = 0; i < series.length - 1; i += 1) {
      const x1 = xAt(i), y1 = yAt(series[i].h);
      const xMid = (xAt(i) + xAt(i + 1)) / 2;
      const x2 = xAt(i + 1), y2 = yAt(series[i + 1].h);
      arcPath += `M${x1.toFixed(1)},${y1.toFixed(1)} Q${(x1 + xMid) / 2},${y1.toFixed(1)} ${xMid.toFixed(1)},${bottom} Q${(xMid + x2) / 2},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} `;
    }
    out += `<path d="${arcPath}" class="decay-arc"/>`;
    out += polyline(series.map(s => pt(xAt(s.n), yAt(s.h))), 'decay-curve');

    if (showLinear) {
      const linPts = Array.from({ length: 7 }, (_, n) => pt(xAt(n), yAt(Math.max(0, h0 - 2 * n))));
      out += polyline(linPts, 'aux');
    }

    series.forEach(s => {
      const p = pt(xAt(s.n), yAt(s.h));
      out += line(pt(p.x, bottom), p, 'decay-bar');
      out += `<g class="fade-in">${circle(p, 8, 'decay-ball')}</g>`;
      out += text(pt(p.x, p.y - 12), fmt(s.h, 2), 'growth-num');
      out += text(pt(p.x, bottom + 20), `第${s.n}次`, 'plane-tick');
    });

    const under1 = firstBounceBelow(h0, r, 1);
    out += text(pt(332, 378),
      `公式：h(n) = ${h0} × ${fmt(r)}${supText('n')}   ·   第 ${under1} 次弹起后高度低于 1 米`,
      'exp-banner');

    board.draw(out);
    controls.querySelector('[data-action="cmp"]').setAttribute('aria-pressed', String(showLinear));
    stats.innerHTML = metric('第 1 次弹起', `${fmt(series[1].h, 2)} 米`) +
      metric('第 3 次弹起', `${fmt(series[3].h, 2)} 米`) +
      metric('低于 1 米', `第 ${under1} 次`);
  }

  onAction(controls, {
    cmp: () => { showLinear = !showLinear; draw(); },
  }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();

  return (h0 = 8, r = 0.5, nextLinear = false) => {
    showLinear = nextLinear;
    setSlider(controls, 'bd-h0', h0);
    setSlider(controls, 'bd-r', r);
    draw();
    board.animate('.fade-in, .decay-curve');
  };
}
