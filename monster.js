/*
=========================================================
 Realm of Azan V5
 monsters.js
 Chunk 1/4
=========================================================
*/

// ----------------------------
// Loot Tables
// ----------------------------

const LootTables = {
    slime: [
        { item: "Slime Gel", chance: 0.70 },
        { item: "Small Potion", chance: 0.20 },
        { item: "Green Crystal", chance: 0.10 }
    ],

    goblin: [
        { item: "Rusty Sword", chance: 0.15 },
        { item: "Goblin Ear", chance: 0.80 },
        { item: "Potion", chance: 0.35 },
        { item: "Gold Ring", chance: 0.05 }
    ],

    skeleton: [
        { item: "Bone", chance: 0.75 },
        { item: "Iron Sword", chance: 0.20 },
        { item: "Mana Potion", chance: 0.30 }
    ],

    wolf: [
        { item: "Wolf Fang", chance: 0.70 },
        { item: "Wolf Pelt", chance: 0.50 },
        { item: "Large Potion", chance: 0.15 }
    ],

    dragon: [
        { item: "Dragon Scale", chance: 1.00 },
        { item: "Dragon Heart", chance: 0.50 },
        { item: "Legendary Sword", chance: 0.15 },
        { item: "Royal Crown", chance: 0.08 }
    ]
};

// ----------------------------
// Monster Database
// ----------------------------

const MonsterDatabase = {

    slime: {
        id: "slime",
        name: "Slime",

        maxHP: 35,
        attack: 6,
        defense: 2,
        speed: 4,

        xp: 12,
        gold: 6,

        critChance: 0.03,
        missChance: 0.10,

        loot: LootTables.slime
    },

    goblin: {
        id: "goblin",
        name: "Goblin",

        maxHP: 60,
        attack: 11,
        defense: 4,
        speed: 8,

        xp: 25,
        gold: 18,

        critChance: 0.07,
        missChance: 0.08,

        loot: LootTables.goblin
    },

    skeleton: {
        id: "skeleton",
        name: "Skeleton",

        maxHP: 95,
        attack: 16,
        defense: 8,
        speed: 6,

        xp: 45,
        gold: 35,

        critChance: 0.10,
        missChance: 0.05,

        loot: LootTables.skeleton
    },

    wolf: {
        id: "wolf",
        name: "Wolf",

        maxHP: 120,
        attack: 20,
        defense: 10,
        speed: 14,

        xp: 65,
        gold: 50,

        critChance: 0.15,
        missChance: 0.06,

        loot: LootTables.wolf
    },

    dragon: {
        id: "dragon",
        name: "Dragon King",

        maxHP: 600,
        attack: 55,
        defense: 30,
        speed: 20,

        xp: 1000,
        gold: 800,

        critChance: 0.25,
        missChance: 0.02,

        loot: LootTables.dragon,

        boss: true
    }

};

// ----------------------------
// Utility Functions
// ----------------------------

function randomChance(value) {
    return Math.random() <= value;
}

