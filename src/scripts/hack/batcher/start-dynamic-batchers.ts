import { NS, Player, Server } from 'Bitburner';
import { getBatch, getBatchSize } from '/lib/batch';
import { ActionScriptRamUsage, DefaultRequiredBatchRam, InitScriptLocation, MinBatcherRam } from '/lib/Constants';
import { getMaxRequiredHackThreads } from '/lib/hacking'
import { TermLogger, range } from 'lib/Helpers';
import { getHackablePorts } from 'lib/ports';
import { getExpectedServerEarnings } from 'lib/servers/optimized-servers';
import { scanNetwork } from 'lib/servers/scan-servers';
import { bootstrapServer } from 'scripts/servers/bootstrap-server';

const BatcherPath = "scripts/hack/batcher/batcher.js"

/** @param {NS} ns */
export async function main(ns: NS) {
  const scriptFlags = ns.flags([["home", true], ["fresh", false]]);
  const useHome = Boolean(scriptFlags.home);
  const startFresh = Boolean(scriptFlags.fresh);
  await startBatchers(ns, useHome, startFresh);
}

/**
 * 
 * @param ns 
 * @param useHome 
 * @param startFresh if true, kills all running batcher scripts on batch hosts before starting the cycle
 */
export async function startBatchers(ns: NS, useHome: boolean, startFresh: boolean) {
  ns.disableLog("scp");
  ns.disableLog("sleep");
  const logger = new TermLogger(ns);

  let batcherCount = 0;

  const player = ns.getPlayer();

  // if startFresh is set, kill all processes on batching servers before starting to launch more
  if(startFresh) {
    // grab purchased servers with "batch" prefixes, which denote they're to be used for batching
    const batchServers = ns.getPurchasedServers().filter(s => s.startsWith("batch"));
    const hosts = useHome ? ["home", ...batchServers] : batchServers;
    // kill all batcher processes on each host
    hosts.forEach((h => ns.killall(h)));
  }

  const serverNames = scanNetwork(ns)[0];
  const servers = serverNames.map(ns.getServer);
  const serverValueFunction = ns.fileExists("Formulas.exe") ? getExpectedServerEarnings : (ns: NS, s: Server, p: Player) => getServerMaxMoneyToSecurityRatio(s);

  const hackableServers = servers.filter((server) => isHackable(ns, server, player));
  // if we don't nuke the servers first, it breaks the value function because ns.formulas.hacking.hackChance will be 0
  hackableServers.forEach(s => {
    if(!s.hasAdminRights) {
      ns.print(`Nuking server ${s.hostname}`);
      ns.run(InitScriptLocation, {threads: 1}, "--target", s.hostname);
    } else {
      ns.print(`Server ${s.hostname} is already nuked`);
    }
  });
  // briefly sleep to let inits kick in
  // NOTE: THIS IS WHERE IT'S PAUSING
  await ns.sleep(1500);
  
  const serversByMaxEarning = hackableServers
    .filter((server) => (server.moneyMax || 0) > 0)
    .sort((a, b) => (serverValueFunction(ns, a, player) - serverValueFunction(ns, b, player)))
    .reverse();
  
  if(serversByMaxEarning.length === 0) {
    ns.print(`Ended up with no hackable servers, wtf`.yellow());
    // foodnstuff is always hackable, requires 0 ports and 1 hacking skill
    // idk why the array ends up empty sometimes
    serversByMaxEarning.push(ns.getServer("foodnstuff"));
  }
  ns.print(`Hackable servers: ${serversByMaxEarning.map(s => s.hostname)}`);
  // grab purchased servers with "batch" prefixes, which denote they're to be used for batching
  const batchServers = ns.getPurchasedServers().filter(s => s.startsWith("batch"));
  const hosts = (useHome ? ["home", ...batchServers] : batchServers);

  if(hosts.length == 0) {
    logger.warn("No batch hosts with enough RAM to run a batcher, exiting start-batchers.js");
    return;
  }

  for (const hostname of hosts) {
    const host = ns.getServer(hostname);
    let availableRam = host.maxRam - host.ramUsed;

    const serversToHack = new Map();
    while(availableRam > MinBatcherRam && batcherCount < serversByMaxEarning.length) {
      const server = serversByMaxEarning[batcherCount];

      const maxUsableThreads = Math.floor(availableRam / ActionScriptRamUsage);
      const desiredHackThreads = getMaxRequiredHackThreads(ns, server, player);
      ns.print(`Desired hack threads for ${server.hostname}: ${desiredHackThreads}`);
      const batchSize = getBatchSize(ns, host, server, player, desiredHackThreads);
      const maxBatchThreads = Math.min(batchSize, maxUsableThreads);
      const batchUsedRam = maxBatchThreads * ActionScriptRamUsage;

      serversToHack.set(server, maxBatchThreads);

      availableRam -= batchUsedRam;
      batcherCount++;
    }

    bootstrapServer(ns, host.hostname);
    
    ns.print(`Starting ${serversToHack.size} batchers on host ${hostname}, which has ${host.maxRam}GB of RAM`);
    for(const entry of serversToHack.entries()) {
      const server: Server = entry[0];
      const maxBatchThreads: number = entry[1];
      const runningBatcherProcesses = ns.ps(hostname).filter(process => process.filename.includes(BatcherPath) && process.args.includes(server.hostname));
      runningBatcherProcesses.forEach(process => ns.kill(process.pid));
      ns.exec(BatcherPath, host.hostname, {threads: 1}, "--target", server.hostname, "--maxThreads", maxBatchThreads)
    }
  }
}

function isHackable(ns: NS, server: Server, player: Player) {
  const canHackEnoughPorts = getHackablePorts(ns) > (server.numOpenPortsRequired || 0);
  const hasHighEnoughHackingSkill = player.skills.hacking > (server.requiredHackingSkill || 0);
  return canHackEnoughPorts && hasHighEnoughHackingSkill;
}

function getServerMaxMoneyToSecurityRatio(server: Server) {
  return (server.moneyMax || 0) / (server?.minDifficulty || 1);
}
