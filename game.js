// =====================================
// Realm of Azan V4
// game.js
// Part A1
// =====================================

"use strict";

// ---------- SETTINGS ----------

const WORLD_SIZE = 20;

const TILE = {
    GRASS: "🌿",
    TREE: "🌳",
    ROCK: "🪨",
    WATER: "🌊",
    PLAYER: "🧙",
    MONSTER: "👹",
    CHEST: "💎",
    BOSS: "🐉",
    TOWN: "🏰"
};

// ---------- PLAYER ----------

const player = {

    x: 10,
    y: 10,

    hp: 100,
    maxHp: 100,

    attack: 12,
    defense: 4,

    level: 1,
    xp: 0,

    gold: 50,

    potions: 3,

    inventory: []

};

// ---------- GAME ----------

const game = {

    world: [],

    monsters: [],

    chests: [],

    boss: null,

    weather: "Sunny",

    day: true

};

// ---------- RANDOM ----------

function rand(max){

    return Math.floor(Math.random()*max);

}

// ---------- WORLD ----------

function createWorld(){

    game.world=[];

    for(let y=0;y<WORLD_SIZE;y++){

        let row=[];

        for(let x=0;x<WORLD_SIZE;x++){

            let tile=TILE.GRASS;

            let r=Math.random();

            if(r<0.08){

                tile=TILE.TREE;

            }

            else if(r<0.13){

                tile=TILE.ROCK;

            }

            else if(r<0.17){

                tile=TILE.WATER;

            }

            row.push(tile);

        }

        game.world.push(row);

    }

    game.world[0][0]=TILE.TOWN;

}

function freeTile(){

    while(true){

        let x=rand(WORLD_SIZE);

        let y=rand(WORLD_SIZE);

        if(
            game.world[y][x]==TILE.GRASS &&
            !(x==player.x && y==player.y)
        ){

            return {x,y};

        }

    }

}

// ---------- PLAYER POSITION ----------

function placePlayer(){

    player.x=10;
    player.y=10;

}

// ---------- GAME START ----------

function startGame(){

    createWorld();

    placePlayer();

    updateStats();

}

startGame();

// =====================================
// Realm of Azan V4
// game.js
// Part A2 - Rendering System
// =====================================

function tileAt(x, y) {

    if (player.x === x && player.y === y)
        return TILE.PLAYER;

    for (const m of game.monsters) {

        if (m.x === x && m.y === y)
            return TILE.MONSTER;

    }

    for (const c of game.chests) {

        if (!c.opened && c.x === x && c.y === y)
            return TILE.CHEST;

    }

    if (
        game.boss &&
        game.boss.alive &&
        game.boss.x === x &&
        game.boss.y === y
    ) {

        return TILE.BOSS;

    }

    return game.world[y][x];

}

function drawMap() {

    const map = document.getElementById("map");

    map.innerHTML = "";

    for (let y = 0; y < WORLD_SIZE; y++) {

        for (let x = 0; x < WORLD_SIZE; x++) {

            const tile = document.createElement("div");

            tile.className = "tile";

            tile.textContent = tileAt(x, y);

            map.appendChild(tile);

        }

    }

}

function updateStats() {

    document.getElementById("hp").textContent =
        player.hp + "/" + player.maxHp;

    document.getElementById("level").textContent =
        player.level;

    document.getElementById("xp").textContent =
        player.xp;

    document.getElementById("gold").textContent =
        player.gold;

}

function log(message) {

    const box = document.getElementById("log");

    const line = document.createElement("div");

    line.textContent = message;

    box.prepend(line);

    while (box.children.length > 12) {

        box.removeChild(box.lastChild);

    }

}

function redraw() {

    drawMap();

    updateStats();

}

log("🏰 Welcome to Realm of Azan!");

redraw();

// =====================================
// Realm of Azan V4
// game.js
// Part A3 - Movement & Controls
// =====================================

