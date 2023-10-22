import { NS, Player, Server } from "Bitburner";
import { GrowScriptLocation, HackScriptLocation, InitScriptLocation, SecurityDecreaseForWeaken, SecurityIncreaseForHack, WeakenScriptLocation } from "lib/Constants";
import { getGrowthThreads } from "lib/growth";

const DelayBetweenSteps = 100;

export interface ScriptRunSpec {
    /** script to run */
    script: string;
    /** number of threads to run the script with */
    threads: number;
    /** time that the script will take in ms */
    runtime: number;
    /** time to delay before running the script in ms */
    delay?: number;
}

export interface BatchThreads {
    hack: number
    weakenForHack: number
    grow: number
    weakenForGrow: number
}

export function getBatch(ns: NS, host: Server, target: Server, player: Player, hackThreads: number): ScriptRunSpec[] {
    const batchThreads = getBatchThreads(ns, host, target, player, hackThreads);

    const [timeToHack, timeToWeaken, timeToGrow] = [ns.getHackTime(target.hostname), ns.getWeakenTime(target.hostname), ns.getGrowTime(target.hostname)]

    const hack = {
        script: HackScriptLocation,
        threads: batchThreads.hack,
        runtime: timeToHack
    };
    const weakenForHack = {
        script: WeakenScriptLocation,
        threads: batchThreads.weakenForHack,
        runtime: timeToWeaken,
    };
    const grow = {
        script: GrowScriptLocation,
        threads: batchThreads.grow,
        runtime: timeToGrow
    };
    const weakenForGrow = {
        script: WeakenScriptLocation,
        threads: batchThreads.weakenForGrow,
        runtime: timeToWeaken
    }
    const batch = [
        hack,
        weakenForHack,
        grow,
        weakenForGrow
    ];
    const delayedBatch = getBatchWithDelays(batch);

    return delayedBatch;
}

export function getBatchThreads(ns: NS, host: Server, target: Server, player: Player, hackThreads: number) {
    const secIncreaseForHack = SecurityIncreaseForHack * hackThreads;
    const moneyStolenByHack = ns.hackAnalyze(target.hostname) * hackThreads;

    if(!target.moneyMax) {
        ns.print(`WARNING: moneyMax for target ${target.hostname} is ${target.moneyMax}`.yellow())
        return {
            hack: 0,
            weakenForHack: 0,
            grow: 0,
            weakenForGrow: 0
        };
    }

    // const bitNodeMultipliers = ns.getBitNodeMultipliers();

    const weakenSecDecrease = SecurityDecreaseForWeaken;
    const moneyAfterHack = target.moneyMax - moneyStolenByHack;

    const weakenForHackThreads = Math.ceil(secIncreaseForHack / weakenSecDecrease);

    const growThreads = getGrowthThreads(ns, target, player, host.cpuCores, Infinity, moneyAfterHack);

    const secIncreaseForGrow = ns.growthAnalyzeSecurity(growThreads);
    const weakenForGrowThreads = Math.ceil(secIncreaseForGrow / weakenSecDecrease)

    return {
        hack: hackThreads,
        weakenForHack: weakenForHackThreads,
        grow: growThreads,
        weakenForGrow: weakenForGrowThreads
    }
}

export function getBatchRamUsage(ns: NS, batch: ScriptRunSpec[]) {
    return batch.reduce((acc, next) => acc + next.threads * ns.getScriptRam(next.script), 0);
}

/**
 * applies delays to script run specs to make them finish in the order that they are in in the array
 * 
 * used to make items in a batch finish in the correct order despite different runtimes for action types
 * @param batch 
 * @returns modified array of script run specs with delays included
 */
function getBatchWithDelays(batch: ScriptRunSpec[]): ScriptRunSpec[] {
    // shallow copy the script run specs to avoid modifying passed-in reference
    const delayedScripts: ScriptRunSpec[] = batch.map((scriptRun) => {return {...scriptRun}});

    // for now, do it the naive way
    const [hack, weakenForHack, grow, weakenForGrow] = delayedScripts;

    // the real order of these will be: weakenForHack, weakenForGrow, grow, hack
    // this is because the time to complete actions is: weaken > grow > hack
    // so even though weakens need to end after the other actions, they need to start first
    
    // delay the hack such that it finishes 100ms before its weaken goes off
    hack.delay = weakenForHack.runtime - hack.runtime - DelayBetweenSteps;
    // delay the grow such that it finishes 100ms after the hack weaken goes off
    // NOTE: weakenForHack.delay is always 0, because it needs to go off second +
    // is tied for weakenForGrow for longest runtime, which is the last completed proces per batch
    grow.delay = weakenForHack.runtime - grow.runtime + DelayBetweenSteps;
    // delay the grow weaken such that it finishes 300ms after the grow goes off
    weakenForGrow.delay = grow.delay + grow.runtime - weakenForGrow.runtime + DelayBetweenSteps * 2

    return delayedScripts;
}

