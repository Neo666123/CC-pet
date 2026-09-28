const fs = require('fs');
const path = require('path');

// ==========================================
// 1. shared/i18n.js
// ==========================================
let i18n = fs.readFileSync('D:/存储/LLMPET-main/shared/i18n.js', 'utf8');

const zhToolTarget = "'tool.Wait': '等命令输出',";
const zhNewTools = [
  "'tool.Git': 'Git 同步',",
  "'tool.Archive': '压缩打包',",
  "'tool.Test': '运行测试',",
  "'tool.Build': '编译构建',",
  "'tool.Image': '审阅图片',"
].join('\n    ');

if (!i18n.includes("'tool.Git'")) {
  i18n = i18n.replace(zhToolTarget, zhToolTarget + '\n    ' + zhNewTools);
}

const enToolTarget = "'tool.Wait': 'Awaiting output',";
const enNewTools = [
  "'tool.Git': 'Git sync',",
  "'tool.Archive': 'Archiving',",
  "'tool.Test': 'Running tests',",
  "'tool.Build': 'Building project',",
  "'tool.Image': 'Reviewing image',"
].join('\n    ');

if (!i18n.includes("'tool.Git': 'Git sync'")) {
  i18n = i18n.replace(enToolTarget, enToolTarget + '\n    ' + enNewTools);
}

const jaToolTarget = "'tool.Wait': '出力待ち',";
const jaNewTools = [
  "'tool.Git': 'Git 同期',",
  "'tool.Archive': 'アーカイブ',",
  "'tool.Test': 'テスト実行',",
  "'tool.Build': 'ビルド中',",
  "'tool.Image': '画像確認',"
].join('\n    ');

if (!i18n.includes("'tool.Git': 'Git 同期'")) {
  i18n = i18n.replace(jaToolTarget, jaToolTarget + '\n    ' + jaNewTools);
}

fs.writeFileSync('D:/存储/LLMPET-main/shared/i18n.js', i18n, 'utf8');
console.log('1. shared/i18n.js updated');

// ==========================================
// 2. backend/adapter.js
// ==========================================
let adapter = fs.readFileSync('D:/存储/LLMPET-main/backend/adapter.js', 'utf8');

// TOOL_ICON
const iconTarget = "Js: '⌨️', Wait: '⏳',";
const newIcons = "Js: '⌨️', Wait: '⏳', Git: '🐙', Archive: '📦', Test: '🧪', Build: '🔨', Image: '🖼️',";
if (!adapter.includes("Git: '🐙'")) {
  adapter = adapter.replace(iconTarget, newIcons);
}

// TOOL_LABEL_KEY
const labelTarget = "Js: 'Js', Wait: 'Wait',";
const newLabels = "Js: 'Js', Wait: 'Wait', Git: 'Git', Archive: 'Archive', Test: 'Test', Build: 'Build', Image: 'Image',";
if (!adapter.includes("Git: 'Git'")) {
  adapter = adapter.replace(labelTarget, newLabels);
}

fs.writeFileSync('D:/存储/LLMPET-main/backend/adapter.js', adapter, 'utf8');
console.log('2. backend/adapter.js updated');

// ==========================================
// 3. backend/codex-watch.js (智能识别命令)
// ==========================================
let codexWatch = fs.readFileSync('D:/存储/LLMPET-main/backend/codex-watch.js', 'utf8');

// 增强 TOOL_MAP 与 directTool 识别
const inspectCommandHelper = `
function extractCommandString(payload) {
  if (!payload) return '';
  let args = payload.arguments || payload.input || payload;
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args);
    } catch {
      return args;
    }
  }
  if (args && typeof args === 'object') {
    return String(args.cmd || args.command || args.code || '');
  }
  return typeof args === 'string' ? args : '';
}

function inspectCommandAction(cmd) {
  if (!cmd || typeof cmd !== 'string') return 'Bash';
  const c = cmd.trim();
  // 1. 审阅图片
  if (/view_image|\\.png\\b|\\.jpg\\b|\\.jpeg\\b|\\.gif\\b|\\.webp\\b/i.test(c) && /Get-Content|view|open|cat|image/i.test(c)) {
    return 'Image';
  }
  // 2. 压缩 / 打包
  if (/\\b(?:tar|zip|unzip|7z|Compress-Archive|Expand-Archive)\\b/i.test(c)) {
    return 'Archive';
  }
  // 3. 运行测试
  if (/\\b(?:pytest|jest|vitest|cargo\\s+test|npm\\s+test|dotnet\\s+test)\\b/i.test(c)) {
    return 'Test';
  }
  // 4. 项目构建 / 编译
  if (/\\b(?:npm\\s+run\\s+build|yarn\\s+build|pnpm\\s+build|cargo\\s+build|make|cmake|gradle|mvn|tsc)\\b/i.test(c)) {
    return 'Build';
  }
  // 5. Git 操作
  if (/\\bgit\\s+(?:status|diff|add|commit|push|pull|checkout|branch|log|clone|merge|fetch|rebase)\\b/i.test(c)) {
    return 'Git';
  }
  // 6. 搜索代码 / 检索
  if (/\\b(?:Select-String|grep|ripgrep|rg\\b|findstr|ag\\b)/i.test(c)) {
    return 'Grep';
  }
  // 7. 查找文件 / 目录罗列
  if (/\\b(?:Get-ChildItem|find\\b|fd\\b|tree\\b|dir\\b|ls\\b)/i.test(c) && !/Select-String/i.test(c)) {
    return 'Glob';
  }
  // 8. 读取文件内容
  if (/\\b(?:Get-Content|cat\\b|head\\b|tail\\b|type\\b|gc\\b|more\\b)/i.test(c)) {
    return 'Read';
  }
  // 9. 写/修改文件
  if (/\\b(?:Set-Content|Out-File|Add-Content|echo\\b.*>|patch\\b)/i.test(c)) {
    return 'Write';
  }
  return 'Bash';
}
`;

