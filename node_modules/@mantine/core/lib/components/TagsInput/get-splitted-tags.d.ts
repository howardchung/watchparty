interface GetSplittedTagsInput {
    splitChars: string[] | undefined;
    allowDuplicates: boolean | undefined;
    maxTags: number | undefined;
    value: string;
    currentTags: string[];
}
export declare function getSplittedTags({ splitChars, allowDuplicates, maxTags, value, currentTags, }: GetSplittedTagsInput): string[];
export {};
