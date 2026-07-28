// game.js - Main game loop, world, player, systems

import { Inventory, ITEMS } from "./inventory.js";
import { QuestManager } from "./quests.js";
import { createMonster, pickEncounter } from "./monsters.js";
import { Battle } from "./battle.js";
import { saveGame, loadGame, hasSave } from "./save.js";
import { UI } from "./ui.js";

const TILE = 32;
const MAP_W = 30;
const MAP_H = 30;
const VIEW_W = 25;
const VIEW_H = 19;

const T = {
  GRASS: 0,
  WATER: 1,
  TREE: 2,
  MOUNTAIN: 3,
  PATH: 4,
  VILLAGE: 5,
  CASTLE: 6,
  DUNGEON: 7,
  FLOOR: 8
};

const TILE_COLORS = {
  [T.GRASS]: "#3d7a3d",
  [T.WATER]: "#2a5a8a",
  [T.TREE]: "#1e4d1e",
  [T.MOUNTAIN]: "#6a6a6a",
  [T.PATH]: "#8b7355",
  [T.VILLAGE]: "#c4a35a",
  [T.CASTLE]: "#5a5a7a",
  [T.DUNGEON]: "#3a2a2a",
  [T.FLOOR]: "#4a3a3a"
};

class Player {
  constructor() {
    this.name = "Hero";
    this.x = 8;
    this.y = 12;
    this.px = this.x * TILE;
    this.py = this.y * TILE;
    this.targetX = this.x;
    this.targetY = this.y;
    this.moving = false;
    this.facing = "down";
    this.animFrame = 0;
    this.animTimer = 0;

    this.level = 1;
    this.xp = 0;
    this.xpToLevel = 100;
    this.gold = 50;

    this.baseAtk = 10;
    this.baseDef = 5;
    this.baseSpd = 8;
    this.maxHp = 100;
    this.hp = 100;
    this.maxMp = 50;
    this.mp = 50;

    this.inventory = new Inventory();
    this.recalcStats();
  }

  recalcStats() {
    const b = this.inventory.getStatBonus();
    this.atk = this.baseAtk + b.atk + (this.level - 1) * 2;
    this.def = this.baseDef + b.def + (this.level - 1);
    this.spd = this.baseSpd + b.spd;
  }

