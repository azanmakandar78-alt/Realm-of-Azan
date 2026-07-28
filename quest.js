/*
=========================================================
 Realm of Azan V5
 quests.js
 Chunk 1/3
=========================================================
*/

// -----------------------------------------------------
// Quest Database
// -----------------------------------------------------

const QuestDatabase = {

    welcome: {
        id: "welcome",
        title: "A New Beginning",
        description: "Speak with the Village Elder.",
        type: "main",

        objectives: [
            {
                id: "talk_elder",
                text: "Talk to the Village Elder",
                target: 1,
                progress: 0,
                completed: false
            }
        ],

        rewards: {
            xp: 50,
            gold: 25,
            items: ["Small Potion"]
        }
    },

    slimeHunter: {
        id: "slimeHunter",
        title: "Slime Hunter",
        description: "Defeat 10 Slimes.",

        type: "side",

        objectives: [
            {
                id: "kill_slime",
                text: "Slimes Defeated",
                monster: "slime",
                target: 10,
                progress: 0,
                completed: false
            }
        ],

        rewards: {
            xp: 120,
            gold: 75,
            items: ["Potion"]
        }
    },

    goblinThreat: {
        id: "goblinThreat",
        title: "Goblin Threat",
        description: "Defeat 8 Goblins.",

        type: "side",

        objectives: [
            {
                id: "kill_goblin",
                monster: "goblin",
                text: "Goblins Defeated",
                target: 8,
                progress: 0,
                completed: false
            }
        ],

        rewards: {
            xp: 180,
            gold: 120,
            items: ["Iron Sword"]
        }
    },

    skeletonCrypt: {
        id: "skeletonCrypt",
        title: "Crypt Cleansing",
        description: "Destroy 12 Skeletons.",

        type: "side",

        objectives: [
            {
                id: "kill_skeleton",
                monster: "skeleton",
                text: "Skeletons Destroyed",
                target: 12,
                progress: 0,
                completed: false
            }
        ],

        rewards: {
            xp: 300,
            gold: 220,
            items: ["Mana Potion"]
        }
    },

    wolfPack: {
        id: "wolfPack",
        title: "Wolf Pack",
        description: "Defeat 6 Wolves.",

        type: "side",

        objectives: [
            {
                id: "kill_wolf",
                monster: "wolf",
                text: "Wolves Defeated",
                target: 6,
                progress: 0,
                completed: false
            }
        ],

        rewards: {
            xp: 260,
            gold: 180,
            items: ["Leather Armor"]
        }
    },

    dragonKing: {
        id: "dragonKing",
        title: "Dragon King's Fall",
        description: "Defeat the Dragon King.",

        type: "main",

        objectives: [
            {
                id: "kill_dragon",
                monster: "dragon",
                text: "Dragon King Defeated",
                target: 1,
                progress: 0,
                completed: false
            }
        ],

        rewards: {
            xp: 5000,
            gold: 5000,
            items: [
                "Legendary Sword",
                "Royal Crown"
            ]
        }
    }

};

// -----------------------------------------------------
// Quest Class
// -----------------------------------------------------

class Quest {

    constructor(data) {

        this.id = data.id;

        this.title = data.title;

        this.description = data.description;

        this.type = data.type;

        this.objectives =
            JSON.parse(
                JSON.stringify(
                    data.objectives
                )
            );

        this.rewards =
            JSON.parse(
                JSON.stringify(
                    data.rewards
                )
            );

        this.accepted = false;

        this.completed = false;

        this.claimed = false;

    }

    accept() {

        this.accepted = true;

    }

    complete() {

        this.completed = true;

    }

    isCompleted() {

        return this.completed;

    }

    getObjectives() {

        return this.objectives;

    }

    getReward() {

        return this.rewards;

    }

    reset() {

        this.accepted = false;

        this.completed = false;

        this.claimed = false;

        this.objectives.forEach(obj => {

            obj.progress = 0;

            obj.completed = false;

        });

    }

}

// -----------------------------------------------------
// Quest Factory
// -----------------------------------------------------

function createQuest(id) {

    const data = QuestDatabase[id];

    if (!data) {

        throw new Error(
            "Unknown quest: " + id
        );

    }

    return new Quest(data);

}

// -----------------------------------------------------
// Quest Helpers
// -----------------------------------------------------

function getAllQuestIds() {

    return Object.keys(
        QuestDatabase
    );

}

function questExists(id) {

    return QuestDatabase.hasOwnProperty(id);

}

function getQuestInfo(id) {

    return QuestDatabase[id] || null;

          }
/*
=========================================================
 Realm of Azan V5
 quests.js
 Chunk 2/3
=========================================================
*/

// -----------------------------------------------------
// Quest Manager
// -----------------------------------------------------

class QuestManager {

    constructor() {

        this.activeQuests = [];
        this.completedQuests = [];

    }

    acceptQuest(id) {

        if (!questExists(id))
            return false;

        if (this.hasQuest(id))
            return false;

        const quest = createQuest(id);

        quest.accept();

        this.activeQuests.push(quest);

        return true;

    }

    abandonQuest(id) {

        const index =
            this.activeQuests.findIndex(
                q => q.id === id
            );

        if (index === -1)
            return false;

        this.activeQuests.splice(index, 1);

        return true;

    }

    hasQuest(id) {

        return this.activeQuests.some(
            q => q.id === id
        );

    }

    getQuest(id) {

        return this.activeQuests.find(
            q => q.id === id
        ) || null;

    }

    getActiveQuests() {

        return this.activeQuests;

    }

    getCompletedQuests() {

        return this.completedQuests;

    }

