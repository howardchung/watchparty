import React from 'react';
import { CSSProperties } from '../../core';
export declare function getElementHeight(el: React.RefObject<HTMLElement | null> | {
    current?: {
        scrollHeight: number;
    };
}): number | "auto";
interface UseCollapse {
    opened: boolean;
    transitionDuration?: number;
    transitionTimingFunction?: string;
    onTransitionEnd?: () => void;
    keepMounted?: boolean;
}
interface GetCollapseProps {
    [key: string]: unknown;
    style?: CSSProperties;
    onTransitionEnd?: (e: TransitionEvent) => void;
    refKey?: string;
    ref?: React.ForwardedRef<HTMLDivElement>;
}
export declare function useCollapse({ transitionDuration, transitionTimingFunction, onTransitionEnd, opened, keepMounted, }: UseCollapse): (props: GetCollapseProps) => Record<string, any>;
export {};
