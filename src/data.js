/* Sample content for the demo. Fictional child, teacher and families. */

const CHILD = { name: 'Ethan', initial: 'E', age: { zh: '4 岁 3 个月', en: '4 yrs 3 mos' } };
const TEACHER = { name: { zh: '王老师', en: 'Ms. Wang' }, initial: '王', role: { zh: '本次记录老师 · 主讲：林老师', en: 'Recording teacher · Lead: Ms. Lin' } };

/* Offline group session: parents attend a talk while 1 lead teacher runs the booklet with 3 kids and 3 recording teachers each follow one child. */
const SESSION = {
  group: '第 2 组', room: '教室 B', time: '10:30–10:55', lead: '林老师',
  talk: { title: '家长讲座：4 岁孩子的数学思维怎么看', place: '多功能厅', time: '10:20–11:10', ends: '11:10' },
  kids: [
    { id: 'ethan', name: 'Ethan W.', initial: 'E', age: '4 岁 3 个月', recorder: '王老师（你）', me: true, c: 'var(--dim-spa)' },
    { id: 'chloe', name: 'Chloe L.', initial: 'C', age: '4 岁 8 个月', recorder: '陈老师', progress: 'Q2 · 已记录 4 条', c: 'var(--dim-mea)' },
    { id: 'lucas', name: 'Lucas Z.', initial: 'L', age: '3 岁 11 个月', recorder: '赵老师', progress: 'Q2 · 已记录 3 条', c: 'var(--dim-cre)' },
  ],
};

const DIMS = [
  { id: 'num', zh: '数感与运算', en: 'Number Sense', short: { zh: '数感', en: 'Number' }, color: 'var(--dim-num)', drdp: 'COG 3、COG 4' },
  { id: 'spa', zh: '空间与图形', en: 'Spatial Sense', short: { zh: '空间', en: 'Spatial' }, color: 'var(--dim-spa)', drdp: 'COG 1、COG 7' },
  { id: 'rea', zh: '规律与推理', en: 'Patterns & Reasoning', short: { zh: '推理', en: 'Reasoning' }, color: 'var(--dim-rea)', drdp: 'COG 6、COG 2' },
  { id: 'mea', zh: '测量与数据', en: 'Measurement & Data', short: { zh: '测量', en: 'Measuring' }, color: 'var(--dim-mea)', drdp: 'COG 5' },
  { id: 'exp', zh: '数学表达', en: 'Math Talk', short: { zh: '表达', en: 'Math Talk' }, color: 'var(--dim-exp)', drdp: 'LLD' },
  { id: 'cre', zh: '创意与动手', en: 'Creativity', short: { zh: '创意', en: 'Creativity' }, color: 'var(--dim-cre)', drdp: 'VPA、PD' },
];

const LEVELS = {
  4: { zh: '拔尖', en: 'Extending', old: 'A+', def: { zh: '独立完成，并能解释或举一反三', en: 'Does it independently and can explain or extend it' } },
  3: { zh: '熟练', en: 'Secure', old: 'A', def: { zh: '独立完成', en: 'Does it independently' } },
  2: { zh: '发展中', en: 'Developing', old: 'B', def: { zh: '在提示或教具帮助下完成', en: 'Does it with a hint or hands-on support' } },
  1: { zh: '萌芽', en: 'Emerging', old: 'C', def: { zh: '愿意尝试，概念还在建立', en: 'Willing to try; the idea is still forming' } },
};

const QLEVELS = {
  3: { zh: '很突出', en: 'A strength' },
  2: { zh: '符合年龄', en: 'On track' },
  1: { zh: '可以多练', en: 'Room to grow' },
};

