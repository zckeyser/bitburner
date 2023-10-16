import { NS } from "Bitburner";
import { bootstrapServer } from "scripts/servers/bootstrap-server";
import { scanNetwork } from "/lib/servers/scan-servers";

export async function main(ns: NS) {
    bootstrapAllServers(ns);
}

export function bootstrapAllServers(ns: NS) {
    const servers = scanNetwork(ns)[0];

    for(const server of servers) {
        bootstrapServer(ns, server);
    }
}