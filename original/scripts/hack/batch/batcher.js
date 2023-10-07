import { getGrowthThreads, getGrowthPercent } from 'lib/growth.js';
import { getHackablePorts } from 'lib/ports.js'

const ActionScriptsDirectory = "scripts/hack/actions/"



function runWithOffsets() {
  /**
   * if secLevel > minSecLevel
   *    calc weaken threads
   *    run weaken
   *    set {finishTime, willReachTarget} in runStats object
   * if 
   */

}

/**
 * @typedef {Object} ScriptRunSpec
 * @property {string} script script to run
 * @property {number} threads number of threads to run the script with
 * @property {number} runtime ms the script will run for
 */


/**
 * @typedef {Object} runFinishes
 */

/** @param {NS} ns */
export async function main(ns) {
  const scriptFlags = ns.flags([["target"]]);
  const target = scriptFlags.target;
  if(!target) {
    throw new Error(`proto-batcher.js requires a target argument via the --target flag, e.g. 'run proto-batcher.js --target foodnstuff'`)
  }
  const currentHost = ns.getHostname();
  const cores = ns.getServer(currentHost).cpuCores;
  let isRooted = ns.hasRootAccess(target);
  let isHackable = false;
  let ramCap = ns.getServerMaxRam(currentHost);

  if(currentHost === "home" && ramCap > 256) {
    // save a bit of home ram so we can run spare scripts
    // but only if we have ram to spare
    ramCap -= 30;
  }

  while(true) {
    let timeToWait = 1000;

    /**
     * @type {ScriptRunSpec[]} scriptsToRun
     */
    let scriptsToRun = [];
    let threadsToUse = [1];
    let server = ns.getServer(target);
    let player = ns.getPlayer();
    let availableRam = ramCap - ns.getServerUsedRam(currentHost);

    if(!isHackable) {
      // if this server hasn't been marked as hackable
      // check if it is now
      let portsHackable = getHackablePorts(ns);
      isHackable = server.requiredHackingSkill <= player.skills.hacking && server.numOpenPortsRequired <= portsHackable;

      // if the server still isn't hackable, wait 5 mins and check again
      if(!isHackable) {
        ns.print(`Waiting to attempt to hack ${target} because the server is not hackable.
        one of the following conditions is causing this:
        hackingSkill: ${server.requiredHackingSkill} req > ${player.skills.hacking} actual
        portsRequired: ${server.numOpenPortsRequired} req > ${portsHackable} actual`);
        await ns.sleep(300 * 1000);
        continue;
      }
    }

    if(!isRooted) {
      scriptsToRun.push({
        script: `${ActionScriptsDirectory}init.js`,
        threads: 1,
        runtime: 1000
      });
      isRooted = true;
    } else if(server.hackDifficulty > server.minDifficulty) {
      let amountToReduce = server.hackDifficulty - server.minDifficulty;
      let reductionPerCall = .05;
      scriptsToRun.push({
        script: `${ActionScriptsDirectory}weaken.js`,
        threads: Math.ceil(amountToReduce / reductionPerCall),
        runtime: ns.getWeakenTime(target)
        
      });
      
    } else if(server.moneyAvailable < server.moneyMax) {
      // grow as much as we can w/o going over max, 
      // but offset with weaken calls which finish just afterwards to immediately cancel out the security increase
      /**
       * @type {ScriptRunSpec} growScriptRunSpec
       */
      let growScriptRunSpec = {
        script: `${ActionScriptsDirectory}grow.js`,
        threads: getGrowthThreads(ns, server, player, cores),
        runtime: ns.getGrowTime(target)
      };
      // TODO: abstract this to avoid it being done in two places
      let scriptRam = ns.getScriptRam(growScriptRunSpec.script);
      let maxThreads = Math.floor(availableRam / scriptRam);
      growScriptRunSpec.threads = Math.min(maxThreads, threadsToUse);
      

      let weakenThreadsRequiredForOffset = 0;
      // refine how many threads we can optimize for by iterating on how many sec threads we need
      for(let i = 0; i < 10; i++) {
        let secIncrease = ns.growthAnalyzeSecurity(growScriptRunSpec.threads, target, cores);
        weakenThreadsRequiredForOffset = Math.ceil(secIncrease / .05) - weakenThreadsRequiredForOffset;
        growScriptRunSpec.threads -= weakenThreadsRequiredForOffset;
      }

      scriptsToRun.push({
        script: `${ActionScriptsDirectory}weaken.js`,
        threads: weakenThreadsRequiredForOffset,
        runtime: ns.getWeakenTime(target)
      });
      
      
    } else {
      // this'll get ceil'd to the max available threads before running
      threads = 99999;
      runtime = ns.getHackTime(target) + 200;
      script += `${ActionScriptsDirectory}hack.js`;
    }

    ns.tprint(`Scripts before adjustment: ${JSON.stringify(scriptsToRun)}`);
    adjustForAvailableRam(ns, scriptsToRun, availableRam);
    ns.tprint(`Scripts after adjustment: ${JSON.stringify(scriptsToRun)}`);

    let totalThreads = scriptsToRun.reduce((acc, next) => acc + next.threads, 0)

    if(totalThreads < 1) {
      ns.print(`Not enough RAM available to run any threads. Waiting for 5m and trying again.`);
      // include 0-20s jitter to avoid swarming calls when these are spawned simultaneously
      // https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
      let jitter = Math.random() * 20000;
      // wait 5m + jitter
      await ns.sleep(300 * 1000 + jitter);
      continue;
    }

    let growScriptList = scriptsToRun.filter((s) => s.script.includes("grow.js"));
    let weakenScriptList = scriptsToRun.filter((s) => s.script.includes("weaken.js"));
    if(growScriptList.length > 0) {
      let actualGrowthPercent = getGrowthPercent(ns, server, player, threadsToUse, cores);
      let moneyAfterGrow = server.moneyAvailable * actualGrowthPercent;
      let serverMoneyPercentDisplay = ((moneyAfterGrow / server.moneyMax) * 100).toLocaleString(undefined, {maximumFractionDigits: 2});
      ns.print(`Growing server ${target} with ${threadsToUse} threads for an expected growth of ${(actualGrowthPercent - 1) }
                after growth, the server will have \$${moneyAfterGrow.toLocaleString(undefined, {maximumFractionDigits: 2})} (${serverMoneyPercentDisplay}%)`);
    } else if (weakenScriptList.length > 0) {
      let actualWeakenAmount = .05 * threadsToUse;
      let amountAfterWeaken = server.hackDifficulty - actualWeakenAmount;
      let numWeakensLeft = Math.ceil((amountAfterWeaken - server.minDifficulty) / .05);
      ns.print(`Weakening server ${target} with ${threadsToUse} threads for an expected security reduction of ${actualWeakenAmount}
                after weaken, the server will have ${amountAfterWeaken} security (minimum ${server.minDifficulty})
                ${numWeakensLeft} threads worth of weaken are required to reach minimum security`);
    }

    // wait for the longest-running script in this batch plus 100ms to account for race conds
    timeToWait = scriptsToRun.reduce((acc, next) => Math.max(acc, next.runtime), 0) + 100;
    scriptsToRun.forEach((scriptRunSpec) => {
      ns.print(`Running ${scriptRunSpec.script}
                for ${(scriptRunSpec.runtime / 1000).toLocaleString(undefined, {maximumFractionDigits: 2})}s
                against target ${target},
                which will use ${ns.getScriptRam(scriptRunSpec.script) * threadsToUse}GB of RAM`);
      ns.run(scriptRunSpec.script, {threads: 1}, target);
    });
    await ns.sleep(timeToWait);
  }
}

