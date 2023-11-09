import { NS } from "Bitburner";
import { formatNumber } from "/lib/Helpers";

const DesiredEquipmentTypes = ["Weapon", "Armor", "Vehicle", "Augmentation"];


export async function main(ns: NS) {
    await buyEquipment(ns);
}

export async function buyEquipment(ns: NS) {
    while(true) {
        const equipmentList = getCombatUpgrades(ns);
        const equipCosts = equipmentList.map(equipmentName => [equipmentName, ns.gang.getEquipmentCost(equipmentName)]);
        // entries are [equipmentName, equipmentCost], so sort by second item
        // because we want to buy the cheapest upgrades first
        const sortedEquipCosts = equipCosts.sort((a, b) => (a[1] as number) - (b[1] as number));

        // TODO: make this account for members added after starting
        for(const entry of sortedEquipCosts) {
            const equipmentName = entry[0] as string;
            const equipmentCost = entry[1] as number;

            for(const memberName of ns.gang.getMemberNames()) {
                const member = ns.gang.getMemberInformation(memberName)
                if(!member.upgrades.includes(equipmentName)) {
                    if(ns.getServerMoneyAvailable("home") < equipmentCost) {
                        ns.print(`Skipping ${equipmentName} on ${memberName} because we can't afford it right now`);
                        continue;
                    }
                    
                    ns.print(`Purchasing ${equipmentName} for ${memberName} for $${formatNumber(equipmentCost)}`)
                    ns.gang.purchaseEquipment(memberName, equipmentName);
                } else {
                    ns.print(`Member ${memberName} already has ${equipmentName}`);
                }
            }
        }

        ns.print(`Completed full equipment cycle, sleeping for 1m and checking again.`);
        await ns.sleep(60000);
    }
}


export function getCombatUpgrades(ns: NS): string[] {
    return ns.gang.getEquipmentNames().filter(equipName => isCombatEquipment(ns, equipName));
}


function isCombatEquipment(ns: NS, equipName: string): boolean {
    const equipStats = ns.gang.getEquipmentStats(equipName);
    const agiBonus = (equipStats.agi ?? 0);
    const defBonus = (equipStats.def ?? 0);
    const dexBonus = (equipStats.dex ?? 0);
    const strBonus = (equipStats.str ?? 0);
    return agiBonus > 0 || defBonus > 0 || dexBonus > 0 || strBonus > 0;
}