import { NS } from "Bitburner";
import { TermLogger } from "/lib/Helpers";
import { getGrowthThreads, getGrowthPercent } from 'lib/growth.js';
import { getHackablePorts } from 'lib/ports.js';
import { ActionScriptsDirectory } from "/lib/Constants";

const RetryMaxAttempts = 300;
const RetryIntervalBaseSeconds = 1;
const MaxRetryBackoffExponent = 6;

/** @param ns */
export async function main(ns: NS) {
  const scriptFlags = ns.flags([["target", ""]]);
  const target = String(scriptFlags.target);
  if (!target) {
    throw new Error(`proto-batcher.js requires a target argument via the --target flag, e.g. 'run proto-batcher.js --target foodnstuff'`)
  }
  const currentHost = ns.getHostname();
  const cores = ns.getServer(currentHost).cpuCores;
  let isHackable = false;
  let ramCap = ns.getServerMaxRam(currentHost);
  let retries = 0;

  if (currentHost === "home" && ramCap >= 128) {
    // save a bit of home ram so we can run spare scripts
    // but only if we have ram to spare
    ramCap -= 15;
    if(ramCap >= 1024) {
      // save a decent chunk of ram (75GB) if we've got a big home server
      ramCap -= 60
    }
  }

  while (true) {
    let timeToWait = 1000;
    let threadsToUse = 1;
    // all scripts run from this will be in this directory, so add that as a baseline
    let scriptToRun = ActionScriptsDirectory;
    let server = ns.getServer(target);
    let player = ns.getPlayer();
    let availableRam = ramCap - ns.getServerUsedRam(currentHost);

    if(!server.requiredHackingSkill || (!server.numOpenPortsRequired && server.numOpenPortsRequired !== 0) || !server.hackDifficulty || !server.minDifficulty || (!server.moneyAvailable && server.moneyAvailable !== 0) || !server.moneyMax ) {
      if(retries > RetryMaxAttempts) {
        ns.print(`Max retries of ${RetryMaxAttempts} reached, throwing error`);
        throw Error(`Server missing required characteristic: ${JSON.stringify(server)}`);
      } else {
        retries++;
        
        const valuesOfRequiredFields = {
          requiredHackingSkill: server.requiredHackingSkill,
          numOpenPortsRequired: server.numOpenPortsRequired,
          hackDifficulty: server.hackDifficulty,
          minDifficulty: server.minDifficulty,
          moneyAvailable: server.moneyAvailable,
          moneyMax: server.moneyMax
        }

        // exponential backoff, max out at ~1m retry backoff
        const backoffTime = RetryIntervalBaseSeconds * 1000 * Math.pow(2, Math.min(retries, MaxRetryBackoffExponent));
        ns.print(`Failed to find expected fields on server object ${JSON.stringify(server)}. Retrying after ${(backoffTime/1000).toLocaleString(undefined, {maximumFractionDigits: 2})}s. The expected fields and their values are: ${JSON.stringify(valuesOfRequiredFields)}`);
        await ns.sleep(backoffTime);
        continue;
      }
    }

    if (!isHackable) {
      // if this server hasn't been marked as hackable
      // check if it is now
      let portsHackable = getHackablePorts(ns);
      isHackable = server.requiredHackingSkill <= player.skills.hacking && server.numOpenPortsRequired <= portsHackable;

      // if the server still isn't hackable, wait 5 mins and check again
      if (!isHackable) {
        ns.print(`Waiting to attempt to hack ${target} because the server is not hackable.
        one of the following conditions is causing this:
        hackingSkill: ${server.requiredHackingSkill} req > ${player.skills.hacking} actual
        portsRequired: ${server.numOpenPortsRequired} req > ${portsHackable} actual`);
        await ns.sleep(300 * 1000);
        continue;
      }
    }

    if (!server.hasAdminRights) {
      scriptToRun += "init.js";
    } else if (server.hackDifficulty > server.minDifficulty) {
      let amountToReduce = server.hackDifficulty - server.minDifficulty;
      let reductionPerCall = .05;
      threadsToUse = Math.ceil(amountToReduce / reductionPerCall);

      timeToWait = ns.getWeakenTime(target) + 200;
      scriptToRun += "weaken.js";
    } else if (server.moneyAvailable < server.moneyMax) {
      threadsToUse = getGrowthThreads(ns, server, player, cores)
      timeToWait = ns.getGrowTime(target) + 200;
      scriptToRun += "grow.js";
    } else {
      // this'll get ceil'd to the max available threads before running
      threadsToUse = 99999;
      timeToWait = ns.getHackTime(target) + 200;
      scriptToRun += "hack.js";
    }

    // only use as many threads as server can handle

    let scriptRam = ns.getScriptRam(scriptToRun);
    let maxThreads = Math.floor(availableRam / scriptRam);
    ns.print(`Comparing available ${availableRam}GB to scriptRam ${scriptRam}GB for script ${scriptToRun}, got ${maxThreads} max threads`);
    threadsToUse = Math.min(maxThreads, threadsToUse);
    threadsToUse = Math.max(threadsToUse, 1);

    if (maxThreads < 1) {
      ns.print(`Not enough RAM available to run any threads for ${scriptToRun}. Waiting for 5m and trying again.`);
      // include 0-20s jitter to avoid swarming calls when these are spawned simultaneously
      // https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
      let jitter = Math.random() * 20000;
      // wait 5m + jitter
      await ns.sleep(300 * 1000 + jitter);
      continue;
    }

    if (scriptToRun.endsWith("grow.js")) {
      let actualGrowthPercent = getGrowthPercent(ns, server, player, threadsToUse, cores);
      let moneyAfterGrow = server.moneyAvailable * actualGrowthPercent;
      let serverMoneyPercentDisplay = ((moneyAfterGrow / server.moneyMax) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
      ns.print(`Growing server ${target} with ${threadsToUse} threads for an expected growth of ${(actualGrowthPercent - 1)}
                after growth, the server will have \$${moneyAfterGrow.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${serverMoneyPercentDisplay}%)`);
    } else if (scriptToRun.endsWith("weaken.js")) {
      let actualWeakenAmount = .05 * threadsToUse;
      let amountAfterWeaken = server.hackDifficulty - actualWeakenAmount;
      let numWeakensLeft = Math.ceil((amountAfterWeaken - server.minDifficulty) / .05);
      ns.print(`Weakening server ${target} with ${threadsToUse} threads for an expected security reduction of ${actualWeakenAmount}
                after weaken, the server will have ${amountAfterWeaken} security (minimum ${server.minDifficulty})
                ${numWeakensLeft} threads worth of weaken are required to reach minimum security`);
    }

    ns.print(`Running ${scriptToRun} for ${(timeToWait / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })}s against target ${target}, which will use ${scriptRam * threadsToUse}GB of RAM`);

    ns.exec(scriptToRun, currentHost, { threads: threadsToUse }, "--target", target);
    await ns.sleep(timeToWait);
  }
}
