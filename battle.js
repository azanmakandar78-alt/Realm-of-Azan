/*
=========================================================
 Realm of Azan V5
 battle.js
 Chunk 1/4
=========================================================
*/

// -----------------------------------------------------
// Battle State
// -----------------------------------------------------

const BattleState = {

    active: false,

    player: null,

    enemy: null,

    playerTurn: true,

    battleLog: [],

    victory: false,

    escaped: false,

    gameOver: false

};

// -----------------------------------------------------
// Start Battle
// -----------------------------------------------------

function startBattle(player, enemy) {

    BattleState.active = true;
    BattleState.player = player;
    BattleState.enemy = enemy;

    BattleState.playerTurn =
        player.speed >= enemy.speed;

    BattleState.victory = false;
    BattleState.escaped = false;
    BattleState.gameOver = false;

    BattleState.battleLog = [];

    addBattleLog(
        `A wild ${enemy.name} appeared!`
    );

    if (typeof updateBattleUI === "function") {
        updateBattleUI();
    }

}

// -----------------------------------------------------
// End Battle
// -----------------------------------------------------

function endBattle() {

    BattleState.active = false;
    BattleState.player = null;
    BattleState.enemy = null;
    BattleState.playerTurn = true;

}

// -----------------------------------------------------
// Battle Log
// -----------------------------------------------------

function addBattleLog(message) {

    BattleState.battleLog.push(message);

    if (BattleState.battleLog.length > 30) {

        BattleState.battleLog.shift();

    }

    if (typeof updateBattleLog === "function") {

        updateBattleLog(
            BattleState.battleLog
        );

    }

}

// -----------------------------------------------------
// Turn Control
// -----------------------------------------------------

function nextTurn() {

    BattleState.playerTurn =
        !BattleState.playerTurn;

    if (
        BattleState.active &&
        !BattleState.playerTurn
    ) {

        setTimeout(enemyTurn, 500);

    }

}

// -----------------------------------------------------
// Damage Formula
// -----------------------------------------------------

function calculateDamage(
    attacker,
    defender,
    multiplier = 1
) {

    let damage =
        attacker.attack -
        defender.defense;

    damage +=
        Math.floor(
            Math.random() * 6
        );

    damage *= multiplier;

    damage = Math.floor(damage);

    if (damage < 1)
        damage = 1;

    return damage;

}

// -----------------------------------------------------
// Critical Hit
// -----------------------------------------------------

function isCritical(attacker) {

    const chance =
        attacker.critical || 0.10;

    return Math.random() < chance;

}

// -----------------------------------------------------
// Miss Chance
// -----------------------------------------------------

function attackMissed(attacker) {

    const miss =
        attacker.missChance || 0.05;

    return Math.random() < miss;

}

// -----------------------------------------------------
// Player Attack
// -----------------------------------------------------

function playerAttack() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player =
        BattleState.player;

    const enemy =
        BattleState.enemy;

    if (attackMissed(player)) {

        addBattleLog(
            "Your attack missed!"
        );

        nextTurn();

        return;

    }

    let damage =
        calculateDamage(
            player,
            enemy
        );

    if (isCritical(player)) {

        damage *= 2;

        addBattleLog(
            "Critical Hit!"
        );

    }

    enemy.takeDamage(damage);

    addBattleLog(
        `You dealt ${damage} damage to ${enemy.name}.`
    );

    if (!enemy.alive) {

        handleVictory();

        return;

    }

    nextTurn();

}

// -----------------------------------------------------
// Enemy Turn
// -----------------------------------------------------

function enemyTurn() {

    if (!BattleState.active)
        return;

    if (BattleState.playerTurn)
        return;

    const result =
        performEnemyAction(
            BattleState.enemy,
            BattleState.player
        );

    if (result.enrage) {

        addBattleLog(
            `${BattleState.enemy.name} becomes enraged!`
        );

        nextTurn();

        return;

    }

    if (result.defend) {

        addBattleLog(
            `${BattleState.enemy.name} is defending.`
        );

        nextTurn();

        return;

    }

    if (result.heal) {

        addBattleLog(
            `${BattleState.enemy.name} healed ${result.heal} HP.`
        );

        nextTurn();

        return;

    }

    if (!result.hit) {

        addBattleLog(
            `${BattleState.enemy.name} missed!`
        );

        nextTurn();

        return;

    }

    BattleState.player.hp -=
        result.damage;

    if (
        BattleState.player.hp < 0
    ) {

        BattleState.player.hp = 0;

    }

    addBattleLog(
        `${BattleState.enemy.name} dealt ${result.damage} damage.`
    );

    if (
        BattleState.player.hp <= 0
    ) {

        handleGameOver();

        return;

    }

    nextTurn();

      }
