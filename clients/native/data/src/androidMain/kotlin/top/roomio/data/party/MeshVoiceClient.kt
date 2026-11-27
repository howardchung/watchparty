package top.roomio.data.party

import top.roomio.data.diagnostics.logHandledException
import top.roomio.data.diagnostics.loggedRunCatching

import android.Manifest
import android.media.AudioDeviceCallback
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Handler
import android.os.Looper
import android.content.Context
import android.content.pm.PackageManager
import co.touchlab.kermit.Logger
import dev.zacsweers.metro.AppScope
import dev.zacsweers.metro.Inject
import dev.zacsweers.metro.SingleIn
import io.ktor.client.HttpClient
import io.ktor.client.plugins.websocket.webSocketSession
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.webrtc.AudioSource
import org.webrtc.AudioTrack
import org.webrtc.DataChannel
import org.webrtc.IceCandidate
import org.webrtc.MediaConstraints
import org.webrtc.PeerConnection
import org.webrtc.PeerConnectionFactory
import org.webrtc.RtpReceiver
import org.webrtc.RTCStatsCollectorCallback
import org.webrtc.RTCStatsReport
import org.webrtc.SdpObserver
import org.webrtc.SessionDescription
import org.webrtc.SurfaceTextureHelper
import org.webrtc.VideoTrack
import org.webrtc.audio.AudioDeviceModule
import org.webrtc.audio.JavaAudioDeviceModule
import top.roomio.data.party.dto.VoiceConfigurationDto
import top.roomio.data.party.dto.VoiceConfigurationRequest
import top.roomio.data.party.dto.toDomain
import top.roomio.domain.party.PartyException
import top.roomio.domain.party.SessionRepository
import top.roomio.domain.party.VoiceClient
import top.roomio.domain.party.VoiceConfiguration
import top.roomio.domain.party.VoiceEvent
import top.roomio.domain.party.VoiceSessionState
import top.roomio.domain.party.VoicePeerStatus
import top.roomio.domain.party.VoiceSession
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

private val voiceLog = Logger.withTag("MeshVoice")

internal actual fun createVoiceClient(
    http: HttpClient,
    config: BackendConfig,
    json: Json,
    sessions: SessionRepository,
    tokens: TokenStore,
): VoiceClient = MeshVoiceClient(AppContextHolder.appContext, http, config, json, sessions, tokens)

/** Android's microphone-only, room-local peer mesh. No media service is involved. */
@SingleIn(AppScope::class)
@Inject
internal class MeshVoiceClient(
    private val context: Context,
    private val http: HttpClient,
    private val backend: BackendConfig,
    private val json: Json,
    private val sessions: SessionRepository,
    private val tokens: TokenStore,
) : VoiceClient {
    private val activeMutex = Mutex()
    private var active: MeshVoiceSession? = null

    override suspend fun connect(configuration: VoiceConfiguration): VoiceSession = activeMutex.withLock {
        active?.disconnect()
        require(configuration.mode == "MESH") { "Voice mesh is unavailable" }
        require(Regex("/[a-z0-9-]{1,64}/voice/${Regex.escape(configuration.roomId)}").matches(configuration.namespace)) {
            "Backend returned an unexpected voice namespace"
        }
        if (context.checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            voiceLog.w("voice.microphone permission_denied")
            throw PartyException("VOICE_PERMISSION_REQUIRED", "Allow microphone access to join voice")
        }
        val session = MeshVoiceSession(context.applicationContext, http, backend, json, sessions, tokens, configuration) {
            if (active === it) active = null
        }
        try {
            session.open()
            active = session
            session
        } catch (error: Throwable) {
            logHandledException("MeshVoiceClient.catch1", error)
            withContext(NonCancellable) { session.disconnect() }
            throw error
        }
    }
}

private data class VoiceMember(val membershipId: String, val generation: String, val muted: Boolean)

private class PeerState(
    val member: VoiceMember,
    var peer: PeerConnection,
    val generationFence: PeerGenerationFence,
    val pendingIce: ArrayDeque<Pair<Long, IceCandidate>> = ArrayDeque(),
    var remoteDescriptionSet: Boolean = false,
    var retries: Int = 0,
    var remoteAudioTrack: AudioTrack? = null,
    @Volatile var connected: Boolean = false,
    @Volatile var iceState: PeerConnection.IceConnectionState = PeerConnection.IceConnectionState.NEW,
    val energyDelta: AudioEnergyDelta = AudioEnergyDelta(),
) {
    val localPeerGeneration: Long get() = generationFence.localGeneration
    val remotePeerGeneration: Long? get() = generationFence.remoteGeneration
}

