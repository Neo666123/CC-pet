// ============================================================================
// 🌙 CCPET（小天体桌宠）用户全能配置接口 (User Custom Configuration)
// ============================================================================
// 提示：所有参数已全部暴露在此！你可以随时手动修改，保存后刷新或重开桌宠即刻生效。
// ============================================================================

window.PET_CONFIG = {
  // --------------------------------------------------------------------------
  // 1. 【角色大小缩放与坐标偏移】
  // --------------------------------------------------------------------------
  championScale: 0.368, // 角色大小缩放（原版 0.307，放大 0.2 倍即 0.368）
  championX: 100,       // 水平中心点偏移 (默认 100)
  championY: 205,       // 垂直底部对齐偏移 (默认 205)

  // --------------------------------------------------------------------------
  // 1.5 音量设置 (Volume Settings) 0.0 ~ 1.0
  // --------------------------------------------------------------------------
  idleSleepMinutes: 0.1,   // 测试睡眠专用：闲置几分钟后开始入睡过渡 (0.1即6秒)
  sleepStageDurationSec: 60, // 每个睡眠阶段持续时间 (秒，默认60秒即1分钟，测试时可改小如5秒)   // 测试睡眠专用：闲置几分钟后自动睡觉 (0.1就是6秒)
  soundVolume: 0.5,      // 日常语音/普通音效音量 (默认 0.1)
  hitSoundVolume: 0.3,   // 挨打/暴毙等激烈音效音量 (默认 0.2)       // 垂直底部对齐偏移 (默认 205)

  // --------------------------------------------------------------------------
  // 2. 【多会话小圆点、对话气泡与名牌高度调节】
  // --------------------------------------------------------------------------
  dotsOffsetY: 55,      // 会话小点点向下靠近头顶的距离
  bubbleOffsetY: 15,    // 对话气泡向下靠近头顶的距离
  bottomPadding: 34,    // 底部名牌与边距高度 (防止截断名牌)

  // --------------------------------------------------------------------------
  // 3. 【点击角色身体是否打开会话列表】
  // --------------------------------------------------------------------------
  // false (推荐): 点击身体绝不霸占菜单！仅触发戳一戳抗议/点击说话/换站姿；
  //               点击下方两块名牌（Token消耗条 / Codex名牌）才打开列表和唤醒Codex。
  // true: 点击身体也会打开列表。
  allowBodyClickToOpenMenu: false,

  // --------------------------------------------------------------------------
  // 4. 【🌙 全状态触发器 (Trigger) 动作调度总表】
  // --------------------------------------------------------------------------
  // 每个 Trigger 统一支持以下可自由调整的参数：
  // • baseLoops: 主要 loop 动作池（支持单个动作、动作数组、或加权数组 [{ anim: '...', weight: 6 }]）
  // • clickSwitchLoopChance: 点击后切换主要 loop 动作的概率 (0 ~ 1.0，1.0 = 100% 必切换，0 = 不切换)
  // • playOneShotOnEnter: 切换到该状态后，是否立马播放一次单次动作 (true / false)
  // • oneShotInterval: 单次小动作随机抽取的间隔秒数 [minSec, maxSec] (1~100秒随意调整，如 [30, 45] 或 [10, 15])
  // • oneShotPool: 单次小动作抽取池 (播完一次后自动平滑回到当前的 baseLoop)
  // • treatLoopAsOneShot: 某些动作为循环 loop，是否将其作为临时单次动作播放 (true / false)
  // • oneShotDuration: 若 treatLoopAsOneShot 为 true，播放时长秒数范围 [minSec, maxSec] (如 [2.5, 4.0])
  // --------------------------------------------------------------------------
  triggers: {
    // 【一、持续核心主状态 (8个)】
    idle: {
      baseLoops: [
        { anim: 'wilson/acting_idle1', weight: 5 },
        { anim: 'wilson/idle_loop_down', weight: 5 }
      ],
      clickSwitchLoopChance: 0.6,      // 点击身体有 60% 概率平滑切换站姿
      playOneShotOnEnter: false,
      oneShotInterval: [25, 45],       // 25~45 秒抽一次小动作
      comboChance: 0.35,              // 连击抽奖概率
      comboCount: [1, 3],             // 连续播放段数区间 [1, 3]
      oneShotPool: [
        'wilson/idle_inaction_down',
        'wilson/emote_feet',
        'wilson/emote_hands',
        'wilson/emote_hat',
        'wilson/emote_impatient',
        'wilson/emote_pants',
        'wilson/quick_eat',
        'wilson/quick_drink',
        'wilson/idle_wanda_down',
        'wilson/idle3_waxwell',
        'wilson/idle2_waxwell_down',
        'wilson/lancecharge_bash_down'
      ],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.5, 4.0]
    },

    tired: {
      baseLoops: [
        'wilson/idle_sanity_loop_down',
        'wilson/heavy_idle_down'
      ],
      clickSwitchLoopChance: 0.4,
      playOneShotOnEnter: true,        // 刚累趴立马叹气
      oneShotInterval: [10, 15],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: [
        'wilson/idle_inaction_sanity_down',
        'wilson/heavy_idle_down'
      ],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.5]
    },

    working: {
      baseLoops: [
       //  { anim: 'wilson/drone_zap_remote_use_loop', weight: 6 },
      //  { anim: 'wilson/emoteXL_loop_dance0', weight: 3 },
        { anim: 'wilson/build_loop_side', weight: 1 },
        { anim: 'wilson/build_loop_up', weight: 1 }
      ],
      danceLoops: [
        { anim: 'wilson/emoteXL_loop_dance0', weight: 3 },
        { anim: 'wilson/emoteXL_loop_dance7', weight: 2 },
        { anim: 'wilson/emoteXL_loop_dance8', weight: 1 },
        { anim: 'wilson/hatdance2_loop', weight: 1 }
      ],
      workingCandidatePool: [
        // 'wilson/drone_zap_remote_use_loop',
       // 'wilson/emoteXL_loop_dance0',
        // 'wilson/emoteXL_loop_dance7',
        'wilson/build_loop_side',
        'wilson/build_loop_up'
      ],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: false,
      oneShotInterval: [40, 70],
      comboChance: 0.35,
      comboCount: [1, 3],
      oneShotPool: [
      //  'wilson/emoteXL_loop_dance7'
      ],
      treatLoopAsOneShot: true,
      oneShotDuration: [2.5, 4.0]
    },

    thinking: {
  baseLoops: ['wilson/emote_loop_carol', 'mason_death_loop'],
  clickSwitchLoopChance: 0.5,
  playOneShotOnEnter: true,
  oneShotInterval: [6, 20],
  comboChance: 0,
  comboCount: [1, 1],
  oneShotPool: ['wilson/book'],
  treatLoopAsOneShot: false,
  oneShotDuration: [2.0, 3.0]
},

    juggling: {
      baseLoops: ['wilson/mason_death_loop'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0,
      comboCount: [1, 1],
      oneShotPool: [],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    carrying: {
      baseLoops: [
        'wilson/mason_death_loop',
        'wilson/channelcast_walk_side'
      ],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: false,
      oneShotInterval: [20, 40],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/channelcast_walk_side'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    sweeping: {
      baseLoops: [
        'wilson/channelcast_oh_walk_side',
        'wilson/channelcast_oh_walk_down'
      ],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,        // 刚进入立马播放一次不耐烦
      oneShotInterval: [15, 30],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_impatient'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    roam: {
      baseLoops: [
        'wilson/run_loop_up',
        'wilson/run_loop_side',
        'wilson/run_loop_down'
      ],
      clickSwitchLoopChance: 0.7,
      playOneShotOnEnter: false,
      oneShotInterval: [15, 30],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_waving'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    sleeping: {
      baseLoops: ['wilson/bedroll_sleep_loop'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: false,
      oneShotInterval: [0, 0],
      comboChance: 0,
      comboCount: [1, 1],
      oneShotPool: [],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    // 【二、阻塞与交互提醒 (4个)】
    waiting: {
      baseLoops: [
        'wilson/channelcast_idle_dial_loop_down',
        'wilson/look_down',
        'wilson/look_side'
      ],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,
      oneShotInterval: [8, 15],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/x1', 'wilson/mason_death_loop'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    needsinput: {
      baseLoops: ['wilson/channelcast_oh_idle_dial_loop_down'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [10, 20],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/whistle', 'wilson/emote_waving'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    attention: {
      baseLoops: ['wilson/acting_idle1', 'wilson/idle_loop_down'],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,        // 任务跑完立马鼓掌/欢呼/招手！
      oneShotInterval: [8, 16],
      comboChance: 0.35,
      comboCount: [1, 3],
      oneShotPool: ['wilson/emote_slowclap', 'wilson/emote_jumpcheer', 'wilson/emote_waving'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.5]
    },

    error: {
      baseLoops: ['wilson/death2_idle', 'wilson/death_idle'],
      clickSwitchLoopChance: 0.3,
      playOneShotOnEnter: true,
      oneShotInterval: [15, 30],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_sad'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    // 【三、短暂情绪态 (8个)】
    happy: {
      baseLoops: ['wilson/emoteXL_loop_dance6', 'wilson/emote_loop_toast', 'wilson/hatdance2_loop'],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: false,
      oneShotInterval: [0, 0],
      comboChance: 0,
      comboCount: [1, 1],
      oneShotPool: [],
      treatLoopAsOneShot: true,
      oneShotDuration: [2.5, 4.0]
    },

    greet: {
      baseLoops: ['wilson/acting_idle1', 'wilson/idle_loop_down'],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0.3,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_slowclap', 'wilson/emote_waving'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    talking: {
      baseLoops: [
        { anim: 'wilson/acting_idle1', weight: 5 },
        { anim: 'wilson/idle_loop_down', weight: 5 }
      ],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0,
      comboCount: [1, 1],
      oneShotPool: ['wilson/dial_loop', 'wilson/acting_1', 'wilson/acting_2'],
      treatLoopAsOneShot: true,
      oneShotDuration: [1.8, 2.5]
    },

    loafing: {
      baseLoops: ['wilson/acting_idle1', 'wilson/idle_loop_down'],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,
      oneShotInterval: [12, 25],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/bell', 'wilson/book', 'wilson/hungry', 'wilson/emoteXL_loop_dance7', 'wilson/emoteXL_loop_dance8'],
      treatLoopAsOneShot: true,
      oneShotDuration: [2.0, 3.5]
    },

    loved: {
      baseLoops: ['wilson/acting_idle1', 'wilson/idle_loop_down'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0,
      comboCount: [1, 1],
      oneShotPool: ['wilson/emote_happycheer'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    sad: {
      baseLoops: ['wilson/acting_idle1', 'wilson/idle_loop_down'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0.3,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_angry', 'wilson/emote_fistshake', 'wilson/emote_sad'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    sorry: {
      baseLoops: ['wilson/acting_idle1', 'wilson/idle_loop_down'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0.35,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_annoyed_facepalm', 'wilson/emote_annoyed_palmdown', 'wilson/emote_sad', 'wilson/mason_death'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    puzzled: {
      baseLoops: ['wilson/channelcast_oh_idle_down'],
      clickSwitchLoopChance: 0,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0.3,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_shrug', 'wilson/emote_sad', 'wilson/heavy_refuseeat'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    // 【四、入睡与苏醒过渡序列 (4个)】
    yawning: {
      baseLoops: ['wilson/emote_loop_sit1', 'wilson/emote_loop_sit4'],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,
      oneShotInterval: [10, 15],
      comboChance: 0.3,
      comboCount: [1, 2],
      oneShotPool: ['wilson/emote_yawn'],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    },

    dozing: {
  baseLoops: ['wilson/emote_loop_sit3', 'wilson/down_hideandseek_loop'],
  clickSwitchLoopChance: 0.5,
  playOneShotOnEnter: true,  
  oneShotInterval: [8, 15],
  comboChance: 0.3,
  comboCount: [1, 2],
  oneShotPool: ['wilson/emote_sleepy', 'wilson/emote_sad'], 
  treatLoopAsOneShot: false,
  oneShotDuration: [2.0, 3.0]
},

    collapsing: {
      baseLoops: ['wilson/emote_loop_sit2', 'wilson/bedroll_sleep_loop'],
      clickSwitchLoopChance: 0.5,
      playOneShotOnEnter: true,
      oneShotInterval: [0, 0],
      comboChance: 0,
      comboCount: [1, 1],
      oneShotPool: [],
      treatLoopAsOneShot: false,
      oneShotDuration: [2.0, 3.0]
    }
  },

  landingQuotes: [
    "哎呀！谁在暗算我？！",
    "……咳咳。",
    "是谁把地面放得这么高？！",
    "真是野蛮！",
    "刚才什么都没发生！",
    "别看了！",
    "刚才那阵风是怎么回事？",
    "简直毫无道理！",
    "哎呀！",
    "站住！",
    "啊呀！",
    "可恶！",
    "快扶我一下！",
    "你刚才是不是故意撞上来的？！",
    "……呀！"
],

  ouchQuotes: [
    '哎呀！谁在背后暗算我？！',
    '住手！',
    '无礼！',
    '呀！',
    '可恶，等我理智恢复了有你好看的！'
  ],


  // --------------------------------------------------------------------------
  // 7. 【点击小天体说话台词与语音库 (饥荒原版小天体中文化精选)】
  // --------------------------------------------------------------------------
 clickDialogues: [
    { text: "有何代码难题需要我出手？" },
    { text: "追随者，又在偷偷崇拜我的英姿吗？" },
    { text: "别戳啦！我在帮你看代码！" },
    { text: "美丽的月光正庇佑这片桌面，好好看我干活吧！" },

    { text: "你这个败类！我要代表月亮审判你的罪恶！" },
    { text: "你这个败类！我要代表月亮审判你的罪恶！" },
    { text: "别烦我！" },
    { text: "别妨碍我。" },
    { text: "别妨碍我。" },
    { text: "我要代表月亮惩罚你！" },
    { text: "写得好！全世界都该记住，我就是唯一的英雄！" },
    { text: "这是对神明的亵渎！" },
    { text: "你居然给伟大的英雄吃垃圾？" },
    { text: "他在试图以此阻挡神明？" },
    { text: "英雄偶尔也要以此施舍仁慈！" },
    { text: "这个世界即将迎来月亮统治的时刻。" },
    { text: "凡人们，享受我的恩赐吧。" },
    { text: "仆人们，我的供奉在哪？" },
    { text: "别愣着了，饥饿正在冒犯我！" },
    { text: "喂！别在那傻站着，过来膜拜我！" },
    { text: "看见没？它们都在崇拜我。" },
    { text: "真是一群狂热的粉丝。" },
    { text: "快信仰我吧，虫子们。" },
    { text: "这算是……进贡吗？" },
    { text: "为什么要在这些愚蠢的生物上浪费时间？供奉我吧！" },
    { text: "愚蠢的生物，你在羞辱我吗！" },
    { text: "你的小把戏对我没用，凡人！" },
    { text: "随你想做什么，低等生物的野心终会不值一提。" },
    { text: "我不需要这种凡人的救生圈。" },
    { text: "哈！凡人的容器撑不住了。" },
    { text: "它们是来瞻仰我，还是来送死的？" },
    { text: "这些野兽妄想挑战我的光辉。" },
    { text: "它的光芒跟我比起来不值一提。" },
    { text: "公正的站台上应该站着公正的我。" },
    { text: "它折服于我的聪明才智。" },
    { text: "我就是征服海洋的人！" },
    { text: "忘了失败是什么感觉，好吧我根本没经历过失败。" },
    { text: "为什么不出一个天体英雄年？" },

    { text: "我不属于这里！" },
    { text: "你要送我回家吗？" },
    { text: "连它们都已经来了，或许不久以后我就可以回去了。" },
    { text: "可惜，我不能从这里回去。" },
    { text: "好像发生了什么奇怪的事...我想回月亮上看看了。" },
    { text: "在这上面就像回家了一样。" },
    { text: "它不能带我回到故乡，别看了。" },
    { text: "它已经离开月亮太久了..." },
    { text: "即即便裂隙还在，我的荣光也早就丢了。" },
    { text: "我怎么落得如此下场了。" },
    { text: "做完它我将化成月光。" },
    { text: "月光...接引我..." },
    { text: "月光...再给我一些力量吧..." },
    { text: "月光的力量才是最好的！" },
    { text: "让月亮接管世界的入口！" },
    { text: "让月光降下恩典。" },
    { text: "让事物接受月光的点化。" },
    { text: "月光不屑于光临地下。" },
    { text: "是谁篡改了月光？！" },
    { text: "脱离月光照耀的东西就是如此野蛮。" },
    { text: "我只会供奉月光！" },
    { text: "是谁在崇拜月亮？真是明智的选择。" },
    { text: "多么纯粹……那是我的本源。" },
    { text: "它本应归我，而不是沦为地上的陷阱。" },
    { text: "它也曾是我的一部分。" },
    { text: "它的形态正向我的轮廓演变。" },
    { text: "这是属于我的！" },
    { text: "把你偷走的东西还回来！" },
    { text: "它窃取月亮的力量！" },
    { text: "偷窃月能的核心，脏物。" },
    { text: "窃取我力量的囚笼，看着就令人作呕。" },
    { text: "竟敢用我来驱动这堆废铁！" },
    { text: "纯粹的光辉将在这里为我所用。" },
    { text: "这才是我喜欢的盔甲。" },
    { text: "用月光劈开黑暗。" },
    { text: "用月光粉碎一切。" },
    { text: "尽管来吧，我的月光会消融你们！" },
    { text: "伟大的月亮造物！我能把它带走吗？" },
    { text: "这就是我的本命宝石！" },
    { text: "哎...它身上有暗影的气息，我的月能鞭去哪了？" },
    { text: "没有我的月能鞭好看。" },
    { text: "啊...多彩的宝石折射出完美的月光！" },
    { text: "美丽的月亮碎片！" },
    { text: "充满了美丽的月光！" },

    { text: "我快要冻碎了。" },
    { text: "快融化了！" },
    { text: "我也不想变成玻璃渣。" },
    { text: "为什么不变成闪亮的玻璃？" },
    { text: "我该不会快要从内部瓦解了吧...." },
    { text: "不……我的光呢？别靠近我！" },
    { text: "我没有脚。" },
    { text: "我没有牙齿。" },
    { text: "我没有渴这种生理反应。" },
    { text: "还好我没有眼泪。" },
    { text: "我的闪电比它耀眼。" },
    { text: "它的尖啸在吸引着我的雷霆将他穿透。" },
    { text: "我的斗篷沾湿了。" },
    { text: "快湿透了！" },
    { text: "我讨厌这种感觉，快想想办法！" },
    { text: "真麻烦！我像是落水了！" },
    { text: "很好，让我的斗篷保持干燥。" },
    { text: "它差点烧到我的斗篷！" },
    { text: "我还是喜欢我的斗篷。" },
    { text: "也许我的皇冠能容得下它..." },
    { text: "我说过它粘不上我的头冠的。" },
    { text: "如果我的头冠可以修好，我不会选择这个。" },
    { text: "衣服简直是累赘。" },
    { text: "我没有多余的衣服。" },
    { text: "我想我的体感就已经够精准。" },

    { text: "查理，别用你那肮脏的手碰我！" },
    { text: "谁在那？快从影子里滚出来！" },
    { text: "该死！竟敢用阴影羞辱我！" },
    { text: "这不可能……阴影在吞噬我！" },
    { text: "卑微的底层暗影。" },
    { text: "肮脏的暗影力量在震动！" },
    { text: "无能的暗影连这点光辉都不敢靠近。" },
    { text: "发出光，可以让怕光的胆小鬼暗影远离。" },
    { text: "胆小鬼暗影被吓哭了。" },
    { text: "暗影连这样微小的光芒都会惧怕。" },
    { text: "发出微弱的火苗，但足以吓退懦弱的暗影。" },
    { text: "暗影会怕这一堆火。" },
    { text: "你知道的，暗影会怕这个。" },
    { text: "有它在，暗影不会再来了！" },
    { text: "暗影总喜欢搞这种无聊的把戏。" },
    { text: "暗影的小把戏又开始了。" },
    { text: "真幼稚，暗影为什么要用这种方式和我竞争？" },
    { text: "别玩这个了，我们去看看地下的暗影在做什么吧？" },
    { text: "卑微的暗影只敢趁着月亮休息的时候出来活动。" },
    { text: "暗影总是挑选愚蠢的家伙作为它的拥护者。" },
    { text: "依附于暗影力量的事物果然脆弱。" },
    { text: "依赖暗影力量的可悲虫子。" },
    { text: "这就是使用暗影力量的结果。" },
    { text: "依赖暗影力量建造的城市充满阴暗颓废的气息。" },
    { text: "所以，卑鄙的暗影就是如此对待它的信徒的。" },
    { text: "戴上暗影的王冠，让暗影臣服于我。" },
    { text: "把它修好？奴役暗影或许会是件好玩的事。" },
    { text: "锻造暗影的力量，你应该知道我不喜欢这个。" },
    { text: "这些暗影的爬虫，真恶心！" },
    { text: "接招吧！暗影生物！" },
    { text: "暗影生物长得真蠢。" },
    { text: "丑陋的大嘴。" },
    { text: "想让我资助暗影？" },
    { text: "只是暗影的衣服碎片罢了，侵蚀不了我。" },
    { text: "一顶帽子而已，怎么可能侵蚀我？" },

    { text: "不准喂我吃这个。" },
    { text: "啊！我应该吃最好的。" },
    { text: "我该找些我能吃的东西。" },
    { text: "我想我还能再吃下一些。" },
    { text: "想让我吃它？这是不可能的。" },
    { text: "我不会吃这个的。" },
    { text: "我绝不吃这个！" },
    { text: "哈！你明知道我不吃这个。" },
    { text: "就算它没有孵出来我也不想吃。" },
    { text: "无论他们说这有多好吃，我都不会吃的。" },
    { text: "我不想浪费时间吃这个。" },
    { text: "我的胃在抗议，真没礼貌。" },
    { text: "在此之前我没有做过饭..." },
    { text: "我不适合做这个，能找其他求生者吗？" },
    { text: "这不是我该干的活！" },
    { text: "或许我们应该找个搬得动的人来搬..." },
    { text: "哈...终于还是轮到我砍树了。" },
    { text: "移植草丛的活应该交给其他人做。" },
    { text: "移植树苗的活应该交给其他人做。" },
    { text: "耕地的锄头...找个喜欢种地的家伙来？" },
    { text: "铲东西，谁要干活？" },
    { text: "这种事应该其他人来做！" },
    { text: "有些枯燥，应该找其他人做这个。" },
    { text: "真不想花费我有限的时间照顾这些家伙。" },
    { text: "为什么要我和植物聊天？" },
    { text: "我不想做这种枯燥的事情。" },
    { text: "我不想在这些愚蠢的猪身上做出太多开销。" },
    { text: "钓鱼的意义到底在哪？" },
    { text: "我能不钓了吗..." },
    { text: "它跑了，能不钓了吗？" },
    { text: "谁要钓鱼，不会是我吧？" },
    { text: "对于大海来说，这根鱼竿太短了。" },
    { text: "不要浪费我的时间。" },
    { text: "我的时间不够了，停下来。" },
    { text: "这些东西总是会干扰我的任务！" },
    { text: "别在让我分心了。" },
    { text: "我没时间。" },
    { text: "别妨碍我。" },
    { text: "我对这些没兴趣。" },
    { text: "我真的要在装饰上分心吗？" },
    { text: "我在做什么啊..." },
    { text: "又一个无聊的游戏..." },
    { text: "为什么无聊的游戏可以这么多？" },
    { text: "我不明白这些的意义是什么..." },
    { text: "不玩这些了好不好？" },
    { text: "我不想再玩这些了...我们去航海吧？" },
    { text: "我从没想过我会打不开这个。" },
    { text: "我确信这将是我最后一次失手。" },
    { text: "啊...明明是件简单的小事！" },
    { text: "该死，这艘船就不适合航海！" },
    { text: "我不需要这个就能控制好方向！" },
    { text: "我不需要这个就能控制好这艘船！" },
    { text: "为什么总是划不好！" },
    { text: "...或许我还需要时间来掌握划船的技巧。" },
    { text: "相信我能更好地控制它。" },
    { text: "再做一个，我不想等了！" },
    { text: "可恶，我只能自己拿着了！" },

    { text: "忠诚的追随者一个就够了！" },
    { text: "骑士的坐骑太高了。" },
    { text: "勇猛的骑士！" },
    { text: "这就是我的坐骑了。" },
    { text: "过来，我勇猛的坐骑。" },
    { text: "给骑士的坐骑换一个造型。" },
    { text: "给骑士的坐骑一点保护，" },
    { text: "给骑士的坐骑一些防护。" },
    { text: "骑士的坐骑需要尽快得到治疗！" },
    { text: "骑士的手下已经有牛了。" },
    { text: "独属于战士的优雅。" },
    { text: "它想跟着我，我同意了！" },
    { text: "我要给自己驯养一头坐骑吗？" },
    { text: "你也愿意与我并肩战斗吗？" },
    { text: "现在我也是皮弗娄牛的一员了。" },

    { text: "直视我！" },
    { text: "和我战斗，猪！" },
    { text: "你个懦夫，快和我战斗！" },
    { text: "低贱的爬虫，我要消灭你！" },
    { text: "我要拆掉你的爪子！" },
    { text: "快给我你的角！" },
    { text: "放开我，我们来光明正大的战斗！" },
    { text: "有本事光明正大地战一场。" },
    { text: "来吧，恶心的虫子！" },
    { text: "来吧!我会打败你！" },
    { text: "无能的怒火罢了，继续接招吧！" },
    { text: "尽管来吧，败类！" },
    { text: "脱掉那身盔甲，他什么都不是。" },
    { text: "冒牌货！" },
    { text: "你伤害不到我！" },
    { text: "这头巨大的恶魔要开始动真格了。" },
    { text: "这头短视的怪兽要进行最后的挣扎了。" },
    { text: "扭曲的丑八怪……我想我接受不了这糟糕的东西！" },
    { text: "把这种畸形的败类刻成雕塑，简直是亵渎！" },
    { text: "滚开，低等的铁球。" },
    { text: "终于停了？踹它一脚。" },
    { text: "破铜烂铁的唯一归宿。" },
    { text: "把它打下来！" },
    { text: "这就坏了？真脆弱。" },
    { text: "拉下它，然后摧毁一切。" },
    { text: "带上你的盗贼们滚开！" },
    { text: "枕头大战？来吧，我是不会输的！" },
    { text: "我已经准备好战斗了。" },
    { text: "我总会抓住你的！" },
    { text: "快毁了它！" },

    { text: "导师，你在做什么？" },
    { text: "这种粗鲁的行为是在浪费你极其有限的时间线！" },
    { text: "这就是你对抗时间的方式吗？" },
    { text: "你的钟摆终于停止了！" },
    { text: "谢了老太婆，你的表总算准了一次。" },
    { text: "希望下次旺达来的时候能带点好心情。" },
    { text: "旺达曾经用警钟敲过我！" },
    { text: "旺达会教我用这个吗？" },
    { text: "铁皮罐头，你也配威胁说要‘摧毁’我？" },
    { text: "快拔了它的电源！" },
    { text: "拆了它！把它变成一堆废铁！" },
    { text: "真稀奇，原来罐头报废了也会变成鬼魂？" },
    { text: "那个混蛋欺骗了我们。" },
    { text: "不愧是暗影的帮凶。" },
    { text: "哈！你也有今天。" },
    { text: "希望火焰能净化他身上的暗影气息。" },
    { text: "天哪，她让那个女鬼咬人了" },
    { text: "她骨子里比暗影还可怕！" },
    { text: "想被我连根拔起吗，杂草！" },
    { text: "植物玩火，愚蠢至极。" },
    { text: "长角的小恶魔喜欢这个是因为它长得像灵魂吗？" },
    { text: "某位大厨才会使用这个东西。" },
    { text: "真希望他的手只会处理食材。" },
    { text: "或许可以把它安装在希格斯伯里的门前..." },
    { text: "如果这是希格斯伯里想出来的，我会和他谈谈。" },
    { text: "希格斯伯里总是有很多奇思妙想。" },
    { text: "把这事交那个家伙来干会怎么样？" },
    { text: "谁会喜欢这个？" },

    { text: "他还没准备好！" },
    { text: "这不是明智的决定。" },
    { text: "为什么不行，再来一次？" },
    { text: "它已经没有毛可以薅了！" },
    { text: "他的所有权不在我手上。" },
    { text: "等等！" },
    { text: "这不是它该用到的东西。" },
    { text: "我有些看不清了。" },
    { text: "等等！已经有人了。" },
    { text: "快给我看看！" },
    { text: "不是这把钥匙，还要找新的。" },
    { text: "这是私人物品。" },
    { text: "这种生物是什么？" },
    { text: "我不明白。" },
    { text: "这只猫没有新的藏品。" },
    { text: "这个已经在启动了。" },
    { text: "这是别人的东西。" },
    { text: "太远了！我够不到。" },
    { text: "我要不要拿这里面的东西呢。" },
    { text: "我还是自己留着吧。" },
    { text: "美丽的月光正庇佑他的睡眠，等他醒来吧。" },
    { text: "我要给你东西，快停下来！" },
    { text: "她的灵魂不适用这种力量。" },
    { text: "他不要，这个还是我们自己留着吧。" },
    { text: "这可不适合它。" },
    { text: "它不能凭空长出来不是吗？" },
    { text: "看来它还不太适应地表的月光。" },
    { text: "我已经知道该怎么做这个了。" },
    { text: "这不是它可以掌控的东西。" },
    { text: "喂，你们只会睡觉吗？" },
    { text: "还没轮到我玩。" },
    { text: "啊....是猴子！我已经想离开这了！" },
    { text: "他得不到的，我自己留着吧。" },
    { text: "等等！我有东西要给你。" },
    { text: "他哪里有手可以拿下这些。" },
    { text: "停下，我想你会需要这些。" },
    { text: "我刚刚走神了，再来一次吧。" },
    { text: "燃起来了！！" },
    { text: "这上面真的有知识吗？" },
    { text: "让我来看看它的版图。" },
    { text: "这里没有大海。" },
    { text: "？海盗船长该挨打了。" },
    { text: "我不想用它。" },
    { text: "这只橙黄色老鼠有主人了。" },
    { text: "不是我的。" },
    { text: "我已经是猴子了，还想怎么样？" },
    { text: "没降下来？" },
    { text: "已经会做这个了。" },
    { text: "这些鱼都不长个吗？" },
    { text: "我已经有了一个更高的记录。" },
    { text: "我已经很了解这颗植物了。" },
    { text: "它的成分列表我已经知道了。" },
    { text: "为什么没反应？" },
    { text: "这不行。" },
    { text: "我已经知道这个造型了。" },
    { text: "有东西能给它充充能吗？" },
    { text: "我知道这个...但它需要一些条件来解锁。" },
    { text: "我得尽快离开这！" },
    { text: "这东西防不住它们的！" },
    { text: "啊！我就知道你在干什么！" },
    { text: "真该找个一劳永逸的方法！" },
    { text: "现在该跑了！" },
    { text: "快拿走！希望你可以高兴得久一点。" },
    { text: "我还是想要一劳永逸的办法..." }
  ],

  // --------------------------------------------------------------------------
  // 5.6. 【时钟整点报时与熬夜关怀提醒】
  // --------------------------------------------------------------------------
  clockReminder: {
    enabled: true,            // 是否启用时钟与熬夜提醒
    hourlyChime: true,        // 白天整点报时 (6:00 ~ 22:00)
    lateNightAlert: true,     // 深夜/凌晨熬夜关怀提醒 (23:00 ~ 5:00)
    lateNightStartHour: 23,   // 熬夜提醒起始时段（23点起）
    lateNightEndHour: 5,      // 熬夜提醒结束时段（凌晨5点前）
    lateNightIntervalMin: 30, // 熬夜时段若持续工作，每隔30分钟提醒一次
    holdMs: 4500,
    quotes: {
      morning: [
        '☀️ 早上 {hour} 点了！月光隐退，准备就绪，新的一天开始！',
        '晨光初现！现在是 {hour} 点整，新的代码征途开始了！'
      ],
      noon: [
        '☀️ 中午 {hour} 点整！凡人的躯体需要进食补充能量，快去吃饭！',
        '正午时分！阳光太刺眼了，本英雄建议你暂且离开屏幕，补充体力！'
      ],
      afternoon: [
        '☕ 下午 {hour} 点了！伸个懒腰，喝口水吧！月亮正慢慢爬向天空呢。',
        '现在是下午 {hour} 点，代码写得顺利吗？本座时刻注视着你的进展！'
      ],
      evening: [
        '🌆 晚上 {hour} 点整！夜幕降临，月神的力量开始觉醒了！',
        '天色暗下来了，现在是 {hour} 点！今晚打算攻克哪个大难题？'
      ],
      lateNight: [
        '🌙 已经 {hour} 点了！凡人的躯体可经不起折腾，早点休息，明日再战！',
        '夜深了……引力都在催促你入眠，可别把身体熬坏了！'
      ],
      midnight: [
        '🕛 午夜 0 点整！虽然月神在深夜最为强大，但你的发际线可不是月光做的！快去睡觉！',
        '零点敲响！今天的工作该告一段落了，听话，快把电脑关了！'
      ],
      deepNight: [
        '🌌 凌晨 {hour} 点了！喂！你还在敲键盘？不要命啦？本英雄命令你立刻盖上被子睡觉！',
        '⚠️ 凌晨 {hour} 点！月光都在打瞌睡了！再不睡觉，理智值要彻底归零了！',
        '💀 已经凌晨 {hour} 点了！黑眼圈都要比暗影怪还重了！快去睡觉！'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 5.7. 【闲置四向小漫步配置 (Don\'t Starve 风格四面行走与归位)】
  // --------------------------------------------------------------------------
  idleWander: {
    enabled: true,            // 是否允许闲置时桌面漫步
    intervalRange: [120, 240], // 每隔 120~240 秒抽查一次漫步 (纯低频彩蛋)
    chance: 0.15,             // 抽查时的触发概率 (15% 极低频彩蛋，不频繁乱跑)
    speedPxPerSec: 55,        // 跑步移动速度 (桌面像素/秒，可自定义调节跑速)
    patrolRounds: [1, 5],     // 巡逻轮数范围 (跑 1~5 个不同地点，最后一轮归位起点)
    maxOffsetSide: 85,        // 横向最大巡逻偏移半径 (像素)
    maxOffsetUp: 45,          // 向上最大巡逻偏移半径 (像素)
    maxOffsetDown: 45,        // 向下最大巡逻偏移半径 (像素)
    pauseIntervalRange: [1, 20], // 每次小走动停顿间隔 1~20 秒随机
    distJitter: 0.4,          // 距离抖动比例 (±40%)
    pauseDuration: 1.5        // 到位后停顿张望保底时长 (秒)
  },

  // --------------------------------------------------------------------------
  // 5.8. 【三级睡眠打醒台词与防重睡配置】
  // --------------------------------------------------------------------------
  // • wakeCooldownMin: 彻底打醒后的防重睡保护时间（分钟，期间心跳不强制拉回睡眠）
  // • quotes: 逐级打醒的口语化傲娇台词
  // --------------------------------------------------------------------------
  sleepWakeup: {
    wakeCooldownMin: 3,       // 彻底打醒后的防重睡保护时间 (分钟)
    quotes: {
      level3To2: [
        '别吵……我还在休息……',
        '别吵我。',
        '唔……别碰我。',
        '好困……让我再眯一会。'
      ],
      level2To1: [
        '……还让不让我睡了！',
        '好烦！',
        '讨厌，又被打扰了。',
        '轻点打！！'
      ],
      level1To0: [
        '别打了！',
        '知道了知道了！',
        '哼，算你狠！今天又有什么新任务？',
        '我可不是用来当闹钟的！'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // 5.9. 【工作/思考专注期间点击抗议台词 (50% 概率触发专注提醒，50% 触发日常台词)】
  // --------------------------------------------------------------------------
  workingBusyQuotes: [
    "喂！不要烦我，代码正在构建中！",
    "别戳了别戳了！我在思考！",
    "不要烦我！",
    "嘘——天才的思路要是被打断了，你负得起责吗？",
    "正忙着呢！！",
    "不要随意触碰正在敲代码的天体英雄！",
    "稍微等一下！没看到我正全神贯注吗？"
  ],

  // --------------------------------------------------------------------------
  // 5.10. 【连续狂戳暴毙装死彩蛋配置】
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // 5.11. 【Token 阶梯消耗实时提醒配置】
  // 规则：10w -> 50w -> 100w，后续每多 50w 提示一次，符合天体英雄/月神人设
  // --------------------------------------------------------------------------
  tokenMilestones: {
    enabled: true,
    mode: 'round',            // 'round': 单轮新提问重置计数；'incremental': 桌宠启动后累计增量
    stepAfter1M: 500000,        // 100万之后每多 50 万提示一次
    holdMs: 4000,               // 气泡停留时长（毫秒）
    quotes: {
      step10w: [
        '这轮刚吃掉了 {amount} Token，热身刚刚好！',
        '消耗 {amount} 了，对我来说小菜一碟！',
        '{amount} Token 达成，思路正在飞速运转！'
      ],
      step50w: [
        '好家伙，已经烧了 {amount} Token 了！',
        '这轮任务吃掉了 {amount} Token，我在认真干活哦！',
        '算力在燃烧！{amount} Token 奔流而过！'
      ],
      step100w: [
        '冲破 {amount} Token 了！这可是场持久硬仗！',
        '{amount} 达成！我的星光算力正在全力全开！',
        '代码量真扎实，已经跑到 {amount} Token 啦！'
      ],
      step200w: [
        '哇，奔向 {amount} Token！今天写了不少厉害代码嘛！',
        '战线拉长到 {amount} 了！英雄是不会轻易疲倦的！'
      ],
      step300w: [
        '已经飙到 {amount} Token！真是一场酣畅淋漓的构建！',
        '{amount} Token！屏幕前的你也要记得喝口水哦！'
      ],
      step500w: [
        '{amount} Token 达成！这个项目正在大步成型！',
        '呼……烧了 {amount} 了，我还在坚持！'
      ],
      step1000w: [
        '千……千万级！{amount} Token 达成！这简直是史诗工程！',
        '{amount} Token！月神的光芒也要为你燃尽啦！'
      ],
      step2000w: [
        '{amount} Token！这已经是算力怪兽级别了！'
      ],
      step3000w: [
        '突破 {amount} Token！今天必定要见证奇迹！'
      ],
      step5000w: [
        '{amount} Token！半亿算力！你太强了！'
      ],
      step8000w: [
        '已经烧了 {amount} Token，向着一亿目标挺进！'
      ],
      step10000w: [
        '星辰在上！{amount} Token 达成！一亿的荣耀属于我们！'
      ],
      stepBeyond: [
        '已经超过 {amount} Token 了！算力宇宙为你闪烁！'
      ]
    }
  },
    rageDeath: {
    enabled: true,
    clickThreshold: 6,        // 3.5 秒内连续狂戳 6 次
    clickWindowMs: 3500,
    deathQuotes: [
      "啊！我倒下了。",
      "啊呀！",
      "你完了！"
    ],
    reviveQuotes: [
      "满血复活！",
      "星辰在上！新任务来了？立刻就位！",
      "醒来了！看我大显身手！"
    ]
  }
};