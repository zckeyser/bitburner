import {NS} from "Bitburner"

/** @param {NS} ns **/
export async function main(ns: NS) {
  let hostname = ns.getHostname();
  let serversFound = scanNetwork(ns);
  await printArray(ns, serversFound[0]);
  if (ns.fileExists("servers/serverList.js")) {
    ns.mv(hostname, "servers/serverList.js", "servers/backup/serverList.js");
  }
  if(ns.fileExists("servers/serverMap.js")) {
    ns.mv(hostname, "servers/serverMap.js", "servers/backup/serverMap.js");
  }
  await ns.write("servers/serverList.js", `export const ServerList = ${JSON.stringify(serversFound[0], null, 2)};`);
  await ns.write("servers/serverMap.js", `export const ServerMap = ${JSON.stringify(serversFound[1], null, 2)};`);
}


/**
 * Scan the network of a given device.
 * @param ns BitBurner API
 * @param device device network that will be scanned
 * @param maxDepth Depth to scan to
 * @returns {[string[], Object]} - A tuple including an array of discovered devices & a tree of the network
 */
export function scanNetwork(ns: NS, device: string = ns.getHostname(), maxDepth: number = Infinity): [string[], Object] {
  let discovered = [device];
  function scan(device: string, depth: number = 1) {
    if (depth > maxDepth) return {};
    const localTargets = ns.scan(device).filter(newDevice => !discovered.includes(newDevice));
    discovered = [...discovered, ...localTargets];
    return localTargets.reduce((acc, device) => ({ ...acc, [device]: scan(device, depth + 1) }), {});
  }
  const network = scan(device);
  return [discovered.slice(1), network];
}

/**
 * @param ns
 */
async function printArray(ns: NS, serverList: string[]) {
  ns.tprint(serverList.join("|"));
}
