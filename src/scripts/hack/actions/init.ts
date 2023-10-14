import {NS} from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  let portsHacked = 0;
  // NOTE: delay is here only to make it the same as the other actions
  const scriptFlags = ns.flags([["target", ""], ["delay", 0]]);
  const target = String(scriptFlags.target);
  if(!target) {
    throw new Error("Must pass --target argument");
  }
  const server = ns.getServer(target);
  try {
    if(!server.sshPortOpen) {
      ns.brutessh(target);
    }
    portsHacked++;
    if(!server.ftpPortOpen) {
      ns.ftpcrack(target);
    }
    portsHacked++;
    if(!server.smtpPortOpen) {
      ns.relaysmtp(target);
    }
    portsHacked++;
    if(!server.smtpPortOpen) {
      ns.httpworm(target);
    }
    portsHacked++;
    if(!server.smtpPortOpen) {
      ns.sqlinject(target);
    }
    portsHacked++;
  } catch {
    ns.print(`Hit a failure while hacking after ${portsHacked} ports, attempting to nuke`)
  } finally {
    ns.print(`Hacked ${portsHacked} ports on ${target}`);
  }

  ns.print(`Nuking ${target}`)
  ns.nuke(target);
}