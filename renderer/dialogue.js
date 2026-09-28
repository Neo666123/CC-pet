'use strict';

/**
 * DialogueSystem: 宠物台词对接系统
 * 负责各角色/皮肤在不同状态、事件和互动场景下的个性化台词管理与分发。
 * 支持解耦注册新皮肤台词、变量插值（如 {project}, {wait} 等）与兜底回落。
 */
(function () {
  const BUILTIN_DIALOGUES = {
    champion: {
  "online": {
        "codex": [
            "哎呀！谁在暗算我？！",
            "……咳咳，我刚才只是在测试地面的硬度！",
            "是谁把地面放得这么高？！",
            "好痛……凡间的引力真是野蛮！",
            "刚才什么都没发生！凡人，你什么都没看见！",
            "别看了！这是天体英雄独特的降落姿势！",
            "可恶……刚才那阵风是怎么回事！",
            "唔……，凡界的重力法则简直毫无道理！",
            "哎呀！",
            "站住！刚才那下是空间跃迁，不准笑！",
            "哼，不过是打了个滑，大惊小怪什么！",
            "咳……天体英雄降临……好吧，差点把脸砸平了。",
            "快扶我一下……不对，我自己能爬起来！",
            "地板……你刚才是不是故意撞上来的？！",
            "……呀！"
        ],
        "claude": [
            "哎呀！谁在暗算我？！",
            "……咳咳，我刚才只是在测试地面的硬度！",
            "是谁把地面放得这么高？！",
            "好痛……凡间的引力真是野蛮！",
            "刚才什么都没发生！凡人，你什么都没看见！",
            "别看了！这是天体英雄独特的降落姿势！",
            "可恶……刚才那阵风是怎么回事！",
            "唔……，凡界的重力法则简直毫无道理！",
            "哎呀！",
            "站住！刚才那下是空间跃迁，不准笑！",
            "哼，不过是打了个滑，大惊小怪什么！",
            "咳……天体英雄降临……好吧，差点把脸砸平了。",
            "快扶我一下……不对，我自己能爬起来！",
            "地板……你刚才是不是故意撞上来的？！",
            "……呀！"
        ],
        "dsh": [
            "哎呀！谁在暗算我？！",
            "……咳咳，我刚才只是在测试地面的硬度！",
            "是谁把地面放得这么高？！",
            "好痛……凡间的引力真是野蛮！",
            "刚才什么都没发生！凡人，你什么都没看见！",
            "别看了！这是天体英雄独特的降落姿势！",
            "可恶……刚才那阵风是怎么回事！",
            "唔……，凡界的重力法则简直毫无道理！",
            "哎呀！",
            "站住！刚才那下是空间跃迁，不准笑！",
            "哼，不过是打了个滑，大惊小怪什么！",
            "咳……天体英雄降临……好吧，差点把脸砸平了。",
            "快扶我一下……不对，我自己能爬起来！",
            "地板……你刚才是不是故意撞上来的？！",
            "……呀！"
        ],
        "default": [
            "哎呀！谁在暗算我？！",
            "……咳咳，我刚才只是在测试地面的硬度！",
            "是谁把地面放得这么高？！",
            "好痛……凡间的引力真是野蛮！",
            "刚才什么都没发生！凡人，你什么都没看见！",
            "别看了！这是天体英雄独特的降落姿势！",
            "可恶……刚才那阵风是怎么回事！",
            "唔……，凡界的重力法则简直毫无道理！",
            "哎呀！",
            "站住！刚才那下是空间跃迁，不准笑！",
            "哼，不过是打了个滑，大惊小怪什么！",
            "咳……天体英雄降临……好吧，差点把脸砸平了。",
            "快扶我一下……不对，我自己能爬起来！",
            "地板……你刚才是不是故意撞上来的？！",
            "……呀！"
        ]
    },
  "newTask": [
    "迈出新的一步。",
    "让月光指引这次构建。",
    "这些代码妄想挑战月光的力量？",
    "持续追踪...任务很快就会现形。",
    "我已经准备好战斗了。"
  ],
  "thinking": [
    "新的知识...容我审视一番。",
    "真该找个一劳永逸的方法！",
    "它在思考...这需要精密的天体算力。",
    "也许我的皇冠能容得下它..."
  ],
  "roundDone": [
    "哼，它折服于我的聪明才智！",
    "转瞬抵达终点，轻而易举。",
    "现在好了，完美收工！",
    "英雄的胜利，理所当然。",
    "在月光的辉煌面前，一切迎刃而解。"
  ],
  "bigDone": [
    "伟大的功业！整个月亮都将见证这一刻！",
    "哼，凡人们，见证月光的壮举吧！",
    "全部完成了！月光统治的时代已然来临。"
  ],
  "error": [
    "可恶，需要再来一次！",
    "少了某些重要的环节...",
    "到底是什么在干扰月光？",
    "不可饶恕的错漏！快排查一番！",
    "咳！还需要一些时间修复。"
  ],
  "waitYou": [
    "喂！别愣着了，我需要你的许可！",
    "此处的道路受阻，快来定夺！",
    "忠诚的追随者，轮到你做出决断了！",
    "我缺乏授权...快来核准！"
  ],
  "needReply": [
    "快给我答复！",
    "回答我的问题，不要让天体英雄久等。",
    "你的犹豫正在考验月光的耐心。"
  ],
  "slowCmd": [
    "这指令跑得比石虾还慢...",
    "耐心也是英雄的修行，但也不要太久了。"
  ],
  "idle": [
    "你这个败类！我要代表月亮审判你的罪恶！",
    "这个世界即将迎来月亮统治的时刻。",
    "我已经离开我的月亮太久了...",
    "脱离月光照耀的世界，真是野蛮。",
    "忠诚的追随者，一个就够了！",
    "无聊的时光...不如去探索远古的秘密。",
    "赞美月光，唯有璀璨永恒。",
    "我的光芒照耀着整个桌面。"
  ],
  "poke": [
    "你这个败类！我要代表月亮审判你的罪恶！",
    "嗯？有什么事要我处理？",
    "不要随意触碰高贵的天体英雄！",
    "我的能量可不是用来给你戳着玩的。",
    "想瞻仰我的皇冠？那就站近点吧。",
    "怎么？遇到无法解决的难题了吗？"
  ],
  "drag": [
    "放开我！我们光明正大地战斗！",
    "快放手！英雄不可受此轻慢！",
    "啊呀！",
    "你竟敢挟持我！"
  ],
  "sleeping": [
    "虚弱...但只是小憩片刻。",
    "月光也会有隐没的时候...",
    "呼...不要打扰我的沉睡..."
  ],
  "wake": [
    "终于明亮了！",
    "我已经准备好战斗了。",
    "月光再次凝聚！"
  ],
  "greet": [
    "向你致意，同行者。",
    "愿月光指引你的道路。"
  ],
  "hungry": [
    "我需要补充一些能量。",
    "仆人们，我的供奉在哪？",
    "别愣着了，饥饿正在冒犯我！",
    "我的胃在抗议，真没礼貌。"
  ]
}
  };

  class DialogueEngine {
    constructor() {
      this.skins = Object.assign({}, BUILTIN_DIALOGUES);
    }

    /**
     * 注册或拓展皮肤台词
     * @param {string} skinName 皮肤标识 (如 'champion')
     * @param {object} dialogueData 台词分类字典
     */
    register(skinName, dialogueData) {
      if (!skinName || typeof dialogueData !== 'object') return;
      if (!this.skins[skinName]) {
        this.skins[skinName] = {};
      }
      this.skins[skinName] = Object.assign(this.skins[skinName], dialogueData);
    }

    /**
     * 判断某皮肤是否定义了台词库
     */
    hasSkin(skinName) {
      return !!(this.skins && this.skins[skinName]);
    }

    /**
     * 从台词列表中随机挑一句
     */
    pickRandom(list) {
      if (!Array.isArray(list) || list.length === 0) return null;
      return list[Math.floor(Math.random() * list.length)];
    }

    /**
     * 模板插值替换: {project} -> params.project
     */
    format(template, params = {}) {
      if (typeof template !== 'string') return '';
      return template.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined && params[key] !== null ? params[key] : match;
      });
    }

    /**
     * 获取指定分类下的随机台词
     * @param {string} skinName 皮肤名
     * @param {string} category 事件/状态分类 (如 'idle', 'roundDone', 'error', 'drag', 'poke')
     * @param {object} params 插值参数
     * @returns {string|null}
     */
    getLine(skinName, category, params = {}) {
      try {
        const skinData = this.skins[skinName];
        if (!skinData) return null;

        const categoryData = skinData[category];
        if (!categoryData) return null;

        let line = null;
        if (Array.isArray(categoryData)) {
          line = this.pickRandom(categoryData);
        } else if (typeof categoryData === 'object') {
          const subKey = params.subKey || 'default';
          const subList = categoryData[subKey] || categoryData.default;
          line = this.pickRandom(subList);
        } else if (typeof categoryData === 'string') {
          line = categoryData;
        }

        return line ? this.format(line, params) : null;
      } catch (err) {
        console.warn('[DialogueSystem] getLine error:', err);
        return null;
      }
    }

    /**
     * 获取上线开场台词（替换原版小章鱼上线）
     * @param {string} skinName 皮肤名
     * @param {string} agent 运行的 Agent 类型 (如 'codex', 'claude', 'dsh')
     * @returns {string|null}
     */
    getOnlineLine(skinName, agent = 'codex') {
      try {
        const skinData = this.skins[skinName];
        if (!skinData || !skinData.online) return null;

        const online = skinData.online;
        const list = online[agent] || online.default;
        return this.pickRandom(list);
      } catch (err) {
        console.warn('[DialogueSystem] getOnlineLine error:', err);
        return null;
      }
    }
  }

  window.DialogueSystem = new DialogueEngine();
})();
