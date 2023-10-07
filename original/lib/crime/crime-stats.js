/**
 * @typedef {Object} ExpPerSecondStats
 * @property {number} hacking
 * @property {number} strength
 * @property {number} defense
 * @property {number} dexterity
 * @property {number} agility
 * @property {number} charisma
 * @property {number} total
 */

/**
 * @typedef {Object} CrimeOppCostStats
 * @property {string} crimeName name of the crime in question
 * @property {number} moneyPerSecond expected money to be earned per second for this crime
 * @property {ExpGainStats} expPerSecond expected exp to be earned per second in aggregate for this crime
 * @property {number} intervalBetweenSuccess interval in seconds between expected successes for this crime (on average)
 */

/**
 * @param {NS} ns
 * @param {string} crime the crime to commit
 * 
 * @return {CrimeOppCostStats} stats about the opportunity cost of this crime
 */
export function getCrimeOpportunityCostStats(ns, crime) {
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