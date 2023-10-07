/**
 * @param {NS} ns
 * @return {number}
 */
function getHackablePorts(ns) {
  if (!ns) {
    throw new Error(`getHackablePorts missing ns argument, got ${ns}`)
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
  return hackablePorts
}

/** @param {NS} ns */
export async function main(ns) {
  const servers = ns.read("serverList.txt").split("|");

  let serversRooted = [];
  let serversBackdoored = [];

  while(serversRooted.length < servers.length) {
    servers.forEach((serverHostname) => {
      let server = ns.getServer(serverHostname)

      const currentHackLevel = ns.getHackingLevel();
      const portsHackable = getHackablePorts(ns);
      const isHackable = server.requiredHackingSkill <= currentHackLevel && server.numOpenPortsRequired <= portsHackable;
      if(!isHackable) {
        ns.print(`Skipping backdoor on ${serverHostname} because the server is not hackable.
        one of the following conditions is causing this:
        hackingSkill: ${server.requiredHackingSkill} req > ${currentHackLevel} actual
        portsRequired: ${server.numOpenPortsRequired} req > ${portsHackable} actual`);
        return;
      }

      if(server.backdoorInstalled) {
        ns.print(`Skipping backdoor on ${serverHostname} because the server has already been backdoored`);
        // mark as backdoored if necessary in case it was backdoored before this script went off
        if(!serversRooted.includes(serverHostname)) {
          serversRooted.push(serverHostname);
        }
        return;
      }

      // open ports + nuke server
      ns.run("init.js", {threads: 1}, serverHostname);

      serversRooted.concat(serverHostname);

      // this doesn't work yet, some later BitNode is required to get scripted backdooring :(
      // ns.installBackdoor(serverHostname)
    }); 

    // wait 10 minutes then try again
    await ns.sleep(1000 * 60 * 10);
  }
  
}