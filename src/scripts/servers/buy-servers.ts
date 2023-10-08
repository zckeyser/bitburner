import { NS } from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  // take target ram as argument
  const ram = Number(ns.args[0]);

  ns.print(`Server cost: \$${ns.getPurchasedServerCost(ram)}`);

  for(let i = ns.getPurchasedServers().length; i < ns.getPurchasedServerLimit();) {
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
      let hostname = ns.purchaseServer(`pserv-${i}`, ram);
      // run bootstrap from home to copy relevant files
      ns.run("scripts/servers/bootstrap-server.js", {threads: 1}, hostname);
      // kick off batchers on server
      // TODO: make start-batchers smarter so it can run on a low ram machine
      if(ram > 1024) {
        ns.exec("scripts/hack/midgame/start-batchers.js", hostname);
      } else {
        ns.exec("scripts/hack/midgame/proto-batcher.js", hostname, {threads: 1}, "--target", "foodnstuff");
      }
      i++;
    }

    await ns.sleep(1000);
  }
}
