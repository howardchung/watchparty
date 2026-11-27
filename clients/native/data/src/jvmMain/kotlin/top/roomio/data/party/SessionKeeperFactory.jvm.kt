package top.roomio.data.party

import top.roomio.domain.party.RoomRepository
import top.roomio.domain.party.SessionKeeper

internal actual fun createSessionKeeper(roomRepository: RoomRepository): SessionKeeper = NoopSessionKeeper()
