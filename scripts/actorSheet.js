import { moduleName, localize, createResistanceElement, createSpellBonusArchitecture } from "./common.js";

export function OSRactorSheet (app, html, data) {
    //console.log({ app, html, data });

    // Remove Wand save
    html[0].querySelector(`li.attribute.saving-throw[data-save="wand"]`).remove();

    // Add Temp HP
    const tempHPelement = document.createElement("div");
    tempHPelement.classList.add("temp");
    tempHPelement.innerHTML = `
        <h4 class="attribute-name box-title" title="${localize("TempHP")}">
            ${localize("TempHP")}
        </h4>
        <div class="attribute-value">
            <input name="data.hp.temp" type="text" value="${data.data.hp.temp || 0}" data-type="String">
        </div>
    `;
    html[0].querySelector(`div.health`).after(tempHPelement);

    // Add Defense value
    const defenseElement = document.createElement("li");
    defenseElement.classList.add("attribute", "hit-dice");
    defenseElement.innerHTML = `
        <h4 class="attribute-name box-title" title="${localize("Defense")}">
            <a>${localize("Defense")}</a>
        </h4>
        <div class="attribute-value">
            <input name="data.hp.defense" type="text" value="${data.data.hp.defense ?? 0}" placeholder="" data-type="String">
        </div>
    `;
    defenseElement.addEventListener("click", ev => {
        const token = app.object.getActiveTokens()[0]?.document;
        if (token.combatant) {
            const actor = app.object;
            return actor.setFlag(moduleName, "defenseApplied", true);
        }
    });
    html[0].querySelector(`li.attribute.hit-dice`).after(defenseElement);

    // Visually update AC if defenseApplied flag is set
    if (data.flags[moduleName]?.defenseApplied) {
        const acValue = html[0].querySelector(`div.health.armor-class div.health-top`).innerText;
        html[0].querySelector(`div.health.armor-class div.health-top`).innerText = parseInt(acValue) - parseInt(data.data.hp.defense ?? 0);
    }

    // Label changes
    const titleLabel = html[0].querySelector(`input[name="data.details.title"]`)?.nextElementSibling;
    if (titleLabel) titleLabel.innerText = localize("Insanity");

    const alignmentLabel = html[0].querySelector(`input[name="data.details.alignment"]`).nextElementSibling;
    alignmentLabel.innerText = localize("Ethos");

    const classLabel = html[0].querySelector(`input[name="data.details.class"]`).nextElementSibling;
    classLabel.innerText = localize("Specialization");

    // Add resistances
    const resistancesDiv = createResistanceElement(data, "div");
    html[0].querySelector(`section.attributes-tab`).append(resistancesDiv);

    // Remove exploration abilities
    html[0].querySelector(`ul.attributes.exploration`).remove();

    // Adjust app dimensions
    html[0].querySelector(`section.sheet-body`).style.height = "calc(100% - 150px)";
    html[0].querySelector(`section.attributes-tab`).style = "margin-top: 10px;";
    app.setPosition({ width: 540 });
    app.setPosition({ height: 600 });

    // Add custom spell bonus architecture
    if (html[0].querySelector(`div.tab[data-tab="spells"]`)) createSpellBonusArchitecture(app, html, data);
}

function calculateMovement(weight) {
    if (weight >= 3) return 9;
    else if (weight >= 2) return 18;
    else if (weight >= 1) return 27;
    else return 36;
}
