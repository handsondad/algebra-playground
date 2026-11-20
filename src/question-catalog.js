/** 问题卡片：小念遇到的事 → 她问出来的问题；还有难度、展馆钩子、首页精选 */
export const questionTitles = {
  'mobile-puzzle': '不知道每个挂件多重，怎么让它平衡？',
  'number-trick': '不管想几，爸爸怎么都猜到是 3？',
  'balance-scale': '天平上的 x 盒子里装着几？',
  'balloon-scale': '气球往上拉，减号怎么去掉？',
  'chicken-rabbit': '只知道几个头和几只脚，怎么猜出几只兔？',
  'lever-balance': '轻巧的小念，怎么在跷跷板上撬动重重的爸爸？',

  'tile-multiply': '(x + 2)(x + 3) 能拼成什么样？',
  'tile-factor': '一堆瓷砖能拼成一个长方形吗？',
  'diff-squares': '大正方形挖掉一个角，剪一刀怎么变长方形？',
  'complete-square': '缺一个角的正方形，怎么帮我解方程？',
  'yanghui-triangle': '数字金字塔里，为什么藏着 (a + b)ⁿ 的所有秘密？',

  'number-line-ineq': '不等式两边同乘 −1，不等号为什么要掉头？',
  'half-plane-radar': '两盏直线探照灯，怎么刚好围住所有宝石？',
  'pocket-budget': '零花钱和书包都有限，怎么买赠品最多？',

  'matchstick-pattern': '拼 100 个正方形要几根火柴？',
  'odd-squares': '从 1 开始连续加奇数，为什么每次都拼成正方形？',
  'gauss-staircase': '1 加到 100，怎么一眨眼算出来？',
  'fibonacci-spiral': '兔子数列的正方形，为什么越拼越像海螺和黄金比？',
  'halving-square': '1/2 + 1/4 + 1/8……无穷切下去加起来是多少？',

  'proportion-mix': '柠檬放大成派对大水壶，倒几杯水味道才不变？',
  'function-machine': '不打开机器，能猜出它的规则吗？',
  'laser-rescue': '一道激光，怎么救下所有外星人？',
  'two-lines': '哪一周我和表姐存的钱一样多？',
  'marble-slides': '怎么让弹珠一路吃掉所有星星？',
  'card-sort': '式子、图像、表格，哪三张是一家？',

  'wheat-chessboard': '棋盘上每格麦粒翻一倍，走到后面有多吓人？',
  'exploding-dots': '满 2 颗就爆炸的圆点盒，怎么变出二进制和多项式？',
  'bouncing-decay': '每次弹起一半高的小球，跳几次会低于 1 米？',
};

export const questionTriggers = {
  'mobile-puzzle': '小念在玩具店看到一串会转的挂件，每个形状都不一样，可横杆一直平平的',
  'number-trick': '爸爸让小念心里想一个数，算了几步之后，爸爸一下就说出了答案',
  'balance-scale': '菜市场的阿姨用天平称菜，小念想：要是把不知道多重的东西放上去呢',
  'balloon-scale': '小念把一个氢气球系在天平上，天平那一边竟然翘起来了',
  'chicken-rabbit': '爷爷院子的竹笼里关着小鸡和小兔，小念趴在地上数出了 22 只脚',
  'lever-balance': '公园里的跷跷板上，爸爸往中间挪了挪，小念坐在最外头居然把爸爸翘起来了',

  'tile-multiply': '小念家要铺一块长方形地毯，长和宽都比 x 多一点',
  'tile-factor': '小念手里有一堆大大小小的方块，想把它们拼成一整块长方形',
  'diff-squares': '手工课的正方形彩纸被剪掉了一个小正方形角，小念想算剩下的面积',
  'complete-square': '爸爸讲了一个一千年前巴格达的故事：有个人用画图解方程',
  'yanghui-triangle': '小念在古书插图里看见一座三角形数字塔，每个数都是头顶两个数加起来的',

  'number-line-ineq': '游乐园过山车写着「身高满 120 厘米可坐」，小念发现答案不止一个数',
  'half-plane-radar': '寻宝游戏里既要圈进全部黄宝石，又不能碰到一颗黑地雷',
  'pocket-budget': '文具店搞活动送贴纸，小念捏着 18 元零花钱算怎样买最划算',

  'matchstick-pattern': '小念用火柴棒拼了一排正方形，越拼越长',
  'odd-squares': '小念往 1 颗棋子外头一圈圈摆 3 颗、5 颗、7 颗，每次都摆成方方正正的棋盘',
  'gauss-staircase': '老师让全班把 1 到 100 加起来，有个小朋友马上就交卷了',
  'fibonacci-spiral': '小念画了两个边长 1 的小方格，每次拿前两个边长相加画新方格，越转越大',
  'halving-square': '一块方形蛋糕每次只切剩下的一半，小念好奇：切一万次会把蛋糕切超吗',

  'proportion-mix': '爸爸调了一杯超好喝的柠檬水，小念想给全家人调一大壶一模一样味道的',
  'function-machine': '游乐场有一台机器，投进一个数，就吐出另一个数',
  'laser-rescue': '小念在玩打外星人的游戏，激光只能打出一条直线',
  'two-lines': '小念和表姐比赛存零花钱，可两人开始的钱和每周存的钱都不一样',
  'marble-slides': '小念想造一条弹珠滑梯，让弹珠沿路吃到所有星星',
  'card-sort': '小念的卡片掉了一地：有式子、有图像、有表格，全混在一起',

  'wheat-chessboard': '故事里有人向国王讨赏麦子：第 1 格 1 颗，后面每格翻倍，国王还以为很少',
  'exploding-dots': '爸爸在纸上画了一排方格，说「满两颗圆点就砰地合体进位」，一眨眼算出了二进制',
  'bouncing-decay': '小念把篮球从看台上松手放下，看着它一下比一下跳得矮',
};

