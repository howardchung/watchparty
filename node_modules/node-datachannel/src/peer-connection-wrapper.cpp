#include "peer-connection-wrapper.h"
#include "data-channel-wrapper.h"
#include "media-track-wrapper.h"
#include "media-video-wrapper.h"
#include "media-audio-wrapper.h"

#include "plog/Log.h"

#include <cctype>
#include <sstream>

Napi::FunctionReference PeerConnectionWrapper::constructor;
std::unordered_set<PeerConnectionWrapper *> PeerConnectionWrapper::instances;

void PeerConnectionWrapper::CloseAll()
{
    PLOG_DEBUG << "CloseAll() called";
    auto copy(instances);
    for (auto inst : copy)
        inst->doClose();
}

void PeerConnectionWrapper::CleanupAll()
{
    PLOG_DEBUG << "CleanupAll() called";
    auto copy(instances);
    for (auto inst : copy)
        inst->doCleanup();
}

Napi::Object PeerConnectionWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "PeerConnection",
        {
            InstanceMethod("close", &PeerConnectionWrapper::close),
            InstanceMethod("setLocalDescription", &PeerConnectionWrapper::setLocalDescription),
            InstanceMethod("setRemoteDescription", &PeerConnectionWrapper::setRemoteDescription),
            InstanceMethod("localDescription", &PeerConnectionWrapper::localDescription),
            InstanceMethod("remoteDescription", &PeerConnectionWrapper::remoteDescription),
            InstanceMethod("addRemoteCandidate", &PeerConnectionWrapper::addRemoteCandidate),
            InstanceMethod("createDataChannel", &PeerConnectionWrapper::createDataChannel),
            InstanceMethod("addTrack", &PeerConnectionWrapper::addTrack),
            InstanceMethod("hasMedia", &PeerConnectionWrapper::hasMedia),
            InstanceMethod("state", &PeerConnectionWrapper::state),
            InstanceMethod("iceState", &PeerConnectionWrapper::iceState),
            InstanceMethod("signalingState", &PeerConnectionWrapper::signalingState),
            InstanceMethod("gatheringState", &PeerConnectionWrapper::gatheringState),
            InstanceMethod("onLocalDescription", &PeerConnectionWrapper::onLocalDescription),
            InstanceMethod("onLocalCandidate", &PeerConnectionWrapper::onLocalCandidate),
            InstanceMethod("onStateChange", &PeerConnectionWrapper::onStateChange),
            InstanceMethod("onIceStateChange", &PeerConnectionWrapper::onIceStateChange),
            InstanceMethod("onSignalingStateChange", &PeerConnectionWrapper::onSignalingStateChange),
            InstanceMethod("onGatheringStateChange", &PeerConnectionWrapper::onGatheringStateChange),
            InstanceMethod("onDataChannel", &PeerConnectionWrapper::onDataChannel),
            InstanceMethod("onTrack", &PeerConnectionWrapper::onTrack),
            InstanceMethod("bytesSent", &PeerConnectionWrapper::bytesSent),
            InstanceMethod("bytesReceived", &PeerConnectionWrapper::bytesReceived),
            InstanceMethod("rtt", &PeerConnectionWrapper::rtt),
            InstanceMethod("getSelectedCandidatePair", &PeerConnectionWrapper::getSelectedCandidatePair),
            InstanceMethod("maxDataChannelId", &PeerConnectionWrapper::maxDataChannelId),
            InstanceMethod("maxMessageSize", &PeerConnectionWrapper::maxMessageSize),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("PeerConnection", func);
    return exports;
}

