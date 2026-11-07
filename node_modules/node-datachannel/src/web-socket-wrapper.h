#ifndef WEB_SOCKET_WRAPPER_H
#define WEB_SOCKET_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class WebSocketWrapper : public Napi::ObjectWrap<WebSocketWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  WebSocketWrapper(const Napi::CallbackInfo &info);
  ~WebSocketWrapper();

  // Functions
  void open(const Napi::CallbackInfo &info);
  void close(const Napi::CallbackInfo &info);
  void forceClose(const Napi::CallbackInfo &info);
  Napi::Value sendMessage(const Napi::CallbackInfo &info);
  Napi::Value sendMessageBinary(const Napi::CallbackInfo &info);
  Napi::Value isOpen(const Napi::CallbackInfo &info);
  Napi::Value bufferedAmount(const Napi::CallbackInfo &info);
  Napi::Value maxMessageSize(const Napi::CallbackInfo &info);
  void setBufferedAmountLowThreshold(const Napi::CallbackInfo &info);
  Napi::Value remoteAddress(const Napi::CallbackInfo &info);
  Napi::Value path(const Napi::CallbackInfo &info);

  // Callbacks
  void onOpen(const Napi::CallbackInfo &info);
  void onClosed(const Napi::CallbackInfo &info);
  void onError(const Napi::CallbackInfo &info);
  void onBufferedAmountLow(const Napi::CallbackInfo &info);
  void onMessage(const Napi::CallbackInfo &info);

  // Close all existing WebSockets
  static void CloseAll();

  // Reset all Callbacks for existing WebSockets
  static void CleanupAll();

private:
  static std::unordered_set<WebSocketWrapper *> instances;

  void doClose();
  void doForceClose();
  void doCleanup();

  std::shared_ptr<rtc::WebSocket> mWebSocketPtr = nullptr;

  // Callback Ptrs
  std::unique_ptr<ThreadSafeCallback> mOnOpenCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnClosedCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnErrorCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnBufferedAmountLowCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnMessageCallback = nullptr;
};

#endif // WEB_SOCKET_WRAPPER_H
