import { NS } from "Bitburner";

export async function main(ns: NS) {
    const productDivisions = ns.corporation.getCorporation().divisions.filter(d => ns.corporation.getDivision(d).makesProducts);

    const alreadyDevelopingDivisions = ns.ps().filter(p => p.filename.includes("develop-for-division.js")).map(p => String(p.args[0]));

    const toBeDeveloped = productDivisions.filter(div => !alreadyDevelopingDivisions.includes(div));
    
    ns.print(`Running ${toBeDeveloped.length} development scripts against: ${toBeDeveloped}`)
    for(const divisionName of toBeDeveloped) {
        ns.run("scripts/corporations/develop-for-division.js", {threads: 1}, divisionName);
    }
}