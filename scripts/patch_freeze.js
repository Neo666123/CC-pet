const fs = require('fs');
const path = require('path');

const rootDir = 'D:/存储/LLMPET-main';

// 1. Update preload.js
{
  const p = path.join(rootDir, 'preload.js');
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('onWakeup:')) {
    content = content.replace(
      "onProgramSkillsChanged: (cb) => ipcRenderer.on('program-skills:changed', (_e, data) => cb(data)),",
      "onProgramSkillsChanged: (cb) => ipcRenderer.on('program-skills:changed', (_e, data) => cb(data)),\n  onWakeup: (cb) => ipcRenderer.on('pet:wakeup', (_e, data) => cb(data)),"
    );
    fs.writeFileSync(p, content, 'utf8');
    console.log('[1] preload.js updated');
  } else {
    console.log('[1] preload.js already had onWakeup');
  }
}

// 2. Update main.js
{
  const p = path.join(rootDir, 'main.js');
  let content = fs.readFileSync(p, 'utf8');

  // 2a. Add backgroundThrottling: false to makePetWindow webPreferences
  if (!content.includes('backgroundThrottling: false')) {
    content = content.replace(
      "autoplayPolicy: 'no-user-gesture-required',",
      "autoplayPolicy: 'no-user-gesture-required',\n      backgroundThrottling: false,"
    );
    console.log('[2a] backgroundThrottling: false added to makePetWindow');
  }

  // 2b. Add log('renderer', ...) in console-message
  content = content.replace(
    "win.webContents.on('console-message', (e, level, msg, line, sourceId) => console.log('[Renderer ' + agent + ']', msg, sourceId + ':' + line));",
    "win.webContents.on('console-message', (e, level, msg, line, sourceId) => {\n    console.log('[Renderer ' + agent + ']', msg, sourceId + ':' + line);\n    try { log('renderer', '[' + agent + '] ' + msg); } catch {}\n  });"
  );

  // 2c. Fix ensurePetWindows()
  const oldEnsure = `function ensurePetWindows() {
  const duo = config.get().petMode === 'duo';
  const primaryAgent = duo ? 'claude' : 'all';
  if (!petWin || petWin.isDestroyed()) {
    petWin = makePetWindow(primaryAgent);
  } else {
    const st = petState.get(petWin.webContents.id);
    if (st && st.agent !== primaryAgent) {
      st.agent = primaryAgent;
      st.customSize = null; st.visualRect = null; st.uiBusy = false; st.mouseIgnoring = true;
      petWin.loadFile(path.join(__dirname, 'renderer', 'pet.html'), { query: { agent: primaryAgent } });
      applyPetSize(st);
    }
  }`;

  const newEnsure = `function ensurePetWindows() {
  const c = config.get();
  const duo = c.petMode === 'duo';
  const dsh = c.dshPet === true;
  const singleAgent = (c.agentStartup && c.agentStartup.claude === false && c.agentStartup.codex !== false) ? 'codex' : 'all';
  const primaryAgent = duo ? 'claude' : singleAgent;
  if (!petWin || petWin.isDestroyed()) {
    petWin = makePetWindow(primaryAgent);
  } else {
    const st = petState.get(petWin.webContents.id);
    if (st && st.agent !== primaryAgent) {
      st.agent = primaryAgent;
      st.customSize = null; st.visualRect = null; st.uiBusy = false; st.mouseIgnoring = true;
      petWin.loadFile(path.join(__dirname, 'renderer', 'pet.html'), { query: { agent: primaryAgent } });
      applyPetSize(st);
    }
  }`;

  if (content.includes(oldEnsure)) {
    content = content.replace(oldEnsure, newEnsure);
    console.log('[2c] ensurePetWindows updated with singleAgent logic');
  } else {
    console.log('[2c] oldEnsure not matched, checking if already updated...');
  }

  // 2d. Update tray click and second-instance
  content = content.replace(
    "tray.on('click', () => { ensurePetWindows(); for (const st of petStates()) st.win.show(); });",
    "tray.on('click', () => {\n    ensurePetWindows();\n    for (const st of petStates()) {\n      try {\n        if (st.win && !st.win.isDestroyed()) {\n          st.win.show();\n          sendWin(st.win, 'pet:wakeup');\n        }\n      } catch {}\n    }\n  });"
  );

  const oldSecond = `  app.on('second-instance', () => {
    try { for (const st of petStates()) st.win.show(); } catch {}
    openArchive();
  });`;

  const newSecond = `  app.on('second-instance', () => {
    ensurePetWindows();
    try {
      for (const st of petStates()) {
        if (st.win && !st.win.isDestroyed()) {
          st.win.show();
          sendWin(st.win, 'pet:wakeup');
        }
      }
    } catch {}
  });`;

  if (content.includes(oldSecond)) {
    content = content.replace(oldSecond, newSecond);
    console.log('[2d] second-instance updated');
  }

  fs.writeFileSync(p, content, 'utf8');
  console.log('[2] main.js finished');
}

// 3. Update pet.css
{
  const p = path.join(rootDir, 'renderer', 'pet.css');
  let content = fs.readFileSync(p, 'utf8');

  // Dark crystal theme for .bubble
  const oldBubble = `.bubble {
  position: relative;
  max-width: 340px;
  margin-bottom: 8px;
  padding: 9px 13px;
  background: rgba(255, 255, 255, 0.97);
  color: #0f172a;
  font-size: 13px;
  line-height: 1.45;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 229, 255, 0.22);
  border: 1px solid rgba(56, 189, 248, 0.25);
  -webkit-app-region: no-drag;
  cursor: pointer;
  transition: opacity 0.25s ease, transform 0.25s ease;
  word-break: break-word;
}
.bubble::after {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px 7px 0 7px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.97) transparent transparent transparent;
}`;

  const newBubble = `.bubble {
  position: relative;
  max-width: 340px;
  margin-bottom: 8px;
  padding: 9px 13px;
  background: rgba(15, 23, 42, 0.94);
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.45;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55), 0 0 14px rgba(0, 229, 255, 0.28);
  border: 1px solid rgba(56, 189, 248, 0.45);
  backdrop-filter: blur(8px);
  -webkit-app-region: no-drag;
  cursor: pointer;
  transition: opacity 0.25s ease, transform 0.25s ease;
  word-break: break-word;
}
.bubble::after {
  content: "";
  position: absolute;
  bottom: -7px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px 7px 0 7px;
  border-style: solid;
  border-color: rgba(15, 23, 42, 0.94) transparent transparent transparent;
}`;

  if (content.includes(oldBubble)) {
    content = content.replace(oldBubble, newBubble);
    console.log('[3a] pet.css .bubble dark style updated');
  }

  content = content.replace('color: #0284c7;\n  font-size: 10.5px;\n  font-weight: 750;', 'color: #38bdf8;\n  font-size: 10.5px;\n  font-weight: 750;');
  content = content.replace('background: rgba(2, 132, 199, 0.08);\n  color: #0284c7;', 'background: rgba(56, 189, 248, 0.15);\n  color: #38bdf8;');

  fs.writeFileSync(p, content, 'utf8');
  console.log('[3] pet.css finished');
}
