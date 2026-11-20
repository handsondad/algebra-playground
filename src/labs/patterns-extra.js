import {
  fibSquares, fmt, gnomonCells, halvingPieces, oddSum, oddTerm, PHI, pt, staircaseSum, supText,
} from '../algebra.js';
import {
  button, hotspot, line, metric, onAction, onHotspot, setSlider, slider, sliderValue, text,
} from '../board.js';

/* ───────── 奇数拐尺拼正方形：1 + 3 + … + (2n − 1) = n² ───────── */
export function oddSquares({ board, controls, stats, signal }) {
  let splitDiag = false, focusLayer = 4;

  controls.innerHTML = slider('拼到几乘几的正方形：n', 'os-n', 5, 1, 8) +
    `<div class="control-row">
      ${button('🌈 按每层奇数拐尺上色', 'mode', 'data-diag="0" aria-pressed="true"')}
      ${button('📐 沿对角线切成两座楼梯', 'mode', 'data-diag="1" aria-pressed="false"')}
    </div>
    <p class="lab-note">从 1 颗小方块出发，每次在外圈包上一层「L 形拐尺」：3 颗、5 颗、7 颗……也可以直接点画板上的任意一层！</p>`;

  function draw() {
    const n = sliderValue(controls, 'os-n');
    if (focusLayer > n) focusLayer = n;
    const s = Math.min(36, 272 / n), o = pt(48, 64);
    const cells = gnomonCells(n);
    let out = '';

    for (const cell of cells) {
      const x = o.x + cell.col * s, y = o.y + cell.row * s;
      const cls = splitDiag
        ? `gnomon-cell ${cell.lowerTri ? 'is-tri-a' : 'is-tri-b'} fade-in`
        : `gnomon-cell is-l${((cell.layer - 1) % 6) + 1}${cell.layer === focusLayer ? ' is-focus' : ''} fade-in`;
      const rect = `<rect x="${x + 1.5}" y="${y + 1.5}" width="${s - 3}" height="${s - 3}" rx="5" class="${cls}"/>`;
      out += hotspot(`layer:${cell.layer}`, `第 ${cell.layer} 层：${oddTerm(cell.layer)} 块`, rect);
    }

    if (splitDiag && n >= 2) {
      out += line(pt(o.x, o.y + s * 0.02), pt(o.x + n * s, o.y + n * s), 'ds-cut');
    }
    out += text(pt(o.x + (n * s) / 2, o.y - 12), `${n} 列`, 'stair-label');
    out += text(pt(o.x - 18, o.y + (n * s) / 2 + 5), `${n}`, 'stair-label');

    const odds = Array.from({ length: n }, (_, i) => oddTerm(i + 1));
    const sumStr = n <= 5 ? odds.join(' + ') : `1 + 3 + 5 + … + ${oddTerm(n)}`;
    const panel = splitDiag ? [
      [`正方形面积 = ${n}² = ${n * n}`, 'tile-panel is-big'],
      ['沿对角线分成两座高斯楼梯：'],
      [`🟩 大楼梯：1 + … + ${n} = ${staircaseSum(n)}`],
      [`🟨 小楼梯：${n > 1 ? `1 + … + ${n - 1} = ${staircaseSum(n - 1)}` : '0'}`],
      [`${staircaseSum(n)} + ${staircaseSum(n - 1)} = ${n * n} ✔`, 'tile-panel is-win'],
    ] : [
      [`${sumStr}`, 'tile-panel is-big'],
      [`= ${n}² = ${oddSum(n)}`, 'tile-panel is-big'],
      [`点中的第 ${focusLayer} 层拐尺：`],
      [`横 ${focusLayer} + 竖 ${focusLayer} − 角上共用 1`],
      [`= 2 × ${focusLayer} − 1 = ${oddTerm(focusLayer)} 块`, 'tile-panel is-win'],
      ['每包一层奇数，还是正方形！', 'tile-panel is-soft'],
    ];
    out += panel.map(([v, cls = 'tile-panel'], i) => text(pt(354, 68 + i * 44), v, cls)).join('');

    board.draw(out);
    controls.querySelectorAll('[data-action="mode"]').forEach(btn =>
      btn.setAttribute('aria-pressed', String((btn.dataset.diag === '1') === splitDiag)));
    stats.innerHTML = metric(`前 ${n} 个奇数和`, oddSum(n)) +
      metric('正方形面积', `${n} × ${n} = ${n * n}`) +
      metric(splitDiag ? '两座楼梯' : `第 ${focusLayer} 层拐尺`, splitDiag ? `${staircaseSum(n)} + ${staircaseSum(n - 1)}` : `${oddTerm(focusLayer)} 块`);
  }

  onHotspot(board, key => {
    if (!key.startsWith('layer:')) return;
    focusLayer = Number(key.slice(6));
    splitDiag = false;
    draw();
  }, signal);
  onAction(controls, {
    mode: btn => { splitDiag = btn.dataset.diag === '1'; draw(); board.animate('.fade-in'); },
  }, signal);
  controls.addEventListener('input', () => {
    focusLayer = sliderValue(controls, 'os-n');
    draw();
  }, { signal });
  draw();

  return (n = 5, nextSplit = false, layer = n) => {
    splitDiag = nextSplit;
    focusLayer = layer;
    setSlider(controls, 'os-n', n);
    draw();
    board.animate('.fade-in');
  };
}

