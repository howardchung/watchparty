import type { CmsdCustomKey } from './CmsdCustomKey.js';
import type { CmsdValue } from './CmsdValue.js';
/**
 * Common Media Server Data (CMSD) dynamic response header field parameters.
 *
 * @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5006-final.pdf|CMSD Spec}
 *
 * @group CMSD
 *
 * @beta
 */
export type CmsdDynamicParams = {
    /**
     * Custom key names may be used, but they MUST carry a hyphenated prefix to ensure that there will not be a namespace collision
     * with future revisions to this specification. Clients SHOULD use a reverse-DNS syntax when defining their own prefix.
     */
    [index: CmsdCustomKey]: CmsdValue;
    /**
     * Duress
     *
     * Key is included without a value if the server is under duress, due to cpu, memory, disk IO, network IO or other reasons. The
     * thresholds for signaling duress are left to the discretion of the server operator. The intent is that the client will use this
     * signal to move away to an alternate server if possible. This key MUST NOT be sent if it is false.
     *
     * Boolean
     */
    du?: boolean;
    /**
     * Estimated Throughput
     *
     * The throughput between the server and the client over the currently negotiated transport as estimated by the server at the start
     * of the response. The value is expressed in units of kilobits per second and rounded to the nearest integer. The time window for
     * this estimate is expected to be the duration of the current response at most. The throughput may vary during the response and the
     * client SHOULD use this data as an adjunct to its own throughput estimates. As an informative example, this estimate could be
     * derived in this way:
     *
     *   etp = 8 * send_window / (rtt)
     *
     * where send_window = min (cwnd * mss, rwnd) with Congestion Window (cwnd) measured in packets, Maximum Segment Size (mss) in bytes,
     * Receiver Window (rwnd) in bytes and rtt in milliseconds. Note that multiple client processes adjacent to the media player may pool
     * their requests into the same connection to the server. In this case the server estimate of throughput will be against the entirety
     * of the connection, not all of which will be accessible to the media player.
     *
     * Integer Kbps
     */
    etp?: number;
    /**
     * Max suggested bitrate
     *
     * The maximum bitrate value that the player SHOULD play in its Adaptive Bit Rate (ABR) ladder. If the player is playing a bitrate higher
     * than this value, it SHOULD immediately switch to a bitrate lower than or equal to this value.
     *
     * Integer Kbps
     */
    mb?: number;
    /**
     * Response delay
     *
     * The time elapsed between the receipt of the request and when the first byte of the body becomes available to send to the client. The
     * intention is for receivers to use this value to more accurately calculate the throughput of the connection [MHV22].
     *
     * Integer milliseconds
     */
    rd?: number;
    /**
     * Round Trip Time
     *
     * Estimated round trip time between client and server. This estimate may be derived from the transport handshake. For subsequent requests
     * over the same connection, the value can be refined to be an exponentially weighted moving average of prior instantaneous values. An
     * informative example algorithm for this averaging is provided by [18].
     *
     * Integer Kbps
     */
    rtt?: number;
};
//# sourceMappingURL=CmsdDynamicParams.d.ts.map