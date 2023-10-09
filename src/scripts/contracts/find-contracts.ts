import {NS} from "Bitburner";

/** @param ns **/
export async function main(ns: NS) {
    let serversFound = scanNetworkForHackingContracts(ns);
    ns.tprint("Contracts are available on: " + JSON.stringify(serversFound));
    ns.write("data/contracts.js", `${JSON.stringify(serversFound)};`);
}

/**
 * Scan the network of a given device, returning a list of server hostnames that contain .cct files.
 * @param ns BitBurner API
 * @param device Device network that will be scanned
 * @param maxDepth Depth to scan to
 * @returns A list of servers in the network containing .cct files
 */
export function scanNetworkForHackingContracts(ns: NS, device: string = ns.getHostname(), maxDepth: number = Infinity): string[] {
    let discovered = [device];
    /**
     * @type {string[]}
     */
    let serversWithContracts: string[] = [];
    function scan (device: string, depth: number = 1) {
        if(depth > maxDepth) return {};	
        const localTargets = ns.scan(device).filter(newDevice => !discovered.includes(newDevice));
        const localServersWithContracts = localTargets.filter(d => ns.ls(d, ".cct").length > 0);
        serversWithContracts = serversWithContracts.concat(localServersWithContracts);
        discovered = [...discovered, ...localTargets];
        return localTargets.reduce((acc, device) => ({...acc, [device]: scan(device, depth + 1)}), {});
    }
    const network = scan(device);
    return serversWithContracts;
}