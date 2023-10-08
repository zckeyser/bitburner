import { NS } from "Bitburner";
import { getOptimalCrime } from "scripts/singularity/crime/crime";

const SecondsPerStat = 60;
const CombatStats = ["strength", "defense", "dexterity", "agility"];

const GymCosts = {
  "powerhouse gym": 2400,
  "iron gym": 120,
}


/** @param ns */
export async function main(ns: NS) {
  let scriptFlags = ns.flags([["gym", "powerhouse gym"], ["statThreshold", 500], ["focus", false], ["earningsRatio", 1.0]]);
  const gymToUse = String(scriptFlags.gym);
  const statThreshold = Number(scriptFlags.statThreshold);
  const focus = Boolean(scriptFlags.focus);
  const earningsRatio = Number(scriptFlags.earningsRatio);
  const gymCostPerCycle = GymCosts[gymToUse] * SecondsPerStat * CombatStats.length;

  while (true) {
    ns.print(`Working out for ${CombatStats.length * SecondsPerStat}s`);
    for (let i = 0; i < CombatStats.length; i++) {
      let statToTrain = CombatStats[i];
      ns.singularity.gymWorkout(gymToUse, statToTrain, focus);
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
    const interval = 120;
    const optimalCrime = getOptimalCrime(ns, "moneyPerInterval", interval);
    let timeToWorkOffGymCost = (gymCostPerCycle / optimalCrime.moneyPerSecond) * earningsRatio * 1000;
    timeToWorkOffGymCost = Math.max(interval, timeToWorkOffGymCost);
    ns.singularity.commitCrime(optimalCrime.crimeName, focus);
    ns.print(`Doing crime ${optimalCrime.crimeName} for ${timeToWorkOffGymCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}`)
    // work at the crime for as long as we expect to need to to pay off the cost of the gym 
    await ns.sleep(timeToWorkOffGymCost);
  }
}