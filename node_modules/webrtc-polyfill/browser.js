const scope = typeof window !== 'undefined' ? window : self

// @ts-ignore
export const RTCPeerConnection = scope.RTCPeerConnection || scope.mozRTCPeerConnection || scope.webkitRTCPeerConnection
// @ts-ignore
export const RTCSessionDescription = scope.RTCSessionDescription || scope.mozRTCSessionDescription || scope.webkitRTCSessionDescription
// @ts-ignore
export const RTCIceCandidate = scope.RTCIceCandidate || scope.mozRTCIceCandidate || scope.webkitRTCIceCandidate
export const RTCIceTransport = scope.RTCIceTransport
export const RTCDataChannel = scope.RTCDataChannel
export const RTCSctpTransport = scope.RTCSctpTransport
export const RTCDtlsTransport = scope.RTCDtlsTransport
export const RTCCertificate = scope.RTCCertificate
export const MediaStream = scope.MediaStream
export const MediaStreamTrack = scope.MediaStreamTrack
export const MediaStreamTrackEvent = scope.MediaStreamTrackEvent
export const RTCPeerConnectionIceEvent = scope.RTCPeerConnectionIceEvent
export const RTCDataChannelEvent = scope.RTCDataChannelEvent
export const RTCTrackEvent = scope.RTCTrackEvent
export const RTCError = scope.RTCError
export const RTCErrorEvent = scope.RTCErrorEvent
export const RTCRtpTransceiver = scope.RTCRtpTransceiver
export const RTCRtpReceiver = scope.RTCRtpReceiver
export const RTCRtpSender = scope.RTCRtpSender

export * as default from './browser.js'
