import { NS, Player, Server } from "Bitburner";

/**
 * Gives the expected earnings per hack thread against a server
 * @param ns 
 * @param server 
 * @param player 
 */
export function getExpectedServerEarnings(ns: NS, server: Server, player: Player) {
    const maxMoney = (server.moneyMax || 0);

    const hackChance = ns.formulas.hacking.hackChance(server, player);
    const hackPercent = ns.formulas.hacking.hackPercent(server, player);

    ns.print(`Hacking stats for ${server.hostname}: \n\tHack chance: ${hackChance}\n\tHack percent: ${hackPercent}\n\tMax money: $${maxMoney}`);

    return maxMoney * hackPercent * hackChance;
}
