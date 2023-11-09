import { GangMemberInfo, NS } from "Bitburner";
import { GangCycleLength } from "/lib/Constants";
import { getConfigValue } from "/lib/config/get-config";


export async function main(ns: NS) {
    await ascendGangMembers(ns);
}

/**
 * regularly ascend gang members when they get enough of a stat improvemnt from their next ascencion
 * also aims to keep WantedLevelPenalty under the threshold in Constants
 *
 * @param ns BitBurner API 
 */
export async function ascendGangMembers(ns: NS) {
    while(true) {
        const gangMembers = ns.gang.getMemberNames().map(ns.gang.getMemberInformation);

        for(const member of gangMembers) {
            if(shouldAscend(ns, member)) {
                const gang = ns.gang.getGangInformation();
                
                const newRespectLevel = gang.respect - member.earnedRespect;
                const newWantedPenalty = 1 - (gang.wantedLevel / (1 + newRespectLevel));
                const wantedPenaltyThreshold = getConfigValue<number>(ns, "gang.threshold.wanted_penalty");
                if(newWantedPenalty < wantedPenaltyThreshold || gang.wantedLevel === 1) {
                    ns.print(`Delaying ascension of ${member.name} because it would bring the wanted penalty multiplier to ${(newWantedPenalty * 100).toPrecision(4)}%`.yellow());
                    continue;
                }

                ns.print(`Ascending ${member.name}`);
                ns.gang.ascendMember(member.name);
            } else {
                ns.print(`${member.name} is not ready for ascension`);
            }
        }

        // do this a bit more sporadically than every cycle
        await ns.sleep(GangCycleLength * 4);
    }
}

function shouldAscend(ns: NS, member: GangMemberInfo): boolean {
    const ascResult = ns.gang.getAscensionResult(member.name);
    return (ascResult?.str ?? 0) > getConfigValue<number>(ns, "gang.threshold.ascension_improvement");
}