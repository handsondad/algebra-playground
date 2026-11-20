import { add, clamp, cross, dist, fmt, mul, pt, sub } from './algebra.js';

export const W = 640, H = 400;
export const xy = p => `${p.x.toFixed(3)},${p.y.toFixed(3)}`;
export const line = (a, b, cls = 'structural') => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}"/>`;
export const circle = (p, r, cls = 'aux') => `<circle cx="${p.x}" cy="${p.y}" r="${r}" class="${cls}"/>`;
export const polygon = (points, cls = 'shape') => `<polygon points="${points.map(xy).join(' ')}" class="${cls}"/>`;
export const polyline = (points, cls) => `<polyline points="${points.map(xy).join(' ')}" class="${cls}"/>`;
export const text = (p, value, cls = 'point-label') => `<text x="${p.x}" y="${p.y}" class="${cls}">${value}</text>`;
export function point(p, name = '', { key, kind = 'point' } = {}) {
  const action = key === undefined ? '' : ` data-point="${key}" tabindex="0" role="button" aria-label="${name || '未命名点'}"`;
  return `<g class="handle ${kind}"${action}>${key === undefined ? '' : circle(p, 16, 'hit')}${circle(p, 5, 'dot')}${name ? text({ x: p.x + 10, y: p.y - 10 }, name) : ''}</g>`;
}
export function infinite(a, b, cls = 'structural') {
  const d = mul(sub(b, a), 1400 / dist(a, b));
  return line(sub(a, d), sub(a, mul(d, -1)), cls);
}
/** The smaller arc of radius r at vertex between the rays towards a and b. */
export function angleArc(vertex, a, b, r, cls = 'result') {
  const u = mul(sub(a, vertex), r / dist(a, vertex)), v = mul(sub(b, vertex), r / dist(b, vertex));
  return `<path d="M${xy(add(vertex, u))}A${r} ${r} 0 0 ${cross(u, v) > 0 ? 1 : 0} ${xy(add(vertex, v))}" class="${cls}"/>`;
}
export const metric = (label, value) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
export const button = (label, action, attrs = '') => `<button type="button" data-action="${action}" ${attrs}>${label}</button>`;

