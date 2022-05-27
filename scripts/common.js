export const moduleName = "osr-for-foundry";

export const damageTypes = [
    "Cut",
    "Slashing",
    "Concussion",
    "Fire",
    "Ice",
    "Lightning",
    "Arcane",
    "Holy",
    "Necrotic"
];

export const localize = key => game.i18n.localize(`OSR.${key}`);

export function createResistanceElement(actorData, elementType) {
    const resistances = document.createElement(elementType);
    resistances.style = "flex: unset; max-height: 35px;";
    let resistancesInnerHTML = `<h2 style="font-size:1em;">${localize("Resistances")}</h2><ul class="attributes flexrow resistances">`;
    for (const type of damageTypes) {
        const value = actorData.type !== "character" 
            ? (actorData.data.resistance?.[type] || 0)
            : actorData.items
            .filter(i => i.type === "armor" && i.data.equipped)
            .reduce((acc, current) => {
                return acc + current.data.resistance?.[type] || 0;
            }, 0); 
            
        resistancesInnerHTML += `
            <li class="attribute flexcol">
                <h4 class="attribute-name box-title">${type}</h4>
                <div class="attribute-value">
                    <input name="data.resistance.${type}" type="text" value="${value}" data-dtype="Number" ${actorData.type === "character" ? "disabled" : ""}>
                </div>
            </li>
        `
    }
    resistancesInnerHTML += `</ul>`;
    resistances.innerHTML = resistancesInnerHTML;

    return resistances;
}

export function createSpellBonusArchitecture(app, html, data) {
    // Remove slots
    html[0].querySelectorAll(`div.tab[data-tab="spells"] div.item-category-title`).forEach(n => {
        console.log(n)
        n.querySelector(`div.field-short`)?.remove();
        n.querySelector(`div.field-long`)?.remove();
    });
    html[0].querySelectorAll(`div.memorize`).forEach(n => n.remove());

    const spellBonusHeader = document.createElement("div");
    spellBonusHeader.classList.add("item-category-title", "spellBonusHeader", "flexrow");
    spellBonusHeader.style = "line-height: 15px;";
    spellBonusHeader.innerHTML = `
        <div class="category-caret"><i class="fas fa-caret-down"></i></div>
        <div class="category-name">${localize("SpellBonus")}</div>
        <div class="item-controls">
            <a class="item-control item-create" data-type="spell-bonus" title="${localize("Add")}"><i class="fa fa-plus"></i></a>
        </div>
    `;
    spellBonusHeader.querySelector(`a.item-control[data-type="spell-bonus"]`).addEventListener("click", ev => createNewSpellBonus(ev, app.object));
    spellBonusHeader.addEventListener("click", app._toggleItemCategory)
    html[0].querySelector(`section.inventory.spells`).prepend(spellBonusHeader);

    const spellBonusOL = document.createElement("ol");
    spellBonusOL.classList.add("item-list");
    let spellBonusLIs = ``;
    const spellBonusData = data.flags[moduleName]?.spellBonusData || {};
    for (const bonus of Object.keys(spellBonusData)) {
        spellBonusLIs += `
            <li class="item-entry item" data-key="${bonus}">
                <div class="item-header flexrow">
                    <h4 class="item-name"><input type="text" name="flags.${moduleName}.spellBonusData.${bonus}.label" value="${data.flags[moduleName].spellBonusData[bonus].label}" /></h4>
                    <div class="field-long memorize flexrow">
                        <input type="text" name="flags.${moduleName}.spellBonusData.${bonus}.value" value="${data.flags[moduleName].spellBonusData[bonus].value}" data-dtype="Number">
                    </div>
                    <div class="item-controls">
                        <a class="item-control item-delete" data-action="delete"><i class="fas fa-trash"></i></a>
                    </div>
                </div>
            </li>
        `;
    }
    spellBonusOL.innerHTML = spellBonusLIs;
    spellBonusOL.addEventListener("click", async ev => {
        if (ev.target.closest(`a`)?.dataset.action === "delete") {
            const actor = app.object;
            const li = ev.target.closest(`li.item-entry`);
            const key = li.dataset.key;
            
            await actor.unsetFlag(moduleName, `spellBonusData.${key}`);
        }
    });
    html[0].querySelector(`div.spellBonusHeader`).after(spellBonusOL);

    
    async function createNewSpellBonus(ev, actor) {
        ev.preventDefault();
        ev.stopPropagation();
    
        const newData = {
            label: localize("NewSpellBonus"),
            value: 0
        };
        const spellBonusData = actor.data.flags[moduleName]?.spellBonusData || {};
        const keys = Object.keys(spellBonusData);
        let nextKey;
        if (!keys.length) nextKey = 0;
        else nextKey = Math.max(...keys) + 1;
        spellBonusData[nextKey] = newData;
    
        await actor.setFlag(moduleName, "spellBonusData", spellBonusData);
    
        return actor;
    }    
}

export function getDamageTypes(damageTypeData) {
    const damageTypes = [];
    for (const type of Object.keys(damageTypeData)) {
        if (!damageTypeData[type].active) continue;

        damageTypes.push({
            type,
            formula: damageTypeData[type].damage,
            break: damageTypeData[type].break
        });
    }

    return damageTypes;
}


export function getResistance(targetActor, damageType) {
    if (!targetActor) return 0;

    const characterRes = targetActor.data.data.resistance?.[damageType] || 0;
    const itemRes = targetActor.items
        .filter(i => i.type === "armor" && i.data.data.equipped)
        .reduce((acc, current) => {
            return acc + current.data.data.resistance?.[damageType] || 0;
        }, 0); 

    //console.log(`${damageType} Total Resistance: ${characterRes + itemRes}`);
    return characterRes + itemRes;
}

export function getMultiplier(res) {
    if (res >= 4) return 0;
    else if (res <= -2) return 2;

    const map = {
        3: 0.25,
        2: 0.5,
        1: 0.75,
        0: 1,
        "-1": 1.5
    };

    return map[res];
}
