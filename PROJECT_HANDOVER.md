# 🌙 小天体（Champion）饥荒专属桌宠项目 · 完整交接与架构档案

> **致接手工作的新对话/AI Agent**：
> 本文档记录了本项目的**技术架构、文件树结构、改动细节、骨骼动画与台词系统实现、运行方式以及待办扩展路线**。你可以直接阅读本文档，立即无缝接管后续的开发工作。

---

## 目录
1. [项目背景与技术选型定位](#一项目背景与技术选型定位)
2. [完整项目文件树与职责说明](#二完整项目文件树与职责说明)
3. [核心修改与新增代码详述](#三核心修改与新增代码详述)
4. [饥荒 Spine 骨骼动画集成方案](#四饥荒-spine-骨骼动画集成方案)
5. [解耦台词系统 (DialogueSystem) 规范](#五解耦台词系统-dialoguesystem-规范)
6. [运行、调试与验证指南](#六运行调试与验证指南)
7. [历史环境与清理状态说明](#七历史环境与清理状态说明)
8. [后续功能扩展路线 (Roadmap)](#八后续功能扩展路线-roadmap)

---

## 一、项目背景与技术选型定位

### 1. 目标
为用户打造一个**常驻桌面、轻量生动、深度联动 OpenAI Codex** 的《饥荒：联机版》（DST）MOD 专属角色——**小天体（Champion）**桌宠。
- **人设还原**：高傲而可爱的月光骑士/天体英雄 / 月神，**无性别**，严格遵循饥荒 MOD 官方台词。
- **视觉品质**：告别模糊有损的 9 帧低清 GIF，直接采用 **PixiJS + Pixi-Spine 2D 骨骼动画** 动态渲染，极度流畅平滑。
- **智能体联动**：无缝挂接 Codex 终端/桌面端的运行生命周期（启动、写代码、思考、单轮完成、大任务成功、等待确认、报错受挫），小天体做出对应动作和专属语音台词。
- **无感交互**：透明无边框窗口，点击气泡秒级唤醒并聚焦 Codex 窗口，解决鼠标穿透与窗口残留空白 bug。

### 2. 架构选型
- **底层底座**：采用成熟的 Electron 架构开源桌宠 LLMPET（路径位于 D:\存储\LLMPET-main）。
  - 原因：自带完整的 Agent 生命周期 Hook、Metering 消耗统计、系统托盘、窗口移动与置顶控制，避免了重复造轮子。
- **渲染方案**：本地注入 Pixi.js (v6) + Pixi-Spine (v3.8)，直接在原版 HTML/Canvas 渲染流水线上无损叠加 Spine 骨骼层。

---

## 二、完整项目文件树与职责说明

主项目根目录位于：D:\存储\LLMPET-main

`	ext
D:\存储\LLMPET-main/
│
├── 📂 assets/                       # 静态资源库
│   ├── 📂 dialogue/                 # [NEW] 专属台词数据目录
│   │   └── 📄 champion.json         # [NEW] 小天体 DST 官方专属台词库 (全场景覆盖)
│   ├── 📂 libs/                     # [NEW] 前端第三方渲染核心库
│   │   ├── 📄 pixi.min.js           # PixiJS 6 核心库 (离线本地化)
│   │   └── 📄 pixi-spine.js         # Pixi-Spine 3.8 骨骼运行时 (离线本地化)
│   ├── 📂 spine/                    # [NEW] 骨骼动画与图集资源
│   │   ├── 📄 champion.atlas        # 骨骼纹理图集定义
│   │   ├── 📄 champion.json         # 骨骼关键帧动画数据 (包含 idle, book, research, sleep 等)
│   │   └── 📄 champion.png          # 骨骼贴图大图
│   ├── 📂 champion/                 # 传统 GIF 备用皮肤包 (保留兼容)
│   ├── 📂 skins/champion/          # 传统皮肤映射包
│   ├── 📂 cat/、whale/、mascot/     # LLMPET 原生内置备用皮肤
│   └── 📂 memes/                    # 趣味表情包音频库
│
├── 📂 renderer/                     # Electron 渲染进程 (UI 与动画核心)
│   ├── 📄 pet.html                  # [MOD] 桌宠窗口页面骨架 (引入 Pixi/Spine 与台词引擎)
│   ├── 📄 pet.css                   # [MOD] 样式层 (优化透明穿透、Spine Canvas 定位、气泡交互)
│   ├── 📄 pet.js                    # [MOD] 核心控制逻辑 (Spine 状态机映射、动作调度、气泡唤醒)
│   ├── 📄 dialogue.js               # [NEW] 独立解耦的台词分发引擎 (window.DialogueSystem)
│   ├── 📄 panel.html / panel.js     # 右键菜单及设置控制面板
│   └── 📄 archive.html / archive.js # 任务归档与会话详情面板
│
├── 📂 backend/                      # Electron 主进程与 Agent 监控后端
│   ├── 📄 core.js                   # 后端核心调度、事件循环
│   ├── 📄 config.js                 # [MOD] 注册皮肤列表 (包含 'champion')
│   ├── 📄 skins.js                  # 皮肤管理服务
│   ├── 📄 codex-watch.js            # Codex 会话、日志与状态实时监听器
│   └── 📄 server.js                 # 本地 IPC / HTTP 传输管道
│
├── 📂 shared/                       # 主进程与渲染进程共享代码
│   ├── 📄 i18n.js                   # [MOD] 多语言文本注册 ('skin.champion': '小天体 (Champion)')
│   └── 📄 states.js                 # 桌宠核心状态定义
│
├── 📂 test_artifacts/               # [NEW] 开发过程中的验证脚本与渲染截图
│   ├── 📄 verify_test.js            # 自动化全量 Spine 渲染、动作轮播测试脚本
│   └── 📄 verify_champion_*.png     # 渲染验证截图
│
├── 📄 main.js                       # Electron 应用入口 (窗口创建、托盘、快捷键、穿透配置)
├── 📄 preload.js                    # 预加载安全上下文桥接 (IPC 暴露)
├── 📄 package.json                  # 项目依赖与启动脚本
├── 📄 run.bat                       # [NEW] 便捷一键启动脚本 (自动启动 Electron)
└── 📄 PROJECT_HANDOVER.md           # [NEW] 本项目完整技术交接档案
`

---

## 三、核心修改与新增代码详述

### 1. 
enderer/pet.html (DOM 结构扩展)
- 引入了本地依赖库：
  `html
  <script src="../assets/libs/pixi.min.js"></script>
  <script src="../assets/libs/pixi-spine.js"></script>
  <script src="dialogue.js"></script>
  `
- 在舞台容器 #pet-mascot 内部追加了专用的 Spine Canvas 挂载节点：
  `html
  <canvas id="champion-spine-canvas" class="champion-spine-canvas hidden"></canvas>
  `

### 2. 
enderer/pet.js (渲染引擎与动作调度)
- **Pixi 实例初始化**：创建了透明 WebGL 渲染管线，并绑定到 #champion-spine-canvas。
- **骨骼解析与尺寸校准**：
  `javascript
  const CHAMPION_SPINE_SCALE = 0.307; // 经视觉 QA 精准微调的最佳比例
  championSpine.scale.set(CHAMPION_SPINE_SCALE);
  championSpine.x = app.screen.width / 2;
  championSpine.y = app.screen.height * 0.94; // 贴底对齐
  `
- **插槽显示修复 (重要)**：
  饥荒角色骨骼内置普通手臂与提物手臂两套插槽。为防止“三只手/重叠手”bug，在加载骨骼时强制执行：
  `javascript
  // 隐藏 carry 手，显示 normal 手
  setSlotVisible('ARM_carry', false);
  setSlotVisible('ARM_normal', true);
  `
- **气泡点击秒唤醒 Codex**：
  在 ubble.addEventListener('click') 中绑定了系统级唤醒：
  `javascript
  if (AGENT === 'codex' && typeof window.pet.launchCodex === 'function') {
    window.pet.launchCodex(); // 瞬间激活聚焦 Codex 窗口
  }
  `

### 3. 
enderer/dialogue.js (专属台词引擎)
- 挂载全局单例 window.DialogueSystem。
- API 规范：
  - DialogueSystem.getOnlineLine('champion', 'codex') -> 返回天体英雄 / 月神降临专属开场白。
  - DialogueSystem.getLine('champion', category, { project: '...' }) -> 随机抽取对应场景台词，支持模板变量替换。
  - DialogueSystem.loadSkinDialogue(skinId) -> 动态异步加载其他角色的 JSON 配置，方便后续追加 Wendy、Wilson 等新皮肤。

### 4. ssets/dialogue/champion.json (台词数据)
- 覆盖 16 大状态与交互分类：
  - online：启动/上线（支持识别 codex、claude、终端）
  - 
ewTask：提交任务/开始敲代码
  - 	hinking：模型思考中
  - 
oundDone：单轮工具调用/步骤搞定
  - igDone：大任务全部圆满完成
  - rror：编译或工具报错
  - waitYou：等待用户授权/确认
  - 
eedReply：等待用户输入回复
  - idle：待机摸鱼（随机自言自语，傲娇人设）
  - poke：单击戳一戳
  - drag：鼠标抓起小天体
  - sleeping / wake：入睡与唤醒
  - hungry：预留的饥饿与喂食模块接口

---

## 四、饥荒 Spine 骨骼动画集成方案

### 状态机与骨骼动作映射表 (Animation Mapping)

| 桌宠工作状态 (LLMPET State) | 骨骼动作名 (Spine Anim Name) | 表现视觉效果 | 循环/单次 |
| :--- | :--- | :--- | :--- |
| **idle (待机)** | wilson/idle_loop | 呼吸起伏、警惕站立 | Loop |
| **loafing (摸鱼)** | wilson/idle_loop | 悠闲待机 | Loop |
| **working (写代码)** | wilson/book | **低头认真翻阅魔法秘典** (生动形象) | Loop |
| **thinking (思考中)** | wilson/research | 托腮沉思研读 | Loop |
| **sleeping (休眠)** | wilson/sleep | 蜷缩沉睡，呼吸缓慢 | Loop |
| **success (单轮搞定)** | wilson/emote_happycheer | 兴奋跳跃欢呼 | Once -> Idle |
| **bigDone (大任务完成)** | wilson/emote_happycheer | 极致欢呼 + 彩带漫天 | Once -> Idle |
| **needsinput (等输入)** | wilson/emote_wave | 挥手呼叫追随者 | Loop |
| **waiting (等确认)** | wilson/emote_wave | 挥手提示用户介入 | Loop |
| **error (报错受挫)** | wilson/emote_fistshake | 愤怒挥拳质问 | Loop |
| **drag (鼠标抓起)** | wilson/jumpout | 悬空挣扎跳跃 | Loop |
| **poke (戳一戳)** | wilson/emote_fistshake | 挥拳抗议轻慢 | Once -> Idle |

---

## 五、解耦台词系统 (DialogueSystem) 规范

如果后续需要添加新角色或新台词：
1. **添加数据文件**：直接在 ssets/dialogue/ 下建立 {character_name}.json。
2. **遵循数据规范**：
   `json
   {
     "character": "wendy",
     "name": "温蒂",
     "gender": "female",
     "dialogues": {
       "online": { "codex": ["阿比盖尔，我们要开始写代码了。"] },
       "newTask": ["希望这次不会带来灾难。"],
       "thinking": ["在无尽的黑暗中寻找答案..."],
       "roundDone": ["暂时安全了。"],
       "idle": ["生命如同这代码，充满缺陷。"]
     }
   }
   `
3. **动态生效**：无需修改底层分发引擎，引擎会自动按需索引。

---

## 六、运行、调试与验证指南

### 1. 运行方式
- **方式一（快捷方式）**：双击桌面的 启动小天体桌宠.bat。
- **方式二（项目目录）**：进入 D:\存储\LLMPET-main，双击 
un.bat。
- **方式三（命令行）**：
  `ash
  cd /d "D:\存储\LLMPET-main"
  npx electron .
  `

### 2. 自动化验证脚本
项目内包含无头渲染自动化测试：
`ash
cd /d "D:\存储\LLMPET-main"
npx electron test_artifacts/verify_test.js
`
- 该脚本会自动启动测试窗，加载 Spine 模型，验证状态机流转（Sleep -> Working/Book），并自动截图保存至 	est_artifacts/ 供视觉检查。

---

## 七、历史环境与清理状态说明

### 1. 已经彻底清理的项目（避免空间浪费与污染）
- C:\Users\lenovo\Desktop\AssetArchive-Dev -> **已完全删除**。
- C:\Users\lenovo\Desktop\AssetArchive_Extracted -> **已完全删除**。
- C:\Users\lenovo\.rustup -> **已完全删除**。
- Rust / Cargo 相关的用户环境变量 -> **已彻底清理复原**。
- VS Build Tools -> 已经通过官方安装器执行卸载注销程序。

### 2. 强力清理脚本 (桌面备用)
- 桌面存放了 彻底清理DevEnvironment.bat。
- 若用户希望释放 D:\software\DevEnvironment 剩余的 ~3.5GB 缓存文件，只需右键该脚本选择 **“以管理员身份运行”** 即可瞬间秒删。

---

## 八、后续功能扩展路线 (Roadmap)

给下一个对话的建议开发重点：

1. **更多动作一键扩充**：
   - 当前已从 champion.json 中映射了 10+ 核心动作。
   - 原始 Spine 资源中还包含：walk_loop, 
un_loop, at_loop, cook_loop, dance, sit 等数十种高品质动作。可在 pet.js 中的 CHAMPION_ANIM_MAP 继续登记。

2. **饥饿与喂食料理系统**：
   - 小天体设定不吃肉（素食主义者）。
   - 规划在右键面板加入“投喂”按钮（浆果、火龙果派、香蕉冻等）。
   - 随 Codex 运行轮数消耗饱食度，饱食度低时触发 hungry 台词与虚弱动作。

3. **番茄钟与学习监督模块**：
   - 配合用户的多邻国（Duolingo）与考学需求，加入专注打卡倒计时。
   - 时间到了小天体自动冒出气泡督促：“追随者，该去背单词了！”并支持点击气泡一键唤醒浏览器。

---
*文档编制完成于 2026-09-27 | 状态：全线跑通稳定运行*
---

## 九、最新完成功能与实测进展 (2026-09-27 最新交付)

1. **一键启动器彻底修复**：
   - 桌面脚本 `C:\Users\lenovo\Desktop\启动小天体桌宠.bat` 与 `D:\存储\LLMPET-main\一键启动CCPET.bat`；
   - 自动检测 `cli-proxy-api.exe` 进程，若已运行则跳过，未运行则拉起代理；随后秒级拉起 CCPET 并自动退出控制台。

2. **交互彻底解耦与点击唤醒**：
   - 点击角色身体绝不霸占菜单；
   - 点击底栏【Token 消耗条】纯渐隐切换会话管理窗口；
   - 点击底栏【Codex 标签】直接通过 Windows `user32.dll` 秒级聚焦唤起桌面活跃 Codex/ChatGPT 会话窗口。

3. **冒泡与活动事件全面升级**：
   - 修复了以往只冒“运行命令”的单一问题；
   - `backend/codex-watch.js` 深度细化映射：📖 读取文件 (`Read`)、📝 修改代码 (`Write`)、🔍 查找文件 (`Glob`)、🔍 搜索代码 (`Grep`)、🐙 Git 操作 (`Git`)、⌨️ 执行 JS (`Js`)、🧪 运行测试 (`Test`)、🔨 编译构建 (`Build`)、📦 压缩打包 (`Archive`)、🖼️ 审阅图片 (`Image`)；
   - `backend/adapter.js` 补充接入 🧠 构思方案 (`Reasoning`) 与 🧹 整理记忆 (`PreCompact`) 事件。

4. **小天体全套 27 种骨骼动作与专属音效完全实装**：
   - **出场入场**：启动时播放 `wilson/bucked` -> 衔接 `wilson/buck_pst` -> 平滑进入初始状态；
   - **拖拽前后摇**：抓起前摇 `wilson/hit_spike_short_pre` -> 拖拽中循环 `wilson/hit_spike_short_loop` -> 放开后摇 `wilson/hit_spike_short_pst`；
   - **单击说话**：播放 `wilson/dial_loop` 等动作 + 随机 `talk1~6.wav` + 专属台词（自称“本英雄”）；
   - **快速双击**：挨打动作 `wilson/hit_11111000` + `ouch.wav` + 呼痛台词；
   - **崩溃倒地 3 击复活**：在 `error` 倒地状态下，前 2 次点击播放 `wilson/corpse_hit`，第 3 次触发 `wilson/wakeup` + `yawning.wav` 满血复活会待机；
   - **音效绝对克制**：平时工作与待机保持彻底静音，绝不扰民，仅在用户点击交互时发声；
   - **用户可视化与参数微调**：所有动画池、权重比例、缩放大小与偏移量均集中暴露在 `renderer/custom_config.js`，用户可随时直接调参。
---

## 十、2026-09-28 进阶特性与细节体验全面收敛交付

1. **称号与人设全面修正**：
   - 彻底清除所有“使者”、“骑士”等旧称号，全面校正为“**天体英雄**”与“**月神**”。
   - 更新至 `assets/dialogue/champion.json`、`renderer/dialogue.js` 与各模块台词池。

2. **核心战斗台词常驻**：
   - 高频注入核心标志性台词：`'你这个败类！我要代表月亮审判你的罪恶！'`，在日常点击、待机、戳动中均有极高概率出现。

3. **音量智能分级与跳舞模式音效**：
   - 全局音效分级：挨打/受击音效自动缩放至 `0.5`（轻柔不刺耳），普通交互音效缩放至 `0.75`。
   - 右键底栏 Codex 胶囊切换跳舞模式时，随机播放专属音效 `emoting.wav` 或 `emoting1.wav`。
   - 日常待机与入睡绝对静音，杜绝自动播放 `yawning.wav` 扰民。

4. **说话动画权限降级（杜绝工作动作被覆盖）**：
   - 在 `playChampionTalking` 中增加优先级保护：当小天体处于专注工作态（`working` / `juggling` / `carrying` / `sweeping` / `thinking`）时，只展示头顶文字气泡，**绝不打断或重置 Spine 的敲键盘/快速施法等工作骨骼动画**。仅在 `idle` 时才播放说话张嘴肢体动作。

5. **自然入睡序列与右键打醒交互**：
   - 状态进入 `sleeping` 时按顺序过渡：`wilson/emote_yawn`（打哈欠 2.6s，静音）➔ `wilson/emote_sleepy`（打瞌睡 2.6s）➔ `wilson/bedroll_sleep_loop`（深度睡眠循环）。
   - 睡觉时右键点击角色身体：瞬间取消睡眠并打醒，播放受击动作 `wilson/hit_11111000` 衔接 `wilson/wakeup`，伴随 `ouch.wav`（0.5音量）并冒泡：`'哎哟！大胆败类！竟敢趁月神打盹时偷袭我？！'`。

6. **Don't Starve 风格闲置四向小漫步 (`championIdleWander`)**：
   - 闲置状态下每隔 30~60 秒抽查，小天体随机朝上下左右四个方向迈步小走（左侧自动水平翻转 `scale.x = -baseScale`），走动 1.2 秒后停顿张望 0.6 秒，随后转身平滑走回原点 `(championX, championY)` 并恢复待机。全程具备防打断安全机制。

7. **时钟整点报时与深夜/凌晨熬夜关怀 (`clockReminder`)**：
   - 6:00~22:00 白天时段：整点准时根据早、中、下午、傍晚触发不同风格的傲娇整点报时。
   - 23:00~05:00 深夜/凌晨时段：整点触发傲娇催睡告警（午夜 0 点发际线警告、凌晨 1~4 点超狠护体警告）；熬夜期间若持续写代码，每 30 分钟额外提醒一次。
   - 控制台直接提供 `window.testClockReminder(hour)` 与 `window.testLateNightAlert(hour)` 供实时调试。

8. **Token 阶梯消耗傲娇提醒 (`tokenMilestones`)**：
   - 实时挂接 `applyStats` 中的 Token 计数器，达成本轮 10w、50w、100w 以及后续每递增 50w 时，小天体自动根据当前量级冒出符合人设的傲娇台词。
   - 控制台提供 `window.testTokenMilestone(amount)` 供调试。

9. **会话唤醒与台词优先级优化**：
   - `getActiveOrLatestSessionId` 优化为：优先选择正处于活跃状态的 session（按 idleMs 升序），次选最近活跃的有效非归档 session，彻底解决点击 Codex 胶囊总误跳历史死 session 的问题。
   - `getDialogueLine` 优先匹配 `champion.json` 中的专属场景分类台词，无特定分类时再回退至随机对话池。
---

## 十一、2026-09-28 睡眠三级打醒、桌面位移漫步与动画完整性交付

1. **三级睡眠递退打醒机制实装**：
   - 睡眠分为 3 个明确阶段：Lv 3（深度睡眠盖被 `bedroll_sleep_loop`）➔ Lv 2（打瞌睡坐姿 `emote_sleepy`）➔ Lv 1（困倦打哈欠 `emote_yawn`）➔ Lv 0（彻底清醒待机）。
   - **第 1 次右键打**：Lv 3 ➔ Lv 2，播放 `hit_11111000` + 衔接打瞌睡，台词：*“别吵……我还在休息……”*
   - **第 2 次右键打**：Lv 2 ➔ Lv 1，播放 `hit_11111000` + 衔接打哈欠，台词：*“……还让不让人睡了！”*
   - **第 3 次右键打**：Lv 1 ➔ Lv 0，播放 `hit_11111000` + 衔接苏醒伸懒腰 `wakeup`，台词：*“醒了醒了！别打了！”* 并进入 `idle` 待机。
   - **防重睡锁定保护**：彻底打醒后设置 3 分钟（可配置）保护期，期间 `applyStats` 后台心跳检测绝不会再次强制将桌宠拉回睡眠。

2. **动画 100% 完整播放保障（彻底解绑气泡截断骨骼）**：
   - 在 `playChampionTalking` 中增加骨骼轨道繁忙检测：若当前正在播放任何非待机动作（受击 `hit`、苏醒 `wakeup`、抽奖小动作 `oneShot` 等），说话动作**严禁覆盖插队**，只冒文字气泡。
   - 动作播放统一采用 Spine 原生轨道队列（`setAnimation(0, anim, false)` + `addAnimation(0, currentBaseLoopAnim, true, 0)`），每一帧都完整播放至最后一帧自然回落，杜绝 `setTimeout` 腰斩动画。

3. **桌面窗口真实漫步与跑速配置 (`idleWander`)**：
   - 改为直接通过 Electron `window.pet.getWinPos()` 与 `window.pet.setWinPos()` 操作桌面窗口坐标，桌宠在用户屏幕上真正向前迈步跑动，并在张望后转身跑回原位。
   - 新增跑步速度配置项：`speedPxPerSec: 55`（桌面移动像素/秒，可自由调节跑速），以及横向位移 `distSide: 70`、纵向位移 `distUp: 45`、`distDown: 45`。

4. **用户自定义配置主文件路径索引**：
   - 主配置文件：`D:\存储\LLMPET-mainenderer\custom_config.js`（集中管理所有台词、动作概率、漫步距离与跑速、打醒台词与冷却）。
   - 官方场景词典：`D:\存储\LLMPET-mainssets\dialogue\champion.json`。

---

## 十二、2026-09-28 Token 一亿阶梯台词、三级睡眠打醒锁死与多点巡逻漫步交付

1. **Token 计算机制解析与 1 亿阶梯口语化短台词实装**：
   - **计算时机与数据来源**：桌宠后台（`backend/codex-metering.js`）实时监听系统目录 `~/.codex/sessions` 下的会话 rollout 日志文件。每当 Codex 执行一轮思考、回复、调用工具或运行命令，写入 `token_count` 时，后台即时汇总并通过 IPC 推送给桌宠前端。
   - **单轮增量模式 (`mode: "round"`)**：桌宠启动时自动记录基准值，其后单次开发轮次所消耗的 Token 净增量达标即触发提示。
   - **全阶梯独立台词库 (直至 1 亿 Token 不重复)**：
     - 覆盖阶段：`10w`、`50w`、`100w`、`200w`、`300w`、`500w`、`1000w (1千万)`、`2000w`、`3000w`、`5000w`、`8000w`、`10000w (1亿)` 以及突破 1 亿后每 `5000w` 的通用高阶池。
     - 台词风格：短小口语、傲娇灵动，DST 小天体（天体英雄/月神）官方个性，杜绝冗长演讲；并加入单阶段防重复抽取池。
     - 控制台快捷测试指令：`window.testTokenMilestone(500000)`、`window.testTokenMilestone(100000000)`。

2. **三级睡眠彻底打退机制与防心跳覆写锁定**：
   - **根因根除**：原版底层只有单级 sleeping，此前后台心跳（`applyStats` / `setState`）每隔几秒刷新就会重入 `updateChampionSpine("sleeping")` 并将 `sleepLevel` 强行重置为 1，导致玩家无论怎么点都“一下就醒”。
   - **修复与加固**：
     - 在 `updateChampionSpine("sleeping")` 中增加 `if (isFallingAsleep || sleepLevel > 0) return;` 保护锁，入睡后绝不受心跳刷新干扰。
     - 睡眠状态下右键点击身体严格按 3 级打退：
       - **第 1 次右键打**：Lv 3 ➔ Lv 2（深度睡被打，播 `hit_11111000` + `ouch.wav`，转为打瞌睡 `emote_sleepy`，说 *“别吵……我还在休息……”*）。
       - **第 2 次右键打**：Lv 2 ➔ Lv 1（打瞌睡被打，播 `hit_11111000` + `ouch.wav`，转为打哈欠困倦 `emote_yawn`，说 *“……还让不让人睡了！”*）。
       - **第 3 次右键打**：Lv 1 ➔ Lv 0（彻底打醒，播 `hit_11111000` + 伸懒腰苏醒 `wakeup`，说 *“醒了醒了！别打了！”*，恢复 `idle` 待机，锁定防重睡 3 分钟）。
     - 左键轻戳睡眠中的桌宠：仅轻声嘟囔 *“唔……别碰我，睡觉呢……”*，不破坏当前睡眠等级与动作。
     - 控制台测试指令：`window.testSleepState(3)`（设为 3 级睡）、`window.testSleepState(2)`。


3. **桌面多路标巡逻漫步与朝向翻转铁律实装 (`championIdleWander`)**：
   - **多路标巡逻模式**：桌宠不再是单次向左走后立马跑回，而是由 `patrolRounds: [3, 5]` 控制，在桌面随机生成 3~5 个不同路标点依次奔跑巡视；在**最后一轮才精准跑回初始坐标 `(origWinX, origWinY)`**。
   - **朝向翻转铁律**：**“正面不反转。只要是回到正面就不反转，只有侧面才反转”**。
     - 纵向跑（向上背面 `run_loop_up`、向下正面 `run_loop_down`）一律保持正向 `scale.x = baseScale`，绝不翻转！
     - 到达各路标点停顿张望待机（`acting_idle1`）时，立即切回正向 `scale.x = baseScale`。
     - **仅侧跑 (`run_loop_side`) 且向左时**才执行水平翻转 `scale.x = -baseScale`，向右跑时保持 `scale.x = baseScale`。
   - 控制台测试指令：`window.testIdleWander()`。

4. **非 idle 状态点击对话动画全场景修复 (`pickTalkingAnim`)**：
   - **历史 Bug 诊断**：此前在 `handleChampionBodyLeftClick` 中，点击角色抽取的是当前 trigger 的 `oneShotPool`（在工作态下抽到的是跳舞 `emoteXL_loop_dance7`，搬运态下抽到的是横移，待机态抽到的是吃东西/跺脚），并且 `playChampionTalking` 内部有一段针对非 idle 状态（`working` / `thinking` / `carrying` 等）的直接 `return`，导致工作/思考等非 idle 态下点击桌宠完全不出说话动画。
   - **重构实装**：
     - 新增 `pickTalkingAnim()` 专属说话动画抽取器，统一从 `wilson/dial_loop`（张嘴连贯手舞足蹈）、`wilson/acting_1`（单次说话动作 1）、`wilson/acting_2`（单次说话动作 2）以及疲劳专属的 `wilson/heavy_dial_loop` 中随机挑选。
     - 无论处于 `idle` 还是 `working` / `thinking` / `carrying` / `sweeping` 等任何状态，点击桌宠对话必定播放专属说话肢体动作，并在说话动作播完后通过 Spine 轨道队列（`addAnimation(0, currentBaseLoopAnim, true, 0)`）瞬间平滑切回当前正在进行的基线工作/思考姿势，兼顾生动交互与工作连续性。


---

## 十三、2026-09-28 删胳膊重打 Atlas 图集、音量双向持久化、说话连贯播放与暴毙彩蛋交付

1. **Spine 贴图重打 Atlas 与用户删胳膊资源同步**：
   - 用户在 `D:\存储\CelestialPet\assets\champion\champion` 删除了多余手/胳膊图片并重新导出了 `champion.json`（95.9MB）。
   - 使用高密度 Shelf Packing 算法完成 157 张真实部件的紧凑重打包，生成 `D:\存储\LLMPET-main\assets\spine\champion.png`（2048x2048）和 `champion.atlas`。
   - 对 `champion.json` 中遗留引用的 61 个已删除附件，在 atlas 中自动补充了 `(0, 0, 1, 1)` 的透明 dummy 像素，保证 `pixi-spine` 解析 100% 不报错，且删掉的武器/持物胳膊在动画中彻底隐形。
   - 经实测校验：`champion.json` 所引用的 218 个附件在 `champion.atlas` 中 100% 存在，358 个 Spine 动画完好解析。

2. **音量控制彻底生效与调优面板双向绑定**：
   - 修复了 `window.playPetSound` 忽略用户配置的缺陷，接入 `window.PET_CONFIG.soundVolume`（默认 0.10）与 `hitSoundVolume`（默认 0.20），并保留 0.5 (hit) / 0.75 (普通) 缩放。
   - 调优面板（`pet.html`、`pet.js`）双向接入音量滑块，`main.js` 中的 `save-custom-tune-config` 支持将调优参数直接持久化保存至 `custom_config.js`。
   - 防扰民静音铁律：后台时钟报时、Token 阶梯提醒、自然入睡等 100% 静音，绝不发出合成蜂鸣；仅在用户主动点击交互时发声。

3. **说话动画完整播放 3.2 秒与防打断锁**：
   - 修复了此前说话动作播 0.7 秒即被切回待机的 bug：在 `playChampionTalking` 中进入时调用 `clearChampionAnimLocksAndTimers()`，设置 `isAnimLocked = true`，采用 `wilson/dial_loop`（`loop: true`）完整循环播放 3.2 秒，倒计时结束后平滑回落当前基线动作。
   - 修复了 `isRageDead` 变量未顶层声明导致抛出 `ReferenceError` 中断执行的问题。

4. **连戳暴毙装死彩蛋与任务/打退唤醒**：
   - 若用户在 3.5 秒内连续点击小天体 6 次，触发暴毙装死彩蛋：桌宠倒地并依次播放 `death` ➔ `death2` ➔ 循环 `death2_idle`，并弹出装死台词。
   - 装死状态下轻戳仅抽搐 `corpse_hit`，不说话不发声；当有新任务到来（`working` / `thinking`）或窗口重获焦点时，自动播放 `wakeup` 满血复活。

5. **工作期点击忙碌台词与完工庆祝**：
   - 工作/思考状态下点击桌宠，50% 概率触发工作忙碌短台词（如“别戳了！没见本座正在斩杀 Bug 吗？！”），50% 概率触发常规台词。
   - 工作完成（`turn-done` / `big-done` 或从 `working` 切回 `idle`）时，小天体自动播放 `playWorkFinishedCelebration()`（挥手 `emote_waving`、欢呼 `emote_jumpcheer` 或举杯 `emote_loop_toast`）。

6. **桌面多路标漫步低频彩蛋与打断归位**：
   - 优化漫步参数为低频彩蛋（15% 概率），跑动 1~5 轮，各轮之间停顿 1~20 秒，带有 0.4 距离抖动。
   - `stopChampionWander()` 提升为全局安全函数，在玩家拖拽、右键或左键交互时立即打断漫步并将窗口平滑瞬移回初始坐标，杜绝窗口跑丢。
