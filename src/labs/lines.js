import { fmt, intersect, laserHits, laserLevels, linearText, lineY, proportionCheck, proportionLevels, pt } from '../algebra.js';
import { button, circle, line, metric, onAction, plane, polyline, setSlider, slider, sliderValue, text } from '../board.js';

/* ───────── 激光救援 ───────── */
function alien(p, saved, i) {
  return `<g class="alien${saved ? ' is-saved' : ''}">
    ${saved ? circle(p, 22, 'alien-halo') : ''}
    <ellipse cx="${p.x}" cy="${p.y + 2}" rx="13" ry="11" class="alien-body"/>
    ${line(pt(p.x - 6, p.y - 7), pt(p.x - 10, p.y - 17), 'alien-antenna')}${line(pt(p.x + 6, p.y - 7), pt(p.x + 10, p.y - 17), 'alien-antenna')}
    ${circle(pt(p.x - 10, p.y - 18), 2.6, 'alien-tip')}${circle(pt(p.x + 10, p.y - 18), 2.6, 'alien-tip')}
    ${circle(pt(p.x - 4.5, p.y), 3, 'alien-eye')}${circle(pt(p.x + 4.5, p.y), 3, 'alien-eye')}
    ${saved ? text(pt(p.x + 16, p.y - 12), '✓', 'alien-check') : text(pt(p.x + 15, p.y - 12), `${i + 1}`, 'alien-num')}
  </g>`;
}

