import {scanNetwork} from '/lib/servers/scan-servers';

const MinMoneyThreshold = 10000000;
const MaxMoneyThreshold = 1000000000;

const ProtoBatcherPath = "scripts/hack/midgame/proto-batcher.js"

/** @param {NS} ns */
export async function main(ns) {
  let servers = scanNetwork(ns)[0];

  while(true) {
    // clear the server to start off new batchers
    ns.killall();
    // .01% of money or 10,000,0000 for minimum or 100,000,000,000 for maximum
    let moneyThreshold = Math.max(.01 * ns.getServerMoneyAvailable("home"), MinMoneyThreshold);
    moneyThreshold = Math.min(moneyThreshold, MaxMoneyThreshold)

    servers.forEach((serverHostname) => {
      let serverMaxMoney = ns.getServerMaxMoney(serverHostname);
      
      if(serverMaxMoney > moneyThreshold) {
        ns.print(`Running a batcher against ${serverHostname}`);
        ns.run(ProtoBatcherPath, {threads: 1}, "--target", serverHostname);
      } else {
        ns.print(`Skipping hack against ${serverHostname}
        because its max money of \$${serverMaxMoney.toLocaleString(undefined, {minimumFractionDigits: 2})}
        does not meet the threshold of \$${moneyThreshold.toLocaleString(undefined, {minimumFractionDigits: 2})}`)
        return;
      }
    });

    // cycle the script w/new hacking level once an hour
    await ns.sleep(1000 * 60 * 60);
  }
}