/* The 11 tasks of the existing paper test, regrouped into scoring items with behavior anchors. */
const TASKS = [
  {
    id: 1, title: '天气统计表', titleEn: 'Weather chart',
    prompt: { en: 'This is the daily weather table. Which weather has the most days?', zh: '这是每天的天气表，哪种天气的天数最多？' },
    materials: '天气统计表卡片',
    items: [{ id: '1', dim: 'mea', label: '读统计表', rubric: {
      4: '直接比较各行长短说出答案，并说明「晴天这一行最长」',
      3: '逐行点数后，正确指出天数最多的天气',
      2: '提示「每一行数一数」后得出',
      1: '能认出天气图标，但还不会比较多少' } }],
    chips: ['逐个点数', '比较长短', '一次完成', '需要提示'],
    sample: { ratings: { '1': 3 }, chips: ['逐个点数', '一次完成'] },
  },
  {
    id: 2, title: '三角形拼火箭', titleEn: 'Rocket from triangles',
    prompt: { en: 'Finish forming a rocket with triangles.', zh: '用三角形把火箭拼完整。' },
    materials: '火箭底图、三角形贴纸 ×4', scene: 'rocket',
    items: [{ id: '2', dim: 'spa', label: '图形组合与旋转', rubric: {
      4: '先在脑中或手里转好方向，一次放对，并能说出「要倒过来」',
      3: '独立拼完，个别位置要转几次试一试',
      2: '老师示范一个后，能完成其余部分',
      1: '能贴贴纸，但方向和位置还对不上' } }],
    chips: ['旋转图形对位', '一次完成', '试错后完成', '需要示范', '主动解释'],
    sample: { ratings: { '2': 4 }, chips: ['旋转图形对位', '一次完成', '主动解释'] },
  },
  {
    id: 3, title: '兔子在哪里', titleEn: 'Where is the rabbit?',
    prompt: { en: 'The triangle is behind the rabbit. Put the sticker and describe where the rabbit is.', zh: '三角形在兔子后面。贴上贴纸，再说说兔子在哪里。' },
    materials: '兔子场景图、三角形贴纸',
    items: [
      { id: '3a', dim: 'spa', label: '放对位置', rubric: {
        4: '迅速放对，还能换个说法（「兔子在三角形前面」）',
        3: '独立放对位置',
        2: '提示「后面是哪边？」后放对',
        1: '位置放错，提示后仍不确定' } },
      { id: '3b', dim: 'exp', label: '说出位置', rubric: {
        4: '用完整句子描述，主动用到「前面 / 后面」等方位词',
        3: '能用方位词说出位置',
        2: '先指着说「在这儿」，提示后能说出方位词',
        1: '说不出位置，只用手指' } },
    ],
    chips: ['用手势代替语言', '需要提示', '完整句子', '中英混用'],
    sample: { ratings: { '3a': 3, '3b': 2 }, chips: ['用手势代替语言', '需要提示'] },
  },
  {
    id: 4, title: '给 Squary 补橙子', titleEn: 'Oranges for Squary',
    prompt: { en: 'Give Squary some oranges so they have the same number. How many do we need to give him?', zh: 'Bubble Bubble 有 6 个橙子，Squary 有 2 个。要给 Squary 几个，两人才一样多？' },
    materials: '题卡（6 个 vs 2 个橙子）、圆片教具',
    items: [{ id: '4', dim: 'num', label: '比较与凑数', rubric: {
      4: '从 2 接着数到 6，或直接说出 4，并能解释',
      3: '一一配对或逐个点数后得出 4',
      2: '提示「排成两排比一比」后得出',
      1: '能数出每排有几个，但还不理解「一样多」' } }],
    chips: ['接着数', '逐个点数', '一一配对', '用手指', '一眼看出', '主动解释'],
    sample: { ratings: { '4': 4 }, chips: ['接着数', '用手指'] },
  },
  {
    id: 5, title: '数一数火箭里的图形', titleEn: 'Count the shapes',
    prompt: { en: 'Count the different shapes in the rocket. Write the numbers in the blanks.', zh: '数一数火箭里每种图形各有几个，写在下面的格子里。' },
    materials: '火箭图形卡、铅笔',
    items: [{ id: '5', dim: 'mea', label: '分类计数', rubric: {
      4: '先分类再计数，全部正确，还会自己检查',
      3: '四种图形都数对，可能有一处自己改正',
      2: '能数对两三种，长方形和正方形会混',
      1: '能认出图形，但计数还不稳定' } }],
    chips: ['先分类再数', '自我纠正', '长方形/正方形混淆', '逐个点数'],
    sample: { ratings: { '5': 3 }, chips: ['自我纠正', '逐个点数'] },
  },
  {
    id: 6, title: '风扇叶片', titleEn: 'Fan blades', revised: true,
    prompt: { en: 'Each fan needs 4 blades. How many blades do 3 fans need altogether?', zh: '每个风扇要 4 片叶片，3 个风扇一共要几片？' },
    materials: '风扇题卡、叶片圆片 ×12',
    items: [{ id: '6', dim: 'num', label: '按组数', rubric: {
      4: '4 个 4 个地数（4、8、12），并能说明',
      3: '逐个点数得出 12',
      2: '借助圆片摆一摆后得出',
      1: '能数出一个风扇的叶片，但还合不起来' } }],
    chips: ['按组数', '逐个点数', '借助教具', '用手指'],
    sample: { ratings: { '6': 3 }, chips: ['逐个点数'] },
  },
  {
    id: 7, title: '找规律放小鱼', titleEn: 'Fish pattern',
    prompt: { en: 'Find the pattern. Put the missing fish in the right place.', zh: '找到规律，把缺的小鱼放到正确的位置。' },
    materials: '规律条、小鱼贴纸',
    items: [{ id: '7', dim: 'rea', label: '识别并延续规律', rubric: {
      4: 'AB 与 ABC 规律都独立完成，并能说出规律',
      3: '独立完成 AB 规律，ABC 规律试一次后完成',
      2: '提示「读一读」后完成',
      1: '按颜色随意放，还看不出规律' } }],
    chips: ['说出规律', '试错后完成', '需要提示'],
    sample: { ratings: { '7': 3 }, chips: ['试错后完成'] },
  },
  {
    id: 8, title: '缺失的帽子', titleEn: 'The missing hat',
    prompt: { en: 'Look at the pattern and find the missing hat. Tell why the others are not correct.', zh: '看看规律，找出缺少的帽子，再说说为什么别的帽子不对。' },
    materials: '帽子规律图',
    items: [
      { id: '8a', dim: 'rea', label: '找出帽子', rubric: {
        4: '迅速选对，并能指出规律在哪（颜色 + 花纹）',
        3: '独立选对',
        2: '提示「看看颜色」后选对',
        1: '选错，提示后仍不确定' } },
      { id: '8b', dim: 'exp', label: '说明理由', rubric: {
        4: '能说清规律，并逐一说明其他选项为什么不对',
        3: '能说出至少一个理由（「这个没有条纹」）',
        2: '提示后能说出一个理由',
        1: '说不出理由，或只说「因为它不对」' } },
    ],
    chips: ['选择正确', '解释不完整', '需要提示', '中英混用'],
    sample: { ratings: { '8a': 3, '8b': 1 }, chips: ['选择正确', '解释不完整'] },
  },
  {
    id: 9, title: '迷宫找 Squary', titleEn: 'Maze to Squary',
    prompt: { en: 'Which way can I find Squary?', zh: '走哪条路能找到 Squary？' },
    materials: '迷宫图', scene: 'maze',
    items: [{ id: '9', dim: 'spa', label: '路径追踪', rubric: {
      4: '先用眼睛看完，再用手指一次走对，没有回头',
      3: '独立走对，中途回头一次',
      2: '提示「跟着这条路走」后走对',
      1: '容易从一条路跳到另一条' } }],
    chips: ['先观察再动手', '一次完成', '回头一次', '需要提示'],
    sample: { ratings: { '9': 4 }, chips: ['先观察再动手', '一次完成'] },
  },
  {
    id: 10, title: '狮子先生的蛋糕', titleEn: "Mr. Lion's cake",
    prompt: { en: 'Help Mr. Lion choose his favorite cake. It has strawberries, and it is not round.', zh: '帮狮子先生选他最喜欢的蛋糕：上面有草莓，而且不是圆的。' },
    materials: '蛋糕卡 ×4',
    items: [{ id: '10', dim: 'rea', label: '多条件推理', rubric: {
      4: '同时用两个条件排除，并能说出排除过程',
      3: '独立用两个条件选对',
      2: '能用一个条件，提醒第二个条件后选对',
      1: '凭喜好选，还不会按条件排除' } }],
    chips: ['能用一个条件', '需要提示', '排除法', '凭喜好选'],
    sample: { ratings: { '10': 2 }, chips: ['能用一个条件', '需要提示'] },
  },
  {
    id: 11, title: '画外星人朋友', titleEn: 'Draw an alien friend',
    prompt: { en: 'Can you draw three eyes and add more body parts to make an alien friend? Tell me about it!', zh: '画三只眼睛，再加上别的部位，变成一个外星人朋友，然后讲讲它。' },
    materials: '圆形画纸、彩笔', scene: 'alien',
    items: [
      { id: '11a', dim: 'cre', label: '创意与细节', rubric: {
        4: '有多个独特细节，还自成一个小故事',
        3: '按要求完成，并加了自己的细节',
        2: '完成基本要求，细节较少',
        1: '需要较多引导才动笔' } },
      { id: '11b', dim: 'exp', label: '介绍作品', rubric: {
        4: '连贯地介绍名字、特点和故事',
        3: '能用几句话介绍自己的作品',
        2: '回答老师的提问，句子较短',
        1: '很少说话，只点头或摇头' } },
    ],
    chips: ['有独特细节', '握笔稳', '用英文介绍', '用中文介绍', '讲了一个小故事'],
    sample: { ratings: { '11a': 3, '11b': 3 }, chips: ['有独特细节', '握笔稳', '用英文介绍'] },
  },
];

