import { NS } from "Bitburner";

export async function main(ns: NS) {
    let input = String(ns.args[0]);
    ns.tprint(sanitizeParentheses(input));
}

export function sanitizeParentheses(s: string): string[] {
    let left = 0;
    let right = 0;
    const res: string[] = [];

    for (let i = 0; i < s.length; ++i) {
        if (s[i] === '(') {
            ++left;
        } else if (s[i] === ')') {
            (left > 0) ? --left : ++right;
        }
    }

    function dfs(pair, index, left, right, s, solution, res) {
        if (s.length === index) {
            if (left === 0 && right === 0 && pair === 0) {
                for(let i = 0; i < res.length; i++) {
                    if(res[i] === solution) { return; }
                }
                res.push(solution);
            }
            return;
        }

        if (s[index] === '(') {
            if (left > 0) {
                dfs(pair, index + 1, left - 1, right, s, solution, res);
            }
            dfs(pair + 1, index + 1, left, right, s, solution + s[index], res);
        } else if (s[index] === ')') {
            if (right > 0) dfs(pair, index + 1, left, right - 1, s, solution, res);
            if (pair > 0) dfs(pair - 1, index + 1, left, right, s, solution + s[index], res);
        } else {
            dfs(pair, index + 1, left, right, s, solution + s[index], res);
        }
    }

    dfs(0, 0, left, right, s, "", res);
    return res;
}

/**
 * found on . (i think)
Sanitize Parentheses in Expression
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given the following string:

((a((a)(a)aa()((())
((a((a)(a)aa ( ) ((( )))

remove the minimum number of invalid parentheses in order to validate the string. If there are multiple minimal ways to validate the string, provide all of the possible results. The answer should be provided as an array of strings. If it is impossible to validate the string the result should be an array with only an empty string.

IMPORTANT: The string may contain letters, not just parentheses. Examples:
"()())()" -> ["()()()", "(())()"]
"(a)())()" -> ["(a)()()", "(a())()"]
")(" -> [""]
 */