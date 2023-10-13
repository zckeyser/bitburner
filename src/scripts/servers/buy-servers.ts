import { NS } from "Bitburner";

const DesiredRamPerProtoBatcher = 128;
const MinProtoBatchers = 1;

/** @param ns */
export async function main(ns: NS) {
  // take target ram as argument
  const ram = Number(ns.args[0]);

  ns.print(`Server cost: \$${ns.getPurchasedServerCost(ram)}`);

  for(let i = ns.getPurchasedServers().length; i < ns.getPurchasedServerLimit();) {
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer(`batch-serv-${i}`, ram);
      // run bootstrap from home to copy relevant files
      ns.run("scripts/servers/bootstrap-server.js", {threads: 1}, hostname);
      // kick off batchers on server
      let numBatchers = Math.max(MinProtoBatchers, Math.floor(ram / DesiredRamPerProtoBatcher));
      ns.exec("scripts/hack/midgame/start-proto-batchers.js", hostname, {threads: 1}, "--max", numBatchers);
      i++;
    }

    await ns.sleep(1000);
  }
}