if (!codexWatch.includes('inspectCommandAction')) {
  // 插入到 mapDirectTool 上方
  codexWatch = codexWatch.replace('function mapDirectTool(name) {', inspectCommandHelper + '\nfunction mapDirectTool(name) {');
}

// 增强 mapDirectTool 识别
const directToolOld = `function mapDirectTool(name) {
  const raw = String(name || '').trim();
  if (TOOL_MAP[raw]) return TOOL_MAP[raw];
  if (/node_repl.*(?:__|\\b)js$/i.test(raw)) return 'Js';
  if (/imagegen|image_gen/i.test(raw)) return 'Write';
  if (/web__run|browser|chrome/i.test(raw)) return 'WebSearch';
  if (/computer[-_]?use/i.test(raw)) return 'Task';
  return raw || 'Tool';
}`;

const directToolNew = `function mapDirectTool(name) {
  const raw = String(name || '').trim();
  if (TOOL_MAP[raw]) return TOOL_MAP[raw];
  if (/view_image|viewimage|view_local_image/i.test(raw)) return 'Image';
  if (/node_repl.*(?:__|\\b)js$/i.test(raw)) return 'Js';
  if (/imagegen|image_gen/i.test(raw)) return 'Write';
  if (/web__run|browser|chrome/i.test(raw)) return 'WebSearch';
  if (/computer[-_]?use/i.test(raw)) return 'Task';
  if (/compile_latex|build/i.test(raw)) return 'Build';
  if (/read_mcp|open_in_codex/i.test(raw)) return 'Read';
  return raw || 'Tool';
}`;

if (codexWatch.includes(directToolOld)) {
  codexWatch = codexWatch.replace(directToolOld, directToolNew);
}

// 增强 mapTool 处理 exec_command 和 exec
const mapToolOld = `function mapTool(name, payload) {
  const raw = String(name || '').trim();
  // Current Codex Desktop records orchestration as custom_tool_call(name=exec)
  // and puts the real nested tool in its JS input. Inspect that authoritative
  // input so \`tools.mcp__node_repl__js(...)\` becomes Calling JS instead of the
  // misleading generic Running command.
  if (raw === 'exec' || raw === 'functions.exec') {
    const nested = wrappedToolNames(payload)
      .map(mapDirectTool)
      .filter((tool) => tool && tool !== 'Tool')
      .sort((a, b) => (WRAPPED_TOOL_PRIORITY.get(b) || 0) - (WRAPPED_TOOL_PRIORITY.get(a) || 0));
    if (nested.length) return nested[0];
  }
  return mapDirectTool(raw);
}`;

const mapToolNew = `function mapTool(name, payload) {
  const raw = String(name || '').trim();
  if (raw === 'exec_command' || raw === 'exec' || raw === 'functions.exec') {
    const nested = wrappedToolNames(payload)
      .map(mapDirectTool)
      .filter((tool) => tool && tool !== 'Tool')
      .sort((a, b) => (WRAPPED_TOOL_PRIORITY.get(b) || 0) - (WRAPPED_TOOL_PRIORITY.get(a) || 0));
    if (nested.length) return nested[0];

    // 深入解析 cmd 二级指令，精准映射读文件、搜代码、Git、构建等
    const cmdStr = extractCommandString(payload);
    if (cmdStr) {
      return inspectCommandAction(cmdStr);
    }
  }
  return mapDirectTool(raw);
}`;

if (codexWatch.includes(mapToolOld)) {
  codexWatch = codexWatch.replace(mapToolOld, mapToolNew);
}

fs.writeFileSync('D:/存储/LLMPET-main/backend/codex-watch.js', codexWatch, 'utf8');
console.log('3. backend/codex-watch.js updated');

// ==========================================
// 4. renderer/pet.html (清除新开 Codex 按钮)
// ==========================================
let petHtml = fs.readFileSync('D:/存储/LLMPET-main/renderer/pet.html', 'utf8');
petHtml = petHtml.replace(/<button id="sl-new-codex" data-i18n="sess\.newCodex">.*?<\/button>\s*/g, '');
fs.writeFileSync('D:/存储/LLMPET-main/renderer/pet.html', petHtml, 'utf8');
console.log('4. renderer/pet.html updated');

// ==========================================
// 5. renderer/pet.css (旅行明信片通栏排版)
// ==========================================
let petCss = fs.readFileSync('D:/存储/LLMPET-main/renderer/pet.css', 'utf8');
const oldPostcardBody = `.sl-travel-postcard-body {
  display: grid; grid-template-columns: minmax(205px, 43%) minmax(0, 1fr);
  gap: 14px; height: 236px; min-height: 0;
}`;
const newPostcardBody = `.sl-travel-postcard-body {
  display: block; width: 100%; min-height: 0; box-sizing: border-box;
}
.sl-travel-postcard-text {
  width: 100%; height: auto; max-height: 250px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-word;
  margin: 0; padding: 6px 4px; color: #e4e4e8;
  font: 11px/1.55 -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}`;

if (petCss.includes(oldPostcardBody)) {
  petCss = petCss.replace(oldPostcardBody, newPostcardBody);
}
fs.writeFileSync('D:/存储/LLMPET-main/renderer/pet.css', petCss, 'utf8');
console.log('5. renderer/pet.css updated');

