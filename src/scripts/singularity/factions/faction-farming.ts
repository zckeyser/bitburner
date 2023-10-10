import { FactionWorkType, NS } from "Bitburner";
import { startOptimalCrime } from "scripts/singularity/crime/crime"


const FactionRepBatchSize = 500;


/**
 * Runs alternating faction work + crime
 * @param ns BitBurner API
 */
export async function main(ns: NS) {
    const scriptFlags = ns.flags([["faction", ""], ["repGoal", Infinity], ["focus", false]]);

    const faction = String(scriptFlags.faction);
    if(!faction) {
        throw Error("--faction flag is required");
    }
    const focus = Boolean(scriptFlags.focus);
    const repGoal = Number(scriptFlags.repGoal)

    await farmFactionForRep(ns, faction, repGoal, focus);
}

export async function farmFactionForAugments(ns: NS, faction: string, focus: boolean=false) {
    let augs = ns.singularity.getAugmentationsFromFaction(faction);

    let repReqs = augs.map(ns.singularity.getAugmentationRepReq);
    let maxRepReq = repReqs.reduce((acc, next) => Math.max(acc, next), 0);
    await farmFactionForRep(ns, faction, maxRepReq, focus);
}


/**
 * Alternates between working for a faction and 
 * @param ns BitBurner API
 * @param faction the faction to grow rep with
 * @param repGoal the rep that we'll stop 
 */
export async function farmFactionForRep(ns: NS, faction: string, repGoal: number, focus: boolean=false) {
    let currentRep = ns.singularity.getFactionRep(faction);
    
    if(currentRep > repGoal) {
        ns.toast(`Rep goal of ${repGoal} with faction ${faction} has been reached. Starting crime and exiting.`);
        startOptimalCrime(ns, "moneyPerInterval");
        return;
    }

    ns.toast(`Working for faction ${faction} until reputation ${repGoal} is reached`);
    workForFaction(ns, faction, focus);

    while(currentRep < repGoal) {
        await ns.sleep(10000);
        currentRep = ns.singularity.getFactionRep(faction);
    }
}

/**
 * works for a faction, choosing the best job for our skills which is available on the faction.
 * @param ns BitBurner API
 * @param faction faction to work at
 * @param focus whether to focus on working
 */
export function workForFaction(ns: NS, faction: string, focus: boolean=false) {
    let factionSkills = getFactionJobSkills(ns);
    for(let i = 0; i < factionSkills.length; i++) {
        let factionJob = factionSkills[i].workType as FactionWorkType;
        let isWorking = ns.singularity.workForFaction(faction, factionJob, focus);
        if(!isWorking) {
            // this job isn't available for this faction, try the next
            continue;
        }
        ns.print(`Working at faction ${faction} with work ${factionJob}`);
        return;
    }
}

export interface FactionJobSkill {
    workType: string,
    value: number
}

/**
 * 
 * @param ns BitBurner API
 * @returns sorted
 */
export function getFactionJobSkills(ns: NS): FactionJobSkill[] {
    const player = ns.getPlayer();

    let factionSkills = [
        {
            workType: "hacking",
            value: player.skills.hacking
        },
        {
            workType: "field",
            value: (player.skills.hacking + player.skills.agility + player.skills.charisma + player.skills.dexterity + player.skills.defense + player.skills.strength) / 6
        },
        {
            workType: "security",
            value: (player.skills.agility + player.skills.dexterity + player.skills.defense + player.skills.strength) / 4
        }
    ];
    factionSkills.sort((a, b) => a[1] - b[1]);
    factionSkills.reverse();

    return factionSkills;
}