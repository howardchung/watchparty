interface GetRootClassNameInput {
    rootSelector: string;
    selector: string;
    className: string | undefined;
}
/** Adds `className` to the list if given selector is root */
export declare function getRootClassName({ rootSelector, selector, className }: GetRootClassNameInput): string | undefined;
export {};
