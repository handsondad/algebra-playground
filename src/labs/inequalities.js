import {
  applyIneqOp, budgetFeasible, budgetFeasiblePoints, budgetLevels, budgetPolygon, budgetScore, clipHalfPlane,
  fmt, halfPlaneCoeffs, halfPlaneText, ineqLevels, ineqRay, ineqSatisfies, ineqSolved, ineqSymbol, ineqText,
  pt, radarCheck, radarLevels, solveIneqSteps,
} from '../algebra.js';
import {
  button, circle, hotspot, line, metric, onAction, onHotspot, plane, polygon, setSlider, slider, sliderValue, text,
} from '../board.js';

/* ───────── 数轴射灯与乘负变号 ───────── */
export function numberLineIneq({ board, controls, stats, guide, notify, signal }) {
  let level = 0, state = { ...ineqLevels[0].state }, history = [], flippedFlash = false;

  function renderControls() {
    const canDiv2 = [state.a, state.b, state.c].every(v => v % 2 === 0);
    const canDiv3 = [state.a, state.b, state.c].every(v => v % 3 === 0);
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${ineqLevels
      .map((_, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>
      <div class="control-row" role="group" aria-label="两边同加减">
        ${button('两边 + 2', 'op', 'data-kind="add" data-v="2"')}
        ${button('两边 − 2', 'op', 'data-kind="add" data-v="-2"')}
        ${button('两边 − 3', 'op', 'data-kind="add" data-v="-3"')}
        ${button('两边 − 4', 'op', 'data-kind="add" data-v="-4"')}
      </div>
      <div class="control-row" role="group" aria-label="两边同乘除">
        ${button('两边 ÷ 2', 'op', `data-kind="divPos" data-v="2" ${canDiv2 ? '' : 'disabled'}`)}
        ${button('两边 ÷ 3', 'op', `data-kind="divPos" data-v="3" ${canDiv3 ? '' : 'disabled'}`)}
        ${button('🪞 两边 × (−1) 照镜子翻号', 'op', 'data-kind="negate" class="primary"')}
      </div>
      <div class="control-row">${button('一步步演示', 'auto')}${button('重来', 'reset')}</div>
      <p class="lab-note">方程的解是一个点，不等式的解是一整条射线！注意空心圆 ○（不算端点）和实心圆 ●（算上端点）。</p>`;
  }

  function draw() {
    const ray = ineqRay(state), solved = ineqSolved(state);
    const ox = 320, yAxis = 228, unit = 34;
    const toX = v => ox + v * unit;
    let out = '';

    out += text(pt(320, 56), ineqText(state), solved ? 'ineq-big is-win' : 'ineq-big');
    out += text(pt(320, 92),
      solved ? `✔ 解集读出来了：所有满足 x ${ineqSymbol(ray.op)} ${fmt(ray.bound)} 的数都成立！`
        : flippedFlash ? '🪞 乘上 −1 后，所有数关于 0 左右对调，不等号必须跟着掉头！'
          : '目标是让左边只剩 1 个正的 x，看看数轴上哪些整数亮绿灯：',
      flippedFlash ? 'ineq-sub is-warn' : 'ineq-sub');

    // 镜面轴 x = 0
    out += line(pt(ox, 132), pt(ox, 286), flippedFlash ? 'ineq-mirror is-on' : 'ineq-mirror');
    if (flippedFlash) out += text(pt(ox, 124), '0 镜面', 'ineq-mirror-label');

    // 解集射线阴影带 + 射线箭头
    const bx = toX(Math.max(-8, Math.min(8, ray.bound)));
    const endX = ray.right ? toX(8.4) : toX(-8.4);
    const bandX = Math.min(bx, endX), bandW = Math.abs(endX - bx);
    out += `<rect x="${bandX}" y="${yAxis - 36}" width="${bandW}" height="36" rx="4" class="ineq-band fade-in"/>`;
    out += line(pt(bx, yAxis - 36), pt(endX, yAxis - 36), 'ineq-ray fade-in');
    out += polygon(ray.right
      ? [pt(endX + 10, yAxis - 36), pt(endX - 4, yAxis - 44), pt(endX - 4, yAxis - 28)]
      : [pt(endX - 10, yAxis - 36), pt(endX + 4, yAxis - 44), pt(endX + 4, yAxis - 28)], 'ineq-arrow');
    out += circle(pt(bx, yAxis - 36), 7.5, ray.inclusive ? 'ineq-end is-closed' : 'ineq-end is-open');

    // 数轴刻度与整数检验灯
    out += line(pt(toX(-8.4), yAxis), pt(toX(8.4), yAxis), 'ineq-axis');
    for (let v = -8; v <= 8; v += 1) {
      const px = toX(v), ok = ineqSatisfies(state, v);
      out += line(pt(px, yAxis - 6), pt(px, yAxis + 6), 'ineq-tick');
      out += text(pt(px, yAxis + 24), fmt(v), 'plane-tick');
      if (v >= -7 && v <= 7) {
        out += circle(pt(px, yAxis + 48), 8, ok ? 'ineq-test is-ok' : 'ineq-test');
      }
    }
    out += text(pt(320, 326), '绿圆点 = 代回原不等式成立的整数；灰圆点 = 不成立', 'tile-note');
    out += text(pt(320, 362),
      ray.inclusive ? `实心圆 ●：端点 ${fmt(ray.bound)} 本身也算在内` : `空心圆 ○：端点 ${fmt(ray.bound)} 本身不算在内`,
      'ineq-tip');

    board.draw(out);
    renderControls();
    stats.innerHTML = metric('当前不等式', ineqText(state)) +
      metric('端点', `${fmt(ray.bound)}（${ray.inclusive ? '实心含端点' : '空心不含'}）`) +
      metric('方向', ray.right ? '往右无穷远 →' : '← 往左无穷远');
    if (guide) {
      guide.innerHTML = history.length
        ? `<ol class="scale-history">${history.map(h => `<li><b>${h.label}</b><span>${ineqText(h.state)}</span></li>`).join('')}</ol>`
        : '';
    }
    notify(solved ? `🎉 化简完成：${ineqText(state)}！` : '');
  }

  function reset(index, stepCount = 0) {
    level = index;
    state = { ...ineqLevels[level].state };
    history = [];
    flippedFlash = false;
    if (stepCount > 0) {
      const steps = solveIneqSteps(state).slice(0, stepCount);
      for (const st of steps) {
        if (st.label.includes('−1')) flippedFlash = true;
        state = { ...st.state };
        history.push(st);
      }
    }
    draw();
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level), 0),
    op: btn => {
      const kind = btn.dataset.kind, v = Number(btn.dataset.v);
      const action = kind === 'add' ? { kind, d: v } : kind === 'divPos' ? { kind, k: v } : { kind: 'negate' };
      const next = applyIneqOp(state, action);
      if (!next) { notify('这一步数字超出画板范围啦，换一步试试。'); return; }
      flippedFlash = kind === 'negate';
      const label = kind === 'add' ? (v > 0 ? `两边同加 ${v}` : `两边同减 ${-v}`)
        : kind === 'divPos' ? `两边同除以 ${v}` : '两边同乘 −1（不等号翻面！）';
      state = next;
      history.push({ label, state: { ...state } });
      draw();
      board.animate('.fade-in');
    },
    auto: () => reset(level, 99),
    reset: () => reset(level, 0),
  }, signal);

  reset(0, 0);
  return (index = 0, stepCount = 0) => {
    reset(index, stepCount);
    board.animate('.fade-in');
  };
}

/* ───────── 探照灯围宝藏（二元一次不等式组） ───────── */
function gemSvg(p, hit) {
  const pts = [pt(p.x, p.y - 11), pt(p.x + 10, p.y), pt(p.x, p.y + 11), pt(p.x - 10, p.y)];
  return `<g class="radar-gem${hit ? ' is-got' : ''}">
    ${hit ? circle(p, 16, 'alien-halo') : ''}
    ${polygon(pts, 'radar-gem-body')}
  </g>`;
}

function mineSvg(p, hit) {
  return `<g class="radar-mine${hit ? ' is-boom' : ''}">
    ${hit ? circle(p, 17, 'radar-danger') : ''}
    ${circle(p, 9, 'radar-mine-body')}
    ${text(pt(p.x, p.y + 4), '×', 'radar-mine-x')}
  </g>`;
}

export function halfPlaneRadar({ board, controls, stats, notify, signal }) {
  const P = plane({ xmin: -6, xmax: 6, ymin: -5, ymax: 5 });
  let level = 0, dir1 = 1, dir2 = -1;

  function renderControls(m1 = 1, b1 = 0, m2 = -1, b2 = 0) {
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${radarLevels
      .map((_, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider('蓝线斜率 m₁', 'rd-m1', m1, -2, 2, 0.5) +
      slider('蓝线截距 b₁', 'rd-b1', b1, -4, 4, 1) +
      `<div class="control-row">${button('🔄 翻转蓝线方向（≥ / ≤）', 'flip1')}</div>` +
      slider('橙线斜率 m₂', 'rd-m2', m2, -2, 2, 0.5) +
      slider('橙线截距 b₂', 'rd-b2', b2, -4, 4, 1) +
      `<div class="control-row">${button('🔄 翻转橙线方向（≥ / ≤）', 'flip2')}</div>
      <p class="lab-note">绿色重叠区是两盏探照灯<b>同时照到</b>的安全区：把所有黄宝石圈进来，同时避开所有黑地雷！</p>`;
  }

  function draw() {
    const lv = radarLevels[level];
    const m1 = sliderValue(controls, 'rd-m1'), b1 = sliderValue(controls, 'rd-b1');
    const m2 = sliderValue(controls, 'rd-m2'), b2 = sliderValue(controls, 'rd-b2');
    const cfg = { m1, b1, dir1, m2, b2, dir2 };
    const st = radarCheck(lv, cfg);

    const boxPoly = [pt(-6, -5), pt(6, -5), pt(6, 5), pt(-6, 5)];
    const c1 = halfPlaneCoeffs(m1, b1, dir1), c2 = halfPlaneCoeffs(m2, b2, dir2);
    const poly1 = clipHalfPlane(boxPoly, c1.a, c1.b, c1.c);
    const poly2 = clipHalfPlane(boxPoly, c2.a, c2.b, c2.c);
    const both = clipHalfPlane(poly1, c2.a, c2.b, c2.c);

    let out = P.grid({ every: 1, label: 2 });
    if (poly1.length >= 3) out += polygon(poly1.map(P.px), 'radar-half is-a');
    if (poly2.length >= 3) out += polygon(poly2.map(P.px), 'radar-half is-b');
    if (both.length >= 3) out += polygon(both.map(P.px), 'radar-both fade-in');

    out += P.curve(x => m1 * x + b1, 'line-a') + P.curve(x => m2 * x + b2, 'line-b');
    out += lv.gems.map((g, i) => gemSvg(P.px(g), st.gemHits[i])).join('');
    out += lv.mines.map((m, i) => mineSvg(P.px(m), st.mineHits[i])).join('');
    out += text(pt(108, 42), halfPlaneText(m1, b1, dir1), 'line-eq is-a');
    out += text(pt(108, 68), halfPlaneText(m2, b2, dir2), 'line-eq is-b');

    board.draw(out);
    const gotGems = st.gemHits.filter(Boolean).length;
    const hitMines = st.mineHits.filter(Boolean).length;
    stats.innerHTML = metric('圈住宝石', `${gotGems} / ${lv.gems.length}`) +
      metric('误碰地雷', hitMines ? `${hitMines} 颗 ⚠️` : '0 颗 ✔') +
      metric('闯关', st.won ? '安全寻宝 🎉' : '继续调探照灯');
    notify(st.won ? `🎉 太准啦！不等式组 ${halfPlaneText(m1, b1, dir1)} 且 ${halfPlaneText(m2, b2, dir2)} 刚好围住全部宝石！` : '');
  }

  function reset(index, cfg = { m1: 1, b1: 0, dir1: 1, m2: -1, b2: 0, dir2: -1 }) {
    level = index;
    dir1 = cfg.dir1;
    dir2 = cfg.dir2;
    renderControls(cfg.m1, cfg.b1, cfg.m2, cfg.b2);
    draw();
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level)),
    flip1: () => { dir1 = -dir1; draw(); board.animate('.fade-in'); },
    flip2: () => { dir2 = -dir2; draw(); board.animate('.fade-in'); },
  }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0);

  return (index = 0, m1 = 1, b1 = 0, nextDir1 = 1, m2 = -1, b2 = 0, nextDir2 = -1) => {
    reset(index, { m1, b1, dir1: nextDir1, m2, b2, dir2: nextDir2 });
    board.animate('.fade-in, .line-a, .line-b');
  };
}

/* ───────── 零花钱采购计划（线性规划） ───────── */
export function pocketBudget({ board, controls, stats, notify, signal }) {
  const P = plane({ xmin: 0, xmax: 9, ymin: 0, ymax: 8, equal: false, box: [50, 30, 366, 360] });
  let level = 0;

  function renderControls(x = 1, y = 1) {
    const lv = budgetLevels[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选场景">${budgetLevels
      .map((item, i) => button(item.name, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider(`${lv.xLabel}买几个：x`, 'pb-x', x, 0, 8) +
      slider(`${lv.yLabel}买几个：y`, 'pb-y', y, 0, 8) +
      `<p class="lab-note">也可以直接点坐标图里的圆点！看看目标虚线往右上推到最远时，停在可行域的<b>哪个尖角</b>上。</p>`;
  }

  function draw() {
    const lv = budgetLevels[level];
    const x = sliderValue(controls, 'pb-x'), y = sliderValue(controls, 'pb-y');
    const ok = budgetFeasible(lv, x, y);
    const score = budgetScore(lv, x, y);
    const isBest = ok && x === lv.solution.x && y === lv.solution.y;
    const poly = budgetPolygon(lv, 9);
    const pts = budgetFeasiblePoints(lv, 8);

    let out = P.grid({ every: 1, label: 2, xName: 'x', yName: 'y' });
    if (poly.length >= 3) out += polygon(poly.map(P.px), 'budget-region fade-in');
    out += P.curve(v => (lv.c1.max - lv.c1.a * v) / lv.c1.b, 'line-a');
    out += P.curve(v => (lv.c2.max - lv.c2.a * v) / lv.c2.b, 'line-b');
    // 等值目标线 p·x + q·y = score
    out += P.curve(v => (score - lv.obj.p * v) / lv.obj.q, 'budget-iso');

    for (const ptItem of pts) {
      const p = P.px(pt(ptItem.x, ptItem.y));
      const picked = ptItem.x === x && ptItem.y === y;
      const dot = circle(p, picked ? 8 : 5, picked ? 'budget-dot is-pick' : 'budget-dot');
      out += hotspot(`pt:${ptItem.x}:${ptItem.y}`, `x=${ptItem.x}, y=${ptItem.y}`, `${circle(p, 13, 'hit')}${dot}`);
    }
    if (!ok) {
      out += circle(P.px(pt(x, y)), 8, 'budget-dot is-bad');
    }

    const used1 = lv.c1.a * x + lv.c1.b * y, used2 = lv.c2.a * x + lv.c2.b * y;
    const panel = [
      [`场景：${lv.name}`, 'tile-panel is-big'],
      [`蓝线：${lv.c1.name}`],
      [`当前用了 ${used1} / ${lv.c1.max} ${used1 <= lv.c1.max ? '✔' : '超标 ✗'}`, used1 <= lv.c1.max ? 'tile-panel is-soft' : 'tile-panel is-warn'],
      [`红线：${lv.c2.name}`],
      [`当前用了 ${used2} / ${lv.c2.max} ${used2 <= lv.c2.max ? '✔' : '超标 ✗'}`, used2 <= lv.c2.max ? 'tile-panel is-soft' : 'tile-panel is-warn'],
      [`目标：${lv.obj.name}`],
      [ok ? `得分 = ${score} ${lv.goalUnit}${isBest ? ' 🏆 最高！' : ''}` : '超出限制，买不了 ✗',
        isBest ? 'tile-panel is-win' : ok ? 'tile-panel is-big' : 'tile-panel is-warn'],
    ];
    out += panel.map(([v, cls = 'tile-panel'], i) => text(pt(384, 62 + i * 44), v, cls)).join('');

    board.draw(out);
    stats.innerHTML = metric('方案 (x, y)', `(${x}, ${y})`) +
      metric('是否合规', ok ? '在可行域内 ✔' : '超标了 ✗') +
      metric('当前收获', ok ? `${score} ${lv.goalUnit}` : '无效方案');
    notify(isBest ? `🎉 找到最优顶点 (${x}, ${y}) 啦！最多能收获 ${score} ${lv.goalUnit}。` : '');
  }

  function reset(index, x = 1, y = 1) {
    level = index;
    renderControls(x, y);
    draw();
  }

  onHotspot(board, key => {
    if (!key.startsWith('pt:')) return;
    const [, nx, ny] = key.split(':').map(Number);
    setSlider(controls, 'pb-x', nx);
    setSlider(controls, 'pb-y', ny);
    draw();
  }, signal);
  onAction(controls, { level: btn => reset(Number(btn.dataset.level), 1, 1) }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0, 1, 1);

  return (index = 0, x = 1, y = 1) => {
    reset(index, x, y);
    board.animate('.fade-in, .budget-iso');
  };
}
