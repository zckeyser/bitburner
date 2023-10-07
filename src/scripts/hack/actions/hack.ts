import {NS} from "Bitburner"

/** @param ns */
export async function main(ns: NS) {
  let target = String(ns.args[0]);

  await ns.hack(target);
}