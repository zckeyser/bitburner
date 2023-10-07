import {NS} from "Bitburner";

/** @param ns */
export async function main(ns: NS) {
  let portsHacked = 0;
  let target = String(ns.args[0]);
  let server = ns.getServer(target);
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