#include "media-video-wrapper.h"
#include "media-direction.h"

Napi::FunctionReference VideoWrapper::constructor;
std::unordered_set<VideoWrapper *> VideoWrapper::instances;

Napi::Object VideoWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = Napi::ObjectWrap<VideoWrapper>::DefineClass(
        env,
        "Video",
        {
            InstanceValue("media-type-video", Napi::Boolean::New(env, true)),
            InstanceMethod("addH264Codec", &VideoWrapper::addH264Codec),
            InstanceMethod("addVideoCodec", &VideoWrapper::addVideoCodec),
            InstanceMethod("addVP8Codec", &VideoWrapper::addVP8Codec),
            InstanceMethod("addVP9Codec", &VideoWrapper::addVP9Codec),
            InstanceMethod("direction", &VideoWrapper::direction),
            InstanceMethod("generateSdp", &VideoWrapper::generateSdp),
            InstanceMethod("mid", &VideoWrapper::mid),
            InstanceMethod("setDirection", &VideoWrapper::setDirection),
            InstanceMethod("description", &VideoWrapper::description),
            InstanceMethod("removeFormat", &VideoWrapper::removeFormat),
            InstanceMethod("addSSRC", &VideoWrapper::addSSRC),
            InstanceMethod("removeSSRC", &VideoWrapper::removeSSRC),
            InstanceMethod("replaceSSRC", &VideoWrapper::replaceSSRC),
            InstanceMethod("hasSSRC", &VideoWrapper::hasSSRC),
            InstanceMethod("getSSRCs", &VideoWrapper::getSSRCs),
            InstanceMethod("getCNameForSsrc", &VideoWrapper::getCNameForSsrc),
            InstanceMethod("setBitrate", &VideoWrapper::setBitrate),
            InstanceMethod("getBitrate", &VideoWrapper::getBitrate),
            InstanceMethod("hasPayloadType", &VideoWrapper::hasPayloadType),
            InstanceMethod("addRTXCodec", &VideoWrapper::addRTXCodec),
            InstanceMethod("addRTPMap", &VideoWrapper::addRTPMap),
            InstanceMethod("parseSdpLine", &VideoWrapper::parseSdpLine),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Video", func);
    return exports;
}

VideoWrapper::VideoWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<VideoWrapper>(info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    std::string mid = "video";
    rtc::Description::Direction dir = rtc::Description::Direction::Unknown;

    // optional
    if (length > 0)
    {
        if (!info[0].IsString())
        {
            Napi::TypeError::New(env, "mid (String) expected").ThrowAsJavaScriptException();
            return;
        }
        mid = info[0].As<Napi::String>().ToString();
    }

    // ootional
    if (length > 1)
    {
        if (!info[1].IsString())
        {
            Napi::TypeError::New(env, "direction (String) expected").ThrowAsJavaScriptException();
            return;
        }

        std::string dirAsStr = info[1].As<Napi::String>().ToString();
        dir = strToDirection(dirAsStr);
    }

    mVideoPtr = std::make_unique<rtc::Description::Video>(mid, dir);

    instances.insert(this);
}

VideoWrapper::~VideoWrapper()
{
    mVideoPtr.reset();
    instances.erase(this);
}

rtc::Description::Video VideoWrapper::getVideoInstance()
{
    return *(mVideoPtr.get());
}

void VideoWrapper::addVideoCodec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 2 || !info[0].IsNumber() || !info[1].IsString())
    {
        Napi::TypeError::New(env, "We expect (Number, String, String[optional]) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();
    std::string codec = info[1].As<Napi::String>().ToString();
    std::optional<std::string> profile = std::nullopt;

    if (length > 2)
    {
        if (!info[2].IsString())
        {
            Napi::TypeError::New(env, "profile (String) expected").ThrowAsJavaScriptException();
            return;
        }
        profile = info[2].As<Napi::String>().ToString();
    }

    mVideoPtr->addVideoCodec(payloadType, codec, profile);
}

void VideoWrapper::addH264Codec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();
    std::string profile = rtc::DEFAULT_H264_VIDEO_PROFILE;

    if (length > 1)
    {
        if (!info[1].IsString())
        {
            Napi::TypeError::New(env, "profile (String) expected").ThrowAsJavaScriptException();
            return;
        }
        profile = info[1].As<Napi::String>().ToString();
    }

    mVideoPtr->addH264Codec(payloadType, profile);
}

void VideoWrapper::addVP8Codec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();

    mVideoPtr->addVP8Codec(payloadType);
}

void VideoWrapper::addVP9Codec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();

    mVideoPtr->addVP9Codec(payloadType);
}

Napi::Value VideoWrapper::direction(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, directionToStr(mVideoPtr->direction()));
}

Napi::Value VideoWrapper::generateSdp(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 3 || !info[0].IsString() || !info[1].IsString() || !info[2].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (String, String, Number) as param").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }

    std::string eol = info[0].As<Napi::String>().ToString();
    std::string addr = info[1].As<Napi::String>().ToString();
    uint16_t port = info[2].As<Napi::Number>().Uint32Value();

    return Napi::String::New(env, mVideoPtr->generateSdp(eol, addr, port));
}

