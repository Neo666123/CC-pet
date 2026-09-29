// ==========================================
// ??? �û��Զ������ð�ȫ���� (����ʹ�� custom_config.js)
// ==========================================
window.PET_CONFIG = Object.assign({
  championScale: 0.368,
  championX: 100,
  championY: 205,
  allowBodyClickToOpenMenu: false,
}, window.PET_CONFIG || {});
// ==========================================

'use strict';

// ��ֻ�趢˭�������̽�����ʱ�� ?agent= ָ�ɡ�
//   all    ����ģʽ��Claude + Codex ����
//   claude / codex / dsh  ����ģʽ������һ������
const AGENT = new URLSearchParams(location.search).get('agent') || 'all';
const AGENT_NAME = { claude: 'Claude', codex: 'Codex', dsh: 'DeepSeek Harness', unknown: 'Agent' };
const AGENT_LABEL = AGENT_NAME[AGENT] || '';
// �Ự��/�����ϵġ�˭����δ֪���˱������ԣ��������� Claude��
const agentName = (agent) => AGENT_NAME[agent] || 'Agent';
// Capabilities are provider-owned, never inferred from a UUID, terminal, or
// future provider name. dsh may be handed off as a readable source, but meme
// dispatch and travel are only implemented for Claude/Codex. Unknown providers
// fail closed on every mutating/session-launch action.
const SESSION_ACTIONS = {
  claude: { takeover: true, meme: true, travel: true },
  codex: { takeover: true, meme: true, travel: true },
  dsh: { takeover: true, meme: false, travel: false },
};
const sessionActionAllowed = (session, action) => !!(
  session && SESSION_ACTIONS[session.agent] && SESSION_ACTIONS[session.agent][action]
);

const stage = document.getElementById('stage');
const pixel = document.getElementById('pixel');
const mascot = document.getElementById('mascot');
const mascotImg = document.getElementById('mascot-img');
const cat = document.getElementById('cat');
const championSpine = document.getElementById('champion-spine');

// ͼ���״̬��������ÿ��״̬һ��ֻ���۾���ͼ��
const MASCOT_EYES = {
  working: 'mascot-work.png', // �ɻ���űʼǱ��ô��� + ���ȣ���������������
  roam: 'mascot.png',        // ���У�ʹ������վ�ˣ�����������·����
  juggling: 'mascot-work.png', // �������������޶���ͼ�����䵽�ɻ�
  sweeping: 'mascot-work.png', // ���������ģ��޶���ͼ�����䵽�ɻ�
  loafing: 'mascot-sleep.png', // ��϶���㣺�޶���ͼ�����䵽���۴���
  idle: 'mascot-sleep.png',   // �����񣺱���
  sleeping: 'mascot-sleep.png',
  thinking: 'mascot-think.png', // ˼�������Ͽ�
  happy: 'mascot-happy.png',  // ���ɣ�^^ Ц��
  greet: 'mascot-happy.png',
  talking: 'mascot-happy.png',
  waiting: 'mascot-wait.png', // ���㴦�����ɴ�
  needsinput: 'mascot-think.png', // �����ظ������Ͽ�(�ڴ�)
  error: 'mascot-wait.png',
  // ��������̬ �� �ͽ����䣨ר��ͼδ����
  loved: 'mascot-happy.png',
  excited: 'mascot-happy.png',
  sad: 'mascot-wait.png',
  sorry: 'mascot-wait.png',
  puzzled: 'mascot-think.png',
};
function updateMascotEyes(s) {
  if (!mascotImg) return;
  const f = MASCOT_EYES[s] || 'mascot.png';
  if (!mascotImg.getAttribute('src').endsWith(f)) mascotImg.src = '../assets/' + f;
}

// ��н����cat����ÿ��״̬һ�� meme GIF��ԭ���ߣ����� @��н����
const catImg = document.getElementById('cat-img');
const CAT_STATES = {
  idle: 'cat-idle.gif',           // ת���ϱ�����+�ֻ����㣺����
  roam: 'cat-roam.gif',           // ���������棺�й�
  working: 'cat-working.gif',     // ���������ġ��Ϻš���ť���ɻ�
  thinking: 'cat-thinking.gif',   // ���űʼǱ���ͷ��˼��
  lookout: 'cat-thinking-2.gif',  // ſ���������ƣ��Ӷ�����Զ����ս��
  talking: 'cat-talking.gif',     // ���űʼǱ�������������������Ӧ��
  juggling: 'cat-juggling.gif',   // ſ�����ϻ�ͬʱˢ�ֻ�������������
  sweeping: 'cat-sweeping.gif',   // ������ˮ��ɨ��ѹ��/����
  waiting: 'cat-waiting.gif',     // ð�����ŵȴ���������Ȩ
  needsinput: 'cat-needsinput.gif', // ͷ��ð�ʺ���ͷ�������ظ�
  happy: 'cat-happy.gif',         // ��Сè��ͷ���䣺������ף
  greet: 'cat-greet.gif',         // ������ը�ѵ��䵽��λ���»Ự��������
  attention: 'cat-attention.gif', // �ӹ�λ�������ֻ�����Ϣ����Ҫע��
  sleeping: 'cat-sleeping.gif',   // ������˯��һ�磺˯��
  error: 'cat-error.gif',         // ��ͷ�������У�����
  loafing: 'cat-loafing.gif',     // �ɵ���ˢ�ֻ�����һ�����ꡢ����һ���ļ�϶����
  // ��������̬ �� �ͽ�ӳ�䣬�����䵽���� idle ͼ���������İ������ܣ�
  loved: 'cat-happy.gif',         // ���� �� ��ͷ����
  excited: 'cat-happy.gif',
  sad: 'cat-sad.gif',             // ���������� �� ��������
  sorry: 'cat-waiting.gif',       // ��Ǹ �� ð�亹����
  puzzled: 'cat-needsinput.gif',  // �ɻ� �� ͷ���ʺ�
};
// working/thinking ��ͣ�����õ�����״̬ �� ������̬�ֻ�������ʱ����һ�ţ�
// �����ڼ�ÿ 60s Ҳ��һ�š��������ĻỰ����һ��Ҫ�����ӣ����ž�ֹͼ
// �������ӹ۸����������ֻ��á������š����ü���
const CAT_POOLS = {
  working: [
    'cat-working.gif',   // ���ġ��Ϻš���ť
    'cat-working-2.gif', // ��ҹ�ھ���������������ʾ��
    'cat-working-3.gif', // ���Ŷ�����ͷ���ü���
    'cat-working-4.gif', // �߳���ʳ���ü���
  ],
  thinking: [
    'cat-thinking.gif',   // ���űʼǱ���ͷ
    'cat-thinking-2.gif', // �����룺ͷ�������ơ�˼����
  ],
  sleeping: [
    'cat-sleeping.gif',   // ������˯��һ��
    'cat-sleeping-2.gif', // �������ϰ��¶���ë������˯
  ],
  loafing: [
    'cat-loafing.gif',   // �ɵ���ˢ�ֻ�
    'cat-loafing-2.gif', // ɳ���ϵ�����
    'cat-loafing-3.gif', // ������ͷ��ƿ+�ֻ�
  ],
};

// ����Ů�ͣ�whale�������н�ɫ��ͼ����Ƶ������ÿ״̬һ�� 360px GIF��
// ״̬�ṹ�� cat ��ȫͬ�����������߹���ͬһ����Ⱦ��֧��ͬһ�� DOM �ڵ㣻
// whale ͨ�� skin-whale ���� 180px ���֣��� Retina ����ʹ����ʵ 2x Դ��
// �� assets/whale/CREDITS.md��
const WHALE_STATES = {
  idle: 'whale-idle.gif',             // ת��������+�ֻ�������
  working: 'whale-working.gif',       // ��ǰ���űʼǱ����ɻ�
  thinking: 'whale-thinking.gif',     // ����̫��Ѩ+ѹ�����ţ�˼��
  talking: 'whale-talking.gif',       // ���������űʼǱ���������Ӧ��
  juggling: 'whale-juggling.gif',     // ſ�����ϻ�ˢ�ֻ�������������
  sweeping: 'whale-sweeping.gif',     // ������ˮ��ѹ��/����
  waiting: 'whale-waiting.gif',       // ð��������д��������Ȩ
  needsinput: 'whale-needsinput.gif', // ͷ���ʺ���ͷ�������ظ�
  attention: 'whale-attention.gif',   // �ӹ�λ���ֻ�����Ҫע��
  error: 'whale-error.gif',           // ��ͷ�������У�����
  sad: 'whale-sad.gif',               // �������ޣ���������
  loafing: 'whale-loafing.gif',       // ����ˢ�ֻ�����϶����
  sorry: 'whale-waiting.gif',         // ��Ǹ �� ð�亹����
  puzzled: 'whale-needsinput.gif',    // �ɻ� �� ͷ���ʺ�
  happy: 'whale-happy.gif',           // ��������ż��ͷ���䣺������ף
  loved: 'whale-happy.gif',           // ���� �� ��ͷ����
  excited: 'whale-happy.gif',
  roam: 'whale-roam.gif',             // ԭ��С�ܣ��й�
  lookout: 'whale-thinking-2.gif',    // ſ�����򡸸��ơ����Ӷ�����ս��
  sleeping: 'whale-sleeping.gif',     // ���ѹİ�������������˯��
  greet: 'whale-greet.gif',           // ������λ���»Ự��������
};
// �� cat ͬ������̬�ֻ���working/thinking ��ͣ�����õ�����״̬������ͼ��������
// �۸���������thinking ������ whale-working-3.gif �ǡ���ǰ���űʼǱ������š���
// thinking �� working-3 �Ļ��水���������Ե��������ڳ��ж����� thinking ��ͼλ��
const WHALE_POOLS = {
  working: [
    'whale-working.gif',   // ���������ġ��Ϻš���ť
    'whale-working-2.gif', // ��ҹ�ھ���������������ʾ��
    'whale-working-3.gif', // ��ǰ���űʼǱ�
    'whale-working-4.gif', // �߳���ʳ���ü���
  ],
  sleeping: [
    'whale-sleeping.gif',   // ���ѹİ�����������
    'whale-sleeping-2.gif', // �������ϱ���˯
  ],
  loafing: [
    'whale-loafing.gif',   // ����ˢ�ֻ�
    'whale-loafing-2.gif', // ����ɳ���ϵ�����
    'whale-loafing-3.gif', // ����ɳ����ƿ+�ֻ�
  ],
};

// DeepSeek Ů����֡�棺������ԭ whale �� 23 ��������������Ӧ��н��Դ������
// ����ʹ�� CAT ��״̬/�ֻ��ṹ���������� whale �����������Ķ���λ��
// �زİ�����ԭ�ֽڱ�����sweeping Ϊ V6��loafing Ϊ V4��working-4 Ϊ V10��
const DEEPSEEK_MAID_STATES = Object.fromEntries(
  Object.entries(CAT_STATES).map(([state, file]) => [state, file.replace(/^cat-/, 'deepseek-maid-')]),
);
const DEEPSEEK_MAID_POOLS = Object.fromEntries(
  Object.entries(CAT_POOLS).map(([state, files]) => [state, files.map((file) => file.replace(/^cat-/, 'deepseek-maid-'))]),
);

// meme ��Ƥ������һ����Ⱦ��֧���˴˵Ĳ���ȫ���������ű��

  
// ---------- ��������DST ��������С���� (Spine) ----------
const CHAMPION_SPINE_ANIMS = {
  // ������״̬ (8)
  idle: 'wilson/acting_idle2',
  thinking: 'wilson/emote_impatient',
  working: 'wilson/book',
  juggling: 'wilson/emoteXL_loop_dance7',
  carrying: 'wilson/acting_2',
  sweeping: 'wilson/dial_loop',
  roam: 'wilson/run_loop_down',
  sleeping: 'wilson/sleep',
  // ���������� (4)
  waiting: 'wilson/emote_impatient',
  needsinput: 'wilson/emote_annoyed_facepalm',
  attention: 'wilson/emote_waving',
  error: 'wilson/distress_loop',
  // ��������̬ (8)
  happy: 'wilson/emote_happycheer',
  greet: 'wilson/emote_happycheer',
  talking: 'wilson/emote_waving',
  loafing: 'wilson/emote_loop_sit1',
  loved: 'wilson/emote_happycheer',
  sad: 'wilson/emote_sad',
  sorry: 'wilson/distress_loop',
  puzzled: 'wilson/emote_annoyed_facepalm',
  excited: 'wilson/emote_jumpcheer',
  // ��˯���������� (4)
  yawning: 'wilson/emote_sit',
  dozing: 'wilson/sleep',
  collapsing: 'wilson/sleep',
  waking: 'wilson/acting_idle2',
  // ��������չ (3)
  drag: 'wilson/distress_loop',
  poke: 'wilson/emote_fistshake',
  tired: 'wilson/emote_sad',
};

// ������Ƶ����֧�� (֧�ֱ������ⲿ��Ƶ���������Զ���������)
window.playPetSound = function(soundPath, volume = 1.0) {
  if (muted || (window.isPetMuted && window.isPetMuted())) return;
  if (!soundPath) return;
  try {
    const sLower = String(soundPath).toLowerCase();
    // ����/�ܻ���Ч 0.5 ���ţ���ͨ������Ч 0.75 ���ţ���ȡ�û�ȫ�ֵ�������
    const isHit = sLower.includes('hit') || sLower.includes('ouch');
    const scaleFactor = isHit ? 1 : 0.75;
    const cfg = window.PET_CONFIG || {};
    const baseVol = isHit
      ? (cfg.hitSoundVolume != null ? cfg.hitSoundVolume : 0.2)
      : (cfg.soundVolume != null ? cfg.soundVolume : 0.1);
    let resolvedUrl = soundPath;
    if (!soundPath.startsWith('http') && !soundPath.startsWith('file:') && !soundPath.startsWith('/')) {
      resolvedUrl = new URL('../' + soundPath, window.location.href).href;
    }
    const audio = new Audio(resolvedUrl);
    audio.volume = Math.max(0, Math.min(1, baseVol * volume * scaleFactor));
    audio.play().catch((err) => {
      console.warn('[PetSound] play failed:', resolvedUrl, err);
    });
  } catch (e) {
    console.warn('[PetSound] error:', e);
  }
};

let isFallingAsleep = false;
let sleepLevel = 0; // 0: ����, 1: ��������Ƿ, 2: ����˯, 3: ����˯�߸Ǳ�
let wakeLockUntil = Date.now() + 10000;
window.setPetWakeLock = function(ms = 300000) {
  wakeLockUntil = Math.max(wakeLockUntil, Date.now() + ms);
}; // ����˯����ʱ���������״��Ѻ󼸷���������������˯�ߣ�
let sleepSequenceTimeouts = [];

function clearSleepSequence() {
  isFallingAsleep = false;
  if (Array.isArray(sleepSequenceTimeouts)) {
    for (const t of sleepSequenceTimeouts) {
      clearTimeout(t);
    }
  }
  sleepSequenceTimeouts = [];
}

// ============================================================================
// CCPET С���壨Champion��ר���߼������� (ͳһ��ȫί���� window.ChampionController)
// ============================================================================
let lastLeftClickTime = 0;
let lastBubbleText = '';
let lastBubbleTime = 0;

const cc = () => window.ChampionController;
function initChampionSpine() { if (cc()) cc().init(document.getElementById("champion-spine")); }
function updateChampionSpine(s, forceEnter = false) { if (cc()) cc().updateSpine(s, forceEnter); }
function playChampionTalking(durationMs) { if (cc()) cc().playTalking(durationMs); }
function playWorkFinishedCelebration() { return cc() ? cc().playWorkFinishedCelebration() : false; }
function playChampionDragAnim(isDragging) { if (cc()) cc().playDragAnim(isDragging); }
function toggleDanceMode() { if (cc()) cc().toggleDanceMode(); }
function stopChampionWander() { if (cc()) cc().stopWander(); }
function championIdleWander() { if (cc() && typeof cc().startWander === "function") cc().startWander(); }
function handleChampionBodyLeftClick(el) { if (cc()) cc().onLeftClick(el); }
function handleChampionBodyLeftDoubleClick(el) { if (cc()) cc().onLeftDoubleClick(el); }
function handleChampionBodyRightClick(el) { if (cc()) cc().onRightClick(el); }
function isChampionDead() { return !!(skin === "champion" && cc() && cc().isRageDead); }
function reviveFromRageDeath(reason = "") { if (cc()) cc().reviveFromDead(); }
function hasChampionAnim(animName) { return cc() ? cc().hasAnim(animName) : false; }
function clearChampionAnimLocksAndTimers() {
  if (cc()) {
    if (cc().oneShotTimer) { clearTimeout(cc().oneShotTimer); cc().oneShotTimer = null; }
    if (cc().talkTimeout) { clearTimeout(cc().talkTimeout); cc().talkTimeout = null; }
    cc().isAnimLocked = false;
  }
}
Object.defineProperty(window, "isRageDead", { get: () => cc() ? cc().isRageDead : false, set: (v) => { if (cc()) cc().isRageDead = !!v; }, configurable: true });
Object.defineProperty(window, "championPet", { get: () => cc() ? cc().pet : null, configurable: true });
Object.defineProperty(window, "championSpineReady", { get: () => cc() ? cc().isSpineReady : false, configurable: true });
Object.defineProperty(window, "championSpineLoading", { get: () => cc() ? cc().isLoading : false, configurable: true });
Object.defineProperty(window, "isAnimLocked", { get: () => cc() ? cc().isAnimLocked : false, set: (v) => { if (cc()) cc().isAnimLocked = !!v; }, configurable: true });
Object.defineProperty(window, "isDraggingLocked", { get: () => cc() ? cc().isDraggingLocked : false, set: (v) => { if (cc()) cc().isDraggingLocked = !!v; }, configurable: true });
Object.defineProperty(window, "isDanceMode", { get: () => cc() ? cc().isDanceMode : false, set: (v) => { if (cc()) cc().isDanceMode = !!v; }, configurable: true });
function wakeUpPetRenderer() {
  try {
    if (isChampionDead()) reviveFromRageDeath("window-wake");
    if (cc() && cc().app && cc().app.ticker && !cc().app.ticker.started) cc().app.ticker.start();
    if (window.pet && typeof window.pet.getStats === "function") {
      window.pet.getStats().then((s) => { if (s && typeof applyStats === "function") applyStats(s); }).catch(() => {});
    }
  } catch (err) { console.warn("[wakeUpPetRenderer error]", err); }
}
window.addEventListener("focus", wakeUpPetRenderer);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") wakeUpPetRenderer(); });
if (window.pet && typeof window.pet.onWakeup === "function") { window.pet.onWakeup(() => { wakeUpPetRenderer(); }); }
window.showPetBubble = function(text, holdMs = 3000) { return showBubble(text, holdMs, true); };

const MEME_PACKS = {
  cat: { dir: 'cat', states: CAT_STATES, pools: CAT_POOLS },
  whale: { dir: 'whale', states: WHALE_STATES, pools: WHALE_POOLS },
  'deepseek-maid': { dir: 'deepseek-maid', states: DEEPSEEK_MAID_STATES, pools: DEEPSEEK_MAID_POOLS },
};
const isMeme = () => Object.prototype.hasOwnProperty.call(MEME_PACKS, skin);
const memePack = () => MEME_PACKS[skin] || MEME_PACKS.cat;

