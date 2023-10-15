import { NS, Player, Server } from 'Bitburner';
import { scanNetwork } from '/lib/servers/scan-servers';
import { getHackablePorts } from 'lib/ports.js';
import { bootstrapServer } from 'scripts/servers/bootstrap-server';


const MinMoneyThreshold = 500000;
// 2048 on home could run up to 290 threads
// approx. ratio is 2048/290 = 7, so ~7GB total per hack thread
// ran into occasional issues with 7, so bumped to 7.2
const DesiredRamPerHackThread = 7.2;
const MinutesPerBatchCheckCycle = 1;

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
  const serverNames = scanNetwork(ns)[0];
  const servers = serverNames.map(ns.getServer);
  const hostToTargetServer = new Map();
  let batcherCount = 0;

  const player = ns.getPlayer();

  // if startFresh is set, kill all processes on batching servers before starting to launch more
  if(startFresh) {
    // grab purchased servers with "batch" prefixes, which denote they're to be used for batching
    const batchServers = ns.getPurchasedServers().filter(s => s.startsWith("batch"));
    const hosts = useHome ? ["home", ...batchServers] : batchServers;
    hosts.forEach(s => ns.killall(s));
  }

  while (true) {
    const serversByMaxEarning = servers.sort((a, b) => (getServerMaxMoneyToSecurityRatio(a) - getServerMaxMoneyToSecurityRatio(b)))
      .filter((server) => (server.moneyMax || 0) > 0)
      .filter((server) => isHackable(ns, server, player))
      .reverse();
    // grab purchased servers with "batch" prefixes, which denote they're to be used for batching
    const batchServers = ns.getPurchasedServers().filter(s => s.startsWith("batch"));
    const hosts = useHome ? ["home", ...batchServers] : batchServers;


    for (const hostname of hosts) {
      if(!hostToTargetServer.has(hostname)) {
        const server = serversByMaxEarning[batcherCount % serversByMaxEarning.length];
        hostToTargetServer.set(hostname, server);
        
        // if this is the first time we're running against this server
        // from this instance of start-batchers,
        // kill the existing batcher so we can refresh it
        ns.killall(hostname)
      }

      const server = hostToTargetServer.get(hostname);

      const runningBatcherProcess = ns.ps(hostname).filter(process => process.filename.includes(BatcherPath));
      ns.print(runningBatcherProcess.length);
      if(runningBatcherProcess.length == 0) {
        ns.print(`Bootstrapping ${hostname}`);
        bootstrapServer(ns, hostname);
        ns.print(`Running a batcher against ${server.hostname} from ${hostname}`);
        const hackThreads = Math.floor(ns.getServerMaxRam(hostname) / DesiredRamPerHackThread);
        ns.exec(BatcherPath, hostname, { threads: 1 }, "--target", server.hostname, "--hackThreads", hackThreads);
        batcherCount++;
      } else {
        ns.print(`Found running batcher process: ${JSON.stringify(runningBatcherProcess)}, skipping`)
      }
    }

    // wait a bit then check for servers w/o batchers again
    await ns.sleep(MinutesPerBatchCheckCycle * 60 * 1000);
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
