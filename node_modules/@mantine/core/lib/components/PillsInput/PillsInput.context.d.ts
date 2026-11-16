import { MantineSize } from '../../core';
import { InputVariant } from '../Input';
export interface PillsInputContextValue {
    fieldRef: React.RefObject<HTMLInputElement | null>;
    size: MantineSize | (string & {});
    disabled: boolean | undefined;
    hasError: boolean | undefined;
    variant: InputVariant | (string & {}) | undefined;
}
export declare const PillsInputProvider: ({ children, value }: {
    value: PillsInputContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, usePillsInputContext: () => PillsInputContextValue | null;
