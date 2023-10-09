import { NS } from "Bitburner";

export async function main(ns: NS) {
    let input = String(ns.args[0]).split(",").map(Number);

    let sum = findLargestContiguousSubarraySum(ns, input);

    ns.tprint(`Largest contiguous subarray sum: ${sum}`);
}

export function findLargestContiguousSubarraySum(ns: NS, arr: number[]): number {
    let arrIndices = [...arr.keys()];
    let subarrays: number[][] = [];
    arrIndices.forEach(i => {
        for(let j = i + 1; j < arr.length; j++) {
            let subarr = arr.slice(i, j);
            subarrays.push(subarr);
        }
    });
    let sums = subarrays.map(a => a.reduce((acc, next) => acc + next, 0));
    let sumSet = new Set(sums);
    let maxSum = [...sumSet].reduce((acc, sum) => Math.max(acc, sum), 0);
    return maxSum;
}

/**
 * Subarray with Maximum Sum
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given the following integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return that sum. 'Sum' refers to the sum of all the numbers in the subarray.
8,4,0,3,-2,5,4,10,-1,2,-8,-8,4,4,8,8,9,-9,4,1,5,3,1,2,-4,-7,7,9,-6,4,2
 */