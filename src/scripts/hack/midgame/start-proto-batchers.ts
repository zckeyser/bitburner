import { NS, Server } from 'Bitburner';
import { scanNetwork } from '/lib/servers/scan-servers';
import { getHackablePorts } from 'lib/ports.js';


const MinMoneyThreshold = 1000000;
const MaxMoneyThreshold = 1000000000;

const ProtoBatcherPath = "scripts/hack/midgame/proto-batcher.js"

/** @param {NS} ns */
export async function main(ns: NS) {
  const scriptFlags = ns.flags([["max", Infinity]]);
  const maxBatchers = Number(scriptFlags.max);
  const serverNames = scanNetwork(ns)[0];
  const servers = serverNames.map(ns.getServer);
  const serversByMaxEarning = servers.sort((a, b) => (getServerMaxMoneyToSecurityRatio(a) - getServerMaxMoneyToSecurityRatio(b)));

  while (true) {
    let batcherCount = 0;

    // clear the server to start off new batchers
    ns.killall();

    // .01% of money or 1,000,000 for minimum or 100,000,000,000 for maximum
    const moneyThreshold = Math.min(Math.max(.01 * ns.getServerMoneyAvailable("home"), MinMoneyThreshold), MaxMoneyThreshold);
    const player = ns.getPlayer();

    for (const server of serversByMaxEarning) {
      if(batcherCount >= maxBatchers) {
        continue;
      }
      const hasEnoughMoney = (server?.moneyMax || 0) > moneyThreshold;
      const canHackEnoughPorts = getHackablePorts(ns) > (server.numOpenPortsRequired || 0);
      const hasHighEnoughHackingSkill = player.skills.hacking > (server.requiredHackingSkill || 0);
      const canHack = canHackEnoughPorts && hasHighEnoughHackingSkill;
      if (hasEnoughMoney && canHack) {
        ns.print(`Running a batcher against ${server.hostname}`);
        ns.run(ProtoBatcherPath, { threads: 1 }, "--target", server.hostname);
        batcherCount++;
      } else {
        ns.print(`Skipping hack against ${server.hostname}
        because its max money of \$${server.moneyMax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        does not meet the threshold of \$${moneyThreshold.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        or because it is not yet hackable (canHack: ${canHack})`);
      }
    }

    // cycle the script w/new hacking level once an hour
    await ns.sleep(1000 * 60 * 60);
  }
}

function getServerMaxMoneyToSecurityRatio(server: Server) {
  return (server.moneyMax || 0) / (server?.minDifficulty || 1);
}