/**
 * @param {NS} ns
 * @param {ScriptRunSpec[]} scriptsToRun
 * @param {number} availableRam
 * 
 * @return {void}
 */
function adjustForAvailableRam(ns, scriptsToRun, availableRam) {
  // simple case, just reduce to maxThreads
  if(scriptsToRun.length == 1) {
    scriptsToRun[0].threads = getMaxThreads(ns, scriptsToRun[0].script, availableRam)
  }

  // create a map of script names to ram costs per thread
  let scriptRamCostsPerThread = Object.fromEntries(
    scriptsToRun.map(scriptRunSpec => [scriptRunSpec.script, ns.getScriptRam(scriptRunSpec.script)])
  );

  // scale by threads used per script
  let scriptRamActualCosts = Object.fromEntries(
    scriptsToRun.map(scriptRunSpec => [scriptRunSpec.script, scriptRamCostsPerThread * scriptRunSpec.threads])
  );

  let totalRamCost = Object.values(scriptRamActualCosts).reduce((acc, next) => acc + next, 0)

  // no need to adjust if we aren't going over max ram
  if(totalRamCost <= availableRam) {
    return;
  }

  // TODO: figure out how to avoid this overadjusting

  // scale from 1..n threads to drop each script, based on the assumption of dropping the smallest script 1 thread and the others proportionally
  let percentOfCostPerScript = Object.fromEntries(
    Object.entries(scriptRamActualCosts).map(([script, scriptCost]) => [script, scriptCost / totalRamCost])
  );
  let minCostPercent = Math.min(...Object.values(percentOfCostPerScript));
  let threadsToReducePerScript = Object.fromEntries(
    Object.entries(percentOfCostPerScript).map(([script, percentOfCost]) => [script, percentOfCost / minCostPercent])
  );

  while(totalRamCost > availableRam) {
    for(let i = 0; i < scriptsToRun.length; i++) {
      let script = scriptsToRun[i].script; 
      scriptsToRun[i].threads -= threadsToReducePerScript[script];
      totalRamCost -= scriptRamCostsPerThread[script] * threadsToReducePerScript[script];
    }
  }
}

/**
 * @param {NS} ns BitBurner API
 * @param {string} script script to run
 * @param {number} availableRam
 * @return {number} the maximum number of threads that can be run to use the script in question. This number could be <0 if there is insufficient RAM.
 */ 
function getMaxThreads(ns, script, availableRam) {
  let scriptRam = ns.getScriptRam(script);
  let maxThreads = Math.floor(availableRam / scriptRam);
  ns.print(`Comparing available ${availableRam}GB to scriptRam ${scriptRam}GB for script ${script}, got ${maxThreads} max threads`);
  return maxThreads;
}

/**
 * Sleep for a time then execute the given function
 * @param {() => any} func function to run after the delay
 * @param {number} delay ms to wait before running the function
 */
export async function runAfterDelay(func, delay) {
  await ns.sleep(delay);
  return await func();
}