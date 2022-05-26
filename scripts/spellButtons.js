import { localize } from "./common.js";

export async function itemShowWrapper(wrapped) {
    if (this.type === "spell") {
        Hooks.once("preCreateChatMessage", (message, data, options, userID) => {
            //console.log({ message, data })
            const contentHTML = new DOMParser().parseFromString(data.content, "text/html");

            // Execute button
            const executeButton = document.createElement("div");
            executeButton.classList.add("card-buttons");
            executeButton.innerHTML = `<button data-action="spell-execute">${localize("ExecuteSpell")}</button>`;
            contentHTML.querySelector(`footer`).before(executeButton);

            // Damage button
            const damageButton = document.createElement("div");
            damageButton.classList.add("card-buttons");
            damageButton.innerHTML = `<button data-action="spell-damage">${localize("Damage")}</button>`;
            contentHTML.querySelector(`footer`).before(damageButton);

            // Half-damage button
            const halfDamageButton = document.createElement("div");
            halfDamageButton.classList.add("card-buttons");
            halfDamageButton.innerHTML = `<button data-action="spell-damage-half">${localize("HalfDamage")}</button>`;
            contentHTML.querySelector(`footer`).before(halfDamageButton);

            message.data.update({
                content: contentHTML.body.innerHTML
            });
        });
    }

    return wrapped();
}