/* Voice notes the teacher recorded during the sample session: raw speech-to-text + AI-polished, teacher-approved text. */
const SAMPLE_NOTES = [
  { id: 'n2', task: 2, dim: 'spa', kind: 'strength', dur: 14,
    raw: '嗯，Q2 他拼火箭特别快，那个尾翼的三角形他先在手里转了一下，然后一次就放对了，还跟我说这个要倒过来放，嗯，空间感挺好的。',
    zh: '拼火箭时，Ethan 先在手里把三角形转了半圈，再一次放进尾翼的位置，还主动说「这个要倒过来」。能在脑中转动图形并说出来，是空间能力很强的表现。',
    en: 'While building the rocket, Ethan turned a triangle half a turn in his hand, placed it in the fin slot on the first try, and said, "This one goes upside down." Turning a shape in his head and saying so is a strong sign of spatial skill.' },
  { id: 'n3', task: 3, dim: 'exp', kind: 'growth', dur: 16,
    raw: 'Q3 贴纸贴对了，但是让他说兔子在哪，他就指着说在这儿在这儿，我提示了一下前面后面，他才说在前面，嗯，表达这块要多练。',
    zh: '贴纸位置完全正确，但描述位置时 Ethan 习惯指着说「在这儿」，提示「前面还是后面？」后才说出「在前面」。他心里清楚，只是还没习惯用方位词表达。',
    en: 'He placed the sticker exactly right, but to describe the rabbit\'s position he pointed and said "here." After the hint "in front or behind?" he said "in front." He knows it; he just isn\'t used to putting it into position words yet.' },
  { id: 'n4', task: 4, dim: 'num', kind: 'strength', dur: 12,
    raw: '橙子那题他是从 2 开始接着数的，3、4、5、6，然后伸了 4 个手指头说要给 4 个，这个挺好，不是从 1 开始数的。',
    zh: '补橙子时，Ethan 没有从 1 重新数，而是从 2 接着数「3、4、5、6」，再看手指得出要给 4 个。会「接着数」，说明他已经把数字当成可以累加的量。',
    en: 'To even out the oranges, Ethan didn\'t start over from 1. He counted on from 2 ("3, 4, 5, 6") and read 4 off his fingers. Counting on means he already treats numbers as amounts he can add to.' },
  { id: 'n8', task: 8, dim: 'exp', kind: 'growth', dur: 15,
    raw: '帽子那题选对了，问他为什么别的不行，他就说因为它不对，嗯，说不出理由，这个跟 Q3 一样，就是会做但是讲不出来。',
    zh: 'Ethan 选对了缺失的帽子，但问他「为什么别的不行」时只说「因为它不对」。和兔子那题一样：会做，但还说不出理由。这是接下来最值得练的地方。',
    en: 'Ethan picked the right hat, but when asked why the others don\'t fit he only said "because it\'s wrong." Same as the rabbit task: he can do it but can\'t yet say why. This is the most valuable thing to practice next.' },
  { id: 'n9', task: 9, dim: 'spa', kind: 'strength', dur: 9,
    raw: '迷宫他是先用眼睛看了一遍，然后手指一下就走到了，没有走回头路。',
    zh: '走迷宫时，Ethan 先用眼睛把三条路看了一遍，再用手指一次走到 Squary，中途没有回头。先观察、再动手，是很好的解题习惯。',
    en: 'In the maze, Ethan scanned all three paths with his eyes first, then traced the way to Squary in one go without backtracking. Look first, then act: a great problem-solving habit.' },
  { id: 'n11', task: 11, dim: 'cre', kind: 'strength', dur: 18,
    raw: '画画的时候他画了三只眼睛，还加了天线和火箭鞋，说叫 Zork，住在月亮上，用英文讲的，挺流利的，嗯，想象力不错，握笔也稳。',
    zh: 'Ethan 画了三只眼睛、两根天线和一双「火箭鞋」，还用英文介绍：“He\'s Zork. He lives on the moon.” 细节丰富，握笔稳定。讲自己的作品时他很流畅，说明表达的卡点在「解释思路」，不在语言本身。',
    en: 'Ethan drew three eyes, two antennae and a pair of "rocket shoes," then introduced it in English: "He\'s Zork. He lives on the moon." Rich detail, steady grip. He talks fluently about his own work, so the Math Talk gap is about explaining his reasoning, not language itself.' },
  { id: 'nsum', task: 'wrap', dim: null, kind: 'summary', dur: 21,
    raw: '整体来说 Ethan 很专注，二十多分钟都坐得住，空间和数数都很好，接着数也会了，嗯，主要就是让他多说说为什么，在家可以多问问他你是怎么想的。',
    zh: 'Ethan 是个专注又爱动手的「小工程师」：拼图形又快又准，数数已经会「接着数」。接下来最值得练的，是把脑子里的想法用语言讲出来。',
    en: 'Ethan is a focused, hands-on "little engineer": quick and precise with shapes, and already counting on. The next thing worth practicing most is putting his thinking into words.' },
];

