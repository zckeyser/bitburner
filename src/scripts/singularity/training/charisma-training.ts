import { NS } from "Bitburner";
import { Universities } from "/lib/Constants";

/**
 * 
 * @param ns BitBurner API
 * @param statThreshold level up to which to train charisma
 * @param timeLimit maximum amount of time to spend training
 * @param focus whether to focus on the work while training
 */
export async function trainCharisma(ns: NS, statThreshold: number, timeLimit: number=Infinity, focus: boolean=false) {
    const start = Date.now();

    ns.print(`Training charisma up to ${statThreshold}, taking a maximum of ${timeLimit}ms`);
    ns.singularity.universityCourse(Universities[0], "Leadership", focus);

    while(ns.getPlayer().skills.charisma < statThreshold && Date.now() - start > timeLimit) {
        await ns.sleep(10 * 1000);
    }
}