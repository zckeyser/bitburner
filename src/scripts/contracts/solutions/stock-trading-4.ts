import { NS } from "Bitburner";

let nsRef: NS|null = null;


export async function main(ns: NS) {
    nsRef = ns;
    let input: (number | number[])[] = JSON.parse(String(ns.args[0]));
    let k: number = input[0] as number;
    let prices: number[] = input[1] as number[];
    let bestTrade = analyzeTrades(k, prices);
    ns.tprint(`The best available trade margin is: ${bestTrade}`);
}


export function analyzeTrades(k: number, prices: number[]): number {
    // todo: probably don't need to use an object here, can prob just use arrays
    const subsequentMarginListByDay = prices.map((price, i) => {
        return prices.slice(i).map(laterPrice => laterPrice - price);
    });
    nsRef?.tprint(subsequentMarginListByDay);

    let overallBestTrade = 0;
    for (let i = 0; i < subsequentMarginListByDay.length; i++) {
        overallBestTrade = Math.max(getBestTradeForDay(k, i, subsequentMarginListByDay), overallBestTrade);
    }


    return overallBestTrade;
    // return bestTrade;
}

function getBestTradeForDay(k: number, day: number, subsequentMarginListByDay: number[][]): number {
    // we hit max trades
    if (k === 0) {
        return 0;
    }
    const upcomingMargins = subsequentMarginListByDay[day];
    let potentialTradeValues: number[] = [];
    for (let offset = 0; offset < subsequentMarginListByDay.length; offset++) {
        const tradeValue = upcomingMargins[offset] + getBestTradeForDay(k - 1, day + offset, subsequentMarginListByDay);
        potentialTradeValues.push(tradeValue);
    }

    return potentialTradeValues.reduce((acc, next) => Math.max(acc, next), 0);
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