const POOL_ROTATE_MS = 60 * 1000;
let poolIdx = 0;
let poolRot = null;
let memeWorkReaction = null;
let memeWorkReactionTimer = null;
let lootActionVisual = null;
let lootActionDirection = 0;
let lootActionTimer = null;
function finishMemeWorkReaction(refresh = false) {
  memeWorkReaction = null;
  clearTimeout(memeWorkReactionTimer);
  memeWorkReactionTimer = null;
  // ��ѹ������̬�����󣬴ӵ�ǰ��ʵ״̬�Ķ�����������һ�ţ�����ÿ��
  // ����е�ػص�ͬһ��Ĭ�϶�����˯�߻��ѻ�����ʱ�ӿ�Խ���޺���
  // activeMemeWorkVisual �Ķ��Ե���·��Ҳ�������
  const pool = memePack().pools[state];
  if (pool && pool.length) poolIdx = Math.floor(Math.random() * pool.length);
  if (refresh && isMeme()) updateCat(state);
}
function activeMemeWorkVisual(s) {
  if (!memeWorkReaction) return null;
  if (perfNow() >= memeWorkReaction.until) {
    finishMemeWorkReaction(false);
    return null;
  }
  return memeWorkReaction.activeStates.has(s) ? memeWorkReaction.visualState : null;
}
function updateCat(s) {
  if (!catImg) return;
  const { dir, states, pools } = memePack();
  const workVisual = activeMemeWorkVisual(s);
  const pool = (workVisual || lootActionVisual) ? null : pools[s];
  const f = lootActionVisual
    ? (states[lootActionVisual] || states.attention)
    : workVisual
    ? (states[workVisual] || states.working)
    : (pool ? pool[poolIdx % pool.length] : (states[s] || states.idle));
  if (!catAssetMatches(dir + '/' + f)) catImg.src = '../assets/' + dir + '/' + f;
  if (pool) {
    if (!poolRot) {
      poolRot = setInterval(() => {
        if (!isMeme()) return;
        const p = memePack();
        const cur = p.pools[state];
        if (!cur) return;
        poolIdx++;
        catImg.src = '../assets/' + p.dir + '/' + cur[poolIdx % cur.length];
      }, POOL_ROTATE_MS);
    }
  } else if (poolRot) {
    clearInterval(poolRot);
    poolRot = null;
    poolIdx++; // �´ν����ֻ�ֱ̬������һ��
  }
}
// �ȶԺ�Ŀ¼��β�ͣ����������ļ���������Ƥ��ͬ���ļ����ụ������Ϊ"�Ѽ���"��
function catAssetMatches(filename) {
  if (!catImg) return false;
  try {
    return new URL(catImg.src, window.location.href).pathname.endsWith('/' + filename);
  } catch {
    return String(catImg.getAttribute('src') || '').split(/[?#]/, 1)[0].endsWith(filename);
  }
}
function lootVisualNeedsMirror(visualState, direction) {
  const targetDirection = Number(direction) === 1 ? 1 : -1;
  // �����ġ���������è����λ�ڻ�����һ�࣬�������ز�������ʾ�����ıߡ�
  // attention ԭͼ��è��������ʾ�����ң�������ʾ�����򵱳�è�ķ�����
  // �����Ӷ�ʱ�ͻ����������ɡ���ʾ���� Codex��è�˵���Զ���Ҳࡱ��
  // �����Ӷᶯ����è����ԭ���������࣬���Ҷ���ʱ��ͳһ������
  const nativeDirection = -1;
  return targetDirection !== nativeDirection;
}
function setLootActionVisual(visualState, direction) {
  lootActionVisual = visualState;
  lootActionDirection = Number(direction) === 1 ? 1 : -1;
  cat.classList.toggle('loot-action-mirrored',
    lootVisualNeedsMirror(visualState, lootActionDirection));
  if (isMeme()) updateCat(state);
}
function startLootCaptureVisual(direction) {
  clearTimeout(lootActionTimer);
  lootActionTimer = null;
  setLootActionVisual('attention', direction);
}
function startLootKick(direction) {
  clearTimeout(lootActionTimer);
  lootActionTimer = null;
  setLootActionVisual('roam', direction);
  // ͬһ�� GIF ��������ʱ������Ĭ�ϻ������ϴβ��Ž��ȡ���һ�ν����ڱ���
  // �ݳ��Ĳ�ѯ����ȷ�������ӵ�һ֡��ʼ�����˰���ʵ helper ʱ��ͬ�����š�
  if (isMeme() && catImg) {
    const { dir, states } = memePack();
    catImg.src = '../assets/' + dir + '/' + (states.roam || states.idle) + '?loot-kick=' + Date.now();
  }
}
function startLootLookout(direction, durationMs = 6000) {
  clearTimeout(lootActionTimer);
  setLootActionVisual('lookout', direction);
  lootActionTimer = setTimeout(() => {
    lootActionTimer = null;
    stopLootActionVisual();
  }, durationMs);
}
function stopLootActionVisual() {
  clearTimeout(lootActionTimer);
  lootActionTimer = null;
  lootActionVisual = null;
  lootActionDirection = 0;
  cat.classList.remove('loot-action-mirrored');
  if (isMeme()) updateCat(state);
}
function clearMemeWorkReaction(refresh = true) {
  const wasActive = !!memeWorkReaction;
  memeWorkReaction = null;
  clearTimeout(memeWorkReactionTimer);
  memeWorkReactionTimer = null;
  if (wasActive && refresh && isMeme()) updateCat(state);
}
function startMemeWorkReaction(work) {
  clearMemeWorkReaction(false);
  if (!work || !work.visualState || !Array.isArray(work.activeStates) || !work.activeStates.length) {
    if (isMeme()) updateCat(state);
    return false;
  }
  const durationMs = Math.max(1000, Math.min(120000, Number(work.durationMs) || 30000));
  memeWorkReaction = {
    visualState: work.visualState,
    activeStates: new Set(work.activeStates),
    until: perfNow() + durationMs,
  };
  if (isMeme()) updateCat(state);
  memeWorkReactionTimer = setTimeout(() => {
    if (!memeWorkReaction || perfNow() < memeWorkReaction.until) return;
    finishMemeWorkReaction(true);
  }, durationMs + 30);
  return true;
}
function applyDeliveredMemeWorkReaction(meme, result) {
  // inputSent means the native input path itself completed. submitted is the
  // stronger, eventually-consistent transcript confirmation. The reaction
  // should not disappear merely because transcript refresh lagged behind.
  if (!result || (!result.submitted && !result.inputSent)) {
    // playMeme starts the visual optimistically so it is continuous with the
    // short meme reaction. An explicit delivery failure must roll that back.
    clearMemeWorkReaction(true);
    return false;
  }
  // Usually playMeme already started it. Do not restart the 30-second clock
  // after transcript verification, otherwise slow confirmation lengthens the
  // configured reaction unpredictably.
  if (memeWorkReaction) return true;
  return startMemeWorkReaction(meme && meme.reaction && meme.reaction.work);
}
const bubble = document.getElementById('bubble');
const bubbleText = document.getElementById('bubble-text');
const bubbleHead = document.getElementById('bubble-head');
const bubbleProject = document.getElementById('bubble-project');
const bubbleDismiss = document.getElementById('bubble-dismiss');
const bubbleStack = document.getElementById('bubble-stack');
const bubbleToggle = document.getElementById('bubble-toggle');
const bubbleCount = document.getElementById('bubble-count');
const bubbleChevron = document.getElementById('bubble-chevron');
const bubbleActivity = document.getElementById('bubble-activity');
const bubbleActivityIcon = document.getElementById('bubble-activity-icon');
const bubbleActivityText = document.getElementById('bubble-activity-text');
const chipCost = document.getElementById('chip-cost');
const chipWindow = document.getElementById('chip-window');
const chipSep = document.getElementById('chip-sep');
const chip = document.getElementById('chip');
const sessionsEl = document.getElementById('sessions');
const radial = document.getElementById('radial');
const thinkEl = document.getElementById('think');
const sleepEl = document.getElementById('sleep');
const propEl = document.getElementById('prop');
const sidekickEl = document.getElementById('sidekick');
const askEl = document.getElementById('ask');
const askScroll = document.getElementById('ask-scroll');
const askLabel = document.getElementById('ask-label');
const askSess = document.getElementById('ask-sess');
const askQhead = document.getElementById('ask-qhead');
const askQ = document.getElementById('ask-q');
const askHint = document.getElementById('ask-hint');
const askOpts = document.getElementById('ask-opts');
const askInputRow = document.getElementById('ask-input-row'); // .ask-other
const askText = document.getElementById('ask-text');
const askPage = document.getElementById('ask-page');
const askFoot = document.getElementById('ask-foot');
const askSubmit = document.getElementById('ask-submit');
const askBack = document.getElementById('ask-back');
const askTerm = document.getElementById('ask-term');
const notepad = document.getElementById('notepad');
const npBadge = document.getElementById('np-badge');
const todopop = document.getElementById('todopop');
const tpProg = document.getElementById('tp-prog');
const tpList = document.getElementById('tp-list');
const tpActs = document.getElementById('tp-acts');
const tpActSec = document.getElementById('tp-act-sec');
const tpTodoSec = document.getElementById('tp-todo-sec');
const sesslist = document.getElementById('sesslist');
const slRows = document.getElementById('sl-rows');
const slSub = document.getElementById('sl-sub');
const slTitle = document.getElementById('sl-title');
const slBack = document.getElementById('sl-back');
const slSessionView = document.getElementById('sl-session-view');
const slLoot = document.getElementById('sl-loot');
const slLootText = document.getElementById('sl-loot-text');
const slMemeView = document.getElementById('sl-meme-view');
const slMemeSession = document.getElementById('sl-meme-session');
const slMemeGrid = document.getElementById('sl-meme-grid');
const slMemeStatus = document.getElementById('sl-meme-status');
const slTakeoverView = document.getElementById('sl-takeover-view');
const slTakeoverSession = document.getElementById('sl-takeover-session');
const slTakeoverClaude = document.getElementById('sl-takeover-claude');
const slTakeoverCodex = document.getElementById('sl-takeover-codex');
const slTakeoverClaudeMode = document.getElementById('sl-takeover-claude-mode');
const slTakeoverCodexMode = document.getElementById('sl-takeover-codex-mode');
const slTakeoverStatus = document.getElementById('sl-takeover-status');
const slTravelView = document.getElementById('sl-travel-view');
const slTravelSession = document.getElementById('sl-travel-session');
const slTravelRankIcons = document.getElementById('sl-travel-rank-icons');
const slTravelRankMeta = document.getElementById('sl-travel-rank-meta');
const slMachineRankIcons = document.getElementById('sl-machine-rank-icons');
const slMachineRankMeta = document.getElementById('sl-machine-rank-meta');
const slTravelSetup = document.getElementById('sl-travel-setup');
const slTravelTemplates = document.getElementById('sl-travel-templates');
const slTravelMission = document.getElementById('sl-travel-mission');
const slTravelStart = document.getElementById('sl-travel-start');
const slTravelActive = document.getElementById('sl-travel-active');
const slTravelActiveStatus = document.getElementById('sl-travel-active-status');
const slTravelActiveMission = document.getElementById('sl-travel-active-mission');
const slTravelCancel = document.getElementById('sl-travel-cancel');
const slTravelPostcard = document.getElementById('sl-travel-postcard');
const slTravelPostcardMeta = document.getElementById('sl-travel-postcard-meta');
const slTravelStopTrack = document.getElementById('sl-travel-stop-track');
const slTravelStopPrev = document.getElementById('sl-travel-stop-prev');
const slTravelStopNext = document.getElementById('sl-travel-stop-next');
const slTravelStopPage = document.getElementById('sl-travel-stop-page');
const slTravelMailboxes = document.getElementById('sl-travel-mailboxes');
const slTravelHistory = document.getElementById('sl-travel-history');
const slTravelStatus = document.getElementById('sl-travel-status');
const slWander = document.getElementById('sl-wander');
const slTravelInbox = document.getElementById('sl-travel-inbox');
const slSearch = document.getElementById('sl-search');
const slFilters = document.getElementById('sl-filters');
const slArchivedToggle = document.getElementById('sl-archived-toggle');
const memePlayer = document.getElementById('meme-player');
const memeImage = document.getElementById('meme-image');
const memeCaption = document.getElementById('meme-caption');

let askActive = false;
let askQueue = []; // ��ǰ���д�������ѡ��/���루ÿ� project��
let askIdx = 0;
let lastAskSig = ''; // ��ǰ��������ǩ��������ÿ 2s ���ֳ����û�����
const answered = new Set(); // �Ѵ��� key�����������ӳٵ����ص�
let askHover = false; // ������ѡ��������
let elic = null;      // elicitation ��Ⱦ̬��{ key, questions, qIdx, answers, selected }
let sessionSearch = '';
let sessionFilter = 'all';
let showArchived = false;
let pinnedSessionIds = [];
let archivedSessionIds = [];
// ���忪�š���(������������ / �������۽�/�вݸ� / ��ѡ��ѡ��) = �����У�
// ��ʱ���������塢����С����״̬�����ô�����˼��/ѡ��������һ�ؾ��Զ�������
const isInteracting = () => askActive && (askHover || document.activeElement === askText || !!(askText && askText.value) || (elic && elic.selected != null));

// �� UI ����д��־�������Լ죻˫��ģʽ�� tag ��������ǰ׺��claude:state / codex:state��
const rlog = (tag, msg) => { try { window.pet.petLog((AGENT === 'all' ? '' : AGENT + ':') + tag, msg); } catch {} };
let dragTraceCounter = 0;
const dragRect = (rect) => rect && ({
  x: rect.x, y: rect.y, left: rect.left, top: rect.top,
  right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height,
});
const traceDrag = (event, details = {}) => {
  try { window.pet.petDragTrace({ event, at: Date.now(), ...details }); } catch {}
};
// i18n: shared/i18n.js is loaded as a <script> before this file.
const t = (key, vars) => window.OctoI18n.t(key, vars);
// A reason arrives as a stable key ('reply'|'plan'|'perm'); older payloads may
// still carry free text, so fall back to whatever came in.
const waitPhrase = (reason) => (reason ? t('wait.' + reason) : t('wait.default'));
const reasonWord = (reason) => (reason ? t('reason.' + reason) : t('reason.default'));
const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// ���� sessionId������ͬһ��Ŀ���������лỰ������ͬ�������⣬�Ṳ��һ�� key��
// ����һ���Ͱ���һ��Ҳ���ǳ� answered �̵���choice �����촦���� sessionId��
const choiceKey = (c) => (c && (c.sessionId || '') + '|' + (c.requestId || c.permId || '') + '|' + (c.project || '') + '|' + (c.question || '')) || '';

// ��̬���ߣ������� pet �Ϸ�(bottom:200)���Ѵ��ڸ߶ȵ����պ��������ݣ�
// �����̶��󴰿����� / ���������ơ�������Ŀ�����������߶ȣ������ڻ���
// 320px խ�����Ȳ⣬���ı��ᱻ���Ȼ��У������ذѵ����ŵ������ߡ�
const POPUP_W = 520;
const TRAVEL_POPUP_W = 760;
const POPUP_BOTTOM = 200;
const ASK_VIEWPORT_MAX_H = 520;
// ��ͨ�Ựҳ��Զֻռ���� Session �Ĺ̶��߶ȣ���������ֻ���б��ڲ�������
// �Ӷᰴ������ʱҲ����ͬһ��ֵ��BrowserWindow �Ӵ򿪵��������ٸı��ߴ硣
// �Ҳ����߷�֧�� 3 ���Ựʱ��ʵ�����ݸ߶�Ϊ 310px����Ӧ 520 �� 534
// �� BrowserWindow���̶�ʹ���������и߶ȣ������Ựֻ�� sl-scroll �ڹ�����
const SESSION_PANEL_H = 310;
// �ӹ�ҳ�����õ�ǰ 340px С������ CSS max-height ���������߶ȣ����򶥲�
// ����ʱ�����롰���ڲ����� -> ҳ��ֻʣ���ء��Ĳ�����ѭ��������һ���ȶ�
// �����������߶ȣ�С��Ļ��ҳ���ڲ��������ס�
const TAKEOVER_PANEL_H = 320;
const MEME_WINDOW_W = 760;
const MEME_WINDOW_H = 340;
const MEME_MEDIA_W = 260;
const MEME_GAP = 14;
const MEME_EDGE_PAD = 10;
const BASE_PET_FRAME_W = 380;
const BASE_PET_FRAME_H = 540;
const RESTING_FRAME_MAX_W = 360;
const RESTING_FRAME_MAX_H = 450;
let memeLayoutActive = false;
let fitPopupSeq = 0;
let edgeLayout = { vertical: 'above', horizontal: 'center' };

function browserWorkArea() {
  const s = window.screen || {};
  const width = Number.isFinite(s.availWidth) ? s.availWidth : (window.innerWidth || 320);
  const height = Number.isFinite(s.availHeight) ? s.availHeight : (window.innerHeight || 340);
  return {
    x: Number.isFinite(s.availLeft) ? s.availLeft : 0,
    y: Number.isFinite(s.availTop) ? s.availTop : 0,
    width,
    height,
  };
}

function petGeometrySnapshot() {
  const el = curSkinEl();
  if (!el || !Number.isFinite(window.screenX) || !Number.isFinite(window.screenY)) return null;
  const rect = el.getBoundingClientRect();
  const viewportW = Math.max(1, window.innerWidth || 320);
  const viewportH = Math.max(1, window.innerHeight || 340);
  return {
    workArea: browserWorkArea(),
    windowRect: { x: window.screenX, y: window.screenY, width: viewportW, height: viewportH },
    petRect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
  };
}

function setStageEdgeLayout(next) {
  edgeLayout = { vertical: 'above', horizontal: 'center' };
  stage.classList.remove('edge-below', 'edge-left', 'edge-right');
  if (propEl && propEl.classList.contains('on')) requestAnimationFrame(alignToolProp);
}

// Changing the flex anchor moves the pet inside the transparent BrowserWindow.
// This payload lets the main process move/resize that window in the opposite
// direction, so the visible pet stays on exactly the same screen pixel.
let pendingStageLayout = null;
let pendingStageLayoutTimer = null;

function anchoredLayoutPayload(next, options = {}) {
  const before = petGeometrySnapshot();
  if (!before) { setStageEdgeLayout(next); return null; }
  const oldPet = before.petRect;
  const wa = before.workArea;
  const waRight = wa.x + wa.width;
  const waBottom = wa.y + wa.height;
  const wr = before.windowRect;
  const compactHorizontalFrame = wr.width <= RESTING_FRAME_MAX_W;
  const compactVerticalFrame = wr.height <= RESTING_FRAME_MAX_H;
  let screenX = wr.x + oldPet.x;
  let screenY = wr.y + oldPet.y;

  // A frame at the work-area edge plus a large transparent inset means the OS
  // stopped the BrowserWindow before the user's visible pet reached the edge.
  // Treat that as an explicit edge drag and snap the *pet body*, not the frame.
  if (compactVerticalFrame && next.vertical === 'below' && wr.y <= wa.y + 3 && oldPet.y > 18) screenY = wa.y;
  if (compactVerticalFrame && next.vertical === 'above'
    && wr.y + wr.height >= waBottom - 3 && wr.height - oldPet.y - oldPet.height > 18) {
    screenY = waBottom - oldPet.height;
  }
  if (compactHorizontalFrame && next.horizontal === 'left' && wr.x <= wa.x + 3 && oldPet.x > 18) screenX = wa.x;
  if (compactHorizontalFrame && next.horizontal === 'right'
    && wr.x + wr.width >= waRight - 3 && wr.width - oldPet.x - oldPet.width > 18) {
    screenX = waRight - oldPet.width;
  }
  const previous = { ...edgeLayout };
  const layoutChanged = previous.vertical !== next.vertical || previous.horizontal !== next.horizontal;
  setStageEdgeLayout(next);
  const rect = curSkinEl().getBoundingClientRect();
  const viewportW = Math.max(1, window.innerWidth || 320);
  const viewportH = Math.max(1, window.innerHeight || 340);
  const xAlign = edgeLayout.horizontal;
  const yAlign = edgeLayout.vertical === 'below' ? 'top' : 'bottom';
  const xOffset = xAlign === 'left'
    ? rect.left
    : xAlign === 'right'
      ? viewportW - rect.right
      : rect.left + rect.width / 2 - viewportW / 2;
  const yOffset = yAlign === 'top' ? rect.top : viewportH - rect.bottom;

  if (layoutChanged && options.isResizing) {
    setStageEdgeLayout(previous);
    pendingStageLayout = next;
    if (pendingStageLayoutTimer) clearTimeout(pendingStageLayoutTimer);
    pendingStageLayoutTimer = setTimeout(() => {
      if (pendingStageLayout) {
        setStageEdgeLayout(pendingStageLayout);
        pendingStageLayout = null;
      }
    }, 150);
  }

  return {
    screenX, screenY,
    windowX: wr.x, windowY: wr.y,
    windowWidth: wr.width, windowHeight: wr.height,
    width: rect.width, height: rect.height,
    xAlign, yAlign, xOffset, yOffset,
  };
}

function restingEdgeLayout() {
  const snapshot = petGeometrySnapshot();
  if (!snapshot || !window.PetGeometry) return edgeLayout;
  // In an expanded popup the bottom-anchored pet's local y grows by exactly
  // the extra window height. Remove that artificial offset before deciding
  // whether the visible pet itself is actually in the top-edge zone.
  const frameHeightExcess = Math.max(0, snapshot.windowRect.height - BASE_PET_FRAME_H);
  let topThreshold = snapshot.petRect.y - frameHeightExcess + 2;
  if (edgeLayout.vertical === 'below') {
    // Measure the real normal-layout inset for the current skin/status stack.
    // A fixed number is wrong as soon as a chip/bubble changes height and can
    // make pointerup flip the pet back too early.
    const previous = { ...edgeLayout };
    setStageEdgeLayout({ ...previous, vertical: 'above' });
    topThreshold = curSkinEl().getBoundingClientRect().top - frameHeightExcess + 2;
    setStageEdgeLayout(previous);
  }
  return window.PetGeometry.chooseRestingLayout({
    ...snapshot,
    current: edgeLayout,
    threshold: Math.max(24, topThreshold),
    inferVerticalFrameClamp: snapshot.windowRect.height <= RESTING_FRAME_MAX_H,
    inferHorizontalFrameClamp: snapshot.windowRect.width <= RESTING_FRAME_MAX_W,
  });
}

function popupEdgeLayout(height, popupHeight) {
  const snapshot = petGeometrySnapshot();
  if (!snapshot || !window.PetGeometry) return edgeLayout;
  return window.PetGeometry.choosePopupLayout({
    ...snapshot,
    current: edgeLayout,
    popupHeight: Math.max(80, Number(popupHeight) || (Number(height) || 340) - POPUP_BOTTOM),
    inferVerticalFrameClamp: snapshot.windowRect.height <= RESTING_FRAME_MAX_H,
    inferHorizontalFrameClamp: snapshot.windowRect.width <= RESTING_FRAME_MAX_W,
  });
}

function petFrameAlreadySettled(width, height, nextLayout) {
  if (!nextLayout) return false;
  const wa = browserWorkArea();
  const targetWidth = Math.min(width > 0 ? width : BASE_PET_FRAME_W, wa.width);
  const targetHeight = Math.min(height > 0 ? height : BASE_PET_FRAME_H, wa.height);
  const frame = {
    x: Number(window.screenX) || 0,
    y: Number(window.screenY) || 0,
    width: targetWidth,
    height: targetHeight,
  };
  const fullyVisible = window.PetGeometry && window.PetGeometry.windowFitsWorkArea
    ? window.PetGeometry.windowFitsWorkArea(frame, wa)
    : frame.x >= wa.x - 1 && frame.y >= wa.y - 1
      && frame.x + frame.width <= wa.x + wa.width + 1
      && frame.y + frame.height <= wa.y + wa.height + 1;
  return Math.abs((window.innerWidth || 0) - targetWidth) <= 1
    && Math.abs((window.innerHeight || 0) - targetHeight) <= 1
    && fullyVisible
    && nextLayout.vertical === edgeLayout.vertical
    && nextLayout.horizontal === edgeLayout.horizontal;
}

function setRequestedPetSize(w, h, options = {}) {
  let width = Number(w) || 0;
  let height = Number(h) || 0;
  if (memeLayoutActive) {
    width = Math.max(width, MEME_WINDOW_W);
    height = Math.max(height, MEME_WINDOW_H);
  }
  const nextLayout = options.popup
    ? popupEdgeLayout(height, options.popupHeight)
    : restingEdgeLayout();
  // Stats arrive every few seconds. Once an open popup already owns the exact
  // viewport and edge direction, a changing DOM anchor is not a resize request.
  // Reapplying the same BrowserWindow bounds makes macOS briefly repaint only
  // half of the transparent window, which looks like the panel lost its top.
  if ((options.popup || options.settle) && petFrameAlreadySettled(width, height, nextLayout)) return false;
  const targetW = width > 0 ? width : BASE_PET_FRAME_W;
  const targetH = height > 0 ? height : BASE_PET_FRAME_H;
  const isResizing = Math.abs((window.innerWidth || 320) - targetW) > 2
    || Math.abs((window.innerHeight || 340) - targetH) > 2;
  const anchor = anchoredLayoutPayload(nextLayout, { isResizing });
  // Never dedupe a resting-frame or meme transition. Renderer innerWidth can
  // lag the main-process BrowserWindow by a frame, so even a live-size check can
  // falsely call a 520/760px frame "already reset". Close/hide paths are sparse;
  // sending their 320x340 reset every time is both cheaper and correctness-safe.
  try {
    window.pet.setPetSize(width, height, anchor);
    return true;
  } catch {
    return false;
  }
}
function fitPopup(el) {
  // [FIX_FLICKER] bypass window resize for regular speech bubbles to prevent DirectX swapchain recreation flicker
  if (el === bubble && !bubble.classList.contains('ending')) {
    return;
  }
  // [USER REQUEST] bypass window resize for session list to prevent scale/jitter
  if (el === sesslist) {
    return;
  }
  if (!el) return;
  const seq = ++fitPopupSeq;
  requestAnimationFrame(() => {
    const fixedSessionPage = el === sesslist
      && slSessionView && !slSessionView.classList.contains('hidden');
    const fixedTakeoverPage = el === sesslist
      && slTakeoverView && !slTakeoverView.classList.contains('hidden');
    if (fixedSessionPage || fixedTakeoverPage) {
      if (seq !== fitPopupSeq) return;
      // �̶�ҳ�����������ٲ�����һ�����ɿ��������·�ת�������м�֡��λ��
      const panelHeight = fixedTakeoverPage ? TAKEOVER_PANEL_H : SESSION_PANEL_H;
      setRequestedPetSize(
        POPUP_W,
        Math.max(340, POPUP_BOTTOM + panelHeight + 24),
        { popup: true, popupHeight: panelHeight },
      );
      return;
    }
    const measure = () => {
      if (seq !== fitPopupSeq) return;
      const popupW = el === sesslist && slTravelView && !slTravelView.classList.contains('hidden')
        ? TRAVEL_POPUP_W
        : POPUP_W;
      // �ؼ�������ʱȥ�� max-height ���������� scrollHeight �ᱻ����ǰС����������
      // max-height��ǯס�����������⣩�� ������Զֻ��һ���㡢�б�ֻʣ 1 ��+��������
      const prev = el.style.maxHeight;
      el.style.maxHeight = 'none';
      const contentH = el.scrollHeight;
      el.style.maxHeight = prev;
      const viewportH = el === askEl ? Math.min(contentH, ASK_VIEWPORT_MAX_H) : contentH;
      const winH = Math.max(340, POPUP_BOTTOM + viewportH + 24);
      setRequestedPetSize(popupW, winH, { popup: true, popupHeight: viewportH });
    };

    const targetW = el === sesslist && slTravelView && !slTravelView.classList.contains('hidden')
      ? TRAVEL_POPUP_W
      : POPUP_W;
    if (Math.abs((window.innerWidth || 0) - targetW) > 2) {
      // ��һ��ֻ�������ڶ�������ȷ�ĺ����Ű��²���ʵ�߶ȡ�
      setRequestedPetSize(targetW, Math.max(340, window.innerHeight || 340), { popup: true });
      requestAnimationFrame(() => requestAnimationFrame(measure));
    } else {
      measure();
    }
  });
}
function resetPetSize() {
  // Delayed bubble/meme/choice callbacks can outlive the surface that created
  // them. They must never collapse a newer popup which now owns the window.
  // Legitimate close paths clear their open flag before calling this function.
  if (sessListOpen || askActive || todoPopOpen) return false;
  fitPopupSeq++;
  if (memeLayoutActive) setRequestedPetSize(MEME_WINDOW_W, MEME_WINDOW_H);
  else setRequestedPetSize(0, 0);
  return true;
}

function activeSizedSurface() {
  if (sessListOpen && !sesslist.classList.contains('hidden')) return sesslist;
  if (askActive && !askEl.classList.contains('hidden')) return askEl;
  if (todoPopOpen && !todopop.classList.contains('hidden')) return todopop;
  if (!bubble.classList.contains('hidden')) return bubble;
  return null;
}

function settleEdgeLayout() {
  // No screen coordinates in the headless renderer tests; the real Electron
  // window always has them. This also avoids inventing a desktop in Node.
  if (!petGeometrySnapshot()) return;
  const surface = activeSizedSurface();
  // Dragging used to collapse the BrowserWindow back to 320x340 even while the
  // session list / question card / speech bubble was still open. The DOM kept
  // rendering, but Electron clipped it to that smaller transparent frame.
  if (surface) fitPopup(surface);
  else setRequestedPetSize(
    memeLayoutActive ? MEME_WINDOW_W : 0,
    memeLayoutActive ? MEME_WINDOW_H : 0,
    { settle: true },
  );
  requestAnimationFrame(reportPetVisualBounds);
}

// Switch the internal top/bottom anchor *during* a drag, just before the
// transparent BrowserWindow reaches the work-area boundary. The visible pet
// is kept on the same screen pixel and the gesture is rebased, so the next
// pointer frame continues from there instead of producing edge -> pause ->
// jump. Returning from the top probes the normal layout first and restores it
// as soon as the whole frame can fit on-screen again.
function movePetDuringDrag(gesture, e, targetX, targetY) {
  const frame = ++gesture.frame;
  const el = curSkinEl();
  if (!el) {
    const meta = {
      dragId: gesture.traceId, frame, trigger: 'pointermove-no-skin',
      pointer: { x: e.screenX, y: e.screenY, buttons: e.buttons },
      target: { x: targetX, y: targetY },
    };
    traceDrag('position-request', meta);
    window.pet.setWinPos(targetX, targetY, meta);
    return;
  }
  const before = el.getBoundingClientRect();
  const petScreenX = targetX + before.left;
  const petScreenY = targetY + before.top;
  const wa = browserWorkArea();
  let nextVertical = edgeLayout.vertical;
  let nextHorizontal = edgeLayout.horizontal;
  const previousLayout = { ...edgeLayout };

  if (edgeLayout.vertical === 'above') {
    nextVertical = window.PetGeometry
      ? window.PetGeometry.chooseDragVerticalLayout({
        current: 'above', workArea: wa, targetWindowY: targetY,
        petScreenY, abovePetOffset: before.top,
      })
      : (targetY <= wa.y + 2 ? 'below' : 'above');
  } else if (edgeLayout.vertical === 'below') {
    const candidate = { ...edgeLayout, vertical: 'above' };
    setStageEdgeLayout(candidate);
    const normalRect = el.getBoundingClientRect();
    const probed = window.PetGeometry
      ? window.PetGeometry.chooseDragVerticalLayout({
        current: 'below', workArea: wa, targetWindowY: targetY,
        petScreenY, abovePetOffset: normalRect.top,
      })
      : (petScreenY - normalRect.top >= wa.y + 2 ? 'above' : 'below');
    if (probed === 'above') {
      nextVertical = 'above';
    } else {
      setStageEdgeLayout({ ...edgeLayout, vertical: 'below' });
      nextVertical = 'below';
    }
  }

  if (window.PetGeometry && window.PetGeometry.chooseDragHorizontalLayout) {
    let centeredPetOffset = before.left;
    if (edgeLayout.horizontal !== 'center') {
      const previous = { ...edgeLayout };
      setStageEdgeLayout({ ...previous, horizontal: 'center' });
      centeredPetOffset = el.getBoundingClientRect().left;
      setStageEdgeLayout(previous);
    }
    nextHorizontal = window.PetGeometry.chooseDragHorizontalLayout({
      current: edgeLayout.horizontal,
      workArea: wa,
      targetWindowX: targetX,
      windowWidth: Math.max(1, window.innerWidth || 320),
      petScreenX,
      centeredPetOffset,
    });
  }

  const layoutChanged = nextVertical !== edgeLayout.vertical || nextHorizontal !== edgeLayout.horizontal;
  if (layoutChanged) {
    setStageEdgeLayout({ vertical: nextVertical, horizontal: nextHorizontal });
  }
  const after = el.getBoundingClientRect();
  const anchoredX = petScreenX - after.left;
  const anchoredY = petScreenY - after.top;

  const rebased = layoutChanged && (Math.abs(anchoredX - targetX) > 0.5 || Math.abs(anchoredY - targetY) > 0.5);
  if (rebased) {
    gesture.win = [anchoredX, anchoredY];
    gesture.sx = e.screenX;
    gesture.sy = e.screenY;
  }
  const meta = {
    dragId: gesture.traceId,
    frame,
    trigger: rebased ? 'pointermove-layout-rebase' : 'pointermove',
    pointer: { x: e.screenX, y: e.screenY, buttons: e.buttons },
    target: { x: targetX, y: targetY },
    anchored: { x: anchoredX, y: anchoredY },
    window: { x: window.screenX, y: window.screenY, width: window.innerWidth, height: window.innerHeight },
    petBefore: dragRect(before),
    petAfter: dragRect(after),
    layoutBefore: previousLayout,
    layoutAfter: { ...edgeLayout },
    layoutChanged: previousLayout.vertical !== edgeLayout.vertical || previousLayout.horizontal !== edgeLayout.horizontal,
    rebased,
  };
  traceDrag('position-request', meta);
  window.pet.setWinPos(anchoredX, anchoredY, meta);
}

// �ӿ����ؽ����У����������ڡ��ұ�����Ŀ��
function refreshAsk(stats) {
  // ���±��ж����Ŀ���ʱ�����������ﴦ������������ѡ������������
  if (todoPopOpen) { hideAsk(); return; }
  const items = (stats.sessions || [])
    .filter((x) => (x.state === 'waiting' || x.state === 'needsinput') && x.choice)
    .map((x) => x.choice)
    .filter((c) => (c.options && c.options.length) || c.allowInput);
  const present = new Set(items.map(choiceKey));
  for (const k of [...answered]) if (!present.has(k)) answered.delete(k); // ����ʧ=�Ѵ��꣬����
  const fresh = items.filter((c) => !answered.has(choiceKey(c)));

  // �����ڴ���ǰ��Ƭ������������Ȼ��Ч �� ������(��ס��ѡ/����)�����Ծ�Ĭ���˶��������
  // �����ѽ����Ŀ�Ƭ�����������¿�Ƭ���ᱻ���ġ������С�״̬���õ������档
  const cur = askActive ? askQueue[askIdx] : null;
  if (isInteracting() && cur && present.has(choiceKey(cur))) {
    askQueue = fresh;
    const i = fresh.findIndex((c) => choiceKey(c) === choiceKey(cur));
    askIdx = i >= 0 ? i : 0;
    return;
  }

  askQueue = fresh;
  if (!askQueue.length) { hideAsk(); return; }
  if (askIdx >= askQueue.length) askIdx = 0;
  const sig = askQueue.map(choiceKey).join(',');
  if (askActive && sig === lastAskSig) return; // ����û�䣬�����֣���ס��������/��ѡ�ģ�
  lastAskSig = sig;
  showAskPanel();
}

function enqueueChoice(c) {
  if (!c || (!(c.options && c.options.length) && !c.allowInput)) return;
  answered.delete(choiceKey(c));
  const i = askQueue.findIndex((x) => choiceKey(x) === choiceKey(c));
  if (i < 0) askQueue.push(c);
  // ���±��ж����Ŀ��� �� ��������������ʾ������������
  if (todoPopOpen) { renderTodoPop(); return; }
  // �����ڴ���ǰ����ʱ���������Ƚ����С��������壨������������ʾ������������
  if (isInteracting() && askActive) return;
  askIdx = askQueue.findIndex((x) => choiceKey(x) === choiceKey(c));
  showAskPanel();
}

function showAskPanel() {
  const c = askQueue[askIdx];
  if (!c) { hideAsk(); return; }
  // The user explicitly opened the session surface. A short-lived background
  // permission snapshot must not close it and then disappear on the next poll.
  // Keep the choice queued; the next stats push after the user closes the list
  // will present it normally.
  if (sessListOpen) return;
  askEl.classList.toggle('travel-letter', c.travel === true);

  const sess = c.sessionId ? ' �� #' + String(c.sessionId).slice(-3) : '';
  const queue = askQueue.length > 1 ? `${askIdx + 1}/${askQueue.length} �� ` : '';
  askSess.textContent = queue + (c.project || '?') + sess;

  if (c.kind === 'ask') {
    if (!elic || elic.key !== choiceKey(c)) {
      elic = { key: choiceKey(c), questions: Array.isArray(c.questions) ? c.questions : [], qIdx: 0, answers: {}, selected: null, selSet: [], multi: false, otherOn: false };
    }
    renderElicitation(c);
  } else {
    elic = null;
    if (c.kind === 'codex-ask') renderCodexElicitation(c);
    else if (c.kind === 'perm' && c.permId) renderPerm(c);
    else if (c.kind === 'plan' && c.permId) renderPlan(c);
    else renderContinue(c);
  }

  bubble.classList.add('hidden');
  askEl.classList.remove('hidden');
  lastAskSig = askQueue.map(choiceKey).join(',');
  askActive = true;
  rlog('ask', 'show ' + (c.kind || '') + ': ' + String(c.question || '').slice(0, 36));
  fitPopup(askEl); // ����Ƭ���̶�ͷβ���в���������̬���� + 520 ��
}

function clearAskBody() {
  askScroll.scrollTop = 0;
  askOpts.innerHTML = '';
  askOpts.classList.remove('perm-row');
  askQhead.textContent = '';
  askHint.textContent = '';
  askPage.textContent = '';
  askInputRow.classList.add('hidden');
  askText.value = '';
  askTerm.textContent = t('ask.goTerminal');
}

// �� elicitation��AskUserQuestion������ѡ� + Other + ��ҳ + Submit/Back
function renderElicitation(c) {
  clearAskBody();
  askLabel.textContent = 'Needs Input';
  const qs = elic.questions;
  const q = qs[elic.qIdx] ||
    { question: c.question || t('ask.needAnswer'), options: (c.options || []).map((o) => ({ label: o.label, description: o.desc })) };
  askQhead.textContent = q.header || '';
  askQ.textContent = q.question || '';
  const multi = !!q.multiSelect;
  elic.multi = multi;
  askHint.textContent = multi ? t('ask.multiHint') : t('ask.singleHint');

  const prior = elic.answers[q.question];
  const opts = q.options || [];
  const known = (v) => opts.some((o) => o.label === v);
  if (multi) {
    const parts = prior ? String(prior).split(/,\s*/).filter(Boolean) : [];
    elic.selSet = parts.filter(known);
    const otherText = parts.find((p) => !known(p));
    elic.otherOn = !!otherText;
    elic.selected = null;
    if (otherText) askText.value = otherText;
  } else {
    elic.selSet = [];
    elic.otherOn = false;
    elic.selected = prior != null ? (known(prior) ? prior : '__other__') : null;
  }

  for (const o of opts) askOpts.appendChild(buildRadioCard(o.label, o.description, o.label, q));
  askOpts.appendChild(buildRadioCard('Other', '', '__other__', q));
  if (elic.selected === '__other__' || (multi && elic.otherOn)) {
    askInputRow.classList.remove('hidden');
    if (!multi && prior && !known(prior)) askText.value = prior;
  }

  askPage.textContent = `${elic.qIdx + 1} / ${qs.length || 1}`;
  askFoot.classList.remove('hidden');
  const last = elic.qIdx >= (qs.length || 1) - 1;
  askSubmit.textContent = last ? 'Submit Answer' : 'Next ?';
  askBack.classList.toggle('hidden', elic.qIdx === 0);
  askTerm.classList.remove('hidden');
  updateSubmitEnabled(q);
  fitPopup(askEl); // ��Ŀ�л������ݸ߶ȱ��ˣ����¶���
}

// Codex ѡ���Ի���ֻ��������rollout watcher �ܿ�����ʵѡ�
// �������� app-server ����Ӧͨ������������չʾ�������ݣ�������
// �û��ص�ԭ Codex �ͻ���/CLI ��ѡ��ԭ�Ự���������ջ��Զ�������
function renderCodexElicitation(c) {
  clearAskBody();
  askLabel.textContent = t('ask.needsInput');
  const qs = Array.isArray(c.questions) && c.questions.length
    ? c.questions
    : [{ header: c.header || '', question: c.question || t('ask.needAnswer'), options: c.options || [] }];
  askQhead.textContent = qs.length === 1 ? (qs[0].header || '') : c.header || '';
  askQ.textContent = qs.length === 1 ? (qs[0].question || c.question || '') : t('ask.codexMultiple', { n: qs.length });
  askHint.textContent = t('ask.codexReplyHint');

  for (const [index, q] of qs.entries()) {
    if (qs.length > 1) {
      const head = document.createElement('div');
      head.className = 'ask-external-question';
      head.textContent = `${index + 1}. ${q.header ? `��${q.header}�� ` : ''}${q.question || ''}`;
      askOpts.appendChild(head);
    }
    for (const o of (q.options || [])) {
      const row = document.createElement('div');
      row.className = 'ask-opt readonly';
      const label = typeof o === 'string' ? o : o.label;
      const desc = typeof o === 'string' ? '' : o.description || o.desc || '';
      row.innerHTML = '<span class="ask-radio"></span><span class="ask-ot">' +
        `<span class="ask-ol">${esc(label)}</span>` +
        (desc ? `<span class="ask-od">${esc(desc)}</span>` : '') + '</span>';
      askOpts.appendChild(row);
    }
  }
  askFoot.classList.add('hidden');
  askTerm.textContent = t('ask.goCodex');
  askTerm.classList.remove('hidden');
  fitPopup(askEl);
}

function buildRadioCard(label, desc, value, q) {
  const multi = elic.multi;
  const isSel = multi ? (value === '__other__' ? elic.otherOn : elic.selSet.includes(value)) : elic.selected === value;
  const card = document.createElement('button');
  card.className = 'ask-opt' + (multi ? ' multi' : '') + (isSel ? ' sel' : '');
  card.innerHTML =
    '<span class="ask-radio"></span><span class="ask-ot">' +
    `<span class="ask-ol">${esc(label)}</span>` + (desc ? `<span class="ask-od">${esc(desc)}</span>` : '') +
    '</span>';
  card.addEventListener('click', () => {
    if (multi) {
      if (value === '__other__') {
        elic.otherOn = !elic.otherOn;
        card.classList.toggle('sel', elic.otherOn);
        askInputRow.classList.toggle('hidden', !elic.otherOn);
        if (elic.otherOn) setTimeout(() => askText.focus(), 0);
      } else {
        const i = elic.selSet.indexOf(value);
        if (i >= 0) elic.selSet.splice(i, 1); else elic.selSet.push(value);
        card.classList.toggle('sel');
      }
    } else {
      elic.selected = value;
      askInputRow.classList.toggle('hidden', value !== '__other__');
      if (value === '__other__') setTimeout(() => askText.focus(), 0);
      [...askOpts.children].forEach((el) => el.classList.remove('sel'));
      card.classList.add('sel');
    }
    updateSubmitEnabled(q);
  });
  return card;
}

function updateSubmitEnabled() {
  let ok;
  if (elic && elic.multi) ok = elic.selSet.length > 0 || (elic.otherOn && (askText.value || '').trim());
  else ok = elic && elic.selected && (elic.selected !== '__other__' || (askText.value || '').trim());
  askSubmit.classList.toggle('disabled', !ok);
}

// �Զ�������Ϊ��ʱ���س��������ͣ���һ�� + ��ʾ�������2.6s ����ԭ placeholder��
let emptyWarnTimer = null;
function warnEmptyInput() {
  askText.focus();
  askText.classList.add('warn');
  if (!askText.dataset.ph) askText.dataset.ph = askText.placeholder || t('ask.placeholder');
  askText.placeholder = t('ask.emptyWarn');
  clearTimeout(emptyWarnTimer);
  emptyWarnTimer = setTimeout(() => {
    askText.classList.remove('warn');
    if (askText.dataset.ph) { askText.placeholder = askText.dataset.ph; delete askText.dataset.ph; }
  }, 2600);
}

function elicNextOrSubmit(c) {
  const qs = elic.questions;
  const q = qs[elic.qIdx];
  let val;
  if (elic.multi) {
    const parts = [...elic.selSet];
    if (elic.otherOn && (askText.value || '').trim()) parts.push((askText.value).trim());
    val = parts.join(', ');
  } else {
    val = elic.selected === '__other__' ? (askText.value || '').trim() : elic.selected;
  }
  if (!val) return; // ������ѡ/��
  if (q && q.question) elic.answers[q.question] = val;
  else elic.answers[c.question || '_'] = val;
  if (elic.qIdx < (qs.length || 1) - 1) { elic.qIdx++; renderElicitation(c); return; }
  window.pet.decidePermission(c.permId, { type: 'elicitation-submit', answers: { ...elic.answers } });
  rlog('ask', 'elicitation submit ' + Object.keys(elic.answers).length);
  finishChoice(c, t('ask.submitted'));
}

function elicBack(c) {
  if (elic && elic.qIdx > 0) { elic.qIdx--; renderElicitation(c); }
}

// �� ��Ȩ������(��)/�ܾ�(��) + ��ѡ��ʼ�����������鰴ť(����)
function renderPerm(c) {
  clearAskBody();
  askLabel.textContent = c.travel ? t('travel.letterLabel') : t('ask.needPerm');
  askQhead.textContent = c.header || '';
  askQ.textContent = c.question || t('ask.needPermQ');
  const opts = c.options || [];
  if (opts.length === 2) askOpts.classList.add('perm-row'); // ������/�ܾ�ʱ����
  opts.forEach((opt) => {
    const kind = opt.key === 'allow' ? 'allow' : opt.key === 'deny' ? 'deny' : 'sugg';
    const card = document.createElement('button');
    card.className = 'ask-opt act ' + kind;
    card.innerHTML = `<span class="ask-ot"><span class="ask-ol">${esc(opt.label)}</span></span>`;
    card.addEventListener('click', () => submitPerm(opt.key, c, opt.label));
    askOpts.appendChild(card);
  });
  askFoot.classList.add('hidden');
  if (c.travel) askTerm.textContent = t('travel.openTerminal');
  askTerm.classList.remove('hidden');
}

// �� ���ظ�����ѡ���ֻ������ + Go to Terminal
function renderContinue(c) {
  clearAskBody();
  askLabel.textContent = 'Needs Input';
  askQ.textContent = c.question || t('ask.waitingReply');
  askFoot.classList.add('hidden');
  askTerm.classList.remove('hidden');
}

// �� ExitPlanMode ����������չʾ���� + ��׼ / ���ز�����
function renderPlan(c) {
  clearAskBody();
  askLabel.textContent = t('ask.planLabel');
  askQhead.textContent = c.project ? '?? ' + c.project : '';
  askQ.textContent = c.question || t('ask.planQ');
  const approve = document.createElement('button');
  approve.className = 'ask-opt act allow';
  approve.innerHTML = '<span class="ask-ot"><span class="ask-ol">' + esc(t('ask.approve')) + '</span></span>';
  approve.addEventListener('click', () => submitPerm('allow', c, t('ask.approved')));
  askOpts.appendChild(approve);
  const reject = document.createElement('button');
  reject.className = 'ask-opt act deny';
  reject.innerHTML = '<span class="ask-ot"><span class="ask-ol">' + esc(t('ask.reject')) + '</span></span>';
  reject.addEventListener('click', () => {
    window.pet.decidePermission(c.permId, { type: 'plan-feedback', feedback: (askText.value || '').trim() });
    finishChoice(c, t('ask.rejected'));
  });
  askOpts.appendChild(reject);
  askInputRow.classList.remove('hidden');
  askText.placeholder = t('ask.rejectPlaceholder');
  askFoot.classList.add('hidden');
  askTerm.classList.remove('hidden');
}

function finishChoice(choice, bubbleMsg) {
  answered.add(choiceKey(choice));
  elic = null;
  askQueue = askQueue.filter((c) => choiceKey(c) !== choiceKey(choice));
  if (askQueue.length) {
    // ������һ�⣺ֱ��չʾ������ȷ�����ݸ�סѡ������
    askIdx = 0; showAskPanel();
  } else {
    // The confirmation bubble takes ownership of the same expanded window.
    // Do not collapse ask -> 320x340 and immediately expand again: the two
    // one-way IPC resizes can be calculated from different renderer frames and
    // persist a small anchor error as a visible pet jump.
    hideAsk(true);
    if (!showBubble(bubbleMsg, 2600)) resetPetSize();
  }
}
function submitPerm(key, choice, label) {
  window.pet.decidePermission(choice.permId, key);
  const msg = key === 'allow' ? t('ask.allowed') : key === 'deny' ? t('ask.denied') : t('ask.remembered');
  finishChoice(choice, msg);
}
// Go to Terminal��ȥ�Ự�ն��Լ�������Ȩ/elicitation ���� deny���� CC ���ն����ʣ�
function gotoSession(choice) {
  if (choice.permId) window.pet.decidePermission(choice.permId, 'deny');
  window.pet.focusSession(choice.sessionId || '');
  // Codex ��ѡ������ֻ�����񣬲����򡰴���ԭ�Ự���͵���
  // �ѻش𡣱����ڶ������ rollout ���������� refreshAsk �Զ��رա�
  if (choice.externalOnly) {
    hideAsk(true);
    if (!showBubble(t('ask.toCodex'), 2600)) resetPetSize();
    return;
  }
  finishChoice(choice, t('ask.toTerminal'));
}

function hideAsk(preserveSize = false) {
  if (askActive) rlog('ask', 'hide');
  lastAskSig = '';
  elic = null;
  askEl.classList.add('hidden');
  askHover = false;
  if (askText) askText.value = ''; // �����ݸ壬�����رպ��Ա���Ϊ�������С���ס״̬
  if (askActive) {
    askActive = false;
    if (!preserveSize && !restoreEndingBubble()) resetPetSize();
    window.pet.blurPet();
  }
}

// ---------- ���±� / �ж��嵥 ----------
let curTodos = [];
let curTodosProj = '';
let curSessions = [];
let todoPopOpen = false;
let lastTodoPopRenderSig = '';
const TODO_ICON = { completed: '✓', in_progress: '⏳', pending: '○' };

// ��ǰ��Ҫ�㴦��������� choice����û������ waiting/needsinput �Ự
function actionableItems() {
  return curSessions
    .filter((x) => (x.state === 'waiting' || x.state === 'needsinput') && x.choice && !answered.has(choiceKey(x.choice)))
    .map((x) => x.choice)
    .filter((c) => (c.options && c.options.length) || c.allowInput);
}

let notepadShown = false;
function updateNotepad(s) {
  curTodos = Array.isArray(s.todos) ? s.todos : [];
  curTodosProj = s.todosProject || '';
  curSessions = s.sessions || [];
  const acts = actionableItems();
  if (!curTodos.length && !acts.length) {
    notepad.classList.add('hidden');
    if (notepadShown) { rlog('notepad', 'hide'); notepadShown = false; }
    if (todoPopOpen) closeTodoPop();
    return;
  }
  notepad.classList.remove('hidden');
  if (!notepadShown) { rlog('notepad', `show acts=${acts.length} todos=${curTodos.length}`); notepadShown = true; }
  if (acts.length) {
    npBadge.textContent = acts.length; // ������ʾ���账������
    npBadge.classList.add('urgent');
  } else {
    const done = curTodos.filter((t) => t.status === 'completed').length;
    npBadge.textContent = `${done}/${curTodos.length}`;
    npBadge.classList.remove('urgent');
  }
  // ���㿪�š����û�û�ڵ��������� �� ͬ��ˢ������
  if (todoPopOpen && !todopop.contains(document.activeElement)) { renderTodoPop(); fitPopup(todopop); }
}

function renderTodoPop() {
  const acts = actionableItems();
  const renderSig = JSON.stringify({
    lang: window.OctoI18n.getLang(),
    project: curTodosProj,
    todos: curTodos,
    actions: acts,
  });
  if (renderSig === lastTodoPopRenderSig) return false;
  lastTodoPopRenderSig = renderSig;
  const done = curTodos.filter((t) => t.status === 'completed').length;
  tpProg.textContent = curTodos.length ? t('todo.progress', { done, total: curTodos.length }) : '';
  // ��Ҫ�㴦��
  if (acts.length) {
    tpActSec.classList.remove('hidden');
    tpActs.innerHTML = '';
    acts.forEach((c) => tpActs.appendChild(buildActCard(c)));
  } else {
    tpActSec.classList.add('hidden');
    tpActs.innerHTML = '';
  }
  // ����
  if (curTodos.length) {
    tpTodoSec.classList.remove('hidden');
    tpList.innerHTML = curTodos
      .map((t) => {
        const cls = t.status === 'completed' ? 'tp-row done' : t.status === 'in_progress' ? 'tp-row doing' : 'tp-row';
        return `<div class="${cls}"><span class="ic">${TODO_ICON[t.status] || '•'}</span><span class="tx">${esc(t.content)}</span></div>`;
      })
      .join('');
  } else {
    tpTodoSec.classList.add('hidden');
    tpList.innerHTML = '';
  }
  return true;
}

// һ�š���Ҫ�㴦������Ƭ������ + ѡ�ť(�ɵ㼴��) + �Զ�������
function buildActCard(c) {
  const card = document.createElement('div');
  card.className = 'tp-act' + (c.travel ? ' travel-letter' : '');
  const kindTag = c.travel ? t('travel.letterLabel')
    : c.kind === 'perm' ? t('ask.kindPerm')
      : c.kind === 'continue' ? t('ask.kindContinue')
        : c.kind === 'plan' ? t('ask.kindPlan') : t('ask.kindChoice');
  const head = document.createElement('div');
  head.className = 'tp-act-proj';
  head.textContent = `${c.travel ? '??' : '??'} ${c.project || '?'} �� ${kindTag}`;
  card.appendChild(head);
  const q = document.createElement('div');
  q.className = 'tp-act-q';
  q.textContent = (c.header ? '��' + c.header + '�� ' : '') + (c.question || t('ask.needHandling'));
  card.appendChild(q);

  const opts = document.createElement('div');
  opts.className = 'tp-act-opts';
  if (c.kind === 'perm' && c.permId) {
    // ��Ȩ������/�ܾ� �� HTTP ԭ��ͨ���� CC
    (c.options || []).forEach((opt) => {
      const b = document.createElement('button');
      b.textContent = opt.label;
      if (opt.desc) b.title = opt.desc;
      b.addEventListener('click', (e) => { e.stopPropagation(); popPerm(c, opt.key); });
      opts.appendChild(b);
    });
  } else {
    // �Ի��ࣺѡ��ֻ��չʾ + ��ȥ�ظ�����ť�����費�������֣�
    (c.options || []).forEach((opt) => {
      const label = typeof opt === 'string' ? opt : opt.label;
      const desc = typeof opt === 'string' ? '' : opt.desc || '';
      const d = document.createElement('div');
      d.className = 'tp-act-ro';
      d.textContent = label;
      if (desc) d.title = desc;
      opts.appendChild(d);
    });
    const go = document.createElement('button');
    go.className = 'tp-act-go';
    go.textContent = t('ask.goReply');
    go.addEventListener('click', (e) => { e.stopPropagation(); popGoto(c); });
    opts.appendChild(go);
  }
  card.appendChild(opts);
  return card;
}

// ��Ȩ���� CC ����
function popPerm(choice, key) {
  window.pet.decidePermission(choice.permId, key);
  answered.add(choiceKey(choice));
  renderTodoPop();
  maybeCloseEmptyPop();
}
// �Ի��ࣺ��λ�������ûỰ����
function popGoto(choice) {
  window.pet.focusSession(choice.sessionId || '');
  answered.add(choiceKey(choice));
  renderTodoPop();
  maybeCloseEmptyPop();
}
function maybeCloseEmptyPop() {
  if (!actionableItems().length && !curTodos.length) closeTodoPop();
}

function openTodoPop() {
  if (askActive) hideAsk(true); // ֱ�ӽ����������ӹܳߴ磬������ 340px �м�֡
  if (sessListOpen) closeSessList(true);
  renderTodoPop();
  bubble.classList.add('hidden');
  todopop.classList.remove('hidden');
  todoPopOpen = true;
  rlog('pop', `open acts=${actionableItems().length} todos=${curTodos.length}`);
  fitPopup(todopop);
}
function closeTodoPop(preserveSize = false) {
  todopop.classList.add('hidden');
  todoPopOpen = false;
  rlog('pop', 'close');
  window.pet.blurPet();
  if (!preserveSize && !restoreEndingBubble()) resetPetSize();
}

// ---------- �Ự�б� HUD������������----------
let sessListOpen = false;
let lastSessListRenderSig = '';
let lastSessionDotsRenderSig = '';
let stableSessionOrder = [];
let memeCatalog = { schemaVersion: 2, items: [] };
let memeTarget = null;
let takeoverTarget = null;
let memeTimer = null;
let memeAudio = null;
let memeCatalogRefreshTimer = null;
let travelTarget = null;
let travelData = null;
let travelPostcards = [];
let selectedPostcardId = null;
let selectedPostcardStop = 0;
let renderedPostcardKey = '';
let lastTravelMailboxRenderSig = '';
let lastTravelHistoryRenderSig = '';
let lastTravelTemplatesRenderSig = '';
let travelTemplateId = null;
let travelMissionDirty = false;
let lootCapture = null;
let lootCaptureTimers = [];
let lootPerformanceActive = false;
let lootPerformanceTimer = null;
let lootTargetClosed = false;
let lootKeptSessions = [];
let lootKeptExpiryTimer = null;

function beginLootPerformance() {
  clearTimeout(lootPerformanceTimer);
  lootPerformanceActive = true;
}

function endLootPerformance(delay = 0) {
  clearTimeout(lootPerformanceTimer);
  lootPerformanceTimer = setTimeout(() => {
    lootPerformanceActive = false;
    restoreEndingBubble();
  }, delay);
}
// Claude ��ɫ burst��Сͼ�꣩
const CLAUDE_ICON =
  '<svg viewBox="0 0 24 24" fill="#d97757"><path d="M12 1l2.2 6.3L20.5 5l-4 5.4 6.5 1.6-6.5 1.6 4 5.4-6.3-2.3L12 23l-2.2-6.3L3.5 19l4-5.4L1 12l6.5-1.6-4-5.4 6.3 2.3z"/></svg>';
// Codex ��ɫ�ն˿飨>_ ��ʾ����
const CODEX_ICON =
  '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#3b82f6"/>' +
  '<path d="M7 8l4 4-4 4" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M13 16.5h4.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>';
// dsh��DeepSeek Harness���������� + ��������
const DSH_ICON =
  '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#4d6bfe"/>' +
  '<circle cx="8.6" cy="9" r="1.5" fill="#fff"/><path d="M12 9h5.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>' +
  '<path d="M5 15c1.6 0 1.6-1.7 3.3-1.7S9.9 15 11.5 15s1.6-1.7 3.3-1.7S16.4 15 18 15" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>';
const UNKNOWN_AGENT_ICON =
  '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#777582"/>' +
  '<text x="12" y="17" fill="#fff" font-size="14" font-weight="700" text-anchor="middle">?</text></svg>';
const AGENT_ICONS = { codex: CODEX_ICON, dsh: DSH_ICON, claude: CLAUDE_ICON, unknown: UNKNOWN_AGENT_ICON };
const agentIcon = (s) => AGENT_ICONS[s && s.agent] || UNKNOWN_AGENT_ICON;
// State �� HUD label. Resolved per call (not a frozen table) so switching the
// language re-labels every row on the next render.
const SESS_META_ICON = {
  waiting: '? ', needsinput: '?? ', working: '?? ', juggling: '?? ',
  sweeping: '?? ', thinking: '?? ', loafing: '?? ', error: '?? ',
  idle: '', sleeping: '?? ',
};
const SESS_META_KEY = {
  waiting: 'state.waiting', needsinput: 'state.needsinput', working: 'state.working',
  juggling: 'state.juggling', sweeping: 'state.sweeping', thinking: 'state.thinking',
  loafing: 'state.loafingLong', error: 'state.error', idle: 'state.idle',
  sleeping: 'state.sleeping',
};
function sessMeta(state) {
  const key = SESS_META_KEY[state];
  return key ? (SESS_META_ICON[state] || '') + t(key) : null;
}
const SESS_SORT = { waiting: 0, needsinput: 0, error: 1, working: 2, juggling: 2, sweeping: 2, thinking: 2, loafing: 3, idle: 4, sleeping: 5 };

// �����ο���Ŀ��ֵ����90% ��(hot)����75% ��(warm)��������
function ctxClass(p) { return p >= 90 ? 'high' : p >= 75 ? 'mid' : ''; }

const sessionKey = (s) => String((s && (s.sessionId || s.id)) || '');
function activeLootKeptSessions() {
  const now = Date.now();
  return lootKeptSessions.filter((session) => session && session.expiresAt > now);
}
function mergedOrdinarySessions() {
  const byId = new Map();
  for (const session of (curSessions || [])) {
    const key = sessionKey(session);
    if (key) byId.set(key, session);
  }
  for (const kept of activeLootKeptSessions()) {
    const key = sessionKey(kept);
    if (!key) continue;
    // ��ǰ watcher �������ȣ�����ֻ������ watcher ��ʱ������ʷ��ʱ���ף�
    // ���� lootCapturedUntil ������ 30 ���ӵ���ͨ�б������ڡ�
    byId.set(key, {
      ...kept,
      ...(byId.get(key) || {}),
      lootCapturedUntil: kept.expiresAt,
    });
  }
  return [...byId.values()];
}
function scheduleLootKeptExpiry() {
  clearTimeout(lootKeptExpiryTimer);
  const active = activeLootKeptSessions();
  const next = active.reduce((min, session) => Math.min(min, session.expiresAt), Infinity);
  if (!Number.isFinite(next)) return;
  lootKeptExpiryTimer = setTimeout(() => {
    lootKeptSessions = activeLootKeptSessions();
    if (sessListOpen && !lootCapture && !memeTarget && !takeoverTarget) {
      renderSessList();
      fitPopup(sesslist);
    }
    scheduleLootKeptExpiry();
  }, Math.max(50, next - Date.now() + 20));
}
const isBaseVisibleSession = (s) => !!s && !s.headless && s.state !== 'sleeping';
const isArchivedSession = (s) => archivedSessionIds.includes(sessionKey(s));
// ͷ��״̬����Զ��չʾ�ѹ鵵�HUD ��ͨ�����鵵�����ص����鿴��
const isVisibleSession = (s) => isBaseVisibleSession(s) && !isArchivedSession(s);
// ��һ��ɫ��С���� HUD ��ͬһ�ף����ɡ��̡��жϡ��죬������״̬��
function sessionDotClass(s) {
  if (s.state === 'idle' && s.badge === 'done') return 'done';
  if (s.state === 'idle' && s.badge === 'interrupted') return 'error';
  return s.state || 'idle';
}

function visibleSessions() {
  return mergedOrdinarySessions()
    // Dedicated travel sessions live in their own mailbox. They remain in the
    // stats/permission model (so a letter cannot flash away), but do not count
    // as ordinary project tasks.
    .filter((s) => !!s && s.sessionRole !== 'travel')
    .filter((s) => !s.headless && (s.lootCapturedUntil > Date.now()
      || s.state !== 'sleeping' || (showArchived && isArchivedSession(s))))
    .filter((s) => showArchived ? isArchivedSession(s) : !isArchivedSession(s))
    .filter((s) => {
      if (sessionFilter === 'attention') return ['waiting', 'needsinput', 'error'].includes(s.state);
      if (['claude', 'codex', 'dsh'].includes(sessionFilter)) return s.agent === sessionFilter;
      return true;
    })
    .filter((s) => {
      const q = sessionSearch.trim().toLocaleLowerCase();
      if (!q) return true;
      return [s.project, s.sessionId, s.cwd, s.op]
        .some((v) => String(v || '').toLocaleLowerCase().includes(q));
    })
    .sort((a, b) => {
      const lootA = a.lootCapturedUntil > Date.now() ? 0 : 1;
      const lootB = b.lootCapturedUntil > Date.now() ? 0 : 1;
      if (lootA !== lootB) return lootA - lootB;
      const pinA = pinnedSessionIds.includes(sessionKey(a)) ? 0 : 1;
      const pinB = pinnedSessionIds.includes(sessionKey(b)) ? 0 : 1;
      if (pinA !== pinB) return pinA - pinB;
      const pa = SESS_SORT[a.state] != null ? SESS_SORT[a.state] : 3;
      const pb = SESS_SORT[b.state] != null ? SESS_SORT[b.state] : 3;
      if (pa !== pb) return pa - pb;
      return (a.idleMs || 0) - (b.idleMs || 0); // most-recently-active first
    });
}

function sessionsForList() {
  if (lootCapture) return lootCapture.sessions;
  const list = visibleSessions();
  const byKey = new Map(list.map((session) => [sessionKey(session), session]));
  const ordered = [];
  for (const key of stableSessionOrder) {
    const session = byKey.get(key);
    if (!session) continue;
    ordered.push(session);
    byKey.delete(key);
  }
  // While the panel is open, state/idle-time polling updates rows in place;
  // it must not reshuffle the list under the user's pointer. New sessions are
  // appended. Explicit search/filter/pin actions reset this order separately.
  ordered.push(...byKey.values());
  stableSessionOrder = ordered.map(sessionKey);
  return ordered;
}

function resetSessionListOrder() {
  stableSessionOrder = [];
  lastSessListRenderSig = '';
}

function clearLootTimers() {
  for (const timer of lootCaptureTimers) clearTimeout(timer);
  lootCaptureTimers = [];
}

function setLootBanner(key, vars) {
  if (!slLoot || !slLootText) return;
  slLoot.classList.remove('hidden');
  slLootText.textContent = t(key, vars);
}

function startLootCapture(available = 0) {
  clearLootTimers();
  lootCapture = {
    sessions: [],
    available: Math.max(0, Number(available) || 0),
    enteringSessionId: '',
    ready: false,
  };
  sessionSearch = '';
  sessionFilter = 'all';
  showArchived = false;
  if (slSearch) slSearch.value = '';
  slFilters.querySelectorAll('button[data-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === 'all');
  });
  openSessList();
  slTitle.textContent = t('loot.panelTitle');
  setLootBanner(lootCapture.available ? 'loot.capturing' : 'loot.noSessions', { n: lootCapture.available });
  renderSessList();
}

function appendLootSession(session) {
  if (!lootCapture || !session) return;
  const key = sessionKey(session);
  if (!key || lootCapture.sessions.some((item) => sessionKey(item) === key)) return;
  lootCapture.sessions.push(session);
  lootCapture.enteringSessionId = key;
  setLootBanner('loot.progress', { done: lootCapture.sessions.length });
  renderSessList();
  // �ӶῪʼʱ�Ѿ�һ���Թ̶��˻Ự���߶ȣ�����ֻ�������ݣ��������ٴ�
  // resize BrowserWindow�������ɼ������ᱻÿ�� session ����Ư�ơ�
  requestAnimationFrame(() => {
    if (lootCapture && slRows) slRows.scrollTop = slRows.scrollHeight;
  });
  SOUND.done();
  // ֻ��¼������ʽ�볡���Ӷ��ڼ���ͨ stats/config ˢ�²����ؽ��б���
  // ����ͬһ���������ᱻ������ѯ�����ӵ�һ֡������
  lootCaptureTimers.push(setTimeout(() => {
    if (lootCapture && lootCapture.enteringSessionId === key) {
      lootCapture.enteringSessionId = '';
    }
  }, 620));
}

function markLootCaptureWaiting() {
  if (!lootCapture || lootCapture.ready) return;
  setLootBanner(lootCapture.sessions.length ? 'loot.preparing' : 'loot.noSessions', {
    done: lootCapture.sessions.length,
  });
}

function revealLootReady(count) {
  if (!lootCapture) return;
  lootCapture.ready = true;
  setLootBanner('loot.ready', { done: Number(count) || lootCapture.sessions.length });
}

function finishLootCapture(success) {
  if (!lootCapture) return;
  clearLootTimers();
  lootCapture.enteringSessionId = '';
  setLootBanner(success ? 'loot.captured' : 'loot.kept', { n: lootCapture.sessions.length });
  renderSessList();
  lootCaptureTimers.push(setTimeout(() => {
    lootCapture = null;
    if (slLoot) slLoot.classList.add('hidden');
    slTitle.textContent = t('sess.title');
    renderSessList();
    fitPopup(sesslist);
  }, success ? 1400 : 2200));
}

function createSessRow() {
  const row = document.createElement('div');
  row.className = 'sl-row';
  row.innerHTML =
    '<span class="sl-dot"></span><span class="sl-icon"></span><div class="sl-main"><div class="sl-name"></div><div class="sl-meta-line"><div class="sl-meta"></div><button class="sl-session-id"></button></div></div><span class="sl-ctx hidden"></span><button class="sl-travel-entry">🧭</button><span class="sl-actions"><button class="sl-action pin">★</button><button class="sl-action dismiss" title="归档此会话">✕</button></span>';
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
  };
  row._parts.sessionId.addEventListener('click', async (event) => {
    event.stopPropagation();
    const id = sessionKey(row._session);
    if (!id || !window.pet.copySessionId) return;
    const ok = await window.pet.copySessionId(id);
    if (!ok) return;
    row._parts.sessionId.classList.add('copied');
    row._parts.sessionId.textContent = t('sess.copied');
    clearTimeout(row._copyTimer);
    row._copyTimer = setTimeout(() => {
      row._parts.sessionId.classList.remove('copied');
      updateSessionIdButton(row._parts.sessionId, id);
    }, 1100);
  });

  row._parts.travel.addEventListener('click', (event) => {
    event.stopPropagation();
    openTravelPage(row._session);
  });
  row._parts.pin.addEventListener('click', (event) => {
    event.stopPropagation();
    const key = sessionKey(row._session);
    const pinned = pinnedSessionIds.includes(key);
    if (pinned) pinnedSessionIds = pinnedSessionIds.filter((id) => id !== key);
    else {
      pinnedSessionIds = [key, ...pinnedSessionIds.filter((id) => id !== key)];
      archivedSessionIds = archivedSessionIds.filter((id) => id !== key);
    }
    window.pet.setSessionPrefs(pinnedSessionIds, archivedSessionIds);
    resetSessionListOrder();
    renderSessList();
  });
  row._parts.dismiss.addEventListener('click', (event) => {
    event.stopPropagation();
    const key = sessionKey(row._session);
    if (!key) return;
    archivedSessionIds = [key, ...archivedSessionIds.filter((id) => id !== key)];
    pinnedSessionIds = pinnedSessionIds.filter((id) => id !== key);
    window.pet.setSessionPrefs(pinnedSessionIds, archivedSessionIds);
    resetSessionListOrder();
    renderSessList();
  });

  row.addEventListener('click', () => {
    const session = row._session || {};
    window.pet.focusSession(session.sessionId || '');
    rlog('sesslist', 'focus ' + (session.project || ''));
    closeSessList();
  });
  return row;
}

