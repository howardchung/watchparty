import { EnhancedEventEmitter } from './enhancedEvents';
import { Transport, type TransportOptions } from './Transport';
import { type HandlerFactory } from './handlers/HandlerInterface';
import type { RtpCapabilities, MediaKind } from './RtpParameters';
import type { SctpCapabilities } from './SctpParameters';
import type { AppData } from './types';
export type BuiltinHandlerName = 'Chrome111' | 'Chrome74' | 'Firefox120' | 'Safari12' | 'ReactNative106';
export type DeviceOptions = {
    /**
     * The name of one of the builtin handlers.
     */
    handlerName?: BuiltinHandlerName;
    /**
     * Custom handler factory.
     */
    handlerFactory?: HandlerFactory;
};
/**
 * @remarks
 * - TypeScript DOM library doesn't contain types for navigator.userAgentData.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
 */
export type NavigatorUAData = {
    brands: {
        brand: string;
        version: string;
    }[];
    platform: NavigatorUADataPlatform;
    mobile: boolean;
    getHighEntropyValues?(hints: string[]): Promise<Record<string, string>>;
};
export type NavigatorUADataPlatform = 'Android' | 'Chrome OS' | 'Chromium OS' | 'iOS' | 'Linux' | 'macOS' | 'Windows' | 'Unknown';
/**
 * Sync mediasoup-client Handler detection.
 */
export declare function detectDevice(userAgent?: string, userAgentData?: NavigatorUAData): BuiltinHandlerName | undefined;
/**
 * Async mediasoup-client Handler detection.
 *
 * @remarks
 * - Currently it runs same logic than `detectDevice()`.
 * - In the future this function could give better results than
 *   `detectDevice()`.
 */
export declare function detectDeviceAsync(userAgent?: string, userAgentData?: NavigatorUAData): Promise<BuiltinHandlerName | undefined>;
export type DeviceObserver = EnhancedEventEmitter<DeviceObserverEvents>;
export type DeviceObserverEvents = {
    newtransport: [Transport];
};
export declare class Device {
    private readonly _handlerFactory;
    private readonly _handlerName;
    private _loaded;
    private _getSendExtendedRtpCapabilities?;
    private _recvRtpCapabilities?;
    private readonly _canProduceByKind;
    private _sctpCapabilities?;
    protected readonly _observer: DeviceObserver;
    /**
     * Create a new Device to connect to mediasoup server. It uses a more advanced
     * device detection.
     *
     * @throws {UnsupportedError} if device is not supported.
     */
    static factory({ handlerName, handlerFactory, }?: DeviceOptions): Promise<Device>;
    /**
     * Create a new Device to connect to mediasoup server.
     *
     * @throws {UnsupportedError} if device is not supported.
     */
    constructor({ handlerName, handlerFactory }?: DeviceOptions);
    /**
     * The RTC handler name.
     */
    get handlerName(): string;
    /**
     * Whether the Device is loaded.
     */
    get loaded(): boolean;
    /**
     * RTP capabilities of the Device for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     */
    get rtpCapabilities(): RtpCapabilities;
    /**
     * SCTP capabilities of the Device.
     *
     * @throws {InvalidStateError} if not loaded.
     */
    get sctpCapabilities(): SctpCapabilities;
    get observer(): DeviceObserver;
    /**
     * Initialize the Device.
     */
    load({ routerRtpCapabilities, preferLocalCodecsOrder, }: {
        routerRtpCapabilities: RtpCapabilities;
        preferLocalCodecsOrder?: boolean;
    }): Promise<void>;
    /**
     * Whether we can produce audio/video.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    canProduce(kind: MediaKind): boolean;
    /**
     * Creates a Transport for sending media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    createSendTransport<TransportAppData extends AppData = AppData>({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData, }: TransportOptions<TransportAppData>): Transport<TransportAppData>;
    /**
     * Creates a Transport for receiving media.
     *
     * @throws {InvalidStateError} if not loaded.
     * @throws {TypeError} if wrong arguments.
     */
    createRecvTransport<TransportAppData extends AppData = AppData>({ id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData, }: TransportOptions<TransportAppData>): Transport<TransportAppData>;
    private createTransport;
}
//# sourceMappingURL=Device.d.ts.map