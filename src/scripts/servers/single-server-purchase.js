/** @param {NS} ns */
export async function main(ns) {
  let serverName = ns.args[0];
  let serverRam = ns.args[1];

  ns.purchaseServer(serverName, serverRam);
}