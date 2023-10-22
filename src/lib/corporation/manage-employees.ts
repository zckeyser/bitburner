import { NS } from "Bitburner";
import { getCorporationDivisions } from "lib/corporation/info";

const PartyValue = 10000000;

export async function maximizeEmployeeProductivity(ns: NS, divisions: string[]|undefined=undefined) {
    while(true) {
        divisions = divisions ?? getCorporationDivisions(ns);

        for(const division of divisions) {
            const divisionCities = ns.corporation.getDivision(division).cities;
            for(const city of divisionCities) {
                const office = ns.corporation.getOffice(division, city);

                if(office.avgEnergy < 99.998) {
                    ns.print(`Buying tea for ${division} in ${city}`);
                    ns.corporation.buyTea(division, city);
                }

                if(office.avgMorale < 99.998) {
                    
                    ns.print(`Throwing party for ${division} in ${city}`);
                    ns.corporation.throwParty(division, city, PartyValue);
                }
            }
        }

        await ns.sleep(ns.corporation.getConstants().secondsPerMarketCycle * 1000);
    }
}