Napi::Value VideoWrapper::mid(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mVideoPtr->mid());
}

void VideoWrapper::setDirection(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string dirAsStr = info[0].As<Napi::String>().ToString();
    rtc::Description::Direction dir = strToDirection(dirAsStr);
    mVideoPtr->setDirection(dir);
}

Napi::Value VideoWrapper::description(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mVideoPtr->description());
}

void VideoWrapper::removeFormat(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string fmt = info[0].As<Napi::String>().ToString();

    mVideoPtr->removeFormat(fmt);
}

void VideoWrapper::addSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number, String[optional], String[optional], String[optional]) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());
    std::optional<std::string> name;
    std::optional<std::string> msid = std::nullopt;
    std::optional<std::string> trackID = std::nullopt;

    if (length > 1)
    {
        if (!info[1].IsString())
        {
            Napi::TypeError::New(env, "name as String expected").ThrowAsJavaScriptException();
            return;
        }
        name = info[1].As<Napi::String>().ToString();
    }

    if (length > 2)
    {
        if (!info[2].IsString())
        {
            Napi::TypeError::New(env, "msid as String expected").ThrowAsJavaScriptException();
            return;
        }
        msid = info[2].As<Napi::String>().ToString();
    }

    if (length > 3)
    {
        if (!info[3].IsString())
        {
            Napi::TypeError::New(env, "trackID as String expected").ThrowAsJavaScriptException();
            return;
        }
        trackID = info[3].As<Napi::String>().ToString();
    }

    mVideoPtr->addSSRC(ssrc, name, msid, trackID);
}

void VideoWrapper::removeSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    mVideoPtr->removeSSRC(ssrc);
}

void VideoWrapper::replaceSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 2 || !info[0].IsNumber() || !info[1].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number, Number, String[optional], String[optional], String[optional]) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());
    uint32_t oldSsrc = static_cast<uint32_t>(info[1].As<Napi::Number>().ToNumber());
    std::optional<std::string> name;
    std::optional<std::string> msid = std::nullopt;
    std::optional<std::string> trackID = std::nullopt;

    if (length > 2)
    {
        if (!info[2].IsString())
        {
            Napi::TypeError::New(env, "name as String expected").ThrowAsJavaScriptException();
            return;
        }
        name = info[2].As<Napi::String>().ToString();
    }

    if (length > 3)
    {
        if (!info[3].IsString())
        {
            Napi::TypeError::New(env, "msid as String expected").ThrowAsJavaScriptException();
            return;
        }
        msid = info[3].As<Napi::String>().ToString();
    }

    if (length > 4)
    {
        if (!info[4].IsString())
        {
            Napi::TypeError::New(env, "trackID as String expected").ThrowAsJavaScriptException();
            return;
        }
        trackID = info[4].As<Napi::String>().ToString();
    }

    mVideoPtr->replaceSSRC(oldSsrc, ssrc, name, msid, trackID);
}

Napi::Value VideoWrapper::hasSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    return Napi::Boolean::New(env, mVideoPtr->hasSSRC(ssrc));
}

Napi::Value VideoWrapper::getSSRCs(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    auto list = mVideoPtr->getSSRCs();

    Napi::Uint32Array napiArr = Napi::Uint32Array::New(env, list.size());
    for (size_t i = 0; i < list.size(); i++)
        napiArr[i] = list[i];

    return napiArr;
}

Napi::Value VideoWrapper::getCNameForSsrc(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    std::optional<std::string> name = mVideoPtr->getCNameForSsrc(ssrc);

    if (!name.has_value())
        return env.Null();

    return Napi::String::New(env, name.value());
}

void VideoWrapper::setBitrate(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    unsigned int bitrate = info[0].As<Napi::Number>().ToNumber().Uint32Value();
    mVideoPtr->setBitrate(bitrate);
}

Napi::Value VideoWrapper::getBitrate(const Napi::CallbackInfo &info)
{
    return Napi::Number::New(info.Env(), mVideoPtr->bitrate());
}

Napi::Value VideoWrapper::hasPayloadType(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    int payloadType = static_cast<int32_t>(info[0].As<Napi::Number>().ToNumber());

    return Napi::Boolean::New(env, mVideoPtr->hasPayloadType(payloadType));
}

void VideoWrapper::addRTXCodec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number,Number,Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = static_cast<int32_t>(info[0].As<Napi::Number>().ToNumber());
    int originalPayloadType = static_cast<int32_t>(info[1].As<Napi::Number>().ToNumber());
    unsigned int clockRate = static_cast<uint32_t>(info[2].As<Napi::Number>().ToNumber());

    mVideoPtr->addRtxCodec(payloadType, originalPayloadType, clockRate);
}

void VideoWrapper::addRTPMap(const Napi::CallbackInfo &info)
{
    // mVideoPtr->addRTPMap()
}

void VideoWrapper::parseSdpLine(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string line = info[0].As<Napi::String>().ToString();

    mVideoPtr->parseSdpLine(line);
}
