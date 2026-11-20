/** 问题卡片：小念遇到的事 → 她问出来的问题；还有难度、展馆钩子、首页精选 */
export const questionTitles = {
  'mobile-puzzle': '不知道每个挂件多重，怎么让它平衡？',
  'number-trick': '不管想几，爸爸怎么都猜到是 3？',
  'balance-scale': '天平上的 x 盒子里装着几？',
  'balloon-scale': '气球往上拉，减号怎么去掉？',
  'tile-multiply': '(x + 2)(x + 3) 能拼成什么样？',
  'tile-factor': '一堆瓷砖能拼成一个长方形吗？',
  'complete-square': '缺一个角的正方形，怎么帮我解方程？',
  'function-machine': '不打开机器，能猜出它的规则吗？',
  'matchstick-pattern': '拼 100 个正方形要几根火柴？',
  'gauss-staircase': '1 加到 100，怎么一眨眼算出来？',
  'laser-rescue': '一道激光，怎么救下所有外星人？',
  'two-lines': '哪一周我和表姐存的钱一样多？',
  'marble-slides': '怎么让弹珠一路吃掉所有星星？',
  'card-sort': '式子、图像、表格，哪三张是一家？',
};

export const questionTriggers = {
  'mobile-puzzle': '小念在玩具店看到一串会转的挂件，每个形状都不一样，可横杆一直平平的',
  'number-trick': '爸爸让小念心里想一个数，算了几步之后，爸爸一下就说出了答案',
  'balance-scale': '菜市场的阿姨用天平称菜，小念想：要是把不知道多重的东西放上去呢',
  'balloon-scale': '小念把一个氢气球系在天平上，天平那一边竟然翘起来了',
  'tile-multiply': '小念家要铺一块长方形地毯，长和宽都比 x 多一点',
  'tile-factor': '小念手里有一堆大大小小的方块，想把它们拼成一整块长方形',
  'complete-square': '爸爸讲了一个一千年前巴格达的故事：有个人用画图解方程',
  'function-machine': '游乐场有一台机器，投进一个数，就吐出另一个数',
  'matchstick-pattern': '小念用火柴棒拼了一排正方形，越拼越长',
  'gauss-staircase': '老师让全班把 1 到 100 加起来，有个小朋友马上就交卷了',
  'laser-rescue': '小念在玩打外星人的游戏，激光只能打出一条直线',
  'two-lines': '小念和表姐比赛存零花钱，可两人开始的钱和每周存的钱都不一样',
  'marble-slides': '小念想造一条弹珠滑梯，让弹珠沿路吃到所有星星',
  'card-sort': '小念的卡片掉了一地：有式子、有图像、有表格，全混在一起',
};

const difficulty = {
  'mobile-puzzle': 1, 'number-trick': 1, 'balance-scale': 1, 'balloon-scale': 2,
  'tile-multiply': 1, 'tile-factor': 2, 'complete-square': 3,
  'function-machine': 2, 'matchstick-pattern': 1, 'gauss-staircase': 2,
  'laser-rescue': 2, 'two-lines': 2, 'marble-slides': 3, 'card-sort': 3,
};

export const difficultyLabel = { 1: '入门', 2: '进阶', 3: '挑战' };
export const difficultyHint = { 1: '一看就懂的小问题', 2: '要多想一步：两边怎么一起变？', 3: '藏得更深的问题，大人也要想一想' };
export const questionDifficulty = lesson => difficulty[lesson.id] ?? 2;
export const questionTitle = lesson => questionTitles[lesson.id] ?? lesson.name;
export const questionTrigger = lesson => questionTriggers[lesson.id] ?? lesson.intro;

/** 小念眼里每座展馆在问什么：首页卡片上的一句话 */
export const hallHooks = {
  mobiles: '不知道多重也能猜出来吗？爸爸怎么猜到我心里的数？',
  balance: '天平怎么帮我解方程？气球为什么能当负数？',
  tiles: '乘法能拼成面积吗？一千年前的人怎么画图解方程？',
  machines: '机器肚子里藏着什么规则？1 加到 100 怎么一眨眼算完？',
  lines: '一道激光怎么穿过所有外星人？两条线在哪里相遇？',
  curves: '弹珠怎么滚过所有星星？式子、图像、表格怎么认亲？',
};

/** 首页精选：每座展馆至少一项 */
export const homeShowcase = [
  { id: 'mobiles', hall: 'mobiles', play: ['mobile-puzzle', '🧪 来解一个挂件'], name: '平衡挂件', en: 'SOLVEME MOBILES',
    source: ['SolveMe Mobiles', 'https://solveme.edc.org/mobiles/'],
    hook: '没有 x，只有圆球、方块和三角。横杆平了，两边就一样重；一样的挂件两边一起拿掉，答案就露出来了。' },
  { id: 'balance', hall: 'balance', play: ['balance-scale', '🧪 让天平保持平'], name: '天平解方程', en: 'BALANCE SCALE',
    source: ['Amplify Polypad', 'https://polypad.amplify.com/'],
    hook: '两边同时拿走一样的东西，天平还是平的。一步一步，让一边只剩一个 x，另一边就是答案。' },
  { id: 'tiles', hall: 'tiles', play: ['complete-square', '🧪 补上那个角'], name: '花拉子米的补角', en: 'COMPLETING THE SQUARE',
    source: ['MacTutor · Al-Khwarizmi', 'https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/'],
    hook: '「代数」这个词就来自他的书名。x² + 10x = 39，把 10 条 x 分到两边，补上一个 5 × 5 的角，答案 3 就出来了。' },
  { id: 'gauss', hall: 'machines', play: ['gauss-staircase', '🧪 拼两座楼梯'], name: '高斯的楼梯', en: "GAUSS'S STAIRCASE",
    source: ['MacTutor · Gauss', 'https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/'],
    hook: '一座楼梯不好数，两座倒过来拼成长方形就好数了：1 + 2 + … + 100 = 100 × 101 ÷ 2 = 5050。' },
  { id: 'zogs', hall: 'lines', play: ['laser-rescue', '🧪 发射激光'], name: '激光救援', en: 'SAVE THE ZOGS',
    source: ['Math Playground · Save the Zogs', 'https://www.mathplayground.com/save_the_zogs.html'],
    hook: '截距决定激光从哪里出发，斜率决定它有多陡。调准 y = mx + b，一道光穿过所有外星人。' },
  { id: 'marbles', hall: 'curves', play: ['marble-slides', '🧪 放一颗弹珠'], name: '弹珠滑梯', en: 'MARBLESLIDES',
    source: ['Desmos · Marbleslides', 'https://teacher.desmos.com/marbleslides-parabolas'],
    hook: '弹珠沿着抛物线往下滚。h 把顶点左右挪，k 把顶点上下挪，a 让开口翻过来。吃到所有星星就过关！' },
];

export const challengeHint = '先别急着选，再动一动画板，或者点「摆出画面」看看！';
export const challengeCheer = lesson => `太棒啦！我搞懂「${lesson.name}」的秘密啦！`;
