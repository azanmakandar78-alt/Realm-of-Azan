// inventory.js - Items, inventory, equipment

export const ITEMS = {
  // Consumables
  potion_hp: {
    id: "potion_hp",
    name: "Health Potion",
    type: "consumable",
    stackable: true,
    maxStack: 20,
    effect: { heal: 40 },
    price: 25,
    desc: "Restores 40 HP."
  },
  potion_mp: {
    id: "potion_mp",
    name: "Mana Potion",
    type: "consumable",
    stackable: true,
    maxStack: 20,
    effect: { mana: 30 },
    price: 30,
    desc: "Restores 30 MP."
  },
  potion_hi: {
    id: "potion_hi",
    name: "Hi-Potion",
    type: "consumable",
    stackable: true,
    maxStack: 10,
    effect: { heal: 100 },
    price: 80,
    desc: "Restores 100 HP."
  },

  // Weapons
  rusty_sword: {
    id: "rusty_sword",
    name: "Rusty Sword",
    type: "weapon",
    stackable: false,
    atk: 5,
    price: 40,
    desc: "A worn blade. +5 ATK."
  },
  dagger: {
    id: "dagger",
    name: "Dagger",
    type: "weapon",
    stackable: false,
    atk: 7,
    spd: 2,
    price: 60,
    desc: "Quick blade. +7 ATK, +2 SPD."
  },
  iron_sword: {
    id: "iron_sword",
    name: "Iron Sword",
    type: "weapon",
    stackable: false,
    atk: 12,
    price: 120,
    desc: "Solid iron. +12 ATK."
  },
  dragon_sword: {
    id: "dragon_sword",
    name: "Dragon Sword",
    type: "weapon",
    stackable: false,
    atk: 28,
    price: 500,
    desc: "Legendary blade. +28 ATK."
  },

  // Armor
  leather_armor: {
    id: "leather_armor",
    name: "Leather Armor",
    type: "armor",
    stackable: false,
    def: 4,
    price: 50,
    desc: "Light protection. +4 DEF."
  },
  chain_mail: {
    id: "chain_mail",
    name: "Chain Mail",
    type: "armor",
    stackable: false,
    def: 9,
    price: 140,
    desc: "Interlocked rings. +9 DEF."
  },
  plate_armor: {
    id: "plate_armor",
    name: "Plate Armor",
    type: "armor",
    stackable: false,
    def: 16,
    price: 280,
    desc: "Heavy plates. +16 DEF."
  },

  // Shields
  wooden_shield: {
    id: "wooden_shield",
    name: "Wooden Shield",
    type: "shield",
    stackable: false,
    def: 3,
    price: 35,
    desc: "Basic shield. +3 DEF."
  },
  iron_shield: {
    id: "iron_shield",
    name: "Iron Shield",
    type: "shield",
    stackable: false,
    def: 7,
    price: 100,
    desc: "Sturdy shield. +7 DEF."
  },

  // Quest / Drop items
  slime_goo: {
    id: "slime_goo",
    name: "Slime Goo",
    type: "material",
    stackable: true,
    maxStack: 99,
    price: 5,
    desc: "Sticky residue."
  },
  goblin_ear: {
    id: "goblin_ear",
    name: "Goblin Ear",
    type: "material",
    stackable: true,
    maxStack: 99,
    price: 8,
    desc: "Proof of a kill."
  },
  bone: {
    id: "bone",
    name: "Bone",
    type: "material",
    stackable: true,
    maxStack: 99,
    price: 4,
    desc: "Old bone."
  },
  wolf_pelt: {
    id: "wolf_pelt",
    name: "Wolf Pelt",
    type: "material",
    stackable: true,
    maxStack: 99,
    price: 12,
    desc: "Warm fur."
  },
  fang: {
    id: "fang",
    name: "Fang",
    type: "material",
    stackable: true,
    maxStack: 99,
    price: 6,
    desc: "Sharp tooth."
  },
  dragon_scale: {
    id: "dragon_scale",
    name: "Dragon Scale",
    type: "material",
    stackable: true,
    maxStack: 99,
    price: 80,
    desc: "Gleaming scale."
  },
  king_crown: {
    id: "king_crown",
    name: "King's Crown",
    type: "quest",
    stackable: false,
    price: 0,
    desc: "Proof of the Dragon King's defeat."
  },
  village_key: {
    id: "village_key",
    name: "Village Key",
    type: "quest",
    stackable: false,
    price: 0,
    desc: "Opens the sealed chest."
  },
  ancient_relic: {
    id: "ancient_relic",
    name: "Ancient Relic",
    type: "quest",
    stackable: false,
    price: 0,
    desc: "A mysterious artifact."
  }
};