/*
=========================================================
 Realm of Azan V5
 battle.js
 Chunk 2/4
=========================================================
*/

// -----------------------------------------------------
// Mana Costs
// -----------------------------------------------------

const BattleMagic = {

    magicAttackCost: 20,

    healCost: 15

};

// -----------------------------------------------------
// Magic Attack
// -----------------------------------------------------

function playerMagicAttack() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player = BattleState.player;
    const enemy = BattleState.enemy;

    if (player.mana < BattleMagic.magicAttackCost) {

        addBattleLog(
            "Not enough Mana!"
        );

        return;
    }

    player.mana -= BattleMagic.magicAttackCost;

    let damage =
        Math.floor(player.attack * 1.8);

    damage +=
        Math.floor(Math.random() * 12);

    if (isCritical(player)) {

        damage *= 2;

        addBattleLog(
            "Critical Magic!"
        );

    }

    enemy.takeDamage(damage);

    addBattleLog(
        `Magic dealt ${damage} damage.`
    );

    if (!enemy.alive) {

        handleVictory();

        return;

    }

    nextTurn();

}

// -----------------------------------------------------
// Heal Spell
// -----------------------------------------------------

function playerHeal() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player = BattleState.player;

    if (player.mana < BattleMagic.healCost) {

        addBattleLog(
            "Not enough Mana!"
        );

        return;

    }

    player.mana -=
        BattleMagic.healCost;

    const heal =
        Math.floor(
            player.maxHP * 0.30
        );

    player.hp += heal;

    if (player.hp > player.maxHP) {

        player.hp = player.maxHP;

    }

    addBattleLog(
        `Recovered ${heal} HP.`
    );

    nextTurn();

}

// -----------------------------------------------------
// Potion Usage
// -----------------------------------------------------

function useBattlePotion(itemName) {

    if (!BattleState.active)
        return;

    const player =
        BattleState.player;

    if (
        typeof useItem !==
        "function"
    ) {

        addBattleLog(
            "Inventory system unavailable."
        );

        return;

    }

    const success =
        useItem(
            player,
            player.inventory,
            itemName
        );

    if (!success) {

        addBattleLog(
            "Cannot use item."
        );

        return;

    }

    addBattleLog(
        `${itemName} used.`
    );

    nextTurn();

}

// -----------------------------------------------------
// Escape
// -----------------------------------------------------

function attemptEscape() {

    if (!BattleState.active)
        return;

    const player =
        BattleState.player;

    const enemy =
        BattleState.enemy;

    if (enemy.isBoss) {

        addBattleLog(
            "You cannot escape from the Dragon King!"
        );

        return;

    }

    const chance =

        0.50 +

        (
            player.speed -
            enemy.speed
        ) / 100;

    if (
        Math.random() <
        chance
    ) {

        BattleState.escaped =
            true;

        addBattleLog(
            "Escaped successfully!"
        );

        endBattle();

        return;

    }

    addBattleLog(
        "Escape failed!"
    );

    nextTurn();

}

// -----------------------------------------------------
// Guard
// -----------------------------------------------------

function playerGuard() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player =
        BattleState.player;

    player.tempDefense = 8;

    addBattleLog(
        "You brace for impact."
    );

    nextTurn();

}

// -----------------------------------------------------
// Boss Specials
// -----------------------------------------------------

function dragonFireBreath() {

    const player =
        BattleState.player;

    const boss =
        BattleState.enemy;

    let damage =
        boss.attack +
        25 +
        Math.floor(
            Math.random() * 20
        );

    damage -=
        player.tempDefense || 0;

    if (damage < 1)
        damage = 1;

    player.hp -= damage;

    if (player.hp < 0)
        player.hp = 0;

    addBattleLog(
        `Dragon Fire Breath dealt ${damage} damage!`
    );

}

function dragonTailSwipe() {

    const player =
        BattleState.player;

    const boss =
        BattleState.enemy;

    let damage =
        boss.attack +
        10 +
        Math.floor(
            Math.random() * 10
        );

    damage -=
        player.tempDefense || 0;

    if (damage < 1)
        damage = 1;

    player.hp -= damage;

    if (player.hp < 0)
        player.hp = 0;

    addBattleLog(
        `Dragon Tail Swipe dealt ${damage} damage!`
    );

}

