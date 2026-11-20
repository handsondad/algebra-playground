# 代数游乐场

一座中文互动代数游乐场，是 [geometry-playground](../geometry-playground) 的姊妹项目：同样由小念和爸爸一问一答，同样每道问题配一页动画问答和一块能动手的游乐场。所有实验都在浏览器里运行，不需要账号、后端或外部资源，语音也已离线保存。

内容按「三步走」编排：

| 步骤 | 展馆 | 可以动手做什么 |
| --- | --- | --- |
| 1 · 玩中学 | 🧩 挂件谜题 | 不写 x，只给圆球、方块、三角配重量，让每根横杆都水平（参考 SolveMe Mobiles）；「想一个数」的读心魔术，用口袋和弹珠看穿它 |
| 1 · 玩中学 | ⚖️ 天平解方程 | 两边同拿、同放、同平分，把 3x + 2 = x + 8 解出来（参考 Polypad 天平、Math Playground Model Algebra）；红气球表示 −1，碰到负数也不怕 |
| 2 · 动手试 | 🟪 代数瓷砖 | 用 x²、x、1 瓷砖拼出 (x + a)(x + b)；把 x² + bx + c 拼成长方形来因式分解；跟花拉子米补上缺角，配方解 x² + 10x = 39 |
| 2 · 动手试 | 🎰 规律机器 | 往函数黑盒里喂数字，猜出藏着的 y = ax + b；数火柴棒长图案（参考 Visual Patterns）；两座楼梯一正一倒，像高斯那样算 1 + 2 + … + 100 |
| 3 · 闯关测 | 📈 直线闯关 | 调斜率 m 和截距 b，一道激光救下所有外星人（参考 Save the Zogs）；两人存钱比赛，看两条直线在哪一周相交 |
| 3 · 闯关测 | 🎢 曲线闯关 | 调直线和抛物线的参数，让弹珠吃到所有星星又绕开砖墙（参考 Desmos Marbleslides）；把式子、图像、表格三张卡配成一组（参考 Desmos Card Sort） |

首页先是一组代数明星轮播，每座展馆一张，画面就是真实的实验画板。往下可以搜索问题、随便问一题，或按三步走进入展馆。展馆里的问题按入门、进阶、挑战分组，下面是游乐场和代数故事（丢番图、花拉子米、韦达、雷科德、笛卡尔、伽利略、高斯），每篇故事附一个今晚就能在家做的小实验。

每道问题有一页问答：左边是小念和爸爸的对话，右边是代数动画。每轮对话是一幕，可以连播，也可以单独看某一幕；关掉声音仍有动画和字幕。想亲手操作就点「换我动手」进入游乐场，用「摆出画面」一键还原对话里的三个场景，答对小挑战即可点亮。进度和声音开关只保存在当前浏览器。

参考资料：[Amplify Polypad](https://polypad.amplify.com/)、[SolveMe Mobiles](https://solveme.edc.org/mobiles/)、[Desmos Classroom](https://teacher.desmos.com/)、[Brilliant](https://brilliant.org/)、[Math Playground](https://www.mathplayground.com/)、[GeoGebra](https://www.geogebra.org/math)、[Visual Patterns](https://www.visualpatterns.org/)、[MacTutor 数学史](https://mathshistory.st-andrews.ac.uk/)。每道问题的具体出处在游乐场的「爸爸的观察笔记和资料」里。图形、讲解与实现均为本站独立编写。

## 本地运行

需要 Node.js 22+。页面用 React + TypeScript + Vite，实验本身是原生 JavaScript 和 SVG。

```powershell
npm install
npm run dev
```

访问 <http://127.0.0.1:8010/>。

```powershell
npm run check   # 仓库规则
npm test        # 代数与数据测试
npm run build   # 打包到 dist/
npm run smoke   # 无头浏览器巡检全部页面
```

部署时发布 `dist/` 目录即可。修改对话文字后，在安装了 `edge-tts` 的 Python 环境中运行 `npm run voice` 更新语音。
