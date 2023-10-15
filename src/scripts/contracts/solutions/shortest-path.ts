import { NS } from "Bitburner";

export async function main(ns: NS) {
    const input: number[][] = JSON.parse(ns.read("data/input.txt"));
    ns.tprint(shortestPath(input));
}

// shamelessly stolen from https://github.com/jjclark1982/bitburner-scripts/blob/main/contracts/solvers.js#L393-L453C2
// TODO: get the algo in find-path.ts working
function shortestPath(data: number[][]) {
    function findWay(position: number[], end: number[], data: number[][]) {
        var queue: number[][][] = [];

        data[position[0]][position[1]] = 1;
        queue.push([position]); // store a path, not just a position

        while (queue.length > 0) {
            var path = queue.shift(); // get the path out of the queue
            if (!path) {
                throw Error("Popped from empty queue and got empty path");
            }
            var pos = path[path.length - 1]; // ... and then the last position from it
            var direction = [
                [pos[0] + 1, pos[1]],
                [pos[0], pos[1] + 1],
                [pos[0] - 1, pos[1]],
                [pos[0], pos[1] - 1]
            ];

            for (var i = 0; i < direction.length; i++) {
                // Perform this check first:
                if (direction[i][0] == end[0] && direction[i][1] == end[1]) {
                    // return the path that led to the find
                    return path.concat([end]);
                }

                if (direction[i][0] < 0 || direction[i][0] >= data.length
                    || direction[i][1] < 0 || direction[i][1] >= data[0].length
                    || data[direction[i][0]][direction[i][1]] != 0) {
                    continue;
                }

                data[direction[i][0]][direction[i][1]] = 1;
                // extend and push the path on the queue
                queue.push(path.concat([direction[i]]));
            }
        }
    }

    function annotate(path: number[][]) {
        // Work through each array to see if we can get to Iteration
        let currentPosition = [0, 0];
        let iteration = '';

        // start at the 2nd array
        for (let i = 1; i < path.length; i++) {

            // check each array element to see which one changed
            if (currentPosition[0] < path[i][0]) iteration = iteration + 'D';
            if (currentPosition[0] > path[i][0]) iteration = iteration + 'U';

            if (currentPosition[1] < path[i][1]) iteration = iteration + 'R';
            if (currentPosition[1] > path[i][1]) iteration = iteration + 'L';

            currentPosition = path[i];
        }

        return iteration;
    }
    var path = findWay([0, 0], [data.length - 1, data[0].length - 1], data);
    if (path) return annotate(path);
    return "";
}

