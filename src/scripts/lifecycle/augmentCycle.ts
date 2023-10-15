import { NS } from "Bitburner";
import { startOptimalCrime, workCrime } from "scripts/singularity/crime/crime";
import { CombatTrainingParams, trainCombatSkills } from "scripts/singularity/training/combat-training";
import { trainHacking } from "scripts/singularity/training/hack-training";

/**
 * Script to run through an entire lifecycle, up to getting augments
 * and reinstalling then doing it again.
 */
export async function main(ns: NS) {

}

export async function liveLife(ns: NS) {
    let hackThreshold = 50;
    let combatThreshold = 125;

    await trainHacking(ns, hackThreshold);
    await trainCombatSkills(ns, {
        gymToUse: "powerhouse gym",
        statThreshold: combatThreshold,
        skipCrime: true,
    } as CombatTrainingParams)

    // work up to 2m in money so we can buy hacks
    await workCrime(ns, 2 * Math.pow(10, 6));

    ns.singularity.purchaseProgram("BruteSSH.exe");
    ns.singularity.purchaseProgram("FTPCrack.exe");

    // now we're ready to start some hacks
    
    
    
    /**
     * pseudocode
     * trainHack -> 40
     * trainCombat -> 100
     * crime -> $1.5m
     * buy BruteSSH.exe
     * buy FTPCrack.exe
     * 
     * if homeRam < 1024
     *     start psudo-batcher
     * else
     *     start batcher
     * 
     * do crime until util server is purchasable
     * buy util server
     * move batcher mangement process to util server
     * 
     * if past early game mults, start buy-servers 1024 + upgrade-servers 2048 on util-serv
     * periodically prune batches in start-batchers -- refresh server target mapping every 2 hours?
     * otherwise, skip server buying because we're too poor and it'll take too long to get productive
     * 
     * figure out what faction we're going for
     * work towards reqs for that faction; TODO: encode faction reqs in constants
     * once ready, wait for faction invite + accept
     * work faction rep until able to buy desired augments for run
     * desired augments must be calculated off of earning potential, aka mults, plus what we've already done
     * work crime + run batchers to make enough money for augments
     * 
     * once all desired augments that are considered feasible for this run are purchased, install them and do it again
     */
}