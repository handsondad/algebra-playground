# AGENTS.md：给接手这个仓库的代码助手

## 这是什么

**代数游乐场（`algebra-playground`）** 是给孩子和家长一起玩的互动代数游乐场，与 `geometry-playground` 同属「小念和爸爸」系列，页面外壳、问答页、游乐场和语音都沿用那边的做法。全站由 7 岁好奇男孩 **小念** 和温和爱动手的 **爸爸** 串联：每个问题一页「左边父子对话、右边代数动画」的问答页，再配一块可以自由操作的游乐场画板。

展馆和 geometry-playground 一样 **按学科内容分馆**（交互参考 Amplify Polypad、SolveMe Mobiles、Desmos Activities、Brilliant、Math Playground、GeoGebra）：

| 展馆 `hallId` | 收录边界 | 现有实验 |
| --- | --- | --- |
| ⚖️ `equations` 等式与方程 | 等量关系、一元一次方程、负数移项、二元一次方程组消元、杠杆乘积等式 | 平衡挂件、天平同加同减同平分、红气球表示负数、鸡兔同笼抬脚法、阿基米德跷跷板 |
| 🟪 `expressions` 代数式与运算 | 用字母表示数、化简、多项式乘法、平方差割补、因式分解、配方、二项式展开 | 口袋 + 弹珠数字魔术、瓷砖拼面积、剪一刀拼平方差、花拉子米配方法、杨辉三角与 (a+b)ⁿ |
| 🎯 `inequalities` 不等式与规划 | 数轴不等式与乘负变号、坐标半平面交集、线性规划整数最优解 | 数轴射灯与变号、探照灯围宝藏、零花钱采购计划 |
| 🔢 `patterns` 数列与规律 | 图案等差规律、形数与奇数和、求和公式、递推与斐波那契、无穷等比级数 | 火柴棒图案、奇数拐尺拼正方形、高斯楼梯、兔子数列与黄金长方形、切半正方形无穷求和 |
| 📈 `functions` 函数与图像 | 正比例配比、函数规则、斜率与截距、交点与方程组、抛物线、多种表示 | 柠檬水配比实验室、函数黑盒、激光救外星人、两条直线的交点、弹珠滑梯、卡片配对 |
| 🚀 `exponents` 乘方、指数与进制 | 乘方与指数爆炸、位值制与多项式机器、指数衰减 | 棋盘上的麦粒、爆炸圆点进制机（Exploding Dots）、弹跳小球的高度 |

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
| `#` | `HomePage` | 标题、代数明星轮播（6 张，每座展馆一张，画面就是真实的实验画板，注明出处）、搜索与随便问一题、六座学科展馆卡、其他入口 |
| `#hall/<id>` | `HallPage` | 父子导览、问题按入门 / 进阶 / 挑战分组、这座馆的游乐场、代数故事 |
| `#q/<id>` | `QuestionPage` | 左边对话、右边动画；每轮对话是一幕，爸爸开口时画板演示；看完记为「看过」 |
| `#play` | `PlayRoute` | 游乐场目录，按展馆分组 |
| `#play/<id>` | `PlayRoute` | 独立游乐场：大画板、操作台、「摆出画面」、小挑战、爸爸的笔记；答对小挑战记为「点亮」 |
| `#progress` | `ProgressPage` | 看过的问答与点亮的游乐场 |
| `#stories` | `StoriesPage` | 睡前聊天与全部代数故事 |

`localStorage` 键：`algebra-playground:completed:v1`（点亮）、`algebra-playground:heard:v1`（看过）、`algebra-playground:sound:v1`（声音）。已上线的实验 id 不改名。

### 目录结构

- `src/algebra.js`：**纯计算层**（不碰页面）。挂件求值与穷举解、数字魔术、天平操作与标准解法 `solveSteps`、瓷砖乘法/因式分解/配方、函数机器、火柴棒图案、直线交点、激光命中、弹珠轨道 `marbleRun`、卡片配对 `sameFunction`，以及全部关卡数据。
- `src/board.js`：SVG 画板原语、`plane()` 坐标平面（网格、刻度、函数曲线）、`hotspot`/`onHotspot` 可点图形、`onAction` 按钮分发、滑块读写。
- `src/labs/`：`puzzles.js`（挂件、数字魔术）、`scales.js`（天平、气球）、`equations-extra.js`（鸡兔同笼、跷跷板）、`tiles.js`（三个瓷砖实验）、`expressions-extra.js`（平方差、杨辉三角）、`inequalities.js`（数轴不等式、半平面探照灯、零花钱线性规划）、`machines.js`（函数机器、火柴棒、高斯楼梯）、`patterns-extra.js`（奇数拐尺、斐波那契、切半正方形）、`lines.js`（正比例柠檬水、激光救援、存钱比赛）、`marbles.js`（弹珠滑梯、卡片配对）、`exponents.js`（棋盘麦粒、爆炸圆点机、弹跳衰减）。
- `src/lab-modes.js`：实验 id → 实验函数。
- `src/catalog.js`：6 座学科展馆和 28 个问题（名称、标签、介绍、爸爸的观察、小挑战、https 资料出处）。
- `src/question-catalog.js`：小念口吻的问题标题、生活场景、难度、展馆钩子、首页轮播 `homeShowcase`、小挑战的两句固定台词。
- `src/lab-talks.js`：每个实验 3 轮「小念问爸爸」，每轮的 `scene` 是传给实验 demo 的参数。
- `src/algebra-story-data.js`：展馆导览 `hallChats`、17 篇代数故事 `algebraWiki`、12 组睡前问答 `algebraTalks`。
- `src/speech.js` & `src/voice-manifest.js`、`public/voice/clips/`：离线双人语音。
- `src/pages/`、`src/components/`、`src/lib/`：React 外壳（与 geometry-playground 同构）。
- `src/styles/`：`base.css`（配色、按钮）、`lab.css`（画板与各实验图形、挑战、故事卡）、`app.css`（页面外壳）。页面在 `.page` 上设 `--bubble`，按钮、画板、读数都跟着展馆色走。
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
