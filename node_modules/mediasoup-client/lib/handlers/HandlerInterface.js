"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerInterface = void 0;
const enhancedEvents_1 = require("../enhancedEvents");
class HandlerInterface extends enhancedEvents_1.EnhancedEventEmitter {
    constructor() {
        super();
    }
}
exports.HandlerInterface = HandlerInterface;