PeerConnectionWrapper::PeerConnectionWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<PeerConnectionWrapper>(info)
{
    PLOG_DEBUG << "Constructor called";
    Napi::Env env = info.Env();
    int length = info.Length();

    // We expect (String, Object, Function) as param
    if (length < 2 || !info[0].IsString() || !info[1].IsObject())
    {
        Napi::TypeError::New(env, "Peer Name (String) and Configuration (Object) expected").ThrowAsJavaScriptException();
        return;
    }

    // Peer Name
    mPeerName = info[0].As<Napi::String>().ToString();

    // Peer Config
    rtc::Configuration rtcConfig;
    Napi::Object config = info[1].As<Napi::Object>();
    if (!config.Get("iceServers").IsArray())
    {
        Napi::TypeError::New(env, "iceServers(Array) expected").ThrowAsJavaScriptException();
        return;
    }

    Napi::Array iceServers = config.Get("iceServers").As<Napi::Array>();
    for (uint32_t i = 0; i < iceServers.Length(); i++)
    {
        if (iceServers.Get(i).IsString()){
            try
            {
                rtcConfig.iceServers.emplace_back(iceServers.Get(i).As<Napi::String>().ToString());
            }
            catch(std::exception &ex)
            {
                Napi::TypeError::New(env, "SyntaxError: IceServer config error: " + std::string(ex.what())).ThrowAsJavaScriptException();
                return;
            }
        }
        else
        {
            if (!iceServers.Get(i).IsObject())
            {
                Napi::TypeError::New(env, "IceServer config should be a string Or an object").ThrowAsJavaScriptException();
                return;
            }

            Napi::Object iceServer = iceServers.Get(i).As<Napi::Object>();
            if (!iceServer.Get("hostname").IsString() || !iceServer.Get("port").IsNumber())
            {
                Napi::TypeError::New(env, "IceServer config error (hostname OR/AND port is not suitable)").ThrowAsJavaScriptException();
                return;
            }
            if (iceServer.Get("relayType").IsString() &&
                (!iceServer.Get("username").IsString() || !iceServer.Get("password").IsString()))
            {
                Napi::TypeError::New(env, "IceServer config error (username AND password is needed)").ThrowAsJavaScriptException();
                return;
            }

            if (iceServer.Get("relayType").IsString())
            {
                std::string relayTypeStr = iceServer.Get("relayType").As<Napi::String>();
                rtc::IceServer::RelayType relayType = rtc::IceServer::RelayType::TurnUdp;
                if (relayTypeStr.compare("TurnTcp") == 0)
                    relayType = rtc::IceServer::RelayType::TurnTcp;
                if (relayTypeStr.compare("TurnTls") == 0)
                    relayType = rtc::IceServer::RelayType::TurnTls;

                rtcConfig.iceServers.emplace_back(
                    rtc::IceServer(iceServer.Get("hostname").As<Napi::String>(),
                                   uint16_t(iceServer.Get("port").As<Napi::Number>().Uint32Value()),
                                   iceServer.Get("username").As<Napi::String>(),
                                   iceServer.Get("password").As<Napi::String>(),
                                   relayType));
            }
            else
            {
                rtcConfig.iceServers.emplace_back(
                    rtc::IceServer(
                        iceServer.Get("hostname").As<Napi::String>(),
                        uint16_t(iceServer.Get("port").As<Napi::Number>().Uint32Value())));
            }
        }
    }

    // Proxy Server
    if (config.Get("proxyServer").IsObject())
    {
        Napi::Object proxyServer = config.Get("proxyServer").As<Napi::Object>();

        // IP
        std::string ip = proxyServer.Get("ip").As<Napi::String>();

        // Port
        uint16_t port = proxyServer.Get("port").As<Napi::Number>().Uint32Value();

        // Type
        std::string strType = proxyServer.Get("type").As<Napi::String>().ToString();
        rtc::ProxyServer::Type type = rtc::ProxyServer::Type::Http;

        if (strType == "Socks5")
            type = rtc::ProxyServer::Type::Socks5;

        // Username & Password
        std::string username = "";
        std::string password = "";

        if (proxyServer.Get("username").IsString())
            username = proxyServer.Get("username").As<Napi::String>().ToString();
        if (proxyServer.Get("password").IsString())
            username = proxyServer.Get("password").As<Napi::String>().ToString();

        rtcConfig.proxyServer = rtc::ProxyServer(type, ip, port, username, password);
    }

    // bind address, libjuice only
    if (config.Get("bindAddress").IsString())
        rtcConfig.bindAddress = config.Get("bindAddress").As<Napi::String>().ToString();

    // Port Ranges
    if (config.Get("portRangeBegin").IsNumber())
        rtcConfig.portRangeBegin = config.Get("portRangeBegin").As<Napi::Number>().Uint32Value();
    if (config.Get("portRangeEnd").IsNumber())
        rtcConfig.portRangeEnd = config.Get("portRangeEnd").As<Napi::Number>().Uint32Value();

    // enableIceTcp option
    if (config.Get("enableIceTcp").IsBoolean())
        rtcConfig.enableIceTcp = config.Get("enableIceTcp").As<Napi::Boolean>();

    // enableIceUdpMux option
    if (config.Get("enableIceUdpMux").IsBoolean())
        rtcConfig.enableIceUdpMux = config.Get("enableIceUdpMux").As<Napi::Boolean>();

    // disableAutoNegotiation option
    if (config.Get("disableAutoNegotiation").IsBoolean())
        rtcConfig.disableAutoNegotiation = config.Get("disableAutoNegotiation").As<Napi::Boolean>();

    // forceMediaTransport option
    if (config.Get("forceMediaTransport").IsBoolean())
        rtcConfig.forceMediaTransport = config.Get("forceMediaTransport").As<Napi::Boolean>();

    // Max Message Size
    if (config.Get("maxMessageSize").IsNumber())
        rtcConfig.maxMessageSize = config.Get("maxMessageSize").As<Napi::Number>().Int32Value();

    // MTU
    if (config.Get("mtu").IsNumber())
        rtcConfig.mtu = config.Get("mtu").As<Napi::Number>().Int32Value();

    // ICE transport policy
    if (!config.Get("iceTransportPolicy").IsUndefined())
    {
        if (!config.Get("iceTransportPolicy").IsString())
        {
            Napi::TypeError::New(env, "Invalid ICE transport policy, expected string").ThrowAsJavaScriptException();
            return;
        }
        std::string strPolicy = config.Get("iceTransportPolicy").As<Napi::String>().ToString();
        if (strPolicy == "all")
            rtcConfig.iceTransportPolicy = rtc::TransportPolicy::All;
        else if (strPolicy == "relay")
            rtcConfig.iceTransportPolicy = rtc::TransportPolicy::Relay;
        else
        {
            Napi::TypeError::New(env, "Unknown ICE transport policy").ThrowAsJavaScriptException();
            return;
        }
    }

    // Create peer-connection
    try
    {
        PLOG_DEBUG << "Creating a new Peer Connection";
        mRtcPeerConnPtr = std::make_unique<rtc::PeerConnection>(rtcConfig);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while creating peer connection: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }

    PLOG_DEBUG << "Peer Connection created";

    // State change callback must be set to trigger cleanup on close
    mOnStateChangeCallback = std::make_unique<ThreadSafeCallback>(Napi::Function::New(info.Env(), [](const Napi::CallbackInfo &) {}));

    instances.insert(this);
}

