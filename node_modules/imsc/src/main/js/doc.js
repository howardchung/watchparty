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
