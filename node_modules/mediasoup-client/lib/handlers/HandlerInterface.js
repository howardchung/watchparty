"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerInterface = void 0;
const EnhancedEventEmitter_1 = require("../EnhancedEventEmitter");
class HandlerInterface extends EnhancedEventEmitter_1.EnhancedEventEmitter {
    constructor() {
        super();
    }
}
exports.HandlerInterface = HandlerInterface;
