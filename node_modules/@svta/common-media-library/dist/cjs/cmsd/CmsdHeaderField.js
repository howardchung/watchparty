"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsdHeaderField = void 0;
const CMSD_DYNAMIC_js_1 = require("./CMSD_DYNAMIC.js");
const CMSD_STATIC_js_1 = require("./CMSD_STATIC.js");
/**
 * CMSD header fields.
 *
 * @group CMSD
 *
 * @enum
 *
 * @beta
 */
exports.CmsdHeaderField = {
    /**
     * Keys whose values persist over multiple requests for the object.
     */
    STATIC: CMSD_STATIC_js_1.CMSD_STATIC,
    /**
     * Keys whose values apply only to the next transmission hop. Typically a
     * new CMSD-Dynamic header instance will be added by each intermediary
     * participating in the delivery.
     */
    DYNAMIC: CMSD_DYNAMIC_js_1.CMSD_DYNAMIC,
};
//# sourceMappingURL=CmsdHeaderField.js.map