import {
  fmt, linearText, machineLevels, machineOut, matchCount, matchSticks, patternKinds, pt, ruleMatches, staircaseSum,
} from '../algebra.js';
import { button, circle, line, metric, onAction, setSlider, slider, sliderValue, text } from '../board.js';

/* ───────── 函数机器 ───────── */
const CHECK_XS = Array.from({ length: 11 }, (_, i) => i);

function gear(c, r, cls) {
  const teeth = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<rect x="${c.x - 4}" y="${c.y - r - 6}" width="8" height="9" rx="2" transform="rotate(${(a * 180) / Math.PI} ${c.x} ${c.y})" class="${cls}"/>`;
  }).join('');
  return `<g class="machine-gear">${teeth}${circle(c, r, cls)}${circle(c, r * 0.35, 'machine-hub')}</g>`;
}

export function functionMachine({ board, controls, stats, notify, signal }) {
  let level = 0, tried = [], solved = false, last = null;

  function renderControls() {
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选机器">${machineLevels
      .map((_, i) => button(`机器 ${i + 1}`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider('往机器里放一个数 x', 'fm-in', 3, 0, 10) +
      `<div class="control-row">${button('投进去 ▶', 'feed', 'class="primary"')}</div>
      <p class="lab-note">机器里藏着一条规则「y = 几倍的 x 再加几」。多喂几个数，看出规律后在下面猜一猜。</p>` +
      slider('我猜：x 乘几（a）', 'fm-a', 1, -3, 3) + slider('我猜：再加几（b）', 'fm-b', 0, -5, 10) +
      `<div class="control-row">${button('检查我的规则', 'check')}${button('重来', 'reset')}</div>`;
  }

  function draw() {
    const rule = machineLevels[level];
    const a = sliderValue(controls, 'fm-a'), b = sliderValue(controls, 'fm-b'), x = sliderValue(controls, 'fm-in');
    let out = `<rect x="220" y="62" width="200" height="140" rx="22" class="machine-body${solved ? ' is-open' : ''}"/>
      <path d="M150 112H220M420 132H490" class="machine-pipe"/>`;
    out += gear(pt(270, 110), 20, 'machine-cog') + gear(pt(318, 132), 14, 'machine-cog is-b') + gear(pt(368, 106), 18, 'machine-cog');
    out += text(pt(320, 186), solved ? linearText(rule.a, rule.b) : '？ 秘密规则 ？', solved ? 'machine-rule is-open' : 'machine-rule');
    out += circle(pt(118, 112), 30, 'machine-ball is-in') + text(pt(118, 121), fmt(last?.x ?? x), 'machine-ball-label');
    out += text(pt(118, 66), '进 x', 'machine-tag');
    if (last) out += `<g class="fade-in">${circle(pt(522, 132), 30, 'machine-ball is-out')}${text(pt(522, 141), fmt(last.y), 'machine-ball-label')}</g>`;
    else out += circle(pt(522, 132), 30, 'machine-ball is-empty');
    out += text(pt(522, 86), '出 y', 'machine-tag');
    out += text(pt(40, 252), '记录本', 'machine-tag is-left');
    const shown = tried.slice(-8);
    out += text(pt(40, 296), 'x', 'machine-cell is-head') + text(pt(40, 340), 'y', 'machine-cell is-head');
    out += text(pt(40, 382), '我猜', 'machine-cell is-guess');
    shown.forEach((t, i) => {
      const cx = 108 + i * 66, ok = Math.abs(machineOut({ a, b }, t) - machineOut(rule, t)) < 1e-9;
      out += `<rect x="${cx - 28}" y="270" width="56" height="84" rx="10" class="machine-col"/>`;
      out += text(pt(cx, 296), fmt(t), 'machine-cell') + text(pt(cx, 340), fmt(machineOut(rule, t)), 'machine-cell is-out');
      out += text(pt(cx, 382), `${fmt(machineOut({ a, b }, t))}${ok ? ' ✓' : ' ✗'}`, `machine-cell is-guess${ok ? ' is-ok' : ' is-bad'}`);
    });
    if (!shown.length) out += text(pt(108, 318), '还没有喂过数字', 'machine-cell is-empty');
    board.draw(out);
    stats.innerHTML = metric('喂过几次', tried.length) + metric('我猜的规则', linearText(a, b)) + metric('机器', solved ? '规则猜中 🎉' : '还在保密');
  }

  function reset(index) {
    level = index; tried = []; solved = false; last = null;
    renderControls();
    draw();
    notify('');
  }

  function feed(x) {
    const y = machineOut(machineLevels[level], x);
    last = { x, y };
    tried = [...tried.filter(t => t !== x), x];
    draw();
    board.animate('.fade-in');
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level)),
    feed: () => feed(sliderValue(controls, 'fm-in')),
    check: () => {
      const guess = { a: sliderValue(controls, 'fm-a'), b: sliderValue(controls, 'fm-b') };
      if (tried.length < 2) { notify('先喂至少两个数，再来猜规则。'); return; }
      solved = ruleMatches(guess, machineLevels[level], CHECK_XS);
      const wrong = tried.find(t => machineOut(guess, t) !== machineOut(machineLevels[level], t));
      notify(solved ? `🎉 猜中了！机器的规则就是 ${linearText(guess.a, guess.b)}。`
        : wrong !== undefined ? `放进 ${wrong} 时，机器吐出 ${machineOut(machineLevels[level], wrong)}，你的规则算出 ${machineOut(guess, wrong)}。`
          : '记录本上的都对上了，可机器还有别的数没试过，再喂几个数检查一下。');
      draw();
    },
    reset: () => reset(level),
  }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0);

  return (index = 0, inputs = [], guess = null, reveal = false) => {
    reset(index);
    if (guess) { setSlider(controls, 'fm-a', guess[0]); setSlider(controls, 'fm-b', guess[1]); }
    for (const x of inputs) { setSlider(controls, 'fm-in', x); feed(x); }
    solved = reveal;
    draw();
    board.animate('.fade-in, .machine-col');
  };
}

/* ───────── 火柴棒长图案 ───────── */
const KINDS = Object.keys(patternKinds);

export function matchstickPattern({ board, controls, stats, signal }) {
  let kind = 'squares', grouped = true;
  controls.innerHTML = `<div class="control-row" role="group" aria-label="选图案">${KINDS.map(k => button(patternKinds[k].name, 'kind', `data-kind="${k}"`)).join('')}</div>` +
    slider('第几个图案：n', 'mp-n', 3, 1, 6) +
    `<div class="control-row">${button('🎨 按每次新添的火柴上色', 'group', 'aria-pressed="true"')}</div>
    <p class="lab-note">先数一数每个图案用了几根火柴，再看看：每多一个图形，要多添几根？</p>`;

  function draw() {
    const n = sliderValue(controls, 'mp-n'), sticks = matchSticks(kind, n), { first, step } = patternKinds[kind];
    const xs = sticks.flatMap(s => [s.a.x, s.b.x]), ys = sticks.flatMap(s => [s.a.y, s.b.y]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const scale = Math.min(84, 540 / (x1 - x0), 150 / (y1 - y0));
    const cx = 320 - ((x0 + x1) / 2) * scale, cy = 128 + ((y0 + y1) / 2) * scale;
    const map = p => pt(cx + p.x * scale, cy - p.y * scale);
    let out = sticks.map(s => {
      const a = map(s.a), b = map(s.b), cls = grouped ? `match is-g${s.group === 0 ? 0 : ((s.group - 1) % 4) + 1}` : 'match';
      return `<g class="fade-in">${line(a, b, `${cls}`)}${circle(b, 4, 'match-head')}</g>`;
    }).join('');
    const colX = i => 132 + i * 62;
    out += text(pt(40, 262), '第 n 个', 'match-cell is-head') + text(pt(40, 302), '火柴', 'match-cell is-head');
    [1, 2, 3, 4, 5, 6].forEach((k, i) => {
      out += `<rect x="${colX(i) - 26}" y="240" width="52" height="74" rx="10" class="match-col${k === n ? ' is-on' : ''}"/>`;
      out += text(pt(colX(i), 262), k, 'match-cell') + text(pt(colX(i), 302), matchCount(kind, k), 'match-cell is-count');
      if (k > 1) out += text(pt(colX(i) - 31, 334), `+${step}`, 'match-step');
    });
    out += text(pt(colX(6) + 6, 282), '…', 'match-cell') + `<rect x="${colX(7) - 30}" y="240" width="60" height="74" rx="10" class="match-col is-far"/>` +
      text(pt(colX(7), 262), 100, 'match-cell') + text(pt(colX(7), 302), matchCount(kind, 100), 'match-cell is-count');
    out += text(pt(320, 380), `火柴根数 = ${first} + ${step} × n`, 'match-rule');
    board.draw(out);
    stats.innerHTML = metric(`第 ${n} 个`, `${matchCount(kind, n)} 根`) + metric('每次多添', `${step} 根`) + metric('第 100 个', `${matchCount(kind, 100)} 根`);
    controls.querySelectorAll('[data-action="kind"]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.kind === kind)));
    controls.querySelector('[data-action="group"]').setAttribute('aria-pressed', String(grouped));
  }

  onAction(controls, {
    kind: btn => { kind = btn.dataset.kind; draw(); board.animate('.fade-in'); },
    group: () => { grouped = !grouped; draw(); },
  }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();
  return (nextKind = 'squares', n = 3, nextGrouped = true) => {
    kind = nextKind; grouped = nextGrouped;
    setSlider(controls, 'mp-n', n);
    draw();
    board.animate('.fade-in, .match-col');
  };
}

/* ───────── 高斯的楼梯 ───────── */
export function gaussStaircase({ board, controls, stats, signal }) {
  let copy = false;
  controls.innerHTML = slider('楼梯有几级：n', 'gs-n', 5, 1, 12) +
    `<div class="control-row">${button('🔁 再拿一座一样的楼梯，倒过来拼上', 'copy', 'aria-pressed="false"')}</div>
    <p class="lab-note">1 + 2 + 3 + … + n 一块块加很慢。两座楼梯一正一倒拼起来，会变成什么形状？</p>`;

  function draw() {
    const n = sliderValue(controls, 'gs-n'), s = Math.min(30, 300 / (n + 1)), o = pt(44, 372);
    let out = '';
    for (let i = 1; i <= n; i += 1) {
      for (let j = 0; j < i; j += 1) out += `<rect x="${o.x + (i - 1) * s}" y="${o.y - (j + 1) * s}" width="${s - 2}" height="${s - 2}" rx="3" class="stair is-a fade-in"/>`;
      if (copy) for (let j = i; j < n + 1; j += 1) out += `<rect x="${o.x + (i - 1) * s}" y="${o.y - (j + 1) * s}" width="${s - 2}" height="${s - 2}" rx="3" class="stair is-b fade-in"/>`;
    }
    out += text(pt(o.x + (n * s) / 2, o.y + 20), `${n} 列`, 'stair-label');
    if (copy) {
      const c = pt(o.x - 16, o.y - ((n + 1) * s) / 2);
      out += `<text x="${c.x}" y="${c.y}" transform="rotate(-90 ${c.x} ${c.y})" class="stair-label">${n + 1} 行</text>`;
    }
    const terms = n <= 6 ? Array.from({ length: n }, (_, i) => i + 1).join(' + ') : `1 + 2 + … + ${n}`;
    const lines = [[`${terms}`, 'stair-panel is-big'], [`= ${copy ? staircaseSum(n) : '？'}`, 'stair-panel is-big']];
    if (copy) {
      lines.push([`两座楼梯拼成 ${n} × ${n + 1} 的长方形`]);
      lines.push([`= ${n * (n + 1)} 块`]);
      lines.push([`一半就是：${n * (n + 1)} ÷ 2 = ${staircaseSum(n)}`]);
      lines.push(['高斯算 1 加到 100：', 'stair-panel is-soft']);
      lines.push(['100 × 101 ÷ 2 = 5050', 'stair-panel is-soft']);
    }
    out += lines.map(([v, cls = 'stair-panel'], i) => text(pt(372, 60 + i * 40), v, cls)).join('');
    board.draw(out);
    stats.innerHTML = metric('楼梯级数', n) + metric('一座楼梯的方块', staircaseSum(n)) + metric('公式', 'n × (n + 1) ÷ 2');
    controls.querySelector('[data-action="copy"]').setAttribute('aria-pressed', String(copy));
  }

  onAction(controls, { copy: () => { copy = !copy; draw(); board.animate('.stair.is-b'); } }, signal);
  controls.addEventListener('input', draw, { signal });
  draw();
  return (n = 5, nextCopy = false) => {
    copy = nextCopy;
    setSlider(controls, 'gs-n', n);
    draw();
    board.animate(nextCopy ? '.stair.is-b' : '.stair');
  };
}
