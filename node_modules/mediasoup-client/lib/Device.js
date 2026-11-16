"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
exports.detectDevice = detectDevice;
exports.detectDeviceAsync = detectDeviceAsync;
const Logger_1 = require("./Logger");
const enhancedEvents_1 = require("./enhancedEvents");
const errors_1 = require("./errors");
const utils = require("./utils");
const ortc = require("./ortc");
const Transport_1 = require("./Transport");
const Chrome111_1 = require("./handlers/Chrome111");
const Chrome74_1 = require("./handlers/Chrome74");
const Firefox120_1 = require("./handlers/Firefox120");
const Safari12_1 = require("./handlers/Safari12");
const ReactNative106_1 = require("./handlers/ReactNative106");
const logger = new Logger_1.Logger('Device');
/**
 * Sync mediasoup-client Handler detection.
 */
function detectDevice(userAgent, userAgentData) {
    logger.debug('detectDevice()');
    if (!userAgent && typeof navigator === 'object') {
        userAgent = navigator.userAgent;
    }
    if (!userAgentData && typeof navigator === 'object') {
        userAgentData = navigator.userAgentData;
    }
    return detectDeviceImpl(userAgent, userAgentData);
}
/**
 * Async mediasoup-client Handler detection.
 *
 * @remarks
 * - Currently it runs same logic than `detectDevice()`.
 * - In the future this function could give better results than
 *   `detectDevice()`.
 */
