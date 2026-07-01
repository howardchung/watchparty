"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Gauge {
    constructor() {
        this.value = 0;
        this.used = false;
    }
    val() {
        return this.value;
    }
    set(value) {
        this.used = true;
        this.value = value;
    }
    isUsed() {
        return this.used;
    }
}
exports.default = Gauge;
