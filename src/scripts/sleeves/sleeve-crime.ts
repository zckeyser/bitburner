import { CrimeType, NS } from "Bitburner";


const CrimesByPriority = ["Traffick Arms", "Homicide", "Mug"]


export async function main(ns: NS) {
    commitSleeveCrimes(ns);
}

export async function commitSleeveCrimes(ns: NS) {
    const numSleeves = ns.sleeve.getNumSleeves();

    for(let i = 0; i < numSleeves; i++) {
        const sleeve = ns.sleeve.getSleeve(i);
        for(const crime of CrimesByPriority) {
            const crimeSuccess = ns.formulas.work.crimeSuccessChance(sleeve, crime as CrimeType);
            
            // start highest prio crime w/100% success chance, or else lowest prio (aka easiest) crime
            if(crimeSuccess === 1 || crime === CrimesByPriority.slice(-1)[0]) {
                ns.print(`Setting sleeve ${i} to commit crime ${crime}`);
                ns.sleeve.setToCommitCrime(i, crime as CrimeType);
                break;
            }
        }
    }
}