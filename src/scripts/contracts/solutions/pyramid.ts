import { NS } from "Bitburner";

const InputFile = "/data/input.txt";

const Input = [
  [3],
 [8,3],
[5,6,7],
[3,4,2,7]
]


/** @param ns */
export async function main(ns: NS) {
  let input: number[][] = JSON.parse(ns.read(InputFile));
  
  let pathLen = shortestPath(input, 0, 0);

  ns.tprint(`The shortest path through the pyramid is ${pathLen}`);
}

/**
 * @param pyramid pyramid to calculate off of 
 * @param row of pyramid to calculate path from
 * @param column of pyramid to calculate path from
 */
export function shortestPath(pyramid: number[][], row: number, col: number): number {
  // we hit the end of the pyramid, just return the current value
  if(row == pyramid.length - 1) {
    return pyramid[row][col];
  }

  // we're not at the end, so check from the next row
  const leftShortest = shortestPath(pyramid, row + 1, col);
  const rightShortest = shortestPath(pyramid, row + 1, col + 1);
  return pyramid[row][col] + Math.min(leftShortest, rightShortest);
}


/**
 * 
Minimum Path Sum in a Triangle
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:

[
            [3],
           [9,1],
          [1,9,6],
         [2,2,4,8],
        [3,7,4,8,9],
       [4,8,8,7,5,8],
      [4,6,5,9,9,7,6],
     [5,1,4,5,8,2,1,5],
    [9,9,1,7,4,7,1,3,3],
   [2,2,9,7,2,2,7,6,1,7],
  [3,4,1,1,1,5,9,5,2,7,1]
]

Example: If you are given the following triangle:

[
     [2],
    [3,4],
   [6,5,7],
  [4,1,8,3]
]

The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
 */