function shortSessionId(id) {
  const value = String(id || '');
  return value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}

function updateSessionIdButton(button, id) {
  button.classList.toggle('hidden', !id);
  button.textContent = id ? `ID ${shortSessionId(id)} 📋` : '';
  button.title = id ? `${id}\n${t('sess.copyId')}` : '';
}

function updateSessRow(row, session) {
  row._session = session;
  const parts = row._parts;
  const key = sessionKey(session);
  const attention = session.state === 'waiting' || session.state === 'needsinput';
  let meta;
  if (attention) meta = session.reason
    ? t(session.state === 'waiting' ? 'sess.waitFor' : 'sess.replyFor', { reason: reasonWord(session.reason) })
    : sessMeta(session.state);
  else if (['working', 'juggling', 'sweeping', 'thinking'].includes(session.state)) {
    meta = session.op || sessMeta(session.state);
  } else if (session.badge === 'done') meta = t('sess.justDone');
  else if (session.badge === 'interrupted') meta = t('sess.interrupted');
  else meta = sessMeta(session.state) || session.state;

  const pinned = pinnedSessionIds.includes(key);
  const archived = archivedSessionIds.includes(key);
  row.dataset.sessionKey = key;
  row.className = 'sl-row' + (
    lootCapture && key === lootCapture.enteringSessionId ? ' loot-enter' : ''
  );
  parts.dot.className = `sl-dot ${sessionDotClass(session)}`;
  parts.icon.title = agentName(session.agent);
  const iconMarkup = agentIcon(session);
  if (parts.icon.innerHTML !== iconMarkup) parts.icon.innerHTML = iconMarkup;
  parts.name.textContent = session.project || '';
  parts.meta.className = `sl-meta${attention ? ' attn' : ''}`;
  parts.meta.textContent = meta || '';
  if (!parts.sessionId.classList.contains('copied')) updateSessionIdButton(parts.sessionId, key);
  if (typeof session.contextPercent === 'number') {
    parts.context.className = `sl-ctx ${ctxClass(session.contextPercent)}`.trim();
    parts.context.textContent = `${session.contextPercent}%`;
  } else {
    parts.context.className = 'sl-ctx hidden';
    parts.context.textContent = '';
  }
  if (parts.travel) {
    parts.travel.classList.toggle('hidden', !sessionActionAllowed(session, 'travel'));
    parts.travel.title = t('travel.entryTitle');
  }
  if (parts.dismiss) { parts.dismiss.title = t('sess.archive') || '归档此会话'; }
  if (parts.pin) {
    parts.pin.className = `sl-action pin${pinned ? ' active' : ''}`;
    parts.pin.title = t(pinned ? 'sess.unpin' : 'sess.pin');
  }
}

