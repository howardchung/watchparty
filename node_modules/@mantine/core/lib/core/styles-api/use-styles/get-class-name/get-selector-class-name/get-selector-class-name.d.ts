interface GetSelectorClassNameInput {
    selector: string;
    classes: Record<string, string>;
    unstyled: boolean | undefined;
}
/** Returns class for given selector from library styles (`*.module.css`) */
export declare function getSelectorClassName({ selector, classes, unstyled }: GetSelectorClassNameInput): string | undefined;
export {};
