import { NS } from "Bitburner";

export async function main(ns: NS) {
    parseIpAddresses(String(ns.args[0]));
}


/**
 * 
 * @param ipString 
 * @returns 
 */
export function parseIpAddresses(ipString: string): string[] {
    
    let ipAddresses = [];

    return ipAddresses;
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