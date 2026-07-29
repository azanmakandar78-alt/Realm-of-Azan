// quests.js - Quest definitions and manager

export const QUESTS = {
  intro: {
    id: "intro",
    name: "A New Adventurer",
    description: "Speak to the Village Elder to begin your journey.",
    objectives: [
      { type: "talk", target: "elder", description: "Talk to the Village Elder", done: false }
    ],
    rewards: { xp: 20, gold: 30, items: [{ id: "potion_hp", qty: 2 }] },
    next: "slime_hunt"
  },
  slime_hunt: {
    id: "slime_hunt",
    name: "Slime Problem",
    description: "The village is troubled by slimes. Defeat 5 Slimes.",
    objectives: [
      { type: "kill", target: "slime", count: 5, current: 0, description: "Defeat 5 Slimes" }
    ],
    rewards: { xp: 50, gold: 60, items: [{ id: "leather_armor", qty: 1 }] },
    next: "goblin_threat"
  },
  goblin_threat: {
    id: "goblin_threat",
    name: "Goblin Threat",
    description: "Goblins have been raiding. Collect 3 Goblin Ears.",
    objectives: [
      { type: "collect", target: "goblin_ear", count: 3, current: 0, description: "Collect 3 Goblin Ears" }
    ],
    rewards: { xp: 80, gold: 100, items: [{ id: "iron_sword", qty: 1 }] },
    next: "dungeon_delve"
  },
  dungeon_delve: {
    id: "dungeon_delve",
    name: "Into the Dungeon",
    description: "Explore the dungeon and defeat 4 Skeletons.",
    objectives: [
      { type: "kill", target: "skeleton", count: 4, current: 0, description: "Defeat 4 Skeletons" }
    ],
    rewards: { xp: 120, gold: 150, items: [{ id: "chain_mail", qty: 1 }, { id: "potion_hi", qty: 1 }] },
    next: "dragon_slayer"
  },
  dragon_slayer: {
    id: "dragon_slayer",
    name: "The Dragon King",
    description: "Defeat the Dragon King in the castle and bring back his crown.",
    objectives: [
      { type: "kill", target: "dragon_king", count: 1, current: 0, description: "Defeat the Dragon King" },
      { type: "collect", target: "king_crown", count: 1, current: 0, description: "Obtain the King's Crown" }
    ],
    rewards: { xp: 600, gold: 500, items: [{ id: "plate_armor", qty: 1 }] },
    next: null
  }
};

export class QuestManager {
  constructor() {
    this.active = [];
    this.completed = [];
    this.flags = {};
  }

  start(questId) {
    if (this.active.find(q => q.id === questId) || this.completed.includes(questId)) return false;
    const def = QUESTS[questId];
    if (!def) return false;
    const q = JSON.parse(JSON.stringify(def));
    this.active.push(q);
    return true;
  }

  onKill(monsterType) {
    for (const q of this.active) {
      for (const obj of q.objectives) {
        if (obj.type === "kill" && obj.target === monsterType && obj.current < obj.count) {
          obj.current++;
          if (obj.current >= obj.count) obj.done = true;
        }
      }
      this._checkComplete(q);
    }
  }

  onCollect(itemId, qty = 1) {
    for (const q of this.active) {
      for (const obj of q.objectives) {
        if (obj.type === "collect" && obj.target === itemId) {
          obj.current = Math.min(obj.count, (obj.current || 0) + qty);
          if (obj.current >= obj.count) obj.done = true;
        }
      }
      this._checkComplete(q);
    }
  }

  onTalk(npcId) {
    for (const q of this.active) {
      for (const obj of q.objectives) {
        if (obj.type === "talk" && obj.target === npcId) {
          obj.done = true;
        }
      }
      this._checkComplete(q);
    }
  }

  _checkComplete(q) {
    if (q.objectives.every(o => o.done || (o.current !== undefined && o.current >= o.count))) {
      this.complete(q.id);
    }
  }

  complete(questId) {
    const idx = this.active.findIndex(q => q.id === questId);
    if (idx === -1) return null;
    const q = this.active.splice(idx, 1)[0];
    this.completed.push(questId);
    if (q.next) this.start(q.next);
    return q.rewards;
  }

  getActive() {
    return this.active;
  }

  isCompleted(id) {
    return this.completed.includes(id);
  }

  toJSON() {
    return {
      active: this.active,
      completed: this.completed,
      flags: this.flags
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.active = data.active || [];
    this.completed = data.completed || [];
    this.flags = data.flags || {};
  }
}
