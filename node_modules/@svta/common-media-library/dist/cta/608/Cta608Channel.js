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
import { CaptionScreen } from './CaptionScreen.js';
import { CaptionsLogger } from './CaptionsLogger.js';
import { VerboseLevel } from './VerboseLevel.js';
/**
 * CTA-608 Channel
 *
 * @group CTA-608
 * @beta
 */
export class Cta608Channel {
    constructor(channelNumber, outputFilter, logger = new CaptionsLogger()) {
        this.chNr = channelNumber;
        this.outputFilter = outputFilter;
        this.mode = null;
        this.displayedMemory = new CaptionScreen(logger);
        this.nonDisplayedMemory = new CaptionScreen(logger);
        this.lastOutputScreen = new CaptionScreen(logger);
        this.writeScreen = this.displayedMemory;
        this.mode = null;
        this.cueStartTime = null; // Keeps track of where a cue started.
        this.logger = logger;
        this.logger.log(VerboseLevel.INFO, 'new Cea608Channel(' + this.chNr + ')');
    }
    reset() {
        var _a, _b;
        this.mode = null;
        this.displayedMemory.reset();
        this.nonDisplayedMemory.reset();
        this.lastOutputScreen.reset();
        (_b = (_a = this.outputFilter) === null || _a === void 0 ? void 0 : _a.reset) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.writeScreen = this.displayedMemory;
        this.mode = null;
        this.cueStartTime = null;
    }
    setPAC(pacData) {
        this.writeScreen.setPAC(pacData);
    }
    setBkgData(bkgData) {
        this.writeScreen.setBkgData(bkgData);
    }
    setMode(newMode) {
        if (newMode === this.mode) {
            return;
        }
        this.mode = newMode;
        this.logger.log(VerboseLevel.INFO, () => 'MODE=' + newMode);
        if (this.mode === 'MODE_POP-ON') {
            this.writeScreen = this.nonDisplayedMemory;
        }
        else {
            this.writeScreen = this.displayedMemory;
            this.writeScreen.reset();
        }
        if (this.mode !== 'MODE_ROLL-UP') {
            this.displayedMemory.setRollUpRows(null);
            this.nonDisplayedMemory.setRollUpRows(null);
        }
        this.mode = newMode;
    }
    insertChars(chars) {
        for (let i = 0; i < chars.length; i++) {
            this.writeScreen.insertChar(chars[i]);
        }
        const screen = this.writeScreen === this.displayedMemory ? 'DISP' : 'NON_DISP';
        this.logger.log(VerboseLevel.INFO, () => screen + ': ' + this.writeScreen.getDisplayText(true));
        if (this.mode === 'MODE_PAINT-ON' || this.mode === 'MODE_ROLL-UP') {
            this.logger.log(VerboseLevel.TEXT, () => 'DISPLAYED: ' + this.displayedMemory.getDisplayText(true));
            this.outputDataUpdate();
        }
    }
    ccRCL() {
        // Resume Caption Loading (switch mode to Pop On)
        this.logger.log(VerboseLevel.INFO, 'RCL - Resume Caption Loading');
        this.setMode('MODE_POP-ON');
    }
    ccBS() {
        // BackSpace
        this.logger.log(VerboseLevel.INFO, 'BS - BackSpace');
        if (this.mode === 'MODE_TEXT') {
            return;
        }
        this.writeScreen.backSpace();
        if (this.writeScreen === this.displayedMemory) {
            this.outputDataUpdate();
        }
    }
    ccAOF() {
        // Reserved (formerly Alarm Off)
    }
    ccAON() {
        // Reserved (formerly Alarm On)
    }
    ccDER() {
        // Delete to End of Row
        this.logger.log(VerboseLevel.INFO, 'DER- Delete to End of Row');
        this.writeScreen.clearToEndOfRow();
        this.outputDataUpdate();
    }
    ccRU(nrRows) {
        // Roll-Up Captions-2,3,or 4 Rows
        this.logger.log(VerboseLevel.INFO, 'RU(' + nrRows + ') - Roll Up');
        this.writeScreen = this.displayedMemory;
        this.setMode('MODE_ROLL-UP');
        this.writeScreen.setRollUpRows(nrRows);
    }
    ccFON() {
        // Flash On
        this.logger.log(VerboseLevel.INFO, 'FON - Flash On');
        this.writeScreen.setPen({ flash: true });
    }
    ccRDC() {
        // Resume Direct Captioning (switch mode to PaintOn)
        this.logger.log(VerboseLevel.INFO, 'RDC - Resume Direct Captioning');
        this.setMode('MODE_PAINT-ON');
    }
    ccTR() {
        // Text Restart in text mode (not supported, however)
        this.logger.log(VerboseLevel.INFO, 'TR');
        this.setMode('MODE_TEXT');
    }
    ccRTD() {
        // Resume Text Display in Text mode (not supported, however)
        this.logger.log(VerboseLevel.INFO, 'RTD');
        this.setMode('MODE_TEXT');
    }
    ccEDM() {
        // Erase Displayed Memory
        this.logger.log(VerboseLevel.INFO, 'EDM - Erase Displayed Memory');
        this.displayedMemory.reset();
        this.outputDataUpdate(true);
    }
    ccCR() {
        // Carriage Return
        this.logger.log(VerboseLevel.INFO, 'CR - Carriage Return');
        this.writeScreen.rollUp();
        this.outputDataUpdate(true);
    }
    ccENM() {
        // Erase Non-Displayed Memory
        this.logger.log(VerboseLevel.INFO, 'ENM - Erase Non-displayed Memory');
        this.nonDisplayedMemory.reset();
    }
    ccEOC() {
        // End of Caption (Flip Memories)
        this.logger.log(VerboseLevel.INFO, 'EOC - End Of Caption');
        if (this.mode === 'MODE_POP-ON') {
            const tmp = this.displayedMemory;
            this.displayedMemory = this.nonDisplayedMemory;
            this.nonDisplayedMemory = tmp;
            this.writeScreen = this.nonDisplayedMemory;
            this.logger.log(VerboseLevel.TEXT, () => 'DISP: ' + this.displayedMemory.getDisplayText());
        }
        this.outputDataUpdate(true);
    }
    ccTO(nrCols) {
        // Tab Offset 1,2, or 3 columns
        this.logger.log(VerboseLevel.INFO, 'TO(' + nrCols + ') - Tab Offset');
        this.writeScreen.moveCursor(nrCols);
    }
    ccMIDROW(secondByte) {
        // Parse MIDROW command
        const styles = { flash: false };
        styles.underline = secondByte % 2 === 1;
        styles.italics = secondByte >= 0x2e;
        if (!styles.italics) {
            const colorIndex = Math.floor(secondByte / 2) - 0x10;
            const colors = [
                'white',
                'green',
                'blue',
                'cyan',
                'red',
                'yellow',
                'magenta',
            ];
            styles.foreground = colors[colorIndex];
        }
        else {
            styles.foreground = 'white';
        }
        this.logger.log(VerboseLevel.INFO, 'MIDROW: ' + JSON.stringify(styles));
        this.writeScreen.setPen(styles);
    }
    outputDataUpdate(dispatch = false) {
        const time = this.logger.time;
        if (time === null) {
            return;
        }
        if (this.outputFilter) {
            if (this.cueStartTime === null && !this.displayedMemory.isEmpty()) {
                // Start of a new cue
                this.cueStartTime = time;
            }
            else {
                if (!this.displayedMemory.equals(this.lastOutputScreen)) {
                    this.outputFilter.newCue(this.cueStartTime, time, this.lastOutputScreen);
                    if (dispatch && this.outputFilter.dispatchCue) {
                        this.outputFilter.dispatchCue();
                    }
                    this.cueStartTime = this.displayedMemory.isEmpty() ? null : time;
                }
            }
            this.lastOutputScreen.copy(this.displayedMemory);
        }
    }
    cueSplitAtTime(t) {
        if (this.outputFilter) {
            if (!this.displayedMemory.isEmpty()) {
                if (this.outputFilter.newCue) {
                    this.outputFilter.newCue(this.cueStartTime, t, this.displayedMemory);
                }
                this.cueStartTime = t;
            }
        }
    }
}
//# sourceMappingURL=Cta608Channel.js.map