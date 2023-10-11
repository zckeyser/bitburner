/**
 * 
Merge Overlapping Intervals
You are attempting to solve a Coding Contract. You have 15 tries remaining, after which the contract will self-destruct.


Given the following array of arrays of numbers representing a list of intervals, merge all overlapping intervals.

[[11,19],[1,8],[10,12],[19,25],[4,9],[16,17],[24,29],[5,15],[1,11],[24,33],[24,25],[3,8],[15,20],[24,29],[6,16]]

Example:

[[1, 3], [8, 10], [2, 6], [10, 16]]

would merge into [[1, 6], [8, 16]].

The intervals must be returned in ASCENDING order. You can assume that in an interval, the first number will always be smaller than the second.
 */

import { NS } from "Bitburner";

export async function main(ns: NS) {
    const input: number[][] = JSON.parse(String(ns.args[0]));
    ns.tprint(`Merging intervals in ${input}`);

    ns.tprint(mergeIntervals(ns, input))
}

export function mergeIntervals(ns: NS, intervals: number[][]): number[][] {
    let merged = [...intervals];

    let i = 0;
    while(hasOverlappingIntervals(merged)) {
        let interval = merged[i];
        const overlappingIntervals = merged.filter((otherInterval) => isOverlapping(interval, otherInterval));
        
        if(!overlappingIntervals) {
            // there are still overlapping intervals in the array, but not off this index. Check the next.
            i = (i + 1) % merged.length;
            continue;
        }
        const nonOverlappingIntervals = merged.filter((otherInterval) => !isOverlapping(interval, otherInterval));
        let mergedInterval = overlappingIntervals.reduce(([accLow, accHigh], [otherLow, otherHigh]) => [Math.min(otherLow, accLow), Math.max(otherHigh, accHigh)], interval);
        merged = [mergedInterval, ...nonOverlappingIntervals];
    }

    return merged;
}


function hasOverlappingIntervals(intervals: number[][]): boolean {
    for(let i = 0; i < intervals.length - 1; i++) {
        for(let j = i; j < intervals.length; j++) {
            if(isOverlapping(intervals[i], intervals[j])) {
                return true;
            }
        }
    }

    return false;
}


function isOverlapping(a: number[], b: number[]): boolean {
    const [aLow, aHigh] = a;
    const [bLow, bHigh] = b;
    return bLow < aHigh && bHigh > aLow
}