function canWalk(x, y) {

    if (x < 0 || y < 0)
        return false;

    if (x >= WORLD_SIZE || y >= WORLD_SIZE)
        return false;

    const tile = game.world[y][x];

    if (
        tile === TILE.TREE ||
        tile === TILE.ROCK ||
        tile === TILE.WATER
    ) {
        return false;
    }

    return true;

}

function move(dx, dy) {

    const nx = player.x + dx;
    const ny = player.y + dy;

    if (!canWalk(nx, ny)) {

        log("🚧 You cannot go there.");

        return;

    }

    player.x = nx;
    player.y = ny;

    checkEvents();

    redraw();

}

function rest() {

    player.hp += 20;

    if (player.hp > player.maxHp)
        player.hp = player.maxHp;

    log("😴 You feel rested.");

    redraw();

}

document.getElementById("up").onclick = () => move(0, -1);

document.getElementById("down").onclick = () => move(0, 1);

document.getElementById("left").onclick = () => move(-1, 0);

document.getElementById("right").onclick = () => move(1, 0);

document.getElementById("rest").onclick = rest;

document.addEventListener("keydown", e => {

    switch (e.key) {

        case "ArrowUp":
        case "w":
        case "W":
            move(0, -1);
            break;

        case "ArrowDown":
        case "s":
        case "S":
            move(0, 1);
            break;

        case "ArrowLeft":
        case "a":
        case "A":
            move(-1, 0);
            break;

        case "ArrowRight":
        case "d":
        case "D":
            move(1, 0);
            break;

        case " ":
            rest();
            break;

    }

});

function checkEvents() {

    // Monster
    for (const monster of game.monsters) {

        if (
            monster.x === player.x &&
            monster.y === player.y
        ) {

            log("👹 A monster blocks your path!");

            // Battle will be added in Part B

            return;

        }

    }

    // Chest
    for (const chest of game.chests) {

        if (
            !chest.opened &&
            chest.x === player.x &&
            chest.y === player.y
        ) {

            chest.opened = true;

            player.gold += 20;

            player.xp += 10;

            log("💎 Treasure found! +20 Gold");

            return;

        }

    }

    // Boss
    if (
        game.boss &&
        game.boss.alive &&
        game.boss.x === player.x &&
        game.boss.y === player.y
    ) {

        log("🐉 The Dragon King awakens!");

    }

    // Town
    if (
        player.x === 0 &&
        player.y === 0
    ) {

        player.hp = player.maxHp;

        log("🏰 You rested safely in town.");

    }

}

// =====================================
// Realm of Azan V4
// game.js
// Part A4 - Save, Load & Startup
// =====================================

// ---------- SAVE ----------

function saveGame() {

    const save = {

        player: player,

        monsters: game.monsters,

        chests: game.chests,

        boss: game.boss,

        weather: game.weather,

        day: game.day

    };

    localStorage.setItem(
        "realm_of_azan_v4",
        JSON.stringify(save)
    );

}

// ---------- LOAD ----------

function loadGame() {

    const raw = localStorage.getItem(
        "realm_of_azan_v4"
    );

    if (!raw)
        return false;

    try {

        const save = JSON.parse(raw);

        Object.assign(player, save.player);

        game.monsters = save.monsters || [];

        game.chests = save.chests || [];

        game.boss = save.boss;

        game.weather = save.weather || "Sunny";

        game.day = save.day ?? true;

        return true;

    } catch (e) {

        console.error(e);

        return false;

    }

}

// ---------- AUTO SAVE ----------

setInterval(saveGame, 10000);

// ---------- NEW GAME ----------

function newGame() {

    createWorld();

    placePlayer();

    game.monsters = [];

    game.chests = [];

    game.boss = null;

    redraw();

    log("🌍 A new adventure begins!");

}

// ---------- START ----------

if (!loadGame()) {

    newGame();

} else {

    redraw();

    log("💾 Save Loaded!");

}

// =====================================
// Realm of Azan V4
// Part B1 - Spawn System
// =====================================