export async function prepareServerForBatching(ns: NS, target: string, cores: number) {
    while(true) {
        const host = ns.getServer(ns.getHostname());
        const player = ns.getPlayer();
        const server = ns.getServer(target);
        const availableRam = host.maxRam - host.ramUsed;
        const hackDifficulty = server?.hackDifficulty || 0;
        const minDifficulty = server?.minDifficulty || 0;
        const moneyAvailable = server?.moneyAvailable || 0;
        const moneyMax = server?.moneyMax || 0;
        // let scriptToRun = ActionScriptsDirectory;
        const scriptsToRun: ScriptRunSpec[] = [];

        if(serverIsReadyForBatches(server)) {
            // if we're ready to start batching, stop this loop
            break;
        }

        if (!server.hasAdminRights) {
            scriptsToRun.push({
                script: InitScriptLocation,
                threads: 1,
                runtime: 1000
            });
        } else if (hackDifficulty > (server?.minDifficulty || 100)) {
            let amountToReduce = hackDifficulty - minDifficulty;
            let reductionPerCall = .05;
            const maxThreads = Math.floor(availableRam / ns.getScriptRam(WeakenScriptLocation));
            let threads = Math.min(maxThreads, Math.ceil(amountToReduce / reductionPerCall) * 2);
            scriptsToRun.push({
                script: WeakenScriptLocation,
                threads: threads,
                runtime: ns.getWeakenTime(server.hostname)
            })
        } else if (moneyAvailable < moneyMax) {
            // TODO: abstract grow w/offset?
            const maxGrowthThreads = getMaxThreads(ns, GrowScriptLocation, availableRam);
            // grow
            const grow: ScriptRunSpec = {
                script: GrowScriptLocation,
                threads: getGrowthThreads(ns, server, player, cores, maxGrowthThreads, server.moneyAvailable),
                runtime: ns.getGrowTime(server.hostname)
            };
            // this kept under-growing w/o formulas, and since this is a batcher
            // we know we'll have plenty of spare mem for this phase since
            // it's lower mem usage than a batcher
            grow.threads = Math.min(grow.threads * 2, maxGrowthThreads);
            let secIncreaseForGrow = ns.growthAnalyzeSecurity(grow.threads);
            // weaken to offset grow
            const weakenForGrow: ScriptRunSpec = {
                script: WeakenScriptLocation,
                threads: Math.ceil(secIncreaseForGrow / SecurityDecreaseForWeaken),
                runtime: ns.getWeakenTime(server.hostname)
            }
            // to avoid overflowing memory w/the added weaken calls
            if(grow.threads === maxGrowthThreads) {
                grow.threads -= weakenForGrow.threads;
            }
            grow.delay = weakenForGrow.runtime - grow.runtime + DelayBetweenSteps;
            scriptsToRun.push(grow);
            scriptsToRun.push(weakenForGrow)
        }

        
        const timeToWait = scriptsToRun.reduce((acc, next) => Math.max(acc, next.runtime + (next.delay || 0)), 0);
        
        for(const scriptRun of scriptsToRun) {
            if(scriptRun.threads <= 0) {
                ns.print(`Got bad script run spec with <= 0 threads: ${JSON.stringify(scriptRun)} from script list ${JSON.stringify(scriptsToRun)}. Waiting 10s and calculating again.`);
                await ns.sleep(10 * 1000);
                break;
            }
            ns.exec(scriptRun.script, host.hostname, {threads: scriptRun.threads}, "--target", target, "--delay", (scriptRun.delay || 0))
        }
        // TODO: tweak this until we don't get race conds
        await ns.sleep(timeToWait + DelayBetweenSteps * 10)
    }
}


/**
 * Checks if a server has reached minimum security and maximum growth.
 * 
 * A server starting in that position is required for the batcher to work efficiently. 
 * 
 * @param server
 * @returns whether the server is ready to start to have batching run against it
 */
export function serverIsReadyForBatches(server: Server): boolean {
    return server.moneyAvailable === server.moneyMax && server.hackDifficulty === server.minDifficulty;
}

/**
 * @param ns BitBurner API
 * @param script script to run
 * @param availableRam
 * @return the maximum number of threads that can be run to use the script in question. This number could be <0 if there is insufficient RAM.
 */
function getMaxThreads(ns: NS, script: string, availableRam: number): number {
    let scriptRam = ns.getScriptRam(script);
    let maxThreads = Math.floor(availableRam / scriptRam);
    ns.print(`Comparing available ${availableRam}GB to scriptRam ${scriptRam}GB for script ${script}, got ${maxThreads} max threads`);
    return maxThreads;
}