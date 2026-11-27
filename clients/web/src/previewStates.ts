import { getMockPartyPreview, sampleVideoUrl } from './data/fakeRepository';
import type { Identity, Party, PartyPreview, PreviewState } from './types';

export const defaultIdentity: Identity = {
  name: 'Ice Queen',
  language: 'English',
  avatarId: 'comet',
};

export const previewStates: Record<string, PreviewState> = {
  home: { screen: 'home' },
  'settings-empty': { screen: 'settings' }, // Fixed avatar names have no empty state.
  'settings-populated': { screen: 'settings' },
  'party-manager': { screen: 'party-manager' },
  'party-manager-loading': {
    screen: 'party-manager',
    joinStatus: 'loading',
  },
  'party-manager-error': { screen: 'party-manager', joinStatus: 'error' },
  'room-preview': { screen: 'room-preview', roomPreview: 'available' },
  'room-preview-owner-absent': {
    screen: 'room-preview',
    roomPreview: 'owner-absent',
  },
  'room-preview-full': { screen: 'room-preview', roomPreview: 'full' },
  'room-preview-ended': { screen: 'room-preview', roomPreview: 'ended' },
  'owner-empty': { screen: 'party', role: 'owner', streamStatus: 'empty' },
  'player-loading': { screen: 'party', role: 'owner', streamStatus: 'loading' },
  'player-playing': { screen: 'party', role: 'owner', streamStatus: 'playing' },
  'player-paused': { screen: 'party', role: 'owner', streamStatus: 'paused' },
  'player-buffering': {
    screen: 'party',
    role: 'owner',
    streamStatus: 'buffering',
  },
  'player-error': { screen: 'party', role: 'owner', streamStatus: 'error' },
  'participant-playing': {
    screen: 'party',
    role: 'participant',
    streamStatus: 'playing',
  },
  'participant-owner-absent': {
    screen: 'party',
    role: 'participant',
    streamStatus: 'playing',
    roomPreview: 'owner-absent',
  },
};

export function makePreviewRoom(
  variant: PreviewState['roomPreview'] = 'available',
): PartyPreview {
  const code =
    variant === 'owner-absent'
      ? 'ORBIT-08'
      : variant === 'full'
        ? 'FULL-10'
        : variant === 'ended'
          ? 'ENDED-3'
          : 'MOON-42';
  return getMockPartyPreview(code)!;
}

export function makePreviewParty(
  role: 'owner' | 'participant',
  identity: Identity,
  ownerPresent = true,
): Party {
  const self = {
    id: 'self',
    name: identity.name || 'Nika',
    avatarId: identity.avatarId,
    isSelf: true,
    isOwner: role === 'owner',
  } as const;

  if (role === 'participant') {
    return {
      id: ownerPresent ? 'MOON-42' : 'ORBIT-08',
      title: ownerPresent ? "Mira's late show" : 'Orbit double feature',
      role,
      ownerName: 'Mira',
      ownerPresent,
      streamUrl: sampleVideoUrl,
      participants: [
        ...(ownerPresent
          ? [{ id: 'mira', name: 'Mira', avatarId: 'mint' as const, isOwner: true, isSpeaking: true }]
          : []),
        { id: 'ellis', name: 'Ellis', avatarId: 'sunny', isMuted: true },
        { id: 'jo', name: 'Jo', avatarId: 'berry' },
        self,
      ],
    };
  }

  return {
    id: 'NOVA-27',
    title: 'Friday night screening',
    role,
    ownerName: identity.name || 'Nika',
    ownerPresent: true,
    streamUrl: sampleVideoUrl,
    participants: [
      self,
      { id: 'ellis', name: 'Ellis', avatarId: 'sunny', isSpeaking: true },
      { id: 'jo', name: 'Jo', avatarId: 'berry', isMuted: true },
    ],
  };
}
