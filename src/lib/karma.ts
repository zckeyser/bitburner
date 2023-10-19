import { NS } from "Bitburner";

/**
 * testing netscript extras from https://github.com/bitburner-official/bitburner-src/blob/62ab9f33beefdb5c205e009b9951c81f9c77834a/src/NetscriptFunctions/Extra.ts#L23
 * @param ns
 */
export async function main(ns: NS) {
    // getKarma(ns)
    ns.tprint("Player karma: " + JSON.stringify(getKarma(ns)));
}

export function getKarma(ns: NS) {
    (ns as any).exploit();
    return (ns as any).heart.break();
}