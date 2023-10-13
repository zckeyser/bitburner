import { NS, Player, Server } from 'Bitburner';
import { scanNetwork } from '/lib/servers/scan-servers';
import { getHackablePorts } from 'lib/ports.js';
import { bootstrapServer } from 'scripts/servers/bootstrap-server';


const MinMoneyThreshold = 500000;
// 2048 on home could run up to 290 threads
// approx. ratio is 2048/290 = 7, so ~7GB total per hack thread
// ran into occasional issues with 7, so bumped to 7.2
const DesiredRamPerHackThread = 7.2;

const BatcherPath = "scripts/hack/batcher/batcher.js"

/** @param {NS} ns */
export async function main(ns: NS) {
  const scriptFlags = ns.flags([["home", true]]);
  const useHome = Boolean(scriptFlags.home);
  await startBatchers(ns, useHome);
}

/**
 * 
 * @param ns 
 * @param useHome 
 * @param numServersToTarget 
 */
export async function startBatchers(ns: NS, useHome: boolean) {
  const serverNames = scanNetwork(ns)[0];
  const servers = serverNames.map(ns.getServer);
  const hostToTargetServer = new Map();
  let batcherCount = 0;

  const player = ns.getPlayer();

  while (true) {
    const serversByMaxEarning = servers.sort((a, b) => (getServerMaxMoneyToSecurityRatio(a) - getServerMaxMoneyToSecurityRatio(b)))
      .filter((server) => (server.moneyMax || 0) > MinMoneyThreshold)
      .filter((server) => isHackable(ns, server, player))
      .reverse();
    const hosts = useHome ? ["home", ...ns.getPurchasedServers()] : ns.getPurchasedServers();

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
      if(!runningBatcherProcess) {
        ns.print(`Bootstrapping ${hostname}`);
        bootstrapServer(ns, hostname);
        ns.print(`Running a batcher against ${server.hostname} from ${hostname}`);
        const hackThreads = Math.floor(ns.getServerMaxRam(hostname) / DesiredRamPerHackThread);
        ns.exec(BatcherPath, hostname, { threads: 1 }, "--target", server.hostname, "--hackThreads", hackThreads);
        batcherCount++;
      }
    }

    // wait 10 minutes and check for servers w/o batchers again
    await ns.sleep(10 * 60 * 1000);
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
