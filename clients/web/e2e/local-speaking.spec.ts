import { test, expect } from '@playwright/test';

test('local microphone activity works without voice peers and clears on silence, mute and leave', async ({ page }) => {
  await page.goto('/e2e/mesh.html');
  await page.evaluate(async () => {
    // Use real browser Web Audio and capture tracks. Only authenticated signaling
    // is replaced: this regression needs no remote peer or backend room.
    const scope = window as any;
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain(); gain.gain.value = 0.15;
    const output = audio.createMediaStreamDestination();
    oscillator.connect(gain).connect(output); oscillator.start(); await audio.resume();
    navigator.mediaDevices.getUserMedia = async () => output.stream;
    const { MeshVoice } = await import('/src/data/voice.ts');
    const client = new MeshVoice({ roomId: 'local', request: async () => { throw new Error('Unexpected HTTP'); }, token: async () => '',
      onState: (state: unknown) => { scope.localVoiceState = state; } });
    const internal = client as any;
    internal.open = async () => {
      internal.descriptor = { membershipId: 'self' };
      internal.socket = { connected: true, removeAllListeners() {}, disconnect() {}, timeout() { return this; }, emit(_event: string, _body: unknown, ack: Function) { ack(null, { ok: true }); } };
      internal.rosterReady = true;
      internal.state.members = { self: { muted: true, speaking: false, connection: 'connected' } };
      internal.updateStatus();
    };
    await client.join();
    scope.localVoice = client; scope.localGain = gain; scope.localAudio = audio;
  });
  const speaking = () => page.evaluate(() => (window as any).localVoiceState.members.self?.speaking);
  expect(await speaking()).toBe(false);
  await page.evaluate(() => (window as any).localVoice.setMuted(false));
  await expect.poll(speaking).toBe(true);
  await page.evaluate(() => { (window as any).localGain.gain.value = 0; });
  await expect.poll(speaking).toBe(false);
  await page.evaluate(() => { (window as any).localGain.gain.value = 0.15; });
  await expect.poll(speaking).toBe(true);
  await page.evaluate(() => (window as any).localVoice.setMuted(true));
  expect(await speaking()).toBe(false);
  await page.evaluate(async () => {
    const scope = window as any;
    const meter = scope.localVoice.localMeter;
    scope.localVoice.disconnect();
    scope.closedMeter = meter;
    await scope.localAudio.close();
  });
  await expect.poll(() => page.evaluate(() => (window as any).closedMeter.context.state)).toBe('closed');
  expect(await page.evaluate(() => (window as any).localVoiceState.status)).toBe('off');
});