function randomRange(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function chooseLoot(table) {

    const drops = [];

    table.forEach(entry => {

        if (randomChance(entry.chance)) {

            drops.push(entry.item);

        }

    });

    return drops;
}

// ----------------------------
// Monster Class
// ----------------------------

class Monster {

    constructor(data) {

        this.id = data.id;
        this.name = data.name;

        this.maxHP = data.maxHP;
        this.hp = data.maxHP;

        this.attack = data.attack;
        this.defense = data.defense;
        this.speed = data.speed;

        this.xp = data.xp;
        this.gold = data.gold;

        this.critChance = data.critChance;
        this.missChance = data.missChance;

        this.loot = [...data.loot];

        this.isBoss = data.boss || false;

        this.alive = true;
    }

    takeDamage(amount) {

        amount = Math.max(
            1,
            amount - this.defense
        );

        this.hp -= amount;

        if (this.hp <= 0) {

            this.hp = 0;
            this.alive = false;

        }

        return amount;
    }

    heal(amount) {

        this.hp += amount;

        if (this.hp > this.maxHP) {

            this.hp = this.maxHP;

        }

    }

    attackRoll() {

        if (randomChance(this.missChance)) {

            return {
                hit: false,
                damage: 0,
                critical: false
            };

        }

        let damage = this.attack;

        let critical = false;

        if (randomChance(this.critChance)) {

            damage *= 2;
            critical = true;

        }

        damage += randomRange(0, 5);

        return {

            hit: true,
            damage,
            critical

        };

    }

    dropLoot() {

        return chooseLoot(this.loot);

    }

                     }

/*
=========================================================
 Realm of Azan V5
 monsters.js
 Chunk 2/4
=========================================================
*/

// ----------------------------------------------------
// Monster Factory
// ----------------------------------------------------

function cloneMonsterData(id) {

    const data = MonsterDatabase[id];

    if (!data) {
        throw new Error(`Unknown monster: ${id}`);
    }

    return JSON.parse(JSON.stringify(data));
}

function scaleMonsterData(data, playerLevel = 1) {

    const level = Math.max(1, playerLevel);

    const hpScale = 1 + (level - 1) * 0.15;
    const atk
  /*
=========================================================
 Realm of Azan V5
 monsters.js
 Chunk 3/4
=========================================================
*/

// ----------------------------------------------------
// Enemy AI
// ----------------------------------------------------

function enemyChooseAction(enemy) {

    if (!enemy.alive) {
        return {
            type: "none"
        };
    }

    // Boss AI

    if (enemy.isBoss) {

        if (enemy.hp <= enemy.maxHP * 0.50 && !enemy.enraged) {

            enemy.enraged = true;

            enemy.attack += 15;
            enemy.defense += 8;

            return {
                type: "enrage"
            };
        }

        if (enemy.hp <= enemy.maxHP * 0.25) {

            const roll = Math.random();

            if (roll < 0.40) {

                return {
                    type: "fireBreath"
                };

            }

            if (roll < 0.70) {

                return {
                    type: "heal"
                };

            }

        }

    }

    const roll = Math.random();

    if (roll < 0.15) {

        return {
            type: "defend"
        };

    }

    if (roll < 0.25) {

        return {
            type: "heal"
        };

    }

    return {
        type: "attack"
    };

}

// ----------------------------------------------------
// Execute Enemy Action
// ----------------------------------------------------

function performEnemyAction(enemy, player) {

    const action = enemyChooseAction(enemy);

    switch (action.type) {

        case "attack":

            return enemy.attackRoll();

        case "defend":

            enemy.defense += 3;

            return {

                hit: false,
                defend: true

            };

        case "heal":

            const healAmount = randomRange(12, 28);

            enemy.heal(healAmount);

            return {

                hit: false,
                heal: healAmount

            };

        case "fireBreath":

            return {

                hit: true,

                damage:
                    enemy.attack +
                    randomRange(18, 30),

                fire: true

            };

        case "enrage":

            return {

                hit: false,

                enrage: true

            };

        default:

            return {

                hit: false

            };

    }

}

// ----------------------------------------------------
// Dragon King Phase Update
// ----------------------------------------------------

function updateBossPhase(enemy) {

    if (!enemy.isBoss)
        return;

    const percent =
        enemy.hp / enemy.maxHP;

    if (percent <= 0.75 &&
        enemy.phase === 1) {

        enemy.phase = 2;

        enemy.attack += 6;

    }

    if (percent <= 0.50 &&
        enemy.phase === 2) {

        enemy.phase = 3;

        enemy.attack += 8;

        enemy.defense += 5;

    }

    if (percent <= 0.25 &&
        enemy.phase === 3) {

        enemy.phase = 4;

        enemy.attack += 12;

        enemy.speed += 5;

    }

}

// ----------------------------------------------------
// Loot Helpers
// ----------------------------------------------------

function generateLoot(enemy) {

    return enemy.dropLoot();

}

function getReward(enemy) {

    return {

        xp: enemy.xp,

        gold: enemy.gold,

        loot: generateLoot(enemy)

    };

}

// ----------------------------------------------------
// Encounter Helpers
// ----------------------------------------------------

function randomAreaEncounter(playerLevel) {

    const areas = [

        "grassland",

        "forest",

        "cave",

        "graveyard",

        "mountain",

        "dungeon"

    ];

    const area =
        areas[
            randomRange(
                0,
                areas.length - 1
            )
        ];

    return randomEncounter(
        playerLevel,
        area
    );

}

function isBossEncounter(level) {

    return level >= 10 &&
           Math.random() < 0.05;

}

function createEncounter(playerLevel) {

    if (isBossEncounter(playerLevel)) {

        return createDragonKing(
            playerLevel
        );

    }

    return randomAreaEncounter(
        playerLevel
    );

}
/*
=========================================================
 Realm of Azan V5
 monsters.js
 Chunk 4/4
=========================================================
*/

// ----------------------------------------------------
// Reset Monster
// ----------------------------------------------------

function resetMonster(monster) {

    monster.hp = monster.maxHP;
    monster.alive = true;

    if (monster.isBoss) {

        monster.phase = 1;
        monster.enraged = false;

    }

    return monster;
}

// ----------------------------------------------------
// Serialization
// ----------------------------------------------------

function serializeMonster(monster) {

    return {
        id: monster.id,
        hp: monster.hp,
        maxHP: monster.maxHP,
        attack: monster.attack,
        defense: monster.defense,
        speed: monster.speed,
        xp: monster.xp,
        gold: monster.gold,
        alive: monster.alive,
        isBoss: monster.isBoss,
        phase: monster.phase || 1,
        enraged: monster.enraged || false
    };

}

function deserializeMonster(data) {

    const monster = createMonster(data.id);

    Object.assign(monster, data);

    return monster;

}

// ----------------------------------------------------
// Information Helpers
// ----------------------------------------------------

function getMonsterInfo(id) {

    return MonsterDatabase[id] || null;

}

function getAllMonsters() {

    return Object.keys(MonsterDatabase);

}

function monsterExists(id) {

    return MonsterDatabase.hasOwnProperty(id);

}

// ----------------------------------------------------
// Difficulty Modifier
// ----------------------------------------------------

function applyDifficulty(monster, difficulty = "Normal") {

    switch (difficulty) {

        case "Easy":

            monster.maxHP = Math.floor(monster.maxHP * 0.85);
            monster.hp = monster.maxHP;
            monster.attack = Math.floor(monster.attack * 0.85);

            break;

          case "Hard":

            monster.maxHP = Math.floor(monster.maxHP * 1.35);
            monster.hp = monster.maxHP;
            monster.attack = Math.floor(monster.attack * 1.30);
            monster.defense = Math.floor(monster.defense * 1.20);

            break;

        default:

            break;

    }

    return monster;

}

// ----------------------------------------------------
// Boss Victory
// ----------------------------------------------------

function isBossDefeated(monster) {

    return monster.isBoss && !monster.alive;

}

// ----------------------------------------------------
// Random Treasure
// ----------------------------------------------------

function randomTreasure() {

    const treasure = [

        "Potion",
        "Hi Potion",
        "Mana Potion",
        "Iron Sword",
        "Steel Shield",
        "Leather Armor",
        "Magic Ring",
        "Ruby",
        "Emerald",
        "Gold Coin"

    ];

    return treasure[
        randomRange(
            0,
            treasure.length - 1
        )
    ];

}

// ----------------------------------------------------
// Global Exports
// ----------------------------------------------------

window.Monster = Monster;

window.MonsterDatabase = MonsterDatabase;

window.LootTables = LootTables;

window.SpawnPools = SpawnPools;

window.createMonster = createMonster;

window.createDragonKing = createDragonKing;

window.randomEncounter = randomEncounter;

window.createEncounter = createEncounter;

window.enemyChooseAction = enemyChooseAction;

window.performEnemyAction = performEnemyAction;

window.updateBossPhase = updateBossPhase;

window.generateLoot = generateLoot;

window.getReward = getReward;

window.randomTreasure = randomTreasure;

window.resetMonster = resetMonster;

window.serializeMonster = serializeMonster;

window.deserializeMonster = deserializeMonster;

window.getMonsterInfo = getMonsterInfo;

window.getAllMonsters = getAllMonsters;

window.monsterExists = monsterExists;

window.applyDifficulty = applyDifficulty;

window.isBossDefeated = isBossDefeated;

window.getAvailableAreas = getAvailableAreas;

window.getSpawnPool = getSpawnPool;

window.areaExists = areaExists;

window.shouldStartEncounter = shouldStartEncounter;

// ----------------------------------------------------
// Initialization
// ----------------------------------------------------

console.log("Realm of Azan V5 - monsters.js loaded.");

console.log("Available Monsters:");

getAllMonsters().forEach(id => {

    console.log(
        "-",
        MonsterDatabase[id].name
    );

});
        
