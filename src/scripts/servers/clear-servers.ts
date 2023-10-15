import { NS } from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  let servers: string[] = []
  if(ns.args.length > 0) {
    let pattern = new RegExp(String(ns.args[0]));

    servers = ns.getPurchasedServers();
    ns.print(servers);
    servers = servers.filter(s => pattern.test(s));
  } else {
    servers = ns.getPurchasedServers();
  }
  for(var i = 0; i < servers.length; i++) {
    let serverName = servers[i];
    console.log("Deleting server " + serverName);

    ns.killall(serverName);
    ns.deleteServer(serverName);
  }
}