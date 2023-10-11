import { NS } from "Bitburner";

export async function main(ns: NS) {
    let input: (number | number[])[] = JSON.parse(String(ns.args[0]));
    let k: number = input[0] as number;
    let prices: number[] = input[1] as number[];

    // for stock trader 2 case w/unlimited trades
    if(k === -1) {
        k = prices.length;
    }

    let bestTrade = analyzeTrades(k, prices, ns);
    ns.tprint(`The best available trade margin is: ${bestTrade}`);
}

/**
 * 
 * @param maxTransactions 
 * @param prices 
 * @param ns 
 * @returns 
 */
export function analyzeTrades(maxTransactions: number, prices: number[], ns?: NS): number {
    if(prices.length < 2) {
        return 0;
    }
    if (maxTransactions > prices.length / 2) { // Is this valid if the input array hasn't been optimized?
        let sum = 0;
        for (let day = 1; day < prices.length; day++) {
            sum += Math.max(prices[day] - prices[day - 1], 0);
        }
        ns?.print(`More transactions available than can be used. Maximum profit is ${sum}.`);
        return sum;
    }

    const rele = Array(maxTransactions + 1).fill(0); 
    const hold = Array(maxTransactions + 1).fill(Number.MIN_SAFE_INTEGER);

    for (let day = 0; day < prices.length; day++) {
        const price = prices[day];
        for (let i = maxTransactions; i > 0; i--) {
            rele[i] = Math.max(rele[i], hold[i] + price);
            hold[i] = Math.max(hold[i], rele[i - 1] - price);
        }
    }

    const profit = rele[maxTransactions];
    ns?.print(`Maximum profit is ${profit}`);
    return profit
}

/**
 * Algorithmic Stock Trader IV
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are given the following array with two elements:

[2, [197,83,126,36,21,2,93,150,175,9,76,20,129,165,174,179,116,110,71,144,187,89,134,200,94,127,39,169,176,196,158,191,33]]

The first element is an integer k. The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.

Determine the maximum possible profit you can earn using at most k transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.

If no profit can be made, then the answer should be 0.
 */