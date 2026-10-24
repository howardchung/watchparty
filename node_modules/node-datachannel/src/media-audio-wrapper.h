#ifndef MEDIA_AUDIO_WRAPPER_H
#define MEDIA_AUDIO_WRAPPER_H

#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class AudioWrapper : public Napi::ObjectWrap<AudioWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  AudioWrapper(const Napi::CallbackInfo &info);
  ~AudioWrapper();

  rtc::Description::Audio getAudioInstance();

  // Functions
  void addAudioCodec(const Napi::CallbackInfo &info);
  void addOpusCodec(const Napi::CallbackInfo &info);

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
  static std::unordered_set<AudioWrapper *> instances;
  std::shared_ptr<rtc::Description::Audio> mAudioPtr = nullptr;
};

#endif // MEDIA_AUDIO_WRAPPER_H