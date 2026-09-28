const fs = require('fs');
const path = require('path');

const rootDir = path.join('D:', '存储', 'LLMPET-main');

// ==========================================
// 1. 更新 renderer/pet.html
// ==========================================
const htmlPath = path.join(rootDir, 'renderer', 'pet.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const tuneHtml = [
  '      <!-- 小天体参数可视化调参面板 (Tune Panel) -->',
  '      <div id="tune-panel" class="tune-panel hidden">',
  '        <div class="tp-top">',
  '          <span class="tp-title">🛠️ 小天体参数微调</span>',
  '          <span class="tp-close" id="tune-close" title="关闭">✕</span>',
  '        </div>',
  '        <div class="tune-scroll">',
  '          <div class="tune-row">',
  '            <div class="tune-label-line">',
  '              <span>角色大小 (Scale)</span>',
  '              <span id="val-championScale" class="tune-val">0.368</span>',
  '            </div>',
  '            <input type="range" id="slider-championScale" min="0.20" max="0.80" step="0.01" value="0.368" />',
  '          </div>',
  '',
  '          <div class="tune-row">',
  '            <div class="tune-label-line">',
  '              <span>水平中心 (X Offset)</span>',
  '              <span id="val-championX" class="tune-val">100</span>',
  '            </div>',
  '            <input type="range" id="slider-championX" min="40" max="160" step="1" value="100" />',
  '          </div>',
  '',
  '          <div class="tune-row">',
  '            <div class="tune-label-line">',
  '              <span>垂直高度 (Y Offset)</span>',
  '              <span id="val-championY" class="tune-val">205</span>',
  '            </div>',
  '            <input type="range" id="slider-championY" min="120" max="320" step="1" value="205" />',
  '          </div>',
  '',
  '          <div class="tune-row">',
  '            <div class="tune-label-line">',
  '              <span>气泡微调 (Bubble Y)</span>',
  '              <span id="val-bubbleOffsetY" class="tune-val">15</span>',
  '            </div>',
  '            <input type="range" id="slider-bubbleOffsetY" min="-40" max="100" step="1" value="15" />',
  '          </div>',
  '',
  '          <div class="tune-row">',
  '            <div class="tune-label-line">',
  '              <span>圆点微调 (Dots Y)</span>',
  '              <span id="val-dotsOffsetY" class="tune-val">55</span>',
  '            </div>',
  '            <input type="range" id="slider-dotsOffsetY" min="0" max="120" step="1" value="55" />',
  '          </div>',
  '',
  '          <div class="tune-row">',
  '            <div class="tune-label-line">',
  '              <span>底部留白 (Bottom Pad)</span>',
  '              <span id="val-bottomPadding" class="tune-val">16</span>',
  '            </div>',
  '            <input type="range" id="slider-bottomPadding" min="0" max="40" step="1" value="16" />',
  '          </div>',
  '        </div>',
  '        <div class="tune-actions">',
  '          <button id="tune-btn-reset" class="tune-btn">↺ 恢复默认</button>',
  '          <button id="tune-btn-save" class="tune-btn primary">💾 保存配置</button>',
  '        </div>',
  '        <div id="tune-toast" class="tune-toast hidden">✓ 配置已成功写入 custom_config.js</div>',
  '      </div>',
].join('\n');

if (!htmlContent.includes('id="tune-panel"')) {
  const insertMarker = '      <!-- 记事本弹层：行动清单（需要处理的事项 + 待办）+ 操作 -->';
  htmlContent = htmlContent.replace(insertMarker, tuneHtml + '\n\n' + insertMarker);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('[1/3] pet.html updated with #tune-panel.');
} else {
  console.log('[1/3] pet.html already contains #tune-panel.');
}

// ==========================================
// 2. 更新 renderer/pet.css
// ==========================================
const cssPath = path.join(rootDir, 'renderer', 'pet.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const cssTuneStyles = `
/* ---------- 调参面板样式 (Tune Panel) ---------- */
.tune-panel {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 60px;
  background: rgba(22, 24, 33, 0.95);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.6);
  color: #f0f0f5;
  padding: 12px 14px;
  z-index: 9999;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.tune-panel.hidden {
  display: none !important;
}
.tune-panel .tp-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 6px;
}
.tune-panel .tp-title {
  font-size: 13px;
  font-weight: 600;
  color: #ffd700;
}
.tune-panel .tp-close {
  cursor: pointer;
  font-size: 14px;
  color: #888;
  padding: 0 4px;
  transition: color 0.15s;
}
.tune-panel .tp-close:hover {
  color: #fff;
}
.tune-scroll {
  display: flex;
  flex-direction: column;
  gap: 9px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
}
.tune-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tune-label-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #bbb;
}
.tune-val {
  font-weight: 600;
  color: #ffd700;
  font-family: Consolas, monospace;
}
.tune-row input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.18);
  outline: none;
}
.tune-row input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #ffd700;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.6);
}
.tune-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.tune-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #eee;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.tune-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}
.tune-btn.primary {
  background: #c59b27;
  color: #111;
  font-weight: 600;
  border-color: #ffd700;
}
.tune-btn.primary:hover {
  background: #ffd700;
}
.tune-toast {
  text-align: center;
  font-size: 11px;
  color: #a3e635;
  background: rgba(30, 41, 59, 0.85);
  padding: 3px 6px;
  border-radius: 4px;
}
`;

if (!cssContent.includes('.tune-panel')) {
  cssContent += '\n' + cssTuneStyles;
  // Ensure --bottom-padding is supported in #stage
  if (!cssContent.includes('--bottom-padding')) {
    cssContent = ':root {\n  --bottom-padding: 16px;\n}\n' + cssContent;
    cssContent = cssContent.replace('#stage {', '#stage {\n  padding-bottom: var(--bottom-padding, 16px);\n  box-sizing: border-box;');
  }
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log('[2/3] pet.css updated with tune panel styles & bottom padding.');
} else {
  console.log('[2/3] pet.css already contains tune panel styles.');
}

console.log('HTML and CSS update complete.');
