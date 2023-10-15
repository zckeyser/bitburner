import { NS } from "Bitburner";

export async function main(ns: NS) {
    const serverName = String(ns.args[0]);
    const newServerName = String(ns.args[1]);
    ns.renamePurchasedServer(serverName, newServerName);
}