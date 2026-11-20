# `algebra-playground` 共享画板与组件速查表 (`kit-reference.md`)

所有实验、展馆与问答页面都复用共享工具模块，禁止在单个实验内重复造轮子。

页面外壳是 React + TypeScript（`src/main.tsx`、`src/App.tsx`、`src/pages/`、`src/components/`、`src/lib/`）；实验是原生 JS 模块，直接操作 SVG 画板。两边只通过 `src/lib/useLab.ts` 对接。

---

## 1. 实验函数签名与 `demo` 回调 (`src/lab-modes.js` / `src/labs/*.js`)

```js
import { button, metric, onAction, slider, sliderValue } from '../board.js';

export function myLab({ board, controls, stats, guide, records, lesson, signal, notify, interactive }) {
  // 1. interactive 为 true 时写操作台：controls.innerHTML = slider(...) + button(...)
  // 2. 绑定事件一律传 { signal }（onAction / onHotspot 已内置），离开页面自动清理
  // 3. 重绘：board.draw(svgString)；读数：stats.innerHTML = metric(...)
  // 4. interactive 为 false 时（问答动画）只演示，不要依赖操作台存在
  // 5. 返回问答动画和「摆出画面」共用的场景回调，参数就是 lab-talks 里的 scene：
  return (...scene) => {
    // 切换状态、重绘，再触发 SVG 动画
    board.animate('.result, .shape');
  };
}
```

在 `src/lab-modes.js` 的 `modes` 里把实验 id 映射到函数；`labIds` 由它导出，检查脚本和测试据此核对 catalog 与 lab-talks。

`useLab(lesson, interactive)` 负责创建画板、调用 `labMode(id)` 并在卸载时 `abort()`。它要求这些容器（巡检脚本也靠它们定位）：`#canvas` 画板、`#controls` 操作台、`#stats` 读数、`#lab-guide` 步骤说明、`#lab-records` 记录、`#notice` 提示。使用它的组件要以实验 id 作为 `key`，换实验时整块重建。

---

## 2. SVG 画板原语 (`src/board.js`)

画板坐标系固定为 `W = 640, H = 400`。

- 图形字符串：`line(a, b, cls)`、`infinite(a, b, cls)`、`circle(p, r, cls)`、`polygon(points, cls)`、`polyline(points, cls)`、`text(p, value, cls)`、`point(p, name, { key, kind })`。
- `plane({ xmin, xmax, ymin, ymax, box, equal })`：坐标平面。返回 `px(p)`（数学坐标 → 像素）、`math(p)`（反向）、`inside(p)`、`grid({ every, label, xName, yName })`、`curve(f, cls)`（自动剪掉出界部分）、`clip`、`range`。
- `hotspot(key, label, body, cls)` + `onHotspot(board, handler, signal)`：画板上可点的图形（挂件、砝码、瓷砖、卡片），支持 Tab 聚焦和回车 / 空格。
- 操作台：`slider(label, id, value, min, max, step, unit)`、`sliderValue(controls, id)`（读值并刷新旁边的数字）、`setSlider(controls, id, value)`、`button(label, action, attrs)` + `onAction(controls, { action: btn => ... }, signal)`、`metric(label, value)`。
- `board.animate(selector)`：描线要素执行描绘、填充面渐显、高亮点弹出，自动遵守 `prefers-reduced-motion`。实验里自己写动画（如弹珠滚动）时先看 `reducedMotion()`。

纯计算放在 `src/algebra.js`：`fmt`、`termsText`、`linearText`、`polyText`（统一用真正的减号 `−`）；挂件 `mobileStatus` / `mobileSolutions`；天平 `applyScaleOp` / `solveSteps`；瓷砖 `tileProduct` / `factorTry` / `completeSquare`；函数机器 `machineOut` / `ruleFromPairs`；火柴 `matchCount` / `matchSticks`；直线 `intersect` / `laserHits`；弹珠 `trackFn` / `marbleRun`；卡片 `cardEquation` / `cardTable` / `sameFunction`；以及各关卡数组 `*Levels`、`mobilePuzzles`、`cardRounds`。

