import { NS } from "Bitburner";
import { trainCombatSkills } from "scripts/singularity/training/combat-training";

const TrainingTimePerStat = 60000;


// TODO: do this better
const Universities = [
    "Rothman University"
]
const Gyms = [
    "Powerhouse Gym"
]


export async function main(ns: NS) {
    const scriptFlags = ns.flags([["focus", false], ["statThreshold", Infinity]])
    const focus = Boolean(scriptFlags.focus);
    const statThreshold = Number(scriptFlags.statThreshold);
    await trainEverything(ns, statThreshold, focus);
}

export async function trainEverything(ns:  NS, statThreshold: number, focus?: boolean) {
    const player = ns.getPlayer();
    while(true) {
        // train hacking
        if(player.skills.hacking < statThreshold) {
            ns.singularity.universityCourse(Universities[0], "Algorithms", focus);
            await ns.sleep(TrainingTimePerStat);
        }

        // train charisma
        if(player.skills.charisma < statThreshold) {
            ns.singularity.universityCourse(Universities[0], "Leadership", focus);
            await ns.sleep(TrainingTimePerStat);
        }

        // train combat skills + crime for money
        await trainCombatSkills(ns, {
            gymToUse: Gyms[0],
            statThreshold: statThreshold,
            focus: focus,
            maxCycles: 1,
            timetoTrainStat: TrainingTimePerStat
        });
    }
}