/* What the simulated speech recognizer "hears" when the demo runs without a microphone. */
const DEMO_SCRIPTS = {
  1: [{ dim: 'mea', kind: 'obs', raw: '天气表他是一行一行数的，晴天数了 5 个，然后说晴天最多，嗯，没有直接比长短。',
    zh: '读天气表时，Ethan 一行一行地数，数出晴天有 5 天后说「晴天最多」。他还没用「比一比哪行更长」的方法，下一步可以引导他直接比较。',
    en: 'Reading the weather chart, Ethan counted row by row, found 5 sunny days and said "sunny wins." He doesn\'t yet compare row lengths directly, which is a good next step.' }],
  2: [{ dim: 'spa', kind: 'strength', raw: '第二个火箭他也拼得很快，还自己加了一个窗户，说火箭要有窗户才能看星星。',
    zh: '第二枚火箭 Ethan 同样拼得很快，还自己加了一个窗户，说「火箭要有窗户才能看星星」。完成任务后还会加自己的想法，说明他对图形很有把握。',
    en: 'Ethan built the second rocket quickly too and added a window on his own: "Rockets need windows to see the stars." Adding his own ideas after finishing shows real confidence with shapes.' }],
  3: [{ dim: 'exp', kind: 'growth', raw: '我又问了一次小熊在哪里，这次他说小熊在盒子上面，嗯，第二次就会用了。',
    zh: '换成「小熊在哪里？」再问一次，Ethan 说出了「小熊在盒子上面」。提示过一次之后就能自己用上方位词，说明这个能力正在形成。',
    en: 'Asked again about a teddy bear, Ethan said "the bear is on top of the box." After one hint he could use the position word himself, so this skill is forming.' }],
  4: [{ dim: 'num', kind: 'strength', raw: '我追问如果 Bubble 有 8 个呢，他想了一下说那就要 6 个，也是接着数的。',
    zh: '追问「如果 Bubble Bubble 有 8 个呢？」，Ethan 想了一下说「那就要给 6 个」，用的还是接着数。换了数字也能用同一个方法，说明他是真的理解了。',
    en: 'I followed up: "What if Bubble Bubble had 8?" After a moment Ethan said "then 6," counting on again. Using the same method with new numbers shows real understanding.' }],
  5: [{ dim: 'mea', kind: 'obs', raw: '数图形的时候长方形和正方形他一开始数混了，后来自己发现了又改过来了。',
    zh: '数图形时，Ethan 一开始把长方形和正方形数混了，随后自己发现并改正。会自己检查是很好的习惯，长方形和正方形的区别可以在生活中多指认。',
    en: 'Counting shapes, Ethan first mixed up rectangles and squares, then noticed and fixed it himself. Self-checking is a great habit; pointing out rectangles and squares in daily life will help.' }],
  6: [{ dim: 'num', kind: 'obs', raw: '风扇那题他是一个一个数到 12 的，数得很准，但是还没有 4 个 4 个数。',
    zh: '风扇叶片 Ethan 是一片一片数到 12 的，数得很准，但还没有用「4 个 4 个地数」。下一步可以练按组数，这是乘法的前身。',
    en: 'Ethan counted the fan blades one by one up to 12, accurately, but didn\'t yet count in fours. Counting in groups is a natural next step and a precursor to multiplication.' }],
  7: [{ dim: 'rea', kind: 'obs', raw: '规律那题 AB 的很快，ABC 的第一次放错了，他自己读了一遍红黄蓝红黄蓝就改对了。',
    zh: '找规律时，AB 规律 Ethan 很快完成；ABC 规律第一次放错，他自己念了一遍「红、黄、蓝，红、黄、蓝」就改对了。用「念出来」来检查，是很好的策略。',
    en: 'Ethan finished the AB pattern quickly. On the ABC pattern he slipped once, then read it aloud ("red, yellow, blue, red, yellow, blue") and fixed it. Saying it aloud to check is a smart strategy.' }],
  8: [{ dim: 'exp', kind: 'growth', raw: '后来我给他示范了一下怎么说，因为它没有条纹，他跟着说了一遍，嗯，有示范的话可以。',
    zh: '我示范「因为它没有条纹」后，Ethan 能跟着说一遍。有示范时他可以说出理由，在家多用「因为……所以……」和他对话会很有帮助。',
    en: 'After I modeled "because it has no stripes," Ethan could repeat the reason. With a model he can explain; using "because… so…" in conversations at home will help a lot.' }],
  9: [{ dim: 'spa', kind: 'strength', raw: '我又让他找 Squary 回家的路，他也很快找到了，还说这条路像一条蛇。',
    zh: '再请他找 Squary 回家的路，Ethan 也很快找到，还说「这条路像一条蛇」。把路线和熟悉的形象联系起来，是记住空间信息的好方法。',
    en: 'Asked to find Squary\'s way home, Ethan found it quickly and said "this road looks like a snake." Linking a route to a familiar shape is a good way to remember spatial information.' }],
  10: [{ dim: 'rea', kind: 'growth', raw: '蛋糕那题他先挑了有草莓的，但是忘了不能是圆的，我提醒了一下他才换成方的那个。',
    zh: '选蛋糕时，Ethan 先挑出有草莓的，但忘了「不能是圆的」，提醒后才换成方形的那块。4 岁孩子同时记住两个条件本来就有难度，多玩排除类小游戏会进步很快。',
    en: 'Ethan picked a strawberry cake first but forgot "not round"; after a reminder he switched to the square one. Holding two conditions at once is hard at four, and elimination games help quickly.' }],
  11: [{ dim: 'exp', kind: 'strength', raw: '我问 Zork 喜欢吃什么，他说喜欢吃月亮上的石头，讲得很开心。',
    zh: '问「Zork 喜欢吃什么？」，Ethan 开心地说「它喜欢吃月亮上的石头」。讲自己的作品时，他的表达自然又有想象力。',
    en: 'Asked "What does Zork like to eat?", Ethan happily said "rocks from the moon." When talking about his own creations, his language is natural and imaginative.' }],
  wrap: [{ dim: null, kind: 'obs', raw: '补充一下，他刚开始有点害羞，大概两分钟就放开了，后面越做越投入，特别喜欢动手的题。',
    zh: '补充一点：Ethan 刚开始有点害羞，大约两分钟后就放开了，越做越投入，尤其喜欢动手的题目。',
    en: 'One more thing: Ethan was a little shy at first, warmed up after about two minutes, and got more and more engaged, especially on hands-on tasks.' }],
};

