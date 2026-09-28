const fs = require('fs');
const path = require('path');

const petJsPath = path.join('D:', '存储', 'LLMPET-main', 'renderer', 'pet.js');
let code = fs.readFileSync(petJsPath, 'utf8');

// 1. 替换 MENU 中的 menu.skin 为 menu.tune
if (code.includes("labelKey: 'menu.skin'")) {
  code = code.replace(
    /\{\s*ic:\s*'mask',\s*labelKey:\s*'menu\.skin',\s*act:\s*\(\)\s*=>\s*toggleSkin\(\)\s*\}/,
    "{ ic: 'tune',   labelKey: 'menu.tune', act: () => toggleTunePanel() }"
  );
  console.log('[1/6] Replaced menu.skin with menu.tune');
} else {
  console.log('[1/6] menu.skin already replaced or not found');
}

// 2. 将 #tune-panel 加入 HIT_SEL
if (!code.includes('#tune-panel')) {
  code = code.replace(
    "const HIT_SEL = '#pixel,#mascot,#cat,#champion-spine,",
    "const HIT_SEL = '#tune-panel:not(.hidden),#pixel,#mascot,#cat,#champion-spine,"
  );
  console.log('[2/6] Added #tune-panel to HIT_SEL');
} else {
  console.log('[2/6] #tune-panel already in HIT_SEL');
}

// 3. 避免普通气泡 bubble 触发窗口扩宽与销毁重建 DirectX (防止人物贴图闪现)
if (!code.includes('// [FIX_FLICKER] bypass window resize for regular speech bubbles')) {
  code = code.replace(
    'function fitPopup(el) {',
    `function fitPopup(el) {
  // [FIX_FLICKER] bypass window resize for regular speech bubbles to prevent DirectX swapchain recreation flicker
  if (el === bubble && !bubble.classList.contains('ending')) {
    return;
  }`
  );
  console.log('[3/6] Patched fitPopup to prevent bubble flicker');
} else {
  console.log('[3/6] fitPopup flicker fix already present');
}

// 4. 锁定 skin 为 champion
if (!code.includes('// [LOCK_CHAMPION]')) {
  code = code.replace(
    "function applySkin(s) {",
    `function applySkin(s) {
  // [LOCK_CHAMPION]
  s = 'champion';`
  );
  console.log('[4/6] Locked skin to champion');
} else {
  console.log('[4/6] Skin lock already present');
}

// 5. 在会话列表增加副会话快速关闭/删除 (✕) 按钮
if (!code.includes('class="sl-action dismiss"')) {
  code = code.replace(
    '<button class="sl-action archive">▣</button>',
    '<button class="sl-action archive">▣</button>' +
    '<button class="sl-action dismiss" title="忽略/关闭此会话">✕</button>'
  );
  code = code.replace(
    'archive: row.querySelector(\'.sl-action.archive\'),',
    'archive: row.querySelector(\'.sl-action.archive\'),\n    dismiss: row.querySelector(\'.sl-action.dismiss\'),'
  );
  code = code.replace(
    'row._parts.archive.addEventListener(\'click\', (event) => {',
    `row._parts.dismiss.addEventListener('click', (event) => {
    event.stopPropagation();
    const key = sessionKey(row._session);
    if (!key) return;
    archivedSessionIds = [key, ...archivedSessionIds.filter((id) => id !== key)];
    pinnedSessionIds = pinnedSessionIds.filter((id) => id !== key);
    window.pet.setSessionPrefs(pinnedSessionIds, archivedSessionIds);
    resetSessionListOrder();
    renderSessList();
  });
  row._parts.archive.addEventListener('click', (event) => {`
  );
  console.log('[5/6] Added quick dismiss (X) button to sessions');
} else {
  console.log('[5/6] Quick dismiss button already present');
}

