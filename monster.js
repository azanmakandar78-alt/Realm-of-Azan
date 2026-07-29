// monsters.js - Enemy definitions and factory

export const MONSTER_TYPES = {
  slime: {
    id: "slime",
    name: "Slime",
    maxHp: 30,
    atk: 6,
    def: 2,
    spd: 4,
    xp: 12,
    gold: [3, 8],
    color: "#4caf50",
    drops: [
      { id: "slime_goo", chance: 0.4, qty: [1, 2] },
      { id: "potion_hp", chance: 0.15, qty: 1 }
    ],
    ai: "basic"
  },
  goblin: {
    id: "goblin",
    name: "Goblin",
    maxHp: 45,
    atk: 10,
    def: 4,
    spd: 7,
    xp: 22,
    gold: [8, 18],
    color: "#8bc34a",
    drops: [
      { id: "goblin_ear", chance: 0.35, qty: 1 },
      { id: "dagger", chance: 0.08, qty: 1 },
      { id: "potion_hp", chance: 0.2, qty: 1 }
    ],
    ai: "aggressive"
  },
  skeleton: {
    id: "skeleton",
    name: "Skeleton",
    maxHp: 60,
    atk: 14,
    def: 6,
    spd: 5,
    xp: 35,
    gold: [12, 25],
    color: "#cfd8dc",
    drops: [
      { id: "bone", chance: 0.5, qty: [1, 3] },
      { id: "rusty_sword", chance: 0.1, qty: 1 },
      { id: "potion_mp", chance: 0.15, qty: 1 }
    ],
    ai: "defensive"
  },
  wolf: {
    id: "wolf",
    name: "Wolf",
    maxHp: 55,
    atk: 16,
    def: 5,
    spd: 11,
    xp: 40,
    gold: [10, 22],
    color: "#795548",
    drops: [
      { id: "wolf_pelt", chance: 0.45, qty: 1 },
      { id: "fang", chance: 0.3, qty: [1, 2] }
    ],
    ai: "aggressive"
  },
  dragon_king: {
    id: "dragon_king",
    name: "Dragon King",
    maxHp: 450,
    atk: 38,
    def: 18,
    spd: 9,
    xp: 500,
    gold: [200, 350],
    color: "#e53935",
    drops: [
      { id: "dragon_scale", chance: 1.0, qty: [2, 4] },
      { id: "dragon_sword", chance: 0.6, qty: 1 },
      { id: "king_crown", chance: 1.0, qty: 1 }
    ],
    ai: "boss",
    isBoss: true
  }
};

/**
 * Create a live monster instance from a type key.
 * @param {string} typeKey
 * @param {number} levelScale - difficulty multiplier
 */
export function createMonster(typeKey, levelScale = 1) {
  const base = MONSTER_TYPES[typeKey];
  if (!base) throw new Error("Unknown monster: " + typeKey);

  const scale = Math.max(0.6, levelScale);
  return {
    id: base.id + "_" + Math.random().toString(36).slice(2, 7),
    type: base.id,
    name: base.name,
    maxHp: Math.round(base.maxHp * scale),
    hp: Math.round(base.maxHp * scale),
    atk: Math.round(base.atk * scale),
    def: Math.round(base.def * scale),
    spd: base.spd,
    xp: Math.round(base.xp * scale),
    goldMin: base.gold[0],
    goldMax: base.gold[1],
    color: base.color,
    drops: base.drops,
    ai: base.ai,
    isBoss: !!base.isBoss,
    status: null
  };
}

/**
 * Weighted random encounter table by area.
 */
export function getEncounterTable(area) {
  const tables = {
    grass: [
      { type: "slime", weight: 50 },
      { type: "goblin", weight: 30 },
      { type: "wolf", weight: 20 }
    ],
    forest: [
      { type: "goblin", weight: 40 },
      { type: "wolf", weight: 35 },
      { type: "slime", weight: 25 }
    ],
    dungeon: [
      { type: "skeleton", weight: 50 },
      { type: "goblin", weight: 30 },
      { type: "wolf", weight: 20 }
    ],
    castle: [
      { type: "skeleton", weight: 40 },
      { type: "goblin", weight: 30 },
      { type: "dragon_king", weight: 5 }
    ]
  };
  return tables[area] || tables.grass;
}

/**
 * Pick a random monster type from a weighted table.
 */
export function pickEncounter(area, playerLevel) {
  const table = getEncounterTable(area);
  const total = table.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of table) {
    r -= entry.weight;
    if (r <= 0) {
      const scale = 0.7 + playerLevel * 0.08;
      return createMonster(entry.type, scale);
    }
  }
  return createMonster("slime", 1);
}
