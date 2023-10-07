import {getOptimalCrime} from "scripts/singularity/crime-early"

/** @param {NS} ns */
export async function main(ns) {
  const gymToUse = ns.args[0]
  const statThreshold = Number(ns.args[1]);
  let stats = ["strength", "defense", "dexterity", "agility"];
  while(true) {
    for (let i = 0; i < stats.length; i++) {
      let statToTrain = stats[i];
      ns.singularity.gymWorkout(gymToUse, statToTrain, false);
      // switch what's being trained each minute
      await ns.sleep(1000 * 60);
    }

    let player = ns.getPlayer();
    let statsMeetThreshold = player.skills.agility > statThreshold &&
                             player.skills.defense > statThreshold &&
                             player.skills.dexterity > statThreshold &&
                             player.skills.agility > statThreshold;
    if (statsMeetThreshold) {
      ns.print(`Stats have reached the desired threshold of ${statThreshold}, stopping`);
    }

    // each cycle, earn some money back with crime
    let optimalCrime = getOptimalCrime(ns);
    ns.singularity.commitCrime(optimalCrime.crimeName, false);
    // work at the crime for Max(2 minutes, 1 expected success interval)
    await ns.sleep(Math.max(1000 * 120, ns.singularity.getCrimeStats(optimalCrime.crimeName).time));
  }
}