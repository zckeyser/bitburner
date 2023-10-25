import { NS } from "Bitburner";
import { TrainingGym, trainCombatSkills } from "scripts/singularity/training/combat-training";
import { trainCharisma } from "scripts/singularity/training/charisma-training";
import { trainHacking } from "scripts/singularity/training/hack-training";
import { Gyms } from "/lib/Constants";

const TrainingTimePerStat = 30 * 1000;


export async function main(ns: NS) {
    const scriptFlags = ns.flags([["focus", false], ["threshold", Infinity]])
    const focus = Boolean(scriptFlags.focus);
    const statThreshold = Number(scriptFlags.threshold);
    await trainEverything(ns, statThreshold, focus);
}

export async function trainEverything(ns:  NS, statThreshold: number, focus?: boolean) {
    while(true) {
        // train hacking
        await trainHacking(ns, statThreshold, TrainingTimePerStat);

        // train charisma
        await trainCharisma(ns, statThreshold, TrainingTimePerStat);

        // train combat skills + crime for money
        await trainCombatSkills(ns, {
            gymToUse: Gyms[0] as TrainingGym,
            statThreshold: statThreshold,
            focus: focus,
            maxCycles: 1,
            timetoTrainStat: TrainingTimePerStat,
            skipCrime: true
        });
    }
}