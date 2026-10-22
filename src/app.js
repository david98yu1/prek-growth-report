(() => {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const uid = () => 'x' + Math.random().toString(36).slice(2, 9);
const DIM = Object.fromEntries(DIMS.map(d => [d.id, d]));
const TASK = Object.fromEntries(TASKS.map(t => [t.id, t]));
const ITEMS = TASKS.flatMap(t => t.items.map(i => ({ ...i, task: t.id })));
const QUAL = Object.fromEntries(QUALITIES.map(q => [q.id, q]));
const KEY = 'prek-growth-demo-v2';
const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

const IC = {
  back: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 4 6.5 10l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M4 4l10 10M14 4 4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  more: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="4" cy="10" r="1.7"/><circle cx="10" cy="10" r="1.7"/><circle cx="16" cy="10" r="1.7"/></svg>',
  mic: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="6" y="2" width="6" height="10" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 8.5a5.5 5.5 0 0 0 11 0M9 14v2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  kbd: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1.5" y="4" width="15" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M4.5 7h1M8.5 7h1M12.5 7h1M4.5 10.5h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 4v10M4 9h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  play: '<svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M6 3.8v10.4c0 .6.7 1 1.2.6l7.6-5.2a.7.7 0 0 0 0-1.2L7.2 3.2c-.5-.4-1.2 0-1.2.6Z"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="m2.5 6.2 2.3 2.3 4.7-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg class="chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  waves: '<svg class="waves" viewBox="0 0 18 18" aria-hidden="true"><circle cx="4" cy="9" r="1.8" fill="currentColor"/><path class="w2" d="M7.6 5.4a5 5 0 0 1 0 7.2" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/><path class="w3" d="M10.9 2.8a9 9 0 0 1 0 12.4" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  lock: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" stroke-width="1.3"/></svg>',
};

/* ---------- state ---------- */
function fresh() {
  const ratings = {}, chips = {};
  TASKS.forEach(t => { Object.assign(ratings, t.sample.ratings); chips[t.id] = [...t.sample.chips]; });
  return {
    v: 2, screen: 'consent', visited: { consent: 1 },
    consent: { video: false, research: false, submitted: false },
    q: { lang: 'both', concerns: ['math', 'k'], likes: ['blocks'] },
    ratings, chips,
    notes: SAMPLE_NOTES.map(n => ({ ...n, source: 'sample', status: 'done' })),
    highlights: [{ id: 'h2', task: 2, scene: 'rocket' }, { id: 'h11', task: 11, scene: 'alien' }],
    qualities: Object.fromEntries(QUALITIES.map(q => [q.id, q.sample])),
    task: 2, kbd: false, micMode: 'demo', scriptIdx: {},
    review: { generated: false, confirmed: {}, edit: null, summary: null, startedAt: null, elapsed: null },
    lang: 'zh', openDims: ['spa', 'exp'],
    booking: null, trial: false, subscribed: false, shared: false, feedback: null,
    an: { opens: 0, seconds: 0, plays: 0, dims: [], sawNext: false, lastOpen: null },
  };
}
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v === 2) { s.highlights = s.highlights.filter(h => h.scene); s.notes.forEach(n => { delete n.audioUrl; if (n.status !== 'done') n.status = 'done'; }); return s; }
  } catch (e) { /* storage unavailable */ }
  return null;
}
let S = load() || fresh();
let saveT;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try {
      const c = { ...S, notes: S.notes.map(n => { const m = { ...n }; delete m.audioUrl; return m; }), highlights: S.highlights.filter(h => h.scene) };
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch (e) { /* ignore */ }
  }, 150);
}

/* ---------- scoring ---------- */
function scores() {
  const acc = {}; DIMS.forEach(d => (acc[d.id] = []));
  ITEMS.forEach(it => { const r = S.ratings[it.id]; if (r) acc[it.dim].push(r); });
  const out = {};
  for (const k in acc) out[k] = acc[k].length ? acc[k].reduce((a, b) => a + b, 0) / acc[k].length : null;
  return out;
}
const levelOf = s => (s == null ? null : s >= 3.5 ? 4 : s >= 2.75 ? 3 : s >= 1.75 ? 2 : 1);
const band = s => (s >= 2.75 ? 'hi' : 'lo');
const ranked = sc => DIMS.map(d => d.id).filter(id => sc[id] != null).sort((a, b) => sc[b] - sc[a]);
function strengths(sc) { const r = ranked(sc); const s = r.filter(id => sc[id] >= 2.75).slice(0, 2); return s.length ? s : r.slice(0, 1); }
function growth(sc) { const r = ranked(sc).reverse(); const g = r.filter(id => sc[id] < 2.75).slice(0, 2); return g.length ? g : r.slice(0, 1); }
function recommend(sc) {
  const v = Object.values(sc).filter(x => x != null);
  const secure = v.filter(x => x >= 2.75).length, ext = v.filter(x => x >= 3.5).length;
  if (ext >= 4 && sc.rea >= 3 && sc.num >= 3.5) return { id: 'challenge', zh: 'PreK 学年课 · 挑战组', en: 'PreK school-year program, challenge group', rule: '4 个以上维度达到「拔尖」，且数感、推理达标', secure };
  if (secure >= 3) return { id: 'standard', zh: 'PreK 学年课（秋季 + 春季，36 讲）', en: 'PreK school-year program (Fall + Spring, 36 lessons)', rule: '3 个以上维度达到「熟练」', secure };
  return { id: 'bridge', zh: '先补 L1–L8 衔接内容，再进入学年课', en: 'Catch up on bridge lessons L1–L8, then join the school-year program', rule: '多数维度还在「发展中」或「萌芽」', secure };
}
function lessonPicks(sc) {
  const g = growth(sc), st = strengths(sc), out = [], seen = new Set();
  const add = (dim, i, role) => { const l = LESSONS[dim] && LESSONS[dim][i]; if (!l) return; const k = l.term + l.no; if (seen.has(k)) return; seen.add(k); out.push({ ...l, dim, role }); };
  if (g[0] && sc[g[0]] < 2.75) { add(g[0], 0, 'focus'); add(g[0], 1, 'focus'); }
  if (g[1] && sc[g[1]] < 2.75) add(g[1], 0, 'focus');
  st.forEach(d => add(d, 0, 'strength'));
  return out.slice(0, 5);
}
const sampleRatings = () => TASKS.every(t => Object.entries(t.sample.ratings).every(([k, v]) => S.ratings[k] === v));
function summary(sc) {
  if (S.review.edit) return S.review.edit;
  if (S.review.summary) return S.review.summary;
  const n = [...S.notes].reverse().find(x => x.kind === 'summary' && x.status === 'done');
  if (n && sampleRatings()) return { zh: n.zh, en: n.en, note: n.id };
  const st = strengths(sc), g = growth(sc)[0];
  return {
    zh: `这次 ${CHILD.name} 在「${DIM[st[0]].zh}」${st[1] ? `和「${DIM[st[1]].zh}」` : ''}上表现最突出；接下来最值得练的是「${DIM[g].zh}」。`,
    en: `${CHILD.name} was strongest in ${DIM[st[0]].en}${st[1] ? ` and ${DIM[st[1]].en}` : ''} this time; the most valuable next step is ${DIM[g].en}.`,
    note: n && n.id,
  };
}

/* ---------- AI (Claude via the artifact runtime, or local fallback) ---------- */
const AI = { fn: null, state: 'checking' };
try {
  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('sample').then(fn => { AI.fn = fn || null; AI.state = fn ? 'ready' : 'off'; renderGuide(); if (S.screen === 'treview') render(); })
      .catch(() => { AI.state = 'off'; renderGuide(); });
  } else AI.state = 'off';
} catch (e) { AI.state = 'off'; }
function aiFailed(e) {
  const code = e && e.code;
  if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(code)) { AI.fn = null; AI.state = 'off'; toast('未授权使用 Claude，已切换为本地整理'); renderGuide(); }
  else if (code === 'rate_limited') toast('Claude 调用太频繁，稍后再试');
}
const FILLERS = /(嗯+|呃+|啊+|那个|就是说)[，,、\s]*/g;
function localPolish(raw) {
  let t = String(raw).replace(FILLERS, '').replace(/\s+/g, ' ').replace(/^[，,。\s]+/, '').trim();
  if (t && !/[。！？.!?」”]$/.test(t)) t += '。';
  return t;
}
const DIM_WORDS = { num: /数|个|加|几|手指|一样多/, spa: /拼|图形|三角|迷宫|方向|位置|转/, rea: /规律|推理|排除|条件/, mea: /统计|表|长短|分类|比较/, exp: /说|讲|表达|解释|描述|理由|为什么/, cre: /画|创意|想象|颜色|故事/ };
function guessDim(raw, task) {
  for (const k of ['exp', 'rea', 'mea', 'spa', 'num', 'cre']) if (DIM_WORDS[k].test(raw)) return k;
  return TASK[task] ? TASK[task].items[0].dim : null;
}
async function polish(n) {
  if (n.script) {
    await sleep(1100);
    Object.assign(n, { zh: n.script.zh, en: n.script.en, dim: n.script.dim, kind: n.script.kind, status: 'done', by: 'preset' });
    delete n.script; render(); return;
  }
  const t = TASK[n.task];
  if (AI.fn && n.raw) {
    try {
      const prompt = `你在帮一位学前数学测评老师整理现场口述备注，写给家长看。\n规则：只用老师说到的事实，不添加、不夸大；中文最多 2 句，先写看到的具体行为，再写一句这说明什么，语气温和具体；同时给出自然的英文版。\n判断最相关的能力维度 dim（num 数感与运算 / spa 空间与图形 / rea 规律与推理 / mea 测量与数据 / exp 数学表达 / cre 创意与动手 / none）以及类型 kind（strength 优势 / growth 待提升 / obs 中性观察）。\n孩子：${CHILD.name}，4 岁 3 个月。当前题目：${t ? `Q${t.id} ${t.title}（${t.prompt.zh}）` : '测评收尾的整体印象'}。\n老师原话："""${n.raw}"""\n只回复 JSON，例如 {"zh":"…","en":"…","dim":"spa","kind":"strength"}`;
      const out = await AI.fn.json(prompt, { modelTier: 'quick' });
      if (out && typeof out.zh === 'string') {
        Object.assign(n, { zh: out.zh, en: typeof out.en === 'string' ? out.en : null, dim: DIM[out.dim] ? out.dim : (n.dim || null), kind: ['strength', 'growth', 'obs'].includes(out.kind) ? out.kind : 'obs', status: 'done', by: 'claude' });
        render(); return;
      }
    } catch (e) { aiFailed(e); }
  }
  await sleep(700);
  Object.assign(n, { zh: localPolish(n.raw) || '（没有识别到文字，可改用键盘输入）', en: null, dim: n.dim || guessDim(n.raw, n.task), kind: n.kind || 'obs', status: 'done', by: 'local' });
  render();
}
async function aiRewriteSummary() {
  if (!AI.fn) return;
  const sc = scores();
  const dims = DIMS.map(d => `${d.zh} ${sc[d.id] != null ? sc[d.id].toFixed(1) : '-'}/4（${LEVELS[levelOf(sc[d.id])].zh}）`).join('；');
  const obs = S.notes.filter(n => n.status === 'done').map(n => '- ' + n.zh).join('\n');
  const qual = QUALITIES.map(q => `${q.zh}：${QLEVELS[S.qualities[q.id]].zh}`).join('；');
  const prompt = `根据下面的 4 岁孩子测评数据，给家长写一句话总结：中文不超过 55 字，英文不超过 35 个词。先说最突出的优势，再说最值得练的一点。只用数据里的事实，不排名、不比较其他孩子、不制造焦虑。\n维度得分：${dims}\n学习品质：${qual}\n老师观察：\n${obs}\n只回复 JSON：{"zh":"…","en":"…"}`;
  S.review.busy = true; render();
  try {
    const out = await AI.fn.json(prompt, { modelTier: 'quick', cache: false });
    if (out && out.zh) { S.review.summary = { zh: out.zh, en: out.en || null, ai: true }; S.review.edit = null; delete S.review.confirmed.summary; }
  } catch (e) { aiFailed(e); }
  S.review.busy = false; render();
}

