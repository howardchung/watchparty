import { BoxProps, ElementProps, Factory, MantineColor, MantineRadius, MantineSize, StylesApiProps } from '../../../core';
export type PaginationRootStylesNames = 'root' | 'control' | 'dots';
export type PaginationRootCssVariables = {
    root: '--pagination-control-size' | '--pagination-control-radius' | '--pagination-control-fz' | '--pagination-active-bg' | '--pagination-active-color';
};
export interface PaginationRootProps extends BoxProps, StylesApiProps<PaginationRootFactory>, ElementProps<'div', 'value' | 'onChange'> {
    /** `height` and `min-width` of controls @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Total number of pages, must be an integer */
    total: number;
    /** Active page for controlled component, must be an integer in [0, total] interval */
    value?: number;
    /** Active page for uncontrolled component, must be an integer in [0, total] interval */
    defaultValue?: number;
    /** Called when page changes */
    onChange?: (value: number) => void;
    /** Disables all controls, applies disabled styles */
    disabled?: boolean;
    /** Number of siblings displayed on the left/right side of the selected page @default `1` */
    siblings?: number;
    /** Number of elements visible on the left/right edges @default `1` */
    boundaries?: number;
    /** Key of `theme.colors`, active item color @default `theme.primaryColor` */
    color?: MantineColor;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** Called when next page control is clicked */
    onNextPage?: () => void;
    /** Called when previous page control is clicked */
    onPreviousPage?: () => void;
    /** Called when first page control is clicked */
    onFirstPage?: () => void;
    /** Called when last page control is clicked */
    onLastPage?: () => void;
    /** Additional props passed down to controls */
    getItemProps?: (page: number) => Record<string, any>;
    /** If set, adjusts text color based on background color for `filled` variant */
    autoContrast?: boolean;
}
export type PaginationRootFactory = Factory<{
    props: PaginationRootProps;
    ref: HTMLDivElement;
    stylesNames: PaginationRootStylesNames;
    vars: PaginationRootCssVariables;
}>;
export declare const PaginationRoot: import("../../..").MantineComponent<{
    props: PaginationRootProps;
    ref: HTMLDivElement;
    stylesNames: PaginationRootStylesNames;
    vars: PaginationRootCssVariables;
}>;
