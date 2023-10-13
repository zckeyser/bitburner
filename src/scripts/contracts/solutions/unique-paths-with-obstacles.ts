/**
Unique Paths in a Grid II
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are located in the top-left corner of the following grid:

0,0,0,0,0,0,0,0,
0,0,0,0,0,1,0,0,
1,0,0,0,0,1,0,0,
0,0,0,0,0,0,0,0,
0,0,1,0,0,0,1,0,
0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,

You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

Determine how many unique paths there are from start to finish.

NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
*/

import { NS } from "Bitburner";

export async function main(ns: NS) {
    const input: number[][] = JSON.parse(ns.read("data/input.txt"));
    
    ns.tprint(uniquePathsInGrid(ns, input));
}


function uniquePathsInGrid(ns: NS, grid: number[][]): number {
    const width = grid[0].length;
    const length = grid.length;
    function countPaths(x: number, y: number): number {
        if(x === width || y === length) {
            // passed the edge
            return 0;
        } else if(grid[y][x] === 1) {
            // impassable space
            return 0;
        } else if(x === width - 1 && y === length - 1) {
            // reached the end
            return 1;
        }

        return countPaths(x + 1, y) + countPaths(x, y + 1);
    }

    return countPaths(0, 0);
}