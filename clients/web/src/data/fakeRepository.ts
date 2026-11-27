import { logHandledException } from './sessionLog';
import type { Identity, Party, Participant, PartyPreview } from '../types';

export const sampleVideoUrl =
  'https://media.example.org/films/aurora-station.mp4';

const delay = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration));

const makeSelf = (identity: Identity, isOwner: boolean): Participant => ({
  id: 'self',
  name: identity.name || 'Nika',
  avatarId: identity.avatarId,
  isOwner,
  isSelf: true,
  isMuted: false,
});

const regulars: Participant[] = [
  {
    id: 'mira',
    name: 'Mira',
    avatarId: 'mint',
    isOwner: true,
    isSpeaking: true,
  },
  { id: 'ellis', name: 'Ellis', avatarId: 'sunny', isMuted: true },
  { id: 'jo', name: 'Jo', avatarId: 'berry' },
];

const roomPreviews: Record<string, PartyPreview> = {
  'MOON-42': {
    id: 'MOON-42',
    title: 'Mira\'s late show',
    ownerName: 'Mira',
    ownerPresent: true,
    participantCount: 3,
    availability: 'available',
    streamStatus: 'playing',
  },
  'ORBIT-08': {
    id: 'ORBIT-08',
    title: 'Orbit double feature',
    ownerName: 'Mira',
    ownerPresent: false,
    participantCount: 2,
    availability: 'available',
    streamStatus: 'playing',
  },
  'FULL-10': {
    id: 'FULL-10',
    title: 'The packed premiere',
    ownerName: 'Sana',
    ownerPresent: true,
    participantCount: 10,
    availability: 'full',
    streamStatus: 'playing',
  },
  'ENDED-3': {
    id: 'ENDED-3',
    title: 'Sunday shorts',
    ownerName: 'Arman',
    ownerPresent: false,
    participantCount: 0,
    availability: 'ended',
    streamStatus: 'waiting',
  },
  'NOVA-27': {
    id: 'NOVA-27',
    title: 'Friday night screening',
    ownerName: 'Nika',
    ownerPresent: true,
    participantCount: 3,
    availability: 'available',
    streamStatus: 'waiting',
  },
};

export function getMockPartyPreview(code: string): PartyPreview | null {
  const preview = roomPreviews[code.trim().toUpperCase()];
  return preview ? { ...preview } : null;
}

export const fakePartyRepository = {
  async create(identity: Identity): Promise<Party> {
    await delay(720);
    return {
      id: 'NOVA-27',
      title: 'Friday night screening',
      role: 'owner',
      ownerName: identity.name || 'Nika',
      ownerPresent: true,
      participants: [
        makeSelf(identity, true),
        { id: 'ellis', name: 'Ellis', avatarId: 'sunny', isSpeaking: true },
        { id: 'jo', name: 'Jo', avatarId: 'berry', isMuted: true },
      ],
      streamUrl: '',
    };
  },

  async preview(code: string): Promise<PartyPreview> {
    await delay(620);
    const preview = getMockPartyPreview(code);
    if (!preview) throw new Error('PARTY_NOT_FOUND');
    return preview;
  },

  async join(code: string, identity: Identity): Promise<Party> {
    await delay(820);
    const normalizedCode = code.trim().toUpperCase();
    const preview = getMockPartyPreview(normalizedCode);
    if (!preview || preview.availability !== 'available') {
      throw new Error('PARTY_NOT_FOUND');
    }

    const owner = { ...regulars[0], name: preview.ownerName };
    const guests = regulars.slice(1);
    const participants = preview.ownerPresent
      ? [owner, ...guests, makeSelf(identity, false)]
      : [...guests, makeSelf(identity, false)];

    return {
      id: preview.id,
      title: preview.title,
      role: 'participant',
      ownerName: preview.ownerName,
      ownerPresent: preview.ownerPresent,
      participants,
      streamUrl: preview.streamStatus === 'playing' ? sampleVideoUrl : '',
    };
  },

  async startStream(url: string): Promise<string> {
    await delay(880);
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (handledError) {
      logHandledException("fakeRepository.fakePartyRepository.startStream.1", handledError);
      throw new Error('INVALID_URL');
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('INVALID_URL');
    }
    return parsed.toString();
  },

  async abortStream(): Promise<void> {
    await delay(520);
  },
};
