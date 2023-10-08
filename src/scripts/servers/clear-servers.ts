import { NS } from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  let servers = ns.getPurchasedServers();

  for(var i = 0; i < servers.length; i++) {
    let serverName = servers[i];
    console.log("Deleting server " + serverName);

    ns.killall(serverName);
    ns.deleteServer(serverName);
  }

  while(true) { await ns.sleep(10000); }
}