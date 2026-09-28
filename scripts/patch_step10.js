const fs = require('fs');

let petCode = fs.readFileSync('D:/存储/LLMPET-main/renderer/pet.js', 'utf8');

// 1. Clean createSessRow
const oldCreateRow = `  row.innerHTML =
    '<span class="sl-dot"></span>' +
    '<span class="sl-icon"></span>' +
    '<div class="sl-main"><div class="sl-name"></div><div class="sl-meta-line"><div class="sl-meta"></div><button class="sl-session-id"></button></div></div>' +
    '<span class="sl-ctx hidden"></span>' +
    '<button class="sl-takeover-entry"></button>' +
    '<button class="sl-meme-entry"></button>' +
    '<button class="sl-travel-entry">🧳</button>' +
    '<span class="sl-actions">' +
    '<button class="sl-action pin">★</button>' +
    '<button class="sl-action archive">▣</button><button class="sl-action dismiss" title="忽略/关闭此会话">✕</button>' +
    '</span>';
  row._parts = {
    dot: row.querySelector('.sl-dot'),
    icon: row.querySelector('.sl-icon'),
    name: row.querySelector('.sl-name'),
    meta: row.querySelector('.sl-meta'),
    sessionId: row.querySelector('.sl-session-id'),
    context: row.querySelector('.sl-ctx'),
    takeover: row.querySelector('.sl-takeover-entry'),
    meme: row.querySelector('.sl-meme-entry'),
    travel: row.querySelector('.sl-travel-entry'),
    pin: row.querySelector('.sl-action.pin'),
    archive: row.querySelector('.sl-action.archive'),
    dismiss: row.querySelector('.sl-action.dismiss'),
  };`;

const newCreateRow = `  row.innerHTML =
    '<span class="sl-dot"></span>' +
    '<span class="sl-icon"></span>' +
    '<div class="sl-main"><div class="sl-name"></div><div class="sl-meta-line"><div class="sl-meta"></div><button class="sl-session-id"></button></div></div>' +
    '<span class="sl-ctx hidden"></span>' +
    '<button class="sl-travel-entry">🧳</button>' +
    '<span class="sl-actions">' +
    '<button class="sl-action pin">★</button>' +
    '<button class="sl-action dismiss" title="忽略/关闭此会话">✕</button>' +
    '</span>';
  row._parts = {
    dot: row.querySelector('.sl-dot'),
    icon: row.querySelector('.sl-icon'),
    name: row.querySelector('.sl-name'),
    meta: row.querySelector('.sl-meta'),
    sessionId: row.querySelector('.sl-session-id'),
    context: row.querySelector('.sl-ctx'),
    travel: row.querySelector('.sl-travel-entry'),
    pin: row.querySelector('.sl-action.pin'),
    dismiss: row.querySelector('.sl-action.dismiss'),
  };`;

if (!petCode.includes(oldCreateRow)) {
  console.error('oldCreateRow not found!');
  process.exit(1);
}
petCode = petCode.replace(oldCreateRow, newCreateRow);

// 2. Remove takeover and meme listeners in createSessRow
const oldListeners = `  row._parts.takeover.addEventListener('click', (event) => {
    event.stopPropagation();
    openTakeoverPage(row._session);
  });
  row._parts.meme.addEventListener('click', (event) => {
    event.stopPropagation();
    openMemePage(row._session);
  });`;

if (!petCode.includes(oldListeners)) {
  console.error('oldListeners not found!');
  process.exit(1);
}
petCode = petCode.replace(oldListeners, '');

// 3. Remove archive listener
const oldArchiveListener = `  row._parts.archive.addEventListener('click', (event) => {
    event.stopPropagation();
    const key = sessionKey(row._session);
    const archived = archivedSessionIds.includes(key);
    if (archived) archivedSessionIds = archivedSessionIds.filter((id) => id !== key);
    else {
      archivedSessionIds = [key, ...archivedSessionIds.filter((id) => id !== key)];
      pinnedSessionIds = pinnedSessionIds.filter((id) => id !== key);
    }
    window.pet.setSessionPrefs(pinnedSessionIds, archivedSessionIds);
    resetSessionListOrder();
    renderSessList();
  });`;

