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
import { CaptionsLogger } from './CaptionsLogger.js';
import { Row } from './Row.js';
import { NR_ROWS } from './utils/NR_ROWS.js';
import { VerboseLevel } from './VerboseLevel.js';
/**
 * Keep a CTA-608 screen of 32x15 styled characters
 *
 * @group CTA-608
 * @beta
 */
export class CaptionScreen {
    constructor(logger = new CaptionsLogger()) {
        this.rows = [];
        this.currRow = NR_ROWS - 1;
        this.nrRollUpRows = null;
        this.lastOutputScreen = null;
        for (let i = 0; i < NR_ROWS; i++) {
            this.rows.push(new Row(logger));
        }
        this.logger = logger;
    }
    reset() {
        for (let i = 0; i < NR_ROWS; i++) {
            this.rows[i].clear();
        }
        this.currRow = NR_ROWS - 1;
    }
    equals(other) {
        let equal = true;
        for (let i = 0; i < NR_ROWS; i++) {
            if (!this.rows[i].equals(other.rows[i])) {
                equal = false;
                break;
            }
        }
        return equal;
    }
    copy(other) {
        for (let i = 0; i < NR_ROWS; i++) {
            this.rows[i].copy(other.rows[i]);
        }
    }
    isEmpty() {
        let empty = true;
        for (let i = 0; i < NR_ROWS; i++) {
            if (!this.rows[i].isEmpty()) {
                empty = false;
                break;
            }
        }
        return empty;
    }
    backSpace() {
        const row = this.rows[this.currRow];
        row.backSpace();
    }
    clearToEndOfRow() {
        const row = this.rows[this.currRow];
        row.clearToEndOfRow();
    }
    /**
     * Insert a character (without styling) in the current row.
     */
    insertChar(char) {
        const row = this.rows[this.currRow];
        row.insertChar(char);
    }
    setPen(styles) {
        const row = this.rows[this.currRow];
        row.setPenStyles(styles);
    }
    moveCursor(relPos) {
        const row = this.rows[this.currRow];
        row.moveCursor(relPos);
    }
    setCursor(absPos) {
        this.logger.log(VerboseLevel.INFO, 'setCursor: ' + absPos);
        const row = this.rows[this.currRow];
        row.setCursor(absPos);
    }
    setPAC(pacData) {
        this.logger.log(VerboseLevel.INFO, () => 'pacData = ' + JSON.stringify(pacData));
        let newRow = pacData.row - 1;
        if (this.nrRollUpRows && newRow < this.nrRollUpRows - 1) {
            newRow = this.nrRollUpRows - 1;
        }
        // Make sure this only affects Roll-up Captions by checking this.nrRollUpRows
        if (this.nrRollUpRows && this.currRow !== newRow) {
            // clear all rows first
            for (let i = 0; i < NR_ROWS; i++) {
                this.rows[i].clear();
            }
            // Copy this.nrRollUpRows rows from lastOutputScreen and place it in the newRow location
            // topRowIndex - the start of rows to copy (inclusive index)
            const topRowIndex = this.currRow + 1 - this.nrRollUpRows;
            // We only copy if the last position was already shown.
            // We use the cueStartTime value to check this.
            const lastOutputScreen = this.lastOutputScreen;
            if (lastOutputScreen) {
                const prevLineTime = lastOutputScreen.rows[topRowIndex].cueStartTime;
                const time = this.logger.time;
                if (prevLineTime !== null && time !== null && prevLineTime < time) {
                    for (let i = 0; i < this.nrRollUpRows; i++) {
                        this.rows[newRow - this.nrRollUpRows + i + 1].copy(lastOutputScreen.rows[topRowIndex + i]);
                    }
                }
            }
        }
        this.currRow = newRow;
        const row = this.rows[this.currRow];
        if (pacData.indent !== null) {
            const indent = pacData.indent;
            const prevPos = Math.max(indent - 1, 0);
            row.setCursor(pacData.indent);
            pacData.color = row.chars[prevPos].penState.foreground;
        }
        const styles = {
            foreground: pacData.color,
            underline: pacData.underline,
            italics: pacData.italics,
            background: 'black',
            flash: false,
        };
        this.setPen(styles);
    }
    /**
     * Set background/extra foreground, but first do back_space, and then insert space (backwards compatibility).
     */
    setBkgData(bkgData) {
        this.logger.log(VerboseLevel.INFO, () => 'bkgData = ' + JSON.stringify(bkgData));
        this.backSpace();
        this.setPen(bkgData);
        this.insertChar(0x20); // Space
    }
    setRollUpRows(nrRows) {
        this.nrRollUpRows = nrRows;
    }
    rollUp() {
        if (this.nrRollUpRows === null) {
            this.logger.log(VerboseLevel.DEBUG, 'roll_up but nrRollUpRows not set yet');
            return; // Not properly setup
        }
        this.logger.log(VerboseLevel.TEXT, () => this.getDisplayText());
        const topRowIndex = this.currRow + 1 - this.nrRollUpRows;
        const topRow = this.rows.splice(topRowIndex, 1)[0];
        topRow.clear();
        this.rows.splice(this.currRow, 0, topRow);
        this.logger.log(VerboseLevel.INFO, 'Rolling up');
    }
    /**
     * Get all non-empty rows with as unicode text.
     */
    getDisplayText(asOneRow) {
        asOneRow = asOneRow || false;
        const displayText = [];
        let text = '';
        let rowNr = -1;
        for (let i = 0; i < NR_ROWS; i++) {
            const rowText = this.rows[i].getTextString();
            if (rowText) {
                rowNr = i + 1;
                if (asOneRow) {
                    displayText.push('Row ' + rowNr + ": '" + rowText + "'");
                }
                else {
                    displayText.push(rowText.trim());
                }
            }
        }
        if (displayText.length > 0) {
            if (asOneRow) {
                text = '[' + displayText.join(' | ') + ']';
            }
            else {
                text = displayText.join('\n');
            }
        }
        return text;
    }
    getTextAndFormat() {
        return this.rows;
    }
}
//# sourceMappingURL=CaptionScreen.js.map