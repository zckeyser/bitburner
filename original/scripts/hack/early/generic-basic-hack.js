/** @param {NS} ns */
export async function main(ns) {
  let target = null;
  
  if (ns.args.length > 0) {
    target = ns.args[0];
  } else {
    let serverList = ns.read("serverList.txt").split("|");
    target = serverList[Math.floor(Math.random() * serverList.length)];
  }

  console.log("Hacking server " + target);

  let openPorts = 0

  try {
    ns.brutessh(target);
    openPorts++;
    ns.ftpcrack(target);
    openPorts++;
    ns.relaysmtp(target);
    openPorts++;
    ns.httpworm(target);
    openPorts++;
    ns.sqlinject(target);
    openPorts++;
  } catch (exception) {
    console.log("Got exception while cracking server " + exception);
  }


  let requiredPorts = ns.getServerNumPortsRequired(target);
  if (openPorts >= requiredPorts) {
    // Get root access to target server
    ns.nuke(target);
  } else {
    throw new Error(`not enough ports open to nuke ${target} -- required: ${requiredPorts}, actual: ${openPorts}\n`);
  }

  // Defines how much money a server should have before we hack it
  // In this case, it is set to the maximum amount of money.
  const moneyThresh = ns.getServerMaxMoney(target);

  // Defines the maximum security level the target server can
  // have. If the target's security level is higher than this,
  // we'll weaken it before doing anything else
  const securityThresh = ns.getServerMinSecurityLevel(target);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      // If the server's security level is above our threshold, weaken it
      await ns.weaken(target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      // If the server's money is less than our threshold, grow it
      await ns.grow(target);
    } else {
      // Otherwise, hack it
      await ns.hack(target);
    }
  }
}