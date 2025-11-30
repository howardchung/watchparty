"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = exports.testFakeParameters = exports.FakeHandler = exports.enhancedEvents = exports.ortc = exports.parseScalabilityMode = exports.detectDeviceAsync = exports.detectDevice = exports.Device = exports.version = exports.types = void 0;
const debug_1 = require("debug");
exports.debug = debug_1.default;
/**
 * Expose all types.
 */
exports.types = require("./types");
/**
 * Expose mediasoup-client version.
 */
exports.version = '3.18.1';
/**
 * Expose Device class and device detector helpers.
 */
var Device_1 = require("./Device");
Object.defineProperty(exports, "Device", { enumerable: true, get: function () { return Device_1.Device; } });
Object.defineProperty(exports, "detectDevice", { enumerable: true, get: function () { return Device_1.detectDevice; } });
Object.defineProperty(exports, "detectDeviceAsync", { enumerable: true, get: function () { return Device_1.detectDeviceAsync; } });
/**
 * Expose parseScalabilityMode() function.
 */
var scalabilityModes_1 = require("./scalabilityModes");
Object.defineProperty(exports, "parseScalabilityMode", { enumerable: true, get: function () { return scalabilityModes_1.parse; } });
/**
 * Expose all ORTC functions.
 */
exports.ortc = require("./ortc");
/**
 * Expose enhanced events.
 */
exports.enhancedEvents = require("./enhancedEvents");
/**
 * Expose FakeHandler.
 */
var FakeHandler_1 = require("./handlers/FakeHandler");
Object.defineProperty(exports, "FakeHandler", { enumerable: true, get: function () { return FakeHandler_1.FakeHandler; } });
/**
 * Expose test/fakeParameters utils.
 */
exports.testFakeParameters = require("./test/fakeParameters");
