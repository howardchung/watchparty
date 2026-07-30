import { SubchannelRef } from "./channelz";
import { ConnectivityState } from "./connectivity-state";
import { Subchannel } from "./subchannel";
export declare type ConnectivityStateListener = (subchannel: SubchannelInterface, previousState: ConnectivityState, newState: ConnectivityState) => void;
/**
 * This is an interface for load balancing policies to use to interact with
 * subchannels. This allows load balancing policies to wrap and unwrap
 * subchannels.
 *
 * Any load balancing policy that wraps subchannels must unwrap the subchannel
 * in the picker, so that other load balancing policies consistently have
 * access to their own wrapper objects.
 */
export interface SubchannelInterface {
    getConnectivityState(): ConnectivityState;
    addConnectivityStateListener(listener: ConnectivityStateListener): void;
    removeConnectivityStateListener(listener: ConnectivityStateListener): void;
    startConnecting(): void;
    getAddress(): string;
    ref(): void;
    unref(): void;
    getChannelzRef(): SubchannelRef;
    /**
     * If this is a wrapper, return the wrapped subchannel, otherwise return this
     */
    getRealSubchannel(): Subchannel;
}
export declare abstract class BaseSubchannelWrapper implements SubchannelInterface {
    protected child: SubchannelInterface;
    constructor(child: SubchannelInterface);
    getConnectivityState(): ConnectivityState;
    addConnectivityStateListener(listener: ConnectivityStateListener): void;
    removeConnectivityStateListener(listener: ConnectivityStateListener): void;
    startConnecting(): void;
    getAddress(): string;
    ref(): void;
    unref(): void;
    getChannelzRef(): SubchannelRef;
    getRealSubchannel(): Subchannel;
}
