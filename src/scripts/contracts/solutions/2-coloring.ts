import { NS } from "Bitburner";

export async function main(ns: NS) {
    const input = JSON.parse(String(ns.args[0]))
    const N: number = input[0];
    const edges: number[][] = input[1];
    const graph = colorGraph(N, edges);
    ns.tprint(graph);
}

export function colorGraph(N: number, edges: number[][]): number[] {
    //Helper function to get neighbourhood of a vertex
    function neighbourhood(vertex: number) {
        const adjLeft = edges.filter(([a, _]) => a == vertex).map(([_, b]) => b);
        const adjRight = edges.filter(([_, b]) => b == vertex).map(([a, _]) => a);
        return adjLeft.concat(adjRight);
    }

    const coloring = Array(N).fill(undefined);
    while (coloring.some((val) => val === undefined)) {
        //Color a vertex in the graph
        const initialVertex = coloring.findIndex((val) => val === undefined);
        coloring[initialVertex] = 0;
        const frontier = [initialVertex];

        //Propogate the coloring throughout the component containing v greedily
        while (frontier.length > 0) {
            const v = frontier.pop() || 0;
            const neighbors = neighbourhood(v);

            //For each vertex u adjacent to v
            for (const id in neighbors) {
                const u = neighbors[id];

                //Set the color of u to the opposite of v's color if it is new,
                //then add u to the frontier to continue the algorithm.
                if (coloring[u] === undefined) {
                    if (coloring[v] === 0) coloring[u] = 1;
                    else coloring[u] = 0;

                    frontier.push(u);
                }

                //Assert u,v do not have the same color
                else if (coloring[u] === coloring[v]) {
                    //If u,v do have the same color, no proper 2-coloring exists
                    return [];
                }
            }
        }
    }

    //If this code is reached, there exists a proper 2-coloring of the input graph.
    return coloring;
}

/**
 * Proper 2-Coloring of a Graph
 * found on computek, univ-energy
You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.


You are given the following data, representing a graph:
[10,[[3,6],[0,6],[6,9],[5,9],[1,4],[0,7],[3,7],[2,8],[0,5],[1,9],[2,6],[7,9],[4,7]]]
Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or plotting. The first element of the data represents the number of vertices in the graph. Each vertex is a unique number between 0 and 9. The next element of the data represents the edges of the graph. Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v]. Note that an edge [u,v] is the same as an edge [v,u], as order does not matter. You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have the same color. Submit your answer in the form of an array, where element i represents the color of vertex i. If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.

Examples:

Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
Output: [0, 0, 1, 1]

Input: [3, [[0, 1], [0, 2], [1, 2]]]
Output: []


 */