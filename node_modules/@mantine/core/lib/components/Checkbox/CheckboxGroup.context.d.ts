import { MantineSize } from '../../core';
interface CheckboxGroupContextValue {
    value: string[];
    onChange: (event: React.ChangeEvent<HTMLInputElement> | string) => void;
    size: MantineSize | (string & {}) | undefined;
    disabled?: boolean;
}
export declare const CheckboxGroupProvider: import("react").Provider<CheckboxGroupContextValue | null>;
export declare const useCheckboxGroupContext: () => CheckboxGroupContextValue | null;
export {};
