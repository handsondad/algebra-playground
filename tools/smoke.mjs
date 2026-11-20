#!/usr/bin/env node
/**
 * 代数游乐场 · 无头浏览器全站巡检
 *
 * 先用 Vite 打包到 dist/，再在无头 Edge/Chrome 里逐页检查打包后的站点：
 * - 桌面 1280px：首页轮播每一张、每座展馆、每个问答页的每一幕、每个游乐场的「摆出画面」、
 *   操作台每个按钮、每个滑块拉到两端、画板上的可点图形、小挑战答对后点亮。
 * - 手机 390 / 320px：所有页面零横向溢出。
 * - 全程：无 JS 异常、页面文字和画板里没有 NaN / Infinity。
 *
 * 用法：
 *   npm run smoke                       # 全站
 *   npm run smoke -- marble-slides ...  # 只巡检指定实验的问答页和游乐场
 */
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { build } from 'vite';
import { halls } from '../src/catalog.js';
import { labTalks } from '../src/lab-talks.js';
import { homeShowcase } from '../src/question-catalog.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

function findBrowser() {
  const envBin = process.env.BROWSER_BIN || process.env.CHROME_PATH;
  if (envBin && fs.existsSync(envBin)) return envBin;
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      ]
    : ['/usr/bin/google-chrome', '/usr/bin/microsoft-edge', '/usr/bin/chromium'];
  for (const bin of candidates) if (fs.existsSync(bin)) return bin;
  throw new Error('未找到 Edge/Chrome，请设置 BROWSER_BIN 环境变量。');
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const safe = path.normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^(\.\.[/\\])+/, '');
      const file = path.join(DIST, safe);
      if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));
const lessons = halls.flatMap(h => h.lessons);
const filterIds = process.argv.slice(2).filter(a => !a.startsWith('--'));
for (const id of filterIds) assert.ok(lessons.some(l => l.id === id), `没有这个实验：${id}`);
const labIds = filterIds.length ? filterIds : lessons.map(l => l.id);
const full = !filterIds.length;

await build({ root: ROOT, logLevel: 'warn' });
const { server, port } = await startServer();
const profile = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'algebra-smoke-'));
const child = spawn(findBrowser(), [
  '--headless=new', '--disable-gpu', '--mute-audio', '--no-first-run',
  '--disable-extensions', '--no-proxy-server', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });

