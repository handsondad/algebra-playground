// 全站「小念和爸爸」的对话：展馆导览、展馆里的追问，以及大师故事 + 家庭小实验。

export const hallChats = {
  mobiles: ['爸爸，不知道每个挂件多重，真的能猜出来吗？', '能！横杆平了，就说明两边一样重。一样的东西两边一起拿掉，剩下的就是线索。这其实就是解方程，只是还没写 x。'],
  balance: ['天平和方程有什么关系呀？', '等号就像天平的支点：两边一样重它才平。两边同时加、同时减、同时平分，天平一直平，最后一边只剩一个 x，答案就出来了。'],
  tiles: ['乘法怎么能拼出来？', '长方形的面积就是长乘宽。用大方块当 x²、长条当 x、小方块当 1，(x + 2)(x + 3) 就能实实在在拼出来，倒过来拼还能做因式分解。'],
  machines: ['规律机器里到底藏着什么？', '藏着一条规则。多喂几个数、多搭几个图案，看看每次多了多少。规律找到了，就能把它写成一个式子，算第 100 个也不用一个个数。'],
  lines: ['直线也能玩闯关吗？', '当然！y = mx + b 里只有两个旋钮：b 决定直线从 y 轴哪里出发，m 决定它有多陡。调准了，一道激光就能穿过所有目标。'],
  curves: ['弯弯的曲线也能用式子管住吗？', '能。抛物线 y = a(x − h)² + k 有三个旋钮：h 左右挪，k 上下挪，a 管开口朝向和胖瘦。同一个函数，还能写成式子、画成图、列成表。'],
};

