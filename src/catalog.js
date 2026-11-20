/**
 * 代数游乐场的全部展馆和实验。三步走：play 玩中学 → explore 动手试 → challenge 闯关测。
 * 每个 lesson 的 id 也是实验模块的 key（见 lab-modes.js）和问答脚本的 key（见 lab-talks.js）。
 */
const polypad = ['Amplify Polypad · 天平与代数瓷砖', 'https://polypad.amplify.com/'];
const solveme = ['SolveMe Mobiles · EDC', 'https://solveme.edc.org/mobiles/'];
const modelAlgebra = ['Math Playground · Model Algebra Equations', 'https://www.mathplayground.com/AlgebraEquations.html'];
const zogs = ['Math Playground · Save the Zogs', 'https://www.mathplayground.com/save_the_zogs.html'];
const marbleLines = ['Desmos · Marbleslides: Lines', 'https://teacher.desmos.com/marbleslides-lines'];
const marbleParabolas = ['Desmos · Marbleslides: Parabolas', 'https://teacher.desmos.com/marbleslides-parabolas'];
const visualPatterns = ['Visual Patterns · Fawn Nguyen', 'https://www.visualpatterns.org/'];
const geogebra = ['GeoGebra · 代数资源', 'https://www.geogebra.org/math'];
const mactutor = name => `https://mathshistory.st-andrews.ac.uk/Biographies/${name}/`;

