import { t } from '../i18n';
import { Mic, MicOff, Star } from 'lucide-react';
import { avatarImageById } from '../data/avatarCatalog';
import type { AvatarId, Participant } from '../types';

interface AvatarProps {
  avatarId: AvatarId;
  label: string;
  size?: 'small' | 'medium' | 'large';
  selected?: boolean;
  speaking?: boolean;
}

export function Avatar({
  avatarId,
  label,
  size = 'medium',
  selected = false,
  speaking = false,
}: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${avatarId} avatar--${size} ${selected ? 'is-selected' : ''} ${speaking ? 'is-speaking' : ''}`}
      role="img"
      aria-label={speaking ? t('{name}, speaking', { name: label }) : label}
    >
      <img
        className="avatar__image"
        src={avatarImageById[avatarId]}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
      />
    </span>
  );
}

export function ParticipantItem({ participant, voiceConnection }: { participant: Participant; voiceConnection?: 'connected' | 'reconnecting' | 'unavailable' }) {
  return (
    <div className={`participant ${participant.isSpeaking ? 'is-speaking' : ''}`}>
      <div className="participant__avatar-wrap">
        <Avatar
          avatarId={participant.avatarId}
          label={participant.name}
          speaking={participant.isSpeaking}
        />
        <span className="participant__voice-state" aria-hidden="true">
          {participant.isMuted ? <MicOff size={12} /> : <Mic size={12} />}
        </span>
      </div>
      <div className="participant__copy">
        <strong>{participant.isSelf ? t("You") : participant.name}</strong>
        <span>
          {voiceConnection === 'reconnecting' ? t("Reconnecting voice") : voiceConnection === 'unavailable' ? t("Voice unavailable") : participant.present === false ? t("Away") : participant.isOwner ? (
            <>
              <Star size={12} aria-hidden="true" /> {t("Host")}</>
          ) : participant.isSpeaking ? (
            t("Speaking")
          ) : participant.isMuted ? (
            t("Muted")
          ) : (
            t("Listening")
          )}
        </span>
      </div>
    </div>
  );
}