// -----------------------------------------------------
// Battle Action Dispatcher
// -----------------------------------------------------

function performBattleAction(action) {

    switch (action) {

        case "attack":

            playerAttack();

            break;

        case "magic":

            playerMagicAttack();

            break;

        case "heal":

            playerHeal();

            break;

        case "guard":

            playerGuard();

            break;

        case "run":

            attemptEscape();

            break;

        default:

            addBattleLog(
                "Unknown battle action."
            
              );

    }

}

/*
=========================================================
 Realm of Azan V5
 battle.js
 Chunk 2/4
=========================================================
*/

// -----------------------------------------------------
// Mana Costs
// -----------------------------------------------------

const BattleMagic = {

    magicAttackCost: 20,

    healCost: 15

};

// -----------------------------------------------------
// Magic Attack
// -----------------------------------------------------

function playerMagicAttack() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player = BattleState.player;
    const enemy = BattleState.enemy;

    if (player.mana < BattleMagic.magicAttackCost) {

        addBattleLog(
            "Not enough Mana!"
        );

        return;
    }

    player.mana -= BattleMagic.magicAttackCost;

    let damage =
        Math.floor(player.attack * 1.8);

    damage +=
        Math.floor(Math.random() * 12);

    if (isCritical(player)) {

        damage *= 2;

        addBattleLog(
            "Critical Magic!"
        );

    }

    enemy.takeDamage(damage);

    addBattleLog(
        `Magic dealt ${damage} damage.`
    );

    if (!enemy.alive) {

        handleVictory();

        return;

    }

    nextTurn();

}

// -----------------------------------------------------
// Heal Spell
// -----------------------------------------------------

function playerHeal() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player = BattleState.player;

    if (player.mana < BattleMagic.healCost) {

        addBattleLog(
            "Not enough Mana!"
        );

        return;

    }

    player.mana -=
        BattleMagic.healCost;

    const heal =
        Math.floor(
            player.maxHP * 0.30
        );

    player.hp += heal;

    if (player.hp > player.maxHP) {

        player.hp = player.maxHP;

    }

    addBattleLog(
        `Recovered ${heal} HP.`
    );

    nextTurn();

}

// -----------------------------------------------------
// Potion Usage
// -----------------------------------------------------

function useBattlePotion(itemName) {

    if (!BattleState.active)
        return;

    const player =
        BattleState.player;

    if (
        typeof useItem !==
        "function"
    ) {

        addBattleLog(
            "Inventory system unavailable."
        );

        return;

    }

    const success =
        useItem(
            player,
            player.inventory,
            itemName
        );

    if (!success) {

        addBattleLog(
            "Cannot use item."
        );

        return;

    }

    addBattleLog(
        `${itemName} used.`
    );

    nextTurn();

}

// -----------------------------------------------------
// Escape
// -----------------------------------------------------

function attemptEscape() {

    if (!BattleState.active)
        return;

    const player =
        BattleState.player;

    const enemy =
        BattleState.enemy;

    if (enemy.isBoss) {

        addBattleLog(
            "You cannot escape from the Dragon King!"
        );

        return;

    }

    const chance =

        0.50 +

        (
            player.speed -
            enemy.speed
        ) / 100;

    if (
        Math.random() <
        chance
    ) {

        BattleState.escaped =
            true;

        addBattleLog(
            "Escaped successfully!"
        );

        endBattle();

        return;

    }

    addBattleLog(
        "Escape failed!"
    );

    nextTurn();

}

// -----------------------------------------------------
// Guard
// -----------------------------------------------------

function playerGuard() {

    if (!BattleState.active)
        return;

    if (!BattleState.playerTurn)
        return;

    const player =
        BattleState.player;

    player.tempDefense = 8;

    addBattleLog(
        "You brace for impact."
    );

    nextTurn();

}

// -----------------------------------------------------
// Boss Specials
// -----------------------------------------------------

function dragonFireBreath() {

    const player =
        BattleState.player;

    const boss =
        BattleState.enemy;

    let damage =
        boss.attack +
        25 +
        Math.floor(
            Math.random() * 20
        );

    damage -=
        player.tempDefense || 0;

    if (damage < 1)
        damage = 1;

    player.hp -= damage;

    if (player.hp < 0)
        player.hp = 0;

    addBattleLog(
        `Dragon Fire Breath dealt ${damage} damage!`
    );

}

