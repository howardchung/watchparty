#include "web-socket-wrapper.h"

#include "plog/Log.h"

Napi::FunctionReference WebSocketWrapper::constructor;
std::unordered_set<WebSocketWrapper *> WebSocketWrapper::instances;

void WebSocketWrapper::CloseAll()
{
    PLOG_DEBUG << "CloseAll() called";
    auto copy(instances);
    for (auto inst : copy)
        inst->doClose();
}

void WebSocketWrapper::CleanupAll()
{
    PLOG_DEBUG << "CleanupAll() called";
    auto copy(instances);
    for (auto inst : copy)
        inst->doCleanup();
}

Napi::Object WebSocketWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "WebSocket",
        {
            InstanceMethod("open", &WebSocketWrapper::open),
            InstanceMethod("close", &WebSocketWrapper::close),
            InstanceMethod("forceClose", &WebSocketWrapper::forceClose),
            InstanceMethod("sendMessage", &WebSocketWrapper::sendMessage),
            InstanceMethod("sendMessageBinary", &WebSocketWrapper::sendMessageBinary),
            InstanceMethod("isOpen", &WebSocketWrapper::isOpen),
            InstanceMethod("bufferedAmount", &WebSocketWrapper::bufferedAmount),
            InstanceMethod("maxMessageSize", &WebSocketWrapper::maxMessageSize),
            InstanceMethod("setBufferedAmountLowThreshold", &WebSocketWrapper::setBufferedAmountLowThreshold),
            InstanceMethod("onOpen", &WebSocketWrapper::onOpen),
            InstanceMethod("onClosed", &WebSocketWrapper::onClosed),
            InstanceMethod("onError", &WebSocketWrapper::onError),
            InstanceMethod("onBufferedAmountLow", &WebSocketWrapper::onBufferedAmountLow),
            InstanceMethod("onMessage", &WebSocketWrapper::onMessage),
            InstanceMethod("remoteAddress", &WebSocketWrapper::remoteAddress),
            InstanceMethod("path", &WebSocketWrapper::path),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("WebSocket", func);
    return exports;
}

