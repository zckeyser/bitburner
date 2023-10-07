/** @param {NS} ns **/
export async function main(ns) {
    let serversFound = scanNetworkForHackingContracts(ns);
    ns.alert("Contracts are available on: " + JSON.stringify(serversFound));
}


/**
 * Scan the network of a given device, returning a list of server hostnames that contain .cct files.
 * @param ns {NS} - BitBurner API
 * @param device {string} - Device network that will be scanned
 * @param maxDepth - Depth to scan to
 * @returns string[] - A list of servers in the network containing .cct files
 */
export function scanNetworkForHackingContracts(ns, device = ns.getHostname(), maxDepth = Infinity) {
    let discovered = [device];
    /**
     * @type {string[]}
     */
    let serversWithContracts = [];
    function scan (device, depth = 1) {
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