// 6. 实现调参面板功能代码
if (!code.includes('// [TUNE_PANEL_FEATURE]')) {
  const tuneFeatureCode = `
// [TUNE_PANEL_FEATURE]
let tunePanelOpen = false;
const tunePanelEl = document.getElementById('tune-panel');
const tuneCloseBtn = document.getElementById('tune-close');
const tuneResetBtn = document.getElementById('tune-btn-reset');
const tuneSaveBtn = document.getElementById('tune-btn-save');
const tuneToastEl = document.getElementById('tune-toast');

const DEFAULT_TUNE_CFG = {
  championScale: 0.368,
  championX: 100,
  championY: 205,
  bubbleOffsetY: 15,
  dotsOffsetY: 55,
  bottomPadding: 16,
};

const TUNE_SLIDERS = [
  { id: 'championScale', key: 'championScale', el: document.getElementById('slider-championScale'), valEl: document.getElementById('val-championScale'), isFloat: true },
  { id: 'championX', key: 'championX', el: document.getElementById('slider-championX'), valEl: document.getElementById('val-championX') },
  { id: 'championY', key: 'championY', el: document.getElementById('slider-championY'), valEl: document.getElementById('val-championY') },
  { id: 'bubbleOffsetY', key: 'bubbleOffsetY', el: document.getElementById('slider-bubbleOffsetY'), valEl: document.getElementById('val-bubbleOffsetY') },
  { id: 'dotsOffsetY', key: 'dotsOffsetY', el: document.getElementById('slider-dotsOffsetY'), valEl: document.getElementById('val-dotsOffsetY') },
  { id: 'bottomPadding', key: 'bottomPadding', el: document.getElementById('slider-bottomPadding'), valEl: document.getElementById('val-bottomPadding') },
];

function applyTuneParamsLive(params) {
  if (!params) return;
  if (championPet) {
    if (params.championScale != null) championPet.scale.set(Number(params.championScale));
    if (params.championX != null) championPet.x = Number(params.championX);
    if (params.championY != null) championPet.y = Number(params.championY);
  }
  if (params.dotsOffsetY != null) {
    document.documentElement.style.setProperty('--dots-offset-y', params.dotsOffsetY + 'px');
  }
  if (params.bubbleOffsetY != null) {
    document.documentElement.style.setProperty('--bubble-offset-y', params.bubbleOffsetY + 'px');
  }
  if (params.bottomPadding != null) {
    document.documentElement.style.setProperty('--bottom-padding', params.bottomPadding + 'px');
  }
  window.PET_CONFIG = Object.assign(window.PET_CONFIG || {}, params);
}

function openTunePanel() {
  if (radialOpen) closeRadial();
  if (sessListOpen) closeSessList();
  TUNE_SLIDERS.forEach((item) => {
    const curVal = (window.PET_CONFIG && window.PET_CONFIG[item.key] != null)
      ? window.PET_CONFIG[item.key]
      : DEFAULT_TUNE_CFG[item.key];
    if (item.el) item.el.value = curVal;
    if (item.valEl) item.valEl.textContent = curVal;
  });
  if (tunePanelEl) tunePanelEl.classList.remove('hidden');
  tunePanelOpen = true;
}

function closeTunePanel() {
  if (tunePanelEl) tunePanelEl.classList.add('hidden');
  tunePanelOpen = false;
  resetPetSize();
}

function toggleTunePanel() {
  if (tunePanelOpen) closeTunePanel();
  else openTunePanel();
}

if (tuneCloseBtn) tuneCloseBtn.addEventListener('click', closeTunePanel);

TUNE_SLIDERS.forEach((item) => {
  if (!item.el) return;
  item.el.addEventListener('input', () => {
    const val = item.isFloat ? parseFloat(item.el.value) : parseInt(item.el.value, 10);
    if (item.valEl) item.valEl.textContent = val;
    applyTuneParamsLive({ [item.key]: val });
  });
});

if (tuneSaveBtn) {
  tuneSaveBtn.addEventListener('click', async () => {
    const cfg = {
      championScale: parseFloat(document.getElementById('slider-championScale').value),
      championX: parseInt(document.getElementById('slider-championX').value, 10),
      championY: parseInt(document.getElementById('slider-championY').value, 10),
      bubbleOffsetY: parseInt(document.getElementById('slider-bubbleOffsetY').value, 10),
      dotsOffsetY: parseInt(document.getElementById('slider-dotsOffsetY').value, 10),
      bottomPadding: parseInt(document.getElementById('slider-bottomPadding').value, 10),
    };
    try {
      if (window.pet && window.pet.saveCustomTuneConfig) {
        await window.pet.saveCustomTuneConfig(cfg);
      }
      if (tuneToastEl) {
        tuneToastEl.classList.remove('hidden');
        tuneToastEl.textContent = '✓ 配置已成功写入 custom_config.js';
        setTimeout(() => tuneToastEl.classList.add('hidden'), 2500);
      }
    } catch (err) {
      console.error('Save custom tune config failed:', err);
    }
  });
}

if (tuneResetBtn) {
  tuneResetBtn.addEventListener('click', () => {
    TUNE_SLIDERS.forEach((item) => {
      const defVal = DEFAULT_TUNE_CFG[item.key];
      if (item.el) item.el.value = defVal;
      if (item.valEl) item.valEl.textContent = defVal;
    });
    applyTuneParamsLive(DEFAULT_TUNE_CFG);
  });
}
`;
  code += '\n' + tuneFeatureCode;
  console.log('[6/6] Added Tune Panel event logic & slider handlers');
} else {
  console.log('[6/6] Tune Panel logic already present');
}

fs.writeFileSync(petJsPath, code, 'utf8');
console.log('pet.js patch applied successfully.');
