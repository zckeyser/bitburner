import { NS, Player, Server } from 'Bitburner';
import { scanNetwork } from '/lib/servers/scan-servers';
import { getHackablePorts } from 'lib/ports.js';
import { bootstrapServer } from 'scripts/servers/bootstrap-server';
import { TermLogger } from '/lib/Helpers';
import { getExpectedServerEarnings } from '/lib/servers/optimized-servers';

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
    hosts.forEach(s => ns.ps(s).filter(p => p.filename.includes(BatcherPath)).forEach(p => ns.kill(p.pid)));
  }

  const serverNames = scanNetwork(ns)[0];
  const servers = serverNames.map(ns.getServer);
  const serverValueFunction = ns.fileExists("Formulas.exe") ? getExpectedServerEarnings : (ns: NS, s: Server, p: Player) => getServerMaxMoneyToSecurityRatio(s);
  ns.print(`Server List: ${serverNames}`);

  const serversByMaxEarning = servers.sort((a, b) => (serverValueFunction(ns, a, player) - serverValueFunction(ns, b, player)))
    .filter((server) => (server.moneyMax || 0) > 0)
    .reverse();
  ns.print(`Sorted server list: ${serversByMaxEarning.map(s => s.hostname)}`);
  const hackableServers = serversByMaxEarning.filter((server) => isHackable(ns, server, player));
  if(hackableServers.length === 0) {
    // foodnstuff is always hackable, requires 0 ports and 1 hacking skill
    // idk why the array ends up empty sometimes
    hackableServers.push(ns.getServer("foodnstuff"));
  }
  ns.print(`Hackable servers: ${hackableServers.map(s => s.hostname)}`);
  // grab purchased servers with "batch" prefixes, which denote they're to be used for batching
  const batchServers = ns.getPurchasedServers().filter(s => s.startsWith("batch"));
  const hosts = (useHome ? ["home", ...batchServers] : batchServers).filter(host => ns.getServerMaxRam(host) >= 1024);

  if(hosts.length == 0) {
    logger.warn("No batch hosts with enough RAM to run a batcher, exiting start-batchers.js");
    return;
  }

  for (const hostname of hosts) {
    const server = hackableServers[batcherCount % hackableServers.length];
    const runningBatcherProcess = ns.ps(hostname).filter(process => process.filename.includes(BatcherPath));
    ns.print(runningBatcherProcess.length);
    if(runningBatcherProcess.length === 0 || runningBatcherProcess[0].args[1] !== server.hostname) {
      ns.print(`Bootstrapping ${hostname}`);
      bootstrapServer(ns, hostname);
      ns.print(`Clearing existing batchers against other hosts`);
      runningBatcherProcess.forEach(p => ns.kill(p.pid));
      ns.print(`Running batcher on ${hostname} against ${server.hostname}`);
      ns.exec(BatcherPath, hostname, { threads: 1 }, "--target", server.hostname);
      batcherCount++;
    } else {
      ns.print(`Found running batcher process: ${JSON.stringify(runningBatcherProcess)}, skipping`)
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
