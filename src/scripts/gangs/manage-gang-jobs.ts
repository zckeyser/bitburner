import { GangMemberInfo, NS } from "Bitburner";

// 10 seconds
const GangCycleLength = 5000;

// constants for various thresholds to do diff jobs
const BaseInitialTrainingThreshold = 100;
const MaxInitialTrainingThreshold = 1000;
const StrongArmCiviliansThreshold = 150;
const TraffickArmsThreshold = 200;
const WantedPenaltyThreshold = .95;

const MugTrainingRespectThreshold = 50;
const MugRetrainingStatThreshold = 100;
const StopMuggingRespectThreshold = 100;

const VigilanteStatThreshold = 100;


export async function main(ns: NS) {
    await manageJobs(ns);
}

export async function manageJobs(ns: NS) {
    ns.disableLog("sleep");

    while(true) {
        const gangMembers = ns.gang.getMemberNames().map(name => ns.gang.getMemberInformation(name));
        for(const member of gangMembers) {
            let taskToDo = "";
            const initialTrainingThreshold = getThresholdForAsc(ns, member, BaseInitialTrainingThreshold, MaxInitialTrainingThreshold);

            if(!combatStatsMeetThreshold(member, initialTrainingThreshold)) {
                ns.print(`Performing initial training up to threshold of ${initialTrainingThreshold} for member ${member.name}`);
                taskToDo = "Train Combat";
            } else if (!combatStatsMeetThreshold(member, StrongArmCiviliansThreshold)) {
                if(member.earnedRespect > MugTrainingRespectThreshold && !combatStatsMeetThreshold(member, MugRetrainingStatThreshold)) {
                    ns.print(`${member.name} is over mugging retraining respect threshold, but under retraining stat threshold, so doing training`);
                    taskToDo = "Train Combat";
                } else if (member.earnedRespect > StopMuggingRespectThreshold) {
                    ns.print(`${member.name} is over mugging max respect threshold, so doing training to reach strongarm`);
                    taskToDo = "Train Combat";
                } else {
                    ns.print(`${member.name} is mugging people`);
                    taskToDo = "Mug People";
                }
            } else if(!combatStatsMeetThreshold(member, TraffickArmsThreshold)) {
                ns.print(`${member.name} is Strongarming Civilians`);
                taskToDo = "Strongarm Civilians";
            } else {
                ns.print(`${member.name} is Trafficking Illegal Arms`);
                taskToDo = "Traffick Illegal Arms";
            }

            if(member.task !== taskToDo) {
                ns.gang.setMemberTask(member.name, taskToDo);
            }
        }

        const gang = ns.gang.getGangInformation();
        if(gang.wantedLevelGainRate > 0 && gang.wantedPenalty < WantedPenaltyThreshold) {
            // we're still gaining wanted, add 1 more vigilante than we already have
            const numVigilantes = gangMembers.filter(m => m.task === "Vigilante Justice").length + 1;
            // use the least experienced ones to offset wanted first
            const membersToVigilante = gangMembers.filter(m => combatStatsMeetThreshold(m, VigilanteStatThreshold)).slice(numVigilantes * -1);
            for(const m of membersToVigilante) {
                ns.gang.setMemberTask(m.name, "Vigilante Justice");
            }
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
        member.agi_asc_mult + 
        member.dex_asc_mult + 
        member.def_asc_mult
    ) / 4;
}

/**
 * 
 * @param member 
 * @param threshold 
 * @returns 
 */
export function combatStatsMeetThreshold(member: GangMemberInfo, threshold: number): boolean {
    return member.agi >= threshold
        && member.str >= threshold 
        && member.def >= threshold 
        && member.dex >= threshold;
}