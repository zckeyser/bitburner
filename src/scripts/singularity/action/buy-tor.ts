import { NS } from "Bitburner";

export async function main(ns: NS) {
    while(ns.getServerMoneyAvailable("home") < 200000) {
        await ns.sleep(10000)
    }
    ns.singularity.purchaseTor();
}