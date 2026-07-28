import { createMonster } from './monsters.js';
import { ITEMS, addItem, removeItem, itemStats } from './inventory.js';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export class BattleSystem {
  constructor(state, ui, callbacks) {
    this.state = state;
    this.ui = ui;
    this.callbacks = callbacks;
    this.enemy = null;
    this.active = false;
  }

  start(monsterId) {
    this.enemy = createMonster(monsterId, this.state.settings.difficulty);
    this.active = true;
    this.ui.openBattle(this.enemy, [`A wild ${this.enemy.name} appears!`]);
  }

  playerStats() {
    const gear = itemStats(this.state.player.equipment);
    return {
      attack: this.state.player.attack + gear.attack,
      defense: this.state.player.defense + gear.defense,
      magic: this.state.player.magic + gear.magic,
      speed: this.state.player.speed
    };
  }

  action(type) {
    if (!this.active || this.state.player.hp <= 0) return;
    const log = [];
    if (type === 'attack') this.playerAttack(log);
    if (type === 'magic') this.playerMagic(log);
    if (type === 'heal') this.playerHeal(log);
    if (type === 'item') this.usePotion(log);
    if (type === 'flee') {
      if (!this.enemy.boss && Math.random() < 0.55) return this.end(false, ['You escaped safely.']);
      log.push('You failed to flee!');
    }
    if (this.enemy.hp <= 0) return this.victory(log);
    this.enemyTurn(log);
    if (this.state.player.hp <= 0) return this.defeat(log);
    this.ui.updateBattle(this.enemy, log);
    this.callbacks.changed();
  }

  playerAttack(log) {
    const stats = this.playerStats();
    if (Math.random() < 0.08) return log.push('Your attack missed.');
    const crit = Math.random() < 0.15;
    const damage = Math.max(1, rand(stats.attack - 2, stats.attack + 5) - Math.floor(this.enemy.defense / 2)) * (crit ? 2 : 1);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    log.push(`${crit ? 'Critical hit! ' : ''}You strike for ${damage} damage.`);
  }

  playerMagic(log) {
    const player = this.state.player;
    if (player.mana < 6) return log.push('Not enough mana.');
    player.mana -= 6;
    if (Math.random() < 0.04) return log.push('Your spell fizzles.');
    const damage = rand(12, 20) + this.playerStats().magic - Math.floor(this.enemy.defense / 3);
    this.enemy.hp = Math.max(0, this.enemy.hp - damage);
    log.push(`Firebolt burns ${this.enemy.name} for ${damage} damage.`);
  }

  playerHeal(log) {
    const player = this.state.player;
    if (player.mana < 8) return log.push('Not enough mana.');
    player.mana -= 8;
    const amount = rand(22, 36) + Math.floor(this.playerStats().magic / 2);
    player.hp = Math.min(player.maxHp, player.hp + amount);
    log.push(`You restore ${amount} HP.`);
  }

  usePotion(log) {
    const player = this.state.player;
    if (!removeItem(player.inventory, 'minor_potion', 1)) return log.push('No potions remain.');
    player.hp = Math.min(player.maxHp, player.hp + ITEMS.minor_potion.heal);
    log.push('You drink a Minor Potion and recover 30 HP.');
  }

  enemyTurn(log) {
    if (Math.random() < 0.1) return log.push(`${this.enemy.name} misses.`);
    const stats = this.playerStats();
    const special = this.enemy.boss && Math.random() < 0.3;
    const base = special ? this.enemy.attack + rand(8, 16) : rand(this.enemy.attack - 2, this.enemy.attack + 4);
    const damage = Math.max(1, base - Math.floor(stats.defense / 2));
    this.state.player.hp = Math.max(0, this.state.player.hp - damage);
    log.push(`${this.enemy.name}${special ? ' breathes royal fire' : ' attacks'} for ${damage} damage.`);
  }

  victory(log) {
    const player = this.state.player;
    const gold = rand(this.enemy.gold[0], this.enemy.gold[1]);
    player.gold += gold;
    player.xp += this.enemy.xp;
    log.push(`${this.enemy.name} defeated! Gained ${this.enemy.xp} XP and ${gold} gold.`);
    this.enemy.loot.forEach(drop => {
      if (Math.random() <= drop.chance) { addItem(player.inventory, drop.id, drop.qty); log.push(`Found ${drop.qty} ${ITEMS[drop.id].name}.`); }
    });
    this.callbacks.levelCheck(log);
    this.end(true, log);
  }

  defeat(log) {
    log.push('You collapse. The realm fades to darkness.');
    this.ui.updateBattle(this.enemy, log);
    setTimeout(() => this.callbacks.gameOver(), 900);
  }

  end(won, log) {
    this.active = false;
    this.ui.updateBattle(this.enemy, log);
    setTimeout(() => this.ui.closeBattle(), won ? 900 : 500);
    this.callbacks.changed();
  }
}
