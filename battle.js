// battle.js - Turn-based combat system

import { ITEMS } from "./inventory.js";

export class Battle {
  constructor(player, enemies, callbacks) {
    this.player = player;
    this.enemies = enemies;
    this.callbacks = callbacks;
    this.turn = "player";
    this.selectedEnemy = 0;
    this.finished = false;
    this.log = [];
  }

  start() {
    this.addLog("Battle started!");
    this.enemies.forEach(e => this.addLog(`A wild ${e.name} appears!`));
    this.callbacks.onUpdate(this);
  }

  addLog(msg) {
    this.log.push(msg);
    if (this.log.length > 40) this.log.shift();
    this.callbacks.onLog(msg);
  }

  getAliveEnemies() {
    return this.enemies.filter(e => e.hp > 0);
  }

  playerAttack() {
    if (this.turn !== "player" || this.finished) return;
    const targets = this.getAliveEnemies();
    if (!targets.length) return;

    let target = targets[this.selectedEnemy] || targets[0];
    const hitChance = 0.85 + (this.player.spd - target.spd) * 0.01;
    if (Math.random() > Math.max(0.5, Math.min(0.95, hitChance))) {
      this.addLog("You missed!");
      this.endPlayerTurn();
      return;
    }

    const base = this.player.atk;
    const variance = 0.85 + Math.random() * 0.3;
    let dmg = Math.max(1, Math.round((base - target.def * 0.5) * variance));
    const crit = Math.random() < 0.12;
    if (crit) {
      dmg = Math.round(dmg * 1.8);
      this.addLog("Critical hit!");
    }
    target.hp = Math.max(0, target.hp - dmg);
    this.addLog(`You deal ${dmg} damage to ${target.name}.`);
    if (target.hp <= 0) {
      this.addLog(`${target.name} is defeated!`);
    }
    this.checkEnd();
    if (!this.finished) this.endPlayerTurn();
  }

  playerMagic(spell) {
    if (this.turn !== "player" || this.finished) return;
    const costs = { fire: 10, ice: 12, heal: 15 };
    const cost = costs[spell] || 10;
    if (this.player.mp < cost) {
      this.addLog("Not enough MP!");
      return;
    }
    this.player.mp -= cost;

    if (spell === "heal") {
      const heal = 35 + Math.floor(this.player.level * 3);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.addLog(`You heal yourself for ${heal} HP.`);
      this.endPlayerTurn();
      return;
    }

    const targets = this.getAliveEnemies();
    if (!targets.length) return;
    const target = targets[this.selectedEnemy] || targets[0];
    let dmg = 0;
    if (spell === "fire") {
      dmg = Math.round(18 + this.player.level * 2.5 + Math.random() * 8);
      this.addLog(`Fireball hits ${target.name} for ${dmg}!`);
    } else if (spell === "ice") {
      dmg = Math.round(15 + this.player.level * 2 + Math.random() * 6);
      this.addLog(`Ice Shard hits ${target.name} for ${dmg}!`);
      if (Math.random() < 0.25) {
        target.status = "slow";
        this.addLog(`${target.name} is slowed!`);
      }
    }
    target.hp = Math.max(0, target.hp - dmg);
    if (target.hp <= 0) this.addLog(`${target.name} is defeated!`);
    this.checkEnd();
    if (!this.finished) this.endPlayerTurn();
  }

  playerUseItem(itemId) {
    if (this.turn !== "player" || this.finished) return;
    const inv = this.player.inventory;
    if (!inv.useConsumable(itemId, this.player)) {
      this.addLog("Cannot use that item.");
      return;
    }
    const def = ITEMS[itemId];
    this.addLog(`You used ${def.name}.`);
    this.endPlayerTurn();
  }

  tryFlee() {
    if (this.turn !== "player" || this.finished) return;
    const avgSpd = this.getAliveEnemies().reduce((s, e) => s + e.spd, 0) / (this.getAliveEnemies().length || 1);
    const chance = 0.4 + (this.player.spd - avgSpd) * 0.03;
    if (Math.random() < Math.max(0.2, Math.min(0.85, chance))) {
      this.addLog("You fled successfully!");
      this.finished = true;
      this.callbacks.onFlee();
    } else {
      this.addLog("Couldn't escape!");
      this.endPlayerTurn();
    }
  }

  endPlayerTurn() {
    this.turn = "enemy";
    this.callbacks.onUpdate(this);
    setTimeout(() => this.enemyTurn(), 600);
  }

  enemyTurn() {
    if (this.finished) return;
    const alive = this.getAliveEnemies();
    if (!alive.length) {
      this.checkEnd();
      return;
    }

    const ordered = [...alive].sort((a, b) => b.spd - a.spd);
    let i = 0;

    const next = () => {
      if (this.finished || i >= ordered.length) {
        this.turn = "player";
        this.callbacks.onUpdate(this);
        return;
      }
      const enemy = ordered[i++];
      if (enemy.hp <= 0) {
        next();
        return;
      }
      this.enemyAct(enemy);
      setTimeout(next, 550);
    };
    next();
  }

  enemyAct(enemy) {
    if (enemy.ai === "boss" && enemy.hp < enemy.maxHp * 0.4 && Math.random() < 0.3) {
      const dmg = Math.round(enemy.atk * 1.4);
      this.player.hp = Math.max(0, this.player.hp - dmg);
      this.addLog(`${enemy.name} unleashes Dragon Breath for ${dmg}!`);
    } else if (enemy.ai === "defensive" && Math.random() < 0.25) {
      this.addLog(`${enemy.name} takes a defensive stance.`);
      enemy.def = Math.round(enemy.def * 1.3);
    } else {
      const hitChance = 0.8 + (enemy.spd - this.player.spd) * 0.01;
      if (Math.random() > Math.max(0.45, Math.min(0.92, hitChance))) {
        this.addLog(`${enemy.name} missed!`);
        return;
      }
      const variance = 0.85 + Math.random() * 0.3;
      let dmg = Math.max(1, Math.round((enemy.atk - this.player.def * 0.45) * variance));
      if (Math.random() < 0.08) {
        dmg = Math.round(dmg * 1.6);
        this.addLog("Critical hit from enemy!");
      }
      this.player.hp = Math.max(0, this.player.hp - dmg);
      this.addLog(`${enemy.name} hits you for ${dmg}.`);
    }

    if (this.player.hp <= 0) {
      this.addLog("You have been defeated...");
      this.finished = true;
      this.callbacks.onEnd(false);
    }
    this.callbacks.onUpdate(this);
  }

  checkEnd() {
    if (this.getAliveEnemies().length === 0) {
      this.finished = true;
      this.addLog("Victory!");
      this.callbacks.onEnd(true);
    } else if (this.player.hp <= 0) {
      this.finished = true;
      this.callbacks.onEnd(false);
    }
  }

  selectEnemy(index) {
    const alive = this.getAliveEnemies();
    if (index >= 0 && index < alive.length) {
      this.selectedEnemy = index;
      this.callbacks.onUpdate(this);
    }
  }
  }
