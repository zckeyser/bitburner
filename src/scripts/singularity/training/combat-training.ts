import { NS } from "Bitburner";
import { getOptimalCrime } from "scripts/singularity/crime/crime";

const CombatStats = ["strength", "defense", "dexterity", "agility"];

const GymCosts = {
  "powerhouse gym": 2400,
  "iron gym": 120,
}

export type TrainingGym = "powerhouse gym"|
                          "iron gym"

export interface CombatTrainingParams {
  /** the gym to train at */
  gymToUse: TrainingGym
  /** the stat threshold to train up to before stopping, defaults to infinity */
  statThreshold?: number
  /** the ratio of money to attempt to earn through crime relative to that spent to train. defaults to 1 */
  earningsRatio?: number
  /** whether to skip committing crime to offset combat training */
  skipCrime?: boolean
  /** whether to focus on worked jobs/training */
  focus?: boolean
  /** maximum training cycles to go through */
  maxCycles?: number
  /** time to train each stat in ms, defaults to 60,000 */
  timetoTrainStat?: number
}


/** @param ns */
export async function main(ns: NS) {
  let scriptFlags = ns.flags([["gym", "powerhouse gym"], ["threshold", 500], ["focus", false], ["ratio", 1.0]]);
  const gymToUse = String(scriptFlags.gym);
  const statThreshold = Number(scriptFlags.threshold);
  const focus = Boolean(scriptFlags.focus);
  const earningsRatio = Number(scriptFlags.ratio);

  await trainCombatSkills(ns, {
      gymToUse: gymToUse as TrainingGym,
      statThreshold: statThreshold,
      focus: focus,
      earningsRatio: earningsRatio
  });
}

/**
 * 
 * @param ns 
 * @param params
 */
export async function trainCombatSkills(ns: NS, params: CombatTrainingParams) {
  const gymToUse = params.gymToUse;
  const maxCycles = params.maxCycles ? params.maxCycles : Infinity
  const timeToTrainStat = params.timetoTrainStat ? params.timetoTrainStat : 60000;
  const secondsToTrainStat = timeToTrainStat / 1000;
  const statThreshold = params.statThreshold ? params.statThreshold : Infinity;
  const earningsRatio = params.earningsRatio ? params.earningsRatio : 1;
  const focus = params.focus ? params.focus : false;

  const gymCostPerCycle = GymCosts[gymToUse] * secondsToTrainStat * CombatStats.length;
  let cycles = 0;

  while (cycles < maxCycles) {
    ns.print(`Working out for ${CombatStats.length * secondsToTrainStat}s`);
    let player = ns.getPlayer();
    
    for (let i = 0; i < CombatStats.length; i++) {
      if(player.skills[CombatStats[i]] < statThreshold) {
        let statToTrain = CombatStats[i];
        ns.singularity.gymWorkout(gymToUse, statToTrain, focus);
        await ns.sleep(timeToTrainStat);
      }
    }

    
    let statsMeetThreshold = player.skills.agility > statThreshold &&
      player.skills.defense > statThreshold &&
      player.skills.dexterity > statThreshold &&
      player.skills.agility > statThreshold;
    if (statsMeetThreshold) {
      ns.print(`Stats have reached the desired threshold of ${statThreshold}, stopping`);
    }

    if(!params.skipCrime) {
      // each cycle, earn some money back with crime
      const interval = 240;
      const optimalCrime = getOptimalCrime(ns, "moneyPerInterval", interval);
      let timeToWorkOffGymCost = (gymCostPerCycle / optimalCrime.moneyPerSecond) * earningsRatio * 1000;
      timeToWorkOffGymCost = Math.max(interval, timeToWorkOffGymCost);
      let secondsToWorkOffGymCost = timeToWorkOffGymCost / 1000;
      ns.singularity.commitCrime(optimalCrime.crimeName, focus);
      ns.print(`Doing crime ${optimalCrime.crimeName} for ${secondsToWorkOffGymCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}s to earn \$${(optimalCrime.moneyPerSecond * secondsToWorkOffGymCost).toLocaleString(undefined, {maximumFractionDigits: 2})}`)
      // work at the crime for as long as we expect to need to to pay off the cost of the gym
      await ns.sleep(timeToWorkOffGymCost);
    }

    cycles++;

    // short sleep to avoid any risk of infinite loops,
    // since every other sleep is conditional
    // it should break in any case that would lead to that 
    // before an infinite, but this is just-in-case it doesn't
    await ns.sleep(500);
  }
}