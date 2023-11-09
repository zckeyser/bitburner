import { NS } from "Bitburner";
import { getConfigValue } from "/lib/config/get-config";

export async function main(ns: NS) {
    if(ns.args.length < 2) {
        ns.tprint(`Not enough arguments were passed.\nUSAGE: run scripts/misc/cli-config.js get foo.bar`.red());
        return;
    }
    const action = ns.args[0] as string;
    const target = ns.args[1] as string;
    
    if(action === "set") {
        if(ns.args.length < 3) {
            ns.tprint(`Set action requires a value argument.\n USAGE: run scripts/misc/cli-config.js set foo.bar baz`.red());
            return;
        }
    } else if (action === "get") {
        try {
            ns.tprint(getConfigValue(ns, target));
        } catch {
            ns.tprint(`No configuration was found for key ${target}`.red());
        }
    } else {
        ns.tprint(`Unrecognized action ${action}`);
    }
}