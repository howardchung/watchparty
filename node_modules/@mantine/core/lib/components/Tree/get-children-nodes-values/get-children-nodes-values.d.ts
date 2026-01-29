import type { TreeNodeData } from '../Tree';
export declare function findTreeNode(value: string, data: TreeNodeData[]): TreeNodeData | null;
export declare function getChildrenNodesValues(value: string, data: TreeNodeData[], acc?: string[]): string[];
export declare function getAllChildrenNodes(data: TreeNodeData[]): string[];