if (!petCode.includes(oldArchiveListener)) {
  console.error('oldArchiveListener not found!');
  process.exit(1);
}
petCode = petCode.replace(oldArchiveListener, '');

// 4. Clean updateSessRow entries
const oldUpdateParts = `  parts.takeover.title = t('takeover.entryTitle');
  parts.takeover.textContent = t('takeover.entry');
  parts.meme.title = t('meme.entryTitle');
  parts.meme.textContent = t('meme.entry');
  parts.takeover.classList.toggle('hidden', !sessionActionAllowed(session, 'takeover'));
  parts.meme.classList.toggle('hidden', !sessionActionAllowed(session, 'meme'));
  parts.travel.classList.toggle('hidden', !sessionActionAllowed(session, 'travel'));
  parts.travel.title = t('travel.entryTitle');
  parts.pin.className = \`sl-action pin\${pinned ? ' active' : ''}\`;
  parts.pin.title = t(pinned ? 'sess.unpin' : 'sess.pin');
  parts.archive.className = \`sl-action archive\${archived ? ' active' : ''}\`;
  parts.archive.title = t(archived ? 'sess.unarchive' : 'sess.archive');`;

const newUpdateParts = `  if (parts.travel) {
    parts.travel.classList.toggle('hidden', !sessionActionAllowed(session, 'travel'));
    parts.travel.title = t('travel.entryTitle');
  }
  if (parts.pin) {
    parts.pin.className = \`sl-action pin\${pinned ? ' active' : ''}\`;
    parts.pin.title = t(pinned ? 'sess.unpin' : 'sess.pin');
  }`;

if (!petCode.includes(oldUpdateParts)) {
  console.error('oldUpdateParts not found!');
  process.exit(1);
}
petCode = petCode.replace(oldUpdateParts, newUpdateParts);

// 5. Clean travel postcard ASCII art
const oldPostcardBody = `    card.innerHTML =
      \`<div class="sl-travel-stop-title">\${esc(stop.title)}</div>\` +
      \`<div class="sl-travel-postcard-body">\` +
      \`<pre class="sl-travel-postcard-art">\${esc(stop.art)}</pre>\` +
      \`<div class="sl-travel-postcard-text">\${esc(stop.text)}</div>\` +
      \`</div>\`;`;

const newPostcardBody = `    card.innerHTML =
      \`<div class="sl-travel-stop-title">\${esc(stop.title)}</div>\` +
      \`<div class="sl-travel-postcard-body">\` +
      \`<div class="sl-travel-postcard-text">\${esc(stop.text)}</div>\` +
      \`</div>\`;`;

if (!petCode.includes(oldPostcardBody)) {
  console.error('oldPostcardBody not found!');
  process.exit(1);
}
petCode = petCode.replace(oldPostcardBody, newPostcardBody);

// 6. Update CHAMPION_SPINE_ANIMS and animation resolution functions
const oldAnimsBlock = `const CHAMPION_SPINE_ANIMS = {
  idle: 'wilson/acting_idle2',
  roam: 'wilson/run_loop_down',
  working: 'wilson/book',
  thinking: 'wilson/emote_impatient',
  talking: 'wilson/emote_waving',
  attention: 'wilson/emote_waving',
  juggling: 'wilson/emoteXL_loop_dance7',
  sweeping: 'wilson/dial_loop',
  waiting: 'wilson/emote_impatient',
  needsinput: 'wilson/emote_annoyed_facepalm',
  puzzled: 'wilson/emote_annoyed_facepalm',
  happy: 'wilson/emote_happycheer',
  loved: 'wilson/emote_happycheer',
  excited: 'wilson/emote_jumpcheer',
  greet: 'wilson/emote_happycheer',
  sleeping: 'wilson/sleep',
  error: 'wilson/distress_loop',
  sorry: 'wilson/distress_loop',
  sad: 'wilson/emote_sad',
  loafing: 'wilson/emote_loop_sit1',
  carrying: 'wilson/acting_2',
};`;

