package top.roomio.data.party

internal enum class VoiceOutputKind { HEADPHONES, BLUETOOTH, SPEAKER, OTHER }

/** Preserve a selected personal output; a newly attached wired headset takes priority. */
internal fun <T> preferredVoiceOutput(
    available: List<T>,
    current: T?,
    kind: (T) -> VoiceOutputKind,
): T? = available.firstOrNull { kind(it) == VoiceOutputKind.HEADPHONES }
    ?: current?.takeIf { it in available && kind(it) == VoiceOutputKind.BLUETOOTH }
    ?: available.firstOrNull { kind(it) == VoiceOutputKind.BLUETOOTH }
    ?: available.firstOrNull { kind(it) == VoiceOutputKind.SPEAKER }
