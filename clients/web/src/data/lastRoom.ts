import { logHandledException } from './sessionLog';
import type { Party } from '../types';

const key = 'roomio-last-room';
interface SavedRoom { identityId: string; code: string; title: string }

export function readLastRoom(identityId: string): Party | null {
  try {
    const saved: SavedRoom = JSON.parse(localStorage.getItem(key) || 'null');
    if (!saved || saved.identityId !== identityId || typeof saved.code !== 'string' || !saved.code || typeof saved.title !== 'string') return null;
    return { id: '', code: saved.code, title: saved.title, role: 'participant', ownerName: '', ownerPresent: false, participants: [], streamUrl: '' };
  } catch (handledError) { logHandledException("lastRoom.readLastRoom.1", handledError);  return null; }
}

export function rememberLastRoom(identityId: string, code: string, title: string): void {
  try { localStorage.setItem(key, JSON.stringify({ identityId, code, title })); } catch (handledError) { logHandledException("lastRoom.rememberLastRoom.2", handledError);  /* Joining still works when local storage is unavailable. */ }
}

export function forgetLastRoom(identityId: string, code: string): void {
  if (readLastRoom(identityId)?.code === code) localStorage.removeItem(key);
}