PeerConnectionWrapper::~PeerConnectionWrapper()
{
    PLOG_DEBUG << "Destructor called";
    doCleanup();
    doClose();
}

void PeerConnectionWrapper::doClose()
{
    PLOG_DEBUG << "doClose() called";
    if (mRtcPeerConnPtr)
    {
        PLOG_DEBUG << "Closing...";
        try
        {
            mRtcPeerConnPtr->close();
            mRtcPeerConnPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cerr << std::string("libdatachannel error while closing peer connection: ") + ex.what() << std::endl;
            return;
        }
    }

    mOnLocalDescriptionCallback.reset();
    mOnLocalCandidateCallback.reset();
    mOnIceStateChangeCallback.reset();
    mOnSignalingStateChangeCallback.reset();
    mOnGatheringStateChangeCallback.reset();
    mOnDataChannelCallback.reset();
    mOnTrackCallback.reset();
}

void PeerConnectionWrapper::close(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "close() called";
    doClose();
}

void PeerConnectionWrapper::doCleanup()
{
    PLOG_DEBUG << "doCleanup() called";
    mOnStateChangeCallback.reset();
    instances.erase(this);
}

void PeerConnectionWrapper::setLocalDescription(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "setLocalDescription() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "setLocalDescription() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    rtc::Description::Type type = rtc::Description::Type::Unspec;

    // optional
    if (length > 0)
    {
        if (!info[0].IsString())
        {
            Napi::TypeError::New(env, "type (String) expected").ThrowAsJavaScriptException();
            return;
        }
        std::string typeStr = info[0].As<Napi::String>().ToString();

        // Accept uppercase first letter for backward compatibility
        if (typeStr.size() > 0)
            typeStr[0] = std::tolower(typeStr[0]);

        if (typeStr == "answer")
            type = rtc::Description::Type::Answer;
        else if (typeStr == "offer")
            type = rtc::Description::Type::Offer;
        else if (typeStr == "pranswer")
            type = rtc::Description::Type::Pranswer;
        else if (typeStr == "rollback")
            type = rtc::Description::Type::Rollback;
    }

    mRtcPeerConnPtr->setLocalDescription(type);
}