// Create monsters
function spawnMonsters(count = 15) {

    game.monsters = [];

    for (let i = 0; i < count; i++) {

        const pos = freeTile();

        game.monsters.push({

            x: pos.x,
            y: pos.y,

            hp: 30,
            maxHp: 30,

            attack: 6,
            defense: 2,

            xp: 20,
            gold: 15,

            alive: true

        });

    }

}

// Create treasure chests
function spawnChests(count = 10) {

    game.chests = [];

    for (let i = 0; i < count; i++) {

        const pos = freeTile();

        game.chests.push({

            x: pos.x,
            y: pos.y,

            opened: false

        });

    }

}

// Create the Dragon Boss
function spawnBoss() {

    const pos = freeTile();

    game.boss = {

        x: pos.x,
        y: pos.y,

        hp: 200,
        maxHp: 200,

        attack: 20,
        defense: 8,

        alive: true

    };

}

// Build the world
function buildWorld() {

    createWorld();

    placePlayer();

    spawnMonsters();

    spawnChests();

    spawnBoss();

    redraw();

    log("🌍 The world is alive!");

}

// Replace newGame()
newGame = function () {

    buildWorld();

    log("✨ Welcome back, Hero!");

};

// Start game correctly
if (!loadGame()) {

    newGame();

}


// ---------- MOBILE ----------

document.body.style.touchAction = "manipulation";

// ---------- VERSION ----------

console.log("Realm of Azan V4 Alpha");

// =====================================
// Realm of Azan V4
// Part B2 - Battle System
// =====================================

function battle(monster) {

    log("⚔️ Battle Started!");

    while (monster.hp > 0 && player.hp > 0) {

        // Player attack
        let damage = Math.max(
            1,
            player.attack + rand(5) - monster.defense
        );

        monster.hp -= damage;

        log("🗡️ You hit for " + damage + " damage.");

        if (monster.hp <= 0)
            break;

        // Monster attack
        damage = Math.max(
            1,
            monster.attack + rand(3) - player.defense
        );

        player.hp -= damage;

        log("👹 Monster hits for " + damage + ".");

    }

    if (player.hp <= 0) {

        player.hp = player.maxHp;

        player.x = 0;
        player.y = 0;

        log("💀 You were defeated!");

        redraw();

        return;

    }

    monster.alive = false;

    player.gold += monster.gold;

    player.xp += monster.xp;

    log("🏆 Monster defeated!");

    log("⭐ +" + monster.xp + " XP");

    log("🪙 +" + monster.gold + " Gold");

    levelUp();

    redraw();

}

