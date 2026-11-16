interface UseTransformedStylesInput {
    props: Record<string, any>;
    stylesCtx: Record<string, any> | undefined;
    themeName: string[];
}
export declare function useStylesTransform({ props, stylesCtx, themeName }: UseTransformedStylesInput): {
    getTransformedStyles: (styles: any[]) => Record<string, string>[];
    withStylesTransform: boolean;
};
export {};