void PeerConnectionWrapper::setRemoteDescription(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "setRemoteDescription() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "setRemoteDescription() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 2 || !info[0].IsString() || !info[1].IsString())
    {
        Napi::TypeError::New(info.Env(), "String,String expected").ThrowAsJavaScriptException();
        return;
    }

    std::string sdp = info[0].As<Napi::String>().ToString();
    std::string type = info[1].As<Napi::String>().ToString();

    try
    {
        rtc::Description desc(sdp, type);
        mRtcPeerConnPtr->setRemoteDescription(desc);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while adding remote description: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

Napi::Value PeerConnectionWrapper::localDescription(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "localDescription() called";
    Napi::Env env = info.Env();

    std::optional<rtc::Description> desc = mRtcPeerConnPtr ? mRtcPeerConnPtr->localDescription() : std::nullopt;

    // Return JS null if no description
    if (!desc.has_value())
    {
        return env.Null();
    }

    Napi::Object obj = Napi::Object::New(env);
    obj.Set("type", desc->typeString());
    obj.Set("sdp", desc.value());
    return obj;
}

Napi::Value PeerConnectionWrapper::remoteDescription(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    std::optional<rtc::Description> desc = mRtcPeerConnPtr ? mRtcPeerConnPtr->remoteDescription() : std::nullopt;

    // Return JS null if no description
    if (!desc.has_value())
    {
        return env.Null();
    }

    Napi::Object obj = Napi::Object::New(env);
    obj.Set("type", desc->typeString());
    obj.Set("sdp", desc.value());
    return obj;
}

void PeerConnectionWrapper::addRemoteCandidate(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "addRemoteCandidate() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "addRemoteCandidate() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 2 || !info[0].IsString() || !info[1].IsString())
    {
        Napi::TypeError::New(info.Env(), "String, String expected").ThrowAsJavaScriptException();
        return;
    }

    try
    {
        std::string candidate = info[0].As<Napi::String>().ToString();
        std::string mid = info[0].As<Napi::String>().ToString();
        mRtcPeerConnPtr->addRemoteCandidate(rtc::Candidate(candidate, mid));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while adding remote candidate: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

Napi::Value PeerConnectionWrapper::createDataChannel(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "createDataChannel() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "createDataChannel() called on destroyed peer connection").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "Data Channel Label expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    // Optional Params
    rtc::DataChannelInit init;
    if (length > 1)
    {
        if (!info[1].IsObject())
        {
            Napi::TypeError::New(env, "Data Channel Init Config expected(As Object)").ThrowAsJavaScriptException();
            return info.Env().Null();
        }

        Napi::Object initConfig = info[1].As<Napi::Object>();

        if (!initConfig.Get("protocol").IsUndefined())
        {
            if (!initConfig.Get("protocol").IsString())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (protocol)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.protocol = initConfig.Get("protocol").As<Napi::String>();
        }

        if (!initConfig.Get("negotiated").IsUndefined())
        {
            if (!initConfig.Get("negotiated").IsBoolean())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (negotiated)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.negotiated = initConfig.Get("negotiated").As<Napi::Boolean>();
        }

        if (!initConfig.Get("id").IsUndefined())
        {
            if (!initConfig.Get("id").IsNumber())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (id)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.id = uint16_t(initConfig.Get("id").As<Napi::Number>().Uint32Value());
        }

        // Reliability.unordered parameter
        if (!initConfig.Get("unordered").IsUndefined())
        {
            if (!initConfig.Get("unordered").IsBoolean())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (unordered)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.reliability.unordered = !initConfig.Get("unordered").As<Napi::Boolean>();
        }

        if (!initConfig.Get("maxPacketLifeTime").IsUndefined() && !initConfig.Get("maxPacketLifeTime").IsNull() &&
            !initConfig.Get("maxRetransmits").IsUndefined() && !initConfig.Get("maxRetransmits").IsNull())
        {
            Napi::TypeError::New(env, "Wrong DataChannel Init Config, maxPacketLifeTime and maxRetransmits are exclusive").ThrowAsJavaScriptException();
            return info.Env().Null();
        }

        if (!initConfig.Get("maxPacketLifeTime").IsUndefined() && !initConfig.Get("maxPacketLifeTime").IsNull())
        {
            if (!initConfig.Get("maxPacketLifeTime").IsNumber())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (maxPacketLifeTime)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.reliability.maxPacketLifeTime = std::chrono::milliseconds(initConfig.Get("maxPacketLifeTime").As<Napi::Number>().Uint32Value());
        }
        else if (!initConfig.Get("maxRetransmits").IsUndefined() && !initConfig.Get("maxRetransmits").IsNull())
        {
            if (!initConfig.Get("maxRetransmits").IsNumber())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (maxRetransmits)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.reliability.maxRetransmits = int(initConfig.Get("maxRetransmits").As<Napi::Number>().Int32Value());
        }
    }

    try
    {
        std::string label = info[0].As<Napi::String>().ToString();
        std::shared_ptr<rtc::DataChannel> dataChannel = mRtcPeerConnPtr->createDataChannel(label, std::move(init));
        auto instance = DataChannelWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::DataChannel>>::New(info.Env(), &dataChannel)});
        PLOG_DEBUG << "Data Channel created. Label: " << label;
        return instance;
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while creating datachannel: ") + ex.what()).ThrowAsJavaScriptException();
        return info.Env().Null();
    }
}

