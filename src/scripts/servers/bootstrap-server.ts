import { NS } from "Bitburner";


/** @param ns */
export async function main(ns: NS) {
  let target = String(ns.args[0]);
  ns.print(`Bootstrapping ${target}`);
  if(!target) {
    throw Error("Must provide a target server argument, e.g. 'bootstrap-server.js foodnstuff'");
  }
  bootstrapServer(ns, target);
}

export function bootstrapServer(ns: NS, target: string) {
  let homeFiles = ns.ls("home", "/");
  homeFiles.forEach(s => {
    ns.scp(s, target, "home");
  });
}