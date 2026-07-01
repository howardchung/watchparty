export type KeyboardModifiers = {
    alt: boolean;
    ctrl: boolean;
    meta: boolean;
    mod: boolean;
    shift: boolean;
    plus: boolean;
};
export type Hotkey = KeyboardModifiers & {
    key?: string;
};
type CheckHotkeyMatch = (event: KeyboardEvent) => boolean;
export declare function parseHotkey(hotkey: string): Hotkey;
export declare function getHotkeyMatcher(hotkey: string, usePhysicalKeys?: boolean): CheckHotkeyMatch;
export interface HotkeyItemOptions {
    preventDefault?: boolean;
    usePhysicalKeys?: boolean;
}
type HotkeyItem = [string, (event: any) => void, HotkeyItemOptions?];
export declare function getHotkeyHandler(hotkeys: HotkeyItem[]): (event: React.KeyboardEvent<HTMLElement> | KeyboardEvent) => void;
export {};
