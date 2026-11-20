import {
  binomialTermText, binomialText, diffSquares, pt, supText, yanghuiRowSum, yanghuiRows,
} from '../algebra.js';
import {
  button, hotspot, line, metric, onAction, onHotspot, setSlider, slider, sliderValue, text,
} from '../board.js';

/* ───────── 平方差割补：a² − b² = (a + b)(a − b) ───────── */
export function diffSquaresLab({ board, controls, stats, signal }) {
  let rearranged = false;
  controls.innerHTML = slider('大正方形边长：a', 'ds-a', 7, 3, 9) +
    slider('挖掉的小正方形边长：b', 'ds-b', 3, 1, 8) +
    `<div class="control-row">${button('✂️ 沿虚线剪开，转过去拼成长方形！', 'cut', 'class="primary" aria-pressed="false"')}</div>
    <p class="lab-note">大正方形面积 a² 挖掉一角 b²，剩下的拐尺形状不好直接算。剪一刀挪过去，看看变成了几乘几？</p>`;

  function draw() {
    const rawA = sliderValue(controls, 'ds-a');
    const rawB = sliderValue(controls, 'ds-b');
    const st = diffSquares(rawA, rawB);
    if (st.b !== rawB) {
      setSlider(controls, 'ds-b', st.b);
      sliderValue(controls, 'ds-b');
    }
    const { a, b, diff, sum, area } = st;
    const U = Math.min(26, 260 / sum);
    const o = pt(42, 74);
    let out = '';

    if (!rearranged) {
      // L 形：左边整块宽 (a-b)、高 a；右下那条宽 b、高 (a-b)；右上角虚线框 b×b 是挖掉的
      out += `<rect x="${o.x}" y="${o.y}" width="${diff * U}" height="${a * U}" rx="3" class="ds-main fade-in"/>`;
      out += `<rect x="${o.x + diff * U}" y="${o.y + b * U}" width="${b * U}" height="${diff * U}" rx="3" class="ds-strip fade-in"/>`;
      out += `<rect x="${o.x + diff * U}" y="${o.y}" width="${b * U}" height="${b * U}" rx="3" class="tile-missing"/>`;
      out += line(pt(o.x + diff * U, o.y + b * U), pt(o.x + diff * U, o.y + a * U), 'ds-cut');
      out += text(pt(o.x + (a * U) / 2, o.y - 12), `a = ${a}`, 'tile-ruler-label');
      out += text(pt(o.x - 16, o.y + (a * U) / 2 + 5), `${a}`, 'tile-ruler-label');
      out += text(pt(o.x + diff * U + (b * U) / 2, o.y + (b * U) / 2 + 5), `−${b}²`, 'ds-hole-label');
      out += text(pt(o.x + (diff * U) / 2, o.y + (a * U) / 2 + 5), `${a} × ${diff}`, 'ds-part-label');
      if (b * U >= 28 && diff * U >= 22) {
        out += text(pt(o.x + diff * U + (b * U) / 2, o.y + b * U + (diff * U) / 2 + 5), `${b}×${diff}`, 'ds-part-label');
      }
    } else {
      // 拼成长 (a + b)、宽 (a - b) 的完整长方形（横向展示更紧凑清晰）
      const W1 = a * U, W2 = b * U, H = diff * U;
      const oy = o.y + 34;
      out += `<rect x="${o.x}" y="${oy}" width="${W1}" height="${H}" rx="3" class="ds-main fade-in"/>`;
      out += `<rect x="${o.x + W1}" y="${oy}" width="${W2}" height="${H}" rx="3" class="ds-strip fade-in"/>`;
      out += line(pt(o.x + W1, oy), pt(o.x + W1, oy + H), 'ds-cut');
      out += `<rect x="${o.x - 3}" y="${oy - 3}" width="${W1 + W2 + 6}" height="${H + 6}" rx="6" class="tile-outline"/>`;
      out += text(pt(o.x + W1 / 2, oy - 12), `a = ${a}`, 'tile-ruler-label');
      out += text(pt(o.x + W1 + W2 / 2, oy - 12), `b = ${b}`, 'tile-ruler-label is-unit');
      out += text(pt(o.x + (W1 + W2) / 2, oy + H + 24), `总长 a + b = ${sum}`, 'tile-ruler-label');
      out += text(pt(o.x - 18, oy + H / 2 + 5), `${diff}`, 'tile-ruler-label');
    }

    const lines = [
      ['a² − b² = (a + b)(a − b)', 'tile-panel is-big'],
      [`挖角前：${a}² − ${b}² = ${st.a2} − ${st.b2} = ${area}`],
      [`剪拼后：(${a} + ${b})(${a} − ${b}) = ${sum} × ${diff} = ${area}`, rearranged ? 'tile-panel is-win' : 'tile-panel'],
      ['⚡ 心算绝招：', 'tile-panel is-soft'],
      ['算 53² − 47² 不用列竖式！', 'tile-panel is-soft'],
      ['= (53 + 47) × (53 − 47)', 'tile-panel is-soft'],
      ['= 100 × 6 = 600', 'tile-panel is-big'],
    ];
    out += lines.map(([v, cls = 'tile-panel'], i) => text(pt(356, 60 + i * 42), v, cls)).join('');

    board.draw(out);
    controls.querySelector('[data-action="cut"]').setAttribute('aria-pressed', String(rearranged));
    stats.innerHTML = metric('a² − b²', `${a}² − ${b}² = ${area}`) +
      metric('(a + b)(a − b)', `${sum} × ${diff} = ${area}`) +
      metric('形状', rearranged ? `长方形 ${sum} × ${diff}` : '缺角正方形');
  }

  onAction(controls, {
    cut: () => { rearranged = !rearranged; draw(); board.animate('.fade-in, .tile-outline'); },
  }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();

  return (a = 7, b = 3, nextCut = false) => {
    rearranged = nextCut;
    setSlider(controls, 'ds-a', a);
    setSlider(controls, 'ds-b', b);
    draw();
    board.animate('.fade-in, .tile-outline');
  };
}

/* ───────── 杨辉三角与展开式 (a + b)ⁿ ───────── */
const MODES = [
  ['binom', '(a + b)ⁿ 展开系数'],
  ['sum', '每行加起来 = 2ⁿ'],
  ['odd', '奇数涂色藏着分形'],
];

export function yanghuiTriangle({ board, controls, stats, signal }) {
  const rows = yanghuiRows(6);
  let focusRow = 4, pick = [4, 2], mode = 'binom';

  controls.innerHTML = slider('看第几行展开式：n', 'yh-n', 4, 0, 6) +
    `<div class="control-row" role="group" aria-label="观察视角">${MODES
      .map(([k, label]) => button(label, 'mode', `data-mode="${k}" aria-pressed="${k === mode}"`)).join('')}</div>
    <p class="lab-note">每个格子都等于它头顶<b>左上 + 右上</b>两个数相加。点任意一格，看看它对应 (a + b)ⁿ 里的哪一项！</p>`;

  const cellPos = (r, k) => pt(214 + (k - r / 2) * 52, 46 + r * 43);

  function draw() {
    focusRow = sliderValue(controls, 'yh-n');
    if (pick[0] > 6 || pick[1] > pick[0]) pick = [focusRow, Math.floor(focusRow / 2)];
    const [pr, pk] = pick;
    let out = '';

    // 画出被点中的格子由头顶两格相加的连线
    if (pr > 0) {
      const target = cellPos(pr, pk);
      if (pk - 1 >= 0) out += line(cellPos(pr - 1, pk - 1), target, 'yh-link');
      if (pk <= pr - 1) out += line(cellPos(pr - 1, pk), target, 'yh-link');
    }

    rows.forEach((row, r) => {
      row.forEach((val, k) => {
        const c = cellPos(r, k);
        const isPick = r === pr && k === pk;
        const isParent = r === pr - 1 && (k === pk - 1 || k === pk);
        const isRow = mode === 'binom' && r === focusRow;
        const isOdd = mode === 'odd' && val % 2 === 1;
        const cls = [
          'yh-cell',
          isPick ? 'is-pick' : '',
          isParent ? 'is-parent' : '',
          isRow ? 'is-row' : '',
          isOdd ? 'is-odd' : '',
        ].filter(Boolean).join(' ');
        const body = `<rect x="${c.x - 22}" y="${c.y - 16}" width="44" height="32" rx="9" class="${cls}"/>` +
          text(pt(c.x, c.y + 6), String(val), 'yh-val');
        out += hotspot(`cell:${r}:${k}`, `第 ${r} 行第 ${k + 1} 格：${val}`, body);
      });
      if (mode === 'sum') {
        out += text(pt(404, 52 + r * 43), `和 = ${yanghuiRowSum(r)} = 2${supText(r)}`, r === focusRow ? 'yh-side is-on' : 'yh-side');
      }
    });

    if (mode !== 'sum') {
      const pLeft = pr > 0 && pk - 1 >= 0 ? rows[pr - 1][pk - 1] : 0;
      const pRight = pr > 0 && pk <= pr - 1 ? rows[pr - 1][pk] : 0;
      const pickedVal = rows[pr][pk];
      const info = [
        [`选中的格：第 ${pr} 行 → ${pickedVal}`, 'tile-panel is-big'],
        [pr > 0 ? `头顶相加：${pLeft} + ${pRight} = ${pickedVal}` : '最顶端放一个 1'],
        [`对应项：${binomialTermText(pr, pk, pickedVal)}`, 'tile-panel is-win'],
        [`第 ${focusRow} 行共有 ${focusRow + 1} 项：`, 'tile-panel is-soft'],
        [`系数和 = 2${supText(focusRow)} = ${yanghuiRowSum(focusRow)}`, 'tile-panel is-soft'],
      ];
      out += info.map(([v, cls = 'tile-panel'], i) => text(pt(418, 66 + i * 40), v, cls)).join('');
    }

    out += `<rect x="20" y="338" width="600" height="46" rx="12" class="yh-banner"/>`;
    out += text(pt(320, 367), `(a + b)${supText(focusRow)} = ${binomialText(focusRow)}`, 'yh-formula');

    board.draw(out);
    controls.querySelectorAll('[data-action="mode"]').forEach(btn =>
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode)));
    stats.innerHTML = metric(`第 ${focusRow} 行系数`, rows[focusRow].join(' · ')) +
      metric('这一行加起来', `${yanghuiRowSum(focusRow)}（2${supText(focusRow)}）`) +
      metric('选中这一项', binomialTermText(pr, pk, rows[pr][pk]));
  }

  onHotspot(board, key => {
    if (!key.startsWith('cell:')) return;
    const [, r, k] = key.split(':').map(Number);
    pick = [r, k];
    setSlider(controls, 'yh-n', r);
    draw();
  }, signal);
  onAction(controls, {
    mode: btn => { mode = btn.dataset.mode; draw(); board.animate('.yh-cell'); },
  }, signal);
  controls.addEventListener('input', () => {
    const r = sliderValue(controls, 'yh-n');
    pick = [r, Math.floor(r / 2)];
    draw();
  }, { signal });
  draw();

  return (n = 4, nextMode = 'binom', nextPick = null) => {
    mode = nextMode;
    setSlider(controls, 'yh-n', n);
    pick = nextPick ?? [n, Math.floor(n / 2)];
    draw();
    board.animate('.yh-cell, .yh-link');
  };
}
