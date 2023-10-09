import { NS } from "Bitburner";

// TODO: move to file input? string input?
const Input: number[][] = [
    [44,18,45,50, 9, 9,23,42,44,13,39,30,29,31],
    [22,29,40,26,25,25,15,12,41,45,13, 5,15, 7],
    [48,34,18,49, 3,17,14,43, 5, 6,34,14, 8,37],
    [ 2, 3,18,25,38, 5,18,18,13,26,48,36,15,50],
    [20,23,45, 1,40,21,36,20,24,43,47,14,40,36],
    [ 4, 9, 1,43, 1, 1,22,31,39,45,14, 4,31, 5]
];


interface MatrixAttributes {
    right: number,
    bottom: number,
    left: number
    top: number,
}



export async function main(ns: NS) {
    let spiraled = spiralize(ns, Input);

    ns.tprint(`Spiraled array: [${spiraled}]`);
}

export function spiralize(ns: NS, arr: number[][]): number[] {
    let spiraled: number[] = [];
    // track visited coordinates, using JSON strings for pairs because arrays are compared by reference so they don't work
    let visited: string[] = [];

    let bounds: MatrixAttributes = {
        right: arr[0].length - 1,
        bottom: arr.length - 1,
        left: 0,
        // we start at the top, so the first time we reach it we actually want to be 1 below already
        top: 1,
    };

    let [x, y] = [0, 0];
    let isEnd = false;

    while(!isEnd) {
        // naive approach because i was running into weird behavior with a generalized implementation
        while(!isEnd) {
            // go right
            for(; x < bounds.right; x++) {
                if(visited.includes(JSON.stringify([x, y]))) {
                    isEnd = true;
                    break;
                } else {
                    visited.push(JSON.stringify([x, y]));
                    spiraled.push(arr[y][x]);
                }
            }
            bounds.right--;
            if(isEnd) {
                break;
            }

            // go down
            for(; y < bounds.bottom; y++) {
                if(visited.includes(JSON.stringify([x, y]))) {
                    isEnd = true;
                    break;
                } else {
                    visited.push(JSON.stringify([x, y]));
                    spiraled.push(arr[y][x]);
                }
            }
            if(isEnd) {
                break;
            }
            bounds.bottom--;

            // go left
            for(; x > bounds.left; x--) {
                if(visited.includes(JSON.stringify([x, y]))) {
                    isEnd = true;
                    break;
                } else {
                    visited.push(JSON.stringify([x, y]));
                    spiraled.push(arr[y][x]);
                }
            }
            if(isEnd) {
                break;
            }
            bounds.left++;

            // go up
            for(; y > bounds.top; y--) {
                if(visited.includes(JSON.stringify([x, y]))) {
                    isEnd = true;
                    break;
                } else {
                    visited.push(JSON.stringify([x, y]));
                    spiraled.push(arr[y][x]);
                }
            }
            bounds.top++;
        }
    }

    return spiraled
}

/**
 * Spiralize Matrix
 * found on omnitek
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given the following array of arrays of numbers representing a 2D matrix, return the elements of the matrix as an array in spiral order:

    [
        [44,18,45,50, 9, 9,23,42,44,13,39,30,29,31]
        [22,29,40,26,25,25,15,12,41,45,13, 5,15, 7]
        [48,34,18,49, 3,17,14,43, 5, 6,34,14, 8,37]
        [ 2, 3,18,25,38, 5,18,18,13,26,48,36,15,50]
        [20,23,45, 1,40,21,36,20,24,43,47,14,40,36]
        [ 4, 9, 1,43, 1, 1,22,31,39,45,14, 4,31, 5]
    ]
    44,18,45,50,9,9,23,42,44,13,39,30,29,31,7,37,50,36,5,31,4,14,45,39,31,22,1,1,43,1,9,4,20,2,48,22,29,40,26,25,25,15,12,41,45,13,5,15


Here is an example of what spiral order should be:

    [
        [1, 2, 3]
        [4, 5, 6]
        [7, 8, 9]
    ]

Answer: [1, 2, 3, 6, 9, 8 ,7, 4, 5]

Note that the matrix will not always be square:

    [
        [1,  2,  3,  4]
        [5,  6,  7,  8]
        [9, 10, 11, 12]
    ]

Answer: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
 */

 /**
     [1,  2,  3,  4]
     [5,  6,  7,  8]
     [9, 10, 11, 12]
     (0, 0), (1, 0), (2, 0), (3, 0), (3, 1), (3, 2), (2, 2), (2, 1), (2, 0), (1, 0), (1, 1), (1, 2)
     {
        top: 2,
        bottom: 1
     }
     increase x -> right edge
     increase y -> bottom edge
     decrease x -> left edge
     decrease y -> top edge - 1
     increase x -> right edge - 1
     increase y -> bottom edge - 1
     ...
     */



// TODO: get genericized approach to work

// const Directions = ["right", "bottom", "left", "top"];

// interface SingleDirectionFunctions {
//     move: (x: number, y: number) => number[],
//     compare: (x: number, y: number, bound: number) => boolean,
//     moveBound: (bound: number) => number
// }
// interface DirectionFunctions {
//     right: SingleDirectionFunctions,
//     bottom: SingleDirectionFunctions,
//     left: SingleDirectionFunctions,
//     top: SingleDirectionFunctions
// }

// const DirectionalFuncs: DirectionFunctions = {
//     right: {
//         move: (x: number, y: number) => [x + 1, y],
//         compare: (x: number, y: number, bound: number) => x <= bound,
//         moveBound: (bound: number) => bound -= 1
//     },
//     bottom: {
//         move: (x: number, y: number) => [x, y + 1],
//         compare: (x: number, y: number, bound: number) => y <= bound,
//         moveBound: (bound: number) => bound -= 1
//     },
//     left: {
//         move: (x: number, y: number) => [x - 1, y],
//         compare: (x: number, y: number, bound: number) => x >= bound,
//         moveBound: (bound: number) => bound += 1
//     },
//     top: {
//         move: (x: number, y: number) => [x, y - 1],
//         compare: (x: number, y: number, bound: number) => y >= bound,
//         moveBound: (bound: number) => bound += 1
//     }
// }
// Directions.forEach((moveDirection) => {
//     ns.tprint(`Moving direction ${moveDirection}`);
//     if(isEnd) {
//         // already passed our end point, just exit
//         return;
//     }
//     let bound = bounds[moveDirection];
//     let compare = DirectionalFuncs[moveDirection].compare;
//     let moveTransform = DirectionalFuncs[moveDirection].move;
//     let moveBound = DirectionalFuncs[moveDirection].moveBound;

//     do {
//         ns.tprint(`compare(${x}, ${y}, ${bound}) = ${compare(x, y, bound)}`)
//         ns.tprint(`Current coordinates: (${x}, ${y})`);
//         [x, y] = [newX, newY];

//         // we've hit a visited node, thus we've reached the end
//         if(visited.includes(JSON.stringify([x, y]))) {
//             isEnd = true;
//             return;
//         } else {
//             visited.push(JSON.stringify([x, y]));
//         }

//         spiraled.push(arr[y][x]);
//         [newX, newY] = moveTransform(x, y);
//     } while(compare(x, y, bound))
//     bounds[moveDirection] = moveBound(bounds[moveDirection]);
//     ns.tprint(`Bounds after transform for direction ${moveDirection}: ${Object.entries(bounds)}`);
// });