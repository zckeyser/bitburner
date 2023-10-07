/** @param {NS} ns */
export async function main(ns) {
  // let serverName = ns.args[0];
  // ns.deleteServer(serverName);
  let servers = ns.getPurchasedServers();
  
  ns.write("server_list.txt", JSON.stringify(servers));

  for(var i = 0; i < servers.length; i++) {
    let serverName = servers[i];
    console.log("Deleting server " + serverName);

    await ns.killall(serverName);
    await ns.deleteServer(serverName);
  }

  while(true) { await ns.sleep(10000); }
}