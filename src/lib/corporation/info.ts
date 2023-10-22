import { NS } from "Bitburner";

export function getCorporationDivisions(ns: NS): string[] {
    return ns.corporation.getCorporation().divisions;
}
