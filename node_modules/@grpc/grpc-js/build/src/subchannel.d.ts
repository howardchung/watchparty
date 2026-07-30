import { ChannelCredentials } from './channel-credentials';
import { Metadata } from './metadata';
import { Http2CallStream } from './call-stream';
import { ChannelOptions } from './channel-options';
import { ConnectivityState } from './connectivity-state';
import { GrpcUri } from './uri-parser';
import { Filter } from './filter';
import { SubchannelAddress } from './subchannel-address';
import { SubchannelRef } from './channelz';
import { ConnectivityStateListener } from './subchannel-interface';
export interface SubchannelCallStatsTracker {
    addMessageSent(): void;
    addMessageReceived(): void;
}
export declare class Subchannel {
    private channelTarget;
    private subchannelAddress;
    private options;
    private credentials;
    /**
     * The subchannel's current connectivity state. Invariant: `session` === `null`
     * if and only if `connectivityState` is IDLE or TRANSIENT_FAILURE.
     */
    private connectivityState;
    /**
     * The underlying http2 session used to make requests.
     */
    private session;
    /**
     * Indicates that the subchannel should transition from TRANSIENT_FAILURE to
     * CONNECTING instead of IDLE when the backoff timeout ends.
     */
    private continueConnecting;
    /**
     * A list of listener functions that will be called whenever the connectivity
     * state changes. Will be modified by `addConnectivityStateListener` and
     * `removeConnectivityStateListener`
     */
    private stateListeners;
    /**
     * A list of listener functions that will be called when the underlying
     * socket disconnects. Used for ending active calls with an UNAVAILABLE
     * status.
     */
    private disconnectListeners;
    private backoffTimeout;
    /**
     * The complete user agent string constructed using channel args.
     */
    private userAgent;
    /**
     * The amount of time in between sending pings
     */
    private keepaliveTimeMs;
    /**
     * The amount of time to wait for an acknowledgement after sending a ping
     */
    private keepaliveTimeoutMs;
    /**
     * Timer reference for timeout that indicates when to send the next ping
     */
    private keepaliveIntervalId;
    /**
     * Timer reference tracking when the most recent ping will be considered lost
     */
    private keepaliveTimeoutId;
    /**
     * Indicates whether keepalive pings should be sent without any active calls
     */
    private keepaliveWithoutCalls;
    /**
     * Tracks calls with references to this subchannel
     */
    private callRefcount;
    /**
     * Tracks channels and subchannel pools with references to this subchannel
     */
    private refcount;
    /**
     * A string representation of the subchannel address, for logging/tracing
     */
    private subchannelAddressString;
    private readonly channelzEnabled;
    private channelzRef;
    private channelzTrace;
    private callTracker;
    private childrenTracker;
    private channelzSocketRef;
    /**
     * Name of the remote server, if it is not the same as the subchannel
     * address, i.e. if connecting through an HTTP CONNECT proxy.
     */
    private remoteName;
    private streamTracker;
    private keepalivesSent;
    private messagesSent;
    private messagesReceived;
    private lastMessageSentTimestamp;
    private lastMessageReceivedTimestamp;
    /**
     * A class representing a connection to a single backend.
     * @param channelTarget The target string for the channel as a whole
     * @param subchannelAddress The address for the backend that this subchannel
     *     will connect to
     * @param options The channel options, plus any specific subchannel options
     *     for this subchannel
     * @param credentials The channel credentials used to establish this
     *     connection
     */
    constructor(channelTarget: GrpcUri, subchannelAddress: SubchannelAddress, options: ChannelOptions, credentials: ChannelCredentials);
    private getChannelzInfo;
    private getChannelzSocketInfo;
    private resetChannelzSocketInfo;
    private trace;
    private refTrace;
    private flowControlTrace;
    private internalsTrace;
    private keepaliveTrace;
    private handleBackoffTimer;
    /**
     * Start a backoff timer with the current nextBackoff timeout
     */
    private startBackoff;
    private stopBackoff;
    private sendPing;
    private startKeepalivePings;
    /**
     * Stop keepalive pings when terminating a connection. This discards the
     * outstanding ping timeout, so it should not be called if the same
     * connection will still be used.
     */
    private stopKeepalivePings;
    private createSession;
    private startConnectingInternal;
    private handleDisconnect;
    /**
     * Initiate a state transition from any element of oldStates to the new
     * state. If the current connectivityState is not in oldStates, do nothing.
     * @param oldStates The set of states to transition from
     * @param newState The state to transition to
     * @returns True if the state changed, false otherwise
     */
    private transitionToState;
    /**
     * Check if the subchannel associated with zero calls and with zero channels.
     * If so, shut it down.
     */
    private checkBothRefcounts;
    callRef(): void;
    callUnref(): void;
    ref(): void;
    unref(): void;
    unrefIfOneRef(): boolean;
    /**
     * Start a stream on the current session with the given `metadata` as headers
     * and then attach it to the `callStream`. Must only be called if the
     * subchannel's current connectivity state is READY.
     * @param metadata
     * @param callStream
     */
    startCallStream(metadata: Metadata, callStream: Http2CallStream, extraFilters: Filter[]): void;
    /**
     * If the subchannel is currently IDLE, start connecting and switch to the
     * CONNECTING state. If the subchannel is current in TRANSIENT_FAILURE,
     * the next time it would transition to IDLE, start connecting again instead.
     * Otherwise, do nothing.
     */
    startConnecting(): void;
    /**
     * Get the subchannel's current connectivity state.
     */
    getConnectivityState(): ConnectivityState;
    /**
     * Add a listener function to be called whenever the subchannel's
     * connectivity state changes.
     * @param listener
     */
    addConnectivityStateListener(listener: ConnectivityStateListener): void;
    /**
     * Remove a listener previously added with `addConnectivityStateListener`
     * @param listener A reference to a function previously passed to
     *     `addConnectivityStateListener`
     */
    removeConnectivityStateListener(listener: ConnectivityStateListener): void;
    addDisconnectListener(listener: () => void): void;
    removeDisconnectListener(listener: () => void): void;
    /**
     * Reset the backoff timeout, and immediately start connecting if in backoff.
     */
    resetBackoff(): void;
    getAddress(): string;
    getChannelzRef(): SubchannelRef;
    getRealSubchannel(): this;
}