let socket;
const problems = [];
try {
  let cdpPort;
  for (let i = 0; i < 100; i++) {
    try { [cdpPort] = (await fs.promises.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n'); break; }
    catch { await delay(100); }
  }
  assert.ok(cdpPort, '浏览器没有打开调试端口');
  const tabs = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
  await once(socket, 'open');

  const pending = new Map(), errors = [];
  let seq = 0;
  socket.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      errors.push(d.exception?.description ?? d.text);
    }
    if (!m.id) return;
    const [res, rej] = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
  };
  const send = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq; pending.set(id, [res, rej]); socket.send(JSON.stringify({ id, method, params }));
  });
  const ev = async expr => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const wait = async (expr, label = expr, n = 120) => {
    for (let i = 0; i < n; i++) { if (await ev(expr)) return; await delay(50); }
    throw Error(`等待超时：${label}`);
  };

  let visit = 0;
  /** 每次都整页重新加载，保证等到的是新页面的元素 */
  const open = async (hash, ready) => {
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/?v=${++visit}${hash}` });
    await wait(`document.readyState === 'complete' && !!document.querySelector(${JSON.stringify(ready)})`, `${hash} → ${ready}`);
    await delay(120);
  };
  const setWidth = width => send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 });

  let where = '';
  const check = (ok, message) => { if (!ok) problems.push(`${where}：${message}`); };
  const clean = async () => {
    const bad = await ev(`(() => {
      const re = /NaN|Infinity|undefined/;
      if (re.test(document.body.innerText)) return 'text: ' + document.body.innerText.match(new RegExp('.{0,30}(NaN|Infinity|undefined).{0,30}'))?.[0];
      for (const svg of document.querySelectorAll('svg')) if (/NaN|Infinity/.test(svg.innerHTML)) return 'svg: ' + svg.innerHTML.match(/.{0,60}(NaN|Infinity).{0,20}/)?.[0];
      return '';
    })()`);
    check(!bad, `出现异常数值 ${bad}`);
  };
  const overflow = async width => {
    const wide = await ev(`(() => {
      const clipped = e => {
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== 'visible') return true;
        }
        return false;
      };
      const hit = [...document.querySelectorAll('body *')].find(e => {
        if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.right > ${width} + 1 || r.left < -1) && getComputedStyle(e).position !== 'fixed' && !clipped(e);
      });
      if (document.documentElement.scrollWidth <= ${width} && !hit) return '';
      return document.documentElement.scrollWidth + 'px ' + (hit ? hit.tagName.toLowerCase() + '.' + [...hit.classList].join('.') + ' right=' + Math.round(hit.getBoundingClientRect().right) : '');
    })()`);
    check(!wide, `${width}px 横向溢出 ${wide}`);
  };
  const flushErrors = () => { while (errors.length) problems.push(`${where}：JS 异常 ${errors.shift()}`); };
  const shotDir = process.env.SMOKE_SHOTS;
  if (shotDir) fs.mkdirSync(shotDir, { recursive: true });
  const shot = async name => {
    if (!shotDir) return;
    const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(path.join(shotDir, `${name.replace(/[^\w-]+/g, '_')}.png`), Buffer.from(data, 'base64'));
  };

  for (const d of ['Runtime', 'Page']) await send(`${d}.enable`);
  await setWidth(1280);

  // ---------- 首页 ----------
  if (full) {
    where = '首页';
    await open('#', '.hall-card');
    assert.equal(await ev('document.querySelectorAll(".hall-card").length'), halls.length, '每座展馆一张卡');
    assert.equal(await ev('document.querySelectorAll(".show-dots button").length'), homeShowcase.length, '轮播张数');
    for (let i = 0; i < homeShowcase.length; i++) {
      await ev(`document.querySelectorAll(".show-dots button")[${i}].click()`);
      await delay(250);
      where = `首页轮播 ${homeShowcase[i].id}`;
      check(await ev(`document.querySelectorAll(".show-dots button")[${i}].getAttribute("aria-current") === "true"`), '点了没有切换');
      check(await ev('!!document.querySelector(".show-stage svg .drawing")?.childElementCount'), '轮播画板是空的');
      await clean();
    }
    where = '首页';
    await overflow(1280);
    await ev('document.querySelectorAll(".show-dots button")[0].click()');
    await delay(250);
    await shot('home-1280');
    flushErrors();
  }

  // ---------- 问答页：每一幕 ----------
  for (const id of labIds) {
    where = `#q/${id}`;
    await open(`#q/${id}`, '.film .drawing');
    const scenes = labTalks[id].length;
    check(await ev('document.querySelectorAll(".film-chips button").length') === scenes, '幕数和对话轮数不一致');
    for (let i = 0; i < scenes; i++) {
      await ev(`document.querySelectorAll(".film-chips button")[${i}].click()`);
      await delay(350);
      check(await ev('document.querySelector(".film .drawing").childElementCount > 0'), `第 ${i + 1} 幕画板是空的`);
      await clean();
    }
    check(await ev('[...document.querySelectorAll("#controls button, #controls input")].every(e => !e.offsetParent)'), '问答页不应该露出操作台');
    await overflow(1280);
    flushErrors();
  }

  // ---------- 游乐场：摆出画面、操作台、画板、小挑战 ----------
  for (const id of labIds) {
    const lesson = lessons.find(l => l.id === id);
    where = `#play/${id}`;
    await open(`#play/${id}`, '#canvas .drawing');
    check(await ev('document.querySelector("#canvas .drawing").childElementCount > 0'), '画板是空的');
    await clean();

    const presets = await ev('document.querySelectorAll("[data-preset]").length');
    check(presets === labTalks[id].length, '「摆出画面」按钮数不对');
    for (let i = 0; i < presets; i++) {
      await ev(`document.querySelector('[data-preset="${i}"]').click()`);
      await delay(300);
      where = `#play/${id} 摆出画面 ${i + 1}`;
      check(await ev('document.querySelector("#canvas .drawing").childElementCount > 0'), '画板是空的');
      await clean();
    }
    if (shotDir) { await delay(1800); await shot(`play-${id}-1280`); }

    where = `#play/${id} 操作台`;
    const actions = await ev('[...document.querySelectorAll("#controls [data-action]")].length');
    for (let i = 0; i < actions; i++) {
      await ev(`(() => { const b = document.querySelectorAll("#controls [data-action]")[${i}]; if (b && !b.disabled) b.click(); })()`);
      await delay(40);
      flushErrors();
    }
    await clean();
    const sliders = await ev('document.querySelectorAll("#controls input[type=range]").length');
    for (let i = 0; i < sliders; i++) {
      for (const end of ['min', 'max', 'min']) {
        await ev(`(() => {
          const input = document.querySelectorAll("#controls input[type=range]")[${i}];
          if (!input) return;
          input.value = input.${end};
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        })()`);
        await delay(40);
      }
    }
    await clean();

    where = `#play/${id} 画板`;
    const hots = await ev('document.querySelectorAll("#canvas [data-hot]").length');
    for (let i = 0; i < Math.min(hots, 8); i++) {
      await ev(`document.querySelectorAll("#canvas [data-hot]")[${i}]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
      await delay(40);
    }
    await clean();

    where = `#play/${id} 小挑战`;
    await ev(`document.querySelector('[data-choice="${(lesson.answer + 1) % lesson.choices.length}"]').click()`);
    await delay(60);
    check(await ev('!document.querySelector(".win-card")'), '答错也点亮了');
    await ev(`document.querySelector('[data-choice="${lesson.answer}"]').click()`);
    await wait('!!document.querySelector(".win-card")', '答对后点亮');
    await clean();
    await overflow(1280);
    flushErrors();
  }

  // ---------- 其他页面 ----------
  const routes = [
    ...(full ? [['#', '.hall-card'], ...halls.map(h => [`#hall/${h.id}`, 'a[href^="#q/"]']), ['#play', '.play-cards'], ['#progress', '.page'], ['#stories', '.wiki-card']] : []),
    ...labIds.flatMap(id => [[`#q/${id}`, '.film .drawing'], [`#play/${id}`, '#canvas .drawing']]),
  ];
  if (full) {
    for (const [hash, ready] of routes.slice(0, halls.length + 5)) {
      where = hash;
      await open(hash, ready);
      await clean();
      await overflow(1280);
      flushErrors();
    }
  }

  // ---------- 手机宽度 ----------
  for (const width of [390, 320]) {
    await setWidth(width);
    for (const [hash, ready] of routes) {
      where = `${hash} @${width}`;
      await open(hash, ready);
      if (hash.startsWith('#play/')) {
        await ev('document.querySelector("[data-preset=\'2\']")?.click()');
        await delay(250);
      }
      await overflow(width);
      if (width === 390 && (hash === '#' || hash.startsWith('#play/'))) await shot(`${hash.slice(1).replace('/', '-') || 'home'}-${width}`);
      await clean();
      flushErrors();
    }
  }

  if (problems.length) {
    console.error(`\n❌ 巡检发现 ${problems.length} 个问题：`);
    for (const p of problems) console.error('  • ' + p);
    process.exitCode = 1;
  } else {
    console.log(`\n✅ 巡检通过：${full ? `首页 · ${halls.length} 座展馆 · ` : ''}${labIds.length} 个问答页与游乐场 · 1280 / 390 / 320px`);
  }
} catch (error) {
  console.error(error);
  if (problems.length) for (const p of problems) console.error('  • ' + p);
  process.exitCode = 1;
} finally {
  socket?.close();
  child.kill();
  server.close();
  await delay(300);
  await fs.promises.rm(profile, { recursive: true, force: true }).catch(() => {});
}
