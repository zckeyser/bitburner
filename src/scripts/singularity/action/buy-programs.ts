import { NS } from "Bitburner";

export async function main(ns: NS) {
    const programs = ns.singularity.getDarkwebPrograms();

    for(const program of programs) {
        const programCost = ns.singularity.getDarkwebProgramCost(program);

        while(ns.getServerMoneyAvailable("home") < programCost) {
            await ns.sleep(10000);
        }
        
        ns.singularity.purchaseProgram(program);
    }
}