/**
 * Inventory manager class.
 */
export class Inventory {
  constructor() {
    this.slots = []; // { id, qty }
    this.equipment = {
      weapon: null,
      armor: null,
      shield: null
    };
  }

  add(itemId, qty = 1) {
    const def = ITEMS[itemId];
    if (!def) return false;

    if (def.stackable) {
      const existing = this.slots.find(s => s.id === itemId);
      if (existing) {
        existing.qty = Math.min(def.maxStack || 99, existing.qty + qty);
        return true;
      }
    }

    for (let i = 0; i < qty; i++) {
      if (def.stackable) {
        this.slots.push({ id: itemId, qty: 1 });
      } else {
        this.slots.push({ id: itemId, qty: 1 });
      }
    }
    this._mergeStacks();
    return true;
  }

  _mergeStacks() {
    const map = new Map();
    for (const s of this.slots) {
      const def = ITEMS[s.id];
      if (def && def.stackable) {
        const cur = map.get(s.id) || 0;
        map.set(s.id, cur + s.qty);
      }
    }
    const newSlots = [];
    for (const s of this.slots) {
      const def = ITEMS[s.id];
      if (!def || !def.stackable) {
        newSlots.push(s);
      }
    }
    for (const [id, total] of map) {
      const def = ITEMS[id];
      const max = def.maxStack || 99;
      let left = total;
      while (left > 0) {
        const q = Math.min(max, left);
        newSlots.push({ id, qty: q });
        left -= q;
      }
    }
    this.slots = newSlots;
  }

  remove(itemId, qty = 1) {
    let remaining = qty;
    for (let i = this.slots.length - 1; i >= 0 && remaining > 0; i--) {
      if (this.slots[i].id === itemId) {
        if (this.slots[i].qty <= remaining) {
          remaining -= this.slots[i].qty;
          this.slots.splice(i, 1);
        } else {
          this.slots[i].qty -= remaining;
          remaining = 0;
        }
      }
    }
    return remaining === 0;
  }

  has(itemId, qty = 1) {
    let count = 0;
    for (const s of this.slots) {
      if (s.id === itemId) count += s.qty;
    }
    return count >= qty;
  }

  count(itemId) {
    return this.slots.reduce((n, s) => s.id === itemId ? n + s.qty : n, 0);
  }

  equip(itemId) {
    const def = ITEMS[itemId];
    if (!def || !["weapon", "armor", "shield"].includes(def.type)) return false;
    if (!this.has(itemId)) return false;

    const slot = def.type;
    if (this.equipment[slot]) {
      this.add(this.equipment[slot], 1);
    }
    this.remove(itemId, 1);
    this.equipment[slot] = itemId;
    return true;
  }

  unequip(slot) {
    if (!this.equipment[slot]) return false;
    this.add(this.equipment[slot], 1);
    this.equipment[slot] = null;
    return true;
  }

  getStatBonus() {
    let atk = 0, def = 0, spd = 0;
    for (const slot of ["weapon", "armor", "shield"]) {
      const id = this.equipment[slot];
      if (id && ITEMS[id]) {
        const d = ITEMS[id];
        atk += d.atk || 0;
        def += d.def || 0;
        spd += d.spd || 0;
      }
    }
    return { atk, def, spd };
  }

  useConsumable(itemId, player) {
    const def = ITEMS[itemId];
    if (!def || def.type !== "consumable") return false;
    if (!this.has(itemId)) return false;

    if (def.effect.heal) {
      player.hp = Math.min(player.maxHp, player.hp + def.effect.heal);
    }
    if (def.effect.mana) {
      player.mp = Math.min(player.maxMp, player.mp + def.effect.mana);
    }
    this.remove(itemId, 1);
    return true;
  }

  toJSON() {
    return {
      slots: this.slots,
      equipment: this.equipment
    };
  }

  fromJSON(data) {
    if (!data) return;
    this.slots = data.slots || [];
    this.equipment = data.equipment || { weapon: null, armor: null, shield: null };
  }
}
