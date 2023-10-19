import { NS } from "Bitburner";
import { bootstrapServer } from "scripts/servers/bootstrap-server";
import { UtilServerName } from "/lib/Constants";

const DesiredRamPerProtoBatcher = 128;
const MinProtoBatchers = 1;
const StartProtoBatchersScript = "scripts/hack/midgame/start-proto-batchers.js";
const StartBatchersScript = "scripts/hack/batcher/start-batchers.js";

/** @param ns */
export async function main(ns: NS) {
  // take target ram as argument
  const ram = Number(ns.args[0]);
  if (!ram) {
    throw Error("Must provide server RAM as a positional number argument");
  }

  await waitAndBuyServers(ns, ram);
}

/**
 * 
 * @param ns 
 * @param ram 
 */
export async function waitAndBuyServers(ns: NS, ram: number, utilServerRam: number = 256) {
  ns.print(`Server cost: \$${ns.getPurchasedServerCost(ram)}`);
  const existingServers = ns.getPurchasedServers();

  // if we don't have a util server, buy one and then run from there
  // that way we can safely clear scripts in start-batchers w/o stopping this process
  if (existingServers.filter((s) => s.startsWith("util")).length === 0) {
    ns.print(`No util server found in server list: ${JSON.stringify(existingServers)}`)
    while(ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(utilServerRam)) {
      await ns.sleep(5000);
    }
    ns.purchaseServer(UtilServerName, utilServerRam);
    bootstrapServer(ns, UtilServerName);
    ns.exec("scripts/servers/buy-servers.js", UtilServerName, { threads: 1 }, ram);
    return;
  } else if (ns.getHostname() !== UtilServerName) {
    // util server exists, but we aren't running on it. Switch to it.
    ns.exec("scripts/servers/buy-servers.js", UtilServerName, { threads: 1 }, ram);
    return;
  } else {
    // stop the start-batchers process on "home" and start it on the util server;
    const startBatchersOnHome = ns.ps("home").filter(program => program.filename.includes("start-batchers.js"))
    if(startBatchersOnHome.length > 0) {
      startBatchersOnHome.forEach(program => ns.kill(program.pid));
    }
    const startBatchersOnUtil = ns.ps(UtilServerName).filter(program => program.filename.includes("start-batchers.js"))
    if(startBatchersOnUtil.length == 0) {
      ns.exec(StartBatchersScript, UtilServerName, {threads: 1}, "--fresh");
    }
  }

  for (let i = existingServers.length; i < ns.getPurchasedServerLimit();) {
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {

      // we need at least ~1TB of RAM to make batchers useful
      // if we don't have that much, run proto batchers instead
      if (ram < 1024) {
        ns.print(`Buying proto-batcher server because RAM ${ram}GB is less than threshold 1024GB`);
        let hostname = ns.purchaseServer(`proto-batcher-serv-${i}`, ram);

        // run bootstrap from home to copy relevant files
        bootstrapServer(ns, hostname);

        // kick off proto-batchers on server
        let numBatchers = Math.max(MinProtoBatchers, Math.floor(ram / DesiredRamPerProtoBatcher));
        ns.exec(StartProtoBatchersScript, hostname, { threads: 1 }, "--max", numBatchers);
      } else {
        ns.print(`Buying batcher server because RAM ${ram}GB is sufficient for one`);
        let hostname = ns.purchaseServer(`batch-serv-${i}`, ram);
        // run bootstrap from home to copy relevant files
        bootstrapServer(ns, hostname);
        // check for start-batchers running on the util server,
        // if it is it'll kick off an appropriate batcher within 1m
        // if it isn't, start the process
        let batcherRunning = ns.ps(UtilServerName).filter(p => p.filename.includes(StartBatchersScript)).length > 0;
        if (!batcherRunning) {
          ns.print(`No process for start-batchers found running on ${UtilServerName}, starting one now`);
          ns.exec(StartBatchersScript, UtilServerName);
        }
      }

      i++;
    }

    await ns.sleep(1000);
  }
}
