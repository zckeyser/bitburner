import { NS } from "Bitburner";
import { getBatch, prepareServerForBatching } from "/lib/batch";
import { getHackThreads } from "/lib/hacking";
import { TermLogger } from "/lib/Helpers";
import { DefaultMaxBatchThreads } from "/lib/Constants";

// 10 minutes
const PrepareInterval = 10 * 60 * 1000;

/** @param ns BitBurner API */
export async function main(ns: NS) {
    const scriptFlags = ns.flags([["target", ""], ["maxThreads", DefaultMaxBatchThreads]]);
    const target = String(scriptFlags.target);
    const maxBatchThreads = Number(scriptFlags.maxThreads);
    if (!target) {
      throw new Error(`batcher.js requires a target argument via the --target flag, e.g. 'run batcher.js --target foodnstuff'`)
    }
    const currentHost = ns.getHostname();
    const cores = ns.getServer(currentHost).cpuCores;

    await prepareServerForBatching(ns, target, cores, maxBatchThreads);

    await runBatching(ns, target, cores, maxBatchThreads);
}

/**
 * Implements a batching algorithm for hacking along the lines of https://bitburner.readthedocs.io/en/latest/advancedgameplay/hackingalgorithms.html#batch-algorithms-hgw-hwgw-or-cycles
 * 
 * The concept is that we get a server to a maxed out position (min sec, max money), 
 * then run batches where 4 scripts run simultaneously, slightly offset to finish in order:
 * 
 * @param ns 
 * @param target 
 * @param cores 
 * @param maxBatchThreads maximum threads to use for a batch, regardless of 
 */
export async function runBatching(ns: NS, target: string, cores: number, maxBatchThreads: number) {
    const logger = new TermLogger(ns);
    let serverLastPreparedTime = Date.now();
    const hostname = ns.getHostname();
    while(true) {
        if(Date.now() - serverLastPreparedTime >= PrepareInterval) {
            // periodically re-run the prepare script in case there's any drift
            // with imperfect offsets causing the server to not sit at max money/min sec as it should for batching.
            await prepareServerForBatching(ns, target, cores, maxBatchThreads);
            serverLastPreparedTime = Date.now();
        }
        const host = ns.getServer(hostname);
        const targetServer = ns.getServer(target);
        const player = ns.getPlayer();
        const availableRam = host.maxRam - host.ramUsed;
        if(!targetServer.moneyMax) {
            logger.err(`Server ${targetServer.hostname} cannot be used to earn money, moneyMax is ${targetServer.moneyMax}`);
            return;
        }

        const hackThreads = getHackThreads(ns, host, targetServer, player, availableRam, maxBatchThreads);

        if(!hackThreads) {
            ns.print(`Not enough RAM to run a batch. Max hack threads w/batching was ${hackThreads}.`.yellow());
            await prepareServerForBatching(ns, target, cores, maxBatchThreads);
            continue;
        }
        const batch = getBatch(ns, host, targetServer, player, hackThreads);
        
        const timeToWait = batch.reduce((acc, next) => Math.max(acc, next.runtime + (next.delay || 0)), 0);
        
        for(const scriptRun of batch) {
            ns.exec(scriptRun.script, host.hostname, {threads: scriptRun.threads}, "--target", target, "--delay", (scriptRun.delay || 0));
        }
        await ns.sleep(timeToWait + 200);
    }
}