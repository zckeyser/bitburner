import { NS } from "Bitburner";

export async function main(ns: NS) {
    ns.tprint(parseIpAddresses(String(ns.args[0])));
}


/**
 * 
 * @param ipString 
 * @returns 
 */
export function parseIpAddresses(data: string) {
    const ret: string[] = [];
    for (let a = 1; a <= 3; ++a) {
        for (let b = 1; b <= 3; ++b) {
            for (let c = 1; c <= 3; ++c) {
                for (let d = 1; d <= 3; ++d) {
                    if (a + b + c + d === data.length) {
                        const A = parseInt(data.substring(0, a), 10);
                        const B = parseInt(data.substring(a, a + b), 10);
                        const C = parseInt(data.substring(a + b, a + b + c), 10);
                        const D = parseInt(data.substring(a + b + c, a + b + c + d), 10);
                        if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
                            const ip = [A.toString(), ".",
                                        B.toString(), ".",
                                        C.toString(), ".",
                                        D.toString()].join("");
                            if (ip.length === data.length + 3) {
                                ret.push(ip);
                            }
                        }
                    }
                }
            }
        }
    }
    return ret;
}


/**
 * found on '.'
Generate IP Addresses
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:

2362125994
236.212.59.94

Note that an octet cannot begin with a '0' unless the number itself is actually 0. For example, '192.168.010.1' is not a valid IP.

Examples:

25525511135 -> ["255.255.11.135", "255.255.111.35"]
1938718066 -> ["193.87.180.66"]
 */