async function detectDeviceAsync(userAgent, userAgentData) {
    logger.debug('detectDeviceAsync()');
    if (!userAgent && typeof navigator === 'object') {
        userAgent = navigator.userAgent;
    }
    if (!userAgentData && typeof navigator === 'object') {
        userAgentData = navigator.userAgentData;
    }
    return detectDeviceImpl(userAgent, userAgentData);
}
class Device {
    // RTC handler factory.
    _handlerFactory;
    // Handler name.
    _handlerName;
    // Loaded flag.
    _loaded = false;
    // Callback for sending Transports to request sending extended RTP capabilities
    // on demand.
    _getSendExtendedRtpCapabilities;
    // Local RTP capabilities for receiving media.
    _recvRtpCapabilities;
    // Whether we can produce audio/video based on remote RTP capabilities.
    _canProduceByKind = {
        audio: false,
        video: false,
    };
    // Local SCTP capabilities.
    _sctpCapabilities;
    // Observer instance.
    _observer = new enhancedEvents_1.EnhancedEventEmitter();
    /**
     * Create a new Device to connect to mediasoup server. It uses a more advanced
     * device detection.
     *
     * @throws {UnsupportedError} if device is not supported.
     */
    static async factory({ handlerName, handlerFactory, } = {}) {
        logger.debug('factory()');
        if (handlerName && handlerFactory) {
            throw new TypeError('just one of handlerName or handlerInterface can be given');
        }
        if (!handlerName && !handlerFactory) {
            handlerName = await detectDeviceAsync();
            if (!handlerName) {
                throw new errors_1.UnsupportedError('device not supported');
            }
        }
        return new Device({ handlerName, handlerFactory });
    }
    /**
     * Create a new Device to connect to mediasoup server.
     *
     * @throws {UnsupportedError} if device is not supported.
     */
    constructor({ handlerName, handlerFactory } = {}) {
        logger.debug('constructor()');
        if (handlerName && handlerFactory) {
            throw new TypeError('just one of handlerName or handlerInterface can be given');
        }
        if (handlerFactory) {
            this._handlerFactory = handlerFactory;
        }
        else {
            if (handlerName) {
                logger.debug('constructor() | handler given: %s', handlerName);
            }
            else {
                handlerName = detectDevice();
                if (handlerName) {
                    logger.debug('constructor() | detected handler: %s', handlerName);
                }
                else {
                    throw new errors_1.UnsupportedError('device not supported');
                }
            }
            switch (handlerName) {
                case 'Chrome111': {
                    this._handlerFactory = Chrome111_1.Chrome111.createFactory();
                    break;
                }
                case 'Chrome74': {
                    this._handlerFactory = Chrome74_1.Chrome74.createFactory();
                    break;
                }
                case 'Firefox120': {
                    this._handlerFactory = Firefox120_1.Firefox120.createFactory();
                    break;
                }
                case 'Safari12': {
                    this._handlerFactory = Safari12_1.Safari12.createFactory();
                    break;
                }
                case 'ReactNative106': {
                    this._handlerFactory = ReactNative106_1.ReactNative106.createFactory();
                    break;
                }
                default: {
                    throw new TypeError(`unknown handlerName "${handlerName}"`);
                }
            }
        }
        this._handlerName = this._handlerFactory.name;
    }
    /**
     * The RTC handler name.
     */
    get handlerName() {
        return this._handlerName;
    }
    /**
     * Whether the Device is loaded.
     */
    get loaded() {
        return this._loaded;
    }
    /**
     * RTP capabilities of the Device for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     */
    get rtpCapabilities() {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        return this._recvRtpCapabilities;
    }
    /**
     * SCTP capabilities of the Device.
     *
     * @throws {InvalidStateError} if not loaded.
     */
    get sctpCapabilities() {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        return this._sctpCapabilities;
    }
    get observer() {
        return this._observer;
    }
    /**
     * Initialize the Device.
     */
    async load({ routerRtpCapabilities, preferLocalCodecsOrder = false, }) {
        logger.debug('load() [routerRtpCapabilities:%o]', routerRtpCapabilities);
        if (this._loaded) {
            throw new errors_1.InvalidStateError('already loaded');
        }
        // Clone given router RTP capabilities to not modify input data.
        const clonedRouterRtpCapabilities = utils.clone(routerRtpCapabilities);
        // This may throw.
        ortc.validateAndNormalizeRtpCapabilities(clonedRouterRtpCapabilities);
        const { getNativeRtpCapabilities, getNativeSctpCapabilities } = this._handlerFactory;
        const clonedNativeRtpCapabilities = utils.clone(await getNativeRtpCapabilities());
        // This may throw.
        ortc.validateAndNormalizeRtpCapabilities(clonedNativeRtpCapabilities);
        logger.debug('load() | got native RTP capabilities:%o', clonedNativeRtpCapabilities);
        this._getSendExtendedRtpCapabilities = (nativeRtpCapabilities) => {
            return utils.clone(ortc.getExtendedRtpCapabilities(nativeRtpCapabilities, clonedRouterRtpCapabilities, preferLocalCodecsOrder));
        };
        const recvExtendedRtpCapabilities = ortc.getExtendedRtpCapabilities(clonedNativeRtpCapabilities, clonedRouterRtpCapabilities, 
        /* preferLocalCodecsOrder */ false);
        // Generate our receiving RTP capabilities for receiving media.
        this._recvRtpCapabilities = ortc.getRecvRtpCapabilities(recvExtendedRtpCapabilities);
        // This may throw.
        ortc.validateAndNormalizeRtpCapabilities(this._recvRtpCapabilities);
        logger.debug('load() | got receiving RTP capabilities:%o', this._recvRtpCapabilities);
        // Check whether we can produce audio/video.
        this._canProduceByKind.audio = ortc.canSend('audio', this._recvRtpCapabilities);
        this._canProduceByKind.video = ortc.canSend('video', this._recvRtpCapabilities);
        // Generate our SCTP capabilities.
        this._sctpCapabilities = await getNativeSctpCapabilities();
        // This may throw.
        ortc.validateSctpCapabilities(this._sctpCapabilities);
        logger.debug('load() | got native SCTP capabilities:%o', this._sctpCapabilities);
        logger.debug('load() succeeded');
        this._loaded = true;
    }
    /**
     * Whether we can produce audio/video.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    canProduce(kind) {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        else if (kind !== 'audio' && kind !== 'video') {
            throw new TypeError(`invalid kind "${kind}"`);
        }
        return this._canProduceByKind[kind];
    }
    /**
     * Creates a Transport for sending media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    createSendTransport({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData, }) {
        logger.debug('createSendTransport()');
        return this.createTransport({
            direction: 'send',
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
            iceServers,
            iceTransportPolicy,
            additionalSettings,
            appData,
        });
    }
    /**
     * Creates a Transport for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    createRecvTransport({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData, }) {
        logger.debug('createRecvTransport()');
        return this.createTransport({
            direction: 'recv',
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
            iceServers,
            iceTransportPolicy,
            additionalSettings,
            appData,
        });
    }
    createTransport({ direction, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData, }) {
        if (!this._loaded) {
            throw new errors_1.InvalidStateError('not loaded');
        }
        else if (typeof id !== 'string') {
            throw new TypeError('missing id');
        }
        else if (typeof iceParameters !== 'object') {
            throw new TypeError('missing iceParameters');
        }
        else if (!Array.isArray(iceCandidates)) {
            throw new TypeError('missing iceCandidates');
        }
        else if (typeof dtlsParameters !== 'object') {
            throw new TypeError('missing dtlsParameters');
        }
        else if (sctpParameters && typeof sctpParameters !== 'object') {
            throw new TypeError('wrong sctpParameters');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Create a new Transport.
        const transport = new Transport_1.Transport({
            direction,
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
            iceServers,
            iceTransportPolicy,
            additionalSettings,
            appData,
            handlerFactory: this._handlerFactory,
            getSendExtendedRtpCapabilities: this._getSendExtendedRtpCapabilities,
            recvRtpCapabilities: this._recvRtpCapabilities,
            canProduceByKind: this._canProduceByKind,
        });
        // Emit observer event.
        this._observer.safeEmit('newtransport', transport);
        return transport;
    }
}
exports.Device = Device;
function detectDeviceImpl(userAgent, userAgentData) {
    logger.debug('detectDeviceImpl() [userAgent:"%s", userAgentData:%o]', userAgent, userAgentData);
    const chromiumMajorVersion = getChromiumMajorVersion(userAgent, userAgentData);
    if (chromiumMajorVersion) {
        if (chromiumMajorVersion >= 111) {
            logger.debug('detectDeviceImpl() | using Chrome111 handler');
            return 'Chrome111';
        }
        else if (chromiumMajorVersion >= 74) {
            logger.debug('detectDeviceImpl() | using Chrome74 handler');
            return 'Chrome74';
        }
        else {
            logger.warn('detectDeviceImpl() | unsupported Chromium based browser/version');
            return undefined;
        }
    }
    const firefoxMajorVersion = getFirefoxMajorVersion(userAgent);
    if (firefoxMajorVersion) {
        if (firefoxMajorVersion >= 120) {
            logger.debug('detectDeviceImpl() | using Firefox120 handler');
            return 'Firefox120';
        }
        else {
            logger.warn('detectDeviceImpl() | unsupported Firefox browser/version');
            return undefined;
        }
    }
    const macOSWebKitMajorVersion = getMacOSWebKitMajorVersion(userAgent);
    if (macOSWebKitMajorVersion) {
        if (macOSWebKitMajorVersion >= 605) {
            logger.debug('detectDeviceImpl() | using Safari12 handler');
            return 'Safari12';
        }
        else {
            logger.warn('detectDeviceImpl() | unsupported desktop Safari browser/version');
            return undefined;
        }
    }
    const iOSWebKitMajorVersion = getIOSWebKitMajorVersion(userAgent);
    if (iOSWebKitMajorVersion) {
        if (iOSWebKitMajorVersion >= 605) {
            logger.debug('detectDeviceImpl() | using Safari12 handler');
            return 'Safari12';
        }
        else {
            logger.warn('detectDeviceImpl() | unsupported iOS Safari based browser/version');
            return undefined;
        }
    }
    if (isReactNative()) {
        if (typeof RTCPeerConnection !== 'undefined' &&
            typeof RTCRtpTransceiver !== 'undefined') {
            logger.debug('detectDeviceImpl() | using ReactNative106 handler');
            return 'ReactNative106';
        }
        else {
            logger.warn('detectDeviceImpl() | unsupported react-native-webrtc version without RTCPeerConnection or RTCRtpTransceiver, forgot to call registerGlobals() on it?');
            return undefined;
        }
    }
    logger.warn('detectDeviceImpl() | device not supported [userAgent:"%s", userAgentData:%o]', userAgent, userAgentData);
    return undefined;
}
function getChromiumMajorVersion(userAgent, userAgentData) {
    logger.debug('getChromiumMajorVersion()');
    if (isIOS(userAgent, userAgentData)) {
        logger.debug('getChromiumMajorVersion() | this is iOS => undefined');
        return undefined;
    }
    if (isReactNative()) {
        logger.debug('getChromiumMajorVersion() | this is React-Native => undefined');
        return undefined;
    }
    if (userAgentData) {
        // Some nasty browser extensions define their own custom
        // navigator.userAgentData without mandatory `brands` field, so let's be
        // ready for it.
        const chromiumBrand = (userAgentData.brands ?? []).find(b => b.brand === 'Chromium');
        if (chromiumBrand) {
            const majorVersion = Number(chromiumBrand.version);
            logger.debug(`getChromiumMajorVersion() | Chromium major version based on NavigatorUAData => ${majorVersion}`);
            return majorVersion;
        }
    }
    const match = userAgent?.match(/\b(?:Chrome|Chromium)\/(\w+)/i);
    if (match?.[1]) {
        const majorVersion = Number(match[1]);
        logger.debug(`getChromiumMajorVersion() | Chromium major version based on User-Agent => ${majorVersion}`);
        return majorVersion;
    }
    logger.debug('getChromiumMajorVersion() | this is not Chromium => undefined');
    return undefined;
}
function getFirefoxMajorVersion(userAgent) {
    logger.debug('getFirefoxMajorVersion()');
    if (isIOS(userAgent)) {
        logger.debug('getFirefoxMajorVersion() | this is iOS => undefined');
        return undefined;
    }
    if (isReactNative()) {
        logger.debug('getFirefoxMajorVersion() | this is React-Native => undefined');
        return undefined;
    }
    const match = userAgent?.match(/\bFirefox\/(\w+)/i);
    if (match?.[1]) {
        const majorVersion = Number(match[1]);
        logger.debug(`getFirefoxMajorVersion() | Firefox major version based on User-Agent => ${majorVersion}`);
        return majorVersion;
    }
    logger.debug('getFirefoxMajorVersion() | this is not Firefox => undefined');
    return undefined;
}
function getMacOSWebKitMajorVersion(userAgent) {
    logger.debug('getMacOSWebKitMajorVersion()');
    if (isIOS(userAgent)) {
        logger.debug('getMacOSWebKitMajorVersion() | this is iOS => undefined');
        return undefined;
    }
    if (isReactNative()) {
        logger.debug('getMacOSWebKitMajorVersion() | this is React-Native => undefined');
        return undefined;
    }
    const isSafari = userAgent &&
        /\bSafari\b/i.test(userAgent) &&
        !/\bChrome\b/i.test(userAgent) &&
        !/\bChromium\b/i.test(userAgent) &&
        !/\bFirefox\b/i.test(userAgent);
    if (!isSafari) {
        logger.debug('getMacOSWebKitMajorVersion() | this is not Safari => undefined');
        return undefined;
    }
    const match = userAgent.match(/AppleWebKit\/(\w+)/i);
    if (match?.[1]) {
        const majorVersion = Number(match[1]);
        logger.debug(`getMacOSWebKitMajorVersion() | WebKit major version based on User-Agent => ${majorVersion}`);
        return majorVersion;
    }
    logger.debug('getMacOSWebKitMajorVersion() | this is not WebKit => undefined');
    return undefined;
}
function getIOSWebKitMajorVersion(userAgent) {
    logger.debug('getIOSWebKitMajorVersion()');
    if (!isIOS(userAgent)) {
        logger.debug('getIOSWebKitMajorVersion() | this is not iOS => undefined');
        return undefined;
    }
    if (isReactNative()) {
        logger.debug('getIOSWebKitMajorVersion() | this is React-Native => undefined');
        return undefined;
    }
    const match = userAgent?.match(/AppleWebKit\/(\w+)/i);
    if (match?.[1]) {
        const majorVersion = Number(match[1]);
        logger.debug(`getIOSWebKitMajorVersion() | WebKit major version based on User-Agent => ${majorVersion}`);
        return majorVersion;
    }
    logger.debug('getIOSWebKitMajorVersion() | this is not WebKit => undefined');
    return undefined;
}
function isIOS(userAgent, userAgentData) {
    logger.debug('isIOS()');
    if (userAgentData?.platform === 'iOS') {
        logger.debug('isIOS() | this is iOS based on NavigatorUAData.platform => true');
        return true;
    }
    if (userAgentData?.platform) {
        logger.debug('isIOS() | this is not iOS based on NavigatorUAData.platform => false');
        return false;
    }
    if (userAgent && /iPad|iPhone|iPod/.test(userAgent)) {
        logger.debug('isIOS() | this is iOS based on User-Agent => true');
        return true;
    }
    // iPadOS 13+ identifies itself as Mac (to force desktop view mode in some
    // websites) but we know it's iOS if it has touch screen.
    if (typeof navigator === 'object' &&
        navigator.platform === 'MacIntel' &&
        navigator.maxTouchPoints > 1) {
        logger.debug('isIOS() | this is iPadOS 13+ based on User-Agent => true');
        return true;
    }
    logger.debug('isIOS() | this is not iOS => false');
    return false;
}
function isReactNative() {
    logger.debug('isReactNative()');
    if (typeof navigator === 'object' && navigator.product === 'ReactNative') {
        logger.debug('isReactNative() | this is React-Native based on navigator.product');
        return true;
    }
    logger.debug('isReactNative() | this is not React-Native => false');
    return false;
}
