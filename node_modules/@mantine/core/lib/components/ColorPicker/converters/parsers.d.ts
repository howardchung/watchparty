import { HsvaColor } from '../ColorPicker.types';
export declare function round(number: number, digits?: number, base?: number): number;
export declare function parseHue(value: string, unit?: string): number;
export declare function parseHsla(color: string): HsvaColor;
export declare function parseHex(color: string): HsvaColor;
export declare function parseHexa(color: string): HsvaColor;
export declare function parseRgba(color: string): HsvaColor;
export declare function isColorValid(color: string): boolean;
export declare function parseColor(color: string): HsvaColor;