export function slider(label, id, value, min, max, step = 1, unit = '') {
  return `<div class="slider"><label for="${id}">${label}</label><output for="${id}">${value}${unit}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
}

export function makeBoard(container, name) {
  container.innerHTML = `<svg class="board" viewBox="0 0 ${W} ${H}" aria-label="${name}画板">
    <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" class="grid-line"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#grid)"/><g class="drawing"></g>
  </svg>`;
  const svg = container.firstElementChild, drawing = svg.querySelector('.drawing');
  return {
    svg,
    draw: html => { drawing.innerHTML = html; },
    animate(selector = '.aux, .result, .fade-in') {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      [...drawing.querySelectorAll(selector)].slice(0, 14).forEach((el, i) => {
        const delay = i * 52;
        if (el.matches('.fade-in, .tile, .fill-in')) {
          el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 480, delay, easing: 'ease-out', fill: 'backwards' });
        } else if (typeof el.getTotalLength === 'function') {
          const length = el.getTotalLength();
          if (!length) return;
          el.animate([
            { strokeDasharray: `${length} ${length}`, strokeDashoffset: length, opacity: 0.35 },
            { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0, opacity: 1 },
          ], { duration: 520, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
        }
      });
      [...drawing.querySelectorAll('.handle.highlight .dot, .handle.candidate .dot')].slice(0, 8).forEach((dot, i) => {
        dot.animate([
          { transform: 'scale(0.3)', opacity: 0 },
          { transform: 'scale(1.25)', opacity: 1, offset: 0.65 },
          { transform: 'scale(1)', opacity: 1 },
        ], { duration: 420, delay: 120 + i * 60, easing: 'ease-out', fill: 'backwards' });
      });
    },
    coords(event, margin = 0) {
      const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
      return { x: clamp(local.x, margin, W - margin), y: clamp(local.y, margin, H - margin) };
    },
  };
}

export function dragPoints(board, move, selector = '[data-point]') {
  const { svg } = board;
  let active;
  svg.addEventListener('pointerdown', event => {
    const handle = event.target.closest(selector);
    if (!handle || event.button !== 0 || active) return;
    active = { key: handle.dataset.point, id: event.pointerId };
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener('pointermove', event => {
    if (active?.id === event.pointerId) move(active.key, board.coords(event, 26));
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    svg.addEventListener(type, event => { if (active?.id === event.pointerId) active = undefined; });
  }
  svg.addEventListener('keydown', event => {
    const handle = event.target.closest(selector);
    const shifts = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!handle || !Object.hasOwn(shifts, event.key)) return;
    event.preventDefault();
    const dot = handle.querySelector('.dot'), key = handle.dataset.point;
    const [dx, dy] = shifts[event.key], step = event.shiftKey ? 15 : 4;
    move(key, { x: clamp(+dot.getAttribute('cx') + dx * step, 26, W - 26), y: clamp(+dot.getAttribute('cy') + dy * step, 26, H - 26) });
    svg.querySelector(`[data-point="${key}"]`)?.focus();
  });
}

/**
 * 坐标平面：把数学坐标 (x 向右、y 向上) 映射到画板像素。
 * 默认 x、y 等比例；box 是画板上留给平面的区域。
 */
export function plane({ xmin = -10, xmax = 10, ymin = -6, ymax = 6, box = [20, 20, W - 20, H - 20], equal = true } = {}) {
  const [left, top, right, bottom] = box;
  let sx = (right - left) / (xmax - xmin), sy = (bottom - top) / (ymax - ymin);
  if (equal) sx = sy = Math.min(sx, sy);
  const ox = (left + right) / 2 - ((xmin + xmax) / 2) * sx, oy = (top + bottom) / 2 + ((ymin + ymax) / 2) * sy;
  const px = p => pt(ox + p.x * sx, oy - p.y * sy);
  const math = p => pt((p.x - ox) / sx, (oy - p.y) / sy);
  const inside = p => p.x >= xmin && p.x <= xmax && p.y >= ymin && p.y <= ymax;

  function grid({ every = 1, label = 2, everyY = every, labelY = label, xName = 'x', yName = 'y' } = {}) {
    const a = px(pt(xmin, ymax)), b = px(pt(xmax, ymin));
    let out = `<rect x="${a.x}" y="${a.y}" width="${b.x - a.x}" height="${b.y - a.y}" class="plane-bg"/>`;
    for (let x = Math.ceil(xmin / every) * every; x <= xmax + 1e-9; x += every) out += line(px(pt(x, ymin)), px(pt(x, ymax)), 'plane-grid');
    for (let y = Math.ceil(ymin / everyY) * everyY; y <= ymax + 1e-9; y += everyY) out += line(px(pt(xmin, y)), px(pt(xmax, y)), 'plane-grid');
    if (xmin <= 0 && xmax >= 0) out += line(px(pt(0, ymin)), px(pt(0, ymax)), 'plane-axis');
    if (ymin <= 0 && ymax >= 0) out += line(px(pt(xmin, 0)), px(pt(xmax, 0)), 'plane-axis');
    const y0 = clamp(0, ymin, ymax), x0 = clamp(0, xmin, xmax);
    for (let x = Math.ceil(xmin / label) * label; x <= xmax; x += label) {
      if ((x === 0 && ymin < 0) || x === xmin || x === xmax) continue;
      const p = px(pt(x, y0));
      out += text(pt(p.x, p.y + 14), fmt(x), 'plane-tick');
    }
    for (let y = Math.ceil(ymin / labelY) * labelY; y <= ymax; y += labelY) {
      if ((y === 0 && xmin < 0) || y === ymin || y === ymax) continue;
      const p = px(pt(x0, y));
      out += text(pt(p.x - 6, p.y + 4), fmt(y), 'plane-tick is-y');
    }
    const xe = px(pt(xmax, y0)), ye = px(pt(x0, ymax));
    return out + text(pt(xe.x - 12, xe.y - 6), xName, 'plane-name') + text(pt(ye.x + 6, ye.y + 14), yName, 'plane-name');
  }

  /** 画函数图像：超出平面的部分剪掉（分段折线） */
  function curve(f, cls = 'result', samples = 240) {
    const parts = [];
    let run = [];
    for (let i = 0; i <= samples; i += 1) {
      const x = xmin + ((xmax - xmin) * i) / samples, y = f(x);
      if (Number.isFinite(y) && y >= ymin - 0.5 && y <= ymax + 0.5) run.push(px(pt(x, clamp(y, ymin - 0.5, ymax + 0.5))));
      else if (run.length) { parts.push(run); run = []; }
    }
    if (run.length) parts.push(run);
    return parts.filter(r => r.length > 1).map(r => polyline(r, cls)).join('');
  }

  const clip = `<clipPath id="plane-clip"><rect x="${px(pt(xmin, ymax)).x}" y="${px(pt(xmin, ymax)).y}" width="${(xmax - xmin) * sx}" height="${(ymax - ymin) * sy}"/></clipPath>`;
  return { px, math, inside, grid, curve, sx, sy, clip, range: { xmin, xmax, ymin, ymax } };
}

/** 一个可以点、也能用键盘回车选中的 SVG 按钮组 */
export const hotspot = (key, label, body, cls = '') =>
  `<g class="hotspot ${cls}" data-hot="${key}" tabindex="0" role="button" aria-label="${label}">${body}</g>`;

/** 给画板上的 [data-hot] 绑定点击和回车/空格 */
export function onHotspot(board, handler, signal) {
  board.svg.addEventListener('click', event => {
    const hot = event.target.closest('[data-hot]');
    if (hot) handler(hot.dataset.hot);
  }, { signal });
  board.svg.addEventListener('keydown', event => {
    const hot = event.target.closest('[data-hot]');
    if (!hot || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    const key = hot.dataset.hot;
    handler(key);
    board.svg.querySelector(`[data-hot="${key}"]`)?.focus();
  }, { signal });
}

/** 操作台：按 data-action 分发按钮点击 */
export function onAction(controls, handlers, signal) {
  controls.addEventListener('click', event => {
    const btn = event.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    handlers[btn.dataset.action]?.(btn);
  }, { signal });
}

/** 读滑块并把数值写回旁边的 output */
export function sliderValue(controls, id, format = v => fmt(v)) {
  const input = controls.querySelector(`#${id}`);
  const value = Number(input.value);
  input.previousElementSibling.value = format(value);
  return value;
}

export function setSlider(controls, id, value) {
  const input = controls.querySelector(`#${id}`);
  if (input) input.value = value;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;