    completeQuest(id) {

        const quest = this.getQuest(id);

        if (!quest)
            return false;

        if (!quest.completed)
            return false;

        this.completedQuests.push(quest);

        this.activeQuests =
            this.activeQuests.filter(
                q => q.id !== id
            );

        return true;

    }

    reset() {

        this.activeQuests = [];
        this.completedQuests = [];

    }

}

// -----------------------------------------------------
// Objective Progress
// -----------------------------------------------------

function updateObjective(quest, objectiveId, amount = 1) {

    if (!quest)
        return false;

    const objective =
        quest.objectives.find(
            o => o.id === objectiveId
        );

    if (!objective)
        return false;

    if (objective.completed)
        return true;

    objective.progress += amount;

    if (objective.progress >= objective.target) {

        objective.progress =
            objective.target;

        objective.completed = true;

    }

    checkQuestCompletion(quest);

    return true;

}

// -----------------------------------------------------
// Monster Kill Tracking
// -----------------------------------------------------

function registerMonsterKill(manager, monsterId) {

    manager.activeQuests.forEach(quest => {

        quest.objectives.forEach(obj => {

            if (
                obj.monster &&
                obj.monster === monsterId
            ) {

                updateObjective(
                    quest,
                    obj.id,
                    1
                );

            }

        });

    });

}

// -----------------------------------------------------
// NPC Interaction Tracking
// -----------------------------------------------------

function registerNPCInteraction(manager, npcId) {

    manager.activeQuests.forEach(quest => {

        quest.objectives.forEach(obj => {

            if (
                obj.id === npcId
            ) {

                updateObjective(
                    quest,
                    obj.id,
                    1
                );

            }

        });

    });

}

// -----------------------------------------------------
// Completion Check
// -----------------------------------------------------

function checkQuestCompletion(quest) {

    const done =
        quest.objectives.every(
            obj => obj.completed
        );

    if (done) {

        quest.complete();

    }

    return done;

}

// -----------------------------------------------------
// Quest Log
// -----------------------------------------------------

function getQuestLog(manager) {

    return manager.activeQuests.map(q => ({

        id: q.id,

        title: q.title,

        description: q.description,

        completed: q.completed,

        objectives: q.objectives

    }));

}

// -----------------------------------------------------
// Active Quest Count
// -----------------------------------------------------

function activeQuestCount(manager) {

    return manager.activeQuests.length;

}

function completedQuestCount(manager) {

    return manager.completedQuests.length;

}
/*
=========================================================
 Realm of Azan V5
 quests.js
 Chunk 3/3
=========================================================
*/

// -----------------------------------------------------
// Reward Claiming
// -----------------------------------------------------

function claimQuestReward(manager, questId, player, inventory) {

    const quest = manager.getQuest(questId);

    if (!quest)
        return false;

    if (!quest.completed)
        return false;

    if (quest.claimed)
        return false;

    const reward = quest.getReward();

    if (player) {

        player.xp += reward.xp || 0;
        player.gold += reward.gold || 0;

    }

    if (inventory && reward.items) {

        reward.items.forEach(item => {

            inventory.addItem(item);

        });

    }

    quest.claimed = true;

    manager.completeQuest(questId);

    return true;

}

// -----------------------------------------------------
// Save / Load
// -----------------------------------------------------

function serializeQuests(manager) {

    return {

        activeQuests: JSON.parse(
            JSON.stringify(manager.activeQuests)
        ),

        completedQuests: JSON.parse(
            JSON.stringify(manager.completedQuests)
        )

    };

}

function deserializeQuests(data) {

    const manager = new QuestManager();

    if (data.activeQuests) {

        manager.activeQuests =
            data.activeQuests.map(q => {

                const quest = createQuest(q.id);

                Object.assign(quest, q);

                return quest;

            });

    }

    if (data.completedQuests) {

        manager.completedQuests =
            data.completedQuests.map(q => {

                const quest = createQuest(q.id);

                Object.assign(quest, q);

                return quest;

            });

    }

    return manager;

}

// -----------------------------------------------------
// Quest Utilities
// -----------------------------------------------------

function getMainQuests() {

    return getAllQuestIds()
        .filter(id =>
            QuestDatabase[id].type === "main"
        );

}

function getSideQuests() {

    return getAllQuestIds()
        .filter(id =>
            QuestDatabase[id].type === "side"
        );

}

function resetAllQuests(manager) {

    manager.reset();

}

function isQuestCompleted(manager, id) {

    return manager.completedQuests.some(
        q => q.id === id
    );

}

function isQuestActive(manager, id) {

    return manager.activeQuests.some(
        q => q.id === id
    );

}

// -----------------------------------------------------
// Global Exports
// -----------------------------------------------------

window.QuestDatabase = QuestDatabase;

window.Quest = Quest;

window.QuestManager = QuestManager;

window.createQuest = createQuest;

window.questExists = questExists;

window.getQuestInfo = getQuestInfo;

window.getAllQuestIds = getAllQuestIds;

window.updateObjective = updateObjective;

window.registerMonsterKill = registerMonsterKill;

window.registerNPCInteraction = registerNPCInteraction;

window.checkQuestCompletion = checkQuestCompletion;

window.claimQuestReward = claimQuestReward;

window.serializeQuests = serializeQuests;

window.deserializeQuests = deserializeQuests;

window.getQuestLog = getQuestLog;

window.activeQuestCount = activeQuestCount;

window.completedQuestCount = completedQuestCount;

window.getMainQuests = getMainQuests;

window.getSideQuests = getSideQuests;

window.resetAllQuests = resetAllQuests;

window.isQuestCompleted = isQuestCompleted;

window.isQuestActive = isQuestActive;

// -----------------------------------------------------
// Initialization
// -----------------------------------------------------

console.log("Realm of Azan V5 - quests.js loaded.");
console.log("Quest count:", getAllQuestIds().length);