const difficulty = {
  'mobile-puzzle': 1, 'balance-scale': 1, 'balloon-scale': 2, 'chicken-rabbit': 2, 'lever-balance': 3,
  'number-trick': 1, 'tile-multiply': 1, 'tile-factor': 2, 'diff-squares': 2, 'complete-square': 3, 'yanghui-triangle': 3,
  'number-line-ineq': 1, 'half-plane-radar': 2, 'pocket-budget': 3,
  'matchstick-pattern': 1, 'odd-squares': 1, 'gauss-staircase': 2, 'fibonacci-spiral': 2, 'halving-square': 3,
  'proportion-mix': 1, 'function-machine': 2, 'laser-rescue': 2, 'two-lines': 2, 'marble-slides': 3, 'card-sort': 3,
  'wheat-chessboard': 1, 'exploding-dots': 2, 'bouncing-decay': 3,
};

export const difficultyLabel = { 1: '入门', 2: '进阶', 3: '挑战' };
export const difficultyHint = { 1: '一看就懂的小问题', 2: '要多想一步：两边怎么一起变？', 3: '藏得更深的问题，大人也要想一想' };
export const questionDifficulty = lesson => difficulty[lesson.id] ?? 2;
export const questionTitle = lesson => questionTitles[lesson.id] ?? lesson.name;
export const questionTrigger = lesson => questionTriggers[lesson.id] ?? lesson.intro;

/** 小念眼里每座展馆在问什么：首页卡片上的一句话 */
export const hallHooks = {
  equations: '天平怎么解方程？鸡兔同笼吹哨子抬脚是什么妙招？轻的小念怎么撬动爸爸？',
  expressions: '乘法能拼成面积吗？挖掉一角怎么秒算平方差？杨辉三角里藏着什么？',
  inequalities: '不等式乘负数为什么要掉头？两道探照灯怎么围住宝藏？零花钱怎么花最值？',
  patterns: '连续奇数为什么总拼成正方形？兔子数列怎么画出黄金螺线？无穷切半加起来是几？',
  functions: '柠檬水怎么放大味道不变？一道激光怎么救外星人？弹珠怎么顺着抛物线吃星星？',
  exponents: '棋盘麦粒翻倍有多吓人？满 2 就爆炸的圆点盒怎么把数字变成多项式？',
};

/** 首页精选：六座展馆每馆一张代表作 */
export const homeShowcase = [
  { id: 'balance', hall: 'equations', play: ['balance-scale', '🧪 让天平保持平'], name: '天平解方程', en: 'BALANCE SCALE',
    source: ['Amplify Polypad', 'https://polypad.amplify.com/'],
    hook: '两边同时拿走一样的东西，天平还是平的。一步一步，让一边只剩一个 x，另一边就是答案。' },
  { id: 'tiles', hall: 'expressions', play: ['complete-square', '🧪 补上那个角'], name: '花拉子米的补角', en: 'COMPLETING THE SQUARE',
    source: ['MacTutor · Al-Khwarizmi', 'https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/'],
    hook: '「代数」这个词就来自他的书名。x² + 10x = 39，把 10 条 x 分到两边，补上一个 5 × 5 的角，答案 3 就出来了。' },
  { id: 'radar', hall: 'inequalities', play: ['half-plane-radar', '🧪 打开探照灯'], name: '探照灯围宝藏', en: 'SYSTEMS OF INEQUALITIES',
    source: ['OpenStax · Linear Inequalities', 'https://openstax.org/books/elementary-algebra-2e/pages/5-6-graphing-systems-of-linear-inequalities'],
    hook: '方程画一条线，不等式照亮半个平面。调准两盏直线探照灯的重叠区，把宝石稳稳圈进来、把地雷挡在外面。' },
  { id: 'fibonacci', hall: 'patterns', play: ['fibonacci-spiral', '🧪 拼黄金长方形'], name: '兔子与黄金螺线', en: 'FIBONACCI SPIRAL',
    source: ['Mathigon · Fibonacci Numbers', 'https://mathigon.org/course/sequences/fibonacci'],
    hook: '1, 1, 2, 3, 5, 8, 13, 21……每个正方形边长都是前两个相加，严丝合缝旋出黄金长方形，长宽比直奔 1.618。' },
  { id: 'marbles', hall: 'functions', play: ['marble-slides', '🧪 放一颗弹珠'], name: '弹珠滑梯', en: 'MARBLESLIDES',
    source: ['Desmos · Marbleslides', 'https://teacher.desmos.com/marbleslides-parabolas'],
    hook: '弹珠沿着抛物线往下滚。h 把顶点左右挪，k 把顶点上下挪，a 让开口翻过来。吃到所有星星就过关！' },
  { id: 'dots', hall: 'exponents', play: ['exploding-dots', '🧪 引爆圆点盒'], name: '爆炸圆点进制机', en: 'EXPLODING DOTS',
    source: ['Global Math Project', 'https://globalmathproject.org/exploding-dots/'],
    hook: '格子里每攒够 2 颗圆点就「砰」地进位成左边 1 颗：13 炸成 1101，把 2 换成 x 就是 x³ + x² + 1！' },
];

export const challengeHint = '先别急着选，再动一动画板，或者点「摆出画面」看看！';
export const challengeCheer = lesson => `太棒啦！我搞懂「${lesson.name}」的秘密啦！`;
