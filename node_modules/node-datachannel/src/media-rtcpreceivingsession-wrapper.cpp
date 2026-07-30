#include "media-rtcpreceivingsession-wrapper.h"

Napi::FunctionReference RtcpReceivingSessionWrapper::constructor;
std::unordered_set<RtcpReceivingSessionWrapper *> RtcpReceivingSessionWrapper::instances;

Napi::Object RtcpReceivingSessionWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = Napi::ObjectWrap<RtcpReceivingSessionWrapper>::DefineClass(
        env,
        "RtcpReceivingSession",
        {
            // Instance Methods
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("RtcpReceivingSession", func);
    return exports;
}

RtcpReceivingSessionWrapper::RtcpReceivingSessionWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<RtcpReceivingSessionWrapper>(info)
{
    Napi::Env env = info.Env();
    mSessionPtr = std::make_unique<rtc::RtcpReceivingSession>();
    instances.insert(this);
}

RtcpReceivingSessionWrapper::~RtcpReceivingSessionWrapper()
{
    mSessionPtr.reset();
    instances.erase(this);
}

std::shared_ptr<rtc::RtcpReceivingSession> RtcpReceivingSessionWrapper::getSessionInstance()
{
    return mSessionPtr;
}
