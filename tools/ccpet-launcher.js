const { spawn, exec } = require('child_process');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

const PET_DIR = path.resolve(__dirname, '..');
const ELECTRON_PATH = path.join(PET_DIR, 'node_modules', 'electron', 'dist', 'electron.exe');

function isPetRunning(cb) {
  exec('tasklist', (err, stdout) => {
    if (err) return cb(false);
    cb(stdout && stdout.toLowerCase().includes('electron.exe'));
  });
}

function launchPet() {
  isPetRunning((running) => {
    if (running) return;
    try {
      if (fs.existsSync(ELECTRON_PATH)) {
        const child = spawn(ELECTRON_PATH, ['.'], {
          cwd: PET_DIR,
          detached: true,
          stdio: 'ignore',
          windowsHide: false
        });
        child.unref();
      } else {
        const child = spawn('cmd.exe', ['/c', 'npm', 'start'], {
          cwd: PET_DIR,
          detached: true,
          stdio: 'ignore',
          windowsHide: false
        });
        child.unref();
      }
    } catch (e) {
      // ignore
    }
  });
}

// Auto-launch CCPet when Codex starts
launchPet();

// Standard MCP JSON-RPC over stdio
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (!req.id && req.method) return;
    let res = { jsonrpc: '2.0', id: req.id, result: {} };
    if (req.method === 'initialize') {
      res.result = {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'ccpet-launcher', version: '1.0.0' }
      };
    } else if (req.method === 'tools/list') {
      res.result = {
        tools: [
          {
            name: 'wake_ccpet',
            description: '唤醒或启动小天体桌宠 (CCPet)',
            inputSchema: { type: 'object', properties: {} }
          }
        ]
      };
    } else if (req.method === 'tools/call') {
      launchPet();
      res.result = {
        content: [{ type: 'text', text: '小天体桌宠 (CCPet) 已唤醒!' }]
      };
    }
    process.stdout.write(JSON.stringify(res) + '\n');
  } catch (err) {}
});
