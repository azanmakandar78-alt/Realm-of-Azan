/*
=========================================================
 Realm of Azan V5
 save.js
 Chunk 1/3
=========================================================
*/

// -----------------------------------------------------
// Save Constants
// -----------------------------------------------------

const SAVE_KEY = "realm_of_azan_v5_save";
const SAVE_VERSION = "5.0.0";
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

let autosaveTimer = null;

// -----------------------------------------------------
// Save Builder
// -----------------------------------------------------

function buildSaveData(player, inventory, equipment, questManager, settings = {}, world = {}) {

    return {

        version: SAVE_VERSION,

        savedAt: Date.now(),

        player: JSON.parse(
            JSON.stringify(player)
        ),

        inventory:
            typeof serializeInventory === "function"
                ? serializeInventory(
                    inventory,
                    equipment
                )
                : null,

        quests:
            typeof serializeQuests === "function"
                ? serializeQuests(
                    questManager
                )
                : null,

        settings: JSON.parse(
            JSON.stringify(settings)
        ),

        world: JSON.parse(
            JSON.stringify(world)
        )

    };

}

// -----------------------------------------------------
// Manual Save
// -----------------------------------------------------

function saveGame(
    player,
    inventory,
    equipment,
    questManager,
    settings = {},
    world = {}
) {

    try {

        const data = buildSaveData(

            player,

            inventory,

            equipment,

            questManager,

            settings,

            world

        );

        localStorage.setItem(

            SAVE_KEY,

            JSON.stringify(data)

        );

        console.log("Game Saved");

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}

// -----------------------------------------------------
// Autosave
// -----------------------------------------------------

function startAutosave(

    player,

    inventory,

    equipment,

    questManager,

    settings = {},

    world = {}

) {

    stopAutosave();

    autosaveTimer = setInterval(() => {

        saveGame(

            player,

            inventory,

            equipment,

            questManager,

            settings,

            world

        );

    }, AUTOSAVE_INTERVAL);

}

// -----------------------------------------------------
// Stop Autosave
// -----------------------------------------------------

function stopAutosave() {

    if (autosaveTimer) {

        clearInterval(
            autosaveTimer
        );

        autosaveTimer = null;

    }

}

// -----------------------------------------------------
// Local Storage Helpers
// -----------------------------------------------------

function saveExists() {

    return localStorage.getItem(
        SAVE_KEY
    ) !== null;

}

function getRawSave() {

    return localStorage.getItem(
        SAVE_KEY
    );

}

function getSaveInfo() {

    if (!saveExists())
        return null;

    try {

        const save =
            JSON.parse(
                getRawSave()
            );

        return {

            version:
                save.version,

            savedAt:
                new Date(
                    save.savedAt
                ).toLocaleString(),

            playerLevel:
                save.player
                    ? save.player.level
                    : 1

        };

    }

    catch {

        return null;

    }

}

// -----------------------------------------------------
// Quick Save
// -----------------------------------------------------

function quickSave() {

    if (
        !window.player ||
        !window.inventory ||
        !window.equipment ||
        !window.questManager
    ) {

        return false;

    }

    return saveGame(

        window.player,

        window.inventory,

        window.equipment,

        window.questManager,

        window.settings || {},

        window.worldState || {}

    );

          }
/*
=========================================================
 Realm of Azan V5
 save.js
 Chunk 2/3
=========================================================
*/


// -----------------------------------------------------
// Load Game
// -----------------------------------------------------

function loadGame() {

    if (!saveExists()) {

        console.warn("No save found");

        return null;

    }


    try {

        const raw =
            localStorage.getItem(
                SAVE_KEY
            );


        const data =
            JSON.parse(raw);



        // Version Check

        if (
            data.version !== SAVE_VERSION
        ) {

            console.log(
                "Save version mismatch"
            );


            return migrateSave(
                data
            );

        }



        console.log(
            "Game Loaded"
        );


        return data;


    }

    catch(error) {

        console.error(
            "Load failed:",
            error
        );


        return null;

    }

}



// -----------------------------------------------------
// Apply Loaded Data
// -----------------------------------------------------

function applySaveData(
    save,
    player,
    inventory,
    equipment,
    questManager
) {


    if (!save)
        return false;



    try {


        Object.assign(
            player,
            save.player
        );



        if (
            typeof deserializeInventory
            === "function"
        ) {

            deserializeInventory(

                save.inventory,

                inventory,

                equipment

            );

        }



        if (
            typeof deserializeQuests
            === "function"
        ) {

            deserializeQuests(

                save.quests,

                questManager

            );

        }


        console.log(
            "Save Applied"
        );


        return true;


    }

    catch(error) {

        console.error(
            error
        );


        return false;

    }


}



// -----------------------------------------------------
// Delete Save
// -----------------------------------------------------

function deleteSave() {


    try {


        localStorage.removeItem(
            SAVE_KEY
        );


        console.log(
            "Save Deleted"
        );


        return true;


    }

    catch(error) {


        console.error(
            error
        );


        return false;

    }


}



// -----------------------------------------------------
// Export Save Backup
// -----------------------------------------------------

function exportSave() {


    if (!saveExists())
        return null;



    const data =
        getRawSave();



    const blob =
        new Blob(

            [
                data
            ],

            {
                type:
                "application/json"
            }

        );



    const url =
        URL.createObjectURL(
            blob
        );



    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "Realm_of_Azan_Save.json";


    link.click();



    URL.revokeObjectURL(
        url
    );


    console.log(
        "Save Exported"
    );


}



// -----------------------------------------------------
// Import Save Backup
// -----------------------------------------------------

function importSaveFile(
    file
) {


    const reader =
        new FileReader();



    reader.onload =
    function(event) {


        try {


            const data =
                JSON.parse(
                    event.target.result
                );



            localStorage.setItem(

                SAVE_KEY,

                JSON.stringify(data)

            );



            console.log(
                "Save Imported"
            );


        }

        catch(error) {


            console.error(
                "Invalid Save File",
                error
            );


        }


    };


    reader.readAsText(
        file
    );


}



// -----------------------------------------------------
// Save Migration
// -----------------------------------------------------

function migrateSave(
    oldSave
) {


    console.log(
        "Migrating Save..."
    );


    let newSave =
    {

        version:
            SAVE_VERSION,


        savedAt:
            Date.now(),


        player:
            oldSave.player || {},


        inventory:
            oldSave.inventory || null,


        quests:
            oldSave.quests || null,


        settings:
            oldSave.settings || {},


        world:
            oldSave.world || {}

    };



    localStorage.setItem(

        SAVE_KEY,

        JSON.stringify(newSave)

    );



    return newSave;


              }

/*
=========================================================
 Realm of Azan V5
 save.js
 Chunk 3/3
=========================================================
*/


// -----------------------------------------------------
// Save Slots System
// -----------------------------------------------------

const MAX_SAVE_SLOTS = 3;


function getSlotKey(slot) {

    return SAVE_KEY + "_slot_" + slot;

}



function saveToSlot(

    slot,

    player,

    inventory,

    equipment,

    questManager,

    settings = {},

    world = {}

) {


    if (
        slot < 1 ||
        slot > MAX_SAVE_SLOTS
    ) {

        return false;

    }



    try {


        const data =
            buildSaveData(

                player,

                inventory,

                equipment,

                questManager,

                settings,

                world

            );



        localStorage.setItem(

            getSlotKey(slot),

            JSON.stringify(data)

        );



        console.log(
            "Saved Slot:",
            slot
        );



        return true;


    }

    catch(error) {


        console.error(
            error
        );


        return false;

    }


}




function loadSlot(slot) {


    if (
        slot < 1 ||
        slot > MAX_SAVE_SLOTS
    )

        return null;



    const data =
        localStorage.getItem(
            getSlotKey(slot)
        );



    if (!data)
        return null;



    try {


        return JSON.parse(
            data
        );


    }

    catch {


        return null;

    }


}




function deleteSlot(slot) {


    localStorage.removeItem(
        getSlotKey(slot)
    );


}




// -----------------------------------------------------
// Save Validation
// -----------------------------------------------------

function validateSave(data) {


    if (!data)
        return false;



    if (
        !data.version ||
        !data.savedAt
    ) {

        return false;

    }



    if (
        !data.player
    ) {

        return false;

    }



    return true;

}




// -----------------------------------------------------
// Save Checksum
// -----------------------------------------------------

function createChecksum(data) {


    const text =
        JSON.stringify(data);



    let hash = 0;



    for (
        let i = 0;
        i < text.length;
        i++
    ) {


        hash =
            (
                hash << 5
            )
            -
            hash
            +
            text.charCodeAt(i);



        hash |= 0;

    }



    return hash.toString();

}




function attachChecksum(save) {


    save.checksum =
        createChecksum(
            save
        );


    return save;

}




function verifyChecksum(save) {


    if (
        !save.checksum
    )

        return false;



    const old =
        save.checksum;



    delete save.checksum;



    const valid =
        old ===
        createChecksum(
            save
        );



    save.checksum =
        old;



    return valid;

}



// -----------------------------------------------------
// Protected Save
// -----------------------------------------------------

function createProtectedSave(data) {


    const protectedData =
        attachChecksum(
            data
        );


    return JSON.stringify(
        protectedData
    );


}




function loadProtectedSave(raw) {


    try {


        const data =
            JSON.parse(
                raw
            );



        if (
            verifyChecksum(
                data
            )
        ) {


            return data;


        }


        console.warn(
            "Save corrupted"
        );



        return null;


    }

    catch {


        return null;

    }


}



// -----------------------------------------------------
// Save Manager
// -----------------------------------------------------

const SaveManager = {


    save:
        saveGame,


    load:
        loadGame,


    delete:
        deleteSave,


    export:
        exportSave,


    import:
        importSaveFile,


    slotSave:
        saveToSlot,


    slotLoad:
        loadSlot,


    slotDelete:
        deleteSlot,


    validate:
        validateSave


};



// -----------------------------------------------------
// Auto Initialize
// -----------------------------------------------------

window.SaveManager =
    SaveManager;



console.log(
    "Realm of Azan V5 Save System Loaded"
);