const QUALITIES = [
  { id: 'focus', zh: '专注力', en: 'Focus', sample: 3, obs: { zh: '22 分钟测评全程坐得住，只在第 10 题后伸了个懒腰。', en: 'Stayed engaged for all 22 minutes; stretched once after task 10.' } },
  { id: 'init', zh: '主动性', en: 'Initiative', sample: 3, obs: { zh: '看到新教具会主动问「这个怎么玩？」', en: 'Asked "How do we play this?" whenever new materials came out.' } },
  { id: 'pers', zh: '坚持性', en: 'Persistence', sample: 2, obs: { zh: '第 10 题卡住时愿意再试一次，第二次需要老师鼓励。', en: 'Tried again when stuck on task 10; needed encouragement the second time.' } },
  { id: 'instr', zh: '听从指令', en: 'Following directions', sample: 2, obs: { zh: '两步指令能独立完成，三步指令需要重复一次。', en: 'Follows two-step directions on his own; three-step ones needed one repeat.' } },
  { id: 'motor', zh: '精细动作', en: 'Fine motor', sample: 3, obs: { zh: '握笔稳定，贴纸能准确对齐到格子里。', en: 'Steady pencil grip; lines stickers up precisely.' } },
];

/* What a level means, per dimension. hi = Secure or above, lo = below Secure. */
const MEANING = {
  num: {
    hi: { zh: '会「接着数」、能比较和凑数，说明他已经把数字当成可以累加的量，这是从「数数」走向「加减法」的关键一步。', en: 'Counting on, comparing and making equal groups show he treats numbers as amounts he can add to: the key step from counting to addition and subtraction.' },
    lo: { zh: '能一个一个数，但比较多少、凑成一样多还需要摆一摆、比一比。多用实物练「一一对应」，会进步很快。', en: 'He can count one by one, but comparing amounts or making them equal still needs hands-on matching. Practicing one-to-one matching with real objects helps quickly.' } },
  spa: {
    hi: { zh: '能在脑中转动图形、先观察再动手，在 4 岁孩子里比较突出。研究发现，学龄前的空间能力和之后的数学成绩关系密切。', en: 'Turning shapes in his head and looking before acting stand out at age four. Research links preschool spatial skills closely to later math achievement.' },
    lo: { zh: '图形能认，但组合、旋转和方位还在建立。拼图、积木和「照着摆」的游戏，是练空间能力最直接的方式。', en: 'He recognizes shapes, but combining, turning and placing them is still developing. Puzzles, blocks and copy-the-pattern games are the most direct practice.' } },
  rea: {
    hi: { zh: '能识别并延续规律，也能按条件做判断，推理的底子很扎实。下一步可以挑战多条件、多步骤的问题。', en: 'He spots and extends patterns and reasons from conditions: a solid base. Next come problems with several conditions or steps.' },
    lo: { zh: '单一规律掌握得好；需要同时记住两个条件时，还会丢掉其中一个。这在 4 岁很常见，多玩排除类小游戏会进步很快。', en: 'Single patterns are solid; holding two conditions at once still drops one. That is common at four, and elimination games help quickly.' } },
  mea: {
    hi: { zh: '能分类计数、读懂简单的统计表。下一步是学会「比一比哪一行更长」来比较，而不是每次都从头数。', en: 'He can sort, count and read a simple chart. Next: compare by seeing which row is longer instead of recounting every time.' },
    lo: { zh: '分类和比较多少还需要提示。生活里的「分一分、比一比」是最好的练习，比如袜子配对、积木按颜色分堆。', en: 'Sorting and comparing still need hints. Everyday sorting is the best practice, like matching socks or grouping blocks by color.' } },
  exp: {
    hi: { zh: '能用语言说清楚自己的想法，这让老师更容易看到他懂了什么，也帮他自己发现错误。', en: 'He can put his thinking into words, which helps teachers see what he understands and helps him catch his own mistakes.' },
    lo: { zh: '他会做，但还说不出「为什么」。把思路讲出来能帮他检查自己的想法，也让老师更容易发现他卡在哪里。这类能力在家每天练几分钟就会有变化。', en: 'He can do it but can\'t yet say why. Explaining his thinking helps him check his own ideas and helps teachers see where he is stuck. A few minutes a day at home makes a difference.' } },
  cre: {
    hi: { zh: '想象力丰富、细节多，能把一个要求变成自己的作品，动手也稳。', en: 'Imaginative and detailed; he turns a prompt into his own creation, with steady hands.' },
    lo: { zh: '能按要求完成，细节还不多。多给他没有标准答案的任务（自由画、自由搭），比照着做更能激发创意。', en: 'He completes the task with few added details. Open-ended tasks with no single right answer spark more creativity than copying.' } },
};

