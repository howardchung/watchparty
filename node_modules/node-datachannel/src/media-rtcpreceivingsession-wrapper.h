#ifndef MEDIA_RTCPRECEIVINGSESSION_WRAPPER_H
#define MEDIA_RTCPRECEIVINGSESSION_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class RtcpReceivingSessionWrapper : public Napi::ObjectWrap<RtcpReceivingSessionWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  RtcpReceivingSessionWrapper(const Napi::CallbackInfo &info);
  ~RtcpReceivingSessionWrapper();
  std::shared_ptr<rtc::RtcpReceivingSession> getSessionInstance();

  // Functions

  // Callbacks

private:
  static std::unordered_set<RtcpReceivingSessionWrapper *> instances;
  std::shared_ptr<rtc::RtcpReceivingSession> mSessionPtr = nullptr;
};

#endif // MEDIA_RTCPRECEIVINGSESSION_WRAPPER_H
