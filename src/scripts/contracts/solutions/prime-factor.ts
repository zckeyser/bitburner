import { NS } from "Bitburner";


// 797251468

export async function main(ns: NS) {
    const n = Number(ns.args[0]);

    const primeFactors = getPrimeFactors(n);
    primeFactors.sort();
    primeFactors.reverse();
    const greatestPrimeFactor = primeFactors[0];
    ns.tprint(`Greatest prime factor: ${greatestPrimeFactor}`);
}

// A function to print all prime
// factors of a given number n
function getPrimeFactors(n: number): number[]
{
    let primeFactors: number[] = [];
     
    // Print the number of 2s that divide n
    while (n % 2 == 0)
    {
        primeFactors.push(2);
        n = Math.floor(n / 2);
    }
 
    // n must be odd at this point. 
    // So we can skip one element
    // (Note i = i +2)
    for(let i = 3; 
            i <= Math.floor(Math.sqrt(n)); 
            i = i + 2)
    {
         
        // While i divides n, print i
        // and divide n
        while (n % i == 0)
        {
            primeFactors.push(i)
            n = Math.floor(n / i);
        }
    }
 
    // This condition is to handle the
    // case when n is a prime number
    // greater than 2
    if (n > 2) {
        primeFactors.push(n);
    }

    return primeFactors;
}
