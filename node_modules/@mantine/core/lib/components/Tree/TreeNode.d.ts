import { GetStylesApi } from '../../core';
import type { RenderNode, TreeFactory, TreeNodeData } from './Tree';
import type { TreeController } from './use-tree';
interface TreeNodeProps {
    node: TreeNodeData;
    getStyles: GetStylesApi<TreeFactory>;
    rootIndex: number | undefined;
    controller: TreeController;
    expandOnClick: boolean | undefined;
    flatValues: string[];
    isSubtree?: boolean;
    level?: number;
    renderNode: RenderNode | undefined;
    selectOnClick: boolean | undefined;
    allowRangeSelection: boolean | undefined;
    expandOnSpace: boolean | undefined;
    checkOnSpace: boolean | undefined;
}
export declare function TreeNode({ node, getStyles, rootIndex, controller, expandOnClick, selectOnClick, isSubtree, level, renderNode, flatValues, allowRangeSelection, expandOnSpace, checkOnSpace, }: TreeNodeProps): import("react/jsx-runtime").JSX.Element;
export declare namespace TreeNode {
    var displayName: string;
}
export {};