function renderSessList() {
  const list = sessionsForList();
  const waitingLetters = (curSessions || []).filter((session) => (
    session &&
    session.sessionRole === 'travel' &&
    session.choice &&
    (session.state === 'waiting' || session.state === 'needsinput')
  )).length;
  const renderSig = JSON.stringify({
    lang: window.OctoI18n.getLang(),
    search: sessionSearch,
    filter: sessionFilter,
    archived: showArchived,
    waitingLetters,
    loot: lootCapture && {
      ready: lootCapture.ready,
      enteringSessionId: lootCapture.enteringSessionId,
      count: lootCapture.sessions.length,
    },
    rows: list.map((s) => ({
      key: sessionKey(s),
      project: s.project,
      agent: s.agent,
      state: s.state,
      reason: s.reason,
      op: s.op,
      badge: s.badge,
      contextPercent: s.contextPercent,
      sessionId: s.sessionId,
      pinned: pinnedSessionIds.includes(sessionKey(s)),
      archived: archivedSessionIds.includes(sessionKey(s)),
    })),
  });
  if (renderSig === lastSessListRenderSig) return false;
  lastSessListRenderSig = renderSig;
  const previousScrollTop = slRows.scrollTop;
  if (slTravelInbox) {
    slTravelInbox.textContent = waitingLetters
      ? `${t('travel.inboxEntry')} �� ${waitingLetters}`
      : t('travel.inboxEntry');
    slTravelInbox.classList.toggle('has-letter', waitingLetters > 0);
  }
  slSub.textContent = lootCapture
    ? t('loot.countStreaming', { done: lootCapture.sessions.length })
    : (list.length ? t('sess.count', { n: list.length }) : '');
  if (!list.length) {
    slRows.innerHTML = '';
    const e = document.createElement('div');
    e.className = 'sl-empty';
    e.textContent = lootCapture ? t('loot.waiting') : t('sess.empty');
    slRows.appendChild(e);
    return true;
  }
  const existingRows = new Map();
  for (const child of [...slRows.children]) {
    const key = child.dataset && child.dataset.sessionKey;
    if (key) existingRows.set(key, child);
    else child.remove();
  }
  const retainedKeys = new Set();
  for (const [index, session] of list.entries()) {
    const key = sessionKey(session);
    const row = existingRows.get(key) || createSessRow();
    retainedKeys.add(key);
    updateSessRow(row, session);
    const currentAtIndex = slRows.children[index] || null;
    if (currentAtIndex !== row) {
      if (typeof slRows.insertBefore === 'function') slRows.insertBefore(row, currentAtIndex);
      else if (!row.parentNode) slRows.appendChild(row);
    }
  }
  for (const [key, row] of existingRows) {
    if (!retainedKeys.has(key)) row.remove();
  }
  // Preserve reading position even when rows are added, removed, or reordered.
  const maxScrollTop = Math.max(
    0,
    (Number(slRows.scrollHeight) || 0) - (Number(slRows.clientHeight) || 0),
  );
  slRows.scrollTop = Math.min(Number(previousScrollTop) || 0, maxScrollTop);
  return true;
}

function setTakeoverStatus(text, kind = '') {
  slTakeoverStatus.textContent = text || '';
  slTakeoverStatus.className = 'sl-takeover-status' + (kind ? ' ' + kind : '');
}

function takeoverResultText(result, target) {
  const code = result && result.code;
  if (code === 'native-fork') return t('takeover.nativeFork');
  if (code === 'native-resume') return t('takeover.nativeResume');
  if (code === 'handoff-launched') return t('takeover.handoffLaunched');
  if (code === 'invalid-target') return t('takeover.invalidTarget');
  if (code === 'invalid-provider') return t('takeover.invalidProvider');
  if (code === 'cli-missing') return t('takeover.cliMissing', { who: target === 'codex' ? 'Codex' : 'Claude' });
  return t('takeover.launchFailed');
}

function openTakeoverPage(session) {
  if (!sessionActionAllowed(session, 'takeover')) return false;
  memeTarget = null;
  travelTarget = null;
  takeoverTarget = session;
  sesslist.classList.remove('session-list-mode');
  sesslist.classList.add('takeover-mode');
  slSessionView.classList.add('hidden');
  slMemeView.classList.add('hidden');
  slTravelView.classList.add('hidden');
  slTakeoverView.classList.remove('hidden');
  slBack.classList.remove('hidden');
  slTitle.textContent = t('takeover.pickTitle');
  slSub.textContent = '';
  const source = agentName(session.agent);
  slTakeoverSession.textContent = t('takeover.source', { who: source, project: session.project });
  slTakeoverClaudeMode.textContent = t(session.agent === 'claude' ? 'takeover.nativeMode' : 'takeover.handoffMode');
  slTakeoverCodexMode.textContent = t(session.agent === 'codex' ? 'takeover.nativeMode' : 'takeover.handoffMode');
  slTakeoverClaude.disabled = false;
  slTakeoverCodex.disabled = false;
  setTakeoverStatus('');
  fitPopup(sesslist);
  return true;
}

async function runTakeover(target) {
  const source = takeoverTarget;
  if (!sessionActionAllowed(source, 'takeover') || !['claude', 'codex'].includes(target)) return false;
  slTakeoverClaude.disabled = true;
  slTakeoverCodex.disabled = true;
  setTakeoverStatus(t('takeover.starting'), 'warn');
  let result;
  try {
    result = await window.pet.takeOverSession(source.sessionId || '', target);
  } catch {
    result = { ok: false, code: 'launch-failed' };
  }
  if (!takeoverTarget || takeoverTarget.sessionId !== source.sessionId) return;
  setTakeoverStatus(takeoverResultText(result, target), result && result.ok ? 'ok' : 'error');
  slTakeoverClaude.disabled = false;
  slTakeoverCodex.disabled = false;
  rlog(
    'takeover',
    `${source.agent || '-'}��${target} id=${String(source.sessionId || '').slice(-8)} ` +
      `ok=${!!(result && result.ok)} code=${result && result.code || '-'}`,
  );
  fitPopup(sesslist);
  return true;
}

async function loadMemeCatalog() {
  try {
    const next = await window.pet.getMemeCatalog();
    if (next && Array.isArray(next.items)) memeCatalog = next;
  } catch (err) {
    rlog('meme', 'catalog failed ' + (err && err.message ? err.message : err));
  }
  return memeCatalog;
}

function memeMediaUrl(meme, kind) {
  if (!meme || !meme.media || typeof meme.media[kind] !== 'string') return '';
  const base = `../assets/memes/${meme.media[kind]}`;
  return meme.media.version ? `${base}?v=${encodeURIComponent(meme.media.version)}` : base;
}

function setMemeStatus(text, kind = '') {
  slMemeStatus.textContent = text || '';
  slMemeStatus.className = 'sl-meme-status' + (kind ? ' ' + kind : '');
}

async function openMemePage(session) {
  if (!sessionActionAllowed(session, 'meme')) return false;
  memeTarget = session;
  takeoverTarget = null;
  sesslist.classList.remove('session-list-mode');
  sesslist.classList.remove('takeover-mode');
  slSessionView.classList.add('hidden');
  slTakeoverView.classList.add('hidden');
  slMemeView.classList.remove('hidden');
  slBack.classList.remove('hidden');
  slTitle.textContent = t('meme.pickTitle');
  slSub.textContent = '';
  slMemeSession.textContent = `${agentName(session.agent)} �� ${session.project}`;
  slMemeGrid.innerHTML = '';
  setMemeStatus(t('meme.loading'));
  await loadMemeCatalog();
  if (!memeTarget || memeTarget.sessionId !== session.sessionId) return;
  slMemeGrid.innerHTML = '';
  for (const meme of memeCatalog.items) {
    const card = document.createElement('button');
    card.className = 'sl-meme-card';
    card.innerHTML =
      `<img class="sl-meme-thumb" src="${esc(memeMediaUrl(meme, 'gif'))}" alt="">` +
      `<span class="sl-meme-label">${esc(meme.label)}</span>` +
      `<span class="sl-meme-desc">${esc(meme.description)}</span>`;
    card.addEventListener('click', async (e) => {
      e.stopPropagation();
      card.disabled = true;
      setMemeStatus(t('meme.sending'));
      const target = memeTarget;
      closeSessList();
      let result;
      try {
        result = await window.pet.triggerMeme(target.sessionId, meme.id);
      } catch (err) {
        result = { ok: false, submitted: false, message: err && err.message ? err.message : t('meme.failed') };
      }
      const workReactionStarted = applyDeliveredMemeWorkReaction(meme, result);
      card.disabled = false;
      if (result && result.ok) {
        memeCaption.textContent = t(result.submitted ? 'meme.sent' : 'meme.copied', { label: meme.label });
      } else {
        memeCaption.textContent = (result && result.message) || t('meme.failed');
        if (memePlayer.classList.contains('hidden')) showBubble(memeCaption.textContent, 3600, true);
      }
      rlog(
        'meme',
        `${meme.id} target=${String(target.sessionId || '').slice(-6)} ` +
          `submitted=${!!(result && result.submitted)} inputSent=${!!(result && result.inputSent)} ` +
          `workReaction=${workReactionStarted}`,
      );
    });
    slMemeGrid.appendChild(card);
  }
  setMemeStatus(memeCatalog.items.length ? t('meme.hint') : t('meme.none'));
  fitPopup(sesslist);
  return true;
}

function travelBelongsToThisPet(trip) {
  return !!trip && (AGENT === 'all' || AGENT === trip.agent);
}

function tokenRankText(rank, emptyKey = 'travel.rankEmpty') {
  if (!rank || !rank.units) return t(emptyKey);
  const parts = [];
  if (rank.crown) parts.push(rank.crown > 3 ? `??��${rank.crown}` : '??'.repeat(rank.crown));
  if (rank.sun) parts.push(rank.sun > 3 ? `??��${rank.sun}` : '??'.repeat(rank.sun));
  if (rank.moon) parts.push('??'.repeat(rank.moon));
  if (rank.star) parts.push('?'.repeat(rank.star));
  // Keep the persisted property name `leaf` for compatibility, but render an
  // amber paw instead of a green leaf.
  if (rank.leaf) parts.push('??'.repeat(rank.leaf));
  return parts.join(' ') || t(emptyKey);
}

function setTravelStatus(text, kind = '') {
  slTravelStatus.textContent = text || '';
  slTravelStatus.className = 'sl-travel-status' + (kind ? ' ' + kind : '');
}

function travelErrorText(code) {
  if (code === 'busy') return t('travel.busy');
  if (code === 'invalid-target' || code === 'foreign-target' || code === 'empty-mission') return t('travel.invalid');
  return t('travel.notReady');
}

function travelMailboxSessions() {
  return (curSessions || [])
    .filter((session) => (
      session &&
      session.sessionRole === 'travel' &&
      !session.headless &&
      (AGENT === 'all' || session.travelAgent === AGENT || session.agent === AGENT)
    ));
}

function renderTravelMailboxes() {
  if (!slTravelMailboxes) return;
  const sessions = travelMailboxSessions();
  const agents = AGENT === 'all' ? ['claude', 'codex'] : (AGENT === 'dsh' ? [] : [AGENT]);
  const active = travelData && travelData.active;
  const renderSig = JSON.stringify({
    lang: window.OctoI18n.getLang(),
    agents,
    active: active && {
      agent: active.agent,
      status: active.status,
      minute: Math.max(0, Math.floor((Date.now() - Number(active.startedAt || Date.now())) / 60000)),
    },
    sessions: sessions.map((session) => ({
      key: sessionKey(session),
      agent: session.travelAgent || session.agent,
      project: session.project,
      state: session.state,
      badge: session.badge,
      choice: !!session.choice,
    })),
  });
  if (renderSig === lastTravelMailboxRenderSig) return false;
  lastTravelMailboxRenderSig = renderSig;
  slTravelMailboxes.innerHTML = '';
  for (const agent of agents) {
    const session = sessions.find((item) => (item.travelAgent || item.agent) === agent) || null;
    const hasLetter = !!(
      session &&
      session.choice &&
      (session.state === 'waiting' || session.state === 'needsinput')
    );
    const active = travelData && travelData.active && travelData.active.agent === agent
      ? travelData.active
      : null;
    let meta = t('travel.mailboxDormant');
    if (hasLetter) meta = t('travel.mailboxWaiting');
    else if (active) meta = active.status === 'departing'
      ? t('travel.departing')
      : t('travel.traveling', {
        minutes: Math.max(0, Math.floor((Date.now() - Number(active.startedAt || Date.now())) / 60000)),
      });
    else if (session) {
      if (session.badge === 'done') meta = t('sess.justDone');
      else if (session.badge === 'interrupted') meta = t('sess.interrupted');
      else meta = sessMeta(session.state) || session.state || t('travel.mailboxReady');
    }

    const row = document.createElement('div');
    row.className = 'sl-travel-mailbox' + (hasLetter ? ' has-letter' : '') + (active ? ' active' : '');
    row.innerHTML =
      `<span class="sl-travel-mailbox-icon">${agent === 'codex' ? '???' : '??'}</span>` +
      `<div class="sl-travel-mailbox-main">` +
      `<strong>${esc(t('travel.sessionName', { who: agent === 'codex' ? 'Codex' : 'Claude' }))}</strong>` +
      `<span>${esc(meta)}</span></div>` +
      (hasLetter
        ? `<button class="sl-travel-letter-open">${esc(t('travel.replyLetter'))}</button>`
        : session
          ? `<button class="sl-travel-terminal-open">${esc(t('travel.openMailbox'))}</button>`
          : `<span class="sl-travel-mailbox-new">${esc(t('travel.firstTripCreates'))}</span>`);
    const letter = row.querySelector('.sl-travel-letter-open');
    if (letter) {
      letter.addEventListener('click', (event) => {
        event.stopPropagation();
        const choice = session && session.choice;
        if (!choice) return;
        closeSessList();
        enqueueChoice(choice);
      });
    }
    const terminal = row.querySelector('.sl-travel-terminal-open');
    if (terminal) {
      terminal.addEventListener('click', (event) => {
        event.stopPropagation();
        window.pet.focusSession(session.sessionId || '');
        closeSessList();
      });
    }
    slTravelMailboxes.appendChild(row);
  }
  return true;
}

const POSTCARD_ART = {
  mountain: [
    '                 /\\',
    '            /\\  /  \\   /\\',
    '       /\\  /  \\/ /\\ \\_/  \\',
    '      /  \\/    _/  \\_      \\',
    '  ___/^^^  \\___/^^^^^^\\__/^^^\\___',
    '     \\       /\\      /       /',
    '      \\_____/  \\____/\\______/',
    '          /\\      /\\      /\\',
    '         /__\\    /__\\    /__\\',
    '          ||      ||      ||',
    '             /\\_/\\',
    '            ( o.o )  *',
    '             > ^ <  /|\\',
  ],
  desert: [
    '         .       *       .',
    '             \\   |   /',
    '          ----  ( )  ----',
    '             /   |   \\',
    '       _..--\'\'       \'\'--.._',
    '   _.-\'                     `-._',
    '.-\'       _..---.._            `-.',
    '      _.-\'   (   ) `-._',
    '  _.-\'    (       )    `-._',
    '            /\\_/\\',
    '       _   ( o.o )   _',
    '    .-\'     > ^ <     `-.',
  ],
  coast: [
    '             |\\',
    '             | \\',
    '          ___|__\\___',
    '         /    []    \\',
    '        /_____[]_____\\',
    '           |  ||',
    '       ____|__||____       .',
    '  ~~~~/            \\~~~~~~~~',
    ' ~~~~~   /\\_/\\       ~~~~~~~~',
    '  ~~~   ( o.o )  __/\\__  ~~~~',
    '         > ^ <  /______\\',
    ' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  city: [
    '       |[]|       .-.',
    '   .---|[]|---.  |[]|   .----.',
    '   |[] |  | []|  |  |   | [] |',
    ' .-|[] |[]| []|--|[]|---| [] |-.',
    ' | |   |  |   |  |  |   |    | |',
    ' |_|___|__|___|__|__|___|____|_|',
    '        \\   |   /',
    '      ===\\==|==/===',
    '          /\\_/\\',
    '         ( o.o )',
    '          > ^ <',
  ],
  forest: [
    '       /\\        /\\       /\\',
    '      /**\\   /\\ /**\\     /**\\',
    '     /****\\ /**\\****\\ /\\****\\',
    '       ||  /****\\ ||  /**\\ ||',
    '   /\\  ||    ||   || /****\\||',
    '  /**\\ ||    ||   ||   ||  ||',
    ' /****\\||  .----. ||   ||  ||',
    '   ||  || /      \\||   ||  ||',
    '   ||    /\\_/\\    \\',
    '        ( o.o )    |',
    '         > ^ <    /',
    '   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
  ],
  museum: [
    '            /\\',
    '           /  \\',
    '      ____/____\\____',
    '     /______________\\',
    '       ||  ||  ||',
    '       ||  ||  ||',
    '       ||  ||  ||',
    '    ___||__||__||___',
    '   /________________\\',
    '       /\\_/\\   []',
    '      ( o.o ) /__\\',
    '       > ^ <',
  ],
  craft: [
    '      +-------------------+',
    '      |# # # # # # # # # #|',
    '      | # # # # # # # # # |',
    '      |# # # # # # # # # #|',
    '      +----+---------+----+',
    '           |         |',
    '        ___|_________|___',
    '       /      /\\_/\\      \\',
    '      |      ( o.o )      |',
    '      |       > ^ <       |',
    '       \\_________________/',
  ],
  generic: [
    '          .-------------.',
    '         /  .--.   *     \\',
    '        /  /    \\    .    \\',
    '       |  /  /\\  \\         |',
    '       | /__/  \\__\\  /\\_/\\ |',
    '       |             ( o.o )|',
    '       |     .----.   > ^ < |',
    '       |____/______\\_________|',
    '          /  /  \\  \\',
    '         /__/    \\__\\',
    '       ~~~~~~~~~~~~~~~~~',
  ],
};

const POSTCARD_ART_VARIANTS = {
  desert: [
    POSTCARD_ART.desert,
    [
      '          .--.       .--.',
      '       .-(    ).   .(    )-.',
      '      (___.__)__) (___.__)__)',
      '          \\\\ | /     \\\\ | /',
      '       _..-\\\\|/--..__\\\\|/--.._',
      '   _.-\'      o       o       `-._',
      '.-\'       o     o       o        `-.',
      '       _..---.._   _..---.._',
      '     .\'  /\\_/\\  `.\'         `.',
      '    /   ( o.o )   \\\\   o      \\\\',
      '   /     > ^ <     \\\\      o   \\\\',
      '  `-----------------------------\'',
    ],
    [
      '        _..---~~~~---.._',
      '   _.-\'      .   .      `-._',
      '.-\'_____( )_______( )_______`-.',
      '          \\\\       /',
      '           \\\\_.-._/',
      '         .-\'  o o `-.',
      '       _/  .-.___.-. \\\\_',
      '      /___/  /   \\\\  \\\\___\\\\',
      '         /__/     \\\\__\\\\',
      '       /\\_/\\   _/\\_',
      '      ( o.o ) /____\\\\',
      '       > ^ <   ||||',
    ],
    [
      '    Y   Y      Y       Y   Y',
      '   \\\\|/ \\\\|/  .------.  \\\\|/ \\\\|/',
      ' Y--*---*--/        \\\\--*---*--Y',
      '   /|\\\\ /|\\\\|   .-.   |/|\\\\ /|\\\\',
      '          |  (   )  |',
      '   Y   Y  \\\\   `-\'  /  Y   Y',
      '  \\\\|/ \\\\|/  `------\'  \\\\|/ \\\\|/',
      '   *---*      /\\_/\\      *---*',
      '  /|\\\\ /|\\\\    ( o.o )    /|\\\\ /|\\\\',
      '              > ^ <',
      '       _..--\'     `--.._',
      '  _.-\'___________________`-._',
    ],
  ],
};

function postcardArtKey(words = '') {
  const text = String(words || '').toLocaleLowerCase();
  if (/(��������|����|ϲ������|everest|himalaya|mountain|ɽ��|ѩɽ|��ɽ)/i.test(text)) {
    return 'mountain';
  }
  if (/(���ײ�|ɳĮ|ɳ��|desert|dune|fairy circle|��ŮȦ|��Į|����|termite|linyji|Ƥ������|pilbara|spinifex|��Ҷ��)/i.test(text)) {
    return 'desert';
  }
  if (/(��|��|��|����|coast|ocean|sea|island|harbour|harbor|lighthouse)/i.test(text)) {
    return 'coast';
  }
  if (/(ɭ��|��|��̬|����|forest|woodland|jungle|tree)/i.test(text)) {
    return 'forest';
  }
  if (/(������|����|����|museum|gallery|temple|palace|��ַ)/i.test(text)) {
    return 'museum';
  }
  if (/(����|֯|��|����|craft|weav|potter|workshop|��ͳ)/i.test(text)) {
    return 'craft';
  }
  if (/(����|С��|��|�г�|city|town|street|market|����)/i.test(text)) {
    return 'city';
  }
  return '';
}

function mirrorPostcardArt(lines) {
  const swap = { '/': '\\', '\\': '/', '(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[' };
  return lines.map((line) => [...line].reverse().map((char) => swap[char] || char).join(''));
}

function fallbackPostcardArt(trip, scene = '', index = 0) {
  // A stop's own place name must win over broader trip context. Otherwise one
  // Everest mention in a multi-stop trip turns every following card into a
  // mountain postcard.
  const tripWords = `${
    trip && trip.project || ''
  } ${
    trip && trip.mission || ''
  } ${
    String(trip && trip.result || '').slice(0, 1600)
  }`;
  const key = postcardArtKey(scene) || postcardArtKey(tripWords) || 'generic';
  const variantNumber = Math.abs(Number(index) || 0);
  const variants = POSTCARD_ART_VARIANTS[key];
  if (variants && variants.length) {
    const lines = [...variants[variantNumber % variants.length]];
    if (variantNumber >= variants.length && lines.length < 16) {
      lines.unshift(variantNumber % 2 ? '      ��       *        .' : '   *        .       ��');
    }
    return lines.join('\n');
  }
  const base = POSTCARD_ART[key] || POSTCARD_ART.generic;
  const lines = variantNumber % 2 ? mirrorPostcardArt(base) : [...base];
  if (variantNumber >= 2 && lines.length < 16) {
    lines.unshift(variantNumber % 3 === 2 ? '      .       *       .' : '   *       ��        .');
  }
  return lines.join('\n');
}

function usablePostcardArt(value) {
  const lines = String(value || '').trim().split('\n');
  if (lines.length < 8 || lines.length > 16) return false;
  if (lines.some((line) => [...line].length > 48)) return false;
  const ink = lines.join('').replace(/[\s\p{L}\p{N}]/gu, '');
  return new Set(ink).size >= 5;
}

function postcardExcerpt(value) {
  let source = String(value || '')
    .replace(/\[([^\]]+)\]\((?:https?:\/\/)?[^)]+\)/g, '$1')
    .replace(/^#{1,4}\s+[^\n]+\n*/gm, '')
    .replace(/\n(?:��ʵ(?:��|����)?|��������|�ο�����|Sources?|References?|�_�J�Y��|����)[:��]?[^\n]*[\s\S]*$/i, '')
    .replace(/^[*-]\s+/gm, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const hanCount = (source.match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length;
  const limit = hanCount > source.length * 0.18 ? 300 : 620;
  if (source.length <= limit) return source;
  const chunks = source.match(/[^������.!?\n]+[������.!?]?|\n+/g) || [source];
  let result = '';
  for (const chunk of chunks) {
    const candidate = result + chunk;
    if (candidate.length > limit - 2) break;
    result = candidate;
  }
  if (!result.trim()) result = source.slice(0, limit - 2);
  return `${result.trim()}��`;
}

function postcardStopFromBlock(block, trip, index, prefix = '') {
  const source = String(block || '').replace(/<!--\s*LLMPET_STOP\s*-->/ig, '').trim();
  const heading = /^\s*#{1,4}\s+([^\n]+)/m.exec(source);
  const firstLine = String((source.split(/\n+/)[0] || '')).replace(/^#{1,4}\s*/, '').trim();
  const title = (heading && heading[1] || firstLine || t('travel.stopN', { n: index + 1 }))
    .replace(/\s+/g, ' ')
    .slice(0, 54);
  const fenced = /```(?:text|ascii(?:-art)?)?[ \t]*\n([\s\S]*?)```/i.exec(source);
  const candidateArt = fenced ? String(fenced[1] || '').trim() : '';
  let text = source;
  if (fenced) text = `${text.slice(0, fenced.index)}${text.slice(fenced.index + fenced[0].length)}`;
  if (heading) text = text.replace(heading[0], '');
  text = `${prefix ? `${prefix.trim()}\n\n` : ''}${text.trim()}`.trim();
  return {
    title,
    art: usablePostcardArt(candidateArt)
      ? candidateArt
      : fallbackPostcardArt(trip, `${title}\n${text}`, index),
    text: postcardExcerpt(text),
  };
}

function splitLegacyTravelStops(source) {
  // Older travel replies were prose, so a stop marker can sit inside a
  // sentence ("�ɵ���վ��", "ȥ�˵���վ��") instead of at a paragraph start.
  // New replies use LLMPET_STOP and never depend on this compatibility path.
  const marker = /��(?:[һ�����������߰˾�ʮ��]+|\d+)վ|Stop\s+\d+|��\d+ͣ����/gim;
  const found = [];
  let match;
  while ((match = marker.exec(source))) {
    found.push(match.index);
  }
  if (found.length < 2) return null;
  return {
    prefix: source.slice(0, found[0]).trim(),
    blocks: found.map((start, index) => source.slice(start, found[index + 1] || source.length).trim()),
  };
}

function splitTravelPostcard(trip) {
  const source = String((trip && (trip.result || trip.error)) || '').trim();
  const marked = source.split(/<!--\s*LLMPET_STOP\s*-->/i).slice(1).map((part) => part.trim()).filter(Boolean);
  let stops;
  if (marked.length) {
    stops = marked.map((block, index) => postcardStopFromBlock(block, trip, index));
  } else {
    const legacy = splitLegacyTravelStops(source);
    stops = legacy
      ? legacy.blocks.map((block, index) => (
      postcardStopFromBlock(block, trip, index, index === 0 ? legacy.prefix : '')
      ))
      : [postcardStopFromBlock(source, trip, 0)];
  }
  const seen = new Set();
  return stops.map((stop, index) => {
    let art = stop.art;
    let signature = String(art || '').replace(/\s+/g, '');
    if (!signature || seen.has(signature)) {
      art = fallbackPostcardArt(trip, `${stop.title}\n${stop.text}`, index);
      signature = String(art || '').replace(/\s+/g, '');
    }
    let alternate = index + 1;
    while (seen.has(signature) && alternate < index + 7) {
      art = fallbackPostcardArt(trip, `${stop.title}\n${stop.text}`, alternate++);
      signature = String(art || '').replace(/\s+/g, '');
    }
    seen.add(signature);
    return { ...stop, art };
  });
}

function updateTravelStopNav(stops) {
  const count = Array.isArray(stops) ? stops.length : 0;
  selectedPostcardStop = Math.max(0, Math.min(selectedPostcardStop, Math.max(0, count - 1)));
  slTravelStopPage.textContent = count
    ? t('travel.stopPage', { current: selectedPostcardStop + 1, total: count })
    : '';
  slTravelStopPrev.disabled = selectedPostcardStop <= 0;
  slTravelStopNext.disabled = selectedPostcardStop >= count - 1;
}

function goTravelStop(index) {
  const cards = slTravelStopTrack ? [...slTravelStopTrack.children] : [];
  if (!cards.length) return;
  selectedPostcardStop = Math.max(0, Math.min(Number(index) || 0, cards.length - 1));
  cards.forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === selectedPostcardStop);
    card.setAttribute('aria-hidden', cardIndex === selectedPostcardStop ? 'false' : 'true');
  });
  updateTravelStopNav(cards);
}

