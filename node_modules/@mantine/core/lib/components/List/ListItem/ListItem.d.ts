import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type ListItemStylesNames = 'item' | 'itemWrapper' | 'itemIcon' | 'itemLabel';
export interface ListItemProps extends BoxProps, CompoundStylesApiProps<ListItemFactory>, ElementProps<'li'> {
    /** Icon to replace item bullet */
    icon?: React.ReactNode;
    /** Item content */
    children?: React.ReactNode;
}
export type ListItemFactory = Factory<{
    props: ListItemProps;
    ref: HTMLLIElement;
    stylesNames: ListItemStylesNames;
    compound: true;
}>;
export declare const ListItem: import("../../..").MantineComponent<{
    props: ListItemProps;
    ref: HTMLLIElement;
    stylesNames: ListItemStylesNames;
    compound: true;
}>;
