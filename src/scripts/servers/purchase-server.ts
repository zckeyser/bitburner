import { NS } from "Bitburner";
import { bootstrapServer } from "scripts/servers/bootstrap-server";
import { formatNumber } from "/lib/Helpers";

/** @param ns */
export async function main(ns: NS) {
  let serverName = String(ns.args[0]);
  let serverRam = Number(ns.args[1]);

  if(ns.getPurchasedServers().filter(s => s == serverName).length > 0) {
    ns.tprint(`Server ${serverName} already exists`.yellow());
    return;
  }

  if(ns.getPurchasedServerCost(serverRam) > ns.getServerMoneyAvailable("home")) {
    ns.tprint(`Not enough money to buy server with ${serverRam}GB of RAM. $${formatNumber(ns.getPurchasedServerCost(serverRam))} required.`.yellow());
    return;
  } else {
    ns.tprint(`Purchasing server ${serverName} with ${serverRam}GB of RAM`);
    const hostname = ns.purchaseServer(serverName, serverRam);
    bootstrapServer(ns, hostname);
  }
}