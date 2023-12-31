import {NS} from "Bitburner"
import {
  partial
} from "lib/partial";
import {
  CrimeOppCostStats,
  getCrimeOpportunityCostStats
} from "lib/crime/crime-stats"
import { TermLogger } from "/lib/Helpers";

const Crimes = [
  "Shoplift",
  "Rob Store",
  "Mug",
  "Larceny",
  "Deal Drugs",
  "Bond Forgery",
  "Traffick Arms",
  "Homicide",
  "Grand Theft Auto",
  "Kidnap",
  "Assassination",
  "Heist"
];

/** @param ns BitBurner API */
export async function main(ns: NS) {
  let scriptFlags = ns.flags([["optimize", "moneyPerInterval"], ["interval", 180]])
  let optimizeFor = String(scriptFlags.optimize);
  let interval = Number(scriptFlags.interval);
  startOptimalCrime(ns, optimizeFor, interval, true);
}

export async function workCrime(ns: NS, moneyThreshold: number, interval=180, timeLimit: number=Infinity) {
  let start = Date.now();
  let optimalCrime = getOptimalCrime(ns, "moneyPerSecond", interval);
  let nextOptimalCrime: CrimeOppCostStats|undefined = undefined;

  while(ns.getServerMoneyAvailable("home") < moneyThreshold && Date.now() - start < timeLimit) {
    // if there's a new optimal crime (automatically true on first run), then work that instead
    if(optimalCrime.crimeName != nextOptimalCrime?.crimeName) {
      ns.singularity.commitCrime(optimalCrime.crimeName);
    }
    await ns.sleep(30000);
    nextOptimalCrime = getOptimalCrime(ns, "moneyPerSecond", interval);
  }
}

export function startOptimalCrime(ns: NS, optimizeFor: string="moneyPerInterval", interval: number=180, logToTerm=false) {
  let logger = new TermLogger(ns);
  
  let optimalCrime = getOptimalCrime(ns, optimizeFor, interval);
  let notif = `The crime which has been found to be the 
            most efficient for ${optimizeFor} right now is ${optimalCrime.crimeName}.
            The hacking stats for that crime are: ${JSON.stringify(optimalCrime, null, 4)}`;
  if(logToTerm) {
    logger.info(notif);
  } else {
    ns.print(notif);
  }
  ns.toast(`Starting to commit crime ${optimalCrime.crimeName} for \$${optimalCrime.moneyPerSecond.toLocaleString(undefined, {maximumFractionDigits: 2})}/sec`);
  ns.singularity.commitCrime(optimalCrime.crimeName, false);
}

/**
 * Gets the crime with the highest value for a given field to optimize for, defaulting to expected money per second
 * 
 * @param ns BitBurner API
 * @param optimizeFor the field of CrimOppCostStats to optimize for when prioritizing jobs. Formatted as pseudo-JSONPath that only supports `.` operators, e.g. expPerSecond.hacking
 * @param interval interval of time in which the crime should run. good for avoiding large, low-prob, huge-reward jobs like heists.
 * @return stats + name of the optimal crime, optimized according to the given parameters
 */
export function getOptimalCrime(ns: NS, optimizeFor: string, interval: number=180): CrimeOppCostStats {
  let optimizeForExpanded = optimizeFor.split(".");
  let getCrimeOppCostStats = partial(getCrimeOpportunityCostStats, ns, interval);
  let crimeStats = Crimes.map(getCrimeOppCostStats);

  crimeStats.sort((a, b) => {
    // this lets us grab arbitrary nested stat fields via simple pseudo-jsonpath
    // e.g. expPerSecond.hacking -> a["expPerSecond"]["hacking"]
    const aVal = getNestedValue(a, optimizeForExpanded);
    const bVal = getNestedValue(b, optimizeForExpanded);
    return aVal - bVal;
  });
  crimeStats.reverse();

  const optimalCrime = crimeStats[0];
  return optimalCrime;
}

/**
 * gets a nested key from an object, given an array of keys
 * e.g. getNestedValue(
 *        {expPerSecond: {hacking: 5, strength: 3}},
 *        ["expPerSecond", "hacking"]
 *      ) -> 5
 * @param object to extract from
 * @param keys keys that specify the value to extract, in order
 * @return whatever value is stored in the object at that key; coded as number because in this context (crime stats) result will always be a number
 */
function getNestedValue(object: Object, keys: string[]): number {
  let val = object;
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    val = val[key];
  }
  return Number(val);
}