常用画板 CSS 类（`src/styles/lab.css`）：
- 画板上的 `--hue`（等于展馆的 `--bubble`）和 `--hue-ink` 供实验图形取色，新实验优先用它们。
- 通用：`structural`、`aux`、`result`、`shape`、`plane-bg` / `plane-grid` / `plane-axis` / `plane-tick` / `plane-name`、`hotspot`。
- 各实验的专用类以实验为前缀：`mobile-*`、`trick-*`、`scale-*`、`tile-*`、`machine-*`、`match-*` / `stair-*`、`laser-*` / `alien-*`、`marble-*` / `star-*`、`sort-card` / `card-*`。卡片组本身不要用 `card` 类（`base.css` 已占用）。
- 页面外壳颜色跟着展馆走：`.page` 设置 `--bubble`，`app.css` 派生出 `--hall`、`--hall-soft`、`--hall-line`、`--hall-ink`。三步走分组用 `--stage`。

---

## 3. 角色头像、对话与语音

- `src/components/Avatar.tsx`：`<Avatar who="nian" | "dad" />`，与系列其他项目一致的小念 / 爸爸头像。
- `src/components/Bubble.tsx`：`<Bubble who index speaking>` 对话气泡，小念在右、爸爸在左，正在说话时高亮。
- `src/lib/speech.ts`：`useSpeaking()`、`useSound()`、`isLine(line, who, text)`。
- `src/speech.js`：`say(...lines)` / `stopSpeaking()` / `chime(true | false)`，优先播放 `public/voice/clips/*.mp3`，找不到时回退到浏览器中文语音。清单键是 `"who|text"`，文件名是它的 sha256 前 12 位。
- `src/question-catalog.js`：`challengeHint` 与 `challengeCheer(lesson)` 是游乐场小挑战的两句固定台词；改文字后要重跑 `npm run voice`。

---

## 4. 页面与路由 (`src/lib/route.ts`)

| 地址 | 页面 |
| --- | --- |
| `#` | 首页 `HomePage`：代数明星轮播、搜索、三步走展馆 |
| `#hall/<id>` | 展馆 `HallPage`：问题按难度分组、这座馆的游乐场、代数故事 |
| `#q/<id>` | 问答 `QuestionPage`：左边对话、右边 `QuestionFilm` 动画 |
| `#play`、`#play/<id>` | 游乐场目录与独立游乐场 `PlayRoute` |
| `#progress`、`#stories` | 进度、代数故事 |

链接请用 `href.play(id)`、`href.question(id)`、`href.hall(id)` 等助手生成。

---

## 5. `src/catalog.js` 登记格式

```js
{ id: 'balance', name: '天平解方程', stage: 'play', summary: '……', lessons: [
  { id: 'balance-scale', name: '天平上的方程', tag: '一元一次方程',
    intro: '天平上放着几个装了秘密数字的 x 盒子和一些砝码……',
    idea: '天平平着，说明两边相等。两边同时拿走一样的东西，天平还是平的……',
    question: '左边 3 个 x 加 2 个砝码，右边 1 个 x 加 8 个砝码。第一步两边都拿走 1 个 x，剩下什么？',
    choices: ['2x + 2 = 8', '3x + 1 = 8', '2x = 10'], answer: 0,
    sources: [['Math Playground · Model Algebra Equations', 'https://www.mathplayground.com/AlgebraEquations.html']] },
] }
```

对应的 `src/lab-talks.js`：

```js
'balance-scale': [
  { scene: [0, 0, false], nian: '……', dad: '……' },
  { scene: [0, 0, true], nian: '……', dad: '……' },
  { scene: [0, 3, false], nian: '……', dad: '……' },
],
```