export const algebraWiki = [
  {
    id: 'diophantus', hall: 'mobiles', emoji: '📜', era: '约公元 250 年 · 亚历山大', scientist: '丢番图',
    title: '一块会出题的墓碑',
    story: '丢番图写了一本《算术》，是最早用简写符号表示未知数的人之一。传说他的墓碑上刻着一道题：他一生的六分之一是童年，又过了十二分之一长出胡子，再过七分之一结婚，五年后有了儿子，儿子只活到父亲寿命的一半，儿子去世四年后他也去世了。把这些拼起来，就能算出他活了 84 岁。',
    homeLab: '🏠 在家试试：用衣架、两个夹子和一把相同的硬币做一个挂件。让爸爸在一边藏几枚硬币、用纸包起来，你只看横杆平不平，猜出纸包里有几枚。',
    relatedLabId: 'mobile-puzzle', relatedLabTitle: '平衡挂件谜题',
    source: ['MacTutor · Diophantus', 'https://mathshistory.st-andrews.ac.uk/Biographies/Diophantus/'],
  },
  {
    id: 'viete', hall: 'mobiles', emoji: '🔤', era: '1591 年 · 法国', scientist: '韦达',
    title: '用字母代替数',
    story: '韦达是一位律师，也是国王的密码破译员。他想到一个好主意：用字母代表还不知道的数，也用字母代表已知的数。这样一道题就能写成一条对所有数都成立的式子，代数从此有了自己的语言。',
    homeLab: '🏠 在家试试：给家人表演读心魔术：想一个数，乘 2，加 10，除以 2，再减去想的数。答案总是 5。再用一个口袋代替那个数，画给他们看为什么。',
    relatedLabId: 'number-trick', relatedLabTitle: '读心数字魔术',
    source: ['MacTutor · Viète', 'https://mathshistory.st-andrews.ac.uk/Biographies/Viete/'],
  },
  {
    id: 'recorde', hall: 'balance', emoji: '🟰', era: '1557 年 · 威尔士', scientist: '雷科德',
    title: '等号是怎么来的',
    story: '在雷科德之前，人们写方程要一遍遍写「等于」这个词。雷科德在《砺智石》里画了两条一样长的平行线，说没有什么东西比它们更相等了。这就是我们今天用的等号。等号两边就像天平的两个托盘，永远一样重。',
    homeLab: '🏠 在家试试：用衣架和两个塑料袋做一个天平。两边放上同样多的积木，再同时各拿走 2 块、各放进 1 块，看看它会不会歪。',
    relatedLabId: 'balance-scale', relatedLabTitle: '天平上的方程',
    source: ['MacTutor · Recorde', 'https://mathshistory.st-andrews.ac.uk/Biographies/Recorde/'],
  },
  {
    id: 'khwarizmi', hall: 'tiles', emoji: '📐', era: '约公元 820 年 · 巴格达', scientist: '花拉子米',
    title: '「代数」这个词的来历',
    story: '花拉子米在巴格达的智慧宫写了一本书，书名里的「al-jabr」意思是「还原」，后来就变成了英文的 algebra，也就是代数。他解 x² + 10x = 39 时没有用公式，而是画一个正方形，把 10 条 x 分到两边，再补上一个 5 × 5 的角。',
    homeLab: '🏠 在家试试：用彩纸剪一个大正方形当 x²，剪几条一样长的长条当 x，再剪几个小方块当 1。把长条分到正方形两边，看看缺的那个角要几个小方块才能补齐。',
    relatedLabId: 'complete-square', relatedLabTitle: '花拉子米的补角',
    source: ['MacTutor · Al-Khwarizmi', 'https://mathshistory.st-andrews.ac.uk/Biographies/Al-Khwarizmi/'],
  },
  {
    id: 'gauss', hall: 'machines', emoji: '🧮', era: '约 1786 年 · 德国', scientist: '高斯',
    title: '一眨眼加到 100',
    story: '传说高斯上小学时，老师让全班把 1 到 100 加起来，想让大家安静一会儿。小高斯很快就交了卷：1 加 100 是 101，2 加 99 也是 101，一共有 50 对，答案是 5050。他没有一个个加，而是先找到了规律。',
    homeLab: '🏠 在家试试：用积木搭一座 6 级楼梯，再搭一座一样的，倒过来拼上去。数一数拼成的长方形有几行几列，一座楼梯是不是正好一半？',
    relatedLabId: 'gauss-staircase', relatedLabTitle: '高斯的楼梯',
    source: ['MacTutor · Gauss', 'https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/'],
  },
  {
    id: 'descartes', hall: 'lines', emoji: '🪰', era: '1637 年 · 法国', scientist: '笛卡尔',
    title: '天花板上的苍蝇',
    story: '传说笛卡尔躺在床上，看见一只苍蝇在天花板上爬。他想：只要说出苍蝇离两面墙各有多远，就能准确说出它在哪里。这就是坐标。有了坐标，一个方程就能画成一条线，一条线也能写成一个方程。',
    homeLab: '🏠 在家试试：在地板砖上用胶带贴出两条垂直的线当 x 轴和 y 轴。让爸爸说一个坐标，比如 (3, 2)，你跳到那块地砖上。',
    relatedLabId: 'laser-rescue', relatedLabTitle: '激光救援外星人',
    source: ['MacTutor · Descartes', 'https://mathshistory.st-andrews.ac.uk/Biographies/Descartes/'],
  },
  {
    id: 'galileo', hall: 'curves', emoji: '⚾', era: '1638 年 · 意大利', scientist: '伽利略',
    title: '扔出去的球走的是抛物线',
    story: '伽利略让小球从斜坡滚下、再飞出桌面，仔细量它落地的位置。他发现：往前飞的距离均匀增加，往下落的距离却按 1、4、9、16 这样增加。往前和往下合在一起，正好是一条抛物线。',
    homeLab: '🏠 在家试试：在阳台或院子里，用水管或喷壶斜着往上喷水，看看水流画出的弯线。把喷口抬高或压低，它的顶点会怎么挪？',
    relatedLabId: 'marble-slides', relatedLabTitle: '弹珠滑梯',
    source: ['MacTutor · Galileo', 'https://mathshistory.st-andrews.ac.uk/Biographies/Galileo/'],
  },
];

