/*
=========================================================
 Realm of Azan V5
 inventory.js
 Chunk 1/3
=========================================================
*/

// -----------------------------------------------------
// Item Database
// -----------------------------------------------------

const ItemDatabase = {

    // ---------------- Potions ----------------

    "Small Potion": {
        id: "small_potion",
        name: "Small Potion",
        type: "potion",
        stackable: true,
        maxStack: 99,
        value: 25,
        healHP: 30,
        description: "Restores 30 HP."
    },

    "Potion": {
        id: "potion",
        name: "Potion",
        type: "potion",
        stackable: true,
        maxStack: 99,
        value: 60,
        healHP: 75,
        description: "Restores 75 HP."
    },

    "Large Potion": {
        id: "large_potion",
        name: "Large Potion",
        type: "potion",
        stackable: true,
        maxStack: 99,
        value: 120,
        healHP: 150,
        description: "Restores 150 HP."
    },

    "Mana Potion": {
        id: "mana_potion",
        name: "Mana Potion",
        type: "mana",
        stackable: true,
        maxStack: 99,
        value: 90,
        restoreMana: 50,
        description: "Restores 50 Mana."
    },

    // ---------------- Weapons ----------------

    "Rusty Sword": {
        id: "rusty_sword",
        name: "Rusty Sword",
        type: "weapon",
        stackable: false,
        value: 40,
        attack: 3
    },

    "Iron Sword": {
        id: "iron_sword",
        name: "Iron Sword",
        type: "weapon",
        stackable: false,
        value: 180,
        attack: 8
    },

    "Legendary Sword": {
        id: "legendary_sword",
        name: "Legendary Sword",
        type: "weapon",
        stackable: false,
        value: 5000,
        attack: 30,
        critical: 0.15
    },

    // ---------------- Armor ----------------

    "Leather Armor": {
        id: "leather_armor",
        name: "Leather Armor",
        type: "armor",
        stackable: false,
        value: 150,
        defense: 5
    },

    "Iron Armor": {
        id: "iron_armor",
        name: "Iron Armor",
        type: "armor",
        stackable: false,
        value: 450,
        defense: 12
    },

    // ---------------- Shields ----------------

    "Wood Shield": {
        id: "wood_shield",
        name: "Wood Shield",
        type: "shield",
        stackable: false,
        value: 90,
        defense: 3
    },

    "Steel Shield": {
        id: "steel_shield",
        name: "Steel Shield",
        type: "shield",
        stackable: false,
        value: 380,
        defense: 10
    },

    // ---------------- Loot ----------------

    "Slime Gel": {
        id: "slime_gel",
        name: "Slime Gel",
        type: "material",
        stackable: true,
        maxStack: 999,
        value: 12
    },

    "Goblin Ear": {
        id: "goblin_ear",
        name: "Goblin Ear",
        type: "material",
        stackable: true,
        maxStack: 999,
        value: 18
    },

    "Bone": {
        id: "bone",
        name: "Bone",
        type: "material",
        stackable: true,
        maxStack: 999,
        value: 22
    },

    "Wolf Fang": {
        id: "wolf_fang",
        name: "Wolf Fang",
        type: "material",
        stackable: true,
        maxStack: 999,
        value: 35
    },

    "Wolf Pelt": {
        id: "wolf_pelt",
        name: "Wolf Pelt",
        type: "material",
        stackable: true,
        maxStack: 999,
        value: 42
    },

    "Dragon Scale": {
        id: "dragon_scale",
        name: "Dragon Scale",
        type: "material",
        stackable: true,
        maxStack: 999,
        value: 500
    },

    "Dragon Heart": {
        id: "dragon_heart",
        name: "Dragon Heart",
        type: "quest",
        stackable: false,
        value: 2500
    },

    "Royal Crown": {
        id: "royal_crown",
        name: "Royal Crown",
        type: "quest",
        stackable: false,
        value: 5000
    }

};

// -----------------------------------------------------
// Inventory Class
// -----------------------------------------------------

class Inventory {

    constructor(maxSlots = 40) {

        this.maxSlots = maxSlots;

        this.items = [];

    }

    getSize() {

        return this.items.length;

    }

    isFull() {

        return this.items.length >= this.maxSlots;

    }

    clear() {

        this.items = [];

    }

    hasItem(name) {

        return this.items.some(i => i.name === name);

    }

    findItem(name) {

        return this.items.find(i => i.name === name);

    }

    getQuantity(name) {

        const item = this.findItem(name);

        if (!item) return 0;

        return item.quantity;

    }

