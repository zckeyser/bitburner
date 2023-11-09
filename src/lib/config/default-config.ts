import { NS } from "Bitburner";
import { ConfigFile } from "lib/Constants";

export async function main(ns: NS) {
    const scriptFlags = ns.flags([["overwrite", false]]);
    const overwrite = Boolean(scriptFlags.overwrite);
    createDefaultConfig(ns, overwrite);
}

export function createDefaultConfig(ns: NS, overwrite: boolean=false): any {
    if(!ns.fileExists(ConfigFile) || overwrite) {
        ns.write(ConfigFile, JSON.stringify(DefaultConfig, undefined, 4), "w");
        return DefaultConfig;
    } else {
        // add any missing keys
        // const existingConfig = JSON.parse(ns.read(ConfigFile));
        return JSON.parse(ns.read(ConfigFile));
        // TODO: recursively find any keys missing from DefaultConfig
    }
}

const DefaultConfig = {
    "gang": {
        "war": {
            "members": 0
        },
        "threshold": {
            "ascension_improvement": 1.2,
            "wanted_penalty": .95,
            "base_training": 75,
            "max_training": 1500,
            "vigilante": 150,
            "strongarm": 150, 
            "traffick": 200,
            "terrorism": 400,
            "terrorism_respect": 10000
        }
    }
}