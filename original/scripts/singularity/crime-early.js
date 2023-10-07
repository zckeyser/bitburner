import {
  partial
} from "lib/partial";
import {
  getCrimeOpportunityCostStats
} from "lib/crime/crime-stats"

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

/** @param {NS} ns */
export async function main(ns) {
  let optimizeFor = ns.args.length > 0 ? ns.args[0] : "moneyPerSecond";
  let optimalCrime = getOptimalCrime(ns, optimizeFor);
  let notif = `The crime which has been found to be the 
            most efficient for ${optimizeFor} right now is ${optimalCrime.crimeName},
            with a value of ${getNestedValue(optimalCrime, optimizeForExpanded)}.
            The hacking stats for that crime are: ${JSON.stringify(optimalCrime, null, 4)}`;
  ns.print(notif);
  ns.toast(`Starting to commit crime ${optimalCrime.crimeName} for \$${optimalCrime.moneyPerSecond.toLocaleString(undefined, {maximumFractionDigits: 2})}/sec`);
  ns.singularity.commitCrime(optimalCrime.crimeName, false);
}

/**
 * TODO write this docstring
 */
export function getOptimalCrime(ns, optimizeFor="moneyPerSecond") {
  let optimizeForExpanded = optimizeFor.split(".");

  let getCrimeOppCostStats = partial(getCrimeOpportunityCostStats, ns);

  /** @type {CrimeOppCostStats[]} crimeStats */
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
 * @param {Object} object to extract from
 * @param {string[]} keys keys that specify the value to extract, in order
 */
function getNestedValue(object, keys) {
  let val = object;
  for(let i = 0; i < keys.length; i++) {
    const key = keys[i];
    val = val[key];
  }
  return val;
}