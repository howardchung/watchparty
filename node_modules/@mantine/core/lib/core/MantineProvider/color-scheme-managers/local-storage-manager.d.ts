import type { MantineColorSchemeManager } from './types';
export interface LocalStorageColorSchemeManagerOptions {
    /** Local storage key used to retrieve value with `localStorage.getItem(key)`, `mantine-color-scheme-value` by default */
    key?: string;
}
export declare function localStorageColorSchemeManager({ key, }?: LocalStorageColorSchemeManagerOptions): MantineColorSchemeManager;
