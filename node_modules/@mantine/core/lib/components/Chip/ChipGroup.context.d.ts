interface ChipGroupContextValue {
    isChipSelected: (value: string) => boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    multiple: boolean | undefined;
}
export declare const ChipGroupProvider: ({ children, value }: {
    value: ChipGroupContextValue;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useChipGroupContext: () => ChipGroupContextValue | null;
export {};
