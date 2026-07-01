import { GetStylesApi } from '../../core';
import type { PaginationRootFactory } from './PaginationRoot/PaginationRoot';
interface PaginationContext {
    total: number;
    range: (number | 'dots')[];
    active: number;
    disabled: boolean | undefined;
    getItemProps?: (page: number) => Record<string, any>;
    onChange: (page: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    onFirst: () => void;
    onLast: () => void;
    getStyles: GetStylesApi<PaginationRootFactory>;
}
export declare const PaginationProvider: ({ children, value }: {
    value: PaginationContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, usePaginationContext: () => PaginationContext;
export {};
