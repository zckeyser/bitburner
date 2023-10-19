import {NS, Server} from 'Bitburner'

// NOTE: these are js files so that they get JSON formatting + highlighting
const FullOutputFile = "data/fullServerInfo.js";
const ImportantOutputFile = "data/importantServerInfo.js";
const ServerAggregateStatsOutputFile = "data/aggregateServerStats.js"


/**
 * Pairing of a value and the server it's associated with
 * Used for aggregations that correspond with a specific server/value, e.g. max
 */
export interface ServerValue {
  /** @property value value which is relevant for this aggregation, e.g. max ram */
  value: number
  /** @property hostname server for which this value was found */
  hostname: string
}

/**
 * Represents aggregations over a particular stat
 */
export interface StatAggregation {
  /** @property average average value of this stat across servers */
  average: number
  /** @property max maximum value of this stat across servers + what host it was found on */
  max: ServerValue
}

/**
 * Collection of StatAggregations for various statistics across servers
 */
export interface ServerStats {
  ram: StatAggregation,
  money: StatAggregation,
  hackLevelRequired: StatAggregation,
  minDifficultyToMoneyRatio: StatAggregation
}

/**
 * pairing of server info to a field value
 */
export interface ServerValuePair {
  server: Server,
  fieldValue: number
}


/**
 * @param servers list of servers to aggregate stat block over
 * @param getFieldCallback function to get the field to aggregate over from a Server object
 * @param countZeroes whether to include servers with a value for this field of 0 in aggregations
 * 
 * @return aggregate stats of the given field across the given servers
 */
function aggregateStat(servers: Server[], getFieldCallback: (server: Server) => number, countZeroes: boolean=false): StatAggregation {
  const serverWithFieldValues: ServerValuePair[] = servers.map((s) => {
    return {
      server: s,
      fieldValue: getFieldCallback(s)
    }
  });
  const filteredValues = serverWithFieldValues.filter((s) => countZeroes || s.fieldValue > 0);

  const sum = filteredValues.reduce((acc, next) => acc + next.fieldValue, 0);
  const serverCount = filteredValues.length
  const maxInfo = filteredValues.reduce((acc, next) => acc?.fieldValue > next.fieldValue ? acc : next, ({} as ServerValuePair))

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
function analyzeServerStats(servers: Server[]): ServerStats {
  return {
    ram: aggregateStat(servers, (s) => s.maxRam),
    money: aggregateStat(servers, (s) => s?.moneyMax || 0),
    hackLevelRequired: aggregateStat(servers, (s) => s?.requiredHackingSkill || 0),
    minDifficultyToMoneyRatio: aggregateStat(servers, (s) => (s?.moneyMax || 0) / (s?.minDifficulty || 1))
  };
}


/** @param {NS} ns */
export async function main(ns: NS) {
  const serverHostnames = ns.read("servers/serverList.txt").split("|");

  // retrieve server info for all servers
  let fullServerInfo = serverHostnames.map(ns.getServer);
  fullServerInfo.sort((a, b) => {
    let aMax = a.moneyMax;
    let bMax = b.moneyMax; 
    if(aMax === undefined) {
      return -1;
    }
    if(bMax === undefined) {
      return 1;
    }
    return aMax - bMax;
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