WebSocketWrapper::WebSocketWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<WebSocketWrapper>(info)
{
    PLOG_DEBUG << "Constructor called";
    Napi::Env env = info.Env();

    // Create WebSocket using rtc::WebSocket provided by WebSocketServer
    if (info.Length() > 1)
    {
        mWebSocketPtr = *(info[1].As<Napi::External<std::shared_ptr<rtc::WebSocket>>>().Data());
        PLOG_DEBUG << "Using WebSocket got from WebSocketServer";
        instances.insert(this);

        // Closed callback must be set to trigger cleanup
        mOnClosedCallback = std::make_unique<ThreadSafeCallback>(Napi::Function::New(info.Env(), [](const Napi::CallbackInfo &) {}));
        return;
    }

    // Create WebSocket without config
    if (info.Length() == 0)
    {
        try
        {
            PLOG_DEBUG << "Creating a new WebSocket without config";
            mWebSocketPtr = std::make_unique<rtc::WebSocket>();
        }
        catch (std::exception &ex)
        {
            Napi::Error::New(env, std::string("libdatachannel error while creating WebSocket without config: ") + ex.what()).ThrowAsJavaScriptException();
            return;
        }
        instances.insert(this);

        // Closed callback must be set to trigger cleanup
        mOnClosedCallback = std::make_unique<ThreadSafeCallback>(Napi::Function::New(info.Env(), [](const Napi::CallbackInfo &) {}));
        return;
    }

    // Create WebSocket with config
    PLOG_DEBUG << "Creating a new WebSocket with config";

    Napi::Object config = info[0].As<Napi::Object>();
    rtc::WebSocketConfiguration webSocketConfig;

    if (config.Has("disableTlsVerification"))
    {
        if (!config.Get("disableTlsVerification").IsBoolean())
        {
            Napi::TypeError::New(info.Env(), "disableTlsVerification must be boolean").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.disableTlsVerification = config.Get("disableTlsVerification").ToBoolean();
    }

    // Proxy Server
    if (config.Has("proxyServer") && config.Get("proxyServer").IsObject())
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
            password = proxyServer.Get("password").As<Napi::String>().ToString();

        webSocketConfig.proxyServer = rtc::ProxyServer(type, ip, port, username, password);
    }

    if (config.Has("protocols"))
    {
        if (!config.Get("protocols").IsArray())
        {
            Napi::TypeError::New(info.Env(), "protocols must be an array").ThrowAsJavaScriptException();
            return;
        }
        Napi::Array protocols = config.Get("protocols").As<Napi::Array>();
        for (uint32_t i = 0; i < protocols.Length(); i++)
        {
            webSocketConfig.protocols.push_back(protocols.Get(i).ToString());
        }
    }

    if (config.Has("connectionTimeout"))
    {
        if (!config.Get("connectionTimeout").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "connectionTimeout must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.connectionTimeout = std::chrono::milliseconds(config.Get("connectionTimeout").ToNumber().Int64Value());
    }

    if (config.Has("pingInterval"))
    {
        if (!config.Get("pingInterval").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "pingInterval must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.pingInterval = std::chrono::milliseconds(config.Get("pingInterval").ToNumber().Int64Value());
    }

    if (config.Has("maxOutstandingPings"))
    {
        if (!config.Get("maxOutstandingPings").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "maxOutstandingPings must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.maxOutstandingPings = config.Get("maxOutstandingPings").ToNumber().Int32Value();
    }

    if (config.Has("caCertificatePemFile"))
    {
        if (!config.Get("caCertificatePemFile").IsString())
        {
            Napi::TypeError::New(info.Env(), "caCertificatePemFile must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.caCertificatePemFile = config.Get("caCertificatePemFile").ToString();
    }

    if (config.Has("certificatePemFile"))
    {
        if (!config.Get("certificatePemFile").IsString())
        {
            Napi::TypeError::New(info.Env(), "certificatePemFile must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.certificatePemFile = config.Get("certificatePemFile").ToString();
    }

    if (config.Has("keyPemFile"))
    {
        if (!config.Get("keyPemFile").IsString())
        {
            Napi::TypeError::New(info.Env(), "keyPemFile must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.keyPemFile = config.Get("keyPemFile").ToString();
    }

    if (config.Has("keyPemPass"))
    {
        if (!config.Get("keyPemPass").IsString())
        {
            Napi::TypeError::New(info.Env(), "keyPemPass must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.keyPemPass = config.Get("keyPemPass").ToString();
    }

    if (config.Has("maxMessageSize"))
    {
        if (!config.Get("maxMessageSize").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "maxMessageSize must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketConfig.maxMessageSize = config.Get("maxMessageSize").ToNumber().Int32Value();
    }

    // Create WebSocket
    try
    {
        PLOG_DEBUG << "Creating a new WebSocket";
        mWebSocketPtr = std::make_unique<rtc::WebSocket>(webSocketConfig);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while creating WebSocket: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }

    PLOG_DEBUG << "WebSocket created";

    // Closed callback must set to trigger cleanup
    mOnClosedCallback = std::make_unique<ThreadSafeCallback>(Napi::Function::New(info.Env(), [](const Napi::CallbackInfo &) {}));

    instances.insert(this);
}

WebSocketWrapper::~WebSocketWrapper()
{
    PLOG_DEBUG << "Destructor called";
    doClose();
}

void WebSocketWrapper::doClose()
{
    PLOG_DEBUG << "doClose() called";
    if (mWebSocketPtr)
    {
        PLOG_DEBUG << "Closing...";
        try
        {
            mWebSocketPtr->close();
            mWebSocketPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cerr << std::string("libdatachannel error while closing WebSocket: ") + ex.what() << std::endl;
            return;
        }
    }

    mOnOpenCallback.reset();
    mOnErrorCallback.reset();
    mOnBufferedAmountLowCallback.reset();
    mOnMessageCallback.reset();
}

void WebSocketWrapper::doForceClose()
{
    PLOG_DEBUG << "doForceClose() called";
    if (mWebSocketPtr)
    {
        PLOG_DEBUG << "Force closing...";
        try
        {
            mWebSocketPtr->forceClose();
            mWebSocketPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cerr << std::string("libdatachannel error while force closing WebSocket: ") + ex.what() << std::endl;
            return;
        }
    }

    mOnOpenCallback.reset();
    mOnErrorCallback.reset();
    mOnBufferedAmountLowCallback.reset();
    mOnMessageCallback.reset();
}

void WebSocketWrapper::doCleanup()
{
    PLOG_DEBUG << "doCleanup() called";
    mOnClosedCallback.reset();
    instances.erase(this);
}

void WebSocketWrapper::open(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "open() called";
    Napi::Env env = info.Env();

    if (!mWebSocketPtr)
    {
        Napi::Error::New(env, "open() called on destroyed WebSocket").ThrowAsJavaScriptException();
        return;
    }
    if (info.Length() < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "url must be string").ThrowAsJavaScriptException();
        return;
    }

    try
    {
        mWebSocketPtr->open(info[0].As<Napi::String>().ToString());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while opening WebSocket: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

void WebSocketWrapper::close(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "close() called";
    doClose();
}

void WebSocketWrapper::forceClose(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "forceClose() called";
    doForceClose();
}

Napi::Value WebSocketWrapper::sendMessage(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "sendMessage() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "sendMessage() called on destroyed channel").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    // Allow call with NULL
    if (length < 1 || (!info[0].IsString() && !info[0].IsNull()))
    {
        Napi::TypeError::New(env, "String or Null expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    try
    {
        return Napi::Boolean::New(info.Env(), mWebSocketPtr->send(info[0].As<Napi::String>().ToString()));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while sending data channel message: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value WebSocketWrapper::sendMessageBinary(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "sendMessageBinary() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "sendMessagBinary() called on destroyed channel").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsBuffer())
    {
        Napi::TypeError::New(env, "Buffer expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    try
    {
        Napi::Uint8Array buffer = info[0].As<Napi::Uint8Array>();
        return Napi::Boolean::New(info.Env(), mWebSocketPtr->send((std::byte *)buffer.Data(), buffer.ByteLength()));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while sending data channel message: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value WebSocketWrapper::isOpen(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "isOpen() called";
    Napi::Env env = info.Env();

    if (!mWebSocketPtr)
    {
        return Napi::Boolean::New(info.Env(), false);
    }

    try
    {
        return Napi::Boolean::New(info.Env(), mWebSocketPtr->isOpen());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value WebSocketWrapper::bufferedAmount(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "bufferedAmount() called";
    Napi::Env env = info.Env();

    if (!mWebSocketPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mWebSocketPtr->bufferedAmount());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value WebSocketWrapper::maxMessageSize(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "maxMessageSize() called";
    Napi::Env env = info.Env();

    if (!mWebSocketPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mWebSocketPtr->maxMessageSize());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value WebSocketWrapper::remoteAddress(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "remoteAddress() called";
    Napi::Env env = info.Env();

    if (!mWebSocketPtr)
    {
        return env.Undefined();
    }

    try
    {
        auto address = mWebSocketPtr->remoteAddress();
        if (address.has_value())
        {
            return Napi::String::New(info.Env(), address.value());
        }
        else
        {
            return env.Undefined();
        }
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return env.Undefined();
    }
}

Napi::Value WebSocketWrapper::path(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "path() called";
    Napi::Env env = info.Env();

    if (!mWebSocketPtr)
    {
        return env.Undefined();
    }

    try
    {
        auto path = mWebSocketPtr->path();
        if (path.has_value())
        {
            return Napi::String::New(info.Env(), path.value());
        }
        else
        {
            return env.Undefined();
        }
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return env.Undefined();
    }
}

void WebSocketWrapper::setBufferedAmountLowThreshold(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "setBufferedAmountLowThreshold() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "setBufferedAmountLowThreshold() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
        return;
    }

    try
    {
        mWebSocketPtr->setBufferedAmountLowThreshold(info[0].ToNumber().Uint32Value());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

void WebSocketWrapper::onOpen(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "new onOpen() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "onOpen() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnOpenCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mWebSocketPtr->onOpen([&]()
                          {
                              PLOG_DEBUG << "onOpen cb received from rtc";

                              if (mOnOpenCallback)
                                  mOnOpenCallback->call([this](Napi::Env env, std::vector<napi_value> &args)
                                                        {
                    PLOG_DEBUG << "mOnOpenCallback call(1)";
                    // Check the WebSocket is not closed
                    if(instances.find(this) == instances.end())
                        {
                            PLOG_DEBUG << "WebSocket not found in instances";
                            throw ThreadSafeCallback::CancelException();
                        }


                    // This will run in main thread and needs to construct the
                    // arguments for the call
                    args = {};
                    PLOG_DEBUG << "mOnOpenCallback call(2)"; }); });
}

void WebSocketWrapper::onClosed(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onClosed() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "onClosed() called on destroyed WebSocket").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnClosedCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mWebSocketPtr->onClosed([&]()
                            {
        PLOG_DEBUG << "onClosed cb received from rtc";
        if (mOnClosedCallback)
            mOnClosedCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnClosedCallback call";
                // Do not check if the data channel has been closed here

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            },[this]{
                doCleanup();
            }); });
}

void WebSocketWrapper::onError(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onError() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "onError() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnErrorCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mWebSocketPtr->onError([&](std::string error)
                           {
        PLOG_DEBUG << "onError cb received from rtc";
        if (mOnErrorCallback)
            mOnErrorCallback->call([this, error = std::move(error)](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnErrorCallback call(1)";
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {Napi::String::New(env, error)};
                PLOG_DEBUG << "mOnErrorCallback call(2)";
            }); });
}

void WebSocketWrapper::onBufferedAmountLow(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onBufferedAmountLow() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "onBufferedAmountLow() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnBufferedAmountLowCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mWebSocketPtr->onBufferedAmountLow([&]()
                                       {
        PLOG_DEBUG << "onBufferedAmountLow cb received from rtc";
        if (mOnBufferedAmountLowCallback)
            mOnBufferedAmountLowCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnBufferedAmountLowCallback call(1)";
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
                PLOG_DEBUG << "mOnBufferedAmountLowCallback call(2)";
            }); });
}

void WebSocketWrapper::onMessage(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onMessage() called";
    if (!mWebSocketPtr)
    {
        Napi::Error::New(info.Env(), "onMessage() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnMessageCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    PLOG_DEBUG << "setting onMessage cb on mWebSocketPtr";
    mWebSocketPtr->onMessage([&](std::variant<rtc::binary, std::string> message)
                             {
        PLOG_DEBUG << "onMessage cb received from rtc";
        if (mOnMessageCallback)
            mOnMessageCallback->call([this, message = std::move(message)](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnMessageCallback call(1)";
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                if (std::holds_alternative<std::string>(message))
                {
                    args = {Napi::String::New(env, std::get<std::string>(message))};
                }
                else
                {
                    auto bin = std::get<rtc::binary>(std::move(message));
                    args = {Napi::Buffer<std::byte>::Copy(env, bin.data(), bin.size())};
                }
                PLOG_DEBUG << "mOnMessageCallback call(2)";
            }); });
}
