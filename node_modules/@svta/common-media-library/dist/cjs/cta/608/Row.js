"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Row = void 0;
const CaptionsLogger_js_1 = require("./CaptionsLogger.js");
const PenState_js_1 = require("./PenState.js");
const StyledUnicodeChar_js_1 = require("./StyledUnicodeChar.js");
const VerboseLevel_js_1 = require("./VerboseLevel.js");
const NR_COLS_js_1 = require("./utils/NR_COLS.js");
const getCharForByte_js_1 = require("./utils/getCharForByte.js");
/**
 * CTA-608 row consisting of NR_COLS instances of StyledUnicodeChar.
 *
 * @group CTA-608
 * @beta
 */
class Row {
    constructor(logger = new CaptionsLogger_js_1.CaptionsLogger()) {
        this.chars = [];
        this.cueStartTime = null;
        this.pos = 0;
        this.currPenState = new PenState_js_1.PenState();
        for (let i = 0; i < NR_COLS_js_1.NR_COLS; i++) {
            this.chars.push(new StyledUnicodeChar_js_1.StyledUnicodeChar());
        }
        this.logger = logger;
    }
    equals(other) {
        for (let i = 0; i < NR_COLS_js_1.NR_COLS; i++) {
            if (!this.chars[i].equals(other.chars[i])) {
                return false;
            }
        }
        return true;
    }
    copy(other) {
        for (let i = 0; i < NR_COLS_js_1.NR_COLS; i++) {
            this.chars[i].copy(other.chars[i]);
        }
    }
    isEmpty() {
        let empty = true;
        for (let i = 0; i < NR_COLS_js_1.NR_COLS; i++) {
            if (!this.chars[i].isEmpty()) {
                empty = false;
                break;
            }
        }
        return empty;
    }
    /**
     *  Set the cursor to a valid column.
     */
    setCursor(absPos) {
        if (this.pos !== absPos) {
            this.pos = absPos;
        }
        if (this.pos < 0) {
            this.logger.log(VerboseLevel_js_1.VerboseLevel.DEBUG, 'Negative cursor position ' + this.pos);
            this.pos = 0;
        }
        else if (this.pos > NR_COLS_js_1.NR_COLS) {
            this.logger.log(VerboseLevel_js_1.VerboseLevel.DEBUG, 'Too large cursor position ' + this.pos);
            this.pos = NR_COLS_js_1.NR_COLS;
        }
    }
    /**
     * Move the cursor relative to current position.
     */
    moveCursor(relPos) {
        const newPos = this.pos + relPos;
        if (relPos > 1) {
            for (let i = this.pos + 1; i < newPos + 1; i++) {
                this.chars[i].setPenState(this.currPenState);
            }
        }
        this.setCursor(newPos);
    }
    /**
     * Backspace, move one step back and clear character.
     */
    backSpace() {
        this.moveCursor(-1);
        this.chars[this.pos].setChar(' ', this.currPenState);
    }
    insertChar(byte) {
        if (byte >= 0x90) {
            // Extended char
            this.backSpace();
        }
        const char = (0, getCharForByte_js_1.getCharForByte)(byte);
        if (this.pos >= NR_COLS_js_1.NR_COLS) {
            this.logger.log(VerboseLevel_js_1.VerboseLevel.ERROR, () => 'Cannot insert ' +
                byte.toString(16) +
                ' (' +
                char +
                ') at position ' +
                this.pos +
                '. Skipping it!');
            return;
        }
        this.chars[this.pos].setChar(char, this.currPenState);
        this.moveCursor(1);
    }
    clearFromPos(startPos) {
        let i;
        for (i = startPos; i < NR_COLS_js_1.NR_COLS; i++) {
            this.chars[i].reset();
        }
    }
    clear() {
        this.clearFromPos(0);
        this.pos = 0;
        this.currPenState.reset();
    }
    clearToEndOfRow() {
        this.clearFromPos(this.pos);
    }
    getTextString() {
        const chars = [];
        let empty = true;
        for (let i = 0; i < NR_COLS_js_1.NR_COLS; i++) {
            const char = this.chars[i].uchar;
            if (char !== ' ') {
                empty = false;
            }
            chars.push(char);
        }
        if (empty) {
            return '';
        }
        else {
            return chars.join('');
        }
    }
    setPenStyles(styles) {
        this.currPenState.setStyles(styles);
        const currChar = this.chars[this.pos];
        currChar.setPenState(this.currPenState);
    }
}
exports.Row = Row;
//# sourceMappingURL=Row.js.map