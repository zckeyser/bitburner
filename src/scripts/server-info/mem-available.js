/** @param {NS} ns */
export async function main(ns) {
  let host = ns.getHostname();
  let memUsed = ns.getServerUsedRam(host)
  let maxMem = ns.getServerMaxRam(host);
  let memAvailable = maxMem - memUsed 
  ns.alert(`${memAvailable}GB available of ${maxMem}GB max, which is ${Math.floor((memAvailable / maxMem) * 100)}%`);
}