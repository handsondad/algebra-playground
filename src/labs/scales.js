import {
  applyScaleOp, balloonLevels, cloneScale, divisors, fmt, pt, scaleDiff, scaleLevels, scaleSolution,
  sideText, sideWeight, solveSteps, tiltDegrees,
} from '../algebra.js';
import { button, circle, line, metric, onAction, text } from '../board.js';

const PIVOT = pt(320, 112), HALF = 210, PAN_DROP = 196, PAN_HALF = 88;
const BOX = 34, UNIT = 20;

function rows(count, per) {
  const out = [];
  for (let i = 0; i < count; i += per) out.push(Math.min(per, count - i));
  return out;
}

/** 一只托盘上的东西：x 盒子、砝码（正常数）和气球（负常数，往上拉） */
function panItems(side, center, panY, reveal, secret) {
  let out = '', y = panY - 3;
  for (const n of rows(side.x, 4)) {
    y -= BOX;
    const x0 = center - (n * (BOX + 5) - 5) / 2;
    for (let i = 0; i < n; i += 1) {
      const x = x0 + i * (BOX + 5);
      out += `<g class="fade-in"><rect x="${x}" y="${y}" width="${BOX}" height="${BOX}" rx="7" class="scale-x"/>${text(pt(x + BOX / 2, y + 23), reveal ? fmt(secret) : 'x', 'scale-x-label')}</g>`;
    }
    y -= 5;
  }
  const units = Math.max(0, side.c);
  for (const n of rows(units, 7)) {
    y -= UNIT;
    const x0 = center - (n * (UNIT + 4) - 4) / 2;
    for (let i = 0; i < n; i += 1) {
      const x = x0 + i * (UNIT + 4);
      out += `<g class="fade-in"><rect x="${x}" y="${y}" width="${UNIT}" height="${UNIT}" rx="4" class="scale-unit"/>${text(pt(x + UNIT / 2, y + 15), '1', 'scale-unit-label')}</g>`;
    }
    y -= 4;
  }
  const balloons = Math.max(0, -side.c);
  if (balloons) {
    const top = Math.min(y, panY - 30) - 40;
    const n = balloons, gap = 34, x0 = center - ((n - 1) * gap) / 2;
    for (let i = 0; i < n; i += 1) {
      const b = pt(x0 + i * gap, top - (i % 2) * 14);
      out += `<g class="fade-in">${line(pt(center + (i - (n - 1) / 2) * 10, panY - 2), pt(b.x, b.y + 14), 'scale-balloon-string')}
        <ellipse cx="${b.x}" cy="${b.y}" rx="14" ry="16" class="scale-balloon"/>${text(pt(b.x, b.y + 5), '−1', 'scale-balloon-label')}</g>`;
    }
  }
  return out;
}

function drawScale(state, secret, reveal) {
  const L = sideWeight(state.left, secret), R = sideWeight(state.right, secret);
  const theta = (tiltDegrees(L, R, 13) * Math.PI) / 180;
  const d = pt(Math.cos(theta) * HALF, Math.sin(theta) * HALF);
  const ends = [pt(PIVOT.x - d.x, PIVOT.y - d.y), pt(PIVOT.x + d.x, PIVOT.y + d.y)];
  const level = Math.abs(L - R) < 1e-9;
  let out = `<path d="M296 372H344L328 ${PIVOT.y + 8}H312Z" class="scale-stand"/><rect x="250" y="368" width="140" height="14" rx="7" class="scale-stand"/>`;
  [state.left, state.right].forEach((side, i) => {
    const e = ends[i], panY = e.y + PAN_DROP;
    out += line(e, pt(e.x - PAN_HALF + 6, panY), 'scale-string') + line(e, pt(e.x + PAN_HALF - 6, panY), 'scale-string');
    out += panItems(side, e.x, panY, reveal, secret);
    out += `<path d="M${e.x - PAN_HALF} ${panY}H${e.x + PAN_HALF}Q${e.x + PAN_HALF - 12} ${panY + 16} ${e.x + PAN_HALF - 30} ${panY + 16}H${e.x - PAN_HALF + 30}Q${e.x - PAN_HALF + 12} ${panY + 16} ${e.x - PAN_HALF} ${panY}Z" class="scale-pan"/>`;
  });
  out += line(ends[0], ends[1], `scale-beam${level ? ' is-level' : ' is-tilted'}`) + circle(PIVOT, 8, 'scale-pivot');
  const needle = pt(PIVOT.x + Math.sin(theta) * 40, PIVOT.y - Math.cos(theta) * 40);
  out += line(PIVOT, needle, `scale-needle${level ? ' is-level' : ''}`);
  out += text(pt(320, 28), level ? '⚖️ 平衡' : L > R ? '⬅ 左边重' : '右边重 ➡', `scale-verdict${level ? ' is-level' : ''}`);
  return out;
}

