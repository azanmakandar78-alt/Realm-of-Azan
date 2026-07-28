#Realm of Azan V5

A complete classic browser RPG built with pure HTML, CSS, and JavaScript.

## Features

- 30×30 tile world with grass, forests, water, mountains, village, castle, and dungeon
- Smooth player movement + animated sprite
- Turn-based combat with critical hits, miss chance, magic (Fire / Ice / Heal), items, and flee
- Enemies: Slime, Goblin, Skeleton, Wolf, and the Dragon King boss
- Full inventory & equipment system (weapons, armor, shields, potions, quest items)
- Quest system with multiple linked quests and rewards
- NPCs with dialogue (Elder, Merchant, Guard, Wizard)
- Shop (buy items with gold)
- Treasure chests
- Day/night cycle + weather (sun / rain / snow)
- Random encounters
- Achievements
- Autosave + manual save via localStorage
- Mobile joystick + on-screen buttons
- Desktop keyboard controls (WASD / Arrows, E/Space interact, I inventory, Q quests, Esc menu)
- Difficulty settings (Easy / Normal / Hard)
- Volume sliders and mute
- Victory & Game Over screens
- Fully responsive / mobile-friendly

## Controls

**Desktop**
- Move: WASD or Arrow Keys
- Interact / Talk / Open: E or Space
- Inventory: I
- Quest Log: Q
- Menu: Esc

**Mobile**
- Virtual joystick (bottom-left)
- Talk / Open button
- Menu button

## How to Run Locally

1. Download or clone this repository.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
3. No build step, no server required for basic play (some browsers may restrict localStorage on `file://` — use a simple local server if needed).

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `realm-of-azan`).
2. Upload **all** project files maintaining the folder structure:
   ```
   Realm-of-Azan/
   ├── index.html
   ├── style.css
   ├── game.js
   ├── battle.js
   ├── monsters.js
   ├── inventory.js
   ├── quests.js
   ├── save.js
   ├── ui.js
   ├── assets/          (can be empty)
   └── README.md
   ```
3. Go to the repository **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**.
5. Select branch `main` (or `master`) and folder `/ (root)`.
6. Click Save.
7. After a minute, your game will be live at:
   `https://<your-username>.github.io/<repo-name>/`

## Optional Assets

The game runs completely without external images or audio (all graphics are drawn procedurally).  
If you wish to add real assets later:

- Place images in `assets/images/`
- Place sound effects in `assets/sounds/`
- Place music in `assets/music/`

Then extend the code in `game.js` / `ui.js` to load them.

## Save Data

Progress is stored in the browser’s `localStorage` under the key `realm_of_azan_v5_save`.  
Clearing site data will erase the save.

## Credits

Created as a complete vanilla JS demonstration RPG — Realm of Azan V5.
