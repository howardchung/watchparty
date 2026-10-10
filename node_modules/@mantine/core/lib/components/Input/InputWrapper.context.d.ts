import { GetStylesApi } from '../../core';
import type { InputWrapperFactory } from './InputWrapper/InputWrapper';
interface InputWrapperContextValue {
    offsetTop: boolean;
    offsetBottom: boolean;
    describedBy: string | undefined;
    inputId: string | undefined;
    labelId: string | undefined;
    getStyles: GetStylesApi<InputWrapperFactory> | null;
}
export declare const InputWrapperProvider: ({ children, value }: {
    value: InputWrapperContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useInputWrapperContext: () => InputWrapperContextValue | null;
export {};