function dragonTailSwipe() {

    const player =
        BattleState.player;

    const boss =
        BattleState.enemy;

    let damage =
        boss.attack +
        10 +
        Math.floor(
            Math.random() * 10
        );

    damage -=
        player.tempDefense || 0;

    if (damage < 1)
        damage = 1;

    player.hp -= damage;

    if (player.hp < 0)
        player.hp = 0;

    addBattleLog(
        `Dragon Tail Swipe dealt ${damage} damage!`
    );

}

// -----------------------------------------------------
// Battle Action Dispatcher
// -----------------------------------------------------

function performBattleAction(action) {

    switch (action) {

        case "attack":

            playerAttack();

            break;

        case "magic":

            playerMagicAttack();

            break;

        case "heal":

            playerHeal();

            break;

        case "guard":

            playerGuard();

            break;

        case "run":

            attemptEscape();

            break;

        default:

            addBattleLog(
                "Unknown battle action."
            );

    }

}

/*
=========================================================
 Realm of Azan V5
 battle.js
 Chunk 3/4
=========================================================
*/

// -----------------------------------------------------
// Victory
// -----------------------------------------------------

function handleVictory() {

    const player = BattleState.player;
    const enemy = BattleState.enemy;

    BattleState.victory = true;

    addBattleLog(`${enemy.name} was defeated!`);

    const reward = getReward(enemy);

    // XP
    player.xp += reward.xp;

    addBattleLog(
        `+${reward.xp} XP`
    );

    // Gold
    player.gold += reward.gold;

    addBattleLog(
        `+${reward.gold} Gold`
    );

    // Loot
    if (
        reward.loot &&
        reward.loot.length > 0 &&
        player.inventory
    ) {

        reward.loot.forEach(item => {

            player.inventory.addItem(item);

            addBattleLog(
                `Obtained ${item}`
            );

        });

    }

    // Quest Progress

    if (
        window.questManager &&
        typeof registerMonsterKill ===
            "function"
    ) {

        registerMonsterKill(
            window.questManager,
            enemy.id
        );

    }

    // Boss Check

    if (
        enemy.isBoss
    ) {

        addBattleLog(
            "The Dragon King has fallen!"
        );

        BattleState.bossDefeated = true;

    }

    levelUpCheck();

    if (
        typeof updateBattleUI ===
        "function"
    ) {

        updateBattleUI();

    }

    setTimeout(() => {

        endBattle();

    }, 1500);

}

// -----------------------------------------------------
// Level Up
// -----------------------------------------------------

function levelUpCheck() {

    const player =
        BattleState.player;

    while (

        player.xp >= player.nextLevelXP

    ) {

        player.xp -=
            player.nextLevelXP;

        player.level++;

        player.nextLevelXP =
            Math.floor(
                player.nextLevelXP * 1.35
            );

        player.maxHP += 20;
        player.maxMana += 10;

        player.attack += 4;
        player.defense += 2;
        player.speed += 1;

        player.hp =
            player.maxHP;

        player.mana =
            player.maxMana;

        addBattleLog(
            `Level Up! Level ${player.level}`
        );

    }

}

// -----------------------------------------------------
// Game Over
// -----------------------------------------------------

function handleGameOver() {

    BattleState.gameOver = true;

    addBattleLog(
        "You have been defeated..."
    );

    if (
        typeof showGameOverScreen ===
        "function"
    ) {

        showGameOverScreen();

    }

    setTimeout(() => {

        endBattle();

    }, 2000);

}

// -----------------------------------------------------
// Revive Player
// -----------------------------------------------------

function revivePlayer() {

    const player =
        BattleState.player;

    if (!player)
        return;

    player.hp =
        Math.floor(
            player.maxHP * 0.50
        );

    player.mana =
        Math.floor(
            player.maxMana * 0.50
        );

}

// -----------------------------------------------------
// Cleanup
// -----------------------------------------------------

function cleanupBattle() {

    if (
        BattleState.player
    ) {

        BattleState.player.tempDefense = 0;

    }

    BattleState.enemy = null;

    BattleState.playerTurn = true;

    BattleState.active = false;

}

// -----------------------------------------------------
// Rewards Summary
// -----------------------------------------------------

function getBattleSummary() {

    if (!BattleState.victory)
        return null;

    return {

        enemy:
            BattleState.enemy
                ? BattleState.enemy.name
                : "",

        playerLevel:
            BattleState.player
                ? BattleState.player.level
                : 0,

        playerGold:
            BattleState.player
                ? BattleState.player.gold
                : 0,

        playerXP:
            BattleState.player
                ? BattleState.player.xp
                : 0

    };

          }
