import { RepoInit, TermLogger } from "/lib/Helpers";
export async function main(ns) {
    const logger = new TermLogger(ns);
    const initRepo = new RepoInit(ns, logger);
    await initRepo.downloadAllFiles();
}
