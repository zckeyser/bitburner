import { GangMemberInfo, NS } from "Bitburner";
import { 
    GangCycleLength,
    // TODO: move some of these to configs
    BaseInitialTrainingThreshold,
    MaxInitialTrainingThreshold,
} from "/lib/Constants";
import { getConfigValue } from "/lib/config/get-config";


export async function main(ns: NS) {
    await manageJobs(ns);
}

export async function manageJobs(ns: NS) {
    ns.disableLog("sleep");

    while(true) {
        const gangMembers = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name));
        const memberJobs = new Map<string, string>();
        for(const member of gangMembers) {
            let taskToDo = "";
            const baseTrainingThreshold = getConfigValue<number>(ns, "gang.threshold.base_training");
            const maxTrainingThreshold = getConfigValue<number>(ns, "gang.threshold.max_training");
            const traffickArmsThreshold = getConfigValue<number>(ns, "gang.threshold.traffick");
            const terrorismThreshold = getConfigValue<number>(ns, "gang.threshold.terrorism");
            const terrorismRespectThreshold = getConfigValue<number>(ns, "gang.threshold.terrorism_respect");
            const initialTrainingThreshold = getThresholdForAsc(ns, member, baseTrainingThreshold, maxTrainingThreshold);
            
            if(!combatStatsMeetThreshold(member, initialTrainingThreshold)) {
                ns.print(`Performing initial training up to threshold of ${initialTrainingThreshold} for member ${member.name}`);
                taskToDo = "Train Combat";
            } else if(combatStatsMeetThreshold(member, terrorismThreshold) && member.earnedRespect < terrorismRespectThreshold) {
                taskToDo = "Terrorism";
            } else if(!combatStatsMeetThreshold(member, traffickArmsThreshold)) {
                ns.print(`${member.name} is Strongarming Civilians`);
                taskToDo = "Strongarm Civilians";
            } else {
                ns.print(`${member.name} is Trafficking Illegal Arms`);
                taskToDo = "Traffick Illegal Arms";
            }

            if(member.task !== taskToDo) {
                memberJobs.set(member.name, taskToDo);
            }
        }

        const gang = ns.gang.getGangInformation();
        const wantedPenaltyThreshold = getConfigValue<number>(ns, "gang.threshold.wanted_penalty");
        if(gang.wantedLevelGainRate > 0 && gang.wantedPenalty < wantedPenaltyThreshold) {
            // we're still gaining wanted, add 1 more vigilante than we already have
            const numVigilantes = gangMembers.filter(m => m.task === "Vigilante Justice").length + 1;
            // use the least experienced ones to offset wanted first
            const vigilanteStatThreshold = getConfigValue<number>(ns, "gang.threshold.vigilante");
            const membersToVigilante = gangMembers.filter(m => combatStatsMeetThreshold(m, vigilanteStatThreshold)).slice(numVigilantes * -1);
            for(const member of membersToVigilante) {
                memberJobs.set(member.name, "Vigilante Justice");
            }
        }

        const numGangMembersToFight = getConfigValue<number>(ns, "gang.war.members");
        if(numGangMembersToFight > 0) {
            // use highest skill members for gang war
            const gangWarMembers = gangMembers.slice(0, numGangMembersToFight);

            for(const member of gangWarMembers) {
                memberJobs.set(member.name, "Territory Warfare");
            }
        }

        for(const entry of memberJobs.entries()) {
            const [memberName, memberJob] = entry;

            ns.gang.setMemberTask(memberName, memberJob);
        }

        await ns.sleep(GangCycleLength);
    }
}

/**
 * Gets a threshold scaled to the current ascended multipliers for a gang member
 * 
 * Assumes we want to spend about the same amount of time training as before, but getting to a higher threshold
 * 
 * @param ns 
 * @param member 
 */
export function getThresholdForAsc(ns: NS, member: GangMemberInfo, originalThreshold: number, maxValue: number=Infinity): number {
    const ascMult = getAverageCombatAscMult(member);
    const newThreshold = ns.formulas.skills.calculateSkill(ns.formulas.skills.calculateExp(originalThreshold), ascMult);
    return Math.min(newThreshold, maxValue);
}

/**
 * 
 * @param member 
 */
export function getAverageCombatAscMult(member: GangMemberInfo): number { 
    return (
        member.str_asc_mult +
        member.dex_asc_mult + 
        member.def_asc_mult
    ) / 3;
}

/**
 * 
 * @param member 
 * @param threshold 
 * @returns 
 */
export function combatStatsMeetThreshold(member: GangMemberInfo, threshold: number, includeAgi: boolean=false): boolean {
    let statsMeetThreshold = member.str >= threshold 
                             && member.def >= threshold 
                             && member.dex >= threshold;
    if(includeAgi) {
        statsMeetThreshold = statsMeetThreshold && member.agi >= threshold;
    }

    return statsMeetThreshold;
}
