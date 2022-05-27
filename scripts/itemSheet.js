import { localize, damageTypes, createResistanceElement } from "./common.js";

const weightKey = {
    "": 0,
    "OSR.Light": 0.25,
    "OSR.Medium": 0.5,
    "OSR.Heavy": 1
};

const spellModKey = {
    int: "OSE.scores.int.short",
    wis: "OSE.scores.wis.short",
    cha: "OSE.scores.cha.short"
};


export function OSRitemSheet(app, html, data) {
    //console.log({ app, html, data });

    const encumbranceClass = createWeightClassElement(data);

    // Add damage tabs to weapons & spells
    if (["spell", "weapon"].includes(data.type)) {
        const tabNav = document.createElement("nav");
        tabNav.classList.add("sheet-tabs", "flexrow");
        tabNav.dataset.group = "primary";
        tabNav.innerHTML = `
            <a class="item" data-tab="description" data-group="primary">${game.i18n.localize("Description")}</a>
            <a class="item" data-tab="damage" data-group="primary">${localize("Damage")}</a>
        `;
        html[0].querySelector(`form header`).after(tabNav);

        const descriptionTab = html[0].querySelector(`section.sheet-body div.flexrow`);
        descriptionTab.classList.add("tab");
        descriptionTab.dataset.tab = "description";
        descriptionTab.dataset.group = "primary";

        const damageTab = document.createElement("div");
        damageTab.classList.add("tab");
        damageTab.dataset.tab = "damage";
        damageTab.dataset.group = "primary";
        let damageTabInnerHTML = `<ul class="damageTypes flexcol">`;
        damageTabInnerHTML += `
            <li class="attribute flexrow">
                <input type="checkbox" style="visibility: hidden;" />
                <h4 class="attribute-name box-title">Type</h4>
                <div class="attribute-value">
                    <input type="text" value="Damage" disabled>
                </div>
                <div class="attribute-value">
                    <input type="text" value="Resistance Break" disabled>
                </div>
            </li>
        `;
        for (const type of damageTypes) {
            damageTabInnerHTML += `
                <li class="attribute flexrow" style="align-items: center;">
                    <input type="checkbox" name="data.damageTypes.${type}.active" ${data.data.damageTypes?.[type].active ? "checked" : ""} />
                    <h4 class="attribute-name box-title">${type}</h4>
                    <div class="attribute-value">
                        <input name="data.damageTypes.${type}.damage" type="text" value="${data.data.damageTypes?.[type].damage ?? ""}">
                    </div>
                    <div class="attribute-value">
                        <input name="data.damageTypes.${type}.break" type="text" value="${data.data.damageTypes?.[type].break ?? ""}" data-dtype="Number">
                    </div>
                </li>
            `
        }
        damageTabInnerHTML += `</ul>`;
        damageTab.innerHTML = damageTabInnerHTML;
        descriptionTab.after(damageTab);

        const tabs = new Tabs({ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description", callback: () => { } });
        tabs.bind(html[0]);

        // Prevent form from submitting on change
        app.options.submitOnChange = false;

        // Adjust app dimensions to account for new tabs
        app.setPosition({ height: 450 });


    }

    switch (data.type) {
        case "armor":
            // Remove AAC field from armor
            html[0].querySelector(`input[name="data.aac.value"]`).closest(`div.form-group`).remove();

            // Remove Wgt. field
            //html[0].querySelector(`input[name="data.weight"]`).closest(`div.form-group`).remove();

            // Add encumbrance weight class
            html[0].querySelector(`input[name="data.cost"]`).closest(`div.form-group`).after(encumbranceClass);

            // Add resistances element
            const resElement = createResistanceElement(app.object.data, "div");
            html[0].querySelector(`section.sheet-body div.flexrow`).append(resElement);

            app.setPosition({ height: 475 });

            break;
        case "weapon":
            // Remove default damage field
            html[0].querySelector(`input[name="data.damage"]`).closest(`div.form-group`).remove();

            // Remove slow checkbox
            html[0].querySelector(`input[name="data.slow"]`).closest(`div.form-group`).remove();

            // Add Critical Threshold and Multiplier fields
            const critDiv = document.createElement("div");
            critDiv.classList.add("form-group");
            critDiv.innerHTML = `
                <label title="Critical Threshold">Crit </label>
                <div class="form-fields">
                    <input type="text" name="data.crit" value="${data.data.crit ?? "20"}" data-dtype="Number">
                </div>
            `;
            const mltpDiv = document.createElement("div");
            mltpDiv.classList.add("form-group");
            mltpDiv.innerHTML = `
                <label title="Multiplier">Mltp  </label>
                <div class="form-fields">
                    <input type="text" name="data.mltp" value="${data.data.mltp ?? "2"}" data-dtype="Number">
                </div>
            `;
            html[0].querySelector(`input[name="data.bonus"]`).closest(`div.form-group`).after(critDiv, mltpDiv);

            // Add encumbrance weight class
            html[0].querySelector(`select[name="data.save"]`).closest(`div.form-group`).after(encumbranceClass);
            break;
        case "spell":
            // Label changes
            html[0].querySelector(`input[name="data.lvl"]`).closest(`div.form-group`).classList.add("block-input");
            html[0].querySelector(`input[name="data.lvl"]`).closest(`div.form-fields`).previousElementSibling.innerText = localize("Difficulty");
            html[0].querySelector(`input[name="data.class"]`).closest(`div.form-fields`).previousElementSibling.innerText = localize("School");

            // Add spell mod select
            const spellModSelect = createSpellModElement(data);
            html[0].querySelector(`input[name="data.roll"]`).closest(`div.form-group`).after(spellModSelect);

            app.setPosition({ height: 475 });
    }


    function createWeightClassElement(itemData) {
        const encumbranceClass = document.createElement("div");
        encumbranceClass.classList.add("form-group");
        encumbranceClass.innerHTML = `
            <label>${localize("Weight")}</label>
            <div class="form-fields">
                <select name="data.weightClass">
                    ${Handlebars.helpers.selectOptions(weightKey, { hash: { selected: itemData.data.weightClass || 0, localize: true, inverted: true } })}
                </select>
            </div>
        `;

        return encumbranceClass;
    }

    function createSpellModElement(itemData) {
        const spellMod = document.createElement("div");
        spellMod.classList.add("form-group");
        spellMod.innerHTML = `
            <label>${localize("Mod")}</label>
            <div class="form-fields">
                <select name="data.spellMod">
                    ${Handlebars.helpers.selectOptions(spellModKey, { hash: { selected: itemData.data.spellMod || "int", localize: true } })}
                </select>
            </div
        `;

        return spellMod;
    }

}
