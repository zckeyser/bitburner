/** @param {NS} ns */
export async function main(ns) {
  let serverRam = 2048;
  let serverCost = 10;

  for(;; serverRam++) {
    let newCost = await ns.getPurchasedServerCost(serverRam);
    if(!newCost || newCost == NaN || newCost == Infinity) {
      break;
    }
    await ns.sleep(100);
  }

  ns.write("max_server.txt", `${serverRam - 1}|${serverCost}`);
}