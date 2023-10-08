import { NS } from "Bitburner";


/** @param ns */
export async function main(ns: NS) {
  let serverName = String(ns.args[0]);
  ns.print(`Bootstrapping ${serverName}`);
  if(!serverName) {
    throw Error("Must provide a target server argument, e.g. 'bootstrap-server.js foodnstuff'");
  }
  ns.killall(serverName, false);
  let scripts = ns.ls("home", "scripts");
  let lib = ns.ls("home", "lib");
  scripts.forEach(s => {
    ns.scp(s, serverName);
  });
  lib.forEach(s => {
    ns.scp(s, serverName);
  });
  ns.scp("servers/serverList.txt", serverName);
}