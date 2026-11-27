package top.roomio.data.party

import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.RoomSession
import top.roomio.domain.party.SessionKeeper

/** Builds the platform session keeper. Android runs a foreground service. */
internal expect fun createSessionKeeper(roomRepository: RoomRepository): SessionKeeper

/** A session keeper for platforms that do not need a background service. */
internal class NoopSessionKeeper : SessionKeeper {
    override fun start(room: RoomSession) = Unit
    override fun stop() = Unit
}
