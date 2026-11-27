import { afterEach, expect, it, vi } from 'vitest';
import { SyncClock } from './groupSync';
afterEach(()=>vi.restoreAllMocks());
it('uses the fastest round trip and advances with a monotonic clock',()=>{
 const monotonic=vi.spyOn(performance,'now').mockReturnValue(100);
 const clock=new SyncClock();clock.sample(10000,60,100);
 expect(clock.now()).toBe(10020);
 clock.sample(50000,0,100);expect(clock.now()).toBe(10020);
 clock.sample(20000,90,100);expect(clock.now()).toBe(20005);
 vi.spyOn(Date,'now').mockReturnValue(99999999);monotonic.mockReturnValue(200);
 expect(clock.now()).toBe(20105);
});
