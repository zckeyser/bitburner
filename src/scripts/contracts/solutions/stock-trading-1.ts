import { NS } from "Bitburner";


export async function main(ns: NS) {
    let input = String(ns.args[0]).split(",").map(Number);
    let bestTrade = analyzeTrades(input);
    ns.tprint(`The best available trade margin is: ${bestTrade}`);
}


export function analyzeTrades(prices: number[]): number {
    const bestTrade = prices.reduce((maxMargin, price, i) => {
        const possibleMargins = prices.slice(i).map(laterPrice => laterPrice - price);
        return possibleMargins.reduce((acc, next) => Math.max(maxMargin, Math.max(acc, next)), 0)
    }, 0)

    return bestTrade;
}


/**
 * Algorithmic Stock Trader I
You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.


You are given the following array of stock prices (which are numbers) where the i-th element represents the stock price on day i:

89,95,15,121,123,78,159,161,65,63,72,107,200 => 185 (15 on day 3, 200 on last day)

Determine the maximum possible profit you can earn using at most one transaction (i.e. you can only buy and sell the stock once). If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it
 */