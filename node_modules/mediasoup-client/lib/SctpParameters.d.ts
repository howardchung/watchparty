export type SctpCapabilities = {
    numStreams: NumSctpStreams;
};
export type NumSctpStreams = {
    /**
     * Initially requested number of outgoing SCTP streams.
     */
    OS: number;
    /**
     * Maximum number of incoming SCTP streams.
     */
    MIS: number;
};
export type SctpParameters = {
    /**
     * Must always equal 5000.
     */
    port: number;
    /**
     * Initially requested number of outgoing SCTP streams.
     */
    OS: number;
    /**
     * Maximum number of incoming SCTP streams.
     */
    MIS: number;
    /**
     * Maximum allowed size for SCTP messages.
     */
    maxMessageSize: number;
};
/**
 * SCTP stream parameters describe the reliability of a certain SCTP stream.
 * If ordered is true then maxPacketLifeTime and maxRetransmits must be
 * false.
 * If ordered if false, only one of maxPacketLifeTime or maxRetransmits
 * can be true.
 */
export type SctpStreamParameters = {
    /**
     * SCTP stream id.
     */
    streamId?: number;
    /**
     * Whether data messages must be received in order. if true the messages will
     * be sent reliably. Default true.
     */
    ordered?: boolean;
    /**
     * When ordered is false indicates the time (in milliseconds) after which a
     * SCTP packet will stop being retransmitted.
     */
    maxPacketLifeTime?: number;
    /**
     * When ordered is false indicates the maximum number of times a packet will
     * be retransmitted.
     */
    maxRetransmits?: number;
    /**
     * A label which can be used to distinguish this DataChannel from others.
     */
    label?: string;
    /**
     * Name of the sub-protocol used by this DataChannel.
     */
    protocol?: string;
};
//# sourceMappingURL=SctpParameters.d.ts.map