#include "web-socket-server-wrapper.h"

#include "plog/Log.h"

Napi::FunctionReference WebSocketServerWrapper::constructor;
std::unordered_set<WebSocketServerWrapper *> WebSocketServerWrapper::instances;

void WebSocketServerWrapper::StopAll()
{
    PLOG_DEBUG << "StopAll() called";
    auto copy(instances);
    for (auto inst : copy)
        inst->doStop();
}

Napi::Object WebSocketServerWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "WebSocketServer",
        {
            InstanceMethod("stop", &WebSocketServerWrapper::stop),
            InstanceMethod("port", &WebSocketServerWrapper::port),
            InstanceMethod("onClient", &WebSocketServerWrapper::onClient)
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("WebSocketServer", func);
    return exports;
}

WebSocketServerWrapper::WebSocketServerWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<WebSocketServerWrapper>(info)
{
    PLOG_DEBUG << "Constructor called";
    Napi::Env env = info.Env();

    // Create WebSocketServer without config
    if (info.Length() == 0)
    {
        try
        {
            PLOG_DEBUG << "Creating a new WebSocketServer without config";
            mWebSocketServerPtr = std::make_unique<rtc::WebSocketServer>();
        }
        catch (std::exception &ex)
        {
            Napi::Error::New(env, std::string("libdatachannel error while creating WebSocketServer without config: ") + ex.what()).ThrowAsJavaScriptException();
            return;
        }

        PLOG_DEBUG << "WebSocketServer created without config";

        instances.insert(this);
        return;
    }

    // Create WebSocketServer with config

    Napi::Object config = info[0].As<Napi::Object>();
    rtc::WebSocketServerConfiguration webSocketServerConfig;

    // Port
    if (config.Has("port"))
    {
        if (!config.Get("port").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "port must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.port = config.Get("port").ToNumber().Uint32Value();
    }

    // Enable TLS
    if (config.Has("enableTls"))
    {
        if (!config.Get("enableTls").IsBoolean())
        {
            Napi::TypeError::New(info.Env(), "enableTls must be boolean").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.enableTls = config.Get("enableTls").ToBoolean();
    }

    // Certificate PEM File
    if (config.Has("certificatePemFile"))
    {
        if (!config.Get("certificatePemFile").IsString())
        {
            Napi::TypeError::New(info.Env(), "certificatePemFile must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.certificatePemFile = config.Get("certificatePemFile").ToString();
    }

    // Key PEM File
    if (config.Has("keyPemFile"))
    {
        if (!config.Get("keyPemFile").IsString())
        {
            Napi::TypeError::New(info.Env(), "keyPemFile must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.keyPemFile = config.Get("keyPemFile").ToString();
    }

    // Key PEM Pass
    if (config.Has("keyPemPass"))
    {
        if (!config.Get("keyPemPass").IsString())
        {
            Napi::TypeError::New(info.Env(), "keyPemPass must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.keyPemPass = config.Get("keyPemPass").ToString();
    }

    // Bind Address
    if (config.Has("bindAddress"))
    {
        if (!config.Get("bindAddress").IsString())
        {
            Napi::TypeError::New(info.Env(), "bindAddress must be a string").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.bindAddress = config.Get("bindAddress").ToString();
    }

    // Connection Timeout
    if (config.Has("connectionTimeout"))
    {
        if (!config.Get("connectionTimeout").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "connectionTimeout must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.connectionTimeout = std::chrono::milliseconds(config.Get("connectionTimeout").ToNumber().Int64Value());
    }

    // Max Message Size
    if (config.Has("maxMessageSize"))
    {
        if (!config.Get("maxMessageSize").IsNumber())
        {
            Napi::TypeError::New(info.Env(), "maxMessageSize must be a number").ThrowAsJavaScriptException();
            return;
        }
        webSocketServerConfig.maxMessageSize = config.Get("maxMessageSize").ToNumber().Int32Value();
    }

    // Create WebSocketServer with config
    try
    {
        PLOG_DEBUG << "Creating a new WebSocketServer";
        mWebSocketServerPtr = std::make_unique<rtc::WebSocketServer>(webSocketServerConfig);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while creating WebSocketServer: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }

    PLOG_DEBUG << "WebSocketServer created";
    instances.insert(this);
}

WebSocketServerWrapper::~WebSocketServerWrapper()
{
    PLOG_DEBUG << "Destructor called";
    doStop();
}

void WebSocketServerWrapper::doStop()
{
    PLOG_DEBUG << "doStop() called";
    if (mWebSocketServerPtr)
    {
        PLOG_DEBUG << "Stopping...";
        try
        {
            mWebSocketServerPtr->stop();
            mWebSocketServerPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cerr << std::string("libdatachannel error while closing WebSocketServer: ") + ex.what() << std::endl;
            return;
        }
    }

    mOnClientCallback.reset();
    instances.erase(this);
}

void WebSocketServerWrapper::stop(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "stop() called";
    doStop();
}

Napi::Value WebSocketServerWrapper::port(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "port() called";
    Napi::Env env = info.Env();

    if (!mWebSocketServerPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mWebSocketServerPtr->port());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("WebSocketServer error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

void WebSocketServerWrapper::onClient(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "onClient() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!mWebSocketServerPtr)
    {
        Napi::Error::New(env, "onClient() called on destroyed WebSocketServer").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected as onClient callback").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnClientCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mWebSocketServerPtr->onClient([&](std::shared_ptr<rtc::WebSocket> ws)
                                  {
        PLOG_DEBUG << "onClient ws received from WebSocketServer";
        if (mOnClientCallback)
            mOnClientCallback->call([this, ws](Napi::Env env, std::vector<napi_value> &args) {
                PLOG_DEBUG << "mOnClientCallback call(1)";
                // Check the WebSocketServer is not stopped
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                std::shared_ptr<rtc::WebSocket> webSocket = ws;
                // First argument is just a placeholder
                auto instance = WebSocketWrapper::constructor.New({Napi::Boolean::New(env, false), Napi::External<std::shared_ptr<rtc::WebSocket>>::New(env, &webSocket)});
                args = {instance};
                PLOG_DEBUG << "mOnClientCallback call(2)";
            });
    });
}
