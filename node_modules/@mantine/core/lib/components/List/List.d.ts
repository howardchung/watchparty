import { BoxProps, ElementProps, Factory, MantineSize, MantineSpacing, StylesApiProps } from '../../core';
import { ListItem, ListItemStylesNames } from './ListItem/ListItem';
export type ListStylesNames = 'root' | ListItemStylesNames;
export type ListCssVariables = {
    root: '--list-fz' | '--list-lh' | '--list-spacing';
};
export interface ListProps extends BoxProps, StylesApiProps<ListFactory>, ElementProps<'ol', 'type'> {
    /** `List.Item` components */
    children?: React.ReactNode;
    /** List type @default `'unordered'` */
    type?: 'ordered' | 'unordered';
    /** Determines whether list items should be offset with padding @default `false` */
    withPadding?: boolean;
    /** Controls `font-size` and `line-height` @default `'md'` */
    size?: MantineSize;
    /** Icon to replace list item dot */
    icon?: React.ReactNode;
    /** Key of `theme.spacing` or any valid CSS value to set spacing between items @default `0` */
    spacing?: MantineSpacing;
    /** Determines whether items must be centered with their icon @default `false` */
    center?: boolean;
    /** Controls `list-style-type`, by default inferred from `type` */
    listStyleType?: React.CSSProperties['listStyleType'];
}
export type ListFactory = Factory<{
    props: ListProps;
    ref: HTMLUListElement;
    stylesNames: ListStylesNames;
    vars: ListCssVariables;
    staticComponents: {
        Item: typeof ListItem;
    };
}>;
export declare const List: import("../..").MantineComponent<{
    props: ListProps;
    ref: HTMLUListElement;
    stylesNames: ListStylesNames;
    vars: ListCssVariables;
    staticComponents: {
        Item: typeof ListItem;
    };
}>;
