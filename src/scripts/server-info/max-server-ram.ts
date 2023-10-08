import { NS } from 'Bitburner'

/** @param ns */
export async function main(ns: NS) {
  let serverRam = 2048;
  let serverCost = 10;

  for(;; serverRam++) {
    let newCost = await ns.getPurchasedServerCost(serverRam);
    if(!newCost || Number.isNaN(newCost) || newCost == Infinity) {
      break;
    }
    serverCost = newCost;
    await ns.sleep(100);
  }

  ns.write("max_server.txt", `${serverRam - 1}|${serverCost}`);
}