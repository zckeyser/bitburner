import { CrimeType, NS } from 'Bitburner'

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
  crimeName: CrimeType; // name of the crime in question
  moneyPerSecond: number; // expected money to be earned per second for this crime
  expPerSecond: ExpGainStats; // expected exp to be earned per second in aggregate for this crime
  intervalBetweenSuccess: number; // interval in seconds between expected successes for this crime (on average)
};

/**
 * @param ns BitBurner API
 * @param crime the crime to commit
 * 
 * @return stats about the opportunity cost of this crime
 */
export function getCrimeOpportunityCostStats(ns: NS, crime: CrimeType): CrimeOppCostStats {
  let crimeStats = ns.singularity.getCrimeStats(crime);
  let crimeChance = ns.singularity.getCrimeChance(crime);
  let crimeTimeInSeconds = crimeStats.time / 1000;

  return {
    crimeName: crime,
    moneyPerSecond: (crimeStats.money / crimeTimeInSeconds) * crimeChance,
    expPerSecond: {
      hacking: crimeStats.hacking_exp / crimeTimeInSeconds,
      strength: crimeStats.strength_exp / crimeTimeInSeconds,
      defense: crimeStats.defense_exp / crimeTimeInSeconds,
      dexterity: crimeStats.dexterity_exp / crimeTimeInSeconds,
      agility: crimeStats.agility_exp / crimeTimeInSeconds,
      charisma: crimeStats.charisma_exp / crimeTimeInSeconds,
      total: (crimeStats.hacking_exp + crimeStats.strength_exp + crimeStats.defense_exp + crimeStats.dexterity_exp + crimeStats.agility_exp + crimeStats.charisma_exp) / crimeTimeInSeconds
    },
    intervalBetweenSuccess: crimeTimeInSeconds / crimeChance
  }
}