import { GetStylesApi } from '../../core';
import type { ProgressRootFactory } from './ProgressRoot/ProgressRoot';
interface ProgressContextValue {
    getStyles: GetStylesApi<ProgressRootFactory>;
    autoContrast: boolean | undefined;
}
export declare const ProgressProvider: ({ children, value }: {
    value: ProgressContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useProgressContext: () => ProgressContextValue;
export {};
