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

// ---------- MOBILE ----------

document.body.style.touchAction = "manipulation";

// ---------- VERSION ----------

console.log("Realm of Azan V4 Alpha");