/* ---------- small pieces ---------- */
const L = () => S.lang;
const tx = o => (o == null ? '' : typeof o === 'string' ? o : (o[L()] ?? o.zh));
const dimChip = (id, lang = 'zh') => id ? `<span class="chip dim" style="--c:${DIM[id].color}">${esc(lang === 'en' ? DIM[id].en : DIM[id].zh)}</span>` : '';
const levelBar = (lv, c) => `<span class="levelbar" style="--c:${c}" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i class="${i <= lv ? 'f' : ''}"></i>`).join('')}</span>`;
function voiceBubble(n, side, opts = {}) {
  const w = Math.min(210, 76 + n.dur * 6);
  const who = side === 'sent' ? '我' : TEACHER.initial;
  return `<div class="msg ${side}">
    <div class="avatar" style="--c:${side === 'sent' ? 'var(--dim-num)' : 'var(--dim-exp)'}">${who}</div>
    <div class="msg-body">
      <button class="voice" style="width:${w}px" data-act="play" data-id="${n.id}" aria-label="播放语音 ${n.dur} 秒">${IC.waves}<span class="dur">${n.dur}″</span>${opts.unread && !n.read ? '<i class="unread"></i>' : ''}</button>
      ${noteText(n, opts)}
    </div></div>`;
}
function noteText(n, opts) {
  if (n.status !== 'done') {
    return `<div class="bubble-text"><div class="raw">${esc(n.raw || '…')}</div><div class="ai-row"><span class="ai pending"><span class="thinking"><i></i><i></i><i></i></span>AI 整理中</span></div></div>`;
  }
  const lang = opts.lang || 'zh';
  const text = lang === 'en' ? (n.en || n.zh) : n.zh;
  const showRaw = opts.showRaw && S._raw === n.id;
  const by = n.by === 'claude' ? 'Claude 整理' : n.by === 'local' ? '本地整理' : 'AI 整理';
  return `<div class="bubble-text">
    <div>${esc(text)}${lang === 'en' && !n.en ? ' <span class="faint tiny">(Chinese original)</span>' : ''}</div>
    ${showRaw ? `<div class="raw">${lang === 'en' ? 'Transcript' : '原话转写'}：${esc(n.raw)}</div>` : ''}
    <div class="ai-row">${n.dim ? dimChip(n.dim, lang) : ''}<span class="ai">${IC.check}${lang === 'en' ? 'Teacher approved' : opts.parent ? '老师已确认' : by}</span><button data-act="raw" data-id="${n.id}">${showRaw ? (lang === 'en' ? 'Hide' : '收起') : (lang === 'en' ? 'Original words' : '看原话')}</button></div>
  </div>`;
}
function radar(sc, opts = {}) {
  const R = opts.r || 104, lang = opts.lang || 'zh';
  const ids = DIMS.map(d => d.id);
  const pt = (i, v) => { const a = -Math.PI / 2 + i * Math.PI * 2 / ids.length; return [Math.cos(a) * R * v / 4, Math.sin(a) * R * v / 4]; };
  const poly = v => ids.map((id, i) => pt(i, typeof v === 'number' ? v : (v[id] || 0)).map(n => n.toFixed(1)).join(',')).join(' ');
  if (opts.mini) {
    return `<svg viewBox="-60 -60 120 120" width="52" height="52" aria-hidden="true"><polygon points="${poly(4).replace(/[\d.-]+,[\d.-]+/g, p => p)}" fill="none" stroke="var(--line)" stroke-width="4"/><polygon points="${poly(sc).replace(/([\d.-]+),([\d.-]+)/g, (m, x, y) => `${(x * 0.55).toFixed(1)},${(y * 0.55).toFixed(1)}`)}" fill="var(--child)" fill-opacity="0.35" stroke="var(--child)" stroke-width="4"/></svg>`;
  }
  const rings = [1, 2, 3, 4].map(v => `<polygon points="${poly(v)}" fill="none" stroke="var(--line)" stroke-width="${v === 4 ? 1.4 : 1}"/>`).join('');
  const spokes = ids.map((id, i) => { const [x, y] = pt(i, 4); return `<line x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--line)"/>`; }).join('');
  const bandPath = `<path d="M${poly(3).split(' ').join(' L')} Z M${poly(2).split(' ').join(' L')} Z" fill="var(--band)" fill-rule="evenodd"/>`;
  const dots = ids.map((id, i) => { const [x, y] = pt(i, sc[id] || 0); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${DIM[id].color}" stroke="var(--surface)" stroke-width="2"/>`; }).join('');
  const labels = ids.map((id, i) => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / ids.length;
    const x = Math.cos(a) * (R + 26), y = Math.sin(a) * (R + 22);
    const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
    const lv = levelOf(sc[id]);
    return `<g class="axis-btn" data-act="jump" data-dim="${id}" role="button" tabindex="0" aria-label="${esc(DIM[id][lang])}">
      <text class="lab" x="${x.toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="${anchor}" font-size="15" font-weight="700" fill="var(--ink)">${esc(DIM[id].short[lang])}</text>
      <text x="${x.toFixed(1)}" y="${(y + 13).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" font-weight="600" fill="${DIM[id].color}">${lv ? esc(LEVELS[lv][lang]) : '—'}</text></g>`;
  }).join('');
  const ringLbl = [1, 2, 3, 4].map(v => `<text x="4" y="${(-R * v / 4 + 4).toFixed(1)}" font-size="9" fill="var(--ink-3)">${esc(LEVELS[v][lang])}</text>`).join('');
  return `<svg class="radar" viewBox="-178 -146 356 292" role="img" aria-label="${lang === 'en' ? 'Radar chart of six areas' : '六个能力维度雷达图'}">
    ${bandPath}${rings}${spokes}
    <polygon points="${poly(sc)}" fill="var(--child)" fill-opacity="0.22" stroke="var(--child)" stroke-width="2.4" stroke-linejoin="round"/>
    ${dots}${labels}</svg>`;
}

/* Highlight "clips": drawn animations stand in for real footage of a child. */
function sceneSVG(kind) {
  if (kind === 'rocket') return `<svg viewBox="0 0 320 200" aria-hidden="true"><rect width="320" height="200" fill="#1d2a52"/>
    ${[[30, 30], [70, 150], [280, 40], [250, 160], [120, 20], [300, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#ffffff" opacity=".7"/>`).join('')}
    <polygon points="160,26 188,76 132,76" fill="#ffffff"/><rect x="134" y="76" width="52" height="74" fill="#ffffff"/><circle cx="160" cy="104" r="11" fill="#7fb3ff" stroke="#1d2a52" stroke-width="3"/>
    <g fill="none" stroke="#ffffff" stroke-dasharray="4 4" opacity=".55"><polygon points="134,112 134,150 108,150"/><polygon points="186,112 186,150 212,150"/><polygon points="146,150 174,150 160,174"/></g>
    <polygon class="s-tri t1" points="134,112 134,150 108,150" fill="#f2a33a"/><polygon class="s-tri t2" points="186,112 186,150 212,150" fill="#f2a33a"/><polygon class="s-tri t3" points="146,150 174,150 160,174" fill="#ff7a59"/></svg>`;
  if (kind === 'maze') {
    const route = 'M 60 20 C 60 90, 140 60, 150 110 S 230 170, 285 150';
    return `<svg viewBox="0 0 320 200" aria-hidden="true"><rect width="320" height="200" fill="#bfe08f"/>
      <g fill="none" stroke="#f3dfb0" stroke-width="16" stroke-linecap="round"><path d="M 160 20 C 170 80, 90 120, 40 170"/><path d="M 260 20 C 250 70, 300 90, 200 130"/><path d="${route}"/></g>
      <path class="s-trace" d="${route}" fill="none" stroke="#e36d0a" stroke-width="4" stroke-linecap="round"/>
      <rect x="276" y="140" width="22" height="20" rx="3" fill="#f2a33a" stroke="#7a4b10" stroke-width="2"/><circle cx="283" cy="148" r="2" fill="#2b2b2b"/><circle cx="291" cy="148" r="2" fill="#2b2b2b"/>
      <circle class="s-walker" r="8" fill="#ffffff" stroke="#e36d0a" stroke-width="3" style="offset-path: path('${route}')"/></svg>`;
  }
  if (kind === 'alien') return `<svg viewBox="0 0 320 200" aria-hidden="true"><rect width="320" height="200" fill="#2b1d52"/>
    <path class="s-draw" d="M146 62 L134 30" stroke="#8fd16a" stroke-width="4" stroke-linecap="round"/><path class="s-draw" d="M174 62 L186 30" stroke="#8fd16a" stroke-width="4" stroke-linecap="round"/>
    <circle class="s-pop d4" cx="134" cy="28" r="6" fill="#ffd34d"/><circle class="s-pop d4" cx="186" cy="28" r="6" fill="#ffd34d"/>
    <circle cx="160" cy="104" r="48" fill="#8fd16a"/>
    <g class="s-pop d1"><circle cx="138" cy="96" r="10" fill="#ffffff"/><circle cx="140" cy="98" r="4.5" fill="#1a1a1a"/></g>
    <g class="s-pop d2"><circle cx="160" cy="84" r="10" fill="#ffffff"/><circle cx="162" cy="86" r="4.5" fill="#1a1a1a"/></g>
    <g class="s-pop d3"><circle cx="182" cy="96" r="10" fill="#ffffff"/><circle cx="184" cy="98" r="4.5" fill="#1a1a1a"/></g>
    <path d="M144 124 Q160 136 176 124" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g class="s-pop d5"><ellipse cx="138" cy="160" rx="16" ry="8" fill="#f2a33a"/><ellipse cx="182" cy="160" rx="16" ry="8" fill="#f2a33a"/></g>
    <g class="s-pop d6"><rect x="206" y="36" width="104" height="40" rx="10" fill="#ffffff"/><text x="258" y="53" text-anchor="middle" font-size="12" font-weight="700" fill="#2b1d52">He's Zork!</text><text x="258" y="68" text-anchor="middle" font-size="10" fill="#2b1d52">He lives on the moon</text></g></svg>`;
  return `<svg viewBox="0 0 320 200" aria-hidden="true"><rect width="320" height="200" fill="#26324a"/><rect x="40" y="60" width="240" height="80" rx="12" fill="#ffffff" opacity=".12"/><text x="160" y="106" text-anchor="middle" font-size="14" fill="#ffffff">片段占位</text></svg>`;
}
const SCENE_CAP = {
  rocket: { zh: 'Q2 拼火箭：先把三角形转半圈，再一次放对', en: 'Task 2: turns the triangle half a turn, then places it first try' },
  maze: { zh: 'Q9 迷宫：先看一遍，再一次走到 Squary', en: 'Task 9: scans first, then traces to Squary in one go' },
  alien: { zh: 'Q11 外星人朋友 Zork：三只眼睛和火箭鞋', en: 'Task 11: Zork the alien, three eyes and rocket shoes' },
};
function clip(h, lang) {
  const t = TASK[h.task];
  const cap = h.scene && SCENE_CAP[h.scene] ? SCENE_CAP[h.scene][lang] : (lang === 'en' ? `Task ${h.task}: ${t.titleEn}` : `Q${h.task} ${t.title}`);
  const body = h.url ? `<video src="${h.url}" controls playsinline></video>` :
    `${sceneSVG(h.scene)}<span class="tag">${lang === 'en' ? 'Animated stand-in' : '动画示意'}</span><button class="play" data-act="scene" aria-label="播放"><span>${IC.play}</span></button><span class="cap">${esc(cap)}</span>`;
  return `<div class="clip"><div class="scene" data-scene="${h.scene || ''}">${body}</div><div class="clip-cap">${esc(cap)}</div><div class="clip-meta">0:${String(18 + (h.task % 9)).padStart(2, '0')} · ${lang === 'en' ? 'recorded by ' + TEACHER.name.en : TEACHER.name.zh + '录制'}</div></div>`;
}