function renderTravelPostcard(trip) {
  const source = String((trip && (trip.result || trip.error)) || '');
  const key = `${trip && trip.id || ''}|${source.length}|${source.slice(0, 48)}`;
  if (key === renderedPostcardKey && slTravelStopTrack.children.length) {
    updateTravelStopNav([...slTravelStopTrack.children]);
    return;
  }
  renderedPostcardKey = key;
  const stops = splitTravelPostcard(trip);
  slTravelStopTrack.innerHTML = '';
  for (let index = 0; index < stops.length; index++) {
    const stop = stops[index];
    const card = document.createElement('article');
    card.className = 'sl-travel-stop-card';
    card.dataset.stop = String(index);
    card.innerHTML =
      `<div class="sl-travel-stop-title">${esc(stop.title)}</div>` +
      `<div class="sl-travel-postcard-body">` +
      `<div class="sl-travel-postcard-text">${esc(stop.text)}</div>` +
      `</div>`;
    slTravelStopTrack.appendChild(card);
  }
  selectedPostcardStop = 0;
  updateTravelStopNav(stops);
  goTravelStop(0);
}

function selectedTravelPostcard() {
  const all = Array.isArray(travelPostcards) ? travelPostcards : [];
  if (!all.length) {
    const latest = travelData && travelData.latest;
    return latest && latest.status === 'completed' && latest.result ? latest : null;
  }
  return all.find((trip) => trip.id === selectedPostcardId) || all[0];
}

function renderTravelHistory() {
  if (!slTravelHistory) return;
  const all = Array.isArray(travelPostcards) ? travelPostcards : [];
  const renderSig = JSON.stringify({
    lang: window.OctoI18n.getLang(),
    selectedPostcardId,
    trips: all.map((trip) => ({
      id: trip.id,
      agent: trip.agent,
      project: trip.project,
      status: trip.status,
      tokens: trip.usage && trip.usage.tokens,
    })),
  });
  if (renderSig === lastTravelHistoryRenderSig) return false;
  lastTravelHistoryRenderSig = renderSig;
  slTravelHistory.innerHTML = '';
  if (!all.length) {
    const empty = document.createElement('div');
    empty.className = 'sl-travel-history-empty';
    empty.textContent = t('travel.noPostcard');
    slTravelHistory.appendChild(empty);
    return;
  }
  if (!selectedPostcardId || !all.some((trip) => trip.id === selectedPostcardId)) {
    selectedPostcardId = all[0].id;
  }
  for (const trip of all) {
    const card = document.createElement('button');
    const statusKey = trip.status === 'completed'
      ? 'travel.completed'
      : trip.status === 'cancelled' ? 'travel.cancelled' : 'travel.failed';
    card.className = 'sl-travel-history-card' + (trip.id === selectedPostcardId ? ' active' : '');
    card.innerHTML =
      `<span>${trip.agent === 'codex' ? '???' : '??'}</span>` +
      `<div><strong>${esc(trip.project || t('travel.postcard'))}</strong>` +
      `<small>${esc(t(statusKey))} �� ${esc(compactTokens(trip.usage && trip.usage.tokens || 0))} token</small></div>`;
    card.addEventListener('click', (event) => {
      event.stopPropagation();
      selectedPostcardId = trip.id;
      selectedPostcardStop = 0;
      renderedPostcardKey = '';
      renderTravelPage();
    });
    slTravelHistory.appendChild(card);
  }
  return true;
}

function renderTravelTemplates() {
  const available = (travelData && travelData.templates) || [];
  if (!available.length) return;
  if (!travelTemplateId || !available.some((item) => item.id === travelTemplateId)) {
    travelTemplateId = available[0].id;
  }
  const renderSig = JSON.stringify({
    lang: window.OctoI18n.getLang(),
    selected: travelTemplateId,
    templates: available.map((item) => ({
      id: item.id,
      label: item.label,
      description: item.description,
      mission: item.mission,
    })),
  });
  if (renderSig === lastTravelTemplatesRenderSig) return false;
  lastTravelTemplatesRenderSig = renderSig;
  slTravelTemplates.innerHTML = '';
  for (const item of available) {
    const card = document.createElement('button');
    card.className = 'sl-travel-template' + (item.id === travelTemplateId ? ' active' : '');
    card.innerHTML = `<strong>${esc(item.label)}</strong><span>${esc(item.description)}</span>`;
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      travelTemplateId = item.id;
      travelMissionDirty = false;
      slTravelMission.value = item.mission || '';
      renderTravelTemplates();
    });
    slTravelTemplates.appendChild(card);
  }
  if (!travelMissionDirty && !slTravelMission.value) {
    const selected = available.find((item) => item.id === travelTemplateId) || available[0];
    slTravelMission.value = selected.mission || '';
  }
  return true;
}

function renderTravelPage() {
  if (!slTravelView || slTravelView.classList.contains('hidden')) return;
  const data = travelData || { growth: {}, templates: [] };
  const growth = data.growth || {};
  const rank = growth.rank || {};
  const active = data.active || null;
  const shownTarget = active || travelTarget;

  slTravelSession.textContent = shownTarget
    ? `${agentName(shownTarget.agent)} �� ${shownTarget.project || ''}`
    : t('travel.inboxIntro');
  slTravelRankIcons.textContent = tokenRankText(rank);
  const remaining = Math.max(0, (Number(rank.nextTokens) || 10000) - (Number(rank.progressTokens) || 0));
  slTravelRankMeta.textContent =
    t('travel.rankTokens', { tokens: compactTokens(growth.totalTokens || 0), trips: growth.completed || 0 }) +
    '\n' + t('travel.nextRank', { tokens: compactTokens(remaining) });

  const machine = (lastStats && lastStats.machineGrowth) || {};
  const machineRank = machine.rank || {};
  const machineRemaining = Math.max(
    0,
    (Number(machineRank.nextTokens) || 10000000) - (Number(machineRank.progressTokens) || 0),
  );
  slMachineRankIcons.textContent = tokenRankText(machineRank, 'travel.machineRankEmpty');
  slMachineRankMeta.textContent =
    t('travel.machineRankTokens', {
      tokens: compactTokens(machine.totalTokens || 0),
      claude: compactTokens(machine.claudeTokens || 0),
      codex: compactTokens(machine.codexTokens || 0),
    }) +
    '\n' + t('travel.nextMachineRank', { tokens: compactTokens(machineRemaining) });

  renderTravelMailboxes();
  if (slWander) {
    slWander.disabled = !!active;
    slWander.title = active ? t('travel.busy') : t('travel.wanderTitle');
  }

  if (active) {
    slTravelSetup.classList.add('hidden');
    slTravelActive.classList.remove('hidden');
    const minutes = Math.max(0, Math.floor((Date.now() - Number(active.startedAt || Date.now())) / 60000));
    slTravelActiveStatus.textContent = active.status === 'departing'
      ? t('travel.departing')
      : t('travel.traveling', { minutes });
    slTravelActiveMission.textContent = active.mission || '';
    slTravelCancel.classList.toggle('hidden', !travelBelongsToThisPet(active));
    setTravelStatus(travelBelongsToThisPet(active) ? '' : t('travel.busy'));
  } else if (travelTarget) {
    slTravelSetup.classList.remove('hidden');
    slTravelActive.classList.add('hidden');
    renderTravelTemplates();
  } else {
    slTravelSetup.classList.add('hidden');
    slTravelActive.classList.add('hidden');
  }

  renderTravelHistory();
  const latest = selectedTravelPostcard();
  if (latest && latest.status === 'completed' && latest.result) {
    slTravelPostcard.classList.remove('hidden');
    slTravelPostcardMeta.textContent =
      `${t('travel.completed')} �� ${compactTokens(latest.usage && latest.usage.tokens || 0)} token`;
    renderTravelPostcard(latest);
  } else {
    slTravelPostcard.classList.add('hidden');
    renderedPostcardKey = '';
    if (slTravelStopTrack) slTravelStopTrack.innerHTML = '';
  }
  fitPopup(sesslist);
}

async function openTravelPage(session) {
  // A null session opens the provider-neutral mailbox. A concrete unsupported
  // provider must not reach travel setup or the startTravel IPC.
  if (session && !sessionActionAllowed(session, 'travel')) return false;
  travelTarget = session || null;
  takeoverTarget = null;
  sesslist.classList.remove('session-list-mode');
  sesslist.classList.remove('takeover-mode');
  travelMissionDirty = false;
  travelTemplateId = null;
  slSessionView.classList.add('hidden');
  slMemeView.classList.add('hidden');
  slTakeoverView.classList.add('hidden');
  slTravelView.classList.remove('hidden');
  slBack.classList.remove('hidden');
  slTitle.textContent = session ? t('travel.pickTitle') : t('travel.inboxTitle');
  slSub.textContent = '';
  slTravelMission.value = '';
  setTravelStatus('');
  try {
    const loaded = await Promise.all([
      window.pet.getTravel(),
      typeof window.pet.getTravelPostcards === 'function'
        ? window.pet.getTravelPostcards()
        : Promise.resolve([]),
    ]);
    travelData = loaded[0];
    travelPostcards = Array.isArray(loaded[1]) ? loaded[1] : [];
    if (
      !travelPostcards.length &&
      travelData &&
      travelData.latest &&
      travelData.latest.status === 'completed' &&
      travelData.latest.result
    ) {
      travelPostcards = [travelData.latest];
    }
    selectedPostcardId = travelPostcards[0] ? travelPostcards[0].id : null;
    selectedPostcardStop = 0;
    renderedPostcardKey = '';
  } catch {
    travelData = null;
    travelPostcards = [];
    setTravelStatus(t('travel.notReady'), 'error');
  }
  renderTravelPage();
  return true;
}

function openTravelInbox() {
  return openTravelPage(null);
}

function showSessionPage() {
  memeTarget = null;
  takeoverTarget = null;
  travelTarget = null;
  sesslist.classList.remove('takeover-mode');
  sesslist.classList.add('session-list-mode');
  slMemeView.classList.add('hidden');
  slTakeoverView.classList.add('hidden');
  slTravelView.classList.add('hidden');
  slSessionView.classList.remove('hidden');
  slBack.classList.add('hidden');
  slTitle.textContent = t('sess.title');
  renderSessList();
  fitPopup(sesslist);
}

function openSessList() {
  if (radialOpen) closeRadial();
  if (todoPopOpen) closeTodoPop(true);
  hideAsk(true);
  resetSessionListOrder();
  showSessionPage();
  bubble.classList.add('hidden');
  sesslist.classList.remove('hidden');
  sessListOpen = true;
  rlog('sesslist', 'open ' + visibleSessions().length);
  fitPopup(sesslist); // ��̬���� + 440 �����Ự�����ض�
}
function closeSessList(preserveSize = false) {
  if (!sessListOpen) return;
  sesslist.classList.add('hidden');
  sessListOpen = false;
  memeTarget = null;
  takeoverTarget = null;
  travelTarget = null;
  rlog('sesslist', 'close');
  // [USER REQUEST] keep window bounds stable on close so character does not shift
}

function alignMemePlayer() {
  if (!memeLayoutActive || memePlayer.classList.contains('hidden')) return;
  const petEl = curSkinEl();
  if (!petEl) return;
  const petRect = petEl.getBoundingClientRect();
  const docEl = document.documentElement;
  const viewportW = Math.max(1, window.innerWidth || (docEl && docEl.clientWidth) || MEME_WINDOW_W);
  const viewportH = Math.max(1, window.innerHeight || (docEl && docEl.clientHeight) || MEME_WINDOW_H);
  const naturalW = Number(memeImage.naturalWidth) || 16;
  const naturalH = Number(memeImage.naturalHeight) || 9;
  const availableRight = viewportW - petRect.right - MEME_GAP - MEME_EDGE_PAD;
  const availableLeft = petRect.left - MEME_GAP - MEME_EDGE_PAD;
  const preferred = currentMemePlacement === 'pet-left' ? 'left' : 'right';
  let side = preferred;
  if (side === 'right' && availableRight < 120 && availableLeft > availableRight) side = 'left';
  if (side === 'left' && availableLeft < 120 && availableRight > availableLeft) side = 'right';
  const available = Math.max(120, side === 'right' ? availableRight : availableLeft);
  const mediaW = Math.min(MEME_MEDIA_W, available);
  const mediaH = Math.min(180, mediaW * naturalH / naturalW);
  let left = side === 'right'
    ? petRect.right + MEME_GAP
    : petRect.left - MEME_GAP - mediaW;
  let top = petRect.top + (petRect.height - mediaH) / 2;
  left = Math.max(MEME_EDGE_PAD, Math.min(left, viewportW - mediaW - MEME_EDGE_PAD));
  // Caption sits below the image; reserve a small footer so it cannot be cut.
  top = Math.max(MEME_EDGE_PAD, Math.min(top, viewportH - mediaH - 34));
  memePlayer.style.left = `${Math.round(left)}px`;
  memePlayer.style.top = `${Math.round(top)}px`;
  memePlayer.style.width = `${Math.round(mediaW)}px`;
  memePlayer.dataset.side = side;
}

function restoreSizeAfterMeme() {
  if (askActive) fitPopup(askEl);
  else if (sessListOpen) fitPopup(sesslist);
  else if (todoPopOpen) fitPopup(todopop);
  else if (restoreEndingBubble()) return;
  else if (!bubble.classList.contains('hidden')) fitPopup(bubble);
  else resetPetSize();
}

let currentMemePlacement = 'pet-right';
function playMeme(meme) {
  if (!meme || !meme.media) return;
  clearTimeout(memeTimer);
  if (memeAudio) {
    try { memeAudio.pause(); } catch {}
    memeAudio = null;
  }
  memeLayoutActive = true;
  currentMemePlacement = meme.media.placement === 'pet-left' ? 'pet-left' : 'pet-right';
  memeImage.src = memeMediaUrl(meme, 'gif');
  memeImage.alt = meme.label || t('meme.fallbackLabel');
  memeCaption.textContent = `${meme.label || t('meme.fallbackLabel')} �� ${meme.project || ''}`;
  memePlayer.classList.remove('hidden');
  setRequestedPetSize(MEME_WINDOW_W, MEME_WINDOW_H);
  if (meme.reaction && meme.reaction.state) {
    transient(meme.reaction.state, Number(meme.reaction.durationMs) || Number(meme.media.durationMs) || 3000);
  }
  // Start the longer work visual at the same instant as the meme response.
  // The dispatch result later confirms it (submitted/inputSent) or cancels it
  // on a real delivery failure, so there is no transcript-lag gap.
  startMemeWorkReaction(meme.reaction && meme.reaction.work);
  requestAnimationFrame(() => requestAnimationFrame(alignMemePlayer));
  if (!muted && typeof window.Audio === 'function') {
    try {
      memeAudio = new window.Audio(memeMediaUrl(meme, 'audio'));
      memeAudio.volume = 0.9;
      const p = memeAudio.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {}
  }
  memeTimer = setTimeout(() => {
    memePlayer.classList.add('hidden');
    memeImage.removeAttribute('src');
    if (memeAudio) { try { memeAudio.pause(); } catch {} }
    memeAudio = null;
    memeLayoutActive = false;
    restoreSizeAfterMeme();
  }, Number(meme.media.durationMs) || 3000);
}

memeImage.addEventListener('load', alignMemePlayer);
window.pet.onMeme(playMeme);
if (typeof window.pet.onMemeCatalogChanged === 'function') {
  window.pet.onMemeCatalogChanged(() => {
    clearTimeout(memeCatalogRefreshTimer);
    memeCatalogRefreshTimer = setTimeout(async () => {
      await loadMemeCatalog();
      if (sessListOpen && memeTarget) await openMemePage(memeTarget);
    }, 80);
  });
}
function toggleSessList() { sessListOpen ? closeSessList() : openSessList(); }

// ���� -> �ɻ�������� emoji ���˶�����
const TOOL_ACT = {
  Edit: 'type', MultiEdit: 'type', Write: 'type', NotebookEdit: 'type',
  Read: 'read',
  Bash: 'crank',
  Js: 'code',
  Grep: 'search', Glob: 'search',
  WebSearch: 'web', WebFetch: 'web',
  Task: 'summon', Agent: 'summon',
  TodoWrite: 'check',
};
const ACT_CLASSES = ['act-type', 'act-read', 'act-search', 'act-crank', 'act-code', 'act-web', 'act-summon', 'act-check', 'act-work'];
const PROP_MOTION = { crank: 'spin', code: 'jit', web: 'spin', search: 'hunt', type: 'jit' };
let actTimer = null;

let state = 'idle';
let bubbleTimer = null;
let bubbleMode = 'transient';
let endingExpanded = false;
let endingScrollSeq = 0;
const endingMessages = new Map();
let blinkTimer = null;
let transientUntil = 0;   // ����״̬��happy/error����������ʱ��
let transientState = null;
let muted = false;
window.isPetMuted = () => muted;
let skin = 'champion';
let lastWaiting = 0;
let lastBgZombie = 0; // ��̨���ƽ�ʬ��
let radialOpen = false;
let errorRibbonTimer = null;
const errorRibbonNodes = new Set();

const IDLE_SLEEP_MS = (window.PET_CONFIG && window.PET_CONFIG.idleSleepMinutes ? window.PET_CONFIG.idleSleepMinutes * 60 * 1000 : 6 * 60 * 1000);
const stateEls = [pixel, mascot, cat, championSpine].filter(Boolean);
const DEBUG_STATE = null; // �����ã�ǿ��ĳ״̬���� 'sleeping'��������������Ϊ null
const DEBUG_CONFETTI = false; // ��ʱ����ʱ�Ųʴ���֤����֤���Ļ� false

// ---------- ����С���� ----------
const PIXEL_MAP = [
  '..##############..',
  '..##############..',
  '..##############..',
  '#####OO####OO#####',
  '#####OO####OO#####',
  '..##############..',
  '..##############..',
  '..##############..',
  '..##############..',
  '...##.##..##.##...',
  '...##.##..##.##...',
];
function buildPixel() {
  if (!pixel) return;
  const sprite = pixel.querySelector('.pixel-sprite');
  const rows = PIXEL_MAP.length;
  const cols = PIXEL_MAP[0].length;
  const cell = 9;
  const W = cols * cell;
  const H = rows * cell;
  let rects = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = PIXEL_MAP[y][x];
      if (c === '.') continue;
      const fill = c === 'O' ? '#2a1b2e' : '#c2694a';
      rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`;
    }
  }
  sprite.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${rects}</svg>`;
}
buildPixel();

// ---------- ״̬�����������������󣬽���ǰƤ���ɼ��� ----------
// ǰ�˻� setState ��ȫ��״̬�ʣ��ۺ�̬ + ����̬ + ����̬������ͳһȡ��
// shared/states.js��pet.html �� <script> �� pet.js ֮ǰ����������classList.remove
// ���븲�Ǵ�ȫ����©һ���ͻ� class ������Ƥ��Ԫ���ϡ�
const STATE_WORDS = (window.OctoStates && window.OctoStates.RENDER_STATE_WORDS) || [];
function setState(s) {
  const wasSleeping = state === 'sleeping';
  const wasWorking = (state === 'working' || state === 'thinking');
  if (s !== 'sleeping' && s !== 'idle') {
    isFallingAsleep = false;
    sleepLevel = 0;
    clearSleepSequence();
  }
  if (skin === 'champion' && isChampionDead()) {
    // �������ɣ�װ�������ڼ䣬��ǰ���ι���ȫ���Թ��������ڹ����м临�
    return;
  }
  if (state === s) {
    // ����״̬û�䣬��ʱ�Ӿ����Կ��ܸոյ��ڣ�ͬ״̬����ҲҪ��è
    // ����ѡͼ������ 30s �ĸ�ѹ������̬��һֱ�ϵ���һ��״̬�л���
    if (isMeme()) updateCat(s);
    if (skin === 'champion') updateChampionSpine(s);
    return;
  }
  for (const el of stateEls) {
    el.classList.remove(...STATE_WORDS);
    el.classList.add(s);
  }
  state = s;
  rlog('state', s);
  thinkEl.classList.toggle('on', s === 'thinking');
  sleepEl.classList.toggle('on', s === 'sleeping');
  // A final response is an inbox item, not a transient animation. Thinking or
  // sleeping may hide ordinary chatter, but must not erase an unread ending.
  if ((s === 'thinking' || s === 'sleeping') && bubbleMode !== 'ending') bubble.classList.add('hidden');
  if (s === 'working') {
    // �����ɻ�̬ �� ���̹��ϡ�����æµ�����߶��������Ⱦ��� tool �¼���
    // �κ�ʱ�̶��Ե���æ������ tool ����������֮�ϵ��ӣ����������䵽�����
    for (const el of stateEls) el.classList.add('act-work');
  } else {
    clearAction(); // �뿪�ɻ�̬����������
  }
  // ע�⣺��Ҫ������ hideAsk()����������ֻ�� refreshAsk(���Ƿ��д�������) �ܡ�
  // ֮ǰ��s!=='waiting' �� hideAsk�����ھۺ�̬�� working/thinking ʱ�� needsinput ������������
  if (skin === 'mascot') updateMascotEyes(s);
  if (isMeme()) updateCat(s);
  if (skin === 'champion') updateChampionSpine(s);
  syncErrorRibbons();
  if (wasWorking && s === 'idle') {
    if (skin === 'champion') {
      playWorkFinishedCelebration();
    }
  }
  if (wasSleeping && (s === 'idle' || s === 'working')) {
    const wakeMsg = getDialogueLine('wake');
    if (wakeMsg) showBubble(wakeMsg, 2800);
  }
}

// �����߲���ר��������cat / whale �� GIF �Ѿ����﹤�߶��������ٵ����� emoji��
function playAction(toolName, icon) {
  if (state === 'waiting' || state === 'sleeping') return;
  const act = TOOL_ACT[toolName] || 'work';
  for (const el of stateEls) {
    el.classList.remove(...ACT_CLASSES);
    el.classList.add('act-' + act); // ͨ�� work Ҳ�����嶯��������ֻ��ͼ�꣩
  }
  if (!isMeme() && icon) {
    propEl.textContent = icon;
    propEl.className = 'prop';
    void propEl.offsetWidth; // ��������
    const pm = PROP_MOTION[act];
    propEl.className = 'prop on' + (pm ? ' ' + pm : '');
    requestAnimationFrame(alignToolProp);
  }
  if (act === 'summon') {
    sidekickEl.classList.remove('on');
    void sidekickEl.offsetWidth;
    sidekickEl.classList.add('on');
  }
  clearTimeout(actTimer);
  actTimer = setTimeout(clearAction, 2200);
}

function alignToolProp() {
  if (!propEl || !propEl.classList.contains('on')) return;
  const petEl = curSkinEl();
  if (!petEl) return;
  const rect = petEl.getBoundingClientRect();
  const viewportW = Math.max(1, window.innerWidth || 320);
  const viewportH = Math.max(1, window.innerHeight || 340);
  const size = Math.max(24, Number(propEl.offsetWidth) || Number(propEl.offsetHeight) || 28);
  const preferred = edgeLayout.horizontal === 'left' ? 'right' : 'left';
  const position = window.PetGeometry && window.PetGeometry.adornmentPosition
    ? window.PetGeometry.adornmentPosition({
      petRect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
      viewport: { x: 0, y: 0, width: viewportW, height: viewportH },
      preferred,
      size,
    })
    : { x: rect.left - size - 5, y: rect.top + 12 };
  propEl.style.left = `${Math.round(position.x)}px`;
  propEl.style.top = `${Math.round(position.y)}px`;
  propEl.dataset.side = position.side || preferred;
}
function clearAction() {
  for (const el of stateEls) el.classList.remove(...ACT_CLASSES);
  propEl.classList.remove('on');
  // ���� tool ���������������ڸɻ� �� ���䵽������æµ�����ߣ��𰲾�����
  if (state === 'working') for (const el of stateEls) el.classList.add('act-work');
}

// ����״̬��happy/error/greet������������ applyStats �ӹܡ�
// ���ڲ��ٸɵ���һ�����գ���������� ~4s������̬����β������
// ��ʱ������һ�ο������������ۺ�̬�����㼴���䡣
let transientTimer = null;
function transient(s, ms, text, holdMs) {
  if (state === 'waiting') return; // ���û�����
  transientState = s;
  transientUntil = perfNow() + ms;
  setState(s);
  clearTimeout(transientTimer);
  transientTimer = setTimeout(() => { if (lastStats) applyStats(lastStats); }, ms + 30);
  if (text) showBubble(text, holdMs || ms);
}
// �����ȼ���̬��waiting/needsinput/error���ӹ�ʱ������������̬��
// ���� talking/thinking �����¸����ս� transientUntil �����ǻ�����
function clearTransient() {
  transientUntil = 0;
  clearTimeout(transientTimer);
}

// ---------- ������ʾ��Web Audio �ϳɣ�������Ƶ�ļ��� ----------
let audioCtx = null;
function beep(freqs, dur = 0.13, type = 'sine', gain = 0.06) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    let t = audioCtx.currentTime;
    for (const f of freqs) {
      const o = audioCtx.createOscillator();
      const gnode = audioCtx.createGain();
      o.type = type;
      o.frequency.value = f;
      gnode.gain.setValueAtTime(0, t);
      gnode.gain.linearRampToValueAtTime(gain, t + 0.012);
      gnode.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(gnode);
      gnode.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur);
      t += dur * 0.92;
    }
  } catch {}
}
const SOUND = {
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
};

// ���������ɵĲʴ�
function confetti() {
  const el = curSkinEl();
  const sr = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const cx = r.left - sr.left + r.width / 2;
  const cy = r.top - sr.top + r.height * 0.35;
  const emojis = ['🎉', '✨', '⭐', '🎊', '💫'];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = emojis[i % emojis.length];
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.8; // ��������
    const dist = 45 + Math.random() * 70;
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.fontSize = 12 + Math.random() * 12 + 'px';
    s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
    s.style.animationDelay = Math.random() * 0.12 + 's';
    stage.appendChild(s);
    setTimeout(() => s.remove(), 1300);
  }
}

// whale �Ĵ��� GIF û�а�����ɫ�ʴ��������ڴ��������ڼ䲹һ��������
// CSS ˿�����뿪 whale/error �������峡������Ч��й©�� cat ����ͨ״̬��
function clearErrorRibbons() {
  clearTimeout(errorRibbonTimer);
  errorRibbonTimer = null;
  for (const node of errorRibbonNodes) node.remove();
  errorRibbonNodes.clear();
}

function errorRibbonBurst() {
  const el = curSkinEl();
  for (let i = 0; i < 14; i++) {
    const ribbon = document.createElement('span');
    ribbon.className = `confetti error-ribbon ${i % 3 === 1 ? 'ribbon-bright' : (i % 3 === 2 ? 'ribbon-deep' : '')}`;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.25;
    const dist = 56 + Math.random() * 78;
    // ���� pet ������������ stage �ϣ�͸�����л� left/right ê��ʱ��
    // �ʴ������� whale һ���ƶ����������ھɵĴ������ꡣ
    ribbon.style.left = '50%';
    ribbon.style.top = '38%';
    ribbon.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
    ribbon.style.setProperty('--dy', Math.sin(ang) * dist + 22 + 'px');
    ribbon.style.setProperty('--turn', (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 300) + 'deg');
    ribbon.style.animationDelay = Math.random() * 0.12 + 's';
    el.appendChild(ribbon);
    errorRibbonNodes.add(ribbon);
    setTimeout(() => {
      ribbon.remove();
      errorRibbonNodes.delete(ribbon);
    }, 1600);
  }
}

function syncErrorRibbons() {
  clearErrorRibbons();
  if (skin !== 'whale' || state !== 'error') return;
  errorRibbonBurst();
  errorRibbonTimer = setTimeout(syncErrorRibbons, 1750);
}

function setBubbleText(text) {
  // emoji �� ���� SVG��OctoIcons �� emoji �ַ��� SVG ֮������ȫ�滻������ʶ���ַ�ԭ��������
  if (window.OctoIcons && window.OctoIcons.hasMappedEmoji(text)) {
    window.OctoIcons.setTextWithIcons(bubbleText, text);
  } else {
    bubbleText.textContent = text;
  }
}

function clearEndingPresentation() {
  bubble.classList.remove('ending', 'collapsed', 'expanded', 'activity');
  bubbleHead.classList.add('hidden');
  bubbleStack.classList.add('hidden');
  bubbleStack.innerHTML = '';
  bubbleToggle.classList.add('hidden');
  bubbleToggle.setAttribute('aria-expanded', 'false');
  bubbleActivity.classList.add('hidden');
  bubbleActivityIcon.classList.add('hidden');
  bubbleActivityIcon.textContent = '';
  bubbleActivityText.textContent = '';
}

