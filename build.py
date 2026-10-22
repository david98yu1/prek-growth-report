"""Build outputs from src/.
dist/artifact.html            page fragment for the claude.ai artifact
dist/prek-growth-report.html  standalone demo (open locally)
site/index.html               public demo (GitHub Pages), links to site/doc/
site/doc/index.html           Design Doc rendered from src/doc.md
"""
import html, pathlib, re
root = pathlib.Path(__file__).parent
src = root / 'src'
read = lambda n: (src / n).read_text(encoding='utf-8')

def page(extra_head=''):
    return (read('shell.html').replace('/*CSS*/', read('styles.css'))
            .replace('/*DATA*/', read('data.js')).replace('/*APP*/', read('app.js'))
            .replace('<script>\n', extra_head + '<script>\n', 1))

def standalone(fragment):
    head, body = fragment.split('<div class="app" id="app">', 1)
    return ('<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + head + '</head>\n<body>\n<div class="app" id="app">' + body + '\n</body>\n</html>\n')

def inline(t):
    t = html.escape(t, quote=False)
    return re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', lambda m: f'<a href="{html.escape(m.group(2))}"' + ('' if m.group(2).startswith(('../', '#')) else ' target="_blank" rel="noopener"') + f'>{m.group(1)}</a>', t)

def md(text):
    out, toc, lines, i = [], [], text.split('\n'), 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip(): i += 1; continue
        if ln.startswith('# '): out.append(f'<h1>{inline(ln[2:])}</h1>'); i += 1; continue
        if ln.startswith('## '):
            n = len(toc) + 1; toc.append((n, ln[3:])); out.append(f'<h2 id="s{n}">{inline(ln[3:])}</h2>'); i += 1; continue
        if ln.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'): rows.append(lines[i]); i += 1
            cells = lambda r: [c.strip() for c in r.strip().strip('|').split('|')]
            hd = ''.join(f'<th>{inline(c)}</th>' for c in cells(rows[0]))
            bd = ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in cells(r)) + '</tr>' for r in rows[2:])
            out.append(f'<div class="tw"><table><thead><tr>{hd}</tr></thead><tbody>{bd}</tbody></table></div>'); continue
        if re.match(r'\d+\. ', ln) or ln.startswith('- '):
            tag = 'ol' if re.match(r'\d+\. ', ln) else 'ul'; items = []
            while i < len(lines) and (re.match(r'\d+\. ', lines[i]) if tag == 'ol' else lines[i].startswith('- ')):
                items.append(re.sub(r'^(\d+\. |- )', '', lines[i])); i += 1
            out.append(f'<{tag}>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + f'</{tag}>'); continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r'(#|\||- |\d+\. )', lines[i]): para.append(lines[i]); i += 1
        out.append(f'<p>{inline(" ".join(para))}</p>')
    return out, toc

DOC_CSS = """
:root{--bg:#fff8ea;--paper:#ffffff;--ink:#2b241d;--ink2:#5a5047;--ink3:#8a7e72;--line:#f0e3c4;--brand:#f5a83a;--accent:#e0661b;--green:#275939;--cream:#fdf7df;--th:#fdf1d6}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#1d1712;--paper:#2a2219;--ink:#f6eee2;--ink2:#cdbfae;--ink3:#9c8e7e;--line:#43372a;--accent:#f59a4a;--green:#2f6b45;--cream:#2a2219;--th:#3a2f23;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#1d1712;--paper:#2a2219;--ink:#f6eee2;--ink2:#cdbfae;--ink3:#9c8e7e;--line:#43372a;--accent:#f59a4a;--green:#2f6b45;--cream:#2a2219;--th:#3a2f23;color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.75 -apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.band{background:var(--brand);background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.18) 0 14px,transparent 14px 28px);padding:28px max(16px,env(safe-area-inset-right,0px)) 72px max(16px,env(safe-area-inset-left,0px))}
.wrap{max-width:780px;margin:0 auto}
.kick{font-size:13px;font-weight:700;letter-spacing:.06em;color:#5a3108}
.band h1{font-size:clamp(26px,6vw,38px);line-height:1.2;margin:8px 0 6px;color:#2b1a08;text-wrap:balance}
.meta{color:#5a3108;font-size:14px}
.cta{display:inline-flex;margin-top:16px;background:var(--green);color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px;font-size:15px}
main{max-width:780px;margin:-48px auto 40px;padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px))}
.sheet{background:var(--paper);border-radius:24px;padding:24px clamp(16px,4vw,40px) 32px;box-shadow:0 10px 40px rgba(120,66,10,.12)}
.toc{background:var(--cream);border:1px solid var(--line);border-radius:16px;padding:12px 16px;margin:0 0 8px}
.toc summary{cursor:pointer;font-weight:700}
.toc ol{margin:8px 0 0;padding-left:20px;columns:2;column-gap:24px;font-size:14px}
@media (max-width:560px){.toc ol{columns:1}}
.toc a{color:var(--ink2);text-decoration:none}.toc a:hover{color:var(--accent)}
h1.doc{display:none}
h2{font-size:22px;margin:36px 0 10px;padding-top:8px;display:flex;align-items:center;gap:10px;scroll-margin-top:12px;text-wrap:balance}
h2::before{content:"";width:18px;height:18px;flex:none;background:var(--brand);clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
p{margin:10px 0}ul,ol{padding-left:22px;margin:10px 0}li{margin:4px 0}
a{color:var(--accent);text-underline-offset:3px}
.tw{overflow-x:auto;margin:14px 0;border:1px solid var(--line);border-radius:14px}
table{border-collapse:collapse;width:100%;min-width:560px;font-size:14px;line-height:1.6}
th{background:var(--th);text-align:left;font-weight:700;padding:10px 12px;border-bottom:1px solid var(--line)}
td{padding:10px 12px;border-top:1px solid var(--line);vertical-align:top}
footer{text-align:center;color:var(--ink3);font-size:13px;margin:24px 0 40px}
"""

def doc_page():
    body, toc = md(read('doc.md'))
    title = re.search(r'^# (.+)$', read('doc.md'), re.M).group(1)
    first = body.pop(0)  # h1 shown in the band
    byline = re.sub('<.*?>', '', body.pop(0))
    toc_html = '<details class="toc" open><summary>目录</summary><ol>' + ''.join(f'<li><a href="#s{n}">{html.escape(t)}</a></li>' for n, t in toc) + '</ol></details>'
    return f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="PreK 测评报告数字化：调研、测评重设计、老师端与家长端设计、转化逻辑。面试作业概念稿。">
<style>{DOC_CSS}</style></head>
<body>
<header class="band"><div class="wrap"><div class="kick">面试作业 · 概念稿 · 非官方页面</div><h1>{html.escape(title)}</h1><div class="meta">{byline}</div><a class="cta" href="../">打开可交互 Demo →</a></div></header>
<main><article class="sheet">{toc_html}{"".join(body)}</article>
<footer>示例数据，孩子与老师均为虚构。</footer></main>
</body></html>
'''

(root / 'dist').mkdir(exist_ok=True)
frag = page()
(root / 'dist' / 'artifact.html').write_text(frag, encoding='utf-8')
(root / 'dist' / 'prek-growth-report.html').write_text(standalone(frag), encoding='utf-8')
site = root / 'site'; (site / 'doc').mkdir(parents=True, exist_ok=True)
(site / 'index.html').write_text(standalone(page('<script>window.DOC_URL = "doc/";</script>\n')), encoding='utf-8')
(site / 'doc' / 'index.html').write_text(doc_page(), encoding='utf-8')
(site / '.nojekyll').write_text('', encoding='utf-8')
print('built', len(frag), 'bytes; site ready')
