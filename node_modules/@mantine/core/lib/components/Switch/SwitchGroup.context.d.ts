import { MantineSize } from '../../core';
interface SwitchGroupContextValue {
    value: string[];
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    size: MantineSize | (string & {}) | undefined;
    disabled?: boolean;
}
export declare const SwitchGroupProvider: import("react").Provider<SwitchGroupContextValue | null>;
export declare const useSwitchGroupContext: () => SwitchGroupContextValue | null;
export {};
