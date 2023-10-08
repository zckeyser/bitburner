import { NS } from "Bitburner";

/**
 * Kick off batchers on all purchased servers 
 * @param ns
 */
export async function main(ns: NS) {
  let availableServers = ns.getPurchasedServers();

  availableServers.forEach((serverName) => {
    ns.killall(serverName, false);
    ns.exec("scripts/servers/bootstrap-server.js", "home", {threads: 1}, serverName);
    ns.exec("scripts/hack/midgame/start-batchers.js", serverName, {threads: 1});
  });
}
