#ifndef DATA_CHANNEL_WRAPPER_H
#define DATA_CHANNEL_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class DataChannelWrapper : public Napi::ObjectWrap<DataChannelWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  DataChannelWrapper(const Napi::CallbackInfo &info);
  ~DataChannelWrapper();

  // Functions
  void close(const Napi::CallbackInfo &info);
  Napi::Value getLabel(const Napi::CallbackInfo &info);
  Napi::Value getId(const Napi::CallbackInfo &info);
  Napi::Value getProtocol(const Napi::CallbackInfo &info);
  Napi::Value sendMessage(const Napi::CallbackInfo &info);
  Napi::Value sendMessageBinary(const Napi::CallbackInfo &info);
  Napi::Value isOpen(const Napi::CallbackInfo &info);
  Napi::Value bufferedAmount(const Napi::CallbackInfo &info);
  Napi::Value maxMessageSize(const Napi::CallbackInfo &info);
  void setBufferedAmountLowThreshold(const Napi::CallbackInfo &info);

  // Callbacks
  void onOpen(const Napi::CallbackInfo &info);
  void onClosed(const Napi::CallbackInfo &info);
  void onError(const Napi::CallbackInfo &info);
  void onBufferedAmountLow(const Napi::CallbackInfo &info);
  void onMessage(const Napi::CallbackInfo &info);

  // Close all existing DataChannels
  static void CloseAll();

  // Reset all Callbacks for existing DataChannels
  static void CleanupAll();

private:
  static std::unordered_set<DataChannelWrapper *> instances;

  void doClose();
  void doCleanup();

  std::string mLabel;
  std::shared_ptr<rtc::DataChannel> mDataChannelPtr = nullptr;

  // Callback Ptrs
  std::unique_ptr<ThreadSafeCallback> mOnOpenCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnClosedCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnErrorCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnBufferedAmountLowCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnMessageCallback = nullptr;
};

#endif // DATA_CHANNEL_WRAPPER_H
