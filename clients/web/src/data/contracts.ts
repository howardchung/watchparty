import type { AvatarId, Identity, Party, PartyPreview } from '../types';
import { avatarOptions, avatarName } from './avatarCatalog';

export interface IdentityDto { id: string; name: string; avatar: string; language: string }
export interface RoomDto { id: string; code: string; title: string; ownerIdentityId: string; endedAt?: string }
export interface MemberDto { membershipId: string; identityId: string; displayName: string; avatar: string; isOwner: boolean; present: boolean }
export interface StreamDto { sessionId: string; revision: number; state: 'EMPTY' | 'ACTIVE' | 'ABORTED'; url: string; sourceKind?: 'URL'|'LOCAL_FILE'; fileName?: string }
export interface ChatMessage { id: string; roomId: string; identityId: string; membershipId: string; displayName: string; avatar: string; text: string; createdAt: string; sequence: number }
export interface ChatPage { messages: ChatMessage[]; hasMore: boolean }
export interface Snapshot { chat?: ChatPage; ownerName?: string; room: RoomDto; members: MemberDto[]; stream: StreamDto; sequence: number }
export interface Admission { room: RoomDto; membership: { id: string; identityId: string; isOwner: boolean } }
export interface PreviewDto { code: string; title: string; ownerName: string; ownerPresent: boolean; participantCount: number; availability: 'OPEN' | 'FULL' | 'ENDED'; streamState: string }
export interface RoomEvent { topic: string; eventId: string; sequence: number; payload: { message?: ChatMessage; member?: MemberDto; present?: boolean; ownerName?: string; streamSessionId?: string; revision?: number; url?: string; sourceKind?: 'URL'|'LOCAL_FILE'; fileName?:string } }
export interface SyncResult { requestId: string; status: 'APPLIED' | 'UNAVAILABLE'; targetPositionMs: number; serverTimeMs?: number; playing?: boolean }

export const avatarId = (value: string): AvatarId => avatarOptions.some(a => a.id === value.toLowerCase()) ? value.toLowerCase() as AvatarId : 'comet';
export const identityModel = (value: IdentityDto): Identity => ({ name: value.name, avatarId: avatarId(value.avatar), language: value.language === 'fa' ? 'فارسی' : 'English' });
export const profileBody = (value: Identity) => ({ name: avatarName(value.avatarId, value.language), avatar: value.avatarId, language: value.language === 'فارسی' ? 'fa' : 'en' });
export const previewModel = (value: PreviewDto): PartyPreview => ({ id: value.code, title: value.title, ownerName: value.ownerName, ownerPresent: value.ownerPresent, participantCount: value.participantCount, availability: value.availability === 'OPEN' ? 'available' : value.availability === 'FULL' ? 'full' : 'ended', streamStatus: value.streamState === 'ACTIVE' ? 'playing' : 'waiting' });
export function partyModel(value: Snapshot, identityId: string): Party {
  const owner = value.members.find(m => m.isOwner);
  return { id: value.room.id, code: value.room.code, title: value.room.title, role: value.room.ownerIdentityId === identityId ? 'owner' : 'participant', ownerName: owner?.displayName || value.ownerName || 'Owner', ownerPresent: !!owner?.present, participants: value.members.map(m => ({ id: m.membershipId, name: m.displayName, avatarId: avatarId(m.avatar), isOwner: m.isOwner, isSelf: m.identityId === identityId, isMuted: true, present: m.present })), streamUrl: value.stream.state === 'ACTIVE' ? value.stream.url : '', streamSessionId: value.stream.sessionId };
}

// Snapshot sequence is authoritative. A gap requires recovery, never guessed state.
export function reduceEvent(snapshot: Snapshot, event: RoomEvent): Snapshot | null {
  if (event.sequence <= snapshot.sequence) return snapshot;
  if (event.sequence !== snapshot.sequence + 1) return null;
  const next = { ...snapshot, ownerName: snapshot.members.find(m => m.isOwner)?.displayName || snapshot.ownerName, sequence: event.sequence, members: [...snapshot.members] };
  const p = event.payload;
  if (event.topic === 'chat.message') {
    if (!p.message || p.message.sequence !== event.sequence || p.message.roomId !== snapshot.room.id) return null;
    const messages = [...(snapshot.chat?.messages || []).filter(m => m.id !== p.message!.id), p.message].sort((a, b) => a.sequence - b.sequence);
    next.chat = { messages: messages.slice(-500), hasMore: !!snapshot.chat?.hasMore || messages.length > 500 };
  }
  if (event.topic.startsWith('member.') && p.member) {
    next.members = next.members.filter(m => m.membershipId !== p.member!.membershipId);
    if (event.topic !== 'member.left') next.members.push(p.member);
  }
  if (p.ownerName) next.ownerName = p.ownerName;
  if (event.topic === 'owner.presence') next.members = next.members.map(m => m.isOwner ? { ...m, present: !!p.present, displayName: p.ownerName ?? m.displayName } : m);
  if (event.topic === 'stream.started' || event.topic === 'stream.aborted') {
    if (typeof p.revision === 'number' && p.revision > snapshot.stream.revision) next.stream = { sessionId: p.streamSessionId || '', revision: p.revision, state: event.topic === 'stream.started' ? 'ACTIVE' : 'ABORTED', url: p.url || '', sourceKind:p.sourceKind ?? 'URL', fileName:p.fileName ?? '' };
  }
  if (event.topic === 'room.closed') next.room = { ...next.room, endedAt: new Date().toISOString() };
  return next;
}
