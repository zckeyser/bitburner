import { NS } from "Bitburner";
import { solvers } from "scripts/contracts/convenience/solvers";

// 10s
const SolveTimeout = 10000;

export interface ContractInfo {
    host: string
    file: string
    type: string
    triesRemaining: number
}


export async function main(ns: NS) {
    ns.disableLog("scan");
    ns.disableLog("sleep");
    while (true) {
        await attemptAllContracts(ns);
        await ns.sleep(60 * 1000);
    }
}

export async function attemptAllContracts(ns: NS) {
    const contracts = getContracts(ns);
    ns.print(`Found ${contracts.length} contracts.`);
    for (const contract of contracts) {
        await attemptContract(ns, contract);
    }
}

export function getContracts(ns: NS): ContractInfo[] {
    const contracts: ContractInfo[] = [];
    for (const host of getAllHosts(ns)) {
        for (const file of ns.ls(host)) {
            if (file.match(/\.cct$/)) {
                const contract = {
                    host: host,
                    file: file,
                    type: ns.codingcontract.getContractType(file, host),
                    triesRemaining: ns.codingcontract.getNumTriesRemaining(file, host)
                };
                contracts.push(contract);
            }
        }
    }
    return contracts;
}

export async function attemptContract(ns: NS, contract: ContractInfo) {
    const solver = solvers[contract.type];
    if (solver) {
        ns.print("Attempting " + JSON.stringify(contract, null, 2));
        const data = ns.codingcontract.getData(contract.file, contract.host);
        try {
            const solution: any = await runInWebWorker(solver, [data]);
            const reward = ns.codingcontract.attempt(solution, contract.file, contract.host);
            if (reward) {
                ns.tprint(`${reward} for solving "${contract.type}" on ${contract.host}`);
                ns.print(`${reward} for solving "${contract.type}" on ${contract.host}`);
            }
            else {
                ns.tprint(`ERROR: Failed to solve "${contract.type}" on ${contract.host}`);
                delete solvers[contract.type];
            }
        }
        catch (error) {
            ns.print(`ERROR solving ${contract.type}: ${error}`);
        }
    }
    else {
        ns.print(`WARNING: No solver for "${contract.type}" on ${contract.host}`);
    }
}

const hostCache = new Set();
function getAllHosts(ns: NS) {
    const scanned = hostCache;
    const toScan = ['home'];
    while (toScan.length > 0) {
        const host = toScan.shift();
        scanned.add(host);
        for (const nextHost of ns.scan(host)) {
            if (!(nextHost in scanned)) {
                toScan.push(nextHost);
            }
        }
    }
    const allHosts = Object.keys(scanned);
    return allHosts;
}

async function runInWebWorker(fn: (...args: any[]) => any, args: any[], maxMs = SolveTimeout) {
    return new Promise((resolve, reject) => {
        let running = true;
        const worker = makeWorker(fn, (result: any) => {
            running = false;
            resolve(result);
        });
        setTimeout(() => {
            if (running) {
                reject(`${maxMs} ms elapsed.`);
            }
            worker.terminate();
        }, maxMs);
        worker.postMessage(args);
    });
}

function makeWorker(workerFunction: (...args: any[]) => any, cb: (result: any) => void) {
    const workerSrc = `
    handler = (${workerFunction});
    onmessage = (e) => {
        result = handler.apply(this, e.data);
        postMessage(result);
    };`;
    const workerBlob = new Blob([workerSrc]);
    const workerBlobURL = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerBlobURL);
    worker.onmessage = (e) => {
        cb(e.data);
    };
    return worker;
}