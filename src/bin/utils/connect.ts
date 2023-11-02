import { NS, AutocompleteData } from "Bitburner";
import { TermLogger } from "/lib/Helpers";
import { scanNetwork } from "/lib/servers/scan-servers";


const ConnectHistoryFile = "data/connect-history.txt";
const ConnectToPreviousPattern = "-(\d*)"
const MaxHistorySize = 100;


export function autocomplete(data: AutocompleteData, args: any): string[] {
  return data.servers;
}


export async function main(ns: NS) {
    const logger = new TermLogger(ns);
    const scriptFlags = ns.flags([["target", ""], ["help", false]])
    const target = resolveTarget(ns, String(scriptFlags.target));

    if(scriptFlags.help) {
        logger.log(`
        USAGE: bin/utils/connect.js --target foo
        \tConnect to previous target using "-" as the argument
        \tConnect up to 100 targets previously using "-n" where n is the number of targets to search backwards
        `)
        return;
    }

    if(!target) {
        logger.err("Must provide target argument via --target flag");
        return;
    }
    
    connectToTarget(ns, target);
}

interface FindResult {
    foundTarget: boolean,
    path: string[]
}

export function connectToTarget(ns: NS, target: string) {
  const logger = new TermLogger(ns);

  ns.print(`Connecting to target ${target}`);

  const findResult = findPath(ns, target);
  ns.print(`Find result against target ${target}: ${JSON.stringify(findResult)}`)

  if(!findResult.foundTarget) {
      logger.err(`Target ${target} was not found on the network`);
      return;
  }

  chainConnect(ns, findResult.path);
  logger.info(`Connected to ${target}`);
}

/**
 * Finds a path to the target server on the current network. Returns an empty array if none exists.
 * @param ns BitBurner API
 * @param target server to find
 * @returns array of intermediate servers to reach the target server
 */
export function findPath(ns: NS, target: string): FindResult {
    const network = scanNetwork(ns)[1];

    function findTarget(networkSubset: Object): FindResult {
        let findResult = {path: [] as string[], foundTarget: false};
        // note: the network is a tree, so we don't need to check for cycles
        const neighbors = Object.keys(networkSubset);
        neighbors.forEach(server => {
            if(findResult.foundTarget) {
                // we've already found the target, no need to search further
                return;
            }
            if (server == target) {
                findResult = {
                    path: [target],
                    foundTarget: true
                };
                return;
            } else {
                let searchResult = findTarget(networkSubset[server]);
                if(searchResult.foundTarget) {
                    findResult = {
                        path: [server, ...searchResult.path],
                        foundTarget: true
                    };
                    return;
                }
            }
        });
        return findResult;
    }

    return findTarget(network);
}

/**
 * connects through a chain of servers to reach a final destination server
 * @param ns BitBurner API
 * @param path servers to connect to, in order
 */
export function chainConnect(ns: NS, path: string[]) { 
    logToHistory(ns, path.slice(-1)[0]);
    path.forEach(ns.singularity.connect);
}

function resolveTarget(ns: NS, target: string): string {
  if(target.startsWith("-")) {
    ns.print(`Connecting to historical target`);
    if(ns.fileExists(ConnectHistoryFile)) {
      const history: string[] = JSON.parse(ns.read(ConnectHistoryFile))
      
      if(history.length === 0) {
        throw("Cannot connect to previous (-) because the connection history is empty");
      }
      
      return history[0];
    } else {
      throw Error("Cannot connect to previous (-) because there is no connection history");
    }
  }

  return target;
}

function logToHistory(ns: NS, server: string) {
  let history: string[] = [];
  if(ns.fileExists(ConnectHistoryFile)) {
    history = JSON.parse(ns.read(ConnectHistoryFile));
    if(history.length === MaxHistorySize) {
      history.pop()
      history.unshift()
    }
    // writing is append-based, so clear the file first if it exists
    
    ns.rm(ConnectHistoryFile);
  } else {
    history = [server];
  }

  ns.write(ConnectHistoryFile, JSON.stringify(history));
}