    addItem(name, amount = 1) {

        const data = ItemDatabase[name];

        if (!data)
            return false;

        if (data.stackable) {

            const existing = this.findItem(name);

            if (existing) {

                existing.quantity += amount;

                return true;

            }

        }

        if (this.isFull())
            return false;

        this.items.push({

            name,

            quantity: amount,

            equipped: false

        });

        return true;

    }

    removeItem(name, amount = 1) {

        const index =
            this.items.findIndex(
                i => i.name === name
            );

        if (index === -1)
            return false;

        this.items[index].quantity -= amount;

        if (this.items[index].quantity <= 0) {

            this.items.splice(index, 1);

        }

        return true;

    }

    listItems() {

        return [...this.items];

    }

}
/*
=========================================================
 Realm of Azan V5
 inventory.js
 Chunk 2/3
=========================================================
*/

// -----------------------------------------------------
// Equipment Manager
// -----------------------------------------------------

class Equipment {

    constructor() {

        this.slots = {
            weapon: null,
            armor: null,
            shield: null,
            accessory: null
        };

    }

    getSlot(type) {

        return this.slots[type] || null;

    }

    equip(inventory, itemName) {

        const entry = inventory.findItem(itemName);

        if (!entry)
            return false;

        const item = ItemDatabase[itemName];

        if (!item)
            return false;

        if (
            item.type !== "weapon" &&
            item.type !== "armor" &&
            item.type !== "shield" &&
            item.type !== "accessory"
        ) {
            return false;
        }

        const slot = item.type;

        if (this.slots[slot]) {

            inventory.addItem(
                this.slots[slot].name,
                1
            );

        }

        inventory.removeItem(itemName, 1);

        this.slots[slot] = {

            name: itemName,

            attack: item.attack || 0,

            defense: item.defense || 0,

            critical: item.critical || 0,

            speed: item.speed || 0,

            mana: item.mana || 0

        };

        return true;

    }

    unequip(inventory, slot) {

        const equipped =
            this.slots[slot];

        if (!equipped)
            return false;

        if (inventory.isFull())
            return false;

        inventory.addItem(
            equipped.name,
            1
        );

        this.slots[slot] = null;

        return true;

    }

    isEquipped(itemName) {

        return Object.values(
            this.slots
        ).some(item =>
            item &&
            item.name === itemName
        );

    }

    getAttackBonus() {

        let total = 0;

        Object.values(this.slots)
            .forEach(item => {

                if (item)
                    total += item.attack || 0;

            });

        return total;

    }

    getDefenseBonus() {

        let total = 0;

        Object.values(this.slots)
            .forEach(item => {

                if (item)
                    total += item.defense || 0;

            });

        return total;

    }

    getSpeedBonus() {

        let total = 0;

        Object.values(this.slots)
            .forEach(item => {

                if (item)
                    total += item.speed || 0;

            });

        return total;

    }

    getCriticalBonus() {

        let total = 0;

        Object.values(this.slots)
            .forEach(item => {

                if (item)
                    total += item.critical || 0;

            });

        return total;

    }

    getManaBonus() {

        let total = 0;

        Object.values(this.slots)
            .forEach(item => {

                if (item)
                    total += item.mana || 0;

            });

        return total;

    }

    getEquipment() {

        return {

            ...this.slots

        };

    }

    clear() {

        this.slots.weapon = null;
        this.slots.armor = null;
        this.slots.shield = null;
        this.slots.accessory = null;

    }

}

// -----------------------------------------------------
// Stat Calculator
// -----------------------------------------------------

function calculatePlayerStats(player, equipment) {

    const stats = {

        attack:
            player.baseAttack +
            equipment.getAttackBonus(),

        defense:
            player.baseDefense +
            equipment.getDefenseBonus(),

        speed:
            player.baseSpeed +
            equipment.getSpeedBonus(),

        critical:
            player.baseCritical +
            equipment.getCriticalBonus(),

        maxMana:
            player.baseMana +
            equipment.getManaBonus()

    };

    return stats;

}

// -----------------------------------------------------
// Equipment Validation
// -----------------------------------------------------

function canEquip(itemName) {

    const item =
        ItemDatabase[itemName];

    if (!item)
        return false;

    return [

        "weapon",

        "armor",

        "shield",

        "accessory"

    ].includes(item.type);

}

// -----------------------------------------------------
// Inventory Sorting
// -----------------------------------------------------

function sortInventory(inventory) {

    inventory.items.sort((a, b) =>

        a.name.localeCompare(b.name)

    );

}

