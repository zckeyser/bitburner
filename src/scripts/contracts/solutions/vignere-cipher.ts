import { NS } from "Bitburner";

const UppercaseAlphaOffset = 65;


export async function main(ns: NS) {
    let plaintext = String(ns.args[0]);
    let keyword = String(ns.args[1]);
    ns.tprint(vignereCipher(plaintext, keyword));
}


export function vignereCipher(plaintext: string, keyword: string): string {
    let keywordIndex = 0;

    return plaintext.split('').map((c) => {
        const offset = keyword.charCodeAt(keywordIndex) - UppercaseAlphaOffset;
        const charCode = c.charCodeAt(0);
        // skip spaces
        if(charCode == 32) {
            return c;
        }
        const newCharCode = (((charCode - UppercaseAlphaOffset) + offset) % 26) + UppercaseAlphaOffset;
        keywordIndex = ((keywordIndex + 1) % keyword.length)
        return String.fromCharCode(newCharCode);
    }).join('');
}

/**
 * 
Encryption II: Vigenère Cipher
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Vigenère cipher is a type of polyalphabetic substitution. It uses the Vigenère square to encrypt and decrypt plaintext with a keyword.

  Vigenère square:
         A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
       +----------------------------------------------------
     A | A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
     B | B C D E F G H I J K L M N O P Q R S T U V W X Y Z A
     C | C D E F G H I J K L M N O P Q R S T U V W X Y Z A B
     D | D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
     E | E F G H I J K L M N O P Q R S T U V W X Y Z A B C D
                ...
     Y | Y Z A B C D E F G H I J K L M N O P Q R S T U V W X
     Z | Z A B C D E F G H I J K L M N O P Q R S T U V W X Y

For encryption each letter of the plaintext is paired with the corresponding letter of a repeating keyword. For example, the plaintext DASHBOARD is encrypted with the keyword LINUX:
   Plaintext: DASHBOARD
   Keyword:   LINUXLINU
So, the first letter D is paired with the first letter of the key L. Therefore, row D and column L of the Vigenère square are used to get the first cipher letter O. This must be repeated for the whole ciphertext.

You are given an array with two elements:
  ["ARRAYMODEMLOGINPOPUPMEDIA", "NOTEBOOK"]
The first element is the plaintext, the second element is the keyword.

Return the ciphertext as uppercase string.
 */