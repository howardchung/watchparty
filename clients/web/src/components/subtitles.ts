import { logHandledException } from '../data/sessionLog';
import { t } from '../i18n';
/** Local imports are converted to browser WebVTT; styling and ASS drawings are not rendered. */
interface Cue { start: number; end: number; text: string; settings?: string }
interface TtmlRates { frameRate?: number; subFrameRate?: number; tickRate?: number }

const MAX_FILE_BYTES = 5_000_000;
const MAX_CUES = 50_000;
const supportedExtensions = new Set(['vtt', 'srt', 'ssa', 'ass', 'ttml', 'dfxp', 'xml']);

function invalid(message = t("This subtitle file contains invalid or unsupported timing.")): never { throw new Error(message); }

function escapeCueText(text: string): string {
  // WebVTT cue escaping: https://www.w3.org/TR/webvtt1/#webvtt-cue-text
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\0/g, '');
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: '\u00a0', quot: '"', apos: "'" };
  return text.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|nbsp|quot|apos);/gi, (original, entity: string) => {
    if (entity.startsWith('#')) {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : original;
    }
    return named[entity.toLowerCase()] ?? original;
  });
}

export function plainCueText(text: string): string {
  return decodeEntities(text
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/?(?:b|i|u|ruby|rt|font)(?:\s[^>]*)?>/gi, '')
    .replace(/<\/?(?:c(?:\.[^\s>]+)*|v|lang)(?:\s[^>]*)?>/gi, '')
    .replace(/<\d{2,}:\d{2}(?::\d{2})?\.\d{3}>/g, '')).trim();
}

