import { NS } from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  let serverName = String(ns.args[0]);
  let serverRam = Number(ns.args[1]);

  ns.purchaseServer(serverName, serverRam);
}