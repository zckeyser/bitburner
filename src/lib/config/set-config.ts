import { NS } from "Bitburner";
import { ConfigFile, JSONValue } from "lib/Constants";
import { getConfiguration } from "lib/config/get-config";


export function setConfigValue(ns: NS, key: string, value: JSONValue) {
    const currentConfiguration = getConfiguration(ns);

    let currConfigSection = currentConfiguration;

    for(const nextKey of key.split(".").slice(0, -1)) {
        if(currConfigSection[nextKey] === undefined) {
            currConfigSection[nextKey] = {};
        }

        currConfigSection = currConfigSection[nextKey];
    }
    currConfigSection[key.split(".").slice(-1)[0]] = value;
    

    setConfiguration(ns, currentConfiguration);
}

export function setConfiguration(ns: NS, config: object) {
    ns.write(ConfigFile, JSON.stringify(config), "w");
}
