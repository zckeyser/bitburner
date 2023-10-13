import { NS, Server } from "Bitburner";
import { getGrowthThreads } from "/lib/growth";
import { ActionScriptsDirectory, SecurityDecreaseForWeaken, SecurityIncreaseForHack } from "/lib/Constants";

// TODO: better way to determine how many threads to hack with?
const HackThreads = 290;
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


/** @param ns BitBurner API */
export async function main(ns: NS) {
    const scriptFlags = ns.flags([["target", ""], ["hackThreads", HackThreads]]);
    const target = String(scriptFlags.target);
    if (!target) {
      throw new Error(`batcher.js requires a target argument via the --target flag, e.g. 'run batcher.js --target foodnstuff'`)
    }
    const hackThreads = Number(scriptFlags.hackThreads);
    const currentHost = ns.getHostname();
    const cores = ns.getServer(currentHost).cpuCores;
    let isRooted = ns.hasRootAccess(target);
    let isHackable = false;
    let ramCap = ns.getServerMaxRam(currentHost);
    let retries = 0;
  
    if (currentHost === "home" && ramCap > 256) {
      // save a bit of home ram so we can run spare scripts
      // but only if we have ram to spare
      ramCap -= 30;
    }

    await prepareServerForBatching(ns, target, cores);

    await runBatching(ns, target, cores, hackThreads);
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
 */
export async function runBatching(ns: NS, target: string, cores: number, hackThreads: number=HackThreads) {
    while(true) {
        const host = ns.getServer(ns.getHostname());
        const server = ns.getServer(target);
        const player = ns.getPlayer();
        const timeToWeaken = ns.getWeakenTime(target);
        const timeToHack = ns.getHackTime(target);
        const timeToGrow = ns.getGrowTime(target);
        const availableRam = host.maxRam - host.ramUsed;
        let batchUsedRam = 0;
        let scriptsToRun: ScriptRunSpec[] = [];
        if(!server.moneyMax) {
            throw Error("Server cannot be used to earn money, moneyMax is " + server.moneyMax);
        }

        // hack
        const hack = {
            script: `${ActionScriptsDirectory}hack.js`,
            threads: hackThreads,
            runtime: timeToHack
        };
        batchUsedRam += hack.threads * ns.getScriptRam(hack.script);
        const secIncreaseForHack = SecurityIncreaseForHack * hack.threads;
        const moneyDecreaseForHack = ns.hackAnalyze(target) * hack.threads;
        const moneyAfterHack = server.moneyMax - moneyDecreaseForHack;
        // weaken to offset hack
        const weakenForHack = {
            script: `${ActionScriptsDirectory}weaken.js`,
            threads: Math.ceil(secIncreaseForHack / SecurityDecreaseForWeaken),
            runtime: timeToWeaken,
        };
        batchUsedRam += hack.threads * ns.getScriptRam(weakenForHack.script);
        // grow
        const grow = {
            script: `${ActionScriptsDirectory}grow.js`,
            threads: getGrowthThreads(ns, server, player, cores, 1000, moneyAfterHack),
            runtime: timeToGrow
        };
        batchUsedRam += hack.threads * ns.getScriptRam(grow.script);
        let secIncreaseForGrow = ns.growthAnalyzeSecurity(grow.threads);
        // weaken to offset grow
        const weakenForGrow = {
            script: `${ActionScriptsDirectory}weaken.js`,
            threads: Math.ceil(secIncreaseForGrow / SecurityDecreaseForWeaken),
            runtime: timeToWeaken
        }
        batchUsedRam += hack.threads * ns.getScriptRam(weakenForGrow.script);

        if(batchUsedRam > availableRam) {
            ns.print(`Not enough RAM to run batch. Batch requires ${batchUsedRam}GB, but only ${availableRam}GB of RAM is available.`);
            await ns.sleep(60000);
            continue;
        }

        scriptsToRun = [
            hack,
            weakenForHack,
            grow,
            weakenForGrow
        ]
        scriptsToRun = applyDelaysForBatch(scriptsToRun);
        
        const timeToWait = scriptsToRun.reduce((acc, next) => Math.max(acc, next.runtime + (next.delay || 0)), 0);
        
        ns.print(`Batch cost: ${batchUsedRam}GB`);
        // TODO: do I need to partion these across servers?
        for(const scriptRun of scriptsToRun) {
            ns.exec(scriptRun.script, "home", {threads: scriptRun.threads}, "--target", target, "--delay", (scriptRun.delay || 0))
        }
        await ns.sleep(timeToWait)
    }
}

/**
 * applies delays to script run specs to make them finish in the order that they are in in the array
 * 
 * used to make items in a batch finish in the correct order despite different runtimes for action types
 * @param scriptsToRun 
 * @returns modified array of script run specs with delays included
 */
function applyDelaysForBatch(scriptsToRun: ScriptRunSpec[]): ScriptRunSpec[] {
    // shallow copy the script run specs to avoid modifying passed-in reference
    let delayedScripts = scriptsToRun.map((scriptRun) => {return {...scriptRun}});

    // for now, do it the naive way
    const [hack, weakenForHack, grow, weakenForGrow] = delayedScripts;

    // generally, the real order of these will be: weakenForHack, weakenForGrow, grow, hack
    // this is because the time to complete actions is: weaken > grow > hack
    // so even though weakens need to end after the other actions, they need to start first
    
    // delay the hack such that it finishes 100ms before its weaken goes off
    hack.delay = weakenForHack.runtime - hack.runtime - DelayBetweenSteps;
    // delay the grow such that it finishes 100ms after the hack weaken goes off
    grow.delay = weakenForHack.runtime - grow.runtime + DelayBetweenSteps;
    // delay the grow weaken such that it finishes 100ms after the grow goes off
    weakenForGrow.delay = grow.delay + grow.runtime - weakenForGrow.runtime + DelayBetweenSteps * 2

    return delayedScripts;
}


export async function prepareServerForBatching(ns: NS, target: string, cores: number) {
    while(true) {
        const host = ns.getServer(ns.getHostname());
        const player = ns.getPlayer();
        const server = ns.getServer(target);
        const hackDifficulty = server?.hackDifficulty || 0;
        const minDifficulty = server?.minDifficulty || 0;
        const moneyAvailable = server?.moneyAvailable || 0;
        const moneyMax = server?.moneyMax || 0;
        let threadsToUse = 1;
        let scriptToRun = ActionScriptsDirectory;
        let timeToWait = 1000;

        if(serverIsReadyForBatches(server)) {
            // if we're ready to start batching, stop this loop
            break;
        }

        if (!server.hasAdminRights) {
            scriptToRun += "init.js";
        } else if (hackDifficulty > (server?.minDifficulty || 100)) {
            let amountToReduce = hackDifficulty - minDifficulty;
            let reductionPerCall = .05;
            threadsToUse = Math.ceil(amountToReduce / reductionPerCall);

            timeToWait = ns.getWeakenTime(target) + 200;
            scriptToRun += "weaken.js";
        } else if (moneyAvailable < moneyMax) {
            threadsToUse = getGrowthThreads(ns, server, player, cores)
            timeToWait = ns.getGrowTime(target) + 200;
            scriptToRun += "grow.js";
        }

        threadsToUse = Math.min(getMaxThreads(ns, scriptToRun, host.maxRam - host.ramUsed), threadsToUse);

        ns.run(scriptToRun, {threads: threadsToUse}, "--target", target);
        await ns.sleep(timeToWait);
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