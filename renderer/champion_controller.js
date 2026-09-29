// ============================================================================
// CCPET 小天体桌宠专属控制器 (Champion Pet Controller)
// ============================================================================
// 本模块将小天体（DST Wilson 骨骼动画）的所有专属逻辑与通用桌宠完全解耦：
// 包含：Spine 渲染管理、全状态 Triggers 调度、待机双站姿轮替、
//       手势（单击说话/快速双击挨打/拖拽拎起）、装死防诈尸、三级睡眠打退、
//       时钟整点报时、熬夜关怀、Token阶梯提醒、桌面四向小漫步与跳舞模式。
// ============================================================================

(function(window) {
  'use strict';

  const ChampionController = {
    // 状态标识
    isSpineReady: false,
    isLoading: false,
    isAnimLocked: false,
    isDraggingLocked: false,
    isRageDead: false,
    isFallingAsleep: false,
    sleepLevel: 0,
    wakeLockUntil: 0,
    isDanceMode: false,
    errorReviveClicks: 0,

    // 动画与轨道记录
    currentTriggerState: 'idle',
    currentBaseLoopAnim: 'wilson/acting_idle1',
    currentAnim: '',

    // 实例引用
    app: null,
    pet: null,
    containerEl: null,

    // 定时器
    oneShotTimer: null,
    oneShotSeqTimeout: null,
    animLockSafetyTimer: null,
    talkTimeout: null,
    sleepSequenceTimers: [],
    fatigueTimer: null,
    lastFatigueTriggerTime: 0,
    workingStartTime: null,

    // 连击时间戳
    rageClickTimestamps: [],
    lastLeftClickTime: 0,

    // 漫步状态
    wanderRafId: null,
    wanderTimerId: null,
    isWandering: false,
    wanderOriginWinPos: null,

    // ------------------------------------------------------------------------
    // 1. 初始化 Spine 骨骼画布与资源
    // ------------------------------------------------------------------------
    async init(container) {
      if (this.isSpineReady || this.isLoading) return;
      this.containerEl = container || document.getElementById('champion-spine');
      if (!this.containerEl || !window.PIXI || !window.PIXI.spine) return;

      this.isLoading = true;
      try {
        this.app = new PIXI.Application({
          width: 200,
          height: 230,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        this.containerEl.appendChild(this.app.view);

        const spineUrl = new URL('../assets/spine/champion.json', window.location.href).href;
        const resource = await PIXI.Assets.load(spineUrl);
        this.pet = new PIXI.spine.Spine(resource.spineData);
        this.pet.autoUpdate = false;

        // 运行时精密清理：剥离武器插槽与道具附件，保留自然空手
        this.sanitizeSkeletonSlots(this.pet.skeleton);

        const sScale = (window.PET_CONFIG && window.PET_CONFIG.championScale != null) ? window.PET_CONFIG.championScale : 0.368;
        const sX = (window.PET_CONFIG && window.PET_CONFIG.championX != null) ? window.PET_CONFIG.championX : 100;
        const sY = (window.PET_CONFIG && window.PET_CONFIG.championY != null) ? window.PET_CONFIG.championY : 205;

        this.pet.scale.set(sScale);
        this.pet.position.set(sX, sY);
        const origStateApply = this.pet.state.apply.bind(this.pet.state);
        const self = this;
        this.pet.state.apply = function(skeleton) {
          origStateApply(skeleton);
          self.sanitizeSkeletonSlots(skeleton);
        };

        this.app.ticker.add((delta) => {
          try {
            if (this.pet) {
              const dt = (typeof delta === "number" && !isNaN(delta) && delta > 0 && delta < 10) ? (delta / 60) : (1 / 60);
              this.pet.update(dt);
              if (this.pet.skeleton) {
                this.sanitizeSkeletonSlots(this.pet.skeleton);
              }
            }
          } catch (err) {
            console.warn("[championApp ticker error]", err);
          }
        });

        this.app.stage.addChild(this.pet);

        // 绑定动作结束监听：只要播放 wakeup，无论如何下一动作必须死锁切入 idle！
        try {
          if (this.pet.state && typeof this.pet.state.addListener === "function") {
            this.pet.state.addListener({
              complete: (entry) => {
                if (entry && entry.animation && entry.animation.name && entry.animation.name.includes("wakeup")) {
                  const idleAnim = this.hasAnim("wilson/acting_idle1") ? "wilson/acting_idle1" : "wilson/acting_idle1";
                  this.currentBaseLoopAnim = idleAnim;
                  this.currentTriggerState = "idle";
                  this.sleepLevel = 0;
                  this.isFallingAsleep = false;
                  this.isAnimLocked = false;
                  try {
                    this.pet.state.setAnimation(0, idleAnim, true);
                  } catch (e) {}
                  this.wakeLockUntil = Date.now() + 300000;
                  if (typeof window.setState === "function") window.setState("idle");
                  if (typeof window.setPetWakeLock === "function") window.setPetWakeLock(300000);
                  this.scheduleNextOneShot("idle");
                }
              }
            });
          }
        } catch (e) {}

        this.isSpineReady = true;
        this.isLoading = false;

        // 开场动画：必须播放 bucked 衔接 buck_pst，站稳后再弹出着陆台词
        this.playIntroBuck();
      } catch (err) {
        console.error('[ChampionController] init failed:', err);
        this.isLoading = false;
      }
    },

    // 过滤武器专属插槽，握拳转空手
    sanitizeSkeletonSlots(skeleton) {
      if (!skeleton || !skeleton.slots) return;
      for (let i = 0; i < skeleton.slots.length; i++) {
        const slot = skeleton.slots[i];
        const slotName = (slot.data && slot.data.name) || "";
        const att = slot.attachment;
        const attName = att ? (att.name || "") : "";
        const attPath = (att && att.path) ? att.path : "";

        // 1. 纯武器/纯道具专属插槽直接隐藏
        const isPureWeaponSlot = (
          slotName.startsWith("lance") ||
          slotName.startsWith("dagger") ||
          slotName.startsWith("swap_book") ||
          slotName.startsWith("remote") ||
          slotName.includes("lantern_overlay") ||
          slotName.startsWith("arm_carry_marker") ||
          slotName.startsWith("armcarry")
        );

        // 2. 武器/道具附件（无论挂在哪个插槽，只剥离武器附件，绝不误伤手臂）
        const isWeaponAttachment = (
          attName.startsWith("swap_object") ||
          attName.startsWith("lance") ||
          attName.startsWith("vault_dagger") ||
          attName.startsWith("fan01") ||
          attName.startsWith("hound_whistle") ||
          attName.startsWith("lantern_overlay") ||
          attName.startsWith("swap_book_fx") ||
          attPath.includes("swap_object") ||
          attPath.includes("lance") ||
          attPath.includes("vault_dagger") ||
          attPath.includes("fan01") ||
          attPath.includes("hound_whistle") ||
          attPath.includes("lantern_overlay") ||
          attPath.includes("swap_book_fx")
        );

        if (slotName === "hat-1") {
          if (this.currentHat && this.hatAttachments) {
            if (!slot.attachment) {
              slot.attachment = this.hatAttachments["swap_hat-0"];
            }
            if (this.pet && this.pet.slotContainers && this.pet.slotContainers[i]) {
              this.pet.slotContainers[i].visible = true;
            }
          }
          continue;
        }

        if (isPureWeaponSlot || isWeaponAttachment) {
          slot.attachment = null;
          if (this.pet && this.pet.slotContainers && this.pet.slotContainers[i]) {
            this.pet.slotContainers[i].visible = false;
          }
          continue;
        }

        // 3. 将握拳持械手 hand-4 动态替换为自然空手手势 hand-1 或 hand-0
        if (attName === "hand-4" || attPath === "hand-4" || attName.includes("hand-4")) {
          try {
            const naturalHand = skeleton.getAttachment(i, "hand-1") || skeleton.getAttachment(i, "hand-0");
            if (naturalHand) {
              slot.attachment = naturalHand;
            }
          } catch (e) {}
        }

        // 4. 确保正常身体与手臂部件保持显示
        if (this.pet && this.pet.slotContainers && this.pet.slotContainers[i]) {
          this.pet.slotContainers[i].visible = !!slot.attachment;
        }
      }
    },

    hasAnim(animName) {
      if (!this.pet || !this.pet.spineData || !this.pet.spineData.animations) return false;
      return this.pet.spineData.animations.some(a => a.name === animName);
    },

    // 出场动画：摔落 (bucked 0.63s) ➔ 爬起站稳 (buck_pst 1.03s) ➔ 弹出台词
    playIntroBuck() {
      if (!this.pet) return;
      this.isAnimLocked = true;
      try {
        if (this.hasAnim('wilson/bucked') && this.hasAnim('wilson/buck_pst')) {
          this.pet.state.setAnimation(0, 'wilson/bucked', false);
          this.pet.state.addAnimation(0, 'wilson/buck_pst', false, 0);
          this.currentBaseLoopAnim = this.pickBaseLoop(this.getTriggerConfig('idle'));
          this.pet.state.addAnimation(0, this.currentBaseLoopAnim, true, 0);
        } else {
          this.pet.state.setAnimation(0, 'wilson/acting_idle1', true);
        }
      } catch (e) {
        console.warn('Intro buck anim error:', e);
      }

      // 摔倒到地上 (bucked 约 630ms 砸地)，在摔倒挣扎爬起时触发尴尬吐槽台词
      setTimeout(() => {
        let pickLanding = null;
        if (window.DialogueSystem && typeof window.DialogueSystem.getOnlineLine === 'function') {
          pickLanding = window.DialogueSystem.getOnlineLine('champion', window.AGENT || 'codex');
        }
        if (!pickLanding) {
          const landingPool = (window.PET_CONFIG && window.PET_CONFIG.landingQuotes) || [
            '哎呀！谁在暗算我？！',
            '……咳咳，我刚才只是在测试地面的硬度！',
            '是谁把地面放得这么高？！',
            '好痛……凡间的引力真是野蛮！'
          ];
          pickLanding = landingPool[Math.floor(Math.random() * landingPool.length)];
        }
        if (typeof window.showPetBubble === 'function') {
          window.showPetBubble(pickLanding, 3500, true);
        } else if (typeof window.showBubble === 'function') {
          window.showBubble(pickLanding, 3500);
        }
      }, 700);

      setTimeout(() => {
        this.isAnimLocked = false;
      }, 1750);
    },

    // ------------------------------------------------------------------------
    // 2. 核心状态机与动画更新
    // ------------------------------------------------------------------------
    getTriggerConfig(stateName) {
      const allTriggers = (window.PET_CONFIG && window.PET_CONFIG.triggers) || {};
      return allTriggers[stateName] || allTriggers.idle || {
        baseLoops: [{ anim: 'wilson/acting_idle1', weight: 5 }, { anim: 'wilson/idle_loop_down', weight: 5 }],
        clickSwitchLoopChance: 0.6,
        oneShotInterval: [25, 45],
        oneShotPool: ['wilson/idle_inaction_down']
      };
    },

    pickBaseLoop(cfg) {
      if (!cfg || !cfg.baseLoops) return 'wilson/acting_idle1';
      const loops = cfg.baseLoops;
      if (Array.isArray(loops)) {
        if (loops.length === 0) return 'wilson/acting_idle1';
        let totalWeight = 0;
        const candidates = [];
        for (const item of loops) {
          const anim = typeof item === 'object' && item !== null ? item.anim : item;
          const weight = (typeof item === 'object' && item !== null && item.weight) ? Number(item.weight) : 1;
          if (this.hasAnim(anim)) {
            totalWeight += weight;
            candidates.push({ anim, weight, acc: totalWeight });
          }
        }
        if (candidates.length === 0) return 'wilson/acting_idle1';
        const rand = Math.random() * totalWeight;
        for (const c of candidates) {
          if (rand <= c.acc) return c.anim;
        }
        return candidates[0].anim;
      }
      return typeof loops === 'string' && this.hasAnim(loops) ? loops : 'wilson/acting_idle1';
    },

    // 状态切换入口
    updateSpine(s, forceEnter = false) {
      if (!this.isSpineReady || !this.pet) {
        if (!this.isLoading) this.init();
        return;
      }
      // 死了后当前这次工作全部略过，绝不在工作中间复活，只有任务完成或下一次新对话才复活！
      if (this.isRageDead) return;

      this.checkWorkingFatigue(s);
      if (s === 'working' || s === 'juggling' || s === 'thinking') {
        this.isAnimLocked = false;
      }

      // 只要进入非睡眠活跃状态，立即彻底清除幽灵睡眠和相关定时器
      if (s !== 'sleeping' && s !== 'idle') {
        this.clearSleepTimers();
        this.isFallingAsleep = false;
        this.sleepLevel = 0;
        this.wakeLockUntil = Date.now() + 300000;
        if (typeof window.setPetWakeLock === 'function') window.setPetWakeLock(300000);
      }
      if (this.currentTriggerState === s && !forceEnter) {
        const curTrack = this.pet && this.pet.state ? this.pet.state.getCurrent(0) : null;
        const curAnimName = curTrack && curTrack.animation ? curTrack.animation.name : '';
        if ((s === 'working' || s === 'juggling') && (curAnimName.includes('idle') || curAnimName.includes('buck'))) {
          this.resumeToBaseLoop();
        }
        return;
      }

      // 睡眠保护：当前确为深度睡眠时，空闲待机 idle 不覆盖打断；若此前不是 sleeping 状态，绝不准拦截待机！
      if (this.currentTriggerState === 'sleeping' && (this.sleepLevel > 0 || this.isFallingAsleep) && s === 'idle' && !forceEnter) {
        return;
      }
      this.currentTriggerState = s;

      if (this.oneShotTimer) { clearTimeout(this.oneShotTimer); this.oneShotTimer = null; }
      if (this.oneShotSeqTimeout) { clearTimeout(this.oneShotSeqTimeout); this.oneShotSeqTimeout = null; }

      const cfg = this.getTriggerConfig(s);

            // 动态推导当次工作/跳舞循环动画
      let finalLoops = cfg ? cfg.baseLoops : null;
      if (s === 'talking') {
        finalLoops = [{ anim: 'wilson/acting_idle1', weight: 5 }, { anim: 'wilson/idle_loop_down', weight: 5 }];
      } else if (s === 'working' && cfg) {
        if (this.isDanceMode) {
          finalLoops = (cfg.danceLoops && cfg.danceLoops.length > 0) 
            ? cfg.danceLoops 
            : [
                { anim: 'wilson/emoteXL_loop_dance0', weight: 1 },
                { anim: 'wilson/emoteXL_loop_dance7', weight: 1 },
                { anim: 'wilson/hatdance2_loop', weight: 1 }
              ];
        } else {
          const pool = (cfg.workingCandidatePool || []).filter(a => this.hasAnim(a));
          if (pool.length >= 3) {
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            finalLoops = [
              { anim: shuffled[0], weight: 6 },
              { anim: shuffled[1], weight: 3 },
              { anim: shuffled[2], weight: 1 }
            ];
          }
        }
      }

      this.currentBaseLoopAnim = this.pickBaseLoop({ baseLoops: finalLoops });
      if (this.isDraggingLocked) return;
      if (this.isAnimLocked && !forceEnter) return;
      this.isAnimLocked = false;

      // 深度睡眠自然过渡
      if (s === 'sleeping') {
        this.startSleepTransition();
        return;
      }

      // 恢复正常站立/主循环
      this.resumeToBaseLoop();

      if (cfg.playOneShotOnEnter) {
        this.triggerOneShotFlavor(s);
      } else {
        this.scheduleNextOneShot(s);
      }
    },

    resumeToBaseLoop() {
      if (this.isDraggingLocked || !this.isSpineReady || !this.pet) return;
      // 装死绝对拦截
      if (this.isRageDead) {
        const dIdle = this.hasAnim('wilson/death2_idle') ? 'wilson/death2_idle' : (this.hasAnim('wilson/death_idle') ? 'wilson/death_idle' : 'wilson/acting_idle1');
        try {
          this.currentAnim = dIdle;
          this.pet.state.setAnimation(0, dIdle, true);
        } catch (e) {}
        return;
      }

      const cfg = this.getTriggerConfig(this.currentTriggerState);
      if (this.currentTriggerState === 'idle' && cfg && Array.isArray(cfg.baseLoops) && cfg.baseLoops.length > 1) {
        const nextLoop = this.pickBaseLoop(cfg);
        if (nextLoop) this.currentBaseLoopAnim = nextLoop;
      }

      const targetAnim = this.hasAnim(this.currentBaseLoopAnim) ? this.currentBaseLoopAnim : 'wilson/acting_idle1';
      try {
        this.currentAnim = targetAnim;
        this.pet.state.setAnimation(0, targetAnim, true);
      } catch (e) {}
    },

    // ------------------------------------------------------------------------
    // 3. 说话动作播放：只播一次 (loop=false)，根据真实时长自然结束，绝不循环重播第二遍！
    // ------------------------------------------------------------------------
    playTalking(durationMs = 1800) {
      if (!this.pet || !this.isSpineReady || this.isDraggingLocked) return;
      if (this.isRageDead || this.sleepLevel > 0 || this.isFallingAsleep) return;

      // 保护挨打、死亡、苏醒等动作不被打断
      try {
        const curTrack = this.pet.state.getCurrent(0);
        if (curTrack && !curTrack.isComplete() && curTrack.animation) {
          const aName = curTrack.animation.name;
          if (aName.includes('hit') || aName.includes('wakeup') || aName.includes('corpse') || aName.includes('death')) {
            return;
          }
        }
      } catch (e) {}

      if (this.talkTimeout) { clearTimeout(this.talkTimeout); this.talkTimeout = null; }

      // 说话动画池加权挑选：dial_loop (51帧~1.7s) 最经常播放；acting_1 (23帧~0.77s) 与 acting_2 (23帧~0.77s) 作为丰富单次
      let talkAnim = 'wilson/dial_loop';
      if (this.currentTriggerState === 'tired' && this.hasAnim('wilson/heavy_dial_loop')) {
        talkAnim = 'wilson/heavy_dial_loop';
      } else {
        const pool = [
          { anim: 'wilson/dial_loop', weight: 6 },
          { anim: 'wilson/acting_1', weight: 2 },
          { anim: 'wilson/acting_2', weight: 2 }
        ].filter(p => this.hasAnim(p.anim));
        if (pool.length > 0) {
          const totalW = pool.reduce((acc, p) => acc + p.weight, 0);
          const r = Math.random() * totalW;
          let accW = 0;
          for (const p of pool) {
            accW += p.weight;
            if (r <= accW) { talkAnim = p.anim; break; }
          }
        }
      }

      this.isAnimLocked = true;
      let animDurationMs = 1700;
      try {
        // 核心铁律：单次播放 (loop = false)！严格按真实帧数播放完毕，绝不循环重播第二遍！
        const track = this.pet.state.setAnimation(0, talkAnim, false);
        if (track && track.animation && track.animation.duration > 0) {
          animDurationMs = Math.round(track.animation.duration * 1000);
        }
      } catch (e) {
        console.warn('playTalking setAnimation error:', e);
      }

      this.talkTimeout = setTimeout(() => {
        this.talkTimeout = null;
        this.isAnimLocked = false;
        this.resumeToBaseLoop();
      }, animDurationMs + 30);
    },

    // 任务完成提醒：单次 horn、emote_slowclap、emote_jumpcheer、连续 emote_waving
    playWorkFinishedCelebration() {
      if (!this.pet || !this.isSpineReady || this.isDraggingLocked || this.isRageDead) return false;
      const choices = [
        { anim: 'wilson/horn', isLoop: false, duration: 2500 },
        { anim: 'wilson/emote_slowclap', isLoop: false, duration: 2600 },
        { anim: 'wilson/emote_jumpcheer', isLoop: false, duration: 2400 },
        { anim: 'wilson/emote_waving', isLoop: true, duration: 3200 }
      ];
      const valid = choices.filter(c => this.hasAnim(c.anim));
      if (valid.length === 0) return false;
      const pick = valid[Math.floor(Math.random() * valid.length)];

      this.isAnimLocked = true;
      try {
        this.pet.state.setAnimation(0, pick.anim, pick.isLoop);
      } catch (e) {}

      setTimeout(() => {
        this.isAnimLocked = false;
        this.resumeToBaseLoop();
      }, pick.duration);

      return true;
    },

    // ------------------------------------------------------------------------
    // 4. 拖拽悬空与放下手势
    // ------------------------------------------------------------------------
    playDragAnim(isDragging) {
      if (!this.isSpineReady || !this.pet) return;
      if (isDragging) {
        this.isDraggingLocked = true;
        if (this.oneShotTimer) { clearTimeout(this.oneShotTimer); this.oneShotTimer = null; }
        if (this.oneShotSeqTimeout) { clearTimeout(this.oneShotSeqTimeout); this.oneShotSeqTimeout = null; }
        try {
          this.currentAnim = 'wilson/hit_spike_short_loop';
          this.pet.state.setAnimation(0, 'wilson/hit_spike_short_pre', false);
          this.pet.state.addAnimation(0, 'wilson/hit_spike_short_loop', true, 0);
        } catch (e) {}
      } else {
        // 装死/暴毙状态下放开鼠标：绝不播放落地 pst，直接切换成死掉的动画！
        if (this.isRageDead) {
          this.isDraggingLocked = false;
          const dIdle = this.hasAnim('wilson/death2_idle') ? 'wilson/death2_idle' : (this.hasAnim('wilson/death_idle') ? 'wilson/death_idle' : 'wilson/acting_idle1');
          try {
            this.currentAnim = dIdle;
            this.pet.state.setAnimation(0, dIdle, true);
          } catch (e) {}
          return;
        }

        try {
          this.currentAnim = 'wilson/hit_spike_short_pst';
          const track = this.pet.state.setAnimation(0, 'wilson/hit_spike_short_pst', false);
          const dur = (track && track.animation && track.animation.duration > 0) ? track.animation.duration : 0.45;
          setTimeout(() => {
            this.isDraggingLocked = false;
            this.resumeToBaseLoop();
            this.scheduleNextOneShot(this.currentTriggerState);
          }, (dur + 0.05) * 1000);
        } catch (e) {
          this.isDraggingLocked = false;
          this.resumeToBaseLoop();
        }
      }
    },

    // ------------------------------------------------------------------------
    // 5. 交互事件：左键单击 (说话/换站姿)、左键双击 (短戳挨打)、右键受击/装死
    // ------------------------------------------------------------------------
    onLeftClick(el) {
      if (typeof this.stopWander === 'function') this.stopWander();
      this.isDraggingLocked = false;

      // 装死状态下戳尸体：只播 corpse_hit，接 death2_idle，绝不诈尸！
      if (this.isRageDead) {
        try {
          if (this.hasAnim('wilson/corpse_hit')) {
            this.pet.state.setAnimation(0, 'wilson/corpse_hit', false);
            const dIdle = this.hasAnim('wilson/death2_idle') ? 'wilson/death2_idle' : 'wilson/death_idle';
            this.pet.state.addAnimation(0, dIdle, true, 0);
          }
        } catch (e) {}
        return;
      }

      // 错误状态下戳尸体 3 次叫醒
      if (this.currentTriggerState === 'error') {
        this.errorReviveClicks++;
        if (this.errorReviveClicks < 3) {
          try {
            this.pet.state.setAnimation(0, 'wilson/corpse_hit', false);
            this.pet.state.addAnimation(0, 'wilson/death_idle', true, 0);
          } catch (e) {}
          if (typeof window.playPetSound === 'function') window.playPetSound('assets/sounds/champion/ouch.wav');
          const hint = this.errorReviveClicks === 1 ? '……（小天体倒在地上，毫无动静。再戳戳看？）' : '……（小天体的手指微微动了动，快醒了！）';
          if (typeof window.showPetBubble === 'function') window.showPetBubble(hint, 2400, true);
        } else {
          this.errorReviveClicks = 0;
          this.reviveFromDead();
        }
        return;
      }

      // 睡眠中轻戳：前两个睡眠阶段直接切到 idle，只有彻底睡死了 (阶段3) 才播放 wakeup
      if (this.sleepLevel > 0 || this.isFallingAsleep) {
        const isDeepSleep = this.sleepLevel >= 3;
        this.clearSleepTimers();
        this.isFallingAsleep = false;
        this.sleepLevel = 0;
        this.wakeLockUntil = Date.now() + 300000;
        if (typeof window.setPetWakeLock === "function") window.setPetWakeLock(300000);

        this.currentTriggerState = "idle";
        const idleCfg = this.getTriggerConfig("idle");
        const idleAnim = this.pickBaseLoop(idleCfg) || "wilson/acting_idle1";
        this.currentBaseLoopAnim = idleAnim;
        if (typeof window.setState === "function") window.setState("idle");

        if (isDeepSleep) {
          // 只有彻底睡死了才播放 wakeup 躺地揉眼苏醒
          try {
            const wakeAnim = this.hasAnim("wilson/wakeup") ? "wilson/wakeup" : idleAnim;
            this.pet.state.setAnimation(0, wakeAnim, false);
            this.pet.state.addAnimation(0, idleAnim, true, 0);
            this.isAnimLocked = true;
            setTimeout(() => { this.isAnimLocked = false; }, 2600);
          } catch (e) {}
          if (typeof window.playPetSound === "function") window.playPetSound("assets/sounds/champion/yawning.wav");
          if (typeof window.showPetBubble === "function") window.showPetBubble("哈啊……醒了醒了！随时听候差遣！", 2800, true);
        } else {
          // 前两个阶段别播 wakeup，直接平滑切回待机站姿 idle
          try {
            this.pet.state.setAnimation(0, idleAnim, true);
            this.isAnimLocked = false;
          } catch (e) {}
          if (typeof window.showPetBubble === "function") window.showPetBubble("唔？我没睡着，只是在闭目养神！", 2200, true);
        }
        this.scheduleNextOneShot("idle");
        return;
      }

      // 待机/常规状态下：点一下立即从第0帧重新播放 idle 动画（好玩响应，重置动作时间轴）
      if (this.currentTriggerState === 'idle' || this.currentTriggerState === 'attention' || this.currentTriggerState === 'happy' || this.currentTriggerState === 'loafing') {
        if (this.oneShotSeqTimeout) { clearTimeout(this.oneShotSeqTimeout); this.oneShotSeqTimeout = null; }
        if (this.oneShotTimer) { clearTimeout(this.oneShotTimer); this.oneShotTimer = null; }
        this.isAnimLocked = false;
        this.currentTriggerState = 'idle';
        const cfg = this.getTriggerConfig('idle');
        if (cfg && cfg.clickSwitchLoopChance > 0 && Math.random() < cfg.clickSwitchLoopChance) {
          const nextLoop = this.pickBaseLoop(cfg);
          if (nextLoop) this.currentBaseLoopAnim = nextLoop;
        }
        const targetAnim = this.hasAnim(this.currentBaseLoopAnim) ? this.currentBaseLoopAnim : 'wilson/acting_idle1';
        try {
          this.currentAnim = targetAnim;
          this.pet.state.setAnimation(0, targetAnim, true);
        } catch (e) {}
        this.scheduleNextOneShot('idle');
      }

      // 播放说话音效
      if (typeof window.playPetSound === 'function') {
        const r = Math.floor(1 + Math.random() * 6);
        window.playPetSound('assets/sounds/champion/talk' + r + '.wav');
      }

      // 获取台词（工作忙碌台词 / 日常台词 50% 概率）
      let text;
      const isWorkingNow = (this.currentTriggerState === 'working' || this.currentTriggerState === 'thinking');
      const busyQuotes = (window.PET_CONFIG && window.PET_CONFIG.workingBusyQuotes) || [];
      if (isWorkingNow && busyQuotes.length > 0 && Math.random() < 0.5) {
        text = busyQuotes[Math.floor(Math.random() * busyQuotes.length)];
      } else {
        const pool = (window.PET_CONFIG && window.PET_CONFIG.clickDialogues) || [];
        text = pool.length > 0 ? (typeof pool[Math.floor(Math.random() * pool.length)] === 'string' ? pool[Math.floor(Math.random() * pool.length)] : pool[Math.floor(Math.random() * pool.length)].text) : '让月光完成这次构建！';
      }

      if (typeof window.showPetBubble === 'function') {
        window.showPetBubble(text, 3200, true);
      }
    },

    // 快速双击：短戳挨打抗议，连续快戳 5 次直接倒地暴毙/装死！
    onLeftDoubleClick(el) {
      if (typeof this.stopWander === 'function') this.stopWander();
      if (this.isRageDead) {
        this.onLeftClick(el);
        return;
      }

      const now = Date.now();
      if (!this.pokeClickTimestamps) this.pokeClickTimestamps = [];
      this.pokeClickTimestamps.push(now);
      this.pokeClickTimestamps = this.pokeClickTimestamps.filter(t => now - t <= 3500);

      if (this.pokeClickTimestamps.length >= 5) {
        this.triggerRageDeath('poke');
        return;
      }

      try {
        const hitAnim = this.hasAnim('wilson/hit_11111000') ? 'wilson/hit_11111000' : 'wilson/corpse_hit';
        this.pet.state.setAnimation(0, hitAnim, false);
        this.pet.state.addAnimation(0, this.currentBaseLoopAnim, true, 0);
      } catch (e) {}
      if (typeof window.playPetSound === 'function') window.playPetSound('assets/sounds/champion/ouch.wav');
      if (typeof window.showPetBubble === 'function') window.showPetBubble('哎呀！轻点！', 2400, true);
    },

    // 右键身体：挨打 / 三级睡眠逐级打退 / 3.5秒内连打6次倒地装死
    onRightClick(el) {
      if (typeof this.stopWander === 'function') this.stopWander();
      this.isDraggingLocked = false;

      // 装死状态下戳尸体
      if (this.isRageDead) {
        try {
          if (this.hasAnim('wilson/corpse_hit')) {
            this.pet.state.setAnimation(0, 'wilson/corpse_hit', false);
            const dIdle = this.hasAnim('wilson/death2_idle') ? 'wilson/death2_idle' : 'wilson/death_idle';
            this.pet.state.addAnimation(0, dIdle, true, 0);
          }
        } catch (e) {}
        return;
      }

      // 处于睡眠状态：按 3 级打退
      if (this.sleepLevel > 0 || this.isFallingAsleep) {
        this.handleSleepWakeSequence(true);
        return;
      }

      // 正常清醒状态挨打：检查 3.5 秒内连打 6 次触发倒地装死
      const now = Date.now();
      this.rageClickTimestamps.push(now);
      this.rageClickTimestamps = this.rageClickTimestamps.filter(t => now - t <= 3500);

      if (this.rageClickTimestamps.length >= 6) {
        this.triggerRageDeath();
        return;
      }

      // 普通右键挨打一次
      try {
        const hitAnim = this.hasAnim('wilson/hit_11111000') ? 'wilson/hit_11111000' : 'wilson/corpse_hit';
        this.pet.state.setAnimation(0, hitAnim, false);
        this.pet.state.addAnimation(0, this.currentBaseLoopAnim, true, 0);
      } catch (e) {}

      if (typeof window.playPetSound === 'function') {
        const ouchSnds = ['assets/sounds/champion/ouch.wav', 'assets/sounds/champion/ouch2.wav', 'assets/sounds/champion/ouch3.wav'];
        window.playPetSound(ouchSnds[Math.floor(Math.random() * ouchSnds.length)]);
      }

      const ouchQuotes = (window.PET_CONFIG && window.PET_CONFIG.ouchQuotes) || [
        '哎哟！谁在背后暗算我？！',
        '痛痛痛！住手！衣服都要被你扯坏了！',
        '无礼的追随者！刚才不算，这是战术性后退！'
      ];
      if (typeof window.showPetBubble === 'function') {
        window.showPetBubble(ouchQuotes[Math.floor(Math.random() * ouchQuotes.length)], 2800, true);
      }
    },

    // 触发倒地装死：death 与 death2 二选一，绝不连死两次！
    triggerRageDeath(reason = 'hit') {
      this.isRageDead = true;
      this.rageClickTimestamps = [];
      this.pokeClickTimestamps = [];
      this.clearSleepTimers();
      this.isAnimLocked = true;

      try {
        const choices = ['wilson/death', 'wilson/death2'].filter(a => this.hasAnim(a));
        const chosenDeath = choices.length > 0 ? choices[Math.floor(Math.random() * choices.length)] : 'wilson/corpse_hit';
        const dIdle = this.hasAnim('wilson/death2_idle') ? 'wilson/death2_idle' : 'wilson/death_idle';
        this.pet.state.setAnimation(0, chosenDeath, false);
        this.pet.state.addAnimation(0, dIdle, true, 0);
      } catch (e) {}

      const pokeQuotes = [
        '……（被连续狂戳要害，小天体两眼一翻倒地装死）',
        '别戳了……真被你戳死了……（倒地不起）',
        '……（戳成重伤，暂时阵亡）'
      ];
      const rQuotes = (window.PET_CONFIG && window.PET_CONFIG.rageDeath && window.PET_CONFIG.rageDeath.quotes) || [
        '……（受不住连续暴打，小天体倒地不起，进入装死状态）',
        '……勿扰……（彻底闭眼）'
      ];
      const pool = (reason === 'poke') ? pokeQuotes : rQuotes;
      if (typeof window.showPetBubble === 'function') {
        window.showPetBubble(pool[Math.floor(Math.random() * pool.length)], 3500, true);
      }
    },

    // 从装死/报错中满血复活
    reviveFromDead() {
      if (!this.pet) return;
      this.isRageDead = false;
      this.rageClickTimestamps = [];
      this.pokeClickTimestamps = [];
      this.clearSleepTimers();
      this.sleepLevel = 0;
      this.isFallingAsleep = false;
      this.currentTriggerState = "idle";
      const idleCfg = this.getTriggerConfig("idle");
      const idleAnim = this.pickBaseLoop(idleCfg) || "wilson/acting_idle1";
      this.currentBaseLoopAnim = idleAnim;
      if (typeof window.setState === "function") window.setState("idle");
      if (typeof window.setPetWakeLock === "function") window.setPetWakeLock(300000);
      this.wakeLockUntil = Date.now() + 300000;

      try {
        const wakeAnim = this.hasAnim("wilson/wakeup") ? "wilson/wakeup" : idleAnim;
        this.pet.state.setAnimation(0, wakeAnim, false);
        this.pet.state.addAnimation(0, idleAnim, true, 0);
        this.isAnimLocked = true;
        setTimeout(() => { this.isAnimLocked = false; }, 3200);
      } catch (e) {}

      if (typeof window.playPetSound === "function") {
        window.playPetSound("assets/sounds/champion/yawning.wav");
      }
      if (typeof window.showPetBubble === "function") {
        window.showPetBubble("啊呀！我又满血复活了！", 3200, true);
      }
      this.scheduleNextOneShot("idle");
    },

    // 睡眠三阶段被打退
    handleSleepWakeSequence(isRightClick = false) {
      this.clearSleepTimers();
      this.isFallingAsleep = false;
      this.isAnimLocked = true;
      this.wakeLockUntil = Date.now() + 300000;
      if (typeof window.setPetWakeLock === "function") window.setPetWakeLock(300000);

      // 第一步：挨打并进入迷糊状态（“他还在睡觉”）
      const hitAnim = this.hasAnim("wilson/hit_11111000") ? "wilson/hit_11111000" : "wilson/corpse_hit";
      const drowsyAnim = this.hasAnim("wilson/emote_sleepy") ? "wilson/emote_sleepy" : (this.hasAnim("wilson/emote_yawn") ? "wilson/emote_yawn" : "wilson/acting_idle1");
      const wakeAnim = this.hasAnim("wilson/wakeup") ? "wilson/wakeup" : "wilson/acting_idle1";

      try {
        this.pet.state.setAnimation(0, hitAnim, false);
        this.pet.state.addAnimation(0, drowsyAnim, true, 0);
      } catch (e) {}

      if (isRightClick) {
        if (typeof window.playPetSound === "function") window.playPetSound("assets/sounds/champion/ouch.wav");
        if (typeof window.showPetBubble === "function") window.showPetBubble("哎哟！谁啊……别吵我，还在困呢……", 2200, true);
      } else {
        if (typeof window.playPetSound === "function") window.playPetSound("assets/sounds/champion/talk1.wav");
        if (typeof window.showPetBubble === "function") window.showPetBubble("唔……别碰我，还没睡够呢……", 2200, true);
      }

      // 第二步：迷糊片刻（约 2.2 秒后），自动揉眼睛伸懒腰苏醒，并且【必须】播放 wakeup 且紧接 idle！
      const wakeTimer = setTimeout(() => {
        this.clearSleepTimers();
        this.sleepLevel = 0;
        this.isFallingAsleep = false;
        this.currentTriggerState = "idle";
        const idleCfg = this.getTriggerConfig("idle");
        const idleAnim = this.pickBaseLoop(idleCfg) || "wilson/acting_idle1";
        this.currentBaseLoopAnim = idleAnim;
        if (typeof window.setState === "function") window.setState("idle");
        if (typeof window.setPetWakeLock === "function") window.setPetWakeLock(300000);
        this.wakeLockUntil = Date.now() + 300000;

        try {
          this.pet.state.setAnimation(0, wakeAnim, false);
          // 只要是播放了 wake up 就必须接 idle！绝不排队睡眠动画！
          this.pet.state.addAnimation(0, idleAnim, true, 0);
        } catch (e) {}

        if (typeof window.playPetSound === "function") window.playPetSound("assets/sounds/champion/yawning.wav");
        if (typeof window.showPetBubble === "function") window.showPetBubble("哈啊……醒了醒了！随时听候差遣！", 2800, true);

        // 第三步：苏醒完成，恢复完全清醒待命
        setTimeout(() => {
          this.isAnimLocked = false;
          this.resumeToBaseLoop();
          this.scheduleNextOneShot("idle");
        }, 2600);
      }, 2200);

      this.sleepSequenceTimers.push(wakeTimer);
    },

    handleSleepHit() {
      this.handleSleepWakeSequence(true);
    },

    clearSleepTimers() {
      for (const t of this.sleepSequenceTimers) clearTimeout(t);
      this.sleepSequenceTimers = [];
    },

    startSleepTransition() {
      if (Date.now() < this.wakeLockUntil || this.isFallingAsleep || this.sleepLevel > 0) return;
      this.clearSleepTimers();
      this.isFallingAsleep = true;
      this.sleepLevel = 1;

      // 阶段 1：打哈欠发困，坐下发呆 (sit1)
      try {
        const yawnAnim = this.hasAnim("wilson/emote_yawn") ? "wilson/emote_yawn" : "wilson/acting_idle1";
        this.pet.state.setAnimation(0, yawnAnim, false);
        this.pet.state.addAnimation(0, "wilson/emote_loop_sit1", true, 0);
      } catch (e) {}

      // 获取每个阶段的持续时间（默认 60 秒 = 1 分钟，支持在 custom_config.js 中配置）
      let stageSec = 60;
      if (window.PET_CONFIG) {
        if (window.PET_CONFIG.sleepStageDurationSec != null) {
          stageSec = Number(window.PET_CONFIG.sleepStageDurationSec) || 60;
        } else if (window.PET_CONFIG.sleepStageMinutes != null) {
          stageSec = (Number(window.PET_CONFIG.sleepStageMinutes) || 1) * 60;
        }
      }
      const stageMs = Math.max(3000, stageSec * 1000);

      // 阶段 1 持续 1 分钟后，进入阶段 2：打瞌睡，头一点一点 (sit3)
      const t1 = setTimeout(() => {
        if (this.currentTriggerState !== "sleeping") return;
        this.sleepLevel = 2;
        try {
          const doze = this.hasAnim("wilson/emote_sleepy") ? "wilson/emote_sleepy" : "wilson/sleep";
          this.pet.state.setAnimation(0, doze, false);
          this.pet.state.addAnimation(0, "wilson/emote_loop_sit3", true, 0);
        } catch (e) {}
      }, stageMs);

      // 阶段 2 持续 1 分钟后，进入阶段 3：倒头大睡 (bedroll_sleep_loop)
      const t2 = setTimeout(() => {
        if (this.currentTriggerState !== "sleeping") return;
        this.sleepLevel = 3;
        this.isFallingAsleep = false;
        try {
          const deepSleep = this.hasAnim("wilson/bedroll_sleep_loop") ? "wilson/bedroll_sleep_loop" : "wilson/emote_loop_sit2";
          this.pet.state.setAnimation(0, deepSleep, true);
        } catch (e) {}
      }, stageMs * 2);

      this.sleepSequenceTimers.push(t1, t2);
    },

    // ------------------------------------------------------------------------
    // 6. 待机专属微小动作 (One-Shot Flavors)
    // ------------------------------------------------------------------------
    scheduleNextOneShot(stateName) {
      if (this.oneShotTimer) { clearTimeout(this.oneShotTimer); this.oneShotTimer = null; }
      if (!this.isSpineReady || this.isDraggingLocked) return;

      const cfg = this.getTriggerConfig(stateName);
      const intervalSec = this.getRandomInRange(cfg.oneShotInterval, 0);
      if (intervalSec <= 0) return;

      this.oneShotTimer = setTimeout(() => {
        this.oneShotTimer = null;
        this.triggerOneShotFlavor(this.currentTriggerState);
      }, intervalSec * 1000);
    },

    triggerOneShotFlavor(stateName) {
      if (this.isAnimLocked || this.isDraggingLocked || !this.isSpineReady || !this.pet || this.isRageDead) return;
      const cfg = this.getTriggerConfig(stateName);
      const pool = (cfg.oneShotPool || []).filter(a => this.hasAnim(a));
      if (pool.length === 0) {
        this.scheduleNextOneShot(stateName);
        return;
      }

      this.isAnimLocked = true;
      const pickAnim = pool[Math.floor(Math.random() * pool.length)];

      try {
        const isTreatAsLoop = !!cfg.treatLoopAsOneShot;
        const track = this.pet.state.setAnimation(0, pickAnim, isTreatAsLoop);
        let durMs = 2200;
        if (track && track.animation && track.animation.duration > 0) {
          durMs = Math.round(track.animation.duration * 1000);
        }
        if (isTreatAsLoop) {
          durMs = Math.round(this.getRandomInRange(cfg.oneShotDuration, 2.8) * 1000);
        }

        setTimeout(() => {
          this.isAnimLocked = false;
          this.resumeToBaseLoop();
          this.scheduleNextOneShot(this.currentTriggerState);
        }, durMs + 50);
      } catch (e) {
        this.isAnimLocked = false;
        this.resumeToBaseLoop();
      }
    },

    getRandomInRange(range, defVal = 0) {
      if (Array.isArray(range) && range.length >= 2) {
        const min = Number(range[0]) || 0;
        const max = Number(range[1]) || min;
        return min + Math.random() * (max - min);
      }
      return Number(range) || defVal;
    },

    // ------------------------------------------------------------------------
    // 7. 漫步与跳舞模式
    // ------------------------------------------------------------------------
    async startWander() {
      if (!this.pet || !this.isSpineReady) return;
      if (this.currentTriggerState !== 'idle' || this.isDraggingLocked || this.isAnimLocked || this.isFallingAsleep || this.sleepLevel > 0 || this.isWandering || this.isRageDead) return;
      if (!window.pet || typeof window.pet.getWinPos !== 'function' || typeof window.pet.setWinPos !== 'function') return;

      const cfg = (window.PET_CONFIG && window.PET_CONFIG.idleWander) || {};
      if (cfg.enabled === false) return;

      let winPos;
      try {
        winPos = await window.pet.getWinPos();
      } catch (e) { return; }
      if (!Array.isArray(winPos) || !Number.isFinite(winPos[0]) || !Number.isFinite(winPos[1])) return;

      const origWinX = winPos[0];
      const origWinY = winPos[1];
      this.wanderOriginWinPos = [origWinX, origWinY];

      const baseScale = Math.abs((window.PET_CONFIG && window.PET_CONFIG.championScale != null) ? window.PET_CONFIG.championScale : 0.368);
      const speedPx = cfg.speedPxPerSec || 55;
      const maxSide = cfg.maxOffsetSide || 85;
      const maxUp = cfg.maxOffsetUp || 45;
      const maxDown = cfg.maxOffsetDown || 45;

      const roundsRange = cfg.patrolRounds || [1, 5];
      const minRounds = Math.max(1, roundsRange[0] || 1);
      const maxRounds = Math.max(minRounds, roundsRange[1] || 5);
      const totalLegs = Math.floor(Math.random() * (maxRounds - minRounds + 1)) + minRounds;

      const pauseRange = cfg.pauseIntervalRange || [1, 20];
      const minP = Math.max(1, pauseRange[0] || 1);
      const maxP = Math.max(minP, pauseRange[1] || 20);

      this.isWandering = true;
      this.isAnimLocked = true;

      const self = this;
      let legIndex = 0;
      let currentX = origWinX;
      let currentY = origWinY;

      function runNextLeg() {
        if (!self.isWandering || self.currentTriggerState !== idle || self.isDraggingLocked || self.isRageDead) {
          self.stopWander();
          return;
        }

        if (legIndex >= totalLegs) {
          self.stopWander();
          return;
        }

        const isFinalLeg = (legIndex === totalLegs - 1);
        let targetX = origWinX;
        let targetY = origWinY;

        if (!isFinalLeg) {
          let tries = 0;
          const distJitter = (cfg.distJitter != null) ? cfg.distJitter : 0.4;
          const jitterFactor = 1 + (Math.random() * 2 - 1) * distJitter;
          do {
            const offsetX = (Math.random() * 2 - 1) * maxSide * jitterFactor;
            const offsetY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * (Math.random() > 0.5 ? maxDown : maxUp)) * jitterFactor;
            targetX = Math.round(origWinX + offsetX);
            targetY = Math.round(origWinY + offsetY);
            tries++;
          } while (Math.hypot(targetX - currentX, targetY - currentY) < 35 && tries < 5);
        }

        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const dist = Math.hypot(dx, dy);

        if (dist < 5) {
          legIndex++;
          runNextLeg();
          return;
        }

        let walkAnim = wilson/run_loop_side;
        if (Math.abs(dx) >= Math.abs(dy)) {
          walkAnim = wilson/run_loop_side;
          self.pet.scale.x = (dx < 0) ? -baseScale : baseScale;
        } else {
          if (dy < 0) {
            walkAnim = wilson/run_loop_up;
            self.pet.scale.x = baseScale;
          } else {
            walkAnim = wilson/run_loop_down;
            self.pet.scale.x = baseScale;
          }
        }

        try {
          self.pet.state.setAnimation(0, walkAnim, true);
        } catch (e) {}

        const legStartTime = performance.now();
        const legDur = Math.max(500, (dist / speedPx) * 1000);
        const fromX = currentX;
        const fromY = currentY;

        function stepLeg(now) {
          if (!self.isWandering || self.currentTriggerState !== idle || self.isDraggingLocked || self.isRageDead) {
            self.stopWander();
            return;
          }
          const elapsed = now - legStartTime;
          const progress = Math.min(1, elapsed / legDur);
          const curWinX = Math.round(fromX + dx * progress);
          const curWinY = Math.round(fromY + dy * progress);
          window.pet.setWinPos(curWinX, curWinY);

          if (progress < 1) {
            self.wanderRafId = requestAnimationFrame(stepLeg);
          } else {
            currentX = targetX;
            currentY = targetY;

            self.pet.scale.x = baseScale;
            try {
              const pauseAnim = (typeof self.currentBaseLoopAnim === 'string' && self.hasAnim(self.currentBaseLoopAnim)) ? self.currentBaseLoopAnim : "wilson/acting_idle1";
              self.pet.state.setAnimation(0, pauseAnim, true);
            } catch (e) {}

            legIndex++;
            if (legIndex < totalLegs) {
              const nextPauseDur = (minP + Math.random() * (maxP - minP)) * 1000;
              self.wanderTimerId = setTimeout(runNextLeg, nextPauseDur);
            } else {
              self.stopWander();
            }
          }
        }
        self.wanderRafId = requestAnimationFrame(stepLeg);
      }

      runNextLeg();
    },

    stopWander() {
      if (!this.isWandering) return;
      this.isWandering = false;
      this.isAnimLocked = false;
      if (this.wanderRafId) { cancelAnimationFrame(this.wanderRafId); this.wanderRafId = null; }
      if (this.wanderTimerId) { clearTimeout(this.wanderTimerId); this.wanderTimerId = null; }
      if (this.wanderOriginWinPos && window.pet && typeof window.pet.setWinPos === 'function') {
        window.pet.setWinPos(this.wanderOriginWinPos[0], this.wanderOriginWinPos[1]);
      }
      const baseScale = Math.abs((window.PET_CONFIG && window.PET_CONFIG.championScale != null) ? window.PET_CONFIG.championScale : 0.368);
      if (this.pet) {
        this.pet.scale.set(baseScale);
      }
      this.wanderOriginWinPos = null;
      this.resumeToBaseLoop();
    },

    toggleDanceMode() {
      this.isDanceMode = !this.isDanceMode;
      const text = this.isDanceMode ? "✨ 开启跳舞舞模式！" : "🛑 停止工作跳舞。";
      if (typeof window.showPetBubble === "function") window.showPetBubble(text, 3200, true);
      if (typeof window.playPetSound === "function") {
        const dSounds = ["assets/sounds/champion/emoting.wav", "assets/sounds/champion/emoting1.wav"];
        window.playPetSound(dSounds[Math.floor(Math.random() * dSounds.length)]);
      }
      const isWorking = (this.currentTriggerState === 'working' || this.currentTriggerState === 'juggling' || this.currentTriggerState === 'carrying');
      if (isWorking) {
        this.updateSpine(this.currentTriggerState, true);
      }
    },

    checkWorkingFatigue(s) {
      if (!window.PET_CONFIG || !window.PET_CONFIG.fatigue || !window.PET_CONFIG.fatigue.enabled) return;
      if (s === 'working' || s === 'thinking') {
        const now = Date.now();
        if (!this.workingStartTime) this.workingStartTime = now;
        const workMin = Number(window.PET_CONFIG.fatigue.workingMinutes) || 5;
        const coolMin = Number(window.PET_CONFIG.fatigue.cooldownMinutes) || 3;
        if (now - this.workingStartTime >= workMin * 60000) {
          if (!this.lastFatigueTriggerTime || now - this.lastFatigueTriggerTime >= coolMin * 60000) {
            this.lastFatigueTriggerTime = now;
            if (this.hasAnim('wilson/heavy_idle_down')) {
              this.isAnimLocked = true;
              this.pet.state.setAnimation(0, 'wilson/heavy_idle_down', true);
              setTimeout(() => {
                this.isAnimLocked = false;
                this.resumeToBaseLoop();
              }, 4500);
            }
            if (typeof window.showPetBubble === 'function') {
              window.showPetBubble('……写了好多代码，本英雄有点累了~', 4500, true);
            }
          }
        }
      } else {
        this.workingStartTime = null;
      }
    },

    // ------------------------------------------------------------------------
    // 更衣室与换装系统 (Wardrobe & Accessories) —— 原生 Spine 插槽 Attachment 换装
    // ------------------------------------------------------------------------
    toggleHat(hatId = "hat_alterguardian") {
      if (this.currentHat) {
        this.removeHat();
      } else {
        this.wearHat(hatId);
      }
    },

    // 创建或克隆原生 RegionAttachment 并挂载到 Spine 插槽
    createSpineRegionAttachment(origAtt, name, texture, offsetX, offsetY, scaleX, scaleY, slot) {
      if (!texture || !origAtt) return null;
      // 基于原有 RegionAttachment 原型克隆，继承所有核心算法与方法
      const att = Object.assign(Object.create(Object.getPrototypeOf(origAtt)), origAtt);
      att.name = name;
      att.offset = new Float32Array(8);
      att.uvs = new Float32Array(8);

      let region = null;
      if (window.PIXI && window.PIXI.spine && typeof window.PIXI.spine.TextureRegion === "function") {
        try {
          region = new window.PIXI.spine.TextureRegion();
        } catch (e) {}
      }
      if (!region) region = {};
      region.texture = texture;

      att.region = region;
      att.scaleX = (typeof scaleX === "number") ? scaleX : 1.85;
      att.scaleY = (typeof scaleY === "number") ? scaleY : 1.85;
      att.rotation = 0;
      att.x = (typeof offsetX === "number") ? offsetX : -4;
      att.y = (typeof offsetY === "number") ? offsetY : 158;

      const updateRegionData = () => {
        const frame = texture.frame || { x: 0, y: 0, width: texture.width || 250, height: texture.height || 150 };
        const baseTex = texture.baseTexture || { width: frame.width, height: frame.height };
        const orig = texture.orig || frame;
        if (baseTex.width && baseTex.height) {
          region.u = frame.x / baseTex.width;
          region.v = frame.y / baseTex.height;
          region.u2 = (frame.x + frame.width) / baseTex.width;
          region.v2 = (frame.y + frame.height) / baseTex.height;
          region.width = orig.width || frame.width;
          region.height = orig.height || frame.height;
          region.originalWidth = region.width;
          region.originalHeight = region.height;
          region.offsetX = 0;
          region.offsetY = 0;
          region.rotate = false;

          att.width = region.width;
          att.height = region.height;

          if (typeof att.setRegion === "function") {
            att.setRegion(region);
          } else {
            att.uvs[0] = region.u;
            att.uvs[1] = region.v2;
            att.uvs[2] = region.u;
            att.uvs[3] = region.v;
            att.uvs[4] = region.u2;
            att.uvs[5] = region.v;
            att.uvs[6] = region.u2;
            att.uvs[7] = region.v2;
          }
          if (typeof att.updateOffset === "function") {
            att.updateOffset();
          }
          if (slot && slot.currentSprite) {
            slot.currentSprite.region = null;
            slot.currentSprite.attachment = null;
          }
        }
      };

      if (texture.baseTexture && !texture.baseTexture.hasLoaded) {
        texture.baseTexture.once("loaded", updateRegionData);
      } else {
        updateRegionData();
      }

      return att;
    },

    wearHat(hatId = "hat_alterguardian") {
      if (!this.pet || !this.pet.skeleton || !window.PIXI) return;
      const sk = this.pet.skeleton;
      const slotIndex = sk.findSlotIndex("hat-1");
      if (slotIndex === -1) {
        console.warn("[ChampionController] hat-1 slot not found in skeleton");
        return;
      }
      const slot = sk.slots[slotIndex];
      const defaultSkin = sk.data && sk.data.defaultSkin;
      if (!defaultSkin) return;

      // 1. 备份原始 Attachment（用于脱下时复原）
      if (!this.origHatAttachments) {
        this.origHatAttachments = {
          "swap_hat-0": defaultSkin.getAttachment(slotIndex, "swap_hat-0"),
          "swap_hat-1": defaultSkin.getAttachment(slotIndex, "swap_hat-1"),
          "swap_hat-2": defaultSkin.getAttachment(slotIndex, "swap_hat-2")
        };
      }

      // 2. 加载切片纹理并构建 3 个朝向的原生 Attachment
      const basePath = "assets/wardrobe/" + hatId + "/swap_hat/";
      const tex0 = PIXI.Texture.from(new URL("../" + basePath + "swap_hat-0.png", window.location.href).href);
      const tex1 = PIXI.Texture.from(new URL("../" + basePath + "swap_hat-1.png", window.location.href).href);
      const tex2 = PIXI.Texture.from(new URL("../" + basePath + "swap_hat-2.png", window.location.href).href);

      const templateAtt = this.origHatAttachments["swap_hat-0"] || sk.getAttachment(slotIndex, "swap_hat-0");
      if (!templateAtt) return;

      // 正面 (down)：中心对齐，位于头顶
      const att0 = this.createSpineRegionAttachment(templateAtt, "swap_hat-0", tex0, -4, 158, 1.85, 1.85, slot);
      // 侧面 (side)：根据官方 scml pivot_x 0.582, pivot_y -0.142 与侧面视觉微调
      const att1 = this.createSpineRegionAttachment(templateAtt, "swap_hat-1", tex1, -22, 168, 1.85, 1.85, slot);
      // 背面 (up)：背面中心对齐
      const att2 = this.createSpineRegionAttachment(templateAtt, "swap_hat-2", tex2, -4, 158, 1.85, 1.85, slot);

      this.hatAttachments = {
        "swap_hat-0": att0,
        "swap_hat-1": att1,
        "swap_hat-2": att2
      };

      // 3. 注册到 defaultSkin 和当前 skin
      defaultSkin.setAttachment(slotIndex, "swap_hat-0", att0);
      defaultSkin.setAttachment(slotIndex, "swap_hat-1", att1);
      defaultSkin.setAttachment(slotIndex, "swap_hat-2", att2);
      if (sk.skin && sk.skin !== defaultSkin) {
        sk.skin.setAttachment(slotIndex, "swap_hat-0", att0);
        sk.skin.setAttachment(slotIndex, "swap_hat-1", att1);
        sk.skin.setAttachment(slotIndex, "swap_hat-2", att2);
      }

      // 4. 应用到当前插槽并强制重置渲染缓存
      const curAttName = (slot.attachment && slot.attachment.name) || "swap_hat-0";
      const targetAtt = this.hatAttachments[curAttName] || att0;
      slot.setAttachment(targetAtt);

      if (slot.currentSprite) {
        slot.currentSprite.region = null;
        slot.currentSprite.attachment = null;
        slot.currentSprite.visible = true;
        slot.currentSprite.renderable = true;
      }
      if (this.pet.slotContainers && this.pet.slotContainers[slotIndex]) {
        this.pet.slotContainers[slotIndex].visible = true;
      }

      this.currentHat = hatId;

      if (typeof window.showPetBubble === "function") {
        window.showPetBubble("👑 启迪王冠已加冕！天体英雄重获神格！", 3500);
      }
      if (typeof this.playTalking === "function") {
        this.playTalking(1500);
      }
      if (typeof window.playPetSound === "function") {
        window.playPetSound("assets/sounds/champion/talk1.wav");
      }
    },

    removeHat() {
      if (!this.pet || !this.pet.skeleton) {
        this.currentHat = null;
        return;
      }
      const sk = this.pet.skeleton;
      const slotIndex = sk.findSlotIndex("hat-1");
      const slot = (slotIndex !== -1 && sk.slots) ? sk.slots[slotIndex] : null;
      const defaultSkin = sk.data && sk.data.defaultSkin;

      // 恢复 defaultSkin 中的原始 Attachment
      if (defaultSkin && this.origHatAttachments && slotIndex !== -1) {
        if (this.origHatAttachments["swap_hat-0"]) defaultSkin.setAttachment(slotIndex, "swap_hat-0", this.origHatAttachments["swap_hat-0"]);
        if (this.origHatAttachments["swap_hat-1"]) defaultSkin.setAttachment(slotIndex, "swap_hat-1", this.origHatAttachments["swap_hat-1"]);
        if (this.origHatAttachments["swap_hat-2"]) defaultSkin.setAttachment(slotIndex, "swap_hat-2", this.origHatAttachments["swap_hat-2"]);
        if (sk.skin && sk.skin !== defaultSkin) {
          if (this.origHatAttachments["swap_hat-0"]) sk.skin.setAttachment(slotIndex, "swap_hat-0", this.origHatAttachments["swap_hat-0"]);
          if (this.origHatAttachments["swap_hat-1"]) sk.skin.setAttachment(slotIndex, "swap_hat-1", this.origHatAttachments["swap_hat-1"]);
          if (this.origHatAttachments["swap_hat-2"]) sk.skin.setAttachment(slotIndex, "swap_hat-2", this.origHatAttachments["swap_hat-2"]);
        }
      }

      if (slot) {
        const origAtt = (this.origHatAttachments && this.origHatAttachments["swap_hat-0"]) || null;
        slot.setAttachment(origAtt);
        if (slot.currentSprite) {
          slot.currentSprite.region = null;
          slot.currentSprite.attachment = null;
        }
      }

      this.currentHat = null;

      if (typeof window.showPetBubble === "function") {
        window.showPetBubble("✨ 已卸下头饰", 2500);
      }
      if (typeof this.playTalking === "function") {
        this.playTalking(1200);
      }
    },
  };

  window.ChampionController = ChampionController;
  window.ChampionSpineController = ChampionController;
  window.toggleChampionHat = function(id) { ChampionController.toggleHat(id); };

  // 向后兼容适配桥接（保证旧函数调用直接安全代理到 ChampionController）
  window.playChampionTalking = function(durationMs) { ChampionController.playTalking(durationMs); };
  window.updateChampionSpine = function(s, force) { ChampionController.updateSpine(s, force); };
  window.playChampionDragAnim = function(isDrag) { ChampionController.playDragAnim(isDrag); };
  window.handleChampionBodyLeftClick = function(el) { ChampionController.onLeftClick(el); };
  window.handleChampionBodyLeftDoubleClick = function(el) { ChampionController.onLeftDoubleClick(el); };
  window.handleChampionBodyRightClick = function(el) { ChampionController.onRightClick(el); };
  window.stopChampionWander = function() { ChampionController.stopWander(); };
  window.startChampionWander = function() { ChampionController.startWander(); };
  window.toggleChampionDanceMode = function() { ChampionController.toggleDanceMode(); };

})(window);
