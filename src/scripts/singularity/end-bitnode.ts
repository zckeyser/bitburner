import { NS } from "Bitburner";
import { connectToTarget } from "bin/utils/connect";

const BitnodeServer = "w0r1d_d43m0n";

export async function main(ns: NS) {
    endBitnode(ns);
}

export function endBitnode(ns: NS) {
    ns.brutessh(BitnodeServer);
    ns.ftpcrack(BitnodeServer);
    ns.relaysmtp(BitnodeServer);
    ns.httpworm(BitnodeServer);
    ns.sqlinject(BitnodeServer);
    ns.nuke(BitnodeServer);
    connectToTarget(ns, BitnodeServer);
    ns.singularity.installBackdoor();
}