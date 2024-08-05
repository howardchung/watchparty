import * as mediasoupClient from '../';
export declare function generateRouterRtpCapabilities(): mediasoupClient.types.RtpCapabilities;
export declare function generateNativeRtpCapabilities(): mediasoupClient.types.RtpCapabilities;
export declare function generateNativeSctpCapabilities(): mediasoupClient.types.SctpCapabilities;
export declare function generateLocalDtlsParameters(): mediasoupClient.types.DtlsParameters;
export declare function generateTransportRemoteParameters(): mediasoupClient.types.TransportOptions;
export declare function generateProducerRemoteParameters(): {
    id: string;
};
export declare function generateConsumerRemoteParameters({ id, codecMimeType, }?: {
    id?: string;
    codecMimeType?: string;
}): mediasoupClient.types.ConsumerOptions;
export declare function generateDataProducerRemoteParameters(): {
    id: string;
};
export declare function generateDataConsumerRemoteParameters({ id, }?: {
    id?: string;
}): mediasoupClient.types.DataConsumerOptions;
//# sourceMappingURL=fakeParameters.d.ts.map