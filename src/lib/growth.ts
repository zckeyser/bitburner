import {NS, Server, Player} from "Bitburner"

/**
 * Constants taken from https://github.com/danielyxie/bitburner/blob/2a13db39c769c601956b4bcef5e2a2f40514bcbd/src/Constants.ts
 * for use in growth calculations
 */
const ServerBaseGrowthRate = 1.03;
const ServerMaxGrowthRate = 1.035;
const GrowthMaxThreads = 4000;

/**
 * Get number of threads to reach max money on a server
 * @param ns 
 * @param server server grow is being run against
 * @param player player running the grow
 * @param cores cores available on the machine running grow
 * @param maxThreads max threads to use for grow, defaults to GrowthMaxThreads (4000)
 * @returns number of threads required to reach max server money, or max threads if that isn't enough to reach max money
 */
export function getGrowthThreads(ns: NS, server: Server, player: Player, cores: number, maxThreads: number=GrowthMaxThreads, moneyAvailable: number=0): number {
  let threadCount = 1;
  let growthPercent = 0;
  let newValue = 0;
  
  if(!server.moneyAvailable && server.moneyAvailable !== 0 || !server.moneyMax) {
    ns.print(`Invalid server with no money, returning 0 for growth threads`);
    return 0;
  }

  while (threadCount < maxThreads) {
    const moneyAvailable = server.moneyAvailable ?? threadCount;
    growthPercent = getGrowthPercent(ns, server, player, threadCount, cores);
    newValue = growthPercent * moneyAvailable; 
    if (newValue >= server.moneyMax) {
      // found a high enough value to use, break and return it
      break;
    }
    threadCount++;
  }

  return threadCount;
}


/**
 * Get expected growth percentage for a server based on various parameters
 * uses Formulas.exe if available, otherwise estimates
 * @param {NS} ns BitBurner API
 * @param server
 * @param player
 * @param threads
 * @param cores
 * @return percentage increase for this grow, as a multiplier, e.g. 25% = 1.25
 */
export function getGrowthPercent(ns: NS, server: Server, player: Player, threads: number, cores: number): number {
  if(ns.fileExists("Formulas.exe")) {
    return ns.formulas.hacking.growPercent(server, threads, player, cores);
  } else {
    return estimateGrowth(server, threads, player, cores);
  }
}

/**
 * @param server
 * @param threads
 * @param player
 * @return expected growth based on the inputted parameters, according to a formula pulled from https://github.com/danielyxie/bitburner/blob/2a13db39c769c601956b4bcef5e2a2f40514bcbd/src/Server/formulas/grow.ts#L10
 */
export function estimateGrowth(server: Server, threads: number, player: Player, cores: number=1): number {
  if(!server.minDifficulty || !server.serverGrowth) {
    return 0;
  }
  const numServerGrowthCycles = Math.max(Math.floor(threads), 0);
  const growthRate = ServerBaseGrowthRate;
  let adjGrowthRate = 1 + (growthRate - 1) / server.minDifficulty;
  if (adjGrowthRate > ServerMaxGrowthRate) {
    adjGrowthRate = ServerMaxGrowthRate;
  }
  const serverGrowthPercentage = server.serverGrowth / 100;
  const bitNodeMultiplier = 1;
  const numServerGrowthCyclesAdjusted =
    numServerGrowthCycles * serverGrowthPercentage * bitNodeMultiplier;
  const coreBonus = 1 + (cores - 1) / 16;
  return Math.pow(adjGrowthRate, numServerGrowthCyclesAdjusted * player.mults.hacking_grow * coreBonus);
}
