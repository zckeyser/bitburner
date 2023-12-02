import { NS, SleevePerson } from "Bitburner";

export async function main(ns: NS) {
    await prepareSleevesLoop(ns);
}

async function prepareSleevesLoop(ns: NS) {
    while(true) {
        prepareSleeves(ns);

        await ns.sleep(60000);
    }
}

/**
 * Sets appropriate jobs for any sleeves which aren't fully de-shocked and synchronized
 * 
 * @param ns BitBurner API
 */
export function prepareSleeves(ns: NS) {
    const sleeveCount = ns.sleeve.getNumSleeves();

    for(const i of (new Array(sleeveCount)).keys()) {
        const sleeve = ns.sleeve.getSleeve(i);
        if(!sleeveReadyForWork(sleeve)) {
            if(sleeve.shock > 0) {
                ns.print(`Sleeve ${i} is doing shock therapy`);
                ns.sleeve.setToShockRecovery(i);
            } else if (sleeve.sync < 100) {
                
            ns.print(`Sleeve ${i} is synchronizing`);
                ns.sleeve.setToSynchronize(i);
            } else {
                ns.tprint(`Unexpected sleeve condition where not ready for work, but fully synchronized and de-shocked`);
            }
        } else {
            ns.print(`Sleeve ${i} is already prepped`);
        }
    }
}

/**
 * Checks if a sleeve is fully de-shocked and synchronized and thus ready for work
 * 
 * @param sleeve sleeve to check for readiness
 * @returns 
 */
export async function sleeveReadyForWork(sleeve: SleevePerson) {
    return sleeve.shock === 0 && sleeve.sync === 100;
}
