import { NS } from "Bitburner";

const GangScriptDirectory = "scripts/gangs"
const PersistentGangScripts = [
    `${GangScriptDirectory}/buy-equipment.js`,
    `${GangScriptDirectory}/recruit-members.js`,
    `${GangScriptDirectory}/manage-gang-jobs.js`
]


export async function main(ns: NS) {
    await manageGang(ns);
}

/**
 * Runs continuously, ensuring that copies of all gang management scripts are running on the current host
 * @param ns BitBurner API
 */
export async function manageGang(ns: NS) {
    while (true) {
        // note: this costs 1/5 the RAM of ns.scriptRunning
        const runningProcesses = ns.ps();
        for(const script of PersistentGangScripts) {
            if(runningProcesses.filter(p => p.filename == script).length === 0) {
                ns.print(`Running script ${script}`);
                ns.run(script);
            }
        }
        
        await ns.sleep(60000);
    }
}