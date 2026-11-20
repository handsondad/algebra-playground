# 代数游乐场

一座中文互动代数游乐场，是 [geometry-playground](../geometry-playground) 的姊妹项目：同样由小念和爸爸一问一答，同样每道问题配一页动画问答和一块能动手的游乐场。所有实验都在浏览器里运行，不需要账号、后端或外部资源，语音也已离线保存。

和几何游乐场一样，展馆按学科内容划分：

| 展馆 | 可以动手做什么 |
| --- | --- |
| ⚖️ 等式与方程 | 平衡挂件猜形状重量（SolveMe Mobiles）；天平两边同拿同放同平分解 3x + 2 = x + 8；红气球当负数解移项；鸡兔同笼吹哨子抬起两只脚看消元法；阿基米德跷跷板试出力矩平衡 w₁d₁ = w₂d₂ |
| 🟪 代数式与运算 | 口袋与弹珠看穿读心数字魔术；代数瓷砖拼 (x + a)(x + b) 与因式分解；缺角正方形剪一刀拼出平方差 (a + b)(a − b)；跟花拉子米补角配方；点亮杨辉三角里的 (a + b)ⁿ 展开系数 |
| 🎯 不等式与规划 | 数轴射灯看清为什么同乘 −1 必须翻转不等号；调两道直线探照灯的半平面重叠区围住宝石、避开地雷；在多边形可行域的顶点上找到零花钱采购最优解 |
| 🔢 数列与规律 | 火柴棒长图案写通项 1 + 3n；奇数拐尺一层层包出 n² 正方形；两座高斯楼梯拼长方形求和；兔子数列正方形旋出黄金螺线；切半正方形直观验证 1/2 + 1/4 + 1/8 + … = 1 |
| 📈 函数与图像 | 柠檬水配比实验室调出过原点的正比例直线 y = kx；函数黑盒喂数字猜规则；激光救外星人调斜率与截距；存钱比赛看交点；弹珠滑梯调抛物线顶点式；式子、图像、表格卡片配对 |
| 🚀 乘方、指数与进制 | 棋盘麦粒对比 2n、n² 与 2ⁿ⁻¹ 的指数爆炸；在「1 ← b」爆炸圆点机里亲手炸出二进制和 x 的多项式（Global Math Project）；观察弹跳小球的指数衰减曲线 |

首页先是一组代数明星轮播，六座展馆每馆一张，画面就是真实的实验画板。往下可以搜索问题、随便问一题，或从六座展馆进入。展馆里的问题按入门、进阶、挑战分组，全站共 28 个动画问答与对应游乐场、17 篇数学家故事与家庭小实验、12 组睡前聊天。

每道问题有一页问答：左边是小念和爸爸的对话，右边是代数动画。每轮对话是一幕，可以连播，也可以单独看某一幕；关掉声音仍有动画和字幕。想亲手操作就点「换我动手」进入游乐场，用「摆出画面」一键还原对话里的三个场景，答对小挑战即可点亮。进度和声音开关只保存在当前浏览器。

参考资料：[Amplify Polypad](https://polypad.amplify.com/)、[Mathigon](https://mathigon.org/)、[PhET Interactive Simulations](https://phet.colorado.edu/)、[Global Math Project · Exploding Dots](https://globalmathproject.org/exploding-dots/)、[SolveMe Mobiles](https://solveme.edc.org/mobiles/)、[Desmos Classroom](https://teacher.desmos.com/)、[Math Playground](https://www.mathplayground.com/)、[GeoGebra](https://www.geogebra.org/math)、[Visual Patterns](https://www.visualpatterns.org/)、[OpenStax](https://openstax.org/)、[Wolfram MathWorld](https://mathworld.wolfram.com/)、[MacTutor 数学史](https://mathshistory.st-andrews.ac.uk/)。每道问题的具体出处在游乐场的「爸爸的观察笔记和资料」里。图形、讲解与实现均为本站独立编写。

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
