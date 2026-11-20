# AGENTS.md：给接手这个仓库的代码助手

## 这是什么

**代数游乐场（`algebra-playground`）** 是给孩子和家长一起玩的互动代数游乐场，与 `geometry-playground` 同属「小念和爸爸」系列，页面外壳、问答页、游乐场和语音都沿用那边的做法。全站由 7 岁好奇男孩 **小念** 和温和爱动手的 **爸爸** 串联：每个问题一页「左边父子对话、右边代数动画」的问答页，再配一块可以自由操作的游乐场画板。

内容按 **三步走** 编排（参考 Amplify Polypad、SolveMe Mobiles、Desmos Activities、Brilliant、Math Playground、GeoGebra）：

| 步骤 `stage` | 展馆 `hallId` | 收录边界 |
| --- | --- | --- |
| 玩中学 `play` | 🧩 `mobiles` 挂件谜题 | 不写字母、用形状当未知数的平衡挂件；口袋 + 弹珠的数字魔术 |
| 玩中学 `play` | ⚖️ `balance` 天平解方程 | 天平两边同加同减同平分；红气球表示负数 |
| 动手试 `explore` | 🟪 `tiles` 代数瓷砖 | x² / x / 1 瓷砖拼面积：多项式乘法、因式分解、花拉子米配方法 |
| 动手试 `explore` | 🎰 `machines` 规律机器 | 函数黑盒、火柴棒图案（Visual Patterns）、高斯求和 |
| 闯关测 `challenge` | 📈 `lines` 直线闯关 | y = mx + b 激光救外星人（Save the Zogs）、两条直线的交点 |
| 闯关测 `challenge` | 🎢 `curves` 曲线闯关 | 弹珠滑梯（Marbleslides）、式子/图像/表格卡片配对（Card Sort） |

技术栈：**React 18 + TypeScript + Vite** 做页面外壳；实验是 **原生 ES Modules + SVG + Web Animations**，由 `src/lib/useLab.ts` 挂到页面上；测试用 Node 22/24 原生测试运行器。Hash 路由、纯静态、零后端，进度存本机 `localStorage`，`vite build` 打包到 `dist/`。

> **动手扩充新实验、故事或父子问答之前，请先完整阅读项目 Skill：**
> - `.agents/skills/algebra-playground-builder/SKILL.md`（镜像于 `skills/algebra-playground-builder/SKILL.md`）
> - `.agents/skills/algebra-playground-builder/kit-reference.md`（画板原语、实验签名、页面与语音速查表）

---

## 命令

先运行一次 `npm install`。

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服（`http://127.0.0.1:8010/`） |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run check` | 仓库规则守卫：导入后缀、纯计算层、实验元数据与资料出处、3 轮问答、首页轮播、故事与语音清单、多余音频 |
| `npm run voice` | 采集全站台词，用 `edge-tts` 增量生成小念（`zh-CN-YunxiaNeural +0%`）与爸爸（`zh-CN-YunxiNeural -5%`）的 MP3，更新 `src/voice-manifest.js`，并删掉不再使用的音频 |
| `npm test` | 代数核心与数据一致性测试（`tests/`） |
| `npm run build` | 类型检查后用 Vite 打包到 `dist/` |
| `npm run smoke` | 先打包，再用无头 Edge/Chrome 巡检 `dist/`：首页、6 座展馆、全部问答页与游乐场（含每个「摆出画面」），桌面 1280 与手机 390/320px 零横向溢出、无 JS 异常、无 `NaN` |
| `npm run smoke -- <id>...` | 只巡检指定的实验 |

**交付前必跑**：

```bash
npm run voice      # 改了任何台词、idea、故事或问答时
npm run check
npm test
npm run build
npm run smoke      # 或 npm run smoke -- <改动的 id>
```

---

## 地图

### 路由

| Hash 路由 | 页面 | 说明 |
| --- | --- | --- |
| `#` | `HomePage` | 标题、代数明星轮播（每座展馆一张，画面就是真实的实验画板，注明出处）、搜索与随便问一题、按三步走分组的展馆卡、其他入口 |
| `#hall/<id>` | `HallPage` | 父子导览、问题按入门 / 进阶 / 挑战分组、这座馆的游乐场、代数故事 |
| `#q/<id>` | `QuestionPage` | 左边对话、右边动画；每轮对话是一幕，爸爸开口时画板演示；看完记为「看过」 |
| `#play` | `PlayRoute` | 游乐场目录，按三步走和展馆分组 |
| `#play/<id>` | `PlayRoute` | 独立游乐场：大画板、操作台、「摆出画面」、小挑战、爸爸的笔记；答对小挑战记为「点亮」 |
| `#progress` | `ProgressPage` | 看过的问答与点亮的游乐场 |
| `#stories` | `StoriesPage` | 睡前聊天与全部代数故事 |

