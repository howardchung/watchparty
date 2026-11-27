export type Screen = 'home' | 'settings' | 'party-manager' | 'room-preview' | 'party';
export type PartyRole = 'owner' | 'participant';
export type JoinStatus = 'idle' | 'loading' | 'error';
export type RoomAvailability = 'available' | 'full' | 'ended';
export type RoomStreamStatus = 'playing' | 'waiting';
export type StreamStatus =
  | 'empty'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'error';

export type AvatarId =
  | 'comet'
  | 'mint'
  | 'sunny'
  | 'berry'
  | 'cloud'
  | 'ember'
  | 'nova'
  | 'orbit'
  | 'prism'
  | 'echo'
  | 'spark'
  | 'bloom';

export interface Identity {
  name: string;
  language: 'English' | 'فارسی';
  avatarId: AvatarId;
}

export interface Participant {
  id: string;
  name: string;
  avatarId: AvatarId;
  isOwner?: boolean;
  isSelf?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  present?: boolean;
}

export interface Party {
  id: string;
  code?: string;
  streamSessionId?: string;
  title: string;
  role: PartyRole;
  ownerName: string;
  ownerPresent: boolean;
  participants: Participant[];
  streamUrl: string;
}

export interface PartyPreview {
  id: string;
  title: string;
  ownerName: string;
  ownerPresent: boolean;
  participantCount: number;
  availability: RoomAvailability;
  streamStatus: RoomStreamStatus;
}

export interface PreviewState {
  screen: Screen;
  role?: PartyRole;
  joinStatus?: JoinStatus;
  streamStatus?: StreamStatus;
  roomPreview?: 'available' | 'owner-absent' | 'full' | 'ended';
  identity?: Partial<Identity>;
}