export const algebraTalks = [
  {
    emoji: '🔣', hall: 'mobiles',
    title: '为什么要用 x 这样的字母？直接写数不行吗？',
    turns: [
      { nian: '爸爸，为什么数学书里老有 x？写数字不是更清楚吗？', dad: '有时候我们还不知道那个数是几，就先给它起个名字，叫 x。就像挂件谜题里的圆球，先不管它多重，照样能把关系写下来。' },
      { nian: '那读心魔术里的口袋，也是 x 吗？', dad: '对！口袋里装几都行，用 x 写出来，就能一次证明对所有的数都成立，不用一个个试。' },
    ],
    wrap: '原来 x 就是一个装着秘密数字的口袋！',
  },
  {
    emoji: '⚖️', hall: 'balance',
    title: '解方程时，为什么「移项要变号」？',
    turns: [
      { nian: '老师说把 −3 移到等号另一边要变成 +3，为什么呀？', dad: '其实不是「移」过去的，是两边同时放了 3 个砝码。左边 3 个气球被抵消了，右边就多了 3。' },
      { nian: '那乘除也一样吗？', dad: '一样，两边同时平分成几份，天平还是平的。只要两边一起做，等式就不会被破坏。' },
    ],
    wrap: '移项变号，原来就是天平两边同时加一样的砝码！',
  },
  {
    emoji: '🟦', hall: 'tiles',
    title: '(a + b)² 为什么不等于 a² + b²？',
    turns: [
      { nian: '(x + 3)² 不就是 x² + 9 吗？', dad: '拼一拼就知道了：边长是 x + 3 的正方形，除了一块 x² 和 9 个小方块，还有两条 3 × x 的长条！' },
      { nian: '所以多出来的是 6x？', dad: '对，(x + 3)² = x² + 6x + 9。漏掉那两条长条，正方形就拼不满了。' },
    ],
    wrap: '拼瓷砖的时候，中间那两条长条可不能忘！',
  },
  {
    emoji: '🔍', hall: 'machines',
    title: '找到规律以后，怎么确定它一直对？',
    turns: [
      { nian: '我数了前三个图案，就能说规律是 1 + 3n 吗？', dad: '光数几个只能算猜。要看图说清楚为什么：每加一个正方形，只多出上、下、右三根火柴，左边那根是和前一个共用的。' },
      { nian: '说清楚为什么，就对所有的 n 都成立了？', dad: '对！每一步都一样地多 3 根，所以第 100 个、第 1000 个都逃不掉这个规律。' },
    ],
    wrap: '规律不光要数出来，还要看出它为什么一直对！',
  },
  {
    emoji: '📏', hall: 'lines',
    title: '斜率是负数，是什么意思？',
    turns: [
      { nian: '斜率 −1 的直线，往哪边斜？', dad: '从左往右走，斜率是正数就上坡，是负数就下坡。−1 就是往右走一格，往下降一格。' },
      { nian: '斜率是 0 呢？', dad: '不升也不降，就是一条平平的水平线。不管 x 是几，y 都一样。' },
    ],
    wrap: '斜率就是从左往右走时，路是上坡、下坡还是平路！',
  },
  {
    emoji: '🎢', hall: 'curves',
    title: '为什么 a 是负数，抛物线就倒过来了？',
    turns: [
      { nian: '(x − h)² 总是大于等于 0 的吧？', dad: '对，一个数的平方不会是负数，所以 a 是正数时，图像最低点就是顶点，开口朝上。' },
      { nian: '那乘上一个负数，就全都翻过来啦！', dad: '没错，所有的值都变成负的，顶点变成了最高点，开口就朝下，像拱桥一样。' },
    ],
    wrap: 'a 的正负，决定抛物线是山谷还是拱桥！',
  },
];
