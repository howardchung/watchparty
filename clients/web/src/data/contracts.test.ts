import { describe, expect, it } from 'vitest';
import { partyModel, previewModel, reduceEvent, type Snapshot, type RoomEvent } from './contracts';
export const snapshot: Snapshot = { room: { id: 'room-id', code: 'ABCD1234', title: 'Film night', ownerIdentityId: 'host' }, members: [{ membershipId: 'host-member', identityId: 'host', displayName: 'Mira', avatar: 'mint', isOwner: true, present: true }, {membershipId: 'guest-member', identityId:'guest',displayName:'Nika',avatar:'invalid',isOwner:false,present:true}], stream: {sessionId:'session-1',revision:2,state:'ACTIVE',url:'https://example.test/video.mp4'}, sequence: 4 };
const event = (sequence: number, topic: string, payload: RoomEvent['payload']): RoomEvent => ({sequence,topic,payload,eventId:`event-${sequence}`});
describe('backend boundary', () => {
  it('separates room code and membership identity and maps unknown avatars safely', () => {
    const party = partyModel(snapshot, 'guest');
    expect(party.id).toBe('room-id'); expect(party.code).toBe('ABCD1234');
    expect(party.role).toBe('participant'); expect(party.participants[1]).toMatchObject({id:'guest-member',isSelf:true,avatarId:'comet'});
  });
  it('maps preview availability without inventing a room id', () => {
    expect(previewModel({code:'ABCD1234',title:'Film',ownerName:'Mira',ownerPresent:false,participantCount:7,availability:'FULL',streamState:'ABORTED'})).toMatchObject({id:'ABCD1234',availability:'full',streamStatus:'waiting'});
  });
  it('deduplicates old events and requires snapshot recovery for a sequence gap', () => {
    expect(reduceEvent(snapshot,event(4,'member.left',{}))).toBe(snapshot);
    expect(reduceEvent(snapshot,event(6,'member.left',{}))).toBeNull();
  });
  it('retains the owner name after explicit departure without showing them in the roster', () => {
    const next = reduceEvent(snapshot,event(5,'member.left',{member:snapshot.members[0]}))!;
    expect(partyModel(next,'guest')).toMatchObject({ownerName:'Mira',ownerPresent:false});
    expect(next.members).toHaveLength(1);
  });
  it('never regresses stream revisions or confuses stream event session fields', () => {
    const older = reduceEvent(snapshot,event(5,'stream.aborted',{revision:1,streamSessionId:'old'}))!;
    expect(older.stream).toEqual(snapshot.stream);
    expect(reduceEvent(snapshot,event(5,'stream.started',{revision:3,streamSessionId:'session-2',url:'https://example.test/next.mp4'}))!.stream).toMatchObject({sessionId:'session-2',revision:3,state:'ACTIVE'});
  });
});

it('chat events preserve playback and reject a wrong room or sequence', () => {
  const message = {id:'message',roomId:'room-id',identityId:'guest',membershipId:'guest-member',displayName:'Nika',avatar:'comet',text:'سلام 🍿',createdAt:'2026-11-12T06:00:00Z',sequence:5};
  const value = reduceEvent(snapshot,event(5,'chat.message',{message}))!;
  expect(value.chat?.messages).toEqual([message]);
  expect(value.stream).toBe(snapshot.stream);
  expect(reduceEvent(value,event(5,'chat.message',{message}))).toBe(value);
  expect(reduceEvent(snapshot,event(5,'chat.message',{message:{...message,roomId:'other'}}))).toBeNull();
  expect(reduceEvent(snapshot,event(5,'chat.message',{message:{...message,sequence:6}}))).toBeNull();
});


it('keeps people with identical names and avatars separate by membership and identity', () => {
  const sameNames = { ...snapshot, members: snapshot.members.map(m => ({ ...m, displayName: 'Frog Wizard', avatar: 'mint' })) };
  const party = partyModel(sameNames, 'guest');
  expect(party.role).toBe('participant');
  expect(party.participants.map(p => p.id)).toEqual(['host-member', 'guest-member']);
  expect(party.participants.map(p => p.isSelf)).toEqual([false, true]);
  expect(party.participants.map(p => p.isOwner)).toEqual([true, false]);
});
