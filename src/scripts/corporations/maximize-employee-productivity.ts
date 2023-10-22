import { maximizeEmployeeProductivity } from "/lib/corporation/manage-employees";
import { NS } from "Bitburner";

export async function main(ns: NS) {
    let divisions: string[]|undefined = undefined;
    if(ns.args.length > 0) {
        divisions = String(ns.args[0]).split(",");
    }
    await maximizeEmployeeProductivity(ns, divisions);
}