/* ---------- screens ---------- */
const SCREENS = {};

SCREENS.consent = () => {
  const c = S.consent, q = S.q;
  const opt = (grp, id, label, on) => `<button class="opt ${on ? 'on' : ''}" data-act="q" data-g="${grp}" data-id="${id}" aria-pressed="${on}">${esc(label)}</button>`;
  return `<div class="scr">
  <div class="bar wxbar"><div class="side"><span class="icon-btn">${IC.close}</span></div><h1>测评预约确认</h1><div class="side r"><span class="icon-btn">${IC.more}</span></div></div>
  ${c.submitted ? `<div class="pad"><div class="booked"><b>${IC.check} 已提交</b><span>王老师会在测评前看到你的回答。测评当天你在多功能厅听讲座，Ethan 在隔壁教室做游戏测评；讲座结束前报告会发到你的微信。</span><button class="btn wx sm" style="align-self:flex-start" data-act="go" data-to="tlist">切换到老师端看看 →</button></div></div>` : ''}
  <div class="hero-strip">
    <div class="row"><div class="avatar round" style="--c:var(--dim-spa)">E</div><div class="grow"><b>Ethan 的 PreK 成长测评</b><div class="small faint">已预约 · 测评前请完成下面两步</div></div></div>
    <dl class="appt"><dt>时间</dt><dd>10 月 22 日（周四）10:20 签到</dd><dt>家长</dt><dd>${esc(SESSION.talk.title)} · ${SESSION.talk.place} · ${SESSION.talk.time}</dd><dt>孩子</dt><dd>3 人一组游戏化测评 · 约 25 分钟 · 每个孩子有一位老师专门记录</dd></dl>
  </div>
  <div class="pad stack">
    <div class="card">
      <div class="sec-title">① 2 分钟，帮老师更了解 Ethan</div>
      <div class="q-label">孩子在家主要说</div>
      <div class="opt-grid">${HOME_LANG.map(o => opt('lang', o.id, o.zh, q.lang === o.id)).join('')}</div>
      <div class="q-label">你最想从这次测评了解什么？<span class="faint small">（最多 2 项）</span></div>
      <div class="opt-grid">${CONCERNS.map(o => opt('concerns', o.id, o.zh, q.concerns.includes(o.id))).join('')}</div>
      <div class="q-label">Ethan 平时喜欢</div>
      <div class="opt-grid">${LIKES.map(o => opt('likes', o.id, o.zh, q.likes.includes(o.id))).join('')}</div>
    </div>
    <div class="card">
      <div class="sec-title">② 录像授权（可选）</div>
      <p class="small muted">记录老师可以把 Ethan 作答的精彩瞬间录成短片段，放进报告给你看。</p>
      <dl class="facts"><dt>录什么</dt><dd>作答片段，每段不超过 30 秒，不录全程</dd><dt>谁能看</dt><dd>你和本次记录老师；转发给家人的版本不含视频</dd><dt>存多久</dt><dd>90 天后自动删除，你也可以随时删除</dd><dt>不用于</dt><dd>宣传、广告、AI 训练</dd></dl>
      <div class="consent-row"><div class="grow"><b>录制精彩片段，放进 Ethan 的报告</b><p>不授权也能正常测评，报告里只是没有视频</p></div><button class="switch ${c.video ? 'on' : ''}" data-act="consent" data-k="video" role="switch" aria-checked="${c.video}" aria-label="录制精彩片段"></button></div>
      <div class="consent-row"><div class="grow"><b>匿名用于教研改进</b><p>去掉姓名和人脸后，用于改进题目和评分标准</p></div><button class="switch ${c.research ? 'on' : ''}" data-act="consent" data-k="research" role="switch" aria-checked="${c.research}" aria-label="匿名用于教研"></button></div>
    </div>
    <button class="btn primary block" data-act="submit-consent">${c.submitted ? '更新我的选择' : '提交'}</button>
    <p class="tiny faint" style="text-align:center">可随时在报告页撤回授权并删除片段</p>
  </div></div>`;
};

SCREENS.tlist = () => {
  const video = S.consent.video;
  const kid = k => `<div class="card"><div class="kid-card">
      <div class="avatar" style="--c:${k.c}">${k.initial}</div>
      <div class="grow">
        <div class="row between"><b>${esc(k.name)}</b><span class="tiny faint">${esc(k.age)}</span></div>
        <div class="small muted">记录：${esc(k.recorder)}</div>
        <div class="kid-meta">${k.me ? `<span class="chip">中英双语</span><span class="chip">家长关注：${S.q.concerns.map(id => CONCERNS.find(c => c.id === id).zh).join('、') || '未填写'}</span><span class="chip">${video ? '录像：已授权' : '录像：未授权'}</span>` : `<span class="chip">${esc(k.progress)}</span>`}</div>
      </div></div>
      ${k.me ? `<button class="btn wx block" data-act="go" data-to="tlive">进入记录 · 跟随主讲 Q${S.task === 'wrap' ? 11 : S.task}</button>` : ''}
    </div>`;
  return `<div class="scr">
  <div class="t-head"><div class="tiny faint">10 月 22 日 · ${SESSION.group} · ${SESSION.room} · ${SESSION.time}</div><h2>本场测评</h2><div class="small muted">主讲：${SESSION.lead} · 你是记录老师王老师</div></div>
  <div class="pad stack">
    <div class="card" style="gap:6px"><div class="row between"><b>同场家长讲座</b><span class="badge" style="--c:var(--good)">进行中</span></div><div class="small muted">${esc(SESSION.talk.title)} · ${SESSION.talk.place} · ${SESSION.talk.ends} 结束</div><div class="small">目标：<b>${SESSION.talk.ends} 前</b>把 3 份报告推到家长手机，顾问在现场解读。</div></div>
    ${SESSION.kids.map(kid).join('')}
    <p class="tiny faint">主讲老师翻页时，三位记录老师的题目卡会同步切换；记录老师只盯自己负责的孩子。</p>
  </div></div>`;
};

