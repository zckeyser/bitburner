// NOTE: these are js files so that they get JSON formatting + highlighting
const FullOutputFile = "servers/fullServerInfo.js";
const ImportantOutputFile = "servers/importantServerInfo.js";
const ServerAggregateStatsOutputFile = "servers/aggregateServerStats.js"


/**
 * @typedef {Object} ServerValue
 * @property {number} value value which is relevant for this aggregation, e.g. max ram
 * @property {number} hostname server for which this value was found
 */

/**
 * @typedef {Object} StatAggregation
 * @property {number} average average value of this stat across servers
 * @property {ServerValue} max maximum value of this stat across servers + what host it was found on
 */

/**
 * @typedef {Object} ServerStats
 * @property {StatAggregation} ram
 * @property {StatAggregation} money
 * @property {StatAggregation} hackLevelRequired
 */


/**
 * @param {Server[]} servers list of servers to aggregate stat block over
 * @param {(Server) => number} getFieldCallback
 * @param {bool} countZeroes whether to include servers with a value for this field of 0 in aggregations
 * 
 * @return {StatAggregation} aggregate stats of the given field across the given servers
 */
function aggregateStat(servers, getFieldCallback, countZeroes=false) {
  const serverWithFieldValues = servers.map((s) => {
    return {
      server: s,
      fieldValue: getFieldCallback(s)
    } 
  });
  const filteredValues = serverWithFieldValues.filter((s) => countZeroes || s.fieldValue > 0);

  const sum = filteredValues.reduce((acc, next) => acc + next.fieldValue, 0);
  const serverCount = filteredValues.length
  const maxInfo = filteredValues.reduce((acc, next) => acc?.fieldValue > next.fieldValue ? acc : next, null)

  return {
    average: Math.trunc(sum / serverCount),
    max: {
      value: maxInfo?.fieldValue,
      hostname: maxInfo?.server.hostname
    }
  }
}

/**
 * @param {Server[]} servers list of servers to aggregate stats over
 * @return {ServerStats}
 */
function analyzeServerStats(servers) {
  return {
    ram: aggregateStat(servers, (s) => s.maxRam),
    money: aggregateStat(servers, (s) => s.moneyMax),
    hackLevelRequired: aggregateStat(servers, (s) => s.requiredHackingSkill),
    minDifficultyToMoneyRatio: aggregateStat(servers, (s) => s.moneyMax / s.minDifficulty)
  };
}


/** @param {NS} ns */
export async function main(ns) {
  const serverHostnames = ns.read("servers/serverList.txt").split("|");

  // retrieve server info for all servers
  let fullServerInfo = serverHostnames.map(ns.getServer);
  fullServerInfo.sort((a, b) => {
    return a.maxMoney - b.maxMoney;
  });
  ns.write(FullOutputFile, JSON.stringify(fullServerInfo))

  // pull out important info for each server
  let importantServerInfo = fullServerInfo.map((server) => {
    return {
      hostname: server.hostname,
      maxMoney: server.moneyMax,
      maxRam: server.maxRam,
      baseSecurity: server.baseDifficulty,
      minSecurity: server.minDifficulty,
      requiredPorts: server.numOpenPortsRequired,
      hackLevelRequired: server.requiredHackingSkill
    };
  });
  ns.write(ImportantOutputFile, JSON.stringify(importantServerInfo));

  let serverStats = analyzeServerStats(fullServerInfo);
  ns.write(ServerAggregateStatsOutputFile, JSON.stringify(serverStats));
}