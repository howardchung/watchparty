#ifndef MEDIA_VIDEO_WRAPPER_H
#define MEDIA_VIDEO_WRAPPER_H

#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class VideoWrapper : public Napi::ObjectWrap<VideoWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  VideoWrapper(const Napi::CallbackInfo &info);
  ~VideoWrapper();

  rtc::Description::Video getVideoInstance();

  // Functions
  void addVideoCodec(const Napi::CallbackInfo &info);
  void addH264Codec(const Napi::CallbackInfo &info);
  void addVP8Codec(const Napi::CallbackInfo &info);
  void addVP9Codec(const Napi::CallbackInfo &info);

  // class Entry
  Napi::Value direction(const Napi::CallbackInfo &info);
  Napi::Value generateSdp(const Napi::CallbackInfo &info);
  Napi::Value mid(const Napi::CallbackInfo &info);
  void setDirection(const Napi::CallbackInfo &info);

  // class Media
  Napi::Value description(const Napi::CallbackInfo &info);
  void removeFormat(const Napi::CallbackInfo &info);
  void addSSRC(const Napi::CallbackInfo &info);
  void removeSSRC(const Napi::CallbackInfo &info);
  void replaceSSRC(const Napi::CallbackInfo &info);
  Napi::Value hasSSRC(const Napi::CallbackInfo &info);
  Napi::Value getSSRCs(const Napi::CallbackInfo &info);
  Napi::Value getCNameForSsrc(const Napi::CallbackInfo &info);
  void setBitrate(const Napi::CallbackInfo &info);
  Napi::Value getBitrate(const Napi::CallbackInfo &info);
  Napi::Value hasPayloadType(const Napi::CallbackInfo &info);
  void addRTXCodec(const Napi::CallbackInfo &info);
  void addRTPMap(const Napi::CallbackInfo &info);
  void parseSdpLine(const Napi::CallbackInfo &info);

  // Callbacks

private:
  static std::unordered_set<VideoWrapper *> instances;
  std::shared_ptr<rtc::Description::Video> mVideoPtr = nullptr;
};

#endif // MEDIA_VIDEO_WRAPPER_H