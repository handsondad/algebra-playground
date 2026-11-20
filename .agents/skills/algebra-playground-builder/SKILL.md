---
name: algebra-playground-builder
description: 为「代数游乐场」(algebra-playground) 设计、实现与验收新的互动代数实验、代数故事与「小念问爸爸」图文动画问答。凡在本仓库扩充实验、关卡、问答或科普内容时调用。
---

# 代数游乐场 · 内容与实验扩充指南 (`algebra-playground-builder`)

动手写代码前请先通读本指南；需要查阅画板原语、实验签名与语音接口时，请阅读同目录下的 `kit-reference.md`。

---

## 1. 选题与交互标准

每个新实验必须满足以下四点：

1. **放对展馆**：按它讲的代数内容，放进六座学科展馆之一（同 geometry-playground 按学科分支分馆）。
   - `equations` 等式与方程：等量关系、一元一次方程、移项与负数、二元方程组消元、乘积等式（挂件、天平、鸡兔同笼、杠杆）。
   - `expressions` 代数式与运算：用字母表示数、化简、多项式乘法、平方差、因式分解、配方、二项式展开（口袋与弹珠、代数瓷砖、杨辉三角）。
   - `inequalities` 不等式与规划：数轴不等式与乘负变号、半平面交集、线性规划顶点最优解。
   - `patterns` 数列与规律：图案规律、形数与奇数和、求和公式、斐波那契递推、无穷等比级数。
   - `functions` 函数与图像：正比例、函数规则、斜率与截距、交点与方程组、抛物线、式子/图像/表格。
   - `exponents` 乘方、指数与进制：指数爆炸 `2ⁿ`、爆炸圆点进制与多项式机器 `1 ← x`、指数衰减。

   交互形式不限：可以是不写字母、靠试错就能玩的小谜题（参考 SolveMe Mobiles、Math Playground Model Algebra），自由摆放的教具画布（参考 Amplify Polypad、GeoGebra），也可以是 3–5 个调参数「吃星星 / 过障碍」的小关卡（参考 Desmos Marbleslides、Save the Zogs）。同一座馆里由浅入深，用 `difficulty` 标出入门 / 进阶 / 挑战。
2. **真实代数 + 可动手操作**：所有数值都由 `src/algebra.js` 实时计算，拒绝静态图片或纯选择题；关卡答案必须能被 `tests/` 验证。
3. **先玩后讲**：像 Brilliant 一样，先抛出一个能动手的小场景，让孩子试错，再由爸爸归纳规律。
4. **三轮「小念问爸爸」递进引导**：
   - 第 1 轮（先问个为什么）：从画板上一个具体的数或现象发问，驱动第 1 个场景。
   - 第 2 轮（再追问一步）：爸爸点出核心代数机制（两边同做一件事、面积 = 长 × 宽、每多 1 就多 a），驱动第 2 个场景。
   - 第 3 轮（自己动手验证）：换数字或换关卡，出现「哇时刻」，引导孩子亲自检验，驱动第 3 个场景。

---

## 2. 五步标准扩充流程

### 第 1 步：选展馆，登记实验

- 在 `src/catalog.js` 对应展馆的 `lessons` 中追加一项：`id`、`name`、`tag`、`intro`、`idea`、`question`、`choices`、`answer`、`sources`（至少一条 `https` 出处）。
- 只有出现一个现有六馆都装不下的代数分支时才新建展馆：在 `src/hall-theme.js` 里配色与图标，在 `hallHooks`、`hallChats` 里各补一句，并让 `homeShowcase`、`algebraWiki`、`algebraTalks` 至少各有一项指向它（`npm run check` 会检查）。
- 在 `src/lab-modes.js` 中把 `id` 映射到实验函数。同一个函数可服务多个 id（如 `balance-scale` 与 `balloon-scale`），用 `lesson.id` 区分。

### 第 2 步：纯计算 + 交互画板

- 公式、关卡数据、判定函数（如 `marbleRun`、`laserHits`、`solveSteps`）放进 `src/algebra.js`，并在 `tests/algebra.test.js` 补断言：答案唯一、默认值不过关、答案落在滑块格点上。
- 在 `src/labs/*.js` 实现实验：
  - 使用 `makeBoard` 给的 `board`、`plane()`、`hotspot`/`onHotspot`、`slider`/`sliderValue`、`button`/`onAction`、`metric` 等共享原语；
  - 必须返回 `demo(...scene)` 回调。问答页 `#q/<id>` 在爸爸开口时、游乐场 `#play/<id>` 的「摆出画面」被点击时，都用那一轮的 `scene` 调用它。
  - 同一个实验会挂载两次：问答页只读（`interactive: false`），游乐场可操作（`interactive: true`）。不要假设页面上一定有操作台。
  - 闯关通过时用 `notify(...)` 给一句提示，并在画板或操作台上给出明确的「过关」反馈；`reducedMotion()` 为真时跳过动画直接给结果。

### 第 3 步：对话、问题标题与故事

1. **`src/lab-talks.js`**：写 3 轮 `nian` / `dad` 对话与 3 个不同的 `scene`。
2. **`src/question-catalog.js`**：补小念口吻的问题标题（`questionTitles`）、生活场景（`questionTriggers`），并在 `difficulty` 表里给难度 1–3（入门 / 进阶 / 挑战，缺省为 2）。如是展馆代表作，可替换 `homeShowcase` 里这座馆的那张卡（需注明来源与 https 链接）。
3. **`src/algebra-story-data.js`（可选）**：给 `algebraWiki` 加一位数学家的故事（`homeLab` 以 `🏠 ` 开头，`relatedLabId` 指向实验 id），或给 `algebraTalks` 加一条睡前问答。

### 第 4 步：合成离线双人语音

在装有 `edge-tts` 的 Python 环境中执行：

```bash
npm run voice
```

它采集全部台词，用 `zh-CN-YunxiaNeural (+0%)`（小念）与 `zh-CN-YunxiNeural (-5%)`（爸爸）增量合成 MP3 到 `public/voice/clips/`，更新 `src/voice-manifest.js`，并删除不再使用的音频。

### 第 5 步：验收门禁

```bash
npm run check
npm test
npm run build
npm run smoke -- <id>
```

确保规则守卫全绿、测试通过；无头浏览器里问答页 3 幕与游乐场 3 个「摆出画面」都正常、无 `NaN`、无 JS 异常，1280 / 390 / 320px 都没有横向溢出。`npm run smoke` 会自己先打包，检查的是 `dist/` 里的成品。