void PeerConnectionWrapper::onLocalDescription(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onLocalDescription() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onLocalDescription() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnLocalDescriptionCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onLocalDescription([&](rtc::Description sdp)
                                        {
        PLOG_DEBUG << "onLocalDescription cb received from rtc";
        if (mOnLocalDescriptionCallback)
            mOnLocalDescriptionCallback->call([this, sdp = std::move(sdp)](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnLocalDescriptionCallback call(1)";
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {
                    Napi::String::New(env, std::string(sdp)),
                    Napi::String::New(env, sdp.typeString())};
                PLOG_DEBUG << "mOnLocalDescriptionCallback call(2)";
            }); });
}

void PeerConnectionWrapper::onLocalCandidate(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onLocalCandidate() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onLocalCandidate() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnLocalCandidateCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onLocalCandidate([&](rtc::Candidate cand)
                                      {
        PLOG_DEBUG << "onLocalCandidate cb received from rtc";
        if (mOnLocalCandidateCallback)
            mOnLocalCandidateCallback->call([this, cand = std::move(cand)](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnLocalCandidateCallback call(1)";
                 // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {
                    Napi::String::New(env, std::string(cand)),
                    Napi::String::New(env, cand.mid())};
                PLOG_DEBUG << "mOnLocalCandidateCallback call(2)";
            }); });
}

void PeerConnectionWrapper::onStateChange(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onStateChange() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onStateChange() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnStateChangeCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onStateChange([&](rtc::PeerConnection::State state)
                                   {
        PLOG_DEBUG << "onStateChange cb received from rtc";
        if (mOnStateChangeCallback)
            mOnStateChangeCallback->call([this, state](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnStateChangeCallback call(1)";
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::ostringstream stream;
                stream << state;
                args = {Napi::String::New(env, stream.str())};
                PLOG_DEBUG << "mOnStateChangeCallback call(2)";
            },[this,state](){
                PLOG_DEBUG << "mOnStateChangeCallback cleanup";
                // Special case for closed state, we need to reset all callbacks
                if(state == rtc::PeerConnection::State::Closed)
                {
                    doCleanup();
                }
            }); });
}

void PeerConnectionWrapper::onIceStateChange(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onIceStateChange() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onIceStateChange() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnIceStateChangeCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onIceStateChange([&](rtc::PeerConnection::IceState state)
                                      {
        PLOG_DEBUG << "onIceStateChange cb received from rtc";
        if (mOnIceStateChangeCallback)
            mOnIceStateChangeCallback->call([this, state](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnIceStateChangeCallback call(1)";
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::ostringstream stream;
                stream << state;
                args = {Napi::String::New(env, stream.str())};
                PLOG_DEBUG << "mOnIceStateChangeCallback call(2)";
            }); });
}

void PeerConnectionWrapper::onSignalingStateChange(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onSignalingStateChange() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onSignalingStateChange() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnSignalingStateChangeCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onSignalingStateChange([&](rtc::PeerConnection::SignalingState state)
                                            {
        PLOG_DEBUG << "onSignalingStateChange cb received from rtc";
        if (mOnSignalingStateChangeCallback)
            mOnSignalingStateChangeCallback->call([this, state](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnSignalingStateChangeCallback call(1)";
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::ostringstream stream;
                stream << state;
                args = {Napi::String::New(env, stream.str())};
                PLOG_DEBUG << "mOnSignalingStateChangeCallback call(2)";
            }); });
}

