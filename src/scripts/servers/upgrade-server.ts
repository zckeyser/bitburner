import { NS } from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  const serverName = String(ns.args[0]);
  const ram = Number(ns.args[1]);

  ns.upgradePurchasedServer(serverName, ram);
}