const relation = (state, secret) => {
  const diff = scaleDiff(state, secret);
  return `${sideText(state.left)} ${Math.abs(diff) < 1e-9 ? '=' : diff > 0 ? '>' : '<'} ${sideText(state.right)}`;
};

export function balanceScale({ board, controls, stats, guide, lesson, notify, signal }) {
  const balloon = lesson.id === 'balloon-scale';
  const levels = balloon ? balloonLevels : scaleLevels;
  const opts = { allowNegative: balloon };
  let level = 0, state, history;

  function reset(index) {
    level = index;
    state = cloneScale(levels[level]);
    history = [];
    draw();
  }

  function apply(op, label) {
    const next = applyScaleOp(state, op, opts);
    if (!next) {
      notify(op.kind === 'divide' ? '分不匀：两边每一样东西都得能平均分。' : '盘子里没有这么多可以拿。');
      return;
    }
    state = next;
    history.push({ op, label, eq: relation(state, levels[level].secret) });
    draw();
    board.animate('.fade-in');
  }

  function draw() {
    const { secret } = levels[level];
    const solved = scaleSolution(state);
    const balanced = Math.abs(scaleDiff(state, secret)) < 1e-9;
    board.draw(drawScale(state, secret, solved !== null && balanced));
    const divs = divisors(state);
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${levels
      .map((_, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>
      <p class="lab-note">${balloon ? '红气球往上拉，每个算 −1；一个砝码和一个气球放一起，正好抵消。' : '紫盒子里装着一样重的 x，橙色小砝码每个重 1。'}两边做一样的事，天平才不会歪。</p>
      <div class="control-row" role="group" aria-label="两边一起">
        ${button('两边各拿走 1 个 x', 'op', 'data-op="both" data-dx="-1"')}
        ${button(balloon ? '两边各放 1 个砝码' : '两边各拿走 1 个砝码', 'op', `data-op="both" data-dc="${balloon ? 1 : -1}"`)}
        ${button(balloon ? '两边各挂 1 个气球' : '两边各放 1 个砝码', 'op', `data-op="both" data-dc="${balloon ? -1 : 1}"`)}
        ${divs.map(n => button(`两边平分成 ${n} 份`, 'op', `data-op="divide" data-n="${n}"`)).join('')}
      </div>
      <div class="control-row" role="group" aria-label="只动一边">
        ${button('只从左边拿走 1', 'op', `data-op="left" data-dc="-1"`)}
        ${button('↶ 撤销', 'undo', history.length ? '' : 'disabled')}${button('重来', 'reset')}
      </div>`;
    guide.innerHTML = history.length ? `<ol class="scale-history">${history.map(h => `<li><b>${h.label}</b><span>${h.eq}</span></li>`).join('')}</ol>` : '';
    stats.innerHTML = metric('天平上写着', relation(state, secret)) + metric('天平', balanced ? '平衡 ✔' : '歪了') +
      metric('x 是多少', solved !== null && balanced ? `x = ${fmt(solved)} 🎉` : '还看不出');
    if (solved !== null && balanced) notify(`解出来啦：一个 x 盒子正好重 ${fmt(solved)}。`);
    else if (!balanced) notify('只动了一边，天平就歪了——等号不成立了。点「撤销」回去。');
    else notify('');
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level)),
    op: btn => {
      const { op, dx, dc, n } = btn.dataset;
      if (op === 'divide') apply({ kind: 'divide', n: Number(n) }, `两边平分成 ${n} 份`);
      else apply({ kind: op, dx: Number(dx ?? 0), dc: Number(dc ?? 0) }, btn.textContent);
    },
    undo: () => {
      history.pop();
      state = cloneScale(levels[level]);
      const replay = [...history];
      history = [];
      for (const h of replay) {
        state = applyScaleOp(state, h.op, { allowNegative: true }) ?? state;
        history.push(h);
      }
      draw();
    },
    reset: () => reset(level),
  }, signal);

  reset(0);
  return (index = 0, steps = 0, tilt = false) => {
    reset(index);
    for (const step of solveSteps(levels[index], opts).slice(0, steps)) {
      state = step.state;
      history.push({ op: step.op, label: step.label, eq: relation(state, levels[index].secret) });
    }
    if (tilt) {
      state = applyScaleOp(state, { kind: 'left', dc: -1 }, { allowNegative: true });
      history.push({ op: { kind: 'left', dc: -1 }, label: '只从左边拿走 1', eq: relation(state, levels[index].secret) });
    }
    draw();
    board.animate('.scale-beam, .fade-in');
  };
}
