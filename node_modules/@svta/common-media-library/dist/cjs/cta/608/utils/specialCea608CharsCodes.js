"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specialCea608CharsCodes = void 0;
/**
 *  Exceptions from regular ASCII. CodePoints are mapped to UTF-16 codes
 */
exports.specialCea608CharsCodes = {
    42: 225, // lowercase a, acute accent
    92: 233, // lowercase e, acute accent
    94: 237, // lowercase i, acute accent
    95: 243, // lowercase o, acute accent
    96: 250, // lowercase u, acute accent
    123: 231, // lowercase c with cedilla
    124: 247, // division symbol
    125: 209, // uppercase N tilde
    126: 241, // lowercase n tilde
    127: 9608, // Full block
    // THIS BLOCK INCLUDES THE 16 EXTENDED (TWO-BYTE) LINE 21 CHARACTERS
    // THAT COME FROM HI BYTE=0x11 AND LOW BETWEEN 0x30 AND 0x3F
    // THIS MEANS THAT \x50 MUST BE ADDED TO THE VALUES
    128: 174, // Registered symbol (R)
    129: 176, // degree sign
    130: 189, // 1/2 symbolOutputFilter
    131: 191, // Inverted (open) question mark
    132: 8482, // Trademark symbol (TM)
    133: 162, // Cents symbol
    134: 163, // Pounds sterling
    135: 9834, // Music 8'th note
    136: 224, // lowercase a, grave accent
    137: 32, // transparent space (regular)
    138: 232, // lowercase e, grave accent
    139: 226, // lowercase a, circumflex accent
    140: 234, // lowercase e, circumflex accent
    141: 238, // lowercase i, circumflex accent
    142: 244, // lowercase o, circumflex accent
    143: 251, // lowercase u, circumflex accent
    // THIS BLOCK INCLUDES THE 32 EXTENDED (TWO-BYTE) LINE 21 CHARACTERS
    // THAT COME FROM HI BYTE=0x12 AND LOW BETWEEN 0x20 AND 0x3F
    144: 193, // capital letter A with acute
    145: 201, // capital letter E with acute
    146: 211, // capital letter O with acute
    147: 218, // capital letter U with acute
    148: 220, // capital letter U with diaresis
    149: 252, // lowercase letter U with diaeresis
    150: 8216, // opening single quote
    151: 161, // inverted exclamation mark
    152: 42, // asterisk
    153: 8217, // closing single quote
    154: 9473, // box drawings heavy horizontal
    155: 169, // copyright sign
    156: 8480, // Service mark
    157: 8226, // (round) bullet
    158: 8220, // Left double quotation mark
    159: 8221, // Right double quotation mark
    160: 192, // uppercase A, grave accent
    161: 194, // uppercase A, circumflex
    162: 199, // uppercase C with cedilla
    163: 200, // uppercase E, grave accent
    164: 202, // uppercase E, circumflex
    165: 203, // capital letter E with diaresis
    166: 235, // lowercase letter e with diaresis
    167: 206, // uppercase I, circumflex
    168: 207, // uppercase I, with diaresis
    169: 239, // lowercase i, with diaresis
    170: 212, // uppercase O, circumflex
    171: 217, // uppercase U, grave accent
    172: 249, // lowercase u, grave accent
    173: 219, // uppercase U, circumflex
    174: 171, // left-pointing double angle quotation mark
    175: 187, // right-pointing double angle quotation mark
    // THIS BLOCK INCLUDES THE 32 EXTENDED (TWO-BYTE) LINE 21 CHARACTERS
    // THAT COME FROM HI BYTE=0x13 AND LOW BETWEEN 0x20 AND 0x3F
    176: 195, // Uppercase A, tilde
    177: 227, // Lowercase a, tilde
    178: 205, // Uppercase I, acute accent
    179: 204, // Uppercase I, grave accent
    180: 236, // Lowercase i, grave accent
    181: 210, // Uppercase O, grave accent
    182: 242, // Lowercase o, grave accent
    183: 213, // Uppercase O, tilde
    184: 245, // Lowercase o, tilde
    185: 123, // Open curly brace
    186: 125, // Closing curly brace
    187: 92, // Backslash
    188: 94, // Caret
    189: 95, // Underscore
    190: 124, // Pipe (vertical line)
    191: 8764, // Tilde operator
    192: 196, // Uppercase A, umlaut
    193: 228, // Lowercase A, umlaut
    194: 214, // Uppercase O, umlaut
    195: 246, // Lowercase o, umlaut
    196: 223, // Esszett (sharp S)
    197: 165, // Yen symbolOutputFilter
    198: 164, // Generic currency sign
    199: 9475, // Box drawings heavy vertical
    200: 197, // Uppercase A, ring
    201: 229, // Lowercase A, ring
    202: 216, // Uppercase O, stroke
    203: 248, // Lowercase o, strok
    204: 9487, // Box drawings heavy down and right
    205: 9491, // Box drawings heavy down and left
    206: 9495, // Box drawings heavy up and right
    207: 9499, // Box drawings heavy up and left
};
//# sourceMappingURL=specialCea608CharsCodes.js.map