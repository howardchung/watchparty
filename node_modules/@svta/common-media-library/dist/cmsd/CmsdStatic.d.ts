import type { CmsdCustomKey } from './CmsdCustomKey.js';
import type { CmsdObjectType } from './CmsdObjectType.js';
import type { CmsdStreamType } from './CmsdStreamType.js';
import type { CmsdStreamingFormat } from './CmsdStreamingFormat.js';
import type { CmsdValue } from './CmsdValue.js';
/**
 * Common Media Server Data (CMSD) static response header fields.
 *
 * @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5006-final.pdf|CMSD Spec}
 *
 * @group CMSD
 *
 * @beta
 */
export type CmsdStatic = {
    /**
     * Custom key names may be used, but they MUST carry a hyphenated prefix to ensure that there will not be a namespace collision
     * with future revisions to this specification. Clients SHOULD use a reverse-DNS syntax when defining their own prefix.
     */
    [index: CmsdCustomKey]: CmsdValue;
    /**
     * Availability time
     *
     * The wallclock time at which the first byte of this object became available at the origin for successful request. The time is
     * expressed as integer milliseconds since the Unix Epoch, i.e., the number of milliseconds that have elapsed since January 1,
     * 1970 (midnight UTC/GMT), not counting leap seconds (in ISO 8601: 1970- 01-01T00:00:000Z).
     *
     * Integer Milliseconds
     */
    at?: number;
    /**
     * Encoded bitrate
     *
     * The encoded bitrate of the audio or video object being requested. If the instantaneous bitrate varies over the duration of the
     * object, the average value over the duration of the object SHOULD be communicated. This key should only accompany objects that
     * have an implicit bitrate.
     *
     * Integer kbps
     */
    br?: number;
    /**
     * Object duration
     *
     * The playback duration in milliseconds of the object being requested. If a partial segment is being requested, then this value
     * MUST indicate the playback duration of that part and not that of its parent segment. This value can be an approximation of the
     * estimated duration if the explicit value is not known.
     *
     * Integer milliseconds
     */
    d?: number;
    /**
     * Held time
     *
     * The number of milliseconds that this response was held back by an origin before returning. This is applicable to blocking responses
     * under LL-HLS [HLSbis].
     *
     * Integer Milliseconds
     */
    ht?: number;
    /**
     * Intermediary identifier
     *
     * An identifier for the processing server. The value SHOULD identify both the organization and the intermediary that is writing the key.
     * Identifiers SHOULD be as concise as possible to reduce log file and transferred size, while still remaining unique.
     *
     * String
     */
    n?: string;
    /**
     * Next object request
     *
     * Relative path of the next object to be requested. This can be used to trigger pre-fetching by the CDN. This MUST be a path relative to the current
     * request. This string MUST be URLEncoded. The client SHOULD NOT depend upon any pre-fetch action being taken - it is merely a request for such a
     * pre-fetch to take place.
     *
     * String
     */
    nor?: string;
    /**
     * Next range request
     *
     * If the next request will be a partial object request, then this string denotes the byte range to be requested. If the ‘nor’ field is not set, then the
     * object is assumed to match the object currently being requested. The client SHOULD NOT depend upon any pre-fetch action being taken – it is merely a
     * request for such a pre-fetch to take place. Formatting is similar to the HTTP Range header, except that the unit MUST be ‘byte’, the ‘Range:’ prefix is
     * NOT required and specifying multiple ranges is NOT allowed. Valid combinations are:
     *
     * - `"\<range-start\>-"`
     * - `"\<range-start\>-\<range-end\>"`
     * - `"-\<suffix-length\>"`
     *
     * String
     */
    nrr?: string;
    /**
     * Object type
     *
     * The media type of the current object being requested:
     * - `m` = text file, such as a manifest or playlist
     * - `a` = audio only
     * - `v` = video only
     * - `av` = muxed audio and video
     * - `i` = init segment
     * - `c` = caption or subtitle
     * - `tt` = ISOBMFF timed text track
     * - `k` = cryptographic key, license or certificate.
     * - `o` = other
     *
     * If the object type being requested is unknown, then this key MUST NOT be used.
     *
     * Token
     */
    ot?: CmsdObjectType;
    /**
     * Streaming format
     *
     * The streaming format that defines the current request.
     *
     * - `d` = MPEG DASH
     * - `h` = HTTP Live Streaming (HLS)
     * - `s` = Smooth Streaming
     * - `o` = other
     *
     * If the streaming format being requested is unknown, then this key MUST NOT be used.
     *
     * Token
     */
    sf?: CmsdStreamingFormat;
    /**
     * Stream type
     * - `v` = all segments are available – e.g., VOD
     * - `l` = segments become available over time – e.g., LIVE
     *
     * Token
     */
    st?: CmsdStreamType;
    /**
     * Startup
     *
     * Key is included without a value if the object is needed urgently due to startup, seeking or recovery after a buffer-empty event. The media SHOULD not be
     * rendering when this request is made. This key MUST not be sent if it is FALSE.
     *
     * Boolean
     */
    su?: boolean;
    /**
     * CMSD version
     *
     * The version of this specification used for interpreting the defined key names and values. If this key is omitted, the client and server MUST
     * interpret the values as being defined by version 1. Client SHOULD omit this field if the version is 1.
     *
     * Integer
     */
    v?: number;
};
//# sourceMappingURL=CmsdStatic.d.ts.map