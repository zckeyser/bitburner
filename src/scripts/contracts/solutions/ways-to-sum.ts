import { NS } from "Bitburner";

const cache = new Map();


export async function main(ns: NS) {
    const input = Number(ns.args[0]);
    const responsePort = ns.args[1];
    ns.print(`Input: ${input}`);

    const answer = totalWaysToSum(input);
    ns.tprint(`Ways to sum ${input} is ${answer}`);
}

function totalWaysToSum(n: number): number {
    const ways = [1];
    ways.length = n + 1;
    ways.fill(0, 1);
    for (let i = 1; i < n; ++i) {
        for (let j = i; j <= n; ++j) {
            ways[j] += ways[j - i];
        }
    }

    return ways[n];
}

/**
 * Total Ways to Sum
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


It is possible write four as a sum in exactly four different ways:

    3 + 1
    2 + 2
    2 + 1 + 1
    1 + 1 + 1 + 1

How many different distinct ways can the number 11 be written as a sum of at least two positive integers?
 */