function timestamp(seconds: number): string {
  const ms = Math.round(seconds * 1000);
  const hours = Math.floor(ms / 3_600_000);
  return `${String(hours).padStart(2, '0')}:${String(Math.floor(ms / 60_000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
}

function serialize(cues: Cue[]): string {
  const visible = cues.filter(cue => cue.text.trim());
  if (!visible.length) invalid(t("No readable subtitle cues were found in this file."));
  if (visible.length > MAX_CUES) invalid(t("This subtitle file has too many cues. Choose a smaller file."));
  for (const cue of visible) {
    if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || Math.round(cue.end * 1000) <= Math.round(cue.start * 1000)) invalid();
  }
  visible.sort((a, b) => a.start - b.start);
  return `WEBVTT\n\n${visible.map(cue => `${timestamp(cue.start)} --> ${timestamp(cue.end)}${cue.settings ? ` ${cue.settings}` : ''}\n${escapeCueText(cue.text).replace(/\n{2,}/g, '\n')}`).join('\n\n')}\n`;
}

function clockTime(value: string, vtt: boolean): number {
  const match = (vtt ? /^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})$/ : /^(\d{2,}):(\d{2}):(\d{2})[,\.](\d{3})$/).exec(value);
  if (!match || Number(match[2]) > 59 || Number(match[3]) > 59) invalid();
  return Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(match[4]) / 1000;
}

function parseNumberedCues(text: string, vtt: boolean): Cue[] {
  let body = text;
  if (vtt) {
    const header = /^WEBVTT(?:[ \t][^\n]*)?\n(?:[^\n]+\n)*\n/.exec(text);
    if (!header || header[0].includes('-->')) invalid(t("This file is not valid WebVTT."));
    body = text.slice(header[0].length);
  }
  const cues: Cue[] = [];
  for (const block of body.split(/\n[ \t]*\n/)) {
    if (!block.trim()) continue;
    if (vtt && /^(?:NOTE(?:[ \t\n]|$)|STYLE(?:\n|$)|REGION(?:\n|$))/.test(block)) continue;
    const lines = block.trim().split('\n');
    const timingIndex = lines[0].includes('-->') ? 0 : 1;
    const timing = lines[timingIndex]?.match(/^(\S+)\s+-->\s+(\S+)(?:[ \t]+(.*))?$/);
    if (!timing || lines.length <= timingIndex + 1) invalid('A subtitle cue is missing valid timing or text.');
    cues.push({ start: clockTime(timing[1], vtt), end: clockTime(timing[2], vtt), text: plainCueText(lines.slice(timingIndex + 1).join('\n')), settings: vtt ? timing[3] : undefined });
  }
  return cues;
}

function assText(value: string): string {
  let result = '';
  let drawing = false;
  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (char === '\\' && /[{}Nnh]/.test(value[index + 1] ?? '')) {
      const escaped = value[++index];
      if (!drawing) result += escaped === 'N' || escaped === 'n' ? '\n' : escaped === 'h' ? '\u00a0' : escaped;
    } else if (char === '{') {
      const end = value.indexOf('}', index + 1);
      if (end < 0) invalid('An ASS/SSA subtitle has an unfinished override block.');
      const overrides = value.slice(index + 1, end);
      const modes = Array.from(overrides.matchAll(/\\p(\d+)(?!\d)/g));
      if (modes.length) drawing = Number(modes[modes.length - 1][1]) > 0;
      index = end;
    } else if (!drawing) result += char;
  }
  return result.trim();
}

function assTime(value: string): number {
  const match = /^(\d+):(\d{2}):(\d{2})\.(\d{1,3})$/.exec(value.trim());
  if (!match || Number(match[2]) > 59 || Number(match[3]) > 59) invalid('An ASS/SSA subtitle has invalid timing.');
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) + Number(`0.${match[4]}`);
}

function parseAss(text: string): Cue[] {
  let events = false;
  let fields: string[] = [];
  const cues: Cue[] = [];
  for (const line of text.split('\n')) {
    const section = /^\s*\[([^\]]+)]\s*$/.exec(line);
    if (section) { events = section[1].toLowerCase() === 'events'; continue; }
    if (!events) continue;
    const format = /^\s*Format:\s*(.*)$/i.exec(line);
    if (format) { fields = format[1].split(',').map(field => field.trim().toLowerCase()); continue; }
    const dialogue = /^\s*Dialogue:\s*(.*)$/i.exec(line);
    if (!dialogue) continue;
    if (!fields.length) fields = ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text'];
    const textIndex = fields.indexOf('text');
    if (!fields.includes('start') || !fields.includes('end') || textIndex < 0) invalid('The ASS/SSA Events format must include Start, End, and Text.');
    // Text may contain commas. Consume fixed columns from both ends, even if Text is not last.
    const values = dialogue[1].split(',');
    if (values.length < fields.length) invalid('An ASS/SSA dialogue has missing fields.');
    const columns = [...values.slice(0, textIndex), values.slice(textIndex, values.length - (fields.length - textIndex - 1)).join(','), ...values.slice(values.length - (fields.length - textIndex - 1))];
    if (textIndex === fields.length - 1) columns.length = fields.length;
    cues.push({ start: assTime(columns[fields.indexOf('start')]), end: assTime(columns[fields.indexOf('end')]), text: assText(columns[textIndex]) });
  }
  return cues;
}

/** TTML clock/offset syntax: https://www.w3.org/TR/ttml2/#timing-value-timeExpression */
export function parseTtmlTime(value: string, rates: TtmlRates = {}): number {
  const frameRate = rates.frameRate ?? 30;
  const subFrameRate = rates.subFrameRate ?? 1;
  const tickRate = rates.tickRate ?? 1;
  if (![frameRate, subFrameRate, tickRate].every(rate => Number.isFinite(rate) && rate > 0)) invalid(t("The TTML subtitle has invalid frame or tick rates."));
  const clock = /^(\d{2,}):(\d{2}):(\d{2})(?:\.(\d+)|:(\d+)(?:\.(\d+))?)?$/.exec(value);
  if (clock) {
    if (Number(clock[2]) > 59 || Number(clock[3]) > 59 || (clock[5] !== undefined && Number(clock[5]) >= Math.ceil(frameRate)) || (clock[6] !== undefined && Number(clock[6]) >= subFrameRate)) invalid();
    return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3]) + (clock[4] ? Number(`0.${clock[4]}`) : 0) + (clock[5] ? (Number(clock[5]) + Number(clock[6] || 0) / subFrameRate) / frameRate : 0);
  }
  const offset = /^(\d+(?:\.\d+)?)(h|m|s|ms|f|t)$/.exec(value);
  if (!offset) invalid(t("The TTML subtitle contains an unsupported time expression."));
  const units: Record<string, number> = { h: 3600, m: 60, s: 1, ms: 0.001, f: 1 / frameRate, t: 1 / tickRate };
  return Number(offset[1]) * units[offset[2]];
}

function attribute(element: Element, name: string): string | null {
  return Array.from(element.attributes).find(attr => attr.localName === name)?.value ?? null;
}

function parseTtml(text: string): Cue[] {
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) invalid('TTML files with document types or external entities are not supported.');
  if (typeof DOMParser === 'undefined') invalid('TTML subtitle import is unavailable in this browser.');
  const document = new DOMParser().parseFromString(text, 'application/xml');
  const root = document.documentElement;
  if (root.localName !== 'tt' || document.getElementsByTagNameNS('*', 'parsererror').length) invalid(t("This file is not valid TTML XML."));
  const timeBase = attribute(root, 'timeBase');
  if (timeBase && timeBase !== 'media') invalid(t("This TTML time base is not supported. Choose subtitles with media timing."));
  const rawFrameRate = attribute(root, 'frameRate');
  const frameRate = Number(rawFrameRate ?? 30);
  const multiplier = (attribute(root, 'frameRateMultiplier') ?? '1 1').trim().split(/\s+/).map(Number);
  if (multiplier.length !== 2 || !multiplier.every(value => Number.isFinite(value) && value > 0)) invalid(t("The TTML frame-rate multiplier is invalid."));
  const subFrameRate = Number(attribute(root, 'subFrameRate') ?? 1);
  const rates = { frameRate: frameRate * multiplier[0] / multiplier[1], subFrameRate, tickRate: Number(attribute(root, 'tickRate') ?? (rawFrameRate ? frameRate * multiplier[0] / multiplier[1] * subFrameRate : 1)) };
  parseTtmlTime('0s', rates);
  const elements = Array.from(root.getElementsByTagNameNS('*', '*'));
  if (elements.some(element => attribute(element, 'timeContainer') === 'seq')) invalid(t("Sequential TTML timing is not supported. Choose subtitles with parallel timing."));
  const intervals = new Map<Element, { start: number; end: number }>();
  const interval = (element: Element): { start: number; end: number } => {
    const existing = intervals.get(element);
    if (existing) return existing;
    const parent = element.parentElement ? interval(element.parentElement) : { start: 0, end: Infinity };
    const begin = attribute(element, 'begin');
    const end = attribute(element, 'end');
    const dur = attribute(element, 'dur');
    const start = parent.start + (begin ? parseTtmlTime(begin, rates) : 0);
    const value = { start, end: Math.min(parent.end, end ? parent.start + parseTtmlTime(end, rates) : Infinity, dur ? start + parseTtmlTime(dur, rates) : Infinity) };
    intervals.set(element, value);
    return value;
  };
  const cues: Cue[] = [];
  for (const paragraph of elements.filter(element => element.localName === 'p')) {
    const bounds = interval(paragraph);
    const children = Array.from(paragraph.getElementsByTagNameNS('*', '*'));
    const boundaries = Array.from(new Set([bounds.start, bounds.end, ...children.flatMap(element => { const child = interval(element); return [child.start, child.end]; })])).filter(value => value >= bounds.start && value <= bounds.end).sort((a, b) => a - b);
    const preserveSpace = (element: Element): boolean => {
      const own = element.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'space');
      return own ? own === 'preserve' : element.parentElement ? preserveSpace(element.parentElement) : false;
    };
    const content = (node: Node, moment: number): string => {
      if (node.nodeType === 3 || node.nodeType === 4) return preserveSpace(node.parentElement!) ? node.textContent ?? '' : (node.textContent ?? '').replace(/\s+/g, ' ');
      if (node.nodeType !== 1) return '';
      const element = node as Element;
      const timing = interval(element);
      if (moment < timing.start || moment >= timing.end) return '';
      if (element.localName === 'br') return '\n';
      if (element.localName !== 'span' && element.localName !== 'p') return '';
      return Array.from(node.childNodes).map(child => content(child, moment)).join('');
    };
    for (let index = 0; index < boundaries.length - 1; index++) {
      const start = boundaries[index];
      const end = boundaries[index + 1];
      const value = content(paragraph, start).trim();
      if (value) cues.push({ start, end, text: value });
    }
  }
  return cues;
}

/** Exposed for deterministic parser tests and browser fixtures; no files leave this device. */
export function subtitleTextToVtt(content: string, extension: string): string {
  const type = extension.replace(/^\./, '').toLowerCase();
  if (!supportedExtensions.has(type)) invalid(t("Choose an SRT, VTT, ASS, SSA, TTML, DFXP, or XML subtitle file."));
  const text = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  if (!text) invalid(t("This subtitle file is empty."));
  if (type === 'vtt') return serialize(parseNumberedCues(`${text}\n\n`, true));
  if (type === 'srt') return serialize(parseNumberedCues(text, false));
  if (type === 'ass' || type === 'ssa') return serialize(parseAss(text));
  return serialize(parseTtml(text));
}

export async function subtitleFileToVtt(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) invalid(t("Choose a subtitle file smaller than 5 MB."));
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!supportedExtensions.has(extension)) invalid(t("Choose an SRT, VTT, ASS, SSA, TTML, DFXP, or XML subtitle file."));
  let content: string;
  try { content = await file.text(); } catch (handledError) { logHandledException("subtitles.subtitleFileToVtt.1", handledError);  invalid(t("Unable to read that subtitle file. Choose it again.")); }
  return subtitleTextToVtt(content, extension);
}