/* ───────── 兔子数列与黄金长方形 ───────── */
function quarterArc(sq, toPx, scale) {
  const { x, y, size: s, dir } = sq;
  let start, end;
  if (dir === 3) { start = pt(x, y + s); end = pt(x + s, y); }
  else if (dir === 0) { start = pt(x, y); end = pt(x + s, y + s); }
  else if (dir === 1) { start = pt(x + s, y); end = pt(x, y + s); }
  else { start = pt(x + s, y + s); end = pt(x, y); }
  const a = toPx(start), b = toPx(end), r = (s * scale).toFixed(2);
  return `<path d="M${a.x.toFixed(2)},${a.y.toFixed(2)} A${r},${r} 0 0 0 ${b.x.toFixed(2)},${b.y.toFixed(2)}" class="fib-arc"/>`;
}

export function fibonacciSpiral({ board, controls, stats, signal }) {
  let showSpiral = true;
  controls.innerHTML = slider('拼几个斐波那契正方形：n', 'fb-n', 6, 2, 9) +
    `<div class="control-row">${button('🐚 画出黄金螺线', 'spiral', 'aria-pressed="true"')}</div>
    <p class="lab-note">1, 1, 2, 3, 5, 8, 13……每个新正方形的边长，正好等于前两个相加，所以严丝合缝拼成大长方形！</p>`;

  function draw() {
    const n = sliderValue(controls, 'fb-n');
    const { squares, nums, box, ratio } = fibSquares(n);
    const scale = Math.min(286 / box.width, 286 / box.height);
    const cx = 192 - ((box.xmin + box.xmax) / 2) * scale;
    const cy = 200 + ((box.ymin + box.ymax) / 2) * scale;
    const toPx = p => pt(cx + p.x * scale, cy - p.y * scale);

    let out = '';
    squares.forEach((sq, i) => {
      const tl = toPx(pt(sq.x, sq.y + sq.size)), pxSize = sq.size * scale;
      out += `<rect x="${tl.x}" y="${tl.y}" width="${pxSize}" height="${pxSize}" class="fib-sq is-c${i % 6} fade-in"/>`;
      if (pxSize >= 20) {
        out += text(pt(tl.x + pxSize / 2, tl.y + pxSize / 2 + 5), String(sq.size), 'fib-label');
      }
    });
    if (showSpiral) {
      out += squares.map(sq => quarterArc(sq, toPx, scale)).join('');
    }

    const last = nums[n - 1], prev = nums[n - 2];
    const longSide = Math.max(box.width, box.height), shortSide = Math.min(box.width, box.height);
    const panel = [
      ['递推规律：Fₙ = Fₙ₋₁ + Fₙ₋₂', 'tile-panel is-big'],
      [`数列：${nums.join(', ')}`],
      [`最新一项：${n >= 3 ? `${nums[n - 3]} + ${prev} = ${last}` : '开头两个 1'}`],
      [`拼成长方形：${longSide} × ${shortSide} = ${longSide * shortSide}`],
      [`长 ÷ 宽 = ${longSide} ÷ ${shortSide} ≈ ${fmt(ratio, 4)}`, 'tile-panel is-win'],
      [`一步步逼近黄金比 φ ≈ ${fmt(PHI, 4)}`, 'tile-panel is-soft'],
      ['面积恒等式：', 'tile-panel is-soft'],
      [`1²+1²+…+${last}² = ${shortSide}×${longSide}`, 'tile-panel is-soft'],
    ];
    out += panel.map(([v, cls = 'tile-panel'], i) => text(pt(368, 54 + i * 40), v, cls)).join('');

    board.draw(out);
    controls.querySelector('[data-action="spiral"]').setAttribute('aria-pressed', String(showSpiral));
    stats.innerHTML = metric(`第 ${n} 项`, last) +
      metric('大长方形', `${longSide} × ${shortSide}`) +
      metric('长宽比', fmt(ratio, 3));
  }

  onAction(controls, {
    spiral: () => { showSpiral = !showSpiral; draw(); board.animate('.fib-arc'); },
  }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();

  return (n = 6, nextSpiral = true) => {
    showSpiral = nextSpiral;
    setSlider(controls, 'fb-n', n);
    draw();
    board.animate('.fade-in, .fib-arc');
  };
}

/* ───────── 切半正方形：1/2 + 1/4 + 1/8 + … = 1 ───────── */
export function halvingSquare({ board, controls, stats, signal }) {
  controls.innerHTML = slider('连续对半切几次：n', 'hs-n', 4, 1, 8) +
    '<p class="lab-note">一块面积为 1 的大正方形蛋糕：先拿走一半 1/2，再拿走剩下的一半 1/4……永远只拿剩下的一半，加起来会超过 1 吗？</p>';

  function draw() {
    const n = sliderValue(controls, 'hs-n');
    const { pieces, remainder, sumNumer, sumDenom, sumValue } = halvingPieces(n);
    const S = 284, o = pt(40, 58);
    let out = `<rect x="${o.x}" y="${o.y}" width="${S}" height="${S}" rx="4" class="half-frame"/>`;

    pieces.forEach((p, idx) => {
      const x = o.x + p.x * S, y = o.y + p.y * S, w = p.w * S, h = p.h * S;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="half-piece is-c${idx % 6} fade-in"/>`;
      if (w >= 34 && h >= 24) {
        out += text(pt(x + w / 2, y + h / 2 + 5), `1/${p.denom}`, 'half-label');
      }
    });

    const rx = o.x + remainder.x * S, ry = o.y + remainder.y * S;
    const rw = remainder.w * S, rh = remainder.h * S;
    out += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" class="half-rem"/>`;
    if (rw >= 30 && rh >= 22) {
      out += text(pt(rx + rw / 2, ry + rh / 2 + 5), `剩 1/${remainder.denom}`, 'half-rem-label');
    }

    const expr = n <= 4
      ? pieces.map(p => `1/${p.denom}`).join(' + ')
      : `1/2 + 1/4 + … + 1/${remainder.denom}`;
    const panel = [
      [expr, 'tile-panel is-big'],
      [`= 1 − 1/${remainder.denom} = ${sumNumer}/${sumDenom}`, 'tile-panel is-win'],
      [`写成小数 ≈ ${fmt(sumValue, 4)}`],
      [`右下角还没涂的：1/${remainder.denom}`],
      ['✨ 代数妙招（设和为 S）：', 'tile-panel is-soft'],
      [`2S = 1 + 1/2 + … + 1/${remainder.denom / 2 || 1}`, 'tile-panel is-soft'],
      [`2S − S = 1 − 1/${remainder.denom} = S`, 'tile-panel is-soft'],
      [`无穷切下去：1/2${supText('n')} → 0，和 → 1`, 'tile-panel is-big'],
    ];
    out += panel.map(([v, cls = 'tile-panel'], i) => text(pt(352, 56 + i * 40), v, cls)).join('');

    board.draw(out);
    stats.innerHTML = metric('已经涂色', `${sumNumer}/${sumDenom}`) +
      metric('右下角还剩', `1/${remainder.denom}`) +
      metric('合起来总面积', '始终等于 1');
  }

  controls.addEventListener('input', draw, { signal });
  draw();

  return (n = 4) => {
    setSlider(controls, 'hs-n', n);
    draw();
    board.animate('.fade-in');
  };
}
