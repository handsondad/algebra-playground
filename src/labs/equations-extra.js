import {
  cageCheck, cageLevels, fmt, leverLevels, leverStatus, pt,
} from '../algebra.js';
import {
  button, circle, hotspot, line, metric, onAction, onHotspot, polygon, setSlider, slider, sliderValue, text,
} from '../board.js';

/* ───────── 鸡兔同笼：抬起两只脚 ───────── */
function animalSvg(c, isRabbit, lifted) {
  const legLift = lifted ? -11 : 0;
  let out = '';
  if (isRabbit) {
    // 长耳朵 + 圆身子 + 4 条腿（吹哨子时前两只脚抬起，后两只脚站地）
    out += `<ellipse cx="${c.x - 6}" cy="${c.y - 23}" rx="3.8" ry="10" class="cage-ear"/>`;
    out += `<ellipse cx="${c.x + 6}" cy="${c.y - 23}" rx="3.8" ry="10" class="cage-ear"/>`;
    out += `<ellipse cx="${c.x}" cy="${c.y - 4}" rx="15" ry="12" class="cage-rabbit"/>`;
    out += circle(pt(c.x - 5, c.y - 7), 2, 'cage-eye') + circle(pt(c.x + 5, c.y - 7), 2, 'cage-eye');
    // 前两只脚（会抬起）
    out += line(pt(c.x - 9, c.y + 6), pt(c.x - 11, c.y + 18 + legLift), lifted ? 'cage-leg is-up' : 'cage-leg');
    out += line(pt(c.x - 3, c.y + 7), pt(c.x - 4, c.y + 18 + legLift), lifted ? 'cage-leg is-up' : 'cage-leg');
    // 后两只脚（一直踩地）
    out += line(pt(c.x + 4, c.y + 7), pt(c.x + 5, c.y + 18), 'cage-leg is-ground');
    out += line(pt(c.x + 10, c.y + 6), pt(c.x + 12, c.y + 18), 'cage-leg is-ground');
  } else {
    // 小鸡：红鸡冠 + 黄圆身 + 2 条腿（吹哨子时两只脚都缩起坐下）
    out += polygon([pt(c.x - 4, c.y - 15), pt(c.x, c.y - 22), pt(c.x + 4, c.y - 15)], 'cage-comb');
    out += circle(pt(c.x, c.y - 4), 12, 'cage-chick');
    out += polygon([pt(c.x + 11, c.y - 6), pt(c.x + 17, c.y - 3), pt(c.x + 11, c.y)], 'cage-beak');
    out += circle(pt(c.x + 4, c.y - 7), 2, 'cage-eye');
    out += line(pt(c.x - 4, c.y + 7), pt(c.x - 5, c.y + 18 + legLift), lifted ? 'cage-leg is-up' : 'cage-leg');
    out += line(pt(c.x + 4, c.y + 7), pt(c.x + 5, c.y + 18 + legLift), lifted ? 'cage-leg is-up' : 'cage-leg');
  }
  return `<g class="fade-in">${out}</g>`;
}