function showEndingActivity(text, icon = '') {
  if (bubbleMode !== 'ending' || !endingMessages.size) return false;
  bubbleActivityIcon.textContent = icon || '';
  if (!icon) {
    bubbleActivityIcon.classList.add('hidden');
  } else {
    bubbleActivityIcon.classList.remove('hidden');
  }
  bubbleActivityText.textContent = String(text || '').trim() || t('tool.default');
  bubbleActivity.classList.remove('hidden');
  // This row is deliberately persistent until the next final answer replaces
  // it. Repeated operation events therefore update one fixed-height slot instead
  // of shrinking the BrowserWindow to 340px and clipping the ending card.
  if (!askActive && !sessListOpen && !todoPopOpen && !radialOpen) fitPopup(bubble);
  return true;
}

function clearEndingActivity() {
  bubbleActivity.classList.add('hidden');
  bubbleActivityIcon.textContent = '';
  bubbleActivityText.textContent = '';
}

function endingKey(ev) {
  if (ev && ev.sessionId) return `session:${ev.sessionId}`;
  return `project:${String(ev && ev.agent || AGENT)}:${String(ev && ev.project || '')}`;
}

function endingEntries() {
  return [...endingMessages.values()].reverse();
}

function resetEndingBubbleScroll() {
  const seq = ++endingScrollSeq;
  const reset = () => {
    if (seq !== endingScrollSeq || bubbleMode !== 'ending') return;
    bubble.scrollTop = 0;
    bubbleStack.scrollTop = 0;
  };
  // Reset before and after Chromium/Electron lays out the resized transparent
  // window. A focused expand/collapse button otherwise asks the browser to
  // scroll it back into view and hides the header/newest answer again.
  reset();
  requestAnimationFrame(() => {
    reset();
    requestAnimationFrame(reset);
  });
  setTimeout(reset, 120);
}

function renderEndingBubble() {
  if (!endingMessages.size) return false;
  const entries = endingEntries();
  const latest = entries[0];
  const multiple = entries.length > 1;
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    endingMessages.clear();
    endingExpanded = false;
    hideBubble(true);
  }, 30000);
  bubbleMode = 'ending';
  bubble.classList.add('ending');
  bubble.classList.toggle('collapsed', multiple && !endingExpanded);
  bubble.classList.toggle('expanded', multiple && endingExpanded);
  bubbleHead.classList.remove('hidden');
  bubbleProject.textContent = latest.project || latest.agent || t('sess.fallbackName');
  bubbleDismiss.setAttribute('aria-label', t('bub.dismissEndings'));
  setBubbleText(`💬 ${latest.text}`);
  bubbleStack.innerHTML = '';

  if (multiple) {
    bubbleCount.textContent = t('bub.conversationCount', { count: entries.length });
    bubbleChevron.textContent = endingExpanded ? '⌃' : '⌄';
    bubbleToggle.setAttribute('aria-expanded', endingExpanded ? 'true' : 'false');
    bubbleToggle.setAttribute('aria-label', t(endingExpanded ? 'bub.collapseEndings' : 'bub.expandEndings'));
    bubbleToggle.classList.remove('hidden');
  } else {
    endingExpanded = false;
    bubbleToggle.classList.add('hidden');
    bubbleToggle.setAttribute('aria-expanded', 'false');
  }

  if (multiple && endingExpanded) {
    for (const entry of entries.slice(1)) {
      const item = document.createElement('div');
      item.className = 'bubble-ending-item';
      const project = document.createElement('span');
      project.className = 'bubble-ending-project';
      project.textContent = entry.project || entry.agent || t('sess.fallbackName');
      const text = document.createElement('span');
      text.className = 'bubble-ending-text';
      text.textContent = `💬 ${entry.text}`;
      item.appendChild(project);
      item.appendChild(text);
      bubbleStack.appendChild(item);
    }
    bubbleStack.classList.remove('hidden');
  } else {
    bubbleStack.classList.add('hidden');
  }

  // Interactive cards temporarily own the window. Keep the ending in memory
  // and restore it as soon as that surface closes.
  if (askActive || sessListOpen || todoPopOpen || radialOpen) return true;
  bubble.classList.remove('hidden');
  resetEndingBubbleScroll();
  fitPopup(bubble);
  return true;
}

function rememberEnding(ev, deferDisplay = false) {
  wakeLockUntil = Math.max(wakeLockUntil, Date.now() + 300000);
  if (typeof window.setPetWakeLock === 'function') window.setPetWakeLock(300000);
  const text = String(ev && ev.text || '').trim();
  if (!text) return false;
  const key = endingKey(ev);
  if (endingMessages.has(key)) endingMessages.delete(key);
  endingMessages.set(key, {
    key,
    sessionId: ev.sessionId || '',
    project: ev.project || '',
    agent: ev.agent || AGENT,
    text,
  });
  clearEndingActivity();
  // A newly arriving ending follows Codex's compact notification behaviour:
  // show the newest excerpt and the conversation count, not an ever-growing wall.
  endingExpanded = false;
  return deferDisplay ? true : renderEndingBubble();
}

function forgetEnding(ev) {
  const key = endingKey(ev);
  if (!endingMessages.delete(key)) return false;
  if (endingMessages.size < 2) endingExpanded = false;
  if (bubbleMode === 'ending') {
    if (endingMessages.size) renderEndingBubble();
    // The user-turn handler immediately replaces this with its acknowledgement
    // bubble. Preserve the expanded frame across that hand-off to avoid a
    // 340px collapse/expand pair and the visible anchor jump it can cause.
    else hideBubble(true, true);
  }
  return true;
}

function restoreEndingBubble() {
  if (state !== 'waiting'
      && !askActive && !sessListOpen && !todoPopOpen && !radialOpen
      && endingMessages.size) {
    renderEndingBubble();
    return true;
  }
  return false;
}

function getChampionRandomQuote() {
  const pool = (window.PET_CONFIG && window.PET_CONFIG.clickDialogues) || [];
  if (Array.isArray(pool) && pool.length > 0) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return typeof pick === 'string' ? pick : (pick.text || '');
  }
  return '�ҳϵ�׷����һ���͹��ˣ�';
}

function getDialogueLine(category, params = {}) {
  try {
    if (window.DialogueSystem && window.DialogueSystem.hasSkin(skin)) {
      const line = window.DialogueSystem.getLine(skin, category, params);
      if (line) return line;
    }
    if (skin === 'champion') {
      return getChampionRandomQuote();
    }
  } catch (err) {
    console.warn("[Dialogue] getDialogueLine failed:", err);
  }
  return null;
}

function showBubble(text, holdMs = 3200, force = false, presentation = 'transient', activityIcon = '') {
  // �������ɣ�װ�������ڼ䳹�ױ��죬����������ð���ݣ�
  if (isChampionDead()) return false;
  if (!force && (muted || radialOpen || askActive)) return false;
  if (!askActive && !sessListOpen && !todoPopOpen && !radialOpen
      && bubbleMode === 'ending' && endingMessages.size) {
    return showEndingActivity(text, activityIcon);
  }
  // ����������350ms ���ظ��ı����ط����ž���������
  const nowBubble = Date.now();
  if (lastBubbleText === text && nowBubble - lastBubbleTime < 350) {
    return false;
  }
  lastBubbleText = text;
  lastBubbleTime = nowBubble;

  bubbleMode = presentation === 'activity' ? 'activity' : 'transient';
  clearEndingPresentation();
  bubble.classList.toggle('activity', bubbleMode === 'activity');
  setBubbleText(bubbleMode === "activity" && activityIcon ? (activityIcon + " " + text) : text);
  if (presentation !== 'activity' && text) {
    // ���ı���������ǰ���ڲ��ŵ��ιؼ��������� attention ���֡����������ơ����š���˯�������� isAnimLocked Ϊ�棩��
    // ����������ʾ���֣����Բ����� playChampionTalking ��д��������֤����/���ζ����������꣡
    if (!(cc() ? cc().isAnimLocked : false) && !isChampionDead() && state !== 'error' && state !== 'sleeping' && !isFallingAsleep && sleepLevel <= 0) {
      playChampionTalking(holdMs);
    }
  }
  bubble.classList.remove('hidden');
  bubble.scrollTop = 0;
  // ���� ending ��������Ƭ���ⲿ������������ʱ�Ŷ�̬�������ڣ���ͨ����ֱ�Ӿ���չʾ���������� win.setBounds���ž���˸��
  if (bubbleMode === 'ending' || askActive || sessListOpen || todoPopOpen) {
    fitPopup(activeSizedSurface() || bubble);
  }
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(hideBubble, holdMs);
  return true;
}
function hideBubble(force = false, preserveSize = false) {
  const wasEnding = (bubbleMode === 'ending');
  if (!force && bubbleMode === 'ending' && endingMessages.size) return false;
  bubble.classList.add('hidden');
  if (bubbleMode === 'ending') clearEndingPresentation();
  else bubble.classList.remove('activity');
  bubbleMode = 'transient';
  if (!force && restoreEndingBubble()) return false;
  // ����֮ǰȷ�� ending ����Ƭ����ʱ�Żָ�ԭʼ�ߴ�
  if (!preserveSize && !askActive && !sessListOpen && !todoPopOpen && wasEnding) resetPetSize();
  return true;
}

bubbleToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (endingMessages.size < 2) return;
  // Do not let focus preservation scroll the bounded ending card back down to
  // the toggle after expansion. The newest answer must always start at line 1.
  if (typeof bubbleToggle.blur === 'function') bubbleToggle.blur();
  endingExpanded = !endingExpanded;
  renderEndingBubble();
});
bubbleDismiss.addEventListener('click', (e) => {
  e.stopPropagation();
  endingMessages.clear();
  endingExpanded = false;
  hideBubble(true);
});

bubble.addEventListener('click', (e) => {
  if (e.target.closest('#bubble-dismiss') || e.target.closest('#bubble-toggle')) return;
  if (bubbleMode === 'ending' && endingMessages && endingMessages.size > 0) {
    const entries = endingEntries();
    const targetSessionId = entries.length > 0 ? entries[0].sessionId : '';
    if (targetSessionId && window.pet && typeof window.pet.focusSession === 'function') {
      window.pet.focusSession(targetSessionId);
      endingMessages.delete(entries[0].key || targetSessionId);
      if (endingMessages.size === 0) {
        endingExpanded = false;
        hideBubble(true);
      } else {
        renderEndingBubble();
      }
      return;
    }
  }
  const nextSid = getActiveOrLatestSessionId();
  if (nextSid && window.pet && typeof window.pet.focusSession === 'function') {
    window.pet.focusSession(nextSid);
  } else if (window.pet && typeof window.pet.primaryAction === 'function') {
    window.pet.primaryAction();
  } else if (window.pet) {
    if (AGENT === 'codex' && typeof window.pet.launchCodex === 'function') {
      window.pet.launchCodex();
    } else if (AGENT === 'dsh' && typeof window.pet.launchDsh === 'function') {
      window.pet.launchDsh();
    } else if (typeof window.pet.launchClaude === 'function') {
      window.pet.launchClaude();
    }
  }
  if (bubbleMode !== 'ending') {
    hideBubble();
  }
});

function scheduleBlink() {
  blinkTimer = setTimeout(() => {
    // �����ع��ޱ��� class գ��λ��cat �� GIF �Դ���Ч��mascot ֮ǰ��
    // ��գ�ۡ��ǰ����������������ɱ��۵�ͼ 150ms���۸��ǻ������ϣ����Ƴ�����
    if (skin === 'pixel' && state !== 'sleeping' && state !== 'waiting') {
      pixel.classList.add('blink');
      setTimeout(() => pixel.classList.remove('blink'), 160);
    }
    scheduleBlink();
  }, 2500 + Math.random() * 4000);
}
scheduleBlink();

// ����С����������ʱż���������� / ��һ�£�����������
function scheduleIdleAction() {
  setTimeout(() => {
    if (state === 'idle' && !radialOpen && !muted) {
      // ֻ�����ع����� peek ������mascot �� glance CSS ָ���Ѳ����ڵ�
      // #teyes��img Ƥ��û�� SVG �۾��ڵ㣩��cat �� GIF �Դ���Ч��
      if (skin === 'pixel') {
        pixel.classList.add('peek');
        setTimeout(() => pixel.classList.remove('peek'), 620);
      }
      if (bubble.classList.contains('hidden') && !askActive && !sessListOpen && !todoPopOpen) {
        if (Math.random() < 0.25) {
          const idleLine = getDialogueLine('idle');
          if (idleLine) showBubble(idleLine, 4000);
        }
      }
    }
    scheduleIdleAction();
  }, 7000 + Math.random() * 7000);
}
scheduleIdleAction();

const curSkinEl = () => (skin === 'pixel' ? pixel : skin === 'champion' ? championSpine : isMeme() ? cat : mascot);

window.pet.onTravel((event) => {
  if (!event) return;
  if (event.state) travelData = event.state;
  if (
    event.trip &&
    event.type === 'completed' &&
    event.trip.status === 'completed' &&
    event.trip.result
  ) {
    travelPostcards = [
      event.trip,
      ...travelPostcards.filter((trip) => trip && trip.id !== event.trip.id),
    ];
    selectedPostcardId = event.trip.id;
    selectedPostcardStop = 0;
    renderedPostcardKey = '';
  }
  if (sessListOpen && !slTravelView.classList.contains('hidden')) renderTravelPage();
  const trip = event.trip;
  if (!travelBelongsToThisPet(trip)) return;
  if (event.type === 'started') {
    clearTransient();
    setState('roam');
    showBubble(t(trip.mode === 'wander' ? 'travel.bubWanderStart' : 'travel.bubStart'), 3600, true);
  } else if (event.type === 'completed') {
    transient('happy', 2600, t('travel.bubDone'), 4200);
    confetti();
    SOUND.bigDone();
  } else if (event.type === 'cancelled') {
    showBubble(t('travel.bubCancel'), 3000, true);
    if (lastStats) applyStats(lastStats);
  } else if (event.type === 'failed') {
    transient('error', 2800, t('travel.bubFailed'), 4200);
    SOUND.error();
  }
});

// ---------- �¼� ----------
window.pet.onEvent((ev) => {
  // �����ڴ�����/����ʱ���µĴ�������ֻ���Ľ�����(��������)�����ද��/�ʴ�/����/״̬�仯һ�ɲ�����
  if (isInteracting()) {
    if ((ev.kind === 'waiting' || ev.kind === 'needsinput') && ev.choice) enqueueChoice(ev.choice);
    if (ev.kind === 'say') rememberEnding(ev, true);
    return;
  }
  // �����еĳ��ﲻ��������ͨ session �Ķ���˲�����ع�λ��������Ҫ�û�
  // ������ waiting / needsinput / error �Ի�ͨ���������ȼ��ӹܡ�
  if (
    travelBelongsToThisPet(travelData && travelData.active) &&
    ['operation', 'say', 'user-turn', 'turn-done', 'big-done', 'greet', 'longcmd'].includes(ev.kind)
  ) {
    if (ev.kind === 'say') rememberEnding(ev, true);
    return;
  }
  // ���������·�ʱ������������ user-turn / operation �������� Prompt �Լ�
  // �����ġ������������ڼ�ʮ�����ڰ����úõġ�����䤱���Ӧ�Ըǳ� thinking /
  // working����������Ȩ�����ظ��ȸ����ȼ��¼��Լ�����͸���ӹܡ�
  if (memeLayoutActive && ['user-turn', 'operation', 'say', 'turn-done', 'big-done', 'greet', 'longcmd'].includes(ev.kind)) {
    if (ev.kind === 'say') rememberEnding(ev, true);
    return;
  }
  // �Ӷ���һ�β��ɱ���ͨ�Ự�¼��岥�������ݳ��������������е� Codex
  // operation ���ѡ��������㡱���Ӷ���������˲���ǵ���
  if (lootPerformanceActive
      && ['user-turn', 'operation', 'say', 'turn-done', 'big-done', 'greet', 'longcmd'].includes(ev.kind)) {
    if (ev.kind === 'say') rememberEnding(ev, true);
    return;
  }
  switch (ev.kind) {
    case 'operation': {
      if (skin === 'champion' && isChampionDead()) break; // װ���ڼ䵱ǰ����ȫ���Թ�
      // �����ȼ���̬������Ȩ/�Ȼظ�/����/���������������¼������� working����
      // ֮ǰ error �ڼ������Ự�ɻ��ᵼ�� working?error ������˸��
      const hold = state === 'waiting' || state === 'needsinput' || state === 'error' || state === 'sweeping';
      // ���յ����񡱲����� thinking ֻ�ǵȴ��׸������Ĺ���̬����ʵ����һ��ʼ��Ӧ
      // �����е� working����ף/˵��/���������� transient ���������š�
      const startingWork = transientState === 'thinking' && perfNow() < transientUntil;
      if (!hold && (startingWork || perfNow() >= transientUntil)) {
        if (startingWork) clearTransient();
        // Subagent operations own a distinct expression. Previously every
        // operation forced working even when the backend had correctly emitted
        // juggling, so the dedicated GIF was immediately hidden.
        setState(ev.visualState === 'juggling' ? 'juggling' : 'working');
        playAction(ev.tool, ev.icon);
      }
      showBubble(ev.detail, 3200, false, 'activity', ev.icon || '');
      break;
    }
    case 'say':
      if (skin === 'champion' && isChampionDead()) break; // װ���ڼ䲻����
      if (ev.text && ev.text.length > 2) {
        const dur = Math.min(6000, Math.max(2200, ev.text.length * 80));
        const waitingForUser = state === 'waiting';
        rememberEnding(ev, waitingForUser);
        // A different conversation may finish while the global pet is waiting
        // for permission. Retain that ending, but do not cover the user action.
        if (waitingForUser) break;
        // Stop ��ͬ������ turn-done(happy) + say(talking)������ף�����꣬
        // talking ���� happy �������Ӱ���ending ������������פ��
        if (transientState === 'happy' && perfNow() < transientUntil) {
          const token = ++sayToken;
          setTimeout(() => {
            if (token === sayToken && state !== 'waiting') transient(ev.emotion || 'talking', dur);
          }, Math.max(0, transientUntil - perfNow()));
        } else if (ev.emotion) {
          // Claude �Ļ�����������sorry/puzzled/excited���� ���ݱ������� talking
          transient(ev.emotion, 2800);
        } else {
          transient('talking', dur);
        }
      }
      break;
    case 'user-turn':
      const tCfg = (window.PET_CONFIG && window.PET_CONFIG.tokenMilestones) || {}; if (tCfg.mode === 'round') { resetRoundTokenMilestone(); }
      // Starting the next turn acknowledges only this conversation's previous
      // ending. Other completed conversations remain grouped in the inbox.
      forgetEnding(ev);
      // A live SessionStart greet must get its short entrance before the task's
      // immediately-following TaskStarted/UserMessage rows take over.
      if (transientState === 'greet' && perfNow() < transientUntil) break;
      // ������������������loved/sad/excited���� ���㼴ʱ��Ӧ����������ǰһ���� thinking
      if (ev.emotion && state !== 'waiting') {
        const tip = ev.emotion === 'loved' ? t('bub.loved') : ev.emotion === 'sad' ? t('bub.sad') : t('bub.ack');
        transient(ev.emotion, 2800, tip, 2600);
      } else {
        // ���Ựʱ�ۺ��� working > thinking��ֱ�� setState �����¸����ձ��ǵ�
        // ��ֻ�� ~150ms������ transient ��֤�����ύ���񡹵�˼����������ͣ��һ�ᡣ
        if (state !== 'waiting') transient('thinking', 3500);
        const taskMsg = getDialogueLine('newTask') || t('bub.newTask');
        showBubble(taskMsg, 2600);
      }
      break;
    case 'turn-done': {
      if (skin === 'champion') {
        if (isChampionDead()) {
          reviveFromRageDeath('task-completed');
        } else {
          playWorkFinishedCelebration();
        }
      }
      const doneMsg = getDialogueLine('roundDone') || t('bub.roundDone');
      transient('happy', 1800, doneMsg, 3400);
      SOUND.done();
      break;
    }
    case 'big-done': {
      if (skin === 'champion') {
        if (isChampionDead()) {
          reviveFromRageDeath('big-done');
        } else {
          playWorkFinishedCelebration();
        }
      }
      const bigMsg = getDialogueLine('bigDone', { ops: ev.ops || '' }) || t('bub.bigDone', { ops: ev.ops || '' });
      transient('happy', 2200, bigMsg, 3800);
      confetti();
      SOUND.bigDone();
      break;
    }
    case 'error': {
      const errMsg = getDialogueLine('error') || (ev.text || t('bub.error'));
      transient('error', 2600, errMsg, 3000);
      SOUND.error();
      break;
    }
    case 'waiting':
      clearTransient(); // ������ talking/thinking ����̬���øǹ�����Ȩ
      setState('waiting');
      SOUND.waiting();
      if (ev.choice && ((ev.choice.options && ev.choice.options.length) || ev.choice.allowInput)) {
        enqueueChoice(ev.choice); // ֱ�ӵ���ѡ��/����
      } else {
        const waitMsg = getDialogueLine('waitYou', { project: ev.project || '', wait: waitPhrase(ev.reason) }) || t('bub.waitYou', { project: ev.project || '', wait: waitPhrase(ev.reason) });
        showBubble(waitMsg, 6000);
      }
      break;
    case 'needsinput':
      // Claude ��ĩβ�ʡ�Ҫ��Ҫ������֮�࣬�����ظ� �� �Ƶ� + ���������ϼ���/�ظ�
      if (state !== 'waiting') { clearTransient(); setState('needsinput'); }
      SOUND.done();
      if (ev.choice && ((ev.choice.options && ev.choice.options.length) || ev.choice.allowInput)) {
        enqueueChoice(ev.choice);
      } else {
        const replyMsg = getDialogueLine('needReply', { project: ev.project || '' }) || t('bub.needReply', { project: ev.project || '' });
        showBubble(replyMsg, 6000);
      }
      break;
    case 'greet': {
      const greetMsg = getDialogueLine('greet', { project: ev.project || '' }) || t('bub.greet', { project: ev.project || '' });
      transient('greet', 2000, greetMsg, 2600);
      SOUND.greet();
      break;
    }
    case 'longcmd': {
      if (state !== 'waiting') {
        const slowMsg = getDialogueLine('slowCmd') || t('bub.slowCmd');
        showBubble(slowMsg, 3000);
      }
      break;
    }
    case 'territory':
      // ����ģʽ(main �� territory ����):���ֱ������� �� �߹�ȥ������Ļ���ϡ�
      // ȫ�̸����ֳ�����̬,������λ������������,����ֻ��������/����/��Ч��
      switch (ev.phase) {
        case 'spotted':
          transient('puzzled', 2400, t('terr.spotted', { rival: ev.rival || t('terr.unknownRival') }), 2600);
          SOUND.waiting();
          break;
        case 'march':
          // �Ƽ��ʮ����,������ʱ�޵Ķ�־����,victory/defeat ������Ȼ�ӹ�
          transient('excited', 16000, t('terr.shove'), 3200);
          break;
        case 'victory':
          transient('happy', 2800, t('terr.won'), 3400);
          confetti();
          SOUND.bigDone();
          break;
        case 'defeat':
          transient('sad', 3000, t('terr.stuck', { rival: ev.rival || t('terr.itPronoun') }), 3200);
          SOUND.error();
          break;
        case 'partial':
          transient('excited', 3200, t('terr.edge', { rival: ev.rival || t('terr.itPronoun') }), 3600);
          SOUND.done();
          break;
        case 'ontop':
          // èצ���϶���:���ֱ�����������,���ڲ㼶�ѱ�������̧������
          transient('excited', 2600, t('terr.onTop', { rival: ev.rival || t('terr.intruder') }), 3000);
          SOUND.greet();
          break;
        case 'noperm':
          showBubble(t('terr.noPerm'), 7000);
          break;
        case 'granted':
          // �û��������ﹴ�ϡ��������ܡ�����������ѯ��λ���Զ�����Ѳ�ӡ���
          // ������ȷ�ĳɹ��������պ�"�㿪���á���Ȩ������"��������
          transient('happy', 2800, t('terr.granted'), 3400);
          SOUND.greet();
          break;
        case 'searching':
          showBubble(t('terr.scanning'), 2400);
          break;
        case 'clear':
          showBubble(t('terr.clear'), 2600);
          break;
        case 'busy':
          showBubble(t('terr.busy'), 2600);
          break;
        case 'blocked':
          // ����/�˵������տ�ʱû������ִ�д���ɨ�裬�����󱨡����̰�������
          showBubble(t('terr.deferred'), 2800);
          break;
        case 'abort':
          // ��;����(�û�����/��������):��Ĭ�յ� march �ĳ���־����,
          // ���̻��䵽��ʵ�ۺ�̬,��ð���ݴ������¡�
          clearTransient();
          if (lastStats) applyStats(lastStats);
          break;
      }
      break;
    case 'loot':
      switch (ev.phase) {
        case 'searching':
          beginLootPerformance();
          lootTargetClosed = false;
          showBubble(t('loot.searching'), 2600);
          break;
        case 'approach':
          transient('excited', 12000, t('loot.approach'), 3000);
          SOUND.greet();
          break;
        case 'taunt':
          transient('excited', 12000, t('loot.taunt'), 2200);
          break;
        case 'captureStart':
          startLootCaptureVisual(ev.direction);
          startLootCapture(ev.available);
          break;
        case 'sessionCaptured':
          appendLootSession(ev.session);
          break;
        case 'captureWaiting':
          markLootCaptureWaiting();
          break;
        case 'ready':
          revealLootReady(ev.count);
          break;
        case 'kick':
          startLootKick(ev.direction);
          setLootBanner('loot.kicking');
          showBubble(t('loot.kicking'), 2400);
          break;
        case 'push':
          setLootBanner('loot.pushing');
          showBubble(t('loot.pushing'), 3000);
          break;
        case 'targetClosed':
          // ��ȷ�رն����Ѿ��ɹ������������߻� GIF�����е�����ս����
          // ���� closed �Եȸ�ɨȷ�ϣ�����������ǰ��ף�ɹ���
          lootTargetClosed = true;
          startLootLookout(ev.direction, 3600);
          setLootBanner('loot.targetClosed');
          break;
        case 'closed':
          if (!lootTargetClosed) startLootLookout(ev.direction, 3600);
          finishLootCapture(true);
          transient('happy', 2400, t('loot.closed'), 2800);
          confetti();
          SOUND.bigDone();
          endLootPerformance(1600);
          break;
        case 'notFound':
          stopLootActionVisual();
          showBubble(t('loot.notFound'), 3600);
          SOUND.error();
          endLootPerformance(3600);
          break;
        case 'pushFailed':
          stopLootActionVisual();
          finishLootCapture(false);
          transient('sad', 3200, t('loot.pushFailed'), 3600);
          SOUND.error();
          endLootPerformance(3600);
          break;
        case 'closeFailed':
          stopLootActionVisual();
          finishLootCapture(false);
          transient('puzzled', 3600, t('loot.closeFailed'), 4200);
          SOUND.error();
          endLootPerformance(4200);
          break;
        case 'failed':
          stopLootActionVisual();
          finishLootCapture(false);
          transient('sad', 3000, t('loot.failed'), 3400);
          SOUND.error();
          endLootPerformance(3400);
          break;
        case 'busy':
          showBubble(t('loot.busy'), 2800);
          endLootPerformance(2800);
          break;
        case 'blocked':
          showBubble(t('loot.blocked'), 3200);
          endLootPerformance(3200);
          break;
        case 'abort':
          stopLootActionVisual();
          finishLootCapture(false);
          clearTransient();
          endLootPerformance();
          if (lastStats) applyStats(lastStats);
          break;
      }
      break;
  }
});

function perfNow() {
  return Date.now();
}

