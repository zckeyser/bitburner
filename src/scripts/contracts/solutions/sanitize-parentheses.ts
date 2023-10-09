export function sanitizeParentheses(s: string): string[] {
    let stack = [];
    let newString = "";

    // first pass to determine how many invalid parens there are


    return []
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