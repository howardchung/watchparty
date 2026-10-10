export class RTCPeerConnectionIceEvent extends Event {
    #candidate;

    constructor(candidate) {
        super('icecandidate');

        this.#candidate = candidate;
    }

    get candidate() {
        return this.#candidate;
    }
}

export class RTCDataChannelEvent extends Event {
    #channel;

    constructor(type, eventInitDict) {
        super(type);

        if (type && !eventInitDict.channel) throw new TypeError('channel member is required');

        this.#channel = eventInitDict?.channel;
    }

    get channel() {
        return this.#channel;
    }
}
