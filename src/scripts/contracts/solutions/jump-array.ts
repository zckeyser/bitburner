import { NS } from "Bitburner";

const InputFile = "/data/input.txt";

export async function main(ns: NS) {
    let inputArg = ns.args[0];
    let input: number[] = [];
    if(inputArg) {
        input = String(inputArg).split(",").map(Number);
    } else {
        ns.tprint(`Reading input from ${InputFile}`);
        input = JSON.parse(ns.read(InputFile));
    }

    let jumps = jumpArray(ns, input);
    ns.tprint(`Jumps required to reach end: ${jumps}`);
}

export function jumpArray(ns: NS, arr: number[]): number {
    let pos = 0;
    let jumps = 0;
    while (pos < arr.length) {
        let newPos = getFarthestJumpFromPos(ns, arr, pos);
        ns.tprint(`Pos: ${pos}, newPos: ${newPos}`);
        // we can't go any farther than where we are, can't finish
        if(newPos === pos) {
            return 0;
        }
        pos = newPos;
        jumps++;
    }

    // todo: something is wonky with this retval
    return jumps;
}

function getFarthestJumpFromPos(ns: NS, arr: number[], pos: number): number {
    let spacesJumpable = arr[pos];

    let movableDistPerJump = [...Array(spacesJumpable + 1).keys()].map(spaces => {
        const newPos = pos + spaces;
        if(newPos > arr.length) {
            return {
                pos: newPos,
                farthestSpaceFrom: Infinity
            };
        }
        return {
            pos: newPos,
            farthestSpaceFrom: newPos + arr[newPos]
        }
    });
    ns.tprint(JSON.stringify(movableDistPerJump))
    let byDist = movableDistPerJump.sort((a, b) => a.farthestSpaceFrom - b.farthestSpaceFrom);
    byDist.reverse();
    
    return byDist[0].pos;
}

/**
 * Array Jumping Game II
You are attempting to solve a Coding Contract. You have 3 tries remaining, after which the contract will self-destruct.


You are given the following array of integers:

2,3,1,1,3,0,3,0,2,1,2,5,2,4,1,2,1,3

Each element in the array represents your MAXIMUM jump length at that position. This means that if you are at position i and your maximum jump length is n, you can jump to any position from i to i+n.

Assuming you are initially positioned at the start of the array, determine the minimum number of jumps to reach the end of the array.

If it's impossible to reach the end, then the answer should be 0.
 */