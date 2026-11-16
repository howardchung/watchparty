"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmcdHeaderField = void 0;
const CMCD_OBJECT_js_1 = require("./CMCD_OBJECT.js");
const CMCD_REQUEST_js_1 = require("./CMCD_REQUEST.js");
const CMCD_SESSION_js_1 = require("./CMCD_SESSION.js");
const CMCD_STATUS_js_1 = require("./CMCD_STATUS.js");
/**
 * CMCD header fields.
 *
 * @group CMCD
 *
 * @enum
 *
 * @beta
 */
exports.CmcdHeaderField = {
    /**
     * keys whose values vary with the object being requested.
     */
    OBJECT: CMCD_OBJECT_js_1.CMCD_OBJECT,
    /**
     * keys whose values vary with each request.
     */
    REQUEST: CMCD_REQUEST_js_1.CMCD_REQUEST,
    /**
     * keys whose values are expected to be invariant over the life of the session.
     */
    SESSION: CMCD_SESSION_js_1.CMCD_SESSION,
    /**
     * keys whose values do not vary with every request or object.
     */
    STATUS: CMCD_STATUS_js_1.CMCD_STATUS,
};
//# sourceMappingURL=CmcdHeaderField.js.map