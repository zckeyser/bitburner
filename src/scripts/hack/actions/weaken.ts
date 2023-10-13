import { NS } from "Bitburner";

export async function main(ns: NS) {
  const scriptFlags = ns.flags([["target", ""], ["delay", 0]]);
  const target = String(scriptFlags.target)
  if(!target) {
      throw Error(`Must provide --target argument`);
  }
  const delay = Number(scriptFlags.delay);
  
  if(delay !== 0) {
      await ns.sleep(delay);   
  }
  
  await ns.weaken(target);
}