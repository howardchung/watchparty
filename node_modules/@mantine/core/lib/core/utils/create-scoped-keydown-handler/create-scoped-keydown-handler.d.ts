interface GetElementsSiblingsInput {
    /** Selector used to find parent node, for example '[role="tablist"]', '.mantine-Text-root' */
    parentSelector: string;
    /** Selector used to find element siblings, for example '[data-tab]' */
    siblingSelector: string;
    /** Determines whether next/previous indices should loop */
    loop?: boolean;
    /** Determines which arrow keys will be used */
    orientation: 'vertical' | 'horizontal';
    /** Text direction */
    dir?: 'rtl' | 'ltr';
    /** Determines whether element should be clicked when focused with keyboard event */
    activateOnFocus?: boolean;
    /** External keydown event */
    onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}
export declare function createScopedKeydownHandler({ parentSelector, siblingSelector, onKeyDown, loop, activateOnFocus, dir, orientation, }: GetElementsSiblingsInput): (event: React.KeyboardEvent<HTMLButtonElement>) => void;
export {};