  gainXp(amount) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpToLevel) {
      this.xp -= this.xpToLevel;
      this.level++;
      this.xpToLevel = Math.floor(this.xpToLevel * 1.35);
      this.maxHp += 15;
      this.maxMp += 8;
      this.hp = this.maxHp;
      this.mp = this.maxMp;
      this.baseAtk += 2;
      this.baseDef += 1;
      leveled = true;
    }
    this.recalcStats();
    return leveled;
  }

  moveTo(tx, ty, map) {
    if (this.moving) return false;
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
    const tile = map[ty][tx];
    if (tile === T.WATER || tile === T.MOUNTAIN || tile === T.TREE) return false;
    this.targetX = tx;
    this.targetY = ty;
    this.moving = true;
    if (tx > this.x) this.facing = "right";
    else if (tx < this.x) this.facing = "left";
    else if (ty > this.y) this.facing = "down";
    else if (ty < this.y) this.facing = "up";
    return true;
  }

  update(dt) {
    if (!this.moving) return;
    const speed = 120;
    const tx = this.targetX * TILE;
    const ty = this.targetY * TILE;
    const dx = tx - this.px;
    const dy = ty - this.py;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
      this.px = tx;
      this.py = ty;
      this.x = this.targetX;
      this.y = this.targetY;
      this.moving = false;
    } else {
      this.px += (dx / dist) * speed * dt;
      this.py += (dy / dist) * speed * dt;
    }
    this.animTimer += dt;
    if (this.animTimer > 0.15) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.player = new Player();
    this.quests = new QuestManager();
    this.ui = new UI(this);

    this.map = [];
    this.npcs = [];
    this.chests = [];
    this.flags = {};
    this.achievements = [];
    this.killed = {};
    this.dayTime = 0.3;
    this.weather = "sunny";
    this.settings = {
      difficulty: "normal",
      musicVol: 0.4,
      sfxVol: 0.6,
      mute: false
    };

    this.keys = {};
    this.joystick = { active: false, dx: 0, dy: 0 };
    this.state = "title";
    this.battle = null;
    this.dialogueQueue = [];
    this.encounterCooldown = 0;
    this.lastTime = 0;
    this.camera = { x: 0, y: 0 };

    this.generateWorld();
    this.setupInput();
    this.setupJoystick();

    this.player.inventory.add("potion_hp", 3);
    this.player.inventory.add("rusty_sword", 1);
    this.player.inventory.equip("rusty_sword");
    this.player.recalcStats();

    requestAnimationFrame(t => this.loop(t));
  }

  resize() {
    const container = document.getElementById("game-container");
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.scale = Math.min(w / (VIEW_W * TILE), h / (VIEW_H * TILE));
  }

  generateWorld() {
    this.map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(T.GRASS));

    for (let y = 3; y < 9; y++)
      for (let x = 18; x < 26; x++)
        if (Math.hypot(x - 22, y - 6) < 4) this.map[y][x] = T.WATER;

    for (let y = 0; y < 12; y++)
      for (let x = 0; x < 10; x++)
        if (Math.random() < 0.45) this.map[y][x] = T.TREE;

    for (let y = 20; y < 30; y++)
      for (let x = 20; x < 30; x++)
        if (Math.random() < 0.55) this.map[y][x] = T.MOUNTAIN;

    for (let x = 5; x < 20; x++) this.map[12][x] = T.PATH;
    for (let y = 12; y < 22; y++) this.map[y][14] = T.PATH;

    for (let y = 10; y < 15; y++)
      for (let x = 5; x < 11; x++)
        this.map[y][x] = T.VILLAGE;
    this.map[12][7] = T.PATH;

    for (let y = 22; y < 28; y++)
      for (let x = 10; x < 17; x++)
        this.map[y][x] = T.CASTLE;

    for (let y = 2; y < 6; y++)
      for (let x = 12; x < 16; x++)
        this.map[y][x] = T.DUNGEON;
    this.map[4][14] = T.FLOOR;

    this.map[12][8] = T.PATH;

    this.npcs = [
      { id: "elder", name: "Village Elder", x: 7, y: 11, color: "#e8c070",
        lines: ["Welcome, traveler.", "Our village needs a hero.", "Will you help us?"] },
      { id: "merchant", name: "Merchant", x: 9, y: 13, color: "#70c0e8",
        shop: true,
        lines: ["Welcome to my shop!", "Best prices in Azan."] },
      { id: "guard", name: "Guard", x: 13, y: 22, color: "#a0a0c0",
        lines: ["The castle lies beyond.", "Beware the Dragon King."] },
      { id: "wizard", name: "Wizard", x: 14, y: 4, color: "#c070e8",
        lines: ["Magic flows through this land.", "Seek the dungeon for power."] }
    ];

    this.chests = [
      { x: 6, y: 14, opened: false, loot: [{ id: "potion_hp", qty: 2 }, { id: "wooden_shield", qty: 1 }] },
      { x: 15, y: 3, opened: false, loot: [{ id: "potion_mp", qty: 2 }, { id: "dagger", qty: 1 }] },
      { x: 12, y: 25, opened: false, loot: [{ id: "iron_shield", qty: 1 }, { id: "potion_hi", qty: 1 }], locked: true }
    ];
  }

  setupInput() {
    window.addEventListener("keydown", e => {
      this.keys[e.key.toLowerCase()] = true;
      if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"," "].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === "Escape") {
        if (this.state === "explore") this.ui.showMenu();
        else if (this.state === "dialogue") this.advanceDialogue();
      }
      if (e.key.toLowerCase() === "e" || e.key === " ") this.tryInteract();
      if (e.key.toLowerCase() === "i") this.ui.showInventory();
      if (e.key.toLowerCase() === "q") this.ui.showQuests();
    });
    window.addEventListener("keyup", e => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  setupJoystick() {
    const base = document.getElementById("joystick-base");
    const knob = document.getElementById("joystick-knob");
    if (!base) return;

    const handler = (clientX, clientY) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const max = rect.width / 2 - 10;
      const dist = Math.hypot(dx, dy);
      if (dist > max) {
        dx = (dx / dist) * max;
        dy = (dy / dist) * max;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      this.joystick.dx = dx / max;
      this.joystick.dy = dy / max;
      this.joystick.active = true;
    };

    const end = () => {
      knob.style.transform = "translate(-50%, -50%)";
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.active = false;
    };

    base.addEventListener("touchstart", e => { e.preventDefault(); handler(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    base.addEventListener("touchmove", e => { e.preventDefault(); handler(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    base.addEventListener("touchend", end);
    base.addEventListener("mousedown", e => handler(e.clientX, e.clientY));
    window.addEventListener("mousemove", e => { if (this.joystick.active) handler(e.clientX, e.clientY); });
    window.addEventListener("mouseup", end);
  }

  newGame() {
    this.player = new Player();
    this.player.inventory.add("potion_hp", 3);
    this.player.inventory.add("rusty_sword", 1);
    this.player.inventory.equip("rusty_sword");
    this.player.recalcStats();
    this.quests = new QuestManager();
    this.quests.start("intro");
    this.flags = {};
    this.killed = {};
    this.achievements = [];
    this.dayTime = 0.3;
    this.weather = "sunny";
    this.generateWorld();
    this.state = "explore";
    this.ui.hideTitle();
    this.ui.updateHUD(this.player);
    this.ui.toast("Welcome to the Realm of Azan!");
  }

  continueGame() {
    const data = loadGame();
    if (!data) {
      this.ui.toast("No save found.");
      return;
    }
    this.player = new Player();
    Object.assign(this.player, data.player);
    this.player.inventory = new Inventory();
    this.player.inventory.fromJSON(data.inventory);
    this.player.px = this.player.x * TILE;
    this.player.py = this.player.y * TILE;
    this.player.recalcStats();

    this.quests = new QuestManager();
    this.quests.fromJSON(data.quests);
    this.flags = data.flags || {};
    this.achievements = data.achievements || [];
    this.killed = data.killed || {};
    this.settings = data.settings || this.settings;
    this.dayTime = data.dayTime ?? 0.3;
    this.weather = data.weather || "sunny";

    this.state = "explore";
    this.ui.hideTitle();
    this.ui.updateHUD(this.player);
    this.ui.toast("Game Loaded!");
  }

  save() {
    saveGame({
      player: this.player,
      inventory: this.player.inventory,
      quests: this.quests,
      flags: this.flags,
      achievements: this.achievements,
      settings: this.settings,
      dayTime: this.dayTime,
      weather: this.weather,
      killed: this.killed
    });
  }

  updateAudio() {
    // Placeholder for future audio
  }

  tryInteract() {
    if (this.state !== "explore") return;
    const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = dirs[this.player.facing] || [0, 1];
    const tx = this.player.x + dx;
    const ty = this.player.y + dy;

    const npc = this.npcs.find(n => n.x === tx && n.y === ty);
    if (npc) {
      this.startDialogue(npc);
      return;
    }

    const chest = this.chests.find(c => c.x === tx && c.y === ty && !c.opened);
    if (chest) {
      if (chest.locked && !this.player.inventory.has("village_key")) {
        this.ui.toast("The chest is locked.");
        return;
      }
      chest.opened = true;
      chest.loot.forEach(l => {
        this.player.inventory.add(l.id, l.qty);
        this.quests.onCollect(l.id, l.qty);
      });
      this.ui.toast("Opened chest!");
      this.ui.updateHUD(this.player);
      this.unlockAchievement("treasure_hunter");
      return;
    }
  }

  startDialogue(npc) {
    this.state = "dialogue";
    this.currentNpc = npc;
    this.dialogueIndex = 0;

    if (npc.id === "elder") {
      this.quests.onTalk("elder");
      if (!this.flags.elderMet) {
        this.flags.elderMet = true;
        this.dialogueQueue = [
          { name: npc.name, text: "Ah, a brave soul! Our village suffers from monsters." },
          { name: npc.name, text: "Please, thin their numbers. Start with the slimes nearby." },
          { name: npc.name, text: "I will reward you well. Good luck!" }
        ];
      } else {
        this.dialogueQueue = [{ name: npc.name, text: "Keep fighting the good fight, hero." }];
      }
    } else if (npc.shop) {
      this.dialogueQueue = [{ name: npc.name, text: "What would you like to buy?" }];
      this.afterDialogue = () => this.openShop();
    } else if (npc.id === "wizard") {
      this.dialogueQueue = [
        { name: npc.name, text: "The Dragon King grows restless in the castle." },
        { name: npc.name, text: "Only the strongest may face him. Prepare well." }
      ];
    } else {
      this.dialogueQueue = npc.lines.map(t => ({ name: npc.name, text: t }));
    }

    this.showNextDialogue();
  }

  showNextDialogue() {
    if (this.dialogueIndex >= this.dialogueQueue.length) {
      this.ui.hideDialogue();
      this.state = "explore";
      if (this.afterDialogue) {
        this.afterDialogue();
        this.afterDialogue = null;
      }
      return;
    }
    const d = this.dialogueQueue[this.dialogueIndex];
    this.ui.showDialogue(d.name, d.text);
  }

  advanceDialogue() {
    this.dialogueIndex++;
    this.showNextDialogue();
  }

  openShop() {
    const items = [
      { id: "potion_hp", price: 25 },
      { id: "potion_mp", price: 30 },
      { id: "potion_hi", price: 80 },
      { id: "iron_sword", price: 120 },
      { id: "leather_armor", price: 50 },
      { id: "chain_mail", price: 140 },
      { id: "wooden_shield", price: 35 },
      { id: "iron_shield", price: 100 }
    ];
    this.ui.showShop("General Store", items, (it) => {
      if (this.player.gold >= it.price) {
        this.player.gold -= it.price;
        this.player.inventory.add(it.id, 1);
        this.ui.toast(`Bought ${ITEMS[it.id].name}`);
        this.ui.updateHUD(this.player);
        document.getElementById("shop-player-gold").textContent = `Your Gold: ${this.player.gold}`;
      } else {
        this.ui.toast("Not enough gold!");
      }
    });
  }

  getArea(x, y) {
    const t = this.map[y]?.[x];
    if (t === T.DUNGEON || t === T.FLOOR) return "dungeon";
    if (t === T.CASTLE) return "castle";
    if (x < 10 && y < 12) return "forest";
    return "grass";
  }

  checkEncounter() {
    if (this.encounterCooldown > 0 || this.player.moving) return;
    const area = this.getArea(this.player.x, this.player.y);
    if (area === "village") return;
    const chance = this.settings.difficulty === "easy" ? 0.04 :
                   this.settings.difficulty === "hard" ? 0.12 : 0.07;
    if (Math.random() < chance) {
      this.startBattle(area);
    }
  }

  startBattle(area) {
    const count = Math.random() < 0.3 ? 2 : 1;
    const enemies = [];
    for (let i = 0; i < count; i++) {
      enemies.push(pickEncounter(area, this.player.level));
    }
    if (area === "castle" && this.player.x >= 12 && this.player.x <= 15 &&
        this.player.y >= 24 && this.player.y <= 26 && Math.random() < 0.35) {
      enemies.length = 0;
      enemies.push(createMonster("dragon_king", 1 + this.player.level * 0.05));
    }

    this.state = "battle";
    this.battle = new Battle(this.player, enemies, {
      onLog: () => {},
      onUpdate: (b) => this.ui.updateBattle(b),
      onEnd: (won) => this.endBattle(won),
      onFlee: () => this.endBattleFlee()
    });
    this.battle.start();
    this.ui.showBattle(this.battle);
  }

  endBattle(won) {
    this.ui.hideBattle();
    if (won) {
      let totalXp = 0, totalGold = 0;
      const drops = [];
      this.battle.enemies.forEach(e => {
        totalXp += e.xp;
        totalGold += e.goldMin + Math.floor(Math.random() * (e.goldMax - e.goldMin + 1));
        this.killed[e.type] = (this.killed[e.type] || 0) + 1;
        this.quests.onKill(e.type);
        e.drops.forEach(d => {
          if (Math.random() < d.chance) {
            const q = Array.isArray(d.qty) ? d.qty[0] + Math.floor(Math.random() * (d.qty[1] - d.qty[0] + 1)) : d.qty;
            this.player.inventory.add(d.id, q);
            this.quests.onCollect(d.id, q);
            drops.push(ITEMS[d.id]?.name || d.id);
          }
        });
      });
      this.player.gold += totalGold;
      const leveled = this.player.gainXp(totalXp);
      this.ui.updateHUD(this.player);

      let msg = `Gained ${totalXp} XP and ${totalGold} gold.`;
      if (drops.length) msg += ` Loot: ${drops.join(", ")}`;
      if (leveled) msg += " Level up!";
      this.ui.showVictory(msg);

      if (this.killed.slime >= 5) this.unlockAchievement("slime_slayer");
      if (this.killed.dragon_king) this.unlockAchievement("dragon_slayer");
    } else {
      this.state = "gameover";
      this.ui.showGameOver();
    }
    this.battle = null;
    this.encounterCooldown = 3;
  }

  endBattleVictory() {
    this.state = "explore";
    this.save();
  }

  endBattleFlee() {
    this.ui.hideBattle();
    this.battle = null;
    this.state = "explore";
    this.encounterCooldown = 4;
  }

  unlockAchievement(id) {
    if (this.achievements.includes(id)) return;
    this.achievements.push(id);
    const names = {
      slime_slayer: "Slime Slayer",
      dragon_slayer: "Dragon Slayer",
      treasure_hunter: "Treasure Hunter"
    };
    this.ui.toast(`Achievement: ${names[id] || id}`);
  }

  update(dt) {
    if (this.state !== "explore") return;

    this.dayTime = (this.dayTime + dt * 0.008) % 1;
    if (Math.random() < 0.0003) {
      this.weather = ["sunny", "rain", "snow"][Math.floor(Math.random() * 3)];
    }

    let mx = 0, my = 0;
    if (this.keys["arrowup"] || this.keys["w"]) my = -1;
    else if (this.keys["arrowdown"] || this.keys["s"]) my = 1;
    if (this.keys["arrowleft"] || this.keys["a"]) mx = -1;
    else if (this.keys["arrowright"] || this.keys["d"]) mx = 1;

    if (this.joystick.active) {
      if (Math.abs(this.joystick.dx) > 0.35) mx = Math.sign(this.joystick.dx);
      if (Math.abs(this.joystick.dy) > 0.35) my = Math.sign(this.joystick.dy);
    }

    if ((mx || my) && !this.player.moving) {
      const moved = this.player.moveTo(this.player.x + mx, this.player.y + my, this.map);
      if (moved) {
        this.encounterCooldown = Math.max(0, this.encounterCooldown - 0.4);
        setTimeout(() => this.checkEncounter(), 200);
      }
    }

    this.player.update(dt);
    this.encounterCooldown = Math.max(0, this.encounterCooldown - dt);

    this.camera.x = this.player.px - this.canvas.width / (2 * (this.scale || 1)) + TILE / 2;
    this.camera.y = this.player.py - this.canvas.height / (2 * (this.scale || 1)) + TILE / 2;

    this._autoSaveTimer = (this._autoSaveTimer || 0) + dt;
    if (this._autoSaveTimer > 60) {
      this._autoSaveTimer = 0;
      this.save();
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, w, h);

    if (this.state === "title" || this.state === "gameover") return;

    const scale = Math.max(1, Math.floor(Math.min(w / (VIEW_W * TILE), h / (VIEW_H * TILE))));
    const offsetX = Math.floor((w - VIEW_W * TILE * scale) / 2);
    const offsetY = Math.floor((h - VIEW_H * TILE * scale) / 2);

    const startX = Math.max(0, Math.floor(this.player.x - VIEW_W / 2));
    const startY = Math.max(0, Math.floor(this.player.y - VIEW_H / 2));
    const endX = Math.min(MAP_W, startX + VIEW_W + 1);
    const endY = Math.min(MAP_H, startY + VIEW_H + 1);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = this.map[y][x];
        const px = (x - startX) * TILE;
        const py = (y - startY) * TILE;
        ctx.fillStyle = TILE_COLORS[tile] || "#333";
        ctx.fillRect(px, py, TILE, TILE);

        if (tile === T.TREE) {
          ctx.fillStyle = "#0d3d0d";
          ctx.beginPath();
          ctx.moveTo(px + 16, py + 4);
          ctx.lineTo(px + 6, py + 22);
          ctx.lineTo(px + 26, py + 22);
          ctx.fill();
          ctx.fillStyle = "#5d3a1a";
          ctx.fillRect(px + 13, py + 20, 6, 10);
        } else if (tile === T.WATER) {
          ctx.fillStyle = "rgba(100,180,255,0.3)";
          ctx.fillRect(px, py + 20, TILE, 4);
        } else if (tile === T.MOUNTAIN) {
          ctx.fillStyle = "#888";
          ctx.beginPath();
          ctx.moveTo(px + 16, py + 4);
          ctx.lineTo(px + 2, py + 28);
          ctx.lineTo(px + 30, py + 28);
          ctx.fill();
        } else if (tile === T.VILLAGE) {
          ctx.fillStyle = "#8b4513";
          ctx.fillRect(px + 8, py + 12, 16, 14);
          ctx.fillStyle = "#a52a2a";
          ctx.beginPath();
          ctx.moveTo(px + 6, py + 12);
          ctx.lineTo(px + 16, py + 4);
          ctx.lineTo(px + 26, py + 12);
          ctx.fill();
        } else if (tile === T.CASTLE) {
          ctx.fillStyle = "#4a4a6a";
          ctx.fillRect(px + 4, py + 10, 24, 20);
          ctx.fillStyle = "#3a3a5a";
          ctx.fillRect(px + 8, py + 4, 6, 10);
          ctx.fillRect(px + 18, py + 4, 6, 10);
        } else if (tile === T.DUNGEON) {
          ctx.fillStyle = "#2a1a1a";
          ctx.fillRect(px + 6, py + 8, 20, 20);
          ctx.fillStyle = "#111";
          ctx.fillRect(px + 12, py + 16, 8, 12);
        }
      }
    }

    this.chests.forEach(c => {
      if (c.x < startX || c.x >= endX || c.y < startY || c.y >= endY) return;
      const px = (c.x - startX) * TILE;
      const py = (c.y - startY) * TILE;
      ctx.fillStyle = c.opened ? "#555" : "#c9a227";
      ctx.fillRect(px + 8, py + 12, 16, 12);
      ctx.fillStyle = "#8b6914";
      ctx.fillRect(px + 14, py + 10, 4, 4);
    });

    this.npcs.forEach(n => {
      if (n.x < startX || n.x >= endX || n.y < startY || n.y >= endY) return;
      const px = (n.x - startX) * TILE + 16;
      const py = (n.y - startY) * TILE + 16;
      ctx.fillStyle = n.color;
      ctx.beginPath();
      ctx.arc(px, py - 4, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#333";
      ctx.fillRect(px - 6, py + 6, 12, 10);
    });

    const ppx = (this.player.x - startX) * TILE + (this.player.px - this.player.x * TILE);
    const ppy = (this.player.y - startY) * TILE + (this.player.py - this.player.y * TILE);
    const bob = this.player.moving ? Math.sin(this.player.animFrame * 1.5) * 2 : 0;
    ctx.fillStyle = "#4fc3f7";
    ctx.beginPath();
    ctx.arc(ppx + 16, ppy + 12 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0288d1";
    ctx.fillRect(ppx + 10, ppy + 20 + bob, 12, 10);
    ctx.fillStyle = "#fff";
    const ind = { up: [16, 6], down: [16, 18], left: [8, 12], right: [24, 12] };
    const [ix, iy] = ind[this.player.facing] || [16, 18];
    ctx.beginPath();
    ctx.arc(ppx + ix, ppy + iy + bob, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const night = Math.sin((this.dayTime - 0.25) * Math.PI * 2);
    if (night < 0) {
      ctx.fillStyle = `rgba(0,0,40,${Math.min(0.55, -night * 0.5)})`;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.weather === "rain") {
      ctx.strokeStyle = "rgba(150,180,255,0.4)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 60; i++) {
        const rx = Math.random() * w;
        const ry = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 12);
        ctx.stroke();
      }
    } else if (this.weather === "snow") {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 1.5 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  loop(timestamp) {
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000 || 0);
    this.lastTime = timestamp;
    this.update(dt);
    this.draw();
    requestAnimationFrame(t => this.loop(t));
  }
}

const game = new Game();
window.__game = game;