private class MeshVoiceSession(
    private val context: Context,
    private val http: HttpClient,
    private val backend: BackendConfig,
    private val json: Json,
    private val sessions: SessionRepository,
    private val tokens: TokenStore,
    private var descriptor: VoiceConfiguration,
    private val onReleased: (MeshVoiceSession) -> Unit,
) : VoiceSession {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val output = Channel<VoiceEvent>(capacity = 32)
    override val events: Flow<VoiceEvent> = output.receiveAsFlow()
    private val peers = linkedMapOf<String, PeerState>()
    private val linkState = MeshLinkStateMachine()
    private val memberStates = linkedMapOf<String, VoiceMember>()
    private val peerEpochs = mutableMapOf<String, Long>()
    private val activityTracker = VoiceActivityTracker()
    private val localMicrophoneMeter = LocalMicrophoneMeter(
        createCapture = ::AndroidMicrophoneCapture,
        nowMillis = android.os.SystemClock::elapsedRealtime,
        onFailure = { voiceLog.w("Local microphone activity meter unavailable; voice remains enabled") },
    )
    private val speakingLock = Any()
    private val eventMutex = Mutex()
    private val outboundMutex = Mutex()
    private val retryJobs = mutableMapOf<String, Job>()
    private var signalSequence = 0L
    private val microphoneIntent = MicrophoneIntent()
    private val muteMutex = Mutex()
    private val initialRoster = CompletableDeferred<Unit>()
    private val ready = CompletableDeferred<Unit>()
    @Volatile private var rosterReady = false
    @Volatile private var connectedAnnounced = false
    private var connection: SocketIoConnection? = null
    private var namespace: SocketIoNamespace? = null
    private var factory: PeerConnectionFactory? = null
    private var audioDevice: AudioDeviceModule? = null
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val audioRoute = VoiceAudioRoute(audioManager)
    private val routeCallback = object : AudioDeviceCallback() {
        override fun onAudioDevicesAdded(devices: Array<out AudioDeviceInfo>) = routeChanged()
        override fun onAudioDevicesRemoved(devices: Array<out AudioDeviceInfo>) = routeChanged()
    }
    private var source: AudioSource? = null
    private var track: AudioTrack? = null
    @Volatile private var microphoneEnabled = false
    @Volatile private var closed = false

    suspend fun open() {
        voiceLog.i("Opening voice signaling")
        ensureRtc()
        eventMutex.withLock { audioRoute.start() }
        audioManager.registerAudioDeviceCallback(routeCallback, Handler(Looper.getMainLooper()))
        routeChanged()
        val socket = http.webSocketSession(socketIoUrl(backend.baseUrl))
        val engine = SocketIoConnection(socket, json)
        connection = engine
        try {
            engine.awaitOpen()
            namespace = engine.connectNamespace(descriptor.namespace, descriptor.ticket, protocolVersion = 4)
            voiceLog.i("Voice signaling connected; waiting for peer audio")
        } catch (error: Throwable) {
            logHandledException("MeshVoiceClient.catch2", error)
            engine.close()
            throw error
        }
        scope.launch { receiveEvents() }
        scope.launch { refreshCredentials() }
        scope.launch { publishSpeakingLevels() }
        scope.launch { publishLocalSpeakingLevels() }
        withTimeout(MESH_CONNECT_TIMEOUT_MS) { ready.await() }
    }

    private fun ensureRtc() {
        synchronized(RTC_LOCK) {
            if (factory != null) return
            PeerConnectionFactory.initialize(
                PeerConnectionFactory.InitializationOptions.builder(context).createInitializationOptions(),
            )
            audioDevice = JavaAudioDeviceModule.builder(context)
                .setAudioFormat(android.media.AudioFormat.ENCODING_PCM_16BIT)
                .setSamplesReadyCallback { samples -> localMicrophoneMeter.onWebRtcSamples(samples.data) }
                .setAudioRecordErrorCallback(object : JavaAudioDeviceModule.AudioRecordErrorCallback {
                    override fun onWebRtcAudioRecordInitError(message: String) = audioFailure(true)
                    override fun onWebRtcAudioRecordStartError(code: JavaAudioDeviceModule.AudioRecordStartErrorCode, message: String) = audioFailure(true)
                    override fun onWebRtcAudioRecordError(message: String) = audioFailure(true)
                })
                .setAudioTrackErrorCallback(object : JavaAudioDeviceModule.AudioTrackErrorCallback {
                    override fun onWebRtcAudioTrackInitError(message: String) = audioFailure(false)
                    override fun onWebRtcAudioTrackStartError(code: JavaAudioDeviceModule.AudioTrackStartErrorCode, message: String) = audioFailure(false)
                    override fun onWebRtcAudioTrackError(message: String) = audioFailure(false)
                }).createAudioDeviceModule()
            (audioDevice as? JavaAudioDeviceModule)?.setSpeakerMute(false)
            (audioDevice as? JavaAudioDeviceModule)?.setMicrophoneMute(true)
            factory = PeerConnectionFactory.builder().setAudioDeviceModule(audioDevice).createPeerConnectionFactory()
            source = factory!!.createAudioSource(MediaConstraints())
            track = factory!!.createAudioTrack("watchparty-microphone", source).apply { setEnabled(false) }
        }
    }

    private fun routeChanged() {
        scope.launch { eventMutex.withLock {
            if (closed) return@withLock
            // Let Android pair the microphone with the selected communication output.
            (audioDevice as? JavaAudioDeviceModule)?.setPreferredInputDevice(null)
            loggedRunCatching("MeshVoiceClient.run12") { audioRoute.update() }
                .onFailure { voiceLog.w("Voice output route update failed", it) }
        } }
    }

    private fun audioFailure(capture: Boolean) {
        if (closed) return
        if (capture) setMicrophoneEnabled(false)
        output.trySend(VoiceEvent.AudioDeviceFailure(capture))
        voiceLog.w("Voice audio-device failure capture=$capture")
    }

    private suspend fun receiveEvents() {
        var reconnectAttempt = 0
        while (scope.isActive && !closed) {
            val ns = namespace ?: run { delay(RECONNECT_BASE_MS); continue }
            try {
                for (event in ns.events) {
                    when (event.name) {
                        "voice.roster" -> applyRoster(event.payload)
                        "signal" -> eventMutex.withLock { receiveSignal(event.payload) }
                        "error" -> {
                            val code = event.payload.jsonObject["code"]?.jsonPrimitive?.contentOrNull
                            if (code != null && code in PERMANENT_VOICE_ERRORS)
                                throw PartyException(code, "Voice session ended")
                        }
                    }
                }
                if (closed) break
                throw PartyException("VOICE_DISCONNECTED", "Voice signaling disconnected")
            } catch (cancel: CancellationException) {
                logHandledException("MeshVoiceClient.catch3", cancel)
                throw cancel
            } catch (error: Throwable) {
                logHandledException("MeshVoiceClient.catch4", error)
                if (closed) break
                val partyError = error as? PartyException
                if (partyError?.code?.let { it in PERMANENT_VOICE_ERRORS } == true) {
                    fail("Voice session ended")
                    break
                }
                eventMutex.withLock { markMeshDisconnected() }
                try {
                    reconnectSignaling(reconnectAttempt++)
                } catch (cancel: CancellationException) {
                    logHandledException("MeshVoiceClient.catch5", cancel)
                    throw cancel
                } catch (reconnectError: Throwable) {
                    logHandledException("MeshVoiceClient.catch6", reconnectError)
                    val reconnectPartyError = reconnectError as? PartyException
                    if (reconnectPartyError?.code?.let { it in PERMANENT_VOICE_ERRORS } == true) {
                        fail("Voice session ended")
                        break
                    }
                }
            }
        }
    }

    private suspend fun reconnectSignaling(attempt: Int) {
        val backoff = (RECONNECT_BASE_MS * (1L shl attempt.coerceAtMost(6))).coerceAtMost(RECONNECT_MAX_MS)
        delay(backoff)
        sessions.refresh()
        val dto = try {
            http.post("${backend.baseUrl}/v1/rooms/${descriptor.roomId}/voice/config") {
                contentType(ContentType.Application.Json)
                setBody(VoiceConfigurationRequest(descriptor.voiceSessionId, "resume"))
            }.bodyOrThrow<VoiceConfigurationDto>()
        } catch (error: PartyException) {
            logHandledException("MeshVoiceClient.catch7", error)
            if (error.code != "VOICE_SESSION_EXPIRED") throw error
            http.post("${backend.baseUrl}/v1/rooms/${descriptor.roomId}/voice/config").bodyOrThrow<VoiceConfigurationDto>()
        }
        eventMutex.withLock {
            if (dto.voiceSessionId != descriptor.voiceSessionId) {
                peers.keys.toList().forEach(::removePeer)
                peerEpochs.clear()
                microphoneIntent.request(false, ::applyCapture)
                output.trySend(VoiceEvent.MicrophoneChanged(false))
            }
            descriptor = dto.toDomain()
        }
        rosterReady = false
        val previous = connection
        val socket = http.webSocketSession(socketIoUrl(backend.baseUrl))
        val engine = SocketIoConnection(socket, json)
        try {
            engine.awaitOpen()
            val nextNamespace = engine.connectNamespace(descriptor.namespace, descriptor.ticket, protocolVersion = 4)
            connection = engine
            namespace = nextNamespace
            previous?.close()
            scope.launch {
                delay(ROSTER_TIMEOUT_MS)
                if (!closed && namespace === nextNamespace && !rosterReady) engine.close()
            }
            // Peers and microphone capture stay alive. applyRoster is the first
            // event reader for this namespace and owns all new negotiation.
        } catch (error: Throwable) {
            logHandledException("MeshVoiceClient.catch8", error)
            engine.close()
            throw error
        }
    }

    private fun markMeshDisconnected() {
        rosterReady = false
        microphoneIntent.suspendCapture(::applyCapture)
        output.trySend(VoiceEvent.MicrophoneChanged(false))
        publishStatus()
        if (connectedAnnounced) {
            connectedAnnounced = false
            output.trySend(VoiceEvent.Disconnected)
        }
    }

    private suspend fun applyRoster(payload: JsonElement) = eventMutex.withLock {
        val roster = payload.jsonObject["members"]?.jsonArray.orEmpty().mapNotNull { item ->
            val obj = item.jsonObject
            val id = obj["membershipId"]?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null
            val generation = obj["voiceSessionId"]?.jsonPrimitive?.contentOrNull ?: return@mapNotNull null
            val muted = obj["muted"]?.jsonPrimitive?.contentOrNull?.toBooleanStrictOrNull() ?: true
            VoiceMember(id, generation, muted)
        }.filter { it.membershipId != descriptor.membershipId }
        voiceLog.i("Voice roster: ${roster.size} remote participants")
        if (roster.size > MAX_REMOTE_PEERS) {
            throw PartyException("VOICE_CAPACITY_EXCEEDED", "This voice room has too many participants")
        }
        val authoritative = roster.associateBy { it.membershipId }
        peers.keys.toList().filter { it !in authoritative }.forEach { id ->
            removePeer(id)
            clearSpeaking(id)
        }
        memberStates.keys.toList().filter { it !in authoritative }.forEach(memberStates::remove)
        for (member in roster) {
            val previous = memberStates[member.membershipId]
            if (previous != null && previous.generation != member.generation) {
                removePeer(member.membershipId)
                clearSpeaking(member.membershipId)
            }
            memberStates[member.membershipId] = member
            if (member.membershipId !in peers) createPeer(member)
            peers[member.membershipId]?.remoteAudioTrack?.setEnabled(!member.muted)
            if (member.muted) clearSpeaking(member.membershipId)
        }
        val firstRoster = !rosterReady
        rosterReady = true
        initialRoster.complete(Unit)
        publishConnectedWhenMeshReady()
        // A mute ACK broadcasts another roster. Replay only after join/resume.
        if (firstRoster) scope.launch { applyMuteIntent() }
    }

    private fun createPeer(member: VoiceMember, retries: Int = 0) {
        if (peers.size >= MAX_REMOTE_PEERS) throw PartyException("VOICE_CAPACITY_EXCEEDED", "This voice room has too many participants")
        localMicrophoneMeter.setPeerCaptureRequired(true)
        val rtc = factory ?: throw PartyException("VOICE_UNAVAILABLE", "Voice is unavailable")
        val rtcConfig = rtcConfiguration()
        var state: PeerState? = null
        val peer = rtc.createPeerConnection(rtcConfig, object : PeerConnection.Observer {
            override fun onSignalingChange(state: PeerConnection.SignalingState) = Unit
            override fun onIceConnectionChange(stateValue: PeerConnection.IceConnectionState) {
                scope.launch { eventMutex.withLock {
                    val observed = state ?: return@withLock
                    if (closed || peers[member.membershipId] !== observed) return@withLock
                    voiceLog.i("voice.peer_ice state=$stateValue generation=${observed.localPeerGeneration} retries=${observed.retries}")
                    observed.iceState = stateValue
                    when (stateValue) {
                        PeerConnection.IceConnectionState.CONNECTED, PeerConnection.IceConnectionState.COMPLETED -> {
                            observed.connected = true
                            observed.retries = 0
                            linkState.connected(member.membershipId, observed.localPeerGeneration)
                            retryJobs.remove(member.membershipId)?.cancel()
                            publishConnectedWhenMeshReady()
                        }
                        PeerConnection.IceConnectionState.FAILED, PeerConnection.IceConnectionState.CLOSED -> {
                            observed.connected = false
                            linkState.disconnected(member.membershipId, observed.localPeerGeneration)
                            scheduleRetry(member.membershipId, observed, 0L)
                        }
                        PeerConnection.IceConnectionState.DISCONNECTED -> {
                            observed.connected = false
                            linkState.disconnected(member.membershipId, observed.localPeerGeneration)
                            scheduleRetry(member.membershipId, observed, DISCONNECTED_GRACE_MS)
                        }
                        else -> Unit
                    }
                    publishStatus()
                } }
            }
            override fun onStandardizedIceConnectionChange(stateValue: PeerConnection.IceConnectionState) = Unit
            override fun onConnectionChange(stateValue: PeerConnection.PeerConnectionState) = Unit
            override fun onIceConnectionReceivingChange(receiving: Boolean) = Unit
            override fun onIceGatheringChange(stateValue: PeerConnection.IceGatheringState) = Unit
            override fun onIceCandidate(candidate: IceCandidate) {
                val observed = state ?: return
                scope.launch { eventMutex.withLock {
                    if (!closed && peers[member.membershipId] === observed) {
                        deliverPeerSignal(
                            send = { sendSignal(member, ice = candidate) },
                            rejected = { error ->
                                voiceLog.w("Voice ICE acknowledgement rejected: ${(error as? PartyException)?.code ?: "TRANSPORT_ERROR"}")
                                if (!observed.connected) scheduleRetry(member.membershipId, observed, RETRY_DELAY_MS)
                            },
                        )
                    }
                } }
            }
            override fun onIceCandidatesRemoved(candidates: Array<IceCandidate>) = Unit
            override fun onAddStream(stream: org.webrtc.MediaStream) = Unit
            override fun onRemoveStream(stream: org.webrtc.MediaStream) = Unit
            override fun onDataChannel(channel: DataChannel) { channel.dispose() }
            override fun onRenegotiationNeeded() = Unit
            override fun onAddTrack(receiver: RtpReceiver, streams: Array<out org.webrtc.MediaStream>) = Unit
            override fun onTrack(transceiver: org.webrtc.RtpTransceiver) {
                val remoteTrack = transceiver.receiver.track()
                if (remoteTrack is VideoTrack) remoteTrack.setEnabled(false)
                if (remoteTrack is AudioTrack) {
                    scope.launch { eventMutex.withLock {
                        val observed = state ?: return@withLock
                        if (closed || peers[member.membershipId] !== observed) return@withLock
                        observed.remoteAudioTrack = remoteTrack
                        remoteTrack.setEnabled(!(memberStates[member.membershipId]?.muted ?: true))
                    } }
                }
            }
            override fun onRemoveTrack(receiver: RtpReceiver) = Unit
        }) ?: throw PartyException("VOICE_PEER_FAILED", "Could not create a voice connection")
        val audioTrack = track ?: throw PartyException("VOICE_AUDIO_UNAVAILABLE", "Microphone audio is unavailable")
        val sender = peer.addTrack(audioTrack, listOf("watchparty-audio"))
        if (sender == null) {
            peer.close(); peer.dispose()
            throw PartyException("VOICE_PEER_FAILED", "Could not add microphone audio to the voice connection")
        }
        val epoch = (peerEpochs[member.membershipId] ?: 0L) + 1L
        peerEpochs[member.membershipId] = epoch
        val peerState = PeerState(member, peer, PeerGenerationFence(epoch), retries = retries)
        state = peerState
        peers[member.membershipId] = peerState
        linkState.opened(member.membershipId, member.generation, epoch, retries)
        if (descriptor.membershipId < member.membershipId) scope.launch { eventMutex.withLock {
            if (!closed && peers[member.membershipId] === peerState) negotiateOffer(member.membershipId)
        } }
        scheduleRetry(member.membershipId, peerState, 10_000L)
    }

    private fun rtcConfiguration(): PeerConnection.RTCConfiguration {
        val servers = descriptor.iceServers.flatMap { server ->
            server.urls.map { url ->
                val builder = PeerConnection.IceServer.builder(url)
                server.username?.let(builder::setUsername)
                server.credential?.let(builder::setPassword)
                builder.createIceServer()
            }
        }
        return PeerConnection.RTCConfiguration(servers).apply {
            sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN
            continualGatheringPolicy = PeerConnection.ContinualGatheringPolicy.GATHER_CONTINUALLY
        }
    }

    private suspend fun negotiateOffer(id: String) {
        val state = peers[id] ?: return
        try {
            val offer = state.peer.createDescription(isOffer = true)
            state.peer.setDescription(local = true, offer)
            sendSignal(state.member, sdp = offer)
        } catch (error: Throwable) {
            logHandledException("MeshVoiceClient.catch9", error)
            if (error is CancellationException) throw error
            peers[id]?.let { scheduleRetry(id, it, RETRY_DELAY_MS) }
        }
    }

    private suspend fun receiveSignal(payload: JsonElement) {
        val envelope = payload.jsonObject
        val from = envelope["from"]?.jsonPrimitive?.contentOrNull ?: return
        val message = envelope["msg"]?.jsonPrimitive?.contentOrNull ?: return
        if (message.length > MAX_SIGNAL_CHARS) return
        val parsed = loggedRunCatching("MeshVoiceClient.run13") { json.parseToJsonElement(message).jsonObject }.getOrNull() ?: return
        var state = peers[from] ?: return
        val senderGeneration = parsed["generation"]?.jsonPrimitive?.contentOrNull ?: return
        val targetGeneration = parsed["targetGeneration"]?.jsonPrimitive?.contentOrNull ?: return
        if (senderGeneration != state.member.generation || targetGeneration != descriptor.voiceSessionId) return
        val peerGeneration = parsed["peerGeneration"]?.jsonPrimitive?.contentOrNull?.toLongOrNull()
            ?.takeIf { it > 0L } ?: return
        val targetPeerGeneration = parsed["targetPeerGeneration"]?.jsonPrimitive?.contentOrNull?.toLongOrNull()
            ?.takeIf { it >= 0L } ?: return
        val sdpObject = parsed["sdp"] as? JsonObject
        if (sdpObject != null) {
            val type = sdpObject["type"]?.jsonPrimitive?.contentOrNull ?: return
            val sdp = sdpObject["sdp"]?.jsonPrimitive?.contentOrNull ?: return
            if (sdp.length > MAX_SIGNAL_CHARS || sdp.contains("m=video")) return
            val sessionType = when (type.lowercase()) {
                "offer" -> SessionDescription.Type.OFFER
                "answer" -> SessionDescription.Type.ANSWER
                else -> return
            }
            val description = SessionDescription(sessionType, sdp)
            if (description.type == SessionDescription.Type.OFFER) {
                if (descriptor.membershipId < from) return
                if (!state.generationFence.acceptRemoteOffer(peerGeneration, targetPeerGeneration) {
                    val old = state
                    retryJobs.remove(from)?.cancel()
                    peers.remove(from)
                    old.peer.close()
                    old.peer.dispose()
                    createPeer(old.member, retries = 0)
                    state = peers.getValue(from)
                    state.generationFence
                }) return
                state.remoteDescriptionSet = false
                state.pendingIce.removeAll { it.first != peerGeneration }
            } else {
                if (!state.generationFence.acceptAnswer(peerGeneration, targetPeerGeneration)) return
            }
            state.peer.setDescription(local = false, description)
            state.remoteDescriptionSet = true
            val candidates = state.pendingIce.filter { it.first == state.remotePeerGeneration }
            state.pendingIce.clear()
            candidates.forEach { (_, candidate) -> state.peer.addIceCandidate(candidate) }
            if (description.type == SessionDescription.Type.OFFER) {
                val answer = state.peer.createDescription(isOffer = false)
                state.peer.setDescription(local = true, answer)
                sendSignal(state.member, sdp = answer)
            }
        } else {
            val ice = parsed["ice"] as? JsonObject
            if (ice != null) {
                val candidate = ice["candidate"]?.jsonPrimitive?.contentOrNull ?: return
                val mid = ice["sdpMid"]?.jsonPrimitive?.contentOrNull
                val line = ice["sdpMLineIndex"]?.jsonPrimitive?.contentOrNull?.toIntOrNull() ?: 0
                if (candidate.length > 4_096) return
                if (!state.generationFence.acceptCandidate(peerGeneration, targetPeerGeneration)) return
                val value = IceCandidate(mid, line, candidate)
                if (state.remoteDescriptionSet && state.remotePeerGeneration == peerGeneration) state.peer.addIceCandidate(value)
                else if (state.pendingIce.size < MAX_PENDING_ICE) state.pendingIce.addLast(peerGeneration to value)
            } else if (parsed["requestOffer"]?.jsonPrimitive?.contentOrNull == "true") {
                if (descriptor.membershipId >= from ||
                    !linkState.acceptOfferRequest(from, state.member.generation, peerGeneration,
                        targetPeerGeneration, state.remotePeerGeneration)) return
                replaceFailedPeer(from, state, remoteReplaced = true)
            } else if (parsed["restart"]?.jsonPrimitive?.contentOrNull == "true") {
                if (!state.generationFence.acceptRestart(peerGeneration, targetPeerGeneration)) return
                retryPeer(from, notifyRemote = false)
            }
        }
    }

    private suspend fun sendSignal(
        member: VoiceMember,
        sdp: SessionDescription? = null,
        ice: IceCandidate? = null,
        restart: Boolean = false,
        requestOffer: Boolean = false,
    ) {
        val state = peers[member.membershipId] ?: return
        val targetPeerGeneration = when {
            restart -> state.remotePeerGeneration ?: return
            sdp?.type == SessionDescription.Type.OFFER -> 0L
            else -> state.remotePeerGeneration ?: 0L
        }
        val message = buildJsonObject {
            put("negotiationId", JsonPrimitive("android-${++signalSequence}"))
            put("generation", JsonPrimitive(descriptor.voiceSessionId))
            put("targetGeneration", JsonPrimitive(member.generation))
            put("peerGeneration", JsonPrimitive(state.localPeerGeneration))
            put("targetPeerGeneration", JsonPrimitive(targetPeerGeneration))
            if (sdp != null) put("sdp", buildJsonObject {
                put("type", JsonPrimitive(sdp.type.canonicalForm()))
                put("sdp", JsonPrimitive(sdp.description))
            })
            if (ice != null) put("ice", buildJsonObject {
                put("candidate", JsonPrimitive(ice.sdp))
                put("sdpMid", ice.sdpMid?.let(::JsonPrimitive) ?: JsonNull)
                put("sdpMLineIndex", JsonPrimitive(ice.sdpMLineIndex))
            })
            if (restart) put("restart", JsonPrimitive(true))
            if (requestOffer) put("requestOffer", JsonPrimitive(true))
        }
        val encoded = json.encodeToString(JsonObject.serializer(), message)
        if (encoded.length > MAX_SIGNAL_CHARS) return
        val payload = buildJsonObject {
            put("to", JsonPrimitive(member.membershipId))
            put("msg", JsonPrimitive(encoded))
        }
        acknowledged("signal", payload)
    }

    private fun scheduleRetry(id: String, observed: PeerState, waitMs: Long) {
        if (retryJobs[id]?.isActive == true || observed.connected) return
        retryJobs[id] = scope.launch {
            delay(waitMs + kotlin.random.Random.nextLong(50L, 250L))
            eventMutex.withLock {
                retryJobs.remove(id)
                if (!closed && peers[id] === observed && !observed.connected) retryPeer(id, true)
            }
        }
    }

    private suspend fun retryPeer(id: String, notifyRemote: Boolean) {
        val state = peers[id] ?: return
        linkState.disconnected(id, state.localPeerGeneration)
        val nextAttempt = linkState.retry(id, state.localPeerGeneration) ?: run { publishStatus(); return }
        val member = memberStates[id] ?: return
        if (notifyRemote) loggedRunCatching("MeshVoiceClient.run14") { sendSignal(member, restart = true) }
        retryJobs.remove(id)?.cancel()
        peers.remove(id)
        state.peer.close(); state.peer.dispose()
        createPeer(member, retries = nextAttempt)
        publishStatus()
    }

    override fun retryFailedConnections() {
        scope.launch { eventMutex.withLock {
            peers.values.filter { !it.connected }.toList().forEach { observed ->
                val id = observed.member.membershipId
                if (!rosterReady || closed) return@forEach
                // Fresh requester epochs fence repeated manual retries even if
                // the initial negotiation never learned its offerer's epoch.
                replaceFailedPeer(id, observed)
                if (descriptor.membershipId > id) loggedRunCatching("MeshVoiceClient.run15") {
                    sendSignal(observed.member, requestOffer = true)
                }.onFailure { voiceLog.w("Voice offer request rejected") }
            }
        } }
    }

    private fun replaceFailedPeer(id: String, observed: PeerState, remoteReplaced: Boolean = false) {
        if (observed.connected && !remoteReplaced || peers[id] !== observed) return
        retryJobs.remove(id)?.cancel()
        peers.remove(id)
        observed.peer.close()
        observed.peer.dispose()
        createPeer(observed.member, retries = 0)
        publishStatus()
    }

    private fun removePeer(id: String) {
        retryJobs.remove(id)?.cancel()
        linkState.remove(id)
        peers.remove(id)?.let { state ->
            state.peer.close()
            state.peer.dispose()
            state.pendingIce.clear()
        }
        if (peers.isEmpty()) localMicrophoneMeter.setPeerCaptureRequired(false)
    }

    private fun applyCapture(enabled: Boolean) {
        microphoneEnabled = enabled
        localMicrophoneMeter.setEnabled(enabled)
        if (!enabled) clearSpeaking(descriptor.membershipId)
        (audioDevice as? JavaAudioDeviceModule)?.setMicrophoneMute(!enabled)
        track?.setEnabled(enabled)
    }

    override fun setMicrophoneEnabled(enabled: Boolean) {
        voiceLog.i("voice.microphone requested enabled=$enabled")
        microphoneIntent.request(enabled, ::applyCapture)
        scope.launch { applyMuteIntent() }
    }

    private suspend fun applyMuteIntent() = muteMutex.withLock {
        val request = microphoneIntent.latest()
        val wanted = request.enabled
        if (closed || !rosterReady) {
            microphoneIntent.suspendCapture(::applyCapture)
            output.trySend(VoiceEvent.MicrophoneChanged(false))
            return@withLock
        }
        try {
            val muteNamespace = namespace
            acknowledged("voice.mute", buildJsonObject { put("muted", JsonPrimitive(!wanted)) })
            // A delayed unmute cannot override a newer mute command.
            microphoneIntent.authorized(request, !closed && rosterReady && namespace === muteNamespace && muteNamespace?.isConnected == true) { capture ->
                voiceLog.i("voice.microphone authorized enabled=$capture")
                applyCapture(capture)
                output.trySend(VoiceEvent.MicrophoneChanged(capture))
            }
        } catch (error: Throwable) {
            logHandledException("MeshVoiceClient.catch10", error)
            if (error is CancellationException) throw error
            microphoneEnabled = false
            microphoneIntent.suspendCapture(::applyCapture)
            output.trySend(VoiceEvent.MicrophoneChanged(false))
            voiceLog.w("Voice mute acknowledgement rejected")
        }
    }

    private suspend fun acknowledged(name: String, payload: JsonElement): JsonElement = outboundMutex.withLock {
        var lastError: Throwable? = null
        repeat(3) { attempt ->
            if (closed) throw PartyException("VOICE_DISCONNECTED", "Voice is off")
            delay(75L) // Below the shared member signal/mute rate budget, including seven peers.
            try {
                val liveNamespace = namespace?.takeIf { it.isConnected }
                    ?: throw PartyException("VOICE_DISCONNECTED", "Voice signaling unavailable")
                val response = liveNamespace.emit(name, payload)
                validateVoiceAcknowledgement(name, response)
                if (closed || namespace !== liveNamespace || !liveNamespace.isConnected)
                    throw PartyException("VOICE_DISCONNECTED", "Voice signaling was replaced or closed")
                return@withLock response
            } catch (error: Throwable) {
                logHandledException("MeshVoiceClient.catch11", error)
                // ACK timeout cancels only the request child, not the session owner.
                kotlinx.coroutines.currentCoroutineContext().ensureActive()
                lastError = error
                if (error is PartyException && error.code !in setOf("RATE_LIMITED", "VOICE_RATE_LIMITED")) throw error
                delay(250L * (attempt + 1))
            }
        }
        throw lastError ?: PartyException("VOICE_SIGNAL_FAILED", "Voice request failed")
    }

    private suspend fun refreshCredentials() = refreshVoiceCredentials({ scope.isActive && !closed }) {
                val expected = eventMutex.withLock { if (closed) null else descriptor }
                    ?: return@refreshVoiceCredentials
                sessions.refresh()
                val credentials = tokens.credentials() ?: throw PartyException("SESSION_EXPIRED", "Voice session expired")
                acknowledged("auth.refresh", buildJsonObject {
                    put("accessToken", JsonPrimitive(credentials.accessToken))
                })
                if (eventMutex.withLock { closed || descriptor !== expected }) return@refreshVoiceCredentials
                val dto = http.post("${backend.baseUrl}/v1/rooms/${expected.roomId}/voice/config") {
                    contentType(ContentType.Application.Json)
                    setBody(VoiceConfigurationRequest(expected.voiceSessionId, "refresh"))
                }.bodyOrThrow<VoiceConfigurationDto>()
                val incoming = dto.toDomain()
                val replaced = eventMutex.withLock {
                    when (voiceRefreshDisposition(expected, descriptor, incoming, closed)) {
                        VoiceRefreshDisposition.STALE -> false
                        VoiceRefreshDisposition.REPLACED -> {
                            // Fence pending reconnect work before releasing the
                            // owner; teardown itself must run outside this mutex.
                            scope.cancel()
                            true
                        }
                        VoiceRefreshDisposition.APPLY -> {
                            descriptor = incoming
                            // Existing audio stays available; the next ICE restart
                            // uses these refreshed credentials.
                            peers.values.forEach { peer ->
                                if (!peer.peer.setConfiguration(rtcConfiguration()))
                                    voiceLog.w("refreshed ICE server settings could not be applied to an active peer")
                            }
                            false
                        }
                    }
                }
                if (replaced) fail("Voice session was replaced")
    }

    private fun publishConnectedWhenMeshReady() {
        if (closed || !initialRoster.isCompleted || !rosterReady) return
        if (!connectedAnnounced) {
            connectedAnnounced = true
            ready.complete(Unit)
            output.trySend(VoiceEvent.Connected)
        }
        publishStatus()
    }

    private fun publishStatus() {
        val links = linkState.snapshot()
        val status = when {
            closed -> VoiceSessionState.OFF
            !rosterReady -> VoiceSessionState.RECONNECTING
            links.values.any { it != VoicePeerStatus.CONNECTED } -> VoiceSessionState.DEGRADED
            else -> VoiceSessionState.CONNECTED
        }
        output.trySend(VoiceEvent.StatusChanged(status, links))
    }

    private suspend fun publishSpeakingLevels() {
        var samples = 0
        while (scope.isActive && !closed) {
            delay(SPEAKING_POLL_MS)
            eventMutex.withLock {
            if (closed) return
            samples++
            val observed = mutableMapOf<String, Boolean>()
            for ((membershipId, state) in peers.toMap()) {
                if (!state.connected) continue
                val levels = withTimeoutOrNull(STATS_CALLBACK_TIMEOUT_MS) { state.peer.readAudioLevels(state.energyDelta) }
                    ?: AudioLevels()
                if (samples % 100 == 0) voiceLog.i("Voice RTP received=${levels.received} lost=${levels.lost} sent=${levels.sent} candidate=${levels.candidateType}")
                observed[membershipId] = levels.remote >= SPEAKING_LEVEL_THRESHOLD
            }
            val ids = synchronized(speakingLock) {
                (observed.keys + activityTracker.speakers()).filter { it != descriptor.membershipId }.toSet()
            }
            ids.forEach { updateSpeaking(it, observed[it] == true) }
            }
        }
    }

    private suspend fun publishLocalSpeakingLevels() {
        while (scope.isActive && !closed) {
            delay(SPEAKING_POLL_MS)
            val level = localMicrophoneMeter.poll()
            if (!closed) updateSpeaking(descriptor.membershipId, level >= SPEAKING_LEVEL_THRESHOLD)
        }
    }

    private fun updateSpeaking(membershipId: String, aboveThreshold: Boolean) = synchronized(speakingLock) {
        val changed = if (membershipId == descriptor.membershipId && (!microphoneEnabled || closed)) {
            activityTracker.clear(membershipId)
        } else activityTracker.sample(membershipId, aboveThreshold, nowMs())
        if (changed)
            output.trySend(VoiceEvent.SpeakersChanged(activityTracker.speakers()))
    }

    private fun clearSpeaking(membershipId: String) = synchronized(speakingLock) {
        if (activityTracker.clear(membershipId))
            output.trySend(VoiceEvent.SpeakersChanged(activityTracker.speakers()))
    }

    override suspend fun disconnect() = withContext(NonCancellable) {
        if (closed) return@withContext
        voiceLog.i("voice.disconnect peers=${peers.size}")
        closed = true
        microphoneIntent.request(false, ::applyCapture)
        synchronized(speakingLock) {
            if (activityTracker.clearAll()) output.trySend(VoiceEvent.SpeakersChanged(emptySet()))
        }
        scope.cancel()
        audioManager.unregisterAudioDeviceCallback(routeCallback)
        eventMutex.withLock {
            try {
                peers.keys.toList().forEach(::removePeer)
                track?.dispose(); track = null
                source?.dispose(); source = null
                factory?.dispose(); factory = null
                audioDevice?.release(); audioDevice = null
            } finally {
                audioRoute.close()
            }
        }
        withTimeoutOrNull(1_000L) { loggedRunCatching("MeshVoiceClient.run16") {
            namespace?.emit("voice.leave", buildJsonObject {})?.let { validateVoiceAcknowledgement("voice.leave", it) }
        } }
        withTimeoutOrNull(1_000L) { loggedRunCatching("MeshVoiceClient.run17") { namespace?.close() }; connection?.close() }
        output.close()
        onReleased(this@MeshVoiceSession)
    }

    private suspend fun fail(reason: String) {
        if (closed) return
        ready.completeExceptionally(PartyException("VOICE_CONNECTION_FAILED", reason))
        output.trySend(VoiceEvent.Failed(reason))
        disconnect()
    }

    private suspend fun PeerConnection.createDescription(isOffer: Boolean): SessionDescription =
        suspendCancellableCoroutine { continuation ->
            val observer = object : SdpObserver {
                override fun onCreateSuccess(description: SessionDescription) {
                    if (continuation.isActive) continuation.resume(description)
                }
                override fun onSetSuccess() = Unit
                override fun onCreateFailure(error: String) {
                    if (continuation.isActive) continuation.resumeWithException(IllegalStateException("SDP creation failed"))
                }
                override fun onSetFailure(error: String) = Unit
            }
            if (isOffer) createOffer(observer, MediaConstraints()) else createAnswer(observer, MediaConstraints())
        }

    private suspend fun PeerConnection.setDescription(local: Boolean, description: SessionDescription) =
        suspendCancellableCoroutine { continuation ->
            val observer = object : SdpObserver {
                override fun onCreateSuccess(description: SessionDescription) = Unit
                override fun onSetSuccess() { if (continuation.isActive) continuation.resume(Unit) }
                override fun onCreateFailure(error: String) = Unit
                override fun onSetFailure(error: String) {
                    if (continuation.isActive) continuation.resumeWithException(IllegalStateException("SDP setup failed"))
                }
            }
            if (local) setLocalDescription(observer, description) else setRemoteDescription(observer, description)
        }

    private companion object {
        const val MAX_REMOTE_PEERS = 7
        const val MAX_PENDING_ICE = 64
        const val MAX_SIGNAL_CHARS = 64 * 1024
        const val MAX_PEER_RETRIES = 3
        const val RETRY_DELAY_MS = 750L
        const val MESH_CONNECT_TIMEOUT_MS = 30_000L
        const val SPEAKING_POLL_MS = 100L
        const val SPEAKING_LEVEL_THRESHOLD = 0.02
        const val STATS_CALLBACK_TIMEOUT_MS = 1_000L
        const val DISCONNECTED_GRACE_MS = 3_000L
        const val RECONNECT_BASE_MS = 500L
        const val RECONNECT_MAX_MS = 30_000L
        const val ROSTER_TIMEOUT_MS = 10_000L
        val PERMANENT_VOICE_ERRORS = setOf(
            "SESSION_REVOKED", "INVALID_TOKEN", "ROOM_ENDED", "NOT_A_MEMBER", "IDENTITY_NOT_FOUND", "VOICE_DISABLED",
        "VOICE_PEER_FAILED", "VOICE_AUDIO_UNAVAILABLE", "VOICE_CAPACITY_EXCEEDED",
        )
        val RTC_LOCK = Any()
    }
}

