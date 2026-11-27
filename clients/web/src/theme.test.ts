import { describe, expect, it } from 'vitest';
import { argbFromHex, blueFromArgb, greenFromArgb, redFromArgb } from '@material/material-color-utilities';
import { paletteTokens, resolveThemeColor, themeColors } from './theme';

function luminance(hex: string) {
  const argb = argbFromHex(hex);
  const rgb = [redFromArgb(argb), greenFromArgb(argb), blueFromArgb(argb)].map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
describe('named Material palettes', () => {
  it('provides 24 unique named seeds and rejects invalid stored choices', () => {
    expect(themeColors).toHaveLength(24);
    expect(new Set(themeColors.map(color => color.id)).size).toBe(24);
    expect(resolveThemeColor('sage')?.seed).toBe('#33B679');
    expect(resolveThemeColor('unknown')).toBeUndefined();
    expect(resolveThemeColor(null)).toBeUndefined();
  });
  it('generates complete, distinct light and dark palettes with readable role pairs for every seed', () => {
    for (const dark of [false, true]) {
      const palettes = themeColors.map(color => paletteTokens(color.seed, dark));
      expect(new Set(palettes.map(palette => JSON.stringify(palette))).size).toBe(24);
      for (const palette of palettes) {
        expect(Object.keys(palette)).toHaveLength(36);
        for (const role of ['primary', 'secondary', 'tertiary', 'error', 'primary-container', 'secondary-container', 'tertiary-container', 'error-container', 'surface']) {
          const bg = luminance(palette[`--md-sys-color-${role}`]);
          const fg = luminance(palette[`--md-sys-color-on-${role}`]);
          expect((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05)).toBeGreaterThanOrEqual(4.45);
        }
      }
    }
  });
});

describe('first-time theme preferences', () => {
  const storage = (entries: [string, string][] = []) => {
    const values = new Map(entries);
    return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  };
  it('initializes a random named color once and preserves the subsequent saved decision', async () => {
    const { initialThemeColor, themeColorKey } = await import('./theme');
    const fresh = storage();
    expect(initialThemeColor(fresh, () => 0)).toBe('tomato');
    expect(initialThemeColor(fresh, () => .999)).toBe('tomato');
    fresh.setItem(themeColorKey, 'sage');
    expect(initialThemeColor(fresh, () => .999)).toBe('sage');
    fresh.setItem(themeColorKey, 'roomio');
    expect(initialThemeColor(fresh, () => .999)).toBe('roomio');
  });
  it('keeps the implicit brand color for existing identities and supports every new seed', async () => {
    const { initialThemeColor } = await import('./theme');
    expect(initialThemeColor(storage([['roomio-backend-session-v1', '1']]), () => .999)).toBe('roomio');
    const choices = themeColors.map((_, i) => initialThemeColor(storage(), () => i / themeColors.length));
    expect(new Set(choices).size).toBe(24);
  });
});
