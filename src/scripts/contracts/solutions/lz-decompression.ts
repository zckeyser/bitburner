import { NS } from "Bitburner";

export async function main(ns: NS) {
    const input = String(ns.args[0]);

    ns.tprint(lempelZivDecompress(input, ns));
}


/**
 * Compression II: LZ Decompression
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:

1. Exactly L characters, which are to be copied directly into the uncompressed data.
2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.

For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.

You are given the following LZ-encoded string:
    5KpAOU944VF2Y8307786mFisXN7155pY6Je185dEy7X9407796buP6M6aw03X67
Decode it and output the original string.

Example: decoding '5aaabb450723abb' chunk-by-chunk
    5aaabb           ->  aaabb
    5aaabb45         ->  aaabbaaab
    5aaabb450        ->  aaabbaaab
    5aaabb45072      ->  aaabbaaababababa
    5aaabb450723abb  ->  aaabbaaababababaabb
 */

/**
 * 5KpAOU -> KpAOU
 * 5KpAOU94 -> KpAOU
 */
/**
 * 
 * @param s 
 * @returns 
 */
export function lempelZivDecompress(s: string, ns: NS): string {
    let decompressed = ''
    // used to alternate between copy chunks and reference chunks
    // start with false because the first chunk is a copy, and this gets flipped when we start a chunk
    let isCopy = false;
    let chunkStart = true;
    let chunkPos = 0;
    let chunkSize = 0;

    for(const char of s) {
        if(chunkStart) {
            ns.tprint(`decompressed after new chunk: ${decompressed}`)
            isCopy = !isCopy;
            chunkPos = 0;
            chunkStart = false;
            chunkSize = Number(char);
            // if chunk size is 0, immediately skip this chunk type
            if(chunkSize === 0) {
                ns.tprint(`Skipping chunk of size 0 which would have been a ${isCopy ? 'copy' : 'reference'} chunk`)
                chunkStart = true;
            } else {
                ns.tprint(`Starting chunk of size ${chunkSize} which is a ${isCopy ? 'copy' : 'reference'} chunk`);
            }
        } else if(isCopy) {
            // copy chunk
            chunkPos += 1;
            decompressed += char;
            if(chunkSize == chunkPos) {
                chunkStart = true;
            }
        } else {
            /**
             * 5aaabb           ->  aaabb
               5aaabb45         ->  aaabbaaab
             */
            // reference chunk
            const referenceOffset = Number(char);
            const startIndex = decompressed.length - referenceOffset;
            for(let i = 0; i < chunkSize; i++) {
                const charIndex = (startIndex + i) % decompressed.length;
                decompressed += decompressed.charAt(charIndex);
            }
            chunkStart = true;
        }
    }
    
    return decompressed
}