private data class AudioLevels(
    val local: Double = 0.0, val remote: Double = 0.0,
    val received: Long = 0, val lost: Long = 0, val sent: Long = 0, val candidateType: String = "unknown",
)

private fun nowMs(): Long = kotlin.time.Clock.System.now().toEpochMilliseconds()

private suspend fun PeerConnection.readAudioLevels(energyDelta: AudioEnergyDelta): AudioLevels = suspendCancellableCoroutine { continuation ->
    getStats(RTCStatsCollectorCallback { report: RTCStatsReport ->
        if (!continuation.isActive) return@RTCStatsCollectorCallback
        var localLevel = 0.0
        var remoteLevel = 0.0
        report.statsMap.values.forEach { stat ->
            if (stat.type != "inbound-rtp" && stat.type != "media-source") return@forEach
            val members = stat.members
            val level = energyDelta.level(
                statId = stat.id,
                audioLevel = (members["audioLevel"] as? Number)?.toDouble(),
                totalAudioEnergy = (members["totalAudioEnergy"] as? Number)?.toDouble(),
                totalSamplesDuration = (members["totalSamplesDuration"] as? Number)?.toDouble(),
            )
            when (stat.type) {
                "media-source" -> localLevel = maxOf(localLevel, level)
                "inbound-rtp" -> remoteLevel = maxOf(remoteLevel, level)
            }
        }
        val received = report.statsMap.values.filter { it.type == "inbound-rtp" }.sumOf { (it.members["packetsReceived"] as? Number)?.toLong() ?: 0L }
        val lost = report.statsMap.values.filter { it.type == "inbound-rtp" }.sumOf { (it.members["packetsLost"] as? Number)?.toLong() ?: 0L }
        val sent = report.statsMap.values.filter { it.type == "outbound-rtp" }.sumOf { (it.members["packetsSent"] as? Number)?.toLong() ?: 0L }
        val selectedId = report.statsMap.values.firstNotNullOfOrNull { it.members["selectedCandidatePairId"] as? String }
        val localId = report.statsMap[selectedId]?.members?.get("localCandidateId") as? String
        val candidate = report.statsMap[localId]?.members?.get("candidateType") as? String ?: "unknown"
        continuation.resume(AudioLevels(localLevel, remoteLevel, received, lost, sent, candidate))
    })
}

private fun socketIoUrl(baseUrl: String): String = when {
    baseUrl.startsWith("https://") -> "wss://${baseUrl.removePrefix("https://").trimEnd('/')}/socket.io/?EIO=4&transport=websocket"
    baseUrl.startsWith("http://") -> "ws://${baseUrl.removePrefix("http://").trimEnd('/')}/socket.io/?EIO=4&transport=websocket"
    else -> throw IllegalArgumentException("Backend URL must use HTTP or HTTPS")
}
