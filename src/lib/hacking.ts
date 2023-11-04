import { NS, Player, Server } from "Bitburner";
import { getBatch, getBatchRamUsage } from "/lib/batch";
import { DefaultMaxBatchThreads, DefaultMinServerMoneyPercent } from "/lib/Constants";

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
export function getHackThreads(ns: NS, host: Server, target: Server, player: Player, maxRamUsage: number=Infinity, maxTotalThreads: number=DefaultMaxBatchThreads, minServerMoneyPercent: number=DefaultMinServerMoneyPercent) {
    maxRamUsage = maxRamUsage ? maxRamUsage : host.maxRam;

    if(!ns.fileExists("Formulas.exe")) {
        ns.print(`WARNING: using estimation, which is not accurate, because Formulas.exe is not available`);
    }

    let hackThreads = 1;
    while(true) {
        const batch = getBatch(ns, host, target, player, hackThreads);
        // check that we aren't over-hacking the server
        const hackPercent = ns.hackAnalyze(target.hostname) * batch[0].threads;
        if(1 - hackPercent < minServerMoneyPercent) {
            ns.print(`Hit money threshold of minimum server money percentage of ${minServerMoneyPercent * 100}% with ${hackThreads - 1} threads;`)
            return hackThreads - 1;
        }
        // check that we aren't overrunning our target thread max
        const batchThreads = batch.reduce((acc, next) => acc + next.threads, 0);
        if(batchThreads > maxTotalThreads) {
            ns.print(`Hit max threads for batch, returning ${hackThreads - 1} hack threads`)
            return hackThreads - 1;
        }

        const batchRamUsage = getBatchRamUsage(ns, batch);
        if(batchRamUsage > maxRamUsage) {
            if(hackThreads === 1) {
                ns.print(`Host cannot handle a batch, minimum batch ram usage is ${batchRamUsage}GB but max ram usage for host ${host.hostname} is ${maxRamUsage}GB`)
                // edge case for if we can't even do a 1 thread batch
                return 0;
            } else {
                ns.print(`Reached max RAM threshold, returning hack threads to use of ${hackThreads - 1}`);
                // otherwise, return the previous number, which would've been within RAM constraints
                return hackThreads - 1;
            }
        }
        hackThreads++;
    }
}

/**
 * @param ns BitBurner API
 * @param serverMinMoneyPercent percentage threshold of money to hack down to
 * 
 * gets the number of threads required to bring a server from max money to a given threshold percentage of the server's money
 */
export function getMaxRequiredHackThreads(ns: NS, server: Server, player: Player, serverMinMoneyPercent: number=DefaultMinServerMoneyPercent): number {
    const hackPercent = ns.formulas.hacking.hackPercent(server, player);
    const percentToHack = 1 - serverMinMoneyPercent;

    return Math.ceil(percentToHack / hackPercent);
}
