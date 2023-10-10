import { AutocompleteData, NS } from "Bitburner";

export async function main(ns: NS) {
    let solutionScript = String(ns.args[0]);
    let args = ns.args.slice(1);

    let ran = ns.run(`/scripts/contracts/solutions/${solutionScript}`, {threads: 1}, ...args);

    if(!ran) {
        throw Error("Failed to start script");
    }
}

// TODO: figure out why this doesn't work
// https://bitburner.readthedocs.io/en/latest/netscript/advancedfunctions/autocomplete.html
export function autocomplete(data: AutocompleteData, args: string[]): string[] {
    return [...data.scripts.filter(scriptName => scriptName.startsWith("/scripts/contracts/solutions/"))];
}