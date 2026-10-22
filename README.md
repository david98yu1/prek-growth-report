# PreK 成长测评 · 概念演示

面试作业概念稿（非官方页面）：把纸质 A+/A/B/C 测评记录表，升级为「记录老师在线点选 + 语音备注 → AI 起草、老师确认 → 家长手机端成长报告 → 预约老师解读」的闭环。

- 可交互 Demo：https://david98yu1.github.io/prek-growth-report/
- Design Doc：https://david98yu1.github.io/prek-growth-report/doc/
- 直达：`#report` 家长报告 · `#teacher` 记录老师 · `#consultant` 顾问看板

示例数据，孩子和老师均为虚构；视频片段用动画代替真实录像。

## 结构

- `src/` 源码：`styles.css`、`data.js`（示例内容）、`app.js`（交互）、`shell.html`、`doc.md`（Design Doc）
- `build.py` 生成 `site/`（GitHub Pages）和 `dist/`（单文件版）：`python3 build.py`
