import { type RefObject } from 'react';
interface UseFloatingIndicatorInput {
    target: HTMLElement | null | undefined;
    parent: HTMLElement | null | undefined;
    ref: RefObject<HTMLDivElement>;
    displayAfterTransitionEnd?: boolean;
}
export declare function useFloatingIndicator({ target, parent, ref, displayAfterTransitionEnd, }: UseFloatingIndicatorInput): {
    initialized: boolean;
    hidden: boolean;
};
export {};
