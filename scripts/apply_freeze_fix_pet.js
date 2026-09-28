const fs = require('fs');
const path = 'D:/存储/LLMPET-main/renderer/pet.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Spine init: slot arm_lower-1 nulling
const initRegex = /championPet = new PIXI\.spine\.Spine\(resource\.spineData\);\s*championPet\.autoUpdate = false;/;
if (initRegex.test(content)) {
  content = content.replace(initRegex,
`championPet = new PIXI.spine.Spine(resource.spineData);
    championPet.autoUpdate = false;
    try {
      const sLower1 = championPet.skeleton && championPet.skeleton.findSlot('arm_lower-1');
      if (sLower1) sLower1.attachment = null;
    } catch {}`);
  console.log('[1] Spine init patched');
} else {
  console.log('[1] Spine init already patched or not matched');
}

// 2. Ticker robustness + floating hand nulling
const tickerRegex = /\/\/ DST dual-hand fix: arm_carry slots must be nulled every frame so both arms don't show\s*championApp\.ticker\.add\(\(delta\) => \{[\s\S]*?\}\);\s*championApp\.stage\.addChild\(championPet\);/;
if (tickerRegex.test(content)) {
  content = content.replace(tickerRegex,
`// DST dual-hand & floating hand fix: arm_carry and arm_lower-1 slots must be nulled every frame
    championApp.ticker.add((delta) => {
      try {
        if (championPet) {
          const dt = (typeof delta === 'number' && !isNaN(delta) && delta > 0 && delta < 10) ? (delta / 60) : (1 / 60);
          championPet.update(dt);
          if (championPet.skeleton && championPet.skeleton.slots) {
            for (const slot of championPet.skeleton.slots) {
              const name = slot.data && slot.data.name;
              if (name && (name.startsWith('arm_carry') || name === 'arm_lower-1')) {
                slot.attachment = null;
              }
            }
          }
        }
      } catch (err) {
        console.warn('[championApp ticker error]', err);
      }
    });

    championApp.stage.addChild(championPet);`);
  console.log('[2] Ticker patched');
} else {
  console.log('[2] Ticker already patched or not matched');
}

// 3. updateChampionSpine track check
const updateSpineRegex = /function updateChampionSpine\(s\) \{[\s\S]*?const animName = getChampionAnim\(s\);\s*if \(championCurrentAnim === animName\) return;\s*championCurrentAnim = animName;/;
if (updateSpineRegex.test(content)) {
  content = content.replace(updateSpineRegex,
`function updateChampionSpine(s) {
  if (!championSpineReady || !championPet) {
    if (!championSpineLoading && skin === 'champion') initChampionSpine();
    return;
  }
  const animName = getChampionAnim(s);
  const curTrack = championPet.state && championPet.state.getCurrent(0);
  if (championCurrentAnim === animName && curTrack && !curTrack.isComplete()) {
    return;
  }
  championCurrentAnim = animName;`);
  console.log('[3] updateChampionSpine patched');
} else {
  console.log('[3] updateChampionSpine already patched or not matched');
}

// 4. Add wakeUpPetRenderer and listeners if not present
if (!content.includes('function wakeUpPetRenderer()')) {
  const wakeBlock = `
function wakeUpPetRenderer() {
  try {
    if (championApp && championApp.ticker && !championApp.ticker.started) {
      championApp.ticker.start();
    }
    championCurrentAnim = null;
    if (skin === 'champion' && championPet && championSpineReady) {
      updateChampionSpine(state);
    }
  } catch (err) {
    console.warn('[wakeUpPetRenderer error]', err);
  }
}
window.addEventListener('focus', wakeUpPetRenderer);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') wakeUpPetRenderer();
});
if (window.pet && typeof window.pet.onWakeup === 'function') {
  window.pet.onWakeup(() => {
    wakeUpPetRenderer();
  });
}
`;
  content = content.replace("window.showPetBubble = function(text, holdMs = 3000) {", wakeBlock + "\nwindow.showPetBubble = function(text, holdMs = 3000) {");
  console.log('[4] wakeUpPetRenderer added');
} else {
  console.log('[4] wakeUpPetRenderer already present');
}

// 5. Default skin to champion
content = content.replace("let skin = 'mascot';", "let skin = 'champion';");

// 6. Bottom pill: Codex label and focusSession click
content = content.replace(
  'agentTag.innerHTML = `<span class="at-ic">💬</span><span>Codex 对话</span>`;',
  'agentTag.innerHTML = `<span class="at-ic">💬</span><span>Codex</span>`;'
);

const agentTagClickRegex = /const agentTagEl = document\.getElementById\('agent-tag'\);[\s\S]*?agentTagEl\.addEventListener\('click',\s*\(e\)\s*=>\s*\{[\s\S]*?togglePetChat\(\);\s*\}\);/;
if (agentTagClickRegex.test(content)) {
  content = content.replace(agentTagClickRegex,
`const agentTagEl = document.getElementById('agent-tag');
if (agentTagEl) {
  agentTagEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (radialOpen) closeRadial();
    if (window.pet && typeof window.pet.focusSession === 'function') {
      window.pet.focusSession('');
    }
  });`);
  console.log('[6] agentTag click patched to focusSession');
} else {
  console.log('[6] agentTag click already patched or not matched');
}

fs.writeFileSync(path, content, 'utf8');
