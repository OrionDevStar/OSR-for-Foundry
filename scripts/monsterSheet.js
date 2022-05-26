import { localize, createResistanceElement, createSpellBonusArchitecture } from "./common.js";

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
    defenseElement.classList.add("attribute", "hit-dice");
    defenseElement.innerHTML = `
        <h4 class="attribute-name box-title" title="${localize("Defense")}">
            <a>${localize("Defense")}</a>
        </h4>
        <div class="attribute-value">
            <input name="data.hp.defense" type="text" value="${data.data.hp.defense ?? 0}" placeholder="" data-type="String">
        </div>
    `;
    html[0].querySelector(`ul.attributes`).append(defenseElement);
    
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
