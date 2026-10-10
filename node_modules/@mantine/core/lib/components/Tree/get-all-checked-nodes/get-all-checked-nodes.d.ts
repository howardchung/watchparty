import type { TreeNodeData } from '../Tree';
export interface CheckedNodeStatus {
    checked: boolean;
    indeterminate: boolean;
    hasChildren: boolean;
    value: string;
}
export declare function getAllCheckedNodes(data: TreeNodeData[], checkedState: string[], acc?: CheckedNodeStatus[]): {
    result: CheckedNodeStatus[];
    currentTreeChecked: CheckedNodeStatus[];
};
