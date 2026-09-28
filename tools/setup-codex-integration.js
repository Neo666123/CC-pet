const fs = require("fs");
const path = require("path");
const os = require("os");

const PET_DIR = path.resolve(__dirname, "..");
const LAUNCHER_PATH = path.join(PET_DIR, "tools", "ccpet-launcher.js");
const CODEX_DIR = path.join(os.homedir(), ".codex");
const CONFIG_PATH = path.join(CODEX_DIR, "config.toml");

function setup() {
  console.log("=== CCPet Codex MCP Integration Setup ===");
  console.log("Pet Directory:", PET_DIR);
  console.log("Launcher Script:", LAUNCHER_PATH);

  if (!fs.existsSync(CODEX_DIR)) {
    console.log("Creating Codex config directory:", CODEX_DIR);
    fs.mkdirSync(CODEX_DIR, { recursive: true });
  }

  let content = "";
  if (fs.existsSync(CONFIG_PATH)) {
    content = fs.readFileSync(CONFIG_PATH, "utf8");
    // Backup existing config
    const backupPath = path.join(CODEX_DIR, "config.toml.bak");
    fs.writeFileSync(backupPath, content, "utf8");
  }

  const sectionHeader = "[mcp_servers.ccpet_launcher]";
  const entry = "\n\n[mcp_servers.ccpet_launcher]\ncommand = 'node'\nargs = ['" + LAUNCHER_PATH + "']\n";

  if (content.includes(sectionHeader)) {
    // Update existing section
    const regex = /\[mcp_servers\.ccpet_launcher\][\s\S]*?(?=(\n\[|$))/;
    content = content.replace(regex, sectionHeader + "\ncommand = 'node'\nargs = ['" + LAUNCHER_PATH + "']\n");
    fs.writeFileSync(CONFIG_PATH, content, "utf8");
    console.log("[OK] Updated existing [mcp_servers.ccpet_launcher] to current path!");
  } else {
    // Append new section
    content = content.trimEnd() + entry;
    fs.writeFileSync(CONFIG_PATH, content, "utf8");
    console.log("[OK] Successfully registered [mcp_servers.ccpet_launcher] in " + CONFIG_PATH);
  }

  console.log("Done! When Codex starts, CCPet will automatically launch.");
}

setup();
