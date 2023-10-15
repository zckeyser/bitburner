import { NS } from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  // take target ram as argument
  const ram = Number(ns.args[0]);

  for(let i = 0; i < ns.getPurchasedServers().length;) {
    const existingServers = ns.getPurchasedServers().filter(serverName => !serverName.startsWith(`util`));
    const serverName = existingServers[i];
    const server = ns.getServer(serverName);

    if(server.maxRam >= ram) {
      i++;
    } else if(ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerUpgradeCost(serverName, ram)) {
      ns.upgradePurchasedServer(serverName, ram);
      i++;
    }

    await ns.sleep(3000);
  }
}
