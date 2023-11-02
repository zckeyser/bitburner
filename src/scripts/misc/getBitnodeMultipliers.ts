import { NS } from "Bitburner";

export async function main(ns: NS) {
    ns.tprint(
        JSON.stringify(ns.getBitNodeMultipliers(), undefined, 4)
    );
}