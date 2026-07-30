#include <napi.h>
#include "rtc-wrapper.h"
#include "peer-connection-wrapper.h"
#include "data-channel-wrapper.h"
#include "media-rtcpreceivingsession-wrapper.h"
#include "media-track-wrapper.h"
#include "media-video-wrapper.h"
#include "media-audio-wrapper.h"
#include "web-socket-wrapper.h"
#include "web-socket-server-wrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    RtcWrapper::Init(env, exports);
    RtcpReceivingSessionWrapper::Init(env, exports);
    TrackWrapper::Init(env, exports);
    VideoWrapper::Init(env, exports);
    AudioWrapper::Init(env, exports);
    DataChannelWrapper::Init(env, exports);
    PeerConnectionWrapper::Init(env, exports);
    WebSocketWrapper::Init(env, exports);
    WebSocketServerWrapper::Init(env, exports);
    return exports;
}

NODE_API_MODULE(nodeDataChannel, InitAll)
