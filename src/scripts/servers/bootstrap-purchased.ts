import { NS } from "Bitburner";
import { bootstrapServer } from "scripts/servers/bootstrap-server";
import { scanNetwork } from "/lib/servers/scan-servers";

export async function main(ns: NS) {
    bootstrapPurchasedServers(ns);
}

export function bootstrapPurchasedServers(ns: NS) {
    for(const server of ns.getPurchasedServers()) {
        bootstrapServer(ns, server);
    }
}