import { localize, moduleName, getDamageTypes, getResistance, getMultiplier } from "./common.js";

export function rollAttackWrapper(wrapped, attData, options) {

    // Intercept attack rolls that hit and inject custom damage rolls and calculation
    Hooks.once("preCreateChatMessage", (message, data, options, userID) => {
        if (data.flags?.ose?.roll !== "attack") return;
        //console.log({ message, data });

        const contentHTML = new DOMParser().parseFromString(data.content, "text/html");
        // If attack has no damage, return
        if (!contentHTML.querySelector(`div.damage-roll`)) return true;

        (async () => {
            const tokenActor = canvas.tokens.get(data.speaker.token)?.actor;
            const actor = game.actors.get(data.speaker.actor);
            const item = tokenActor?.items.get(data.flags.ose.itemId) || actor?.items.get(data.flags.ose.itemId);
            //console.log({ actor, item });

            // Get attack damage types; if none, return
            const damageTypes = getDamageTypes(item.data.data.damageTypes);
            if (!damageTypes.length) return ui.notifications.warn(localize("NoDamageTypes"));

            // Create roll pool of damage rolls
            const damageRolls = damageTypes.map(d => {
                const roll = new Roll(d.formula);
                roll.type = d.type;
                roll.resBreak = d.break;
                return roll;
            });
            const damagePool = PoolTerm.fromRolls(damageRolls);
            await damagePool.evaluate();
            //console.log(damagePool)

            const totalDamageRoll = Roll.fromTerms([damagePool]);

            // For each roll in pool, apply resistance calculation
            const targetActor = attData.roll.target?.actor;
            let totalDamage = 0;
            for (const damageRoll of damagePool.rolls) {
                //console.log(damageRoll)
                const { total, type, resBreak} = damageRoll;
                const res = getResistance(targetActor, type);
        
                const multiplier = getMultiplier(res - resBreak);
                totalDamage += Math.ceil(multiplier * total);
    
                console.log("------------------------------");
                console.log(`Damage Type: ${type} | ${total} damage`);
                console.log(`Resistance: ${res} - ${resBreak} = ${res - resBreak} -> ${multiplier}x multiplier`);
                console.log(`${total} x ${multiplier} = ${multiplier * total} (round to ${Math.ceil(multiplier * total)})`);
                console.log(`Running Total Damage: ${totalDamage}`);
            }

            // If attack is critical, multiply final damage by item crit multiplier
            const attackRoll = parseInt(contentHTML.querySelector(`span.part-total`).innerText);
            if (attackRoll >= attData.item.data.crit) {
                console.log("------------------------------");
                console.log(`Critical hit multiplier: ${attData.item.data.mltp}`);
                console.log(`Final Damage = ${totalDamage} x ${attData.item.data.mltp || 2} = ${totalDamage * (attData.item.data.mltp || 2)} (round to ${Math.ceil(totalDamage * (attData.item.data.mltp || 2))})`);

                const criticalText = document.createElement("b");
                criticalText.innerText = ` ${localize("Critical")}`;
                contentHTML.querySelector(`div.roll-result`).append(criticalText);
                totalDamage = Math.ceil(totalDamage * (attData.item.data.mltp || 2));
            }
            
            // Update chat card content with new calculation
            contentHTML.querySelector(`div.damage-roll`).innerHTML = await totalDamageRoll.render();
            contentHTML.querySelector(`div.damage-roll h4.dice-total`).innerText = totalDamage;
            contentHTML.querySelector(`div.damage-roll h4.dice-total`).style.color = "blue";

            // If DSN, animate damage rolls
            if (game.dice3d) await game.dice3d.showForRoll(totalDamageRoll);

            // Create chat message
            data = foundry.utils.mergeObject(data, {
                content: contentHTML.body.innerHTML,
                flags: {
                    ose: { roll: "attack-processed" }
                }
            });
            ChatMessage.create(data);

            // Apply damage (using socket if current use is not a GM)
            if (game.user.isGM) {
                targetActor.applyDamage(totalDamage);
            } else {
                game.socket.emit(`module.${moduleName}`, {
                    action: "applyDamage",
                    targetUUID: attData.roll.target.document.uuid,
                    amount: totalDamage
                });
            }
        })();

        return false;
    });

    return wrapped(attData, options);
}
