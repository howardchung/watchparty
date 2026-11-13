(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.imsc = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
 * @module imscDoc
 */

;
(function (imscDoc, sax, imscNames, imscStyles, imscUtils) {


    /**
     * Allows a client to provide callbacks to handle children of the <metadata> element
     * @typedef {Object} MetadataHandler
     * @property {?OpenTagCallBack} onOpenTag
     * @property {?CloseTagCallBack} onCloseTag
     * @property {?TextCallBack} onText
     */

    /**
     * Called when the opening tag of an element node is encountered.
     * @callback OpenTagCallBack
     * @param {string} ns Namespace URI of the element
     * @param {string} name Local name of the element
     * @param {Object[]} attributes List of attributes, each consisting of a
     *                              `uri`, `name` and `value`
     */

    /**
     * Called when the closing tag of an element node is encountered.
     * @callback CloseTagCallBack
     */

    /**
     * Called when a text node is encountered.
     * @callback TextCallBack
     * @param {string} contents Contents of the text node
     */

    /**
     * Parses an IMSC1 document into an opaque in-memory representation that exposes
     * a single method <pre>getMediaTimeEvents()</pre> that returns a list of time
     * offsets (in seconds) of the ISD, i.e. the points in time where the visual
     * representation of the document change. `metadataHandler` allows the caller to
     * be called back when nodes are present in <metadata> elements. 
     * 
     * @param {string} xmlstring XML document
     * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
     * @param {?MetadataHandler} metadataHandler Callback for <Metadata> elements
     * @returns {Object} Opaque in-memory representation of an IMSC1 document
     */

    imscDoc.fromXML = function (xmlstring, errorHandler, metadataHandler) {
        var p = sax.parser(true, {xmlns: true});
        var estack = [];
        var xmllangstack = [];
        var xmlspacestack = [];
        var metadata_depth = 0;
        var doc = null;

        p.onclosetag = function (node) {

            
            if (estack[0] instanceof Region) {

                /* merge referenced styles */

                if (doc.head !== null && doc.head.styling !== null) {
                    mergeReferencedStyles(doc.head.styling, estack[0].styleRefs, estack[0].styleAttrs, errorHandler);
                }

                delete estack[0].styleRefs;

            } else if (estack[0] instanceof Styling) {

                /* flatten chained referential styling */

                for (var sid in estack[0].styles) {

                    if (! estack[0].styles.hasOwnProperty(sid)) continue;

                    mergeChainedStyles(estack[0], estack[0].styles[sid], errorHandler);

                }

            } else if (estack[0] instanceof P || estack[0] instanceof Span) {

                /* merge anonymous spans */

                if (estack[0].contents.length > 1) {

                    var cs = [estack[0].contents[0]];

                    var c;

                    for (c = 1; c < estack[0].contents.length; c++) {

                        if (estack[0].contents[c] instanceof AnonymousSpan &&
                                cs[cs.length - 1] instanceof AnonymousSpan) {

                            cs[cs.length - 1].text += estack[0].contents[c].text;

                        } else {

                            cs.push(estack[0].contents[c]);

                        }

                    }

                    estack[0].contents = cs;

                }

                // remove redundant nested anonymous spans (9.3.3(1)(c))

                if (estack[0] instanceof Span &&
                        estack[0].contents.length === 1 &&
                        estack[0].contents[0] instanceof AnonymousSpan) {

                    estack[0].text = estack[0].contents[0].text;
                    delete estack[0].contents;

                }

            } else if (estack[0] instanceof ForeignElement) {

                if (estack[0].node.uri === imscNames.ns_tt &&
                        estack[0].node.local === 'metadata') {

                    /* leave the metadata element */

                    metadata_depth--;

                } else if (metadata_depth > 0 &&
                        metadataHandler &&
                        'onCloseTag' in metadataHandler) {

                    /* end of child of metadata element */

                    metadataHandler.onCloseTag();

                }

            }

            // TODO: delete stylerefs?

            // maintain the xml:space stack

            xmlspacestack.shift();

            // maintain the xml:lang stack

            xmllangstack.shift();

            // prepare for the next element

            estack.shift();
        };

        p.ontext = function (str) {

            if (estack[0] === undefined) {

                /* ignoring text outside of elements */

            } else if (estack[0] instanceof Span || estack[0] instanceof P) {

                /* ignore children text nodes in ruby container spans */

                if (estack[0] instanceof Span) {

                    var ruby = estack[0].styleAttrs[imscStyles.byName.ruby.qname];

                    if (ruby === 'container' || ruby === 'textContainer' || ruby === 'baseContainer') {

                        return;

                    }

                }

                /* create an anonymous span */

                var s = new AnonymousSpan();

                s.initFromText(doc, estack[0], str, xmllangstack[0], xmlspacestack[0], errorHandler);

                estack[0].contents.push(s);

            } else if (estack[0] instanceof ForeignElement &&
                    metadata_depth > 0 &&
                    metadataHandler &&
                    'onText' in metadataHandler) {

                /* text node within a child of metadata element */

                metadataHandler.onText(str);

            }

        };


        p.onopentag = function (node) {

            // maintain the xml:space stack

            var xmlspace = node.attributes["xml:space"];

            if (xmlspace) {

                xmlspacestack.unshift(xmlspace.value);

            } else {

                if (xmlspacestack.length === 0) {

                    xmlspacestack.unshift("default");

                } else {

                    xmlspacestack.unshift(xmlspacestack[0]);

                }

            }

            /* maintain the xml:lang stack */


            var xmllang = node.attributes["xml:lang"];

            if (xmllang) {

                xmllangstack.unshift(xmllang.value);

            } else {

                if (xmllangstack.length === 0) {

                    xmllangstack.unshift("");

                } else {

                    xmllangstack.unshift(xmllangstack[0]);

                }

            }


            /* process the element */

            if (node.uri === imscNames.ns_tt) {

                if (node.local === 'tt') {

                    if (doc !== null) {

                        reportFatal(errorHandler, "Two <tt> elements at (" + this.line + "," + this.column + ")");

                    }

                    doc = new TT();

                    doc.initFromNode(node, xmllangstack[0], errorHandler);

                    estack.unshift(doc);

                } else if (node.local === 'head') {

                    if (!(estack[0] instanceof TT)) {
                        reportFatal(errorHandler, "Parent of <head> element is not <tt> at (" + this.line + "," + this.column + ")");
                    }

                    estack.unshift(doc.head);

                } else if (node.local === 'styling') {

                    if (!(estack[0] instanceof Head)) {
                        reportFatal(errorHandler, "Parent of <styling> element is not <head> at (" + this.line + "," + this.column + ")");
                    }

                    estack.unshift(doc.head.styling);

                } else if (node.local === 'style') {

                    var s;

                    if (estack[0] instanceof Styling) {

                        s = new Style();

                        s.initFromNode(node, errorHandler);

                        /* ignore <style> element missing @id */

                        if (!s.id) {

                            reportError(errorHandler, "<style> element missing @id attribute");

                        } else {

                            doc.head.styling.styles[s.id] = s;

                        }

                        estack.unshift(s);

                    } else if (estack[0] instanceof Region) {

                        /* nested styles can be merged with specified styles
                         * immediately, with lower priority
                         * (see 8.4.4.2(3) at TTML1 )
                         */

                        s = new Style();

                        s.initFromNode(node, errorHandler);

                        mergeStylesIfNotPresent(s.styleAttrs, estack[0].styleAttrs);

                        estack.unshift(s);

                    } else {

                        reportFatal(errorHandler, "Parent of <style> element is not <styling> or <region> at (" + this.line + "," + this.column + ")");

                    }

                }  else if (node.local === 'initial') {

                    var ini;

                    if (estack[0] instanceof Styling) {

                        ini = new Initial();

                        ini.initFromNode(node, errorHandler);
                        
                        for (var qn in ini.styleAttrs) {

                            if (! ini.styleAttrs.hasOwnProperty(qn)) continue;
                            
                            doc.head.styling.initials[qn] = ini.styleAttrs[qn];
                            
                        }
                        
                        estack.unshift(ini);

                    } else {

                        reportFatal(errorHandler, "Parent of <initial> element is not <styling> at (" + this.line + "," + this.column + ")");

                    }

                } else if (node.local === 'layout') {

                    if (!(estack[0] instanceof Head)) {

                        reportFatal(errorHandler, "Parent of <layout> element is not <head> at " + this.line + "," + this.column + ")");

                    }

                    estack.unshift(doc.head.layout);

                } else if (node.local === 'region') {

                    if (!(estack[0] instanceof Layout)) {
                        reportFatal(errorHandler, "Parent of <region> element is not <layout> at " + this.line + "," + this.column + ")");
                    }

                    var r = new Region();

                    r.initFromNode(doc, node, xmllangstack[0], errorHandler);

                    if (!r.id || r.id in doc.head.layout.regions) {

                        reportError(errorHandler, "Ignoring <region> with duplicate or missing @id at " + this.line + "," + this.column + ")");

                    } else {

                        doc.head.layout.regions[r.id] = r;

                    }

                    estack.unshift(r);

                } else if (node.local === 'body') {

                    if (!(estack[0] instanceof TT)) {

                        reportFatal(errorHandler, "Parent of <body> element is not <tt> at " + this.line + "," + this.column + ")");

                    }

                    if (doc.body !== null) {

                        reportFatal(errorHandler, "Second <body> element at " + this.line + "," + this.column + ")");

                    }

                    var b = new Body();

                    b.initFromNode(doc, node, xmllangstack[0], errorHandler);

                    doc.body = b;

                    estack.unshift(b);

                } else if (node.local === 'div') {

                    if (!(estack[0] instanceof Div || estack[0] instanceof Body)) {

                        reportFatal(errorHandler, "Parent of <div> element is not <body> or <div> at " + this.line + "," + this.column + ")");

                    }

                    var d = new Div();

                    d.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);
                    
                    /* transform smpte:backgroundImage to TTML2 image element */
                    
                    var bi = d.styleAttrs[imscStyles.byName.backgroundImage.qname];
                    
                    if (bi) {
                        d.contents.push(new Image(bi));
                        delete d.styleAttrs[imscStyles.byName.backgroundImage.qname];                  
                    }

                    estack[0].contents.push(d);

                    estack.unshift(d);

                } else if (node.local === 'image') {

                    if (!(estack[0] instanceof Div)) {

                        reportFatal(errorHandler, "Parent of <image> element is not <div> at " + this.line + "," + this.column + ")");

                    }

                    var img = new Image();
                    
                    img.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);
                    
                    estack[0].contents.push(img);

                    estack.unshift(img);

                } else if (node.local === 'p') {

                    if (!(estack[0] instanceof Div)) {

                        reportFatal(errorHandler, "Parent of <p> element is not <div> at " + this.line + "," + this.column + ")");

                    }

                    var p = new P();

                    p.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);

                    estack[0].contents.push(p);

                    estack.unshift(p);

                } else if (node.local === 'span') {

                    if (!(estack[0] instanceof Span || estack[0] instanceof P)) {

                        reportFatal(errorHandler, "Parent of <span> element is not <span> or <p> at " + this.line + "," + this.column + ")");

                    }

                    var ns = new Span();

                    ns.initFromNode(doc, estack[0], node, xmllangstack[0], xmlspacestack[0], errorHandler);

                    estack[0].contents.push(ns);

                    estack.unshift(ns);

                } else if (node.local === 'br') {

                    if (!(estack[0] instanceof Span || estack[0] instanceof P)) {

                        reportFatal(errorHandler, "Parent of <br> element is not <span> or <p> at " + this.line + "," + this.column + ")");

                    }

                    var nb = new Br();

                    nb.initFromNode(doc, estack[0], node, xmllangstack[0], errorHandler);

                    estack[0].contents.push(nb);

                    estack.unshift(nb);

                } else if (node.local === 'set') {

                    if (!(estack[0] instanceof Span ||
                            estack[0] instanceof P ||
                            estack[0] instanceof Div ||
                            estack[0] instanceof Body ||
                            estack[0] instanceof Region ||
                            estack[0] instanceof Br)) {

                        reportFatal(errorHandler, "Parent of <set> element is not a content element or a region at " + this.line + "," + this.column + ")");

                    }

                    var st = new Set();

                    st.initFromNode(doc, estack[0], node, errorHandler);

                    estack[0].sets.push(st);

                    estack.unshift(st);

                } else {

                    /* element in the TT namespace, but not a content element */

                    estack.unshift(new ForeignElement(node));
                }

            } else {

                /* ignore elements not in the TTML namespace unless in metadata element */

                estack.unshift(new ForeignElement(node));

            }

            /* handle metadata callbacks */

            if (estack[0] instanceof ForeignElement) {

                if (node.uri === imscNames.ns_tt &&
                        node.local === 'metadata') {

                    /* enter the metadata element */

                    metadata_depth++;

                } else if (
                        metadata_depth > 0 &&
                        metadataHandler &&
                        'onOpenTag' in metadataHandler
                        ) {

                    /* start of child of metadata element */

                    var attrs = [];

                    for (var a in node.attributes) {
                        attrs[node.attributes[a].uri + " " + node.attributes[a].local] =
                                {
                                    uri: node.attributes[a].uri,
                                    local: node.attributes[a].local,
                                    value: node.attributes[a].value
                                };
                    }

                    metadataHandler.onOpenTag(node.uri, node.local, attrs);

                }

            }

        };

        // parse the document

        p.write(xmlstring).close();

        // all referential styling has been flatten, so delete styles

        delete doc.head.styling.styles;
       
        // create default region if no regions specified

        var hasRegions = false;

        /* AFAIK the only way to determine whether an object has members */

        for (var i in doc.head.layout.regions) {

            if (doc.head.layout.regions.hasOwnProperty(i)) {
                hasRegions = true;
                break;
            }

        }

        if (!hasRegions) {

            /* create default region */

            var dr = Region.prototype.createDefaultRegion(doc.lang);

            doc.head.layout.regions[dr.id] = dr;

        }

        /* resolve desired timing for regions */

        for (var region_i in doc.head.layout.regions) {

            if (! doc.head.layout.regions.hasOwnProperty(region_i)) continue;

            resolveTiming(doc, doc.head.layout.regions[region_i], null, null);

        }

        /* resolve desired timing for content elements */

        if (doc.body) {
            resolveTiming(doc, doc.body, null, null);
        }

        /* remove undefined spans in ruby containers */

        if (doc.body) {
            cleanRubyContainers(doc.body);
        }

        return doc;
    };

    function cleanRubyContainers(element) {
        
        if (! ('contents' in element)) return;

        var rubyval = 'styleAttrs' in element ? element.styleAttrs[imscStyles.byName.ruby.qname] : null;

        var isrubycontainer = (element.kind === 'span' && (rubyval === "container" || rubyval === "textContainer" || rubyval === "baseContainer"));

        for (var i = element.contents.length - 1; i >= 0; i--) {

            if (isrubycontainer && !('styleAttrs' in element.contents[i] && imscStyles.byName.ruby.qname in element.contents[i].styleAttrs)) {

                /* prune undefined <span> in ruby containers */

                delete element.contents[i];

            } else {

                cleanRubyContainers(element.contents[i]);

            }

        }

    }

    function resolveTiming(doc, element, prev_sibling, parent) {

        /* are we in a seq container? */

        var isinseq = parent && parent.timeContainer === "seq";

        /* determine implicit begin */

        var implicit_begin = 0; /* default */

        if (parent) {

            if (isinseq && prev_sibling) {

                /*
                 * if seq time container, offset from the previous sibling end
                 */

                implicit_begin = prev_sibling.end;


            } else {

                implicit_begin = parent.begin;

            }

        }

        /* compute desired begin */

        element.begin = element.explicit_begin ? element.explicit_begin + implicit_begin : implicit_begin;


        /* determine implicit end */

        var implicit_end = element.begin;

        var s = null;

        if ("sets" in element) {

            for (var set_i = 0; set_i < element.sets.length; set_i++) {

                resolveTiming(doc, element.sets[set_i], s, element);

                if (element.timeContainer === "seq") {

                    implicit_end = element.sets[set_i].end;

                } else {

                    implicit_end = Math.max(implicit_end, element.sets[set_i].end);

                }

                s = element.sets[set_i];

            }

        }

        if (!('contents' in element)) {

            /* anonymous spans and regions and <set> and <br>s and spans with only children text nodes */

            if (isinseq) {

                /* in seq container, implicit duration is zero */

                implicit_end = element.begin;

            } else {

                /* in par container, implicit duration is indefinite */

                implicit_end = Number.POSITIVE_INFINITY;

            }

        } else if ("contents" in element) {
 
            for (var content_i = 0; content_i < element.contents.length; content_i++) {

                resolveTiming(doc, element.contents[content_i], s, element);

                if (element.timeContainer === "seq") {

                    implicit_end = element.contents[content_i].end;

                } else {

                    implicit_end = Math.max(implicit_end, element.contents[content_i].end);

                }

                s = element.contents[content_i];

            }

        }

        /* determine desired end */
        /* it is never made really clear in SMIL that the explicit end is offset by the implicit begin */

        if (element.explicit_end !== null && element.explicit_dur !== null) {

            element.end = Math.min(element.begin + element.explicit_dur, implicit_begin + element.explicit_end);

        } else if (element.explicit_end === null && element.explicit_dur !== null) {

            element.end = element.begin + element.explicit_dur;

        } else if (element.explicit_end !== null && element.explicit_dur === null) {

            element.end = implicit_begin + element.explicit_end;

        } else {

            element.end = implicit_end;
        }

        delete element.explicit_begin;
        delete element.explicit_dur;
        delete element.explicit_end;

        doc._registerEvent(element);

    }

    function ForeignElement(node) {
        this.node = node;
    }

    function TT() {
        this.events = [];
        this.head = new Head();
        this.body = null;
    }

    TT.prototype.initFromNode = function (node, xmllang, errorHandler) {

        /* compute cell resolution */

        var cr = extractCellResolution(node, errorHandler);
        
        this.cellLength = {
                'h': new imscUtils.ComputedLength(0, 1/cr.h),
                'w': new imscUtils.ComputedLength(1/cr.w, 0)
            };

        /* extract frame rate and tick rate */

        var frtr = extractFrameAndTickRate(node, errorHandler);

        this.effectiveFrameRate = frtr.effectiveFrameRate;

        this.tickRate = frtr.tickRate;

        /* extract aspect ratio */

        this.aspectRatio = extractAspectRatio(node, errorHandler);

        /* check timebase */

        var attr = findAttribute(node, imscNames.ns_ttp, "timeBase");

        if (attr !== null && attr !== "media") {

            reportFatal(errorHandler, "Unsupported time base");

        }

        /* retrieve extent */

        var e = extractExtent(node, errorHandler);

        if (e === null) {

            this.pxLength = {
                'h': null,
                'w': null
            };

        } else {

            if (e.h.unit !== "px" || e.w.unit !== "px") {
                reportFatal(errorHandler, "Extent on TT must be in px or absent");
            }

            this.pxLength = {
                'h': new imscUtils.ComputedLength(0, 1 / e.h.value),
                'w': new imscUtils.ComputedLength(1 / e.w.value, 0)
            };
        }
        
        /** set root container dimensions to (1, 1) arbitrarily
          * the root container is mapped to actual dimensions at rendering
        **/
        
        this.dimensions = {
                'h': new imscUtils.ComputedLength(0, 1),
                'w': new imscUtils.ComputedLength(1, 0)

        };

        /* xml:lang */

        this.lang = xmllang;

    };

    /* register a temporal events */
    TT.prototype._registerEvent = function (elem) {

        /* skip if begin is not < then end */

        if (elem.end <= elem.begin)
            return;

        /* index the begin time of the event */

        var b_i = indexOf(this.events, elem.begin);

        if (!b_i.found) {
            this.events.splice(b_i.index, 0, elem.begin);
        }

        /* index the end time of the event */

        if (elem.end !== Number.POSITIVE_INFINITY) {

            var e_i = indexOf(this.events, elem.end);

            if (!e_i.found) {
                this.events.splice(e_i.index, 0, elem.end);
            }

        }

    };


    /*
     * Retrieves the range of ISD times covered by the document
     * 
     * @returns {Array} Array of two elements: min_begin_time and max_begin_time
     * 
     */
    TT.prototype.getMediaTimeRange = function () {

        return [this.events[0], this.events[this.events.length - 1]];
    };

    /*
     * Returns list of ISD begin times  
     * 
     * @returns {Array}
     */
    TT.prototype.getMediaTimeEvents = function () {

        return this.events;
    };

    /*
     * Represents a TTML Head element
     */

    function Head() {
        this.styling = new Styling();
        this.layout = new Layout();
    }

    /*
     * Represents a TTML Styling element
     */

    function Styling() {
        this.styles = {};
        this.initials = {};
    }

    /*
     * Represents a TTML Style element
     */

    function Style() {
        this.id = null;
        this.styleAttrs = null;
        this.styleRefs = null;
    }

    Style.prototype.initFromNode = function (node, errorHandler) {
        this.id = elementGetXMLID(node);
        this.styleAttrs = elementGetStyles(node, errorHandler);
        this.styleRefs = elementGetStyleRefs(node);
    };
    
    /*
     * Represents a TTML initial element
     */

    function Initial() {
        this.styleAttrs = null;
    }

    Initial.prototype.initFromNode = function (node, errorHandler) {
        
        this.styleAttrs = {};
        
        for (var i in node.attributes) {

            if (node.attributes[i].uri === imscNames.ns_itts ||
                node.attributes[i].uri === imscNames.ns_ebutts ||
                node.attributes[i].uri === imscNames.ns_tts) {
                
                var qname = node.attributes[i].uri + " " + node.attributes[i].local;
                
                this.styleAttrs[qname] = node.attributes[i].value;

            }
        }
        
    };

    /*
     * Represents a TTML Layout element
     * 
     */

    function Layout() {
        this.regions = {};
    }
    
    /*
     * Represents a TTML image element
     */

    function Image(src, type) {
        ContentElement.call(this, 'image');
        this.src = src;
        this.type = type;
    }

    Image.prototype.initFromNode = function (doc, parent, node, xmllang, errorHandler) {
        this.src = 'src' in node.attributes ? node.attributes.src.value : null;
        
        if (! this.src) {
            reportError(errorHandler, "Invalid image@src attribute");
        }
        
        this.type = 'type' in node.attributes ? node.attributes.type.value : null;
        
        if (! this.type) {
            reportError(errorHandler, "Invalid image@type attribute");
        }
        
        StyledElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        AnimatedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        LayoutElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);

        this.lang = xmllang;
    };

    /*
     * TTML element utility functions
     * 
     */

    function ContentElement(kind) {
        this.kind = kind;
    }

    function IdentifiedElement(id) {
        this.id = id;
    }

    IdentifiedElement.prototype.initFromNode = function (doc, parent, node, errorHandler) {
        this.id = elementGetXMLID(node);
    };

    function LayoutElement(id) {
        this.regionID = id;
    }

    LayoutElement.prototype.initFromNode = function (doc, parent, node, errorHandler) {
        this.regionID = elementGetRegionID(node);
    };

    function StyledElement(styleAttrs) {
        this.styleAttrs = styleAttrs;
    }

    StyledElement.prototype.initFromNode = function (doc, parent, node, errorHandler) {

        this.styleAttrs = elementGetStyles(node, errorHandler);

        if (doc.head !== null && doc.head.styling !== null) {
            mergeReferencedStyles(doc.head.styling, elementGetStyleRefs(node), this.styleAttrs, errorHandler);
        }

    };

    function AnimatedElement(sets) {
        this.sets = sets;
    }

    AnimatedElement.prototype.initFromNode = function (doc, parent, node, errorHandler) {
        this.sets = [];
    };

    function ContainerElement(contents) {
        this.contents = contents;
    }

    ContainerElement.prototype.initFromNode = function (doc, parent, node, errorHandler) {
        this.contents = [];
    };

    function TimedElement(explicit_begin, explicit_end, explicit_dur) {
        this.explicit_begin = explicit_begin;
        this.explicit_end = explicit_end;
        this.explicit_dur = explicit_dur;
    }

    TimedElement.prototype.initFromNode = function (doc, parent, node, errorHandler) {
        var t = processTiming(doc, parent, node, errorHandler);
        this.explicit_begin = t.explicit_begin;
        this.explicit_end = t.explicit_end;
        this.explicit_dur = t.explicit_dur;

        this.timeContainer = elementGetTimeContainer(node, errorHandler);
    };


    /*
     * Represents a TTML body element
     */



    function Body() {
        ContentElement.call(this, 'body');
    }


    Body.prototype.initFromNode = function (doc, node, xmllang, errorHandler) {
        StyledElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
        AnimatedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
        LayoutElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
        ContainerElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);

        this.lang = xmllang;
    };

    /*
     * Represents a TTML div element
     */

    function Div() {
        ContentElement.call(this, 'div');
    }

    Div.prototype.initFromNode = function (doc, parent, node, xmllang, errorHandler) {
        StyledElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        AnimatedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        LayoutElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        ContainerElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);

        this.lang = xmllang;
    };

    /*
     * Represents a TTML p element
     */

    function P() {
        ContentElement.call(this, 'p');
    }

    P.prototype.initFromNode = function (doc, parent, node, xmllang, errorHandler) {
        StyledElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        AnimatedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        LayoutElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        ContainerElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);

        this.lang = xmllang;
    };

    /*
     * Represents a TTML span element
     */

    function Span() {
        ContentElement.call(this, 'span');
    }

    Span.prototype.initFromNode = function (doc, parent, node, xmllang, xmlspace, errorHandler) {
        StyledElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        AnimatedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        LayoutElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        ContainerElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);

        this.space = xmlspace;
        this.lang = xmllang;
    };

    /*
     * Represents a TTML anonymous span element
     */

    function AnonymousSpan() {
        ContentElement.call(this, 'span');
    }

    AnonymousSpan.prototype.initFromText = function (doc, parent, text, xmllang, xmlspace, errorHandler) {
        TimedElement.prototype.initFromNode.call(this, doc, parent, null, errorHandler);

        this.text = text;
        this.space = xmlspace;
        this.lang = xmllang;
    };

    /*
     * Represents a TTML br element
     */

    function Br() {
        ContentElement.call(this, 'br');
    }

    Br.prototype.initFromNode = function (doc, parent, node, xmllang, errorHandler) {
        LayoutElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);

        this.lang = xmllang;
    };

    /*
     * Represents a TTML Region element
     * 
     */

    function Region() {
    }

    Region.prototype.createDefaultRegion = function (xmllang) {
        var r = new Region();

        IdentifiedElement.call(r, '');
        StyledElement.call(r, {});
        AnimatedElement.call(r, []);
        TimedElement.call(r, 0, Number.POSITIVE_INFINITY, null);

        this.lang = xmllang;

        return r;
    };

    Region.prototype.initFromNode = function (doc, node, xmllang, errorHandler) {
        IdentifiedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
        TimedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);
        AnimatedElement.prototype.initFromNode.call(this, doc, null, node, errorHandler);

        /* add specified styles */

        this.styleAttrs = elementGetStyles(node, errorHandler);

        /* remember referential styles for merging after nested styling is processed*/

        this.styleRefs = elementGetStyleRefs(node);

        /* xml:lang */

        this.lang = xmllang;
    };

    /*
     * Represents a TTML Set element
     * 
     */

    function Set() {
    }

    Set.prototype.initFromNode = function (doc, parent, node, errorHandler) {

        TimedElement.prototype.initFromNode.call(this, doc, parent, node, errorHandler);

        var styles = elementGetStyles(node, errorHandler);

        this.qname = null;
        this.value = null;

        for (var qname in styles) {

            if (! styles.hasOwnProperty(qname)) continue;

            if (this.qname) {

                reportError(errorHandler, "More than one style specified on set");
                break;

            }

            this.qname = qname;
            this.value = styles[qname];

        }

    };

    /*
     * Utility functions
     * 
     */


    function elementGetXMLID(node) {
        return node && 'xml:id' in node.attributes ? node.attributes['xml:id'].value || null : null;
    }

    function elementGetRegionID(node) {
        return node && 'region' in node.attributes ? node.attributes.region.value : '';
    }

    function elementGetTimeContainer(node, errorHandler) {

        var tc = node && 'timeContainer' in node.attributes ? node.attributes.timeContainer.value : null;

        if ((!tc) || tc === "par") {

            return "par";

        } else if (tc === "seq") {

            return "seq";

        } else {

            reportError(errorHandler, "Illegal value of timeContainer (assuming 'par')");

            return "par";

        }

    }

    function elementGetStyleRefs(node) {

        return node && 'style' in node.attributes ? node.attributes.style.value.split(" ") : [];

    }

    function elementGetStyles(node, errorHandler) {

        var s = {};

        if (node !== null) {

            for (var i in node.attributes) {

                var qname = node.attributes[i].uri + " " + node.attributes[i].local;

                var sa = imscStyles.byQName[qname];

                if (sa !== undefined) {

                    var val = sa.parse(node.attributes[i].value);

                    if (val !== null) {

                        s[qname] = val;

                        /* TODO: consider refactoring errorHandler into parse and compute routines */

                        if (sa === imscStyles.byName.zIndex) {
                            reportWarning(errorHandler, "zIndex attribute present but not used by IMSC1 since regions do not overlap");
                        }

                    } else {

                        reportError(errorHandler, "Cannot parse styling attribute " + qname + " --> " + node.attributes[i].value);

                    }

                }

            }

        }

        return s;
    }

    function findAttribute(node, ns, name) {
        for (var i in node.attributes) {

            if (node.attributes[i].uri === ns &&
                    node.attributes[i].local === name) {

                return node.attributes[i].value;
            }
        }

        return null;
    }

    function extractAspectRatio(node, errorHandler) {

        var ar = findAttribute(node, imscNames.ns_ittp, "aspectRatio");

        if (ar === null) {
            
            ar = findAttribute(node, imscNames.ns_ttp, "displayAspectRatio");
            
        }

        var rslt = null;

        if (ar !== null) {

            var ASPECT_RATIO_RE = /(\d+)\s+(\d+)/;

            var m = ASPECT_RATIO_RE.exec(ar);

            if (m !== null) {

                var w = parseInt(m[1]);

                var h = parseInt(m[2]);

                if (w !== 0 && h !== 0) {

                    rslt = w / h;

                } else {

                    reportError(errorHandler, "Illegal aspectRatio values (ignoring)");
                }

            } else {

                reportError(errorHandler, "Malformed aspectRatio attribute (ignoring)");
            }

        }

        return rslt;

    }

    /*
     * Returns the cellResolution attribute from a node
     * 
     */
    function extractCellResolution(node, errorHandler) {

        var cr = findAttribute(node, imscNames.ns_ttp, "cellResolution");

        // initial value

        var h = 15;
        var w = 32;

        if (cr !== null) {

            var CELL_RESOLUTION_RE = /(\d+) (\d+)/;

            var m = CELL_RESOLUTION_RE.exec(cr);

            if (m !== null) {

                w = parseInt(m[1]);

                h = parseInt(m[2]);

            } else {

                reportWarning(errorHandler, "Malformed cellResolution value (using initial value instead)");

            }

        }

        return {'w': w, 'h': h};

    }


    function extractFrameAndTickRate(node, errorHandler) {

        // subFrameRate is ignored per IMSC1 specification

        // extract frame rate

        var fps_attr = findAttribute(node, imscNames.ns_ttp, "frameRate");

        // initial value

        var fps = 30;

        // match variable

        var m;

        if (fps_attr !== null) {

            var FRAME_RATE_RE = /(\d+)/;

            m = FRAME_RATE_RE.exec(fps_attr);

            if (m !== null) {

                fps = parseInt(m[1]);

            } else {

                reportWarning(errorHandler, "Malformed frame rate attribute (using initial value instead)");
            }

        }

        // extract frame rate multiplier

        var frm_attr = findAttribute(node, imscNames.ns_ttp, "frameRateMultiplier");

        // initial value

        var frm = 1;

        if (frm_attr !== null) {

            var FRAME_RATE_MULT_RE = /(\d+) (\d+)/;

            m = FRAME_RATE_MULT_RE.exec(frm_attr);

            if (m !== null) {

                frm = parseInt(m[1]) / parseInt(m[2]);

            } else {

                reportWarning(errorHandler, "Malformed frame rate multiplier attribute (using initial value instead)");
            }

        }

        var efps = frm * fps;

        // extract tick rate

        var tr = 1;

        var trattr = findAttribute(node, imscNames.ns_ttp, "tickRate");

        if (trattr === null) {

            if (fps_attr !== null)
                tr = efps;

        } else {

            var TICK_RATE_RE = /(\d+)/;

            m = TICK_RATE_RE.exec(trattr);

            if (m !== null) {

                tr = parseInt(m[1]);

            } else {

                reportWarning(errorHandler, "Malformed tick rate attribute (using initial value instead)");
            }

        }

        return {effectiveFrameRate: efps, tickRate: tr};

    }

    function extractExtent(node, errorHandler) {

        var attr = findAttribute(node, imscNames.ns_tts, "extent");

        if (attr === null)
            return null;

        var s = attr.split(" ");

        if (s.length !== 2) {

            reportWarning(errorHandler, "Malformed extent (ignoring)");

            return null;
        }

        var w = imscUtils.parseLength(s[0]);

        var h = imscUtils.parseLength(s[1]);

        if (!h || !w) {

            reportWarning(errorHandler, "Malformed extent values (ignoring)");

            return null;
        }

        return {'h': h, 'w': w};

    }

    function parseTimeExpression(tickRate, effectiveFrameRate, str) {

        var CLOCK_TIME_FRACTION_RE = /^(\d{2,}):(\d\d):(\d\d(?:\.\d+)?)$/;
        var CLOCK_TIME_FRAMES_RE = /^(\d{2,}):(\d\d):(\d\d)\:(\d{2,})$/;
        var OFFSET_FRAME_RE = /^(\d+(?:\.\d+)?)f$/;
        var OFFSET_TICK_RE = /^(\d+(?:\.\d+)?)t$/;
        var OFFSET_MS_RE = /^(\d+(?:\.\d+)?)ms$/;
        var OFFSET_S_RE = /^(\d+(?:\.\d+)?)s$/;
        var OFFSET_H_RE = /^(\d+(?:\.\d+)?)h$/;
        var OFFSET_M_RE = /^(\d+(?:\.\d+)?)m$/;
        var m;
        var r = null;
        if ((m = OFFSET_FRAME_RE.exec(str)) !== null) {

            if (effectiveFrameRate !== null) {

                r = parseFloat(m[1]) / effectiveFrameRate;
            }

        } else if ((m = OFFSET_TICK_RE.exec(str)) !== null) {

            if (tickRate !== null) {

                r = parseFloat(m[1]) / tickRate;
            }

        } else if ((m = OFFSET_MS_RE.exec(str)) !== null) {

            r = parseFloat(m[1]) / 1000.0;

        } else if ((m = OFFSET_S_RE.exec(str)) !== null) {

            r = parseFloat(m[1]);

        } else if ((m = OFFSET_H_RE.exec(str)) !== null) {

            r = parseFloat(m[1]) * 3600.0;

        } else if ((m = OFFSET_M_RE.exec(str)) !== null) {

            r = parseFloat(m[1]) * 60.0;

        } else if ((m = CLOCK_TIME_FRACTION_RE.exec(str)) !== null) {

            r = parseInt(m[1]) * 3600 +
                    parseInt(m[2]) * 60 +
                    parseFloat(m[3]);

        } else if ((m = CLOCK_TIME_FRAMES_RE.exec(str)) !== null) {

            /* this assumes that HH:MM:SS is a clock-time-with-fraction */

            if (effectiveFrameRate !== null) {

                r = parseInt(m[1]) * 3600 +
                        parseInt(m[2]) * 60 +
                        parseInt(m[3]) +
                        (m[4] === null ? 0 : parseInt(m[4]) / effectiveFrameRate);
            }

        }

        return r;
    }

    function processTiming(doc, parent, node, errorHandler) {

        /* determine explicit begin */

        var explicit_begin = null;

        if (node && 'begin' in node.attributes) {

            explicit_begin = parseTimeExpression(doc.tickRate, doc.effectiveFrameRate, node.attributes.begin.value);

            if (explicit_begin === null) {

                reportWarning(errorHandler, "Malformed begin value " + node.attributes.begin.value + " (using 0)");

            }

        }

        /* determine explicit duration */

        var explicit_dur = null;

        if (node && 'dur' in node.attributes) {

            explicit_dur = parseTimeExpression(doc.tickRate, doc.effectiveFrameRate, node.attributes.dur.value);

            if (explicit_dur === null) {

                reportWarning(errorHandler, "Malformed dur value " + node.attributes.dur.value + " (ignoring)");

            }

        }

        /* determine explicit end */

        var explicit_end = null;

        if (node && 'end' in node.attributes) {

            explicit_end = parseTimeExpression(doc.tickRate, doc.effectiveFrameRate, node.attributes.end.value);

            if (explicit_end === null) {

                reportWarning(errorHandler, "Malformed end value (ignoring)");

            }

        }

        return {explicit_begin: explicit_begin,
            explicit_end: explicit_end,
            explicit_dur: explicit_dur};

    }



    function mergeChainedStyles(styling, style, errorHandler) {

        while (style.styleRefs.length > 0) {

            var sref = style.styleRefs.pop();

            if (!(sref in styling.styles)) {
                reportError(errorHandler, "Non-existant style id referenced");
                continue;
            }

            mergeChainedStyles(styling, styling.styles[sref], errorHandler);

            mergeStylesIfNotPresent(styling.styles[sref].styleAttrs, style.styleAttrs);

        }

    }

    function mergeReferencedStyles(styling, stylerefs, styleattrs, errorHandler) {

        for (var i = stylerefs.length - 1; i >= 0; i--) {

            var sref = stylerefs[i];

            if (!(sref in styling.styles)) {
                reportError(errorHandler, "Non-existant style id referenced");
                continue;
            }

            mergeStylesIfNotPresent(styling.styles[sref].styleAttrs, styleattrs);

        }

    }

    function mergeStylesIfNotPresent(from_styles, into_styles) {

        for (var sname in from_styles) {

            if (! from_styles.hasOwnProperty(sname)) continue;

            if (sname in into_styles)
                continue;

            into_styles[sname] = from_styles[sname];

        }

    }

    /* TODO: validate style format at parsing */


    /*
     * ERROR HANDLING UTILITY FUNCTIONS
     * 
     */

    function reportInfo(errorHandler, msg) {

        if (errorHandler && errorHandler.info && errorHandler.info(msg))
            throw msg;

    }

    function reportWarning(errorHandler, msg) {

        if (errorHandler && errorHandler.warn && errorHandler.warn(msg))
            throw msg;

    }

    function reportError(errorHandler, msg) {

        if (errorHandler && errorHandler.error && errorHandler.error(msg))
            throw msg;

    }

    function reportFatal(errorHandler, msg) {

        if (errorHandler && errorHandler.fatal)
            errorHandler.fatal(msg);

        throw msg;

    }

    /*
     * Binary search utility function
     * 
     * @typedef {Object} BinarySearchResult
     * @property {boolean} found Was an exact match found?
     * @property {number} index Position of the exact match or insert position
     * 
     * @returns {BinarySearchResult}
     */

    function indexOf(arr, searchval) {

        var min = 0;
        var max = arr.length - 1;
        var cur;

        while (min <= max) {

            cur = Math.floor((min + max) / 2);

            var curval = arr[cur];

            if (curval < searchval) {

                min = cur + 1;

            } else if (curval > searchval) {

                max = cur - 1;

            } else {

                return {found: true, index: cur};

            }

        }

        return {found: false, index: min};
    }


})(typeof exports === 'undefined' ? this.imscDoc = {} : exports,
        typeof sax === 'undefined' ? require("sax") : sax,
        typeof imscNames === 'undefined' ? require("./names") : imscNames,
        typeof imscStyles === 'undefined' ? require("./styles") : imscStyles,
        typeof imscUtils === 'undefined' ? require("./utils") : imscUtils);

},{"./names":5,"./styles":6,"./utils":7,"sax":undefined}],2:[function(require,module,exports){
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

},{"./names":5,"./styles":6,"./utils":7}],3:[function(require,module,exports){
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
 * @module imscISD
 */


;
(function (imscISD, imscNames, imscStyles, imscUtils) { // wrapper for non-node envs

    /** 
     * Creates a canonical representation of an IMSC1 document returned by <pre>imscDoc.fromXML()</pre>
     * at a given absolute offset in seconds. This offset does not have to be one of the values returned
     * by <pre>getMediaTimeEvents()</pre>.
     * 
     * @param {Object} tt IMSC1 document
     * @param {number} offset Absolute offset (in seconds)
     * @param {?module:imscUtils.ErrorHandler} errorHandler Error callback
     * @returns {Object} Opaque in-memory representation of an ISD
     */

    imscISD.generateISD = function (tt, offset, errorHandler) {

        /* TODO check for tt and offset validity */

        /* create the ISD object from the IMSC1 doc */

        var isd = new ISD(tt);

        /* context */

        var context = {

            /*rubyfs: []*/ /* font size of the nearest textContainer or container */

        };

        /* Filter body contents - Only process what we need within the offset and discard regions not applicable to the content */
        var body = {};
        var activeRegions = {};

        /* gather any regions that might have showBackground="always" and show a background */
        var initialShowBackground = tt.head.styling.initials[imscStyles.byName.showBackground.qname];
        var initialbackgroundColor = tt.head.styling.initials[imscStyles.byName.backgroundColor.qname];
        for (var layout_child in tt.head.layout.regions)
        {
            if (tt.head.layout.regions.hasOwnProperty(layout_child)) {
                var region = tt.head.layout.regions[layout_child];
                var showBackground = region.styleAttrs[imscStyles.byName.showBackground.qname] || initialShowBackground;
                var backgroundColor = region.styleAttrs[imscStyles.byName.backgroundColor.qname] || initialbackgroundColor;
                activeRegions[region.id] = (
                    (showBackground === 'always' || showBackground === undefined) &&
                    backgroundColor !== undefined &&
                    !(offset < region.begin || offset >= region.end)
                    );
            }
        }

        /* If the body specifies a region, catch it, since no filtered content will */
        /* likely specify the region. */
        if (tt.body && tt.body.regionID) {
            activeRegions[tt.body.regionID] = true;
        }

        function filter(offset, element) {
            function offsetFilter(element) {
                return !(offset < element.begin || offset >= element.end);    
            }    
        
            if (element.contents) {
                var clone = {};
                for (var prop in element) {
                    if (element.hasOwnProperty(prop)) {
                        clone[prop] = element[prop];
                    }
                }
                clone.contents = [];

                element.contents.filter(offsetFilter).forEach(function (el) {
                    var filteredElement = filter(offset, el);
                    if (filteredElement.regionID) {
                        activeRegions[filteredElement.regionID] = true;
                    }
        
                    if (filteredElement !== null) {
                        clone.contents.push(filteredElement);
                    }
                });
                return clone;
            } else {
                return element;
            }
        }

        if (tt.body !== null) {
            body = filter(offset, tt.body);
        } else {
            body = null;
        }

        /* rewritten TTML will always have a default - this covers it. because the region is defaulted to "" */
        if (activeRegions[""] !== undefined) {
            activeRegions[""] = true;
        }

        /* process regions */      
        for (var regionID in activeRegions) {
            if (activeRegions[regionID]) {
                /* post-order traversal of the body tree per [construct intermediate document] */

                var c = isdProcessContentElement(tt, offset, tt.head.layout.regions[regionID], body, null, '', tt.head.layout.regions[regionID], errorHandler, context);

                if (c !== null) {

                    /* add the region to the ISD */

                    isd.contents.push(c.element);
                }
            }
        }

        return isd;
    };

    /* set of styles not applicable to ruby container spans */

    var _rcs_na_styles = [
        imscStyles.byName.color.qname,
        imscStyles.byName.textCombine.qname,
        imscStyles.byName.textDecoration.qname,
        imscStyles.byName.textEmphasis.qname,
        imscStyles.byName.textOutline.qname,
        imscStyles.byName.textShadow.qname
    ];

    function isdProcessContentElement(doc, offset, region, body, parent, inherited_region_id, elem, errorHandler, context) {

        /* prune if temporally inactive */

        if (offset < elem.begin || offset >= elem.end) {
            return null;
        }

        /* 
         * set the associated region as specified by the regionID attribute, or the 
         * inherited associated region otherwise
         */

        var associated_region_id = 'regionID' in elem && elem.regionID !== '' ? elem.regionID : inherited_region_id;

        /* prune the element if either:
         * - the element is not terminal and the associated region is neither the default
         *   region nor the parent region (this allows children to be associated with a 
         *   region later on)
         * - the element is terminal and the associated region is not the parent region
         */

        /* TODO: improve detection of terminal elements since <region> has no contents */

        if (parent !== null /* are we in the region element */ &&
            associated_region_id !== region.id &&
            (
                (!('contents' in elem)) ||
                ('contents' in elem && elem.contents.length === 0) ||
                associated_region_id !== ''
                )
            )
            return null;

        /* create an ISD element, including applying specified styles */

        var isd_element = new ISDContentElement(elem);

        /* apply set (animation) styling */

        if ("sets" in elem) {
            for (var i = 0; i < elem.sets.length; i++) {

                if (offset < elem.sets[i].begin || offset >= elem.sets[i].end)
                    continue;

                isd_element.styleAttrs[elem.sets[i].qname] = elem.sets[i].value;

            }
        }

        /* 
         * keep track of specified styling attributes so that we
         * can compute them later
         */

        var spec_attr = {};

        for (var qname in isd_element.styleAttrs) {

            if (! isd_element.styleAttrs.hasOwnProperty(qname)) continue;

            spec_attr[qname] = true;

            /* special rule for tts:writingMode (section 7.29.1 of XSL)
             * direction is set consistently with writingMode only
             * if writingMode sets inline-direction to LTR or RTL  
             */

            if (isd_element.kind === 'region' &&
                qname === imscStyles.byName.writingMode.qname &&
                !(imscStyles.byName.direction.qname in isd_element.styleAttrs)) {

                var wm = isd_element.styleAttrs[qname];

                if (wm === "lrtb" || wm === "lr") {

                    isd_element.styleAttrs[imscStyles.byName.direction.qname] = "ltr";

                } else if (wm === "rltb" || wm === "rl") {

                    isd_element.styleAttrs[imscStyles.byName.direction.qname] = "rtl";

                }

            }
        }

        /* inherited styling */

        if (parent !== null) {

            for (var j = 0; j < imscStyles.all.length; j++) {

                var sa = imscStyles.all[j];

                /* textDecoration has special inheritance rules */

                if (sa.qname === imscStyles.byName.textDecoration.qname) {

                    /* handle both textDecoration inheritance and specification */

                    var ps = parent.styleAttrs[sa.qname];
                    var es = isd_element.styleAttrs[sa.qname];
                    var outs = [];

                    if (es === undefined) {

                        outs = ps;

                    } else if (es.indexOf("none") === -1) {

                        if ((es.indexOf("noUnderline") === -1 &&
                            ps.indexOf("underline") !== -1) ||
                            es.indexOf("underline") !== -1) {

                            outs.push("underline");

                        }

                        if ((es.indexOf("noLineThrough") === -1 &&
                            ps.indexOf("lineThrough") !== -1) ||
                            es.indexOf("lineThrough") !== -1) {

                            outs.push("lineThrough");

                        }

                        if ((es.indexOf("noOverline") === -1 &&
                            ps.indexOf("overline") !== -1) ||
                            es.indexOf("overline") !== -1) {

                            outs.push("overline");

                        }

                    } else {

                        outs.push("none");

                    }

                    isd_element.styleAttrs[sa.qname] = outs;

                } else if (sa.qname === imscStyles.byName.fontSize.qname &&
                    !(sa.qname in isd_element.styleAttrs) &&
                    isd_element.kind === 'span' &&
                    isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "textContainer") {
                    
                    /* special inheritance rule for ruby text container font size */
                    
                    var ruby_fs = parent.styleAttrs[imscStyles.byName.fontSize.qname];

                    isd_element.styleAttrs[sa.qname] = new imscUtils.ComputedLength(
                        0.5 * ruby_fs.rw,
                        0.5 * ruby_fs.rh);

                } else if (sa.qname === imscStyles.byName.fontSize.qname &&
                    !(sa.qname in isd_element.styleAttrs) &&
                    isd_element.kind === 'span' &&
                    isd_element.styleAttrs[imscStyles.byName.ruby.qname] === "text") {
                    
                    /* special inheritance rule for ruby text font size */
                    
                    var parent_fs = parent.styleAttrs[imscStyles.byName.fontSize.qname];
                    
                    if (parent.styleAttrs[imscStyles.byName.ruby.qname] === "textContainer") {
                        
                        isd_element.styleAttrs[sa.qname] = parent_fs;
                        
                    } else {
                        
                        isd_element.styleAttrs[sa.qname] = new imscUtils.ComputedLength(
                            0.5 * parent_fs.rw,
                            0.5 * parent_fs.rh);
                    }
                    
                } else if (sa.inherit &&
                    (sa.qname in parent.styleAttrs) &&
                    !(sa.qname in isd_element.styleAttrs)) {

                    isd_element.styleAttrs[sa.qname] = parent.styleAttrs[sa.qname];

                }

            }

        }

        /* initial value styling */

        for (var k = 0; k < imscStyles.all.length; k++) {
            
            var ivs = imscStyles.all[k];

            /* skip if value is already specified */

            if (ivs.qname in isd_element.styleAttrs) continue;

            /* skip tts:position if tts:origin is specified */

            if (ivs.qname === imscStyles.byName.position.qname &&
                imscStyles.byName.origin.qname in isd_element.styleAttrs)
                continue;

            /* skip tts:origin if tts:position is specified */

            if (ivs.qname === imscStyles.byName.origin.qname &&
                imscStyles.byName.position.qname in isd_element.styleAttrs)
                continue;
            
            /* determine initial value */
            
            var iv = doc.head.styling.initials[ivs.qname] || ivs.initial;

            if (iv === null) {
                /* skip processing if no initial value defined */

                continue;
            }

            /* apply initial value to elements other than region only if non-inherited */

            if (isd_element.kind === 'region' || (ivs.inherit === false && iv !== null)) {

                var piv = ivs.parse(iv);

                if (piv !== null) {

                    isd_element.styleAttrs[ivs.qname] = piv;

                    /* keep track of the style as specified */

                    spec_attr[ivs.qname] = true;

                } else {

                    reportError(errorHandler, "Invalid initial value for '" + ivs.qname + "' on element '" + isd_element.kind);

                }

            }

        }

        /* compute styles (only for non-inherited styles) */
        /* TODO: get rid of spec_attr */

        for (var z = 0; z < imscStyles.all.length; z++) {
            
            var cs = imscStyles.all[z];

            if (!(cs.qname in spec_attr)) continue;

            if (cs.compute !== null) {

                var cstyle = cs.compute(
                    /*doc, parent, element, attr, context*/
                    doc,
                    parent,
                    isd_element,
                    isd_element.styleAttrs[cs.qname],
                    context
                    );

                if (cstyle !== null) {

                    isd_element.styleAttrs[cs.qname] = cstyle;
                    
                } else {
                    /* if the style cannot be computed, replace it by its initial value */

                    isd_element.styleAttrs[cs.qname] = cs.compute(
                        /*doc, parent, element, attr, context*/
                        doc,
                        parent,
                        isd_element,
                        cs.parse(cs.initial),
                        context
                    );

                    reportError(errorHandler, "Style '" + cs.qname + "' on element '" + isd_element.kind + "' cannot be computed");
                }
            }

        }

        /* prune if tts:display is none */

        if (isd_element.styleAttrs[imscStyles.byName.display.qname] === "none")
            return null;

        /* process contents of the element */

        var contents = null;

        if (parent === null) {

            /* we are processing the region */

            if (body === null) {

                /* if there is no body, still process the region but with empty content */

                contents = [];

            } else {

                /*use the body element as contents */

                contents = [body];

            }

        } else if ('contents' in elem) {

            contents = elem.contents;

        }

        for (var x = 0; contents !== null && x < contents.length; x++) {

            var c = isdProcessContentElement(doc, offset, region, body, isd_element, associated_region_id, contents[x], errorHandler, context);

            /* 
             * keep child element only if they are non-null and their region match 
             * the region of this element
             */

            if (c !== null) {

                isd_element.contents.push(c.element);

            }

        }

        /* remove styles that are not applicable */

        for (var qnameb in isd_element.styleAttrs) {
            if (!isd_element.styleAttrs.hasOwnProperty(qnameb)) continue;

            /* true if not applicable */

            var na = false;

            /* special applicability of certain style properties to ruby container spans */
            /* TODO: in the future ruby elements should be translated to elements instead of kept as spans */

            if (isd_element.kind === 'span') {

                var rsp = isd_element.styleAttrs[imscStyles.byName.ruby.qname];

                na = ( rsp === 'container' || rsp === 'textContainer' || rsp === 'baseContainer' ) && 
                    _rcs_na_styles.indexOf(qnameb) !== -1;

                if (! na) {

                    na = rsp !== 'container' &&
                        qnameb === imscStyles.byName.rubyAlign.qname;

                }

                if (! na) {

                    na =  (! (rsp === 'textContainer' || rsp === 'text')) &&
                        qnameb === imscStyles.byName.rubyPosition.qname;

                }

            }

            /* normal applicability */
            
            if (! na) {

                var da = imscStyles.byQName[qnameb];

                if ("applies" in da){

                    na = da.applies.indexOf(isd_element.kind) === -1;

                }

            }


            if (na) {
                delete isd_element.styleAttrs[qnameb];
            }

        }

        /* trim whitespace around explicit line breaks */

        var ruby = isd_element.styleAttrs[imscStyles.byName.ruby.qname];

        if (isd_element.kind === 'p' ||
            (isd_element.kind === 'span' && (ruby === "textContainer" || ruby === "text"))
            ) {

            var elist = [];

            constructSpanList(isd_element, elist);

            collapseLWSP(elist);

            pruneEmptySpans(isd_element);

        }

        /* keep element if:
         * * contains a background image
         * * <br/>
         * * if there are children
         * * if it is an image
         * * if <span> and has text
         * * if region and showBackground = always
         */

        if ((isd_element.kind === 'div' && imscStyles.byName.backgroundImage.qname in isd_element.styleAttrs) ||
            isd_element.kind === 'br' ||
            isd_element.kind === 'image' ||
            ('contents' in isd_element && isd_element.contents.length > 0) ||
            (isd_element.kind === 'span' && isd_element.text !== null) ||
            (isd_element.kind === 'region' &&
                isd_element.styleAttrs[imscStyles.byName.showBackground.qname] === 'always')) {

            return {
                region_id: associated_region_id,
                element: isd_element
            };
        }

        return null;
    }

    function collapseLWSP(elist) {

        function isPrevCharLWSP(prev_element) {
            return prev_element.kind === 'br' || /[\r\n\t ]$/.test(prev_element.text);
        }

        function isNextCharLWSP(next_element) {
            return next_element.kind === 'br' || (next_element.space === "preserve" && /^[\r\n]/.test(next_element.text));
        }

        /* collapse spaces and remove leading LWSPs */

        var element;

        for (var i = 0; i < elist.length;) {

            element = elist[i];

            if (element.kind === "br" || element.space === "preserve") {
                i++;
                continue;
            }

            var trimmed_text = element.text.replace(/[\t\r\n ]+/g, ' ');

            if (/^[ ]/.test(trimmed_text)) {

                if (i === 0 || isPrevCharLWSP(elist[i - 1])) {
                    trimmed_text = trimmed_text.substring(1);
                }

            }

            element.text = trimmed_text;

            if (trimmed_text.length === 0) {
                elist.splice(i, 1);
            } else {
                i++;
            }

        }

        /* remove trailing LWSPs */

        for (i = 0; i < elist.length; i++) {

            element = elist[i];

            if (element.kind === "br" || element.space === "preserve") {
                i++;
                continue;
            }

            if (/[ ]$/.test(element.text)) {

                if (i === (elist.length - 1) || isNextCharLWSP(elist[i + 1])) {
                    element.text = element.text.slice(0, -1);
                }

            }

        }

    }

    function constructSpanList(element, elist) {

        if (! ("contents" in element)) {
            return;
        }

        for (var i = 0; i < element.contents.length; i++) {

            var child = element.contents[i];
            var ruby = child.styleAttrs[imscStyles.byName.ruby.qname];

            if (child.kind === 'span' && (ruby === "textContainer" || ruby === "text")) {

                /* skip ruby text and text containers, which are handled on their own */
            
                continue;

            } else if ('contents' in child) {
    
                constructSpanList(child, elist);
    
            } else if ((child.kind === 'span' && child.text.length !== 0) || child.kind === 'br') {

                /* skip empty spans */

                elist.push(child);

            }

        }

    }

    function pruneEmptySpans(element) {

        if (element.kind === 'br') {

            return false;

        } else if ('text' in element) {

            return  element.text.length === 0;

        } else if ('contents' in element) {

            var i = element.contents.length;

            while (i--) {

                if (pruneEmptySpans(element.contents[i])) {
                    element.contents.splice(i, 1);
                }

            }

            return element.contents.length === 0;

        }
    }

    function ISD(tt) {
        this.contents = [];
        this.aspectRatio = tt.aspectRatio;
        this.lang = tt.lang;
    }

    function ISDContentElement(ttelem) {

        /* assume the element is a region if it does not have a kind */

        this.kind = ttelem.kind || 'region';

        /* copy lang */

        this.lang = ttelem.lang;

        /* copy id */

        if (ttelem.id) {
            this.id = ttelem.id;
        }

        /* deep copy of style attributes */
        this.styleAttrs = {};

        for (var sname in ttelem.styleAttrs) {

            if (! ttelem.styleAttrs.hasOwnProperty(sname)) continue;

            this.styleAttrs[sname] =
                ttelem.styleAttrs[sname];
        }
        
        /* copy src and type if image */
        
        if ('src' in ttelem) {
            
            this.src = ttelem.src;
            
        }
        
         if ('type' in ttelem) {
            
            this.type = ttelem.type;
            
        }

        /* TODO: clean this! 
         * TODO: ISDElement and document element should be better tied together */

        if ('text' in ttelem) {

            this.text = ttelem.text;

        } else if (this.kind === 'region' || 'contents' in ttelem) {

            this.contents = [];
        }

        if ('space' in ttelem) {

            this.space = ttelem.space;
        }
    }


    /*
     * ERROR HANDLING UTILITY FUNCTIONS
     * 
     */

    function reportInfo(errorHandler, msg) {

        if (errorHandler && errorHandler.info && errorHandler.info(msg))
            throw msg;

    }

    function reportWarning(errorHandler, msg) {

        if (errorHandler && errorHandler.warn && errorHandler.warn(msg))
            throw msg;

    }

    function reportError(errorHandler, msg) {

        if (errorHandler && errorHandler.error && errorHandler.error(msg))
            throw msg;

    }

    function reportFatal(errorHandler, msg) {

        if (errorHandler && errorHandler.fatal)
            errorHandler.fatal(msg);

        throw msg;

    }


})(typeof exports === 'undefined' ? this.imscISD = {} : exports,
    typeof imscNames === 'undefined' ? require("./names") : imscNames,
    typeof imscStyles === 'undefined' ? require("./styles") : imscStyles,
    typeof imscUtils === 'undefined' ? require("./utils") : imscUtils
    );

},{"./names":5,"./styles":6,"./utils":7}],4:[function(require,module,exports){
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

exports.generateISD = require('./isd').generateISD;
exports.fromXML = require('./doc').fromXML;
exports.renderHTML = require('./html').render;
},{"./doc":1,"./html":2,"./isd":3}],5:[function(require,module,exports){
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
 * @module imscNames
 */

;
(function (imscNames) { // wrapper for non-node envs

    imscNames.ns_tt = "http://www.w3.org/ns/ttml";
    imscNames.ns_tts = "http://www.w3.org/ns/ttml#styling";
    imscNames.ns_ttp = "http://www.w3.org/ns/ttml#parameter";
    imscNames.ns_xml = "http://www.w3.org/XML/1998/namespace";
    imscNames.ns_itts = "http://www.w3.org/ns/ttml/profile/imsc1#styling";
    imscNames.ns_ittp = "http://www.w3.org/ns/ttml/profile/imsc1#parameter";
    imscNames.ns_smpte = "http://www.smpte-ra.org/schemas/2052-1/2010/smpte-tt";
    imscNames.ns_ebutts = "urn:ebu:tt:style";
    
})(typeof exports === 'undefined' ? this.imscNames = {} : exports);





},{}],6:[function(require,module,exports){
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

},{"./names":5,"./utils":7}],7:[function(require,module,exports){
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

},{}]},{},[4])(4)
});