const newAnimsBlock = `const CHAMPION_SPINE_ANIMS = {
  // 持续主状态 (8)
  idle: 'wilson/acting_idle2',
  thinking: 'wilson/emote_impatient',
  working: 'wilson/book',
  juggling: 'wilson/emoteXL_loop_dance7',
  carrying: 'wilson/acting_2',
  sweeping: 'wilson/dial_loop',
  roam: 'wilson/run_loop_down',
  sleeping: 'wilson/sleep',
  // 阻塞与提醒 (4)
  waiting: 'wilson/emote_impatient',
  needsinput: 'wilson/emote_annoyed_facepalm',
  attention: 'wilson/emote_waving',
  error: 'wilson/distress_loop',
  // 短暂情绪态 (8)
  happy: 'wilson/emote_happycheer',
  greet: 'wilson/emote_happycheer',
  talking: 'wilson/emote_waving',
  loafing: 'wilson/emote_loop_sit1',
  loved: 'wilson/emote_happycheer',
  sad: 'wilson/emote_sad',
  sorry: 'wilson/distress_loop',
  puzzled: 'wilson/emote_annoyed_facepalm',
  excited: 'wilson/emote_jumpcheer',
  // 入睡与苏醒序列 (4)
  yawning: 'wilson/emote_sit',
  dozing: 'wilson/sleep',
  collapsing: 'wilson/sleep',
  waking: 'wilson/acting_idle2',
  // 手势与扩展 (3)
  drag: 'wilson/distress_loop',
  poke: 'wilson/emote_fistshake',
  tired: 'wilson/emote_sad',
};

// 极速音频播放支持 (支持本地与外部音频，零依赖)
window.playPetSound = function(soundPath, volume = 1.0) {
  if (!soundPath) return;
  try {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch((err) => {
      console.warn('[PetSound] play failed:', soundPath, err);
    });
  } catch (e) {
    console.warn('[PetSound] error:', e);
  }
};`;

if (!petCode.includes(oldAnimsBlock)) {
  console.error('oldAnimsBlock not found!');
  process.exit(1);
}
petCode = petCode.replace(oldAnimsBlock, newAnimsBlock);

// 7. Update getChampionAnim and add resolveAnimConfig & fatigue logic
const oldGetChampion = `function getChampionAnim(s) {
  if (window.PET_CONFIG && window.PET_CONFIG.customStateAnims && window.PET_CONFIG.customStateAnims[s]) {
    return window.PET_CONFIG.customStateAnims[s];
  }
  return CHAMPION_SPINE_ANIMS[s] || CHAMPION_SPINE_ANIMS.idle;
}

function updateChampionSpine(s) {
  if (!championSpineReady || !championPet) {
    if (!championSpineLoading && skin === 'champion') initChampionSpine();
    return;
  }
  const animName = getChampionAnim(s);
  const curTrack = championPet.state && championPet.state.getCurrent(0);
  if (championCurrentAnim === animName && curTrack && !curTrack.isComplete()) {
    return;
  }
  championCurrentAnim = animName;
  try {
    championPet.state.setAnimation(0, animName, true);
  } catch (e) {
    console.warn('Failed to set Spine animation:', animName, e);
  }
}`;

