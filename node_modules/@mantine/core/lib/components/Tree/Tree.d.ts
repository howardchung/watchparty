import { BoxProps, ElementProps, Factory, MantineSpacing, StylesApiProps } from '../../core';
import { TreeController } from './use-tree';
export interface TreeNodeData {
    label: React.ReactNode;
    value: string;
    nodeProps?: Record<string, any>;
    children?: TreeNodeData[];
}
export interface RenderTreeNodePayload {
    /** Node level in the tree */
    level: number;
    /** `true` if the node is expanded, applicable only for nodes with `children` */
    expanded: boolean;
    /** `true` if the node has non-empty `children` array */
    hasChildren: boolean;
    /** `true` if the node is selected */
    selected: boolean;
    /** Node data from the `data` prop of `Tree` */
    node: TreeNodeData;
    /** Tree controller instance, return value of `useTree` hook */
    tree: TreeController;
    /** Props to spread into the root node element */
    elementProps: {
        className: string;
        style: React.CSSProperties;
        onClick: (event: React.MouseEvent) => void;
        'data-selected': boolean | undefined;
        'data-value': string;
        'data-hovered': boolean | undefined;
    };
}
export type RenderNode = (payload: RenderTreeNodePayload) => React.ReactNode;
export type TreeStylesNames = 'root' | 'node' | 'subtree' | 'label';
export type TreeCssVariables = {
    root: '--level-offset';
};
export interface TreeProps extends BoxProps, StylesApiProps<TreeFactory>, ElementProps<'ul'> {
    /** Data used to render nodes */
    data: TreeNodeData[];
    /** Horizontal padding of each subtree level, key of `theme.spacing` or any valid CSS value @default `'lg'` */
    levelOffset?: MantineSpacing;
    /** If set, tree node with children is expanded on click @default `true` */
    expandOnClick?: boolean;
    /** If set, tree node with children is expanded on space key press @default `true` */
    expandOnSpace?: boolean;
    /** If set, tree node is checked on space key press @default `false` */
    checkOnSpace?: boolean;
    /** If set, tree node is selected on click @default `false` */
    selectOnClick?: boolean;
    /** Use-tree hook instance that can be used to manipulate component state */
    tree?: TreeController;
    /** A function to render tree node label */
    renderNode?: RenderNode;
    /** If set, selection is cleared when user clicks outside of the tree @default `false` */
    clearSelectionOnOutsideClick?: boolean;
    /** If set, tree nodes range can be selected with click when `Shift` key is pressed @default `true` */
    allowRangeSelection?: boolean;
}
export type TreeFactory = Factory<{
    props: TreeProps;
    ref: HTMLUListElement;
    stylesNames: TreeStylesNames;
    vars: TreeCssVariables;
}>;
export declare const Tree: import("../..").MantineComponent<{
    props: TreeProps;
    ref: HTMLUListElement;
    stylesNames: TreeStylesNames;
    vars: TreeCssVariables;
}>;
