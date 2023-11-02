import { bootstrapServer } from "scripts/servers/bootstrap-server";
import { RepoInit, TermLogger } from "/lib/Helpers";
import type { NS }              from "Bitburner";

export async function main(ns: NS) {
    const logger   = new TermLogger(ns);
    const initRepo = new RepoInit(ns, logger);

    await initRepo.downloadAllFiles();
    logger.info(`Bootstrapping servers...`)
    for(const server of ns.getPurchasedServers()) {
        bootstrapServer(ns, server);
    }
}