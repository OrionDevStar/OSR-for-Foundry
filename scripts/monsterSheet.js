import { moduleName, localize, createResistanceElement, createSpellBonusArchitecture } from "./common.js";

export function OSRmonsterSheet(app, html, data) {
    //console.log({ app, html, data });

    // Label changes
    const alignmentLabel = html[0].querySelector(`input[name="data.details.alignment"]`)?.nextElementSibling;
    if (alignmentLabel) alignmentLabel.innerText = localize("Size");

    const NAlabel = html[0].querySelector(`input[name="data.details.appearing.d"]`)?.nextElementSibling;
    if (NAlabel) NAlabel.innerText = localize("Intelligence");
    html[0].querySelector(`li.check-field[data-check="wilderness"]`).remove();

    // Remove Wand save
    html[0].querySelector(`li.attribute.saving-throw[data-save="wand"]`).remove();

    // Add Defense value
    const defenseElement = document.createElement("li");
    defenseElement.classList.add("attribute", "defense");
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
            actor.setFlag(moduleName,"actualAc",data.data.ac.value)
            return actor.setFlag(moduleName, "defenseApplied", true);
        }
    });
    html[0].querySelector(`ul.attributes`).append(defenseElement);

    // Add FerimentoArmadura value
    const ferimentoArmoElement = document.createElement("li");
    ferimentoArmoElement.classList.add("attribute", "ferimentosarmor");
    ferimentoArmoElement.innerHTML = `
        <h4 class="attribute-name box-title" title="${localize("FerimentosArmadura")}">
            <a>${localize("FerimentosArmadura")}</a>
        </h4>
        <div class="attribute-value">
            <input name="data.hp.ferimentosarmor" type="text" value="${data.data.hp.ferimentosarmor ?? 0}" placeholder="" data-type="String">
        </div>
    `;      
    html[0].querySelector(`li.attribute.hit-dice`).after(ferimentoArmoElement);       

    // Add FerimentoLeve value
    const ferimentoLeveElement = document.createElement("li");
    ferimentoLeveElement.classList.add("attribute", "ferimentosleves");
    ferimentoLeveElement.innerHTML = `
        <h4 class="attribute-name box-title" title="${localize("FerimentosLeves")}">
            <a>${localize("FerimentosLeves")}</a>
        </h4>
        <div class="attribute-value">
            <input name="data.hp.ferimentosleves" type="text" value="${data.data.hp.ferimentosleves ?? 0}" placeholder="" data-type="String">
        </div>
    `;  
    html[0].querySelector(`li.attribute.hit-dice`).after(ferimentoLeveElement);

    // Add Ferimento value
    const ferimentoElement = document.createElement("li");
    ferimentoElement.classList.add("attribute", "ferimentos");
    ferimentoElement.innerHTML = `
        <h4 class="attribute-name box-title" title="${localize("Ferimentos")}">
            <a>${localize("Ferimentos")}</a>
        </h4>
        <div class="attribute-value">
            <input name="data.hp.ferimentos" type="text" value="${data.data.hp.ferimentos ?? 0}" placeholder="" data-type="String">
        </div>
    `;       
    html[0].querySelector(`li.attribute.hit-dice`).after(ferimentoElement);    
    const acValue = data.flags[moduleName]?.actualAc;
    console.log(acValue);
    // Visually update AC if defenseApplied flag is set
    if (data.flags[moduleName]?.defenseApplied) {
        html[0].querySelector(`div.attribute-value input[name="data.ac.value"]`).value = parseInt(acValue) - parseInt(data.data.hp.defense ?? 0);
    } else {
        html[0].querySelector(`div.attribute-value input[name="data.ac.value"]`).value = acValue ? parseInt(acValue) : parseInt(data.data.ac.value);
    }
    // Add resistances
    const resistancesSpan = createResistanceElement(data, "span");
    html[0].querySelector(`section.attributes-tab`).append(resistancesSpan);

    app.setPosition({ height: 650 });
    html[0].querySelector(`section.sheet-body`).style.height = "calc(100% - 220px)";
    app.setPosition({ width: 600 });

    html[0].querySelector(`ol.item-list.resizable`).style.height = "240px";

    // Add custom spell bonus architecture
    if (html[0].querySelector(`div.tab[data-tab="spells"]`)) createSpellBonusArchitecture(app, html, data);
}
