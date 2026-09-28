const fs = require('fs');
const path = 'D:/存储/LLMPET-main/main.js';
let content = fs.readFileSync(path, 'utf8');

// 1. ensurePetWindows
const ensureRegex = /function ensurePetWindows\(\)\s*\{[\r\n\s]*const duo = config\.get\(\)\.petMode === 'duo';[\r\n\s]*const primaryAgent = duo \? 'claude' : 'all';/;
if (ensureRegex.test(content)) {
  content = content.replace(ensureRegex, 
`function ensurePetWindows() {
  const c = config.get();
  const duo = c.petMode === 'duo';
  const singleAgent = (c.agentStartup && c.agentStartup.claude === false && c.agentStartup.codex !== false) ? 'codex' : 'all';
  const primaryAgent = duo ? 'claude' : singleAgent;`);
  console.log('ensurePetWindows patched successfully');
} else {
  console.log('ensurePetWindows pattern not matched or already patched');
}

// 2. second-instance
const secondInstanceRegex = /app\.on\('second-instance',\s*\(\)\s*=>\s*\{[\s\S]*?openArchive\(\);\s*\}\);/;
if (secondInstanceRegex.test(content)) {
  content = content.replace(secondInstanceRegex,
`app.on('second-instance', () => {
    ensurePetWindows();
    for (const st of petStates()) {
      try {
        if (st.win && !st.win.isDestroyed()) {
          st.win.show();
          sendWin(st.win, 'pet:wakeup');
        }
      } catch {}
    }
  });`);
  console.log('second-instance patched successfully');
} else {
  console.log('second-instance already patched or not matched');
}

// 3. focus-session
const focusSessionRegex = /ipcMain\.on\('focus-session',\s*\(_e,\s*sessionId\)\s*=>\s*\{[\r\n\s]*const session = core\.getSession\(sessionId\);/;
if (focusSessionRegex.test(content)) {
  content = content.replace(focusSessionRegex,
`ipcMain.on('focus-session', (_e, sessionId) => {
    let session = (typeof sessionId === 'string' && sessionId.trim() && core) ? core.getSession(sessionId.trim()) : null;
    if (!session && core) {
      const sessions = [...core.sessions.values()].filter((s) => !s.headless && adapter.agentOf(s) === 'codex');
      sessions.sort((a, b) => {
        const order = { working: 0, thinking: 1, waiting: 2, needsinput: 3, sleeping: 4 };
        return (order[a.state] ?? 9) - (order[b.state] ?? 9) || (b.lastActivity || 0) - (a.lastActivity || 0);
      });
      session = sessions[0] || [...core.sessions.values()][0] || null;
    }`);
  console.log('focus-session patched successfully');
} else {
  console.log('focus-session not matched or already patched');
}

fs.writeFileSync(path, content, 'utf8');
