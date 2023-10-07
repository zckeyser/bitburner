import {NS} from "Bitburner";

export async function main(ns: NS) {
  let target = String(ns.args[0]);
  
  await ns.grow(target);
}