export function laserRescue({ board, controls, stats, notify, signal }) {
  const P = plane({ xmin: -10, xmax: 10, ymin: -7, ymax: 7 });
  let level = 0, fired = false;

  function renderControls(m = 1, b = 0) {
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选关">${laserLevels
      .map((lv, i) => button(`第 ${i + 1} 关`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider('斜率 m：往右走 1 格，激光升几格', 'lr-m', m, -3, 3, 0.5) +
      slider('截距 b：激光炮装在 y 轴的哪一格', 'lr-b', b, -6, 6, 0.5) +
      `<div class="control-row">${button('🔫 发射激光！', 'fire', 'class="primary"')}</div>
      <p class="lab-note">虚线是瞄准线。一条直线要同时穿过所有外星人才算救援成功。</p>`;
  }

  function draw() {
    const { targets, name } = laserLevels[level];
    const m = sliderValue(controls, 'lr-m'), b = sliderValue(controls, 'lr-b');
    const hits = fired ? laserHits(m, b, targets) : targets.map(() => false);
    const f = x => lineY(m, b, x);
    let out = P.grid();
    out += P.curve(f, fired ? 'laser-beam' : 'laser-aim');
    const c = P.px(pt(0, b)), r = P.px(pt(1, b)), up = P.px(pt(1, b + m));
    if (P.inside(pt(1, b + m))) out += polyline([c, r, up], 'laser-slope') + text(pt(r.x + 6, (r.y + up.y) / 2 + 5), `${fmt(m)}`, 'laser-slope-label');
    out += `<g class="laser-cannon"><rect x="${c.x - 13}" y="${c.y - 9}" width="26" height="18" rx="5"/>${circle(c, 5, 'laser-cannon-eye')}</g>`;
    out += targets.map((p, i) => alien(P.px(p), hits[i], i)).join('');
    out += text(pt(32, 40), `第 ${level + 1} 关 · ${name}`, 'laser-title') + text(pt(608, 40), linearText(m, b), 'laser-eq');
    board.draw(out);
    const saved = hits.filter(Boolean).length;
    stats.innerHTML = metric('瞄准线', linearText(m, b)) + metric('救到', fired ? `${saved} / ${targets.length}` : '还没发射') +
      metric('斜率的意思', `往右 1 格，${m >= 0 ? '升' : '降'} ${fmt(Math.abs(m))} 格`);
    if (fired) notify(saved === targets.length ? `🎉 全部救下！这条激光是 ${linearText(m, b)}。` : `救到 ${saved} 个，还差 ${targets.length - saved} 个。调一调再发射。`);
    else notify('');
  }

  function reset(index, m = 1, b = 0) {
    level = index; fired = false;
    renderControls(m, b);
    draw();
  }

  onAction(controls, {
    level: btn => reset(Number(btn.dataset.level)),
    fire: () => { fired = true; draw(); board.animate('.laser-beam'); },
  }, signal);
  controls.addEventListener('input', () => { fired = false; draw(); }, { signal });
  reset(0);
  return (index = 0, m = 1, b = 0, fire = false) => {
    reset(index, m, b);
    fired = fire;
    draw();
    board.animate(fire ? '.laser-beam, .laser-slope' : '.laser-aim, .laser-slope');
  };
}

/* ───────── 两条直线：存钱比赛 ───────── */
export function twoLines({ board, controls, stats, signal }) {
  const P = plane({ xmin: 0, xmax: 10, ymin: 0, ymax: 40, equal: false, box: [58, 26, 616, 362] });
  controls.innerHTML = '<p class="lab-note">横轴是第几周，纵轴是存了多少元。两条线在哪里相交，就是两人存得一样多的那一周。</p>' +
    slider('🧒 小念：一开始有几元', 'tl-b1', 10, 0, 20) + slider('🧒 小念：每周存几元', 'tl-m1', 2, 0, 6) +
    slider('👧 表姐：一开始有几元', 'tl-b2', 2, 0, 20) + slider('👧 表姐：每周存几元', 'tl-m2', 4, 0, 6);

  function draw() {
    const b1 = sliderValue(controls, 'tl-b1'), m1 = sliderValue(controls, 'tl-m1');
    const b2 = sliderValue(controls, 'tl-b2'), m2 = sliderValue(controls, 'tl-m2');
    const hit = intersect(m1, b1, m2, b2);
    let out = P.grid({ every: 1, label: 2, everyY: 5, labelY: 10, xName: '周', yName: '元' });
    out += P.curve(x => lineY(m1, b1, x), 'line-a') + P.curve(x => lineY(m2, b2, x), 'line-b');
    const endA = P.px(pt(10, Math.min(40, lineY(m1, b1, 10)))), endB = P.px(pt(10, Math.min(40, lineY(m2, b2, 10))));
    out += text(pt(endA.x - 4, endA.y - 8), '小念', 'line-name is-a') + text(pt(endB.x - 4, endB.y + 18), '表姐', 'line-name is-b');
    let verdict;
    if (hit.kind === 'point' && hit.x >= 0 && hit.x <= 10 && hit.y <= 40) {
      const p = P.px(pt(hit.x, hit.y));
      out += line(p, P.px(pt(hit.x, 0)), 'aux') + line(p, P.px(pt(0, hit.y)), 'aux');
      out += `<g class="fade-in">${circle(p, 9, 'line-meet')}</g>`;
      out += text(pt(Math.min(p.x + 12, 470), Math.max(p.y - 14, 60)), `第 ${fmt(hit.x)} 周 · ${fmt(hit.y)} 元`, 'line-meet-label');
      verdict = `第 ${fmt(hit.x)} 周一样多`;
    } else if (hit.kind === 'same') verdict = '两条线重合：一直一样多';
    else if (hit.kind === 'none') verdict = '平行线：永远差一样多';
    else verdict = hit.x < 0 ? '早在开始之前就一样多了' : '10 周以后才追上';
    out += text(pt(100, 52), `小念 ${linearText(m1, b1)}`, 'line-eq is-a') + text(pt(100, 78), `表姐 ${linearText(m2, b2)}`, 'line-eq is-b');
    board.draw(out);
    stats.innerHTML = metric('小念', linearText(m1, b1)) + metric('表姐', linearText(m2, b2)) + metric('交点', verdict);
  }
  controls.addEventListener('input', draw, { signal });
  draw();
  return (m1 = 2, b1 = 10, m2 = 4, b2 = 2) => {
    setSlider(controls, 'tl-m1', m1); setSlider(controls, 'tl-b1', b1);
    setSlider(controls, 'tl-m2', m2); setSlider(controls, 'tl-b2', b2);
    draw();
    board.animate('.line-a, .line-b, .fade-in');
  };
}

/* ───────── 正比例柠檬水配比：y = kx ───────── */
function pitcherSvg(x, yBot, w, maxH, lemons, cups, title, cls) {
  const fillH = Math.min(maxH - 12, Math.max(22, ((lemons + cups) / 16) * (maxH - 16)));
  const yFill = yBot - fillH;
  return `<g class="fade-in">
    <rect x="${x}" y="${yBot - maxH}" width="${w}" height="${maxH}" rx="12" class="mix-jar"/>
    <rect x="${x + 4}" y="${yFill}" width="${w - 8}" height="${fillH - 4}" rx="8" class="mix-liquid ${cls}"/>
    ${text(pt(x + w / 2, yBot - maxH - 12), title, 'stair-label')}
    ${text(pt(x + w / 2, yBot - 28), `🍋 ${lemons}`, 'mix-item')}
    ${text(pt(x + w / 2, yBot - 8), `💧 ${cups}`, 'mix-item')}
    <path d="M${x + w} ${yBot - maxH + 26} Q${x + w + 18} ${yBot - maxH + 26} ${x + w + 18} ${yBot - maxH + 54} Q${x + w + 18} ${yBot - maxH + 80} ${x + w} ${yBot - maxH + 80}" class="mix-handle"/>
  </g>`;
}

export function proportionMix({ board, controls, stats, notify, signal }) {
  const P = plane({ xmin: 0, xmax: 8, ymin: 0, ymax: 12, equal: false, box: [306, 34, 614, 356] });
  let level = 0;

  function renderControls(lemons = 1, cups = 1) {
    const lv = proportionLevels[level];
    controls.innerHTML = `<div class="control-row" role="group" aria-label="选配方">${proportionLevels
      .map((_, i) => button(`配方 ${i + 1}`, 'level', `data-level="${i}" aria-pressed="${i === level}"`)).join('')}</div>` +
      slider('小念大壶里放几颗柠檬：x', 'pm-x', lemons, 1, 8) +
      slider('小念大壶里倒几杯水：y', 'pm-y', cups, 1, 12) +
      `<p class="lab-note">「${lv.name}」标准杯是 <b>${lv.targetLemons} 颗柠檬配 ${lv.targetCups} 杯水</b>。派对要用 <b>${lv.askLemons} 颗柠檬</b>，该倒几杯水味道才一模一样？</p>`;
  }

  function draw() {
    const lv = proportionLevels[level];
    const x = sliderValue(controls, 'pm-x'), y = sliderValue(controls, 'pm-y');
    const st = proportionCheck(lv, x, y);
    const k = lv.targetCups / lv.targetLemons;

    let out = '';
    const userCls = st.sameRatio ? 'is-match' : st.taste.includes('酸') ? 'is-sour' : 'is-light';
    out += pitcherSvg(34, 248, 94, 152, lv.targetLemons, lv.targetCups, '爸爸标准杯', 'is-match');
    out += pitcherSvg(156, 248, 102, 166, x, y, '小念派对壶', userCls);

    out += text(pt(148, 290),
      st.partySolved ? `🎉 派对大壶调好啦：${x} 颗配 ${y} 杯！`
        : st.sameRatio ? `✔ 味道一样！再试试放 ${lv.askLemons} 颗柠檬` : `现在尝起来：${st.taste}`,
      st.sameRatio ? 'mix-verdict is-win' : 'mix-verdict');
    out += text(pt(148, 324), `正比例：y = ${fmt(k)}x（过原点 0,0）`, 'mix-eq');
    out += text(pt(148, 354), `标准每颗配 ${fmt(st.unitCups)} 杯 · 你配 ${fmt(st.userUnitCups)} 杯`, 'tile-note');

    out += P.grid({ every: 1, label: 2, everyY: 2, labelY: 4, xName: '柠檬', yName: '水' });
    out += P.curve(v => k * v, 'line-a');
    const pStd = P.px(pt(lv.targetLemons, lv.targetCups));
    const pUser = P.px(pt(x, y));
    out += circle(P.px(pt(0, 0)), 5, 'mix-origin');
    out += circle(pStd, 7, 'mix-dot is-std') + text(pt(pStd.x + 10, pStd.y - 10), '标准', 'plane-tick');
    out += `<g class="fade-in">${circle(pUser, 8.5, st.sameRatio ? 'line-meet' : 'budget-dot is-bad')}</g>`;
    out += text(pt(Math.min(pUser.x + 10, 566), Math.max(pUser.y + 18, 52)), `(${x}, ${y})`, 'line-meet-label');

    board.draw(out);
    stats.innerHTML = metric('标准比（水÷柠檬）', fmt(st.unitCups)) +
      metric('你的比（水÷柠檬）', fmt(st.userUnitCups)) +
      metric('口味判定', st.partySolved ? '派对过关 🎉' : st.taste);
    notify(st.partySolved ? `🎉 调对啦！${x} 颗柠檬配 ${y} 杯水，刚好落在正比例直线 y = ${fmt(k)}x 上！` : '');
  }

  function reset(index, lemons = 1, cups = 1) {
    level = index;
    renderControls(lemons, cups);
    draw();
  }

  onAction(controls, { level: btn => reset(Number(btn.dataset.level), 1, 1) }, signal);
  controls.addEventListener('input', draw, { signal });
  reset(0, 1, 1);

  return (index = 0, lemons = 1, cups = 1) => {
    reset(index, lemons, cups);
    board.animate('.line-a, .fade-in');
  };
}
