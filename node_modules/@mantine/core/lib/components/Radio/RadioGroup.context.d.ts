import { MantineSize } from '../../core';
interface RadioGroupContextValue {
    size: MantineSize | undefined;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement> | string) => void;
    name: string;
    disabled?: boolean;
}
export declare const RadioGroupProvider: ({ children, value }: {
    value: RadioGroupContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useRadioGroupContext: () => RadioGroupContextValue | null;
export {};