export const halls = [
  { id: 'mobiles', name: '挂件谜题', stage: 'play', summary: '不写 x，只看挂件平不平：形状就是未知数。', lessons: [
    { id: 'mobile-puzzle', name: '平衡挂件谜题', tag: '未知数 · 等量代换',
      intro: '天花板下挂着一串挂件，每种形状有一个秘密重量。只要每根横杆都平，总重又对得上，就猜中了。',
      idea: '横杆平了，就说明左右一样重：这就是一个等式。两边相同的形状可以一起拿掉，剩下的就是答案的线索。',
      question: '横杆左边挂「六边形 + 圆球」，右边挂「六边形 + 4」，而且是平的。圆球有多重？',
      choices: ['和六边形一样重', '4，因为两边的六边形抵消了', '没法知道，信息不够'], answer: 1, sources: [solveme] },
    { id: 'number-trick', name: '读心数字魔术', tag: '代数式 · 化简',
      intro: '想一个数，乘 2，加 6，除以 2，再减去你想的数。不管你想几，最后都是 3。爸爸怎么猜到的？',
      idea: '把想的数装进一个口袋。乘 2 是两个口袋，加 6 是 6 颗弹珠，除以 2 剩一个口袋和 3 颗弹珠，减掉口袋只剩 3 颗。口袋里装几都没关系。',
      question: '为什么不管想哪个数，结果都是 3？',
      choices: ['因为大家想的数都差不多', '因为最后口袋被拿走了，只剩下和口袋无关的 3 颗弹珠', '因为 6 除以 2 正好等于 3，和步骤无关'], answer: 1, sources: [polypad] },
  ] },
  { id: 'balance', name: '天平解方程', stage: 'play', summary: '天平两边同时加、同时减、同时平分，它就一直平：这就是解方程。', lessons: [
    { id: 'balance-scale', name: '天平上的方程', tag: '一元一次方程',
      intro: '天平上放着几个装了秘密数字的 x 盒子和一些砝码。怎么拿，才能让一边只剩一个 x？',
      idea: '天平平着，说明两边相等。两边同时拿走一样的东西，天平还是平的。先把 x 拿到一边，再把砝码拿到另一边，最后平分。',
      question: '左边 3 个 x 加 2 个砝码，右边 1 个 x 加 8 个砝码。第一步两边都拿走 1 个 x，剩下什么？',
      choices: ['2x + 2 = 8', '3x + 1 = 8', '2x = 10'], answer: 0, sources: [modelAlgebra, polypad] },
    { id: 'balloon-scale', name: '气球和负数', tag: '负数 · 移项',
      intro: '气球会往上拉，正好抵消一个砝码。天平上出现「x 减 3」，怎么把气球去掉？',
      idea: '一个气球加一个砝码，合起来就是 0。两边各放上同样多的砝码，把气球抵消掉，天平依旧平衡。这就是「移项要变号」的来历。',
      question: '左边是 x 和 3 个气球（x − 3），右边是 5 个砝码。两边各放 3 个砝码后，x 是多少？',
      choices: ['2', '8', '15'], answer: 1, sources: [polypad] },
  ] },
  { id: 'tiles', name: '代数瓷砖', stage: 'explore', summary: '把乘法变成拼面积：x² 是大方块，x 是长条，1 是小方块。', lessons: [
    { id: 'tile-multiply', name: '拼出 (x + a)(x + b)', tag: '多项式乘法',
      intro: '一个长方形，长是 x + 2，宽是 x + 3。用瓷砖把它拼满，一共要哪几种、各几块？',
      idea: '长方形的面积 = 长 × 宽，也等于里面所有瓷砖加起来。1 块 x²，a + b 条 x，a × b 个小方块。换一个 x 的长度，块数不变。',
      question: '(x + 2)(x + 3) 拼出来，小方块 1 一共有几个？',
      choices: ['5 个，2 + 3', '6 个，2 × 3', '9 个，3 × 3'], answer: 1, sources: [polypad] },
    { id: 'tile-factor', name: '把瓷砖拼成长方形', tag: '因式分解',
      intro: '给你 1 块 x²、5 条 x、6 个小方块。能不能把它们拼成一个完整的长方形？',
      idea: 'x 条分一部分放右边、一部分放下边，角上就空出一个小长方形。角上要的小方块数正好等于两部分相乘。分得对，就严丝合缝。',
      question: 'x² + 5x + 6：把 5 条 x 分成右边 2 条、下边 3 条，角上需要几个小方块？',
      choices: ['5 个', '6 个，正好用完', '7 个'], answer: 1, sources: [polypad, geogebra] },
    { id: 'complete-square', name: '花拉子米的补角', tag: '配方法',
      intro: '一千多年前，花拉子米要解「x² + 10x = 39」。他没用公式，而是把它画成一个缺了角的正方形。',
      idea: '把 10 条 x 平分到正方形的两边，各 5 条，角上缺 5 × 5 = 25。两边都补上 25，就拼成 (x + 5)² = 64，所以 x + 5 = 8，x = 3。',
      question: 'x² + 10x 拼成大正方形，角上要补几块小方块？',
      choices: ['10 块', '25 块', '100 块'], answer: 1, sources: [geogebra, ['MacTutor · 花拉子米', mactutor('Al-Khwarizmi')]] },
  ] },
  { id: 'machines', name: '规律机器', stage: 'explore', summary: '喂数字、搭火柴、数楼梯：先看规律，再写成式子。', lessons: [
    { id: 'function-machine', name: '函数黑盒机器', tag: '一次函数 · 规则',
      intro: '一台机器吃进一个数，吐出另一个数。不许打开机器，你能猜出它肚子里的规则吗？',
      idea: '多喂几个相邻的数：x 每多 1，y 就多 a，这就是乘的那个数；放 0 进去吐出的就是加的那个数 b。两组输入输出就能把规则定下来。',
      question: '放 0 吐出 1，放 1 吐出 3，放 2 吐出 5。机器的规则是？',
      choices: ['y = x + 1', 'y = 2x + 1', 'y = 3x'], answer: 1, sources: [polypad] },
    { id: 'matchstick-pattern', name: '火柴棒长图案', tag: '找规律 · 代数式',
      intro: '用火柴棒拼一排正方形：1 个要 4 根，2 个要 7 根，3 个要 10 根。拼 100 个要几根？',
      idea: '先放开头的 1 根，每多一个正方形只要再添 3 根（上、下、右）。第 n 个就是 1 + 3n 根，不用一个个数。',
      question: '一排 n 个正方形要几根火柴？',
      choices: ['4n 根', '1 + 3n 根', '3 + n 根'], answer: 1, sources: [visualPatterns] },
    { id: 'gauss-staircase', name: '高斯的楼梯', tag: '求和 · 公式',
      intro: '传说小高斯一眨眼就算出 1 + 2 + … + 100。用积木搭一座楼梯，看看他用了什么妙招。',
      idea: '再拿一座一样的楼梯倒过来拼上，正好拼成一个 n × (n + 1) 的长方形。一座楼梯是它的一半：n(n + 1) ÷ 2。',
      question: '两座 5 级楼梯拼成的长方形是几乘几？',
      choices: ['5 × 5', '5 × 6', '6 × 6'], answer: 1, sources: [['MacTutor · 高斯', mactutor('Gauss')]] },
  ] },
  { id: 'lines', name: '直线闯关', stage: 'challenge', summary: '调斜率、调截距：一条直线 y = mx + b 救外星人、比存钱。', lessons: [
    { id: 'laser-rescue', name: '激光救援外星人', tag: '斜率 · 截距',
      intro: '外星人被困在坐标格子上。调好激光炮的斜率 m 和截距 b，一道直线激光把它们全部救下！',
      idea: '截距 b 是激光炮装在 y 轴上的位置，斜率 m 是往右走 1 格升高几格。两个点就能决定一条直线，所以先对准两个外星人。',
      question: '激光要穿过 (0, 3) 和 (1, 2)。斜率 m 应该是多少？',
      choices: ['1', '−1', '3'], answer: 1, sources: [zogs] },
    { id: 'two-lines', name: '存钱比赛：两条线的交点', tag: '交点 · 方程组',
      intro: '小念一开始有 10 元，每周存 2 元；表姐有 2 元，每周存 4 元。哪一周两人存得一样多？',
      idea: '每人的钱都是一条直线。两条线相交的那一点，横坐标是第几周，纵坐标是一样多的钱。平行的两条线，永远不会相交。',
      question: '如果表姐也是每周存 2 元，两条线会怎样？',
      choices: ['在第 4 周相交', '平行，永远差 8 元', '重合在一起'], answer: 1, sources: [geogebra] },
  ] },
  { id: 'curves', name: '曲线闯关', stage: 'challenge', summary: '让弹珠顺着函数图像滚下来吃星星，再把式子、图像、表格配成一组。', lessons: [
    { id: 'marble-slides', name: '弹珠滑梯', tag: '抛物线 · 顶点式',
      intro: '弹珠会沿着函数图像滚。调好 a、h、k，让它一路吃掉所有星星，还要绕开砖墙。',
      idea: '顶点式 y = a(x − h)² + k 里，h 让顶点左右挪，k 让顶点上下挪，a 管开口朝向和胖瘦：a 是负数时开口朝下。',
      question: '星星排成一个开口朝下的拱，顶点在 (−2, 4)。a、h、k 怎么选？',
      choices: ['a 为正，h = 2，k = 4', 'a 为负，h = −2，k = 4', 'a 为负，h = 4，k = −2'], answer: 1, sources: [marbleLines, marbleParabolas] },
    { id: 'card-sort', name: '式子图像表格配对', tag: '多种表示',
      intro: '一个函数可以写成式子、画成图像、列成表格。12 张卡片打乱了，你能把同一个函数的三张找到一起吗？',
      idea: '先找最好认的：x = 0 时 y 是几（图像和 y 轴的交点）；再看 x 每多 1，y 变多少（倾斜程度）。弯的图像一定配带 x² 的式子。',
      question: '表格写着 x = 0, 1, 2 时 y = 3, 3, 3。它配哪张图像？',
      choices: ['一条往右上升的直线', '一条水平的直线', '一条开口朝上的抛物线'], answer: 1, sources: [['Desmos · 图形计算器', 'https://www.desmos.com/calculator']] },
  ] },
];
