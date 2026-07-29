// ui.js - DOM UI management

import { ITEMS } from "./inventory.js";

export class UI {
  constructor(game) {
    this.game = game;
    this.bindElements();
    this.bindEvents();
  }

  bindElements() {
    this.hpBar = document.getElementById("hp-bar");
    this.mpBar = document.getElementById("mp-bar");
    this.xpBar = document.getElementById("xp-bar");
    this.hpText = document.getElementById("hp-text");
    this.mpText = document.getElementById("mp-text");
    this.xpText = document.getElementById("xp-text");
    this.levelText = document.getElementById("level-text");
    this.goldText = document.getElementById("gold-text");

    this.menuOverlay = document.getElementById("menu-overlay");
    this.invWindow = document.getElementById("inventory-window");
    this.equipWindow = document.getElementById("equipment-window");
    this.questWindow = document.getElementById("quest-window");
    this.settingsWindow = document.getElementById("settings-window");
    this.dialogueBox = document.getElementById("dialogue-box");
    this.battleScreen = document.getElementById("battle-screen");
    this.shopWindow = document.getElementById("shop-window");
    this.titleScreen = document.getElementById("title-screen");
    this.victoryScreen = document.getElementById("victory-screen");
    this.gameoverScreen = document.getElementById("gameover-screen");
    this.toastEl = document.getElementById("toast");
  }

