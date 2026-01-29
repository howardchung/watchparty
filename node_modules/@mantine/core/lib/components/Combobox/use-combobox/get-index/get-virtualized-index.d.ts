interface GetIndexProps {
    currentIndex: number;
    isOptionDisabled: (index: number) => boolean;
    totalOptionsCount: number;
    loop: boolean;
}
export declare function getPreviousIndex({ currentIndex, isOptionDisabled, totalOptionsCount, loop, }: GetIndexProps): number;
export declare function getNextIndex({ currentIndex, isOptionDisabled, totalOptionsCount, loop, }: GetIndexProps): number;
interface GetFirstIndexOptions {
    totalOptionsCount: number;
    isOptionDisabled: (index: number) => boolean;
}
export declare function getFirstIndex({ totalOptionsCount, isOptionDisabled }: GetFirstIndexOptions): number;
export {};
