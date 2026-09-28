const fs = require('fs');
const path = require('path');

const SKINS_DIR = path.join(__dirname, '..', 'assets', 'skins');

function getAvailableSkins() {
  const skins = [];
  if (fs.existsSync(SKINS_DIR)) {
    const dirs = fs.readdirSync(SKINS_DIR, { withFileTypes: true });
    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const jsonPath = path.join(SKINS_DIR, dir.name, 'skin.json');
        if (fs.existsSync(jsonPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            skins.push(data);
          } catch (e) {
            console.error(`Failed to load skin.json in ${dir.name}`, e);
          }
        }
      }
    }
  }
  return skins;
}

module.exports = {
  getAvailableSkins
};
