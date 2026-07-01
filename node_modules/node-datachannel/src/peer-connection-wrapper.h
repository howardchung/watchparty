#ifndef PEER_CONNECTION_WRAPPER_H
#define PEER_CONNECTION_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class PeerConnectionWrapper : public Napi::ObjectWrap<PeerConnectionWrapper>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  PeerConnectionWrapper(const Napi::CallbackInfo &info);
  ~PeerConnectionWrapper();

  // Functions
  void close(const Napi::CallbackInfo &info);
  void setLocalDescription(const Napi::CallbackInfo &info);
  void setRemoteDescription(const Napi::CallbackInfo &info);
  Napi::Value localDescription(const Napi::CallbackInfo &info);
  Napi::Value remoteDescription(const Napi::CallbackInfo &info);
  void addRemoteCandidate(const Napi::CallbackInfo &info);
  Napi::Value createDataChannel(const Napi::CallbackInfo &info);
  Napi::Value addTrack(const Napi::CallbackInfo &info);
  Napi::Value hasMedia(const Napi::CallbackInfo &info);
  Napi::Value state(const Napi::CallbackInfo &info);
  Napi::Value iceState(const Napi::CallbackInfo &info);
  Napi::Value signalingState(const Napi::CallbackInfo &info);
  Napi::Value gatheringState(const Napi::CallbackInfo &info);

  // Callbacks
  void onLocalDescription(const Napi::CallbackInfo &info);
  void onLocalCandidate(const Napi::CallbackInfo &info);
  void onStateChange(const Napi::CallbackInfo &info);
  void onIceStateChange(const Napi::CallbackInfo &info);
  void onSignalingStateChange(const Napi::CallbackInfo &info);
  void onGatheringStateChange(const Napi::CallbackInfo &info);
  void onDataChannel(const Napi::CallbackInfo &info);
  void onTrack(const Napi::CallbackInfo &info);

  // Stats
  Napi::Value bytesSent(const Napi::CallbackInfo &info);
  Napi::Value bytesReceived(const Napi::CallbackInfo &info);
  Napi::Value rtt(const Napi::CallbackInfo &info);
  Napi::Value getSelectedCandidatePair(const Napi::CallbackInfo &info);
  Napi::Value maxDataChannelId(const Napi::CallbackInfo &info);
  Napi::Value maxMessageSize(const Napi::CallbackInfo &info);

  // Close all existing Peer Connections
  static void CloseAll();

  // Reset all Callbacks for existing Peer Connections
  static void CleanupAll();

private:
  static Napi::FunctionReference constructor;
  static std::unordered_set<PeerConnectionWrapper *> instances;

  void doClose();
  void doCleanup();

  std::string mPeerName;
  std::unique_ptr<rtc::PeerConnection> mRtcPeerConnPtr = nullptr;

  // Callback Ptrs
  std::unique_ptr<ThreadSafeCallback> mOnLocalDescriptionCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnLocalCandidateCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnStateChangeCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnIceStateChangeCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnSignalingStateChangeCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnGatheringStateChangeCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnDataChannelCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnTrackCallback = nullptr;

  // Helpers
  std::string candidateTypeToString(const rtc::Candidate::Type &type);
  std::string candidateTransportTypeToString(const rtc::Candidate::TransportType &transportType);
};

#endif // PEER_CONNECTION_WRAPPER_H
