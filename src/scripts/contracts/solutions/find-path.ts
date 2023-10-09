import { NS } from "Bitburner";
import { TermLogger } from "/lib/Helpers";

let grid = [
    [0,1,0,0,0],
    [0,0,0,1,0]
]


export async function main(ns: NS) {
    const termLogger = new TermLogger(ns);

    let paths = findShortestPaths(grid);

    if(!paths) {
        termLogger.info("No paths found");
    } else {
        termLogger.info(`Found shortest path: ${paths[0]}`);
    }
}

/**
 * Finds the shortest
 * @param grid 
 * @returns 
 */
export function findShortestPaths(grid: number[][]): string[] {
    /**
     * Recursively searches for paths through a grid of numbers, where 1 represents an impassable space
     * @param grid 
     * @param x x
     * @param y 
     * @param visited 
     * @returns 
     */
    function search(grid: number[][], x: number, y: number, visited: string[]): string[] {
        if(y == grid.length && x == grid.length) {
            return ["^end"];
        }
        if(grid[y][x] === 1) {
            // hit a dead end, return no paths
            return [];
        }
        if(visited.includes(JSON.stringify([x, y]))) {
            // we already visited this node, return no paths
            return [];
        }

        const newVisited = [...visited, JSON.stringify([x, y])]

        let paths: string[] = [];
        // check up
        if(y - 1 > 0) {
            let upPaths = search(grid, x, y - 1, newVisited);
            upPaths = upPaths.map(path => `U${path}`);
            paths = paths.concat(upPaths); 
        }

        // check down
        if(y + 1 < grid.length) {
            let downPaths = search(grid, x, y + 1, newVisited);
            downPaths = downPaths.map(path => `D${path}`)
            paths = paths.concat(downPaths);
        }

        // check right
        if(x + 1 < grid.length) {
            let rightPaths = search(grid, x + 1, y, newVisited);
            rightPaths = rightPaths.map(path => `R${path}`);
            paths = paths.concat(rightPaths);
        }
        // check left
        if(x - 1 > 0) {
            let leftPaths = search(grid, x - 1, y, newVisited);
            leftPaths = leftPaths.map(path => `L${path}`);
            paths = paths.concat(leftPaths);
        }
        return paths;
    }
    let paths = search(grid, 0, 0, []);
    let validPaths = paths.filter(path => path.endsWith("^end")).map(path => path.replace("^end", ""));
    validPaths.sort((a, b) => a.length - b.length);
    
    if(validPaths.length === 0) {
        return [];
    }

    const shortestLength = validPaths[0].length
    validPaths.filter((path => path.length === shortestLength));
    
    return validPaths;
}

/**
 * found on powerhouse-fitness
You are located in the top-left corner of the following grid:

  [[0,0,0,0,0,0,1,0,0,0,0],
   [0,0,1,0,0,0,0,1,0,1,0],
   [0,0,1,0,0,1,1,1,0,0,0],
   [0,0,0,0,0,1,0,1,0,0,0],
   [0,0,0,0,1,1,0,0,0,0,0],
   [1,0,0,0,0,0,0,1,0,0,0],
   [0,0,0,1,1,1,0,0,0,0,0],
   [0,0,1,0,0,1,0,0,0,0,0],
   [0,1,1,0,1,0,0,0,0,0,0]]

You are trying to find the shortest path to the bottom-right corner of the grid, but there are obstacles on the grid that you cannot move onto. These obstacles are denoted by '1', while empty spaces are denoted by 0.

Determine the shortest path from start to finish, if one exists. The answer should be given as a string of UDLR characters, indicating the moves along the path

NOTE: If there are multiple equally short paths, any of them is accepted as answer. If there is no path, the answer should be an empty string.
NOTE: The data returned for this contract is an 2D array of numbers representing the grid.

Examples:

    [[0,1,0,0,0],
     [0,0,0,1,0]]

Answer: 'DRRURRD'

    [[0,1],
     [1,0]]

Answer: ''
*/