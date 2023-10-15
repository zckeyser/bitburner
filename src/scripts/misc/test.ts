import { NS } from "Bitburner";

export async function main(ns: NS) {
    ns.tprint(ns.getPurchasedServers().filter((s) => s.startsWith("util")).length === 0)
}