const fs = require('fs');
const path = require('path');

const mainJsPath = path.join('D:', '存储', 'LLMPET-main', 'main.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 找到 refreshTrayMenu 函数进行精简
const startMarker = 'function refreshTrayMenu() {';
const endMarker = 'function setAgentStartup(';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newRefreshTrayMenu = `function refreshTrayMenu() {
  if (!tray) return;
  const cfg = config.get();
  const muted = cfg.muted;
  const lang = cfg.lang || 'zh';
  tray.setToolTip(t('tray.tooltip'));
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: t('tray.panel'), click: openPanel },
    { label: t('tray.archive'), click: openArchive },
    { label: '🌌 显示小天体桌宠', click: () => { ensurePetWindows(); for (const st of petStates()) st.win.show(); } },
    { type: 'separator' },
    { label: t('tray.settings'), enabled: false },
    { label: t('tray.language'), submenu: i18n.LANGS.map((code) => ({
      label: t('lang.' + code), type: 'radio', checked: lang === code, click: () => applyLang(code),
    })) },
    { label: muted ? t('tray.unmute') : t('tray.mute'), click: () => { config.save({ muted: !muted }); broadcastConfig(); refreshTrayMenu(); } },
    { type: 'separator' },
    { label: t('tray.launchCodex'), click: () => launchCodex({}).catch(() => {}) },
    { label: t('tray.openLog'), click: () => shell.openPath(LOG_PATH) },
    { type: 'separator' },
    { label: t('tray.quit'), click: () => app.quit() },
  ]));
}

`;

  code = code.slice(0, startIdx) + newRefreshTrayMenu + code.slice(endIdx);
  fs.writeFileSync(mainJsPath, code, 'utf8');
  console.log('Successfully streamlined refreshTrayMenu in main.js');
} else {
  console.error('Failed to locate refreshTrayMenu in main.js');
}