/* One 5-minute home game per dimension, by level band. */
const HOME = {
  num: {
    hi: { t: { zh: '超市接着数', en: 'Count on at the store' }, d: { zh: '买水果时问：「篮子里有 3 个苹果，我们要 7 个，还要拿几个？」让他从 3 接着数。', en: 'At the store: "We have 3 apples and need 7. How many more?" Let him count on from 3.' }, m: { zh: '任何水果或零食', en: 'any fruit or snacks' } },
    lo: { t: { zh: '一样多吗？', en: 'Same or not?' }, d: { zh: '摆两排零食，一排 5 个、一排 3 个，问「怎样才一样多？」让他一个对一个地摆。', en: 'Line up 5 snacks and 3 snacks. Ask "How can they be the same?" and let him match them one to one.' }, m: { zh: '小零食', en: 'small snacks' } } },
  spa: {
    hi: { t: { zh: '照片拼图挑战', en: 'Photo puzzle challenge' }, d: { zh: '用纸剪几个三角形，摆一个造型拍照，让他照着拼；会了以后把照片转 90° 再拼。', en: 'Cut paper triangles, build a shape and snap a photo for him to copy. Then rotate the photo 90° and try again.' }, m: { zh: '彩纸、剪刀', en: 'paper, scissors' } },
    lo: { t: { zh: '藏宝游戏', en: 'Treasure hunt' }, d: { zh: '把玩具藏在「沙发后面」「桌子下面」，用方位词给线索让他找，再交换角色。', en: 'Hide a toy "behind the sofa" or "under the table" and give position clues; then switch roles.' }, m: { zh: '一个小玩具', en: 'one small toy' } } },
  rea: {
    hi: { t: { zh: '规律找茬', en: 'Spot the slip' }, d: { zh: '用积木摆 ABC、AABB 规律，故意摆错一个，让他找出来并说出规律。', en: 'Build ABC or AABB patterns with blocks, sneak in one mistake, and have him find it and name the pattern.' }, m: { zh: '彩色积木', en: 'colored blocks' } },
    lo: { t: { zh: '猜猜我想的是哪个', en: 'Guess my toy' }, d: { zh: '摆 4 个玩具，说两条线索（「它是红色的，但不是车」），让他一个个排除。', en: 'Set out 4 toys and give two clues ("It\'s red, but it\'s not a car"). He rules them out one by one.' }, m: { zh: '4 个玩具', en: '4 toys' } } },
  mea: {
    hi: { t: { zh: '家庭天气表', en: 'Family weather chart' }, d: { zh: '一周每天贴一个天气贴纸，周末一起看「哪种天气最多、多几天」，引导他比长短而不是重数。', en: 'Add a weather sticker each day for a week. On the weekend, ask which weather won and by how many, comparing row lengths instead of recounting.' }, m: { zh: '贴纸、一张纸', en: 'stickers, paper' } },
    lo: { t: { zh: '袜子分一分', en: 'Sock sort' }, d: { zh: '把洗好的袜子按颜色分堆，再数一数、比一比哪堆最多。', en: 'Sort clean socks into piles by color, then count and compare which pile is biggest.' }, m: { zh: '一篮袜子', en: 'a basket of socks' } } },
  exp: {
    hi: { t: { zh: '小老师时间', en: 'Little teacher' }, d: { zh: '让他当「小老师」，给你讲一道他会的题，你装作不懂，再多问一句「为什么」。', en: 'Let him be the teacher and explain a puzzle he knows; play confused and ask "why?" once more.' }, m: { zh: '无', en: 'nothing' } },
    lo: { t: { zh: '你是怎么知道的？', en: '"How did you know?"' }, d: { zh: '每天挑一次他做对的事，问「你是怎么知道的？」。先示范「因为……所以……」，只复述，不纠正。', en: 'Once a day, when he gets something right, ask "How did you know?" Model "because… so…", and repeat his words back instead of correcting.' }, m: { zh: '无', en: 'nothing' } } },
  cre: {
    hi: { t: { zh: '给 Zork 盖个家', en: 'A home for Zork' }, d: { zh: '请他给外星人朋友画一个家，再讲讲 Zork 一天都做什么。', en: 'Ask him to draw a home for his alien friend and tell what Zork does all day.' }, m: { zh: '纸、彩笔', en: 'paper, markers' } },
    lo: { t: { zh: '没有标准答案的画', en: 'No-wrong-answer drawing' }, d: { zh: '给一个开头（一个圆、一条线），让他自由加东西，变成任何东西，再讲讲是什么。', en: 'Start with a circle or a line and let him turn it into anything, then tell you what it is.' }, m: { zh: '纸、彩笔', en: 'paper, markers' } } },
};

