import { NS } from "Bitburner";

export async function main(ns: NS) {
    const n = Number(ns.args[0]);

    const gpf = greatestPrimeFactor(n);
    ns.tprint(`Greatest prime factor: ${gpf}`);
}

// A function to print all prime
// factors of a given number n
function greatestPrimeFactor(n: number): number
{
    let largestPrimeFactor = 0;
    let divisor = 2;

    while(divisor <= n) {
        if(n % divisor === 0) {
            largestPrimeFactor = divisor;
            n /= divisor;
        } else {
            divisor++;
        }
    }

    return largestPrimeFactor;
}
