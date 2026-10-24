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
 * @module imscHTML
 */

var browserIsFirefox = /firefox/i.test(navigator.userAgent);

;
(function (imscHTML, imscNames, imscStyles) {

    /**
     * Function that maps <pre>smpte:background</pre> URIs to URLs resolving to image resource
     * @callback IMGResolver
     * @param {string} <pre>smpte:background</pre> URI
     * @return {string} PNG resource URL
     */


    /**
     * Renders an ISD object (returned by <pre>generateISD()</pre>) into a 
     * parent element, that must be attached to the DOM. The ISD will be rendered
     * into a child <pre>div</pre>
     * with heigh and width equal to the clientHeight and clientWidth of the element,
     * unless explicitly specified otherwise by the caller. Images URIs specified 
     * by <pre>smpte:background</pre> attributes are mapped to image resource URLs
     * by an <pre>imgResolver</pre> function. The latter takes the value of <code>smpte:background</code>
     * attribute and an <code>img</code> DOM element as input, and is expected to
     * set the <code>src</code> attribute of the <code>img</code> to the absolute URI of the image.
     * <pre>displayForcedOnlyMode</pre> sets the (boolean)
     * value of the IMSC1 displayForcedOnlyMode parameter. The function returns
     * an opaque object that should passed in <code>previousISDState</code> when this function
     * is called for the next ISD, otherwise <code>previousISDState</code> should be set to 
     * <code>null</code>.
     * 
     * @param {Object} isd ISD to be rendered
     * @param {Object} element Element into which the ISD is rendered
     * @param {?IMGResolver} imgResolver Resolve <pre>smpte:background</pre> URIs into URLs.
     * @param {?number} eheight Height (in pixel) of the child <div>div</div> or null 
     *                  to use clientHeight of the parent element
     * @param {?number} ewidth Width (in pixel) of the child <div>div</div> or null
     *                  to use clientWidth of the parent element
     * @param {?boolean} displayForcedOnlyMode Value of the IMSC1 displayForcedOnlyMode parameter,
     *                   or false if null         
     * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
     * @param {Object} previousISDState State saved during processing of the previous ISD, or null if initial call
     * @param {?boolean} enableRollUp Enables roll-up animations (see CEA 708)
     * @return {Object} ISD state to be provided when this funtion is called for the next ISD
     */

    imscHTML.render = function (isd,
            element,
            imgResolver,
            eheight,
            ewidth,
            displayForcedOnlyMode,
            errorHandler,
            previousISDState,
            enableRollUp
            ) {

        /* maintain aspect ratio if specified */

        var height = eheight || element.clientHeight;
        var width = ewidth || element.clientWidth;

        if (isd.aspectRatio !== null) {

            var twidth = height * isd.aspectRatio;

            if (twidth > width) {

                height = Math.round(width / isd.aspectRatio);

            } else {

                width = twidth;

            }

        }

        var rootcontainer = document.createElement("div");

        rootcontainer.style.position = "relative";
        rootcontainer.style.width = width + "px";
        rootcontainer.style.height = height + "px";
        rootcontainer.style.margin = "auto";
        rootcontainer.style.top = 0;
        rootcontainer.style.bottom = 0;
        rootcontainer.style.left = 0;
        rootcontainer.style.right = 0;
        rootcontainer.style.zIndex = 0;

        var context = {
            h: height,
            w: width,
            regionH: null,
            regionW: null,
            imgResolver: imgResolver,
            displayForcedOnlyMode: displayForcedOnlyMode || false,
            isd: isd,
            errorHandler: errorHandler,
            previousISDState: previousISDState,
            enableRollUp: enableRollUp || false,
            currentISDState: {},
            flg: null, /* current fillLineGap value if active, null otherwise */
            lp: null, /* current linePadding value if active, null otherwise */
            mra: null, /* current multiRowAlign value if active, null otherwise */
            ipd: null, /* inline progression direction (lr, rl, tb) */
            bpd: null, /* block progression direction (lr, rl, tb) */
            ruby: null, /* is ruby present in a <p> */
            textEmphasis: null, /* is textEmphasis present in a <p> */
            rubyReserve: null /* is rubyReserve applicable to a <p> */
        };

        element.appendChild(rootcontainer);

        if ("contents" in isd) {

            for (var i = 0; i < isd.contents.length; i++) {

                processElement(context, rootcontainer, isd.contents[i], isd);

            }

        }

        return context.currentISDState;

    };

    function processElement(context, dom_parent, isd_element, isd_parent) {

        var e;

        if (isd_element.kind === 'region') {

            e = document.createElement("div");
            e.style.position = "absolute";

        } else if (isd_element.kind === 'body') {

            e = document.createElement("div");

        } else if (isd_element.kind === 'div') {

            e = document.createElement("div");

        } else if (isd_element.kind === 'image') {

            e = document.createElement("img");

            if (context.imgResolver !== null && isd_element.src !== null) {

                var uri = context.imgResolver(isd_element.src, e);

                if (uri)
                    e.src = uri;

                e.height = context.regionH;
                e.width = context.regionW;

            }

        } else if (isd_element.kind === 'p') {

            e = document.createElement("p");

        } else if (isd_element.kind === 'span') {

            if (isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "container") {

                e = document.createElement("ruby");

                context.ruby = true;

            } else if (isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "base") {

                e = document.createElement("span"); // rb element is deprecated in HTML

            } else if (isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "text") {

                e = document.createElement("rt");


            } else if (isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "baseContainer") {

                e = document.createElement("rbc");


            } else if (isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "textContainer") {

                e = document.createElement("rtc");


            } else if (isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "delimiter") {

                /* ignore rp */

                return;

            } else {

                e = document.createElement("span");

            }

            //e.textContent = isd_element.text;

        } else if (isd_element.kind === 'br') {

            e = document.createElement("br");

        }

        if (!e) {

            reportError(context.errorHandler, "Error processing ISD element kind: " + isd_element.kind);

            return;

        }

        /* set language */

        if (isd_element.lang) {

            if (isd_element.kind === 'region' || isd_element.lang !== isd_parent.lang) {
                e.lang = isd_element.lang;
            }

        }

        /* add to parent */

        dom_parent.appendChild(e);

        /* override UA default margin */
        /* TODO: should apply to <p> only */

        e.style.margin = "0";

        /* determine ipd and bpd */

        if (isd_element.kind === "region") {

            var wdir = isd_element.styleAttrs[imscStyles.byName.writingMode.qname];

            if (wdir === "lrtb" || wdir === "lr") {

                context.ipd = "lr";
                context.bpd = "tb";

            } else if (wdir === "rltb" || wdir === "rl") {

                context.ipd = "rl";
                context.bpd = "tb";

            } else if (wdir === "tblr") {

                context.ipd = "tb";
                context.bpd = "lr";

            } else if (wdir === "tbrl" || wdir === "tb") {

                context.ipd = "tb";
                context.bpd = "rl";

            }
 
        } else if (isd_element.kind === "p" && context.bpd === "tb") {

            var pdir = isd_element.styleAttrs[imscStyles.byName.direction.qname];

            context.ipd = pdir === "ltr" ? "lr" : "rl"; 
 
        }

        /* tranform TTML styles to CSS styles */

        for (var i = 0; i < STYLING_MAP_DEFS.length; i++) {

            var sm = STYLING_MAP_DEFS[i];

            var attr = isd_element.styleAttrs[sm.qname];

            if (attr !== undefined && sm.map !== null) {

                sm.map(context, e, isd_element, attr);

            }

        }

        var proc_e = e;

        /* do we have linePadding ? */

        var lp = isd_element.styleAttrs[imscStyles.byName.linePadding.qname];

        if (lp && (! lp.isZero())) {

            var plength = lp.toUsedLength(context.w, context.h);


            if (plength > 0) {
                
                /* apply padding to the <p> so that line padding does not cause line wraps */

                var padmeasure = Math.ceil(plength) + "px";

                if (context.bpd === "tb") {

                    proc_e.style.paddingLeft = padmeasure;
                    proc_e.style.paddingRight = padmeasure;

                } else {

                    proc_e.style.paddingTop = padmeasure;
                    proc_e.style.paddingBottom = padmeasure;

                }

                context.lp = lp;
            }
        }

        // do we have multiRowAlign?

        var mra = isd_element.styleAttrs[imscStyles.byName.multiRowAlign.qname];

        if (mra && mra !== "auto") {

            /* create inline block to handle multirowAlign */

            var s = document.createElement("span");

            s.style.display = "inline-block";

            s.style.textAlign = mra;

            e.appendChild(s);

            proc_e = s;

            context.mra = mra;

        }

        /* do we have rubyReserve? */

        var rr = isd_element.styleAttrs[imscStyles.byName.rubyReserve.qname];

        if (rr && rr[0] !== "none") {
            context.rubyReserve = rr;
        }


        /* remember we are filling line gaps */

        if (isd_element.styleAttrs[imscStyles.byName.fillLineGap.qname]) {
            context.flg = true;
        }


        if (isd_element.kind === "span" && isd_element.text) {

            var te = isd_element.styleAttrs[imscStyles.byName.textEmphasis.qname];

            if (te && te.style !== "none") {

                context.textEmphasis = true;

            }

            if (imscStyles.byName.textCombine.qname in isd_element.styleAttrs &&
                    isd_element.styleAttrs[imscStyles.byName.textCombine.qname] === "all") {

                /* ignore tate-chu-yoku since line break cannot happen within */
                e.textContent = isd_element.text;
                e._isd_element = isd_element;

                if (te) {

                    applyTextEmphasis(context, e, isd_element, te);

                };

            } else {

                // wrap characters in spans to find the line wrap locations

                var cbuf = '';

                for (var j = 0; j < isd_element.text.length; j++) {

                    cbuf += isd_element.text.charAt(j);

                    var cc = isd_element.text.charCodeAt(j);

                    if (cc < 0xD800 || cc > 0xDBFF || j === isd_element.text.length - 1) {

                        /* wrap the character(s) in a span unless it is a high surrogate */

                        var span = document.createElement("span");

                        span.textContent = cbuf;

                        /* apply textEmphasis */
                        
                        if (te) {

                            applyTextEmphasis(context, span, isd_element, te);

                        };
    
                        e.appendChild(span);

                        cbuf = '';

                        //For the sake of merging these back together, record what isd element generated it.
                        span._isd_element = isd_element;
                    }

                }

            }
        }

        /* process the children of the ISD element */

        if ("contents" in isd_element) {

            for (var k = 0; k < isd_element.contents.length; k++) {

                processElement(context, proc_e, isd_element.contents[k], isd_element);

            }

        }

        /* list of lines */

        var linelist = [];


        /* paragraph processing */
        /* TODO: linePadding only supported for horizontal scripts */

        if (isd_element.kind === "p") {

            constructLineList(context, proc_e, linelist, null);

            /* apply rubyReserve */

            if (context.rubyReserve) {

                applyRubyReserve(linelist, context);

                context.rubyReserve = null;

            }

            /* apply tts:rubyPosition="outside" */

            if (context.ruby || context.rubyReserve) {

                applyRubyPosition(linelist, context);

                context.ruby = null;

            }

            /* apply text emphasis "outside" position */

            if (context.textEmphasis) {

                applyTextEmphasisOutside(linelist, context);

                context.textEmphasis = null;

            }

            /* insert line breaks for multirowalign */

            if (context.mra) {

                applyMultiRowAlign(linelist);

                context.mra = null;

            }

            /* add linepadding */

            if (context.lp) {

                applyLinePadding(linelist, context.lp.toUsedLength(context.w, context.h), context);

                context.lp = null;

            }

            mergeSpans(linelist, context); // The earlier we can do this the less processing there will be.

            /* fill line gaps linepadding */

            if (context.flg) {

                var par_edges = rect2edges(proc_e.getBoundingClientRect(), context);

                applyFillLineGap(linelist, par_edges.before, par_edges.after, context, proc_e);

                context.flg = null;

            }

        }


        /* region processing */

        if (isd_element.kind === "region") {

            /* perform roll up if needed */
            if ((context.bpd === "tb") &&
                    context.enableRollUp &&
                    isd_element.contents.length > 0 &&
                    isd_element.styleAttrs[imscStyles.byName.displayAlign.qname] === 'after') {

                /* build line list */
                constructLineList(context, proc_e, linelist, null);

                /* horrible hack, perhaps default region id should be underscore everywhere? */

                var rid = isd_element.id === '' ? '_' : isd_element.id;

                var rb = new RegionPBuffer(rid, linelist);

                context.currentISDState[rb.id] = rb;

                if (context.previousISDState &&
                        rb.id in context.previousISDState &&
                        context.previousISDState[rb.id].plist.length > 0 &&
                        rb.plist.length > 1 &&
                        rb.plist[rb.plist.length - 2].text ===
                        context.previousISDState[rb.id].plist[context.previousISDState[rb.id].plist.length - 1].text) {

                    var body_elem = e.firstElementChild;

                    var h = rb.plist[rb.plist.length - 1].after - rb.plist[rb.plist.length - 1].before;

                    body_elem.style.bottom = "-" + h + "px";
                    body_elem.style.transition = "transform 0.4s";
                    body_elem.style.position = "relative";
                    body_elem.style.transform = "translateY(-" + h + "px)";

                }

            }
        }
    }

    function mergeSpans(lineList, context) {

        for (var i = 0; i < lineList.length; i++) {

            var line = lineList[i];

            for (var j = 1; j < line.elements.length;) {

                var previous = line.elements[j - 1];
                var span = line.elements[j];

                if (spanMerge(previous.node, span.node, context)) {

                    //removed from DOM by spanMerge(), remove from the list too.
                    line.elements.splice(j, 1);
                    continue;

                } else {

                    j++;

                }

            }
        }

        // Copy backgroundColor to each span so that fillLineGap will apply padding to elements with the right background
        var thisNode, ancestorBackgroundColor;
        var clearTheseBackgrounds = [];

        for (var l = 0; l < lineList.length; l++) {

            for (var el = 0; el < lineList[l].elements.length; el++) {

                thisNode = lineList[l].elements[el].node;
                ancestorBackgroundColor = getSpanAncestorColor(thisNode, clearTheseBackgrounds, false);

                if (ancestorBackgroundColor) {

                    thisNode.style.backgroundColor = ancestorBackgroundColor;

                }
            }
        }

        for (var bi = 0; bi < clearTheseBackgrounds.length; bi++) {

            clearTheseBackgrounds[bi].style.backgroundColor = "";

        }
    }

    function getSpanAncestorColor(element, ancestorList, isAncestor) {

        if (element.style.backgroundColor) {

            if (isAncestor && !ancestorList.includes(element)) {

                ancestorList.push(element);

            }
            return element.style.backgroundColor;

        } else {

            if (element.parentElement.nodeName === "SPAN" ||
                element.parentElement.nodeName === "RUBY" ||
                element.parentElement.nodeName === "RBC" ||
                element.parentElement.nodeName === "RTC" ||
                element.parentElement.nodeName === "RT") {

                return getSpanAncestorColor(element.parentElement, ancestorList, true);

            }

        }

        return undefined;
    }

    function spanMerge(first, second, context) {

        if (first.tagName === "SPAN" &&
            second.tagName === "SPAN" &&
            first._isd_element === second._isd_element) {
                if (! first._isd_element) {
                    /* we should never get here since every span should have a source ISD element */
                    reportError(context.errorHandler, "Internal error: HTML span is not linked to a source element; cannot merge spans.");
                    return false;
                }

                first.textContent += second.textContent;

                for (var i = 0; i < second.style.length; i++) {

                    var styleName = second.style[i];
                    if (styleName.indexOf("border") >= 0 || 
                        styleName.indexOf("padding") >= 0 ||
                        styleName.indexOf("margin") >= 0) {

                        first.style[styleName] = second.style[styleName];

                    }
                }

                second.parentElement.removeChild(second);

                return true;
            }

        return false;
    }

    function applyLinePadding(lineList, lp, context) {

        if (lineList === null) return;

        for (var i = 0; i < lineList.length; i++) {

            var l = lineList[i].elements.length;

            var pospadpxlen = Math.ceil(lp) + "px";

            var negpadpxlen = "-" + Math.ceil(lp) + "px";

            if (l !== 0) {

                var se = lineList[i].elements[lineList[i].start_elem];

                var ee = lineList[i].elements[lineList[i].end_elem];

                if (se === ee) {

                    // Check to see if there's any background at all
                    var elementBoundingRect = se.node.getBoundingClientRect();
                    
                    if (elementBoundingRect.width == 0 || elementBoundingRect.height == 0) {

                        // There's no background on this line, move on.
                        continue;

                    }

                }

                // Start element
                if (context.ipd === "lr") {

                    se.node.style.marginLeft = negpadpxlen;
                    se.node.style.paddingLeft = pospadpxlen;

                } else if (context.ipd === "rl") {

                    se.node.style.paddingRight = pospadpxlen;
                    se.node.style.marginRight = negpadpxlen;

                } else if (context.ipd === "tb") {

                    se.node.style.paddingTop = pospadpxlen;
                    se.node.style.marginTop = negpadpxlen;

                }

                // End element
                if (context.ipd === "lr") {

                    // Firefox has a problem with line-breaking when a negative margin is applied.
                    // The positioning will be wrong but don't apply when on firefox.
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1502610
                    if (!browserIsFirefox) {
                        ee.node.style.marginRight = negpadpxlen;
                    }
                    ee.node.style.paddingRight = pospadpxlen;

                } else if (context.ipd === "rl") {

                    ee.node.style.paddingLeft = pospadpxlen;
                    if (!browserIsFirefox) {
                        ee.node.style.marginLeft = negpadpxlen;
                    }

                } else if (context.ipd === "tb") {

                    ee.node.style.paddingBottom = pospadpxlen;
                    ee.node.style.marginBottom = negpadpxlen;

                }

            }

        }

    }

    function applyMultiRowAlign(lineList) {

        /* apply an explicit br to all but the last line */

        for (var i = 0; i < lineList.length - 1; i++) {

            var l = lineList[i].elements.length;

            if (l !== 0 && lineList[i].br === false) {
                var br = document.createElement("br");

                var lastnode = lineList[i].elements[l - 1].node;

                lastnode.parentElement.insertBefore(br, lastnode.nextSibling);
            }

        }

    }

    function applyTextEmphasisOutside(lineList, context) {

        /* supports "outside" only */

        for (var i = 0; i < lineList.length; i++) {

            for (var j = 0; j < lineList[i].te.length; j++) {

                /* skip if position already set */

                if (lineList[i].te[j].style[TEXTEMPHASISPOSITION_PROP] &&
                    lineList[i].te[j].style[TEXTEMPHASISPOSITION_PROP] !== "none")
                    continue;

                var pos;

                if (context.bpd === "tb") {

                    pos = (i === 0) ? "left over" : "left under";


                } else {

                    if (context.bpd === "rl") {

                        pos = (i === 0) ? "right under" : "left under";

                    } else {

                        pos = (i === 0) ? "left under" : "right under";

                    }

                }

                lineList[i].te[j].style[TEXTEMPHASISPOSITION_PROP] = pos;

            }

        }

    }

    function applyRubyPosition(lineList, context) {

        for (var i = 0; i < lineList.length; i++) {

            for (var j = 0; j < lineList[i].rbc.length; j++) {

                /* skip if ruby-position already set */

                if (lineList[i].rbc[j].style[RUBYPOSITION_PROP])
                    continue;

                var pos;

                if (RUBYPOSITION_ISWK) {

                    /* WebKit exception */

                    pos = (i === 0) ? "before" : "after";

                } else if (context.bpd === "tb") {

                    pos = (i === 0) ? "over" : "under";


                } else {

                    if (context.bpd === "rl") {

                        pos = (i === 0) ? "over" : "under";

                    } else {

                        pos = (i === 0) ? "under" : "over";

                    }

                }

                lineList[i].rbc[j].style[RUBYPOSITION_PROP] = pos;

            }

        }

    }

    function applyRubyReserve(lineList, context) {

        for (var i = 0; i < lineList.length; i++) {

            var ruby = document.createElement("ruby");

            var rb = document.createElement("span");  // rb element is deprecated in HTML
            rb.textContent = "\u200B";

            ruby.appendChild(rb);

            var rt1;
            var rt2;

            var fs = context.rubyReserve[1].toUsedLength(context.w, context.h) + "px";

            if (context.rubyReserve[0] === "both" || (context.rubyReserve[0] === "outside" && lineList.length == 1)) {

                rt1 = document.createElement("rtc");
                rt1.style[RUBYPOSITION_PROP] = RUBYPOSITION_ISWK ? "after" : "under";
                rt1.textContent = "\u200B";
                rt1.style.fontSize = fs;

                rt2 = document.createElement("rtc");
                rt2.style[RUBYPOSITION_PROP] = RUBYPOSITION_ISWK ? "before" : "over";
                rt2.textContent = "\u200B";
                rt2.style.fontSize = fs;

                ruby.appendChild(rt1);
                ruby.appendChild(rt2);

            } else {

                rt1 = document.createElement("rtc");
                rt1.textContent = "\u200B";
                rt1.style.fontSize = fs;

                var pos;

                if (context.rubyReserve[0] === "after" || (context.rubyReserve[0] === "outside" && i > 0)) {

                    pos = RUBYPOSITION_ISWK ? "after" : ((context.bpd === "tb" || context.bpd === "rl") ? "under" : "over");

                } else {

                    pos = RUBYPOSITION_ISWK ? "before" : ((context.bpd === "tb" || context.bpd === "rl") ? "over" : "under");

                }

                rt1.style[RUBYPOSITION_PROP] = pos;

                ruby.appendChild(rt1);

            }

            /* add in front of the first ruby element of the line, if it exists */

            var sib = null;

            for (var j = 0; j < lineList[i].rbc.length; j++) {

                if (lineList[i].rbc[j].localName === 'ruby') {

                    sib = lineList[i].rbc[j];

                    /* copy specified style properties from the sibling ruby container */
                    
                    for (var k = 0; k < sib.style.length; k++) {

                        ruby.style.setProperty(sib.style.item(k), sib.style.getPropertyValue(sib.style.item(k)));

                    }

                    break;
                }

            }

            /* otherwise add before first span */

            sib = sib || lineList[i].elements[0].node;

            sib.parentElement.insertBefore(ruby, sib);

        }

    }

    function applyFillLineGap(lineList, par_before, par_after, context, element) {

        /* positive for BPD = lr and tb, negative for BPD = rl */
        var s = Math.sign(par_after - par_before);

        for (var i = 0; i <= lineList.length; i++) {

            /* compute frontier between lines */

            var frontier;

            if (i === 0) {

                frontier = Math.round(par_before);

            } else if (i === lineList.length) {

                frontier = Math.round(par_after);

            } else {

                frontier = Math.round((lineList[i - 1].after + lineList[i].before) / 2);

            }

            var padding;
            var l,thisNode;

            /* before line */
            if (i > 0) {

                if (lineList[i-1]) {

                    for (l = 0; l < lineList[i - 1].elements.length; l++) {

                        thisNode=lineList[i - 1].elements[l];
                        padding = s*(frontier-thisNode.after) + "px";

                        if (context.bpd === "lr") {

                            thisNode.node.style.paddingRight = padding;

                        } else if (context.bpd === "rl") {

                            thisNode.node.style.paddingLeft = padding;

                        } else if (context.bpd === "tb") {

                            thisNode.node.style.paddingBottom = padding;

                        }

                    }

                }

            }

            /* after line */
            if (i < lineList.length) {

                for (l = 0; l < lineList[i].elements.length; l++) {

                    thisNode = lineList[i].elements[l];
                    padding = s * (thisNode.before - frontier) + "px";

                    if (context.bpd === "lr") {

                        thisNode.node.style.paddingLeft = padding;

                    } else if (context.bpd === "rl") {

                        thisNode.node.style.paddingRight = padding;

                    } else if (context.bpd === "tb") {

                        thisNode.node.style.paddingTop = padding;

                    }
                }

            }

        }

    }

    function RegionPBuffer(id, lineList) {

        this.id = id;

        this.plist = lineList;

    }

    function rect2edges(rect, context) {

        var edges = {before: null, after: null, start: null, end: null};

        if (context.bpd === "tb") {

            edges.before = rect.top;
            edges.after = rect.bottom;

            if (context.ipd === "lr") {

                edges.start = rect.left;
                edges.end = rect.right;

            } else {

                edges.start = rect.right;
                edges.end = rect.left;
            }

        } else if (context.bpd === "lr") {

            edges.before = rect.left;
            edges.after = rect.right;
            edges.start = rect.top;
            edges.end = rect.bottom;

        } else if (context.bpd === "rl") {

            edges.before = rect.right;
            edges.after = rect.left;
            edges.start = rect.top;
            edges.end = rect.bottom;

        }

        return edges;

    }

    function constructLineList(context, element, llist, bgcolor) {

        if (element.localName === "rt" || element.localName === "rtc") {

            /* skip ruby annotations */

            return;

        }

        var curbgcolor = element.style.backgroundColor || bgcolor;

        if (element.childElementCount === 0) {

            if (element.localName === 'span' || element.localName === 'rb') {

                var r = element.getBoundingClientRect();

                var edges = rect2edges(r, context);

                if (llist.length === 0 ||
                        (!isSameLine(edges.before, edges.after, llist[llist.length - 1].before, llist[llist.length - 1].after))
                        ) {
                    llist.push({
                        before: edges.before,
                        after: edges.after,
                        start: edges.start,
                        end: edges.end,
                        start_elem: 0,
                        end_elem: 0,
                        elements: [],
                        rbc: [],
                        te: [],
                        text: "",
                        br: false
                    });

                } else {

                    /* positive for BPD = lr and tb, negative for BPD = rl */
                    var bpd_dir = Math.sign(edges.after - edges.before);

                    /* positive for IPD = lr and tb, negative for IPD = rl */
                    var ipd_dir = Math.sign(edges.end - edges.start);

                    /* check if the line height has increased */

                    if (bpd_dir * (edges.before - llist[llist.length - 1].before) < 0) {
                        llist[llist.length - 1].before = edges.before;
                    }

                    if (bpd_dir * (edges.after - llist[llist.length - 1].after) > 0) {
                        llist[llist.length - 1].after = edges.after;
                    }

                    if (ipd_dir * (edges.start - llist[llist.length - 1].start) < 0) {
                        llist[llist.length - 1].start = edges.start;
                        llist[llist.length - 1].start_elem = llist[llist.length - 1].elements.length;
                    }

                    if (ipd_dir * (edges.end - llist[llist.length - 1].end) > 0) {
                        llist[llist.length - 1].end = edges.end;
                        llist[llist.length - 1].end_elem = llist[llist.length - 1].elements.length;
                    }

                }

                llist[llist.length - 1].text += element.textContent;

                llist[llist.length - 1].elements.push(
                        {
                            node: element,
                            bgcolor: curbgcolor,
                            before: edges.before,
                            after: edges.after
                        }
                );

            } else if (element.localName === 'br' && llist.length !== 0) {

                llist[llist.length - 1].br = true;

            }

        } else {

            var child = element.firstChild;

            while (child) {

                if (child.nodeType === Node.ELEMENT_NODE) {

                    constructLineList(context, child, llist, curbgcolor);

                    if (child.localName === 'ruby' || child.localName === 'rtc') {

                        /* remember non-empty ruby and rtc elements so that tts:rubyPosition can be applied */

                        if (llist.length > 0) {

                            llist[llist.length - 1].rbc.push(child);

                        }

                    } else if (child.localName === 'span' &&
                            child.style[TEXTEMPHASISSTYLE_PROP] &&
                            child.style[TEXTEMPHASISSTYLE_PROP] !== "none") {

                        /* remember non-empty span elements with textEmphasis */

                        if (llist.length > 0) {

                            llist[llist.length - 1].te.push(child);

                        }

                    }
                    

                }

                child = child.nextSibling;
            }
        }

    }

    function isSameLine(before1, after1, before2, after2) {

        return ((after1 < after2) && (before1 > before2)) || ((after2 <= after1) && (before2 >= before1));

    }

    function applyTextEmphasis(context, dom_element, isd_element, attr) {

        /* ignore color (not used in IMSC 1.1) */

        if (attr.style === "none") {

            /* text-emphasis is not inherited and the default is none, so nothing to do */
            
            return;
        
        } else if (attr.style === "auto") {

            dom_element.style[TEXTEMPHASISSTYLE_PROP] = "filled";
        
        } else {

            dom_element.style[TEXTEMPHASISSTYLE_PROP] =  attr.style + " " + attr.symbol;
        }

        /* ignore "outside" position (set in postprocessing) */

        if (attr.position === "before" || attr.position === "after") {

            var pos;

            if (context.bpd === "tb") {

                pos = (attr.position === "before") ? "left over" : "left under";


            } else {

                if (context.bpd === "rl") {

                    pos = (attr.position === "before") ? "right under" : "left under";

                } else {

                    pos = (attr.position === "before") ? "left under" : "right under";

                }

            }

            dom_element.style[TEXTEMPHASISPOSITION_PROP] = pos;
        }
    }

    function HTMLStylingMapDefinition(qName, mapFunc) {
        this.qname = qName;
        this.map = mapFunc;
    }

    var STYLING_MAP_DEFS = [

        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling backgroundColor",
                function (context, dom_element, isd_element, attr) {

                    /* skip if transparent */
                    if (attr[3] === 0)
                        return;

                    dom_element.style.backgroundColor = "rgba(" +
                            attr[0].toString() + "," +
                            attr[1].toString() + "," +
                            attr[2].toString() + "," +
                            (attr[3] / 255).toString() +
                            ")";
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling color",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.color = "rgba(" +
                            attr[0].toString() + "," +
                            attr[1].toString() + "," +
                            attr[2].toString() + "," +
                            (attr[3] / 255).toString() +
                            ")";
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling direction",
                function (context, dom_element, isd_element, attr) {

                    dom_element.style.direction = attr;

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling display",
                function (context, dom_element, isd_element, attr) {}
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling displayAlign",
                function (context, dom_element, isd_element, attr) {

                    /* see https://css-tricks.com/snippets/css/a-guide-to-flexbox/ */

                    /* TODO: is this affected by writing direction? */

                    dom_element.style.display = "flex";
                    dom_element.style.flexDirection = "column";


                    if (attr === "before") {

                        dom_element.style.justifyContent = "flex-start";

                    } else if (attr === "center") {

                        dom_element.style.justifyContent = "center";

                    } else if (attr === "after") {

                        dom_element.style.justifyContent = "flex-end";
                    }

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling extent",
                function (context, dom_element, isd_element, attr) {
                    /* TODO: this is super ugly */

                    context.regionH = attr.h.toUsedLength(context.w, context.h);
                    context.regionW = attr.w.toUsedLength(context.w, context.h);

                    /* 
                     * CSS height/width are measured against the content rectangle,
                     * whereas TTML height/width include padding
                     */

                    var hdelta = 0;
                    var wdelta = 0;

                    var p = isd_element.styleAttrs["http://www.w3.org/ns/ttml#styling padding"];

                    if (!p) {

                        /* error */

                    } else {

                        hdelta = p[0].toUsedLength(context.w, context.h) + p[2].toUsedLength(context.w, context.h);
                        wdelta = p[1].toUsedLength(context.w, context.h) + p[3].toUsedLength(context.w, context.h);

                    }

                    dom_element.style.height = (context.regionH - hdelta) + "px";
                    dom_element.style.width = (context.regionW - wdelta) + "px";

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling fontFamily",
                function (context, dom_element, isd_element, attr) {

                    var rslt = [];

                    /* per IMSC1 */

                    for (var i = 0; i < attr.length; i++) {
                        attr[i] = attr[i].trim();

                        if (attr[i] === "monospaceSerif") {

                            rslt.push("Courier New");
                            rslt.push('"Liberation Mono"');
                            rslt.push("Courier");
                            rslt.push("monospace");

                        } else if (attr[i] === "proportionalSansSerif") {

                            rslt.push("Arial");
                            rslt.push("Helvetica");
                            rslt.push('"Liberation Sans"');
                            rslt.push("sans-serif");

                        } else if (attr[i] === "monospace") {

                            rslt.push("monospace");

                        } else if (attr[i] === "sansSerif") {

                            rslt.push("sans-serif");

                        } else if (attr[i] === "serif") {

                            rslt.push("serif");

                        } else if (attr[i] === "monospaceSansSerif") {

                            rslt.push("Consolas");
                            rslt.push("monospace");

                        } else if (attr[i] === "proportionalSerif") {

                            rslt.push("serif");

                        } else {

                            rslt.push(attr[i]);

                        }

                    }

                    // prune later duplicates we may have inserted 
                    if (rslt.length > 0) {

                        var unique=[rslt[0]];

                        for (var fi = 1; fi < rslt.length; fi++) {

                            if (unique.indexOf(rslt[fi]) == -1) {

                                unique.push(rslt[fi]);

                            }
                        }

                        rslt = unique;
                    }

                    dom_element.style.fontFamily = rslt.join(",");
                }
        ),

        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling shear",
                function (context, dom_element, isd_element, attr) {

                    /* return immediately if tts:shear is 0% since CSS transforms are not inherited*/

                    if (attr === 0)
                        return;

                    var angle = attr * -0.9;

                    /* context.bpd is needed since writing mode is not inherited and sets the inline progression */

                    if (context.bpd === "tb") {

                        dom_element.style.transform = "skewX(" + angle + "deg)";

                    } else {

                        dom_element.style.transform = "skewY(" + angle + "deg)";

                    }

                }
        ),

        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling fontSize",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.fontSize = attr.toUsedLength(context.w, context.h) + "px";
                }
        ),

        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling fontStyle",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.fontStyle = attr;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling fontWeight",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.fontWeight = attr;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling lineHeight",
                function (context, dom_element, isd_element, attr) {
                    if (attr === "normal") {

                        dom_element.style.lineHeight = "normal";

                    } else {

                        dom_element.style.lineHeight = attr.toUsedLength(context.w, context.h) + "px";
                    }
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling opacity",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.opacity = attr;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling origin",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.top = attr.h.toUsedLength(context.w, context.h) + "px";
                    dom_element.style.left = attr.w.toUsedLength(context.w, context.h) + "px";
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling overflow",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.overflow = attr;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling padding",
                function (context, dom_element, isd_element, attr) {

                    /* attr: top,left,bottom,right*/

                    /* style: top right bottom left*/

                    var rslt = [];

                    rslt[0] = attr[0].toUsedLength(context.w, context.h) + "px";
                    rslt[1] = attr[3].toUsedLength(context.w, context.h) + "px";
                    rslt[2] = attr[2].toUsedLength(context.w, context.h) + "px";
                    rslt[3] = attr[1].toUsedLength(context.w, context.h) + "px";

                    dom_element.style.padding = rslt.join(" ");
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling position",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.top = attr.h.toUsedLength(context.w, context.h) + "px";
                    dom_element.style.left = attr.w.toUsedLength(context.w, context.h) + "px";
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling rubyAlign",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.rubyAlign = attr === "spaceAround" ? "space-around" : "center";
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling rubyPosition",
                function (context, dom_element, isd_element, attr) {

                    /* skip if "outside", which is handled by applyRubyPosition() */

                    if (attr === "before" || attr === "after") {

                        var pos;

                        if (RUBYPOSITION_ISWK) {

                            /* WebKit exception */
        
                            pos = attr;
        
                        } else if (context.bpd === "tb") {

                            pos = (attr === "before") ? "over" : "under";


                        } else {

                            if (context.bpd === "rl") {

                                pos = (attr === "before") ? "over" : "under";

                            } else {

                                pos = (attr === "before") ? "under" : "over";

                            }

                        }

                        /* apply position to the parent dom_element, i.e. ruby or rtc */

                        dom_element.parentElement.style[RUBYPOSITION_PROP] = pos;
                    }
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling showBackground",
                null
                ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling textAlign",
                function (context, dom_element, isd_element, attr) {

                    var ta;

                    /* handle UAs that do not understand start or end */

                    if (attr === "start") {

                        ta = (context.ipd === "rl") ? "right" : "left";

                    } else if (attr === "end") {

                        ta = (context.ipd === "rl") ? "left" : "right";

                    } else {

                        ta = attr;

                    }

                    dom_element.style.textAlign = ta;

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling textDecoration",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.textDecoration = attr.join(" ").replace("lineThrough", "line-through");
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling textOutline",
                function (context, dom_element, isd_element, attr) {

                    /* defer to tts:textShadow */
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling textShadow",
                function (context, dom_element, isd_element, attr) {

                    var txto = isd_element.styleAttrs[imscStyles.byName.textOutline.qname];

                    if (attr === "none" && txto === "none") {

                        dom_element.style.textShadow = "";

                    } else {

                        var s = [];

                        if (txto !== "none") {

                            /* emulate text outline */

                            var to_color = "rgba(" +
                                                txto.color[0].toString() + "," +
                                                txto.color[1].toString() + "," +
                                                txto.color[2].toString() + "," +
                                                (txto.color[3] / 255).toString() +
                                                ")";

                            s.push(  "1px 1px 1px " + to_color);
                            s.push(  "-1px 1px 1px " + to_color);
                            s.push(  "1px -1px 1px " + to_color);
                            s.push(  "-1px -1px 1px " + to_color);

                        }

                        /* add text shadow */

                        if (attr !== "none") {

                            for (var i = 0; i < attr.length; i++) {


                                s.push(attr[i].x_off.toUsedLength(context.w, context.h) + "px " +
                                        attr[i].y_off.toUsedLength(context.w, context.h) + "px " +
                                        attr[i].b_radius.toUsedLength(context.w, context.h) + "px " +
                                        "rgba(" +
                                        attr[i].color[0].toString() + "," +
                                        attr[i].color[1].toString() + "," +
                                        attr[i].color[2].toString() + "," +
                                        (attr[i].color[3] / 255).toString() +
                                        ")"
                                        );

                            }

                        }

                        dom_element.style.textShadow = s.join(",");

                    }
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling textCombine",
                function (context, dom_element, isd_element, attr) {

                    dom_element.style.textCombineUpright = attr;

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling textEmphasis",
                function (context, dom_element, isd_element, attr) {

                    /* applied as part of HTML document construction */

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling unicodeBidi",
                function (context, dom_element, isd_element, attr) {

                    var ub;

                    if (attr === 'bidiOverride') {
                        ub = "bidi-override";
                    } else {
                        ub = attr;
                    }

                    dom_element.style.unicodeBidi = ub;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling visibility",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.visibility = attr;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling wrapOption",
                function (context, dom_element, isd_element, attr) {

                    if (attr === "wrap") {

                        if (isd_element.space === "preserve") {
                            dom_element.style.whiteSpace = "pre-wrap";
                        } else {
                            dom_element.style.whiteSpace = "normal";
                        }

                    } else {

                        if (isd_element.space === "preserve") {

                            dom_element.style.whiteSpace = "pre";

                        } else {
                            dom_element.style.whiteSpace = "noWrap";
                        }

                    }

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling writingMode",
                function (context, dom_element, isd_element, attr) {

                    var wm;

                    if (attr === "lrtb" || attr === "lr") {

                        dom_element.style.writingMode = "horizontal-tb";

                    } else if (attr === "rltb" || attr === "rl") {

                        dom_element.style.writingMode = "horizontal-tb";

                    } else if (attr === "tblr") {

                        dom_element.style.writingMode = "vertical-lr";

                    } else if (attr === "tbrl" || attr === "tb") {

                        dom_element.style.writingMode = "vertical-rl";

                    }

                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml#styling zIndex",
                function (context, dom_element, isd_element, attr) {
                    dom_element.style.zIndex = attr;
                }
        ),
        new HTMLStylingMapDefinition(
                "http://www.w3.org/ns/ttml/profile/imsc1#styling forcedDisplay",
                function (context, dom_element, isd_element, attr) {

                    if (context.displayForcedOnlyMode && attr === false) {
                        dom_element.style.visibility = "hidden";
                    }

                }
        )
    ];

    var STYLMAP_BY_QNAME = {};

    for (var i = 0; i < STYLING_MAP_DEFS.length; i++) {

        STYLMAP_BY_QNAME[STYLING_MAP_DEFS[i].qname] = STYLING_MAP_DEFS[i];
    }

    /* CSS property names */

    var RUBYPOSITION_ISWK = "webkitRubyPosition" in window.getComputedStyle(document.documentElement);

    var RUBYPOSITION_PROP = RUBYPOSITION_ISWK ? "webkitRubyPosition" : "rubyPosition";

    var TEXTEMPHASISSTYLE_PROP = "webkitTextEmphasisStyle" in window.getComputedStyle(document.documentElement) ? "webkitTextEmphasisStyle" : "textEmphasisStyle";

    var TEXTEMPHASISPOSITION_PROP = "webkitTextEmphasisPosition" in window.getComputedStyle(document.documentElement) ? "webkitTextEmphasisPosition" : "textEmphasisPosition";

    /* error utilities */

    function reportError(errorHandler, msg) {

        if (errorHandler && errorHandler.error && errorHandler.error(msg))
            throw msg;

    }

})(typeof exports === 'undefined' ? this.imscHTML = {} : exports,
        typeof imscNames === 'undefined' ? require("./names") : imscNames,
        typeof imscStyles === 'undefined' ? require("./styles") : imscStyles,
        typeof imscUtils === 'undefined' ? require("./utils") : imscUtils);
