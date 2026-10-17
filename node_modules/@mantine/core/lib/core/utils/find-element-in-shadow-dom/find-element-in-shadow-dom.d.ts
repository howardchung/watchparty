export declare function findElementBySelector<T extends HTMLElement>(selector: string, root?: Document | Element | ShadowRoot): T | null;
export declare function findElementsBySelector<T extends HTMLElement>(selector: string, root?: Document | Element | ShadowRoot): T[];
/**
 * Gets the appropriate root element (Document or ShadowRoot) for DOM queries
 * based on the provided target element reference.
 */
export declare function getRootElement(targetElement: HTMLElement | null | undefined): Document | ShadowRoot;
