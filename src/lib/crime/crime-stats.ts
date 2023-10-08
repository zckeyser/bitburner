import { CrimeType, CrimeStats, NS } from 'Bitburner'

export interface ExpGainStats {
  hacking: number;
  strength: number;
  defense: number;
  dexterity: number;
  agility: number;
  charisma: number;
  total: number;
};

export interface CrimeOppCostStats {
  /** name of the crime */
  crimeName: CrimeType;
  /** base stats for the crime, per ns.singularity.getCrimeStats(crimeType) */
  crimeStats: CrimeStats;
  /** current chance to succeed at the crime */
  crimeChance: number
  /** expected money to be earned per second for this crime */
  moneyPerSecond: number;
  /** expected money to be earned over the course of a specified interval */
  moneyPerInterval: number;
  /** interval in ms that was used to calculate moneyPerInterval */
  calcInterval: number;
  /** expected exp to be earned per second in aggregate for this crime */
  expPerSecond: ExpGainStats;
  /** interval in seconds between expected successes for this crime (on average) */
  timeBetweenSuccess: number;
};

/**
 * @param ns BitBurner API
 * @param crime the crime to commit
 * @param interval interval in seconds in which the crime should be run; filters out high reward high time jobs like heist
 * 
 * @return stats about the opportunity cost of this crime
 */
export function getCrimeOpportunityCostStats(ns: NS, interval: number, crime: CrimeType): CrimeOppCostStats {
  let crimeStats = ns.singularity.getCrimeStats(crime);
  let crimeChance = ns.singularity.getCrimeChance(crime);
  let crimeTimeInSeconds = crimeStats.time / 1000;
  let intervalMs = interval * 1000;

  return {
    crimeName: crime,
    crimeChance: crimeChance,
    crimeStats: crimeStats,
    moneyPerSecond: (crimeStats.money / crimeTimeInSeconds) * crimeChance,
    moneyPerInterval: (Math.floor(intervalMs / crimeStats.time) * crimeStats.money * crimeChance),
    calcInterval: interval,
    expPerSecond: {
      hacking: crimeStats.hacking_exp / crimeTimeInSeconds,
      strength: crimeStats.strength_exp / crimeTimeInSeconds,
      defense: crimeStats.defense_exp / crimeTimeInSeconds,
      dexterity: crimeStats.dexterity_exp / crimeTimeInSeconds,
      agility: crimeStats.agility_exp / crimeTimeInSeconds,
      charisma: crimeStats.charisma_exp / crimeTimeInSeconds,
      total: (crimeStats.hacking_exp + crimeStats.strength_exp + crimeStats.defense_exp + crimeStats.dexterity_exp + crimeStats.agility_exp + crimeStats.charisma_exp) / crimeTimeInSeconds
    },
    timeBetweenSuccess: crimeTimeInSeconds / crimeChance
  }
}