function rubOpt(item, lv) {
  const on = S.ratings[item.id] === lv;
  return `<button class="rub ${on ? 'on' : ''}" style="--c:${DIM[item.dim].color}" data-act="rate" data-item="${item.id}" data-lv="${lv}" aria-pressed="${on}"><b>${LEVELS[lv].zh}<span class="old">原 ${LEVELS[lv].old}</span></b><span>${esc(item.rubric[lv])}</span></button>`;
}
function qstrip() {
  return `<div class="qstrip" role="tablist">${TASKS.map(t => {
    const rated = t.items.every(i => S.ratings[i.id]);
    return `<button class="qdot ${rated ? 'rated' : ''} ${S.task === t.id ? 'cur' : ''}" style="--c:${DIM[t.items[0].dim].color}" data-act="task" data-n="${t.id}" aria-label="第 ${t.id} 题">${t.id}</button>`;
  }).join('')}<button class="qdot wrap ${S.task === 'wrap' ? 'cur' : ''}" data-act="task" data-n="wrap">收尾</button></div>`;
}
function talkbar() {
  return `<div class="talkbar">
    <div class="talk-row">
      <button class="round-btn" data-act="kbd" aria-label="${S.kbd ? '切换到语音' : '切换到键盘'}">${S.kbd ? IC.mic : IC.kbd}</button>
      ${S.kbd ? `<input class="talk-input" id="talkInput" placeholder="输入观察，回车发送" enterkeyhint="send" autocomplete="off"><button class="btn wx sm" data-act="send-text">发送</button>` : `<button class="talk-btn" id="talkBtn">按住 说话</button>`}
      <button class="round-btn" data-act="plus" aria-label="更多">${IC.plus}</button>
    </div>
    <div class="talk-hint"><span>${S.micMode === 'mic' ? '麦克风录音 · 实时转写' : '演示：模拟语音识别'} · 现场低声说或课后口述</span><button data-act="mic">${S.micMode === 'mic' ? '示例语音' : '真实麦克风'}</button></div>
  </div>`;
}
SCREENS.tlive = () => {
  const head = `<div class="live-top"><div class="bar"><div class="side"><button class="icon-btn" data-act="go" data-to="tlist" aria-label="返回">${IC.back}</button></div><h1>Ethan · 记录中</h1><div class="side r"><span class="badge" style="--c:${S.consent.video ? 'var(--bad)' : 'var(--ink-3)'}">${S.consent.video ? '● 可录' : '未授权录像'}</span></div></div>${qstrip()}</div>`;
  if (S.task === 'wrap') return `<div class="scr">${head}<div class="pad stack">${wrapCard()}</div>${talkbar()}</div>`;
  const t = TASK[S.task];
  const notes = S.notes.filter(n => n.task === t.id);
  const hls = S.consent.video ? S.highlights.filter(h => h.task === t.id) : [];
  return `<div class="scr">${head}
  <div class="pad stack">
    <div class="task-card">
      <div class="row between"><span class="row" style="gap:6px">${t.items.map(i => dimChip(i.dim)).filter((v, i, a) => a.indexOf(v) === i).join('')}</span><span class="tiny faint">主讲进度 · 第 ${t.id} / 11 题</span></div>
      <div class="task-title">Q${t.id} ${esc(t.title)}</div>
      <div class="say"><span class="lbl">主讲老师对孩子说</span><span class="en">${esc(t.prompt.en)}</span><span class="zh">${esc(t.prompt.zh)}</span></div>
      <div class="tiny faint">教具：${esc(t.materials)}${t.revised ? ' · 题干已修订（原题「多几片」有歧义）' : ''}</div>
      ${t.items.map(it => `<div class="item-label">评分 · ${esc(it.label)}</div><div class="rubric">${[4, 3, 2, 1].map(lv => rubOpt(it, lv)).join('')}</div>`).join('')}
      <div class="item-label">看到的策略 <span class="faint tiny">可多选</span></div>
      <div class="row wrap" style="gap:6px">${t.chips.map(c => `<button class="chip ${S.chips[t.id].includes(c) ? 'on' : ''}" data-act="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="task-nav"><button class="btn ghost" data-act="prev" ${t.id === 1 ? 'disabled' : ''}>上一题</button><button class="btn ink" data-act="next">${t.id === 11 ? '去收尾' : '下一题'}</button></div>
    </div>
    <div class="row between"><b>语音备注</b><span class="tiny faint">按住底部按钮说话，AI 自动整理归类</span></div>
    <div class="thread">${notes.length ? notes.map(n => voiceBubble(n, 'sent')).join('') : '<div class="thread-empty">这题还没有备注。按住「按住 说话」试一试。</div>'}</div>
    ${hls.length ? `<b>本题精彩片段</b><div class="clips">${hls.map(h => clip(h, 'zh')).join('')}</div>` : ''}
  </div>${talkbar()}</div>`;
};
function wrapCard() {
  const sumNotes = S.notes.filter(n => n.task === 'wrap');
  const rated = ITEMS.filter(i => S.ratings[i.id]).length;
  return `<div class="task-card">
    <div class="task-title">收尾：学习品质与整体印象</div>
    <div class="small muted">已评分 ${rated} / ${ITEMS.length} 项 · 语音备注 ${S.notes.filter(n => n.task !== 'wrap').length} 条</div>
    <div>${QUALITIES.map(q => `<div class="qual"><div><b>${q.zh}</b><div class="tiny faint">${esc(q.obs.zh)}</div></div><div class="seg">${[3, 2, 1].map(v => `<button class="${S.qualities[q.id] === v ? 'on' : ''}" data-act="qual" data-q="${q.id}" data-v="${v}">${QLEVELS[v].zh}</button>`).join('')}</div></div>`).join('')}</div>
    <b>整体印象</b>
    <div class="thread">${sumNotes.map(n => voiceBubble(n, 'sent')).join('') || '<div class="thread-empty">按住说 20–30 秒整体印象</div>'}</div>
    <button class="btn primary block" data-act="generate">生成报告草稿 →</button>
  </div>`;
}

SCREENS.treview = () => {
  const head = `<div class="bar"><div class="side"><button class="icon-btn" data-act="go" data-to="tlive" aria-label="返回">${IC.back}</button></div><h1>报告草稿 · Ethan</h1><div class="side r"></div></div>`;
  if (!S.review.generated) {
    return `<div class="scr">${head}<div class="gen" id="gen">${['汇总 14 项评分到 6 个维度', '整理 ' + S.notes.length + ' 条语音备注', '生成每个维度的在家小游戏', '匹配学年课里最相关的课次', '翻译英文版'].map((s, i) => `<div class="gen-step" data-i="${i}"><span class="ck">${IC.check}</span>${s}</div>`).join('')}</div></div>`;
  }
  const sc = scores(), sm = summary(sc), st = strengths(sc), g = growth(sc), rec = recommend(sc), C = S.review.confirmed;
  const blocks = ['summary', 'strengths', 'growth', 'home', 'path'];
  const nOk = blocks.filter(b => C[b]).length;
  const acts = (k, extra = '') => `<div class="draft-actions">${C[k] ? `<span class="badge" style="--c:var(--good)">${IC.check} 已确认</span><button class="btn sm ghost" data-act="unconfirm" data-k="${k}">撤回</button>` : `<button class="btn sm wx" data-act="confirm" data-k="${k}">确认</button>`}${extra}</div>`;
  const ev = d => ITEMS.filter(i => i.dim === d && S.ratings[i.id]).map(i => `Q${i.task} ${LEVELS[S.ratings[i.id]].zh}`).join(' · ');
  const editing = S.review.editing;
  return `<div class="scr">${head}
  <div class="pad stack">
    <div class="card" style="gap:6px"><div class="small">AI 根据你的 <b>${ITEMS.filter(i => S.ratings[i.id]).length} 项评分</b>、<b>${S.notes.length} 条语音备注</b>和 <b>5 项学习品质</b>起草。每条都标了依据，确认后才能发送。</div><div class="tiny faint">家长版语言：中文 + English · ${AI.fn ? 'Claude 已连接，可重写' : '演示模式：预置整理结果'}</div></div>
    <div class="draft ${C.summary ? 'ok' : ''}"><div class="draft-h"><h3>一句话总结</h3><span class="tiny faint">首屏展示</span></div>
      ${editing ? `<textarea class="edit-area" id="editArea">${esc(sm.zh)}</textarea><div class="draft-actions"><button class="btn sm wx" data-act="save-edit">保存</button><button class="btn sm ghost" data-act="cancel-edit">取消</button></div>` : `<p>${esc(sm.zh)}</p><div class="src">依据：${sm.note ? '<span>整体印象语音</span>' : ''}${st.map(d => `<span>${DIM[d].zh} ${ev(d)}</span>`).join('')}${S.review.edit ? '<span>老师已修改</span>' : ''}${S.review.summary && S.review.summary.ai ? '<span>Claude 重写</span>' : ''}</div>
      ${acts('summary', `<button class="btn sm ghost" data-act="edit">修改</button>${AI.fn ? `<button class="btn sm ghost" data-act="rewrite" ${S.review.busy ? 'disabled' : ''}>${S.review.busy ? '重写中…' : '用 Claude 重写'}</button>` : ''}`)}`}
    </div>
    <div class="draft ${C.strengths ? 'ok' : ''}"><div class="draft-h"><h3>优势（${st.length}）</h3></div>
      ${st.map(d => `<div class="row" style="align-items:flex-start">${dimChip(d)}<span class="small">${LEVELS[levelOf(sc[d])].zh} · ${esc(MEANING[d][band(sc[d])].zh.split('。')[0])}。</span></div>`).join('')}
      <div class="src">依据：${st.map(d => `<span>${ev(d)}</span>`).join('')}</div>${acts('strengths')}</div>
    <div class="draft ${C.growth ? 'ok' : ''}"><div class="draft-h"><h3>下一步可以加强（${g.length}）</h3></div>
      ${g.map(d => `<div class="row" style="align-items:flex-start">${dimChip(d)}<span class="small">${LEVELS[levelOf(sc[d])].zh} · ${esc(MEANING[d][band(sc[d])].zh.split('。')[0])}。</span></div>`).join('')}
      <div class="src">依据：${g.map(d => `<span>${ev(d)}</span>`).join('')}${S.notes.filter(n => g.includes(n.dim)).length ? `<span>${S.notes.filter(n => g.includes(n.dim)).length} 条相关语音</span>` : ''}</div>${acts('growth')}</div>
    <div class="draft ${C.home ? 'ok' : ''}"><div class="draft-h"><h3>在家 5 分钟小游戏（6）</h3></div>
      <div class="small muted">${DIMS.map(d => `${d.short.zh}：${HOME[d.id][band(sc[d.id])].t.zh}`).join(' · ')}</div>${acts('home')}</div>
    <div class="draft ${C.path ? 'ok' : ''}"><div class="draft-h"><h3>推荐学习路径</h3></div>
      <p class="small"><b>${esc(rec.zh)}</b></p>
      <div class="src"><span>规则：${esc(rec.rule)}</span><span>高亮 ${lessonPicks(sc).length} 讲相关课次</span></div>${acts('path')}</div>
    <button class="link small" data-act="confirm-all" style="align-self:center">全部确认</button>
  </div>
  <div class="sendbar"><span class="timer-chip" id="revTimer">已确认 ${nOk}/5 · 用时 ${mmss((Date.now() - (S.review.startedAt || Date.now())) / 1000)}</span><button class="btn wx grow" data-act="send" ${nOk === 5 ? '' : 'disabled'}>发送给家长</button></div></div>`;
};

SCREENS.tsent = () => {
  const sc = scores(), sm = summary(sc);
  return `<div class="scr"><div class="bar"><div class="side"><button class="icon-btn" data-act="go" data-to="treview" aria-label="返回">${IC.back}</button></div><h1>已发送</h1><div class="side r"></div></div>
  <div class="pad stack">
    <div class="booked"><b>${IC.check} 报告已发送给 Ethan 妈妈</b><span>从生成草稿到发送用时 <b class="num">${mmss(S.review.elapsed || 0)}</b>；讲座 ${SESSION.talk.ends} 结束，还来得及。顾问 Amy 已收到提醒，会在讲座结束后到场解读。</span></div>
    <b>Ethan 妈妈在微信里收到的样子</b>
    <div class="wx-chat"><div class="wx-time">10:58</div>
      <div class="msg"><div class="avatar" style="--c:var(--dim-exp)">${TEACHER.initial}</div><div class="msg-body">
        <button class="wx-card" data-act="go" data-to="report"><h4>Ethan 的 PreK 成长测评报告</h4><div class="d"><span>${esc(TEACHER.name.zh)}：${esc(sm.zh.slice(0, 34))}…</span><span class="thumb">${radar(sc, { mini: true })}</span></div><div class="from">PreK 成长测评 · 点击查看</div></button>
      </div></div></div>
    <button class="btn primary block" data-act="go" data-to="report">以家长身份打开报告 →</button>
  </div></div>`;
};

const RT = {
  zh: { title: 'Ethan 的成长测评报告', meta: '4 岁 3 个月 · 10 月 22 日 · 线下 3 人一组 · 22 分钟', strongest: '最强项', next: '下一步', state: '学习状态', radar: '能力全景', radarSub: '点维度名查看详情', band: '4 岁常见范围（参考）', me: 'Ethan 这次', asked: '你在测前问的', voices: '老师的话', voicesSub: '点语音条听老师原声 · 文字由 AI 整理、老师已确认', clips: '精彩瞬间', clipsSub: '仅你可见 · 90 天后自动删除', noClips: '你没有开启录像授权，本报告不含视频片段。下次测评前可以在预约页开启。', details: '能力详情', saw: '这次看到', means: '这说明什么', home: '在家 5 分钟', qual: '学习品质', nextSec: '下一步', rec: '为 Ethan 推荐', lessons: '学年课里和 Ethan 最相关的几讲', focus: '重点加强', strength: '发挥优势', book: '预约 15 分钟老师解读', trial: '免费试听一节', share: '转发给家人', sub: '每周收到 1 个在家小游戏', about: '关于这次测评', clear: '这份报告清楚吗？', yes: '很清楚', no: '有点难懂', thanks: '谢谢反馈', foot: '示例数据 · 面试作业概念稿，非官方页面。我们会统计报告的打开和点击，用来安排老师跟进。' },
  en: { title: "Ethan's Growth Snapshot", meta: '4 yrs 3 mos · Oct 22 · In person, group of 3 · 22 min', strongest: 'Top strength', next: 'Next step', state: 'Engagement', radar: 'The big picture', radarSub: 'Tap an area for details', band: 'Typical range at age 4 (reference)', me: 'Ethan this time', asked: 'You asked us', voices: 'From the teacher', voicesSub: "Tap to hear the teacher's own voice · text tidied by AI and approved by the teacher", clips: 'Highlights', clipsSub: 'Only you can see these · auto-deleted after 90 days', noClips: 'Video was not enabled, so this report has no clips. You can turn it on before the next check-in.', details: 'Area by area', saw: 'What we saw', means: 'What it means', home: '5 minutes at home', qual: 'How he learns', nextSec: 'Next step', rec: 'Our suggestion for Ethan', lessons: 'Lessons in the program most relevant to Ethan', focus: 'Build up', strength: 'Stretch a strength', book: 'Book a 15-min chat with the teacher', trial: 'Try a free class', share: 'Share with family', sub: 'Get one home game each week', about: 'About this check-in', clear: 'Was this report clear?', yes: 'Very clear', no: 'A bit confusing', thanks: 'Thanks for the feedback', foot: 'Sample data. An interview concept, not an official page. We count opens and taps on this report to plan teacher follow-up.' },
};
function concernAnswer(id, sc) {
  const l = L(), lv = d => LEVELS[levelOf(sc[d])][l], dn = d => DIM[d].short[l];
  const core = ['num', 'spa', 'rea'], best = [...core].sort((a, b) => sc[b] - sc[a])[0], worst = [...core].sort((a, b) => sc[a] - sc[b])[0];
  const rec = recommend(sc), g = growth(sc)[0];
  const A = {
    math: { zh: `和数学思维最相关的三项：数感「${lv('num')}」、空间「${lv('spa')}」、推理「${lv('rea')}」。${dn(best)}是他的强项${sc[worst] < 2.75 ? `，${dn(worst)}还在发展中` : ''}。`, en: `The three areas closest to math thinking: Number (${lv('num')}), Spatial (${lv('spa')}), Reasoning (${lv('rea')}). ${dn(best)} is his strength${sc[worst] < 2.75 ? `; ${dn(worst)} is still developing` : ''}.` },
    focus: { zh: `专注力「${QLEVELS[S.qualities.focus].zh}」：${QUAL.focus.obs.zh}`, en: `Focus: ${QLEVELS[S.qualities.focus].en}. ${QUAL.focus.obs.en}` },
    talk: { zh: `数学表达「${lv('exp')}」。${sc.exp < 2.75 ? '他会做，但还说不出理由，这是这次最明确的提升点，详见下方「数学表达」。' : '他能把想法讲清楚，详见下方「数学表达」。'}`, en: `Math Talk: ${lv('exp')}. ${sc.exp < 2.75 ? "He can do the tasks but can't yet say why; this is the clearest next step (see Math Talk below)." : 'He explains his thinking well (see Math Talk below).'}` },
    k: { zh: `按这次表现，建议：${rec.zh}。入学前最值得提前练的是「${dn(g)}」，每天 5 分钟就够。`, en: `Based on this snapshot we suggest: ${rec.en}. The most useful thing to practice before school is ${dn(g)}; five minutes a day is enough.` },
    adv: rec.id === 'challenge' ? { zh: '可以。多数维度达到「拔尖」，推理也很扎实，适合挑战组。', en: 'Yes. Most areas are at Extending and reasoning is solid, so the challenge group fits.' }
      : { zh: `暂时建议先上标准学年课：${rec.secure} 个维度已达到「熟练」以上，但${dn(g)}还在发展中。3 个月后复测，再看是否进入挑战组。`, en: `For now we suggest the standard program: ${rec.secure} areas are Secure or above, but ${dn(g)} is still developing. We can re-check in 3 months for the challenge group.` },
  };
  return A[id][l];
}
SCREENS.report = () => {
  const l = L(), T = RT[l], sc = scores(), sm = summary(sc), st = strengths(sc), g = growth(sc), rec = recommend(sc);
  const sumNote = S.notes.find(n => n.id === sm.note) || S.notes.find(n => n.kind === 'summary');
  const focusTxt = { 3: { zh: '专注 22 分钟', en: 'Focused 22 min' }, 2: { zh: '专注力符合年龄', en: 'Focus on track' }, 1: { zh: '专注力可以多练', en: 'Focus: room to grow' } }[S.qualities.focus][l];
  const voiceNotes = S.notes.filter(n => n.kind !== 'summary' && n.status === 'done').sort((a, b) => ({ strength: 0, obs: 1, growth: 2 }[a.kind] ?? 1) - ({ strength: 0, obs: 1, growth: 2 }[b.kind] ?? 1));
  const sumText = l === 'en' ? (sm.en || sm.zh) : sm.zh;
  const dimCard = d => {
    const s = sc[d.id], lv = levelOf(s), open = S.openDims.includes(d.id), b = band(s), home = HOME[d.id][b];
    const ev = ITEMS.filter(i => i.dim === d.id && S.ratings[i.id]).map(i => { const t = TASK[i.task]; const ch = S.chips[t.id].slice(0, 3); return `<li>${l === 'en' ? `Task ${t.id} ${esc(t.titleEn)}` : `Q${t.id} ${esc(t.title)}`}（${esc(i.label)}）：<b>${LEVELS[S.ratings[i.id]][l]}</b>${ch.length && l === 'zh' ? ' · ' + ch.map(esc).join('、') : ''}</li>`; }).join('');
    const hl = S.consent.video ? S.highlights.filter(h => TASK[h.task].items.some(i => i.dim === d.id)) : [];
    return `<div class="dimcard ${open ? 'open' : ''}" id="dim-${d.id}" style="--c:${d.color}">
      <button class="dim-head" data-act="dim" data-dim="${d.id}" aria-expanded="${open}"><span class="dim-dot"></span><span class="dim-name">${esc(d[l])}</span><span class="badge" style="--c:${d.color}">${lv ? LEVELS[lv][l] : '—'}</span>${levelBar(lv || 0, d.color)}${IC.chev}</button>
      <div class="dim-body">
        <div class="dim-block"><h4>${T.saw}</h4><ul>${ev}</ul></div>
        <div class="dim-block"><h4>${T.means}</h4><p class="small">${esc(MEANING[d.id][b][l])}</p></div>
        <div class="home"><b>${T.home} · ${esc(home.t[l])}</b><p>${esc(home.d[l])}</p><span class="meta">${l === 'en' ? 'You need' : '准备'}：${esc(home.m[l])}</span></div>
        ${hl.length ? `<div class="clips">${hl.map(h => clip(h, l)).join('')}</div>` : ''}
      </div></div>`;
  };
  const picks = lessonPicks(sc);
  const days = [{ k: '10/22', zh: '今天', en: 'Today' }, { k: '10/23', zh: '周五', en: 'Fri' }, { k: '10/24', zh: '周六', en: 'Sat' }];
  return `<div class="scr" style="background:var(--surface-2)">
  <div class="bar wxbar"><div class="side"><span class="icon-btn">${IC.close}</span></div><h1>${T.title}</h1><div class="side r"><div class="seg" role="group" aria-label="语言"><button class="${l === 'zh' ? 'on' : ''}" data-act="lang" data-l="zh">中</button><button class="${l === 'en' ? 'on' : ''}" data-act="lang" data-l="en">EN</button></div></div></div>
  <div class="rp-hero">
    <div class="rp-kid"><div class="avatar lg" style="--c:var(--dim-spa)">E</div><div><div class="rp-name">Ethan</div><div class="rp-meta">${T.meta}</div></div></div>
    <div class="teacher-say">
      <div class="avatar" style="--c:var(--dim-exp);width:36px;height:36px;font-size:14px;border-radius:6px">${TEACHER.initial}</div>
      <div class="msg-body" style="gap:8px">
        <span class="tiny faint">${esc(TEACHER.name[l])} · ${esc(TEACHER.role[l])}</span>
        ${sumNote ? `<button class="voice" style="width:150px" data-act="play" data-id="${sumNote.id}" aria-label="播放老师语音">${IC.waves}<span class="dur">${sumNote.dur}″</span>${!sumNote.read ? '<i class="unread"></i>' : ''}</button>` : ''}
        <p class="summary-text">${esc(sumText)}</p>
      </div>
    </div>
    <div class="key3">
      <button class="key" data-act="jump" data-dim="${st[0]}" style="--c:${DIM[st[0]].color}"><span class="k">${T.strongest}</span><span class="v">${esc(DIM[st[0]].short[l])}</span></button>
      <button class="key" data-act="jump" data-dim="${g[0]}" style="--c:${DIM[g[0]].color}"><span class="k">${T.next}</span><span class="v">${esc(DIM[g[0]].short[l])}</span></button>
      <div class="key"><span class="k">${T.state}</span><span class="v">${focusTxt}</span></div>
    </div>
  </div>
  <div class="rp-sec"><div class="card"><div><div class="sec-title"><span class="mk"></span>${T.radar}</div><div class="sec-sub">${T.radarSub}</div></div>
    <div class="radar-wrap">${radar(sc, { lang: l })}<div class="legend"><span><i style="background:var(--child);opacity:.6"></i>${T.me}</span><span><i style="background:var(--band);border:1px solid var(--line)"></i>${T.band}</span></div></div></div></div>
  ${S.q.concerns.length ? `<div class="rp-sec"><div class="card"><div class="sec-title"><span class="mk"></span>${T.asked}</div>${S.q.concerns.map(id => `<div class="concern"><span class="q">${esc(CONCERNS.find(c => c.id === id)[l])}</span><p>${esc(concernAnswer(id, sc))}</p></div>`).join('')}</div></div>` : ''}
  <div class="rp-sec"><div class="card"><div><div class="sec-title"><span class="mk"></span>${T.voices}</div><div class="sec-sub">${T.voicesSub}</div></div>
    <div class="thread">${voiceNotes.map(n => voiceBubble(n, 'recv', { lang: l, parent: true, showRaw: true, unread: true })).join('')}</div></div></div>
  <div class="rp-sec"><div class="card"><div><div class="sec-title"><span class="mk"></span>${T.clips}</div><div class="sec-sub">${S.consent.video ? T.clipsSub : ''}</div></div>
    ${S.consent.video && S.highlights.length ? `<div class="clips">${S.highlights.map(h => clip(h, l)).join('')}</div><div class="privacy-note">${IC.lock}<span>${l === 'en' ? 'Shared copies of this report never include video.' : '转发给家人的版本不含视频。'}</span></div>` : `<div class="privacy-note">${IC.lock}<span>${T.noClips}</span></div>`}</div></div>
  <div class="rp-sec"><div class="card" style="gap:0"><div class="sec-title" style="margin-bottom:6px"><span class="mk"></span>${T.details}</div>${DIMS.map(dimCard).join('')}</div></div>
  <div class="rp-sec"><div class="card" style="gap:0"><div class="sec-title" style="margin-bottom:6px"><span class="mk"></span>${T.qual}</div>${QUALITIES.map(q => `<div class="qline"><span class="n">${esc(q[l])}<small style="color:${S.qualities[q.id] === 3 ? 'var(--good)' : S.qualities[q.id] === 1 ? 'var(--warn)' : 'var(--ink-3)'}">${QLEVELS[S.qualities[q.id]][l]}</small></span><span>${esc(q.obs[l])}</span></div>`).join('')}</div></div>
  <div class="rp-sec" id="nextSec"><div class="card"><div class="sec-title"><span class="mk" style="background:var(--accent)"></span>${T.nextSec}</div>
    <div class="rec-card"><span class="k">${T.rec}</span><h3>${esc(rec[l])}</h3><p>${l === 'en' ? `Build up ${g.map(d => DIM[d].en).join(' and ')}; keep stretching ${st.map(d => DIM[d].en).join(' and ')}.` : `重点加强${g.map(d => '「' + DIM[d].zh + '」').join('、')}，同时让${st.map(d => '「' + DIM[d].zh + '」').join('、')}的优势继续往前走。`}</p></div>
    <div><b class="small">${T.lessons}</b>${picks.map(p => `<div class="lesson"><span class="no"><span class="badge" style="--c:${p.role === 'focus' ? 'var(--accent)' : DIM[p.dim].color}">${p.role === 'focus' ? T.focus : T.strength}</span>${l === 'en' ? (p.term === 'fall' ? 'Fall' : 'Spring') + ' #' + p.no : (p.term === 'fall' ? '秋季' : '春季') + '第 ' + p.no + ' 讲'}</span><span><span class="t">${esc(p.topic)} · ${esc(p.kp[l])}</span><br><span class="w">${esc(p.why[l])}</span></span></div>`).join('')}</div>
    ${S.booking ? `<div class="booked"><b>${IC.check} ${l === 'en' ? 'Booked' : '已预约'} ${S.booking.day} ${S.booking.time} · ${S.booking.mode === 'onsite' ? (l === 'en' ? 'on site' : '现场面谈') : (l === 'en' ? 'video call' : '视频通话')}</b><span>${l === 'en' ? `${TEACHER.name.en} will cover: Ethan's highlights, how to practice explaining at home, and how the program fits.` : `${TEACHER.name.zh}会和你聊：Ethan 的 3 个高光时刻、在家怎么练表达、学年课怎么安排。`}</span></div>` : ''}
    <div class="cta-stack">
      ${S.booking ? '' : `<button class="btn primary block" data-act="book">${T.book}</button>`}
      <div class="cta-row"><button class="btn ghost" data-act="trial">${S.trial ? (l === 'en' ? 'Spot held' : '已保留名额') : T.trial}</button><button class="btn ghost" data-act="share">${T.share}</button></div>
      <div class="consent-row" style="align-items:center"><div class="grow small">${T.sub}</div><button class="switch ${S.subscribed ? 'on' : ''}" data-act="sub" role="switch" aria-checked="${S.subscribed}" aria-label="${T.sub}"></button></div>
    </div></div></div>
  <div class="rp-sec"><div class="card about"><div class="sec-title"><span class="mk"></span>${T.about}</div>
    <dl>${l === 'en' ? `<dt>How</dt><dd>A 25-minute game-based booklet in a group of 3; one teacher led and one teacher recorded only Ethan. Ethan could answer in Chinese or English.</dd><dt>Levels</dt><dd>${[4, 3, 2, 1].map(v => `${LEVELS[v].en}: ${LEVELS[v].def.en}`).join('; ')}.</dd><dt>Keep in mind</dt><dd>Four-year-olds vary day to day. This is a snapshot, not a verdict; we re-check in 3 months. No rankings or comparisons with other children.</dd>`
      : `<dt>怎么测</dt><dd>3 人一组的 25 分钟游戏化题册；主讲老师带题，王老师全程只记录 Ethan。中英文作答都算数。</dd><dt>等级含义</dt><dd>${[4, 3, 2, 1].map(v => `${LEVELS[v].zh}：${LEVELS[v].def.zh}`).join('；')}。</dd><dt>请注意</dt><dd>4 岁孩子每天状态不同，这是一次快照，不是定论；3 个月后可以复测。报告不做排名，也不和别的孩子比较。</dd>`}</dl></div></div>
  <div class="rp-foot"><div>${T.clear}</div><div class="fb">${S.feedback ? `<span>${T.thanks}</span>` : `<button class="btn sm ghost" data-act="fb" data-v="yes">${T.yes}</button><button class="btn sm ghost" data-act="fb" data-v="no">${T.no}</button>`}</div><div>${T.foot}</div></div>
  </div>`;
};

SCREENS.crm = () => {
  const a = S.an, sent = !!S.review.elapsed;
  const sig = [];
  if (!sent && !a.opens) sig.push({ t: '报告还没发送' });
  if (a.opens) sig.push({ t: `打开 ${a.opens} 次` });
  const secs = a.seconds + (S.screen === 'report' && a.lastOpen ? (Date.now() - a.lastOpen) / 1000 : 0);
  if (secs > 3) sig.push({ t: `阅读 ${mmss(secs)}` });
  if (a.plays) sig.push({ t: `听了 ${a.plays} 次语音`, hot: a.plays >= 2 });
  if (a.dims.length) sig.push({ t: '展开：' + a.dims.map(d => DIM[d].short.zh).join('、'), hot: a.dims.length >= 2 });
  if (a.sawNext) sig.push({ t: '看到了「下一步」' });
  if (S.booking) sig.push({ t: `已预约 ${S.booking.day} ${S.booking.time}`, hot: true });
  if (S.trial) sig.push({ t: '点了试听', hot: true });
  if (S.shared) sig.push({ t: '转发给家人', hot: true });
  if (S.subscribed) sig.push({ t: '订阅了在家小游戏' });
  const score = (a.opens >= 2) + (secs >= 90) + (a.plays >= 1) + (a.dims.length >= 2) + a.sawNext + (S.booking ? 3 : 0) + (S.trial ? 2 : 0) + S.shared;
  const intent = score >= 4 ? 'high' : score >= 2 ? 'mid' : a.opens ? 'low' : 'todo';
  const IN = { high: ['高意向', 'var(--accent)'], mid: ['中意向', 'var(--warn)'], low: ['低意向', 'var(--ink-3)'], todo: ['待跟进', 'var(--ink-3)'] };
  const concerns = S.q.concerns.map(id => CONCERNS.find(c => c.id === id).zh).join('、') || '未填写';
  const next = S.booking ? `按预约时间解读。开场先放 Q2 拼火箭片段，再讲「你是怎么知道的」练习。家长测前最关心：${concerns}。`
    : a.dims.includes('exp') ? `家长看了「数学表达」。讲座结束后在现场找 Ethan 妈妈，从「会做但说不出理由」聊起，邀请预约 15 分钟解读。`
    : a.opens ? `讲座结束后现场打个招呼，带一句老师原话：「Ethan 的空间感在这组里很突出」。` : '报告发出后，讲座结束时在门口把二维码递给家长。';
  const lead = (x, isEthan) => {
    const [label, c] = IN[x.intent] || IN.todo;
    return `<div class="lead" style="--c:${c}"><div class="row between"><div class="row"><div class="avatar" style="--c:${x.c}">${x.initial}</div><div><h3>${esc(x.name)}</h3><div class="tiny faint">${esc(x.age)} · ${esc(x.sent)}</div></div></div><span class="intent" style="--c:${c}">${label}</span></div>
      <div class="signals">${x.signals.map(s => typeof s === 'string' ? `<span>${esc(s)}</span>` : `<span class="${s.hot ? 'hot' : ''}">${esc(s.t)}</span>`).join('')}</div>
      <div class="nextstep"><b>建议下一步</b>${esc(x.next)}</div>
      ${isEthan ? `<div class="row"><button class="btn sm ghost" data-act="go" data-to="report">查看报告</button><button class="btn sm ghost" data-act="copy-script">复制跟进要点</button></div>` : ''}</div>`;
  };
  const ethan = { name: 'Ethan W.', initial: 'E', age: '4 岁 3 个月', c: 'var(--dim-spa)', intent, sent: sent ? '今天 10:58 发送' : '测评中', signals: sig, next };
  const all = [{ ...ethan, me: 1 }, ...LEADS].sort((x, y) => ['high', 'mid', 'low', 'todo'].indexOf(x.intent) - ['high', 'mid', 'low', 'todo'].indexOf(y.intent));
  const opened = 1 + (a.opens ? 1 : 0), booked = S.booking ? 1 : 0;
  return `<div class="scr"><div class="t-head"><div class="tiny faint">课程顾问 · Amy · ${SESSION.group}讲座 ${SESSION.talk.ends} 结束</div><h2>今日跟进</h2></div>
  <div class="pad stack">
    <div class="kpis"><div class="kpi"><b>4</b><span>今日报告</span></div><div class="kpi"><b>${opened}</b><span>已读</span></div><div class="kpi"><b>${booked}</b><span>预约解读</span></div><div class="kpi"><b>${all.filter(x => x.intent === 'high').length}</b><span>高意向</span></div></div>
    ${all.map(x => lead(x, !!x.me)).join('')}
    <p class="tiny faint">信号只来自报告内的打开和点击，报告底部已告知家长。按意向排序，带着报告里的具体内容去聊。</p>
  </div></div>`;
};

/* ---------- guide ---------- */
const STEP_OF = s => GUIDE.findIndex(g => g.s === s || (g.alias || []).includes(s));
function renderGuide() {
  const el = $('#guide'); if (!el) return;
  const cur = STEP_OF(S.screen), g = GUIDE[cur] || GUIDE[0];
  const roleCls = { parent: 'role-parent', teacher: 'role-teacher', sales: 'role-sales' }, roleName = { parent: '家长', teacher: '老师', sales: '顾问' };
  el.innerHTML = `
    <div class="g-brand"><span class="g-kicker">概念演示 · 面试作业 · 非官方页面</span>
      <h1 class="g-title">PreK 成长测评<small>把纸质 A+/A/B/C 记录表，变成记录老师边测边记、讲座结束前送到家长手机、30 秒能看懂的成长报告。</small></h1>
      <div class="g-status"><span class="g-pill ${AI.fn ? 'on' : ''}"><i></i>AI：${AI.fn ? 'Claude 已连接' : AI.state === 'checking' ? '检测中' : '演示模式'}</span><span class="g-pill ${S.micMode === 'mic' ? 'on' : ''}"><i></i>语音：${S.micMode === 'mic' ? '真实麦克风' : '模拟识别'}</span><span class="g-pill"><i></i>示例数据</span></div>${window.DOC_URL ? `<a class="btn sm ink" style="align-self:flex-start;text-decoration:none" href="${window.DOC_URL}">阅读 Design Doc →</a>` : ''}</div>
    <nav class="g-steps" aria-label="演示步骤">${GUIDE.map((s, i) => `<button class="g-step ${i === cur ? 'active' : ''} ${S.visited[s.s] && i !== cur ? 'done' : ''}" data-act="go" data-to="${s.s}"><span class="g-dot">${i + 1}</span><span class="g-step-body"><span class="g-role"><b class="${roleCls[s.role]}">${roleName[s.role]}</b></span><span class="g-step-title">${esc(s.title)}</span></span></button>`).join('')}</nav>
    <section class="g-tips"><h3>这一步可以试</h3><ul>${g.tips.map(t => `<li class="try">${esc(t)}</li>`).join('')}</ul><h3>设计要点</h3><ul>${g.why.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>
    <div class="g-foot"><button data-act="reset">重置演示数据</button><button class="guide-close btn sm ghost" data-act="guide-close">收起导览</button><span>示例数据，孩子和老师均为虚构。片段以动画代替真实录像。</span></div>`;
}

/* ---------- render ---------- */
let revTick;
function render() {
  const scr = $('#screen');
  const same = scr.dataset.s === S.screen, top = scr.scrollTop;
  scr.innerHTML = SCREENS[S.screen]();
  scr.dataset.s = S.screen;
  scr.scrollTop = same ? top : 0;
  $('#phone').style.setProperty('--status-bg', ['consent', 'report'].includes(S.screen) ? 'var(--surface-3)' : 'var(--surface)');
  renderGuide();
  const tb = $('#talkBtn'); if (tb) bindTalk(tb);
  const ti = $('#talkInput'); if (ti) ti.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); sendText(); } });
  if (S.screen === 'treview' && !S.review.generated) runGen();
  clearInterval(revTick);
  if (S.screen === 'treview' && S.review.generated) revTick = setInterval(() => { const t = $('#revTimer'); if (t) t.textContent = t.textContent.replace(/用时 [\d:]+/, '用时 ' + mmss((Date.now() - S.review.startedAt) / 1000)); }, 1000);
  if (S.screen === 'report') watchNext();
  save();
}
let genRunning = false;
async function runGen() {
  if (genRunning) return; genRunning = true;
  const steps = [...document.querySelectorAll('#gen .gen-step')];
  for (const s of steps) { await sleep(420); s.classList.add('done'); }
  await sleep(300);
  S.review.generated = true; S.review.startedAt = Date.now(); genRunning = false;
  if (S.screen === 'treview') render();
}
let io;
function watchNext() {
  if (io) io.disconnect();
  const t = $('#nextSec'); if (!t || !('IntersectionObserver' in window)) return;
  io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { S.an.sawNext = true; save(); io.disconnect(); } }, { root: $('#screen'), threshold: 0.3 });
  io.observe(t);
}
function go(to) {
  stopPlay();
  if (S.screen === 'report' && to !== 'report' && S.an.lastOpen) { S.an.seconds += (Date.now() - S.an.lastOpen) / 1000; S.an.lastOpen = null; }
  if (to === 'report' && S.screen !== 'report') { S.an.opens++; S.an.lastOpen = Date.now(); }
  S.screen = to; S.visited[to] = 1;
  closeLayer(); $('#app').classList.remove('guide-open');
  render();
}

/* ---------- layer: sheets, toasts ---------- */
const layer = () => $('#layer');
function closeLayer() { layer().querySelectorAll('.scrim,.sheet').forEach(n => n.remove()); }
function sheet(html) { closeLayer(); layer().insertAdjacentHTML('beforeend', `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><span class="grab"></span>${html}</div>`); }
let toastT;
function toast(msg) {
  layer().querySelectorAll('.toast').forEach(n => n.remove());
  layer().insertAdjacentHTML('beforeend', `<div class="toast" role="status">${esc(msg)}</div>`);
  clearTimeout(toastT); toastT = setTimeout(() => layer().querySelectorAll('.toast').forEach(n => n.remove()), 2200);
}

/* ---------- voice: record (demo or mic), playback ---------- */
let REC = null;
const MIC = { stream: null };
function hud() {
  let h = layer().querySelector('.rec-hud');
  if (!REC) { if (h) h.remove(); return; }
  if (!h) { layer().insertAdjacentHTML('beforeend', `<div class="rec-hud" aria-live="polite"><div class="rec-wave">${Array.from({ length: 14 }, (_, i) => `<i style="animation-delay:${(i * 0.07).toFixed(2)}s"></i>`).join('')}</div><div class="rec-text"></div><div class="rec-time"></div><div class="rec-hint"></div></div>`); h = layer().querySelector('.rec-hud'); }
  h.classList.toggle('cancel', REC.cancel);
  h.querySelector('.rec-text').textContent = REC.text || '正在听…';
  h.querySelector('.rec-time').textContent = mmss((performance.now() - REC.t0) / 1000);
  h.querySelector('.rec-hint').textContent = REC.cancel ? '松开手指，取消发送' : '松开 发送 · 上滑 取消';
}
function recStart() {
  if (REC) return;
  REC = { t0: performance.now(), cancel: false, text: '', task: S.task };
  if (S.micMode === 'mic' && MIC.stream) {
    try {
      REC.chunks = []; REC.mr = new MediaRecorder(MIC.stream);
      REC.mr.ondataavailable = e => e.data.size && REC && REC.chunks.push(e.data);
      REC.mr.start();
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) { const r = new SR(); r.lang = 'zh-CN'; r.interimResults = true; r.continuous = true; r.onresult = e => { if (!REC) return; REC.text = [...e.results].map(x => x[0].transcript).join(''); hud(); }; try { r.start(); } catch (e) { /* ignore */ } REC.sr = r; }
    } catch (e) { S.micMode = 'demo'; }
  }
  if (S.micMode !== 'mic' || !REC.mr) {
    const list = DEMO_SCRIPTS[REC.task] || DEMO_SCRIPTS.wrap;
    const i = (S.scriptIdx[REC.task] || 0) % list.length;
    REC.script = list[i]; let k = 0;
    REC.typer = setInterval(() => { if (!REC) return; k += 2; REC.text = REC.script.raw.slice(0, k); hud(); if (k >= REC.script.raw.length) clearInterval(REC.typer); }, 110);
  }
  REC.clock = setInterval(hud, 250); hud();
}
function recStop() {
  const r = REC; if (!r) return; REC = null;
  clearInterval(r.typer); clearInterval(r.clock); hud();
  const held = (performance.now() - r.t0) / 1000;
  const finish = (fn) => { if (r.sr) try { r.sr.stop(); } catch (e) { /* ignore */ } if (r.mr && r.mr.state !== 'inactive') { r.mr.onstop = fn; r.mr.stop(); } else fn(); };
  if (r.cancel) { finish(() => {}); toast('已取消'); return; }
  if (held < 0.6) { finish(() => {}); toast('说话时间太短'); return; }
  if (r.script) {
    S.scriptIdx[r.task] = (S.scriptIdx[r.task] || 0) + 1;
    const n = { id: uid(), task: r.task, dim: r.script.dim, kind: r.script.kind, raw: r.script.raw, dur: Math.max(2, Math.round(r.script.raw.length / 4.6)), status: 'pending', source: 'demo', script: r.script };
    S.notes.push(n); render(); scrollToEnd(); polish(n); return;
  }
  finish(() => {
    const url = r.chunks && r.chunks.length ? URL.createObjectURL(new Blob(r.chunks, { type: r.mr.mimeType || 'audio/webm' })) : null;
    const n = { id: uid(), task: r.task, dim: null, kind: null, raw: r.text || '', dur: Math.max(1, Math.round(held)), status: 'pending', source: 'mic', audioUrl: url };
    S.notes.push(n); render(); scrollToEnd(); polish(n);
  });
}
function scrollInScreen(el, where) {
  const scr = $('#screen'); if (!el || !scr) return;
  const r = el.getBoundingClientRect(), sr = scr.getBoundingClientRect();
  const top = where === 'end' ? scr.scrollTop + r.bottom - sr.bottom + 90 : scr.scrollTop + r.top - sr.top - 56;
  scr.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}
function scrollToEnd() { const th = document.querySelectorAll('#screen .thread'); scrollInScreen(th[th.length - 1], 'end'); }
function bindTalk(btn) {
  let y0 = 0;
  btn.addEventListener('pointerdown', e => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } y0 = e.clientY; btn.classList.add('down'); btn.textContent = '松开 结束'; stopPlay(); recStart(); });
  btn.addEventListener('pointermove', e => { if (!REC) return; const c = y0 - e.clientY > 60; if (c !== REC.cancel) { REC.cancel = c; hud(); } });
  const end = () => { btn.classList.remove('down'); btn.textContent = '按住 说话'; recStop(); };
  btn.addEventListener('pointerup', end);
  btn.addEventListener('pointercancel', () => { if (REC) REC.cancel = true; end(); });
  btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); if (!REC) { btn.textContent = '再按一次 结束'; recStart(); } else end(); } });
}
function sendText() {
  const i = $('#talkInput'); const v = i && i.value.trim(); if (!v) return;
  const n = { id: uid(), task: S.task, dim: null, kind: null, raw: v, dur: Math.max(2, Math.round(v.length / 4.6)), status: 'pending', source: 'typed' };
  S.notes.push(n); render(); scrollToEnd(); polish(n);
}
let PLAY = null;
function stopPlay() {
  if (!PLAY) return;
  const p = PLAY; PLAY = null;
  clearTimeout(p.timer);
  if (p.audio) { p.audio.pause(); }
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  document.querySelectorAll('.voice.playing').forEach(v => v.classList.remove('playing'));
}
function playNote(id, el) {
  const was = PLAY && PLAY.id;
  stopPlay();
  if (was === id) return;
  const n = S.notes.find(x => x.id === id); if (!n) return;
  el.classList.add('playing'); n.read = true; const u = el.querySelector('.unread'); if (u) u.remove();
  if (S.screen === 'report') S.an.plays++;
  PLAY = { id };
  const done = () => { if (PLAY && PLAY.id === id) stopPlay(); };
  PLAY.timer = setTimeout(done, (n.dur + 1.5) * 1000);
  if (n.audioUrl) { const a = new Audio(n.audioUrl); PLAY.audio = a; a.onended = done; a.play().catch(done); }
  else {
    try {
      if ('speechSynthesis' in window) {
        const ut = new SpeechSynthesisUtterance(n.raw); ut.lang = 'zh-CN'; ut.rate = 1.05;
        const v = speechSynthesis.getVoices().find(x => /zh[-_](CN|Hans)/i.test(x.lang)); if (v) ut.voice = v;
        ut.onend = done; speechSynthesis.cancel(); speechSynthesis.speak(ut);
        clearTimeout(PLAY.timer); PLAY.timer = setTimeout(done, Math.max(n.dur, n.raw.length / 3.5) * 1000 + 2000);
      }
    } catch (e) { /* timer still ends it */ }
  }
  save();
}
try { if ('speechSynthesis' in window) speechSynthesis.getVoices(); } catch (e) { /* ignore */ }

/* ---------- actions ---------- */
function act(a, el) {
  const d = el.dataset;
  switch (a) {
    case 'go': return go(d.to);
    case 'q': {
      const g = d.g;
      if (g === 'lang') S.q.lang = d.id;
      else { const arr = S.q[g]; const i = arr.indexOf(d.id); if (i >= 0) arr.splice(i, 1); else { arr.push(d.id); if (g === 'concerns' && arr.length > 2) arr.shift(); } }
      return render();
    }
    case 'consent': S.consent[d.k] = !S.consent[d.k]; return render();
    case 'submit-consent': S.consent.submitted = true; toast(S.consent.video ? '已提交 · 已授权录制精彩片段' : '已提交 · 未授权录像'); return render();
    case 'task': S.task = d.n === 'wrap' ? 'wrap' : +d.n; render(); $('#screen').scrollTop = 0; return;
    case 'prev': if (S.task !== 'wrap' && S.task > 1) { S.task--; render(); $('#screen').scrollTop = 0; } return;
    case 'next': S.task = S.task === 11 ? 'wrap' : S.task + 1; render(); $('#screen').scrollTop = 0; return;
    case 'rate': S.ratings[d.item] = +d.lv; resetReview(); return render();
    case 'chip': { const arr = S.chips[S.task]; const i = arr.indexOf(d.c); if (i >= 0) arr.splice(i, 1); else arr.push(d.c); return render(); }
    case 'qual': S.qualities[d.q] = +d.v; resetReview(); return render();
    case 'kbd': S.kbd = !S.kbd; render(); if (S.kbd) { const i = $('#talkInput'); if (i) i.focus(); } return;
    case 'send-text': return sendText();
    case 'mic': return toggleMic();
    case 'plus': return plusSheet();
    case 'mark-hl': {
      closeLayer();
      if (!S.consent.video) return toast('家长未授权录像，不能保存片段');
      const t = TASK[S.task]; if (!t) return toast('请在具体题目里标记');
      S.highlights.push({ id: uid(), task: t.id, scene: t.scene || 'generic' }); toast('已保存前 20 秒片段，会出现在家长报告的「精彩瞬间」'); return render();
    }
    case 'upload-video': { closeLayer(); if (!S.consent.video) return toast('家长未授权录像，不能上传片段'); $('#vidInput').click(); return; }
    case 'close-sheet': return closeLayer();
    case 'generate': S.review.generated = false; S.review.confirmed = {}; return go('treview');
    case 'confirm': S.review.confirmed[d.k] = true; return render();
    case 'unconfirm': delete S.review.confirmed[d.k]; return render();
    case 'confirm-all': ['summary', 'strengths', 'growth', 'home', 'path'].forEach(k => (S.review.confirmed[k] = true)); return render();
    case 'edit': S.review.editing = true; render(); { const t = $('#editArea'); if (t) t.focus(); } return;
    case 'cancel-edit': S.review.editing = false; return render();
    case 'save-edit': { const v = $('#editArea').value.trim(); if (v) { S.review.edit = { zh: v, en: null, note: summary(scores()).note }; } S.review.editing = false; delete S.review.confirmed.summary; return render(); }
    case 'rewrite': return aiRewriteSummary();
    case 'send': return sendSheet();
    case 'send-via': closeLayer(); S.review.elapsed = (Date.now() - S.review.startedAt) / 1000; return go('tsent');
    case 'play': return playNote(d.id, el);
    case 'raw': S._raw = S._raw === d.id ? null : d.id; return render();
    case 'lang': S.lang = d.l; return render();
    case 'dim': { const i = S.openDims.indexOf(d.dim); if (i >= 0) S.openDims.splice(i, 1); else { S.openDims.push(d.dim); if (!S.an.dims.includes(d.dim)) S.an.dims.push(d.dim); } return render(); }
    case 'jump': {
      if (S.screen !== 'report') return;
      if (!S.openDims.includes(d.dim)) S.openDims.push(d.dim);
      if (!S.an.dims.includes(d.dim)) S.an.dims.push(d.dim);
      render(); scrollInScreen($('#dim-' + d.dim), 'start'); return;
    }
    case 'scene': { const sc = el.closest('.scene'); sc.classList.remove('playing'); void sc.offsetWidth; sc.classList.add('playing'); clearTimeout(sc._t); sc._t = setTimeout(() => sc.classList.remove('playing'), 6500); return; }
    case 'book': return bookSheet();
    case 'slot': S._slot = { day: d.day, time: d.time }; layer().querySelectorAll('.slot').forEach(s => s.classList.toggle('on', s === el)); { const b = $('#bookGo'); if (b) b.disabled = false; } return;
    case 'mode': S._mode = d.m; layer().querySelectorAll('[data-act="mode"]').forEach(s => s.classList.toggle('on', s === el)); return;
    case 'book-confirm': if (!S._slot) return; S.booking = { ...S._slot, mode: S._mode || 'onsite' }; closeLayer(); toast(L() === 'en' ? 'Booked. The teacher will see you then.' : '已预约，老师会准时和你聊'); return render();
    case 'trial': S.trial = true; toast(L() === 'en' ? 'A trial spot is held for Ethan' : '已为 Ethan 保留试听名额'); return render();
    case 'share': S.shared = true; return shareSheet();
    case 'copy': { const txt = d.text; try { navigator.clipboard.writeText(txt).then(() => toast('已复制'), () => toast('复制失败，请手动选择文字')); } catch (e) { toast('复制失败，请手动选择文字'); } return; }
    case 'copy-script': {
      const sc = scores(), st = strengths(sc), g = growth(sc);
      const txt = `Ethan 跟进要点：强项 ${st.map(x => DIM[x].zh).join('、')}；下一步 ${g.map(x => DIM[x].zh).join('、')}；家长关心 ${S.q.concerns.map(id => CONCERNS.find(c => c.id === id).zh).join('、')}；推荐 ${recommend(sc).zh}。`;
      try { navigator.clipboard.writeText(txt).then(() => toast('跟进要点已复制'), () => toast(txt)); } catch (e) { toast(txt); } return;
    }
    case 'sub': S.subscribed = !S.subscribed; return render();
    case 'fb': S.feedback = d.v; return render();
    case 'reset': stopPlay(); S = fresh(); toast('演示数据已重置'); closeLayer(); return render();
    case 'guide-open': return $('#app').classList.add('guide-open');
    case 'guide-close': return $('#app').classList.remove('guide-open');
  }
}
function resetReview() { S.review.confirmed = {}; S.review.summary = null; S.review.edit = null; }
async function toggleMic() {
  if (S.micMode === 'mic') { S.micMode = 'demo'; toast('已切换为示例语音'); return render(); }
  try {
    if (!navigator.mediaDevices || !window.MediaRecorder) throw new Error('unsupported');
    MIC.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    S.micMode = 'mic'; toast('麦克风已开启：录音会保存原声，Chrome / Safari 支持实时转写');
  } catch (e) { S.micMode = 'demo'; toast('当前环境不能使用麦克风（发布的页面不开放麦克风），继续用示例语音'); }
  render();
}
function plusSheet() {
  sheet(`<h3>更多</h3>
    <button class="btn block ${S.consent.video ? 'wx' : ''}" data-act="mark-hl">标记精彩瞬间（保存前 20 秒）</button>
    <button class="btn block ghost" data-act="upload-video">拍摄 / 上传一段视频</button>
    <p class="tiny faint">${S.consent.video ? '家长已授权录像。片段仅家长和记录老师可见，90 天后自动删除。' : '家长未授权录像，片段功能不可用。可回到第 1 步打开授权。'}</p>
    <button class="btn block ghost" data-act="close-sheet">取消</button>`);
}
function sendSheet() {
  sheet(`<h3>发送给 Ethan 妈妈</h3>
    <div class="share-opts"><button data-act="send-via"><span class="ic wx">微</span>微信</button><button data-act="send-via"><span class="ic">信</span>短信</button><button data-act="send-via"><span class="ic">@</span>邮件</button><button data-act="send-via"><span class="ic">∞</span>复制链接</button></div>
    <p class="tiny faint">一个链接，微信、Safari、WhatsApp 都能直接打开，不需要下载 App。顾问 Amy 会同步收到提醒。</p>`);
}
function bookSheet() {
  const l = L();
  const days = [{ k: '10/22', zh: '今天', en: 'Today', t: ['11:15', '11:30', '11:45'] }, { k: '10/23', zh: '周五', en: 'Fri', t: ['16:00', '19:30', '20:00'] }, { k: '10/24', zh: '周六', en: 'Sat', t: ['10:00', '10:30', '14:00'] }];
  S._slot = null; S._mode = 'onsite';
  sheet(`<h3>${l === 'en' ? 'Book a 15-min chat' : '预约 15 分钟老师解读'}</h3>
    <div class="seg" style="align-self:flex-start"><button class="on" data-act="mode" data-m="onsite">${l === 'en' ? 'On site' : '现场面谈'}</button><button data-act="mode" data-m="video">${l === 'en' ? 'Video call' : '视频通话'}</button></div>
    ${days.map(dy => `<div class="stack" style="gap:6px"><span class="small faint">${dy.k} ${dy[l]}${dy.k === '10/22' ? (l === 'en' ? ' · right after the talk' : ' · 讲座结束后') : ''}</span><div class="slots">${dy.t.map(t => `<button class="slot" data-act="slot" data-day="${dy.k}" data-time="${t}">${t}</button>`).join('')}</div></div>`).join('')}
    <p class="tiny faint">${l === 'en' ? "You'll talk with the teacher who watched Ethan's session." : '和全程记录 Ethan 的王老师聊，不是电话销售。'}</p>
    <button class="btn primary block" id="bookGo" data-act="book-confirm" disabled>${l === 'en' ? 'Confirm' : '确认预约'}</button>`);
}
function shareSheet() {
  const l = L(), sc = scores(), link = 'https://example.com/r/ethan-7Kq2';
  sheet(`<h3>${l === 'en' ? 'Share with family' : '转发给家人'}</h3>
    <div class="wx-chat" style="padding:12px"><div class="msg"><div class="avatar" style="--c:var(--accent)">妈</div><div class="msg-body"><div class="wx-card"><h4>${esc(RT[l].title)}</h4><div class="d"><span>${esc(summary(sc)[l] || summary(sc).zh).slice(0, 36)}…</span><span class="thumb">${radar(sc, { mini: true })}</span></div><div class="from">PreK ${l === 'en' ? 'Growth Snapshot' : '成长测评'}</div></div></div></div></div>
    <p class="tiny faint">${l === 'en' ? 'The shared copy has the summary, chart and home games, but no video.' : '分享版包含总结、雷达图和在家小游戏，不含视频片段。'}</p>
    <div class="copybox"><code>${link}</code><button class="btn sm ghost" data-act="copy" data-text="${link}">${l === 'en' ? 'Copy' : '复制'}</button></div>`);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  act(el.dataset.act, el);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('g[data-act]')) { e.preventDefault(); act(e.target.dataset.act, e.target); }
  if (e.key === 'Escape') closeLayer();
});
document.addEventListener('change', e => {
  if (e.target.id === 'vidInput' && e.target.files[0]) {
    const url = URL.createObjectURL(e.target.files[0]);
    S.highlights.push({ id: uid(), task: S.task === 'wrap' ? 11 : S.task, url });
    e.target.value = ''; toast('片段已保存，会出现在家长报告里'); render();
  }
});
window.addEventListener('beforeunload', () => { if (S.screen === 'report' && S.an.lastOpen) { S.an.seconds += (Date.now() - S.an.lastOpen) / 1000; S.an.lastOpen = Date.now(); } save(); });

const firstVisit = !load();
/* Direct links: #parent #teacher #review #report #consultant open one view (for sharing a single screen in WeChat). */
const HASH = { parent: 'consent', consent: 'consent', teacher: 'tlist', review: 'treview', report: 'report', consultant: 'crm', crm: 'crm' };
const h = (location.hash || '').slice(1);
if (HASH[h]) {
  if (['report', 'crm'].includes(HASH[h])) { S.consent.video = true; S.consent.submitted = true; if (!S.review.elapsed) { S.review.generated = true; S.review.elapsed = 96; ['summary', 'strengths', 'growth', 'home', 'path'].forEach(k => (S.review.confirmed[k] = true)); } }
  if (HASH[h] === 'report' && S.screen !== 'report') { S.an.opens++; }
  S.screen = HASH[h]; S.visited[S.screen] = 1;
}
if (S.screen === 'report') S.an.lastOpen = Date.now();
render();
if (firstVisit && !HASH[h] && window.matchMedia('(max-width: 980px)').matches) $('#app').classList.add('guide-open');
})();
