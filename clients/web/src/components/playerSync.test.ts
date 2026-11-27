import { describe, expect, it } from 'vitest';
import { readyForSync, type PlayerSyncInfo } from './playerSync';
const ready: PlayerSyncInfo = { positionMs:10000,durationMs:60000,playing:false,paused:true,seeking:false,ready:true,error:false,bufferedUntilMs:12000,seekable:true };
describe('sync preparation',()=>{
 it('requires decoded, paused and buffered video at the actual target',()=>{
  expect(readyForSync(ready,10000)).toBe(true);
  for(const patch of [{paused:false},{seeking:true},{ready:false},{error:true},{seekable:false},{positionMs:11000},{bufferedUntilMs:11999},{durationMs:Infinity}]) expect(readyForSync({...ready,...patch},10000)).toBe(false);
 });
 it('requires only the remaining movie near its end',()=>expect(readyForSync({...ready,positionMs:59000,bufferedUntilMs:60000},59000)).toBe(true));
});
