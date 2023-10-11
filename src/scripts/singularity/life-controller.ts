import { farmFactionForAugments } from "scripts/singularity/factions/faction-farming";
import { trainCombatSkills } from "scripts/singularity/training/combat-training";
import { NS } from "Bitburner";

/**
 * Runs a loop where we train until we can consistently succeed at homicide for farming,
 * then starts hunting for factions based on a lib of faction reqs pulled from the docs.
 * 
 * Once a faction w/available augments is found, we grind for the available augmentations,
 * buy them all, install them and start the cycle again.
 * @param ns 
 */
export async function main(ns: NS) {
    let scriptFlags = ns.flags([["--focus", false]]);
    let focus = Boolean(scriptFlags.focus);

    // TODO: how to find factions?
    let faction = "";

    farmFactionForAugments(ns, faction, focus);
}