const newGetChampion = `function resolveAnimConfig(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  if (Array.isArray(entry)) {
    if (entry.length === 0) return null;
    // 加权抽取支持: [{ anim: '...', weight: 2 }]
    if (typeof entry[0] === 'object' && entry[0] !== null && 'anim' in entry[0]) {
      let totalWeight = 0;
      for (const item of entry) {
        totalWeight += Math.max(0, Number(item.weight) || 1);
      }
      let r = Math.random() * (totalWeight || 1);
      for (const item of entry) {
        const w = Math.max(0, Number(item.weight) || 1);
        if (r < w) return item.anim;
        r -= w;
      }
      return entry[0].anim;
    }
    // 普通随机动作数组
    const idx = Math.floor(Math.random() * entry.length);
    return entry[idx];
  }
  return null;
}

function getChampionAnim(s) {
  if (window.PET_CONFIG && window.PET_CONFIG.customStateAnims && window.PET_CONFIG.customStateAnims[s] !== undefined) {
    const custom = resolveAnimConfig(window.PET_CONFIG.customStateAnims[s]);
    if (custom) return custom;
  }
  const fallback = CHAMPION_SPINE_ANIMS[s] || CHAMPION_SPINE_ANIMS.idle;
  return resolveAnimConfig(fallback) || 'wilson/acting_idle2';
}

// 连续工作超时疲劳检测 (超过设定分钟触发疲惫姿态和吐槽)
let workingStartTime = null;
let lastFatigueTriggerTime = 0;

function checkWorkingFatigue(currentWorkingState) {
  if (!window.PET_CONFIG || !window.PET_CONFIG.fatigue || !window.PET_CONFIG.fatigue.enabled) return;
  const isWorking = (currentWorkingState === 'working' || currentWorkingState === 'juggling' || currentWorkingState === 'carrying');
  const now = Date.now();
  if (isWorking) {
    if (!workingStartTime) {
      workingStartTime = now;
    } else {
      const workingMinutes = Number(window.PET_CONFIG.fatigue.workingMinutes) || 5;
      const cooldownMinutes = Number(window.PET_CONFIG.fatigue.cooldownMinutes) || 3;
      if (now - workingStartTime >= workingMinutes * 60000 && now - lastFatigueTriggerTime >= cooldownMinutes * 60000) {
        lastFatigueTriggerTime = now;
        const fatigueAnim = resolveAnimConfig(
          window.PET_CONFIG.fatigue.anim ||
          (window.PET_CONFIG.customStateAnims && window.PET_CONFIG.customStateAnims.tired) ||
          'wilson/emote_sad'
        );
        if (typeof window.playChampionAnim === 'function' && fatigueAnim) {
          window.playChampionAnim(fatigueAnim, false, true);
        }
        const text = window.PET_CONFIG.fatigue.bubbleText || '呼……写了好多代码，本英雄有点累了~';
        if (typeof window.showPetBubble === 'function' && text) {
          window.showPetBubble(text, 3800);
        }
        if (window.PET_CONFIG.fatigue.audio && typeof window.playPetSound === 'function') {
          window.playPetSound(window.PET_CONFIG.fatigue.audio);
        }
      }
    }
  } else if (currentWorkingState === 'idle' || currentWorkingState === 'sleeping') {
    workingStartTime = null;
  }
}

setInterval(() => {
  if (skin === 'champion') {
    checkWorkingFatigue(state);
  }
}, 15000);

function updateChampionSpine(s) {
  if (!championSpineReady || !championPet) {
    if (!championSpineLoading && skin === 'champion') initChampionSpine();
    return;
  }
  checkWorkingFatigue(s);
  const animName = getChampionAnim(s);
  const curTrack = championPet.state && championPet.state.getCurrent(0);
  if (championCurrentAnim === animName && curTrack && !curTrack.isComplete()) {
    return;
  }
  championCurrentAnim = animName;
  try {
    championPet.state.setAnimation(0, animName, true);
  } catch (e) {
    console.warn('Failed to set Spine animation:', animName, e);
  }
}`;

if (!petCode.includes(oldGetChampion)) {
  console.error('oldGetChampion not found!');
  process.exit(1);
}
petCode = petCode.replace(oldGetChampion, newGetChampion);

// 8. Update playChampionDragAnim to use getChampionAnim('drag')
const oldDragAnim = `function playChampionDragAnim(isDragging) {
  if (!championSpineReady || !championPet) return;
  if (isDragging) {
    championCurrentAnim = 'wilson/distress_loop';
    try {
      championPet.state.setAnimation(0, 'wilson/distress_loop', true);
    } catch {}
  } else {
    championCurrentAnim = null;
    updateChampionSpine(state);
  }
}`;

const newDragAnim = `function playChampionDragAnim(isDragging) {
  if (!championSpineReady || !championPet) return;
  if (isDragging) {
    const dragAnim = getChampionAnim('drag');
    championCurrentAnim = dragAnim;
    try {
      championPet.state.setAnimation(0, dragAnim, true);
    } catch {}
  } else {
    championCurrentAnim = null;
    updateChampionSpine(state);
  }
}`;

