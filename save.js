// save.js - localStorage persistence

const SAVE_KEY = "realm_of_azan_v5_save";

export function saveGame(state) {
  try {
    const data = {
      version: 5,
      timestamp: Date.now(),
      player: {
        x: state.player.x,
        y: state.player.y,
        hp: state.player.hp,
        maxHp: state.player.maxHp,
        mp: state.player.mp,
        maxMp: state.player.maxMp,
        xp: state.player.xp,
        xpToLevel: state.player.xpToLevel,
        level: state.player.level,
        gold: state.player.gold,
        baseAtk: state.player.baseAtk,
        baseDef: state.player.baseDef,
        baseSpd: state.player.baseSpd,
        facing: state.player.facing,
        name: state.player.name
      },
      inventory: state.inventory ? state.inventory.toJSON() : state.player.inventory.toJSON(),
      quests: state.quests.toJSON(),
      flags: state.flags,
      achievements: state.achievements,
      settings: state.settings,
      dayTime: state.dayTime,
      weather: state.weather,
      killed: state.killed
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Save failed", e);
    return false;
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Load failed", e);
    return null;
  }
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
