/**
 *
 * This code was ported from the dash.js project at:
 *   https://github.com/Dash-Industry-Forum/dash.js/blob/development/externals/cea608-parser.js
 *   https://github.com/Dash-Industry-Forum/dash.js/commit/8269b26a761e0853bb21d78780ed945144ecdd4d#diff-71bc295a2d6b6b7093a1d3290d53a4b2
 *
 * The original copyright appears below:
 *
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2015-2016, DASH Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  1. Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  2. Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 */
import type { SupportedField } from './SupportedField.js';
/**
 * CEA-608 caption parser.
 *
 * @group CTA-608
 * @beta
 */
export declare class Cta608Parser {
    private channels;
    private currentChannel;
    private cmdHistory;
    private logger;
    private lastTime;
    constructor(field: SupportedField, out1: any, out2: any);
    /**
     * Add data for time t in forms of list of bytes (unsigned ints). The bytes are treated as pairs.
     *
     * @param time - The time in milliseconds
     * @param byteList - The list of bytes
     */
    addData(time: number | null, byteList: number[]): void;
    /**
     * Parse Command.
     *
     * @param a - The first byte
     * @param b - The second byte
     * @returns True if a command was found
     */
    private parseCmd;
    /**
     * Parse midrow styling command
     *
     * @param a - The first byte
     * @param b - The second byte
     * @returns `true` if midrow styling command was found
     */
    private parseMidrow;
    /**
     * Parse Preable Access Codes (Table 53).
     *
     * @param a - The first byte
     * @param b - The second byte
     * @returns A Boolean that tells if PAC found
     */
    private parsePAC;
    /**
     * Interpret the second byte of the pac, and return the information.
     *
     * @param row - The row number
     * @param byte - The second byte
     * @returns pacData with style parameters
     */
    private interpretPAC;
    /**
     * Parse characters.
     *
     * @param a - The first byte
     * @param b - The second byte
     * @returns An array with 1 to 2 codes corresponding to chars, if found. null otherwise.
     */
    private parseChars;
    /**
     * Parse extended background attributes as well as new foreground color black.
     *
     * @param a - The first byte
     * @param b - The second byte
     * @returns True if background attributes are found
     */
    private parseBackgroundAttributes;
    /**
     * Reset state of parser and its channels.
     */
    reset(): void;
    /**
     * Trigger the generation of a cue, and the start of a new one if displayScreens are not empty.
     */
    cueSplitAtTime(t: number): void;
}
//# sourceMappingURL=Cta608Parser.d.ts.map