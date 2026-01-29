import { CheckedNodeStatus } from './get-all-checked-nodes/get-all-checked-nodes';
import type { TreeNodeData } from './Tree';
export type TreeExpandedState = Record<string, boolean>;
export declare function getTreeExpandedState(data: TreeNodeData[], expandedNodesValues: string[] | '*'): {};
export interface UseTreeInput {
    /** Initial expanded state of all nodes */
    initialExpandedState?: TreeExpandedState;
    /** Initial selected state of nodes */
    initialSelectedState?: string[];
    /** Initial checked state of nodes */
    initialCheckedState?: string[];
    /** Determines whether multiple node can be selected at a time */
    multiple?: boolean;
    /** Called with the node value when it is expanded */
    onNodeExpand?: (value: string) => void;
    /** Called with the node value when it is collapsed */
    onNodeCollapse?: (value: string) => void;
}
export interface UseTreeReturnType {
    /** Determines whether multiple node can be selected at a time */
    multiple: boolean;
    /** A record of `node.value` and boolean values that represent nodes expanded state */
    expandedState: TreeExpandedState;
    /** An array of selected nodes values */
    selectedState: string[];
    /** An array of checked nodes values */
    checkedState: string[];
    /** A value of the node that was last clicked
     * Anchor node is used to determine range of selected nodes for multiple selection
     */
    anchorNode: string | null;
    /** Initializes tree state based on provided data, called automatically by the Tree component */
    initialize: (data: TreeNodeData[]) => void;
    /** Toggles expanded state of the node with provided value */
    toggleExpanded: (value: string) => void;
    /** Collapses node with provided value */
    collapse: (value: string) => void;
    /** Expands node with provided value */
    expand: (value: string) => void;
    /** Expands all nodes */
    expandAllNodes: () => void;
    /** Collapses all nodes */
    collapseAllNodes: () => void;
    /** Sets expanded state */
    setExpandedState: React.Dispatch<React.SetStateAction<TreeExpandedState>>;
    /** Toggles selected state of the node with provided value */
    toggleSelected: (value: string) => void;
    /** Selects node with provided value */
    select: (value: string) => void;
    /** Deselects node with provided value */
    deselect: (value: string) => void;
    /** Clears selected state */
    clearSelected: () => void;
    /** Sets selected state */
    setSelectedState: React.Dispatch<React.SetStateAction<string[]>>;
    /** A value of the node that is currently hovered */
    hoveredNode: string | null;
    /** Sets hovered node */
    setHoveredNode: React.Dispatch<React.SetStateAction<string | null>>;
    /** Checks node with provided value */
    checkNode: (value: string) => void;
    /** Unchecks node with provided value */
    uncheckNode: (value: string) => void;
    /** Checks all nodes */
    checkAllNodes: () => void;
    /** Unchecks all nodes */
    uncheckAllNodes: () => void;
    /** Sets checked state */
    setCheckedState: React.Dispatch<React.SetStateAction<string[]>>;
    /** Returns all checked nodes with status */
    getCheckedNodes: () => CheckedNodeStatus[];
    /** Returns `true` if node with provided value is checked */
    isNodeChecked: (value: string) => boolean;
    /** Returns `true` if node with provided value is indeterminate */
    isNodeIndeterminate: (value: string) => boolean;
}
export declare function useTree({ initialSelectedState, initialCheckedState, initialExpandedState, multiple, onNodeCollapse, onNodeExpand, }?: UseTreeInput): UseTreeReturnType;
export type TreeController = ReturnType<typeof useTree>;
