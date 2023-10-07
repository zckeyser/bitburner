/** @param {NS} ns */
export async function main(ns) {
  // take target ram as argument
  const ram = parseInt(ns.args[0]);

  let existingServers = ns.getPurchasedServers();

  existingServers.forEach(async (serverName) => {
    while (true) {
      if (await ns.getServerMaxRam(serverName) >= ram) {
        break;
      }
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        ns.print(`Upgrading server ${serverName} to ${ram}GB RAM`)
        let upgradeWorked = ns.upgradePurchasedServer(serverName, ram);
        break;
      }

      // Make the script wait for 3 seconds before looping again.
      // Removing this line will cause an infinite loop and crash the game.
      await ns.sleep(3000);
    }
  });
}/** @param {NS} ns */
