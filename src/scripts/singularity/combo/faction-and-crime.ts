import { FactionWorkType, NS } from "Bitburner";
import { startOptimalCrime } from "scripts/singularity/crime/crime"


const FactionRepBatchSize = 500;


/**
 * Runs alternating faction work + crime
 * @param ns BitBurner API
 */
export async function main(ns: NS) {
    const scriptFlags = ns.flags([["faction", ""], ["factionToCrimeRatio", 1.5], ["repGoal", Infinity], ["focus", false]]);

    const faction = String(scriptFlags.faction);
    if(!faction) {
        throw Error("--faction flag is required");
    }
    const factionToCrimeRatio = Number(scriptFlags.factionToCrimeRatio);
    const focus = Boolean(scriptFlags.focus);
    const repGoal = Number(scriptFlags.repGoal)

    await workFactionAndCrime(ns, faction, repGoal, factionToCrimeRatio, focus);
}

/**
 * Alternates between working for a faction and 
 * @param ns BitBurner API
 * @param faction the faction to grow rep with
 * @param repGoal the rep that we'll stop 
 * @param factionToCrimeRatio the ratio of time spent growing faction rep vs committing crimes to make money. numbers >1 mean more time spent growing faction rep, and numbers between 0-1 mean more time spent committing crimes
 */
export async function workFactionAndCrime(ns: NS, faction: string, repGoal: number, focus: boolean) {
    while(true) {
        let currentRep = ns.singularity.getFactionRep(faction);
        
        if(currentRep > repGoal) {
            ns.toast(`Rep goal of ${repGoal} with faction ${faction} has been reached. Starting crime and exiting.`);
            startOptimalCrime(ns, "moneyPerInterval");
            return;
        }

        workForFaction(ns, faction, focus);

        const batchStartTime = Date.now();
        // we work in cycles of FactionRepBatchSize rep, after which we make some money
        const batchEndRep = currentRep + FactionRepBatchSize;
        
        while(currentRep < batchEndRep) {
            await ns.sleep(10000);
            currentRep = ns.singularity.getFactionRep(faction);
        }
        ns.print(`Starting moneymaking activities after earning ${FactionRepBatchSize} rep with ${faction}, for a total of ${currentRep} rep`);
        
        const factionGrowTime = Date.now() - batchStartTime;
        const timeToMakeMoney = factionGrowTime / factionToCrimeRatio;
        startOptimalCrime(ns, "moneyPerInterval", Math.floor(timeToMakeMoney / 1000));
        
        await ns.sleep(timeToMakeMoney);
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