import {NS} from "Bitburner"

/**
 * Gets the number of hackable ports on a server given currently available programs
 * @param ns BitBurner API
 * @return number of hackable ports
 */
export function getHackablePorts(ns: NS): number {
  if (!ns) {
    throw new Error(`getHackablePorts missing ns argument, got ${ns}`);
  }

  let hackablePorts = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) {
    hackablePorts++;
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    hackablePorts++;
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    hackablePorts++;
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    hackablePorts++;
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
    hackablePorts++;
  }
  return hackablePorts;
}