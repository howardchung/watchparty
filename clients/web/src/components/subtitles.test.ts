import { describe, expect, it } from 'vitest';
import { parseTtmlTime, subtitleFileToVtt, subtitleTextToVtt } from './subtitles';

describe('local subtitle conversion', () => {
  it('converts SRT timestamps, formatting and multilingual text safely', () => {
    const result = subtitleTextToVtt('\uFEFF1\r\n00:00:01,250 --> 00:00:03,500\r\n<i>سلام دنیا</i> &amp; friends\r\n<script>alert(1)</script>\r\n\r\n2\r\n00:00:05,000 --> 00:00:06,000\r\n日本語', 'srt');
    expect(result).toContain('00:00:01.250 --> 00:00:03.500\nسلام دنیا &amp; friends\n&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result).toContain('00:00:05.000 --> 00:00:06.000\n日本語');
    expect(result).toMatch(/^WEBVTT\n\n/);
  });

  it('validates VTT and retains cue settings while removing presentation markup', () => {
    const result = subtitleTextToVtt('WEBVTT captions\nLanguage: fa\n\nNOTE\nignored\n\nintro\n00:01.000 --> 00:02.500 align:start\n<v Alice><b>Hello</b> &lt;world&gt;</v>\n\nSTYLE\n::cue { color: red; }', 'vtt');
    expect(result).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:02.500 align:start\nHello &lt;world&gt;\n');
  });

  it('rejects missing headers, invalid times, reversed cues and files without cues', () => {
    expect(() => subtitleTextToVtt('00:01.000 --> 00:02.000\nHello', 'vtt')).toThrow('valid WebVTT');
    expect(() => subtitleTextToVtt('1\n00:60:00,000 --> 01:00:01,000\nHello', 'srt')).toThrow('timing');
    expect(() => subtitleTextToVtt('1\n00:00:03,000 --> 00:00:01,000\nHello', 'srt')).toThrow('timing');
    expect(() => subtitleTextToVtt('WEBVTT\n\nNOTE no cues', 'vtt')).toThrow('No readable');
    expect(() => subtitleTextToVtt('', 'srt')).toThrow('empty');
    expect(() => subtitleTextToVtt('not subtitles', 'srt')).toThrow('missing');
  });

  it('converts ASS event column ordering, dialogue commas, escaped braces and line breaks', () => {
    const source = '[Script Info]\nTitle: Test\n[Events]\nFormat: Layer, End, Start, Style, Text\nDialogue: 0,0:00:04.25,0:00:01.00,Default,{\\i1}Hi, friend{\\i0}\\Nسلام\\hدنیا \\{literal\\}';
    expect(subtitleTextToVtt(source, 'ass')).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:04.250\nHi, friend\nسلام\u00a0دنیا {literal}\n');
  });

  it('supports Text before fixed ASS columns and ignores comments and drawings', () => {
    const source = '[Events]\nFormat: Start, Text, End\nComment: 0:00:00.00,Comment,0:00:10.00\nDialogue: 0:00:01.00,{\\p1}m 0 0 l 10 10{\\p0}Hello, world,0:00:03.00';
    expect(subtitleTextToVtt(source, 'ssa')).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello, world\n');
  });

  it('rejects malformed ASS without silently dropping broken dialogue', () => {
    expect(() => subtitleTextToVtt('[Events]\nFormat: Start, End\nDialogue: 0:00:01.00,0:00:03.00', 'ass')).toThrow('Start, End, and Text');
    expect(() => subtitleTextToVtt('[Events]\nFormat: Start, End, Text\nDialogue: bad,0:00:03.00,Hello', 'ass')).toThrow('invalid timing');
    expect(() => subtitleTextToVtt('[Events]\nFormat: Start, End, Text\nDialogue: 0:00:01.00,0:00:03.00,{\\i1Hello', 'ass')).toThrow('unfinished');
  });

  it('does not allow cue text to become a new WebVTT block', () => {
    const source = '[Events]\nFormat: Start, End, Text\nDialogue: 0:00:01.00,0:00:03.00,Hello\\N\\N00:00:00.000 --> 00:01:00.000\\N<b>literal</b>';
    const result = subtitleTextToVtt(source, 'ass');
    expect(result).toContain('Hello\n00:00:00.000 --&gt; 00:01:00.000\n&lt;b&gt;literal&lt;/b&gt;');
    expect(result.split('-->').length).toBe(2);
  });

  it('supports long durations and sorts cues into browser order', () => {
    const result = subtitleTextToVtt('1\n01:02:03,004 --> 01:02:05,006\nLater\n\n2\n00:00:01,000 --> 00:00:02,000\nEarlier', 'SRT');
    expect(result.indexOf('Earlier')).toBeLessThan(result.indexOf('Later'));
    expect(result).toContain('01:02:03.004 --> 01:02:05.006');
  });

  it('rejects unknown extensions and XML declarations with external entities', () => {
    expect(() => subtitleTextToVtt('anything', 'txt')).toThrow('Choose an SRT');
    expect(() => subtitleTextToVtt('<!DOCTYPE tt [<!ENTITY x SYSTEM "file:///private">]><tt>&x;</tt>', 'ttml')).toThrow('external entities');
  });

  it('checks file size before reading and reports read failures', async () => {
    const tooLarge = { name: 'large.srt', size: 5_000_001, text: () => { throw new Error('must not read'); } } as unknown as File;
    await expect(subtitleFileToVtt(tooLarge)).rejects.toThrow('smaller than 5 MB');
    const unreadable = { name: 'test.vtt', size: 100, text: () => Promise.reject(new Error('permission denied')) } as unknown as File;
    await expect(subtitleFileToVtt(unreadable)).rejects.toThrow('Unable to read');
    const readable = { name: 'test.SRT', size: 100, text: () => Promise.resolve('1\n00:00:01,000 --> 00:00:02,000\nHello') } as unknown as File;
    await expect(subtitleFileToVtt(readable)).resolves.toContain('00:00:01.000 --> 00:00:02.000');
  });
});

describe('TTML time expressions', () => {
  it('reads clock, subframe, frame and tick offsets', () => {
    expect(parseTtmlTime('01:02:03.125')).toBe(3723.125);
    expect(parseTtmlTime('00:00:01:12', { frameRate: 24 })).toBe(1.5);
    expect(parseTtmlTime('00:00:01:12.1', { frameRate: 25, subFrameRate: 2 })).toBe(1.5);
    expect(parseTtmlTime('50f', { frameRate: 25 })).toBe(2);
    expect(parseTtmlTime('20t', { tickRate: 10 })).toBe(2);
    expect(parseTtmlTime('1500ms')).toBe(1.5);
    expect(parseTtmlTime('1.5m')).toBe(90);
    expect(parseTtmlTime('1h')).toBe(3600);
  });

  it('rejects malformed and unsupported time values and rates', () => {
    for (const value of ['-1s', '00:99:00', '1.5', 'wallclock(2026-01-01)', '00:00:01:40']) expect(() => parseTtmlTime(value)).toThrow();
    expect(() => parseTtmlTime('1f', { frameRate: 0 })).toThrow('invalid frame');
    expect(() => parseTtmlTime('1t', { tickRate: Infinity })).toThrow('invalid frame');
  });
});