  bindEvents() {
    document.getElementById("btn-menu")?.addEventListener("click", () => this.showMenu());
    document.getElementById("btn-close-menu")?.addEventListener("click", () => this.hideMenu());
    document.getElementById("btn-inventory")?.addEventListener("click", () => { this.hideMenu(); this.showInventory(); });
    document.getElementById("btn-equipment")?.addEventListener("click", () => { this.hideMenu(); this.showEquipment(); });
    document.getElementById("btn-quests")?.addEventListener("click", () => { this.hideMenu(); this.showQuests(); });
    document.getElementById("btn-settings")?.addEventListener("click", () => { this.hideMenu(); this.showSettings(); });
    document.getElementById("btn-save")?.addEventListener("click", () => {
      this.game.save();
      this.toast("Game Saved!");
      this.hideMenu();
    });

    document.getElementById("btn-close-inventory")?.addEventListener("click", () => this.hideInventory());
    document.getElementById("btn-close-equipment")?.addEventListener("click", () => this.hideEquipment());
    document.getElementById("btn-close-quests")?.addEventListener("click", () => this.hideQuests());
    document.getElementById("btn-close-settings")?.addEventListener("click", () => this.hideSettings());
    document.getElementById("btn-close-shop")?.addEventListener("click", () => this.hideShop());

    document.getElementById("btn-new-game")?.addEventListener("click", () => this.game.newGame());
    document.getElementById("btn-continue")?.addEventListener("click", () => this.game.continueGame());
    document.getElementById("btn-restart")?.addEventListener("click", () => {
      this.gameoverScreen.classList.add("hidden");
      this.titleScreen.classList.remove("hidden");
    });
    document.getElementById("btn-victory-continue")?.addEventListener("click", () => {
      this.victoryScreen.classList.add("hidden");
      this.game.endBattleVictory();
    });

    document.getElementById("difficulty-select")?.addEventListener("change", (e) => {
      this.game.settings.difficulty = e.target.value;
    });
    document.getElementById("music-volume")?.addEventListener("input", (e) => {
      this.game.settings.musicVol = parseFloat(e.target.value);
      this.game.updateAudio();
    });
    document.getElementById("sfx-volume")?.addEventListener("input", (e) => {
      this.game.settings.sfxVol = parseFloat(e.target.value);
    });
    document.getElementById("mute-toggle")?.addEventListener("change", (e) => {
      this.game.settings.mute = e.target.checked;
      this.game.updateAudio();
    });
    document.getElementById("btn-fullscreen")?.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });

    document.getElementById("btn-attack")?.addEventListener("click", () => this.game.battle?.playerAttack());
    document.getElementById("btn-magic")?.addEventListener("click", () => this.toggleMagicMenu(true));
    document.getElementById("btn-item")?.addEventListener("click", () => this.showBattleItems());
    document.getElementById("btn-flee")?.addEventListener("click", () => this.game.battle?.tryFlee());
    document.getElementById("btn-magic-back")?.addEventListener("click", () => this.toggleMagicMenu(false));

    document.querySelectorAll("#magic-menu [data-spell]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.game.battle?.playerMagic(btn.dataset.spell);
        this.toggleMagicMenu(false);
      });
    });

    document.getElementById("btn-interact")?.addEventListener("click", () => this.game.tryInteract());
    document.getElementById("btn-dialogue-next")?.addEventListener("click", () => this.game.advanceDialogue());
  }

  updateHUD(player) {
    const hpPct = (player.hp / player.maxHp) * 100;
    const mpPct = (player.mp / player.maxMp) * 100;
    const xpPct = (player.xp / player.xpToLevel) * 100;
    this.hpBar.style.width = hpPct + "%";
    this.mpBar.style.width = mpPct + "%";
    this.xpBar.style.width = xpPct + "%";
    this.hpText.textContent = `${Math.max(0, Math.floor(player.hp))}/${player.maxHp}`;
    this.mpText.textContent = `${player.mp}/${player.maxMp}`;
    this.xpText.textContent = `${player.xp}/${player.xpToLevel}`;
    this.levelText.textContent = player.level;
    this.goldText.textContent = player.gold;
  }

  showMenu() {
    this.menuOverlay.classList.remove("hidden");
  }
  hideMenu() {
    this.menuOverlay.classList.add("hidden");
  }

  showInventory() {
    const grid = document.getElementById("inventory-grid");
    const details = document.getElementById("item-details");
    grid.innerHTML = "";
    const inv = this.game.player.inventory;
    inv.slots.forEach((slot) => {
      const def = ITEMS[slot.id];
      if (!def) return;
      const el = document.createElement("div");
      el.className = "inv-slot";
      el.innerHTML = `<div>${def.name.slice(0, 8)}</div>${slot.qty > 1 ? `<span class="qty">${slot.qty}</span>` : ""}`;
      el.addEventListener("click", () => {
        details.innerHTML = `<strong>${def.name}</strong><br>${def.desc}<br>
          ${def.type === "consumable" ? `<button data-use="${slot.id}">Use</button>` : ""}
          ${["weapon","armor","shield"].includes(def.type) ? `<button data-equip="${slot.id}">Equip</button>` : ""}`;
        details.querySelector("[data-use]")?.addEventListener("click", () => {
          inv.useConsumable(slot.id, this.game.player);
          this.game.player.recalcStats();
          this.updateHUD(this.game.player);
          this.showInventory();
          this.toast("Used " + def.name);
        });
        details.querySelector("[data-equip]")?.addEventListener("click", () => {
          inv.equip(slot.id);
          this.game.player.recalcStats();
          this.updateHUD(this.game.player);
          this.showInventory();
          this.toast("Equipped " + def.name);
        });
      });
      grid.appendChild(el);
    });
    this.invWindow.classList.remove("hidden");
  }
  hideInventory() {
    this.invWindow.classList.add("hidden");
  }

  showEquipment() {
    const slots = document.getElementById("equipment-slots");
    const stats = document.getElementById("equip-stats");
    const eq = this.game.player.inventory.equipment;
    const bonus = this.game.player.inventory.getStatBonus();
    slots.innerHTML = "";
    ["weapon", "armor", "shield"].forEach(slot => {
      const id = eq[slot];
      const def = id ? ITEMS[id] : null;
      const el = document.createElement("div");
      el.className = "equip-slot";
      el.innerHTML = `<div class="slot-name">${slot.toUpperCase()}</div>
        <div class="item-name">${def ? def.name : "— Empty —"}</div>
        ${def ? `<button data-unequip="${slot}">Unequip</button>` : ""}`;
      el.querySelector("[data-unequip]")?.addEventListener("click", () => {
        this.game.player.inventory.unequip(slot);
        this.game.player.recalcStats();
        this.updateHUD(this.game.player);
        this.showEquipment();
      });
      slots.appendChild(el);
    });
    stats.innerHTML = `ATK +${bonus.atk} | DEF +${bonus.def} | SPD +${bonus.spd}`;
    this.equipWindow.classList.remove("hidden");
  }
  hideEquipment() {
    this.equipWindow.classList.add("hidden");
  }

  showQuests() {
    const list = document.getElementById("quest-list");
    list.innerHTML = "";
    const active = this.game.quests.getActive();
    if (!active.length) {
      list.innerHTML = "<p>No active quests.</p>";
    } else {
      active.forEach(q => {
        const div = document.createElement("div");
        div.style.marginBottom = "12px";
        div.innerHTML = `<strong>${q.name}</strong><br>${q.description}<ul>${
          q.objectives.map(o => {
            const prog = o.count !== undefined ? ` (${o.current || 0}/${o.count})` : (o.done ? " ✓" : "");
            return `<li>${o.description}${prog}</li>`;
          }).join("")
        }</ul>`;
        list.appendChild(div);
      });
    }
    this.questWindow.classList.remove("hidden");
  }
  hideQuests() {
    this.questWindow.classList.add("hidden");
  }

  showSettings() {
    document.getElementById("difficulty-select").value = this.game.settings.difficulty;
    document.getElementById("music-volume").value = this.game.settings.musicVol;
    document.getElementById("sfx-volume").value = this.game.settings.sfxVol;
    document.getElementById("mute-toggle").checked = this.game.settings.mute;
    this.settingsWindow.classList.remove("hidden");
  }
  hideSettings() {
    this.settingsWindow.classList.add("hidden");
  }

  showDialogue(name, text, choices = null) {
    document.getElementById("dialogue-name").textContent = name;
    document.getElementById("dialogue-text").textContent = text;
    const ch = document.getElementById("dialogue-choices");
    ch.innerHTML = "";
    if (choices && choices.length) {
      choices.forEach(c => {
        const b = document.createElement("button");
        b.textContent = c.label;
        b.addEventListener("click", () => c.action());
        ch.appendChild(b);
      });
      document.getElementById("btn-dialogue-next").style.display = "none";
    } else {
      document.getElementById("btn-dialogue-next").style.display = "block";
    }
    this.dialogueBox.classList.remove("hidden");
  }
  hideDialogue() {
    this.dialogueBox.classList.add("hidden");
  }

  showBattle(battle) {
    this.battleScreen.classList.remove("hidden");
    this.updateBattle(battle);
  }

  updateBattle(battle) {
    const enemiesEl = document.getElementById("battle-enemies");
    enemiesEl.innerHTML = "";
    const alive = battle.getAliveEnemies();
    alive.forEach((e, i) => {
      const card = document.createElement("div");
      card.className = "enemy-card";
      if (i === battle.selectedEnemy) card.style.borderColor = "#ff0";
      card.innerHTML = `<div class="name">${e.name}</div>
        <div class="hp-bar"><div class="hp-fill" style="width:${(e.hp/e.maxHp)*100}%"></div></div>
        <div>${Math.max(0, e.hp)}/${e.maxHp}</div>`;
      card.addEventListener("click", () => battle.selectEnemy(i));
      enemiesEl.appendChild(card);
    });

    const pInfo = document.getElementById("battle-player-info");
    pInfo.innerHTML = `You — HP ${Math.max(0, Math.floor(battle.player.hp))}/${battle.player.maxHp} | MP ${battle.player.mp}/${battle.player.maxMp}`;

    const logEl = document.getElementById("battle-log");
    logEl.innerHTML = battle.log.slice(-8).map(l => `<div>${l}</div>`).join("");
    logEl.scrollTop = logEl.scrollHeight;

    const canAct = battle.turn === "player" && !battle.finished;
    ["btn-attack", "btn-magic", "btn-item", "btn-flee"].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = !canAct;
    });
  }

  hideBattle() {
    this.battleScreen.classList.add("hidden");
    this.toggleMagicMenu(false);
    document.getElementById("item-menu").classList.add("hidden");
  }

  toggleMagicMenu(show) {
    document.getElementById("magic-menu").classList.toggle("hidden", !show);
    document.getElementById("battle-actions").style.display = show ? "none" : "flex";
  }

  showBattleItems() {
    const menu = document.getElementById("item-menu");
    menu.innerHTML = "";
    const consumables = this.game.player.inventory.slots.filter(s => ITEMS[s.id]?.type === "consumable");
    if (!consumables.length) {
      menu.innerHTML = "<p>No items</p>";
    } else {
      consumables.forEach(s => {
        const def = ITEMS[s.id];
        const b = document.createElement("button");
        b.textContent = `${def.name} x${s.qty}`;
        b.addEventListener("click", () => {
          this.game.battle.playerUseItem(s.id);
          menu.classList.add("hidden");
          document.getElementById("battle-actions").style.display = "flex";
        });
        menu.appendChild(b);
      });
    }
    const back = document.createElement("button");
    back.textContent = "Back";
    back.addEventListener("click", () => {
      menu.classList.add("hidden");
      document.getElementById("battle-actions").style.display = "flex";
    });
    menu.appendChild(back);
    menu.classList.remove("hidden");
    document.getElementById("battle-actions").style.display = "none";
  }

  showShop(title, items, onBuy) {
    document.getElementById("shop-title").textContent = title;
    const list = document.getElementById("shop-items");
    list.innerHTML = "";
    items.forEach(it => {
      const def = ITEMS[it.id];
      if (!def) return;
      const row = document.createElement("div");
      row.className = "shop-item";
      row.innerHTML = `<span>${def.name} — ${it.price}g</span>
        <button>Buy</button>`;
      row.querySelector("button").addEventListener("click", () => onBuy(it));
      list.appendChild(row);
    });
    document.getElementById("shop-player-gold").textContent = `Your Gold: ${this.game.player.gold}`;
    this.shopWindow.classList.remove("hidden");
  }
  hideShop() {
    this.shopWindow.classList.add("hidden");
  }

  showVictory(text) {
    document.getElementById("victory-text").textContent = text;
    this.victoryScreen.classList.remove("hidden");
  }

  showGameOver() {
    this.gameoverScreen.classList.remove("hidden");
  }

  hideTitle() {
    this.titleScreen.classList.add("hidden");
  }

  toast(msg) {
    this.toastEl.textContent = msg;
    this.toastEl.classList.remove("hidden");
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toastEl.classList.add("hidden"), 2200);
  }
}
