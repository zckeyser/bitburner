import { NS, Player, Server } from 'Bitburner';
import { scanNetwork } from 'lib/servers/scan-servers';
import { getHackablePorts } from 'lib/ports';
import { TermLogger } from 'lib/Helpers';
import { getExpectedServerEarnings } from 'lib/servers/optimized-servers';
import { bootstrapServer } from 'scripts/servers/bootstrap-server';
import { DefaultRequiredBatchRam, InitScriptLocation } from '/lib/Constants';
import { range } from 'lib/Helpers';

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
  await ns.sleep(3000);
  
  const serversByMaxEarning = hackableServers
    .filter((server) => (server.moneyMax || 0) > 0)
    .sort((a, b) => (serverValueFunction(ns, a, player) - serverValueFunction(ns, b, player)))
    .reverse();
  
  logServerValues(ns, serversByMaxEarning, player, serverValueFunction);
  
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
    const hostRam = ns.getServerMaxRam(hostname);
    const hostBatchCount = Math.max(1, Math.floor(hostRam / DefaultRequiredBatchRam));
    
    const servers = range(hostBatchCount, batcherCount).map(i => serversByMaxEarning[i % serversByMaxEarning.length]);
    const countedServers = new Map();
    for(const server of servers) {
      if(countedServers.has(server)) {
        countedServers.set(server, countedServers.get(server) + 1);
      } else {
        countedServers.set(server, 1);
      }
    }
    
    ns.print(`Starting ${hostBatchCount} batchers on host ${hostname}, which has ${hostRam}GB of RAM`);
    for(const entry of countedServers.entries()) {
      const server: Server = entry[0];
      const numBatchersToRun: number = entry[1];
      const runningBatcherProcesses = ns.ps(hostname).filter(process => process.filename.includes(BatcherPath) && process.args.includes(server.hostname));

      if(runningBatcherProcesses.length < numBatchersToRun) {
        ns.print(`Bootstrapping ${hostname}`);
        bootstrapServer(ns, hostname);
        const numBatchersToStart = numBatchersToRun - runningBatcherProcesses.length;
        for(let i = 0; i < numBatchersToStart; i++) {
          ns.print(`Running batcher on ${hostname} against ${server.hostname}`);
          ns.exec(BatcherPath, hostname, { threads: 1 }, "--target", server.hostname);
        }
      } else {
        ns.print(`Found running batcher processes for ${server.hostname}: ${JSON.stringify(runningBatcherProcesses)}, skipping`)
      }
    }
    batcherCount += hostBatchCount;
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

function logServerValues(ns: NS, servers: Server[], player: Player, serverValueFunction: (ns: NS, s: Server, p: Player) => number) {
  const serversByMaxEarning = servers.map(s => {
    return {
      'hostname': s.hostname,
      'valuePerSecond': serverValueFunction(ns, s, player)
    }
  })
  .sort((server) => server.valuePerSecond)
  .reverse();

  const serverValueFile = 'data/serverValues.txt';
  if(ns.fileExists(serverValueFile)) {
    ns.rm(serverValueFile);
  }

  ns.print(`Logging server values to ${serverValueFile}`);
  ns.write(serverValueFile, JSON.stringify(serversByMaxEarning, undefined, 4));
}
