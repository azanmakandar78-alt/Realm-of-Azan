-# Realm-of-Azan
-Fantasy RPG game
+# Realm of Azan V5
+
+Realm of Azan V5 is a complete vanilla HTML, CSS, and JavaScript browser RPG. It runs entirely in the browser with no build tools, no frameworks, and no server requirements.
+
+## Features
+
+- Smooth tile movement with keyboard and mobile joystick controls.
+- Animated player sprite drawn on a scrollable 30x30 world map.
+- Turn-based combat with misses, critical hits, magic attacks, healing, enemy AI, loot, XP, gold, and a Dragon King boss battle.
+- Player HP, mana, XP, level, gold, inventory, equipment, potions, and stat-changing gear.
+- World tiles for grass, forests, water, mountains, villages, castle, dungeon, paths, NPCs, collision, treasure chests, random encounters, day/night cycle, and weather.
+- NPC dialogue for a quest giver, merchant, guard, and wizard.
+- Shops with buying, selling, prices, and gold handling.
+- Quest log, achievements, victory screen, and game over screen.
+- Autosave, manual save, and automatic load support using `localStorage`.
+- Settings for difficulty, volume, mute, and fullscreen.
+- GitHub Pages compatible static files.
+
+## Controls
+
+- Move: `WASD` or arrow keys.
+- Interact: `Space` or `Enter`.
+- Inventory panel: `I`.
+- Quest panel: `Q`.
+- Mobile: use the on-screen joystick and action button.
+
+## Running Locally
+
+Open `index.html` in a modern browser, or serve the folder with any static web server:
+
+```bash
+python3 -m http.server 8000
+```
+
+Then visit `http://localhost:8000`.
+
+## Uploading to GitHub Pages
+
+1. Create a GitHub repository named `Realm-of-Azan` or use your existing repository.
+2. Upload these project files to the repository root:
+   - `index.html`
+   - `style.css`
+   - `game.js`
+   - `battle.js`
+   - `monsters.js`
+   - `inventory.js`
+   - `quests.js`
+   - `save.js`
+   - `ui.js`
+   - `assets/`
+   - `README.md`
+3. Commit and push the files to your default branch, usually `main`.
+4. On GitHub, open **Settings** for the repository.
+5. Select **Pages** in the sidebar.
+6. Under **Build and deployment**, choose **Deploy from a branch**.
+7. Select your default branch and the root folder `/`.
+8. Click **Save**.
+9. Wait for GitHub Pages to finish deploying.
+10. Open the Pages URL shown by GitHub, usually `https://YOUR-USERNAME.github.io/Realm-of-Azan/`.
+
+## File Overview
+
+- `index.html` defines the game layout and modal windows.
+- `style.css` contains the responsive interface, map viewport, panels, mobile controls, weather effects, and battle styling.
+- `game.js` owns the main game loop, world map, controls, encounters, NPC interaction, shops, quests, drawing, and saving hooks.
+- `battle.js` owns turn-based combat.
+- `monsters.js` defines enemy data and encounter selection.
+- `inventory.js` defines items, stacks, equipment, and stat helpers.
+- `quests.js` defines quests and completion logic.
+- `save.js` handles localStorage persistence.
+- `ui.js` renders HUD, panels, dialogue, shops, and battle UI.
+
+## Notes
+
+The `assets/images`, `assets/sounds`, and `assets/music` folders are included for future art and audio files. The current version uses emoji sprites and generated browser UI so it works immediately after upload.

