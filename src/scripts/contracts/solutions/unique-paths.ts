// import { NS } from "Bitburner";
// import { findPaths } from "scripts/contracts/solutions/find-path";

// // TODO: do this dynamically
// const Input = [
//     [0,0,0,0,0,0,0,0],
//     [0,0,0,0,0,1,0,0],
//     [1,0,0,0,0,1,0,0],
//     [0,0,0,0,0,0,0,0],
//     [0,0,1,0,0,0,1,0],
//     [0,0,0,0,0,0,0,0],
//     [0,0,0,0,0,0,0,0],
// ];

// export async function main(ns: NS) {
//     ns.tprint(`Unique paths: ${getUniquePathCount(ns, Input)}`);
// }

// /**
//  * Counts inque paths available through a grid
//  * @param grid grid of 0's and 1's, where 0's are passable and 1's are impassable 
//  * @return number of unique paths
//  */
// export function getUniquePathCount(ns: NS, grid: number[][]): number {
//     let paths = findPaths(grid);
//     ns.tprint(paths);

//     let pathSet = new Set(paths);

//     return pathSet.size;
// }

// /**
// Unique Paths in a Grid II
// You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


// You are located in the top-left corner of the following grid:

// 0,0,0,0,0,0,0,0,
// 0,0,0,0,0,1,0,0,
// 1,0,0,0,0,1,0,0,
// 0,0,0,0,0,0,0,0,
// 0,0,1,0,0,0,1,0,
// 0,0,0,0,0,0,0,0,
// 0,0,0,0,0,0,0,0,

// You are trying reach the bottom-right corner of the grid, but you can only move down or right on each step. Furthermore, there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

// Determine how many unique paths there are from start to finish.

// NOTE: The data returned for this contract is an 2D array of numbers representing the grid.
//  */