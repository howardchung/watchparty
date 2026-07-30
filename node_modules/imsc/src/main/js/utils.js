/* 
 * Copyright (c) 2016, Pierre-Anthony Lemieux <pal@sandflow.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @module imscUtils
 */

;
(function (imscUtils) { // wrapper for non-node envs

    /* Documents the error handler interface */

    /**
     * @classdesc Generic interface for handling events. The interface exposes four
     * methods:
     * * <pre>info</pre>: unusual event that does not result in an inconsistent state
     * * <pre>warn</pre>: unexpected event that should not result in an inconsistent state
     * * <pre>error</pre>: unexpected event that may result in an inconsistent state
     * * <pre>fatal</pre>: unexpected event that results in an inconsistent state
     *   and termination of processing
     * Each method takes a single <pre>string</pre> describing the event as argument,
     * and returns a single <pre>boolean</pre>, which terminates processing if <pre>true</pre>.
     *
     * @name ErrorHandler
     * @class
     */


    /*
     * Parses a TTML color expression
     * 
     */

    var HEX_COLOR_RE = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?/;
    var DEC_COLOR_RE = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
    var DEC_COLORA_RE = /rgba\(\s*(\d+),\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;
    var NAMED_COLOR = {
        transparent: [0, 0, 0, 0],
        black: [0, 0, 0, 255],
        silver: [192, 192, 192, 255],
        gray: [128, 128, 128, 255],
        white: [255, 255, 255, 255],
        maroon: [128, 0, 0, 255],
        red: [255, 0, 0, 255],
        purple: [128, 0, 128, 255],
        fuchsia: [255, 0, 255, 255],
        magenta: [255, 0, 255, 255],
        green: [0, 128, 0, 255],
        lime: [0, 255, 0, 255],
        olive: [128, 128, 0, 255],
        yellow: [255, 255, 0, 255],
        navy: [0, 0, 128, 255],
        blue: [0, 0, 255, 255],
        teal: [0, 128, 128, 255],
        aqua: [0, 255, 255, 255],
        cyan: [0, 255, 255, 255]
    };

    imscUtils.parseColor = function (str) {

        var m;
        
        var r = null;
        
        var nc = NAMED_COLOR[str.toLowerCase()];
        
        if (nc !== undefined) {

            r = nc;

        } else if ((m = HEX_COLOR_RE.exec(str)) !== null) {

            r = [parseInt(m[1], 16),
                parseInt(m[2], 16),
                parseInt(m[3], 16),
                (m[4] !== undefined ? parseInt(m[4], 16) : 255)];
            
        } else if ((m = DEC_COLOR_RE.exec(str)) !== null) {

            r = [parseInt(m[1]),
                parseInt(m[2]),
                parseInt(m[3]),
                255];
            
        } else if ((m = DEC_COLORA_RE.exec(str)) !== null) {

            r = [parseInt(m[1]),
                parseInt(m[2]),
                parseInt(m[3]),
                parseInt(m[4])];
            
        }

        return r;
    };

    var LENGTH_RE = /^((?:\+|\-)?\d*(?:\.\d+)?)(px|em|c|%|rh|rw)$/;

    imscUtils.parseLength = function (str) {

        var m;

        var r = null;

        if ((m = LENGTH_RE.exec(str)) !== null) {

            r = {value: parseFloat(m[1]), unit: m[2]};
        }

        return r;
    };

    imscUtils.parseTextShadow = function (str) {

        var shadows = str.match(/([^\(,\)]|\([^\)]+\))+/g);
        
        var r = [];

        for (var i = 0; i < shadows.length; i++) {

            var shadow = shadows[i].split(" ");

            if (shadow.length === 1 && shadow[0] === "none") {

                return "none";

            } else if (shadow.length > 1 && shadow.length < 5) {

                var out_shadow = [null, null, null, null];

                /* x offset */

                var l = imscUtils.parseLength(shadow.shift());

                if (l === null)
                    return null;

                out_shadow[0] = l;

                /* y offset */

                l = imscUtils.parseLength(shadow.shift());

                if (l === null)
                    return null;

                out_shadow[1] = l;

                /* is there a third component */

                if (shadow.length === 0) {
                    r.push(out_shadow);
                    continue;
                }

                l = imscUtils.parseLength(shadow[0]);

                if (l !== null) {

                    out_shadow[2] = l;

                    shadow.shift();

                }

                if (shadow.length === 0) {
                    r.push(out_shadow);
                    continue;
                }

                var c = imscUtils.parseColor(shadow[0]);

                if (c === null)
                    return null;

                out_shadow[3] = c;

                r.push(out_shadow);
            }

        }

        return r;
    };


    imscUtils.parsePosition = function (str) {

        /* see https://www.w3.org/TR/ttml2/#style-value-position */

        var s = str.split(" ");

        var isKeyword = function (str) {

            return str === "center" ||
                    str === "left" ||
                    str === "top" ||
                    str === "bottom" ||
                    str === "right";

        };

        if (s.length > 4) {

            return null;

        }

        /* initial clean-up pass */

        for (var j = 0 ; j < s.length; j++) {

            if (!isKeyword(s[j])) {

                var l = imscUtils.parseLength(s[j]);

                if (l === null)
                    return null;

                s[j] = l;
            }

        }

        /* position default */

        var pos = {
            h: {edge: "left", offset: {value: 50, unit: "%"}},
            v: {edge: "top", offset: {value: 50, unit: "%"}}
        };

        /* update position */

        for (var i = 0; i < s.length; ) {

            /* extract the current component */

            var comp = s[i++];

            if (isKeyword(comp)) {

                /* we have a keyword */

                var offset = {value: 0, unit: "%"};

                /* peek at the next component */

                if (s.length !== 2 && i < s.length && (!isKeyword(s[i]))) {

                    /* followed by an offset */

                    offset = s[i++];

                }

                /* skip if center */

                if (comp === "right") {

                    pos.h.edge = comp;

                    pos.h.offset = offset;

                } else if (comp === "bottom") {

                    pos.v.edge = comp;


                    pos.v.offset = offset;


                } else if (comp === "left") {

                    pos.h.offset = offset;


                } else if (comp === "top") {

                    pos.v.offset = offset;


                }

            } else if (s.length === 1 || s.length === 2) {

                /* we have a bare value */

                if (i === 1) {

                    /* assign it to left edge if first bare value */

                    pos.h.offset = comp;

                } else {

                    /* assign it to top edge if second bare value */

                    pos.v.offset = comp;

                }

            } else {

                /* error condition */

                return null;

            }

        }

        return pos;
    };


    imscUtils.ComputedLength = function (rw, rh) {
        this.rw = rw;
        this.rh = rh;
    };

    imscUtils.ComputedLength.prototype.toUsedLength = function (width, height) {
        return width * this.rw + height * this.rh;
    };

    imscUtils.ComputedLength.prototype.isZero = function () {
        return this.rw === 0 && this.rh === 0;
    };

    /**
     * Computes a specified length to a root container relative length
     * 
     * @param {number} lengthVal Length value to be computed
     * @param {string} lengthUnit Units of the length value
     * @param {number} emScale length of 1em, or null if em is not allowed
     * @param {number} percentScale length to which , or null if perecentage is not allowed
     * @param {number} cellScale length of 1c, or null if c is not allowed
     * @param {number} pxScale length of 1px, or null if px is not allowed
     * @param {number} direction 0 if the length is computed in the horizontal direction, 1 if the length is computed in the vertical direction
     * @return {number} Computed length
     */
    imscUtils.toComputedLength = function(lengthVal, lengthUnit, emLength, percentLength, cellLength, pxLength) {

        if (lengthUnit === "%" && percentLength) {

            return new imscUtils.ComputedLength(
                    percentLength.rw * lengthVal / 100,
                    percentLength.rh * lengthVal / 100
                    );

        } else if (lengthUnit === "em" && emLength) {

            return new imscUtils.ComputedLength(
                    emLength.rw * lengthVal,
                    emLength.rh * lengthVal
                    );

        } else if (lengthUnit === "c" && cellLength) {

            return new imscUtils.ComputedLength(
                    lengthVal * cellLength.rw,
                    lengthVal * cellLength.rh
                    );

        } else if (lengthUnit === "px" && pxLength) {

            return new imscUtils.ComputedLength(
                    lengthVal * pxLength.rw,
                    lengthVal * pxLength.rh
                    );

        } else if (lengthUnit === "rh") {

            return new imscUtils.ComputedLength(
                    0,
                    lengthVal / 100
                    );

        } else if (lengthUnit === "rw") {

            return new imscUtils.ComputedLength(
                    lengthVal / 100,
                    0                    
                    );

        } else {

            return null;

        }

    };



})(typeof exports === 'undefined' ? this.imscUtils = {} : exports);
