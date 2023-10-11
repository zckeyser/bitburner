import { NS } from "Bitburner";


export async function main(ns: NS) {
    let [width, length] = JSON.parse(String(ns.args[0])) as number[];
    ns.tprint(uniquePathsByDimensions(width, length));
}


/**
 * 
Unique Paths in a Grid I
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are in a grid with 14 rows and 4 columns, and you are positioned in the top-left corner of that grid. You are trying to reach the bottom-right corner of the grid, but you can only move down or right on each step. Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an array with the number of rows and columns:

[14, 4]
 */
function uniquePathsByDimensions(width: number, length: number) {
    function countPaths(x: number, y: number): number {
        if(x > width || y > length) {
            // passed the edge
            return 0;
        }
        if(x == width - 1 && y == length - 1) {
            // reached the end
            return 1;
        }

        return countPaths(x + 1, y) + countPaths(x, y + 1);
    }

    return countPaths(0, 0);
}