void PeerConnectionWrapper::onGatheringStateChange(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onGatheringStateChange() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onGatheringStateChange() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnGatheringStateChangeCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onGatheringStateChange([&](rtc::PeerConnection::GatheringState state)
                                            {
        PLOG_DEBUG << "onGatheringStateChange cb received from rtc";
        if (mOnGatheringStateChangeCallback)
            mOnGatheringStateChangeCallback->call([this, state](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnGatheringStateChangeCallback call(1)";
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::ostringstream stream;
                stream << state;
                args = {Napi::String::New(env, stream.str())};
                PLOG_DEBUG << "mOnGatheringStateChangeCallback call(2)";
            }); });
}

void PeerConnectionWrapper::onDataChannel(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onDataChannel() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onDataChannel() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnDataChannelCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onDataChannel([&](std::shared_ptr<rtc::DataChannel> dc)
                                   {
        PLOG_DEBUG << "onDataChannel cb received from rtc";
        if (mOnDataChannelCallback)
            mOnDataChannelCallback->call([this, dc](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnDataChannelCallback call(1)";
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::shared_ptr<rtc::DataChannel> dataChannel = dc;
                auto instance = DataChannelWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::DataChannel>>::New(env, &dataChannel)});
                args = {instance};
                PLOG_DEBUG << "mOnDataChannelCallback call(2)";
            }); });
}

Napi::Value PeerConnectionWrapper::bytesSent(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "bytesSent() called";
    Napi::Env env = info.Env();

    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->bytesSent());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value PeerConnectionWrapper::bytesReceived(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "bytesReceived() called";
    Napi::Env env = info.Env();

    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->bytesReceived());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value PeerConnectionWrapper::rtt(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "rtt() called";
    Napi::Env env = info.Env();

    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->rtt().value_or(std::chrono::milliseconds(-1)).count());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), -1);
    }
}

Napi::Value PeerConnectionWrapper::getSelectedCandidatePair(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "getSelectedCandidatePair() called";
    Napi::Env env = info.Env();

    if (!mRtcPeerConnPtr)
    {
        return env.Null();
    }

    try
    {
        rtc::Candidate local, remote;
        if (!mRtcPeerConnPtr->getSelectedCandidatePair(&local, &remote))
            return env.Null();

        Napi::Object retvalue = Napi::Object::New(env);
        Napi::Object localObj = Napi::Object::New(env);
        Napi::Object remoteObj = Napi::Object::New(env);

        localObj.Set("address", local.address().value_or("?"));
        localObj.Set("port", local.port().value_or(0));
        localObj.Set("type", candidateTypeToString(local.type()));
        localObj.Set("transportType", candidateTransportTypeToString(local.transportType()));
        localObj.Set("candidate", local.candidate());
        localObj.Set("mid", local.mid());
        localObj.Set("priority", local.priority());

        remoteObj.Set("address", remote.address().value_or("?"));
        remoteObj.Set("port", remote.port().value_or(0));
        remoteObj.Set("type", candidateTypeToString(remote.type()));
        remoteObj.Set("transportType", candidateTransportTypeToString(remote.transportType()));
        remoteObj.Set("candidate", remote.candidate());
        remoteObj.Set("mid", remote.mid());
        remoteObj.Set("priority", remote.priority());

        retvalue.Set("local", localObj);
        retvalue.Set("remote", remoteObj);

        return retvalue;
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), -1);
    }
}

Napi::Value PeerConnectionWrapper::maxDataChannelId(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "maxDataChannelId() called";
    Napi::Env env = info.Env();

    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->maxDataChannelId());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value PeerConnectionWrapper::maxMessageSize(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "maxMessageSize() called";
    Napi::Env env = info.Env();

    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->remoteMaxMessageSize());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

std::string PeerConnectionWrapper::candidateTypeToString(const rtc::Candidate::Type &type)
{
    PLOG_DEBUG << "candidateTypeToString() called";
    switch (type)
    {
    case rtc::Candidate::Type::Host:
        return "host";
    case rtc::Candidate::Type::PeerReflexive:
        return "prflx";
    case rtc::Candidate::Type::ServerReflexive:
        return "srflx";
    case rtc::Candidate::Type::Relayed:
        return "relay";
    default:
        return "unknown";
    }
}

