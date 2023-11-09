import { NS } from "Bitburner";
import { createDefaultConfig } from "lib/config/default-config";
import { ConfigFile, JSONValue } from "lib/Constants";

const ConfigCacheDuration = 60000;

let lastConfigLoad: Date = new Date();
let cachedConfig: any = null;


export function getConfigValue<T extends JSONValue>(ns: NS, key: string): T {
    try {
        const config = getConfiguration(ns);
        const val = getValueAtPath(config, key.split("."));
        return val as T;
    } catch {
        throw Error(`No configuration was found for key ${key}`);
    }
}

export function getConfiguration(ns: NS): any {
    const now = new Date();
    if(cachedConfig && (now.getTime() - lastConfigLoad.getTime() < ConfigCacheDuration)) {
        return cachedConfig;
    }
    if (ns.fileExists(ConfigFile)) {
        cachedConfig = JSON.parse(ns.read(ConfigFile));
    } else {
        cachedConfig = createDefaultConfig(ns);
    }

    return cachedConfig;
}

function getValueAtPath(obj: JSONValue, keyPath: string[]): JSONValue {
    for(const key of keyPath) {
        const nextVal = obj[key]; 
        if(nextVal === undefined) {
            throw Error(`Configuration not found for keyPath ${JSON.stringify(keyPath)}`);
        }
        obj = nextVal;
    }
    return obj;
}