// ---------- ͳ�� + �ۺ�״̬ ----------
let lastStats = null; // ����һ�ο��գ�transient ����ʱ�������������ۺ�̬
let sayToken = 0;     // say �Ӱ� happy ���Ŷ����ƣ����¼����Ͼ��Ŷӣ�
function compactTokens(value) {
  const n = Number(value) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return String(Math.round(n));
}
function applyStats(s) {
  if (!s) return;
  lastStats = s;
  if (s.travel) travelData = s.travel;
  if (s.billingAvailable === false || AGENT === 'dsh') {
    chipCost.textContent = AGENT === 'dsh' ? 'DeepSeek Harness' : '��';
    chipWindow.textContent = '';
    chipWindow.title = '';
    chipSep.classList.add('hidden');
    chipWindow.classList.add('hidden');
  } else if (AGENT === 'codex') {
    const today = (s.codexUsage && s.codexUsage.today) || s.today || {};
    const tokens = Number(today.tokens || (s.today && s.today.tokens) || 0);
    if (typeof checkTokenMilestones === 'function') {
      checkTokenMilestones(tokens);
    }
    const cost = Number(today.cost != null ? today.cost : ((s.today && s.today.cost) || 0));
    chipCost.textContent = compactTokens(tokens) + ' tok';
    chipWindow.textContent = '$' + cost.toFixed(3) + ' API-eq';
    chipWindow.title = (typeof t === 'function' && t('chip.codexTitle')) || 'Codex API 等价';
    chipSep.classList.remove('hidden');
    chipWindow.classList.remove('hidden');
  } else {
    chipCost.textContent = '$' + (s.today.cost || 0).toFixed(3);
    chipWindow.textContent = t('chip.lifetime', { cost: (s.lifetime.cost || 0).toFixed(3) });
    chipSep.classList.remove('hidden');
    chipWindow.classList.remove('hidden');
  }
  lastWaiting = (s.waitingCount || 0) + (s.needsinputCount || 0); // �������ձ꺬�������ظ���
  lastBgZombie = (s.bg && s.bg.zombie) || 0;
  if (radialOpen) updateRadialBadge();
  renderSessions(s.sessions || []);
  updateNotepad(s); // ���±����ж��嵥 + ����
  if (sessListOpen) {
    if (!slTravelView.classList.contains('hidden')) renderTravelPage();
    // Sub-pages own their DOM while open. A stats push must not rebuild the
    // hidden session page or resize the window underneath the current page.
    // Loot is likewise driven only by its explicit capture events.
    else if (!memeTarget && !takeoverTarget && !lootCapture) {
      renderSessList();
      fitPopup(sesslist);
    }
  } // HUD ����ʱ������ˢ�²��ض���

  // ѡ�����壺�������ؽ����У����������ڡ�������Ŀ����©�¼�/����ʱ���ڵȴ���
  refreshAsk(s);

  if (DEBUG_STATE) { setState(DEBUG_STATE); return; }

  // �����ڿ�����/���� �� ���ٸ�С����״̬(��������ȥ������)��������������
  if (isInteracting()) return;

  if (skin === 'champion' && isChampionDead()) {
    // �������ɣ�װ�������ڼ䣬��ǰ���ι���ȫ���Թ������ж��������ֵ�����̬
    return;
  }

  // �ۺ����ӣ����� STATES.md �����ȼ�����
  //   waiting > ����̬ > error(8) > needsinput/notification(7) > sweeping(6)
  //   > juggling(4) > working(3) > thinking(2) > idle(1) > sleeping(0)
  // ֮ǰ working ���� needsinput ǰ�棬���Ựʱ�������ظ������ɻ�̬���׸�ס��
  const allSessions = s.sessions || [];
  const activeList = allSessions.filter(isVisibleSession);
  const hasWorkingSession = allSessions.some((x) => x && (x.state === 'working' || x.state === 'juggling' || x.state === 'running'));
  const isGlobalWorking = hasWorkingSession || (s.workingCount > 0) || (s.jugglingCount > 0);
  const isGlobalJuggling = (s.jugglingCount > 0) || allSessions.some((x) => x && x.state === 'juggling');

  // 睡眠保护
  const isCurrentlySleeping = (state === 'sleeping' || isFallingAsleep || (skin === 'champion' && cc() && (cc().sleepLevel > 0 || cc().isFallingAsleep)));
  if (isCurrentlySleeping && !isGlobalWorking && !isGlobalJuggling && s.waitingCount <= 0 && s.errorCount <= 0 && s.needsinputCount <= 0 && s.sweepingCount <= 0 && s.workingCount <= 0 && s.thinkingCount <= 0) {
    return;
  }

  if (isGlobalWorking) {
    setState(isGlobalJuggling ? 'juggling' : 'working');
  } else if (s.waitingCount > 0) {
    setState('waiting');
  } else if (perfNow() < transientUntil) {
    setState(transientState);
  } else if (s.errorCount > 0) {
    setState('error'); // �лỰ���� API ���� �� ̱����ֱ���ûỰ�ָ��� oneshot ˥��
  } else if (s.needsinputCount > 0) {
    setState('needsinput');
  } else if (travelBelongsToThisPet(travelData && travelData.active)) {
    setState('roam');
  } else if (s.sweepingCount > 0) {
    setState('sweeping');
  } else if (s.jugglingCount > 0) {
    setState('juggling');
  } else if (s.workingCount > 0) {
    setState('working');
  } else if (s.thinkingCount > 0) {
    setState('thinking');
  } else if (s.loafingCount > 0) {
    setState('loafing'); // ���߼�϶����һ����������һ�� �� ����
  } else if (s.idleMs != null && s.idleMs > IDLE_SLEEP_MS) {
    if (Date.now() < wakeLockUntil || (endingMessages && endingMessages.size > 0) || bubbleMode === 'ending') {
      setState('idle');
    } else {
      setState('sleeping');
    }
  } else {
    setState('idle');
  }
  if (state !== 'waiting' && bubble.classList.contains('hidden')) restoreEndingBubble();
}
window.pet.onStats(applyStats);

function renderSessions(sessions) {
  // ���Ự�б� HUD ��ȫ������ͬһ����(�� headless/��˯��)��ͬһ��ɫ��ͬһ������
  const list = (sessions || []).filter(isVisibleSession).sort((a, b) => {
    const pinA = pinnedSessionIds.includes(sessionKey(a)) ? 0 : 1;
    const pinB = pinnedSessionIds.includes(sessionKey(b)) ? 0 : 1;
    if (pinA !== pinB) return pinA - pinB;
    const pa = SESS_SORT[a.state] != null ? SESS_SORT[a.state] : 3;
    const pb = SESS_SORT[b.state] != null ? SESS_SORT[b.state] : 3;
    return pa !== pb ? pa - pb : (a.idleMs || 0) - (b.idleMs || 0);
  });
  const renderSig = JSON.stringify(list.map((s) => ({
    key: sessionKey(s),
    project: s.project,
    state: s.state,
    reason: s.reason,
    dot: sessionDotClass(s),
  })));
  if (renderSig === lastSessionDotsRenderSig) {
    if (radialOpen) updateRadialBadge();
    return false;
  }
  lastSessionDotsRenderSig = renderSig;
  sessionsEl.innerHTML = '';
  for (const s of list) {
    const d = document.createElement('div');
    d.className = 'sess-dot ' + sessionDotClass(s);
    const label = s.state === 'waiting' ? waitPhrase(s.reason) : (sessMeta(s.state) || s.state);
    d.title = `${s.project} �� ${label}`;
    sessionsEl.appendChild(d);
  }
  // �˵�����ʱͬ�������������Ǳ�
  if (radialOpen) updateRadialBadge();
  return true;
}

window.pet.onConfig((cfg) => {
  if (!cfg) return;
  muted = !!cfg.muted;
  territorySupported = !!cfg.territorySupported;
  lootSupported = !!cfg.lootSupported;
  if (cfg.lang) applyLang(cfg.lang);
  if (cfg.skin) applySkin(cfg.skin);
  pinnedSessionIds = Array.isArray(cfg.pinnedSessions) ? cfg.pinnedSessions.slice() : [];
  archivedSessionIds = Array.isArray(cfg.archivedSessions) ? cfg.archivedSessions.slice() : [];
  lootKeptSessions = Array.isArray(cfg.lootCapturedSessions) ? cfg.lootCapturedSessions.slice() : [];
  scheduleLootKeptExpiry();
  if (sessListOpen && !memeTarget && !takeoverTarget && !lootCapture) renderSessList();
});

// Static markup carries its Chinese text inline (so the window is never blank
// before the first config push); data-i18n rewrites it once the language is
// known and again on every switch.
function applyStaticI18n() {
  document.documentElement.lang = window.OctoI18n.getLang();
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of document.querySelectorAll('[data-i18n-ph]')) {
    el.placeholder = t(el.dataset.i18nPh);
    delete el.dataset.ph; // drop the cached original so the warn/restore pair re-seeds
  }
}

function applyLang(next) {
  if (next === window.OctoI18n.getLang()) return;
  window.OctoI18n.setLang(next);
  applyStaticI18n();
  // refreshAsk() skips a re-render while the queue signature is unchanged; drop
  // the signature so an open card is relabelled instead of sitting in the old
  // language until its content happens to change.
  lastAskSig = '';
  lastTodoPopRenderSig = '';
  lastSessListRenderSig = '';
  lastSessionDotsRenderSig = '';
  lastTravelMailboxRenderSig = '';
  lastTravelHistoryRenderSig = '';
  lastTravelTemplatesRenderSig = '';
  // Live views rebuild from the state we already hold; everything else refreshes
  // on the stats push the main process fires right after the switch.
  if (sessListOpen) {
    if (memeTarget) openMemePage(memeTarget);
    else if (takeoverTarget) openTakeoverPage(takeoverTarget);
    else renderSessList();
  }
  if (todoPopOpen) renderTodoPop();
  if (radialOpen) buildRadial();
  if (lastStats) applyStats(lastStats);
}

function applySkin(s) {
  // [LOCK_CHAMPION]
  s = 'champion';
  skin = ['pixel', 'mascot', 'champion', ...Object.keys(MEME_PACKS)].includes(s) ? s : 'mascot';
  document.body.classList.toggle('skin-pixel', skin === 'pixel');
  document.body.classList.toggle('skin-mascot', skin === 'mascot');
  document.body.classList.toggle('skin-cat', isMeme());
  document.body.classList.toggle('skin-whale', skin === 'whale');
    document.body.classList.toggle('skin-champion', skin === 'champion');
  document.body.classList.toggle('skin-deepseek-maid', skin === 'deepseek-maid');
  if (skin === 'mascot') updateMascotEyes(state);
  if (isMeme()) updateCat(state);
  if (skin === 'champion') updateChampionSpine(state);
  if (window.DialogueSystem && typeof window.DialogueSystem.loadSkinDialogue === 'function') {
    window.DialogueSystem.loadSkinDialogue(skin);
  }
  syncErrorRibbons();
  requestAnimationFrame(reportPetVisualBounds);
}

function reportPetVisualBounds() {
  const el = curSkinEl();
  if (!el) return;
  const r = el.getBoundingClientRect();
  try { window.pet.petVisualBounds({ x: r.left, y: r.top, width: r.width, height: r.height }); } catch {}
}

// ====================================================================
// �϶� + �������̰�=���ݲ˵� / �϶�=�ƶ����ڣ�
// ====================================================================
let g = null; // ��ǰ���ƣ�ͬ����������֤���ٵ���Ҳ��ʶ����
function clearDragGesture(gesture, settle = true, reason = 'clear') {
  if (!gesture || g !== gesture) return false;
  traceDrag('gesture-end', {
    dragId: gesture.traceId, reason, moved: gesture.moved, frame: gesture.frame,
    settle: !!settle, pointerOrigin: { x: gesture.sx, y: gesture.sy },
    windowOrigin: gesture.win && { x: gesture.win[0], y: gesture.win[1] },
    edgeLayout: { ...edgeLayout }, mouseIgnoring,
  });
  // Clear the global owner before releasePointerCapture(): Chromium may emit
  // lostpointercapture synchronously, and that event must not finish a newer
  // gesture or run the cleanup twice.
  const didActuallyMove = !!(gesture && gesture.moved);
  g = null;
  // �����޸���ֻ����ȷʵ��������קλ�Ƶ������£���������ʱ���ŷ�����β����������������������ק������
  if (skin === 'champion' && didActuallyMove) {
    playChampionDragAnim(false);
  }
  try { gesture.el.releasePointerCapture(gesture.pid); } catch {}
  gesture.el.classList.remove('dragging');
  if (settle) setTimeout(settleEdgeLayout, 0);
  return true;
}

function cancelActiveDrag(settle = true, reason = 'cancel-active') {
  const gesture = g;
  if (gesture) clearDragGesture(gesture, settle, reason);
}

function attachDrag(el) {
  el.addEventListener('pointerdown', (e) => {
    if (typeof stopChampionWander === 'function') stopChampionWander();
    if (e.button !== 0) {
      traceDrag('pointerdown-ignored', { reason: 'non-primary-button', button: e.button, buttons: e.buttons, pointerId: e.pointerId });
      return;
    }
    // A missed pointerup/lost-capture must never leak ownership into the next
    // press. This is especially important for a moving transparent window.
    cancelActiveDrag(false, 'superseded-by-pointerdown');
    try { el.setPointerCapture(e.pointerId); } catch {}
    el.classList.add('dragging');
    // BrowserWindow screen coordinates are already available synchronously in
    // the renderer. Starting with null made quick drags wait for an IPC round
    // trip, then apply the accumulated delta all at once �� the visible one-frame
    // kick reported by users. The IPC read remains a pre-move calibration only.
    const liveOrigin = Number.isFinite(window.screenX) && Number.isFinite(window.screenY)
      ? [window.screenX, window.screenY]
      : null;
    const gesture = {
      el, pid: e.pointerId, sx: e.screenX, sy: e.screenY,
      moved: false, win: liveOrigin,
      traceId: `${Date.now().toString(36)}-${++dragTraceCounter}`,
      frame: 0,
    };
    g = gesture;
    traceDrag('pointerdown', {
      dragId: gesture.traceId,
      element: el.id || el.className || el.tagName,
      pointer: { id: e.pointerId, button: e.button, buttons: e.buttons, x: e.screenX, y: e.screenY },
      client: { x: e.clientX, y: e.clientY },
      liveOrigin: liveOrigin && { x: liveOrigin[0], y: liveOrigin[1] },
      window: { x: window.screenX, y: window.screenY, width: window.innerWidth, height: window.innerHeight },
      petRect: dragRect(el.getBoundingClientRect()),
      edgeLayout: { ...edgeLayout },
      mouseIgnoring,
    });
    window.pet.getWinPos().then(([wx, wy]) => {
      // IPC from an earlier click may resolve after a new pointerdown. Binding
      // that stale window origin to the new gesture produces a large jump.
      // It must also not overwrite the live origin after this gesture has begun
      // moving, or its delayed reply reintroduces the same kick one frame later.
      const accepted = g === gesture && (!gesture.moved || !gesture.win)
        && Number.isFinite(wx) && Number.isFinite(wy);
      traceDrag('origin-resolved', {
        dragId: gesture.traceId, resolved: { x: wx, y: wy }, accepted,
        stillActive: g === gesture, moved: gesture.moved, alreadyHadOrigin: !!gesture.win,
      });
      if (accepted
        && Number.isFinite(wx) && Number.isFinite(wy)) {
        gesture.win = [wx, wy];
      }
    }).catch((error) => traceDrag('origin-error', { dragId: gesture.traceId, error: error && (error.message || String(error)) }));
  });
  el.addEventListener('pointermove', (e) => {
    const gesture = g;
    if (!gesture) return;
    if (e.pointerId != null && e.pointerId !== gesture.pid) {
      traceDrag('pointermove-ignored', { dragId: gesture.traceId, reason: 'pointer-id-mismatch', expected: gesture.pid, actual: e.pointerId });
      return;
    }
    // Transparent BrowserWindows can lose pointerup while they move. A later
    // hover has buttons=0; treat it as stale-capture cleanup, never as a drag.
    if (Number.isFinite(e.buttons) && (e.buttons & 1) === 0) {
      clearDragGesture(gesture, true, 'buttons-released-during-move');
      return;
    }
    const dx = e.screenX - gesture.sx;
    const dy = e.screenY - gesture.sy;
    if (!gesture.moved && Math.abs(dx) + Math.abs(dy) > 4) {
      gesture.moved = true;
      if (skin === 'champion') playChampionDragAnim(true);
      if (Math.random() < 0.5) {
        const dragMsg = getDialogueLine('drag');
        if (dragMsg) showBubble(dragMsg, 2200);
      }
      traceDrag('drag-threshold-crossed', {
        dragId: gesture.traceId, delta: { x: dx, y: dy },
        pointer: { x: e.screenX, y: e.screenY, buttons: e.buttons },
        windowOrigin: gesture.win && { x: gesture.win[0], y: gesture.win[1] },
      });
    }
    if (gesture.moved && gesture.win) {
      if (radialOpen) closeRadial();
      movePetDuringDrag(gesture, e, gesture.win[0] + dx, gesture.win[1] + dy);
    } else if (gesture.moved) {
      traceDrag('pointermove-blocked', { dragId: gesture.traceId, reason: 'no-window-origin', delta: { x: dx, y: dy } });
    }
  });
  el.addEventListener('pointerup', (e) => {
    if (e.button !== 0) return;
    const gesture = g;
    if (!gesture || (e.pointerId != null && e.pointerId !== gesture.pid)) return;
    const wasMove = gesture.moved;
    if (!clearDragGesture(gesture, wasMove, 'pointerup')) return;
    if (wasMove) {
      // clearDragGesture schedules the final top/bottom or left/right anchor
      // exchange after the last setBounds has landed.
    } else {
      // �������彻���������鶯������/��ǰվ���л�/˵����������ռ�˵���
      if (skin === 'champion' && (cc() ? cc().pet : null) && (cc() ? cc().isSpineReady : false)) {
        const nowClick = Date.now();
        const isDouble = (nowClick - lastLeftClickTime < 320);
        lastLeftClickTime = nowClick;
        if (isDouble) {
          handleChampionBodyLeftDoubleClick(el);
        } else {
          handleChampionBodyLeftClick(el);
        }
      } else {
        if (typeof window.onPetBodyClick === 'function') {
          try { window.onPetBodyClick(el, state); } catch (err) { console.error(err); }
        }
        if (window.PET_CONFIG && window.PET_CONFIG.allowBodyClickToOpenMenu) {
          if (radialOpen) closeRadial();
          else toggleSessList();
        }
      }
    }
  });
  el.addEventListener('pointercancel', (e) => {
    const gesture = g;
    if (!gesture || (e.pointerId != null && e.pointerId !== gesture.pid)) return;
    clearDragGesture(gesture, true, 'pointercancel');
  });
  el.addEventListener('lostpointercapture', (e) => {
    const gesture = g;
    if (!gesture || (e.pointerId != null && e.pointerId !== gesture.pid)) return;
    clearDragGesture(gesture, true, 'lostpointercapture');
  });
  // �Ҽ� = С���尤�����飨��С������Ϊ���ݲ˵���
  el.addEventListener('contextmenu', (e) => {
    if (typeof stopChampionWander === 'function') stopChampionWander();
    e.preventDefault();
    e.stopPropagation();
    if (skin === 'champion') {
      handleChampionBodyRightClick(el);
      return;
    }
    if (typeof window.onPetBodyContextMenu === 'function') {
      try { window.onPetBodyContextMenu(el, state); } catch (err) { console.error(err); }
    }
    if (window.PET_CONFIG && window.PET_CONFIG.allowBodyClickToOpenMenu) {
      toggleRadial();
    } else {
      showBubble('?? ��ʾ�������·����ƴ򿪲˵����Ự', 2500, true);
    }
  });
}
stateEls.forEach(attachDrag);
window.addEventListener('blur', () => cancelActiveDrag(true, 'window-blur'));

// ��Ƭ��ť��Submit/Next��Back��Go to Terminal��Other ����
askSubmit.addEventListener('click', () => { const c = askQueue[askIdx]; if (c && c.kind === 'ask') elicNextOrSubmit(c); });
askBack.addEventListener('click', () => { const c = askQueue[askIdx]; if (c && c.kind === 'ask') elicBack(c); });
askTerm.addEventListener('click', () => { const c = askQueue[askIdx]; if (c) gotoSession(c); });
askText.addEventListener('input', () => updateSubmitEnabled());
// �Զ��������ﰴ�س�ֱ�ӷ��ͣ��� elicitation���������ݲ�������ʾ��������
askText.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const c = askQueue[askIdx];
  if (!c || !elic) return;
  if (!(askText.value || '').trim()) { warnEmptyInput(); return; }
  if (askSubmit.classList.contains('disabled')) { warnEmptyInput(); return; }
  elicNextOrSubmit(c);
});
// ������������ = �����У����� isInteracting ������ѯ��
askEl.addEventListener('pointerenter', () => { askHover = true; });
askEl.addEventListener('pointerleave', () => { askHover = false; });

// ���±���������/�� �ж��嵥����
notepad.addEventListener('click', (e) => { e.stopPropagation(); todoPopOpen ? closeTodoPop() : openTodoPop(); });
notepad.addEventListener('contextmenu', (e) => e.stopPropagation());
document.getElementById('tp-close').addEventListener('click', (e) => { e.stopPropagation(); closeTodoPop(); });

// �Ự�б� HUD���ر� + �ײ��������¿���ť�������ڵ� agent ������
document.getElementById('sl-close').addEventListener('click', (e) => { e.stopPropagation(); closeSessList(); });
slTravelMission.addEventListener('input', () => { travelMissionDirty = true; });
slTravelMission.addEventListener('focus', () => window.pet.focusPet());
slTravelMission.addEventListener('blur', () => window.pet.blurPet());
slTravelStart.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (!sessionActionAllowed(travelTarget, 'travel')) {
    setTravelStatus(t('travel.invalid'), 'error');
    return;
  }
  const mission = String(slTravelMission.value || '').trim();
  if (!mission) {
    setTravelStatus(t('travel.invalid'), 'error');
    slTravelMission.focus();
    return;
  }
  slTravelStart.disabled = true;
  setTravelStatus(t('travel.departing'));
  let result;
  try {
    result = await window.pet.startTravel(travelTarget.sessionId || '', travelTemplateId || '', mission);
  } catch {
    result = { ok: false, code: 'not-ready' };
  }
  slTravelStart.disabled = false;
  if (result && result.state) travelData = result.state;
  if (!result || !result.ok) setTravelStatus(travelErrorText(result && result.code), 'error');
  else setTravelStatus('');
  renderTravelPage();
});
slTravelCancel.addEventListener('click', async (e) => {
  e.stopPropagation();
  slTravelCancel.disabled = true;
  let result;
  try { result = await window.pet.cancelTravel(); } catch { result = { ok: false, code: 'not-ready' }; }
  slTravelCancel.disabled = false;
  if (result && result.state) travelData = result.state;
  if (!result || !result.ok) setTravelStatus(travelErrorText(result && result.code), 'error');
  renderTravelPage();
});
slTravelStopPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  goTravelStop(selectedPostcardStop - 1);
});
slTravelStopNext.addEventListener('click', (e) => {
  e.stopPropagation();
  goTravelStop(selectedPostcardStop + 1);
});
if (slTakeoverClaude) slTakeoverClaude.addEventListener('click', (e) => {
  e.stopPropagation();
  runTakeover('claude');
});
if (slTakeoverCodex) slTakeoverCodex.addEventListener('click', (e) => {
  e.stopPropagation();
  runTakeover('codex');
});
slBack.addEventListener('click', (e) => { e.stopPropagation(); showSessionPage(); });
slSearch.addEventListener('input', () => {
  sessionSearch = slSearch.value || '';
  resetSessionListOrder();
  renderSessList();
  fitPopup(sesslist);
});
slSearch.addEventListener('focus', () => window.pet.focusPet());
slSearch.addEventListener('blur', () => window.pet.blurPet());
slFilters.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  e.stopPropagation();
  if (btn === slArchivedToggle) {
    showArchived = !showArchived;
    btn.classList.toggle('active', showArchived);
  } else if (btn.dataset.filter) {
    sessionFilter = btn.dataset.filter;
    slFilters.querySelectorAll('[data-filter]').forEach((el) => el.classList.toggle('active', el === btn));
  }
  resetSessionListOrder();
  renderSessList();
  fitPopup(sesslist);
});
const slNewBtn = document.getElementById('sl-new');
const slNewCodexBtn = document.getElementById('sl-new-codex');
const slNewDshBtn = document.getElementById('sl-new-dsh');
// Rebind the key rather than the text: applyStaticI18n() re-reads data-i18n on
// every language switch, so the Codex pet keeps its own label.
if (slNewBtn) {
  if (AGENT === 'codex') slNewBtn.dataset.i18n = 'sess.newCodex';
  else if (AGENT === 'dsh') slNewBtn.dataset.i18n = 'sess.newDsh';
}
if (slNewCodexBtn) slNewCodexBtn.classList.remove('hidden'); // ���������ˣ��������ڶ��ܿ�
if (AGENT === 'dsh' && slTravelInbox) slTravelInbox.classList.add('hidden');
if (slTravelInbox) slTravelInbox.addEventListener('click', async (e) => {
  e.stopPropagation();
  await openTravelInbox();
});
if (slWander) slWander.addEventListener('click', async (e) => {
  e.stopPropagation();
  slWander.disabled = true;
  slWander.textContent = t('travel.wanderDeparting');
  let result;
  try { result = await window.pet.wanderTravel(); } catch { result = { ok: false, code: 'not-ready' }; }
  if (result && result.state) travelData = result.state;
  slWander.textContent = t('travel.wanderEntry');
  if (result && result.ok) {
    closeSessList();
    return;
  }
  slWander.disabled = !!(travelData && travelData.active);
  slSub.textContent = travelErrorText(result && result.code);
  fitPopup(sesslist);
});
if (slNewBtn) {
  slNewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    window.pet.launchCodex();
    closeSessList();
  });
}
if (slNewCodexBtn) slNewCodexBtn.addEventListener('click', (e) => { e.stopPropagation(); window.pet.launchCodex(); closeSessList(); });
if (slNewDshBtn) slNewDshBtn.addEventListener('click', (e) => { e.stopPropagation(); window.pet.launchDsh(); closeSessList(); });
document.getElementById('sl-archive').addEventListener('click', (e) => {
  e.stopPropagation();
  window.pet.openSessionArchive();
  closeSessList();
});
document.getElementById('sl-panel').addEventListener('click', (e) => { e.stopPropagation(); window.pet.openPanel(); closeSessList(); });
sesslist.addEventListener('contextmenu', (e) => e.stopPropagation());
todopop.querySelectorAll('.tp-ops button').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    const op = b.dataset.op;
    if (op === 'panel') window.pet.openPanel();
    else if (op === 'claude') {
      if (AGENT === 'codex') window.pet.launchCodex();
      else if (AGENT === 'dsh') window.pet.launchDsh();
      else window.pet.launchClaude();
    }
    else if (op === 'log') window.pet.openLog();
    closeTodoPop();
  });
});

// ---------- ���ݲ˵� ----------
let territorySupported = false; // �� pet:config �·�(�� macOS true)
let lootSupported = false;
let radialOpenSeq = 0;
let lastRadialMetrics = null;
// labelKey (not label): buildRadial resolves it at render time, so the menu
// follows a language switch without rebuilding this table.
const MENU = [
  { ic: 'chart',  labelKey: 'menu.panel', act: () => window.pet.openPanel() },
  { ic: 'tune',   labelKey: 'menu.tune', act: () => toggleTunePanel() },
  {
    ic: 'hand',
    labelKey: 'menu.wardrobe',
    badge: true,
    act: () => {
      if (window.ChampionSpineController && typeof window.ChampionSpineController.toggleHat === 'function') { window.ChampionSpineController.toggleHat('hat_alterguardian'); } else if (typeof todoPopOpen !== 'undefined' && typeof openTodoPop === 'function') {
        todoPopOpen ? closeTodoPop() : openTodoPop();
      } else if (window.pet && typeof window.pet.openPanel === 'function') {
        window.pet.openPanel();
      }
    },
  },
  { ic: 'zombie', labelKey: 'menu.background', badgeBg: true, act: () => window.pet.openPanel() },
  { ic: 'doc',    labelKey: 'menu.log', act: () => window.pet.openLog() },
  { ic: 'grab',   labelKey: 'menu.loot', when: () => lootSupported, act: () => window.pet.lootCodexPet() },
  { ic: 'search', labelKey: 'menu.patrol', when: () => territorySupported, act: () => window.pet.territoryRunNow() },
  { ic: 'bell',   labelKey: 'menu.mute', act: () => window.pet.toggleMute() },
  // ˫��ģʽ�¡��˳���ֻ�����Լ���ֻ�������¼�����һֻ�ճ��ɻ��
  // ���� app ���˳������̡�����ģʽ����ԭ���壺�˳� app��
  AGENT === 'all'
    ? { ic: 'power', labelKey: 'menu.quit', act: () => window.pet.quit() }
    : { ic: 'power', labelKey: 'menu.collapse', act: () => window.pet.closePet() },
];

function toggleSkin() {
  const order = ['mascot', 'pixel', 'champion', ...Object.keys(MEME_PACKS)];
  const next = order[(order.indexOf(skin) + 1) % order.length];
  applySkin(next);
  window.pet.setSkin(next);
}

function usableRadialMetrics(metrics) {
  if (!metrics || !metrics.window || !metrics.workArea) return null;
  const wr = metrics.window;
  const wa = metrics.workArea;
  if (![wr.x, wr.y, wr.width, wr.height, wa.x, wa.y, wa.width, wa.height].every(Number.isFinite)) return null;
  if (wr.width <= 0 || wr.height <= 0 || wa.width <= 0 || wa.height <= 0) return null;
  return metrics;
}

function radialFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function settledRadialMetrics() {
  if (!window.pet || typeof window.pet.getWindowMetrics !== 'function') return null;
  let metrics = null;
  try { metrics = usableRadialMetrics(await window.pet.getWindowMetrics()); } catch { return null; }
  // setPetSize/resetPetSize ��������ͬ���� bounds���� renderer �� resize ��
  // flex ���Ż���һ�ġ��ȵ� DOM viewport Ҳ׷�������̳ߴ�����ȡ pet rect��
  for (let i = 0; metrics && i < 6; i++) {
    const wr = metrics.window;
    const settled = Math.abs((window.innerWidth || 0) - wr.width) <= 1
      && Math.abs((window.innerHeight || 0) - wr.height) <= 1;
    if (settled) break;
    await radialFrame();
    try { metrics = usableRadialMetrics(await window.pet.getWindowMetrics()) || metrics; } catch {}
  }
  await radialFrame();
  return metrics;
}

