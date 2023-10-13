import { NS } from "Bitburner";
import { TermLogger } from "/lib/Helpers";

// for some reason, this abstraction was 
// causing ram inflation, from 1.75 -> 2.15.
// stopped using it for efficiency's sake.
export class Action {
    readonly ns: NS;
    readonly logger: TermLogger;
    
    constructor(ns: NS) {
        this.ns = ns;
        this.logger = new TermLogger(ns);
    }

    async do(func: () => Promise<any>) {
        await func()
    }
}