/*
=========================================================
 Realm of Azan V5
 battle.js
 Chunk 4/4
=========================================================
*/

// -----------------------------------------------------
// UI Refresh
// -----------------------------------------------------

function refreshBattleUI() {

    if (typeof updateBattleUI === "function") {
        updateBattleUI();
    }

    if (typeof updateHUD === "function") {
        updateHUD();
    }

}

// -----------------------------------------------------
// Button Handlers
// -----------------------------------------------------

function bindBattleButtons() {

    const attackBtn = document.getElementById("attackBtn");
    const magicBtn = document.getElementById("magicBtn");
    const healBtn = document.getElementById("healBtn");
    const runBtn = document.getElementById("runBtn");

    if (attackBtn)
        attackBtn.onclick = () => performBattleAction("attack");

    if (magicBtn)
        magicBtn.onclick = () => performBattleAction("magic");

    if (healBtn)
        healBtn.onclick = () => performBattleAction("heal");

    if (runBtn)
        runBtn.onclick = () => performBattleAction("run");

}

// -----------------------------------------------------
// Keyboard Shortcuts
// -----------------------------------------------------

function bindBattleKeyboard() {

    document.addEventListener("keydown", e => {

        if (!BattleState.active)
            return;

        switch (e.key.toLowerCase()) {

            case "a":
                performBattleAction("attack");
                break;

            case "m":
                performBattleAction("magic");
                break;

            case "h":
                performBattleAction("heal");
                break;

            case "g":
                performBattleAction("guard");
                break;

            case "r":
                performBattleAction("run");
                break;

        }

    });

}

// -----------------------------------------------------
// Mobile Support
// -----------------------------------------------------

function bindBattleTouch() {

    [
        "attackBtn",
        "magicBtn",
        "healBtn",
        "runBtn"
    ].forEach(id => {

        const btn =
            document.getElementById(id);

        if (!btn)
            return;

        btn.addEventListener(
            "touchstart",
            e => {

                e.preventDefault();

                btn.click();

            },
            {
                passive: false
            }
        );

    });

}

// -----------------------------------------------------
// Update Battle Screen
// -----------------------------------------------------

function updateBattleScreen() {

    const enemyInfo =
        document.getElementById("enemyInfo");

    if (!enemyInfo)
        return;

    if (!BattleState.enemy) {

        enemyInfo.innerHTML = "";

        return;

    }

    enemyInfo.innerHTML = `
        <h3>${BattleState.enemy.name}</h3>

        <p>
            HP:
            ${BattleState.enemy.hp}
            /
            ${BattleState.enemy.maxHP}
        </p>

        <p>
            Attack:
            ${BattleState.enemy.attack}
        </p>

        <p>
            Defense:
            ${BattleState.enemy.defense}
        </p>
    `;

}

// -----------------------------------------------------
// Reset Battle
// -----------------------------------------------------

function resetBattleState() {

    BattleState.active = false;
    BattleState.player = null;
    BattleState.enemy = null;
    BattleState.playerTurn = true;
    BattleState.victory = false;
    BattleState.escaped = false;
    BattleState.gameOver = false;
    BattleState.battleLog = [];

}

// -----------------------------------------------------
// Global Exports
// -----------------------------------------------------

window.BattleState = BattleState;

window.startBattle = startBattle;
window.endBattle = endBattle;

window.playerAttack = playerAttack;
window.playerMagicAttack = playerMagicAttack;
window.playerHeal = playerHeal;

window.playerGuard = playerGuard;

window.performBattleAction =
    performBattleAction;

window.useBattlePotion =
    useBattlePotion;

window.attemptEscape =
    attemptEscape;

window.enemyTurn =
    enemyTurn;

window.handleVictory =
    handleVictory;

window.handleGameOver =
    handleGameOver;

window.levelUpCheck =
    levelUpCheck;

window.cleanupBattle =
    cleanupBattle;

window.getBattleSummary =
    getBattleSummary;

window.refreshBattleUI =
    refreshBattleUI;

window.updateBattleScreen =
    updateBattleScreen;

window.bindBattleButtons =
    bindBattleButtons;

window.bindBattleKeyboard =
    bindBattleKeyboard;

window.bindBattleTouch =
    bindBattleTouch;

window.resetBattleState =
    resetBattleState;

// -----------------------------------------------------
// Initialization
// -----------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        bindBattleButtons();
        bindBattleKeyboard();
        bindBattleTouch();

        console.log(
            "Realm of Azan V5 - battle.js loaded."
        );

    }
);
