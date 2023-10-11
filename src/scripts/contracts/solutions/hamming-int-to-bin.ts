import { NS } from "Bitburner";

export async function main(ns: NS) {
    const integer = Number(ns.args[0]);
    const binary = hammingIntegerToBinary(integer);
    ns.tprint(`Encoded: ${binary}`);
}

function hammingIntegerToBinary(value: number) {
     // encoding following Hammings rule
     function HammingSumOfParity(_lengthOfDBits) {
        // will calculate the needed amount of parityBits 'without' the "overall"-Parity (that math took me 4 Days to get it working)
        return _lengthOfDBits < 3 || _lengthOfDBits == 0 // oh and of course using ternary operators, it's a pretty neat function
        ? _lengthOfDBits == 0
            ? 0
            : _lengthOfDBits + 1
        : // the following math will only work, if the length is greater equal 3, otherwise it's "kind of" broken :D
        Math.ceil(Math.log2(_lengthOfDBits * 2)) <=
            Math.ceil(Math.log2(1 + _lengthOfDBits + Math.ceil(Math.log2(_lengthOfDBits))))
        ? Math.ceil(Math.log2(_lengthOfDBits) + 1)
        : Math.ceil(Math.log2(_lengthOfDBits));
    }
    const _data = value.toString(2).split(""); // first, change into binary string, then create array with 1 bit per index
    const _sumParity = HammingSumOfParity(_data.length); // get the sum of needed parity bits (for later use in encoding)
    const count = (arr, val) =>
        arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    // function count for specific entries in the array, for later use
    
    const _build: string[] = ["x", "x", ..._data.splice(0, 1)]; // init the "pre-build"
    for (let i = 2; i < _sumParity; i++) {
        // add new paritybits and the corresponding data bits (pre-building array)
        _build.push("x", ..._data.splice(0, Math.pow(2, i) - 1));
    }
    // now the "calculation"... get the paritybits ('x') working
    for (const index of _build.reduce(function (a, e, i) {
        if (e == "x") a.push(i);
        return a;
    }, [] as number[])) {
        // that reduce will result in an array of index numbers where the "x" is placed
        const _tempcount = index + 1; // set the "stepsize" for the parityBit
        const _temparray: string[] = []; // temporary array to store the extracted bits
        const _tempdata = [..._build]; // only work with a copy of the _build
        while (_tempdata[index] !== undefined) {
        // as long as there are bits on the starting index, do "cut"
        const _temp = _tempdata.splice(index, _tempcount * 2); // cut stepsize*2 bits, then...
        _temparray.push(..._temp.splice(0, _tempcount)); // ... cut the result again and keep the first half
        }
        _temparray.splice(0, 1); // remove first bit, which is the parity one
        _build[index] = (count(_temparray, "1") % 2).toString(); // count with remainder of 2 and"toString" to store the parityBit
    } // parity done, now the "overall"-parity is set
    _build.unshift((count(_build, "1") % 2).toString()); // has to be done as last element
    return _build.join(""); // return the _build as string
}

/**
 * HammingCodes: Integer to Encoded Binary
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


You are given the following decimal Value:
110360067792
Convert it to a binary representation and encode it as an 'extended Hamming code'. Eg:
Value 8 is expressed in binary as '1000', which will be encoded with the pattern 'pppdpddd', where p is a parity bit and d a data bit. The encoding of
8 is 11110000. As another example, '10101' (Value 21) will result into (pppdpdddpd) '1001101011'.
The answer should be given as a string containing only 1s and 0s.
NOTE: the endianness of the data bits is reversed in relation to the endianness of the parity bits.
NOTE: The bit at index zero is the overall parity bit, this should be set last.
NOTE 2: You should watch the Hamming Code video from 3Blue1Brown, which explains the 'rule' of encoding, including the first index parity bit mentioned in the previous note.

Extra rule for encoding:
There should be no leading zeros in the 'data bit' section
 */