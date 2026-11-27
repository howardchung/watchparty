import { logHandledException } from './data/sessionLog';
import { useLayoutEffect, useState } from 'react';
import { argbFromHex, hexFromArgb, Hct, SchemeTonalSpot } from '@material/material-color-utilities';

export const themeColors = [
  { id: 'tomato', name: 'Tomato', seed: '#D50000' },
  { id: 'flamingo', name: 'Flamingo', seed: '#E67C73' },
  { id: 'tangerine', name: 'Tangerine', seed: '#F4511E' },
  { id: 'pumpkin', name: 'Pumpkin', seed: '#EF6C00' },
  { id: 'mango', name: 'Mango', seed: '#F09300' },
  { id: 'banana', name: 'Banana', seed: '#F6BF26' },
  { id: 'citron', name: 'Citron', seed: '#E4C441' },
  { id: 'avocado', name: 'Avocado', seed: '#C0CA33' },
  { id: 'pistachio', name: 'Pistachio', seed: '#7CB342' },
  { id: 'basil', name: 'Basil', seed: '#0B8043' },
  { id: 'eucalyptus', name: 'Eucalyptus', seed: '#009688' },
  { id: 'sage', name: 'Sage', seed: '#33B679' },
  { id: 'peacock', name: 'Peacock', seed: '#039BE5' },
  { id: 'cobalt', name: 'Cobalt', seed: '#4285F4' },
  { id: 'blueberry', name: 'Blueberry', seed: '#3F51B5' },
  { id: 'lavender', name: 'Lavender', seed: '#7986CB' },
  { id: 'wisteria', name: 'Wisteria', seed: '#B39DDB' },
  { id: 'amethyst', name: 'Amethyst', seed: '#9E69AF' },
  { id: 'grape', name: 'Grape', seed: '#8E24AA' },
  { id: 'radicchio', name: 'Radicchio', seed: '#AD1457' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', seed: '#D81B60' },
  { id: 'cocoa', name: 'Cocoa', seed: '#795548' },
  { id: 'graphite', name: 'Graphite', seed: '#616161' },
  { id: 'birch', name: 'Birch', seed: '#A79B8E' },
] as const;
export const themeColorKey = 'roomio-theme-color';
export function resolveThemeColor(id: string | null) {
  return themeColors.find(color => color.id === id);
}

// Material 2021 Tonal Spot, standard contrast, shared with the native theme.
export function paletteTokens(seed: string, dark: boolean): Record<string, string> {
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(seed)), dark, 0);
  const roles = [
    'primary', 'onPrimary', 'primaryContainer', 'onPrimaryContainer',
    'secondary', 'onSecondary', 'secondaryContainer', 'onSecondaryContainer',
    'tertiary', 'onTertiary', 'tertiaryContainer', 'onTertiaryContainer',
    'error', 'onError', 'errorContainer', 'onErrorContainer',
    'background', 'onBackground', 'surface', 'onSurface', 'surfaceVariant', 'onSurfaceVariant',
    'surfaceContainerLowest', 'surfaceContainerLow', 'surfaceContainer',
    'surfaceContainerHigh', 'surfaceContainerHighest', 'surfaceDim', 'surfaceBright',
    'outline', 'outlineVariant', 'inverseSurface', 'inverseOnSurface', 'inversePrimary', 'scrim', 'surfaceTint',
  ] as const;
  return Object.fromEntries(roles.map(role => [
    `--md-sys-color-${role.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`,
    hexFromArgb(scheme[role]),
  ]));
}

/** Fresh installations get one durable seed; existing/default choices never reroll. */
export function initialThemeColor(storage: Pick<Storage, 'getItem' | 'setItem'>, random = Math.random): string {
  const stored = storage.getItem(themeColorKey);
  if (stored !== null) return resolveThemeColor(stored)?.id || 'roomio';
  const existing = ['roomio-backend-session-v1', 'roomio-auth-established', 'roomio-auth-format']
    .some(key => storage.getItem(key) !== null);
  const id = existing ? 'roomio' : themeColors[Math.floor(random() * themeColors.length)].id;
  storage.setItem(themeColorKey, id);
  return id;
}

export function useThemePalette(dark: boolean) {
  const [colorId, setColorId] = useState(() => {
    try {
      // Fixed fixtures remain deterministic and do not initialize a real user.
      if (new URLSearchParams(location.search).has('preview')) return resolveThemeColor(localStorage.getItem(themeColorKey))?.id || 'roomio';
      return initialThemeColor(localStorage);
    }
    catch (handledError) { logHandledException("theme.useThemePalette.[colorId, setColorId].1", handledError);  return 'roomio'; }
  });
  const [saveFailed, setSaveFailed] = useState(false);
  useLayoutEffect(() => {
    const color = resolveThemeColor(colorId);
    const tokens = color ? paletteTokens(color.seed, dark) : {};
    const element = document.documentElement;
    for (const [role, value] of Object.entries(tokens)) element.style.setProperty(role, value);
    element.dataset.themeColor = colorId;
    return () => { for (const role of Object.keys(tokens)) element.style.removeProperty(role); };
  }, [colorId, dark]);
  function selectColor(id: string) {
    if (id !== 'roomio' && !resolveThemeColor(id)) return;
    setColorId(id);
    try { localStorage.setItem(themeColorKey, id); setSaveFailed(false); }
    catch (handledError) { logHandledException("theme.useThemePalette.selectColor.2", handledError);  setSaveFailed(true); }
  }
  return { colorId, selectColor, saveFailed };
}