/* Lessons from the PreK school-year syllabus (Fall + Spring, 36 lessons), mapped to dimensions. */
const LESSONS = {
  num: [
    { term: 'fall', no: 8, topic: 'Rainforest', kp: { zh: '按组数', en: 'Count by group' }, why: { zh: '从一个一个数，到 5 个 5 个、10 个 10 个地数（风扇题的下一步）', en: 'From counting one by one to counting in fives and tens (the next step after the fan task)' } },
    { term: 'fall', no: 15, topic: "Let's Make Cakes", kp: { zh: '10 以内加法', en: 'Addition within 10' }, why: { zh: '把「接着数」变成加法算式', en: 'Turns counting on into addition sentences' } } ],
  spa: [
    { term: 'spring', no: 17, topic: 'Tumble Jumble', kp: { zh: '积木与视图', en: 'Block building' }, why: { zh: '从不同方向看积木搭建，给空间强项更高的挑战', en: 'Viewing block builds from different sides: a harder challenge for a spatial strength' } },
    { term: 'spring', no: 12, topic: 'Lost in Castle', kp: { zh: '立体迷宫', en: '3D maze' }, why: { zh: '从平面迷宫走向立体迷宫，还要自己设计一个', en: 'From flat mazes to 3D ones, including designing his own' } } ],
  rea: [
    { term: 'spring', no: 10, topic: 'Squary the Pirate', kp: { zh: '排除法', en: 'Elimination' }, why: { zh: '练习同时用两个条件做判断（狮子先生蛋糕题的下一步）', en: 'Using two conditions at once (the next step after Mr. Lion\'s cake)' } },
    { term: 'spring', no: 18, topic: 'Journey to the Cave', kp: { zh: '位置推理', en: 'Positional reasoning' }, why: { zh: '一步一步推出顺序和结果', en: 'Working out order and outcomes step by step' } } ],
  mea: [
    { term: 'spring', no: 4, topic: 'Tidy Up', kp: { zh: '统计图', en: 'Statistical graph' }, why: { zh: '从逐个数，到用图表比较多少（天气表的下一步）', en: 'From counting each item to comparing with a chart (the next step after the weather chart)' } },
    { term: 'spring', no: 14, topic: 'Who is Taller?', kp: { zh: '非标准测量', en: 'Non-standard measurement' }, why: { zh: '用「几块积木那么长」来比较长短', en: 'Measuring with blocks and other everyday units' } } ],
  exp: [
    { term: 'fall', no: 14, topic: 'Lucky Ring', kp: { zh: '左和右', en: 'Left and right' }, why: { zh: '用方位词描述位置，正是兔子那题卡住的地方', en: 'Describing position in words, exactly where the rabbit task got stuck' } },
    { term: 'spring', no: 3, topic: 'Step by Step', kp: { zh: '地图与方向', en: 'Map and direction' }, why: { zh: '看简单地图，把路线一步一步讲出来', en: 'Reading a simple map and explaining a route step by step' } } ],
  cre: [
    { term: 'spring', no: 5, topic: 'Kingdom of Origami', kp: { zh: '折纸', en: 'Origami' }, why: { zh: '动手折出作品，再讲讲它的故事', en: 'Folding his own creations and telling their stories' } },
    { term: 'spring', no: 13, topic: 'Float and Sink', kp: { zh: '沉与浮', en: 'Buoyancy test' }, why: { zh: '先猜、再动手验证', en: 'Predict first, then test it by hand' } } ],
};

