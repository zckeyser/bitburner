/* script to run a given script on all purchased servers with the given arguments */

/** @param {NS} ns */
export async function main(ns) {
  let availableServers = ns.getPurchasedServers();

  availableServers.forEach((serverName) => {
    ns.killall(serverName, false);
    ns.exec("scripts/servers/bootstrap-server.js", "home", {threads: 1}, serverName);
    ns.exec("scripts/hack/midgame/start-batchers.js", serverName, {threads: 1});
  });
}
