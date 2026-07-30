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
 * @module imscStyles
 */

;
(function (imscStyles, imscNames, imscUtils) { // wrapper for non-node envs

    function StylingAttributeDefinition(ns, name, initialValue, appliesTo, isInherit, isAnimatable, parseFunc, computeFunc) {
        this.name = name;
        this.ns = ns;
        this.qname = ns + " " + name;
        this.inherit = isInherit;
        this.animatable = isAnimatable;
        this.initial = initialValue;
        this.applies = appliesTo;
        this.parse = parseFunc;
        this.compute = computeFunc;
    }

    imscStyles.all = [

        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "backgroundColor",
            "transparent",
            ['body', 'div', 'p', 'region', 'span'],
            false,
            true,
            imscUtils.parseColor,
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "color",
            "white",
            ['span'],
            true,
            true,
            imscUtils.parseColor,
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "direction",
            "ltr",
            ['p', 'span'],
            true,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "display",
            "auto",
            ['body', 'div', 'p', 'region', 'span'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "displayAlign",
            "before",
            ['region'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "extent",
            "auto",
            ['tt', 'region'],
            false,
            true,
            function (str) {

                if (str === "auto") {

                    return str;

                } else {

                    var s = str.split(" ");
                    if (s.length !== 2)
                        return null;
                    var w = imscUtils.parseLength(s[0]);
                    var h = imscUtils.parseLength(s[1]);
                    if (!h || !w)
                        return null;
                    return {'h': h, 'w': w};
                }

            },
            function (doc, parent, element, attr, context) {

                var h;
                var w;

                if (attr === "auto") {

                    h = new imscUtils.ComputedLength(0, 1);

                } else {

                    h = imscUtils.toComputedLength(
                        attr.h.value,
                        attr.h.unit,
                        null,
                        doc.dimensions.h,
                        null,
                        doc.pxLength.h
                        );


                    if (h === null) {

                        return null;

                    }
                }

                if (attr === "auto") {

                    w = new imscUtils.ComputedLength(1, 0);

                } else {

                    w = imscUtils.toComputedLength(
                        attr.w.value,
                        attr.w.unit,
                        null,
                        doc.dimensions.w,
                        null,
                        doc.pxLength.w
                        );

                    if (w === null) {

                        return null;

                    }

                }

                return {'h': h, 'w': w};
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "fontFamily",
            "default",
            ['span', 'p'],
            true,
            true,
            function (str) {
                var ffs = str.split(",");
                var rslt = [];

                for (var i = 0; i < ffs.length; i++) {
                    ffs[i] = ffs[i].trim();

                    if (ffs[i].charAt(0) !== "'" && ffs[i].charAt(0) !== '"') {

                        if (ffs[i] === "default") {

                            /* per IMSC1 */

                            rslt.push("monospaceSerif");

                        } else {

                            rslt.push(ffs[i]);

                        }

                    } else {

                        rslt.push(ffs[i]);

                    }

                }

                return rslt;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "shear",
            "0%",
            ['p'],
            true,
            true,
            imscUtils.parseLength,
            function (doc, parent, element, attr) {

                var fs;

                if (attr.unit === "%") {

                    fs = Math.abs(attr.value) > 100 ? Math.sign(attr.value) * 100 : attr.value;

                } else {

                    return null;

                }

                return fs;
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "fontSize",
            "1c",
            ['span', 'p'],
            true,
            true,
            imscUtils.parseLength,
            function (doc, parent, element, attr, context) {

                var fs;

                fs = imscUtils.toComputedLength(
                    attr.value,
                    attr.unit,
                    parent !== null ? parent.styleAttrs[imscStyles.byName.fontSize.qname] : doc.cellLength.h,
                    parent !== null ? parent.styleAttrs[imscStyles.byName.fontSize.qname] : doc.cellLength.h,
                    doc.cellLength.h,
                    doc.pxLength.h
                    );

                return fs;
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "fontStyle",
            "normal",
            ['span', 'p'],
            true,
            true,
            function (str) {
                /* TODO: handle font style */

                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "fontWeight",
            "normal",
            ['span', 'p'],
            true,
            true,
            function (str) {
                /* TODO: handle font weight */

                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "lineHeight",
            "normal",
            ['p'],
            true,
            true,
            function (str) {
                if (str === "normal") {
                    return str;
                } else {
                    return imscUtils.parseLength(str);
                }
            },
            function (doc, parent, element, attr, context) {

                var lh;

                if (attr === "normal") {

                    /* inherit normal per https://github.com/w3c/ttml1/issues/220 */

                    lh = attr;

                } else {

                    lh = imscUtils.toComputedLength(
                        attr.value,
                        attr.unit,
                        element.styleAttrs[imscStyles.byName.fontSize.qname],
                        element.styleAttrs[imscStyles.byName.fontSize.qname],
                        doc.cellLength.h,
                        doc.pxLength.h
                        );

                    if (lh === null) {

                        return null;

                    }

                }

                /* TODO: create a Length constructor */

                return lh;
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "opacity",
            1.0,
            ['region'],
            false,
            true,
            parseFloat,
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "origin",
            "auto",
            ['region'],
            false,
            true,
            function (str) {

                if (str === "auto") {

                    return str;

                } else {

                    var s = str.split(" ");
                    if (s.length !== 2)
                        return null;
                    var w = imscUtils.parseLength(s[0]);
                    var h = imscUtils.parseLength(s[1]);
                    if (!h || !w)
                        return null;
                    return {'h': h, 'w': w};
                }

            },
            function (doc, parent, element, attr, context) {

                var h;
                var w;

                if (attr === "auto") {

                    h = new imscUtils.ComputedLength(0,0);

                } else {

                    h = imscUtils.toComputedLength(
                        attr.h.value,
                        attr.h.unit,
                        null,
                        doc.dimensions.h,
                        null,
                        doc.pxLength.h
                        );

                    if (h === null) {

                        return null;

                    }

                }

                if (attr === "auto") {

                    w = new imscUtils.ComputedLength(0,0);

                } else {

                    w = imscUtils.toComputedLength(
                        attr.w.value,
                        attr.w.unit,
                        null,
                        doc.dimensions.w,
                        null,
                        doc.pxLength.w
                        );

                    if (w === null) {

                        return null;

                    }

                }

                return {'h': h, 'w': w};
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "overflow",
            "hidden",
            ['region'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "padding",
            "0px",
            ['region'],
            false,
            true,
            function (str) {

                var s = str.split(" ");
                if (s.length > 4)
                    return null;
                var r = [];
                for (var i = 0; i < s.length; i++) {

                    var l = imscUtils.parseLength(s[i]);
                    if (!l)
                        return null;
                    r.push(l);
                }

                return r;
            },
            function (doc, parent, element, attr, context) {

                var padding;

                /* TODO: make sure we are in region */

                /*
                 * expand padding shortcuts to 
                 * [before, end, after, start]
                 * 
                 */

                if (attr.length === 1) {

                    padding = [attr[0], attr[0], attr[0], attr[0]];

                } else if (attr.length === 2) {

                    padding = [attr[0], attr[1], attr[0], attr[1]];

                } else if (attr.length === 3) {

                    padding = [attr[0], attr[1], attr[2], attr[1]];

                } else if (attr.length === 4) {

                    padding = [attr[0], attr[1], attr[2], attr[3]];

                } else {

                    return null;

                }

                /* TODO: take into account tts:direction */

                /* 
                 * transform [before, end, after, start] according to writingMode to 
                 * [top,left,bottom,right]
                 * 
                 */

                var dir = element.styleAttrs[imscStyles.byName.writingMode.qname];

                if (dir === "lrtb" || dir === "lr") {

                    padding = [padding[0], padding[3], padding[2], padding[1]];

                } else if (dir === "rltb" || dir === "rl") {

                    padding = [padding[0], padding[1], padding[2], padding[3]];

                } else if (dir === "tblr") {

                    padding = [padding[3], padding[0], padding[1], padding[2]];

                } else if (dir === "tbrl" || dir === "tb") {

                    padding = [padding[3], padding[2], padding[1], padding[0]];

                } else {

                    return null;

                }

                var out = [];

                for (var i = 0 ; i < padding.length; i++) {

                    if (padding[i].value === 0) {

                        out[i] = new imscUtils.ComputedLength(0,0);

                    } else {

                        out[i] = imscUtils.toComputedLength(
                            padding[i].value,
                            padding[i].unit,
                            element.styleAttrs[imscStyles.byName.fontSize.qname],
                            i === 0 || i === 2 ? element.styleAttrs[imscStyles.byName.extent.qname].h : element.styleAttrs[imscStyles.byName.extent.qname].w,
                            i === 0 || i === 2 ? doc.cellLength.h : doc.cellLength.w,
                            i === 0 || i === 2 ? doc.pxLength.h: doc.pxLength.w
                            );

                        if (out[i] === null) return null;

                    }
                }


                return out;
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "position",
            "top left",
            ['region'],
            false,
            true,
            function (str) {

                return imscUtils.parsePosition(str);

            },
            function (doc, parent, element, attr) {
                var h;
                var w;
                
                h = imscUtils.toComputedLength(
                    attr.v.offset.value,
                    attr.v.offset.unit,
                    null,
                    new imscUtils.ComputedLength(
                        - element.styleAttrs[imscStyles.byName.extent.qname].h.rw,
                        doc.dimensions.h.rh - element.styleAttrs[imscStyles.byName.extent.qname].h.rh 
                    ),
                    null,
                    doc.pxLength.h
                    );

                if (h === null) return null;


                if (attr.v.edge === "bottom") {

                    h = new imscUtils.ComputedLength(
                        - h.rw - element.styleAttrs[imscStyles.byName.extent.qname].h.rw,
                        doc.dimensions.h.rh - h.rh - element.styleAttrs[imscStyles.byName.extent.qname].h.rh
                    );
            
                }

                w = imscUtils.toComputedLength(
                    attr.h.offset.value,
                    attr.h.offset.unit,
                    null,
                    new imscUtils.ComputedLength(
                        doc.dimensions.w.rw - element.styleAttrs[imscStyles.byName.extent.qname].w.rw,
                        - element.styleAttrs[imscStyles.byName.extent.qname].w.rh
                    ),
                    null,
                    doc.pxLength.w
                    );

                if (h === null) return null;

                if (attr.h.edge === "right") {
                    
                    w = new imscUtils.ComputedLength(
                        doc.dimensions.w.rw - w.rw - element.styleAttrs[imscStyles.byName.extent.qname].w.rw,
                        - w.rh - element.styleAttrs[imscStyles.byName.extent.qname].w.rh
                    );

                }

                return {'h': h, 'w': w};
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "ruby",
            "none",
            ['span'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "rubyAlign",
            "center",
            ['span'],
            true,
            true,
            function (str) {
                
                if (! (str === "center" || str === "spaceAround")) {
                    return null;
                }
                
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "rubyPosition",
            "outside",
            ['span'],
            true,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "rubyReserve",
            "none",
            ['p'],
            true,
            true,
            function (str) {
                var s = str.split(" ");

                var r = [null, null];

                if (s.length === 0 || s.length > 2)
                    return null;

                if (s[0] === "none" ||
                    s[0] === "both" ||
                    s[0] === "after" ||
                    s[0] === "before" ||
                    s[0] === "outside") {

                    r[0] = s[0];

                } else {

                    return null;

                }

                if (s.length === 2 && s[0] !== "none") {

                    var l = imscUtils.parseLength(s[1]);

                    if (l) {

                        r[1] = l;

                    } else {

                        return null;

                    }

                }


                return r;
            },
            function (doc, parent, element, attr, context) {

                if (attr[0] === "none") {

                    return attr;

                }

                var fs = null;

                if (attr[1] === null) {

                    fs = new imscUtils.ComputedLength(
                            element.styleAttrs[imscStyles.byName.fontSize.qname].rw * 0.5,
                            element.styleAttrs[imscStyles.byName.fontSize.qname].rh * 0.5
                    );

                } else {

                    fs = imscUtils.toComputedLength(attr[1].value,
                        attr[1].unit,
                        element.styleAttrs[imscStyles.byName.fontSize.qname],
                        element.styleAttrs[imscStyles.byName.fontSize.qname],
                        doc.cellLength.h,
                        doc.pxLength.h
                        );
                
                }

                if (fs === null) return null;

                return [attr[0], fs];
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "showBackground",
            "always",
            ['region'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "textAlign",
            "start",
            ['p'],
            true,
            true,
            function (str) {
                return str;
            },
            function (doc, parent, element, attr, context) {
                /* Section 7.16.9 of XSL */

                if (attr === "left") {

                    return "start";

                } else if (attr === "right") {

                    return "end";

                } else {

                    return attr;

                }
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "textCombine",
            "none",
            ['span'],
            true,
            true,
            function (str) {
                if (str === "none" || str === "all") {

                    return str;
                }

                return null;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "textDecoration",
            "none",
            ['span'],
            true,
            true,
            function (str) {
                return str.split(" ");
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "textEmphasis",
            "none",
            ['span'],
            true,
            true,
            function (str) {
                var e = str.split(" ");

                var rslt = {style: null, symbol: null, color: null, position: null};

                for (var i = 0; i < e.length; i++) {

                    if (e[i] === "none" || e[i] === "auto") {

                        rslt.style = e[i];

                    } else if (e[i] === "filled" ||
                        e[i] === "open") {

                        rslt.style = e[i];

                    } else if (e[i] === "circle" ||
                        e[i] === "dot" ||
                        e[i] === "sesame") {

                        rslt.symbol = e[i];

                    } else if (e[i] === "current") {

                        rslt.color = e[i];

                    } else if (e[i] === "outside" || e[i] === "before" || e[i] === "after") {

                        rslt.position = e[i];

                    } else {

                        rslt.color = imscUtils.parseColor(e[i]);

                        if (rslt.color === null)
                            return null;

                    }
                }

                if (rslt.style == null && rslt.symbol == null) {

                    rslt.style = "auto";

                } else {

                    rslt.symbol = rslt.symbol || "circle";
                    rslt.style = rslt.style || "filled";

                }

                rslt.position = rslt.position || "outside";
                rslt.color = rslt.color || "current";

                return rslt;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "textOutline",
            "none",
            ['span'],
            true,
            true,
            function (str) {

                /*
                 * returns {c: <color>?, thichness: <length>} | "none"
                 * 
                 */

                if (str === "none") {

                    return str;

                } else {

                    var r = {};
                    var s = str.split(" ");
                    if (s.length === 0 || s.length > 2)
                        return null;
                    var c = imscUtils.parseColor(s[0]);

                    r.color = c;

                    if (c !== null)
                        s.shift();

                    if (s.length !== 1)
                        return null;

                    var l = imscUtils.parseLength(s[0]);

                    if (!l)
                        return null;

                    r.thickness = l;

                    return r;
                }

            },
            function (doc, parent, element, attr, context) {

                /*
                 * returns {color: <color>, thickness: <norm length>}
                 * 
                 */

                if (attr === "none")
                    return attr;

                var rslt = {};

                if (attr.color === null) {

                    rslt.color = element.styleAttrs[imscStyles.byName.color.qname];

                } else {

                    rslt.color = attr.color;

                }

                rslt.thickness = imscUtils.toComputedLength(
                    attr.thickness.value,
                    attr.thickness.unit,
                    element.styleAttrs[imscStyles.byName.fontSize.qname],
                    element.styleAttrs[imscStyles.byName.fontSize.qname],
                    doc.cellLength.h,
                    doc.pxLength.h
                    );

                if (rslt.thickness === null)
                    return null;

                return rslt;
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "textShadow",
            "none",
            ['span'],
            true,
            true,
            imscUtils.parseTextShadow,
            function (doc, parent, element, attr) {

                /*
                 * returns [{x_off: <length>, y_off: <length>, b_radius: <length>, color: <color>}*] or "none"
                 * 
                 */

                if (attr === "none")
                    return attr;

                var r = [];

                for (var i = 0; i < attr.length; i++) {

                    var shadow = {};

                    shadow.x_off = imscUtils.toComputedLength(
                        attr[i][0].value,
                        attr[i][0].unit,
                        null,
                        element.styleAttrs[imscStyles.byName.fontSize.qname],
                        null,
                        doc.pxLength.w
                        );

                    if (shadow.x_off === null)
                        return null;

                    shadow.y_off = imscUtils.toComputedLength(
                        attr[i][1].value,
                        attr[i][1].unit,
                        null,
                        element.styleAttrs[imscStyles.byName.fontSize.qname],
                        null,
                        doc.pxLength.h
                        );

                    if (shadow.y_off === null)
                        return null;

                    if (attr[i][2] === null) {

                        shadow.b_radius = 0;

                    } else {

                        shadow.b_radius = imscUtils.toComputedLength(
                            attr[i][2].value,
                            attr[i][2].unit,
                            null,
                            element.styleAttrs[imscStyles.byName.fontSize.qname],
                            null,
                            doc.pxLength.h
                            );

                        if (shadow.b_radius === null)
                            return null;

                    }

                    if (attr[i][3] === null) {

                        shadow.color = element.styleAttrs[imscStyles.byName.color.qname];

                    } else {

                        shadow.color = attr[i][3];

                    }

                    r.push(shadow);

                }

                return r;
            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "unicodeBidi",
            "normal",
            ['span', 'p'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "visibility",
            "visible",
            ['body', 'div', 'p', 'region', 'span'],
            true,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "wrapOption",
            "wrap",
            ['span'],
            true,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "writingMode",
            "lrtb",
            ['region'],
            false,
            true,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_tts,
            "zIndex",
            "auto",
            ['region'],
            false,
            true,
            function (str) {

                var rslt;

                if (str === 'auto') {

                    rslt = str;

                } else {

                    rslt = parseInt(str);

                    if (isNaN(rslt)) {
                        rslt = null;
                    }

                }

                return rslt;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_ebutts,
            "linePadding",
            "0c",
            ['p'],
            true,
            false,
            imscUtils.parseLength,
            function (doc, parent, element, attr, context) {

                return imscUtils.toComputedLength(attr.value, attr.unit, null, null, doc.cellLength.w, null);

            }
        ),
        new StylingAttributeDefinition(
            imscNames.ns_ebutts,
            "multiRowAlign",
            "auto",
            ['p'],
            true,
            false,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_smpte,
            "backgroundImage",
            null,
            ['div'],
            false,
            false,
            function (str) {
                return str;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_itts,
            "forcedDisplay",
            "false",
            ['body', 'div', 'p', 'region', 'span'],
            true,
            true,
            function (str) {
                return str === 'true' ? true : false;
            },
            null
            ),
        new StylingAttributeDefinition(
            imscNames.ns_itts,
            "fillLineGap",
            "false",
            ['p'],
            true,
            true,
            function (str) {
                return str === 'true' ? true : false;
            },
            null
            )
    ];

    /* TODO: allow null parse function */

    imscStyles.byQName = {};
    for (var i in imscStyles.all) {

        imscStyles.byQName[imscStyles.all[i].qname] = imscStyles.all[i];
    }

    imscStyles.byName = {};
    for (var j in imscStyles.all) {

        imscStyles.byName[imscStyles.all[j].name] = imscStyles.all[j];
    }


})(typeof exports === 'undefined' ? this.imscStyles = {} : exports,
    typeof imscNames === 'undefined' ? require("./names") : imscNames,
    typeof imscUtils === 'undefined' ? require("./utils") : imscUtils);
