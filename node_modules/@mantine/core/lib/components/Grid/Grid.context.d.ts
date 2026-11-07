import { GetStylesApi, MantineSize } from '../../core';
import type { GridFactory } from './Grid';
export type GridBreakpoints = Record<MantineSize, string>;
interface GridContextValue {
    getStyles: GetStylesApi<GridFactory>;
    grow: boolean | undefined;
    columns: number;
    breakpoints: GridBreakpoints | undefined;
    type: 'container' | 'media' | undefined;
}
export declare const GridProvider: ({ children, value }: {
    value: GridContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useGridContext: () => GridContextValue;
export {};
