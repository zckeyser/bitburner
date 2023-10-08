import { NS } from "Bitburner";

export async function main(ns: NS) {
    ns.tprint(JSON.stringify(ns.getPlayer(), null, 2));
}