// Level system
function levelUp() {

    while (player.xp >= player.level * 100) {

        player.xp -= player.level * 100;

        player.level++;

        player.maxHp += 20;

        player.hp = player.maxHp;

        player.attack += 3;

        player.defense += 1;
        
        log("✨ LEVEL
        log("🎉 Level " + player.level);

    }

}

// Replace checkEvents()

checkEvents = function () {

    // Battle
    for (const monster of game.monsters) {

        if (
            monster.alive &&
            monster.x === player.x &&
            monster.y === player.y
        ) {

            battle(monster);

            return;

        }

    }

    // Treasure
    for (const chest of game.chests) {

        if (
            !chest.opened &&
            chest.x === player.x &&
            chest.y === player.y
        ) {

            chest.opened = true;

            player.gold += 50;

            player.xp += 25;

            log("💎 Treasure Found!");

            levelUp();

            redraw();

            return;

        }

    }

};
// =====================================
// Realm of Azan V4
// Part B3 - Monster AI & Survival
// =====================================

// Monster movement
function moveMonsters() {

    for (const monster of game.monsters) {

        if (!monster.alive) continue;

        let dx = player.x - monster.x;
        let dy = player.y - monster.y;

        if (Math.abs(dx) + Math.abs(dy) <= 5) {

            if (Math.abs(dx) > Math.abs(dy))
                monster.x += Math.sign(dx);
            else
                monster.y += Math.sign(dy);

        } else {

            const dir = rand(4);

            if (dir === 0) monster.x++;
            if (dir === 1) monster.x--;
            if (dir === 2) monster.y++;
            if (dir === 3) monster.y--;

        }

        monster.x = Math.max(0, Math.min(WORLD_SIZE - 1, monster.x));
        monster.y = Math.max(0, Math.min(WORLD_SIZE - 1, monster.y));

    }

}

// Drink potion
function usePotion() {

    if (player.potions <= 0) {

        log("❌ No potions left.");

        return;

    }

    player.potions--;

    player.hp += 50;

    if (player.hp > player.maxHp)
        player.hp = player.maxHp;

    log("🧪 Potion used!");

    redraw();

}

// Day / Night
function toggleDayNight() {

    game.day = !game.day;

    if (game.day) {

        log("☀️ Sunrise");

    } else {

        log("🌙 Night falls");

    }

}

// Random weather
function updateWeather() {

    const weather = [

        "☀️ Sunny",
        "🌧 Rain",
        "⛈ Storm",
        "❄ Snow"

    ];

    game.weather = weather[rand(weather.length)];

    log(game.weather);

}

// Every minute
setInterval(toggleDayNight, 60000);

// Every 40 seconds
setInterval(updateWeather, 40000);

// Monster movement every second
setInterval(function(){

    moveMonsters();

    redraw();

},1000);

// Keyboard shortcut
document.addEventListener("keydown",function(e){

    if(e.key==="p" || e.key==="P"){

        usePotion();

    }

});

// =====================================
// Realm of Azan V4
// Part B4 - Dragon Boss & Victory
// =====================================

// ---------- Equipment ----------

player.weapon = {
    name: "Wooden Sword",
    attack: 3
};

player.armor = {
    name: "Traveler Armor",
    defense: 2
};

// ---------- Dragon Battle ----------

function battleBoss() {

    if (!game.boss || !game.boss.alive)
        return;

    log("🐉 Dragon King Battle!");

    while (
        game.boss.hp > 0 &&
        player.hp > 0
    ) {

        let damage = Math.max(
            5,
            player.attack +
            player.weapon.attack +
            rand(8) -
            game.boss.defense
        );

        game.boss.hp -= damage;

        log("⚔️ Dragon -" + damage);

        if (game.boss.hp <= 0)
            break;

        damage = Math.max(
            8,
            game.boss.attack +
            rand(10) -
            (player.defense + player.armor.defense)
        );

        player.hp -= damage;

        log("🔥 Dragon hit " + damage);

    }

    if (player.hp <= 0) {

        player.hp = player.maxHp;

        player.x = 0;
        player.y = 0;

        log("💀 Dragon defeated you.");

        redraw();

        return;

    }

    game.boss.alive = false;

    player.gold += 1000;

    player.xp += 500;

    levelUp();

    redraw();

    showVictory();

}

// ---------- Victory ----------

function showVictory(){

    alert(
`🏆 YOU WIN!

Congratulations!

You defeated the Dragon King!

⭐ Level: ${player.level}

🪙 Gold: ${player.gold}

Thanks for playing
Realm of Azan V4 Alpha`
    );

}

// ---------- Replace Events ----------

const oldEvents = checkEvents;

checkEvents = function(){

    oldEvents();

    if(
        game.boss &&
        game.boss.alive &&
        player.x==game.boss.x &&
        player.y==game.boss.y
    ){

        battleBoss();

    }

};

// ---------- Weather Bonus ----------

setInterval(function(){

    if(game.weather==="🌧 Rain"){

        player.hp=Math.min(
            player.hp+2,
            player.maxHp
        );

    }

},5000);

// ---------- Auto Heal ----------

setInterval(function(){

    if(player.hp<player.maxHp){

        player.hp++;

        redraw();

    }

},3000);

// ---------- Finish ----------

log("🚀 Realm of Azan V4 Alpha Loaded!");

