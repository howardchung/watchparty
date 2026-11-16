import { GetStylesApi } from '../../core';
import type { TableFactory } from './Table';
export interface TableContextValue {
    getStyles: GetStylesApi<TableFactory>;
    stickyHeader: boolean | undefined;
    striped: 'odd' | 'even' | undefined;
    highlightOnHover: boolean | undefined;
    withColumnBorders: boolean | undefined;
    withRowBorders: boolean | undefined;
    captionSide: 'top' | 'bottom';
}
export declare const TableProvider: ({ children, value }: {
    value: TableContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useTableContext: () => TableContextValue;
