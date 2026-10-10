#include "media-audio-wrapper.h"
#include "media-direction.h"

Napi::FunctionReference AudioWrapper::constructor;
std::unordered_set<AudioWrapper *> AudioWrapper::instances;

Napi::Object AudioWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "Audio",
        {
            InstanceValue("media-type-audio", Napi::Boolean::New(env, true)),
            InstanceMethod("addAudioCodec", &AudioWrapper::addAudioCodec),
            InstanceMethod("addOpusCodec", &AudioWrapper::addOpusCodec),
            InstanceMethod("direction", &AudioWrapper::direction),
            InstanceMethod("generateSdp", &AudioWrapper::generateSdp),
            InstanceMethod("mid", &AudioWrapper::mid),
            InstanceMethod("setDirection", &AudioWrapper::setDirection),
            InstanceMethod("description", &AudioWrapper::description),
            InstanceMethod("removeFormat", &AudioWrapper::removeFormat),
            InstanceMethod("addSSRC", &AudioWrapper::addSSRC),
            InstanceMethod("removeSSRC", &AudioWrapper::removeSSRC),
            InstanceMethod("replaceSSRC", &AudioWrapper::replaceSSRC),
            InstanceMethod("hasSSRC", &AudioWrapper::hasSSRC),
            InstanceMethod("getSSRCs", &AudioWrapper::getSSRCs),
            InstanceMethod("getCNameForSsrc", &AudioWrapper::getCNameForSsrc),
            InstanceMethod("setBitrate", &AudioWrapper::setBitrate),
            InstanceMethod("getBitrate", &AudioWrapper::getBitrate),
            InstanceMethod("hasPayloadType", &AudioWrapper::hasPayloadType),
            InstanceMethod("addRTXCodec", &AudioWrapper::addRTXCodec),
            InstanceMethod("addRTPMap", &AudioWrapper::addRTPMap),
            InstanceMethod("parseSdpLine", &AudioWrapper::parseSdpLine),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Audio", func);
    return exports;
}

AudioWrapper::AudioWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<AudioWrapper>(info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    std::string mid = "audio";
    rtc::Description::Direction dir = rtc::Description::Direction::SendOnly;

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

    mAudioPtr = std::make_unique<rtc::Description::Audio>(mid, dir);

    instances.insert(this);
}

AudioWrapper::~AudioWrapper()
{
    mAudioPtr.reset();
    instances.erase(this);
}

rtc::Description::Audio AudioWrapper::getAudioInstance()
{
    return *(mAudioPtr.get());
}

void AudioWrapper::addAudioCodec(const Napi::CallbackInfo &info)
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

    mAudioPtr->addAudioCodec(payloadType, codec, profile);
}

void AudioWrapper::addOpusCodec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();
    std::optional<std::string> profile = rtc::DEFAULT_OPUS_AUDIO_PROFILE;

    if (length > 1)
    {
        if (!info[1].IsString())
        {
            Napi::TypeError::New(env, "profile (String) expected").ThrowAsJavaScriptException();
            return;
        }
        profile = info[1].As<Napi::String>().ToString();
    }

    mAudioPtr->addOpusCodec(payloadType, profile);
}


Napi::Value AudioWrapper::direction(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, directionToStr(mAudioPtr->direction()));
}

Napi::Value AudioWrapper::generateSdp(const Napi::CallbackInfo &info)
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

    return Napi::String::New(env, mAudioPtr->generateSdp(eol, addr, port));
}

Napi::Value AudioWrapper::mid(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mAudioPtr->mid());
}

void AudioWrapper::setDirection(const Napi::CallbackInfo &info)
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
    mAudioPtr->setDirection(dir);
}

Napi::Value AudioWrapper::description(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mAudioPtr->description());
}

void AudioWrapper::removeFormat(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string fmt = info[0].As<Napi::String>().ToString();

    mAudioPtr->removeFormat(fmt);
}

void AudioWrapper::addSSRC(const Napi::CallbackInfo &info)
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

    mAudioPtr->addSSRC(ssrc, name, msid, trackID);
}

void AudioWrapper::removeSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    mAudioPtr->removeSSRC(ssrc);
}

void AudioWrapper::replaceSSRC(const Napi::CallbackInfo &info)
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

    mAudioPtr->replaceSSRC(oldSsrc, ssrc, name, msid, trackID);
}

Napi::Value AudioWrapper::hasSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    return Napi::Boolean::New(env, mAudioPtr->hasSSRC(ssrc));
}

Napi::Value AudioWrapper::getSSRCs(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    auto list = mAudioPtr->getSSRCs();

    Napi::Uint32Array napiArr = Napi::Uint32Array::New(env, list.size());
    for (size_t i = 0; i < list.size(); i++)
        napiArr[i] = list[i];

    return napiArr;
}

Napi::Value AudioWrapper::getCNameForSsrc(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    std::optional<std::string> name = mAudioPtr->getCNameForSsrc(ssrc);

    if (!name.has_value())
        return env.Null();

    return Napi::String::New(env, name.value());
}

void AudioWrapper::setBitrate(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    unsigned int bitrate = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());
    mAudioPtr->setBitrate(bitrate);
}

Napi::Value AudioWrapper::getBitrate(const Napi::CallbackInfo &info)
{

    return Napi::Number::New(info.Env(), mAudioPtr->bitrate());
}

Napi::Value AudioWrapper::hasPayloadType(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    int payloadType = static_cast<int>(info[0].As<Napi::Number>().ToNumber());

    return Napi::Boolean::New(env, mAudioPtr->hasPayloadType(payloadType));
}

void AudioWrapper::addRTXCodec(const Napi::CallbackInfo &info)
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

    mAudioPtr->addRtxCodec(payloadType, originalPayloadType, clockRate);
}

void AudioWrapper::addRTPMap(const Napi::CallbackInfo &info)
{
    // mAudioPtr->addRTPMap()
}

void AudioWrapper::parseSdpLine(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string line = info[0].As<Napi::String>().ToString();

    mAudioPtr->parseSdpLine(line);
}