if (!petCode.includes(oldDragAnim)) {
  console.error('oldDragAnim not found!');
  process.exit(1);
}
petCode = petCode.replace(oldDragAnim, newDragAnim);

// 9. Update poke in line 4370
const oldPokeBlock = `          try {
            const pokeAnim = (state === 'sleeping') ? 'wilson/sleep' : 'wilson/emote_fistshake';
            championPet.state.setAnimation(0, pokeAnim, false);
            const resumeAnim = CHAMPION_SPINE_ANIMS[state] || CHAMPION_SPINE_ANIMS.idle;
            championPet.state.addAnimation(0, resumeAnim, true, 0);
          } catch (err) {}`;

const newPokeBlock = `          try {
            const pokeAnim = (state === 'sleeping') ? getChampionAnim('sleeping') : getChampionAnim('poke');
            championPet.state.setAnimation(0, pokeAnim, false);
            const resumeAnim = getChampionAnim(state);
            championPet.state.addAnimation(0, resumeAnim, true, 0);
          } catch (err) {}`;

if (!petCode.includes(oldPokeBlock)) {
  console.error('oldPokeBlock not found!');
  process.exit(1);
}
petCode = petCode.replace(oldPokeBlock, newPokeBlock);

// 10. Hook custom soundEffects into SOUND
const oldSoundBlock = `const SOUND = {
  waiting: () => beep([660, 880], 0.2, 'sine', 0.08), // 上行提示音
  done: () => beep([784, 1047], 0.15, 'triangle', 0.06), // 愉快叮咚
  error: () => beep([220, 165], 0.2, 'sawtooth', 0.05), // 低沉
  greet: () => beep([523, 784], 0.13, 'sine', 0.05), // 招呼
  bigDone: () => beep([659, 784, 988, 1319], 0.13, 'triangle', 0.07), // 上行小号角
};`;

const newSoundBlock = `const SOUND = {
  waiting: () => {
    if (window.PET_CONFIG && window.PET_CONFIG.soundEffects && window.PET_CONFIG.soundEffects.waiting) {
      window.playPetSound(window.PET_CONFIG.soundEffects.waiting);
    }
    beep([660, 880], 0.2, 'sine', 0.08);
  },
  done: () => {
    if (window.PET_CONFIG && window.PET_CONFIG.soundEffects && window.PET_CONFIG.soundEffects.taskComplete) {
      window.playPetSound(window.PET_CONFIG.soundEffects.taskComplete);
    }
    beep([784, 1047], 0.15, 'triangle', 0.06);
  },
  error: () => {
    if (window.PET_CONFIG && window.PET_CONFIG.soundEffects && window.PET_CONFIG.soundEffects.errorAlert) {
      window.playPetSound(window.PET_CONFIG.soundEffects.errorAlert);
    }
    beep([220, 165], 0.2, 'sawtooth', 0.05);
  },
  greet: () => {
    if (window.PET_CONFIG && window.PET_CONFIG.soundEffects && window.PET_CONFIG.soundEffects.greet) {
      window.playPetSound(window.PET_CONFIG.soundEffects.greet);
    }
    beep([523, 784], 0.13, 'sine', 0.05);
  },
  bigDone: () => {
    if (window.PET_CONFIG && window.PET_CONFIG.soundEffects && window.PET_CONFIG.soundEffects.bigDone) {
      window.playPetSound(window.PET_CONFIG.soundEffects.bigDone);
    }
    beep([659, 784, 988, 1319], 0.13, 'triangle', 0.07);
  },
};`;

if (!petCode.includes(oldSoundBlock)) {
  console.error('oldSoundBlock not found!');
  process.exit(1);
}
petCode = petCode.replace(oldSoundBlock, newSoundBlock);

fs.writeFileSync('D:/存储/LLMPET-main/renderer/pet.js', petCode, 'utf8');
console.log('renderer/pet.js successfully patched!');
