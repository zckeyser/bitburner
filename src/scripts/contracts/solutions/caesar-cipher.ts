import { TermLogger } from "/lib/Helpers"
import { NS } from "Bitburner"

const AsciiUppercaseOffset = 65;
const AsciiLowercaseOffset = 97; 
const SpaceCharCode = 32;

/** @param ns BitBurner API **/
export async function main(ns: NS) {
    const logger = new TermLogger(ns);

    const input = JSON.parse(String(ns.args[0]));
    const cipherText = String(input[0]);
    const cipherKey = Number(input[1]);

    logger.info(`Decrypting cipher text ${cipherText} with key ${cipherKey}`);

    const cipherTextAscii = cipherText.split('').map(c => c.charCodeAt(0));
    logger.info(`Cipher text ascii: ${cipherTextAscii}`);
    const cipherTextShifted = cipherTextAscii.map(charCode => {
        // shift alpohabetic characters
        if (charCode >= AsciiUppercaseOffset && charCode < AsciiUppercaseOffset + 26) {
            const charOffset = (charCode - AsciiUppercaseOffset);
            const minusShift = charOffset - cipherKey;
            const rotated = (26 + minusShift) % 26;
            const newChar = rotated + AsciiUppercaseOffset;
            ns.tprint(`${String.fromCharCode(charCode)} -> ${charCode} -> ${charOffset} -> ${minusShift} -> ${rotated} -> ${newChar} -> ${String.fromCharCode(newChar)}`)
            return newChar;
        }
        // leave non alphabetic characters the same (e.g. whitespace)
        return charCode;
    });
    logger.info(`Shifted Cipher char codes: ${cipherTextShifted}`);
    const decodedCipher = cipherTextShifted.reduce((acc, c) => acc + String.fromCharCode(c), "")

    logger.info(`Decrypted cipher string is: ${decodedCipher}`);
}