`localStorage` 键：`algebra-playground:completed:v1`（点亮）、`algebra-playground:heard:v1`（看过）、`algebra-playground:sound:v1`（声音）。已上线的实验 id 不改名。

### 目录结构

- `src/algebra.js`：**纯计算层**（不碰页面）。挂件求值与穷举解、数字魔术、天平操作与标准解法 `solveSteps`、瓷砖乘法/因式分解/配方、函数机器、火柴棒图案、直线交点、激光命中、弹珠轨道 `marbleRun`、卡片配对 `sameFunction`，以及全部关卡数据。
- `src/board.js`：SVG 画板原语、`plane()` 坐标平面（网格、刻度、函数曲线）、`hotspot`/`onHotspot` 可点图形、`onAction` 按钮分发、滑块读写。
- `src/labs/`：`puzzles.js`（挂件、数字魔术）、`scales.js`（天平、气球）、`tiles.js`（三个瓷砖实验）、`machines.js`（函数机器、火柴棒、高斯楼梯）、`lines.js`（激光救援、存钱比赛）、`marbles.js`（弹珠滑梯、卡片配对）。
- `src/lab-modes.js`：实验 id → 实验函数。
- `src/catalog.js`：三步走里的 6 座展馆和 14 个问题（名称、标签、介绍、爸爸的观察、小挑战、https 资料出处）。
- `src/question-catalog.js`：小念口吻的问题标题、生活场景、难度、展馆钩子、首页轮播 `homeShowcase`、小挑战的两句固定台词。
- `src/lab-talks.js`：每个实验 3 轮「小念问爸爸」，每轮的 `scene` 是传给实验 demo 的参数。
- `src/algebra-story-data.js`：展馆导览 `hallChats`、代数故事 `algebraWiki`（丢番图、花拉子米、韦达、雷科德、笛卡尔、伽利略、高斯）、睡前问答 `algebraTalks`。
- `src/speech.js` & `src/voice-manifest.js`、`public/voice/clips/`：离线双人语音。
- `src/pages/`、`src/components/`、`src/lib/`：React 外壳（与 geometry-playground 同构）。
- `src/styles/`：`base.css`（配色、按钮）、`lab.css`（画板与各实验图形、挑战、故事卡）、`app.css`（页面外壳、三步走分组）。页面在 `.page` 上设 `--bubble`，按钮、画板、读数都跟着展馆色走。
- `tools/`：`check-rules.mjs`、`generate-voice.py`、`smoke.mjs`。

---

## 硬性规矩

1. **代数准确**：所有天平、瓷砖、交点、命中与轨道都实时计算；关卡答案要能被测试验证（挂件谜题答案唯一、天平按标准步骤可解、激光/弹珠的答案落在滑块格点上且默认值过不了关）。不能出现 `NaN`。
2. **纯计算与视图分离**：`src/algebra.js` 不访问页面、`window` 或浏览器存储。
3. **每个实验 3 轮「小念问爸爸」**，绑定 3 个不同的 `scene`；问答页只读（`interactive: false`），游乐场可操作，演示只在点「摆出画面」时驱动画板。
4. **先玩后讲**：像 Brilliant 那样先给一个能动手的小场景，让孩子试错，再由爸爸总结；挂件关卡尽量不出现字母。
5. **角色与音色统一**：小念好奇敢猜，爸爸温和启发，禁止贬损词；语音统一 `zh-CN-YunxiaNeural (+0%)` 与 `zh-CN-YunxiNeural (-5%)`。
6. **移动端与无障碍**：1280 与 320/390px 零横向溢出；画板上可点的图形用 `hotspot`（支持 Tab + 回车）；遵守 `prefers-reduced-motion`（弹珠直接画出结果，不播动画）。
7. **导入后缀**：`src/` 与 `tests/` 里 `.js` 文件的相对导入必须写 `.js`；`.ts/.tsx` 之间不写后缀，导入原生 `.js` 模块时写 `.js`。
8. **实验模块不依赖 React**，只操作传入的容器。