export function chickenRabbit({ board, controls, stats, notify, signal }) {
  let level = 0, lifted = false;

  function renderControls(rabbits = 1) {
    const lv = cageLevels[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${cageLevels
      .map((item, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider(`猜笼子里有几只兔子 y（共 ${lv.heads} 个头）`, 'cr-r', rabbits, 0, lv.heads) +
      `<div class="control-row">${button('📣 吹哨子：每只抬起 2 只脚！', 'whistle', `aria-pressed="${lifted}" class="primary"`)}${button('重来', 'reset')}</div>
      <p class="lab-note">「${lv.name}」：数头一共 <b>${lv.heads}</b> 个，数地上的脚一共 <b>${lv.legs}</b> 只。吹一声哨子，小鸡一屁股坐下，地上剩下的都是谁的脚？</p>`;
  }

  function draw() {
    const lv = cageLevels[level];
    const r = sliderValue(controls, 'cr-r');
    const st = cageCheck(lv.heads, lv.legs, r, lifted);
    const cols = Math.min(6, Math.ceil(lv.heads / 2));
    let out = `<rect x="26" y="42" width="336" height="266" rx="16" class="cage-box"/>`;
    out += text(pt(194, 30), `目标：${lv.heads} 个头 · ${lv.legs} 只脚`, 'cage-head');

    for (let i = 0; i < lv.heads; i += 1) {
      const row = Math.floor(i / cols), col = i % cols;
      const rowCount = row === 0 ? cols : lv.heads - cols;
      const startX = 194 - ((rowCount - 1) * 52) / 2;
      const c = pt(startX + col * 52, 118 + row * 114);
      out += line(pt(42, c.y + 19), pt(346, c.y + 19), 'cage-floor');
      out += animalSvg(c, i < st.rabbits, lifted);
    }

    const diff = st.totalLegs - lv.legs;
    out += text(pt(194, 338),
      st.solved ? `✔ 刚好 ${st.chickens} 只鸡、${st.rabbits} 只兔，共 ${lv.legs} 只脚！`
        : diff > 0 ? `现在有 ${st.totalLegs} 只脚，比 ${lv.legs} 多了 ${diff} 只` : `现在有 ${st.totalLegs} 只脚，还差 ${-diff} 只`,
      st.solved ? 'cage-verdict is-win' : 'cage-verdict');

    const lines = [
      ['写成方程组：', 'tile-panel is-soft'],
      [`x + y = ${lv.heads}`, 'tile-panel is-big'],
      [`2x + 4y = ${lv.legs}`, 'tile-panel is-big'],
    ];
    if (lifted) {
      const liftedAll = 2 * lv.heads, rem = lv.legs - liftedAll;
      lines.push(['📣 每只抬起 2 只脚：', 'tile-panel is-soft']);
      lines.push([`抬走 2 × ${lv.heads} = ${liftedAll} 只脚`]);
      lines.push([`地上还剩 ${lv.legs} − ${liftedAll} = ${rem} 只`]);
      lines.push([`全是兔子的后脚：2y = ${rem}`, 'tile-panel is-big']);
      lines.push([`兔 y = ${rem / 2}，鸡 x = ${lv.heads - rem / 2} ✔`, 'tile-panel is-win']);
    } else {
      lines.push([`小鸡 ${st.chickens} 只 → ${2 * st.chickens} 只脚`]);
      lines.push([`兔子 ${st.rabbits} 只 → ${4 * st.rabbits} 只脚`]);
      lines.push(['点「吹哨子」看消元妙招！', 'tile-panel is-soft']);
    }
    out += lines.map(([v, cls = 'tile-panel'], i) => text(pt(382, 62 + i * 38), v, cls)).join('');

    board.draw(out);
    const whistleBtn = controls.querySelector('[data-action="whistle"]');
    if (whistleBtn) whistleBtn.setAttribute('aria-pressed', String(lifted));
    stats.innerHTML = metric('小鸡 x · 兔子 y', `${st.chickens} 鸡 · ${st.rabbits} 兔`) +
      metric(lifted ? '地上还剩的脚' : '现在的总脚数', `${st.groundLegs} 只`) +
      metric('核对目标', st.solved ? '完全对上 🎉' : `目标 ${lv.legs} 只脚`);
    notify(st.solved ? `🎉 找对啦！${st.chickens} 只小鸡和 ${st.rabbits} 只兔子，一共 ${lv.heads} 个头、${lv.legs} 只脚。` : '');
  }

  function reset(index, rabbits = 1, nextLifted = false) {
    level = index;
    lifted = nextLifted;
    renderControls(rabbits);
    draw();
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level), 1, false),
    whistle: () => { lifted = !lifted; draw(); board.animate('.fade-in'); },
    reset: () => reset(level, 1, false),
  }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0, 1, false);

  return (index = 0, rabbits = 1, nextLifted = false) => {
    reset(index, rabbits, nextLifted);
    board.animate('.fade-in');
  };
}

/* ───────── 阿基米德跷跷板（w₁d₁ = w₂d₂） ───────── */
export function leverBalance({ board, controls, stats, notify, signal }) {
  let level = 0;

  function renderControls(peg = 1) {
    const lv = leverLevels[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${leverLevels
      .map((_, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider(`把右边重量 ${lv.moverWeight} 放到第几格 x`, 'lv-x', peg, 1, 8) +
      `<p class="lab-note">「${lv.name}」：离支点越远，往下压的劲越大（<b>重量 × 格数</b>）。也可以直接点横杆右边的刻度挂钩！</p>`;
  }

  function draw() {
    const lv = leverLevels[level];
    const x = sliderValue(controls, 'lv-x');
    const st = leverStatus(lv, x);
    const pivot = pt(320, 244), stepPx = 32;
    const rad = (st.tilt * Math.PI) / 180;
    const beamPt = (signedStep, normalOffset = 0) => {
      const along = signedStep * stepPx;
      return pt(
        pivot.x + along * Math.cos(rad) + normalOffset * Math.sin(rad),
        pivot.y + along * Math.sin(rad) - normalOffset * Math.cos(rad),
      );
    };

    let out = polygon([pt(pivot.x, pivot.y + 4), pt(pivot.x - 28, pivot.y + 68), pt(pivot.x + 28, pivot.y + 68)], 'lever-fulcrum');
    out += line(pt(140, pivot.y + 68), pt(500, pivot.y + 68), 'cage-floor');
    out += line(beamPt(-8.5), beamPt(8.5), `lever-beam${st.balanced ? ' is-level' : ' is-tilted'}`);
    out += circle(pivot, 6, 'scale-pivot');

    for (let k = -8; k <= 8; k += 1) {
      if (k === 0) continue;
      const pTop = beamPt(k, 4), pBot = beamPt(k, -8), lbl = beamPt(k, -21);
      const tick = line(pTop, pBot, 'lever-tick') + text(pt(lbl.x, lbl.y + 5), String(Math.abs(k)), 'lever-num');
      out += k > 0 ? hotspot(`peg:${k}`, `放到右边第 ${k} 格`, `${circle(beamPt(k, 0), 13, 'hit')}${tick}`) : tick;
    }

    const drawBlock = (signedStep, w, kind) => {
      const size = 26 + Math.min(w, 8) * 2.2;
      const center = beamPt(signedStep, size / 2 + 5);
      return `<g class="fade-in" transform="rotate(${st.tilt.toFixed(2)} ${center.x.toFixed(1)} ${center.y.toFixed(1)})">
        <rect x="${center.x - size / 2}" y="${center.y - size / 2}" width="${size}" height="${size}" rx="7" class="lever-block is-${kind}"/>
        ${text(pt(center.x, center.y + 6), String(w), 'lever-weight')}
      </g>`;
    };

    for (const item of lv.left) out += drawBlock(-item.d, item.w, 'left');
    for (const item of lv.rightFixed) out += drawBlock(item.d, item.w, 'fixed');
    out += drawBlock(st.peg, lv.moverWeight, 'mover');

    const leftFormula = lv.left.map(it => `${it.w} × ${it.d}`).join(' + ');
    const rightPrefix = lv.rightFixed.length ? `${lv.rightFixed.map(it => `${it.w} × ${it.d}`).join(' + ')} + ` : '';
    out += text(pt(320, 48),
      `${leftFormula} = ${st.leftTorque}   ${st.balanced ? '=' : st.leftTorque > st.rightTorque ? '>' : '<'}   ${rightPrefix}${lv.moverWeight} × ${st.peg} = ${st.rightTorque}`,
      st.balanced ? 'lever-eq is-win' : 'lever-eq');
    out += text(pt(320, 84),
      st.balanced ? `✔ 两边力矩都是 ${st.leftTorque}，跷跷板平啦（x = ${st.peg}）！`
        : `把 x 换成未知数：${leftFormula} = ${rightPrefix}${lv.moverWeight}x`,
      'lever-sub');

    board.draw(out);
    stats.innerHTML = metric('左边（重×格）', fmt(st.leftTorque)) +
      metric('右边（重×格）', fmt(st.rightTorque)) +
      metric('状态', st.balanced ? `平衡 x = ${st.peg} ✔` : st.leftTorque > st.rightTorque ? '左边沉' : '右边沉');
    notify(st.balanced ? `🎉 平衡啦！第 ${st.peg} 格正好让右边力矩等于 ${st.leftTorque}。` : '');
  }

  function reset(index, peg = 1) {
    level = index;
    renderControls(peg);
    draw();
  }

  onHotspot(board, key => {
    if (!key.startsWith('peg:')) return;
    setSlider(controls, 'lv-x', Number(key.slice(4)));
    draw();
  }, signal);
  onAction(controls, { level: btn => reset(Number(btn.dataset.level), 1) }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0, 1);

  return (index = 0, peg = 1) => {
    reset(index, peg);
    board.animate('.lever-beam, .fade-in');
  };
}