std::string PeerConnectionWrapper::candidateTransportTypeToString(const rtc::Candidate::TransportType &transportType)
{
    PLOG_DEBUG << "candidateTransportTypeToString() called";
    switch (transportType)
    {
    case rtc::Candidate::TransportType::Udp:
        return "UDP";
    case rtc::Candidate::TransportType::TcpActive:
        return "TCP_active";
    case rtc::Candidate::TransportType::TcpPassive:
        return "TCP_passive";
    case rtc::Candidate::TransportType::TcpSo:
        return "TCP_so";
    case rtc::Candidate::TransportType::TcpUnknown:
        return "TCP_unknown";
    default:
        return "unknown";
    }
}

Napi::Value PeerConnectionWrapper::addTrack(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "addTrack() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "addTrack() called on destroyed peer connection").ThrowAsJavaScriptException();
        return env.Null();
    }

    if (length < 1 || !info[0].IsObject())
    {
        Napi::TypeError::New(env, "Media class instance expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    try
    {
        Napi::Object obj = info[0].As<Napi::Object>();
        if (obj.Get("media-type-video").IsBoolean())
        {
            VideoWrapper *videoPtr = Napi::ObjectWrap<VideoWrapper>::Unwrap(obj);
            std::shared_ptr<rtc::Track> track = mRtcPeerConnPtr->addTrack(videoPtr->getVideoInstance());
            auto instance = TrackWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::Track>>::New(info.Env(), &track)});
            return instance;
        }

        if (obj.Get("media-type-audio").IsBoolean())
        {
            AudioWrapper *audioPtr = Napi::ObjectWrap<AudioWrapper>::Unwrap(obj);
            std::shared_ptr<rtc::Track> track = mRtcPeerConnPtr->addTrack(audioPtr->getAudioInstance());
            auto instance = TrackWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::Track>>::New(info.Env(), &track)});
            return instance;
        }

        Napi::Error::New(env, std::string("Unknown media type")).ThrowAsJavaScriptException();
        return env.Null();
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return env.Null();
    }
}

void PeerConnectionWrapper::onTrack(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onTrack() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(env, "onGatheringStateChange() called on destroyed peer connection").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnTrackCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mRtcPeerConnPtr->onTrack([&](std::shared_ptr<rtc::Track> track)
                             {
        if (mOnTrackCallback)
            mOnTrackCallback->call([this, track](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::shared_ptr<rtc::Track> newTrack = track;
                auto instance = TrackWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::Track>>::New(env, &newTrack)});
                args = {instance};
            }); });
}

Napi::Value PeerConnectionWrapper::hasMedia(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "hasMedia() called";
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, mRtcPeerConnPtr ? mRtcPeerConnPtr->hasMedia() : false);
}

Napi::Value PeerConnectionWrapper::state(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "state() called";
    Napi::Env env = info.Env();
    std::ostringstream stream;
    stream << (mRtcPeerConnPtr ? mRtcPeerConnPtr->state() : rtc::PeerConnection::State::Closed);
    return Napi::String::New(env, stream.str());
}

Napi::Value PeerConnectionWrapper::iceState(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "iceState() called";
    Napi::Env env = info.Env();
    std::ostringstream stream;
    stream << (mRtcPeerConnPtr ? mRtcPeerConnPtr->iceState() : rtc::PeerConnection::IceState::Closed);
    return Napi::String::New(env, stream.str());
}

Napi::Value PeerConnectionWrapper::signalingState(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "signalingState() called";
    Napi::Env env = info.Env();
    std::ostringstream stream;
    stream << (mRtcPeerConnPtr ? mRtcPeerConnPtr->signalingState() : rtc::PeerConnection::SignalingState::Stable);
    return Napi::String::New(env, stream.str());
}

Napi::Value PeerConnectionWrapper::gatheringState(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "gatheringState() called";
    Napi::Env env = info.Env();
    std::ostringstream stream;
    stream << (mRtcPeerConnPtr ? mRtcPeerConnPtr->gatheringState() : rtc::PeerConnection::GatheringState::Complete);
    return Napi::String::New(env, stream.str());
}