function buildRadial(metrics = lastRadialMetrics) {
  radial.innerHTML = '';
  const el = curSkinEl();
  const sr = stage.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const cx = r.left - sr.left + r.width / 2;
  const cy = r.top - sr.top + r.height / 2;
  const items = MENU.filter((it) => !it.when || it.when()); // ƽ̨��֧�ֵ���(���� mac ��Ѳ��)����Ⱦ
  const n = items.length;
  const exact = usableRadialMetrics(metrics);
  if (exact) lastRadialMetrics = exact;
  const frame = exact && exact.window;
  const viewportW = Math.max(1, frame ? frame.width : (window.innerWidth || 320));
  const viewportH = Math.max(1, frame ? frame.height : (window.innerHeight || 340));
  const wa = exact ? exact.workArea : browserWorkArea();
  const winX = frame ? frame.x : (Number.isFinite(window.screenX) ? window.screenX : wa.x);
  const winY = frame ? frame.y : (Number.isFinite(window.screenY) ? window.screenY : wa.y);
  const pad = 5;
  // Intersect the BrowserWindow viewport with the actually visible work area.
  // This protects old saved positions that may still have part of the
  // transparent window off-screen before the first drag normalises them.
  const safeRect = {
    x: Math.max(pad, wa.x - winX + pad),
    y: Math.max(pad, wa.y - winY + pad),
    width: Math.max(46, Math.min(viewportW - pad, wa.x + wa.width - winX - pad) - Math.max(pad, wa.x - winX + pad)),
    height: Math.max(46, Math.min(viewportH - pad, wa.y + wa.height - winY - pad) - Math.max(pad, wa.y - winY + pad)),
  };
  const preferred = [];
  // A side-edge pet must fan into the desktop first. Trying the vertical fan
  // before the inward fan is what created the clipped half-heart in corners.
  if (edgeLayout.horizontal === 'left') preferred.push('right');
  else if (edgeLayout.horizontal === 'right') preferred.push('left');
  if (edgeLayout.vertical === 'below') preferred.push('below');
  else preferred.push('above');
  preferred.push(edgeLayout.vertical === 'below' ? 'above' : 'below');
  const layout = window.PetGeometry
    ? window.PetGeometry.radialLayout({ count: n, center: { x: cx, y: cy }, safeRect, preferred })
    : { direction: 'above', points: [] };
  rlog(
    'radial',
    `layout=${layout.direction} frame=${winX},${winY} ${viewportW}x${viewportH} ` +
      `safe=${safeRect.x},${safeRect.y} ${safeRect.width}x${safeRect.height}`,
  );
  items.forEach((it, i) => {
    const point = layout.points[i] || { x: cx, y: cy };
    const x = point.x;
    const y = point.y;
    const b = document.createElement('div');
    b.className = 'radial-item';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    b.style.transitionDelay = i * 0.03 + 's';
    // Key, not label: the old `it.label === '����'` test silently picked the
    // wrong bell icon under any non-Chinese UI.
    const icName = it.labelKey === 'menu.mute' ? (muted ? 'bell-off' : 'bell') : it.ic;
    const icHtml = (window.OctoIcons && window.OctoIcons.icon(icName)) || '';
    b.innerHTML = `<span class="ri-ic oi">${icHtml}</span><span class="ri-lb">${esc(t(it.labelKey))}</span>`;
    const cnt = it.badge ? lastWaiting : it.badgeBg ? lastBgZombie : 0;
    if ((it.badge || it.badgeBg) && cnt > 0) {
      const bd = document.createElement('span');
      bd.className = 'ri-badge';
      bd.textContent = cnt;
      b.appendChild(bd);
    }
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      closeRadial();
      it.act();
    });
    radial.appendChild(b);
  });
}

function updateRadialBadge() {
  const items = radial.querySelectorAll('.radial-item');
  MENU.forEach((m, idx) => {
    if (!m.badge && !m.badgeBg) return;
    const node = items[idx];
    if (!node) return;
    const cnt = m.badge ? lastWaiting : lastBgZombie;
    let bd = node.querySelector('.ri-badge');
    if (cnt > 0) {
      if (!bd) { bd = document.createElement('span'); bd.className = 'ri-badge'; node.appendChild(bd); }
      bd.textContent = cnt;
    } else if (bd) bd.remove();
  });
}

async function openRadial() {
  const seq = ++radialOpenSeq;
  if (todoPopOpen) closeTodoPop();
  if (sessListOpen) closeSessList();
  radialOpen = true;
  try { window.pet.uiBusy(true); } catch {}
  bubble.classList.add('hidden');
  // closeSessList/closeTodoPop ���첽�� BrowserWindow �ӵ����ߴ����ػ���
  // �ߴ硣�����ȴ��ں� DOM ����λ���ٲ��֣������˵��ᰴ�ɴ����������ɣ�
  // �������������Ѱ�ťֱ�Ӳó��ɼ�������
  let metrics = await settledRadialMetrics();
  if (seq !== radialOpenSeq || !radialOpen) return;
  settleEdgeLayout();
  metrics = await settledRadialMetrics() || metrics;
  if (seq !== radialOpenSeq || !radialOpen) return;
  buildRadial(metrics);
  radial.classList.remove('hidden');
}
function closeRadial() {
  radialOpenSeq++;
  radial.classList.add('hidden');
  radialOpen = false;
  try { window.pet.uiBusy(!!(todoPopOpen || sessListOpen || askActive || isInteracting())); } catch {}
  // closeRadial is also used while synchronously switching to another popup.
  // Defer restoration one frame so the next surface can claim the window first.
  requestAnimationFrame(restoreEndingBubble);
}
function toggleRadial() {
  if (radialOpen) closeRadial();
  else openRadial().catch(() => closeRadial());
}
// �����ֿհ״��ر�
radial.addEventListener('click', () => closeRadial());
window.addEventListener('blur', () => { if (radialOpen) closeRadial(); });

// ---------- ��ʼ�� ----------
(async () => {
  // ˫��ģʽ���������ƣ�˭�� Claude��˭�� Codex һ�۷��壩
  const agentTag = document.getElementById('agent-tag');
  if (agentTag) {
    agentTag.innerHTML = `<span>Codex</span>`;
    if (AGENT !== 'all') agentTag.classList.add(AGENT);
    agentTag.classList.remove('hidden');
  }
  // ���±������Ļ�����ť���� agent ��
  if (AGENT === 'codex' || AGENT === 'dsh') {
    const b = todopop.querySelector('.tp-ops button[data-op="claude"]');
    // Rebind the key so applyStaticI18n() keeps relabelling it per backend.
    if (b) b.dataset.i18n = AGENT === 'codex' ? 'tray.launchCodex' : 'tray.launchDsh';
  }
  const cfg = await window.pet.getConfig();
  if (cfg) {
    muted = !!cfg.muted;
    territorySupported = !!cfg.territorySupported;
    lootSupported = !!cfg.lootSupported;
    window.OctoI18n.setLang(cfg.lang || 'zh');
    applySkin(cfg.skin || 'mascot');
  }
  // Convert positions saved by older builds (which anchored the transparent
  // window rather than the visible pet) as soon as the real skin is known.
  requestAnimationFrame(settleEdgeLayout);
  applyStaticI18n();
  await loadMemeCatalog();
  const s = await window.pet.getStats();
  // �п��վͰ���ʵ�ۺ�̬���֮ࣻǰ������ setState('idle') ���Ѹ�������
  // working/waiting �ǵ�������˲����������һ�¿��С�getStats ���յ�����
  // ���ȵ�ʱ��lastStats ����ֵ��ͬ�������塣
  if (s) applyStats(s);
  else if (!lastStats) setState('idle');
  const onlineMsg = (window.DialogueSystem && window.DialogueSystem.getOnlineLine(skin, AGENT)) || (
    AGENT === 'codex' ? t('bub.onlineCodex')
      : AGENT === 'dsh' ? t('bub.onlineDsh')
      : AGENT === 'claude' ? t('bub.onlineClaude')
      : t('bub.online')
  );
  if (skin !== 'champion') showBubble(onlineMsg, 3500);
  if (DEBUG_CONFETTI) setInterval(() => confetti(), 2500);
})();

// ---------- ͸������������͸�����в��ԣ�----------
// ���贰����͸�����Σ��հ״�������ס������Ӧ�á�����������(С����/��Ƭ/�˵�/���±�)
// �� �� ���յ�������͸���� �� �ô��ڴ�͸��forward:true ʹ��͸ʱ mousemove �Իش���
// ����һ�������ص������ϼ��ɻָ��ɵ㡣�϶���(g)ʼ�ձ��ֿɵ㡣
const HIT_SEL = '#pet-chat:not(.hidden),#tune-panel:not(.hidden),#pixel,#mascot,#cat,#champion-spine,#bubble:not(.hidden),#radial,#notepad,#todopop,#ask,#sesslist:not(.hidden),#chip,#agent-tag';
let mouseIgnoring = false;
function setMouseIgnore(on, reason = 'unknown', details = {}) {
  if (on === mouseIgnoring) return;
  mouseIgnoring = on;
  traceDrag('mouse-ignore-change', { ignore: on, reason, hasGesture: !!g, ...details });
  try { window.pet.setIgnoreMouse(on); } catch {}
}
window.addEventListener('mousemove', (e) => {
  // macOS can forward a window-level mousemove with buttons=0 in the same
  // frame as pointerdown on a transparent BrowserWindow. It is not proof of a
  // release: cancelling here makes the pet impossible to drag. Pointerup,
  // pointercancel, lostpointercapture and the element's pointermove own cleanup.
  if (g) {
    if (Number.isFinite(e.buttons) && (e.buttons & 1) === 0 && !g.loggedZeroButtonMousemove) {
      g.loggedZeroButtonMousemove = true;
      traceDrag('window-mousemove-buttons-zero', {
        dragId: g.traceId, client: { x: e.clientX, y: e.clientY }, frame: g.frame,
      });
    }
    setMouseIgnore(false, 'active-gesture');
    return;
  }
  const el = document.elementFromPoint(e.clientX, e.clientY);
  // ���в���Ȩ��ͬ����̬ͣ����͸�л�ʱ pointerleave ����©�������� askHover ���� true��
  // ������ isInteracting() ��ԶΪ�桢refreshAsk �������ˣ��ɿ�Ƭ���ᡢ�¿�Ƭ����������
  askHover = !!(el && el.closest('#ask'));
  const hit = el && el.closest(HIT_SEL);
  setMouseIgnore(!hit, hit ? 'hit-interactive-surface' : 'transparent-area', {
    client: { x: e.clientX, y: e.clientY }, hit: hit && (hit.id || hit.className || hit.tagName),
  });
}, true);
// ������Ĭ�ϴ�͸��͸�����������������Ƶ�������ʱ�����������в��Իָ�
setMouseIgnore(true, 'renderer-startup');

// ---------- ����״̬�ϱ�(����ģʽ��ս��) ----------
// �������޷����֡����� fitPopup �Ŵ��Ĵ��ڡ��͡��û����Ŀ������塹,����Ⱦ��
// ÿ 700ms ����һ��,�仯���ϱ�������:ѡ�����彻��/�Ҽ��˵�/���±�/�Ự�б���
let lastUiBusy = null;
setInterval(() => {
  const busy = !!(radialOpen || todoPopOpen || sessListOpen || askActive || isInteracting());
  if (busy === lastUiBusy) return;
  lastUiBusy = busy;
  try { window.pet.uiBusy(busy); } catch {}
}, 700);
// ���ݡ�Ƥ���л��ʹ�������Ӧ�����ܸı䱾����͸�������ľֲ�λ�á�
// ���ڳߴ��仯(fitPopup/resetPetSize)����Ⱦ�˱���Ϊ resize �¼�,���¼��ϱ�;
// ��פ��ѯֻ��һ����Ƶ����,����ÿ 500ms ǿ��һ�� getBoundingClientRect ������
window.addEventListener('resize', () => {
  if (pendingStageLayoutTimer) {
    clearTimeout(pendingStageLayoutTimer);
    pendingStageLayoutTimer = null;
  }
  if (pendingStageLayout) {
    setStageEdgeLayout(pendingStageLayout);
    pendingStageLayout = null;
  }
  requestAnimationFrame(() => {
    reportPetVisualBounds();
    alignMemePlayer();
    alignToolProp();
  });
});
setInterval(reportPetVisualBounds, 3000);



let activeSessionCycleIdx = 0;

// 获取后台正在思考/执行中的任务 ID（若无执行中任务则返回空字符串，绝不 fallback 到历史老会话）
function getRunningSessionId() {
  if (!lastStats || !Array.isArray(lastStats.sessions) || lastStats.sessions.length === 0) return '';
  const pool = lastStats.sessions;
  const BUSY_STATE_NAMES = ['working', 'thinking', 'juggling', 'sweeping', 'waiting', 'needsinput'];
  const busySessions = pool.filter((s) => s && BUSY_STATE_NAMES.includes(s.state));
  if (busySessions.length === 0) return '';
  busySessions.sort((a, b) => {
    const timeA = Math.max(a.updatedAt || 0, a.lastActivity || 0, a.createdAt || 0);
    const timeB = Math.max(b.updatedAt || 0, b.lastActivity || 0, b.createdAt || 0);
    return timeB - timeA;
  });
  const chosen = busySessions[activeSessionCycleIdx % busySessions.length];
  activeSessionCycleIdx = (activeSessionCycleIdx + 1) % busySessions.length;
  return chosen.id || chosen.sessionId || (chosen.meta && chosen.meta.id) || (typeof sessionKey === 'function' ? sessionKey(chosen) : '');
}

function getActiveOrLatestSessionId() {
  // 优先级 1：若当前结算完成气泡卡片正显示在屏幕上，精准定位至该卡片关联的会话！
  if (bubbleMode === 'ending' && endingMessages && endingMessages.size > 0) {
    const entries = endingEntries();
    if (entries.length > 0 && entries[0].sessionId) {
      return entries[0].sessionId;
    }
  }
  // 优先级 2：后台有正在思考/执行的任务时，轮转返回执行中的任务
  const runningSid = getRunningSessionId();
  if (runningSid) return runningSid;

  // 优先级 3：完全没有正在执行的任务时，按真实更新时间从新到旧寻找最近有效会话（严格排除缺少时间戳的历史僵尸会话）
  if (!lastStats || !Array.isArray(lastStats.sessions) || lastStats.sessions.length === 0) return '';
  const pool = lastStats.sessions;
  const validSessions = pool.filter((s) => {
    const t = Math.max(s.updatedAt || 0, s.lastActivity || 0, s.createdAt || 0);
    return t > 0;
  });

  validSessions.sort((a, b) => {
    const timeA = Math.max(a.updatedAt || 0, a.lastActivity || 0, a.createdAt || 0);
    const timeB = Math.max(b.updatedAt || 0, b.lastActivity || 0, b.createdAt || 0);
    return timeB - timeA;
  });

  if (validSessions[0]) {
    const chosen = validSessions[0];
    return chosen.id || chosen.sessionId || (chosen.meta && chosen.meta.id) || (typeof sessionKey === 'function' ? sessionKey(chosen) : '');
  }
  return '';
}

// �ײ���ǩ����
const chipEl = document.getElementById('chip');
if (chipEl) {
  // �������� Token ���ң���/�ػỰ�б�
  chipEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (radialOpen) closeRadial();
    toggleSessList();
  });
  // �Ҽ����� Token ���ң��򿪹��ܲ˵�
  chipEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleRadial();
  });
}

const agentTagEl = document.getElementById('agent-tag');
if (agentTagEl) {
  // �������� Codex ҩ�裺��׼������ǰ���ڸɻ�/���»�� Codex �Ự���ڣ�
  agentTagEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isRageDead) {
      reviveFromRageDeath('codex-session-focus');
    }
    if (radialOpen) closeRadial();
    const sid = getActiveOrLatestSessionId();
    if (window.pet && typeof window.pet.focusSession === 'function') {
      window.pet.focusSession(sid);
    }
  });
  // �Ҽ����� Codex ҩ�裺�л�����ģʽ��
  agentTagEl.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDanceMode();
  });
}


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
  soundVolume: 0.10,
  hitSoundVolume: 0.20,
};

const TUNE_SLIDERS = [
  { id: 'championScale', key: 'championScale', el: document.getElementById('slider-championScale'), valEl: document.getElementById('val-championScale'), isFloat: true },
  { id: 'championX', key: 'championX', el: document.getElementById('slider-championX'), valEl: document.getElementById('val-championX') },
  { id: 'championY', key: 'championY', el: document.getElementById('slider-championY'), valEl: document.getElementById('val-championY') },
  { id: 'bubbleOffsetY', key: 'bubbleOffsetY', el: document.getElementById('slider-bubbleOffsetY'), valEl: document.getElementById('val-bubbleOffsetY') },
  { id: 'dotsOffsetY', key: 'dotsOffsetY', el: document.getElementById('slider-dotsOffsetY'), valEl: document.getElementById('val-dotsOffsetY') },
  { id: 'bottomPadding', key: 'bottomPadding', el: document.getElementById('slider-bottomPadding'), valEl: document.getElementById('val-bottomPadding') },
  { id: 'soundVolume', key: 'soundVolume', el: document.getElementById('slider-soundVolume'), valEl: document.getElementById('val-soundVolume'), isFloat: true },
  { id: 'hitSoundVolume', key: 'hitSoundVolume', el: document.getElementById('slider-hitSoundVolume'), valEl: document.getElementById('val-hitSoundVolume'), isFloat: true },
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
      championScale: parseFloat(document.getElementById('slider-championScale')?.value ?? 0.368),
      championX: parseInt(document.getElementById('slider-championX')?.value ?? 100, 10),
      championY: parseInt(document.getElementById('slider-championY')?.value ?? 205, 10),
      bubbleOffsetY: parseInt(document.getElementById('slider-bubbleOffsetY')?.value ?? 15, 10),
      dotsOffsetY: parseInt(document.getElementById('slider-dotsOffsetY')?.value ?? 55, 10),
      bottomPadding: parseInt(document.getElementById('slider-bottomPadding')?.value ?? 16, 10),
      soundVolume: parseFloat(document.getElementById('slider-soundVolume')?.value ?? 0.10),
      hitSoundVolume: parseFloat(document.getElementById('slider-hitSoundVolume')?.value ?? 0.20),
    };
    try {
      if (window.pet && window.pet.saveCustomTuneConfig) {
        await window.pet.saveCustomTuneConfig(cfg);
      }
      if (tuneToastEl) {
        tuneToastEl.classList.remove('hidden');
        tuneToastEl.textContent = '? �����ѳɹ�д�� custom_config.js';
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


// [PET_CHAT_FEATURE] Codex �������ٶԻ�
let petChatOpen = false;
const petChat = document.getElementById('pet-chat');
const pcClose = document.getElementById('pc-close');
const pcSessSelect = document.getElementById('pc-sess-select');
const pcInput = document.getElementById('pc-input');
const pcSendBtn = document.getElementById('pc-send-btn');
const pcHint = document.getElementById('pc-hint');
const pcStatusDot = document.getElementById('pc-status-dot');

function getActiveCodexSessions() {
  const all = Array.isArray(curSessions) ? curSessions : [];
  let codexList = all.filter((s) => s && (s.agent === 'codex' || !s.agent));
  if (!codexList.length && all.length) codexList = all;
  return codexList;
}

function updatePetChatSessionOptions() {
  if (!pcSessSelect) return;
  const sessions = getActiveCodexSessions();
  const prevVal = pcSessSelect.value;
  pcSessSelect.innerHTML = '';
  
  if (!sessions.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'δ���⵽�Ự (�Զ�ƥ��)';
    pcSessSelect.appendChild(opt);
    if (pcStatusDot) pcStatusDot.className = 'pc-status-dot idle';
    return;
  }
  
  let workingCount = 0;
  sessions.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.sessionId || s.id || '';
    const stIcon = s.state === 'working' ? '⚡' : s.state === 'thinking' ? '💭' : s.state === 'waiting' ? '⏳' : '💤';
    if (s.state === 'working' || s.state === 'thinking') workingCount++;
    const name = s.project || s.sessionTitle || (s.sessionId ? s.sessionId.slice(-6) : 'Codex �Ự');
    opt.textContent = `${stIcon} ${name} (${s.state || 'idle'})`;
    pcSessSelect.appendChild(opt);
  });
  
  if (pcStatusDot) {
    pcStatusDot.className = workingCount > 0 ? 'pc-status-dot' : 'pc-status-dot idle';
  }
  
  if (prevVal && [...pcSessSelect.options].some((o) => o.value === prevVal)) {
    pcSessSelect.value = prevVal;
  }
}

function openPetChat() {
  if (!petChat) return;
  if (radialOpen) closeRadial();
  if (sessListOpen) closeSessList();
  if (tunePanelOpen && typeof closeTunePanel === 'function') closeTunePanel();
  
  updatePetChatSessionOptions();
  petChat.classList.remove('hidden');
  petChatOpen = true;
  
  try { window.pet.focusPet(); } catch {}
  if (pcInput) {
    setTimeout(() => { pcInput.focus(); }, 50);
  }
}

function closePetChat() {
  if (!petChat) return;
  petChat.classList.add('hidden');
  petChatOpen = false;
  try { window.pet.blurPet(); } catch {}
}

function togglePetChat(forceState) {
  const next = typeof forceState === 'boolean' ? forceState : !petChatOpen;
  if (next) openPetChat();
  else closePetChat();
}

async function handleSendPetChat() {
  if (!pcInput || !pcSendBtn) return;
  const prompt = pcInput.value.trim();
  if (!prompt) return;
  
  const targetSessionId = pcSessSelect ? pcSessSelect.value : '';
  pcSendBtn.disabled = true;
  pcSendBtn.textContent = '������...';
  if (pcHint) pcHint.textContent = '����Ͷ�ݵ� Codex...';
  
  // ����������С���忴��/�ͷŶ���
  if (typeof window.playChampionAnim === 'function') {
    window.playChampionAnim('wilson/book', false, true);
  }
  
  try {
    const res = await window.pet.sendCodexPrompt(targetSessionId, prompt);
    if (res && res.ok) {
      pcInput.value = '';
      if (pcHint) pcHint.textContent = '? �ѷ����� Codex �Ự��';
      if (typeof window.showPetBubble === 'function') {
        window.showPetBubble('���� Codex �·�ָ�� ??', 2500);
      }
      setTimeout(() => {
        closePetChat();
        if (pcHint) pcHint.textContent = 'Enter ���� / Esc �ر�';
      }, 1000);
    } else {
      const msg = (res && res.message) || '�·�ʧ�ܣ�������';
      if (pcHint) pcHint.textContent = '? ' + msg;
      if (typeof window.showPetBubble === 'function') {
        window.showPetBubble(msg, 3000);
      }
    }
  } catch (err) {
    if (pcHint) pcHint.textContent = '? ��������: ' + (err.message || err);
  } finally {
    pcSendBtn.disabled = false;
    pcSendBtn.textContent = '���� ??';
  }
}

if (pcClose) {
  pcClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closePetChat();
  });
}

if (pcSendBtn) {
  pcSendBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    handleSendPetChat();
  });
}

if (pcInput) {
  pcInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPetChat();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closePetChat();
    }
  });
}

if (petChat) {
  petChat.addEventListener('click', (e) => e.stopPropagation());
  petChat.addEventListener('contextmenu', (e) => e.stopPropagation());
}


// ============================================================================
// ��С����ר������������������ȫ�����ί���� champion_controller.js��
// ============================================================================

// --- B. ʱ�����㱨ʱ����ҹ/�賿��ҹ�ػ����� ---
let lastChimedHour = -1;
let lastLateNightAlertTime = 0;

function checkClockAndLateNightAlert(forcedHour = null) {
  if (isChampionDead()) return;
  const cfg = (window.PET_CONFIG && window.PET_CONFIG.clockReminder) || {};
  if (cfg.enabled === false) return;
  const now = new Date();
  const currentHour = forcedHour !== null ? forcedHour : now.getHours();
  const currentMinute = now.getMinutes();

  const isExactHour = (forcedHour !== null) || (currentMinute === 0 && lastChimedHour !== currentHour);

  if (isExactHour) {
    lastChimedHour = currentHour;
    if (currentHour >= 6 && currentHour <= 22) {
      if (cfg.hourlyChime !== false) {
        triggerHourlyChime(currentHour, cfg);
        return;
      }
    } else {
      if (cfg.lateNightAlert !== false) {
        triggerLateNightAlert(currentHour, cfg);
        lastLateNightAlertTime = Date.now();
        return;
      }
    }
  }

  const isLateNightTime = (currentHour >= 23 || currentHour <= 5);
  if (isLateNightTime && cfg.lateNightAlert !== false) {
    const isBusy = (state === 'working' || state === 'juggling' || state === 'carrying' || state === 'thinking');
    const intervalMs = (cfg.lateNightIntervalMin || 30) * 60 * 1000;
    if (isBusy && (Date.now() - lastLateNightAlertTime >= intervalMs)) {
      lastLateNightAlertTime = Date.now();
      triggerLateNightAlert(currentHour, cfg);
    }
  }
}

function triggerHourlyChime(hour, cfg) {
  if (isChampionDead()) return;
  const quotes = cfg.quotes || {};
  let pool = [];
  if (hour >= 6 && hour <= 11) pool = quotes.morning || [];
  else if (hour >= 12 && hour <= 13) pool = quotes.noon || [];
  else if (hour >= 14 && hour <= 17) pool = quotes.afternoon || [];
  else if (hour >= 18 && hour <= 22) pool = quotes.evening || [];

  if (!pool || pool.length === 0) pool = quotes.afternoon || [];
  const rawQuote = pool[Math.floor(Math.random() * pool.length)] || `������ ${hour} ��������`;
  const text = rawQuote.replace(/\{hour\}/g, String(hour));
  showBubble(text, cfg.holdMs || 4500, true);
  if (skin === 'champion' && state === 'idle') {
    playChampionTalking(3000);
  }
}

function triggerLateNightAlert(hour, cfg) {
  if (isChampionDead()) return;
  const quotes = cfg.quotes || {};
  let pool = [];
  if (hour === 23) pool = quotes.lateNight || [];
  else if (hour === 0) pool = quotes.midnight || [];
  else pool = quotes.deepNight || [];

  if (!pool || pool.length === 0) pool = quotes.deepNight || quotes.lateNight || [];
  const rawQuote = pool[Math.floor(Math.random() * pool.length)] || `�Ѿ� ${hour} ���ˣ���ȥ��Ϣ�ɣ�`;
  const text = rawQuote.replace(/\{hour\}/g, String(hour));
  showBubble(text, cfg.holdMs || 4500, true);
  if (skin === 'champion' && state === 'idle') {
    playChampionTalking(3500);
  }
}

window.testClockReminder = function(hour = 14) { checkClockAndLateNightAlert(hour); };
window.testLateNightAlert = function(hour = 2) { checkClockAndLateNightAlert(hour); };

setInterval(() => {
  checkClockAndLateNightAlert();
}, 30000);


// --- C. Token ������������ ---
let lastReportedMilestone = 0;
let initialSessionTokens = null;
const usedMilestoneQuotes = {};

function resetRoundTokenMilestone() {
  initialSessionTokens = null;
  lastReportedMilestone = 0;
}
window.resetRoundTokenMilestone = resetRoundTokenMilestone;

function checkTokenMilestones(currentTokens) {
  if (isChampionDead()) return;
  const cfg = (window.PET_CONFIG && window.PET_CONFIG.tokenMilestones) || {};
  if (cfg.enabled === false) return;
  const numTokens = Number(currentTokens) || 0;
  if (numTokens <= 0) return;

  // Ĭ������ģʽ����������һ�ֿ�ʼʱ��¼������������ Token �жϽ���
  if (initialSessionTokens === null) {
    initialSessionTokens = numTokens;
    return;
  }

  const deltaTokens = Math.max(0, numTokens - initialSessionTokens);
  let nextTarget = 0;

  // �û�������10w -> 50w -> 100w������ÿ�� 50w ��ʾһ��
  if (deltaTokens < 100000) {
    nextTarget = 0;
  } else if (deltaTokens < 500000) {
    nextTarget = 100000;
  } else if (deltaTokens < 1000000) {
    nextTarget = 500000;
  } else {
    const stepSize = cfg.stepAfter1M || 500000; // Ĭ��ÿ 50 ��
    nextTarget = 1000000 + Math.floor((deltaTokens - 1000000) / stepSize) * stepSize;
  }

  if (nextTarget > 0 && nextTarget > lastReportedMilestone) {
    lastReportedMilestone = nextTarget;
    triggerMilestoneDialogue(nextTarget, cfg);
  }
}
function triggerMilestoneDialogue(amount, cfg) {
  if (!cfg) cfg = (window.PET_CONFIG && window.PET_CONFIG.tokenMilestones) || {};
  const quotes = cfg.quotes || {};
  let poolKey = 'step10w';

  if (amount < 500000) poolKey = 'step10w';
  else if (amount < 1000000) poolKey = 'step50w';
  else if (amount < 2000000) poolKey = 'step100w';
  else if (amount < 3000000) poolKey = 'step200w';
  else if (amount < 5000000) poolKey = 'step300w';
  else if (amount < 10000000) poolKey = 'step500w';
  else if (amount < 20000000) poolKey = 'step1000w';
  else if (amount < 30000000) poolKey = 'step2000w';
  else if (amount < 50000000) poolKey = 'step3000w';
  else if (amount < 80000000) poolKey = 'step5000w';
  else if (amount < 100000000) poolKey = 'step8000w';
  else if (amount === 100000000) poolKey = 'step10000w';
  else poolKey = 'stepBeyond';

  let pool = quotes[poolKey] || quotes.step10000w || quotes.step100w || [];
  if (!pool || pool.length === 0) pool = quotes.step50w || quotes.step10w || [];

  // ���ظ���ȡ����ͬһ�׶����ù���̨�ʲ��ظ���ֱ���óغľ�������
  if (!usedMilestoneQuotes[poolKey] || usedMilestoneQuotes[poolKey].length >= pool.length) {
    usedMilestoneQuotes[poolKey] = [];
  }
  const availableQuotes = pool.filter(q => !usedMilestoneQuotes[poolKey].includes(q));
  const rawQuote = (availableQuotes.length > 0)
    ? availableQuotes[Math.floor(Math.random() * availableQuotes.length)]
    : (pool[Math.floor(Math.random() * pool.length)] || '当前已消耗 {amount} Token！');

  if (!usedMilestoneQuotes[poolKey].includes(rawQuote)) {
    usedMilestoneQuotes[poolKey].push(rawQuote);
  }

  let amountStr = '';
  if (amount >= 100000000) {
    const val = (amount / 100000000).toFixed(amount % 100000000 === 0 ? 0 : 1);
    amountStr = val + ' 亿';
  } else if (amount >= 10000) {
    amountStr = Math.round(amount / 10000) + ' 万';
  } else {
    amountStr = String(amount);
  }

  const text = rawQuote.replace(/\{amount\}/g, amountStr);
  showBubble(text, cfg.holdMs || 3800, true);
  if (skin === 'champion' && state === 'idle') {
    playChampionTalking(2800);
  }
}

window.testTokenMilestone = function(amount = 500000) {
  triggerMilestoneDialogue(amount, window.PET_CONFIG && window.PET_CONFIG.tokenMilestones);
};

window.testSleepState = function(targetLevel = 3) {
  state = 'sleeping';
  sleepLevel = targetLevel;
  isFallingAsleep = false;
  if (targetLevel === 3) {
    championPet.state.setAnimation(0, 'wilson/bedroll_sleep_loop', true);
  } else if (targetLevel === 2) {
    championPet.state.setAnimation(0, 'wilson/emote_sleepy', true);
  } else {
    championPet.state.setAnimation(0, 'wilson/emote_yawn', false);
  }
};
