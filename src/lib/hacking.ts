import { NS, Player, Server } from "Bitburner";
import { getBatch, getBatchRamUsage } from "lib/batch";

/**
 * Gets the number of hack threads to be used for a batch,
 * based on what server is being run against + whether that number of hackThreads can be offset.
 * @param ns 
 * @param host 
 * @param target 
 * @param player 
 * @param maxRamUsage 
 * @returns 
 */
export function getHackThreads(ns: NS, host: Server, target: Server, player: Player, maxRamUsage: number=0) {
    maxRamUsage = maxRamUsage ? maxRamUsage : host.maxRam;

    if(!ns.fileExists("Formulas.exe")) {
        throw Error("Can only get hack threads if Formulas.exe is available");
    }

    let hackThreads = 1;
    while(true) {
        const batch = getBatch(ns, host, target, player, hackThreads);

        const batchRamUsage = getBatchRamUsage(ns, batch);
        if(batchRamUsage > maxRamUsage) {
            if(hackThreads === 1) {
                // edge case for if we can't even do a 1 thread batch
                return 0;
            } else {
                // otherwise, return the previous number, which would've been within RAM constraints
                return hackThreads - 1;
            }
        }
        hackThreads++;
    }
}