// -----------------------------------------------------
// Equipment Summary
// -----------------------------------------------------

function getEquipmentSummary(equipment) {

    return {

        weapon:
            equipment.getSlot("weapon"),

        armor:
            equipment.getSlot("armor"),

        shield:
            equipment.getSlot("shield"),

        accessory:
            equipment.getSlot("accessory"),

        attack:
            equipment.getAttackBonus(),

        defense:
            equipment.getDefenseBonus(),

        speed:
            equipment.getSpeedBonus(),

        critical:
            equipment.getCriticalBonus()

    };
  /*
=========================================================
 Realm of Azan V5
 inventory.js
 Chunk 3/3
=========================================================
*/

// -----------------------------------------------------
// Consumables
// -----------------------------------------------------

function useItem(player, inventory, itemName) {

    const item = ItemDatabase[itemName];

    if (!item)
        return false;

    if (!inventory.hasItem(itemName))
        return false;

    switch (item.type) {

        case "potion":

            player.hp = Math.min(
                player.maxHP,
                player.hp + (item.healHP || 0)
            );

            inventory.removeItem(itemName, 1);

            return true;

        case "mana":

            player.mana = Math.min(
                player.maxMana,
                player.mana + (item.restoreMana || 0)
            );

            inventory.removeItem(itemName, 1);

            return true;

        default:

            return false;

    }

}

// -----------------------------------------------------
// Shop
// -----------------------------------------------------

function buyItem(player, inventory, itemName) {

    const item = ItemDatabase[itemName];

    if (!item)
        return false;

    if (player.gold < item.value)
        return false;
    if (!inventory.addItem(itemName))
        return false;

    player.gold -= item.value;

    return true;

}

function sellItem(player, inventory, itemName) {

    if (!inventory.hasItem(itemName))
        return false;

    const item = ItemDatabase[itemName];

    if (!item)
        return false;

    inventory.removeItem(itemName);

    player.gold += Math.floor(item.value / 2);

    return true;

}

// -----------------------------------------------------
// Quest Items
// -----------------------------------------------------

function getQuestItems(inventory) {

    return inventory.items.filter(entry => {

        const item = ItemDatabase[entry.name];

        return item && item.type === "quest";

    });

}

// -----------------------------------------------------
// Save / Load
// -----------------------------------------------------

function serializeInventory(inventory, equipment) {

    return {

        items: JSON.parse(
            JSON.stringify(inventory.items)
        ),

        equipment: JSON.parse(
            JSON.stringify(equipment.slots)
        )

    };

}

function deserializeInventory(data) {

    const inventory = new Inventory();

    inventory.items = data.items || [];

    const equipment = new Equipment();

    if (data.equipment) {

        equipment.slots = data.equipment;

    }

    return {

        inventory,

        equipment

    };

}

// -----------------------------------------------------
// Utility
// -----------------------------------------------------

function getInventoryValue(inventory) {

    let total = 0;

    inventory.items.forEach(entry => {

        const item = ItemDatabase[entry.name];

        if (!item)
            return;

        total += item.value * entry.quantity;

    });

    return total;

}

function countItems(inventory) {

    let total = 0;

    inventory.items.forEach(entry => {

        total += entry.quantity;

    });

    return total;

}

function removeAllItems(inventory) {

    inventory.clear();

}

function inventoryToText(inventory) {

    return inventory.items
        .map(item =>
            `${item.name} x${item.quantity}`
        )
        .join("\n");

}

// -----------------------------------------------------
// Global Exports
// -----------------------------------------------------

window.ItemDatabase = ItemDatabase;

window.Inventory = Inventory;

window.Equipment = Equipment;

window.useItem = useItem;

window.buyItem = buyItem;

window.sellItem = sellItem;

window.canEquip = canEquip;

window.calculatePlayerStats =
    calculatePlayerStats;

window.sortInventory = sortInventory;

window.getEquipmentSummary =
    getEquipmentSummary;

window.serializeInventory =
    serializeInventory;

window.deserializeInventory =
    deserializeInventory;

window.getInventoryValue =
    getInventoryValue;

window.countItems =
    countItems;

window.removeAllItems =
    removeAllItems;

window.inventoryToText =
    inventoryToText;

window.getQuestItems =
    getQuestItems;

// -----------------------------------------------------
// Initialization
// -----------------------------------------------------

console.log("Realm of Azan V5 - inventory.js loaded.");
console.log("Items:", Object.keys(ItemDatabase).length);


  
    
