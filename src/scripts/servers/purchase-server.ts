import { NS } from "Bitburner";
import { bootstrapServer } from "./bootstrap-server";

/** @param ns */
export async function main(ns: NS) {
  let serverName = String(ns.args[0]);
  let serverRam = Number(ns.args[1]);

  const hostname = ns.purchaseServer(serverName, serverRam);
  bootstrapServer(ns, hostname);
}