const CONCERNS = [
  { id: 'math', zh: '数学思维', en: 'Math thinking' },
  { id: 'focus', zh: '专注力', en: 'Focus' },
  { id: 'talk', zh: '表达', en: 'Explaining ideas' },
  { id: 'k', zh: '幼小衔接', en: 'School readiness' },
  { id: 'adv', zh: '是否适合进阶班', en: 'Ready for an advanced class?' },
];
const LIKES = [
  { id: 'blocks', zh: '积木拼图' }, { id: 'draw', zh: '画画' }, { id: 'story', zh: '听故事' }, { id: 'out', zh: '户外运动' },
];
const HOME_LANG = [
  { id: 'zh', zh: '中文' }, { id: 'en', zh: '英文' }, { id: 'both', zh: '中英都说' },
];

const TODAY = [
  { id: 'chloe', name: 'Chloe L.', initial: 'C', age: '4 岁 8 个月', time: '09:30', status: 'sent', c: 'var(--dim-mea)' },
    { id: 'lucas', name: 'Lucas Z.', initial: 'L', age: '3 岁 11 个月', time: '14:00', status: 'todo', c: 'var(--dim-cre)' },
];

const LEADS = [
  { name: 'Chloe L.', initial: 'C', age: '4 岁 8 个月', intent: 'mid', c: 'var(--dim-mea)', sent: '今天 09:58 发送',
    signals: ['打开 1 次', '阅读 1 分 40 秒', '看到了「下一步」', '未点击按钮'],
    next: '她的强项是「测量与数据」。发一段陈老师的语音，邀请周末试听。' },
  { name: 'Mia C.', initial: 'M', age: '4 岁 1 个月', intent: 'low', c: 'var(--dim-rea)', sent: '昨天 11:05 发送',
    signals: ['发送后 26 小时未打开'],
    next: '先发短信提醒，附记录老师 15 秒语音预告：「Mia 的拼图特别厉害」。' },
  { name: 'Lucas Z.', initial: 'L', age: '3 岁 11 个月', intent: 'todo', c: 'var(--dim-cre)', sent: '今天 14:00 测评',
    signals: ['家长关注：专注力', '录像：未授权'],
    next: '测评结束 30 分钟内发出报告；重点回应「专注力」。' },
];

const GUIDE = [
  { s: 'consent', role: 'parent', title: '测前：录像授权与 2 分钟问卷',
    tips: ['试试：打开「录制精彩片段」再提交。之后老师端能否标记片段、家长报告有没有视频，都会跟着变。', '问卷里选的「最想了解」，会在报告里被逐条回答。'],
    why: ['录像默认关闭、单独授权、随时可删', '家长的关注点在测前就交给老师'] },
  { s: 'tlist', role: 'teacher', title: '记录老师：跟随主讲，记录 1 个孩子', alias: ['tlive'],
    tips: ['线下场景：家长在多功能厅听讲座，林老师带 3 个孩子做题册，3 位记录老师各跟一个孩子。你是王老师，负责 Ethan。', '试试：按住底部「按住 说话」录一句备注，松开后 AI 自动整理并归到对应能力。', '把 Q2 的评分改成「萌芽」，再去看家长报告的雷达图和推荐怎么变。', '没有麦克风时用模拟语音；在普通浏览器里打开 HTML 文件可切换真实麦克风。'],
    why: ['一人只记一个孩子，题目进度跟随主讲', '点选行为描述代替 A+/A/B/C', '语音比打字快约 2.9 倍，老师不用测完再补写', '策略标签记录「怎么做对的」'] },
  { s: 'treview', role: 'teacher', title: '老师：AI 起草，逐条确认', alias: ['tsent'],
    tips: ['每条草稿都标了依据；全部确认后才能发送。', '目标：讲座 11:10 结束前把报告推到家长手机，顾问在现场就能解读。'],
    why: ['AI 只整理老师说过的话', '老师确认是发送前的硬门槛'] },
  { s: 'report', role: 'parent', title: '家长：收到报告',
    tips: ['点语音条听王老师原声（演示中由系统朗读原话）；右上角切换中 / EN。', '在「下一步」里预约一次 15 分钟解读，再去顾问端看看。'],
    why: ['首屏 30 秒读懂：一句话 + 3 个标签', '老师原声建立信任，文字方便扫读和转发', '推荐课程必须写明依据，只有一个主按钮'] },
  { s: 'crm', role: 'sales', title: '顾问：今日跟进',
    tips: ['你刚才在家长端的操作（听语音、展开的能力、预约）会出现在 Ethan 的卡片上。'],
    why: ['按意向排序，带着报告内容去聊', '信号只来自报告内的阅读和点击，并已告知家长'] },
];
